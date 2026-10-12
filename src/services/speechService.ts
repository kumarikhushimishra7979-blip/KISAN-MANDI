import { Language } from '../types';

export interface SpeechParseResult {
  transcript: string;
  matchedCropId?: string;
  matchedMandiId?: string;
  confidence: number;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        if (this.synth) {
          this.voices = this.synth.getVoices();
        }
      };
    }
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Sanitizes speech text to remove confusing raw data artifacts:
   * Replaces ₹ with words, expands percentage symbols, removes bracketed transliterations.
   */
  public cleanTextForSpeech(text: string, lang: Language): string {
    let cleaned = text;

    // Remove text inside brackets like (Corn), (Wheat), (Qtl)
    cleaned = cleaned.replace(/\([^)]*\)/g, ' ');

    if (lang === 'en') {
      cleaned = cleaned.replace(/₹\s*(\d+)/g, '$1 rupees');
      cleaned = cleaned.replace(/₹/g, ' rupees ');
      cleaned = cleaned.replace(/%/g, ' percent ');
      cleaned = cleaned.replace(/\/Qtl/gi, ' per quintal ');
      cleaned = cleaned.replace(/\/क्विंटल/gi, ' per quintal ');
      cleaned = cleaned.replace(/\+/g, ' plus ');
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
    } else {
      // Hindi or Maithili
      cleaned = cleaned.replace(/₹\s*(\d+)/g, '$1 रुपये');
      cleaned = cleaned.replace(/₹/g, ' रुपये ');
      cleaned = cleaned.replace(/%/g, ' प्रतिशत ');
      cleaned = cleaned.replace(/\/Qtl/gi, ' प्रति क्विंटल ');
      cleaned = cleaned.replace(/\/क्विंटल/gi, ' प्रति क्विंटल ');
      cleaned = cleaned.replace(/\+/g, ' ');
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
    }

    return cleaned;
  }

  /**
   * Dynamically selects the best available system voice corresponding to the chosen language.
   */
  private getBestVoiceForLanguage(lang: Language): SpeechSynthesisVoice | null {
    if (!this.synth || this.voices.length === 0) {
      if (this.synth) this.voices = this.synth.getVoices();
    }

    if (this.voices.length === 0) return null;

    if (lang === 'hi' || lang === 'mai') {
      // Priority 1: Exact Hindi India voice
      const hindiExact = this.voices.find(
        (v) => v.lang.toLowerCase() === 'hi-in' || v.lang.toLowerCase() === 'hi_in'
      );
      if (hindiExact) return hindiExact;

      // Priority 2: Any voice starting with 'hi' or with 'hindi' in its name
      const hindiGeneral = this.voices.find(
        (v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiGeneral) return hindiGeneral;

      // Priority 3: Any Indian locale voice
      const indianLocale = this.voices.find((v) => v.lang.toLowerCase().includes('in'));
      if (indianLocale) return indianLocale;
    } else {
      // English mode
      // Priority 1: Indian English voice for familiar natural accent
      const enIndia = this.voices.find(
        (v) => (v.lang.toLowerCase() === 'en-in' || v.name.toLowerCase().includes('india')) &&
               !v.name.toLowerCase().includes('hindi')
      );
      if (enIndia) return enIndia;

      // Priority 2: General US/UK English voice
      const enStandard = this.voices.find(
        (v) => v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en-gb' || v.lang.toLowerCase().startsWith('en')
      );
      if (enStandard) return enStandard;
    }

    return this.voices[0] || null;
  }

  /**
   * Speaks the provided text using the dynamically selected language state.
   */
  public speak(
    text: string,
    lang: Language,
    rate: number = 0.88,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) {
      if (onError) onError('Speech synthesis not supported in this browser.');
      return;
    }

    // Always stop any prior ongoing speech immediately to prevent overlap
    this.stopSpeaking();

    const sanitizedText = this.cleanTextForSpeech(text, lang);
    const utterance = new SpeechSynthesisUtterance(sanitizedText);
    this.currentUtterance = utterance;

    // Synchronize language tag exactly with user's selection
    let targetLangCode = 'hi-IN';
    if (lang === 'en') {
      targetLangCode = 'en-US';
    } else if (lang === 'mai') {
      targetLangCode = 'hi-IN'; // Maithili Devanagari phonetics
    }

    utterance.lang = targetLangCode;
    utterance.rate = lang === 'en' ? Math.max(0.9, rate) : rate; // 0.85-0.9 is gentle and clear
    utterance.pitch = 1.0;

    // Pick matching voice dynamically
    const selectedVoice = this.getBestVoiceForLanguage(lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      // Ignore interruption errors when user intentionally switched language or hit stop
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        if (onError) onError(e);
      }
      this.currentUtterance = null;
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      if (onError) onError(err);
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public startListening(
    lang: Language,
    onResult: (result: SpeechParseResult) => void,
    onError: (errorMsg: string) => void,
    onStart?: () => void,
    onEnd?: () => void
  ): () => void {
    if (!this.isSpeechRecognitionSupported()) {
      onError('Browser does not support Web Speech API. Please use Google Chrome or Edge.');
      return () => {};
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = lang === 'en' ? 'en-IN' : 'hi-IN';

      this.recognition.onstart = () => {
        if (onStart) onStart();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence || 0.9;
        const parsed = this.parseQuery(transcript);
        onResult({
          transcript,
          matchedCropId: parsed.cropId,
          matchedMandiId: parsed.mandiId,
          confidence,
        });
      };

      this.recognition.onerror = (event: any) => {
        let msg = 'Voice recognition error';
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission denied. Please allow microphone access.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Please speak louder into the microphone.';
        }
        onError(msg);
      };

      this.recognition.onend = () => {
        if (onEnd) onEnd();
      };

      this.recognition.start();

      return () => {
        if (this.recognition) {
          try {
            this.recognition.stop();
          } catch (e) {
            // ignore
          }
        }
      };
    } catch (e: any) {
      onError('Unable to initiate microphone recognition.');
      return () => {};
    }
  }

  public parseQuery(text: string): { cropId?: string; mandiId?: string } {
    const lower = text.toLowerCase();
    let cropId: string | undefined;
    let mandiId: string | undefined;

    // Crop detection keywords
    if (lower.includes('मक्का') || lower.includes('makka') || lower.includes('corn') || lower.includes('भुट्टा') || lower.includes('मकई')) {
      cropId = 'maize';
    } else if (lower.includes('धान') || lower.includes('dhan') || lower.includes('paddy') || lower.includes('चावल') || lower.includes('rice')) {
      cropId = 'paddy';
    } else if (lower.includes('गेहूं') || lower.includes('gehu') || lower.includes('wheat') || lower.includes('गहुम') || lower.includes('कनक')) {
      cropId = 'wheat';
    } else if (lower.includes('सरसों') || lower.includes('sarson') || lower.includes('mustard') || lower.includes('तोरी') || lower.includes('राई')) {
      cropId = 'mustard';
    } else if (lower.includes('आलू') || lower.includes('aalu') || lower.includes('potato') || lower.includes('batata')) {
      cropId = 'potato';
    } else if (lower.includes('प्याज') || lower.includes('pyaj') || lower.includes('onion') || lower.includes('पियाज') || lower.includes('kanda')) {
      cropId = 'onion';
    } else if (lower.includes('सोयाबीन') || lower.includes('soyabean') || lower.includes('soybean')) {
      cropId = 'soybean';
    } else if (lower.includes('चना') || lower.includes('chana') || lower.includes('gram')) {
      cropId = 'gram';
    }

    // Mandi detection keywords
    if (lower.includes('गुलाबबाग') || lower.includes('gulabbagh') || lower.includes('gulab bagh')) {
      mandiId = 'gulabbagh';
    } else if (lower.includes('पूर्णिया') || lower.includes('purnea') || lower.includes('purnia')) {
      mandiId = 'purnea';
    } else if (lower.includes('मुजफ्फरपुर') || lower.includes('muzaffarpur')) {
      mandiId = 'muzaffarpur';
    } else if (lower.includes('पटना') || lower.includes('patna') || lower.includes('फतुहा') || lower.includes('fatuha')) {
      mandiId = 'patna';
    } else if (lower.includes('भागलपुर') || lower.includes('bhagalpur')) {
      mandiId = 'bhagalpur';
    } else if (lower.includes('समस्तीपुर') || lower.includes('samastipur')) {
      mandiId = 'samastipur';
    }

    return { cropId, mandiId };
  }
}

export const speechService = new SpeechService();
