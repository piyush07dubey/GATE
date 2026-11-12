with open('C:/Users/Asus/OneDrive/Desktop/GATE/pdf_full_text.txt', 'rb') as f:
    content = f.read()
    
print("File size:", len(content))

# Try different encodings
for encoding in ['utf-8', 'utf-16', 'latin-1', 'cp1252', 'iso-8859-1']:
    try:
        text = content.decode(encoding)
        print(f"\nEncoding '{encoding}' succeeded")
        print("First 200 chars:", repr(text[:200]))
        break
    except Exception as e:
        print(f"\nEncoding '{encoding}' failed: {e}")
