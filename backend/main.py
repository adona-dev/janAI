from fastapi import FastAPI, UploadFile, File, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ai_engine import ask_civic_ai
from ocr_reader import extract_text_from_image_base64
from docx import Document
import pytesseract
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)
from PIL import Image
import pdfplumber
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jan-epif1mpfe-adona-s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import List

class Question(BaseModel):
    question: str
    document_text: str = ""
    history: List[dict] = []

@app.get("/")
def home():
    return {"message": "JanAI backend is running"}

@app.post("/chat")
def chat(q: Question):
    answer = ask_civic_ai(
        q.question,
        q.document_text or "",
        q.history
    )
    return {"response": answer}

@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):

    # DOCX Support
    if file.filename.endswith(".docx"):

        contents = await file.read()

        with open("temp.docx", "wb") as f:
            f.write(contents)

        doc = Document("temp.docx")

        text = "\n".join(
            para.text
            for para in doc.paragraphs
        )

        return {
            "message": "DOCX processed successfully",
            "extracted_text": text
        }

    # PDF Support
    if file.filename.endswith(".pdf"):
    contents = await file.read()

    return {
        "message": "PDF received",
        "size": len(contents)
    }

    # Image Support
    if file.content_type.startswith("image/"):

        contents = await file.read()

        image = Image.open(io.BytesIO(contents))

        text = pytesseract.image_to_string(image)

        return {
            "message": "Image processed successfully",
            "extracted_text": text
        }

    return {
        "message": "Unsupported file type",
        "extracted_text": ""
    }

@app.post("/scan-image")
async def scan_image(data: dict = Body(...)):
    try:
        image_data = data["image"].split(",")[1]
        text = extract_text_from_image_base64(image_data)
        return {"extracted_text": text}
    except Exception as e:
        return {"extracted_text": "Error reading image", "error": str(e)}
    
    