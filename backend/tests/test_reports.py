"""
Unit tests for Report Generation, PDF creation, and Download.
"""

import os

def test_generate_and_download_report(client):
    payload = {
        "title": "Comprehensive Field Inspection Dossier",
        "farmerLocation": {"state": "Haryana", "district": "Karnal", "village": "Taraori"},
        "cropName": "Wheat",
        "toolsUsed": ["crop_health", "soil_advisor"],
        "executiveSummary": "Wheat crop exhibiting mild chlorosis. Soil pH 7.8 indicates mild alkalinity.",
        "actionPriorities": [
            {
                "timeframe": "Immediate (Today)",
                "recommendation": "Inspect drainage furrows.",
                "caution": "Avoid waterlogging."
            }
        ],
        "disclaimers": ["Aligned with ICAR guidelines."]
    }

    # 1. Generate Report
    res = client.post("/api/report/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    rep_id = data["reportId"]
    pdf_path = data["pdfPath"]
    assert rep_id is not None
    assert pdf_path is not None
    assert os.path.exists(pdf_path)

    # 2. Download Report
    dl_res = client.get(f"/api/reports/{rep_id}/download")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    assert len(dl_res.content) > 1000

    # 3. Non-existent report download should return 404
    missing_res = client.get("/api/reports/NON-EXISTENT-ID/download")
    assert missing_res.status_code == 404

