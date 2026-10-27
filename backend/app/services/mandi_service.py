"""
Tool 4: Mandi Price & Profit Advisor Service.
Deterministic Python arithmetic for APMC market economics, freight deductions,
mandi cess, and transparent net realization per quintal.
"""

import json
import os
from typing import List, Dict, Any

from app.schemas import (
    MandiPriceRecordSchema,
    MandiCalculationInputSchema,
    MandiProfitResultSchema,
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "apmc_mandi_rates.json")


def load_mandi_records() -> List[Dict[str, Any]]:
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def query_mandi_prices(commodity: str, state: str, district: str) -> List[MandiPriceRecordSchema]:
    """
    Retrieves APMC modal prices matching commodity and location criteria.
    """
    records = load_mandi_records()
    comm_query = commodity.lower().strip()
    dist_query = district.lower().strip()

    filtered = []
    for r in records:
        r_comm = r.get("commodity", "").lower()
        r_dist = r.get("district", "").lower()
        if (comm_query in r_comm or r_comm in comm_query) and (not dist_query or dist_query in r_dist or r_dist in dist_query):
            filtered.append(MandiPriceRecordSchema(**r))

    # If no district matches, return all matching the commodity
    if not filtered:
        filtered = [MandiPriceRecordSchema(**r) for r in records if comm_query in r.get("commodity", "").lower()]

    # If still empty, return default benchmarks
    if not filtered:
        filtered = [MandiPriceRecordSchema(**r) for r in records[:3]]

    return filtered


def calculate_mandi_net_profit(data: MandiCalculationInputSchema) -> MandiProfitResultSchema:
    """
    DETERMINISTIC PYTHON ARITHMETIC.
    No LLM hallucination for financial calculations.
    """
    qty = max(0.1, float(data.quantityQuintals))
    price = max(0.0, float(data.expectedSellingPricePerQtl))

    # 1. Gross Revenue (Quantity * Price)
    gross_revenue = round(qty * price, 2)

    # 2. Itemized Marketing Costs
    transport_total = round(qty * float(data.transportCostPerQtl), 2)
    handling_total = round(qty * float(data.loadingUnloadingCostPerQtl), 2)
    packaging_total = round(qty * float(data.packagingCostPerQtl), 2)
    mandi_cess_total = round(gross_revenue * (float(data.mandiCessPercentage) / 100.0), 2)
    other_total = round(float(data.otherExpensesLumpSum), 2)

    total_expenses = round(
        transport_total + handling_total + packaging_total + mandi_cess_total + other_total,
        2
    )

    # 3. In-Hand Net Return
    net_return = round(gross_revenue - total_expenses, 2)

    # 4. Net Effective Price per Quintal
    effective_price = round(net_return / qty, 2)

    # 5. Marketing Cost per Quintal (Break-even threshold)
    cost_per_qtl = round(total_expenses / qty, 2)

    cost_breakdown = {
        "transportFreight": transport_total,
        "loadingUnloading": handling_total,
        "mandiCess": mandi_cess_total,
        "packagingMaterial": packaging_total,
        "otherLumpSum": other_total,
        "totalMarketingCost": total_expenses,
    }

    advisory_notes = [
        f"Transport deductions account for ₹{cost_per_qtl} per quintal ({round((total_expenses/gross_revenue)*100, 1)}% of gross revenue).",
        "Inspect grain moisture levels before dispatch; APMC traders deduct 1-2% for moisture exceeding standard 12%.",
        "Compare nearby regional mandis to evaluate if price differences exceed additional freight haulage costs.",
    ]

    return MandiProfitResultSchema(
        commodity=data.commodity,
        quantityQuintals=qty,
        grossRevenue=gross_revenue,
        totalExpenses=total_expenses,
        netReturn=net_return,
        effectivePricePerQtl=effective_price,
        breakEvenPricePerQtl=cost_per_qtl,
        costBreakdown=cost_breakdown,
        advisoryNotes=advisory_notes,
    )

