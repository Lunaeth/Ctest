import json
from contextlib import closing
from pathlib import Path
import sqlite3
import tempfile
import unittest
import uuid
from unittest.mock import patch

from server.app import COOKIE, KEYS, create_app

ORIGIN = "https://learn.lunaeth.com"
PASSWORD = "Test-only long passphrase 42!"


class AccountTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = str(Path(self.temp.name) / "accounts.sqlite3")
        self.verification = {"success": True, "hostname": "learn.lunaeth.com", "action": "register"}
        self.tokens = set()

        def verify(_secret, token, _ip):
            if token in self.tokens:
                return {"success": False, "error-codes": ["timeout-or-duplicate"]}
            self.tokens.add(token)
            return self.verification

        self.app = create_app({"TESTING": True, "DATABASE": self.path, "SESSION_SECRET": "s" * 48,
                               "TURNSTILE_SITE_KEY": "test-site", "TURNSTILE_SECRET_KEY": "test-secret"},
                              turnstile_verifier=verify)
        self.client = self.app.test_client()
        self.token_number = 0

    def tearDown(self):
        self.temp.cleanup()

    def call(self, path, method="GET", value=None, csrf=None, client=None, origin=ORIGIN):
        headers = {"Origin": origin}
        if csrf:
            headers["X-CSRF-Token"] = csrf
        return (client or self.client).open(path, method=method, json=value, headers=headers, base_url=ORIGIN)

    def register(self, username="alice", client=None):
        self.token_number += 1
        return self.call("/api/auth/register", "POST", {"username": username, "password": PASSWORD,
                                                         "turnstileToken": str(self.token_number)}, client=client)

    def save(self, csrf, entries, revision=0, client=None):
        return self.call("/api/progress", "PUT", {"revision": revision, "entries": entries, "writeId": str(uuid.uuid4())}, csrf, client)

    def test_registration_cookie_hashing_and_case_insensitive_login(self):
        result = self.register("Alice")
        self.assertEqual(result.status_code, 201)
        cookie = result.headers["Set-Cookie"]
        for flag in (COOKIE, "HttpOnly", "Secure", "SameSite=Strict", "Path=/"):
            self.assertIn(flag, cookie)
        self.assertNotIn("Domain=", cookie)
        self.assertEqual(result.json["user"]["username"], "alice")
        with closing(sqlite3.connect(self.path)) as db, db:
            hashed = db.execute("SELECT password_hash FROM users").fetchone()[0]
            token_hash = db.execute("SELECT token_hash FROM sessions").fetchone()[0]
        self.assertTrue(hashed.startswith("$argon2id$"))
        self.assertNotIn(PASSWORD, hashed)
        self.assertNotIn(token_hash, cookie)
        result = self.call("/api/auth/login", "POST", {"username": "ALICE", "password": PASSWORD})
        self.assertEqual(result.status_code, 200)

    def test_accounts_are_isolated_and_identity_cannot_be_selected_by_client(self):
        alice = self.register().json
        second = self.app.test_client()
        bob = self.register("bob", second).json
        entries = {KEYS[0]: '{"ccnpDcai":{"7":{"correct":true}}}', KEYS[1]: '{"ncaAiio":[3]}', KEYS[2]: '{"core2":[9]}'}
        self.assertEqual(self.save(alice["csrfToken"], entries).status_code, 200)
        self.assertEqual(self.call("/api/progress?user_id=1", client=second).json["entries"], {})
        self.assertEqual(self.save(bob["csrfToken"], {KEYS[2]: '{"ncaAiio":[11]}'}, client=second).status_code, 200)
        self.assertEqual(self.call("/api/progress").json["entries"], entries)

    def test_progress_survives_relogin_and_app_restart(self):
        account = self.register().json
        entries = {key: json.dumps({"ncaAiio": {"example": i}}) for i, key in enumerate(KEYS)}
        self.save(account["csrfToken"], entries)
        self.call("/api/auth/logout", "POST", {}, account["csrfToken"])
        self.call("/api/auth/login", "POST", {"username": "alice", "password": PASSWORD})
        self.assertEqual(self.call("/api/progress").json["entries"], entries)
        restarted = create_app({"TESTING": True, "DATABASE": self.path, "SESSION_SECRET": "s" * 48})
        client = restarted.test_client()
        self.call("/api/auth/login", "POST", {"username": "alice", "password": PASSWORD}, client=client)
        self.assertEqual(self.call("/api/progress", client=client).json["entries"], entries)

    def test_stale_revision_cannot_overwrite_newer_progress(self):
        csrf = self.register().json["csrfToken"]
        self.assertEqual(self.save(csrf, {KEYS[0]: '{"new":true}'}).status_code, 200)
        self.assertEqual(self.save(csrf, {KEYS[0]: '{"stale":true}'}).status_code, 409)
        self.assertEqual(self.call("/api/progress").json["entries"][KEYS[0]], '{"new":true}')

    def test_lost_response_can_be_retried_without_duplicate_write(self):
        csrf = self.register().json["csrfToken"]
        value = {"revision": 0, "entries": {KEYS[0]: '{}'}, "writeId": str(uuid.uuid4())}
        first = self.call("/api/progress", "PUT", value, csrf)
        repeat = self.call("/api/progress", "PUT", value, csrf)
        self.assertEqual(first.json, repeat.json)
        self.assertEqual(repeat.json["revision"], 1)
        value["entries"] = {}
        self.assertEqual(self.call("/api/progress", "PUT", value, csrf).status_code, 409)

    def test_unauthenticated_users_cannot_read_or_write_progress(self):
        self.assertEqual(self.call("/api/progress").status_code, 401)
        self.assertEqual(self.save("wrong", {}).status_code, 401)
        self.assertIsNone(self.call("/api/auth/session").json["user"])

    def test_csrf_and_origin_are_required_and_cross_account_csrf_is_invalid(self):
        first = self.register().json["csrfToken"]
        for origin in ("", "https://evil.example", "https://ca.lunaeth.com"):
            self.assertEqual(self.call("/api/auth/logout", "POST", {}, first, origin=origin).status_code, 403)
        self.assertEqual(self.save(None, {}).status_code, 403)
        self.assertEqual(self.save("forged", {}).status_code, 403)
        self.register("bob")
        self.assertEqual(self.save(first, {}).status_code, 403)

    def test_logout_revokes_server_session(self):
        account = self.register().json
        token = self.client.get_cookie(COOKIE, domain="learn.lunaeth.com").value
        self.assertEqual(self.call("/api/auth/logout", "POST", {}, account["csrfToken"]).status_code, 200)
        self.client.set_cookie(COOKIE, token, domain="learn.lunaeth.com")
        self.assertEqual(self.call("/api/progress").status_code, 401)

    def test_expired_sessions_are_rejected(self):
        self.register()
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("UPDATE sessions SET expires_at=0")
        self.assertEqual(self.call("/api/progress").status_code, 401)

    def test_captcha_requires_success_correct_hostname_and_action(self):
        for response in ({"success": False}, {"success": True, "hostname": "evil.example", "action": "register"},
                         {"success": True, "hostname": "learn.lunaeth.com", "action": "login"}, None):
            self.verification = response
            self.assertEqual(self.register().status_code, 400)
        with closing(sqlite3.connect(self.path)) as db, db:
            self.assertEqual(db.execute("SELECT count(*) FROM users").fetchone()[0], 0)

    def test_captcha_missing_expired_replayed_and_unavailable_fail_closed(self):
        value = {"username": "alice", "password": PASSWORD}
        self.assertEqual(self.call("/api/auth/register", "POST", value).status_code, 400)
        value["turnstileToken"] = "single-use"
        self.assertEqual(self.call("/api/auth/register", "POST", value).status_code, 201)
        value["username"] = "bob"
        self.assertEqual(self.call("/api/auth/register", "POST", value).status_code, 400)
        self.app.config["TURNSTILE_SECRET_KEY"] = ""
        self.assertFalse(self.call("/api/config").json["registrationEnabled"])
        self.assertEqual(self.register("charlie").status_code, 503)

    def test_captcha_network_failure_does_not_create_account(self):
        app = create_app({"TESTING": True, "DATABASE": self.path, "SESSION_SECRET": "s" * 48,
                          "TURNSTILE_SITE_KEY": "test", "TURNSTILE_SECRET_KEY": "test"},
                         turnstile_verifier=lambda *_: (_ for _ in ()).throw(TimeoutError()))
        self.assertEqual(self.register(client=app.test_client()).status_code, 503)

    def test_invalid_credentials_and_duplicate_names(self):
        self.register()
        self.assertEqual(self.register("ALICE").status_code, 409)
        for name in ("alice", "missing"):
            result = self.call("/api/auth/login", "POST", {"username": name, "password": "incorrect long password"})
            self.assertEqual(result.status_code, 401)
            self.assertEqual(result.json["error"], "invalid_credentials")
        self.assertEqual(self.call("/api/auth/login", "POST", {"username": "';DROP TABLE users;", "password": PASSWORD}).status_code, 400)

    def test_invalid_progress_is_rejected_without_modification(self):
        csrf = self.register().json["csrfToken"]
        for entries in ({"arbitrary-key": "{}"}, {KEYS[0]: "NaN"}, {KEYS[0]: "not JSON"}, {KEYS[0]: "42"}, {KEYS[0]: {}}, []):
            self.assertEqual(self.save(csrf, entries).status_code, 400)
        self.assertEqual(self.save(csrf, {}, True).status_code, 400)
        self.assertEqual(self.call("/api/progress").json["revision"], 0)

    def test_body_limit_and_cache_control(self):
        csrf = self.register().json["csrfToken"]
        self.assertEqual(self.save(csrf, {KEYS[0]: "x" * 2_000_001}).status_code, 413)
        self.assertEqual(self.call("/api/progress").headers["Cache-Control"], "no-store")

    def test_registration_rate_limit_is_shared_between_clients(self):
        for _ in range(10):
            self.assertEqual(self.call("/api/auth/register", "POST", {}).status_code, 400)
        response = self.call("/api/auth/register", "POST", {}, client=self.app.test_client())
        self.assertEqual(response.status_code, 429)
        self.assertIn("Retry-After", response.headers)


if __name__ == "__main__":
    unittest.main()
