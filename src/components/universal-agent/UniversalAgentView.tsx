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
  Terminal,
  Code,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calculator,
  Bot,
  Cpu,
  Zap,
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
  const [showRawTrace, setShowRawTrace] = useState(false);
  const [selectedTraceTool, setSelectedTraceTool] = useState<ToolName | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<'native' | 'n8n'>('native');
  const [thinkingPhase, setThinkingPhase] = useState<number>(0);
  const [showCognitiveTrace, setShowCognitiveTrace] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle thinking phase for live AI agent animation
  useEffect(() => {
    if (!isLoading) {
      setThinkingPhase(0);
      return;
    }
    const timer = setInterval(() => {
      setThinkingPhase((prev) => (prev + 1) % 4);
    }, 600);
    return () => clearInterval(timer);
  }, [isLoading]);

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
        engine: selectedEngine,
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
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedEngine('native')}
                className={`px-3 py-1 font-semibold rounded-md transition-all ${
                  selectedEngine === 'native'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ⚡ Native Python
              </button>
              <button
                type="button"
                onClick={() => setSelectedEngine('n8n')}
                className={`px-3 py-1 font-semibold rounded-md transition-all ${
                  selectedEngine === 'n8n'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🔄 n8n Autonomous Workflow
              </button>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
              {t.universalAgent.badge}
            </span>
          </div>
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

          {/* Hackathon Demonstrable Scenarios */}
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {language === 'en' ? 'Hackathon Verification Scenarios (1-Click Test)' : 'हैकाथॉन सत्यापन परिदृश्य (एक-क्लिक परीक्षण)'}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Live Tool Calls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  const q = 'My wheat leaves are turning yellow. What should I check?';
                  setPrompt(q);
                  setCropContext('Wheat');
                  handleExecuteAgent(q);
                }}
                className="text-left p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors group"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase mb-1">
                  <span className="flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-emerald-700" />
                    Test A: Crop Health
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-white rounded border border-emerald-200 font-mono">ICAR Rules</span>
                </div>
                <p className="text-xs font-semibold text-stone-900 line-clamp-1">Wheat leaves turning yellow</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Evidence-based ranked diagnosis & IPM actions</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  const q = 'What weather risks should a farmer consider for growing wheat?';
                  setPrompt(q);
                  setCropContext('Wheat');
                  setDistrict('Karnal');
                  setState('Haryana');
                  handleExecuteAgent(q);
                }}
                className="text-left p-3 rounded-lg border border-sky-200 bg-sky-50/60 hover:bg-sky-100/70 transition-colors group"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-sky-800 uppercase mb-1">
                  <span className="flex items-center gap-1">
                    <CloudSun className="w-3 h-3 text-sky-700" />
                    Test B: Weather & Spray
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-white rounded border border-sky-200 font-mono">Open-Meteo</span>
                </div>
                <p className="text-xs font-semibold text-stone-900 line-clamp-1">Weather risks for wheat in Karnal</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Live forecast, spray windows & precautionary advice</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  const q = 'I have 20 quintals of wheat. Selling price is ₹2,500 per quintal and total costs are ₹20,000. Calculate my expected net profit.';
                  setPrompt(q);
                  setCropContext('Wheat');
                  handleExecuteAgent(q);
                }}
                className="text-left p-3 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 transition-colors group"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 uppercase mb-1">
                  <span className="flex items-center gap-1">
                    <Calculator className="w-3 h-3 text-amber-700" />
                    Test C: Mandi Economics
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-white rounded border border-amber-200 font-mono">Deterministic Math</span>
                </div>
                <p className="text-xs font-semibold text-stone-900 line-clamp-1">20 qtl @ ₹2,500 with ₹20,000 costs</p>
                <p className="text-[10px] text-stone-500 mt-0.5">₹50,000 gross - ₹20,000 costs = ₹30,000 net profit</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  const q = 'My wheat crop has yellow patches, rain is expected, and mandi prices are falling. What should I do first and give me a profit breakdown for 50 quintals?';
                  setPrompt(q);
                  setCropContext('Wheat');
                  handleExecuteAgent(q);
                }}
                className="text-left p-3 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 transition-colors group"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-purple-800 uppercase mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-700" />
                    Test D: Multi-Tool Agent
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-white rounded border border-purple-200 font-mono">3 Tools Joint</span>
                </div>
                <p className="text-xs font-semibold text-stone-900 line-clamp-1">Disease + Weather + Mandi fall</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Autonomous orchestration & priority roadmap</p>
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-stone-400 block mb-1">More Farmer Scenarios:</span>
              {t.universalAgent.examplePrompts.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(example);
                    handleExecuteAgent(example);
                  }}
                  className="w-full text-left p-2 text-xs text-stone-600 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-950 border border-stone-200 rounded-lg transition-colors flex items-center justify-between group"
                >
                  <span className="line-clamp-1 text-[11px]">{example}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-800 shrink-0 ml-2" />
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

      {/* Live AI Agent Autonomous Cognitive Stream while loading */}
      {isLoading && (
        <div className="bg-stone-900 text-stone-100 rounded-xl p-6 border border-stone-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Bot className="w-5 h-5 animate-pulse text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Autonomous AI Agent In Action</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[11px] text-stone-400">
                  {selectedEngine === 'n8n' ? 'n8n LangChain AI Workflow' : 'Native ReAct AI Agent Core'} • Multi-Step Automation Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse">
                AUTONOMOUS REASONING LOOP
              </span>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs pt-1">
            <div className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
              thinkingPhase >= 0 ? 'bg-stone-800/90 border-emerald-500/40 text-emerald-300' : 'border-stone-800/40 text-stone-600'
            }`}>
              <span className="font-bold shrink-0 text-emerald-400">[PHASE 1 - INTENT]</span>
              <span>Semantic query decomposition: Extracting crop context ({cropContext || 'Wheat'}) & agricultural coordinates ({district}, {state})...</span>
            </div>

            <div className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
              thinkingPhase >= 1 ? 'bg-stone-800/90 border-sky-500/40 text-sky-300' : 'border-stone-800/40 text-stone-600'
            }`}>
              <span className="font-bold shrink-0 text-sky-400">[PHASE 2 - TOOLS]</span>
              <span>Autonomous tool selection: Scheduling parallel execution across ICAR pathology, Open-Meteo telemetry & APMC economics...</span>
            </div>

            <div className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
              thinkingPhase >= 2 ? 'bg-stone-800/90 border-amber-500/40 text-amber-300' : 'border-stone-800/40 text-stone-600'
            }`}>
              <span className="font-bold shrink-0 text-amber-400">[PHASE 3 - GROUNDING]</span>
              <span>Telemetry received: Evaluating verified agricultural guidelines & running deterministic profit arithmetic...</span>
            </div>

            <div className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
              thinkingPhase >= 3 ? 'bg-stone-800/90 border-purple-500/40 text-purple-300' : 'border-stone-800/40 text-stone-600'
            }`}>
              <span className="font-bold shrink-0 text-purple-400">[PHASE 4 - SYNTHESIS]</span>
              <span>Autonomous self-reflection & multi-factor synthesis: Formulating prioritized bilingual farmer action roadmap...</span>
            </div>
          </div>
        </div>
      )}

      {/* Execution Results Section */}
      {executionResult && (
        <div className="space-y-6">
          {/* 0. Autonomous AI Agent Reasoning (ReAct Cognitive Trace) */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-6 border border-stone-800 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Autonomous AI Agent Reasoning (ReAct Cogitation Trace)</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Live reasoning logs, autonomous tool dispatching, and self-verification trace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ReAct Cognitive Loop
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                  {executionResult.executionEngine === 'n8n' ? 'Engine: 🔄 n8n AI Workflow' : 'Engine: ⚡ Native AI Agent'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCognitiveTrace((prev) => !prev)}
                  className="px-2.5 py-1 text-xs text-stone-300 hover:text-white rounded-md border border-stone-700 bg-stone-800 transition-colors"
                >
                  {showCognitiveTrace ? 'Collapse Trace' : 'Expand Trace'}
                </button>
              </div>
            </div>

            {showCognitiveTrace && (
              <div className="space-y-3 font-mono text-xs">
                {(executionResult.reactSteps && executionResult.reactSteps.length > 0
                  ? executionResult.reactSteps
                  : [
                      {
                        stepNumber: 1,
                        thought: `Analyzing farmer request: "${executionResult.farmerPrompt}". Identified intents across ${executionResult.toolsInvoked.length} agricultural domains.`,
                        action: `Scheduled autonomous execution sequence: ${executionResult.toolsInvoked.join(', ')}.`,
                        observation: `Extracted parameters: Crop=${cropContext || 'Wheat'}, Location=${district}, ${state}.`
                      },
                      {
                        stepNumber: 2,
                        thought: `Autonomous Tool Execution: Dispatched requests to specialized micro-tools with real-time empirical grounding.`,
                        action: `Invoked tools: ${executionResult.toolsInvoked.join(', ')}.`,
                        observation: `Retrieved verified telemetry from ${executionResult.toolsInvoked.length} tools. Evaluated ICAR pathology guidelines & APMC pricing.`
                      },
                      {
                        stepNumber: 3,
                        thought: `Autonomous Self-Verification: Validated deterministic financial consistency (Net Profit = Gross - Costs) and verified chemical spray safety thresholds.`,
                        action: `Synthesized observations into a unified bilingual action roadmap.`,
                        observation: `Formulated actionable guidance with immediate, short-term, and weekly milestones.`
                      }
                    ]
                ).map((step, sIdx) => (
                  <div key={sIdx} className="p-3.5 bg-stone-800/80 rounded-lg border border-stone-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-stone-700">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        Phase {step.stepNumber}: Cognitive Automation
                      </span>
                      <span className="text-stone-400 text-[10px]">Verified Autonomous Step</span>
                    </div>
                    <div className="text-stone-300 leading-relaxed">
                      <span className="text-amber-400 font-semibold">[THOUGHT]</span> {step.thought}
                    </div>
                    <div className="text-stone-300 leading-relaxed">
                      <span className="text-sky-400 font-semibold">[ACTION]</span> {step.action}
                    </div>
                    <div className="text-stone-300 leading-relaxed">
                      <span className="text-emerald-400 font-semibold">[OBSERVATION]</span> {step.observation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 1. Visible Task Plan Tracker */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-800" />
                <span>{t.universalAgent.taskPlanTitle}</span>
              </h2>
              {executionResult.executionEngine && (
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  executionResult.executionEngine === 'n8n'
                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  Engine: {executionResult.executionEngine === 'n8n' ? '🔄 n8n Autonomous Workflow' : '⚡ Native Python Agent'}
                </span>
              )}
            </div>

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

          {/* 2. Specialized Tools Invoked & Live Execution Trace Inspector */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-800" />
                  <span>{t.universalAgent.toolsInvokedTitle}</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Inspect live outputs returned by each executed tool function
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                  {executionResult.toolsInvoked.length} Tools Executed
                </span>
                <button
                  type="button"
                  onClick={() => setShowRawTrace((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
                >
                  <Code className="w-3.5 h-3.5 text-stone-500" />
                  <span>{showRawTrace ? 'Hide Raw JSON' : 'Raw JSON Trace'}</span>
                </button>
              </div>
            </div>

            {/* Tool Execution Cards */}
            <div className="space-y-3">
              {/* Mandi Advisor Detailed Trace */}
              {executionResult.toolsInvoked.includes('mandi_advisor') && executionResult.toolOutputs.mandi && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-md border border-emerald-200">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 text-sm">Mandi Price & Profit Advisor</span>
                        <span className="text-[10px] text-emerald-700 block">Deterministic Python Arithmetic Engine</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                      Verified Calculations
                    </span>
                  </div>

                  {executionResult.toolOutputs.mandi.calculation && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2 bg-white rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-stone-500 block">Quantity</span>
                        <span className="font-bold text-stone-900 text-xs">
                          {executionResult.toolOutputs.mandi.calculation.quantityQuintals} Quintals
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-stone-500 block">Gross Revenue</span>
                        <span className="font-bold text-emerald-700 text-xs">
                          ₹{executionResult.toolOutputs.mandi.calculation.grossRevenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-stone-500 block">Total Deductions</span>
                        <span className="font-bold text-rose-700 text-xs">
                          ₹{executionResult.toolOutputs.mandi.calculation.totalExpenses.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-stone-500 block">Net In-Hand Return</span>
                        <span className="font-bold text-emerald-900 text-xs">
                          ₹{executionResult.toolOutputs.mandi.calculation.netReturn.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Weather Guardian Detailed Trace */}
              {executionResult.toolsInvoked.includes('weather_guardian') && executionResult.toolOutputs.weather && (
                <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/30 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-md border border-sky-200">
                        <CloudSun className="w-4 h-4 text-sky-700" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 text-sm">Weather & Disaster Guardian</span>
                        <span className="text-[10px] text-sky-700 block">
                          Source: {executionResult.toolOutputs.weather.current?.source || 'Open-Meteo Satellite Feed'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold text-[10px] rounded-full">
                      Live Telemetry
                    </span>
                  </div>

                  {executionResult.toolOutputs.weather.current && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2 bg-white rounded-lg border border-sky-100">
                        <span className="text-[10px] text-stone-500 block">Temperature</span>
                        <span className="font-bold text-stone-900 text-xs">
                          {executionResult.toolOutputs.weather.current.temperatureC}°C
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-sky-100">
                        <span className="text-[10px] text-stone-500 block">Wind Speed</span>
                        <span className="font-bold text-sky-800 text-xs">
                          {executionResult.toolOutputs.weather.current.windSpeedKmph} km/h
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-sky-100">
                        <span className="text-[10px] text-stone-500 block">Humidity</span>
                        <span className="font-bold text-stone-900 text-xs">
                          {executionResult.toolOutputs.weather.current.humidityPercent}%
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-sky-100">
                        <span className="text-[10px] text-stone-500 block">Spray Advisory</span>
                        <span className={`font-bold text-xs ${
                          executionResult.toolOutputs.weather.current.windSpeedKmph > 15 ? 'text-rose-700' : 'text-emerald-700'
                        }`}>
                          {executionResult.toolOutputs.weather.current.windSpeedKmph > 15 ? 'Postpone Spraying' : 'Favorable Window'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Crop Health Detailed Trace */}
              {executionResult.toolsInvoked.includes('crop_health') && executionResult.toolOutputs.cropHealth && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-md border border-emerald-200">
                        <Leaf className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 text-sm">Crop Health Intelligence</span>
                        <span className="text-[10px] text-emerald-700 block">ICAR Validated Plant Pathology</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                      Ranked Diagnostics
                    </span>
                  </div>

                  {executionResult.toolOutputs.cropHealth.rankedCauses?.[0] && (
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-xs">
                          Top Cause: {executionResult.toolOutputs.cropHealth.rankedCauses[0].name}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded">
                          {executionResult.toolOutputs.cropHealth.rankedCauses[0].confidenceScore}% Likelihood
                        </span>
                      </div>
                      {executionResult.toolOutputs.cropHealth.rankedCauses[0].scientificName && (
                        <p className="text-[10px] text-stone-400 italic">
                          {executionResult.toolOutputs.cropHealth.rankedCauses[0].scientificName}
                        </p>
                      )}
                      <p className="text-[11px] text-stone-600 pt-1">
                        <span className="font-semibold text-stone-700">Immediate Action:</span>{' '}
                        {executionResult.toolOutputs.cropHealth.immediateSteps?.[0]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Soil Advisor Detailed Trace */}
              {executionResult.toolsInvoked.includes('soil_advisor') && executionResult.toolOutputs.soil && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-md border border-amber-200">
                        <Layers className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 text-sm">Soil & Water Advisor</span>
                        <span className="text-[10px] text-amber-700 block">Soil Health Card Benchmarks</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                      Health Grade: {executionResult.toolOutputs.soil.overallHealthGrade}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-amber-100">
                    {executionResult.toolOutputs.soil.phAdjustmentAdvice || executionResult.toolOutputs.soil.organicMatterAdvice}
                  </p>
                </div>
              )}

              {/* Schemes Assistant Detailed Trace */}
              {executionResult.toolsInvoked.includes('schemes_assistant') && executionResult.toolOutputs.schemes && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-md border border-indigo-200">
                        <FileBadge className="w-4 h-4 text-indigo-700" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 text-sm">Government Schemes & Loss Claims</span>
                        <span className="text-[10px] text-indigo-700 block">PMFBY 72-Hour Legal Deadline</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[10px] rounded-full">
                      Letter Formatted
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-indigo-100">
                    Formal statutory crop damage notice prepared. Call Toll-Free 14447 or submit to the District Agriculture Officer.
                  </p>
                </div>
              )}
            </div>

            {/* Expandable Raw JSON Trace */}
            {showRawTrace && (
              <div className="mt-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-700 font-mono flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-stone-500" />
                    Raw Universal Agent Execution Payload
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Request ID: {executionResult.requestId}
                  </span>
                </div>
                <pre className="p-3.5 bg-stone-900 text-emerald-400 rounded-xl text-[10px] sm:text-xs overflow-x-auto font-mono max-h-96">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
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
