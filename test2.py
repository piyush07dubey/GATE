with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Search for various answer indicators
patterns = [
    'Key Concepts',
    'Answer',
    'Answers',
    'Correct answer',
    'Solution',
    'Solutions',
    'Answer key',
]

for p in patterns:
    positions = []
    start = 0
    while True:
        pos = pdf.find(p, start)
        if pos == -1:
            break
        positions.append(pos)
        start = pos + 1
    print(f"'{p}': {len(positions)} occurrences, first at {positions[0] if positions else 'N/A'}, last at {positions[-1] if positions else 'N/A'}")
