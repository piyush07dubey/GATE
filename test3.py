with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Search for "Correct answer" context
import re
matches = list(re.finditer(r'Correct answer', pdf, re.IGNORECASE))
print(f"'Correct answer' found {len(matches)} times")
for m in matches[:5]:
    start = max(0, m.start() - 100)
    end = min(len(pdf), m.end() + 200)
    context = pdf[start:end]
    context = re.sub(r'\s+', ' ', context)
    print(f"\npos {m.start()}: ...{context}...")
