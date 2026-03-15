JanAI – AI Civic Assistant for Kerala

JanAI is an AI-powered civic assistant designed to help citizens of Kerala easily understand and access government services. The system allows users to ask questions about government procedures, upload documents for analysis, and interact using voice or text.
The goal of JanAI is to simplify access to government information using modern AI technologies.

#Features

-AI-powered chatbot for answering questions about Kerala government services
-Voice assistant support for speaking queries instead of typing
-Document upload with OCR to extract text from certificates or forms
-Camera scanning to capture documents directly from the device camera
-AI-based document understanding for answering questions related to uploaded documents
-Multilingual support including English and Malayalam
-ChatGPT-style user interface for an intuitive experience

#Example Use Cases

Users can ask questions such as:
-How to apply for an income certificate in Kerala?
-What documents are required for a ration card?
-How to apply for a caste certificate?
-Users can also upload a document like Aadhaar or a certificate and ask:
-What is the ID number in this document?
-What name is written in the document?

#Technology Stack

Frontend
 -React.js
 -CSS

Backend
 -FastAPI (Python)

AI Model
 -Groq API with LLaMA model

Document Processing
 -Tesseract OCR
 -Pytesseract

Voice Interaction
 -Web Speech API

#Project Architecture

Frontend (React UI)
↓
FastAPI Backend
↓
OCR Engine (Tesseract)
↓
AI Model (Groq LLM)

#How to Run the Project

Clone the repository
-git clone https://github.com/adona-dev/janAI.git
-Navigate to backend
-cd backend
-Install dependencies
-pip install -r requirements.txt
-Run backend server
-uvicorn main:app --reload
-Navigate to frontend
-cd frontend/react-app
-Install dependencies
-npm install
-Run React app
-npm start

#Future Improvements

-Automatic form filling for government applications
-Integration with government service portals
-Mobile application support
-AI-powered scheme recommendation for citizens

#Purpose
 -This project was created as an experimental AI civic assistant prototype and can be used as a foundation for building intelligent public service systems.
