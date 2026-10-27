/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'hi';

export type NavigationTab = 
  | 'dashboard'
  | 'universal-agent'
  | 'crop-health'
  | 'weather-guardian'
  | 'soil-advisor'
  | 'mandi-advisor'
  | 'schemes-assistant'
  | 'reports'
  | 'history'
  | 'settings';

export interface LocationContext {
  state: string;
  district: string;
  village?: string;
}

export interface UploadedFileMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  base64Data?: string;
}

// 1. Crop Health Types
export interface CropHealthInput {
  crop: string;
  variety?: string;
  growthStage: string;
  state: string;
  district: string;
  village?: string;
  symptoms: string[];
  durationDays: number;
  severity: 'mild' | 'moderate' | 'severe';
  irrigationStatus?: string;
  recentWeather?: string;
  description: string;
  files: UploadedFileMeta[];
}

export interface CropCauseHypothesis {
  name: string;
  scientificName?: string;
  category: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nutrient' | 'abiotic' | 'environmental';
  likelihood: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0 to 100
  evidence: string[];
  counterEvidence?: string[];
  recommendedActions: string[];
  preventivePractices: string[];
  warningSigns: string[];
}

export interface CropHealthAnalysisResult {
  analysisId: string;
  timestamp: string;
  crop: string;
  variety?: string;
  observedSymptoms: string[];
  rankedCauses: CropCauseHypothesis[];
  confidenceExplanation: string;
  expertInspectionAdvised: boolean;
  followUpQuestions: string[];
  immediateSteps: string[];
  disclaimer: string;
  sourcesVerified?: string[];
}

// 2. Weather Guardian Types
export interface WeatherCurrent {
  temperatureC: number;
  feelsLikeC: number;
  humidityPercent: number;
  windSpeedKmph: number;
  precipitationMm: number;
  condition: string;
  timestamp: string;
  source: string;
}

export interface WeatherDayForecast {
  date: string;
  dayName: string;
  maxTempC: number;
  minTempC: number;
  rainProbabilityPercent: number;
  expectedRainfallMm: number;
  condition: string;
  advisories: {
    irrigation: 'safe' | 'caution' | 'delay';
    spraying: 'favorable' | 'unfavorable' | 'caution';
    sowing: 'favorable' | 'moderate' | 'unfavorable';
    harvesting: 'favorable' | 'delay' | 'urgent';
  };
}

export interface WeatherRiskResult {
  lookupId: string;
  state: string;
  district: string;
  crop?: string;
  isLiveConnected: boolean;
  dataSourceName: string;
  lastUpdated: string;
  current: WeatherCurrent;
  forecast: WeatherDayForecast[];
  activeAlerts: Array<{
    severity: 'critical' | 'moderate' | 'info';
    title: string;
    description: string;
    actionRequired: string;
  }>;
  agriculturalActionPlan: string[];
}

// 3. Soil Advisor Types
export interface SoilParameters {
  ph?: number;
  ec?: number; // dS/m
  organicCarbonPercent?: number;
  nitrogenKgHa?: number;
  phosphorusKgHa?: number;
  potassiumKgHa?: number;
  zincPpm?: number;
  ironPpm?: number;
  soilTexture?: 'sandy' | 'loamy' | 'clayey' | 'black_cotton' | 'red_alluvial';
  irrigationMethod?: string;
  observedFieldIssues?: string[];
}

export interface SoilParameterEvaluation {
  parameter: string;
  extractedValue: number | string;
  unit: string;
  status: 'low' | 'optimal' | 'high' | 'critical' | 'normal';
  referenceRange: string;
  farmerExplanation: string;
  remedyAction?: string;
}

export interface SoilAnalysisResult {
  analysisId: string;
  timestamp: string;
  location: string;
  soilTextureIdentified: string;
  evaluations: SoilParameterEvaluation[];
  overallHealthGrade: 'good' | 'moderate' | 'requires_reclamation';
  organicMatterAdvice: string;
  phAdjustmentAdvice?: string;
  micronutrientAdvice?: string;
  fertilizerCorrectionGuidance: string[];
  limitationsNote: string;
}

// 4. Mandi Advisor Types
export interface MandiPriceRecord {
  mandiName: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPricePerQtl: number;
  modalPricePerQtl: number;
  maxPricePerQtl: number;
  marketArrivalTonnes?: number;
  distanceKm?: number;
}

export interface MandiCalculationInput {
  commodity: string;
  quantityQuintals: number;
  targetMandi: string;
  expectedPricePerQtl: number;
  transportCostPerQtl: number;
  loadingUnloadingCostPerQtl: number;
  mandiFeePercent: number;
  packagingCostPerQtl: number;
  otherExpensesTotal: number;
}

export interface MandiProfitResult {
  commodity?: string;
  quantityQuintals?: number;
  grossRevenue: number;
  totalExpenses: number;
  netReturn: number;
  effectivePricePerQtl: number;
  breakEvenYieldPrice: number;
  breakEvenPricePerQtl?: number;
  costBreakdown?: Record<string, number>;
  advisoryNotes?: string[];
  comparisonMandis: Array<{
    mandiName: string;
    modalPrice: number;
    estimatedNetProfit: number;
    differenceFromTarget: number;
    recommendationReason: string;
  }>;
  assumptions: string[];
}

// 5. Schemes Assistant Types
export interface SchemeInfo {
  id: string;
  title: string;
  titleHindi: string;
  category: 'insurance' | 'subsidy' | 'direct_benefit' | 'irrigation' | 'credit';
  sponsoredBy: 'Central Government' | 'State Government';
  eligibilitySummary: string;
  coverageDetails: string;
  mandatoryDocuments: string[];
  deadlineOrTiming: string;
  officialPortalUrl: string;
  helplineNumber?: string;
  lossClaimWindowHours?: number;
}

export interface LossClaimDraft {
  farmerName: string;
  contactNumber: string;
  location: string;
  cropName: string;
  surveyOrKhasraNo: string;
  insuredAreaAcres: number;
  calamityType: 'unseasonal_rain' | 'hailstorm' | 'drought' | 'flood' | 'pest_attack';
  dateOfOccurrence: string;
  approximateDamagePercent: number;
  policyOrApplicationNo?: string;
  generatedLetterDraft: string;
  nextStepsChecklist: string[];
}

// 6. Universal Agent Types
export type ToolName = 
  | 'crop_health'
  | 'weather_guardian'
  | 'soil_advisor'
  | 'mandi_advisor'
  | 'schemes_assistant';

export interface AgentTaskStep {
  id: string;
  label: string;
  tool: ToolName | 'request_parser' | 'synthesizer' | 'report_generator';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  details?: string;
  durationMs?: number;
}

export interface UniversalAgentExecutionResult {
  requestId: string;
  timestamp: string;
  farmerPrompt: string;
  detectedIntent: string;
  plan: AgentTaskStep[];
  toolsInvoked: ToolName[];
  toolOutputs: {
    cropHealth?: CropHealthAnalysisResult;
    weather?: WeatherRiskResult;
    soil?: SoilAnalysisResult;
    mandi?: {
      records: MandiPriceRecord[];
      calculation?: MandiProfitResult;
    };
    schemes?: {
      applicableSchemes: SchemeInfo[];
      claimDraft?: LossClaimDraft;
    };
  };
  integratedSynthesis: string;
  actionRoadmap: Array<{
    priority: 'Immediate (Today)' | 'Short-Term (2-3 Days)' | 'Next Week';
    action: string;
    responsibleTool: ToolName;
    riskIfNotDone: string;
  }>;
  missingInformationIdentified: string[];
  followUpQuestions: string[];
  reportArtifactId?: string;
  consequentialActionsPendingApproval?: Array<{
    actionId: string;
    title: string;
    description: string;
    targetService: string;
  }>;
}

// 7. Reports & Conversations
export interface FarmerReport {
  reportId: string;
  title: string;
  generatedAt: string;
  farmerLocation: LocationContext;
  cropName?: string;
  toolsUsed: ToolName[];
  executiveSummary: string;
  symptomsAndFindings?: string[];
  weatherAlertsSummary?: string[];
  soilNutrientSummary?: string[];
  mandiEconomicsSummary?: string[];
  actionPriorities: Array<{
    timeframe: string;
    recommendation: string;
    caution: string;
  }>;
  officialSchemesToAvail?: string[];
  disclaimers: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  content: string;
  attachments?: UploadedFileMeta[];
  agentExecution?: UniversalAgentExecutionResult;
  isStreaming?: boolean;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}
