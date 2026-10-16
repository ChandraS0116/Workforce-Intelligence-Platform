import re

with open('D:/Engineering/Projects/Algoleap/Workforce Intelligence Platform/Frontend/src/store/useLanguageStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

eng_match = re.search(r'"English": \{(.*?)\n  \}', content, re.DOTALL)
eng_keys = []
if eng_match:
    for line in eng_match.group(1).split('\n'):
        if ':' in line:
            k = line.split(':', 1)[0].strip().strip('"').strip("'")
            eng_keys.append(k)

for lang in ['Arabic', 'German', 'French']:
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
        same = [k for k in eng_keys if lang_dict.get(k) == k and len(k) > 1 and not k.isdigit()]
        empty = [k for k in eng_keys if lang_dict.get(k) == ""]
        print(f"=== {lang} ===")
        print("EMPTY:", empty)
        print("SAME AS ENGLISH COUNT:", len(same))
        if len(same) > 0:
            print("SAME AS ENGLISH:", same)
