# ResumeRank AI - Product Requirements Document v2

## 1. Product Philosophy

**Core Principle:** HR should feel like they're having a conversation with a smart assistant, not operating software.

**What HR sees:** Simple uploads, natural conversations, beautiful results  
**What happens behind the scenes:** Structured criteria generation, batch LLM calls, intelligent scoring

---

## 2. Simplified User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: UPLOAD                                                     │
│  ─────────────────                                                  │
│  • Drag & drop resume folder (or select multiple files)             │
│  • Upload/paste job description                                     │
│  • Enter: "Keep top ___ candidates"                                 │
│  • Optional: Add any specific notes/requirements                    │
│                                                                     │
│  [Start Screening →]                                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: REFINE CRITERIA (Conversational)                           │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Based on this job description, here's what I'll            │   │
│  │  look for in candidates:                                    │   │
│  │                                                              │   │
│  │  📋 MUST HAVE (Dealbreakers)                                │   │
│  │  • 5+ years of experience in machine learning               │   │
│  │  • Proficiency in Python                                    │   │
│  │                                                              │   │
│  │  ⭐ HIGHLY VALUED (35% weight)                              │   │
│  │  • Deep learning frameworks (PyTorch, TensorFlow)           │   │
│  │  • Production ML system experience                          │   │
│  │                                                              │   │
│  │  📌 NICE TO HAVE (15% weight)                               │   │
│  │  • Published research or patents                            │   │
│  │  • Leadership experience                                    │   │
│  │                                                              │   │
│  │  Does this look right? You can tell me to adjust anything.  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  HR can type:                                                       │
│  • "Make AWS experience a must-have"                                │
│  • "Leadership should be more important, maybe 25%"                 │
│  • "Don't care about published research"                            │
│  • Or paste their own criteria text                                 │
│                                                                     │
│  [Looks good, screen the resumes →]                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: PROCESSING (Loading State)                                 │
│  ─────────────────────────────────                                  │
│                                                                     │
│  ████████████░░░░░░░░░░░░░░░░░░  45/150 resumes                    │
│                                                                     │
│  Currently reviewing: sarah_chen_resume.pdf                         │
│  ✓ 12 strong candidates found so far                               │
│  ✗ 8 didn't meet minimum requirements                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: RESULTS DASHBOARD                                          │
│  ─────────────────────────────                                      │
│                                                                     │
│  🏆 YOUR TOP 20 CANDIDATES                      [Export CSV]        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ #1  Sarah Chen                              Score: 94/100   │   │
│  │     ████████████████████████████████████░░░                 │   │
│  │     "10 years ML experience at Google and Meta.             │   │
│  │      Strong PyTorch expertise, led team of 5."              │   │
│  │     ⭐ Technical  ⭐ Leadership  ⭐ Experience               │   │
│  │                                          [View Details]     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  QUICK FILTERS:  [All] [Must-haves only] [Hidden gems 🔍]          │
│                                                                     │
│  📊 INSIGHTS                                                       │
│  • Average experience: 6.2 years                                   │
│  • 65% have Python + PyTorch combo                                 │
│  • Top skill gap: Only 3 candidates have AWS experience            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Architecture (Hidden from HR)

### 3.1 Data Flow

```
User Input                    Internal Processing                  Output
─────────────────────────────────────────────────────────────────────────────

Resume PDFs ──────┐
                  │
Job Description ──┼──→ [Text Extraction] ──→ [Criteria Gen] ──→ Human-readable
                  │           │                    │             criteria text
Keep N ───────────┤           │                    │
                  │           ↓                    ↓
Notes ────────────┘    Raw text stored      Structured JSON
                                            (internal only)
                                                   │
                                                   ↓
                       ┌───────────────────────────────────────┐
                       │         CRITERIA REFINEMENT           │
                       │  • HR feedback → LLM interprets       │
                       │  • Updates internal JSON              │
                       │  • Regenerates human-readable view    │
                       └───────────────────────────────────────┘
                                                   │
                                                   ↓  [HR clicks "Screen"]
                       ┌───────────────────────────────────────┐
                       │         BATCH SCORING ENGINE          │
                       │  • Prompt cache criteria (1x)         │
                       │  • Score each resume (parallel)       │
                       │  • Store results + reasoning          │
                       └───────────────────────────────────────┘
                                                   │
                                                   ↓
                       ┌───────────────────────────────────────┐
                       │         RESULTS AGGREGATION           │
                       │  • Rank by weighted score             │
                       │  • Generate insights/stats            │
                       │  • Format for display                 │
                       └───────────────────────────────────────┘
```

### 3.2 Internal Criteria Structure

HR sees this (human-readable):
```
📋 MUST HAVE (Dealbreakers)
• 5+ years of experience in machine learning
• Proficiency in Python
```

System stores this (structured JSON):
```json
{
  "version": 2,
  "categories": [
    {
      "id": "dealbreakers",
      "display_name": "Must Have",
      "emoji": "📋",
      "weight": null,
      "is_dealbreaker": true,
      "items": [
        {"text": "5+ years of experience in machine learning", "key": "ml_experience_5yr"},
        {"text": "Proficiency in Python", "key": "python_proficiency"}
      ]
    },
    {
      "id": "highly_valued",
      "display_name": "Highly Valued",
      "emoji": "⭐",
      "weight": 0.35,
      "is_dealbreaker": false,
      "items": [...]
    }
  ]
}
```

---

## 4. API Design (Simplified)

### Endpoints

```
POST /api/screening/start
  Body: { job_description, keep_count, notes? }
  Response: { session_id, criteria_draft (human readable), criteria_json (internal) }

POST /api/screening/{session_id}/upload
  Body: FormData with resume files
  Response: { uploaded_count, failed_files[] }

POST /api/screening/{session_id}/criteria/refine
  Body: { feedback: "Make AWS a must-have" } OR { paste_criteria: "..." }
  Response: { criteria_draft (updated), criteria_json (updated) }

POST /api/screening/{session_id}/criteria/confirm
  Response: { status: "locked" }

POST /api/screening/{session_id}/process
  Response: SSE stream with progress updates
  
GET /api/screening/{session_id}/results
  Response: { candidates[], insights{}, stats{} }

GET /api/screening/{session_id}/candidate/{id}
  Response: { detailed evaluation, resume highlights, reasoning }

POST /api/screening/{session_id}/export
  Response: CSV file download
```

### Session-Based Design

Why sessions instead of separate job/criteria/candidate entities?
- **Simpler mental model:** One screening = one session
- **Stateful conversation:** Criteria refinement feels like a chat
- **Easy cleanup:** Delete session = delete everything
- **No orphaned data:** Resumes tied to specific screening context

---

## 5. LLM Prompts

### 5.1 Criteria Generation (JD → Human-Readable + JSON)

```
You are an expert recruiter helping HR screen resumes. Analyze this job description and create evaluation criteria.

<job_description>
{{JD_TEXT}}
</job_description>

<hr_notes>
{{OPTIONAL_NOTES}}
</hr_notes>

Generate TWO outputs:

1. HUMAN_READABLE: A friendly, scannable criteria summary using this format:
   📋 MUST HAVE (Dealbreakers)
   • [requirement 1]
   • [requirement 2]
   
   ⭐ HIGHLY VALUED ([X]% weight)
   • [requirement 1]
   
   📌 NICE TO HAVE ([X]% weight)
   • [requirement 1]
   
   End with: "Does this look right? You can tell me to adjust anything."

2. STRUCTURED_JSON: Machine-readable version following this schema:
   {schema}

Important:
- Be specific and measurable where possible
- Dealbreakers should be true hard requirements (not "nice to haves" disguised)
- Weights for non-dealbreaker categories must sum to 1.0
- Max 3 dealbreakers, max 5 items per category

Return as JSON: {"human_readable": "...", "structured": {...}}
```

### 5.2 Criteria Refinement (Conversational)

```
You are helping HR refine their candidate evaluation criteria.

Current criteria:
<human_readable>
{{CURRENT_HUMAN_READABLE}}
</human_readable>

<structured>
{{CURRENT_JSON}}
</structured>

HR's feedback:
{{HR_MESSAGE}}

Update both the human-readable and structured versions to reflect this change.
- Keep the same format and tone
- Only change what HR asked for
- If unclear, make reasonable assumptions and note them

Return: {"human_readable": "...", "structured": {...}, "changes_made": "Brief description"}
```

### 5.3 Resume Scoring (Batch-Optimized)

```
<system_cached>
You are evaluating job candidates. Score strictly against these criteria:

{{STRUCTURED_CRITERIA_JSON}}

Scoring rules:
- Dealbreakers: If ANY dealbreaker is not met, candidate is REJECTED (score = 0)
- Category scores: 0-100 based on evidence in resume
- Final score: Weighted average of category scores
- Be evidence-based: Quote specific resume content to justify scores
</system_cached>

<resume>
{{RESUME_TEXT}}
</resume>

Evaluate this candidate. Return JSON:
{
  "passed_dealbreakers": true/false,
  "rejection_reason": null or "Lacks X requirement",
  "category_scores": {
    "category_id": {
      "score": 0-100,
      "evidence": ["quote from resume", ...],
      "notes": "brief assessment"
    }
  },
  "final_score": 0-100,
  "one_liner": "1-2 sentence summary for quick scanning",
  "strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1"],
  "highlights": ["Notable achievement or standout point"]
}
```

---

## 6. Database Schema

```sql
-- Sessions table (one screening = one session)
CREATE TABLE screening_sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'draft',  -- draft, criteria_locked, processing, completed
    
    -- Input
    job_description TEXT NOT NULL,
    keep_count INTEGER NOT NULL,
    hr_notes TEXT,
    
    -- Criteria (versioned for audit trail)
    criteria_human_readable TEXT,
    criteria_json TEXT,
    criteria_version INTEGER DEFAULT 1,
    criteria_locked_at TIMESTAMP,
    
    -- Results aggregates (denormalized for fast display)
    total_resumes INTEGER DEFAULT 0,
    processed_count INTEGER DEFAULT 0,
    qualified_count INTEGER DEFAULT 0,
    
    -- Insights (computed after processing)
    insights_json TEXT
);

-- Conversation history for criteria refinement
CREATE TABLE criteria_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT REFERENCES screening_sessions(id),
    role TEXT,  -- 'user' or 'assistant'
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates (resumes + scores)
CREATE TABLE candidates (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES screening_sessions(id),
    
    -- Resume data
    filename TEXT NOT NULL,
    original_text TEXT,
    parsed_at TIMESTAMP,
    
    -- Evaluation (null until processed)
    passed_dealbreakers BOOLEAN,
    rejection_reason TEXT,
    final_score INTEGER,
    one_liner TEXT,
    category_scores_json TEXT,
    strengths_json TEXT,
    concerns_json TEXT,
    highlights_json TEXT,
    
    processed_at TIMESTAMP
);

-- Index for fast ranked retrieval
CREATE INDEX idx_candidates_ranking ON candidates(session_id, passed_dealbreakers DESC, final_score DESC);
```

---

## 7. Frontend Components

### 7.1 Page Structure

```
/                           → Landing / New Screening
/screening/:id              → Main screening flow (steps 1-4)
/screening/:id/results      → Full results dashboard
/screening/:id/candidate/:cid → Detailed candidate view
```

### 7.2 Key Components

**UploadZone.jsx**
```jsx
// Drag-drop zone for resumes
// Job description textarea with paste support
// Simple number input for "Keep top N"
// Optional notes textarea
// Single "Start Screening" button
```

**CriteriaChat.jsx**
```jsx
// Chat-like interface showing:
//   - AI-generated criteria (formatted nicely)
//   - HR messages
//   - AI responses to refinements
// Input box at bottom
// "Paste your own criteria" option
// "Looks good" confirmation button
```

**ProcessingProgress.jsx**
```jsx
// Progress bar with count
// Current file being processed
// Live stats (qualified found, rejected)
// Estimated time remaining
// Cancel button
```

**ResultsDashboard.jsx**
```jsx
// Top N candidates in cards
// Each card: rank, name, score bar, one-liner, tags
// Quick filter buttons
// Insights panel (collapsible)
// Export button
```

**CandidateDetail.jsx**
```jsx
// Full evaluation breakdown
// Category-by-category scores with evidence
// Strengths/concerns lists
// Original resume viewer (side panel)
// Navigation to prev/next candidate
```

---

## 8. User Experience Details

### 8.1 Criteria Display Formatting

Transform internal JSON to beautiful HTML:

```html
<div class="criteria-section dealbreakers">
  <h3>📋 Must Have <span class="tag">Dealbreakers</span></h3>
  <ul>
    <li>5+ years of experience in machine learning</li>
    <li>Proficiency in Python</li>
  </ul>
</div>

<div class="criteria-section weighted">
  <h3>⭐ Highly Valued <span class="weight">35% of score</span></h3>
  <ul>
    <li>Deep learning frameworks (PyTorch, TensorFlow)</li>
    <li>Production ML system experience</li>
  </ul>
</div>
```

### 8.2 Result Card Design

```
┌────────────────────────────────────────────────────────────┐
│  #1                                                        │
│  ┌──────┐  Sarah Chen                                     │
│  │  SC  │  Senior ML Engineer at Google (10 years exp)    │
│  └──────┘                                                  │
│           ████████████████████████████████████░░  94/100   │
│                                                            │
│  "10 years ML experience at Google and Meta. Led team     │
│   of 5, shipped 3 production models. Strong PyTorch."     │
│                                                            │
│  ⭐ Technical Skills    ⭐ Leadership    ⭐ Experience     │
│                                                            │
│  [View Full Profile]                           [Shortlist] │
└────────────────────────────────────────────────────────────┘
```

### 8.3 Insights Panel

```
📊 POOL INSIGHTS

Experience Distribution          Skill Coverage
┌─────────────────────┐         ┌─────────────────────┐
│ 0-2 yrs  ██ 12%     │         │ Python     ████ 89% │
│ 3-5 yrs  ████ 34%   │         │ PyTorch    ███ 67%  │
│ 5-10 yrs █████ 41%  │         │ AWS        █ 23%    │
│ 10+ yrs  ██ 13%     │         │ Leadership ██ 34%   │
└─────────────────────┘         └─────────────────────┘

⚠️ Gap Alert: Only 23% have AWS experience (you marked this as important)

💡 Hidden Gems: 3 candidates scored lower overall but excelled in 
   technical skills. [Show them]
```

---

## 9. Implementation Phases

### Phase 1: Core Flow (Week 1)
- [ ] Session creation + file upload
- [ ] PDF text extraction  
- [ ] Criteria generation (JD → readable + JSON)
- [ ] Single resume scoring (test the prompt)
- [ ] Basic results display

### Phase 2: Criteria Refinement (Week 2)
- [ ] Conversational criteria editing
- [ ] Paste-your-own criteria support
- [ ] Criteria version history
- [ ] Lock criteria + start processing

### Phase 3: Batch Processing (Week 2-3)
- [ ] Parallel resume processing
- [ ] Progress tracking (SSE)
- [ ] Error handling (failed PDFs)
- [ ] Prompt caching implementation

### Phase 4: Results & Polish (Week 3-4)
- [ ] Results dashboard UI
- [ ] Candidate detail view
- [ ] Insights generation
- [ ] CSV export
- [ ] Mobile responsive

---

## 10. Revised Codebase Structure

```
resume-screener/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── session.py          # ScreeningSession, CriteriaConversation
│   │   │   └── candidate.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── session.py
│   │   │   ├── criteria.py
│   │   │   └── candidate.py
│   │   │
│   │   ├── api/
│   │   │   ├── screening.py        # All session-based endpoints
│   │   │   └── export.py
│   │   │
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   │   ├── client.py       # Anthropic client wrapper
│   │   │   │   ├── criteria.py     # Generation + refinement
│   │   │   │   └── scoring.py      # Resume evaluation
│   │   │   │
│   │   │   ├── pdf_extractor.py
│   │   │   ├── batch_processor.py  # Parallel processing orchestration
│   │   │   └── insights.py         # Stats + insights generation
│   │   │
│   │   └── prompts/
│   │       ├── criteria_gen.py
│   │       ├── criteria_refine.py
│   │       └── resume_score.py
│   │
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Screening.jsx       # Main flow container
│   │   │   └── Results.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── upload/
│   │   │   │   ├── UploadZone.jsx
│   │   │   │   └── FileList.jsx
│   │   │   │
│   │   │   ├── criteria/
│   │   │   │   ├── CriteriaDisplay.jsx
│   │   │   │   ├── CriteriaChat.jsx
│   │   │   │   └── CriteriaPaste.jsx
│   │   │   │
│   │   │   ├── processing/
│   │   │   │   └── ProgressTracker.jsx
│   │   │   │
│   │   │   └── results/
│   │   │       ├── CandidateCard.jsx
│   │   │       ├── CandidateList.jsx
│   │   │       ├── CandidateDetail.jsx
│   │   │       ├── InsightsPanel.jsx
│   │   │       └── FilterBar.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useScreening.js     # Session state management
│   │   │   └── useSSE.js           # Progress streaming
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── data/
│   └── uploads/                    # Temporary resume storage
│
└── README.md
```

---

## 11. Key Differences from v1

| Aspect | v1 (Original) | v2 (Improved) |
|--------|---------------|---------------|
| User flow | Multi-step with separate endpoints | Single session-based flow |
| Criteria editing | JSON upload or NL | Chat-like conversation |
| Criteria display | Structured JSON | Human-readable with emojis |
| Mental model | Jobs → Criteria → Candidates | One screening session |
| Results | Ranked list only | Dashboard + insights |
| Technical exposure | Weights, JSON visible | All hidden behind UX |
| Primary input | Multiple forms | Single upload step |

---

## 12. Success Metrics (Updated)

**Efficiency**
- Time from upload to results: <15 min for 150 resumes
- HR iterations on criteria: ≤3 refinements average

**Usability**  
- HR can complete screening without documentation
- Zero JSON editing required
- Mobile-friendly results viewing

**Quality**
- Top 10 overlap with manual screening: >70%
- HR satisfaction: >4.5/5 on "ease of use"
