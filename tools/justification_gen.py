"""
Clinical justification narrative generator.

Builds medical necessity narratives from structured chart data
for PA form submissions. Enriches narratives with Supermemory
context (payer patterns, patient history, successful templates).

Owned by Dev 3.
"""

import logging

from shared.models import PatientChart

logger = logging.getLogger(__name__)


def _get_memory_context(chart: PatientChart) -> dict:
    """Query Supermemory for context to enrich the justification."""
    from tools.memory_client import get_payer_insights, get_patient_history, get_successful_patterns

    payer = chart.insurance.payer
    medication = chart.medication.name if chart.medication else ""
    diagnosis = chart.diagnosis.description

    return {
        "payer_insights": get_payer_insights(payer, medication) if medication else "",
        "patient_history": get_patient_history(chart.patient.mrn),
        "successful_patterns": get_successful_patterns(medication, diagnosis) if medication else "",
    }


def generate_justification(chart: PatientChart) -> str:
    """Generate a clinical justification narrative from patient chart data.

    Queries Supermemory for payer-specific requirements, patient PA history,
    and previously successful justification patterns to produce stronger narratives.
    """
    # Determine what we're requesting PA for
    if chart.medication:
        therapy = f"{chart.medication.name} {chart.medication.dose} {chart.medication.frequency}"
    elif chart.procedure:
        therapy = f"{chart.procedure.description} (CPT {chart.procedure.cpt})"
    else:
        therapy = "the requested therapy"

    # Build prior therapy summary
    prior_summary = "; ".join(chart.prior_therapies) if chart.prior_therapies else "None documented"

    # Build lab summary
    lab_summary = ", ".join(
        f"{k}: {v}" for k, v in chart.labs.items()
    ) if chart.labs else "None available"

    # Build imaging summary
    imaging_summary = ", ".join(
        f"{k}: {v}" for k, v in chart.imaging.items()
    ) if chart.imaging else "None available"

    # Query Supermemory for learned context
    memory = _get_memory_context(chart)
    memory_section = ""
    if any(memory.values()):
        parts = []
        if memory["payer_insights"]:
            parts.append(f"Payer-specific considerations ({chart.insurance.payer}):\n{memory['payer_insights']}")
        if memory["patient_history"]:
            parts.append(f"Patient PA history:\n{memory['patient_history']}")
        if memory["successful_patterns"]:
            parts.append(f"Evidence-based justification patterns:\n{memory['successful_patterns']}")
        if parts:
            memory_section = "\n\nLEARNED CONTEXT (from prior PA outcomes):\n\n" + "\n\n".join(parts)

    narrative = f"""Clinical Justification for Prior Authorization

Patient: {chart.patient.name}, DOB: {chart.patient.dob}
Diagnosis: {chart.diagnosis.icd10} — {chart.diagnosis.description}
Requested Therapy: {therapy}

MEDICAL NECESSITY:

The patient presents with {chart.diagnosis.description} ({chart.diagnosis.icd10}). \
The following conservative therapies have been attempted and have failed to provide \
adequate clinical response or were discontinued due to adverse effects:

{prior_summary}

SUPPORTING CLINICAL EVIDENCE:

Laboratory findings: {lab_summary}

Imaging findings: {imaging_summary}{memory_section}

CONCLUSION:

Based on the patient's documented treatment history, objective clinical findings, \
and current clinical guidelines, {therapy} is medically necessary as the next \
appropriate step in the treatment algorithm. The patient meets all payer criteria \
for this therapy, having demonstrated inadequate response to or intolerance of \
conventional treatment options.

Prescribing Provider: {chart.provider.name}, NPI: {chart.provider.npi}
Practice: {chart.provider.practice}
Contact: {chart.provider.phone} / Fax: {chart.provider.fax}"""

    return narrative
