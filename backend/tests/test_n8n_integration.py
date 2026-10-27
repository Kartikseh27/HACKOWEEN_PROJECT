"""
Automated Pytest Suite for n8n Integration, Universal Agent Routing, and Required Farmer Scenarios.
Tests:
- Test A: Crop health query routing & ICAR evidence response
- Test B: Weather risk evaluation & spray precautions
- Test C: Mandi economics deterministic arithmetic:
          Gross = 20 * 2500 = 50,000, Total Costs = 20,000, Net Profit = 30,000
- Test D: Empty prompt validation
- Test E: Safe fallback to native agent when n8n is offline
- Test F: Engine status endpoint /api/agent/engine-status
- Test G: Schema mapping of synthetic n8n response
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from app.schemas import UniversalAgentInputSchema, LocationContextSchema
from app.services.universal_agent import orchestrate_agent_workflow
from app.services.n8n_client import map_n8n_response_to_schema

client = TestClient(app)


def test_engine_status_endpoint():
    """Verify the /api/agent/engine-status endpoint returns status without error."""
    response = client.get("/api/agent/engine-status")
    assert response.status_code == 200
    data = response.json()
    assert "n8nEngine" in data
    assert "nativeEngine" in data
    assert "importableWorkflow" in data["n8nEngine"]
    assert data["nativeEngine"]["status"] == "operational"


@pytest.mark.asyncio
async def test_scenario_a_crop_health_query(db_session):
    """
    Test A: 'My wheat leaves are turning yellow. What should I check?'
    Must trigger crop health analysis and return evidence-based recommendations.
    """
    req = UniversalAgentInputSchema(
        prompt="My wheat leaves are turning yellow. What should I check?",
        cropContext="Wheat",
        location=LocationContextSchema(district="Karnal", state="Haryana"),
        language="en",
        engine="native"
    )

    result = await orchestrate_agent_workflow(req, db=db_session)

    assert "crop_health" in result.toolsInvoked
    assert "cropHealth" in result.toolOutputs
    ch = result.toolOutputs["cropHealth"]
    assert len(ch["rankedCauses"]) > 0

    # Verify that wheat yellowing causes (e.g. Yellow Rust or Nitrogen Deficiency) are evaluated
    causes_text = " ".join([c["name"].lower() for c in ch["rankedCauses"]])
    assert "yellow rust" in causes_text or "nitrogen" in causes_text or "chlorosis" in causes_text

    # Synthesis should give practical next steps and limitations
    assert len(result.integratedSynthesis) > 50
    assert len(result.actionRoadmap) > 0


@pytest.mark.asyncio
async def test_scenario_b_weather_risks(db_session):
    """
    Test B: 'What weather risks should a farmer consider for growing wheat?'
    Must trigger weather tool, retrieve forecast data and provide precautions.
    """
    req = UniversalAgentInputSchema(
        prompt="What weather risks should a farmer consider for growing wheat?",
        cropContext="Wheat",
        location=LocationContextSchema(district="Karnal", state="Haryana"),
        language="en",
        engine="native"
    )

    result = await orchestrate_agent_workflow(req, db=db_session)

    assert "weather_guardian" in result.toolsInvoked
    assert "weather" in result.toolOutputs
    wx = result.toolOutputs["weather"]
    assert "current" in wx
    assert "temperatureC" in wx["current"]
    assert "forecast" in wx


@pytest.mark.asyncio
async def test_scenario_c_mandi_deterministic_profit(db_session):
    """
    Test C:
    'I have 20 quintals of wheat. Selling price is ₹2,500 per quintal and total costs are ₹20,000. Calculate my expected net profit.'
    Must compute:
    - Gross Revenue: 20 * 2500 = 50,000
    - Total Costs: 20,000
    - Net Profit: 50,000 - 20,000 = 30,000
    - Break-even price: 20,000 / 20 = 1,000 / qtl
    """
    req = UniversalAgentInputSchema(
        prompt="I have 20 quintals of wheat. Selling price is ₹2,500 per quintal and total costs are ₹20,000. Calculate my expected net profit.",
        cropContext="Wheat",
        location=LocationContextSchema(district="Karnal", state="Haryana"),
        language="en",
        engine="native"
    )

    result = await orchestrate_agent_workflow(req, db=db_session)

    assert "mandi_advisor" in result.toolsInvoked
    assert "mandi" in result.toolOutputs
    calc = result.toolOutputs["mandi"]["calculation"]

    assert calc["quantityQuintals"] == 20.0
    assert calc["grossRevenue"] == 50000.0
    assert calc["totalExpenses"] == 20000.0
    assert calc["netReturn"] == 30000.0
    assert calc["breakEvenPricePerQtl"] == 1000.0


def test_scenario_d_empty_prompt_validation():
    """Verify that an empty or missing prompt fails validation."""
    response = client.post(
        "/api/agent/orchestrate",
        json={"prompt": "   ", "engine": "native"}
    )
    # Either 422 (validation) or 200 with missing info request
    if response.status_code == 200:
        data = response.json()
        assert len(data.get("missingInformationIdentified", [])) > 0 or "provide" in data.get("integratedSynthesis", "").lower()
    else:
        assert response.status_code == 422


def test_n8n_offline_fallback():
    """
    Test safe fallback: When requesting n8n engine but n8n is offline/unreachable,
    the endpoint gracefully falls back to the native Python Universal Agent without a 500 error.
    """
    response = client.post(
        "/api/agent/orchestrate",
        json={
            "prompt": "I have 20 quintals of wheat. Selling price is ₹2,500 per quintal and total costs are ₹20,000. Calculate my expected net profit.",
            "cropContext": "Wheat",
            "engine": "n8n",
            "language": "en"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "mandi_advisor" in data["toolsInvoked"]
    calc = data["toolOutputs"]["mandi"]["calculation"]
    assert calc["netReturn"] == 30000.0


def test_n8n_synthetic_response_mapping():
    """Verify mapping of n8n webhook payload into UniversalAgentExecutionResultSchema."""
    synthetic_payload = {
        "success": True,
        "integratedSynthesis": "Your net profit for 20 quintals is ₹30,000 after ₹20,000 costs.",
        "toolsInvoked": ["mandi_advisor"],
        "plan": [
            {"id": "step-1", "label": "n8n Input Validator", "tool": "request_parser", "status": "completed", "durationMs": 10},
            {"id": "step-2", "label": "n8n Mandi Economics Tool", "tool": "mandi_advisor", "status": "completed", "durationMs": 45}
        ],
        "toolOutputs": {
            "mandi": {
                "calculation": {
                    "commodity": "Wheat",
                    "quantityQuintals": 20.0,
                    "grossRevenue": 50000.0,
                    "totalExpenses": 20000.0,
                    "netReturn": 30000.0,
                    "breakEvenPricePerQtl": 1000.0,
                    "effectivePricePerQtl": 1500.0,
                    "costBreakdown": {"Operational Costs": 20000.0},
                    "advisoryNotes": ["Calculated deterministically."]
                }
            }
        },
        "actionRoadmap": [
            {
                "priority": "Immediate (Today)",
                "action": "Book mandi selling slot",
                "responsibleTool": "mandi_advisor",
                "riskIfNotDone": "Market price fluctuation"
            }
        ]
    }

    original_req = UniversalAgentInputSchema(
        prompt="Calculate profit for 20 qtl @ 2500 with 20000 costs",
        cropContext="Wheat",
        engine="n8n"
    )

    mapped = map_n8n_response_to_schema(synthetic_payload, original_req)
    assert mapped.executionEngine == "n8n_workflow_engine"
    assert mapped.n8nConnected is True
    assert "mandi_advisor" in mapped.toolsInvoked
    assert "30,000" in mapped.integratedSynthesis
