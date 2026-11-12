with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

print("PDF length:", len(pdf))

# Search for common answer indicators
keywords = ['option', 'correct', 'answer', 'therefore', 'hence', 'thus', '1.', '2.', '3.']

for kw in keywords:
    count = pdf.count(kw)
    print(f"'{kw}': {count} occurrences")
