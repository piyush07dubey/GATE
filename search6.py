import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Search for answer patterns
patterns = [
    r'[Tt]herefore,? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Hh]ence,? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
    r'[Tt]hus,? *option *[(]([a-zA-Z])[)] *is *the *correct *answer',
]

for pattern in patterns:
    matches = list(re.finditer(pattern, pdf, re.IGNORECASE))
    print(f"Pattern '{pattern}': {len(matches)} matches")
    for m in matches[:5]:
        print(f"  pos {m.start()}: answer={m.group(1)}, context: ...{pdf[max(0,m.start()-50):m.end()+100]}...")
