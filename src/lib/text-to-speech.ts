type TTSOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

class TextToSpeech {
  private static instance: TextToSpeech;
  private currentLanguage: string = 'en-US';
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private synth: SpeechSynthesis | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      
      // Initialize voices when available
      if (this.synth) {
        // For Chrome and other browsers that load voices asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = this.loadVoices.bind(this);
        }
        
        // Initial load for Firefox and other browsers that have voices available immediately
        this.loadVoices();
      }

      // Listen for language changes from the LanguageSwitcher component
      window.addEventListener('languageChanged', (event: CustomEvent) => {
        if (event.detail && event.detail.language) {
          this.setLanguage(event.detail.language);
        }
      });

      // Check for stored language preference
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang) {
        this.setLanguage(savedLang);
      }
    }
  }

  public static getInstance(): TextToSpeech {
    if (!TextToSpeech.instance) {
      TextToSpeech.instance = new TextToSpeech();
    }
    return TextToSpeech.instance;
  }

  private loadVoices(): void {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public setLanguage(languageCode: string): void {
    // Map language code to voice language code if needed
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'ro': 'ro-RO',
      'it': 'it-IT',
      'es': 'es-ES'
    };

    this.currentLanguage = languageMap[languageCode] || languageCode;
  }

  public speak(text: string, options: TTSOptions = {}): void {
    if (!this.synth) return;
    
    // Stop any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    utterance.lang = this.currentLanguage;
    
    // Set voice based on language
    if (this.voices.length > 0) {
      // Try to find exact match first
      let voice = this.voices.find(v => v.lang === this.currentLanguage);
      
      // If no exact match, try to find a voice that starts with the language code
      if (!voice) {
        const langPrefix = this.currentLanguage.split('-')[0];
        voice = this.voices.find(v => v.lang.startsWith(langPrefix));
      }
      
      // Set the voice if we found one
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    // Set options
    utterance.rate = options.rate !== undefined ? options.rate : 1;
    utterance.pitch = options.pitch !== undefined ? options.pitch : 1;
    utterance.volume = options.volume !== undefined ? options.volume : 1;
    
    // Track speaking state
    this.isSpeaking = true;
    utterance.onend = () => {
      this.isSpeaking = false;
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
    };
    
    // Speak the text
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  public isSpeakingNow(): boolean {
    return this.isSpeaking;
  }
}

// Export a singleton instance
export const tts = typeof window !== 'undefined' ? TextToSpeech.getInstance() : null;

// Helper function to speak text with the current language
export function speakText(text: string, options: TTSOptions = {}): void {
  if (tts) {
    tts.speak(text, options);
  }
}

// Helper function to stop speaking
export function stopSpeaking(): void {
  if (tts) {
    tts.stop();
  }
} 