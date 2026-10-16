import re
import json

file_path = 'D:/Engineering/Projects/Algoleap/Workforce Intelligence Platform/Frontend/src/store/useLanguageStore.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find all regex matches of "key": "val" or 'key': 'val' inside the translations block
# To be 100% robust against colons inside keys (like "| Util:" or "Compa-Ratio:"), let's match: r'^\s*(".*?"|\'.*?\')\s*:\s*(".*?"|\'.*?\')\s*,?\s*$' on each line!

languages = ['English', 'Telugu', 'Arabic', 'German', 'French']
lang_dicts = {lang: {} for lang in languages}

# Master translations we must ensure exist
from update_all_translations import master_translations

for lang in languages:
    match = re.search(r'"' + lang + r'": \{(.*?)\n  \}', content, re.DOTALL)
    if not match:
        print(f"Could not find block for {lang}")
        continue
    block = match.group(1)
    for line in block.splitlines():
        line = line.strip()
        if not line:
            continue
        # regex to match "key": "value" or "key": "value",
        m = re.match(r'^(".*?"|\'.*?\')\s*:\s*(".*?"|\'.*?\'),?$', line)
        if m:
            raw_k = m.group(1)
            raw_v = m.group(2)
            try:
                k = json.loads(raw_k)
            except:
                k = raw_k.strip('"').strip("'")
            try:
                v = json.loads(raw_v)
            except:
                v = raw_v.strip('"').strip("'")
            lang_dicts[lang][k] = v
        else:
            # Maybe a multiline or special line, let's try splitting from right on the last unescaped quote + colon?
            # Or if it failed, let's print what failed
            # print(f"Failed to match in {lang}: {line}")
            pass

# Collect ALL unique keys from English + master_translations + all other dicts
all_keys = set()
for lang in languages:
    all_keys.update(lang_dicts[lang].keys())
all_keys.update(master_translations.keys())

# Sort all keys alphabetically for cleanliness and consistency!
sorted_keys = sorted(list(all_keys))

# Now build the new translations dictionary block
new_lang_blocks = []
for lang in languages:
    lines = [f'  "{lang}": {{']
    for k in sorted_keys:
        # Determine value for k in lang
        val = k
        if lang == 'English':
            val = k
        else:
            if k in master_translations and lang in master_translations[k]:
                val = master_translations[k][lang]
            elif k in lang_dicts[lang] and lang_dicts[lang][k] and lang_dicts[lang][k] != k:
                val = lang_dicts[lang][k]
            elif k in lang_dicts['English']:
                # If we don't have a translation, let's check if it's identical or what
                val = lang_dicts[lang].get(k, k)
            else:
                val = lang_dicts[lang].get(k, k)
        lines.append(f'    {json.dumps(k)}: {json.dumps(val, ensure_ascii=False)},')
    
    # Remove trailing comma from last item
    if len(lines) > 1:
        lines[-1] = lines[-1].rstrip(',')
    lines.append('  }')
    new_lang_blocks.append("\n".join(lines))

new_translations_str = "const translations: Record<string, Record<string, string>> = {\n" + ",\n".join(new_lang_blocks) + "\n};\n"

# Replace old translations block in content
m_trans = re.search(r'const translations:\s*Record<.*?>\s*=\s*\{.*?\n\};\n', content, re.DOTALL)
if m_trans:
    content = content[:m_trans.start()] + new_translations_str + content[m_trans.end():]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully and cleanly rebuilt useLanguageStore.ts without errors!")
else:
    print("Could not match full const translations block!")
