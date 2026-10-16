import os
import re

def search_files(directory, extensions, patterns):
    matches = []
    for root, _, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root or 'dist' in root or '__pycache__' in root:
            continue
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        for i, line in enumerate(f, 1):
                            if any(re.search(p, line, re.IGNORECASE) for p in patterns):
                                matches.append(f'{path}:{i} -> {line.strip()}')
                except Exception:
                    pass
    return matches

print('Scanning Backend...')
backend_matches = search_files('api/routers', ['.py'], [r'mock', r'synthetic', r'hardcode', r'fake', r'placeholder', r'\"score\": \d+'])
for m in backend_matches:
    print(m)

print('\nScanning Frontend...')
frontend_matches = search_files('../workforce-frontend/src', ['.tsx', '.ts'], [r'mock', r'synthetic', r'hardcode', r'fake', r'placeholder', r'readinessIndex: \d+', r'workforceHealth: \d+', r'projectHealth: \d+', r'skillReadiness: \d+'])
for m in frontend_matches:
    print(m)
