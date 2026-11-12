import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Search for answer patterns
patterns = [
    r'therefore.*?option\s*\(([a-zA-Z])\).*?correct answer',
    r'hence.*?option\s*\(([a-zA-Z])\).*?correct answer',
    r'thus.*?option\s*\(([a-zA-Z])\).*?correct answer',
]

for pattern in patterns:
    matches = list(re.finditer(pattern, pdf, re.IGNORECASE))
    print(f"Pattern '{pattern}': {len(matches)} matches")
    for m in matches[:10]:
        print(f"  pos {m.start()}: answer={m.group(1)}")
