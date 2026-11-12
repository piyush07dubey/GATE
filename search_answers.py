import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-8', errors='replace') as f:
    pdf = f.read()

# Try different patterns
patterns = [
    r'therefore, option',
    r'hence option',
    r'thus option',
    r'therefore option',
    r'hence, option',
    r'thus, option',
    r'correct answer',
    r'option \(',
]

for pattern in patterns:
    matches = list(re.finditer(pattern, pdf, re.IGNORECASE))
    print(f"Pattern '{pattern}': {len(matches)} matches")
    if matches:
        for m in matches[:3]:
            start = max(0, m.start() - 50)
            end = min(len(pdf), m.end() + 100)
            context = pdf[start:end]
            context = re.sub(r'\s+', ' ', context)
            print(f"  pos {m.start()}: ...{context}...")
