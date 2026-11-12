import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf_text = f.read()

# Find question markers and show context
print("Question markers and surrounding context:")
for m in list(re.finditer(r'\n\d+\.\s*\[', pdf_text))[:10]:
    start = max(0, m.start() - 200)
    end = min(len(pdf_text), m.end() + 500)
    context = pdf_text[start:end]
    context = re.sub(r'\s+', ' ', context)
    print(f"\npos {m.start()}: ...{context}...")
