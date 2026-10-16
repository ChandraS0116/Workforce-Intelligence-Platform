import re
import json

with open('D:/Engineering/Projects/Algoleap/Workforce Intelligence Platform/Frontend/src/store/useLanguageStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

eng_match = re.search(r'"English": \{(.*?)\n  \}', content, re.DOTALL)
eng_keys = []
if eng_match:
    for line in eng_match.group(1).split('\n'):
        if ':' in line:
            k = line.split(':', 1)[0].strip().strip('"').strip("'")
            eng_keys.append(k)

all_issues = set()
for lang in ['Telugu', 'Arabic', 'German', 'French']:
    match = re.search(r'"' + lang + r'": \{(.*?)\n  \}', content, re.DOTALL)
    if match:
        block = match.group(1)
        lang_dict = {}
        for line in block.split('\n'):
            if ':' in line:
                parts = line.split(':', 1)
                k = parts[0].strip().strip('"').strip("'")
                v = parts[1].strip().rstrip(',').strip('"').strip("'")
                lang_dict[k] = v
        for k in eng_keys:
            v = lang_dict.get(k, "")
            if v == "" or (v == k and len(k) > 1 and not k.isdigit() and k not in ['Ctrl+K', 'PRJ-', 'e.g. 1', 'ESC', 'Lvl', 'RISK', 'All']):
                all_issues.add(k)

print(f"Total issue keys across all languages: {len(all_issues)}")
for k in sorted(list(all_issues)):
    print(repr(k))
