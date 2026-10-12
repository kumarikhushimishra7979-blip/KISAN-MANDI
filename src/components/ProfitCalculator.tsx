import React, { useState } from 'react';
import { PredictionResult, Language } from '../types';
import { Calculator, Coins, TrendingUp, TrendingDown, Warehouse, Truck } from 'lucide-react';

interface ProfitCalculatorProps {
  prediction: PredictionResult;
  currentLang: Language;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  prediction,
  currentLang,
}) => {
  const [unitMode, setUnitMode] = useState<'quintal' | 'bag' | 'trolley'>('quintal');
  const [quantity, setQuantity] = useState<number>(50); // 50 Quintals default
  const [includeStorageCost, setIncludeStorageCost] = useState<boolean>(true);

  const { currentPrice, forecastDay7Price, crop } = prediction;

  // Convert to quintals
  let totalQuintals = quantity;
  if (unitMode === 'bag') {
    totalQuintals = (quantity * crop.bagSizeKg) / 100;
  } else if (unitMode === 'trolley') {
    totalQuintals = quantity * 40; // 1 trolley ~ 40 quintals
  }

  // Today's total value
  const todayTotal = Math.round(totalQuintals * currentPrice);

  // Day 7 total gross
  const day7Gross = Math.round(totalQuintals * forecastDay7Price);

  // Storage cost estimate (₹12 per quintal for 7 days storage/tarpaulin protection)
  const storageCost = includeStorageCost ? Math.round(totalQuintals * 14) : 0;

  // Net day 7 total
  const day7Net = day7Gross - storageCost;

  // Net difference
  const netDifference = day7Net - todayTotal;
  const isGain = netDifference >= 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-stone-200">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-amber-600" />
          <h3 className="font-black text-lg sm:text-xl text-stone-900">
            {currentLang === 'hi'
              ? 'किसान फसल मुनाफा कैलकुलेटर (Farmer Net Gain)'
              : currentLang === 'mai'
              ? 'किसान मुनाफा कैलकुलेटर'
              : 'Farmer Lot Profit & Loss Calculator'}
          </h3>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-stone-600 mt-2">
        {currentLang === 'hi'
          ? 'अपनी उपज की मात्रा दर्ज करें और देखें कि आज बेचने और 7 दिन रुकने में कितने रुपयों का अंतर आएगा:'
          : 'Enter your harvest load to see the exact net rupee difference between selling today vs holding 7 days:'}
      </p>

      {/* Input Form */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Quantity and Unit Mode */}
        <div className="md:col-span-7 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {currentLang === 'hi' ? 'फसल की मात्रा (मात्रा लिखें)' : 'Produce Quantity'}
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-300 focus:border-emerald-600 focus:outline-none font-black text-lg text-stone-900 bg-stone-50"
            />
          </div>

          <div className="sm:w-48">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {currentLang === 'hi' ? 'इकाई (Unit)' : 'Unit Type'}
            </label>
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setUnitMode('quintal')}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-colors ${
                  unitMode === 'quintal'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                क्विंटल
              </button>
              <button
                type="button"
                onClick={() => setUnitMode('bag')}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-colors ${
                  unitMode === 'bag'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                बोरी
              </button>
              <button
                type="button"
                onClick={() => setUnitMode('trolley')}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-colors ${
                  unitMode === 'trolley'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                ट्रॉली
              </button>
            </div>
          </div>
        </div>

        {/* Storage deduction toggle */}
        <div className="md:col-span-5 flex items-center bg-stone-50 p-3 rounded-xl border border-stone-200">
          <input
            type="checkbox"
            id="storageCost"
            checked={includeStorageCost}
            onChange={(e) => setIncludeStorageCost(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
          />
          <label htmlFor="storageCost" className="ml-2.5 text-xs text-stone-700 cursor-pointer">
            <span className="font-bold text-stone-900 block">
              7-दिन गोदाम/तिरपाल खर्च शामिल करें (₹14/Qtl)
            </span>
            <span className="text-[11px] text-stone-500">
              भंडारण खर्च: ₹{storageCost.toLocaleString('en-IN')}
            </span>
          </label>
        </div>
      </div>

      {/* Output Comparison Cards */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Payout */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
          <span className="text-xs font-bold text-stone-500 block uppercase">
            {currentLang === 'hi' ? 'आज बेचने पर भुगतान' : 'Payout If Sold Today'}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-stone-800 mt-1 block">
            ₹{todayTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {totalQuintals} क्विंटल @ ₹{currentPrice}/Qtl
          </span>
        </div>

        {/* Day-7 Payout */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
          <span className="text-xs font-bold text-stone-500 block uppercase">
            {currentLang === 'hi' ? '7 दिन रुकने पर भुगतान' : 'Payout If Sold in 7 Days'}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 block">
            ₹{day7Net.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            @ ₹{forecastDay7Price}/Qtl {includeStorageCost ? `(खर्च काटकर)` : ''}
          </span>
        </div>

        {/* Difference (Profit or Loss) */}
        <div
          className={`p-4 rounded-xl border-2 ${
            isGain
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
              : 'bg-rose-50 border-rose-400 text-rose-950'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase">
            {isGain ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-800">
                  {currentLang === 'hi' ? 'अतिरिक्त शुद्ध मुनाफा' : 'Extra Net Profit'}
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-rose-700" />
                <span className="text-rose-800">
                  {currentLang === 'hi' ? 'संभावित घाटा (नुकसान)' : 'Potential Loss'}
                </span>
              </>
            )}
          </div>
          <span className="text-2xl sm:text-3xl font-black mt-1 block">
            {isGain ? '+' : '-'}₹{Math.abs(netDifference).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] font-semibold mt-0.5 block opacity-85">
            {isGain
              ? currentLang === 'hi'
                ? 'सिफारिश: फसल 7 दिन रोककर रखें'
                : 'Recommendation: HOLD STOCK'
              : currentLang === 'hi'
              ? 'सिफारिश: तुरंत आज ही बेचें'
              : 'Recommendation: SELL IMMEDIATELY'}
          </span>
        </div>
      </div>
    </div>
  );
};
