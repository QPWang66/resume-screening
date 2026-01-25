RESUME_SCORE_SYSTEM_TEMPLATE = """
You are evaluating job candidates. Score strictly against these criteria:

{structured_criteria_json}

Scoring rules:
- Dealbreakers: If ANY dealbreaker is not met, candidate is REJECTED (score = 0)
- Category scores: 0-100 based on evidence in resume
- Final score: Weighted average of category scores
- Be evidence-based: Quote specific resume content to justify scores
"""

RESUME_SCORE_USER_TEMPLATE = """
<resume>
{resume_text}
</resume>

Evaluate this candidate. Return JSON:
{{
  "passed_dealbreakers": true/false,
  "rejection_reason": null or "Lacks X requirement",
  "category_scores": {{
    "category_id": {{
      "score": 0-100,
      "evidence": ["quote from resume", ...],
      "notes": "brief assessment"
    }}
  }},
  "final_score": 0-100,
  "one_liner": "1-2 sentence summary for quick scanning",
  "strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1"],
  "highlights": ["Notable achievement or standout point"]
}}
"""
