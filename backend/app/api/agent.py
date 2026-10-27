"""
Universal AI Agent API Router.
Endpoints:
- POST /api/agent/orchestrate (consumed by frontend src/services/api.ts)
- POST /api/agent/chat (master prompt Section 10)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import (
    UniversalAgentInputSchema,
    UniversalAgentExecutionResultSchema,
)
from app.services.universal_agent import orchestrate_agent_workflow
from app.database import get_db

router = APIRouter(prefix="/api/agent", tags=["Central Universal AI Agent Orchestrator"])


@router.post("/orchestrate", response_model=UniversalAgentExecutionResultSchema)
async def orchestrate_agent(
    payload: UniversalAgentInputSchema,
    db: Session = Depends(get_db),
):
    """
    Main orchestration endpoint consumed by the KISAN CULTURE frontend.
    Dynamically routes natural language requests to real tools, captures outputs,
    and returns verified synthesis with a prioritized action roadmap.
    """
    try:
        result = await orchestrate_agent_workflow(input_data=payload, db=db)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Universal Agent orchestrator error: {str(exc)}"
        )


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

