/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, SchemeInfo, LossClaimDraft, FarmerReport } from '../../types';
import { translations } from '../../i18n/translations';
import { api } from '../../services/api';
import {
  FileBadge,
  FileText,
  Copy,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Phone,
  ShieldCheck,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';

interface SchemesAssistantViewProps {
  language: Language;
  onOpenReport: (report: FarmerReport) => void;
  onSaveReportToList: (report: FarmerReport) => void;
  defaultLocation: { state: string; district: string };
}

export const SchemesAssistantView: React.FC<SchemesAssistantViewProps> = ({
  language,
  onOpenReport,
  onSaveReportToList,
  defaultLocation,
}) => {
  const t = translations[language];

  const [schemes, setSchemes] = useState<SchemeInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'claim' | 'browse'>('claim');

  // Claim Generator Form
  const [farmerName, setFarmerName] = useState('Baldev Singh');
  const [phone, setPhone] = useState('9812345678');
  const [location, setLocation] = useState(`${defaultLocation.district}, ${defaultLocation.state}`);
  const [cropName, setCropName] = useState('Wheat');
  const [khasraNo, setKhasraNo] = useState('142/3');
  const [insuredArea, setInsuredArea] = useState(3.5);
  const [calamityType, setCalamityType] = useState<any>('hailstorm');
  const [damageDate, setDamageDate] = useState(new Date().toISOString().split('T')[0]);
  const [damagePercent, setDamagePercent] = useState(65);
  const [policyNo, setPolicyNo] = useState('PMFBY-2024-HAR-8910');

  const [claimDraft, setClaimDraft] = useState<LossClaimDraft | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSchemes()
      .then((res) => setSchemes(res.schemes))
      .catch((err) => console.warn('Schemes load failed:', err));
  }, []);

  const handleGenerateClaim = async () => {
    setIsDrafting(true);
    setErrorMessage(null);

    try {
      const draft = await api.draftLossClaim({
        farmerName,
        contactNumber: phone,
        location,
        cropName,
        surveyOrKhasraNo: khasraNo,
        insuredAreaAcres: Number(insuredArea),
        calamityType,
        dateOfOccurrence: damageDate,
        approximateDamagePercent: Number(damagePercent),
        policyOrApplicationNo: policyNo,
        language,
      });

      setClaimDraft(draft);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate loss intimation letter');
    } finally {
      setIsDrafting(false);
    }
  };

  const copyToClipboard = () => {
    if (!claimDraft) return;
    navigator.clipboard.writeText(claimDraft.generatedLetterDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportClaimReport = async () => {
    if (!claimDraft) return;

    try {
      const report = await api.generateReport({
        title: `PMFBY 72-Hour Crop Loss Intimation: ${cropName} (${location})`,
        farmerLocation: { state: defaultLocation.state, district: defaultLocation.district },
        cropName,
        toolsUsed: ['schemes_assistant'],
        executiveSummary: `Formal written loss intimation for ${farmerName} on Khasra ${khasraNo}. Estimated damage: ${damagePercent}% due to ${calamityType}. Required action: Joint field inspection within 10 days.`,
        actionPriorities: claimDraft.nextStepsChecklist.map((step) => ({
          timeframe: 'Mandatory 72-Hour Action',
          recommendation: step,
          caution: 'Obtain stamped physical receipt when submitting letter to Agriculture Office.',
        })),
      });

      onSaveReportToList(report);
      onOpenReport(report);
    } catch (e: any) {
      alert(`Could not export: ${e.message}`);
    }
  };

  const filteredSchemes =
    selectedCategory === 'all'
      ? schemes
      : schemes.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-800 text-white flex items-center justify-center shadow-xs">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {t.schemesAssistant.title}
              </h1>
              <p className="text-xs text-stone-500">
                {t.schemesAssistant.subtitle}
              </p>
            </div>
          </div>

          {/* Segmented Mode Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setActiveTab('claim')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'claim'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              72h PMFBY Loss Claim
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'browse'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Browse Welfare Schemes
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'claim' ? (
        /* PMFBY Loss Claim Assistant */
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" />
                <span>Critical 72-Hour Time Window</span>
              </div>
              <h2 className="text-base font-bold text-stone-900">
                {t.schemesAssistant.pmfbyHelperTitle}
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {t.schemesAssistant.pmfbyDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.schemesAssistant.farmerName}
                </label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.schemesAssistant.phone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'en' ? 'Village & District' : 'स्थान'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.schemesAssistant.cropDamaged}
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.schemesAssistant.khasraNo}
                </label>
                <input
                  type="text"
                  value={khasraNo}
                  onChange={(e) => setKhasraNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.schemesAssistant.insuredArea}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={insuredArea}
                  onChange={(e) => setInsuredArea(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.schemesAssistant.calamityType}
                </label>
                <select
                  value={calamityType}
                  onChange={(e) => setCalamityType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900"
                >
                  <option value="hailstorm">Hailstorm (ओलावृष्टि)</option>
                  <option value="unseasonal_rain">Unseasonal Rain (बेमौसम बारिश)</option>
                  <option value="flood">Inundation / Waterlogging (जलभराव)</option>
                  <option value="drought">Dry Spell (सूखा)</option>
                  <option value="pest_attack">Pest Epidemic (कीट प्रकोप)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.schemesAssistant.damageDate}
                </label>
                <input
                  type="date"
                  value={damageDate}
                  onChange={(e) => setDamageDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.schemesAssistant.damagePercent}
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={damagePercent}
                  onChange={(e) => setDamagePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-700 text-stone-900 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isDrafting}
                onClick={handleGenerateClaim}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-800 hover:bg-indigo-900 disabled:bg-stone-400 rounded-lg transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>{isDrafting ? 'Drafting Official Notice...' : t.schemesAssistant.generateLetterBtn}</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Generated Claim Letter */}
          {claimDraft && (
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">
                    Official Intimation Letter Draft #{claimDraft.surveyOrKhasraNo}
                  </span>
                  <h2 className="text-base font-bold text-stone-900">
                    {t.schemesAssistant.claimDraftTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? t.schemesAssistant.copied : t.schemesAssistant.copyDraft}</span>
                  </button>

                  <button
                    onClick={handleExportClaimReport}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-800 text-white rounded-lg text-xs font-semibold hover:bg-indigo-900 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.schemesAssistant.downloadDraft}</span>
                  </button>
                </div>
              </div>

              {/* Printable Letter Text Body */}
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
                {claimDraft.generatedLetterDraft}
              </div>

              {/* Next Steps Checklist */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs">
                <span className="font-bold text-indigo-950 block">
                  Mandatory Submission Protocol (Within 72 Hours):
                </span>
                <ul className="space-y-1 text-indigo-900">
                  {claimDraft.nextStepsChecklist.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal disclaimer */}
              <div className="p-3 bg-stone-100 text-stone-600 text-[11px] rounded-lg">
                <span className="font-semibold text-stone-800">Notice:</span>{' '}
                {t.schemesAssistant.officialDisclaimer}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Browse Official Welfare Schemes */
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: t.schemesAssistant.allCategories },
              { id: 'insurance', label: 'Crop Insurance' },
              { id: 'direct_benefit', label: 'Direct Benefit (PM-KISAN)' },
              { id: 'subsidy', label: 'Subsidies & Health Cards' },
              { id: 'irrigation', label: 'Micro-Irrigation (Drip)' },
              { id: 'credit', label: 'Kisan Credit Card (KCC)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-800 text-white border-indigo-800'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Schemes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white rounded-xl p-6 border border-stone-200 flex flex-col justify-between space-y-4 text-xs shadow-2xs hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span>{scheme.sponsoredBy}</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                      {scheme.category.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    {scheme.title}
                  </h3>
                  <span className="text-[11px] text-indigo-900 font-medium block mt-0.5">
                    {scheme.titleHindi}
                  </span>

                  <p className="text-stone-600 mt-2 leading-relaxed">
                    {scheme.coverageDetails}
                  </p>

                  <div className="mt-3 pt-3 border-t border-stone-100 space-y-1">
                    <span className="font-semibold text-stone-800 block text-[11px]">
                      {t.schemesAssistant.mandatoryDocs}:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-stone-600 text-[11px]">
                      {scheme.mandatoryDocuments.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  {scheme.helplineNumber && (
                    <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-indigo-700" />
                      <span>{scheme.helplineNumber}</span>
                    </div>
                  )}

                  <a
                    href={scheme.officialPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-800 hover:text-indigo-950 underline underline-offset-4"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
