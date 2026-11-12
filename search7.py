import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Search for answer patterns
pattern = r'therefore.*?option\s*\(([a-zA-Z])\).*?correct answer'
matches = list(re.finditer(pattern, pdf, re.IGNORECASE))

print(f"Found {len(matches)} matches")
for m in matches[:5]:
    print(f"pos {m.start()}: answer={m.group(1)}")
    context = pdf[max(0, m.start()-100):m.end()+100]
    print(f"context: {context}")
