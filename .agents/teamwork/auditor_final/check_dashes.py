import os
import subprocess

root = r'c:\AntiGravityStuff\Moonstorm2'

res = subprocess.run(['git', 'status', '--porcelain'], cwd=root, capture_output=True, text=True)
lines = res.stdout.strip().splitlines()

modified_or_untracked = []
for line in lines:
    path = line[3:].strip()
    if path.startswith('"') and path.endswith('"'):
        path = path[1:-1]
    modified_or_untracked.append(path)

found = []
text_exts = {'.md', '.txt', '.json', '.py', '.js', '.ts', '.html', '.css'}

for rel_path in modified_or_untracked:
    full_path = os.path.join(root, rel_path)
    if os.path.isdir(full_path):
        for dirpath, dirnames, filenames in os.walk(full_path):
            for f in filenames:
                ext = os.path.splitext(f)[1].lower()
                if ext not in text_exts:
                    continue
                p = os.path.join(dirpath, f)
                try:
                    with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                        content = fp.read()
                    if '\u2014' in content or '\u2013' in content:
                        found.append((os.path.relpath(p, root), '\u2014' in content, '\u2013' in content))
                except Exception:
                    pass
    elif os.path.isfile(full_path):
        ext = os.path.splitext(full_path)[1].lower()
        if ext in text_exts:
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                if '\u2014' in content or '\u2013' in content:
                    found.append((rel_path, '\u2014' in content, '\u2013' in content))
            except Exception:
                pass

print('Found in modified or untracked text files:')
for p, em, en in found:
    print(f'  {p}: em={em}, en={en}')
print(f'Total: {len(found)}')
