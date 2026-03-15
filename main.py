from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ai_engine import ask_civic_ai
from ocr_reader import extract_text_from_image

app = FastAPI()

# Allow React frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store OCR text globally
document_text = ""


class Question(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "JanAI backend is running"}


@app.post("/chat")
def chat(q: Question):

    global document_text

    answer = ask_civic_ai(q.question, document_text)

    return {"response": answer}


@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):

    global document_text

    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as f:
        f.write(await file.read())

    # OCR extraction
    document_text = extract_text_from_image(file_location)

    return {
        "message": "Document processed successfully",
        "extracted_text": document_text[:500]
    }