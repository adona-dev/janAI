import base64
from PIL import Image
import pytesseract
import io

def extract_text_from_image_base64(base64_str):
    image_bytes = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_bytes))

    text = pytesseract.image_to_string(image)
    return text