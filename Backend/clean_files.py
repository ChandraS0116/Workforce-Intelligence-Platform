import os
import glob

base_dir = r"D:\Engineering\Projects\Algoleap\Workforce Intelligence Platform\Backend\agent_runtime"
files = glob.glob(os.path.join(base_dir, "**/*.py"), recursive=True)

fixed_count = 0
for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if content.endswith("\\n"):
            content = content[:-2]  # Remove literal \ and n
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Could not process {filepath}: {e}")

print(f"Successfully fixed {fixed_count} files.")
