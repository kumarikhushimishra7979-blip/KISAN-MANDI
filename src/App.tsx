import React, { useState, useEffect, useCallback } from 'react';
import { Language, Crop, Mandi, PredictionResult } from './types';
import { CROPS, MANDIS, calculateForecast } from './data/mandiData';
import {
  fetchDynamicMandiData,
  buildPredictionWithDynamicData,
  DynamicMandiResponse,
} from './services/mandiDataService';
import { Navbar } from './components/Navbar';
import { VoiceAssistant } from './components/VoiceAssistant';
import { AdvisoryHeroCard } from './components/AdvisoryHeroCard';
import { ForecastChart } from './components/ForecastChart';
import { ProfitCalculator } from './components/ProfitCalculator';
import { MandiComparison } from './components/MandiComparison';
import { QualityMoistureGuide } from './components/QualityMoistureGuide';
import { CodeExplorerModal } from './components/CodeExplorerModal';
import {
  Wheat,
  MapPin,
  TrendingUp,
  FileCheck2,
  HelpCircle,
  Award,
  Layers,
  Sparkles,
  RefreshCw,
  Radio,
  Database,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('hi');
  const [selectedCropId, setSelectedCropId] = useState<string>('maize');
  const [selectedMandiId, setSelectedMandiId] = useState<string>('gulabbagh');
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false);
  const [isCodeExplorerOpen, setIsCodeExplorerOpen] = useState<boolean>(false);

  // Dynamic live data state
  const [prediction, setPrediction] = useState<PredictionResult>(() =>
    calculateForecast(selectedMandiId, selectedCropId)
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');

  // Dynamic fetch handler
  const loadDynamicData = useCallback(
    async (cropId: string, mandiId: string, force: boolean = false) => {
      setIsRefreshing(true);
      try {
        const dynData = await fetchDynamicMandiData(cropId, mandiId, force);
        const pred = buildPredictionWithDynamicData(mandiId, cropId, dynData);
        setPrediction(pred);
        setLastRefreshedTime(dynData.lastRefreshed);
      } catch (err) {
        // Fallback gracefully without crashing
        const fallbackPred = calculateForecast(mandiId, cropId);
        setPrediction(fallbackPred);
      } finally {
        setIsRefreshing(false);
      }
    },
    []
  );

  // Fetch when crop or mandi changes
  useEffect(() => {
    loadDynamicData(selectedCropId, selectedMandiId, false);
  }, [selectedCropId, selectedMandiId, loadDynamicData]);

  // Voice Query Callback
  const handleVoiceQuery = (cropId?: string, mandiId?: string) => {
    if (cropId) setSelectedCropId(cropId);
    if (mandiId) setSelectedMandiId(mandiId);
  };

  const handleManualRefresh = () => {
    loadDynamicData(selectedCropId, selectedMandiId, true);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans pb-16 selection:bg-amber-400 selection:text-stone-900">
      {/* Sticky Header */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
        onOpenCodeExplorer={() => setIsCodeExplorerOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 space-y-6">
        {/* 1. Voice-First Assistant Bar */}
        <section aria-label="Voice Query Assistant">
          <VoiceAssistant
            currentLang={currentLang}
            onSelectQuery={handleVoiceQuery}
          />
        </section>

        {/* Real-time Dynamic Data Status & Refresh Control Bar */}
        <section
          aria-label="Real-time Data Status"
          className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center space-x-3 flex-wrap gap-y-1.5">
            <div className="flex items-center space-x-1.5">
              {prediction.isLiveData ? (
                <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>
                    {currentLang === 'hi'
                      ? 'लाइव APMC डेटा फीड (data.gov.in)'
                      : 'Live APMC Data Feed (data.gov.in)'}
                  </span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
                  <Database className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {currentLang === 'hi'
                      ? 'ऑफ़लाइन रेजिलिएंट मोड: Agmarknet ऐतिहासिक रिकॉर्ड'
                      : 'Offline Resilient Mode: Agmarknet Historical'}
                  </span>
                </span>
              )}
            </div>

            <div className="text-stone-500 font-medium hidden sm:inline">
              <span>आवक तारीख: <strong>{prediction.arrivalDate || 'आज'}</strong></span>
              <span className="mx-2">·</span>
              <span>अंतिम अपडेट: <strong>{lastRefreshedTime}</strong></span>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isRefreshing
                ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-stone-400' : 'text-emerald-700'}`} />
            <span>
              {isRefreshing
                ? currentLang === 'hi'
                  ? 'रिफ्रेश हो रहा है...'
                  : 'Fetching Live Data...'
                : currentLang === 'hi'
                ? '🔄 लाइव भाव रिफ्रेश करें'
                : '🔄 Refresh Live Rates'}
            </span>
          </button>
        </section>

        {/* 2. Interactive Crop & Mandi Selectors */}
        <section
          aria-label="Crop and Mandi Selector"
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200"
        >
          {/* Crop Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
                <Wheat className="w-4 h-4 text-emerald-700" />
                <span>
                  {currentLang === 'hi'
                    ? '1. अपनी फसल चुनें (Select Crop):'
                    : currentLang === 'mai'
                    ? '1. अपन फसल चुनू:'
                    : '1. Select Your Crop:'}
                </span>
              </label>
              <span className="text-[11px] text-stone-500 font-medium">
                कुल 8 प्रमुख फसलें उपलब्ध
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {CROPS.map((crop) => {
                const isSelected = crop.id === selectedCropId;
                return (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCropId(crop.id)}
                    className={`p-2.5 rounded-xl text-left border-2 transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-black shadow-sm ring-2 ring-emerald-600/20'
                        : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300 text-stone-700 font-semibold'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{crop.icon}</span>
                    <span className="text-xs font-black leading-tight truncate w-full">
                      {currentLang === 'hi'
                        ? crop.hindiName.split(' ')[0]
                        : currentLang === 'mai'
                        ? crop.maithiliName
                        : crop.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-stone-500 uppercase tracking-tight">
                      {crop.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandi Selector Tabs */}
          <div className="mt-5 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>
                  {currentLang === 'hi'
                    ? '2. अपनी APMC मंडी चुनें (Select Mandi):'
                    : currentLang === 'mai'
                    ? '2. मंडी चुनू:'
                    : '2. Select APMC Mandi Market:'}
                </span>
              </label>
              <span className="text-[11px] text-stone-500 font-medium">
                गुलाबबाग पूर्णिया प्रमुख एशिया मक्का केंद्र
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MANDIS.map((mandi) => {
                const isSelected = mandi.id === selectedMandiId;
                return (
                  <button
                    key={mandi.id}
                    onClick={() => setSelectedMandiId(mandi.id)}
                    className={`px-3 py-2 rounded-xl text-left border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-black shadow-sm ring-2 ring-emerald-600/20'
                        : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300 text-stone-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs font-black truncate">
                      {currentLang === 'hi' ? mandi.hindiName.split(' ')[0] : mandi.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-stone-500 truncate">
                      {mandi.district} ({mandi.marketType.split(' ')[0]})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Hero Advisory Card (No-Read Interface + Large Audio Playback) */}
        <section aria-label="Visual Advisory Card">
          <AdvisoryHeroCard
            prediction={prediction}
            currentLang={currentLang}
            autoSpeak={autoSpeak}
          />
        </section>

        {/* 4. 7-Day ML Price Forecast Trajectory Chart */}
        <section aria-label="7-Day Price Forecast Trajectory">
          <ForecastChart
            forecasts={prediction.forecastSeries}
            currentPrice={prediction.currentPrice}
            currentLang={currentLang}
          />
        </section>

        {/* 5. Two Columns: Farmer Profit Calculator & Quality/Moisture Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ProfitCalculator
              prediction={prediction}
              currentLang={currentLang}
            />
          </div>
          <div className="lg:col-span-5">
            <QualityMoistureGuide
              prediction={prediction}
              currentLang={currentLang}
            />
          </div>
        </div>

        {/* 6. APMC Mandi Comparison Matrix */}
        <section aria-label="Mandi Price Comparison">
          <MandiComparison
            currentMandi={prediction.mandi}
            currentCrop={prediction.crop}
            currentLang={currentLang}
            onSelectMandi={(mId) => setSelectedMandiId(mId)}
          />
        </section>

        {/* 7. Academic / Minor Project Evaluation Info Banner */}
        <section
          aria-label="Minor Project Evaluation Information"
          className="bg-amber-100/60 border border-amber-300 rounded-2xl p-5 text-stone-800 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-900 border border-amber-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-stone-900 text-base sm:text-lg">
                  Minor Project: Kisan Mandi Bhav Predictor & Voice Advisory Assistant
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 mt-0.5">
                  Designed for rural agricultural economy with <strong>FastAPI Backend</strong>, <strong>Streamlit Frontend</strong>, and <strong>Web Speech / XGBoost Time-Series Pipeline</strong>.
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs font-semibold text-stone-800">
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                    Model: XGBoost Regressor (Lag-1, Lag-7, MA-7)
                  </span>
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                    Dataset: Agmarknet APMC Historical Records
                  </span>
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                    Target Mandi: Gulabbagh (Purnea, Bihar)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCodeExplorerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 flex items-center space-x-2"
            >
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              <span>प्रोजेक्ट कोड & फाइल्स देखें (View Code)</span>
            </button>
          </div>
        </section>
      </main>

      {/* Code Explorer Modal */}
      <CodeExplorerModal
        isOpen={isCodeExplorerOpen}
        onClose={() => setIsCodeExplorerOpen(false)}
      />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-stone-200 text-stone-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span>🌾 किसान मंडी भाव और आवाज़ सलाहकार · Kisan Mandi Bhav Predictor</span>
          <span className="mx-2">·</span>
          <span>APMC Gulabbagh, Purnea, Bihar</span>
        </div>
        <div>
          <span>Agmarknet Data Modeling & Time-Series Advisory System</span>
        </div>
      </footer>
    </div>
  );
}
