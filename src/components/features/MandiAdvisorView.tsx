/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Language,
  MandiPriceRecord,
  MandiCalculationInput,
  MandiProfitResult,
  FarmerReport,
} from '../../types';
import { translations } from '../../i18n/translations';
import { api } from '../../services/api';
import {
  TrendingUp,
  Calculator,
  Truck,
  Building2,
  DollarSign,
  Printer,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MandiAdvisorViewProps {
  language: Language;
  onOpenReport: (report: FarmerReport) => void;
  onSaveReportToList: (report: FarmerReport) => void;
  defaultLocation: { state: string; district: string };
}

export const MandiAdvisorView: React.FC<MandiAdvisorViewProps> = ({
  language,
  onOpenReport,
  onSaveReportToList,
  defaultLocation,
}) => {
  const t = translations[language];

  const [state, setState] = useState(defaultLocation.state);
  const [district, setDistrict] = useState(defaultLocation.district);
  const [commodity, setCommodity] = useState('Wheat');
  const [quantity, setQuantity] = useState(50);
  const [expectedPrice, setExpectedPrice] = useState(2420);

  // Marketing cost inputs
  const [transportCostPerQtl, setTransportCostPerQtl] = useState(35);
  const [handlingCostPerQtl, setHandlingCostPerQtl] = useState(15);
  const [mandiFeePercent, setMandiFeePercent] = useState(1.0);
  const [packagingCostPerQtl, setPackagingCostPerQtl] = useState(20);
  const [otherExpenses, setOtherExpenses] = useState(400);

  const [mandiRecords, setMandiRecords] = useState<MandiPriceRecord[]>([]);
  const [calculationResult, setCalculationResult] = useState<MandiProfitResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch prices on load and query changes
  const loadMandiPrices = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getMandiPrices(commodity, state, district);
      setMandiRecords(data.records);
      if (data.records.length > 0) {
        setExpectedPrice(data.records[0].modalPricePerQtl);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load mandi data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMandiPrices();
  }, [commodity, district, state]);

  // Recalculate profit
  const handleCalculateProfit = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const input: MandiCalculationInput = {
      commodity,
      quantityQuintals: Number(quantity),
      targetMandi: mandiRecords[0]?.mandiName || `${district} APMC`,
      expectedPricePerQtl: Number(expectedPrice),
      transportCostPerQtl: Number(transportCostPerQtl),
      loadingUnloadingCostPerQtl: Number(handlingCostPerQtl),
      mandiFeePercent: Number(mandiFeePercent),
      packagingCostPerQtl: Number(packagingCostPerQtl),
      otherExpensesTotal: Number(otherExpenses),
    };

    try {
      const res = await api.calculateMandiProfit(input);
      setCalculationResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Profit calculation error');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger calculation on first records load
  useEffect(() => {
    if (mandiRecords.length > 0) {
      handleCalculateProfit();
    }
  }, [mandiRecords]);

  const handleExportReport = async () => {
    if (!calculationResult) return;

    try {
      const report = await api.generateReport({
        title: `${commodity} Market Realization & Mandi Comparative Dossier`,
        farmerLocation: { state, district },
        cropName: commodity,
        toolsUsed: ['mandi_advisor'],
        executiveSummary: `For ${quantity} quintals of ${commodity}, estimated gross realization is ₹${calculationResult.grossRevenue.toLocaleString('en-IN')}, total marketing costs ₹${calculationResult.totalExpenses.toLocaleString('en-IN')}, and net in-hand return is ₹${calculationResult.netReturn.toLocaleString('en-IN')} (Effective: ₹${calculationResult.effectivePricePerQtl}/qtl).`,
        actionPriorities: [
          {
            timeframe: 'Immediate Market Decision',
            recommendation: `Target ${mandiRecords[0]?.mandiName || 'Local APMC'} for quickest turnaround and lowest freight exposure.`,
            caution: 'Check arrival lot moisture limits (maximum 12-14% moisture) to avoid price deductions.',
          },
          {
            timeframe: 'Harvest Storage Window',
            recommendation: 'Evaluate nearby warehouse / e-NAM pledge loan if prices are temporarily depressed by heavy market arrivals.',
            caution: 'Factor in warehouse rent (typically ₹6-8 per bag per month).',
          },
        ],
      });

      onSaveReportToList(report);
      onOpenReport(report);
    } catch (e: any) {
      alert(`Could not create report: ${e.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch">
          <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Feature Four · APMC Market Economics</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {t.mandiAdvisor.title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                {t.mandiAdvisor.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-4 text-xs text-stone-500">
              <span>Agmarknet Standards</span>
              <span aria-hidden="true">·</span>
              <span>Freight Deductions</span>
              <span aria-hidden="true">·</span>
              <span>Transparent Net Realization</span>
            </div>
          </div>

          <div className="relative h-48 md:h-auto bg-stone-100">
            <img
              src="/src/assets/images/indian_mandi_market_1793120999517.jpg"
              alt="Indian APMC Grain Mandi with farmers trading sacks"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Inputs Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            1. Select Commodity & Location
          </h2>
          <span className="text-xs text-stone-500">Official APMC Benchmarks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.mandiAdvisor.selectCommodity}
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-medium"
            >
              <option value="Wheat">Wheat (गेहूं)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
              <option value="Mustard">Mustard / Rapeseed (सरसों)</option>
              <option value="Onion">Onion (प्याज)</option>
              <option value="Cotton">Cotton (कपास)</option>
              <option value="Paddy">Paddy / Basmati (धान)</option>
            </select>
          </div>

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
              {t.mandiAdvisor.quantityLabel}
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono tabular-nums"
            />
          </div>
        </div>

        {/* Cost & Marketing Parameter Inputs */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. Marketing & Freight Cost Deductions
            </h2>
            <span className="text-[11px] text-stone-500">Edit fields to match your real costs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {t.mandiAdvisor.pricePerQtlLabel}
              </label>
              <input
                type="number"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {t.mandiAdvisor.transportCostLabel}
              </label>
              <input
                type="number"
                value={transportCostPerQtl}
                onChange={(e) => setTransportCostPerQtl(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {t.mandiAdvisor.handlingCostLabel}
              </label>
              <input
                type="number"
                value={handlingCostPerQtl}
                onChange={(e) => setHandlingCostPerQtl(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {t.mandiAdvisor.mandiFeeLabel}
              </label>
              <input
                type="number"
                step="0.1"
                value={mandiFeePercent}
                onChange={(e) => setMandiFeePercent(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                {t.mandiAdvisor.otherExpensesLabel}
              </label>
              <input
                type="number"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleCalculateProfit}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 rounded-lg transition-colors shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              <span>{t.mandiAdvisor.calculateBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Calculations & Summary Section */}
      {calculationResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Net Realization Economics
                </span>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                  {t.mandiAdvisor.resultsTitle}
                </h2>
              </div>

              <button
                onClick={handleExportReport}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Mandi Dossier</span>
              </button>
            </div>

            {/* KPI Realization Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-xs text-stone-500 block mb-1">
                  {t.mandiAdvisor.grossRevenue}
                </span>
                <div className="text-xl sm:text-2xl font-bold text-stone-900 font-mono tabular-nums">
                  ₹{calculationResult.grossRevenue.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-stone-400">
                  {quantity} qtl @ ₹{expectedPrice}/qtl
                </span>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-xs text-stone-500 block mb-1">
                  {t.mandiAdvisor.totalCosts}
                </span>
                <div className="text-xl sm:text-2xl font-bold text-rose-700 font-mono tabular-nums">
                  -₹{calculationResult.totalExpenses.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-stone-400">Freight, handling & cess</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-xs text-emerald-800 block mb-1 font-semibold">
                  {t.mandiAdvisor.netReturn}
                </span>
                <div className="text-xl sm:text-2xl font-bold text-emerald-950 font-mono tabular-nums">
                  ₹{calculationResult.netReturn.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-emerald-700">In-hand net realization</span>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-xs text-stone-500 block mb-1">
                  {t.mandiAdvisor.effectivePrice}
                </span>
                <div className="text-xl sm:text-2xl font-bold text-stone-900 font-mono tabular-nums">
                  ₹{calculationResult.effectivePricePerQtl}
                  <span className="text-xs font-normal text-stone-500">/qtl</span>
                </div>
                <span className="text-[10px] text-stone-400">
                  Break-even: ₹{calculationResult.breakEvenYieldPrice}/qtl
                </span>
              </div>
            </div>

            {/* Regional Mandi Comparison Table */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase text-stone-700 tracking-wider">
                {t.mandiAdvisor.comparisonTitle}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 text-stone-700 font-semibold">
                    <tr>
                      <th className="p-3">Mandi / Market Hub</th>
                      <th className="p-3">Modal Price</th>
                      <th className="p-3">Estimated Net Profit</th>
                      <th className="p-3">Difference vs Target</th>
                      <th className="p-3">Economic Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {calculationResult.comparisonMandis.map((mandi, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/70">
                        <td className="p-3 font-semibold text-stone-900">{mandi.mandiName}</td>
                        <td className="p-3 font-mono tabular-nums">₹{mandi.modalPrice}/qtl</td>
                        <td className="p-3 font-mono tabular-nums font-semibold text-emerald-900">
                          ₹{mandi.estimatedNetProfit.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 font-mono tabular-nums">
                          {mandi.differenceFromTarget > 0 ? (
                            <span className="text-emerald-700 font-semibold">
                              +₹{mandi.differenceFromTarget.toLocaleString('en-IN')}
                            </span>
                          ) : mandi.differenceFromTarget < 0 ? (
                            <span className="text-rose-700 font-semibold">
                              -₹{Math.abs(mandi.differenceFromTarget).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-stone-400">Baseline</span>
                          )}
                        </td>
                        <td className="p-3 text-stone-600 leading-relaxed">
                          {mandi.recommendationReason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transparent Assumptions */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <span className="font-semibold text-stone-800 block mb-1">
                {t.mandiAdvisor.assumptionsTitle}:
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-stone-600 text-[11px]">
                {calculationResult.assumptions.map((ass, i) => (
                  <li key={i}>{ass}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
