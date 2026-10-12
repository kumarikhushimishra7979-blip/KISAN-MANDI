import React, { useState } from 'react';
import { PredictionResult, Language } from '../types';
import { Droplets, ShieldCheck, Sun, AlertTriangle } from 'lucide-react';

interface QualityMoistureGuideProps {
  prediction: PredictionResult;
  currentLang: Language;
}

export const QualityMoistureGuide: React.FC<QualityMoistureGuideProps> = ({
  prediction,
  currentLang,
}) => {
  const { crop, currentPrice } = prediction;
  const benchmarkMoisture = crop.typicalMoisture; // e.g. 14% for maize
  const [currentMoisture, setCurrentMoisture] = useState<number>(benchmarkMoisture);

  // Moisture difference
  const moistureDiff = currentMoisture - benchmarkMoisture;
  // In APMC, moisture above benchmark gets 1.5% to 2% deduction per 1% excess
  const deductionPerPct = 35; // ₹35 per quintal per 1% excess moisture
  const totalImpact = Math.round(moistureDiff * deductionPerPct);

  const realizedPrice = currentPrice - (totalImpact > 0 ? totalImpact : 0) + (totalImpact < 0 ? Math.abs(totalImpact * 0.5) : 0);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-stone-200">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center space-x-2">
          <Droplets className="w-5 h-5 text-sky-600" />
          <h3 className="font-black text-lg sm:text-xl text-stone-900">
            {currentLang === 'hi'
              ? `${crop.hindiName} नमी (Moisture) व गुणवत्ता मूल्य गाइड`
              : `${crop.name} Moisture & Mandi Quality Calculator`}
          </h3>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-stone-600 mt-2">
        {currentLang === 'hi'
          ? `मंडी व्यापारी ${benchmarkMoisture}% से अधिक नमी होने पर भारी कटौती करते हैं। अपनी फसल की नमी जांचें:`
          : `APMC traders cut rates if moisture exceeds standard ${benchmarkMoisture}%. Check your net realized price:`}
      </p>

      {/* Moisture Slider */}
      <div className="mt-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-stone-700">
            {currentLang === 'hi' ? 'फसल की नमी प्रतिशत (Moisture %):' : 'Current Moisture Content:'}
          </label>
          <span className="text-xl font-black text-stone-900 bg-white px-3 py-1 rounded-lg border border-stone-300">
            {currentMoisture}%
          </span>
        </div>

        <input
          type="range"
          min={Math.max(6, benchmarkMoisture - 6)}
          max={benchmarkMoisture + 10}
          step={0.5}
          value={currentMoisture}
          onChange={(e) => setCurrentMoisture(parseFloat(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
        />

        <div className="flex justify-between text-[11px] text-stone-500 font-semibold mt-1">
          <span>सूखा / प्रीमियम ({benchmarkMoisture - 4}%)</span>
          <span className="text-emerald-700 font-black">मानक ({benchmarkMoisture}%)</span>
          <span className="text-rose-700">अधिक नमी ({benchmarkMoisture + 8}%)</span>
        </div>
      </div>

      {/* Impact Result */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 uppercase block">
            मानक मंडी भाव
          </span>
          <span className="text-xl font-black text-stone-900 mt-0.5 block">
            ₹{currentPrice} / Qtl
          </span>
          <span className="text-[10px] text-stone-500">
            {benchmarkMoisture}% नमी पर तय दर
          </span>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 uppercase block">
            व्यापारी कटौती / अधिलाभ
          </span>
          <span
            className={`text-xl font-black mt-0.5 block ${
              totalImpact > 0
                ? 'text-rose-700'
                : totalImpact < 0
                ? 'text-emerald-700'
                : 'text-stone-800'
            }`}
          >
            {totalImpact > 0 ? `-₹${totalImpact}` : totalImpact < 0 ? `+₹${Math.round(Math.abs(totalImpact * 0.5))}` : '₹0'} / Qtl
          </span>
          <span className="text-[10px] text-stone-500">
            {totalImpact > 0 ? `${moistureDiff}% अतिरिक्त नमी कटौती` : 'मानक अनुसार उचित'}
          </span>
        </div>

        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase block">
            हाथ में मिलने वाला वास्तविक भाव
          </span>
          <span className="text-2xl font-black text-emerald-950 mt-0.5 block">
            ₹{Math.round(realizedPrice)} / Qtl
          </span>
          <span className="text-[10px] text-emerald-700 font-bold">
            शुद्ध नकद वसूली
          </span>
        </div>
      </div>

      {/* Practical Farmer Tip */}
      {currentMoisture > benchmarkMoisture && (
        <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start space-x-2.5 text-xs text-amber-900">
          <Sun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-amber-950 block">
              💡 किसान सलाह: तिरपाल पर 2 दिन धूप दिखाएं!
            </span>
            <span>
              मंडी ले जाने से पहले फर्श या तिरपाल पर 2 दिन धूप सुखाने से नमी {currentMoisture}% से घटकर {benchmarkMoisture}% हो जाएगी। 50 क्विंटल पर आप सीधे{' '}
              <strong>₹{(totalImpact * 50).toLocaleString('en-IN')}</strong> की बचत कर सकेंगे!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
