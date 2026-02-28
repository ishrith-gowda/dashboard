# 🏥 Prior Authorization Agent — Hackathon Build Plan v2

## 24-Hour Sprint: Technical Specification & Task Breakdown

---

## 1. Project Overview

**Problem:** Prior authorization (PA) costs US healthcare ~$35B/year in admin overhead and burns the equivalent of 100K+ full-time nurses. 93% of physicians say it delays care.

**Solution:** A Browser Use–powered agent that autonomously navigates **real payer portals and clearinghouse test environments**, scrapes medical policy documents, extracts required documentation criteria, builds PA packet checklists, pre-fills web forms, and monitors submission status — all driven by natural language instructions and mock EMR data.

**Core Framework:** [Browser Use](https://docs.browser-use.com) (Python, async, Playwright-based browser automation with LLM decision-making)

---

## 2. Real Test Environments (Major Advantage)

Instead of only building mock portals, we have access to **three real healthcare platforms** with test/sandbox modes. This makes our demo dramatically more credible to judges.

### 2a. CoverMyMeds (Primary PA Portal) ⭐ **We Have an Account**

CoverMyMeds is **the** industry-standard PA platform, used by 950,000+ providers nationwide. Our agent will drive the actual CoverMyMeds web portal.

**What our agent can do here:**
- Log into the real CoverMyMeds portal at `covermymeds.health`
- Click "New Request" → enter medication name, patient demographics, BIN/PCN/RxGroup
- Select the correct PA form from the list that populates
- Fill out the prior authorization form fields (diagnosis, prior therapies, clinical justification)
- Monitor the dashboard for PA determination status (approved/denied/pending)
- Handle pharmacy-initiated PAs via the "Enter Key" flow at `key.covermymeds.com`

**Why this is gold:** CoverMyMeds returns real-time determinations for many plans. Our agent fills forms 3x faster than phone/fax, directly matching their own marketing claim. Judges can see the agent navigating a portal that 950K providers already use daily.

**Agent interaction flow:**
```
Login → "New Request" → Enter medication + patient info + BIN/PCN/RxGroup
→ Select form from list → Fill clinical questions → "Send to Plan"
→ Monitor dashboard for determination → Alert on result
```

### 2b. Claim.MD (Eligibility + Claims Test Account)

Claim.MD provides a dedicated test account that simulates claim and eligibility responses, returning sample data regardless of input. The test account generates rejections or denials based on specific member ID values.

**What our agent can do here:**
- Navigate the Claim.MD web portal for payer selection and patient entry
- Run eligibility checks to verify coverage before submitting PA
- Submit test claims and receive simulated ACK/rejection/denial responses
- Parse response codes (status "A" for acknowledged, rejection reasons, etc.)
- Practice the full clearinghouse workflow: submit → poll for status → handle responses

**Test account behavior:**
- Generates rejections/denials based on the insured ID or policy number entered
- Returns sample eligibility data for any input
- Simulates the full claims lifecycle (submit → acknowledge → status → remittance)

**Agent interaction flow:**
```
Login to test portal → Select payer → Enter patient data
→ Run eligibility check → Parse coverage response
→ If PA required: flag and hand off to CoverMyMeds agent
→ Monitor claim status via /response/ polling
```

### 2c. Stedi (Healthcare Transaction Test Mode)

Stedi provides a healthcare transaction platform with a free Test Mode that simulates eligibility checks without sending data to payers or incurring charges.

**What our agent can do here:**
- Toggle "Test mode" ON in the Stedi portal
- Submit mock real-time eligibility checks (270/271 transactions)
- Choose from predefined mock requests for well-known payers (Aetna, UnitedHealthcare, BCBS, CMS/Medicare)
- Parse realistic mock benefits responses: copays, deductibles, coverage status, active coverage
- Run Medicare Beneficiary Identifier (MBI) lookups with mock SSNs
- Test the "Stedi Agent" flow (auto-resolves eligibility errors — great for demo)

**Mock data available:**
- Predefined subscriber names, DOBs, member IDs for each payer
- Realistic benefits responses including copays, deductibles, out-of-pocket maximums
- Mock MBI lookups for CMS/Medicare scenarios
- Error simulation (AAA error 73 for Stedi Agent demo)

**Agent interaction flow:**
```
Toggle Test Mode ON → "New eligibility check" → Select payer
→ Enter mock patient data → Submit → Parse benefits response
→ Extract: coverage status, copay, deductible, PA requirements
→ Feed PA requirement data into CoverMyMeds agent
```

### 2d. Mock Payer Portal (Fallback / Custom Scenarios)

We still build a lightweight mock portal for scenarios not covered by the real platforms (e.g., medical/surgical PA for imaging, custom CPT-based policy scraping).

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      USER INTERFACE                       │
│              (React SPA / Next.js on Vercel)              │
│   - Paste mock chart data    - View PA checklist          │
│   - Select CPT/drug code     - Download PA packet PDF     │
│   - Monitor submission status across all portals          │
└──────────────────┬───────────────────────────────────────┘
                   │ REST / WebSocket
┌──────────────────▼───────────────────────────────────────┐
│                  ORCHESTRATION SERVER                      │
│              (FastAPI on Daytona sandbox)                  │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Task Router  │  │  Status DB   │  │  Notification   │  │
│  │ (dispatch    │  │  (Convex or  │  │  Service        │  │
│  │  BU agents)  │  │   MongoDB)   │  │  (Agentmail)    │  │
│  └──────┬──────┘  └──────────────┘  └─────────────────┘  │
└─────────┼────────────────────────────────────────────────┘
          │
┌─────────▼────────────────────────────────────────────────┐
│              BROWSER USE AGENT LAYER                       │
│                                                           │
│  Agent 1: Eligibility Checker                             │
│    → Stedi test mode: verify coverage, extract benefits   │
│    → Claim.MD test account: eligibility + payer selection  │
│    → Determine if PA is required for requested service    │
│                                                           │
│  Agent 2: PA Form Filler (CoverMyMeds)                    │
│    → Log into CoverMyMeds portal                          │
│    → "New Request" → fill medication + patient + plan info │
│    → Complete PA form with clinical justification          │
│    → Submit to plan electronically                        │
│                                                           │
│  Agent 3: Status Monitor                                  │
│    → Poll CoverMyMeds dashboard for determinations        │
│    → Poll Claim.MD for claim status updates               │
│    → Alert if pending > N days or denied                  │
│                                                           │
│  Browser: Browser(use_cloud=True) or local headless       │
│  LLM:     ChatBrowserUse (primary) / Claude fallback      │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Tech Stack (Sponsor Alignment)

| Layer | Technology | Sponsor | Why |
|---|---|---|---|
| **Web Agent** | Browser Use SDK | Browser Use ✅ (required) | Core agent framework |
| **LLM** | ChatBrowserUse + Anthropic Claude | Browser Use + Anthropic | BU for browsing, Claude for document analysis |
| **Frontend** | Next.js / React | Vercel V0 | Rapid UI prototyping |
| **Database** | Convex | Convex | Real-time subscriptions for status updates |
| **Sandbox/Infra** | Daytona | Daytona | Isolated dev environments, safe browser exec |
| **Agent Email** | Agentmail | Agentmail | Send PA status alerts to clinic staff |
| **Observability** | Laminar or HUD | Laminar / HUD | Trace agent steps, debug failures |
| **Memory** | Supermemory | Supermemory | Cache extracted policy rules across runs |

---

## 5. Mock EMR Data (No PHI)

Pre-built patient chart snippets that map to the test environments:

```json
{
  "patient": {
    "name": "Jane Doe",
    "dob": "1985-03-15",
    "mrn": "MRN-00421",
    "last_name": "Doe",
    "first_name": "Jane"
  },
  "insurance": {
    "payer": "Aetna",
    "member_id": "W123456789",
    "bin": "004336",
    "pcn": "ADV",
    "rx_group": "RX1234",
    "plan_name": "Aetna Choice POS II"
  },
  "diagnosis": {
    "icd10": "M54.5",
    "description": "Low back pain"
  },
  "medication": {
    "name": "Humira",
    "ndc": "00074-4339-02",
    "dose": "40mg",
    "frequency": "Every 2 weeks"
  },
  "procedure": {
    "cpt": "72148",
    "description": "MRI lumbar spine w/o contrast"
  },
  "prior_therapies": [
    "Physical therapy x6 weeks (completed 2025-12-01)",
    "Ibuprofen 800mg TID x4 weeks",
    "Methylprednisolone dose pack (completed 2025-11-15)"
  ],
  "labs": {
    "CBC": "normal (2026-01-10)",
    "ESR": "12 mm/hr (2026-01-10)",
    "CRP": "0.8 mg/dL (2026-01-10)",
    "TB_test": "negative (2026-01-05)"
  },
  "imaging": {
    "xray_lumbar": "degenerative changes L4-L5 (2025-10-20)"
  },
  "provider": {
    "name": "Dr. Sarah Smith",
    "npi": "1234567890",
    "practice": "Metro Health Clinic",
    "phone": "555-0100",
    "fax": "555-0101"
  }
}
```

We create 3–5 chart fixtures covering different scenarios: medication PA (Humira), imaging PA (MRI), surgical PA (knee replacement), and a denial/appeal scenario.

---

## 6. Sprint Timeline (24 Hours)

### Phase 0 — Setup & Environment Access (Hours 0–2)

| Task | Owner | Details |
|---|---|---|
| **T0.1** Repo init + env setup | All | `uv venv --python 3.12`, `uv pip install browser-use`, `.env` with `BROWSER_USE_API_KEY` |
| **T0.2** Verify CoverMyMeds login | Agent dev | Confirm account access, walk through manual PA flow once, note form field names |
| **T0.3** Set up Claim.MD test account | Agent dev | Create test account, generate API key, explore portal UI |
| **T0.4** Set up Stedi test mode | Agent dev | Create account, toggle Test Mode ON, run one mock eligibility check manually |
| **T0.5** Mock EMR data fixtures | Backend dev | 3–5 JSON patient chart files with insurance info matching test payer IDs |
| **T0.6** Convex/MongoDB schema | Backend dev | Collections: `pa_requests`, `eligibility_checks`, `agent_runs`, `alerts` |
| **T0.7** Build fallback mock portal | Frontend dev | Simple Next.js app for medical/surgical PA scenarios not on CoverMyMeds |

**Deadline: Hour 2 — All portal access verified, env configured, data fixtures ready.**

---

### Phase 1 — Agent 1: Eligibility Checker (Hours 2–8)

**Goal:** Agent navigates Stedi (test mode) and/or Claim.MD (test account) to verify patient coverage and determine if PA is required.

```python
# agents/eligibility_checker.py
from browser_use import Agent, Browser, ChatBrowserUse, Tools, ActionResult
from dotenv import load_dotenv
import asyncio, json

load_dotenv()

tools = Tools()

@tools.action("Load patient chart and insurance data")
async def load_patient(mrn: str) -> ActionResult:
    with open(f"data/charts/{mrn}.json") as f:
        chart = json.load(f)
    return ActionResult(
        extracted_content=json.dumps(chart, indent=2),
        long_term_memory=(
            f"Patient: {chart['patient']['name']}, "
            f"DOB: {chart['patient']['dob']}, "
            f"Payer: {chart['insurance']['payer']}, "
            f"Member ID: {chart['insurance']['member_id']}"
        ),
    )

@tools.action("Save eligibility result to database")
async def save_eligibility(mrn: str, result: str) -> ActionResult:
    data = {"mrn": mrn, "eligibility": result}
    with open(f"output/eligibility_{mrn}.json", "w") as f:
        json.dump(data, f, indent=2)
    return ActionResult(
        extracted_content=f"Eligibility saved for {mrn}",
        is_done=True,
        success=True,
    )

async def check_eligibility_stedi(mrn: str):
    """Use Stedi test mode to check eligibility via their web UI."""
    browser = Browser(headless=False)

    agent = Agent(
        task=f"""
        You are a healthcare eligibility verification assistant.

        1. Use load_patient action with MRN "{mrn}" to get patient and insurance data.
        2. Navigate to https://www.stedi.com and log in.
        3. Make sure "Test mode" is toggled ON (look for the toggle in the UI).
        4. Click to create a new eligibility check.
        5. Select the payer that matches the patient's insurance.
        6. Fill in the provider information:
           - Use the provider name and NPI from the patient chart.
        7. Fill in the subscriber/patient information:
           - Use the patient name, DOB, and member ID from the chart.
           - NOTE: In test mode, use the predefined mock values if the payer
             requires specific test data. Otherwise use the chart data.
        8. Submit the eligibility check.
        9. Wait for the response and extract:
           - Coverage status (active/inactive)
           - Copay amounts
           - Deductible information
           - Whether prior authorization is required for the service
           - Any service-specific restrictions
        10. Use save_eligibility action with the extracted information.
        """,
        llm=ChatBrowserUse(),
        browser=browser,
        tools=tools,
        use_vision=True,
        max_actions_per_step=3,
    )

    history = await agent.run(max_steps=25)
    return history.final_result()


async def check_eligibility_claimmd(mrn: str):
    """Use Claim.MD test account for eligibility check."""
    browser = Browser(headless=False)

    agent = Agent(
        task=f"""
        You are a healthcare eligibility verification assistant.

        1. Use load_patient action with MRN "{mrn}" to get patient and insurance data.
        2. Navigate to https://www.claim.md and log in with the test account
           credentials (username and password from environment).
        3. Navigate to the eligibility check section.
        4. Select the appropriate payer from the payer list.
        5. Enter the patient's subscriber/member information.
        6. Submit the eligibility request.
        7. Parse the response — the test account will return simulated data.
           Look for:
           - Coverage confirmation
           - Benefit details
           - Any PA requirements flagged
           - Rejection codes (if member ID triggers a denial)
        8. Use save_eligibility action with the parsed response data.

        NOTE: The Claim.MD test account generates rejections/denials based on
        the insured ID value. Different member IDs produce different responses.
        """,
        llm=ChatBrowserUse(),
        browser=browser,
        tools=tools,
        use_vision=True,
        max_actions_per_step=3,
    )

    history = await agent.run(max_steps=25)
    return history.final_result()
```

| Task | Details |
|---|---|
| **T1.1** Implement Stedi eligibility agent | Navigate test mode UI, fill eligibility form, parse benefits |
| **T1.2** Implement Claim.MD eligibility agent | Navigate test portal, run eligibility, parse response codes |
| **T1.3** Eligibility result parser tool | Custom `@tools.action` to structure raw eligibility into JSON |
| **T1.4** PA-required detector | Logic to determine from eligibility response if PA is needed |
| **T1.5** Test with 3+ payer scenarios | Verify against Aetna, BCBS, Medicare mock data in Stedi |
| **T1.6** Store results in Convex | Write eligibility results + PA flag to database |

**Deadline: Hour 8 — Eligibility checker works against at least one real test platform.**

---

### Phase 2 — Agent 2: CoverMyMeds PA Form Filler (Hours 8–16) ⭐ Core Demo

**Goal:** Agent logs into CoverMyMeds, starts a new PA request, fills the form with chart data, writes clinical justification, and submits.

```python
# agents/pa_form_filler.py
from browser_use import Agent, Browser, ChatBrowserUse, Tools, ActionResult
from dotenv import load_dotenv
import asyncio, json

load_dotenv()

tools = Tools()

@tools.action("Load patient chart data for PA submission")
async def load_chart(mrn: str) -> ActionResult:
    with open(f"data/charts/{mrn}.json") as f:
        chart = json.load(f)
    return ActionResult(
        extracted_content=json.dumps(chart, indent=2),
        long_term_memory=(
            f"Patient: {chart['patient']['name']}, "
            f"DOB: {chart['patient']['dob']}, "
            f"Medication: {chart['medication']['name']} {chart['medication']['dose']}, "
            f"Diagnosis: {chart['diagnosis']['icd10']} - {chart['diagnosis']['description']}, "
            f"BIN: {chart['insurance']['bin']}, PCN: {chart['insurance']['pcn']}, "
            f"RxGroup: {chart['insurance']['rx_group']}"
        ),
    )

@tools.action("Load eligibility results to check PA requirements")
async def load_eligibility(mrn: str) -> ActionResult:
    try:
        with open(f"output/eligibility_{mrn}.json") as f:
            elig = json.load(f)
        return ActionResult(extracted_content=json.dumps(elig, indent=2))
    except FileNotFoundError:
        return ActionResult(
            extracted_content="No eligibility data found — proceed with PA anyway",
        )

@tools.action("Generate clinical justification narrative")
async def generate_justification(
    diagnosis: str,
    medication: str,
    prior_therapies: str,
    labs: str,
) -> ActionResult:
    """Build a medical necessity narrative from structured chart data."""
    narrative = (
        f"Clinical Justification for Prior Authorization\n\n"
        f"Patient presents with {diagnosis}. "
        f"The following conservative therapies have been attempted and failed "
        f"to provide adequate relief: {prior_therapies}. "
        f"Relevant laboratory findings include: {labs}. "
        f"Based on clinical guidelines and the patient's treatment history, "
        f"{medication} is medically necessary as the next appropriate step in "
        f"the treatment algorithm. The patient meets all payer criteria for "
        f"this therapy."
    )
    return ActionResult(
        extracted_content=narrative,
        long_term_memory="Clinical justification has been generated",
    )

@tools.action("Record what fields were filled and any gaps found")
async def record_submission(mrn: str, summary: str) -> ActionResult:
    with open(f"output/pa_submission_{mrn}.json", "w") as f:
        json.dump({"mrn": mrn, "summary": summary}, f, indent=2)
    return ActionResult(
        extracted_content=f"PA submission recorded for {mrn}",
        is_done=True,
        success=True,
    )

async def fill_covermymeds_pa(mrn: str):
    """
    Drive the real CoverMyMeds portal to submit a prior authorization.
    """
    browser = Browser(
        headless=False,
        # Use cloud browser for reliability with real portal
        # use_cloud=True,
    )

    agent = Agent(
        task=f"""
        You are a prior authorization specialist. Your job is to submit a PA
        request through the CoverMyMeds portal.

        STEP-BY-STEP INSTRUCTIONS:

        1. Use load_chart action with MRN "{mrn}" to get all patient data.
        2. Use load_eligibility action with MRN "{mrn}" to check prior
           eligibility results.

        3. Navigate to https://www.covermymeds.health and log in with our
           clinic credentials.

        4. On the dashboard, click "New Request" (top left corner).

        5. Enter the MEDICATION name from the chart data.

        6. Enter patient demographic information:
           - Patient first name, last name, date of birth
           - BIN, PCN, and RxGroup from the insurance section of the chart

        7. A list of matching PA forms will populate. Choose the most
           appropriate form for this medication and plan, then click
           "Start Request."

        8. Fill in ALL required fields on the PA form:
           - Patient demographics (name, DOB, address, phone)
           - Prescriber/provider information (name, NPI, practice, phone, fax)
           - Diagnosis (ICD-10 code and description)
           - Medication details (name, dose, frequency, NDC if asked)
           - Duration of therapy requested

        9. For clinical questions on the form:
           - Use generate_justification action to create a clinical narrative
           - Reference specific prior therapies with dates
           - Reference specific lab values with dates
           - Reference imaging results if relevant
           - Answer each clinical question using evidence from the chart

        10. Before submitting, review all fields for accuracy.

        11. Click "Send to Plan" to electronically submit the PA request.
            (If this is a demo and we don't want to actually submit, use the
            done action instead and report what was filled.)

        12. Use record_submission action to log what was done.

        IMPORTANT NOTES:
        - If any required information is MISSING from the chart, note it as
          "GAP: [field name] — need from provider" in your submission record.
        - If the form has questions you cannot answer from the chart data,
          flag them clearly.
        - Be thorough with clinical justification — this is what gets PAs
          approved.
        """,
        llm=ChatBrowserUse(),
        browser=browser,
        tools=tools,
        use_vision=True,
        max_actions_per_step=3,
        generate_gif=True,  # Record for demo!
    )

    history = await agent.run(max_steps=40)
    return history


async def fill_covermymeds_from_key(access_key: str, patient_last: str, patient_dob: str):
    """
    Handle pharmacy-initiated PA: enter a key from a fax to pick up
    an existing PA request on CoverMyMeds.
    """
    browser = Browser(headless=False)

    agent = Agent(
        task=f"""
        A pharmacy initiated a prior authorization for a patient.
        We received a fax with an access key.

        1. Navigate to https://key.covermymeds.com/
        2. Enter the access key: {access_key}
        3. Enter the patient's last name: {patient_last}
        4. Enter the patient's date of birth: {patient_dob}
        5. Review the pre-populated PA form
        6. Fill in any missing clinical information using chart data
        7. Complete and submit the PA request
        """,
        llm=ChatBrowserUse(),
        browser=browser,
        use_vision=True,
    )

    history = await agent.run(max_steps=30)
    return history
```

| Task | Details |
|---|---|
| **T2.1** Implement CoverMyMeds new request flow | Login → New Request → medication + demographics → form selection |
| **T2.2** Form field mapping | Map chart JSON fields to CoverMyMeds form fields (visual + element-based) |
| **T2.3** Clinical justification generator tool | `generate_justification` action that builds medical necessity narrative |
| **T2.4** Gap detection | Agent flags missing chart data as "GAP" items |
| **T2.5** Pharmacy-initiated PA flow | Agent handles the `key.covermymeds.com` access key entry |
| **T2.6** GIF recording for demo | `generate_gif=True` on the agent — instant demo footage |
| **T2.7** Test with medication PA scenario | End-to-end: Humira PA on CoverMyMeds with Aetna test data |
| **T2.8** Test with imaging PA scenario | MRI PA using fallback mock portal (if CMM doesn't cover it) |

**Deadline: Hour 16 — CoverMyMeds PA form filler works end-to-end.**

---

### Phase 3 — Agent 3: Status Monitor + Alerts (Hours 16–20)

**Goal:** Agent periodically checks PA status across CoverMyMeds and Claim.MD, sends alerts via Agentmail.

```python
# agents/status_monitor.py
from browser_use import Agent, Browser, ChatBrowserUse, Tools, ActionResult
from dotenv import load_dotenv
import asyncio

load_dotenv()

tools = Tools()

@tools.action("Send alert email about PA status change")
async def send_alert(
    patient_name: str, status: str, portal: str, details: str
) -> ActionResult:
    # In real impl: integrate with Agentmail
    print(f"📧 ALERT: PA for {patient_name} on {portal}")
    print(f"   Status: {status}")
    print(f"   Details: {details}")
    return ActionResult(
        extracted_content=f"Alert sent: {patient_name} — {status} on {portal}",
    )

@tools.action("Update PA status in database")
async def update_status(mrn: str, status: str, portal: str) -> ActionResult:
    import json
    data = {"mrn": mrn, "status": status, "portal": portal}
    with open(f"output/status_{mrn}.json", "w") as f:
        json.dump(data, f, indent=2)
    return ActionResult(extracted_content=f"Status updated: {mrn} → {status}")

async def monitor_covermymeds(mrn: str, patient_name: str):
    browser = Browser(headless=True)

    agent = Agent(
        task=f"""
        You are a PA status monitoring assistant.

        1. Navigate to https://www.covermymeds.health and log in.
        2. On the dashboard, find the PA request for patient {patient_name}.
        3. Check the current status of the PA request.
        4. Extract:
           - Current status (Pending / Approved / Denied / More Info Needed)
           - Date submitted
           - Any payer notes or denial reasons
        5. Use update_status action with MRN "{mrn}" and the current status.
        6. If status is "Denied", use send_alert with the denial reason.
        7. If status is "Pending" and it was submitted more than 3 days ago,
           use send_alert to flag the delay.
        8. If status is "Approved", use send_alert to notify the clinic.
        9. Use done action to report findings.
        """,
        llm=ChatBrowserUse(),
        browser=browser,
        tools=tools,
        flash_mode=True,  # Fast mode for simple status checks
        max_actions_per_step=2,
    )

    history = await agent.run(max_steps=15)
    return history.final_result()


async def monitor_claimmd(mrn: str, patient_name: str):
    browser = Browser(headless=True)

    agent = Agent(
        task=f"""
        Check claim status on Claim.MD test portal.

        1. Navigate to https://www.claim.md and log in with test credentials.
        2. Find the most recent claim for patient {patient_name}.
        3. Extract the current status and any response messages.
        4. Use update_status action with MRN "{mrn}".
        5. If there are rejection codes, use send_alert with the details.
        """,
        llm=ChatBrowserUse(),
        browser=browser,
        tools=tools,
        flash_mode=True,
    )

    history = await agent.run(max_steps=15)
    return history.final_result()
```

| Task | Details |
|---|---|
| **T3.1** CoverMyMeds status monitor agent | Check dashboard for PA determinations |
| **T3.2** Claim.MD status monitor agent | Poll for claim status updates |
| **T3.3** Agentmail integration | Send formatted email alerts (approved/denied/delayed) |
| **T3.4** Convex real-time push | Write status to DB → frontend auto-updates |
| **T3.5** Scheduler | asyncio loop or Daytona cron to re-check every N hours |

**Deadline: Hour 20 — Status monitor detects changes and sends alerts.**

---

### Phase 4 — Integration, UI, Demo Prep (Hours 20–24)

| Task | Details |
|---|---|
| **T4.1** Frontend dashboard | Next.js page: active PAs, eligibility results, agent activity log |
| **T4.2** End-to-end orchestration | User pastes chart → Agent 1 checks eligibility (Stedi) → Agent 2 fills CoverMyMeds PA → Agent 3 monitors |
| **T4.3** Multi-portal status view | Dashboard shows status from CoverMyMeds + Claim.MD side by side |
| **T4.4** Observability | Laminar/HUD tracing on all agent runs |
| **T4.5** GIF + video compilation | Stitch agent GIFs into demo reel |
| **T4.6** Demo script + slides | 3-minute walkthrough with live portal footage |

**Deadline: Hour 24 — Full demo-ready.**

---

## 7. File/Folder Structure

```
prior-auth-agent/
├── README.md
├── .env.example                  # BROWSER_USE_API_KEY, CMM creds, Stedi key, Claim.MD creds
├── pyproject.toml
│
├── agents/
│   ├── __init__.py
│   ├── eligibility_checker.py    # Agent 1 — Stedi + Claim.MD
│   ├── pa_form_filler.py         # Agent 2 — CoverMyMeds
│   └── status_monitor.py         # Agent 3 — Multi-portal monitoring
│
├── tools/
│   ├── __init__.py
│   ├── chart_loader.py           # Load mock EMR data
│   ├── justification_gen.py      # Clinical narrative builder
│   ├── eligibility_parser.py     # Parse eligibility responses
│   ├── alert_sender.py           # Agentmail integration
│   └── db_client.py              # Convex/MongoDB read/write
│
├── data/
│   ├── charts/                   # Mock patient chart JSONs
│   │   ├── MRN-00421.json        # Humira PA scenario
│   │   ├── MRN-00522.json        # MRI PA scenario
│   │   ├── MRN-00633.json        # Knee replacement PA scenario
│   │   ├── MRN-00744.json        # Denial + appeal scenario
│   │   └── MRN-00855.json        # Medicare/MBI lookup scenario
│   └── policies/                 # Mock medical policy PDFs (fallback)
│       ├── policy_72148.pdf
│       └── policy_J0585.pdf
│
├── mock-portal/                  # Fallback mock portal (imaging/surgical PA)
│   └── ...
│
├── server/
│   ├── main.py                   # FastAPI orchestration
│   ├── routes.py                 # API endpoints
│   └── scheduler.py              # Status polling cron
│
├── frontend/                     # Dashboard UI (Vercel V0 / Next.js)
│   └── ...
│
├── output/                       # Generated results, GIFs
│   └── .gitkeep
│
└── scripts/
    ├── run_eligibility.py        # Quick script: check one patient
    ├── run_pa.py                 # Quick script: file one PA
    └── run_full_flow.py          # End-to-end: eligibility → PA → monitor
```

---

## 8. Key Browser Use Patterns

### Structured Output for PA Checklist
```python
from pydantic import BaseModel
from typing import Optional

class EligibilityResult(BaseModel):
    payer: str
    coverage_active: bool
    copay: Optional[str]
    deductible: Optional[str]
    pa_required: bool
    pa_required_reason: Optional[str]

class PASubmission(BaseModel):
    portal: str              # "covermymeds" | "mock"
    status: str              # "submitted" | "draft" | "gap_detected"
    fields_filled: list[str]
    gaps: list[str]          # Missing data items
    justification_summary: str

agent = Agent(
    task="...",
    llm=ChatBrowserUse(),
    output_model_schema=EligibilityResult,
)
```

### Initial Actions (Pre-login for Speed)
```python
agent = Agent(
    task="...",
    llm=ChatBrowserUse(),
    initial_actions=[
        {"navigate": {"url": "https://www.covermymeds.health"}},
        {"input": {"index": 1, "text": os.getenv("CMM_USERNAME")}},
        {"input": {"index": 2, "text": os.getenv("CMM_PASSWORD")}},
        {"click": {"index": 3}},
    ],
)
```

### Sensitive Data Handling (Credentials)
```python
agent = Agent(
    task="Log in to CoverMyMeds and fill the PA form...",
    llm=ChatBrowserUse(),
    sensitive_data={
        "cmm_username": os.getenv("CMM_USERNAME"),
        "cmm_password": os.getenv("CMM_PASSWORD"),
    },
)
```

### Cloud Browser for Production Demo
```python
browser = Browser(
    use_cloud=True,
    cloud_proxy_country_code='us',
)
```

---

## 9. Use Cases for Claude Coding Agent

Tasks best suited for an LLM coding agent (Claude) to implement during the sprint:

| Priority | Task | Why Claude is ideal |
|---|---|---|
| 🔴 P0 | **All 3 Browser Use agent scripts** | Claude understands the BU API and async patterns |
| 🔴 P0 | **Mock EMR JSON fixtures (5 scenarios)** | Claude generates realistic fake medical data |
| 🔴 P0 | **Clinical justification generator** | Claude excels at medical writing from structured data |
| 🔴 P0 | **Fallback mock portal** | Claude generates full Next.js page layouts from description |
| 🟡 P1 | **FastAPI orchestration server** | Standard REST scaffolding with agent dispatch |
| 🟡 P1 | **Convex schema + real-time queries** | Schema definition + subscriptions |
| 🟡 P1 | **Eligibility response parser** | Extract structured data from Stedi/Claim.MD responses |
| 🟢 P2 | **Frontend dashboard** | React components with real-time multi-portal status |
| 🟢 P2 | **Agentmail alert templates** | HTML email templates for approval/denial/delay |
| 🟢 P2 | **Laminar/HUD integration** | Observability boilerplate |

---

## 10. Demo Script (3 Minutes)

### Act 1: The Problem (0:00–0:30)
- Show the stat: "$35B/year, 100K nurses' worth of time"
- Show a real CoverMyMeds screenshot — "This is what 950K providers use daily"
- "What if an AI agent could do this in 3 minutes instead of 45?"

### Act 2: Eligibility Check (0:30–1:00)
- Paste mock chart JSON into our dashboard
- Agent 1 navigates **Stedi test mode** — fills eligibility form, gets back coverage data
- Dashboard shows: "Coverage Active ✅ — PA Required for Humira ⚠️"

### Act 3: PA Submission (1:00–2:15)
- Agent 2 logs into the **real CoverMyMeds portal**
- Clicks "New Request" → enters medication + patient demographics + BIN/PCN
- Selects the correct PA form from the list
- Fills every field: diagnosis, prior therapies, labs
- Writes clinical justification narrative
- Clicks "Send to Plan" — show the GIF recording
- Dashboard: "PA Submitted ✅ — Awaiting Determination"

### Act 4: Monitoring + Result (2:15–3:00)
- Agent 3 checks CoverMyMeds dashboard — "Determination: Approved"
- Email alert arrives via Agentmail: "PA for Jane Doe — APPROVED"
- Dashboard updates in real-time via Convex
- Close with: "45 minutes → 3 minutes. $35B problem, solved."

---

## 11. Risk Mitigation

| Risk | Mitigation |
|---|---|
| CoverMyMeds blocks automation | Use `use_vision=True`, cloud browser with proxy, fall back to mock portal |
| Stedi test mode has limited payer coverage | We only demo payers with predefined mock data (Aetna, BCBS, Medicare) |
| Claim.MD test account has unexpected behavior | Test specific member IDs that produce known responses; document which IDs → which outcomes |
| Agent gets stuck on complex form | Break into smaller sub-agents; use `initial_actions` for login; `max_failures=3` with recovery prompting |
| CoverMyMeds requires MFA | Use `sensitive_data` param; pre-authenticate in browser session; or demo from already-logged-in state |
| Time crunch | **Minimum viable demo = Agent 2 (CoverMyMeds form filler) + GIF.** Everything else is bonus. |

---

## 12. Minimal Viable Demo (If Time is Short — 8 Hours)

If you only have half the time, build just this:

1. ✅ One mock chart JSON fixture
2. ✅ Agent 2: CoverMyMeds PA form filler (the money agent)
3. ✅ `generate_gif=True` for instant demo footage
4. ✅ Terminal-based orchestration (no frontend needed)
5. ✅ Clinical justification generator tool

**This alone is a killer demo.** Watching an AI agent navigate the real CoverMyMeds portal — the platform 950K providers use — and fill out a PA form with clinical evidence is more compelling than any mock portal.

---

## 13. Environment Variables (.env.example)

```bash
# Browser Use (required)
BROWSER_USE_API_KEY=

# CoverMyMeds portal credentials
CMM_USERNAME=
CMM_PASSWORD=

# Claim.MD test account
CLAIMMD_USERNAME=
CLAIMMD_PASSWORD=
CLAIMMD_API_KEY=

# Stedi
STEDI_API_KEY=

# Agentmail (for alerts)
AGENTMAIL_API_KEY=

# Convex (for real-time DB)
CONVEX_URL=
CONVEX_DEPLOY_KEY=

# Observability
LAMINAR_API_KEY=

# Optional
ANONYMIZED_TELEMETRY=false
BROWSER_USE_LOGGING_LEVEL=info
```

---

## 14. Impact Metrics (for Judging)

- **Time saved:** Manual PA takes 45–60 min. Agent completes in ~3–5 min (demonstrated live).
- **Credibility:** Uses the **real CoverMyMeds portal** (950K+ providers), not a toy mock.
- **Error reduction:** Checklist ensures no missing documentation before submission.
- **Multi-portal:** Single agent orchestrates across Stedi, Claim.MD, and CoverMyMeds.
- **Scalability:** One agent handles N PAs concurrently vs. one nurse per case.
- **Cost projection:** At $35B/year across US healthcare, even 10% automation = $3.5B saved.