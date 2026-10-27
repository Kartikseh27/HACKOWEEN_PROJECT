/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavigationTab, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  LayoutDashboard,
  Sparkles,
  Leaf,
  CloudSun,
  Layers,
  TrendingUp,
  FileBadge,
  FileText,
  History,
  Settings,
  X,
  Sprout,
  ShieldCheck,
  Wheat,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  language,
  mobileOpen,
  onCloseMobile,
}) => {
  const t = translations[language];

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    isPrimaryAgent?: boolean;
  }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'universal-agent', label: t.nav.universalAgent, icon: Sparkles, isPrimaryAgent: true },
    { id: 'crop-health', label: t.nav.cropHealth, icon: Leaf },
    { id: 'weather-guardian', label: t.nav.weatherGuardian, icon: CloudSun },
    { id: 'soil-advisor', label: t.nav.soilAdvisor, icon: Layers },
    { id: 'mandi-advisor', label: t.nav.mandiAdvisor, icon: TrendingUp },
    { id: 'schemes-assistant', label: t.nav.schemesAssistant, icon: FileBadge },
    { id: 'reports', label: t.nav.myReports, icon: FileText },
    { id: 'history', label: t.nav.history, icon: History },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1C3829] text-stone-100 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-emerald-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600/50 to-amber-600/40 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold">
              <Wheat className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block leading-tight font-sans">
                KISAN CULTURE
              </span>
              <span className="text-[11px] text-amber-300/90 font-bold tracking-wide block leading-tight">
                {language === 'en' ? 'अन्नदाता सुखी भवः' : 'किसान संस्कृति · अन्नदाता'}
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-emerald-900/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                    : 'text-stone-300 hover:text-white hover:bg-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-emerald-300'
                        : item.isPrimaryAgent
                        ? 'text-amber-400'
                        : 'text-stone-400 group-hover:text-stone-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.isPrimaryAgent && (
                  <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700/60 text-emerald-200 border border-emerald-600/40 uppercase tracking-wider shrink-0">
                    Core AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Trust Marker */}
        <div className="p-4 border-t border-emerald-900/60 bg-[#162D21] shrink-0 text-stone-300 text-[11px]">
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ICAR & KVK Agronomy Aligned</span>
          </div>
          <p className="text-stone-400 leading-relaxed text-[11px]">
            {language === 'en'
              ? 'Five specialist tools coordinated by one Universal Agent.'
              : 'एक सार्वभौमिक एजेंट द्वारा संचालित पाँच विशिष्ट कृषि टूल्स।'}
          </p>
        </div>
      </aside>
    </>
  );
};
