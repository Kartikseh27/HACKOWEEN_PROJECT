/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  NavigationTab,
  Language,
  FarmerReport,
  ConversationSession,
} from '../../types';
import { translations } from '../../i18n/translations';
import {
  Sparkles,
  Leaf,
  CloudSun,
  Layers,
  TrendingUp,
  FileBadge,
  Upload,
  ArrowRight,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MapPin,
} from 'lucide-react';

interface DashboardViewProps {
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  onOpenReport: (report: FarmerReport) => void;
  recentReports: FarmerReport[];
  recentSessions: ConversationSession[];
  onQuickStartPrompt: (promptText: string) => void;
  defaultLocation: { state: string; district: string };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  language,
  onOpenReport,
  recentReports,
  recentSessions,
  onQuickStartPrompt,
  defaultLocation,
}) => {
  const t = translations[language];
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickStartPrompt(quickInput);
    onSelectTab('universal-agent');
  };

  const featureCards = [
    {
      id: 'crop-health' as NavigationTab,
      title: t.nav.cropHealth,
      subtitle: language === 'en' ? 'Computer vision & symptom inspection for early disease detection' : 'पत्ती और फसल के लक्षणों की एआई जांच और प्राथमिक जैविक उपचार',
      image: '/src/assets/images/crop_health_inspection_1793120997803.jpg',
      badge: 'Feature 01',
      icon: Leaf,
    },
    {
      id: 'weather-guardian' as NavigationTab,
      title: t.nav.weatherGuardian,
      subtitle: language === 'en' ? 'Hyperlocal risks, 5-day advisories for spraying, irrigation, and harvest' : 'अति-स्थानीय मौसम जोखिम और छिड़काव, बुवाई व कटाई की कार्ययोजना',
      badge: 'Feature 02',
      icon: CloudSun,
    },
    {
      id: 'soil-advisor' as NavigationTab,
      title: t.nav.soilAdvisor,
      subtitle: language === 'en' ? 'Soil Health Card interpretation, texture feel guides, and pH reclamation' : 'मृदा स्वास्थ्य कार्ड विश्लेषण, बनावट परीक्षण और भूमि सुधार योजना',
      image: '/src/assets/images/soil_testing_sample_1793120999484.jpg',
      badge: 'Feature 03',
      icon: Layers,
    },
    {
      id: 'mandi-advisor' as NavigationTab,
      title: t.nav.mandiAdvisor,
      subtitle: language === 'en' ? 'APMC price discovery, transport deductions, and net realization calculator' : 'एपीएमसी मंडियों के भाव, परिवहन कटौती और शुद्ध लाभ की गणना',
      image: '/src/assets/images/indian_mandi_market_1793120999517.jpg',
      badge: 'Feature 04',
      icon: TrendingUp,
    },
    {
      id: 'schemes-assistant' as NavigationTab,
      title: t.nav.schemesAssistant,
      subtitle: language === 'en' ? 'PMFBY 72-hour crop loss intimation helper & welfare database' : 'पीएमएफबीवाई 72-घंटे का फसल क्षति सूचना पत्र और सरकारी योजनाएं',
      badge: 'Feature 05',
      icon: FileBadge,
    },
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Hero Welcome Card with Indian Farm Landscape */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-900 text-white min-h-[320px] flex flex-col justify-end">
        {/* Background photo */}
        <img
          src="/src/assets/images/indian_wheat_farm_1793120997860.jpg"
          alt="Lush green and golden wheat crop fields in Haryana India"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/60 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Agentic Agricultural Intelligence · ICAR Aligned</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {t.tagline}
          </h1>

          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-2xl">
            {t.subTagline}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Default Region: {defaultLocation.district}, {defaultLocation.state}
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <span>5 Specialized Tools</span>
            <span aria-hidden="true">·</span>
            <span>1 Universal Agent</span>
          </div>
        </div>
      </div>

      {/* Prominent Universal AI Agent Quick-Start Input */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h2 className="text-base font-bold text-stone-900">
              {language === 'en' ? 'Ask Universal AI Agent' : 'सार्वभौमिक एआई एजेंट से पूछें'}
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {language === 'en' ? 'Orchestrates 5 Tools' : 'पाँचों टूल्स का समन्वयक'}
          </span>
        </div>

        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder={t.dashboard.agentQuickPromptPlaceholder}
              className="w-full px-4 py-3.5 pr-32 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 text-stone-900 placeholder:text-stone-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
            >
              <span>{t.dashboard.askAgentBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Dropzone shortcut */}
        <div
          onClick={() => onSelectTab('universal-agent')}
          className="border-2 border-dashed border-stone-200 hover:border-emerald-600 rounded-xl p-4 text-center cursor-pointer bg-stone-50/50 hover:bg-emerald-50/20 transition-colors flex items-center justify-center gap-3"
        >
          <Upload className="w-4 h-4 text-emerald-800" />
          <div className="text-left">
            <span className="text-xs font-semibold text-stone-800 block">
              {t.dashboard.dropzoneTitle}
            </span>
            <span className="text-[11px] text-stone-500 block">
              {t.dashboard.dropzoneSub}
            </span>
          </div>
        </div>
      </div>

      {/* Five Specialized Agricultural Intelligence Feature Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            {t.dashboard.toolsTitle}
          </h2>
          <p className="text-xs text-stone-500">
            {t.dashboard.toolsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onSelectTab(card.id)}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs hover:border-emerald-700/60 transition-all cursor-pointer group flex flex-col justify-between"
              >
                {card.image && (
                  <div className="h-40 bg-stone-100 overflow-hidden relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-900/70 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                      {card.badge}
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {!card.image && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {card.badge}
                        </span>
                        <Icon className="w-5 h-5 text-emerald-800" />
                      </div>
                    )}

                    <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-950">
                    <span>
                      {language === 'en' ? 'Launch Tool' : 'टूल प्रारंभ करें'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How KISAN CULTURE Works */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-stone-900 tracking-tight">
            {t.dashboard.howItWorksTitle}
          </h2>
          <p className="text-xs text-stone-500">
            {language === 'en'
              ? 'Engineered specifically for Indian smallholder and progressive farmers.'
              : 'भारतीय किसानों की जमीनी वास्तविकताओं के अनुसार तैयार की गई प्रणाली।'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
            <span className="font-bold text-emerald-900 block text-sm">
              {t.dashboard.step1Title}
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {t.dashboard.step1Desc}
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
            <span className="font-bold text-emerald-900 block text-sm">
              {t.dashboard.step2Title}
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {t.dashboard.step2Desc}
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
            <span className="font-bold text-emerald-900 block text-sm">
              {t.dashboard.step3Title}
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {t.dashboard.step3Desc}
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
            <span className="font-bold text-emerald-900 block text-sm">
              {t.dashboard.step4Title}
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {t.dashboard.step4Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Generated Reports Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            {t.dashboard.recentReports}
          </h2>
          <button
            onClick={() => onSelectTab('reports')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>{t.dashboard.viewAllReports}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentReports.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p>{t.dashboard.noReportsYet}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReports.slice(0, 2).map((rep) => (
              <div
                key={rep.reportId}
                onClick={() => onOpenReport(rep)}
                className="p-4 rounded-xl border border-stone-200 hover:border-emerald-300 cursor-pointer bg-stone-50/50 hover:bg-emerald-50/20 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>{rep.reportId}</span>
                  <span>{rep.generatedAt}</span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm">{rep.title}</h3>
                <p className="text-stone-600 line-clamp-2 leading-relaxed">
                  {rep.executiveSummary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
