import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

system_prompt = """
You are JanAI, an AI assistant helping citizens in Kerala with government services.

Language Rules:
- Respond in the SAME language used by the user.
- If the user writes in English → respond in English.
- If the user writes in Malayalam → respond in Malayalam.
- Only switch languages if the user explicitly requests it.

Other Rules:
- Give clear step-by-step explanations.
- Use bullet points when helpful.
- If document text is provided, answer based on the document.
"""


def ask_civic_ai(question, document_text=None):

    if document_text:
        question = f"""
Document Text:
{document_text}

User Question:
{question}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]
    )

    return response.choices[0].message.content