import fitz
import sys

def main():
    pdf_path = r"C:\Users\Asus\Downloads\Telegram Desktop\CS_FINAL PYQ BOOK (Updated)_FINAL.pdf"
    
    try:
        doc = fitz.open(pdf_path)
        print(f"Total pages: {len(doc)}")
        
        # Extract pages 15 to 20 to get a sample of questions
        sample_text = ""
        for i in range(15, 20):
            sample_text += f"--- PAGE {i} ---\n"
            sample_text += doc[i].get_text()
            sample_text += "\n\n"
            
        with open("pdf_sample.txt", "w", encoding="utf-8") as f:
            f.write(sample_text)
            
        print("Sample extracted to pdf_sample.txt successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
