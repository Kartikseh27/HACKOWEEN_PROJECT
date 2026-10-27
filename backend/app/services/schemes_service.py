"""
Tool 5: Farmer Schemes & Loss-Claim Assistant Service.
Provides official welfare schemes information and generates formal, legally grounded
PMFBY 72-Hour localized crop loss intimation letters for district revenue and insurance officers.
"""

import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.schemas import (
    SchemeInfoSchema,
    LossClaimInputSchema,
    LossClaimDraftSchema,
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "govt_schemes.json")


def load_schemes_database() -> List[Dict[str, Any]]:
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def get_all_schemes() -> List[SchemeInfoSchema]:
    records = load_schemes_database()
    return [SchemeInfoSchema(**r) for r in records]


def generate_pmfby_loss_draft(input_data: LossClaimInputSchema) -> LossClaimDraftSchema:
    """
    Constructs a formal legal intimation letter complying with PMFBY Operational Guidelines Section 21.4.
    Mandatory 72-hour notification protocol for localized natural calamities.
    """
    calamity_label = {
        "hailstorm": "Hailstorm (ओलावृष्टि)",
        "inundation": "Flash Flood / Water Inundation (जलभराव)",
        "cyclone": "Post-Harvest Cyclone / Unseasonal Heavy Rains (बेमौसम भारी बारिश)",
        "landslide": "Landslide (भूस्खलन)",
        "drought": "Severe Mid-Season Drought (सूखा)",
        "pest_attack": "Widespread Invasive Pest Attack (कीट प्रकोप)",
    }.get(input_data.calamityType, input_data.calamityType.capitalize())

    # Calculate 72-hour deadline
    try:
        incident_dt = datetime.strptime(input_data.dateOfOccurrence, "%Y-%m-%d")
    except Exception:
        incident_dt = datetime.utcnow()

    deadline_dt = incident_dt + timedelta(hours=72)
    deadline_str = deadline_dt.strftime("%d %B %Y, %I:%M %p (Within 72 Hours of Occurrence)")

    if input_data.language == "hi":
        letter_draft = f"""सेवा में,
1. उप-कृषि निदेशक / जिला कृषि अधिकारी (DAO)
2. नोडल अधिकारी, फसल बीमा कंपनी (PMFBY)
तहसील एवं जिला: {input_data.location}

विषय: प्रधानमंत्री फसल बीमा योजना (PMFBY) के तहत {calamity_label} से फसल क्षति की अनिवार्य 72-घंटे की अग्रिम सूचना।

महोदय,
सविनय निवेदन है कि मैं {input_data.farmerName}, निवासी {input_data.location}, मोबाइल नं: {input_data.contactNumber}, अपने खेत में अधिसूचित फसल {input_data.cropName} का काश्तकार हूँ।

दिनांक {input_data.dateOfOccurrence} को हमारे क्षेत्र में आकस्मिक प्राकृतिक आपदा ({calamity_label}) घटित हुई, जिसके कारण मेरी खसरा/सर्वे संख्या {input_data.surveyOrKhasraNo} में बोई गई {input_data.insuredAreaAcres} एकड़ फसल का लगभग {input_data.approximateDamagePercent}% हिस्सा गंभीर रूप से क्षतिग्रस्त हो गया है।

मेरी बीमा पॉलिसी / आवेदन संख्या: {input_data.policyOrApplicationNo}

अतः PMFBY परिचालन दिशा-निर्देश 2020 के प्रावधान 21.4 के तहत आपसे विनम्र अनुरोध है कि निर्धारित 72 घंटे की समय-सीमा के भीतर संयुक्त सर्वेक्षण टीम (कृषि विभाग, राजस्व पटवारी एवं बीमा कंपनी प्रतिनिधि) भेजकर खेत का भौतिक सत्यापन (Loss Assessment) कराने की कृपा करें, ताकि समय पर उचित क्षतिपूर्ति मिल सके।

संलग्नक:
1. आधार कार्ड एवं बैंक पासबुक की प्रति
2. जमीन की जमाबंदी/खसरा नकल
3. जियोटैग्ड क्षति के फोटो
4. बीमा प्रीमियम कटौती रसीद

भवदीय,
हस्ताक्षर: ________________________
नाम: {input_data.farmerName}
दिनांक: {datetime.utcnow().strftime('%d-%m-%Y')}
मोबाइल: {input_data.contactNumber}
स्थान: {input_data.location}"""
    else:
        letter_draft = f"""To,
1. The District Agriculture Officer (DAO)
2. The Nodal Officer / Authorized Representative, PMFBY Insurance Company
District: {input_data.location}

Subject: Mandatory 72-Hour Formal Intimation of Localized Crop Damage under PMFBY Guidelines due to {calamity_label}.

Respected Sir/Madam,

I, {input_data.farmerName}, resident of {input_data.location} (Contact: {input_data.contactNumber}), am a registered farmer cultivating {input_data.cropName} on my landholding bearing Khasra/Survey No. {input_data.surveyOrKhasraNo}.

On {input_data.dateOfOccurrence}, a severe unpreventable natural calamity ({calamity_label}) occurred in our locality. As a result, approximately {input_data.approximateDamagePercent}% of my standing {input_data.cropName} crop over an area of {input_data.insuredAreaAcres} acres has suffered acute destruction.

Policy / Application Reference: {input_data.policyOrApplicationNo}

In strict compliance with PMFBY Operational Guidelines Section 21.4 (Localized Risks & Post-Harvest Losses), I am formally submitting this intimation within the statutory 72-hour window. I kindly request the immediate deputation of a Joint Survey Team comprising the Block Agricultural Extension Officer, Revenue Patwari, and Insurance Loss Assessor to conduct spot verification.

Enclosures:
1. Copy of Aadhaar Card and Bank Passbook (with active IFSC)
2. Revenue Land Record (Jamabandi / ROR / Khasra extract)
3. Geotagged color photographs of damaged field with date stamp
4. Bank insurance premium debit advice / KCC proof

Yours sincerely,

Signature: ________________________
Name: {input_data.farmerName}
Date of Intimation: {datetime.utcnow().strftime('%d %B %Y')}
Contact: {input_data.contactNumber}
Location: {input_data.location}"""

    checklist = [
        "Call Toll-Free Helpline 14447 or log intimation on the Crop Insurance Mobile App immediately.",
        "Take 3-4 clear, geotagged photographs of the field showing damaged crop foliage and standing water/hail stones.",
        "Get this printed letter counter-signed and stamped by your local Gram Patwari or Village Agriculture Worker.",
        "Ensure bank account seeded with Aadhaar is active for direct DBT insurance compensation disbursal.",
    ]

    officials = [
        "District Agriculture Officer (DAO) / Block Agriculture Officer",
        "Authorized District Representative of Notified Insurance Company",
        "Local Halka Patwari / Revenue Circle Officer",
    ]

    return LossClaimDraftSchema(
        farmerName=input_data.farmerName,
        cropName=input_data.cropName,
        calamityType=calamity_label,
        dateOfOccurrence=input_data.dateOfOccurrence,
        surveyOrKhasraNo=input_data.surveyOrKhasraNo,
        generatedLetterDraft=letter_draft,
        mandatoryDeadlines=f"Mandatory Submission Deadline: {deadline_str}",
        nextStepsChecklist=checklist,
        officialsToSubmitTo=officials,
        disclaimer="Formal template generated under PMFBY guidelines. Physical joint inspection within 10 days of intimation is required for loss settlement.",
    )

