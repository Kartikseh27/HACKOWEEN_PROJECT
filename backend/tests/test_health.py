"""
Unit tests for Health Check and Tool Status endpoints.
"""

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "appName" in data
    assert "version" in data
    assert "timestamp" in data


def test_tools_status_transparency(client):
    res = client.get("/api/tools/status")
    assert res.status_code == 200
    data = res.json()
    assert "universalAgent" in data
    assert "tools" in data
    assert "crop_health" in data["tools"]
    assert "weather_guardian" in data["tools"]
    assert "soil_advisor" in data["tools"]
    assert "mandi_advisor" in data["tools"]
    assert "schemes_assistant" in data["tools"]
    assert data["tools"]["crop_health"]["status"] == "operational"

