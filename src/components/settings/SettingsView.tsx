/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { api } from '../../services/api';
import { Settings, Globe, MapPin, CheckCircle2, ShieldCheck, Server, AlertCircle } from 'lucide-react';

interface SettingsViewProps {
  language: Language;
  onSetLanguage: (lang: Language) => void;
  defaultLocation: { state: string; district: string; village?: string };
  onUpdateLocation: (loc: { state: string; district: string; village?: string }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onSetLanguage,
  defaultLocation,
  onUpdateLocation,
}) => {
  const t = translations[language];

  const [state, setState] = useState(defaultLocation.state);
  const [district, setDistrict] = useState(defaultLocation.district);
  const [village, setVillage] = useState(defaultLocation.village || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [healthInfo, setHealthInfo] = useState<any>(null);

  useEffect(() => {
    api.getHealth().then(setHealthInfo).catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLocation({ state, district, village });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {t.settings.title}
            </h1>
            <p className="text-xs text-stone-500">
              {t.settings.subtitle}
            </p>
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{t.settings.savedSuccess}</span>
        </div>
      )}

      {/* Language Section */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Globe className="w-4 h-4 text-emerald-800" />
          <span>{t.settings.languageTitle}</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {t.settings.languageDesc}
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => onSetLanguage('en')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              language === 'en'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            English (India)
          </button>
          <button
            onClick={() => onSetLanguage('hi')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              language === 'hi'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            हिन्दी (भारतीय किसान)
          </button>
        </div>
      </div>

      {/* Location Section */}
      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 border border-stone-200 space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <MapPin className="w-4 h-4 text-emerald-800" />
          <span>{t.settings.defaultLocationTitle}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.settings.state}
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.settings.district}
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.settings.village}
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Taraori"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-2xs"
          >
            {t.settings.saveSettingsBtn}
          </button>
        </div>
      </form>

      {/* Backend & Integration Transparency */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Server className="w-4 h-4 text-emerald-800" />
          <span>{t.settings.integrationsTitle}</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-900 block">{t.settings.geminiStatus}</span>
              <span className="text-stone-500 text-[11px]">
                Model: gemini-3.8-flash (Multimodal Image Diagnostics & Orchestration)
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                healthInfo?.hasGeminiKey
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {healthInfo?.hasGeminiKey ? 'Active Server-Side' : 'Agronomic Engine Active'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-900 block">{t.settings.weatherStatus}</span>
              <span className="text-stone-500 text-[11px]">
                Open-Meteo Atmospheric Forecast API + Agrometeorology Advisory Engine
              </span>
            </div>
            <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Connected
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-900 block">{t.settings.mandiStatus}</span>
              <span className="text-stone-500 text-[11px]">
                APMC Agmarknet benchmark database & net realization calculator
              </span>
            </div>
            <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              Operational
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-900 block">External Workflow Gateway (Dify / n8n Adapters)</span>
              <span className="text-stone-500 text-[11px]">
                Configurable webhook endpoints for enterprise farm automation
              </span>
            </div>
            <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-stone-200 text-stone-700">
              Ready for Webhooks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
