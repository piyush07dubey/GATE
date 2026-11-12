with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Get the end of the PDF (last 10000 chars)
end_text = pdf[-10000:]
print("Last 10000 characters:")
print(end_text)
