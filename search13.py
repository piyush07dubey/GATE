with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Find the last occurrence of "Key Concepts"
last_kc = pdf.rfind('Key Concepts')
if last_kc != -1:
    end_text = pdf[last_kc:last_kc+10000]
    print("From last Key Concepts:")
    print(end_text)
else:
    print("Key Concepts not found")
    # Try finding the end
    print("Last 5000 chars:", pdf[-5000:])
