"""
Tool 3: Soil & Water Advisor Service.
Interprets Government Soil Health Card parameters, extracts data from laboratory test PDFs,
and provides ICAR-aligned reclamation packages for saline, alkaline, and nutrient-deficient soils.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any

from app.schemas import (
    SoilParameterInputSchema,
    SoilAnalysisResultSchema,
    SoilParameterEvaluationSchema,
)


def evaluate_soil_parameters(data: SoilParameterInputSchema) -> SoilAnalysisResultSchema:
    """
    Evaluates reported soil chemistry against ICAR Package of Practices guidelines.
    """
    # Safe float parsing
    def safe_float(val, default):
        try:
            return float(val) if val not in (None, "") else default
        except Exception:
            return default

    ph_val = safe_float(data.ph, 7.8)
    ec_val = safe_float(data.ec, 0.6)
    oc_val = safe_float(data.organicCarbonPercent, 0.42)
    n_val = safe_float(data.nitrogenKgHa, 210.0)
    p_val = safe_float(data.phosphorusKgHa, 14.0)
    k_val = safe_float(data.potassiumKgHa, 240.0)
    zn_val = safe_float(data.zincPpm, 0.55)

    evaluations: List[SoilParameterEvaluationSchema] = []

    # 1. Soil Reaction (pH)
    if ph_val < 6.0:
        ph_status = "low"
        ph_expl = "Acidic soil. High risk of Aluminum/Manganese toxicity and Phosphorus fixation."
        ph_remedy = "Apply agricultural lime (CaCO3) @ 1.5 - 2.0 tonnes/hectare during field preparation."
    elif ph_val <= 7.5:
        ph_status = "optimal"
        ph_expl = "Near-neutral soil reaction. Optimal availability for both macro and micronutrients."
        ph_remedy = "Maintain current balanced organic practices."
    elif ph_val <= 8.5:
        ph_status = "high"
        ph_expl = "Mild to moderately alkaline soil. Zinc, Iron, and Phosphorus availability is reduced."
        ph_remedy = "Incorporate pressmud or green manure (Dhaincha) to lower rhizosphere alkalinity."
    else:
        ph_status = "critical"
        ph_expl = "Sodic / Highly alkaline soil (pH > 8.5). Structural degradation and poor water intake."
        ph_remedy = "Apply mineral agricultural gypsum (50% Gypsum Requirement) followed by leaching with good quality water."

    evaluations.append(
        SoilParameterEvaluationSchema(
            parameter="Soil Reaction (pH)",
            extractedValue=ph_val,
            unit="pH Scale",
            status=ph_status,
            referenceRange="6.5 - 7.5 (Optimal)",
            farmerExplanation=ph_expl,
            remedyAction=ph_remedy,
        )
    )

    # 2. Electrical Conductivity (Salinity)
    ec_status = "optimal" if ec_val < 1.0 else "high" if ec_val <= 2.0 else "critical"
    evaluations.append(
        SoilParameterEvaluationSchema(
            parameter="Electrical Conductivity (EC)",
            extractedValue=ec_val,
            unit="dS/m",
            status=ec_status,
            referenceRange="< 1.0 dS/m (Non-saline)",
            farmerExplanation="Measures total soluble salts. Current reading indicates safe salt levels without osmotic root stress.",
            remedyAction="Ensure adequate deep subsoil drainage if using saline tubewell water.",
        )
    )

    # 3. Organic Carbon (OC)
    oc_status = "low" if oc_val < 0.50 else "optimal" if oc_val <= 0.75 else "high"
    evaluations.append(
        SoilParameterEvaluationSchema(
            parameter="Organic Carbon (OC)",
            extractedValue=oc_val,
            unit="%",
            status=oc_status,
            referenceRange="0.50 - 0.75% (Medium to High)",
            farmerExplanation=(
                "Key indicator of soil microbiological life and moisture buffering capacity. "
                f"Value of {oc_val}% is in the {'deficient' if oc_val < 0.5 else 'adequate'} range."
            ),
            remedyAction="Broadcast 4-5 tonnes/acre well-rotted Farm Yard Manure (FYM) or Vermicompost annually.",
        )
    )

    # 4. Available Nitrogen (N)
    n_status = "low" if n_val < 280 else "optimal" if n_val <= 560 else "high"
    evaluations.append(
        SoilParameterEvaluationSchema(
            parameter="Available Nitrogen (N)",
            extractedValue=n_val,
            unit="kg/ha",
            status=n_status,
            referenceRange="280 - 560 kg/ha",
            farmerExplanation=f"Soil nitrogen is {n_status.upper()}. Requires split top-dressing.",
            remedyAction="Apply recommended Urea dosage split into 3 applications to minimize leaching.",
        )
    )

    # 5. Available Phosphorus (P)
    p_status = "low" if p_val < 10 else "optimal" if p_val <= 25 else "high"
    evaluations.append(
        SoilParameterEvaluationSchema(
            parameter="Available Phosphorus (P2O5)",
            extractedValue=p_val,
            unit="kg/ha",
            status=p_status,
            referenceRange="10 - 25 kg/ha",
            farmerExplanation=f"Soil phosphorus is {p_status.upper()}.",
            remedyAction="Incorporate Single Super Phosphate (SSP) or DAP in the seed furrow at sowing time.",
        )
    )

    # 6. Zinc (Zn) Micronutrient
    zn_status = "low" if zn_val < 0.6 else "optimal"
    evaluations.append(
        SoilParameterEvaluationSchema(
            parameter="Available Zinc (Zn)",
            extractedValue=zn_val,
            unit="ppm",
            status=zn_status,
            referenceRange="> 0.60 ppm (Critical Threshold)",
            farmerExplanation=f"Zinc is {'deficient' if zn_status == 'low' else 'adequate'} in this soil profile.",
            remedyAction="Broadcast Zinc Sulphate (21%) @ 10 kg/acre or foliar spray 0.5% ZnSO4 + 2% Urea at active tillering.",
        )
    )

    # Overall Health Grading
    if ph_status in ("critical", "low") or oc_status == "low":
        overall_grade = "requires_reclamation"
    elif n_status == "low" or p_status == "low":
        overall_grade = "moderate"
    else:
        overall_grade = "good"

    fertilizer_guidance = [
        f"Apply basal dose: 100% of required DAP and Potash along with 1/3rd Urea at sowing time.",
        f"Top-dress remaining nitrogen in two equal splits: first at Crown Root Initiation (CRI - 21 days), second at Tillering (40-45 days).",
        f"Incorporate bio-fertilizers (Azotobacter & PSB cultures) with seed to improve native nutrient mobilization.",
    ]

    return SoilAnalysisResultSchema(
        analysisId=f"KC-SOIL-{uuid.uuid4().hex[:6].upper()}",
        timestamp=datetime.utcnow().strftime("%d %B %Y, %I:%M %p"),
        location=f"{data.district}, {data.state}",
        soilTextureIdentified=f"{data.soilTexture.capitalize() if data.soilTexture else 'Loamy'} Soil",
        evaluations=evaluations,
        overallHealthGrade=overall_grade,
        organicMatterAdvice=(
            "Incorporate green manure crops (Dhaincha or Sunhemp) before Kharif paddy transplantation. "
            "Never burn crop stubble; incorporate crop residue using Super Seeder or Happy Seeder."
        ),
        phAdjustmentAdvice=ph_remedy if ph_status != "optimal" else "Soil reaction is well balanced.",
        micronutrientAdvice="Apply Zinc Sulphate heptahydrate (21%) every alternating season to prevent chlorosis.",
        fertilizerCorrectionGuidance=fertilizer_guidance,
        limitationsNote="Analysis evaluates reported indicators against ICAR benchmarks. For micro-plot precision, test soil samples every 2 years.",
    )

