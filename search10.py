import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Search for answer patterns in different ways
patterns = [
    r'option\s*\(([a-zA-Z])\).*?is *the *correct *answer',
    r'option\s*\(([a-zA-Z])\).*?is *correct',
    r'option *[(]([a-zA-Z])[)] *is *correct',
    r'the correct answer is option *[(]([a-zA-Z])[)]',
]

for pattern in patterns:
    matches = list(re.finditer(pattern, pdf, re.IGNORECASE))
    print(f"Pattern '{pattern}': {len(matches)} matches")
    for m in matches[:10]:
        print(f"  pos {m.start()}: answer={m.group(1)}")
