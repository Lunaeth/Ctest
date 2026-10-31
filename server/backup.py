"""Online SQLite backups and non-overwriting restore copies; no account data is logged."""
import argparse
from contextlib import closing
from datetime import datetime, timezone
import os
from pathlib import Path
import re
import sqlite3
import uuid

BACKUP_NAME = re.compile(r"accounts-\d{8}T\d{6}Z-[0-9a-f]{32}\.sqlite3\Z")


def copy_database(source, destination):
    """Copy committed data, including WAL, to a new integrity-checked database."""
    source = Path(source).resolve(strict=True)
    destination = Path(destination).absolute()
    if not source.is_file():
        raise ValueError("Source must be an existing database file")
    # O_EXCL also rejects symlinks and prevents accidental replacement during restore.
    fd = os.open(destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(fd)
    try:
        with closing(sqlite3.connect(source.as_uri() + "?mode=ro", uri=True, timeout=10)) as live:
            with closing(sqlite3.connect(destination, timeout=10)) as target:
                live.backup(target)
                if target.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
                    raise ValueError("Backup integrity check failed")
                if target.execute("PRAGMA foreign_key_check").fetchall():
                    raise ValueError("Backup contains foreign-key violations")
                target.commit()
        with destination.open("r+b") as saved:
            os.fsync(saved.fileno())
    except BaseException:
        destination.unlink(missing_ok=True)
        raise
    return destination


def create_backup(database, directory, retain=14):
    if retain < 1:
        raise ValueError("At least one backup must be retained")
    directory = Path(directory).absolute()
    directory.mkdir(mode=0o700, parents=True, exist_ok=True)
    name = "accounts-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex + ".sqlite3"
    result = copy_database(database, directory / name)
    # Only prune our own named regular backups, after a successful replacement exists.
    previous = sorted((p for p in directory.iterdir() if p != result and p.is_file()
                       and not p.is_symlink() and BACKUP_NAME.fullmatch(p.name)),
                      key=lambda p: (p.stat().st_mtime_ns, p.name), reverse=True)
    for old in previous[max(0, retain - 1):]:
        old.unlink()
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", default="/var/lib/ctest/accounts.sqlite3")
    parser.add_argument("--directory", default="/var/backups/ctest")
    parser.add_argument("--retain", type=int, default=14)
    parser.add_argument("--restore-from")
    parser.add_argument("--restore-to")
    args = parser.parse_args()
    if bool(args.restore_from) != bool(args.restore_to):
        parser.error("Restore requires both --restore-from and --restore-to")
    result = (copy_database(args.restore_from, args.restore_to) if args.restore_from
              else create_backup(args.database, args.directory, args.retain))
    print(f"Verified database copy: {result.name}")


if __name__ == "__main__":
    main()
