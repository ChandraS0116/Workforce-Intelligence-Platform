import re

file_path = 'D:/Engineering/Projects/Algoleap/Workforce Intelligence Platform/Frontend/src/store/useLanguageStore.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Check if this line is a dictionary entry `"key": "val"` that is missing a trailing comma, and the next line is also a `"key": "val"`
    trimmed = line.rstrip()
    if i + 1 < len(lines):
        next_trimmed = lines[i+1].strip()
        if (trimmed.endswith('"') or trimmed.endswith("'")) and (next_trimmed.startswith('"') or next_trimmed.startswith("'")):
            new_lines.append(trimmed + ",\n")
            continue
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed missing commas!")
