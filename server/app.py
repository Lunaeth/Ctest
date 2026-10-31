"""Same-origin API. Run behind the Cloudflare-restricted Nginx virtual host."""
import hashlib
from contextlib import closing
import hmac
import ipaddress
import json
import os
from pathlib import Path
import re
import secrets
import sqlite3
import time
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, InvalidHashError
from flask import Flask, g, jsonify, request
from werkzeug.exceptions import HTTPException

KEYS = tuple("question-app." + key for key in (
    "progress", "mistakes", "favorites", "exam-history", "preferences",
    "current-practice", "current-exam", "pending-core2-module-practice",
))
COOKIE = "__Host-ctest-session"
SESSION_SECONDS = 14 * 24 * 60 * 60
SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL DEFAULT 0, entries TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL,
    write_id TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS rate_limits (
    bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
"""


class ApiError(Exception):
    def __init__(self, status, code, message):
        self.status, self.code, self.message = status, code, message


def verify_turnstile(secret, token, remote_ip):
    payload = urlencode({"secret": secret, "response": token, "remoteip": remote_ip}).encode()
    req = Request("https://challenges.cloudflare.com/turnstile/v0/siteverify", data=payload,
                  headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urlopen(req, timeout=8) as response:
        return json.loads(response.read(32_768))


def create_app(config=None, *, turnstile_verifier=None):
    app = Flask(__name__)
    app.config.update(
        DATABASE=os.environ.get("CTEST_DATABASE", "/var/lib/ctest/accounts.sqlite3"),
        APP_ORIGIN=os.environ.get("CTEST_ORIGIN", "https://learn.lunaeth.com"),
        SESSION_SECRET=os.environ.get("CTEST_SESSION_SECRET", ""),
        TURNSTILE_SITE_KEY=os.environ.get("TURNSTILE_SITE_KEY", ""),
        TURNSTILE_SECRET_KEY=os.environ.get("TURNSTILE_SECRET_KEY", ""),
        MAX_CONTENT_LENGTH=2_000_000,
        COOKIE_SECURE=True,
    )
    if config:
        app.config.update(config)
    if len(app.config["SESSION_SECRET"]) < 32:
        raise RuntimeError("CTEST_SESSION_SECRET must contain at least 32 random characters")
    origin = app.config["APP_ORIGIN"]
    hostname = urlsplit(origin).hostname
    app.config["TRUSTED_HOSTS"] = [hostname, "127.0.0.1", "localhost"]
    verifier = turnstile_verifier or verify_turnstile
    hasher = PasswordHasher()
    dummy_hash = hasher.hash(secrets.token_urlsafe(32))
    db_path = Path(app.config["DATABASE"])
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(db_path)) as connection, connection:
        connection.execute("PRAGMA journal_mode=WAL")
        connection.executescript(SCHEMA)
        if "write_id" not in {row[1] for row in connection.execute("PRAGMA table_info(progress)")}:
            connection.execute("ALTER TABLE progress ADD COLUMN write_id TEXT NOT NULL DEFAULT ''")

    def db():
        if "db" not in g:
            g.db = sqlite3.connect(db_path, timeout=10)
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys=ON")
        return g.db

    @app.teardown_appcontext
    def close_db(_error):
        connection = g.pop("db", None)
        if connection is not None:
            connection.close()

    def digest(value):
        return hashlib.sha256(value.encode()).hexdigest()

    def csrf(token):
        return hmac.new(app.config["SESSION_SECRET"].encode(), token.encode(), hashlib.sha256).hexdigest()

    def client_ip():
        # Nginx overwrites this header after its Cloudflare source-address ACL.
        value = request.headers.get("X-Client-IP", "") if request.remote_addr in ("127.0.0.1", "::1", "", None) else ""
        try:
            return str(ipaddress.ip_address(value or request.remote_addr))
        except ValueError:
            return request.remote_addr or "unknown"

    def limit(label, subject, maximum, seconds):
        now = int(time.time())
        bucket = f"{label}:{digest(subject)}:{now // seconds}"
        connection = db()
        with connection:
            connection.execute("DELETE FROM rate_limits WHERE expires_at < ?", (now,))
            row = connection.execute(
                "INSERT INTO rate_limits VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count",
                (bucket, now + seconds),
            ).fetchone()
        if row[0] > maximum:
            raise ApiError(429, "rate_limited", "操作过于频繁，请稍后再试。")

    def body():
        if not request.is_json:
            raise ApiError(415, "json_required", "请求必须为 JSON。")
        value = request.get_json()
        if not isinstance(value, dict):
            raise ApiError(400, "invalid_body", "请求格式不正确。")
        return value

    def credentials(value):
        name, password = value.get("username"), value.get("password")
        if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9_]{3,32}", name):
            raise ApiError(400, "invalid_username", "用户名需为 3–32 位字母、数字或下划线。")
        if not isinstance(password, str) or not 12 <= len(password) <= 128:
            raise ApiError(400, "invalid_password", "密码长度需为 12–128 个字符。")
        return name.lower(), password

    def session(required=True):
        token = request.cookies.get(COOKIE, "")
        if not re.fullmatch(r"[A-Za-z0-9_-]{43}", token):
            row = None
        else:
            row = db().execute(
                "SELECT users.id, users.username FROM sessions JOIN users ON users.id=sessions.user_id "
                "WHERE token_hash=? AND expires_at>?", (digest(token), int(time.time())),
            ).fetchone()
        if row is None:
            if required:
                raise ApiError(401, "unauthenticated", "登录已失效，请重新登录。")
            return None, token
        return row, token

    @app.before_request
    def protect_requests():
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            if request.headers.get("Origin") != origin:
                raise ApiError(403, "origin_denied", "请求来源不受信任。")
            if request.path not in ("/api/auth/register", "/api/auth/login"):
                _user, token = session()
                if not hmac.compare_digest(request.headers.get("X-CSRF-Token", "").encode(), csrf(token).encode()):
                    raise ApiError(403, "csrf_denied", "会话验证失败，请刷新页面。")

    @app.after_request
    def headers(response):
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        if response.status_code == 429:
            response.headers["Retry-After"] = "900"
        return response

    @app.errorhandler(ApiError)
    def api_error(error):
        return jsonify(error=error.code, message=error.message), error.status

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error="invalid_request", message="请求无效或超过大小限制。"), error.code

    @app.errorhandler(RecursionError)
    def nested_payload(_error):
        return jsonify(error="invalid_request", message="请求嵌套过深。"), 400

    @app.errorhandler(sqlite3.OperationalError)
    def unavailable(_error):
        app.logger.error("Account database operation failed")
        return jsonify(error="unavailable", message="记录服务暂时不可用，请稍后重试。"), 503

    @app.get("/api/health")
    def health():
        db().execute("SELECT 1 FROM users LIMIT 1")
        return jsonify(status="ok")

    @app.get("/api/config")
    def configuration():
        enabled = bool(app.config["TURNSTILE_SITE_KEY"] and app.config["TURNSTILE_SECRET_KEY"])
        return jsonify(registrationEnabled=enabled, turnstileSiteKey=app.config["TURNSTILE_SITE_KEY"] if enabled else "")

    @app.get("/api/auth/session")
    def get_session():
        user, token = session(False)
        return jsonify(user={"id": user["id"], "username": user["username"]} if user else None,
                       csrfToken=csrf(token) if user else None)

    def sign_in(user_id, username, status=200):
        token = secrets.token_urlsafe(32)
        now = int(time.time())
        with db():
            db().execute("DELETE FROM sessions WHERE expires_at<=? OR token_hash=?",
                         (now, digest(request.cookies.get(COOKIE, ""))))
            db().execute("INSERT INTO sessions VALUES (?,?,?)", (digest(token), user_id, now + SESSION_SECONDS))
        response = jsonify(user={"id": user_id, "username": username}, csrfToken=csrf(token))
        response.status_code = status
        response.set_cookie(COOKIE, token, max_age=SESSION_SECONDS, secure=app.config["COOKIE_SECURE"],
                            httponly=True, samesite="Strict", path="/")
        return response

    @app.post("/api/auth/register")
    def register():
        limit("registration", client_ip(), 10, 3600)
        if not app.config["TURNSTILE_SITE_KEY"] or not app.config["TURNSTILE_SECRET_KEY"]:
            raise ApiError(503, "registration_unavailable", "注册暂未开放，请稍后再试。")
        value = body()
        name, password = credentials(value)
        token = value.get("turnstileToken")
        if not isinstance(token, str) or not 1 <= len(token) <= 2048:
            raise ApiError(400, "captcha_required", "请先完成人机验证。")
        try:
            result = verifier(app.config["TURNSTILE_SECRET_KEY"], token, client_ip())
        except Exception:
            raise ApiError(503, "captcha_unavailable", "人机验证服务暂时不可用，请重试。") from None
        if not isinstance(result, dict) or result.get("success") is not True or result.get("hostname") != hostname or result.get("action") != "register":
            raise ApiError(400, "captcha_failed", "人机验证未通过或已过期，请重新验证。")
        hashed = hasher.hash(password)
        try:
            with db():
                cursor = db().execute("INSERT INTO users(username,password_hash,created_at) VALUES (?,?,?)", (name, hashed, int(time.time())))
                user_id = cursor.lastrowid
                db().execute("INSERT INTO progress(user_id,updated_at) VALUES (?,?)", (user_id, int(time.time())))
        except sqlite3.IntegrityError:
            raise ApiError(409, "username_unavailable", "该用户名不可用，请换一个。") from None
        return sign_in(user_id, name, 201)

    @app.post("/api/auth/login")
    def login():
        limit("login-ip", client_ip(), 30, 900)
        name, password = credentials(body())
        limit("login-name", name, 20, 900)
        user = db().execute("SELECT * FROM users WHERE username=?", (name,)).fetchone()
        try:
            hasher.verify(user["password_hash"] if user else dummy_hash, password)
        except (VerificationError, InvalidHashError):
            raise ApiError(401, "invalid_credentials", "用户名或密码不正确。") from None
        if not user:
            raise ApiError(401, "invalid_credentials", "用户名或密码不正确。")
        if hasher.check_needs_rehash(user["password_hash"]):
            with db():
                db().execute("UPDATE users SET password_hash=? WHERE id=?", (hasher.hash(password), user["id"]))
        return sign_in(user["id"], user["username"])

    @app.post("/api/auth/logout")
    def logout():
        _user, token = session()
        with db():
            db().execute("DELETE FROM sessions WHERE token_hash=?", (digest(token),))
        response = jsonify(ok=True)
        response.delete_cookie(COOKIE, path="/", secure=app.config["COOKIE_SECURE"], httponly=True, samesite="Strict")
        return response

    @app.get("/api/progress")
    def get_progress():
        user, _token = session()
        row = db().execute("SELECT * FROM progress WHERE user_id=?", (user["id"],)).fetchone()
        return jsonify(revision=row["revision"], entries=json.loads(row["entries"]), updatedAt=row["updated_at"])

    @app.put("/api/progress")
    def put_progress():
        user, _token = session()
        limit("progress", str(user["id"]), 240, 60)
        value = body()
        revision, entries = value.get("revision"), value.get("entries")
        write_id = value.get("writeId")
        if not isinstance(write_id, str) or not re.fullmatch(r"[a-f0-9-]{36}", write_id):
            raise ApiError(400, "invalid_write_id", "同步请求编号无效。")
        if type(revision) is not int or revision < 0 or not isinstance(entries, dict) or set(entries) - set(KEYS):
            raise ApiError(400, "invalid_progress", "学习记录格式不正确。")
        for raw in entries.values():
            if raw is None:
                continue
            if not isinstance(raw, str):
                raise ApiError(400, "invalid_progress", "学习记录字段格式不正确。")
            try:
                parsed = json.loads(raw, parse_constant=lambda _x: (_ for _ in ()).throw(ValueError()))
            except (ValueError, RecursionError):
                raise ApiError(400, "invalid_progress", "学习记录内容无效。") from None
            if parsed is not None and not isinstance(parsed, (dict, list)):
                raise ApiError(400, "invalid_progress", "学习记录结构不正确。")
        now = int(time.time())
        serialized = json.dumps(entries, ensure_ascii=False, sort_keys=True)
        with db():
            db().execute("BEGIN IMMEDIATE")
            previous = db().execute("SELECT * FROM progress WHERE user_id=?", (user["id"],)).fetchone()
            if previous["write_id"] == write_id and previous["entries"] == serialized:
                return jsonify(revision=previous["revision"], updatedAt=previous["updated_at"])
            if previous["write_id"] == write_id:
                raise ApiError(409, "write_id_reused", "同步请求冲突，请先导出当前记录再刷新。")
            cursor = db().execute("UPDATE progress SET entries=?,revision=revision+1,updated_at=?,write_id=? WHERE user_id=? AND revision=?",
                                  (serialized, now, write_id, user["id"], revision))
        if cursor.rowcount != 1:
            raise ApiError(409, "revision_conflict", "另一页面或设备已更新记录。请先导出当前记录，再刷新加载最新版本。")
        return jsonify(revision=revision + 1, updatedAt=now)

    return app
