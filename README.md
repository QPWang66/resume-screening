# ResumeRank AI

ResumeRank AI is an intelligent resume screening tool designed to help HR professionals filter candidates using natural language conversations and automated scoring.

## Structure

- `backend/`: FastAPI application handling the API, database, and LLM integration.
- `frontend/`: React application for the user interface.
- `data/`: Local storage for uploaded files key data (sqlite).

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
