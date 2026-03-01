"""
Supermemory integration — persistent memory for PA workflows.

Stores payer-specific patterns, patient PA history, and successful
justification templates. Queries memory before generating justifications
to enrich them with learned context.

Owned by Dev 2.
"""

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

_client = None
_enabled: Optional[bool] = None


def _get_client():
    global _client, _enabled
    if _enabled is False:
        return None
    if _client is not None:
        return _client

    api_key = os.getenv("SUPERMEMORY_API_KEY", "")
    if not api_key:
        _enabled = False
        logger.info("Supermemory disabled — no SUPERMEMORY_API_KEY set")
        return None

    try:
        from supermemory import Supermemory
        _client = Supermemory(api_key=api_key)
        _enabled = True
        return _client
    except ImportError:
        _enabled = False
        logger.warning("supermemory package not installed — memory features disabled")
        return None
    except Exception:
        _enabled = False
        logger.warning("Failed to initialize Supermemory client", exc_info=True)
        return None


def store_pa_outcome(
    mrn: str,
    payer: str,
    medication: str,
    status: str,
    denial_reason: str = "",
    justification: str = "",
) -> bool:
    """Store a PA outcome in Supermemory for future learning.

    Writes to three containers:
      - payer_{name}: payer-specific PA patterns and requirements
      - patient_{mrn}: per-patient longitudinal PA history
      - pa_knowledge: successful justification patterns (approvals only)
    """
    client = _get_client()
    if not client:
        return False

    payer_tag = f"payer_{payer.lower().replace(' ', '_')}"
    patient_tag = f"patient_{mrn}"

    content = (
        f"PA for {medication} submitted to {payer}. "
        f"Outcome: {status}."
    )
    if denial_reason:
        content += f" Denial reason: {denial_reason}."
    if justification:
        content += f" Justification excerpt: {justification[:500]}"

    try:
        client.add(content=content, container_tag=payer_tag)
        client.add(content=content, container_tag=patient_tag)

        if status.lower() == "approved" and justification:
            client.add(
                content=(
                    f"Successful PA justification for {medication} with {payer}: "
                    f"{justification[:500]}"
                ),
                container_tag="pa_knowledge",
            )
        return True
    except Exception:
        logger.warning("Failed to store PA outcome in Supermemory", exc_info=True)
        return False


def get_payer_insights(payer: str, medication: str) -> str:
    """Query Supermemory for payer-specific PA patterns and denial reasons."""
    client = _get_client()
    if not client:
        return ""

    payer_tag = f"payer_{payer.lower().replace(' ', '_')}"

    try:
        results = client.search.memories(
            q=f"PA requirements denial reasons {medication}",
            container_tag=payer_tag,
            search_mode="memories",
        )
        memories = results.get("results", []) if isinstance(results, dict) else []
        return "\n".join(
            m.get("content", "") for m in memories[:3]
        )
    except Exception:
        logger.warning("Failed to query payer insights from Supermemory", exc_info=True)
        return ""


def get_patient_history(mrn: str) -> str:
    """Query Supermemory for a patient's PA history and outcomes."""
    client = _get_client()
    if not client:
        return ""

    try:
        profile = client.profile(
            container_tag=f"patient_{mrn}",
            q="PA outcomes and treatment history",
        )
        static = getattr(profile, "static", "") or ""
        dynamic = getattr(profile, "dynamic", "") or ""
        if hasattr(profile, "profile"):
            p = profile.profile
            static = getattr(p, "static", "") or ""
            dynamic = getattr(p, "dynamic", "") or ""
        parts = [s for s in [static, dynamic] if s]
        return "\n".join(parts) if parts else ""
    except Exception:
        logger.warning("Failed to query patient history from Supermemory", exc_info=True)
        return ""


def get_successful_patterns(medication: str, diagnosis: str) -> str:
    """Query Supermemory for previously successful justification patterns."""
    client = _get_client()
    if not client:
        return ""

    try:
        results = client.search.memories(
            q=f"{medication} {diagnosis} successful justification",
            container_tag="pa_knowledge",
            search_mode="memories",
        )
        memories = results.get("results", []) if isinstance(results, dict) else []
        return "\n".join(
            m.get("content", "") for m in memories[:2]
        )
    except Exception:
        logger.warning("Failed to query successful patterns from Supermemory", exc_info=True)
        return ""


def get_memory_insights(mrn: str, payer: str = "", medication: str = "", diagnosis: str = "") -> dict:
    """Aggregate all memory insights for a patient/PA case. Used by API endpoint."""
    return {
        "payer_insights": get_payer_insights(payer, medication) if payer and medication else "",
        "patient_history": get_patient_history(mrn),
        "successful_patterns": get_successful_patterns(medication, diagnosis) if medication and diagnosis else "",
        "memory_enabled": _enabled is True,
    }
