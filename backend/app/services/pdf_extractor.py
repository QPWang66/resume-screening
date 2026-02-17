import pypdf
import io
import logging
import tempfile
import os
import platform

logger = logging.getLogger(__name__)

# Check if OCR dependencies are available
OCR_AVAILABLE = False
POPPLER_PATH = None

try:
    from pdf2image import convert_from_bytes
    import pytesseract

    # Configure Tesseract path for Windows
    if platform.system() == "Windows":
        # Common Tesseract installation paths on Windows
        tesseract_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
        ]
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                logger.info(f"Found Tesseract at: {path}")
                break

        # Find Poppler path for Windows (required by pdf2image)
        poppler_paths = [
            os.path.expanduser(r"~\poppler-24.08.0\Library\bin"),
            os.path.expanduser(r"~\poppler\Library\bin"),
            r"C:\poppler-24.08.0\Library\bin",
            r"C:\poppler\Library\bin",
            r"C:\Program Files\poppler\Library\bin",
            r"C:\Program Files\poppler-24.08.0\Library\bin",
        ]
        for path in poppler_paths:
            if os.path.exists(path):
                POPPLER_PATH = path
                logger.info(f"Found Poppler at: {path}")
                break

    # Verify Tesseract is actually working
    try:
        pytesseract.get_tesseract_version()
        OCR_AVAILABLE = True
        logger.info("OCR dependencies loaded successfully")
    except Exception as e:
        logger.warning(f"Tesseract not found or not working: {e}")
        logger.warning("Install Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki")

except ImportError as e:
    logger.warning(f"OCR dependencies not installed: {e}. Run: pip install pdf2image pytesseract pillow")


def extract_text_from_pdf(file_content: bytes) -> tuple[str, str | None]:
    """
    Extracts text from a PDF file content (bytes).

    Returns:
        tuple: (extracted_text, warning_message)
        - extracted_text: The text content from the PDF
        - warning_message: None if successful, or a warning string if OCR was used or extraction failed
    """
    warning = None

    # First try standard text extraction
    try:
        pdf_file = io.BytesIO(file_content)
        reader = pypdf.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        text = text.strip()

        # If we got meaningful text, return it
        if len(text) > 50:
            return text, None

    except Exception as e:
        logger.error(f"Error in standard PDF extraction: {e}")
        text = ""

    # If standard extraction failed or returned minimal text, try OCR
    if OCR_AVAILABLE:
        logger.info("Standard extraction returned minimal text, attempting OCR...")
        try:
            # Convert PDF pages to images (pass poppler_path on Windows)
            if POPPLER_PATH:
                images = convert_from_bytes(file_content, dpi=200, poppler_path=POPPLER_PATH)
            else:
                images = convert_from_bytes(file_content, dpi=200)

            ocr_text = ""
            for i, image in enumerate(images):
                page_text = pytesseract.image_to_string(image)
                if page_text:
                    ocr_text += page_text + "\n"

            ocr_text = ocr_text.strip()

            if len(ocr_text) > 50:
                warning = "Text extracted using OCR (image-based PDF)"
                return ocr_text, warning
            else:
                warning = "Could not extract text from PDF (may be encrypted or corrupted)"
                return "", warning

        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            warning = f"OCR failed: {str(e)}"
            return text if text else "", warning
    else:
        # OCR not available
        if len(text) < 50:
            warning = "Image-based PDF detected but OCR is not available. Install Tesseract OCR to process this file."
            return "", warning

    return text, warning


def extract_text_simple(file_content: bytes) -> str:
    """
    Simple extraction that returns just the text (for backwards compatibility).
    """
    text, _ = extract_text_from_pdf(file_content)
    return text
