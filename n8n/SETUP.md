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

You have two ready-to-import workflows depending on whether you want an **Autonomous n8n LangChain AI Agent** or a **Deterministic Rule-Based Router**:

### Option 1 (Recommended for n8n AI): LangChain AI Agent Workflow
File: **`n8n/kisan-culture-ai-agent.json`**

1. In the n8n sidebar, click **Workflows** -> click **`...`** (top right) -> **Import from File**.
2. Select `n8n/kisan-culture-ai-agent.json`.
3. The LangChain AI graph will load:
   - **Webhook Trigger**: Receives farmer queries from FastAPI / Frontend at `POST /webhook/kisan-agent`.
   - **Validate Input**: Extracts farmer location, crop context, and language.
   - **Kisan AI Agent (`@n8n/n8n-nodes-langchain.agent`)**: Central autonomous agent with agricultural system prompt.
   - **Google Gemini Chat Model (`@n8n/n8n-nodes-langchain.lmChatGoogleGemini`)**: Connected to the agent's `ai_languageModel` port.
   - **Window Buffer Memory (`@n8n/n8n-nodes-langchain.memoryBufferWindow`)**: Remembers recent conversation turns.
   - **5 Sub-Tool Nodes (`@n8n/n8n-nodes-langchain.toolCustom`)**:
     * `crop_health_tool`: Diagnoses diseases based on ICAR rules.
     * `weather_spray_tool`: Evaluates spray windows & wind velocity.
     * `soil_water_tool`: Evaluates pH & CRI irrigation timings.
     * `mandi_profit_tool`: Deterministic arithmetic ($\text{Net Profit} = \text{Gross} - \text{Costs}$).
     * `government_schemes_tool`: PMFBY 72h loss claim documentation checklists.
   - **Format Response**: Formats AI Agent synthesis into the Kisan Culture schema.
   - **Respond to Webhook**: Returns results instantly.

4. **Add your Gemini API Key in n8n**:
   - Double-click the **Google Gemini Chat Model** node.
   - Under *Credential to connect with*, click **Create New Credential**.
   - Paste your Gemini API key (e.g. from Google AI Studio).
   - Click **Save**.
5. Toggle the workflow to **Active**.

---

### Option 2: Deterministic Rule-Based Workflow
File: **`n8n/kisan-culture-agent.json`**
A standalone JavaScript-powered multi-tool workflow that executes the 5 tools deterministically without requiring external LLM API credentials in n8n. Perfect for air-gapped or high-speed local deployments.

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

