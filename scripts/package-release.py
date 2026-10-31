"""Build separate public/private artifacts from one clean Git commit."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.check_output(['git', '-c', 'core.autocrlf=false', *args], cwd=ROOT)


def public_file(name):
    path = PurePosixPath(name)
    return (
        (len(path.parts) == 1 and path.suffix in {'.html', '.css'})
        or (path.parts[0] in {'src', 'portal'} and path.suffix in {'.js', '.html', '.css'})
        or (len(path.parts) == 2 and path.parts[0] == 'data'
            and path.name.startswith('questions.') and path.suffix == '.json')
        or (path.parts[:2] == ('data', 'ai-assets') and path.suffix == '.png')
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    if git('status', '--porcelain', '--untracked-files=no').strip():
        raise SystemExit('Commit tracked changes before packaging; untracked user files are excluded.')
    commit = git('rev-parse', 'HEAD').decode().strip()
    coverage = json.loads(git('show', f'{commit}:docs/ai-audit/coverage.json'))
    if sum(len(bank['reviewed']) for bank in coverage.values()) != 176:
        raise SystemExit('The reviewed AI layer is incomplete.')
    source = tarfile.open(fileobj=io.BytesIO(git('archive', '--format=tar', commit)), mode='r:')
    members = [m for m in source.getmembers() if m.isfile()]
    groups = {
        'web': [m for m in members if public_file(m.name)],
        'api': [m for m in members if m.name.startswith(('server/', 'deploy/'))
                or m.name in {'tests/python/test_accounts.py', 'tests/python/test_backup.py'}],
    }
    args.output.mkdir(parents=True, exist_ok=True)
    manifest = {'commit': commit, 'artifacts': {}}
    for group, selected in groups.items():
        if not selected:
            raise SystemExit(f'No {group} files selected')
        target = args.output / f'ctest-{group}-{commit}.tar.gz'
        hashes = {}
        with target.open('wb') as raw, gzip.GzipFile(fileobj=raw, mode='wb', mtime=0, filename='') as gz:
            with tarfile.open(fileobj=gz, mode='w') as archive:
                for member in selected:
                    data = source.extractfile(member).read()
                    hashes[member.name] = hashlib.sha256(data).hexdigest()
                    info = tarfile.TarInfo(member.name)
                    info.size = len(data)
                    info.mode = 0o755 if member.name.endswith('.sh') else 0o644
                    archive.addfile(info, io.BytesIO(data))
        manifest['artifacts'][group] = {'file': target.name,
            'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'files': hashes}
    manifest_path = args.output / f'ctest-manifest-{commit}.json'
    manifest_path.write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'commit': commit, 'manifest': str(manifest_path),
                      'files': {name: len(files) for name, files in groups.items()}}))


if __name__ == '__main__':
    main()
