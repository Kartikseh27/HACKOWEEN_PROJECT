/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Language,
  CropHealthInput,
  CropHealthAnalysisResult,
  UploadedFileMeta,
  FarmerReport,
} from '../../types';
import { translations } from '../../i18n/translations';
import { api } from '../../services/api';
import {
  Leaf,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Printer,
  ChevronDown,
  Info,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { KisanVoicePlayer } from '../culture/KisanVoicePlayer';

interface CropHealthViewProps {
  language: Language;
  onOpenReport: (report: FarmerReport) => void;
  onSaveReportToList: (report: FarmerReport) => void;
  defaultLocation: { state: string; district: string };
}

const COMMON_SYMPTOMS = [
  'Yellowing of leaves (Chlorosis)',
  'Brown spots / Rust pustules',
  'Wilting / Drooping in afternoon',
  'Curling of upper new leaves',
  'Stunted plant height & tillers',
  'White powdery growth on leaf',
  'Stem borer holes / dead hearts',
  'Tip burn / margin scorching',
  'Black sooty mold / sticky dew',
];

export const CropHealthView: React.FC<CropHealthViewProps> = ({
  language,
  onOpenReport,
  onSaveReportToList,
  defaultLocation,
}) => {
  const t = translations[language];

  const [crop, setCrop] = useState('Wheat');
  const [variety, setVariety] = useState('HD-2967');
  const [growthStage, setGrowthStage] = useState('Tillering / Jointing (35-45 days)');
  const [state, setState] = useState(defaultLocation.state);
  const [district, setDistrict] = useState(defaultLocation.district);
  const [village, setVillage] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Yellowing of leaves (Chlorosis)',
  ]);
  const [durationDays, setDurationDays] = useState(6);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [irrigationStatus, setIrrigationStatus] = useState('Flood irrigated 5 days ago');
  const [recentWeather, setRecentWeather] = useState('Humid morning with cool nights (14°C)');
  const [description, setDescription] = useState(
    'Yellowing began on lower leaves and is spreading upwards. Plants appear paler than adjacent field.'
  );
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CropHealthAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    Array.from(selected).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setFiles((prev) => [
          ...prev,
          {
            id: `IMG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: base64,
            base64Data: base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (!crop.trim()) {
      setErrorMessage(language === 'en' ? 'Please specify crop name' : 'कृपया फसल का नाम भरें');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const input: CropHealthInput = {
      crop,
      variety,
      growthStage,
      state,
      district,
      village,
      symptoms: selectedSymptoms,
      durationDays,
      severity,
      irrigationStatus,
      recentWeather,
      description,
      files,
    };

    try {
      const result = await api.analyzeCrop(input);
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Crop analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!analysisResult) return;

    try {
      const report = await api.generateReport({
        title: `${crop} Diagnostic & Crop Protection Dossier`,
        farmerLocation: { state, district, village },
        cropName: crop,
        toolsUsed: ['crop_health'],
        executiveSummary: `${crop} (${variety || 'Standard'}) assessed with symptoms: ${analysisResult.observedSymptoms.join(', ')}. Primary hypothesis: ${analysisResult.rankedCauses[0]?.name || 'Nutrient stress'}.`,
        actionPriorities: [
          {
            timeframe: 'Immediate (Today)',
            recommendation: analysisResult.immediateSteps[0] || 'Inspect undersides of leaves.',
            caution: 'Do not spray pesticides on moist dew-covered leaves.',
          },
          {
            timeframe: 'In 2-3 Days',
            recommendation: analysisResult.rankedCauses[0]?.recommendedActions[0] || 'Apply targeted foliar spray.',
            caution: 'Use clean water with neutral pH.',
          },
        ],
      });

      onSaveReportToList(report);
      onOpenReport(report);
    } catch (e: any) {
      alert(`Report creation failed: ${e.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title Card with Photo Asset */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch">
          <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Leaf className="w-4 h-4" />
                <span>Feature One · ICAR Protocol Aligned</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {t.cropHealth.title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                {t.cropHealth.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-4 text-xs text-stone-500">
              <span>Multimodal Vision</span>
              <span aria-hidden="true">·</span>
              <span>Agronomic Pathology</span>
              <span aria-hidden="true">·</span>
              <span>Non-Chemical IPM First</span>
            </div>
          </div>

          <div className="relative h-48 md:h-auto bg-stone-100">
            <img
              src="/src/assets/images/crop_health_inspection_1793120997803.jpg"
              alt="Farmer inspecting crop leaf symptoms"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 1-Click Real Field Sample Presets */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-bold text-amber-950">
            {language === 'hi' ? 'सच्चे खेत के नमूने (1-क्लिक से भरें):' : 'Try Real Field Inspection Presets:'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setCrop('Wheat');
              setVariety('HD-2967');
              setGrowthStage('Tillering / Jointing (35-45 days)');
              setSelectedSymptoms(['Yellowing of leaves (Chlorosis)']);
              setDurationDays(6);
              setSeverity('moderate');
              setDescription('Yellowing began on lower leaves and is spreading upwards in patches. Soil pH is around 7.8.');
            }}
            className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            🌾 {language === 'hi' ? 'गेहूं में पीलापन (Wheat Yellowing)' : 'Wheat Yellowing Sample'}
          </button>

          <button
            type="button"
            onClick={() => {
              setCrop('Mustard');
              setVariety('Pusa Bold');
              setGrowthStage('Flowering / Pod formation');
              setSelectedSymptoms(['Brown spots / Rust pustules', 'Tip burn / margin scorching']);
              setDurationDays(4);
              setSeverity('severe');
              setDescription('Concentric brown leaf spots with yellow halo appearing during foggy weather.');
            }}
            className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            🟡 {language === 'hi' ? 'सरसों झुलसा (Mustard Blight)' : 'Mustard Blight Sample'}
          </button>

          <button
            type="button"
            onClick={() => {
              setCrop('Paddy');
              setVariety('Pusa Basmati 1121');
              setGrowthStage('Vegetative Tillering');
              setSelectedSymptoms(['Stem borer holes / dead hearts', 'Wilting / Drooping in afternoon']);
              setDurationDays(8);
              setSeverity('severe');
              setDescription('Central shoots drying out into dead-hearts. Small holes visible near lower node of stem.');
            }}
            className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            🌾 {language === 'hi' ? 'धान तना छेदक (Paddy Stem Borer)' : 'Paddy Borer Sample'}
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 space-y-6">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
          1. Field Context & Crop Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.cropLabel} *
            </label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder={t.cropHealth.cropPlaceholder}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.varietyLabel}
            </label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder={t.cropHealth.varietyPlaceholder}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.stageLabel}
            </label>
            <input
              type="text"
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              placeholder="e.g. Sowing, Tillering, Flowering"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>
        </div>

        {/* Location Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.stateLabel}
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.districtLabel}
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.villageLabel}
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Taraori"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>
        </div>

        {/* Symptoms Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            {t.cropHealth.symptomsLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration, Severity, and Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.durationLabel}
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 tabular-nums font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.severityLabel}
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            >
              <option value="mild">Mild (Isolated plants &lt;10%)</option>
              <option value="moderate">Moderate (Spread across 10-35% of field)</option>
              <option value="severe">Severe (Heavy damage &gt;35% of field)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.cropHealth.irrigationLabel}
            </label>
            <input
              type="text"
              value={irrigationStatus}
              onChange={(e) => setIrrigationStatus(e.target.value)}
              placeholder="e.g. Irrigated 4 days ago"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>
        </div>

        {/* Free text field */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            {t.cropHealth.notesLabel}
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.cropHealth.notesPlaceholder}
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            {t.cropHealth.uploadLabel}
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 hover:border-emerald-700 rounded-xl p-6 text-center cursor-pointer bg-stone-50 hover:bg-emerald-50/30 transition-colors"
          >
            <Upload className="w-6 h-6 text-stone-400 mx-auto mb-2" />
            <span className="text-xs font-semibold text-stone-700 block">
              Click to select leaf or field photos (JPG, PNG, WEBP)
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              Images are analyzed securely via Google Gemini computer vision
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="relative group rounded-lg overflow-hidden border border-stone-200 bg-stone-100 aspect-square"
                >
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-1 right-1 p-1 bg-stone-900/70 text-white rounded hover:bg-stone-900 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-0 inset-x-0 bg-stone-900/60 text-white text-[10px] px-1.5 py-0.5 truncate">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 rounded-lg transition-colors shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>{t.cropHealth.analyzing}</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>{t.cropHealth.analyzeBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Results Card */}
      {analysisResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Analysis Dossier #{analysisResult.analysisId}
                </span>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                  {t.cropHealth.resultsTitle}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <KisanVoicePlayer
                  text={
                    analysisResult.rankedCauses[0]
                      ? `${crop} फसल की जांच रिपोर्ट। सबसे संभावित कारण: ${analysisResult.rankedCauses[0].name}। रोकथाम के कदम: ${analysisResult.immediateSteps.slice(0, 2).join('. ')}। संस्तुति: ${analysisResult.rankedCauses[0].recommendedActions.slice(0, 2).join('. ')}`
                      : analysisResult.confidenceExplanation
                  }
                  language={language}
                  label={language === 'hi' ? 'जांच रिपोर्ट सुनें' : 'Listen Diagnosis'}
                  compact
                />

                <button
                  onClick={handleCreateReport}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Save & Print Report</span>
                </button>
              </div>
            </div>

            {/* Observed symptoms */}
            <div>
              <h3 className="text-xs font-bold uppercase text-stone-700 tracking-wider mb-2">
                {t.cropHealth.observedSymptomsTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.observedSymptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs border border-stone-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Ranked causes */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-stone-700 tracking-wider">
                {t.cropHealth.rankedCausesTitle}
              </h3>

              {analysisResult.rankedCauses.map((cause, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-stone-900 text-sm">
                        {idx + 1}. {cause.name}
                      </span>
                      {cause.scientificName && (
                        <span className="text-stone-500 italic block text-[11px]">
                          ({cause.scientificName})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-200 text-stone-700">
                        {cause.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cause.likelihood === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {cause.likelihood} Likelihood · {cause.confidenceScore}% Confidence
                      </span>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div>
                    <span className="font-semibold text-stone-800 block mb-1">
                      {t.cropHealth.evidenceTitle}:
                    </span>
                    <ul className="list-disc pl-5 space-y-0.5 text-stone-600">
                      {cause.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-200/60">
                    <span className="font-semibold text-emerald-900 block mb-1">
                      {t.cropHealth.immediateStepsTitle}:
                    </span>
                    <ul className="list-disc pl-5 space-y-0.5 text-stone-700">
                      {cause.recommendedActions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Warning Signs */}
                  {cause.warningSigns && cause.warningSigns.length > 0 && (
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-900">
                      <span className="font-semibold block text-[11px] mb-0.5">
                        {t.cropHealth.warningSignsTitle}:
                      </span>
                      <p className="text-[11px]">{cause.warningSigns.join('; ')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Confidence & Uncertainty Explanation */}
            <div className="p-4 rounded-xl bg-stone-100 text-stone-700 text-xs border border-stone-200">
              <span className="font-semibold text-stone-900 block mb-1">
                Diagnostic Confidence & Limitations:
              </span>
              <p className="leading-relaxed">{analysisResult.confidenceExplanation}</p>
            </div>

            {/* Sources & Official Safety Disclaimer */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>Verified Agronomic Protocols</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-900">
                {analysisResult.disclaimer || t.cropHealth.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
