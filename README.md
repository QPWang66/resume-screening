# ResumeRank AI

AI-powered resume screening tool for HR professionals.

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Anthropic API key

### 1. Setup Environment

```bash
# Create backend/.env file
echo "ANTHROPIC_API_KEY=your-api-key-here" > backend/.env
echo "LLM_PROVIDER=anthropic" >> backend/.env
echo "LLM_MODEL=claude-sonnet-4-20250514" >> backend/.env
```

### 2. Install Dependencies

**Backend (with venv):**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Run

**Terminal 1 - Backend (port 8000):**
```bash
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

### 4. Open

Go to **http://localhost:5173**

---

## Ports

| Service  | Port | URL                      |
|----------|------|--------------------------|
| Backend  | 8000 | http://localhost:8000    |
| Frontend | 5173 | http://localhost:5173    |

API docs: http://localhost:8000/docs

---

## Optional: OCR Support

For image-based PDFs, install Poppler and Tesseract:

**Windows (Chocolatey):**
```bash
choco install poppler tesseract
```

**Mac:**
```bash
brew install poppler tesseract
```

---

## Project Structure

```
backend/     FastAPI + SQLite + LLM integration
frontend/    React + Vite + Tailwind
data/        Uploads and database (gitignored)
```
