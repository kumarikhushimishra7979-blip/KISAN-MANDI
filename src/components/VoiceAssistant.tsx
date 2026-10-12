import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Volume2, HelpCircle } from 'lucide-react';
import { Language } from '../types';
import { speechService, SpeechParseResult } from '../services/speechService';

interface VoiceAssistantProps {
  currentLang: Language;
  onSelectQuery: (cropId?: string, mandiId?: string, queryText?: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentLang,
  onSelectQuery,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);

  const sampleQueries = [
    {
      text: 'आज गुलाबबाग में मक्का का भाव क्या है?',
      cropId: 'maize',
      mandiId: 'gulabbagh',
      labelHi: '🌽 मक्का - गुलाबबाग भाव',
    },
    {
      text: 'धान अभी बेचना चाहिए या रोकें?',
      cropId: 'paddy',
      mandiId: 'gulabbagh',
      labelHi: '🌾 धान - बेचें या रोकें?',
    },
    {
      text: 'पटना मंडी में गेहूं का क्या रेट है?',
      cropId: 'wheat',
      mandiId: 'patna',
      labelHi: '🌾 गेहूं - पटना रेट',
    },
    {
      text: 'पूर्णिया में सरसों का भाव क्या रहेगा?',
      cropId: 'mustard',
      mandiId: 'purnea',
      labelHi: '🌼 सरसों - पूर्णिया पूर्वानुमान',
    },
  ];

  const handleToggleMic = () => {
    if (isListening) {
      if (stopFn) stopFn();
      setIsListening(false);
      setStatusMessage('');
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      setStatusMessage(
        currentLang === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया नीचे दिए गए उदाहरण बटनों पर क्लिक करें।'
          : 'Voice recognition not supported in this browser. Use sample query buttons below.'
      );
      return;
    }

    setStatusMessage(
      currentLang === 'hi'
        ? 'सुन रहा हूँ... अपनी फसल या मंडी का नाम बोलें (जैसे: मक्का गुलाबबाग)'
        : 'Listening... speak crop or mandi name (e.g., Maize Gulabbagh)'
    );

    const stop = speechService.startListening(
      currentLang,
      (result: SpeechParseResult) => {
        setTranscript(result.transcript);
        setIsListening(false);
        setStatusMessage(
          currentLang === 'hi'
            ? `पहचाना: "${result.transcript}"`
            : `Recognized: "${result.transcript}"`
        );
        onSelectQuery(result.matchedCropId, result.matchedMandiId, result.transcript);
      },
      (errorMsg: string) => {
        setIsListening(false);
        setStatusMessage(errorMsg);
      },
      () => setIsListening(true),
      () => setIsListening(false)
    );

    setStopFn(() => stop);
  };

  const handleQuickClick = (q: typeof sampleQueries[0]) => {
    setTranscript(q.text);
    setStatusMessage(
      currentLang === 'hi'
        ? `आवाज़ प्रश्न चुना गया: "${q.text}"`
        : `Selected query: "${q.text}"`
    );
    onSelectQuery(q.cropId, q.mandiId, q.text);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg border border-emerald-700/50 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Explanatory Voice Header */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {currentLang === 'hi'
                ? 'आवाज़ सहायक (बोलकर पूछें)'
                : currentLang === 'mai'
                ? 'आवाज़ सहायक (बाज कय पूछू)'
                : 'Voice Assistant (Speech-to-Text)'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-100">
            {currentLang === 'hi'
              ? 'माइक दबाकर अपनी भाषा में पूछें'
              : currentLang === 'mai'
              ? 'माइक दबाउ आ अपन भाषा मे पूछू'
              : 'Tap Microphone & Speak in Any Language'}
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
            {currentLang === 'hi'
              ? 'जैसे: "आज गुलाबबाग में मक्का का भाव क्या है?" या "धान बेचें या रोकें?"'
              : currentLang === 'mai'
              ? 'जेना: "गुलाबबाग मे मकई के दर की छै?" वा "धान बेची की राखी?"'
              : 'Try asking: "What is maize price in Gulabbagh?" or "Should I hold or sell paddy?"'}
          </p>
        </div>

        {/* Center: Large Touch-Friendly Microphone Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleToggleMic}
            aria-label="Toggle Microphone"
            className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-300 ${
              isListening
                ? 'bg-rose-600 text-white scale-110 shadow-rose-600/60 animate-pulse'
                : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-emerald-950 hover:scale-105 shadow-amber-400/40 hover:from-amber-400 hover:to-amber-300'
            }`}
          >
            {isListening ? (
              <div className="relative">
                <span className="absolute -inset-4 rounded-full bg-rose-500/30 animate-ping" />
                <MicOff className="w-9 h-9 sm:w-11 sm:h-11 relative z-10" />
              </div>
            ) : (
              <Mic className="w-9 h-9 sm:w-11 sm:h-11" />
            )}
          </button>
          <span className="text-xs font-bold mt-2 text-amber-300">
            {isListening
              ? currentLang === 'hi'
                ? '🔴 सुन रहे हैं...'
                : '🔴 Listening...'
              : currentLang === 'hi'
              ? 'माइक दबाएं'
              : 'Tap to Speak'}
          </span>
        </div>
      </div>

      {/* Spoken Status & Transcribed Output */}
      {statusMessage && (
        <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-600/50 text-xs text-amber-200 flex items-center space-x-2">
          <Volume2 className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="truncate">{statusMessage}</span>
        </div>
      )}

      {/* Quick Spoken Chips for 1-Tap Simulation */}
      <div className="mt-4 pt-3 border-t border-emerald-800/60">
        <div className="text-[11px] font-semibold text-emerald-300/80 mb-2 flex items-center space-x-1">
          <HelpCircle className="w-3 h-3" />
          <span>
            {currentLang === 'hi'
              ? 'बिना बोले तुरंत जांचने के लिए क्लिक करें:'
              : 'Or tap a 1-click voice query sample:'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickClick(q)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-stone-200 hover:text-amber-200 border border-emerald-700/60 transition-colors flex items-center space-x-1.5"
            >
              <span>{q.labelHi}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
