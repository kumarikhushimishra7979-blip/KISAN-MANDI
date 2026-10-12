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

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public speak(
    text: string,
    lang: Language,
    rate: number = 0.9,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) {
      if (onError) onError('Speech synthesis not supported in this browser.');
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Language code map
    let langCode = 'hi-IN';
    if (lang === 'en') langCode = 'en-IN';
    else if (lang === 'mai') langCode = 'hi-IN'; // Uses Indian Hindi phonemes for Maithili text

    utterance.lang = langCode;
    utterance.rate = rate; // 0.85 - 0.9 is easy for village elders to follow
    utterance.pitch = 1.0;

    // Pick best Indian voice if available
    const voices = this.synth.getVoices();
    const hindiVoice = voices.find(
      (v) => v.lang.startsWith('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('india')
    );
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
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
