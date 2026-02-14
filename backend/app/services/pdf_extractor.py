import pypdf
import io
import logging
import tempfile
import os

logger = logging.getLogger(__name__)

# Check if OCR dependencies are available
try:
    from pdf2image import convert_from_bytes
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    logger.warning("OCR dependencies not installed. Image-based PDFs will not be processed.")


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
            # Convert PDF pages to images
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
