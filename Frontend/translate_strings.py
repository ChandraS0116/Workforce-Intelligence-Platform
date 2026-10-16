import json
from deep_translator import GoogleTranslator
import os

with open('extracted.json', 'r', encoding='utf-8') as f:
    strings = json.load(f)

# Filter out empty or whitespace only strings
strings = [s.strip() for s in strings if s.strip()]

base_dict = {
    "English": {},
    "Telugu": {},
    "Arabic": {},
    "German": {},
    "French": {}
}

languages = {
    "Telugu": "te",
    "Arabic": "ar",
    "German": "de",
    "French": "fr"
}

translators = {lang: GoogleTranslator(source='auto', target=code) for lang, code in languages.items()}

for s in strings:
    base_dict["English"][s] = s

print(f"Translating {len(strings)} strings into 4 languages using batching...")

# We can batch translate by joining strings with a unique delimiter.
# Google Translate limit is usually 5000 characters per request.
DELIMITER = " \u200B|\u200B "

def chunk_strings(strings_list, max_len=4000):
    chunks = []
    current_chunk = []
    current_len = 0
    for s in strings_list:
        if current_len + len(s) + len(DELIMITER) > max_len:
            chunks.append(current_chunk)
            current_chunk = [s]
            current_len = len(s)
        else:
            current_chunk.append(s)
            current_len += len(s) + len(DELIMITER)
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

chunks = chunk_strings(strings)

for lang, translator in translators.items():
    print(f"Translating to {lang}...")
    for chunk in chunks:
        combined = DELIMITER.join(chunk)
        try:
            translated_combined = translator.translate(combined)
            # Split back
            translated_chunks = translated_combined.split(DELIMITER)
            
            # Fallback if split mismatch
            if len(translated_chunks) != len(chunk):
                # Try a fallback delimiter split if spaces got messed up
                translated_chunks = [t.strip() for t in translated_combined.split("|\u200B")]
                if len(translated_chunks) != len(chunk):
                    translated_chunks = [t.strip() for t in translated_combined.split("|")]
                
            for i, s in enumerate(chunk):
                if i < len(translated_chunks):
                    val = translated_chunks[i].strip()
                    # Remove any stray delimiter parts
                    val = val.replace("\u200B", "").strip()
                    if val.startswith("|"): val = val[1:].strip()
                    if val.endswith("|"): val = val[:-1].strip()
                    base_dict[lang][s] = val
                else:
                    base_dict[lang][s] = s # Fallback
        except Exception as e:
            print(f"Error on chunk: {e}")
            for s in chunk:
                base_dict[lang][s] = s

# Now let's rewrite the useLanguageStore.ts
store_path = 'src/store/useLanguageStore.ts'
with open(store_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
translations_str = "const translations: Record<string, Record<string, string>> = " + json.dumps(base_dict, indent=2, ensure_ascii=False) + ";\n"
new_content = re.sub(r'const translations: Record<string, Record<string, string>> = \{[\s\S]*?\};\n', translations_str, content)

with open(store_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Translation dictionary updated!")
