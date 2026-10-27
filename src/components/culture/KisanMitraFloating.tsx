/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  MessageCircle,
  Calculator,
  Wheat,
  PhoneCall,
  Volume2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Language, NavigationTab } from '../../types';

interface KisanMitraFloatingProps {
  language: Language;
  onOpenKendra: () => void;
  onOpenDoctor: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onQuickStartPrompt: (prompt: string) => void;
}

export const KisanMitraFloating: React.FC<KisanMitraFloatingProps> = ({
  language,
  onOpenKendra,
  onOpenDoctor,
  onSelectTab,
  onQuickStartPrompt,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickQuestions = [
    {
      qHi: '🌾 गेहूं में पीलापन आ रहा है, क्या करूं?',
      qEn: '🌾 Wheat turning yellow, what should I do?',
      prompt: 'My wheat crop leaves are turning yellow. Diagnose whether it is Nitrogen deficiency or Yellow Rust and provide step-by-step ICAR recommendations.',
      tab: 'crop-health' as NavigationTab,
    },
    {
      qHi: '☀️ आज कीटनाशक छिड़काव का सही समय है क्या?',
      qEn: '☀️ Is today safe for pesticide spray?',
      prompt: 'Check wind speed, rain probability, and spray window for my district today.',
      tab: 'weather-guardian' as NavigationTab,
    },
    {
      qHi: '⚖️ मेरी 2 एकड़ जमीन में कितनी बोरी खाद लगेगी?',
      qEn: '⚖️ How many bags of fertilizer for 2 acres?',
      action: onOpenKendra,
    },
    {
      qHi: '🌧️ ओलावृष्टि से नुकसान हुआ, 72 घंटे में कैसे क्लेम करें?',
      qEn: '🌧️ Hailstorm damage, how to report in 72 hours?',
      prompt: 'My crop suffered sudden hailstorm damage. Guide me on filing PMFBY crop loss intimation within 72 hours.',
      tab: 'schemes-assistant' as NavigationTab,
    },
  ];

  const handleSelectQuestion = (q: typeof quickQuestions[0]) => {
    if (q.action) {
      q.action();
    } else if (q.prompt && q.tab) {
      onQuickStartPrompt(q.prompt);
      onSelectTab(q.tab);
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Action Menu / Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-amber-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-sm">
                🌾
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white leading-tight">
                  {language === 'hi' ? 'किसान मित्र (Kisan Mitra)' : 'Kisan Mitra AI Assistant'}
                </h4>
                <span className="text-[10px] text-amber-200">
                  {language === 'hi' ? 'आपकी सेवा में सदैव तत्पर' : 'Your Digital Agronomy Companion'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-stone-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tool Launchers Bar */}
          <div className="grid grid-cols-2 p-2 bg-stone-50 border-b border-stone-200 gap-1.5">
            <button
              onClick={() => {
                onOpenKendra();
                setIsOpen(false);
              }}
              className="p-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-700 text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5 shadow-2xs hover:bg-emerald-50 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-800" />
              <span>{language === 'hi' ? 'खाद-बीज गणक' : 'Khad Calculator'}</span>
            </button>

            <button
              onClick={() => {
                onOpenDoctor();
                setIsOpen(false);
              }}
              className="p-2 rounded-xl bg-white border border-stone-200 hover:border-teal-700 text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5 shadow-2xs hover:bg-teal-50 transition-colors"
            >
              <Wheat className="w-3.5 h-3.5 text-teal-800" />
              <span>{language === 'hi' ? 'फसल डॉक्टर' : 'Crop Doctor'}</span>
            </button>
          </div>

          {/* Frequent Farmer Questions */}
          <div className="p-3.5 space-y-2 max-h-72 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-1">
              {language === 'hi' ? 'अक्सर पूछे जाने वाले सवाल:' : 'Common Field Questions:'}
            </span>

            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuestion(q)}
                className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all text-xs font-semibold text-stone-800 flex items-center justify-between group shadow-2xs"
              >
                <span>{language === 'hi' ? q.qHi : q.qEn}</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 shrink-0" />
              </button>
            ))}
          </div>

          {/* Quick Emergency Call Button */}
          <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
            <span className="text-[11px] text-stone-600 font-medium">
              {language === 'hi' ? 'कृषि वैज्ञानिक से बात:' : 'Agronomist Hotline:'}
            </span>
            <a
              href="tel:18001801551"
              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <PhoneCall className="w-3 h-3" />
              <span>1800-180-1551</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all border-2 border-amber-300/80 group"
        aria-label="Open Kisan Mitra Assistant"
      >
        <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-sm group-hover:rotate-12 transition-transform">
          🌾
        </div>
        <span className="text-xs sm:text-sm font-black tracking-tight pr-1">
          {language === 'hi' ? 'किसान मित्र' : 'Kisan Mitra'}
        </span>
        <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
      </button>
    </div>
  );
};

