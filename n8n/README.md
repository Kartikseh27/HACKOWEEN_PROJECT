# KISAN CULTURE — n8n AI Agent Automation Workflow

This directory contains the production-grade, importable **n8n Workflow JSON** for automating agricultural intelligence pipelines with the KISAN CULTURE FastAPI backend.

---

## 📁 Workflow File
- **[`kisan_culture_agent_workflow.json`](./kisan_culture_agent_workflow.json)**: Fully configured n8n workflow with webhook triggers, intent classifier, tool routers, HTTP execution nodes, response formatter, and error handling.

---

## 🚀 How to Import into n8n (1-Click)

1. **Open n8n**:
   If running n8n locally via Docker or npm:
   ```bash
   npx n8n
   # or
   docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```
   Open `http://localhost:5678` in your browser.

2. **Import Workflow**:
   - In n8n, click **Workflows** in the left sidebar.
   - Click the three dots `...` (top right) or **Import from File**.
   - Select [`kisan_culture_agent_workflow.json`](./kisan_culture_agent_workflow.json).
   - Alternatively, open the file, copy the entire JSON contents, and press `Ctrl+V` (or `Cmd+V`) on the n8n canvas!

3. **Activate the Workflow**:
   - Toggle the workflow switch from **Inactive** to **Active** (top right).

---

## 📡 Webhook Specification

- **Webhook URL**: `http://localhost:5678/webhook/kisan-agent`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

### Example Request (Multi-Tool Autonomous Query)
```bash
curl -X POST http://localhost:5678/webhook/kisan-agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "My wheat crop has yellow patches, rain is expected, and mandi prices are falling. What should I do first and give me a profit breakdown for 50 quintals?",
    "crop": "Wheat",
    "district": "Karnal",
    "state": "Haryana",
    "language": "en"
  }'
```

### Example Request (Mandi Profit Arithmetic Query)
```bash
curl -X POST http://localhost:5678/webhook/kisan-agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want to sell 100 quintals of wheat at Rs 2450 with Rs 30 transport and Rs 15 handling.",
    "crop": "Wheat",
    "district": "Karnal",
    "language": "en"
  }'
```

---

## 🛠️ Node Architecture & Routing Matrix

| Node Name | Node Type | Purpose |
| :--- | :--- | :--- |
| **Farmer Query Webhook** | `n8n-nodes-base.webhook` | Ingests incoming farmer prompts, image references, and geography |
| **Parse Query & Classify Intent** | `n8n-nodes-base.code` | Deterministic entity extractor (crops, locations, quantities, prices) |
| **Tool Intent Switch** | `n8n-nodes-base.switch` | Directs to single-domain tool or Universal Orchestrator |
| **Call Universal Agent Orchestrator** | `n8n-nodes-base.httpRequest` | Invokes `POST /api/agent/orchestrate` on FastAPI |
| **Call Mandi Profit Engine** | `n8n-nodes-base.httpRequest` | Invokes `POST /api/mandi/calculate` on FastAPI |
| **Call Weather Guardian API** | `n8n-nodes-base.httpRequest` | Invokes `GET /api/weather/lookup` with district telemetry |
| **Call Crop Health Intelligence** | `n8n-nodes-base.httpRequest` | Invokes `POST /api/crop/analyze` with ICAR pathology checks |
| **Consolidate & Format Response** | `n8n-nodes-base.code` | Builds unified Markdown output with action roadmap |
| **Send Webhook Response** | `n8n-nodes-base.respondToWebhook` | Returns HTTP 200 with structured JSON |

---

## 🔒 Security & Safe Operation
- The n8n workflow interacts exclusively with the backend via internal loopback (`http://localhost:8000`).
- No API keys or cloud credentials are exposed to frontend clients.

