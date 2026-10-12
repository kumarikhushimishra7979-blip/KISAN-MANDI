import React from 'react';
import { Language } from '../types';
import { Volume2, VolumeX, FileCode2, Globe2, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onOpenCodeExplorer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  autoSpeak,
  onToggleAutoSpeak,
  onOpenCodeExplorer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-stone-100 border-b border-emerald-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-2xl shadow-inner shadow-amber-200">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg sm:text-2xl text-amber-200 tracking-tight leading-none">
                  {currentLang === 'hi'
                    ? 'किसान मंडी भाव एवं आवाज़ सलाहकार'
                    : currentLang === 'mai'
                    ? 'किसान मंडी भाव आ आवाज़ सलाहकार'
                    : 'Kisan Mandi Bhav & Voice Advisory'}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/80 font-medium mt-0.5">
                {currentLang === 'hi'
                  ? 'गुलाबबाग एवं बिहार मंडियों हेतु 7-दिवसीय AI/ML मूल्य पूर्वानुमान'
                  : currentLang === 'mai'
                  ? 'गुलाबबाग आ बिहार मंडी लेल 7-दिनक दर अनुमान'
                  : '7-Day ML Price Forecasting & Voice Advisory for Indian Mandis'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Language Selector */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Auto Read Audio Toggle */}
            <button
              onClick={onToggleAutoSpeak}
              title={autoSpeak ? 'ऑटो आवाज़ चालू है' : 'ऑटो आवाज़ बंद है'}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                autoSpeak
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                  : 'bg-emerald-950/60 text-emerald-300/70 border-emerald-700/50 hover:bg-emerald-800/40'
              }`}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">
                {autoSpeak
                  ? currentLang === 'hi'
                    ? 'आवाज़ चालू'
                    : 'Voice On'
                  : currentLang === 'hi'
                  ? 'आवाज़ बंद'
                  : 'Voice Off'}
              </span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-emerald-950/80 p-1 rounded-lg border border-emerald-700/60">
              <Globe2 className="w-4 h-4 text-emerald-400 ml-1.5 mr-1 hidden sm:inline" />
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  currentLang === 'hi'
                    ? 'bg-amber-400 text-emerald-950 shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('mai')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  currentLang === 'mai'
                    ? 'bg-amber-400 text-emerald-950 shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                मैथिली
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  currentLang === 'en'
                    ? 'bg-amber-400 text-emerald-950 shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                ENG
              </button>
            </div>

            {/* Minor Project Code / Documentation Explorer */}
            <button
              onClick={onOpenCodeExplorer}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-xs sm:text-sm font-semibold border border-emerald-600 shadow-sm transition-all"
            >
              <FileCode2 className="w-4 h-4 text-amber-300" />
              <span className="hidden lg:inline">
                {currentLang === 'hi' ? 'प्रोजेक्ट कोड & डॉक्स' : 'Project Code & Docs'}
              </span>
              <span className="lg:hidden">Docs</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
