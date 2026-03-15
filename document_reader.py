import pytesseract
from PIL import Image
from pdf2image import convert_from_path


def read_image(file_path):

    image = Image.open(file_path)
    text = pytesseract.image_to_string(image)

    return text


def read_pdf(file_path):

    pages = convert_from_path(file_path)

    full_text = ""

    for page in pages:
        text = pytesseract.image_to_string(page)
        full_text += text

    return full_text