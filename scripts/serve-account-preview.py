"""Disposable localhost-only account UI fixture. Never deploy this server."""
from contextlib import closing
from pathlib import Path
import sqlite3
import sys
import tempfile
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from argon2 import PasswordHasher
from flask import abort, send_from_directory
from server.app import create_app, pin_material

root = Path(__file__).resolve().parents[1]
temporary = tempfile.TemporaryDirectory(prefix="ctest-account-preview-")
database = str(Path(temporary.name) / "preview.sqlite3")
app = create_app({"DATABASE": database, "APP_ORIGIN": "http://localhost:4180",
                  "SESSION_SECRET": "local-preview-only-never-use-in-production-4180",
                  "PIN_PEPPER": "local-pin-pepper-only-never-use-in-production-4180"})
with closing(sqlite3.connect(database)) as db, db:
    hashed = PasswordHasher().hash(pin_material("0427", app.config["PIN_PEPPER"]))
    for username in ("preview_alice", "preview_bob"):
        row = db.execute("INSERT INTO users(username,password_hash,created_at,credential_type) VALUES (?,?,?,'pin')", (username, hashed, int(time.time())))
        db.execute("INSERT INTO progress(user_id,updated_at) VALUES (?,?)", (row.lastrowid, int(time.time())))

    # Legacy account for migration-layout checks.
    legacy = PasswordHasher().hash("Local preview only 4180!")
    row = db.execute("INSERT INTO users(username,password_hash,created_at) VALUES (?,?,?)", ("preview_legacy", legacy, int(time.time())))
    db.execute("INSERT INTO progress(user_id,updated_at) VALUES (?,?)", (row.lastrowid, int(time.time())))


@app.get("/")
@app.get("/<path:filename>")
def static_file(filename="index.html"):
    if filename.split("/")[0] not in ("src", "data", "portal") and not ("/" not in filename and filename.endswith((".html", ".css"))):
        abort(404)
    return send_from_directory(root, filename)


if __name__ == "__main__":
    try:
        app.run(host="127.0.0.1", port=4180, debug=False)
    finally:
        temporary.cleanup()
