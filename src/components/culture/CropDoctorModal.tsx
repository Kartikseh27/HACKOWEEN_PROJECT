/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Leaf,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Language } from '../../types';
import { KisanVoicePlayer } from './KisanVoicePlayer';

interface CropDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectSymptomForAI: (symptomName: string, crop: string) => void;
}

type PlantPart = 'leaf' | 'stem' | 'earhead' | 'root';

interface SymptomGuide {
  id: string;
  nameHi: string;
  nameEn: string;
  crop: string;
  appearanceHi: string;
  appearanceEn: string;
  desiRemedyHi: string;
  desiRemedyEn: string;
  chemicalRemedyHi: string;
  chemicalRemedyEn: string;
  severity: 'mild' | 'moderate' | 'severe';
}

const SYMPTOM_DATABASE: Record<PlantPart, SymptomGuide[]> = {
  leaf: [
    {
      id: 'yellow_rust',
      nameHi: 'पीला रतुआ / हल्दी रोग (Stripe Rust)',
      nameEn: 'Yellow / Stripe Rust (Puccinia striiformis)',
      crop: 'Wheat (गेहूं)',
      appearanceHi: 'पत्तियों की ऊपरी सतह पर पीले रंग की धारियां और हल्दी जैसा पाउडर। सफेद कपड़े या उंगली पर रगड़ने से पीला रंग छूटता है।',
      appearanceEn: 'Yellow powdery pustules arranged in linear stripes on leaf surface. Rubs off yellow on fingers/cloth.',
      desiRemedyHi: 'शुरुआती लक्षण पर खट्टी छाछ (5 लीटर) + 150 लीटर पानी का छिड़काव या नीम तेल (1500 ppm) 3 मिली/लीटर।',
      desiRemedyEn: 'Foliar spray sour buttermilk (5L/150L water) or Neem Oil 1500ppm @ 3ml/L water at initial onset.',
      chemicalRemedyHi: 'प्रोपिकोनाजोल 25% ईसी (Tilt) 200 मिली या टेबुकोनाजोल 200 मिली प्रति 200 लीटर पानी प्रति एकड़।',
      chemicalRemedyEn: 'Propiconazole 25% EC @ 200ml OR Tebuconazole @ 200ml in 200 litres water per acre.',
      severity: 'severe',
    },
    {
      id: 'leaf_blight',
      nameHi: 'पत्ती झुलसा (Leaf Blight)',
      nameEn: 'Alternaria / Helminthosporium Leaf Blight',
      crop: 'Wheat, Paddy, Mustard',
      appearanceHi: 'पत्तियों पर भूरे या काले धब्बे जिनके चारों ओर पीला छल्ला होता है। बाद में पत्ती झुलसकर सूखने लगती है।',
      appearanceEn: 'Oval to elliptical brown lesions with yellow halo, progressing to leaf necrosis and scorching.',
      desiRemedyHi: 'ट्राइकोडर्मा विरिडी 5 ग्राम/लीटर पानी या 10% नीम पत्ती का काढ़ा।',
      desiRemedyEn: 'Trichoderma viride @ 5g/L or 10% Neem leaf boiled extract.',
      chemicalRemedyHi: 'मैंकोजेब 75% डब्ल्यूपी (M-45) 500-600 ग्राम प्रति 200 लीटर पानी।',
      chemicalRemedyEn: 'Mancozeb 75% WP @ 500-600g per 200 litres water.',
      severity: 'moderate',
    },
    {
      id: 'nitrogen_chlorosis',
      nameHi: 'नाइट्रोजन की कमी से पीलापन (N Deficiency)',
      nameEn: 'Nitrogen Deficiency Chlorosis',
      crop: 'Wheat, Paddy, Maize',
      appearanceHi: 'निचली पुरानी पत्तियों से शुरू होकर पत्ती की नोक से बीच की नस तक V-आकार में पीलापन। पाउडर नहीं छूटता।',
      appearanceEn: 'V-shaped uniform yellowing starting from tips of older lower leaves. No fungal powder on rubbing.',
      desiRemedyHi: 'जीवामृत 200 लीटर प्रति एकड़ सिंचाई के पानी के साथ चलाएं या वर्मीवाश का 5% छिड़काव।',
      desiRemedyEn: 'Jeevamrit 200L/acre via irrigation canal or 5% vermiwash foliar application.',
      chemicalRemedyHi: '2% यूरिया (20 ग्राम/लीटर पानी) का दोपहर बाद पर्णीय छिड़काव या सिंचाई के बाद यूरिया टॉप-ड्रेसिंग।',
      chemicalRemedyEn: 'Foliar spray 2% Urea solution (20g/L water) or immediate top-dressing after irrigation.',
      severity: 'mild',
    },
  ],
  stem: [
    {
      id: 'stem_borer',
      nameHi: 'तना छेदक / सुंडी (Stem Borer)',
      nameEn: 'Stem Borer (Scirpophaga incertulas / Chilo)',
      crop: 'Paddy, Sugarcane, Maize',
      appearanceHi: 'तने में छेद व कीड़े की विष्ठा (मल)। धान में बीच का पत्ता सूख जाता है जिसे डेड-हार्ट (Dead Heart) कहते हैं।',
      appearanceEn: 'Holes in stem with frass. Causes "Dead Heart" in vegetative stage and white ears at panicle stage.',
      desiRemedyHi: 'ट्राइकोग्रामा कार्ड (Trichogramma card) 20,000 अंडे/एकड़ लगाएं व 4 फेरोमोन ट्रैप प्रति एकड़ स्थापित करें।',
      desiRemedyEn: 'Install 4 pheromone traps/acre and release Trichogramma chilonis egg parasitoid @ 20,000/acre.',
      chemicalRemedyHi: 'क्लोरांट्रानिलिप्रोल 0.4% जीआर (Ferterra) 4 किलो प्रति एकड़ बालू में मिलाकर डालें।',
      chemicalRemedyEn: 'Chlorantraniliprole 0.4% GR (Ferterra) @ 4 kg/acre mixed with sand and broadcast.',
      severity: 'severe',
    },
    {
      id: 'termite',
      nameHi: 'दीमक प्रकोप (Termite Infestation)',
      nameEn: 'Termite Attack (Odontotermes obesus)',
      crop: 'Wheat, Gram, Mustard',
      appearanceHi: 'पौधा सूखकर पीला पड़ता है। हल्के हाथ से खींचने पर बिना जड़ के तना आसानी से हाथ में आ जाता है।',
      appearanceEn: 'Plants dry out in patches. Severed plant pulls out easily with chewed collar region.',
      desiRemedyHi: 'कच्ची गोबर खाद न डालें। नीम खली 100 किलो प्रति एकड़ जुताई के समय मिलाएं।',
      desiRemedyEn: 'Avoid un-decomposed cow dung. Apply Neem cake @ 100 kg/acre during field preparation.',
      chemicalRemedyHi: 'फिप्रोनिल 0.3% जीआर 8-10 किलो प्रति एकड़ या क्लोरपायरीफॉस 20% ईसी 1 लीटर सिंचाई के पानी के साथ दें।',
      chemicalRemedyEn: 'Fipronil 0.3% GR @ 8-10 kg/acre or Chlorpyrifos 20% EC @ 1 L/acre along with irrigation.',
      severity: 'moderate',
    },
  ],
  earhead: [
    {
      id: 'loose_smut',
      nameHi: 'गेहूं की काली बाली / कंडुआ (Loose Smut)',
      nameEn: 'Loose Smut of Wheat (Ustilago tritici)',
      crop: 'Wheat (गेहूं)',
      appearanceHi: 'निकलने पर पूरी बाली दानों की जगह काले चूर्ण (कालिख) में बदली होती है। हवा से पाउडर उड़ता है।',
      appearanceEn: 'Entire earhead transformed into black powdery spore mass replacing grains. Silvery membrane bursts early.',
      desiRemedyHi: 'रोगी बालियों को तुरंत पॉलीथिन बैग से ढककर तोड़ लें और खेत से दूर गड्ढे में दबाएं ताकि दूसरे पौधों में न फैले।',
      desiRemedyEn: 'Carefully rogue out diseased ears in plastic bags to avoid wind dispersal and bury deep.',
      chemicalRemedyHi: 'बुवाई पूर्व बीजोपचार: कार्बाक्सिन + थीरम (Vitavax Power) 2.5 ग्राम प्रति किलो बीज।',
      chemicalRemedyEn: 'Strict seed treatment before sowing: Carboxin 37.5% + Thiram 37.5% @ 2.5g/kg seed.',
      severity: 'severe',
    },
    {
      id: 'pod_borer',
      nameHi: 'चने / अरहर की फली छेदक इल्ली (Pod Borer)',
      nameEn: 'Gram Pod Borer (Helicoverpa armigera)',
      crop: 'Gram (चना), Arhar, Pea',
      appearanceHi: 'फलियों में गोल छेद और आधा शरीर छेद के अंदर घुसाकर दाना खाती हुई हरी/चित्तीदार सुंडी।',
      appearanceEn: 'Round holes in pods with caterpillar feeding with its head inside the pod.',
      desiRemedyHi: 'टी-आकार की चिड़ियों के बैठने की खूंटियां (Bird perches) 15-20 प्रति एकड़ लगाएं + नीम तेल (1500ppm) 5 मिली/लीटर।',
      desiRemedyEn: 'Install 15-20 "T" shaped bird perches/acre and spray Neem oil (1500ppm) @ 5ml/L.',
      chemicalRemedyHi: 'इमामेक्टिन बेंजोएट 5% एसजी (Proclaim) 80 ग्राम प्रति 200 लीटर पानी प्रति एकड़।',
      chemicalRemedyEn: 'Emamectin Benzoate 5% SG @ 80g in 200 litres water per acre.',
      severity: 'moderate',
    },
  ],
  root: [
    {
      id: 'root_rot',
      nameHi: 'जड़ गलन व उकठा (Root Rot / Wilt)',
      nameEn: 'Fusarium Wilt / Rhizoctonia Root Rot',
      crop: 'Gram, Mustard, Cotton',
      appearanceHi: 'दोपहर में पौधे मुरझा जाते हैं, सुबह ताजे दिखते हैं। जड़ें काली पड़कर सड़ जाती हैं।',
      appearanceEn: 'Plants wilt during daytime heat. Taproot shows dark vascular browning and rotten cortical tissue.',
      desiRemedyHi: 'ट्राइकोडर्मा हरजिएनम 2.5 किलो को 100 किलो गोबर की खाद में मिलाकर खेत में फैलाएं।',
      desiRemedyEn: 'Enrich 100kg well-rotted FYM with 2.5kg Trichoderma harzianum and broadcast.',
      chemicalRemedyHi: 'कार्बेन्डाजिम 12% + मैंकोजेब 63% (Saaf) 2 ग्राम प्रति लीटर पानी से पौधों की जड़ों में ड्रेन्चिंग करें।',
      chemicalRemedyEn: 'Drench root zone with Carbendazim 12% + Mancozeb 63% (Saaf) @ 2g per litre water.',
      severity: 'severe',
    },
  ],
};

export const CropDoctorModal: React.FC<CropDoctorModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectSymptomForAI,
}) => {
  const [selectedPart, setSelectedPart] = useState<PlantPart>('leaf');
  const [activeSymptom, setActiveSymptom] = useState<SymptomGuide>(SYMPTOM_DATABASE.leaf[0]);

  if (!isOpen) return null;

  const currentList = SYMPTOM_DATABASE[selectedPart] || [];

  const handleSelectSymptom = (item: SymptomGuide) => {
    setActiveSymptom(item);
  };

  const handleSendToAI = () => {
    onSelectSymptomForAI(activeSymptom.nameEn, activeSymptom.crop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Traditional Plant Doctor Theme */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-stone-900 text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                {language === 'hi' ? 'फसल डॉक्टर' : 'Crop Doctor'}
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                {language === 'hi' ? 'त्वरित लक्षण व देसी + रासायनिक उपचार' : 'Visual Symptom & Treatment Guide'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {language === 'hi' ? 'पौधे के किस हिस्से में समस्या दिख रही है?' : 'Select Affected Plant Anatomy'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Plant Anatomy Part Selector */}
        <div className="grid grid-cols-4 bg-stone-100 p-2 border-b border-stone-200 gap-2 shrink-0">
          {[
            { id: 'leaf' as PlantPart, labelHi: '🍃 पत्ती (Leaf)', labelEn: '🍃 Leaf Symptoms' },
            { id: 'stem' as PlantPart, labelHi: '🎋 तना (Stem)', labelEn: '🎋 Stem & Shoot' },
            { id: 'earhead' as PlantPart, labelHi: '🌾 बाली / फल', labelEn: '🌾 Earhead & Pod' },
            { id: 'root' as PlantPart, labelHi: '🪴 जड़ (Root)', labelEn: '🪴 Root & Soil' },
          ].map((part) => (
            <button
              key={part.id}
              onClick={() => {
                setSelectedPart(part.id);
                if (SYMPTOM_DATABASE[part.id][0]) {
                  setActiveSymptom(SYMPTOM_DATABASE[part.id][0]);
                }
              }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                selectedPart === part.id
                  ? 'bg-white text-emerald-950 shadow-sm border border-stone-300'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {language === 'hi' ? part.labelHi : part.labelEn}
            </button>
          ))}
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAFBF7]">
          {/* Left Column: Symptom List for Chosen Plant Part */}
          <div className="space-y-2 md:col-span-1 border-r border-stone-200/80 pr-0 md:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
              {language === 'hi' ? 'प्रमुख संभावित रोग व कीट' : 'Observed Symptom'}
            </span>
            <div className="space-y-2">
              {currentList.map((item) => {
                const isSelected = activeSymptom.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSymptom(item)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                        : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50 hover:border-emerald-700/50'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">
                      {language === 'hi' ? item.nameHi : item.nameEn}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                      {item.crop}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Diagnosis & Prescription */}
          <div className="md:col-span-2 space-y-4">
            {activeSymptom && (
              <>
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                          {activeSymptom.severity} Risk
                        </span>
                        <span className="text-xs font-semibold text-stone-500">
                          {activeSymptom.crop}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-stone-900 tracking-tight">
                        {language === 'hi' ? activeSymptom.nameHi : activeSymptom.nameEn}
                      </h3>
                    </div>

                    <KisanVoicePlayer
                      text={`${language === 'hi' ? activeSymptom.nameHi : activeSymptom.nameEn}. ${language === 'hi' ? activeSymptom.appearanceHi : activeSymptom.appearanceEn}. ${language === 'hi' ? activeSymptom.desiRemedyHi : activeSymptom.desiRemedyEn}`}
                      language={language}
                      compact
                    />
                  </div>

                  {/* Identification Appearance */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>{language === 'hi' ? 'खेत में पहचान कैसे करें?' : 'Field Identification Key'}</span>
                    </span>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {language === 'hi' ? activeSymptom.appearanceHi : activeSymptom.appearanceEn}
                    </p>
                  </div>

                  {/* Desi / Organic Herbal Treatment */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{language === 'hi' ? 'देसी व जैविक उपचार (Zero-Budget IPM Recipe)' : 'Desi Organic & Bio-Control Recipe'}</span>
                    </span>
                    <p className="text-xs text-stone-800 leading-relaxed">
                      {language === 'hi' ? activeSymptom.desiRemedyHi : activeSymptom.desiRemedyEn}
                    </p>
                  </div>

                  {/* Chemical Recommendation */}
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                      <span>{language === 'hi' ? 'प्रमाणित रासायनिक उपचार (ICAR Chemical Dosage)' : 'ICAR Certified Chemical Control'}</span>
                    </span>
                    <p className="text-xs text-stone-800 leading-relaxed">
                      {language === 'hi' ? activeSymptom.chemicalRemedyHi : activeSymptom.chemicalRemedyEn}
                    </p>
                  </div>
                </div>

                {/* Send to AI Action Card */}
                <div className="bg-stone-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'पूरी एआई जांच और रिपोर्ट चाहिए?' : 'Need Complete Vision AI Inspection?'}</span>
                    </div>
                    <div className="text-xs text-stone-300 mt-0.5">
                      {language === 'hi'
                        ? 'इस लक्षण को सीधे Crop Health AI टूल में लोड करें और फोटो अपलोड करके 100% पुष्टि पाएं।'
                        : 'Load this symptom into the AI Crop Health Engine with your field photos.'}
                    </div>
                  </div>

                  <button
                    onClick={handleSendToAI}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                  >
                    <span>{language === 'hi' ? 'एआई जांच में लोड करें' : 'Load in Crop AI'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500 font-medium">
            KISAN CULTURE · Verified Agronomic Knowledge Base
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

