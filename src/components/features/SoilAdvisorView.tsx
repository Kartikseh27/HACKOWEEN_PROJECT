/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Language,
  SoilParameters,
  SoilAnalysisResult,
  UploadedFileMeta,
  FarmerReport,
} from '../../types';
import { translations } from '../../i18n/translations';
import { api } from '../../services/api';
import {
  Layers,
  Upload,
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { KisanVoicePlayer } from '../culture/KisanVoicePlayer';

interface SoilAdvisorViewProps {
  language: Language;
  onOpenReport: (report: FarmerReport) => void;
  onSaveReportToList: (report: FarmerReport) => void;
  defaultLocation: { state: string; district: string };
}

export const SoilAdvisorView: React.FC<SoilAdvisorViewProps> = ({
  language,
  onOpenReport,
  onSaveReportToList,
  defaultLocation,
}) => {
  const t = translations[language];

  const [state, setState] = useState(defaultLocation.state);
  const [district, setDistrict] = useState(defaultLocation.district);
  const [crop, setCrop] = useState('Wheat');
  const [texture, setTexture] = useState<'sandy' | 'loamy' | 'clayey' | 'black_cotton'>('loamy');
  const [irrigationMethod, setIrrigationMethod] = useState('Canal / Tube well flood');

  // Soil health card parameters
  const [ph, setPh] = useState<number | string>(7.8);
  const [ec, setEc] = useState<number | string>(0.6);
  const [oc, setOc] = useState<number | string>(0.42);
  const [nitrogen, setNitrogen] = useState<number | string>(210);
  const [phosphorus, setPhosphorus] = useState<number | string>(14);
  const [potassium, setPotassium] = useState<number | string>(240);
  const [zinc, setZinc] = useState<number | string>(0.55);
  const [iron, setIron] = useState<number | string>(5.2);

  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SoilAnalysisResult | null>(null);

  const [activeTextureGuide, setActiveTextureGuide] = useState<string | null>('loam');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
            id: `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: file.type.startsWith('image/') ? base64 : undefined,
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
    setIsLoading(true);
    setErrorMessage(null);

    const params: SoilParameters & { state?: string; district?: string; crop?: string; files?: any[] } = {
      ph: ph !== '' ? Number(ph) : undefined,
      ec: ec !== '' ? Number(ec) : undefined,
      organicCarbonPercent: oc !== '' ? Number(oc) : undefined,
      nitrogenKgHa: nitrogen !== '' ? Number(nitrogen) : undefined,
      phosphorusKgHa: phosphorus !== '' ? Number(phosphorus) : undefined,
      potassiumKgHa: potassium !== '' ? Number(potassium) : undefined,
      zincPpm: zinc !== '' ? Number(zinc) : undefined,
      ironPpm: iron !== '' ? Number(iron) : undefined,
      soilTexture: texture,
      irrigationMethod,
      state,
      district,
      crop,
      files,
    };

    try {
      const result = await api.analyzeSoil(params);
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Soil analysis error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!analysisResult) return;

    try {
      const report = await api.generateReport({
        title: `${crop} Soil Health & Nutrient Management Dossier`,
        farmerLocation: { state, district },
        cropName: crop,
        toolsUsed: ['soil_advisor'],
        executiveSummary: `Soil health grade: ${analysisResult.overallHealthGrade.toUpperCase()}. ${analysisResult.organicMatterAdvice} ${analysisResult.phAdjustmentAdvice || ''}`,
        actionPriorities: analysisResult.fertilizerCorrectionGuidance.map((guidance) => ({
          timeframe: 'Soil Prep & Sowing',
          recommendation: guidance,
          caution: 'Do not mix phosphatic fertilizer directly with unbuffered zinc sulphate.',
        })),
      });

      onSaveReportToList(report);
      onOpenReport(report);
    } catch (e: any) {
      alert(`Report creation failed: ${e.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch">
          <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" />
                <span>Feature Three · Soil Health Card (SHC) Scheme</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {t.soilAdvisor.title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                {t.soilAdvisor.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-4 text-xs text-stone-500">
              <span>Nutrient Benchmarks</span>
              <span aria-hidden="true">·</span>
              <span>pH Reclamation</span>
              <span aria-hidden="true">·</span>
              <span>Field Texture Diagnostics</span>
            </div>
          </div>

          <div className="relative h-48 md:h-auto bg-stone-100">
            <img
              src="/src/assets/images/soil_testing_sample_1793120999484.jpg"
              alt="Farmer holding soil sample with soil test card"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 space-y-6">
        {/* Upload Card or Test Report */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
            {t.soilAdvisor.uploadCardTitle}
          </h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 hover:border-amber-700 rounded-xl p-5 text-center cursor-pointer bg-stone-50 hover:bg-amber-50/20 transition-colors"
          >
            <Upload className="w-5 h-5 text-stone-400 mx-auto mb-1" />
            <span className="text-xs font-semibold text-stone-700 block">
              Upload official Soil Health Card (PDF or Photo)
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              Extracts chemical titration values or parameters automatically
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-1.5 px-3 bg-stone-100 rounded-lg border border-stone-200 text-xs text-stone-800"
                >
                  <FileText className="w-4 h-4 text-amber-800" />
                  <span className="max-w-[200px] truncate">{file.name}</span>
                  <button onClick={() => removeFile(file.id)} className="p-1 text-stone-400 hover:text-stone-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 1-Click Soil Test Scenarios */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold text-amber-950">
              {language === 'hi' ? 'मिट्टी जांच नमूने (1-क्लिक से भरें):' : 'Try Soil Health Presets:'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setPh(8.4);
                setEc(1.2);
                setOc(0.32);
                setNitrogen(180);
                setPhosphorus(11);
                setPotassium(210);
                setZinc(0.42);
                setIron(4.1);
                setTexture('loamy');
              }}
              className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              🧂 {language === 'hi' ? 'क्षारीय मिट्टी (pH 8.4 Alkaline)' : 'Alkaline Soil (pH 8.4)'}
            </button>

            <button
              type="button"
              onClick={() => {
                setPh(7.2);
                setEc(0.5);
                setOc(0.68);
                setNitrogen(320);
                setPhosphorus(22);
                setPotassium(290);
                setZinc(0.85);
                setIron(7.5);
                setTexture('loamy');
              }}
              className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              🪴 {language === 'hi' ? 'उपजाऊ दोमट (pH 7.2 Balanced)' : 'Fertile Loam (pH 7.2)'}
            </button>

            <button
              type="button"
              onClick={() => {
                setPh(5.6);
                setEc(0.3);
                setOc(0.45);
                setNitrogen(195);
                setPhosphorus(9);
                setPotassium(160);
                setZinc(0.5);
                setIron(11.2);
                setTexture('clayey');
              }}
              className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              🔴 {language === 'hi' ? 'अम्लीय मिट्टी (pH 5.6 Acidic)' : 'Acidic Soil (pH 5.6)'}
            </button>
          </div>
        </div>

        {/* Manual Parameters Grid */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              {t.soilAdvisor.manualEntryTitle}
            </h2>
            <span className="text-[11px] text-stone-500">Benchmark: Indian Alluvial & Black Soils</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.soilAdvisor.phLabel}
              </label>
              <input
                type="number"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900 tabular-nums font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.soilAdvisor.ecLabel}
              </label>
              <input
                type="number"
                step="0.05"
                value={ec}
                onChange={(e) => setEc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900 tabular-nums font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.soilAdvisor.ocLabel}
              </label>
              <input
                type="number"
                step="0.01"
                value={oc}
                onChange={(e) => setOc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900 tabular-nums font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.soilAdvisor.zincLabel}
              </label>
              <input
                type="number"
                step="0.05"
                value={zinc}
                onChange={(e) => setZinc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900 tabular-nums font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.soilAdvisor.nLabel}
              </label>
              <input
                type="number"
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900 tabular-nums font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.soilAdvisor.pLabel}
              </label>
              <input
                type="number"
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900 tabular-nums font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.soilAdvisor.kLabel}
              </label>
              <input
                type="number"
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900 tabular-nums font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.soilAdvisor.textureLabel}
              </label>
              <select
                value={texture}
                onChange={(e) => setTexture(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900"
              >
                <option value="loamy">Loamy Soil (दोमट)</option>
                <option value="clayey">Clayey Soil (चिकनी)</option>
                <option value="sandy">Sandy Loam (बलुई)</option>
                <option value="black_cotton">Black Cotton (काली मिट्टी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 disabled:bg-stone-400 rounded-lg transition-colors shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>{t.soilAdvisor.analyzing}</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>{t.soilAdvisor.analyzeBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Soil Texture Field Ribbon Test Guide (Section 6 Requirement) */}
      <div className="bg-white rounded-xl p-6 border border-stone-200">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>{t.soilAdvisor.textureGuideTitle}</span>
        </h2>
        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          Farmers can identify soil texture without complex instruments using the traditional palm ribbon and squeeze test:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => setActiveTextureGuide('sand')}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              activeTextureGuide === 'sand'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <span className="font-bold text-stone-900 block mb-1">1. Sandy Soil (बलुई)</span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Feels gritty in palm. Cannot form a ball when squeezed moist; crumbles immediately. Rapid drainage, low nutrient retention. Requires frequent light irrigation.
            </p>
          </div>

          <div
            onClick={() => setActiveTextureGuide('loam')}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              activeTextureGuide === 'loam'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <span className="font-bold text-stone-900 block mb-1">2. Loamy Soil (दोमट - Ideal)</span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Forms a soft ball that can be rolled into a short ribbon (1-2 cm) before breaking. Balanced air and moisture capacity. Best suited for Indian wheat and cereals.
            </p>
          </div>

          <div
            onClick={() => setActiveTextureGuide('clay')}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              activeTextureGuide === 'clay'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <span className="font-bold text-stone-900 block mb-1">3. Clayey Soil (चिकनी / भारी)</span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Very sticky and smooth when wet. Forms a flexible ribbon &gt;5 cm without cracking. High water holding capacity but prone to waterlogging and compaction.
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  Soil Diagnostic Report #{analysisResult.analysisId}
                </span>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                  {t.soilAdvisor.resultsTitle}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <KisanVoicePlayer
                  text={`मृदा स्वास्थ्य रिपोर्ट। समग्र श्रेणी: ${analysisResult.overallHealthGrade.replace('_', ' ')}। जैविक खाद सलाह: ${analysisResult.organicMatterAdvice}। ${analysisResult.fertilizerCorrectionGuidance.slice(0, 2).join('. ')}`}
                  language={language}
                  label={language === 'hi' ? 'मिट्टी रिपोर्ट सुनें' : 'Listen Soil Report'}
                  compact
                />

                <button
                  onClick={handleCreateReport}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-semibold hover:bg-amber-900 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Soil Dossier</span>
                </button>
              </div>
            </div>

            {/* Overall Health Grade */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 block">Overall Soil Health Grade</span>
                <span className="text-base font-bold text-stone-900 capitalize">
                  {analysisResult.overallHealthGrade.replace('_', ' ')}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  analysisResult.overallHealthGrade === 'good'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {analysisResult.overallHealthGrade}
              </span>
            </div>

            {/* Extracted Nutrient Benchmarks Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-stone-700 tracking-wider">
                {t.soilAdvisor.nutrientsEvaluationTitle}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 text-stone-700 font-semibold">
                    <tr>
                      <th className="p-3">Parameter</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Standard Benchmark</th>
                      <th className="p-3">Interpretation & Field Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {analysisResult.evaluations.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/70">
                        <td className="p-3 font-semibold text-stone-900">{item.parameter}</td>
                        <td className="p-3 font-mono tabular-nums">
                          {item.extractedValue} {item.unit}
                        </td>
                        <td className="p-3 text-stone-500 font-mono text-[11px]">
                          {item.referenceRange}
                        </td>
                        <td className="p-3">
                          <p className="leading-relaxed">{item.farmerExplanation}</p>
                          {item.remedyAction && (
                            <span className="inline-block mt-1 text-[11px] text-amber-900 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Action: {item.remedyAction}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reclamation & Action Schedule */}
            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3 text-xs">
              <h3 className="font-bold text-amber-950 text-sm">
                {t.soilAdvisor.reclamationPlanTitle}
              </h3>
              <ul className="space-y-1.5 text-amber-900">
                {analysisResult.fertilizerCorrectionGuidance.map((guide, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations Notice */}
            <div className="p-4 rounded-xl bg-stone-100 text-stone-600 text-[11px] border border-stone-200">
              <span className="font-semibold text-stone-800 block mb-0.5">Scientific Transparency:</span>
              <p>{analysisResult.limitationsNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
