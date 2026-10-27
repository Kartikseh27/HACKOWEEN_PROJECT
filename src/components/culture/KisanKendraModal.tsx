/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Calculator,
  Droplets,
  Wind,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  Wheat,
  Tractor,
  Layers,
} from 'lucide-react';
import { Language } from '../../types';
import { KisanVoicePlayer } from './KisanVoicePlayer';

interface KisanKendraModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  defaultCrop?: string;
}

type KendraTab = 'fertilizer' | 'seed' | 'irrigation' | 'spray';

interface CropFertilizerProfile {
  nameEn: string;
  nameHi: string;
  ureaBagsPerAcre: number;
  dapBagsPerAcre: number;
  mopBagsPerAcre: number;
  zincKgPerAcre: number;
  stages: {
    stageHi: string;
    stageEn: string;
    adviceHi: string;
    adviceEn: string;
  }[];
}

const FERTILIZER_DATABASE: Record<string, CropFertilizerProfile> = {
  wheat: {
    nameEn: 'Wheat (गेहूं)',
    nameHi: 'गेहूं (Wheat)',
    ureaBagsPerAcre: 2.4, // ~110 kg Urea
    dapBagsPerAcre: 1.0,  // ~50 kg DAP
    mopBagsPerAcre: 0.5,  // ~25 kg MOP
    zincKgPerAcre: 10,
    stages: [
      {
        stageHi: 'बुवाई के समय (Basal Dose)',
        stageEn: 'At Sowing (Basal)',
        adviceHi: 'पूरा DAP (1 बोरी) + पूरा पोटाश (आधा बोरी) + 1/3 यूरिया बुवाई की कतार में डालें।',
        adviceEn: 'Apply 100% DAP (1 bag) + 100% MOP (0.5 bag) + 1/3rd Urea in furrows with seed drill.',
      },
      {
        stageHi: 'पहली सिंचाई (CRI Stage - 21 दिन)',
        stageEn: '1st Irrigation (CRI - 21 Days)',
        adviceHi: 'सिंचाई के बाद 1/3 यूरिया (करीब 35 किलो) की टॉप-ड्रेसिंग करें।',
        adviceEn: 'Top-dress 1/3rd Urea (approx 35 kg) after 1st irrigation when field permits walking.',
      },
      {
        stageHi: 'कल्ले फूटते समय (Tillering - 40-45 दिन)',
        stageEn: 'Tillering Stage (40-45 Days)',
        adviceHi: 'बचा हुआ 1/3 यूरिया डालें। जिंक की कमी दिखे तो 0.5% जिंक सल्फेट + 2% यूरिया का पर्णीय छिड़काव करें।',
        adviceEn: 'Broadcast remaining 1/3rd Urea. If chlorosis appears, foliar spray 0.5% Zinc Sulphate + 2% Urea.',
      },
    ],
  },
  paddy: {
    nameEn: 'Paddy / Rice (धान)',
    nameHi: 'धान (Paddy)',
    ureaBagsPerAcre: 2.6,
    dapBagsPerAcre: 1.2,
    mopBagsPerAcre: 0.8,
    zincKgPerAcre: 10,
    stages: [
      {
        stageHi: 'रोपाई के समय (Basal)',
        stageEn: 'Transplanting (Basal)',
        adviceHi: 'आखिरी जुताई/कदवा करते समय पूरा DAP, पोटाश व 1/3 यूरिया मिट्टी में मिला दें।',
        adviceEn: 'Incorporate 100% DAP, 100% MOP and 1/3rd Urea during last puddling.',
      },
      {
        stageHi: 'कल्ले फूटते समय (3-4 सप्ताह)',
        stageEn: 'Active Tillering (3-4 weeks)',
        adviceHi: '1/3 यूरिया की दूसरी खुराक डालें। पानी 2-3 सेमी रखें।',
        adviceEn: 'Apply 2nd dose of 1/3rd Urea. Maintain 2-3 cm shallow standing water.',
      },
      {
        stageHi: 'गोभ / बाली निकलते समय (Panicle)',
        stageEn: 'Panicle Initiation',
        adviceHi: 'अंतिम 1/3 यूरिया की खुराक डालें। फूल आते समय छिड़काव न करें।',
        adviceEn: 'Top-dress final 1/3rd Urea dose. Avoid broadcasting during peak flowering.',
      },
    ],
  },
  mustard: {
    nameEn: 'Mustard (सरसों / राया)',
    nameHi: 'सरसों (Mustard)',
    ureaBagsPerAcre: 1.5,
    dapBagsPerAcre: 1.0,
    mopBagsPerAcre: 0.4,
    zincKgPerAcre: 10,
    stages: [
      {
        stageHi: 'बुवाई के समय',
        stageEn: 'At Sowing',
        adviceHi: 'पूरा DAP, पोटाश, आधा यूरिया व 10 किलो सल्फर (90% D-bentonite) प्रति एकड़ डालें।',
        adviceEn: 'Apply entire DAP, MOP, half Urea and 10 kg Sulphur (90%) per acre to boost oil content.',
      },
      {
        stageHi: 'पहली सिंचाई पर (30-35 दिन)',
        stageEn: '1st Irrigation (30-35 Days)',
        adviceHi: 'बचा हुआ आधा यूरिया पहली सिंचाई के बाद खेत में बखेरें।',
        adviceEn: 'Top-dress remaining half Urea immediately after first irrigation.',
      },
    ],
  },
  sugarcane: {
    nameEn: 'Sugarcane (गन्ना)',
    nameHi: 'गन्ना (Sugarcane)',
    ureaBagsPerAcre: 4.5,
    dapBagsPerAcre: 1.5,
    mopBagsPerAcre: 1.2,
    zincKgPerAcre: 15,
    stages: [
      {
        stageHi: 'बुवाई के समय',
        stageEn: 'Planting',
        adviceHi: 'पूरा DAP, पोटाश और 1/4 यूरिया ट्रेंच/कुंड में गन्ने के पोरों के नीचे डालें।',
        adviceEn: 'Place 100% DAP, MOP and 1/4th Urea in furrows below cane setts.',
      },
      {
        stageHi: '60, 90 व 120 दिन पर',
        stageEn: 'At 60, 90 & 120 Days',
        adviceHi: 'बचा हुआ यूरिया तीन बराबर किस्तों में सिंचाई के साथ दें और मिट्टी चढ़ाएं।',
        adviceEn: 'Split remaining Urea into 3 equal top-dressings with irrigation before earthing up.',
      },
    ],
  },
};

const SEED_RATES: Record<string, { rateKgAcre: string; spacing: string; treatmentHi: string; treatmentEn: string }> = {
  wheat: {
    rateKgAcre: '40 - 45 kg',
    spacing: '20 - 22.5 cm (Row to Row)',
    treatmentHi: 'ट्राइकोडर्मा विरिडी 5 ग्राम प्रति किलो बीज या वीटावैक्स/कार्बेन्डाजिम 2 ग्राम/किलो।',
    treatmentEn: 'Trichoderma viride @ 5g/kg seed OR Carbendazim @ 2g/kg to protect against loose smut.',
  },
  paddy: {
    rateKgAcre: '6 - 8 kg (Basmati) / 12 - 15 kg (Hybrid)',
    spacing: '20 cm x 15 cm (Transplanting)',
    treatmentHi: 'नमक के 10% घोल में तैरते हल्के बीज हटाएं, फिर स्ट्रेप्टोसाइक्लिन 1 ग्राम + बाविस्टिन 10 ग्राम/10 ली पानी में 12 घंटे भिगोएं।',
    treatmentEn: 'Soak in Streptocycline 1g + Carbendazim 10g per 10L water for 12 hours before nursery sowing.',
  },
  mustard: {
    rateKgAcre: '1.5 - 2.0 kg',
    spacing: '30 - 45 cm (Row) x 10 - 15 cm (Plant)',
    treatmentHi: 'एप्रन 35 एसडी 6 ग्राम या थीरम 3 ग्राम प्रति किलो बीज।',
    treatmentEn: 'Apron 35 SD @ 6g/kg or Thiram @ 3g/kg seed against white rust and damping-off.',
  },
  sugarcane: {
    rateKgAcre: '30 - 35 क्विंटल (तीन आंख वाले पोर)',
    spacing: '90 - 120 cm (ट्रेंच विधि)',
    treatmentHi: 'कार्बेन्डाजिम (0.1%) या ट्राइकोडर्मा के घोल में 15 मिनट पोरों को डुबोएं।',
    treatmentEn: 'Dip 3-bud setts in Carbendazim 0.1% solution for 15 mins to prevent red rot.',
  },
};

// Subsidized MRP constants (Govt of India regulated MRP)
const UREA_MRP_BAG = 266.5; // 45kg bag
const DAP_MRP_BAG = 1350;   // 50kg bag
const MOP_MRP_BAG = 1700;   // 50kg bag
const ZINC_MRP_KG = 75;

export const KisanKendraModal: React.FC<KisanKendraModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<KendraTab>('fertilizer');

  // Fertilizer State
  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
  const [landArea, setLandArea] = useState<number>(2);
  const [unit, setUnit] = useState<'acre' | 'bigha' | 'hectare'>('acre');

  // Irrigation State
  const [pumpType, setPumpType] = useState<'diesel' | 'electric'>('diesel');
  const [pumpHP, setPumpHP] = useState<number>(8);
  const [hoursPerIrrigation, setHoursPerIrrigation] = useState<number>(6);
  const [dieselPrice, setDieselPrice] = useState<number>(89);
  const [elecRate, setElecRate] = useState<number>(7.5);

  // Spray Safety State
  const [windSpeed, setWindSpeed] = useState<number>(11); // km/h
  const [rainRisk, setRainRisk] = useState<number>(15);  // percent
  const [airTemp, setAirTemp] = useState<number>(24);   // C
  const [leafWetness, setLeafWetness] = useState<boolean>(false);

  if (!isOpen) return null;

  // Convert land area to standard acres for calculation
  const getAcres = (): number => {
    if (unit === 'acre') return landArea;
    if (unit === 'bigha') return landArea * 0.4; // Average North-Central Bigha (~0.4 acre)
    if (unit === 'hectare') return landArea * 2.471;
    return landArea;
  };

  const currentAcres = Math.max(0.1, getAcres());
  const cropProfile = FERTILIZER_DATABASE[selectedCrop] || FERTILIZER_DATABASE.wheat;

  // Fertilizer counts
  const totalUreaBags = Math.round(cropProfile.ureaBagsPerAcre * currentAcres * 10) / 10;
  const totalDapBags = Math.round(cropProfile.dapBagsPerAcre * currentAcres * 10) / 10;
  const totalMopBags = Math.round(cropProfile.mopBagsPerAcre * currentAcres * 10) / 10;
  const totalZincKg = Math.round(cropProfile.zincKgPerAcre * currentAcres);

  // Cost calculation
  const totalFertilizerCost = Math.round(
    totalUreaBags * UREA_MRP_BAG +
    totalDapBags * DAP_MRP_BAG +
    totalMopBags * MOP_MRP_BAG +
    totalZincKg * ZINC_MRP_KG
  );

  // Irrigation calculations
  // Diesel engine 8HP burns approx 1.4 - 1.8 Litres/hour. Electric 7.5HP draws approx 5.6 kW.
  const dieselLitersPerHour = pumpHP <= 5 ? 1.1 : pumpHP <= 8 ? 1.5 : 2.0;
  const electricKwhPerHour = pumpHP * 0.746 * 0.9;

  const totalFuelUsed = pumpType === 'diesel'
    ? Math.round(dieselLitersPerHour * hoursPerIrrigation * 10) / 10
    : Math.round(electricKwhPerHour * hoursPerIrrigation * 10) / 10;

  const totalPumpCost = pumpType === 'diesel'
    ? Math.round(totalFuelUsed * dieselPrice)
    : Math.round(totalFuelUsed * elecRate);

  // Spray condition judgment
  const isSpraySafe = windSpeed <= 15 && rainRisk <= 25 && airTemp <= 32 && !leafWetness;
  const isSprayWarning = (windSpeed > 15 && windSpeed <= 22) || (rainRisk > 25 && rainRisk <= 50) || leafWetness;
  const isSprayHazard = windSpeed > 22 || rainRisk > 50 || airTemp > 35;

  const voiceSummaryText = language === 'hi'
    ? `${cropProfile.nameHi} के लिए ${landArea} ${unit === 'acre' ? 'एकड़' : unit === 'bigha' ? 'बीघा' : 'हेक्टेयर'} में कुल ${totalUreaBags} बोरी यूरिया, ${totalDapBags} बोरी डीएपी और ${totalMopBags} बोरी पोटाश की जरूरत है। अनुमानित सरकारी खर्च ₹${totalFertilizerCost} रहेगा।`
    : `For ${cropProfile.nameEn} on ${landArea} ${unit}, you need ${totalUreaBags} bags Urea, ${totalDapBags} bags DAP, and ${totalMopBags} bags MOP. Estimated subsidized cost is ₹${totalFertilizerCost}.`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header with Indian Agricultural Decor */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-900 text-white p-4 sm:p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <Tractor className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                {language === 'hi' ? 'किसान सुविधा केंद्र' : 'Kisan Kendra Suite'}
              </span>
              <span className="text-xs text-amber-200/90 font-medium">
                ICAR Package of Practices Aligned
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{language === 'hi' ? 'खेत का त्वरित हिसाब व गणक' : 'Smart Field & Input Calculators'}</span>
            </h2>
            <p className="text-xs text-stone-200 max-w-xl">
              {language === 'hi'
                ? 'खाद की सही मात्रा, बीज दर, सिंचाई डीजल खर्च व छिड़काव का अनुकूल समय सीधे जानें।'
                : 'Scientific fertilizer dosing, certified seed requirements, pump running costs, and spray window.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="flex items-center gap-1 p-2 bg-stone-100 border-b border-stone-200 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('fertilizer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'fertilizer'
                ? 'bg-white text-emerald-950 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-700" />
            <span>{language === 'hi' ? '1. खाद गणक (Fertilizer)' : '1. Fertilizer Dose'}</span>
          </button>

          <button
            onClick={() => setActiveTab('seed')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'seed'
                ? 'bg-white text-emerald-950 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Wheat className="w-4 h-4 text-amber-700" />
            <span>{language === 'hi' ? '2. बीज दर व दूरी (Seed Rate)' : '2. Seed & Spacing'}</span>
          </button>

          <button
            onClick={() => setActiveTab('irrigation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'irrigation'
                ? 'bg-white text-emerald-950 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Droplets className="w-4 h-4 text-blue-700" />
            <span>{language === 'hi' ? '3. डीजल व बिजली खर्च' : '3. Irrigation Pump'}</span>
          </button>

          <button
            onClick={() => setActiveTab('spray')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'spray'
                ? 'bg-white text-emerald-950 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Wind className="w-4 h-4 text-teal-700" />
            <span>{language === 'hi' ? '4. छिड़काव अनुकूलता' : '4. Spray Window'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#FAFBF7]">
          {/* TAB 1: FERTILIZER CALCULATOR */}
          {activeTab === 'fertilizer' && (
            <div className="space-y-6">
              {/* Inputs Bar */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'फसल चुनें (Crop)' : 'Select Crop'}
                    </label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="wheat">🌾 Wheat (गेहूं)</option>
                      <option value="paddy">🌾 Paddy / Rice (धान)</option>
                      <option value="mustard">🟡 Mustard (सरसों / राया)</option>
                      <option value="sugarcane">🎋 Sugarcane (गन्ना)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'जमीन का क्षेत्रफल (Area)' : 'Field Area'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={landArea}
                      onChange={(e) => setLandArea(Math.max(0.1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'इकाई (Unit)' : 'Unit'}
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="acre">{language === 'hi' ? 'एकड़ (Acre)' : 'Acre'}</option>
                      <option value="bigha">{language === 'hi' ? 'बीघा (Bigha ~0.4 Acre)' : 'Bigha (~0.4 Acre)'}</option>
                      <option value="hectare">{language === 'hi' ? 'हेक्टेयर (Hectare ~2.47 Acre)' : 'Hectare'}</option>
                    </select>
                  </div>
                </div>

                {/* Voice helper for this calculation */}
                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <span className="text-xs text-stone-500">
                    {language === 'hi'
                      ? `कुल क्षेत्रफल: ${Math.round(currentAcres * 10) / 10} एकड़ के आधार पर गणना`
                      : `Normalized Area: ${Math.round(currentAcres * 10) / 10} Acres`}
                  </span>
                  <KisanVoicePlayer text={voiceSummaryText} language={language} compact />
                </div>
              </div>

              {/* Real-time Fertilizer Requirement Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Urea Card */}
                <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs relative overflow-hidden">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    {language === 'hi' ? 'यूरिया (45 kg बोरी)' : 'Urea (45kg Bags)'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                    {totalUreaBags} <span className="text-xs font-normal text-stone-500">{language === 'hi' ? 'बोरी' : 'bags'}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    ~{Math.round(totalUreaBags * 45)} kg · ₹{Math.round(totalUreaBags * UREA_MRP_BAG)}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                {/* DAP Card */}
                <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs relative overflow-hidden">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                    {language === 'hi' ? 'डीएपी (50 kg बोरी)' : 'DAP (50kg Bags)'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                    {totalDapBags} <span className="text-xs font-normal text-stone-500">{language === 'hi' ? 'बोरी' : 'bags'}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    ~{Math.round(totalDapBags * 50)} kg · ₹{Math.round(totalDapBags * DAP_MRP_BAG)}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                </div>

                {/* MOP / Potash Card */}
                <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs relative overflow-hidden">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800 mb-1">
                    {language === 'hi' ? 'पोटाश / MOP (50 kg)' : 'MOP / Potash'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                    {totalMopBags} <span className="text-xs font-normal text-stone-500">{language === 'hi' ? 'बोरी' : 'bags'}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    ~{Math.round(totalMopBags * 50)} kg · ₹{Math.round(totalMopBags * MOP_MRP_BAG)}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                </div>

                {/* Zinc / Micronutrient Card */}
                <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-xs relative overflow-hidden">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 mb-1">
                    {language === 'hi' ? 'जिंक सल्फेट (21%)' : 'Zinc Sulphate'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                    {totalZincKg} <span className="text-xs font-normal text-stone-500">kg</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    ₹{Math.round(totalZincKg * ZINC_MRP_KG)} {language === 'hi' ? 'लागत' : 'cost'}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                </div>
              </div>

              {/* Total Subsidized Cost Banner */}
              <div className="bg-emerald-950 text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                    {language === 'hi' ? 'कुल सरकारी सब्सिडी वाला अनुमानित खर्च' : 'Estimated Total Subsidized Input Cost'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300 mt-0.5">
                    ₹{totalFertilizerCost.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-stone-300 mt-1">
                    {language === 'hi'
                      ? 'भारत सरकार की आधिकारिक नियंत्रित मूल्य सूची (Neem Coated Urea ₹266.50, DAP ₹1350)'
                      : 'Calculated using official Govt controlled MRPs for Neem Coated Urea & DAP.'}
                  </div>
                </div>

                <div className="text-right bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/50">
                  <div className="text-xs text-emerald-200 font-bold">
                    {language === 'hi' ? 'अनुमानित बचत' : 'Govt Subsidy Benefit'}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    ~₹{Math.round(totalFertilizerCost * 1.8).toLocaleString('en-IN')} {language === 'hi' ? 'बाजार मूल्य से कम' : 'below global market'}
                  </div>
                </div>
              </div>

              {/* Application Timetable & Stages */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    {language === 'hi' ? 'खाद देने की सही वैज्ञानिक समय-सारणी (ICAR Schedule)' : 'Scientific Nutrient Application Timetable'}
                  </h3>
                </div>

                <div className="divide-y divide-stone-100">
                  {cropProfile.stages.map((stg, i) => (
                    <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="font-bold text-xs sm:text-sm text-stone-900 sm:w-1/3">
                        {language === 'hi' ? stg.stageHi : stg.stageEn}
                      </div>
                      <div className="text-xs text-stone-600 sm:w-2/3 leading-relaxed">
                        {language === 'hi' ? stg.adviceHi : stg.adviceEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CERTIFIED SEED RATE & SPACING */}
          {activeTab === 'seed' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
                <label className="block text-xs font-bold text-stone-700">
                  {language === 'hi' ? 'फसल चुनें (Crop for Seed Calculation)' : 'Select Crop'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(SEED_RATES).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCrop(key)}
                      className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                        selectedCrop === key
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {SEED_RATES[selectedCrop] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      {language === 'hi' ? 'प्रमाणित बीज दर (Seed Rate)' : 'Certified Seed Rate'}
                    </span>
                    <div className="text-2xl font-black text-stone-900">
                      {SEED_RATES[selectedCrop].rateKgAcre}
                    </div>
                    <p className="text-xs text-stone-500">
                      {language === 'hi'
                        ? 'प्रति एकड़ प्रमाणित बीज दर। समय पर बुवाई के लिए पर्याप्त।'
                        : 'Certified seed rate per acre for optimal plant population.'}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      {language === 'hi' ? 'कतार से कतार की दूरी (Spacing)' : 'Row & Plant Spacing'}
                    </span>
                    <div className="text-2xl font-black text-stone-900">
                      {SEED_RATES[selectedCrop].spacing}
                    </div>
                    <p className="text-xs text-stone-500">
                      {language === 'hi'
                        ? 'उचित दूरी रखने से कल्ले अधिक फूटते हैं और धूप/हवा का संचार सही रहता है।'
                        : 'Ensures optimal sunlight interception and maximum productive tillers.'}
                    </p>
                  </div>

                  <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" />
                      <span>{language === 'hi' ? 'बीजोपचार (Seed Treatment Formula)' : 'Fungicide Seed Treatment Formula'}</span>
                    </span>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                      {language === 'hi'
                        ? SEED_RATES[selectedCrop].treatmentHi
                        : SEED_RATES[selectedCrop].treatmentEn}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IRRIGATION & DIESEL CALCULATOR */}
          {activeTab === 'irrigation' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'ट्यूबवेल ऊर्जा स्रोत' : 'Pump Power Source'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPumpType('diesel')}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          pumpType === 'diesel'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {language === 'hi' ? 'डीजल इंजन (Diesel)' : 'Diesel Engine'}
                      </button>
                      <button
                        onClick={() => setPumpType('electric')}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          pumpType === 'electric'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {language === 'hi' ? 'बिजली मोटर (Electric)' : 'Electric Motor'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'मोटर क्षमता (HP)' : 'Motor Horsepower (HP)'}
                    </label>
                    <select
                      value={pumpHP}
                      onChange={(e) => setPumpHP(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 font-bold focus:outline-none focus:ring-2 focus:ring-blue-700"
                    >
                      <option value={5}>5 HP</option>
                      <option value={7.5}>7.5 HP</option>
                      <option value={8}>8 HP</option>
                      <option value={10}>10 HP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'प्रति सिंचाई चलने के घंटे' : 'Running Hours per Irrigation'}
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="48"
                      value={hoursPerIrrigation}
                      onChange={(e) => setHoursPerIrrigation(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {pumpType === 'diesel'
                        ? (language === 'hi' ? 'डीजल का भाव (₹/लीटर)' : 'Diesel Price (₹/Litre)')
                        : (language === 'hi' ? 'बिजली दर (₹/यूनिट)' : 'Electricity Rate (₹/kWh)')}
                    </label>
                    <input
                      type="number"
                      value={pumpType === 'diesel' ? dieselPrice : elecRate}
                      onChange={(e) =>
                        pumpType === 'diesel'
                          ? setDieselPrice(Number(e.target.value))
                          : setElecRate(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Pump Consumption Result */}
              <div className="bg-gradient-to-r from-blue-950 to-stone-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
                    {language === 'hi' ? 'एक सिंचाई का कुल खर्च' : 'Total Cost per Irrigation'}
                  </div>
                  <div className="text-3xl font-black tracking-tight text-white mt-1">
                    ₹{totalPumpCost.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-stone-300 mt-1">
                    {pumpType === 'diesel'
                      ? `${totalFuelUsed} लीटर डीजल की खपत (${hoursPerIrrigation} घंटे संचालन)`
                      : `${totalFuelUsed} यूनिट बिजली की खपत (${hoursPerIrrigation} घंटे संचालन)`}
                  </div>
                </div>

                <div className="bg-blue-900/50 p-3 rounded-xl border border-blue-500/30 text-xs text-blue-200 max-w-xs">
                  💡 <strong>{language === 'hi' ? 'बचत सलाह:' : 'Pro Tip:'}</strong>{' '}
                  {language === 'hi'
                    ? 'लेजर लैंड लेवलिंग और ड्रिप/स्प्रिंकलर सिंचाई से 25-30% डीजल व बिजली की बचत होती है।'
                    : 'Laser land leveling and micro-irrigation save up to 30% fuel and tubewell wear.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SMART SPRAY SAFETY DIAL */}
          {activeTab === 'spray' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-stone-900">
                  {language === 'hi' ? 'खेत की वर्तमान मौसमी स्थिति सेट करें' : 'Current Micro-Climate Parameters'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'हवा की गति (Wind Speed km/h)' : 'Wind Speed (km/h)'}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="35"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(Number(e.target.value))}
                      className="w-full accent-teal-600"
                    />
                    <div className="text-xs font-bold text-stone-900 mt-1">{windSpeed} km/h</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? '24 घंटे में बारिश का अंदेशा (%)' : 'Rain Probability (%)'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rainRisk}
                      onChange={(e) => setRainRisk(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <div className="text-xs font-bold text-stone-900 mt-1">{rainRisk}%</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'hi' ? 'पत्तियों पर ओस / नमी' : 'Leaf Wetness / Dew'}
                    </label>
                    <button
                      onClick={() => setLeafWetness(!leafWetness)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        leafWetness
                          ? 'bg-blue-100 text-blue-900 border-blue-400'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {leafWetness
                        ? (language === 'hi' ? '💧 पत्तियां गीली हैं (Dew Present)' : '💧 Leaves are Wet')
                        : (language === 'hi' ? '☀️ पत्तियां सूखी हैं (Dry Leaves)' : '☀️ Leaves are Dry')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Dial Verdict Result */}
              <div
                className={`rounded-2xl p-6 border transition-all ${
                  isSpraySafe
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : isSprayWarning
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {isSpraySafe ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className={`w-7 h-7 shrink-0 ${isSprayWarning ? 'text-amber-600' : 'text-rose-600'}`} />
                  )}

                  <div>
                    <h4 className="text-lg font-black tracking-tight">
                      {isSpraySafe
                        ? (language === 'hi' ? '✅ छिड़काव के लिए सर्वोत्तम समय (Safe Spray Window)' : '✅ Optimal Spray Window')
                        : isSprayWarning
                        ? (language === 'hi' ? '⚠️ सावधानी बरतें (Moderate Risk Window)' : '⚠️ Caution Advised')
                        : (language === 'hi' ? '🛑 छिड़काव तुरंत टालें (High Washout / Drift Risk)' : '🛑 Postpone Spraying Immediately')}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      {isSpraySafe
                        ? (language === 'hi'
                            ? 'हवा की गति 15 किमी/घंटा से कम है और अगले 24 घंटे में बारिश का कोई खतरा नहीं है। दवा पत्तियों पर पूरी तरह चिपकेगी।'
                            : 'Wind speed is below 15 km/h and no heavy precipitation is expected in 24 hours. Minimal drift loss.')
                        : isSprayWarning
                        ? (language === 'hi'
                            ? 'ओस सूखने का इंतजार करें या दोपहर की तेज धूप (12-3 बजे) बीतने के बाद शाम को छिड़काव करें।'
                            : 'Wait until morning dew evaporates completely. Spray during late afternoon to prevent evaporation.')
                        : (language === 'hi'
                            ? 'तेज हवा से दवा उड़कर पड़ोसी खेत में जाएगी या बारिश से धुल जाएगी। रसायनों की बर्बादी से बचने के लिए छिड़काव रोकें।'
                            : 'High wind drift or imminent rainfall risks washing off pesticides, leading to financial loss.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500 font-medium">
            KISAN CULTURE · Empowering 140M+ Indian Agronomists
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            {language === 'hi' ? 'बंद करें (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

