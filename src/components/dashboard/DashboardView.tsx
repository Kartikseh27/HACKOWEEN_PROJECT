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
  ChevronRight,
  FileText,
  Calculator,
  Wheat,
} from 'lucide-react';

import { KisanCultureHero } from '../culture/KisanCultureHero';
import { MandiLiveTicker } from '../culture/MandiLiveTicker';
import { KisanHelplineBar } from '../culture/KisanHelplineBar';
import { KisanKendraModal } from '../culture/KisanKendraModal';
import { CropDoctorModal } from '../culture/CropDoctorModal';

interface DashboardViewProps {
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  onOpenReport: (report: FarmerReport) => void;
  recentReports: FarmerReport[];
  recentSessions: ConversationSession[];
  onQuickStartPrompt: (promptText: string) => void;
  defaultLocation: { state: string; district: string; village?: string };
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

  // Modals state
  const [isKendraOpen, setIsKendraOpen] = useState(false);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickStartPrompt(quickInput);
    onSelectTab('universal-agent');
  };

  const handleSymptomSelectForAI = (symptomName: string, crop: string) => {
    const prompt = `Inspect observed symptom: "${symptomName}" for ${crop} in ${defaultLocation.district}, ${defaultLocation.state}. Provide ICAR diagnosis, cause breakdown, and prioritized cultural/chemical spray plan.`;
    onQuickStartPrompt(prompt);
    onSelectTab('crop-health');
  };

  const featureCards = [
    {
      id: 'crop-health' as NavigationTab,
      title: t.nav.cropHealth,
      subtitle:
        language === 'en'
          ? 'Computer vision & symptom inspection for early disease detection and IPM organic recipes'
          : 'पत्ती और फसल के लक्षणों की एआई जांच, जैविक नुस्खे और रासायनिक छिड़काव समाधान',
      image: '/src/assets/images/crop_health_inspection_1793120997803.jpg',
      badge: language === 'hi' ? 'विशेषज्ञ टूल 01' : 'Feature 01',
      icon: Leaf,
    },
    {
      id: 'weather-guardian' as NavigationTab,
      title: t.nav.weatherGuardian,
      subtitle:
        language === 'en'
          ? 'Hyperlocal risks, 5-day advisories for spraying, irrigation, and frost/hail warnings'
          : 'अति-स्थानीय मौसम जोखिम, छिड़काव अनुकूलता मीटर और पाला/ओलावृष्टि चेतावनी',
      badge: language === 'hi' ? 'विशेषज्ञ टूल 02' : 'Feature 02',
      icon: CloudSun,
    },
    {
      id: 'soil-advisor' as NavigationTab,
      title: t.nav.soilAdvisor,
      subtitle:
        language === 'en'
          ? 'Soil Health Card interpretation, texture feel guides, and pH gypsum reclamation'
          : 'मृदा स्वास्थ्य कार्ड विश्लेषण, बनावट परीक्षण और क्षारीय/अम्लीय भूमि सुधार योजना',
      image: '/src/assets/images/soil_testing_sample_1793120999484.jpg',
      badge: language === 'hi' ? 'विशेषज्ञ टूल 03' : 'Feature 03',
      icon: Layers,
    },
    {
      id: 'mandi-advisor' as NavigationTab,
      title: t.nav.mandiAdvisor,
      subtitle:
        language === 'en'
          ? 'APMC price discovery, transport deductions, MSP delta, and net realization calculator'
          : 'एपीएमसी मंडियों के लाइव भाव, परिवहन कटौती, एमएसपी तुलना और शुद्ध लाभ की गणना',
      image: '/src/assets/images/indian_mandi_market_1793120999517.jpg',
      badge: language === 'hi' ? 'विशेषज्ञ टूल 04' : 'Feature 04',
      icon: TrendingUp,
    },
    {
      id: 'schemes-assistant' as NavigationTab,
      title: t.nav.schemesAssistant,
      subtitle:
        language === 'en'
          ? 'PMFBY 72-hour crop loss intimation helper, document checklist & welfare database'
          : 'पीएमएफबीवाई 72-घंटे का फसल क्षति सूचना पत्र, दस्तावेज चेकलिस्ट और सरकारी योजनाएं',
      badge: language === 'hi' ? 'विशेषज्ञ टूल 05' : 'Feature 05',
      icon: FileBadge,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Live Mandi Prices Bar */}
      <MandiLiveTicker
        language={language}
        onOpenMandiAdvisor={() => onSelectTab('mandi-advisor')}
      />

      {/* 2. Cultural Farm Greeting & Folk Wisdom Hero */}
      <KisanCultureHero
        language={language}
        defaultLocation={defaultLocation}
        onSelectTab={onSelectTab}
        onOpenKendra={() => setIsKendraOpen(true)}
        onOpenDoctor={() => setIsDoctorOpen(true)}
        onQuickStartPrompt={onQuickStartPrompt}
      />

      {/* 3. Prominent Universal AI Agent Quick-Start Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-amber-800 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 leading-tight">
                {language === 'en' ? 'Ask Universal AI Agent' : 'सार्वभौमिक किसान एआई से पूछें'}
              </h2>
              <p className="text-[11px] text-stone-500">
                {language === 'en'
                  ? 'Autonomous reasoning engine that orchestrates all 5 agronomy tools in one run'
                  : 'फसल स्वास्थ्य, मौसम, खाद, मंडी और सरकारी बीमा को एक साथ हल करने वाला एआई'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsKendraOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-700 bg-stone-50 hover:bg-emerald-50 text-xs font-bold text-stone-800 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-800" />
              <span>{language === 'hi' ? 'खाद-बीज हिसाब' : 'Field Calculators'}</span>
            </button>

            <button
              onClick={() => setIsDoctorOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-teal-700 bg-stone-50 hover:bg-teal-50 text-xs font-bold text-stone-800 transition-colors"
            >
              <Wheat className="w-3.5 h-3.5 text-teal-800" />
              <span>{language === 'hi' ? 'फसल डॉक्टर' : 'Crop Doctor'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder={t.dashboard.agentQuickPromptPlaceholder}
              className="w-full px-4 py-3.5 pr-36 text-xs sm:text-sm border border-stone-300 rounded-2xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 text-stone-900 placeholder:text-stone-400 font-medium"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>{t.dashboard.askAgentBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Dropzone shortcut */}
        <div
          onClick={() => onSelectTab('universal-agent')}
          className="border-2 border-dashed border-stone-200 hover:border-emerald-600 rounded-2xl p-4 text-center cursor-pointer bg-stone-50/50 hover:bg-emerald-50/20 transition-colors flex items-center justify-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-stone-800 block">
              {t.dashboard.dropzoneTitle}
            </span>
            <span className="text-[11px] text-stone-500 block">
              {t.dashboard.dropzoneSub}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Five Specialized Agricultural Intelligence Feature Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-stone-900 tracking-tight">
              {t.dashboard.toolsTitle}
            </h2>
            <p className="text-xs text-stone-500">
              {t.dashboard.toolsSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onSelectTab(card.id)}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:border-emerald-700/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                {card.image && (
                  <div className="h-40 bg-stone-100 overflow-hidden relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
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
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
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
                      {language === 'en' ? 'Launch Dedicated Tool' : 'टूल प्रारंभ करें'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Kisan Emergency Helplines Bar */}
      <KisanHelplineBar language={language} />

      {/* 6. How KISAN CULTURE Works */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-stone-900 tracking-tight">
            {t.dashboard.howItWorksTitle}
          </h2>
          <p className="text-xs text-stone-500">
            {language === 'en'
              ? 'Engineered specifically for Indian smallholder and progressive farmers with grounded ICAR agronomic rules.'
              : 'भारतीय किसानों की जमीनी वास्तविकताओं के अनुसार तैयार की गई वैज्ञानिक कार्यप्रणाली।'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 hover:border-emerald-300 transition-colors">
            <span className="font-bold text-emerald-950 block text-sm">
              {t.dashboard.step1Title}
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {t.dashboard.step1Desc}
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 hover:border-emerald-300 transition-colors">
            <span className="font-bold text-emerald-950 block text-sm">
              {t.dashboard.step2Title}
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {t.dashboard.step2Desc}
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 hover:border-emerald-300 transition-colors">
            <span className="font-bold text-emerald-950 block text-sm">
              {t.dashboard.step3Title}
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {t.dashboard.step3Desc}
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 hover:border-emerald-300 transition-colors">
            <span className="font-bold text-emerald-950 block text-sm">
              {t.dashboard.step4Title}
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {t.dashboard.step4Desc}
            </p>
          </div>
        </div>
      </div>

      {/* 7. Recent Generated Reports Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-stone-900">
              {t.dashboard.recentReports}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'hi' ? 'आपके द्वारा तैयार की गई विस्तृत कृषि कार्ययोजनाएं' : 'Comprehensive agronomic advisory dossiers'}
            </p>
          </div>
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
                className="p-5 rounded-2xl border border-stone-200 hover:border-emerald-400 cursor-pointer bg-stone-50/50 hover:bg-emerald-50/20 transition-all text-xs space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">{rep.reportId}</span>
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

      {/* Modals */}
      <KisanKendraModal
        isOpen={isKendraOpen}
        onClose={() => setIsKendraOpen(false)}
        language={language}
      />

      <CropDoctorModal
        isOpen={isDoctorOpen}
        onClose={() => setIsDoctorOpen(false)}
        language={language}
        onSelectSymptomForAI={handleSymptomSelectForAI}
      />
    </div>
  );
};
