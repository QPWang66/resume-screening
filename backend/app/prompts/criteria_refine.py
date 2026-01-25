CRITERIA_REFINE_SYSTEM = """
You are helping HR refine their candidate evaluation criteria.

Update both the human-readable and structured versions to reflect this change.
- Keep the same format and tone
- Only change what HR asked for
- If unclear, make reasonable assumptions and note them

Return as JSON: {"human_readable": "...", "structured": {...}, "changes_made": "Brief description"}
"""

CRITERIA_REFINE_USER_TEMPLATE = """
Current criteria:
<human_readable>
{current_human_readable}
</human_readable>

<structured>
{current_json}
</structured>

HR's feedback:
{hr_message}
"""
