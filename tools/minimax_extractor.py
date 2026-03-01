"""MiniMax PDF extraction orchestration and normalization."""

from __future__ import annotations

import json
from datetime import datetime, UTC
from pathlib import Path
from typing import Any

from tools.minimax_client import MiniMaxClient


OUTPUT_DIR = Path("output") / "minimax"


def extract_pdf_to_pa_fields(pdf_path: Path) -> dict[str, Any]:
    """Extract normalized PA fields from a PDF chart."""
    client = MiniMaxClient()
    file_id = client.upload_file(pdf_path)
    raw_text = client.fetch_file_content(file_id)
    extracted = client.chat_extract_structured(raw_text)
    return _normalize_extraction(extracted, file_id=file_id)


def save_extraction(mrn: str, extraction: dict[str, Any]) -> Path:
    """Persist normalized extraction payload for later prompt enrichment."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / f"{mrn}_extraction.json"
    with path.open("w") as f:
        json.dump(extraction, f, indent=2, default=str)
    return path


def _normalize_extraction(data: dict[str, Any], file_id: str) -> dict[str, Any]:
    def _as_dict(value: Any) -> dict[str, Any]:
        return value if isinstance(value, dict) else {}

    def _as_list(value: Any) -> list[str]:
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []

    patient = _as_dict(data.get("patient"))
    insurance = _as_dict(data.get("insurance"))
    diagnosis = _as_dict(data.get("diagnosis"))
    medication = _as_dict(data.get("medication"))
    provider = _as_dict(data.get("provider"))
    clinical_support = _as_dict(data.get("clinical_support"))
    confidence = _as_dict(data.get("confidence"))

    normalized: dict[str, Any] = {
        "patient": {
            "first_name": str(patient.get("first_name", "")).strip(),
            "last_name": str(patient.get("last_name", "")).strip(),
            "dob": str(patient.get("dob", "")).strip(),
            "gender": str(patient.get("gender", "")).strip(),
        },
        "insurance": {
            "payer": str(insurance.get("payer", "")).strip(),
            "member_id": str(insurance.get("member_id", "")).strip(),
            "bin": str(insurance.get("bin", "")).strip(),
            "pcn": str(insurance.get("pcn", "")).strip(),
            "rx_group": str(insurance.get("rx_group", "")).strip(),
        },
        "diagnosis": {
            "icd10": str(diagnosis.get("icd10", "")).strip(),
            "description": str(diagnosis.get("description", "")).strip(),
        },
        "medication": {
            "name": str(medication.get("name", "")).strip(),
            "dose": str(medication.get("dose", "")).strip(),
            "frequency": str(medication.get("frequency", "")).strip(),
            "quantity": str(medication.get("quantity", "")).strip(),
            "days_supply": str(medication.get("days_supply", "")).strip(),
            "dosage_form": str(medication.get("dosage_form", "")).strip(),
        },
        "provider": {
            "name": str(provider.get("name", "")).strip(),
            "npi": str(provider.get("npi", "")).strip(),
            "phone": str(provider.get("phone", "")).strip(),
            "fax": str(provider.get("fax", "")).strip(),
        },
        "clinical_support": {
            "prior_therapies": _as_list(clinical_support.get("prior_therapies")),
            "labs": clinical_support.get("labs", {}) if isinstance(clinical_support.get("labs"), dict) else {},
            "imaging": clinical_support.get("imaging", {}) if isinstance(clinical_support.get("imaging"), dict) else {},
        },
        "confidence": confidence,
        "missing_fields": _as_list(data.get("missing_fields")),
        "source": {
            "minimax_file_id": file_id,
            "extracted_at": datetime.now(UTC).isoformat(),
        },
    }

    required_paths = [
        "patient.first_name",
        "patient.last_name",
        "patient.dob",
        "insurance.member_id",
        "diagnosis.icd10",
        "provider.npi",
    ]
    missing = set(normalized["missing_fields"])
    for path in required_paths:
        node = normalized
        for segment in path.split("."):
            node = node.get(segment, "")
        if not str(node).strip():
            missing.add(path)
    normalized["missing_fields"] = sorted(missing)
    return normalized
