import React, { useState, useEffect } from 'react';
import { PredictionResult, Language, ActionType } from '../types';
import { speechService } from '../services/speechService';
import {
  Volume2,
  VolumeX,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AdvisoryHeroCardProps {
  prediction: PredictionResult;
  currentLang: Language;
  autoSpeak: boolean;
}

export const AdvisoryHeroCard: React.FC<AdvisoryHeroCardProps> = ({
  prediction,
  currentLang,
  autoSpeak,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9); // 0.85-0.9 is gentle for rural clarity

  const { advisory, currentPrice, forecastDay7Price, priceChangeAbs, priceChangePct, crop, mandi } =
    prediction;

  // Spoken text according to current language
  const getAudioScript = () => {
    if (currentLang === 'hi') return advisory.audioSpeechHi;
    if (currentLang === 'mai') return advisory.audioSpeechMai;
    return advisory.audioSpeechEn;
  };

  const getActionTitle = () => {
    if (currentLang === 'hi') return advisory.actionTitleHi;
    if (currentLang === 'mai') return advisory.actionTitleMai;
    return advisory.actionTitleEn;
  };

  const getReasonText = () => {
    if (currentLang === 'hi') return advisory.reasonHi;
    if (currentLang === 'mai') return advisory.reasonMai;
    return advisory.reasonEn;
  };

  const handlePlayAudio = () => {
    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
      return;
    }

    const script = getAudioScript();
    speechService.speak(
      script,
      currentLang,
      speechRate,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  // Auto speak on crop or mandi change if autoSpeak is active
  useEffect(() => {
    if (autoSpeak) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 350);
      return () => {
        clearTimeout(timer);
        speechService.stopSpeaking();
      };
    }
  }, [prediction.crop.id, prediction.mandi.id, autoSpeak]);

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  // Visual Theme Configurations based on HOLD vs SELL vs STABLE
  const isHold = advisory.action === 'HOLD';
  const isSell = advisory.action === 'SELL';

  const cardGradient = isHold
    ? 'from-emerald-700 via-emerald-800 to-green-900 border-emerald-500/80 shadow-emerald-900/30'
    : isSell
    ? 'from-red-700 via-rose-800 to-red-950 border-rose-500/80 shadow-red-900/30'
    : 'from-amber-600 via-amber-700 to-yellow-900 border-amber-400/80 shadow-amber-900/30';

  const glowAccent = isHold
    ? 'bg-emerald-400/20 text-emerald-100 border-emerald-300/40'
    : isSell
    ? 'bg-rose-400/20 text-rose-100 border-rose-300/40'
    : 'bg-amber-400/20 text-amber-100 border-amber-300/40';

  return (
    <div
      className={`rounded-3xl p-5 sm:p-8 bg-gradient-to-br ${cardGradient} text-white shadow-2xl border-2 relative overflow-hidden transition-all duration-300`}
    >
      {/* Background Decorative Graphic Elements */}
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-80 h-32 bg-black/10 rounded-full blur-xl pointer-events-none" />

      {/* Top Banner: Crop & Mandi Name with Big Visual Icon */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/15">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="text-4xl sm:text-5xl p-2.5 rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
            {crop.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-white/20">
                {mandi.district}, {mandi.state}
              </span>
              <span className="text-xs text-white/70 font-medium">
                {mandi.marketType}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
              {currentLang === 'hi'
                ? crop.hindiName
                : currentLang === 'mai'
                ? crop.maithiliName
                : crop.name}{' '}
              <span className="text-white/80 font-normal text-xl sm:text-2xl">
                @ {currentLang === 'hi' ? mandi.hindiName : mandi.name}
              </span>
            </h3>
          </div>
        </div>

        {/* Audio Speaker Button (Always Prominent) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayAudio}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl font-black text-sm shadow-lg transition-transform active:scale-95 ${
              isPlaying
                ? 'bg-amber-300 text-stone-950 scale-105 animate-pulse'
                : 'bg-white text-stone-900 hover:bg-stone-100 hover:scale-102'
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-5 h-5 text-stone-950" />
                <span>{currentLang === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-emerald-800" />
                <span>
                  {currentLang === 'hi'
                    ? '🔊 आवाज़ में सुनें'
                    : currentLang === 'mai'
                    ? '🔊 आवाज़ मे सुनू'
                    : '🔊 Listen Advice'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Signal Display (No-Read Interface for Semi-Literate Farmers) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        {/* Visual Animated Symbol + Primary Decision */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex items-center space-x-3 mb-2">
            {isHold ? (
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/30 font-black text-3xl animate-bounce">
                ⬆️
              </div>
            ) : isSell ? (
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-300 text-rose-950 shadow-lg shadow-rose-500/30 font-black text-3xl animate-pulse">
                ⬇️
              </div>
            ) : (
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-300 text-amber-950 shadow-lg font-black text-3xl">
                ⚖️
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs uppercase font-extrabold tracking-widest text-white/80">
                {currentLang === 'hi'
                  ? '7-दिन AI निर्णय संकेत'
                  : currentLang === 'mai'
                  ? '7-दिन AI फैसला संकेत'
                  : '7-Day AI Action Signal'}
              </span>
              <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-white drop-shadow">
                {isHold
                  ? currentLang === 'hi'
                    ? '🟢 रोकें (HOLD)'
                    : currentLang === 'mai'
                    ? '🟢 रुकीं (HOLD)'
                    : '🟢 HOLD STOCK'
                  : isSell
                  ? currentLang === 'hi'
                    ? '🔴 बेचें (SELL)'
                    : currentLang === 'mai'
                    ? '🔴 बेची (SELL)'
                    : '🔴 SELL NOW'
                  : currentLang === 'hi'
                  ? '🟡 सामान्य (STABLE)'
                  : '🟡 STABLE / HOLD'}
              </span>
            </div>
          </div>

          <h4 className="text-xl sm:text-2xl font-bold text-amber-100 mt-2">
            {getActionTitle()}
          </h4>

          <p className="text-sm sm:text-base text-white/90 font-medium mt-2 leading-relaxed max-w-lg bg-black/15 p-3 rounded-xl border border-white/10">
            {getReasonText()}
          </p>

          <div className="mt-3 flex items-center space-x-2 text-xs text-white/80">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {currentLang === 'hi'
                ? `सर्वोत्तम बिक्री दिवस: ${advisory.optimalSaleDay} दिन बाद`
                : `Optimal window: in ${advisory.optimalSaleDay} days`}
            </span>
          </div>
        </div>

        {/* Big Contrast Numbers: Current Rate vs 7-Day Predicted Rate */}
        <div className="lg:col-span-7 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Today's Spot Price */}
            <div className="bg-black/20 p-4 rounded-xl border border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                {currentLang === 'hi'
                  ? 'आज का मंडी भाव (Spot Price)'
                  : 'Current Mandi Rate'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs sm:text-sm text-white/75 font-semibold">
                  / क्विंटल (Qtl)
                </span>
              </div>
              <div className="text-[11px] text-white/60 mt-1">
                न्यूनतम: ₹{prediction.minPrice} · अधिकतम: ₹{prediction.maxPrice}
              </div>
            </div>

            {/* 7-Day Forecast Price */}
            <div className="bg-black/20 p-4 rounded-xl border border-white/10 relative">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 block flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-300 inline" />
                <span>
                  {currentLang === 'hi'
                    ? '7 दिन बाद अनुमानित भाव'
                    : '7-Day ML Forecast'}
                </span>
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-300">
                  ₹{forecastDay7Price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs sm:text-sm text-white/75 font-semibold">
                  / क्विंटल
                </span>
              </div>
              {/* Expected Delta */}
              <div className="mt-1 flex items-center space-x-1.5 text-xs font-bold">
                {priceChangeAbs >= 0 ? (
                  <span className="text-emerald-300 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                    +₹{priceChangeAbs} (+{priceChangePct}%) संभावित बढ़त
                  </span>
                ) : (
                  <span className="text-rose-300 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
                    -₹{Math.abs(priceChangeAbs)} ({priceChangePct}%) गिरावट
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Additional Market Indicators */}
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-white/60 block text-[10px]">आज की आवक (Arrivals)</span>
              <span className="font-bold text-white text-sm">
                {prediction.todayArrivals.toLocaleString()} Qtl
              </span>
            </div>
            <div>
              <span className="text-white/60 block text-[10px]">AI मॉडल सटीकता (Confidence)</span>
              <span className="font-bold text-amber-300 text-sm">
                {prediction.modelConfidence}%
              </span>
            </div>
            <div>
              <span className="text-white/60 block text-[10px]">मॉडल प्रकार (ML Algorithm)</span>
              <span className="font-bold text-white text-sm">XGBoost</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Playback Script Teaser */}
      <div className="relative z-10 pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-white/80 gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-amber-200">
            {currentLang === 'hi' ? 'सलाहकार ऑडियो:' : 'Advisory Audio Script:'}
          </span>
          <span className="italic truncate max-w-xl text-white/90">
            "{getAudioScript()}"
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-white/70">
          <span>आवाज़ गति:</span>
          <button
            onClick={() => setSpeechRate(0.8)}
            className={`px-1.5 py-0.5 rounded ${
              speechRate === 0.8 ? 'bg-white text-stone-900 font-bold' : 'hover:text-white'
            }`}
          >
            धीमी (0.8x)
          </button>
          <button
            onClick={() => setSpeechRate(0.95)}
            className={`px-1.5 py-0.5 rounded ${
              speechRate === 0.95 ? 'bg-white text-stone-900 font-bold' : 'hover:text-white'
            }`}
          >
            सामान्य (1.0x)
          </button>
        </div>
      </div>
    </div>
  );
};
