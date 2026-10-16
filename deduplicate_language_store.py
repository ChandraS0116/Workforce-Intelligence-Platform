import re
import json
from collections import OrderedDict

file_path = 'D:/Engineering/Projects/Algoleap/Workforce Intelligence Platform/Frontend/src/store/useLanguageStore.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for lang in ['English', 'Telugu', 'Arabic', 'German', 'French']:
    match = re.search(r'"' + lang + r'": \{(.*?)\n  \}', content, re.DOTALL)
    if not match:
        continue
    block = match.group(1)
    lines = block.split('\n')
    
    # Store unique keys in OrderedDict
    unique_entries = OrderedDict()
    for line in lines:
        line_str = line.strip().rstrip(',')
        if not line_str:
            continue
        if ':' in line_str:
            # We parse JSON key if possible or string split
            parts = line_str.split(':', 1)
            raw_k = parts[0].strip()
            raw_v = parts[1].strip()
            # Try to un-json the key
            try:
                k_val = json.loads(raw_k)
            except:
                k_val = raw_k.strip('"').strip("'")
            
            # If key already in unique_entries, we overwrite only if the new value is not empty or not identical to english
            if k_val in unique_entries:
                old_v = unique_entries[k_val]
                # Keep new one if old one looks like dummy/duplicate
                if old_v == raw_k or old_v == '""':
                    unique_entries[k_val] = raw_v
                else:
                    # if new one is valid, let's keep the later one or previous good one
                    pass
            else:
                unique_entries[k_val] = raw_v
        else:
            pass

    # Build clean block without duplicates
    clean_lines = []
    for k_val, raw_v in unique_entries.items():
        clean_lines.append(f'    {json.dumps(k_val)}: {raw_v},')
        
    clean_block = "\n".join(clean_lines).rstrip(',')
    content = content.replace(block, clean_block)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully deduplicated all language blocks!")
