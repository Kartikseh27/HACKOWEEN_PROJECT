/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, WeatherRiskResult, FarmerReport } from '../../types';
import { translations } from '../../i18n/translations';
import { api } from '../../services/api';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Compass,
  Printer,
  ShieldCheck,
  RefreshCw,
  SunMedium,
  CloudRain,
} from 'lucide-react';
import { KisanVoicePlayer } from '../culture/KisanVoicePlayer';

interface WeatherGuardianViewProps {
  language: Language;
  onOpenReport: (report: FarmerReport) => void;
  onSaveReportToList: (report: FarmerReport) => void;
  defaultLocation: { state: string; district: string };
}

export const WeatherGuardianView: React.FC<WeatherGuardianViewProps> = ({
  language,
  onOpenReport,
  onSaveReportToList,
  defaultLocation,
}) => {
  const t = translations[language];

  const [state, setState] = useState(defaultLocation.state);
  const [district, setDistrict] = useState(defaultLocation.district);
  const [crop, setCrop] = useState('Wheat');
  const [stage, setStage] = useState('Vegetative (Tillering)');
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherRiskResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getWeather(state, district, crop);
      setWeatherData(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to retrieve meteorological intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [district, state]);

  const handleExportReport = async () => {
    if (!weatherData) return;

    try {
      const report = await api.generateReport({
        title: `${district} (${state}) Agricultural Weather & Risk Advisory`,
        farmerLocation: { state, district },
        cropName: crop,
        toolsUsed: ['weather_guardian'],
        executiveSummary: `Current temperature: ${weatherData.current.temperatureC}°C, Humidity: ${weatherData.current.humidityPercent}%. Forecast indicates ${weatherData.forecast[0]?.condition || 'clear weather'}. ${weatherData.activeAlerts[0]?.description || ''}`,
        actionPriorities: weatherData.agriculturalActionPlan.map((act) => ({
          timeframe: 'Immediate Advisory',
          recommendation: act,
          caution: 'Verify soil moisture on field before flood irrigation.',
        })),
      });

      onSaveReportToList(report);
      onOpenReport(report);
    } catch (e: any) {
      alert(`Could not export report: ${e.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title & Status */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-800 text-white flex items-center justify-center shadow-xs">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {t.weatherGuardian.title}
              </h1>
              <p className="text-xs text-stone-500">
                {t.weatherGuardian.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={fetchWeather}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh Feed'}</span>
          </button>
        </div>

        {/* Inputs Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {language === 'en' ? 'State' : 'राज्य'}
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
              {language === 'en' ? 'District' : 'ज़िला'}
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
              {language === 'en' ? 'Crop' : 'फसल'}
            </label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {language === 'en' ? 'Growth Stage' : 'अवस्था'}
            </label>
            <input
              type="text"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>
        </div>

        {/* Live status transparency */}
        {weatherData && (
          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${weatherData.isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{weatherData.dataSourceName}</span>
              <span aria-hidden="true">·</span>
              <span>Updated: {weatherData.lastUpdated}</span>
            </div>

            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold hover:underline"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Weather Dossier</span>
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      {weatherData && (
        <div className="space-y-6">
          {/* Current Conditions Card */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
              {t.weatherGuardian.currentConditions} · {weatherData.district}, {weatherData.state}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-xs">Temperature</span>
                  <Thermometer className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-stone-900 tabular-nums font-mono">
                  {weatherData.current.temperatureC}°C
                </div>
                <span className="text-[11px] text-stone-500">
                  Feels like {weatherData.current.feelsLikeC}°C
                </span>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-xs">Humidity</span>
                  <Droplets className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-bold text-stone-900 tabular-nums font-mono">
                  {weatherData.current.humidityPercent}%
                </div>
                <span className="text-[11px] text-stone-500">Relative atmospheric</span>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-xs">Wind Speed</span>
                  <Wind className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-bold text-stone-900 tabular-nums font-mono">
                  {weatherData.current.windSpeedKmph} <span className="text-xs font-normal">km/h</span>
                </div>
                <span className="text-[11px] text-stone-500">
                  {weatherData.current.windSpeedKmph > 15 ? 'Caution for spraying' : 'Safe for spraying'}
                </span>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-xs">Rainfall</span>
                  <CloudRain className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-stone-900 tabular-nums font-mono">
                  {weatherData.current.precipitationMm} <span className="text-xs font-normal">mm</span>
                </div>
                <span className="text-[11px] text-stone-500">{weatherData.current.condition}</span>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {weatherData.activeAlerts.length > 0 && (
            <div className="space-y-3">
              {weatherData.activeAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-xl border text-xs ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        alert.severity === 'critical' ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    />
                    <span>{alert.title}</span>
                  </div>
                  <p className="mb-2 leading-relaxed">{alert.description}</p>
                  <div className="font-semibold pt-2 border-t border-current/10">
                    <span className="text-[11px] uppercase tracking-wider block">Recommended Action:</span>
                    <span>{alert.actionRequired}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5-Day Operational Forecast */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <span>{t.weatherGuardian.forecastTitle}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {weatherData.forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between text-xs space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{day.dayName}</span>
                      <span className="text-[10px] text-stone-500 font-normal">{day.date.slice(5)}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1 line-clamp-1">{day.condition}</p>
                    <div className="mt-2 text-stone-900 font-mono font-semibold tabular-nums text-sm">
                      {day.maxTempC}° <span className="text-stone-400 font-normal">/ {day.minTempC}°C</span>
                    </div>
                    <div className="text-[11px] text-sky-700 mt-0.5">
                      Rain: {day.rainProbabilityPercent}% ({day.expectedRainfallMm}mm)
                    </div>
                  </div>

                  {/* Operational Tags */}
                  <div className="pt-2 border-t border-stone-200/80 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Irrigation:</span>
                      <span
                        className={`font-semibold ${
                          day.advisories.irrigation === 'safe'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {day.advisories.irrigation.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Spraying:</span>
                      <span
                        className={`font-semibold ${
                          day.advisories.spraying === 'favorable'
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {day.advisories.spraying.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Harvest:</span>
                      <span
                        className={`font-semibold ${
                          day.advisories.harvesting === 'favorable'
                            ? 'text-emerald-700'
                            : 'text-stone-700'
                        }`}
                      >
                        {day.advisories.harvesting.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>{t.weatherGuardian.actionPlanTitle}</span>
              </h2>
              <KisanVoicePlayer
                text={`${weatherData.district} मौसम सलाह: तापमान ${weatherData.current.temperatureC} डिग्री। ${weatherData.agriculturalActionPlan.join('. ')}`}
                language={language}
                label={language === 'hi' ? 'मौसम सलाह सुनें' : 'Listen Weather Advisory'}
                compact
              />
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-stone-700">
              {weatherData.agriculturalActionPlan.map((plan, i) => (
                <div key={i} className="p-3 bg-stone-50 rounded-lg border border-stone-200/70">
                  {plan}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
