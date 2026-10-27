/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, NavigationTab } from '../../types';
import { translations } from '../../i18n/translations';
import { Bell, Globe, Menu, X, Sprout, Wheat } from 'lucide-react';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  onToggleLanguage: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  onToggleMobileSidebar,
}) => {
  const t = translations[language];
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#F8F9F5] border-b border-stone-200 shadow-2xs">
      {/* Subtle traditional agricultural accent strip */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 w-full" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-amber-700 text-amber-200 flex items-center justify-center font-bold text-sm shadow-xs border border-amber-400/40 group-hover:scale-105 transition-transform">
              <Wheat className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-emerald-950 font-sans whitespace-nowrap block leading-tight">
                KISAN CULTURE
              </span>
              <span className="text-[10px] text-amber-800 font-bold tracking-wider block leading-tight">
                {language === 'hi' ? 'किसान संस्कृति · अन्नदाता' : 'Smarter Farming'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 Concise Single-Line Text Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 ${
              currentTab === 'dashboard' ? 'text-emerald-900 font-semibold underline underline-offset-8 decoration-2 decoration-emerald-700' : ''
            }`}
          >
            {t.nav.dashboard}
          </button>
          <button
            onClick={() => onSelectTab('universal-agent')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 flex items-center gap-1.5 ${
              currentTab === 'universal-agent' ? 'text-emerald-900 font-semibold underline underline-offset-8 decoration-2 decoration-emerald-700' : ''
            }`}
          >
            <span>{t.nav.universalAgent}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
              AI
            </span>
          </button>
          <button
            onClick={() => onSelectTab('crop-health')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 ${
              currentTab === 'crop-health' ? 'text-emerald-900 font-semibold underline underline-offset-8 decoration-2 decoration-emerald-700' : ''
            }`}
          >
            {t.nav.cropHealth}
          </button>
          <button
            onClick={() => onSelectTab('weather-guardian')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 ${
              currentTab === 'weather-guardian' ? 'text-emerald-900 font-semibold underline underline-offset-8 decoration-2 decoration-emerald-700' : ''
            }`}
          >
            {t.nav.weatherGuardian}
          </button>
          <button
            onClick={() => onSelectTab('mandi-advisor')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 ${
              currentTab === 'mandi-advisor' ? 'text-emerald-900 font-semibold underline underline-offset-8 decoration-2 decoration-emerald-700' : ''
            }`}
          >
            {t.nav.mandiAdvisor}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications with honest empty state */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-stone-200 p-4 text-xs z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-semibold text-stone-800">
                  <span>{t.topbar.notifications}</span>
                  <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="py-4 text-center text-stone-500">
                  <p>{t.topbar.noNotifications}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bilingual Language Selector */}
          <button
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:border-emerald-700 transition-colors whitespace-nowrap shrink-0"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-800" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Primary Quick Action Button */}
          <button
            onClick={() => onSelectTab('universal-agent')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            {language === 'en' ? 'Ask Agent' : 'एजेंट से पूछें'}
          </button>
        </div>
      </div>
    </header>
  );
};
