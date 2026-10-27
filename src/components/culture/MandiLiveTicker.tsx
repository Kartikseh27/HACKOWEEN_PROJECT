/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Store, ArrowRight, Sparkles } from 'lucide-react';
import { Language } from '../../types';

interface MandiRecord {
  commodity: string;
  variety: string;
  mandi: string;
  state: string;
  modalPrice: number;
  msp?: number;
  change: number; // positive or negative
  arrivalTonnes: number;
}

const LIVE_MANDI_FEED: MandiRecord[] = [
  {
    commodity: 'Wheat (गेहूं)',
    variety: 'HD-2967 / Sharbati',
    mandi: 'Karnal Mandi',
    state: 'Haryana',
    modalPrice: 2480,
    msp: 2425,
    change: +35,
    arrivalTonnes: 125,
  },
  {
    commodity: 'Mustard (सरसों)',
    variety: 'Black / Bold',
    mandi: 'Alwar APMC',
    state: 'Rajasthan',
    modalPrice: 5850,
    msp: 5650,
    change: +60,
    arrivalTonnes: 84,
  },
  {
    commodity: 'Basmati Paddy (बासमती धान)',
    variety: 'Pusa 1121 Super',
    mandi: 'Taraori Grain Market',
    state: 'Haryana',
    modalPrice: 3950,
    msp: 2320,
    change: -20,
    arrivalTonnes: 210,
  },
  {
    commodity: 'Soybean (सोयाबीन)',
    variety: 'JS-9560 Yellow',
    mandi: 'Indore Mandi',
    state: 'Madhya Pradesh',
    modalPrice: 4720,
    msp: 4892,
    change: +45,
    arrivalTonnes: 160,
  },
  {
    commodity: 'Cotton (कपास / नरमा)',
    variety: 'Medium Staple',
    mandi: 'Rajkot APMC',
    state: 'Gujarat',
    modalPrice: 7350,
    msp: 7121,
    change: +110,
    arrivalTonnes: 95,
  },
  {
    commodity: 'Gram / Chana (चना)',
    variety: 'Desi Chana',
    mandi: 'Kota Mandi',
    state: 'Rajasthan',
    modalPrice: 6150,
    msp: 5650,
    change: -15,
    arrivalTonnes: 70,
  },
  {
    commodity: 'Paddy Non-Basmati (धान)',
    variety: 'PR-126 Common',
    mandi: 'Khanna Mandi',
    state: 'Punjab',
    modalPrice: 2320,
    msp: 2320,
    change: 0,
    arrivalTonnes: 320,
  },
];

interface MandiLiveTickerProps {
  language: Language;
  onOpenMandiAdvisor: () => void;
}

export const MandiLiveTicker: React.FC<MandiLiveTickerProps> = ({
  language,
  onOpenMandiAdvisor,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const commodities = ['All', 'Wheat (गेहूं)', 'Mustard (सरसों)', 'Basmati Paddy (बासमती धान)', 'Soybean (सोयाबीन)'];

  const filteredFeed = selectedFilter === 'All'
    ? LIVE_MANDI_FEED
    : LIVE_MANDI_FEED.filter(item => item.commodity === selectedFilter);

  return (
    <div className="bg-gradient-to-r from-amber-950 via-emerald-950 to-stone-900 text-white rounded-2xl p-3 sm:p-4 shadow-sm border border-amber-900/40 space-y-3">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'hi' ? 'लाइव मंडी भाव' : 'Live Mandi Ticker'}</span>
          </div>
          <span className="text-xs text-stone-300 hidden sm:inline">
            {language === 'hi'
              ? 'प्रमुख एपीएमसी मंडियों के ताजा दैनिक भाव'
              : 'Direct daily modal prices from major APMC yards'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Commodity quick filters */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px]">
            {commodities.map(c => (
              <button
                key={c}
                onClick={() => setSelectedFilter(c)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  selectedFilter === c
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {c.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenMandiAdvisor}
            className="flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors bg-amber-900/40 hover:bg-amber-900/60 px-2.5 py-1 rounded-lg border border-amber-500/30"
          >
            <span>{language === 'hi' ? 'मुनाफा गणक' : 'Profit Calculator'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrolling / Horizontal Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 overflow-x-auto pb-1">
        {filteredFeed.map((item, idx) => {
          const isAboveMsp = item.msp ? item.modalPrice >= item.msp : true;
          return (
            <div
              key={idx}
              onClick={onOpenMandiAdvisor}
              className="bg-stone-900/70 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/50 rounded-xl p-2.5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-amber-200 group-hover:text-amber-300 truncate">
                  {item.commodity}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 shrink-0 ${
                    item.change > 0
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : item.change < 0
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {item.change > 0 ? (
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                  ) : item.change < 0 ? (
                    <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                  ) : null}
                  {item.change > 0 ? `+₹${item.change}` : item.change < 0 ? `-₹${Math.abs(item.change)}` : '₹0'}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-base sm:text-lg font-black text-white tracking-tight">
                    ₹{item.modalPrice.toLocaleString('en-IN')}
                    <span className="text-[10px] font-normal text-stone-400 ml-0.5">/क्विंटल</span>
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {item.mandi}, {item.state}
                  </div>
                </div>

                {item.msp && (
                  <div className="text-right">
                    <span
                      className={`text-[9px] font-bold block ${
                        isAboveMsp ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isAboveMsp ? 'MSP +' : 'MSP -'}₹{Math.abs(item.modalPrice - item.msp)}
                    </span>
                    <span className="text-[9px] text-stone-500 block">
                      MSP: ₹{item.msp}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

