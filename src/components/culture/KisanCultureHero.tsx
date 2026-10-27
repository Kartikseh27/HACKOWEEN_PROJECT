/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wheat,
  Sun,
  Moon,
  CloudSun,
  Sunrise,
  Sparkles,
  Calculator,
  Stethoscope,
  PhoneCall,
  Volume2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Tractor,
} from 'lucide-react';
import { Language, NavigationTab } from '../../types';
import { KisanVoicePlayer } from './KisanVoicePlayer';

interface KisanCultureHeroProps {
  language: Language;
  defaultLocation: { state: string; district: string; village?: string };
  onSelectTab: (tab: NavigationTab) => void;
  onOpenKendra: () => void;
  onOpenDoctor: () => void;
  onQuickStartPrompt: (promptText: string) => void;
}

interface FolkWisdom {
  verseHi: string;
  author: string;
  meaningHi: string;
  meaningEn: string;
  practicalTipHi: string;
  practicalTipEn: string;
}

const FOLK_WISDOMS: FolkWisdom[] = [
  {
    verseHi: 'घाघ कहावत: "जब बरसेगा उत्तरा, नाज न खाए कुत्तरा।"',
    author: 'कवि घाघ (प्राचीन कृषि मौसम विज्ञानी)',
    meaningHi: 'उत्तरा नक्षत्र में वर्षा होने से रबी की फसल (विशेषकर गेहूं व चना) की पैदावार इतनी प्रचुर होती है कि अन्न के ढेर लग जाते हैं।',
    meaningEn: 'Good showers during Uttara nakshatra guarantee an overflowing bumper harvest of Rabi crops.',
    practicalTipHi: 'खेत में नमी का उचित संरक्षण करें और पहली सिंचाई समय पर दें।',
    practicalTipEn: 'Conserve residual soil moisture and plan the CRI stage irrigation promptly.',
  },
  {
    verseHi: 'भड्डरी कहावत: "माघ के बादर पूस की रात, गेहूं होवे बहुत बिसात।"',
    author: 'ज्योतिषी भड्डरी (पारंपरिक कृषि सूत्र)',
    meaningHi: 'पूस और माघ की ठंडी रातों में कड़ाके की सर्दी गेहूं की फसल में कल्ले फूटने (Tillering) के लिए अमृत समान होती है।',
    meaningEn: 'Crisp cold nights during winter provide optimal vernalization and maximum tiller branching for wheat.',
    practicalTipHi: 'ठंड के समय नाइट्रोजन की संतुलित टॉप-ड्रेसिंग करें, अनावश्यक सिंचाई न करें।',
    practicalTipEn: 'Apply balanced nitrogen top-dressing; avoid excessive waterlogging during cold spells.',
  },
  {
    verseHi: 'कृषि सूक्ति: "खाद पड़े तो खेत, नहीं तो कबाड़ रेत।"',
    author: 'भारतीय लोक कृषि परंपरा',
    meaningHi: 'बिना जैविक खाद व संतुलित पोषक तत्वों के सबसे उपजाऊ खेत भी बंजर रेत समान हो जाता है।',
    meaningEn: 'Without organic matter and balanced soil nutrients, even fertile fields turn barren.',
    practicalTipHi: 'गोबर की सड़ी खाद या केंचुआ खाद (Vermicompost) हर साल कम से कम एक बार जरूर डालें।',
    practicalTipEn: 'Incorporate well-rotted FYM or vermicompost annually to preserve organic carbon.',
  },
  {
    verseHi: 'घाघ कहावत: "उलटे गिरगिट ऊंचे चढ़े, बरखा होय खूब।"',
    author: 'कवि घाघ (प्रकृति संकेत)',
    meaningHi: 'जब प्रकृति में जीव-जंतु असामान्य हलचल करें तो वर्षा का पूर्व संकेत समझकर खेत के जल निकास का प्रबंध कर लेना चाहिए।',
    meaningEn: 'When natural bio-indicators signal rain, secure drainage furrows immediately.',
    practicalTipHi: 'कीटनाशक का छिड़काव 24 घंटे टालें ताकि बारिश में दवा धुल न जाए।',
    practicalTipEn: 'Postpone expensive pesticide spraying if local atmospheric signs indicate rain.',
  },
];

export const KisanCultureHero: React.FC<KisanCultureHeroProps> = ({
  language,
  defaultLocation,
  onSelectTab,
  onOpenKendra,
  onOpenDoctor,
  onQuickStartPrompt,
}) => {
  const [currentWisdomIdx, setCurrentWisdomIdx] = useState(0);

  // Time-aware greeting
  const [greeting, setGreeting] = useState({
    textHi: 'सुप्रभात किसान भाई! राम-राम! 🌾',
    textEn: 'Good Morning, Annadata! Ram-Ram! 🌾',
    subHi: 'नई सुबह, नई उम्मीद · खेत-खलिहान की उन्नति का संकल्प',
    subEn: 'A fresh dawn for Indian Agriculture · Strength to the Hand that Feeds the Nation',
    icon: Sunrise,
    timeColor: 'from-amber-500/20 via-emerald-600/20 to-stone-900',
  });

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 12) {
      setGreeting({
        textHi: '🌅 सुप्रभात किसान भाई! राम-राम!',
        textEn: '🌅 Good Morning, Kisan Bhai! Ram-Ram!',
        subHi: 'नई सुबह, नई उम्मीद · आज के खेत कार्यों की सर्वोत्तम योजना बनाएं',
        subEn: 'Fresh dawn, fertile fields · Plan today’s agricultural operations with confidence',
        icon: Sunrise,
        timeColor: 'from-amber-600/30 via-emerald-900/40 to-stone-950',
      });
    } else if (hours >= 12 && hours < 17) {
      setGreeting({
        textHi: '☀️ दोपहर की राम-राम किसान भाई!',
        textEn: '☀️ Afternoon Greetings, Annadata!',
        subHi: 'खेत में पसीना बहाते अन्नदाता को प्रणाम · फसल व मौसम की ताजा स्थिति देखें',
        subEn: 'Salute to the hardworking farmer · Check live mandi prices and micro-climate advisories',
        icon: Sun,
        timeColor: 'from-yellow-600/20 via-emerald-900/50 to-stone-950',
      });
    } else if (hours >= 17 && hours < 21) {
      setGreeting({
        textHi: '🌾 शुभ संध्या किसान भाई!',
        textEn: '🌾 Good Evening, Kisan Bhai!',
        subHi: 'दिनभर की मेहनत का सम्मान · कल के लिए सिंचाई व छिड़काव का हिसाब लगाएं',
        subEn: 'Respect to a full day of toil · Plan tomorrow’s irrigation & input allocation',
        icon: CloudSun,
        timeColor: 'from-orange-600/30 via-stone-900 to-stone-950',
      });
    } else {
      setGreeting({
        textHi: '🌙 शुभ रात्रि अन्नदाता!',
        textEn: '🌙 Rest Well, Annadata!',
        subHi: 'सुखद विश्राम · आपकी फसलों की सुरक्षा के लिए किसान कल्चर 24 घंटे तत्पर',
        subEn: 'Peaceful night · KISAN CULTURE guards your agronomy and harvest 24/7',
        icon: Moon,
        timeColor: 'from-indigo-950/60 via-stone-900 to-stone-950',
      });
    }
  }, []);

  const currentWisdom = FOLK_WISDOMS[currentWisdomIdx];

  const handleNextWisdom = () => {
    setCurrentWisdomIdx((prev) => (prev + 1) % FOLK_WISDOMS.length);
  };

  const handlePrevWisdom = () => {
    setCurrentWisdomIdx((prev) => (prev - 1 + FOLK_WISDOMS.length) % FOLK_WISDOMS.length);
  };

  const greetingSpeech = language === 'hi'
    ? `${greeting.textHi}. ${greeting.subHi}. ${currentWisdom.verseHi}. ${currentWisdom.meaningHi}`
    : `${greeting.textEn}. ${greeting.subEn}. ${currentWisdom.meaningEn}`;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-amber-900/30 shadow-lg bg-stone-950 text-white">
      {/* Background Hero Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/indian_wheat_farm_1793120997860.jpg"
          alt="Lush green Indian wheat fields"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-25 scale-105 filter brightness-90 contrast-110"
        />
        {/* Subtle traditional tricolor gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-white/80 to-emerald-700" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-5 sm:p-8 lg:p-10 space-y-6">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Wheat className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'किसान संस्कृति | अन्नदाता सुखी भवः' : 'KISAN CULTURE · Farmer First'}</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>ICAR Package of Practices Aligned</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Reader for the farmer */}
            <KisanVoicePlayer
              text={greetingSpeech}
              language={language}
              label={language === 'hi' ? 'आज का संदेश सुनें' : 'Listen Daily Brief'}
              compact
            />

            {/* Current Region Badge */}
            <div className="px-3 py-1 rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 text-xs font-medium">
              📍 {defaultLocation.district}, {defaultLocation.state}
            </div>
          </div>
        </div>

        {/* Dynamic Warm Greeting & Tagline */}
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {language === 'hi' ? greeting.textHi : greeting.textEn}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed max-w-2xl">
            {language === 'hi' ? greeting.subHi : greeting.subEn}
          </p>
        </div>

        {/* Traditional Agricultural Wisdom Ticker (घाघ-भड्डरी की लोक कहावत) */}
        <div className="bg-gradient-to-r from-amber-950/70 via-stone-900/90 to-emerald-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-inner relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'आज की कृषि लोक कहावत (Ancient Ag Wisdom)' : 'Traditional Agricultural Proverb of the Day'}</span>
                <span className="text-[10px] text-stone-400 font-normal">({currentWisdom.author})</span>
              </div>

              <div className="text-sm sm:text-base font-extrabold text-amber-100 italic">
                {currentWisdom.verseHi}
              </div>

              <div className="text-xs text-stone-300 leading-relaxed">
                <strong>{language === 'hi' ? 'सरल अर्थ: ' : 'Meaning: '}</strong>
                {language === 'hi' ? currentWisdom.meaningHi : currentWisdom.meaningEn}
              </div>

              <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5 pt-1">
                <span>🌱 <strong>{language === 'hi' ? 'खेत सलाह: ' : 'Actionable Tip: '}</strong></span>
                <span>{language === 'hi' ? currentWisdom.practicalTipHi : currentWisdom.practicalTipEn}</span>
              </div>
            </div>

            {/* Previous / Next wisdom buttons */}
            <div className="flex items-center gap-1 shrink-0 pt-1">
              <button
                onClick={handlePrevWisdom}
                className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-amber-600/30 text-stone-300 hover:text-white transition-colors"
                title="Previous Wisdom"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-stone-400 font-mono px-1">
                {currentWisdomIdx + 1}/{FOLK_WISDOMS.length}
              </span>
              <button
                onClick={handleNextWisdom}
                className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-amber-600/30 text-stone-300 hover:text-white transition-colors"
                title="Next Wisdom"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Interactive Quick Action Launchers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Quick Launcher 1: Fertilizer & Seed Calculator */}
          <button
            onClick={onOpenKendra}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-emerald-950/80 border border-emerald-700/50 hover:border-amber-400 transition-all text-left group hover:scale-[1.02] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                {language === 'hi' ? 'गणक' : 'Calc'}
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                {language === 'hi' ? 'खेत का हिसाब (खाद-बीज)' : 'Khad & Seed Calc'}
              </div>
              <div className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                {language === 'hi' ? 'यूरिया, डीएपी, बीज व डीजल' : 'Exact bags & diesel costs'}
              </div>
            </div>
          </button>

          {/* Quick Launcher 2: Tap-to-Diagnose Crop Doctor */}
          <button
            onClick={onOpenDoctor}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-900/60 to-stone-900 border border-teal-700/50 hover:border-amber-400 transition-all text-left group hover:scale-[1.02] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-800/80 text-teal-300 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                <Wheat className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                {language === 'hi' ? 'डॉक्टर' : 'Doctor'}
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                {language === 'hi' ? 'फसल लक्षण डॉक्टर' : 'Crop Doctor Wheel'}
              </div>
              <div className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                {language === 'hi' ? 'पत्ती, तना व जड़ रोग' : 'Desi & IPM solutions'}
              </div>
            </div>
          </button>

          {/* Quick Launcher 3: Weather & Spray Safety */}
          <button
            onClick={() => onSelectTab('weather-guardian')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-900/60 to-stone-900 border border-blue-700/50 hover:border-amber-400 transition-all text-left group hover:scale-[1.02] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-800/80 text-blue-300 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                <CloudSun className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">
                {language === 'hi' ? 'मौसम' : 'Weather'}
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                {language === 'hi' ? 'मौसम व छिड़काव विंडो' : 'Weather & Spray Risk'}
              </div>
              <div className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                {language === 'hi' ? 'बारिश व ओलावृष्टि चेतावनी' : '5-day localized forecast'}
              </div>
            </div>
          </button>

          {/* Quick Launcher 4: Universal AI Orchestrator */}
          <button
            onClick={() => onSelectTab('universal-agent')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-900/60 to-stone-900 border border-amber-600/50 hover:border-amber-400 transition-all text-left group hover:scale-[1.02] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-800/80 text-amber-300 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                Universal AI
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                {language === 'hi' ? 'सार्वभौमिक एआई एजेंट' : 'Ask Universal Agent'}
              </div>
              <div className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                {language === 'hi' ? '5 टूल्स का एकसाथ उपयोग' : '5-tool coordinated plan'}
              </div>
            </div>
          </button>
        </div>

        {/* 1-Click Real Indian Field Scenarios */}
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🌾 {language === 'hi' ? 'सच्चे खेत के उदाहरण (1-क्लिक से चलाएं):' : 'Realistic Field Test Scenarios (1-Click Run):'}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              {
                labelHi: '🌱 करनाल: गेहूं की निचली पत्तियां पीली पड़ रही हैं',
                labelEn: '🌱 Karnal: Wheat lower leaves turning yellow',
                tab: 'crop-health' as NavigationTab,
                prompt: 'My wheat crop in Karnal Haryana has lower leaf yellowing chlorosis. Verify if it is Nitrogen deficiency or Yellow Rust and provide ICAR action plan.',
              },
              {
                labelHi: '🌧️ अलवर: सरसों पर ओलावृष्टि — 72 घंटे में PMFBY क्लेम',
                labelEn: '🌧️ Alwar: Mustard hailstorm — PMFBY 72h claim',
                tab: 'schemes-assistant' as NavigationTab,
                prompt: 'Hailstorm damaged my flowering mustard in Alwar Rajasthan yesterday. Guide me through the PMFBY 72-hour crop loss intimation process and evidence checklist.',
              },
              {
                labelHi: '🧪 पंजाब: खारी मिट्टी (pH 8.4) में धान व गेहूं सुधार',
                labelEn: '🧪 Punjab: Alkaline soil (pH 8.4) reclamation',
                tab: 'soil-advisor' as NavigationTab,
                prompt: 'Soil Health Card in Ludhiana shows pH 8.4 and low organic carbon. Suggest gypsum and bio-fertilizer reclamation package.',
              },
              {
                labelHi: '💰 इंदौर: 80 क्विंटल सोयाबीन का मंडी भाव व परिवहन लाभ',
                labelEn: '💰 Indore: 80 Quintal Soybean Mandi Net Profit',
                tab: 'mandi-advisor' as NavigationTab,
                prompt: 'I have 80 quintals of soybean in Indore MP. Compare local mandi vs Ujjain APMC prices after transport deduction.',
              },
            ].map((scen, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onQuickStartPrompt(scen.prompt);
                  onSelectTab(scen.tab);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-950/80 border border-stone-700/70 hover:border-amber-500/60 text-xs text-stone-200 hover:text-white transition-all text-left flex items-center gap-1.5 shadow-2xs"
              >
                <span>{language === 'hi' ? scen.labelHi : scen.labelEn}</span>
                <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

