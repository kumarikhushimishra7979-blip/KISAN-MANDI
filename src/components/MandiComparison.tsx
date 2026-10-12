import React from 'react';
import { Mandi, Crop, Language } from '../types';
import { MANDIS, calculateForecast } from '../data/mandiData';
import { MapPin, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface MandiComparisonProps {
  currentMandi: Mandi;
  currentCrop: Crop;
  currentLang: Language;
  onSelectMandi: (mandiId: string) => void;
}

export const MandiComparison: React.FC<MandiComparisonProps> = ({
  currentMandi,
  currentCrop,
  currentLang,
  onSelectMandi,
}) => {
  const comparisons = MANDIS.map((m) => {
    const f = calculateForecast(m.id, currentCrop.id);
    return {
      mandi: m,
      currentPrice: f.currentPrice,
      day7Price: f.forecastDay7Price,
      changePct: f.priceChangePct,
      action: f.advisory.action,
      isSelected: m.id === currentMandi.id,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-lg sm:text-xl text-stone-900">
              {currentLang === 'hi'
                ? `अन्य प्रमुख मंडियों में ${currentCrop.hindiName} भाव तुलना`
                : currentLang === 'mai'
                ? `आन मंडी मे ${currentCrop.maithiliName} के दर तुलना`
                : `APMC Mandi Comparison for ${currentCrop.name}`}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {currentLang === 'hi'
              ? 'देखें किस मंडी में जाने पर आपकी फसल का सबसे अधिक दाम मिलेगा:'
              : 'Compare prices across neighboring Bihar APMCs to choose the highest paying yard:'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {comparisons.map((item) => {
          const isHold = item.action === 'HOLD';
          const isSell = item.action === 'SELL';

          return (
            <div
              key={item.mandi.id}
              onClick={() => onSelectMandi(item.mandi.id)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                item.isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                  : 'border-stone-200 bg-stone-50/60 hover:border-emerald-400 hover:bg-emerald-50/20'
              }`}
            >
              {item.isSelected && (
                <span className="absolute -top-2.5 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                  {currentLang === 'hi' ? 'वर्तमान चयनित' : 'Selected'}
                </span>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-stone-900 text-sm sm:text-base">
                    {currentLang === 'hi' ? item.mandi.hindiName : item.mandi.name}
                  </h4>
                  <span className="text-xs text-stone-500">
                    {item.mandi.district} ({item.mandi.marketType})
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-stone-200/80">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                    आज का भाव
                  </span>
                  <span className="text-lg font-black text-stone-900">
                    ₹{item.currentPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                    7 दिन बाद
                  </span>
                  <div className="flex items-center space-x-1 justify-end">
                    <span className="text-lg font-black text-stone-900">
                      ₹{item.day7Price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs font-bold pt-2 border-t border-stone-200/60">
                <span
                  className={
                    item.changePct >= 0
                      ? 'text-emerald-700 flex items-center'
                      : 'text-rose-700 flex items-center'
                  }
                >
                  {item.changePct >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-1" />
                  )}
                  {item.changePct >= 0 ? '+' : ''}
                  {item.changePct}%
                </span>

                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                    isHold
                      ? 'bg-emerald-100 text-emerald-800'
                      : isSell
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isHold ? '🟢 रोकें' : isSell ? '🔴 बेचें' : '🟡 सामान्य'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
