import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf_text = f.read()

# Test patterns
patterns = [
    r'option\s*\(\s*([a-zA-Z])\s*\)?\s*is\s*the\s*correct\s*answer',
    r'option\s*\(\s*([a-zA-Z])\s*\)?\s*is\s*correct',
]

for pattern in patterns:
    matches = list(re.finditer(pattern, pdf_text, re.IGNORECASE))
    print(f"Pattern '{pattern}': {len(matches)} matches")
    for m in matches[:3]:
        print(f"  pos {m.start()}: ...{pdf_text[max(0,m.start()-50):m.end()+100]}...")
