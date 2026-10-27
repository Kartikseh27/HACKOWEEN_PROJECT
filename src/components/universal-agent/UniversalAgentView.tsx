/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Language,
  UniversalAgentExecutionResult,
  UploadedFileMeta,
  FarmerReport,
  ToolName,
} from '../../types';
import { translations } from '../../i18n/translations';
import { api } from '../../services/api';
import { KisanVoicePlayer } from '../culture/KisanVoicePlayer';
import {
  Sparkles,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Printer,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Activity,
  Layers,
  Leaf,
  CloudSun,
  TrendingUp,
  FileBadge,
} from 'lucide-react';

interface UniversalAgentViewProps {
  language: Language;
  onOpenReport: (report: FarmerReport) => void;
  onSaveReportToList: (report: FarmerReport) => void;
  defaultLocation: { state: string; district: string };
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const UniversalAgentView: React.FC<UniversalAgentViewProps> = ({
  language,
  onOpenReport,
  onSaveReportToList,
  defaultLocation,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const t = translations[language];
  const [prompt, setPrompt] = useState(initialPrompt || '');

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);
  const [cropContext, setCropContext] = useState('Wheat');
  const [state, setState] = useState(defaultLocation.state);
  const [district, setDistrict] = useState(defaultLocation.district);
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<UniversalAgentExecutionResult | null>(null);
  const [approvedActions, setApprovedActions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file uploads with preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        alert(`${file.name} is larger than 25MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        const newFile: UploadedFileMeta = {
          id: `FILE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: file.type.startsWith('image/') ? base64 : undefined,
          base64Data: base64,
        };
        setFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Run the Universal Agent
  const handleExecuteAgent = async (overridePrompt?: string) => {
    const textToRun = overridePrompt || prompt;
    if (!textToRun.trim()) {
      setErrorMessage(language === 'en' ? 'Please describe your crop situation or question.' : 'कृपया अपनी फसल की समस्या या प्रश्न दर्ज करें।');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await api.orchestrateAgent({
        prompt: textToRun,
        location: { state, district },
        cropContext,
        files,
        language,
      });

      setExecutionResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Universal Agent encountered an execution error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate formal report artifact
  const handleGenerateReport = async () => {
    if (!executionResult) return;

    try {
      const report = await api.generateReport({
        title: `${cropContext} Multi-Domain Agronomic Intelligence Dossier`,
        farmerLocation: { state, district },
        cropName: cropContext,
        toolsUsed: executionResult.toolsInvoked,
        executiveSummary: executionResult.integratedSynthesis,
        actionPriorities: executionResult.actionRoadmap.map((r) => ({
          timeframe: r.priority,
          recommendation: r.action,
          caution: r.riskIfNotDone,
        })),
      });

      onSaveReportToList(report);
      onOpenReport(report);
    } catch (err: any) {
      alert(`Could not generate report: ${err.message}`);
    }
  };

  const handleApproveAction = (actionId: string) => {
    setApprovedActions((prev) => [...prev, actionId]);
  };

  const getToolIcon = (toolName: ToolName) => {
    switch (toolName) {
      case 'crop_health':
        return <Leaf className="w-4 h-4 text-emerald-600" />;
      case 'weather_guardian':
        return <CloudSun className="w-4 h-4 text-sky-600" />;
      case 'soil_advisor':
        return <Layers className="w-4 h-4 text-amber-700" />;
      case 'mandi_advisor':
        return <TrendingUp className="w-4 h-4 text-emerald-700" />;
      case 'schemes_assistant':
        return <FileBadge className="w-4 h-4 text-indigo-600" />;
      default:
        return <Activity className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {t.universalAgent.title}
              </h1>
              <p className="text-xs text-stone-500">
                {t.universalAgent.description}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
            {t.universalAgent.badge}
          </span>
        </div>

        {/* Query Input Box */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {language === 'en' ? 'Crop' : 'फसल'}
              </label>
              <input
                type="text"
                value={cropContext}
                onChange={(e) => setCropContext(e.target.value)}
                placeholder="e.g. Wheat, Paddy, Mustard"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {language === 'en' ? 'State' : 'राज्य'}
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Haryana"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {language === 'en' ? 'District' : 'ज़िला'}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Karnal"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.universalAgent.inputPlaceholder}
              className="w-full p-4 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Uploaded Attachments Preview */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-1.5 pr-2.5 bg-stone-100 rounded-lg border border-stone-200 text-xs text-stone-800"
                >
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded object-cover border border-stone-300"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-stone-500" />
                  )}
                  <span className="max-w-[140px] truncate font-medium text-[11px]">{file.name}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4 text-stone-600" />
                <span>{t.universalAgent.attachFiles}</span>
              </button>

              {prompt && (
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('');
                    setFiles([]);
                    setExecutionResult(null);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 px-2.5 py-1.5"
                >
                  {t.universalAgent.clearSession}
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleExecuteAgent()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 rounded-lg transition-colors shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>{t.universalAgent.running}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.universalAgent.runAgent}</span>
                </>
              )}
            </button>
          </div>

          {/* Example prompt pills */}
          <div className="pt-3">
            <div className="text-[11px] font-semibold text-stone-500 mb-2">
              {language === 'en' ? 'Click a real farmer scenario to test orchestration:' : 'एजेंट का परीक्षण करने के लिए उदाहरण चुनें:'}
            </div>
            <div className="space-y-1.5">
              {t.universalAgent.examplePrompts.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(example);
                    handleExecuteAgent(example);
                  }}
                  className="w-full text-left p-2.5 text-xs text-stone-700 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-950 border border-stone-200 rounded-lg transition-colors flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{example}</span>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-800 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Execution Results Section */}
      {executionResult && (
        <div className="space-y-6">
          {/* 1. Visible Task Plan Tracker */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-800" />
              <span>{t.universalAgent.taskPlanTitle}</span>
            </h2>

            <div className="space-y-3">
              {executionResult.plan.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200/80 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">{step.label}</span>
                      {step.durationMs && (
                        <span className="text-[11px] text-stone-600 tabular-nums font-mono">
                          {step.durationMs}ms
                        </span>
                      )}
                    </div>
                    {step.details && (
                      <p className="text-stone-600 mt-0.5 text-[11px]">{step.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Specialized Tools Invoked */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-800" />
                <span>{t.universalAgent.toolsInvokedTitle}</span>
              </h2>
              <span className="text-xs text-stone-500">
                {executionResult.toolsInvoked.length} tools dynamically selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {executionResult.toolsInvoked.map((tool) => (
                <div
                  key={tool}
                  className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-lg flex items-center gap-3 text-xs"
                >
                  <div className="p-2 bg-white rounded-md shadow-2xs border border-emerald-100">
                    {getToolIcon(tool)}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 block capitalize">
                      {tool.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-emerald-800">Executed & Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Consolidated Agricultural Intelligence & Reasoning */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t.universalAgent.synthesisTitle}</span>
              </h2>
              <KisanVoicePlayer
                text={executionResult.integratedSynthesis}
                language={language}
                label={language === 'hi' ? 'सलाह बोलकर सुनें' : 'Listen Synthesis'}
                compact
              />
            </div>
            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 whitespace-pre-line bg-stone-50 p-4 rounded-xl border border-stone-200/60">
              {executionResult.integratedSynthesis}
            </div>
          </div>

          {/* 4. Prioritized Farmer Action Roadmap */}
          {executionResult.actionRoadmap.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-stone-200">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                <span>{t.universalAgent.actionPlanTitle}</span>
              </h2>

              <div className="space-y-3">
                {executionResult.actionRoadmap.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-stone-200 bg-white shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.priority.includes('Today')
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.priority.includes('2-3')
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-stone-400 font-mono text-[11px]">
                          via {item.responsibleTool.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="font-semibold text-stone-900 text-sm">{item.action}</p>
                      {item.riskIfNotDone && (
                        <p className="text-[11px] text-stone-500">
                          <span className="text-rose-700 font-medium">Risk if delayed:</span>{' '}
                          {item.riskIfNotDone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Consequential Actions Pending Approval */}
          {executionResult.consequentialActionsPendingApproval &&
            executionResult.consequentialActionsPendingApproval.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-300">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                  <span>{t.universalAgent.approvalRequiredTitle}</span>
                </div>
                <p className="text-xs text-amber-800 mb-4">
                  The agent requires your explicit confirmation before transmitting records or submitting claims to external government gateways.
                </p>

                <div className="space-y-3">
                  {executionResult.consequentialActionsPendingApproval.map((action) => {
                    const isApproved = approvedActions.includes(action.actionId);

                    return (
                      <div
                        key={action.actionId}
                        className="bg-white p-4 rounded-lg border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-stone-900">{action.title}</span>
                          <p className="text-stone-600 mt-0.5">{action.description}</p>
                          <span className="text-[10px] text-stone-400 block mt-1">
                            Target: {action.targetService}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approved by Farmer
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApproveAction(action.actionId)}
                                className="px-3.5 py-1.5 bg-emerald-800 text-white font-semibold rounded-lg hover:bg-emerald-900 transition-colors"
                              >
                                {t.universalAgent.approveBtn}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* 6. Missing Information & Follow-Up Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {executionResult.missingInformationIdentified.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-stone-200 text-xs">
                <h3 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{t.universalAgent.missingInfoTitle}</span>
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  {executionResult.missingInformationIdentified.map((info, i) => (
                    <li key={i}>{info}</li>
                  ))}
                </ul>
              </div>
            )}

            {executionResult.followUpQuestions.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-stone-200 text-xs">
                <h3 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  <span>{t.universalAgent.followUpQuestionsTitle}</span>
                </h3>
                <div className="space-y-1.5">
                  {executionResult.followUpQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPrompt(q);
                        handleExecuteAgent(q);
                      }}
                      className="w-full text-left p-2 rounded bg-stone-50 hover:bg-emerald-50 text-stone-800 transition-colors flex items-center justify-between"
                    >
                      <span className="line-clamp-1">{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. Action Bar: Generate Printable Report Artifact */}
          <div className="p-4 bg-emerald-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-bold text-sm block">
                {language === 'en'
                  ? 'Official Farmer Advisory Dossier Ready'
                  : 'आधिकारिक किसान कृषि रिपोर्ट तैयार है'}
              </span>
              <span className="text-xs text-emerald-200">
                {language === 'en'
                  ? 'Generate a clean, structured printable report with agronomic findings and KVK review sections.'
                  : 'निरीक्षण, मौसम और कार्ययोजना के साथ प्रिंट करने योग्य रिपोर्ट प्राप्त करें।'}
              </span>
            </div>

            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-950 font-bold text-xs rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4 text-emerald-800" />
              <span>{t.universalAgent.generateReportBtn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
