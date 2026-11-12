import re

with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'r', encoding='utf-16') as f:
    pdf = f.read()

# Get the end of the PDF
print("Last 5000 characters:")
print(pdf[-5000:])
