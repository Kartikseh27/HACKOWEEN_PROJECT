/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldCheck,
  Building,
  Check,
  Copy,
  ExternalLink,
  Award,
  Heart,
} from 'lucide-react';
import { Language } from '../../types';

interface KisanHelplineBarProps {
  language: Language;
}

export const KisanHelplineBar: React.FC<KisanHelplineBarProps> = ({ language }) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyToClipboard = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const helplines = [
    {
      id: 'kcc',
      titleHi: 'किसान कॉल सेंटर (KCC)',
      titleEn: 'Kisan Call Centre (KCC)',
      number: '1800-180-1551',
      descHi: 'टोल-फ्री 22 भारतीय भाषाओं में 24/7 कृषि वैज्ञानिकों से सीधी बातचीत',
      descEn: 'Toll-free 24/7 direct agronomist consultation in 22 official languages',
      badge: 'Toll Free · 24/7',
      color: 'border-emerald-300 bg-emerald-50/70 text-emerald-950',
    },
    {
      id: 'pmfby',
      titleHi: 'फसल बीमा सूचना केंद्र (PMFBY)',
      titleEn: 'PMFBY Loss Intimation Desk',
      number: '14447',
      descHi: 'ओलावृष्टि या बाढ़ के 72 घंटे के भीतर फसल क्षति दर्ज कराएं',
      descEn: 'Mandatory 72-hour crop damage claim intimation toll-free short code',
      badge: '72-Hour SOS',
      color: 'border-amber-300 bg-amber-50/70 text-amber-950',
    },
    {
      id: 'soil',
      titleHi: 'मृदा स्वास्थ्य व KVK सहायता',
      titleEn: 'Soil Health & KVK Helpline',
      number: '1800-11-2211',
      descHi: 'निकटतम कृषि विज्ञान केंद्र से मिट्टी की जांच व जैविक खाद मार्गदर्शन',
      descEn: 'Nearest Krishi Vigyan Kendra contact for laboratory soil test interpretation',
      badge: 'ICAR Support',
      color: 'border-blue-300 bg-blue-50/70 text-blue-950',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <span>{language === 'hi' ? 'किसान आपातकालीन हेल्पलाइन व सहायता केंद्र' : 'Kisan Emergency Agronomy Helplines'}</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase">
                {language === 'hi' ? 'निशुल्क' : 'Toll Free'}
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'hi'
                ? 'मुसीबत के समय सीधे भारत सरकार और आईसीएआर के विशेषज्ञ वैज्ञानिकों से जुड़ें।'
                : 'Direct official hotlines for crop damage claims, emergency advice, and soil testing.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {helplines.map((item) => {
          const isCopied = copiedNumber === item.number;
          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${item.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-stone-200 shadow-2xs">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900">
                  {language === 'hi' ? item.titleHi : item.titleEn}
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {language === 'hi' ? item.descHi : item.descEn}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <a
                  href={`tel:${item.number}`}
                  className="text-base sm:text-lg font-black text-stone-950 hover:underline flex items-center gap-1.5"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-800" />
                  <span>{item.number}</span>
                </a>

                <button
                  onClick={() => copyToClipboard(item.number)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 border border-stone-200 transition-colors shadow-2xs"
                  title="Copy Number"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

