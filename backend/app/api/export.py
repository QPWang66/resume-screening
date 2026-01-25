from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import csv
import io

router = APIRouter(prefix="/screening", tags=["export"])

@router.get("/{session_id}/export")
async def export_results(session_id: str):
    # Dummy implementation for now
    csv_stream = io.StringIO()
    writer = csv.writer(csv_stream)
    writer.writerow(["Rank", "Name", "Score", "One Liner"])
    writer.writerow(["1", "Jane Doe", "95", "Great fit"])
    
    response = StreamingResponse(iter([csv_stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=results.csv"
    return response
