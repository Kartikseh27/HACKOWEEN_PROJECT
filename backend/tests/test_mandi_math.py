"""
Unit tests for deterministic Mandi Price & Profit arithmetic.
Verifies that calculations are mathematically sound and never hallucinated.
"""

def test_mandi_prices_retrieval(client):
    res = client.get("/api/mandi/prices?commodity=Wheat&state=Haryana&district=Karnal")
    assert res.status_code == 200
    data = res.json()
    assert "records" in data
    assert len(data["records"]) > 0
    first_record = data["records"][0]
    assert first_record["modalPricePerQtl"] > 0
    assert "Karnal" in first_record["mandiName"] or "Wheat" in first_record["commodity"]


def test_deterministic_profit_calculations(client):
    # Calculation payload:
    # 100 quintals @ ₹2,500/quintal = Gross Revenue: ₹250,000
    # Transport: 100 * ₹30 = ₹3,000
    # Loading/Handling: 100 * ₹15 = ₹1,500
    # Packaging: 100 * ₹10 = ₹1,000
    # Mandi Cess: 1.0% of ₹250,000 = ₹2,500
    # Other lump sum: ₹500
    # Total expenses = 3000 + 1500 + 1000 + 2500 + 500 = ₹8,500
    # Net return = 250,000 - 8,500 = ₹241,500
    # Effective price/qtl = 241,500 / 100 = ₹2,415.00
    # Break-even marketing cost/qtl = 8,500 / 100 = ₹85.00
    payload = {
        "commodity": "Wheat",
        "quantityQuintals": 100,
        "expectedSellingPricePerQtl": 2500,
        "transportCostPerQtl": 30,
        "loadingUnloadingCostPerQtl": 15,
        "mandiCessPercentage": 1.0,
        "packagingCostPerQtl": 10,
        "otherExpensesLumpSum": 500,
    }

    res = client.post("/api/mandi/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["grossRevenue"] == 250000.0
    assert data["totalExpenses"] == 8500.0
    assert data["netReturn"] == 241500.0
    assert data["effectivePricePerQtl"] == 2415.0
    assert data["breakEvenPricePerQtl"] == 85.0
    assert data["costBreakdown"]["transportFreight"] == 3000.0
    assert data["costBreakdown"]["mandiCess"] == 2500.0

