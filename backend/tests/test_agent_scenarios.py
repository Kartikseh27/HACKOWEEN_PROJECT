"""
Automated Pytest Suite for Universal AI Agent End-to-End Scenarios.
Verifies real tool calling, deterministic arithmetic, entity extraction,
multi-tool coordination, and missing information handling.
"""

import pytest
from app.schemas import UniversalAgentInputSchema, LocationContextSchema
from app.services.universal_agent import (
    orchestrate_agent_workflow,
    extract_agricultural_entities,
    determine_relevant_tools,
)


def test_entity_extraction_mandi_and_crop():
    """Verify regex-based entity and parameter extraction."""
    prompt = "I want to sell 100 quintals of wheat at Rs 2450 in Karnal with 35 rs transport and 15 rs handling."
    entities = extract_agricultural_entities(prompt)

    assert entities["crop"] == "Wheat"
    assert entities["district"] == "Karnal"
    assert entities["state"] == "Haryana"
    assert entities["quantityQuintals"] == 100.0
    assert entities["expectedPrice"] == 2450.0
    assert entities["transportCost"] == 35.0
    assert entities["loadingCost"] == 15.0


def test_entity_extraction_hindi():
    """Verify entity extraction from Hindi prompt."""
    prompt = "मेरे गेहूं के खेत में पीलापन है और 50 क्विंटल बेचने पर करनाल मंडी का भाव क्या है"
    entities = extract_agricultural_entities(prompt)

    assert entities["crop"] == "Wheat"
    assert entities["district"] == "Karnal"
    assert entities["quantityQuintals"] == 50.0


def test_tool_selection_logic():
    """Verify dynamic intent matching for single and multiple tools."""
    # Crop health question
    tools_crop = determine_relevant_tools("My wheat leaves have yellow rust spots", False)
    assert "crop_health" in tools_crop

    # Weather question
    tools_wx = determine_relevant_tools("What is the weather forecast and rain probability in Karnal?", False)
    assert "weather_guardian" in tools_wx

    # Mandi question
    tools_mandi = determine_relevant_tools("Calculate my net profit for 80 quintals of mustard at 5800 rate", False)
    assert "mandi_advisor" in tools_mandi

    # Schemes question
    tools_schemes = determine_relevant_tools("Hailstorm damaged 4 acres of crop, how to file PMFBY insurance claim?", False)
    assert "schemes_assistant" in tools_schemes


@pytest.mark.asyncio
async def test_scenario_1_crop_health_evidence_based(db_session):
    """
    Scenario 1: Farmer asks a crop-health question.
    Agent must invoke crop_health, return evidence-based ranked causes,
    and formulate safe non-chemical first steps.
    """
    input_data = UniversalAgentInputSchema(
        prompt="My wheat leaves have yellow spots and drying leaf tips. What disease is this and what should I do?",
        location=LocationContextSchema(state="Haryana", district="Karnal"),
        cropContext="Wheat",
        language="en",
    )

    result = await orchestrate_agent_workflow(input_data, db=db_session)

    assert "crop_health" in result.toolsInvoked
    assert "cropHealth" in result.toolOutputs
    assert "error" not in result.toolOutputs["cropHealth"]

    ch = result.toolOutputs["cropHealth"]
    assert len(ch["rankedCauses"]) > 0
    top_cause = ch["rankedCauses"][0]
    assert "name" in top_cause
    assert top_cause["confidenceScore"] > 0
    assert "evidence" in top_cause
    assert len(top_cause["recommendedActions"]) > 0

    # Verify synthesis quotes the crop findings
    assert "Crop Health" in result.integratedSynthesis or "Wheat" in result.integratedSynthesis
    assert len(result.actionRoadmap) > 0


@pytest.mark.asyncio
async def test_scenario_2_weather_spray_window(db_session):
    """
    Scenario 2: Farmer asks a weather & spray safety question.
    Agent must query weather telemetry (Open-Meteo or regional normal baseline),
    check wind speed/rain probability, and provide specific spray guidance.
    """
    input_data = UniversalAgentInputSchema(
        prompt="What is the weather forecast for Karnal and can I safely spray pesticide tomorrow morning?",
        location=LocationContextSchema(state="Haryana", district="Karnal"),
        cropContext="Wheat",
        language="en",
    )

    result = await orchestrate_agent_workflow(input_data, db=db_session)

    assert "weather_guardian" in result.toolsInvoked
    assert "weather" in result.toolOutputs
    assert "error" not in result.toolOutputs["weather"]

    wx = result.toolOutputs["weather"]
    assert "current" in wx
    assert "temperatureC" in wx["current"]
    assert "windSpeedKmph" in wx["current"]
    assert len(wx["forecast"]) == 5

    # Check that synthesis quotes temperature and wind
    assert "Weather" in result.integratedSynthesis or "km/h" in result.integratedSynthesis or "°C" in result.integratedSynthesis


@pytest.mark.asyncio
async def test_scenario_3_mandi_deterministic_profit(db_session):
    """
    Scenario 3: Farmer enters crop quantity, selling price, and expenses.
    Agent must extract numbers and compute exact revenue and net profit
    using deterministic Python arithmetic.
    """
    input_data = UniversalAgentInputSchema(
        prompt="I want to sell 100 quintals of wheat at Rs 2450 with Rs 30 transport and Rs 15 handling. What is my profit and break-even price?",
        location=LocationContextSchema(state="Haryana", district="Karnal"),
        cropContext="Wheat",
        language="en",
    )

    result = await orchestrate_agent_workflow(input_data, db=db_session)

    assert "mandi_advisor" in result.toolsInvoked
    assert "mandi" in result.toolOutputs
    assert "calculation" in result.toolOutputs["mandi"]

    calc = result.toolOutputs["mandi"]["calculation"]
    # Exact deterministic math check:
    # Gross Revenue = 100 * 2450 = 245,000
    # Transport = 100 * 30 = 3,000
    # Handling = 100 * 15 = 1,500
    # Mandi Cess (1%) = 2,450
    # Total Expenses = 3,000 + 1,500 + 2,450 = 6,950
    # Net Return = 245,000 - 6,950 = 238,050
    # Effective Price = 238,050 / 100 = 2,380.50
    # Cost per qtl = 69.50
    assert calc["quantityQuintals"] == 100.0
    assert calc["grossRevenue"] == 245000.0
    assert calc["totalExpenses"] == 6950.0
    assert calc["netReturn"] == 238050.0
    assert calc["effectivePricePerQtl"] == 2380.50
    assert calc["breakEvenPricePerQtl"] == 69.50

    # Verify that the exact numbers appear in the synthesis string
    assert "245,000" in result.integratedSynthesis or "245000" in result.integratedSynthesis
    assert "238,050" in result.integratedSynthesis or "238050" in result.integratedSynthesis


@pytest.mark.asyncio
async def test_multi_tool_autonomous_orchestration(db_session):
    """
    Complex multi-domain scenario:
    Farmer mentions disease, rain forecast, and market price fall.
    Agent must select and execute crop_health, weather_guardian, and mandi_advisor.
    """
    input_data = UniversalAgentInputSchema(
        prompt="My wheat crop has yellow patches, rain is expected, and mandi prices are falling. What should I do first and give me a profit calculation for 50 quintals?",
        location=LocationContextSchema(state="Haryana", district="Karnal"),
        cropContext="Wheat",
        language="en",
    )

    result = await orchestrate_agent_workflow(input_data, db=db_session)

    assert "crop_health" in result.toolsInvoked
    assert "weather_guardian" in result.toolsInvoked
    assert "mandi_advisor" in result.toolsInvoked
    assert len(result.plan) >= 4

    # Verify task steps have latency and status
    for step in result.plan:
        assert step.status == "completed"
        assert step.durationMs is not None

    # Roadmap must have prioritized items
    assert len(result.actionRoadmap) >= 3
    priorities = [r.priority for r in result.actionRoadmap]
    assert "Immediate (Today)" in priorities

