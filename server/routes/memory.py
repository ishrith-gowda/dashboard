"""
Memory insights endpoint — surfaces Supermemory data for frontend.
"""

import logging
from fastapi import APIRouter

from shared.models import APIResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/insights/{mrn}")
async def get_memory_insights(
    mrn: str,
    payer: str = "",
    medication: str = "",
    diagnosis: str = "",
) -> APIResponse:
    """Return aggregated memory insights for a patient/PA case."""
    from tools.memory_client import get_memory_insights

    insights = get_memory_insights(
        mrn=mrn,
        payer=payer,
        medication=medication,
        diagnosis=diagnosis,
    )

    return APIResponse(
        success=True,
        message="Memory insights retrieved",
        data=insights,
    )
