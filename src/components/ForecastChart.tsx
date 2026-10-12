import React, { useState } from 'react';
import { DailyForecast, Language } from '../types';
import { TrendingUp, Calendar, Info, ShieldCheck } from 'lucide-react';

interface ForecastChartProps {
  forecasts: DailyForecast[];
  currentPrice: number;
  currentLang: Language;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecasts,
  currentPrice,
  currentLang,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(6); // Default to day 7

  // Calculate SVG dimensions
  const allPrices = [
    currentPrice,
    ...forecasts.map((f) => f.predictedPrice),
    ...forecasts.map((f) => f.lowerBound),
    ...forecasts.map((f) => f.upperBound),
  ];
  const minVal = Math.floor(Math.min(...allPrices) * 0.98);
  const maxVal = Math.ceil(Math.max(...allPrices) * 1.02);
  const priceRange = maxVal - minVal || 100;

  const width = 800;
  const height = 280;
  const paddingX = 60;
  const paddingY = 40;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Points mapping
  const points = forecasts.map((f, i) => {
    const x = paddingX + (i / (forecasts.length - 1)) * chartW;
    const y = paddingY + chartH - ((f.predictedPrice - minVal) / priceRange) * chartH;
    const yLow = paddingY + chartH - ((f.lowerBound - minVal) / priceRange) * chartH;
    const yHigh = paddingY + chartH - ((f.upperBound - minVal) / priceRange) * chartH;
    return { x, y, yLow, yHigh, data: f, index: i };
  });

  // Confidence area polygon path
  const upperPath = points.map((p) => `${p.x},${p.yHigh}`).join(' ');
  const lowerPath = [...points].reverse().map((p) => `${p.x},${p.yLow}`).join(' ');
  const areaPoints = `${upperPath} ${lowerPath}`;

  // Line path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const activePoint = activeDayIndex !== null ? points[activeDayIndex] : points[points.length - 1];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-lg sm:text-xl text-stone-900">
              {currentLang === 'hi'
                ? '7-दिवसीय दैनिक मूल्य अनुमान (XGBoost Trajectory)'
                : currentLang === 'mai'
                ? '7-दिनक दर अनुमान चार्ट'
                : '7-Day Daily Price Forecast Trajectory'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {currentLang === 'hi'
              ? 'विश्वास सीमा (Confidence Band ±2%) सहित दैनिक उतार-चढ़ाव'
              : 'Daily projected prices with ±2% confidence interval range'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold text-stone-700">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span>{currentLang === 'hi' ? 'अनुमानित भाव (₹)' : 'Forecast Price'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-2.5 rounded bg-emerald-100 border border-emerald-300" />
            <span>{currentLang === 'hi' ? 'विश्वास दायरा' : 'Confidence Band'}</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="mt-4 relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + chartH * (1 - pct);
            const val = Math.round(minVal + priceRange * pct);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-stone-500 font-medium"
                >
                  ₹{val}
                </text>
              </g>
            );
          })}

          {/* Current Spot Price Reference Line */}
          {(() => {
            const ySpot = paddingY + chartH - ((currentPrice - minVal) / priceRange) * chartH;
            return (
              <g>
                <line
                  x1={paddingX}
                  y1={ySpot}
                  x2={width - paddingX}
                  y2={ySpot}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <text
                  x={width - paddingX + 8}
                  y={ySpot + 3}
                  className="text-[10px] fill-stone-600 font-bold"
                >
                  आज ₹{currentPrice}
                </text>
              </g>
            );
          })()}

          {/* Shaded Confidence Polygon */}
          <polygon points={areaPoints} fill="url(#bandGradient)" />

          {/* Main Forecast Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            const isSelected = activeDayIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer group"
                onClick={() => setActiveDayIndex(idx)}
              >
                {/* Vertical hover line */}
                {isSelected && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
                {/* Outer halo */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 9 : 6}
                  className={
                    isSelected
                      ? 'fill-emerald-600 stroke-4 stroke-emerald-100 transition-all'
                      : 'fill-emerald-700 hover:fill-emerald-600 transition-all'
                  }
                />
                {/* Point label on x-axis */}
                <text
                  x={p.x}
                  y={height - paddingY + 20}
                  textAnchor="middle"
                  className={`text-[11px] font-bold ${
                    isSelected ? 'fill-emerald-900 font-black' : 'fill-stone-600'
                  }`}
                >
                  {currentLang === 'hi' ? p.data.dayNameHi : p.data.dayName}
                </text>
                <text
                  x={p.x}
                  y={height - paddingY + 34}
                  textAnchor="middle"
                  className="text-[10px] fill-stone-500 font-medium"
                >
                  {p.data.dateStr}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Day Inspector Card */}
      {activePoint && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
              +{activePoint.index + 1}D
            </div>
            <div>
              <span className="text-xs font-semibold text-stone-600">
                {currentLang === 'hi' ? activePoint.data.dayNameHi : activePoint.data.dayName} (
                {activePoint.data.dateStr}) का अनुमान:
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-950">
                  ₹{activePoint.data.predictedPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-600">/ क्विंटल</span>
                <span
                  className={`text-xs font-extrabold ${
                    activePoint.data.predictedPrice >= currentPrice
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {activePoint.data.predictedPrice >= currentPrice ? '+' : ''}
                  {activePoint.data.predictedPrice - currentPrice} ₹
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200/80">
              <span className="text-stone-500 block text-[10px]">अनुमानित दायरा (Range)</span>
              <span className="font-bold text-stone-900">
                ₹{activePoint.data.lowerBound} - ₹{activePoint.data.upperBound}
              </span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200/80">
              <span className="text-stone-500 block text-[10px]">अनुमानित मंडी आवक (Supply)</span>
              <span className="font-bold text-stone-900">
                {activePoint.data.arrivalsEstimated.toLocaleString()} Qtl
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
