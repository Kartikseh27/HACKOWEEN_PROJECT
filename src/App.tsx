/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  Language,
  FarmerReport,
  ConversationSession,
} from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { UniversalAgentView } from './components/universal-agent/UniversalAgentView';
import { CropHealthView } from './components/features/CropHealthView';
import { WeatherGuardianView } from './components/features/WeatherGuardianView';
import { SoilAdvisorView } from './components/features/SoilAdvisorView';
import { MandiAdvisorView } from './components/features/MandiAdvisorView';
import { SchemesAssistantView } from './components/features/SchemesAssistantView';
import { ReportsView } from './components/reports/ReportsView';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { PrintableReportModal } from './components/reports/PrintableReportModal';

const INITIAL_LOCATION = {
  state: 'Haryana',
  district: 'Karnal',
  village: 'Taraori',
};

// Seed an initial benchmark agricultural report so user can inspect an official dossier right away
const INITIAL_BENCHMARK_REPORT: FarmerReport = {
  reportId: 'KC-REP-INITIAL-WHEAT',
  title: 'Wheat Integrated Agronomic & Weather Advisory Dossier',
  generatedAt: new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  farmerLocation: { state: 'Haryana', district: 'Karnal', village: 'Taraori' },
  cropName: 'Wheat (HD-2967)',
  toolsUsed: ['crop_health', 'weather_guardian', 'soil_advisor'],
  executiveSummary:
    'Comprehensive multi-domain inspection conducted by KISAN CULTURE Universal Agent for wheat crop at CRI/Tillering stage. Evaluated mild lower-leaf yellowing chlorosis against local weather risks and soil alkalinity (pH 7.8). Identified Nitrogen mobility stress rather than Stripe Rust. Formulated prioritized cultural and foliar nutrition actions.',
  actionPriorities: [
    {
      timeframe: 'Immediate (Today)',
      recommendation: 'Check field drainage outlets; ensure no stagnant water ponds in lower furrows.',
      caution: 'Do not broadcast urea today ahead of incoming high-humidity atmospheric window.',
    },
    {
      timeframe: 'In 2-3 Days',
      recommendation: 'Conduct white cloth rub test on leaf underside to rule out Yellow Rust spores.',
      caution: 'Apply foliar 2% Urea only when morning dew has completely evaporated.',
    },
    {
      timeframe: 'Next Week',
      recommendation: 'Incorporate 10 kg/acre Zinc Sulphate (21%) with vermicompost if leaf tip scorching appears.',
      caution: 'Maintain soil pH buffering; avoid excessive DAP surface broadcasting.',
    },
  ],
  disclaimers: [
    'Advisory generated using ICAR Package of Practices for North-Western Plain Zone.',
    'AI visual analysis does not replace certified laboratory culture tests. Consult local Krishi Vigyan Kendra (KVK) officers before intensive chemical applications.',
  ],
};

export default function App() {
  // Navigation & Preferences State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('kc_lang') as Language) || 'en';
  });

  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('kc_location');
    return saved ? JSON.parse(saved) : INITIAL_LOCATION;
  });

  // Reports & History State
  const [reports, setReports] = useState<FarmerReport[]>(() => {
    const saved = localStorage.getItem('kc_reports');
    return saved ? JSON.parse(saved) : [INITIAL_BENCHMARK_REPORT];
  });

  const [sessions, setSessions] = useState<ConversationSession[]>(() => {
    const saved = localStorage.getItem('kc_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeReportModal, setActiveReportModal] = useState<FarmerReport | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('kc_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('kc_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('kc_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('kc_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleSaveReportToList = (newReport: FarmerReport) => {
    setReports((prev) => [newReport, ...prev.filter((r) => r.reportId !== newReport.reportId)]);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.reportId !== reportId));
    if (activeReportModal?.reportId === reportId) {
      setActiveReportModal(null);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleSelectSession = (session: ConversationSession) => {
    setCurrentTab('universal-agent');
  };

  const handleNewSession = () => {
    setCurrentTab('universal-agent');
  };

  const handleQuickStartPrompt = (promptText: string) => {
    setCurrentTab('universal-agent');
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-stone-900 flex flex-col font-sans">
      {/* Top Bar adhering to the Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={toggleLanguage}
        onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          language={language}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onSelectTab={setCurrentTab}
              language={language}
              onOpenReport={setActiveReportModal}
              recentReports={reports}
              recentSessions={sessions}
              onQuickStartPrompt={handleQuickStartPrompt}
              defaultLocation={location}
            />
          )}

          {currentTab === 'universal-agent' && (
            <UniversalAgentView
              language={language}
              onOpenReport={setActiveReportModal}
              onSaveReportToList={handleSaveReportToList}
              defaultLocation={location}
            />
          )}

          {currentTab === 'crop-health' && (
            <CropHealthView
              language={language}
              onOpenReport={setActiveReportModal}
              onSaveReportToList={handleSaveReportToList}
              defaultLocation={location}
            />
          )}

          {currentTab === 'weather-guardian' && (
            <WeatherGuardianView
              language={language}
              onOpenReport={setActiveReportModal}
              onSaveReportToList={handleSaveReportToList}
              defaultLocation={location}
            />
          )}

          {currentTab === 'soil-advisor' && (
            <SoilAdvisorView
              language={language}
              onOpenReport={setActiveReportModal}
              onSaveReportToList={handleSaveReportToList}
              defaultLocation={location}
            />
          )}

          {currentTab === 'mandi-advisor' && (
            <MandiAdvisorView
              language={language}
              onOpenReport={setActiveReportModal}
              onSaveReportToList={handleSaveReportToList}
              defaultLocation={location}
            />
          )}

          {currentTab === 'schemes-assistant' && (
            <SchemesAssistantView
              language={language}
              onOpenReport={setActiveReportModal}
              onSaveReportToList={handleSaveReportToList}
              defaultLocation={location}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              reports={reports}
              onOpenReport={setActiveReportModal}
              onDeleteReport={handleDeleteReport}
              language={language}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              sessions={sessions}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
              onNewSession={handleNewSession}
              language={language}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              language={language}
              onSetLanguage={setLanguage}
              defaultLocation={location}
              onUpdateLocation={setLocation}
            />
          )}
        </main>
      </div>

      {/* Printable Report Modal */}
      <PrintableReportModal
        report={activeReportModal}
        onClose={() => setActiveReportModal(null)}
        language={language}
      />
    </div>
  );
}
