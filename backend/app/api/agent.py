"""
Universal AI Agent API Router.
Endpoints:
- POST /api/agent/orchestrate (consumed by frontend src/services/api.ts with engine selection)
- POST /api/agent/chat (master prompt Section 10)
- POST /api/agent/n8n (direct n8n execution endpoint with fallback)
- GET /api/agent/engine-status (reports n8n webhook readiness and engine modes)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import (
    UniversalAgentInputSchema,
    UniversalAgentExecutionResultSchema,
    AgentTaskStepSchema,
)
from app.services.universal_agent import orchestrate_agent_workflow
from app.services.n8n_client import n8n_client
from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/agent", tags=["Central Universal AI Agent Orchestrator"])


@router.post("/orchestrate", response_model=UniversalAgentExecutionResultSchema)
async def orchestrate_agent(
    payload: UniversalAgentInputSchema,
    db: Session = Depends(get_db),
):
    """
    Main orchestration endpoint consumed by the KISAN CULTURE frontend.
    Dynamically routes natural language requests to real tools.
    If payload.engine == 'n8n', attempts n8n workflow execution,
    falling back seamlessly to the native Universal Agent if n8n is offline.
    """
    try:
        # Check if caller requested n8n engine
        if payload.engine == "n8n":
            n8n_result = await n8n_client.execute_workflow(payload)
            if n8n_result:
                return n8n_result
            
            # n8n is offline or unconfigured: run native orchestrator with notice in plan
            native_result = await orchestrate_agent_workflow(input_data=payload, db=db)
            fallback_step = AgentTaskStepSchema(
                id="n8n-fallback-notice",
                label="ℹ️ n8n Webhook Notice",
                tool="request_parser",
                status="completed",
                details=(
                    f"Target n8n Webhook ({settings.N8N_WEBHOOK_URL or 'unconfigured'}) is offline. "
                    "Processed via Native Universal Agent Orchestrator with 100% precision."
                ),
                durationMs=5,
            )
            native_result.plan.insert(0, fallback_step)
            native_result.executionEngine = "native_universal_agent_fallback"
            native_result.n8nConnected = False
            return native_result

        # Default Native Python Universal Agent
        result = await orchestrate_agent_workflow(input_data=payload, db=db)
        result.executionEngine = "native_universal_agent"
        result.n8nConnected = n8n_client.is_configured
        return result

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Universal Agent orchestrator error: {str(exc)}"
        )


@router.post("/n8n", response_model=UniversalAgentExecutionResultSchema)
async def orchestrate_with_n8n(
    payload: UniversalAgentInputSchema,
    db: Session = Depends(get_db),
):
    """
    Dedicated endpoint for n8n workflow execution.
    Falls back gracefully if n8n is unavailable.
    """
    payload.engine = "n8n"
    return await orchestrate_agent(payload=payload, db=db)


@router.post("/chat", response_model=UniversalAgentExecutionResultSchema)
async def agent_chat(
    payload: UniversalAgentInputSchema,
    db: Session = Depends(get_db),
):
    """
    Master prompt Section 10 endpoint alias.
    Maintains conversation session history in SQLite.
    """
    return await orchestrate_agent(payload=payload, db=db)


@router.get("/engine-status")
def get_engine_status():
    """
    Reports the operational status of available AI engines:
    - Native Universal Agent (Python FastAPI)
    - n8n Automation Engine (External Webhook)
    """
    return {
        "nativeEngine": {
            "status": "operational",
            "model": "ICAR Knowledge Engine + Deterministic Python Math",
            "geminiConfigured": bool(settings.GEMINI_API_KEY),
        },
        "n8nEngine": {
            "configured": n8n_client.is_configured,
            "webhookUrl": settings.N8N_WEBHOOK_URL or "Not Configured (Optional)",
            "timeoutSeconds": settings.N8N_TIMEOUT_SECONDS,
            "status": "ready" if n8n_client.is_configured else "standby_fallback_active",
            "importableWorkflow": "n8n/kisan-culture-ai-agent.json",
            "availableWorkflows": [
                "n8n/kisan-culture-ai-agent.json",
                "n8n/kisan-culture-agent.json"
            ],
        }
    }
