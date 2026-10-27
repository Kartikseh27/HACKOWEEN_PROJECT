# KISAN CULTURE — n8n AI Agent Workflow Setup Guide

This guide explains how to run and connect the autonomous **n8n Agentic AI Workflow** to the Kisan Culture application.

---

## 1. Prerequisites

- **Node.js**: v18.17+ or v20+ (already present on macOS/Linux)
- **FastAPI Backend**: Running on `http://127.0.0.1:8000`
- **Vite Frontend**: Running on `http://localhost:3000`

---

## 2. Start n8n Locally

You can launch n8n immediately without manual installation using `npx`:

```bash
# Option A: Run directly via npx
npx n8n
```

Or via Docker (if Docker is installed on your machine):

```bash
# Option B: Run via Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

Once running, open your browser and navigate to:
👉 **`http://localhost:5678`**

Follow the one-time local admin setup (create local credentials or skip telemetry).

---

## 3. Import the KISAN CULTURE Agent Workflow

1. In the n8n sidebar, click **Workflows**.
2. Click the **three dots menu (`...`)** in the top right, then select **Import from File**.
3. Select the workflow file from your workspace:
   ```
   n8n/kisan-culture-agent.json
   ```
4. The complete agricultural multi-tool agent graph will appear:
   - **Webhook Trigger**: Listens at `POST /webhook/kisan-agent`
   - **Input Validator & Context Normalizer**: Validates prompt, handles language (EN/HI), and extracts agricultural variables.
   - **Intent Classifier & Tool Router**: Determines active farmer intent across single or multi-tool workflows.
   - **Crop Pathology Tool**: Matches symptoms against ICAR guidelines and validates leaf image limits.
   - **Agro-Meteorological Tool**: Evaluates live weather, wind velocity, and spray window safety.
   - **Soil & Nutrient Management Tool**: Interprets NPK, pH, and electrical conductivity values.
   - **Mandi Economics & Profit Tool**: Performs deterministic profit calculation:
     $$\text{Gross Revenue} = \text{Quantity} \times \text{Price}$$
     $$\text{Net Profit} = \text{Gross Revenue} - \text{Total Costs}$$
     $$\text{Break-Even Price} = \frac{\text{Total Costs}}{\text{Quantity}}$$
   - **Government Scheme & Claim Advisory**: Provides scheme guidelines, subsidy benefits, and documentation checklists.
   - **Farmer Synthesis Engine**: Combines all tool results into a structured, empathetic, bilingual response.
   - **Respond to Webhook**: Returns the standardized schema back to the FastAPI backend.

5. Click **Save**, and toggle the switch in the top right to **Active**.

---

## 4. Connect Backend to n8n

Open `backend/.env` (or configure your shell environment) and set:

```env
N8N_WEBHOOK_URL="http://localhost:5678/webhook/kisan-agent"
N8N_TIMEOUT_SECONDS=20.0
```

Restart or reload the FastAPI backend:
```bash
cd backend && venv/bin/uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Verify the backend engine status:
```bash
curl http://127.0.0.1:8000/api/agent/engine-status
```
Response:
```json
{
  "n8nConfigured": true,
  "n8nWebhookUrl": "http://localhost:5678/webhook/kisan-agent",
  "activeEngines": ["native", "n8n"]
}
```

---

## 5. Test the Integration from the Frontend

1. Navigate to the **Universal Agent** tab on `http://localhost:3000`.
2. Notice the engine selector pill in the top right:
   - `[ ⚡ Native Python ]`
   - `[ 🔄 n8n Autonomous Workflow ]`
3. Click `[ 🔄 n8n Autonomous Workflow ]`.
4. Click any of the 1-Click Verification Scenarios:
   - **Test A (Crop Health)**: Wheat leaves yellowing.
   - **Test B (Weather & Spray)**: Forecast and pesticide spray precautions for Karnal.
   - **Test C (Mandi Economics)**: 20 quintals @ ₹2,500 with ₹20,000 costs $\rightarrow$ ₹30,000 Net Profit.
   - **Test D (Multi-Tool)**: Complex triple-tool query (Disease + Weather + Falling Mandi Prices).
5. Watch the **Task Plan Tracker** and **Live Tool Trace** update in real time with the `Engine: 🔄 n8n Autonomous Workflow` badge!

---

## 6. Offline Resiliency & Fallback Guarantee

If n8n is ever offline, stopped, or times out:
1. The backend automatically catches the connection failure gracefully.
2. The query is seamlessly rerouted to the built-in **Native Python Universal Agent**.
3. A transparent note is added to the execution plan (`Fallback: n8n unreachable, routed through native agent engine`).
4. The farmer **never sees a broken UI or 500 error**.
