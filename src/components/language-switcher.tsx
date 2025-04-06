"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

type Language = {
  code: string;
  name: string;
  flag: string;
  voice?: string;
};

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧", voice: "en-US" },
  { code: "ro", name: "Română", flag: "🇷🇴", voice: "ro-RO" },
  { code: "it", name: "Italiano", flag: "🇮🇹", voice: "it-IT" },
  { code: "es", name: "Español", flag: "🇪🇸", voice: "es-ES" },
];

export default function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Initialize speech synthesis and get available voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const synth = window.speechSynthesis;
      
      // Function to update voices once they're loaded
      const updateVoices = () => {
        const availableVoices = synth.getVoices();
        setVoices(availableVoices);
        
        // Get language from local storage if it exists
        const savedLang = localStorage.getItem("preferredLanguage");
        if (savedLang) {
          const lang = languages.find(l => l.code === savedLang);
          if (lang) setCurrentLanguage(lang);
        }
      };
      
      // Chrome loads voices asynchronously
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = updateVoices;
      }
      
      // Initial call for Firefox or if voices are already loaded
      updateVoices();
      
      // Dispatch event to let other components know language has been set
      window.dispatchEvent(new CustomEvent("languageChanged", {
        detail: { language: currentLanguage.code }
      }));
    }
  }, []);

  // Save language preference when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", currentLanguage.code);
      
      // Dispatch event to let other components know language has changed
      window.dispatchEvent(new CustomEvent("languageChanged", {
        detail: { language: currentLanguage.code }
      }));
    }
  }, [currentLanguage]);

  // Function to test the selected language text-to-speech
  const testTTS = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const synth = window.speechSynthesis;
      const testPhrases: Record<string, string> = {
        "en": "Hello, this is a test of the text-to-speech in English.",
        "ro": "Bună ziua, acesta este un test al sintezei text-to-speech în limba română.",
        "it": "Buongiorno, questo è un test del text-to-speech in italiano.",
        "es": "Hola, esta es una prueba del texto a voz en español."
      };
      
      // Create utterance with appropriate language
      const utterance = new SpeechSynthesisUtterance(testPhrases[currentLanguage.code]);
      
      // Find a voice for the selected language
      if (voices.length > 0) {
        const languageVoices = voices.filter(voice => 
          voice.lang.includes(currentLanguage.code) || 
          (currentLanguage.voice && voice.lang.includes(currentLanguage.voice))
        );
        
        if (languageVoices.length > 0) {
          utterance.voice = languageVoices[0];
        }
      }
      
      utterance.lang = currentLanguage.voice || currentLanguage.code;
      utterance.rate = 1;
      utterance.pitch = 1;
      
      // Speak the test phrase
      synth.speak(utterance);
    }
  };

  const switchLanguage = (language: Language) => {
    setCurrentLanguage(language);
    
    // Stop any current speech when switching languages
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5 border-slate-200 dark:border-slate-800">
            <span className="text-base leading-none mr-1">{currentLanguage.flag}</span>
            <span className="text-xs font-medium">{currentLanguage.name}</span>
            <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className="gap-2 cursor-pointer"
              onClick={() => switchLanguage(language)}
            >
              <span className="text-base">{language.flag}</span>
              <span className="flex-1 text-sm">{language.name}</span>
              {currentLanguage.code === language.code && (
                <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              )}
            </DropdownMenuItem>
          ))}
          <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1 px-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              onClick={testTTS}
            >
              Test speech
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 