"""
Pydantic Request & Response Schemas for KISAN CULTURE Backend.
Strictly compatible with frontend TypeScript interfaces in src/types/index.ts.
"""

from typing import List, Optional, Literal, Dict, Any, Union
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Common Shared Schemas
# -------------------------------------------------------------
class UploadedFileMetaSchema(BaseModel):
    id: str
    name: str
    size: int
    type: str
    previewUrl: Optional[str] = None
    base64Data: Optional[str] = None


class LocationContextSchema(BaseModel):
    state: str
    district: str
    village: Optional[str] = ""


# -------------------------------------------------------------
# 1. Crop Health Intelligence Schemas
# -------------------------------------------------------------
class CropHealthInputSchema(BaseModel):
    crop: str
    variety: Optional[str] = None
    growthStage: str
    state: str
    district: str
    village: Optional[str] = None
    symptoms: List[str] = []
    durationDays: int = 1
    severity: Literal['mild', 'moderate', 'severe'] = 'moderate'
    irrigationStatus: Optional[str] = None
    recentWeather: Optional[str] = None
    description: str = ""
    files: List[UploadedFileMetaSchema] = []


class CropCauseHypothesisSchema(BaseModel):
    name: str
    scientificName: Optional[str] = None
    category: Literal['fungal', 'bacterial', 'viral', 'pest', 'nutrient', 'abiotic', 'environmental']
    likelihood: Literal['high', 'medium', 'low']
    confidenceScore: int = Field(ge=0, le=100)
    evidence: List[str] = []
    counterEvidence: Optional[List[str]] = []
    recommendedActions: List[str] = []
    preventivePractices: List[str] = []
    warningSigns: List[str] = []


class CropHealthAnalysisResultSchema(BaseModel):
    analysisId: str
    timestamp: str
    crop: str
    variety: Optional[str] = None
    observedSymptoms: List[str] = []
    rankedCauses: List[CropCauseHypothesisSchema] = []
    confidenceExplanation: str
    expertInspectionAdvised: bool
    followUpQuestions: List[str] = []
    immediateSteps: List[str] = []
    disclaimer: str
    sourcesVerified: Optional[List[str]] = []


# -------------------------------------------------------------
# 2. Weather & Disaster Guardian Schemas
# -------------------------------------------------------------
class WeatherCurrentSchema(BaseModel):
    temperatureC: float
    feelsLikeC: float
    humidityPercent: int
    windSpeedKmph: float
    precipitationMm: float
    condition: str
    timestamp: str
    source: str


class WeatherDayAdvisoriesSchema(BaseModel):
    spraying: Literal['favorable', 'marginal', 'hazardous']
    irrigation: Literal['safe', 'delay', 'prohibited']
    harvesting: Literal['favorable', 'caution', 'unfavorable']


class WeatherDayForecastSchema(BaseModel):
    date: str
    dayName: str
    maxTempC: float
    minTempC: float
    rainProbabilityPercent: int
    expectedRainfallMm: float
    condition: str
    advisories: WeatherDayAdvisoriesSchema


class WeatherRiskAlertSchema(BaseModel):
    severity: Literal['info', 'advisory', 'warning', 'critical']
    title: str
    description: str
    actionRequired: str
    effectiveUntil: str


class WeatherRiskResultSchema(BaseModel):
    state: str
    district: str
    cropAssessed: str
    current: WeatherCurrentSchema
    forecast: List[WeatherDayForecastSchema]
    activeAlerts: List[WeatherRiskAlertSchema]
    agriculturalActionPlan: List[str]
    disclaimer: str


class WeatherCheckInputSchema(BaseModel):
    state: str
    district: str
    crop: Optional[str] = "Wheat"
    growthStage: Optional[str] = "Vegetative"


# -------------------------------------------------------------
# 3. Soil & Water Advisor Schemas
# -------------------------------------------------------------
class SoilParameterInputSchema(BaseModel):
    crop: Optional[str] = "Wheat"
    state: Optional[str] = "Haryana"
    district: Optional[str] = "Karnal"
    ph: Optional[Union[float, str]] = None
    ec: Optional[Union[float, str]] = None
    organicCarbonPercent: Optional[Union[float, str]] = None
    nitrogenKgHa: Optional[Union[float, str]] = None
    phosphorusKgHa: Optional[Union[float, str]] = None
    potassiumKgHa: Optional[Union[float, str]] = None
    zincPpm: Optional[Union[float, str]] = None
    ironPpm: Optional[Union[float, str]] = None
    soilTexture: Optional[Literal['sandy', 'loamy', 'clayey', 'black_cotton', 'red_alluvial']] = 'loamy'
    irrigationMethod: Optional[str] = None
    observedFieldIssues: Optional[List[str]] = []
    files: Optional[List[UploadedFileMetaSchema]] = []


class SoilParameterEvaluationSchema(BaseModel):
    parameter: str
    extractedValue: Union[float, str]
    unit: str
    status: Literal['low', 'optimal', 'high', 'critical', 'normal']
    referenceRange: str
    farmerExplanation: str
    remedyAction: Optional[str] = None


class SoilAnalysisResultSchema(BaseModel):
    analysisId: str
    timestamp: str
    location: str
    soilTextureIdentified: str
    evaluations: List[SoilParameterEvaluationSchema]
    overallHealthGrade: Literal['good', 'moderate', 'requires_reclamation']
    organicMatterAdvice: str
    phAdjustmentAdvice: Optional[str] = None
    micronutrientAdvice: Optional[str] = None
    fertilizerCorrectionGuidance: List[str] = []
    limitationsNote: str


# -------------------------------------------------------------
# 4. Mandi Price & Profit Advisor Schemas
# -------------------------------------------------------------
class MandiPriceRecordSchema(BaseModel):
    mandiName: str
    district: str
    state: str
    commodity: str
    variety: str
    arrivalDate: str
    minPricePerQtl: float
    modalPricePerQtl: float
    maxPricePerQtl: float
    marketArrivalTonnes: Optional[float] = None
    distanceKm: Optional[float] = None


class MandiCalculationInputSchema(BaseModel):
    commodity: str
    quantityQuintals: float
    expectedSellingPricePerQtl: float
    transportCostPerQtl: float = 0.0
    loadingUnloadingCostPerQtl: float = 0.0
    mandiCessPercentage: float = 1.0
    packagingCostPerQtl: float = 0.0
    otherExpensesLumpSum: float = 0.0
    chosenMandi: Optional[str] = None


class MandiProfitResultSchema(BaseModel):
    commodity: str
    quantityQuintals: float
    grossRevenue: float
    totalExpenses: float
    netReturn: float
    effectivePricePerQtl: float
    breakEvenPricePerQtl: float
    costBreakdown: Dict[str, float]
    advisoryNotes: List[str]


# -------------------------------------------------------------
# 5. Schemes & Loss-Claim Assistant Schemas
# -------------------------------------------------------------
class SchemeInfoSchema(BaseModel):
    id: str
    name: str
    hindiName: str
    category: Literal['insurance', 'credit', 'input_subsidy', 'irrigation', 'welfare']
    implementingAgency: str
    briefDescription: str
    keyBenefits: List[str]
    eligibilitySummary: List[str]
    documentsRequired: List[str]
    applicationProcedure: str
    officialPortalUrl: str
    tollFreeHelpline: Optional[str] = None


class LossClaimInputSchema(BaseModel):
    farmerName: str
    contactNumber: str
    location: str
    cropName: str
    surveyOrKhasraNo: str
    insuredAreaAcres: float
    calamityType: Literal['hailstorm', 'inundation', 'cyclone', 'landslide', 'drought', 'pest_attack']
    dateOfOccurrence: str
    approximateDamagePercent: float
    policyOrApplicationNo: Optional[str] = "Pending / Not Available"
    bankName: Optional[str] = None
    language: Literal['en', 'hi'] = 'en'


class LossClaimDraftSchema(BaseModel):
    farmerName: str
    cropName: str
    calamityType: str
    dateOfOccurrence: str
    surveyOrKhasraNo: str
    generatedLetterDraft: str
    mandatoryDeadlines: str
    nextStepsChecklist: List[str]
    officialsToSubmitTo: List[str]
    disclaimer: str


# -------------------------------------------------------------
# 6. Universal AI Agent Orchestration Schemas
# -------------------------------------------------------------
ToolName = Literal[
    'crop_health',
    'weather_guardian',
    'soil_advisor',
    'mandi_advisor',
    'schemes_assistant'
]


class AgentTaskStepSchema(BaseModel):
    id: str
    label: str
    tool: Union[ToolName, Literal['request_parser', 'synthesizer', 'report_generator']]
    status: Literal['pending', 'in_progress', 'completed', 'skipped', 'failed']
    details: Optional[str] = None
    durationMs: Optional[int] = 0


class ActionRoadmapItemSchema(BaseModel):
    priority: Literal['Immediate (Today)', 'Short-Term (2-3 Days)', 'Next Week']
    action: str
    responsibleTool: ToolName
    riskIfNotDone: str


class ConsequentialActionSchema(BaseModel):
    actionId: str
    title: str
    description: str
    targetService: str


class UniversalAgentInputSchema(BaseModel):
    prompt: str
    location: Optional[LocationContextSchema] = LocationContextSchema(state="Haryana", district="Karnal")
    cropContext: Optional[str] = "Wheat"
    files: Optional[List[UploadedFileMetaSchema]] = []
    language: Literal['en', 'hi'] = 'en'
    conversationId: Optional[str] = None
    engine: Optional[Literal['native', 'n8n']] = 'native'


class ReactStepSchema(BaseModel):
    stepNumber: int
    thought: str
    action: str
    observation: str


class UniversalAgentExecutionResultSchema(BaseModel):
    requestId: str
    timestamp: str
    farmerPrompt: str
    detectedIntent: str
    plan: List[AgentTaskStepSchema]
    toolsInvoked: List[ToolName]
    toolOutputs: Dict[str, Any]
    integratedSynthesis: str
    actionRoadmap: List[ActionRoadmapItemSchema]
    missingInformationIdentified: List[str]
    followUpQuestions: List[str]
    reportArtifactId: Optional[str] = None
    consequentialActionsPendingApproval: Optional[List[ConsequentialActionSchema]] = []
    executionEngine: Optional[str] = "native_universal_agent"
    n8nConnected: Optional[bool] = False
    reactSteps: Optional[List[ReactStepSchema]] = []


# -------------------------------------------------------------
# 7. Farmer Reports & Dossier Schemas
# -------------------------------------------------------------
class ActionPrioritySchema(BaseModel):
    timeframe: str
    recommendation: str
    caution: Optional[str] = None


class FarmerReportPayloadSchema(BaseModel):
    reportId: Optional[str] = None
    title: str
    generatedAt: Optional[str] = None
    farmerLocation: LocationContextSchema
    cropName: str
    toolsUsed: List[str] = []
    executiveSummary: str
    actionPriorities: List[ActionPrioritySchema] = []
    disclaimers: List[str] = []
    pdfPath: Optional[str] = None


