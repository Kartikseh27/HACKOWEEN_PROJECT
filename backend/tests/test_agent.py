"""
Unit tests for Universal AI Agent Orchestration.
Verifies real tool invocation, multi-domain task planning, and language switching.
"""

def test_agent_orchestrates_multiple_tools(client):
    payload = {
        "prompt": "My wheat crop is yellowing in Karnal. Check weather risks for spray and tell me what to do.",
        "cropContext": "Wheat",
        "location": {"state": "Haryana", "district": "Karnal"},
        "language": "en",
        "conversationId": "TEST-AGENT-SESSION-1"
    }
    res = client.post("/api/agent/orchestrate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "requestId" in data
    assert len(data["plan"]) >= 3
    assert "crop_health" in data["toolsInvoked"]
    assert "weather_guardian" in data["toolsInvoked"]
    assert "cropHealth" in data["toolOutputs"]
    assert "weather" in data["toolOutputs"]
    assert len(data["actionRoadmap"]) > 0
    assert "integratedSynthesis" in data


def test_agent_hindi_support(client):
    payload = {
        "prompt": "मेरी गेहूं की फसल में पीलापन है और मंडी भाव क्या है?",
        "cropContext": "Wheat",
        "location": {"state": "Haryana", "district": "Karnal"},
        "language": "hi",
        "conversationId": "TEST-AGENT-SESSION-2"
    }
    res = client.post("/api/agent/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "mandi_advisor" in data["toolsInvoked"] or "crop_health" in data["toolsInvoked"]
    assert len(data["actionRoadmap"]) > 0

