/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FarmerReport, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { FileText, Printer, Trash2, Calendar, MapPin, Eye, Sprout } from 'lucide-react';

interface ReportsViewProps {
  reports: FarmerReport[];
  onOpenReport: (report: FarmerReport) => void;
  onDeleteReport: (reportId: string) => void;
  language: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  onOpenReport,
  onDeleteReport,
  language,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {t.reports.title}
            </h1>
            <p className="text-xs text-stone-500">
              {t.reports.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            {t.reports.noReports}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.reportId}
              className="bg-white rounded-xl p-6 border border-stone-200 flex flex-col justify-between space-y-4 shadow-2xs hover:border-emerald-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>{report.reportId}</span>
                  <span>{report.generatedAt}</span>
                </div>

                <h3 className="font-bold text-base text-stone-900 leading-snug">
                  {report.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                  <span>
                    {report.farmerLocation.district}, {report.farmerLocation.state}
                  </span>
                  {report.cropName && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Crop: {report.cropName}</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed pt-1">
                  {report.executiveSummary}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenReport(report)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t.reports.viewReport}</span>
                </button>

                <button
                  onClick={() => onDeleteReport(report.reportId)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
