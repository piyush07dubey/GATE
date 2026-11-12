import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Search for Key Concepts sections
matches = list(re.finditer(r'[Kk]ey [Cc]oncepts', pdf))
print(f"Key Concepts sections: {len(matches)}")

# Show context around first few
for m in matches[:5]:
    start = max(0, m.start() - 100)
    end = min(len(pdf), m.end() + 500)
    context = pdf[start:end]
    context = re.sub(r'\s+', ' ', context)
    print(f"\npos {m.start()}: ...{context}...")
