import os
import glob

base_dir = r"D:\Engineering\Projects\Algoleap\Workforce Intelligence Platform\Frontend\src"
files = glob.glob(os.path.join(base_dir, "**/*.*"), recursive=True)

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if "DANGER ZONE" in content:
                print(f"FOUND IN: {filepath}")
    except Exception:
        pass
