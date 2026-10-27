"""
Unit tests for the 4 Domain Tools: Crop Health, Weather, Soil, and Schemes.
"""

def test_crop_health_analysis(client):
    payload = {
        "crop": "Wheat",
        "variety": "HD-2967",
        "growthStage": "Tillering / Jointing",
        "state": "Haryana",
        "district": "Karnal",
        "symptoms": ["Yellowing of leaves (Chlorosis)"],
        "durationDays": 5,
        "severity": "moderate",
        "description": "Lower leaves turning pale yellow."
    }
    res = client.post("/api/crop/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "analysisId" in data
    assert len(data["rankedCauses"]) > 0
    assert "observedSymptoms" in data
    assert "immediateSteps" in data
    assert len(data["immediateSteps"]) > 0
    assert "disclaimer" in data


def test_weather_lookup(client):
    res = client.get("/api/weather/lookup?state=Haryana&district=Karnal&crop=Wheat")
    assert res.status_code == 200
    data = res.json()
    assert "current" in data
    assert data["current"]["temperatureC"] > -10
    assert "forecast" in data
    assert len(data["forecast"]) == 5
    assert "agriculturalActionPlan" in data


def test_soil_analysis(client):
    payload = {
        "crop": "Wheat",
        "state": "Haryana",
        "district": "Karnal",
        "ph": 8.4,
        "ec": 0.5,
        "organicCarbonPercent": 0.35,
        "nitrogenKgHa": 190
    }
    res = client.post("/api/soil/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["overallHealthGrade"] in ("good", "moderate", "requires_reclamation")
    assert len(data["evaluations"]) >= 4
    # Check that pH 8.4 is identified as alkaline with remedy
    ph_eval = next((e for e in data["evaluations"] if "pH" in e["parameter"]), None)
    assert ph_eval is not None
    assert ph_eval["status"] in ("high", "critical")


def test_schemes_and_pmfby_loss_draft(client):
    # Test list schemes
    list_res = client.get("/api/schemes/list")
    assert list_res.status_code == 200
    assert len(list_res.json()["schemes"]) >= 1

    # Test PMFBY 72h claim letter draft
    claim_payload = {
        "farmerName": "Baldev Singh",
        "contactNumber": "9812345678",
        "location": "Karnal, Haryana",
        "cropName": "Wheat",
        "surveyOrKhasraNo": "142/3",
        "insuredAreaAcres": 4.0,
        "calamityType": "hailstorm",
        "dateOfOccurrence": "2026-10-25",
        "approximateDamagePercent": 70,
        "language": "hi"
    }
    claim_res = client.post("/api/schemes/draft-claim", json=claim_payload)
    assert claim_res.status_code == 200
    data = claim_res.json()
    assert "72-घंटे" in data["generatedLetterDraft"] or "72" in data["generatedLetterDraft"]
    assert "Baldev Singh" in data["generatedLetterDraft"]
    assert len(data["nextStepsChecklist"]) > 0

