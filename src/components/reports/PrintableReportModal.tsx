/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FarmerReport, Language } from '../../types';
import { X, Printer, ShieldCheck, Sprout, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

interface PrintableReportModalProps {
  report: FarmerReport | null;
  onClose: () => void;
  language: Language;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  report,
  onClose,
  language,
}) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="p-4 sm:px-6 bg-stone-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">KISAN CULTURE Official Agricultural Dossier</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 sm:p-10 overflow-y-auto text-stone-800 space-y-8 bg-white print:p-0 print:m-0 print:overflow-visible">
          {/* Top Document Header */}
          <div className="border-b-2 border-emerald-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg font-sans">
                <Sprout className="w-6 h-6 text-emerald-800" />
                <span>KISAN CULTURE</span>
              </div>
              <span className="text-xs text-stone-500 font-mono block">
                Integrated Agricultural Intelligence System · Government & ICAR Agronomy Aligned
              </span>
            </div>

            <div className="text-right text-xs font-mono">
              <div className="font-bold text-stone-900">Dossier ID: {report.reportId}</div>
              <div className="text-stone-500">{report.generatedAt}</div>
            </div>
          </div>

          {/* Dossier Title */}
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{report.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                <span>
                  {report.farmerLocation.district}, {report.farmerLocation.state}
                  {report.farmerLocation.village ? ` (${report.farmerLocation.village})` : ''}
                </span>
              </div>
              {report.cropName && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-stone-800">Target Crop:</span>
                  <span>{report.cropName}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-stone-800">Verified By:</span>
                <span>Kisan Culture Agronomic Engine</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Executive Agronomic Summary
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {report.executiveSummary}
            </p>
          </div>

          {/* Prioritized Action Roadmap */}
          {report.actionPriorities && report.actionPriorities.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
                Prioritized Field Action Schedule
              </h2>
              <div className="space-y-3">
                {report.actionPriorities.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-stone-200 bg-white space-y-1 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {item.timeframe}
                      </span>
                    </div>
                    <p className="font-semibold text-stone-900 text-sm mt-1">{item.recommendation}</p>
                    {item.caution && (
                      <p className="text-[11px] text-stone-500">
                        <span className="font-medium text-rose-700">Caution:</span> {item.caution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety & Scientific Disclaimers */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-stone-900">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>Agronomic Verification & Disclaimers</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-stone-600">
              {report.disclaimers.map((disc, idx) => (
                <li key={idx}>{disc}</li>
              ))}
            </ul>
          </div>

          {/* Physical Sign-off Section for Extension Officers */}
          <div className="pt-8 border-t border-dashed border-stone-300 grid grid-cols-2 gap-8 text-xs text-stone-600">
            <div>
              <div className="h-12 border-b border-stone-400" />
              <span className="block mt-1 font-semibold text-stone-800">Farmer Signature / Thumb Impression</span>
              <span className="text-[10px] text-stone-400">Date & Place</span>
            </div>
            <div>
              <div className="h-12 border-b border-stone-400" />
              <span className="block mt-1 font-semibold text-stone-800">
                KVK / Agriculture Development Officer (ADO) Endorsement
              </span>
              <span className="text-[10px] text-stone-400">Official Seal & Recommendation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
