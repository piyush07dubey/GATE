import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf_text = f.read()

# Search for "correct answer" in PDF
print("Searching for 'correct answer' in PDF...")
matches = list(re.finditer(r'correct answer', pdf_text, re.IGNORECASE))
print(f"Found {len(matches)} occurrences of 'correct answer'")

# Show context around first few
for i, m in enumerate(matches[:5]):
    start = max(0, m.start() - 100)
    end = min(len(pdf_text), m.end() + 100)
    context = pdf_text[start:end]
    context = re.sub(r'\s+', ' ', context)
    print(f"{i+1}. pos {m.start()}: ...{context}...")

# Search for "option" followed by "correct"
print("\nSearching for 'option' + 'correct'...")
option_correct = list(re.finditer(r'option\+?\s*\(?\s*([a-zA-Z])\s*\)?[^.]{0,100}?correct', pdf_text, re.IGNORECASE))
print(f"Found {len(option_correct)} matches")
for i, m in enumerate(option_correct[:5]):
    start = max(0, m.start() - 50)
    end = min(len(pdf_text), m.end() + 100)
    context = pdf_text[start:end]
    context = re.sub(r'\s+', ' ', context)
    print(f"{i+1}. pos {m.start()}: ...{context}...")
