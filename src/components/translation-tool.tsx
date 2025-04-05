"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, ArrowRightLeft } from "lucide-react";

// Sample languages - in a real app, this would be more comprehensive
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" },
];

export default function TranslationTool() {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [originalText, setOriginalText] = useState(
    "Tell us about a challenging project you worked on and how you overcame obstacles."
  );
  const [translatedText, setTranslatedText] = useState(
    "Cuéntanos sobre un proyecto desafiante en el que trabajaste y cómo superaste los obstáculos."
  );

  // In a real app, this would call a translation API
  const translateText = () => {
    // Simulate translation delay
    setTimeout(() => {
      // This is just a mock translation for demonstration
      if (targetLanguage === "es") {
        setTranslatedText(
          "Cuéntanos sobre un proyecto desafiante en el que trabajaste y cómo superaste los obstáculos."
        );
      } else if (targetLanguage === "fr") {
        setTranslatedText(
          "Parlez-nous d'un projet difficile sur lequel vous avez travaillé et comment vous avez surmonté les obstacles."
        );
      } else if (targetLanguage === "de") {
        setTranslatedText(
          "Erzählen Sie uns von einem anspruchsvollen Projekt, an dem Sie gearbeitet haben, und wie Sie Hindernisse überwunden haben."
        );
      } else {
        setTranslatedText(
          "Translation would appear here in a real application."
        );
      }
    }, 500);
  };

  const swapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);

    // Swap text as well
    const tempText = originalText;
    setOriginalText(translatedText);
    setTranslatedText(tempText);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span>Translate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Translation Tool</DialogTitle>
          <DialogDescription>
            Translate interview questions and your responses to your preferred
            language.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Source language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={swapLanguages}
              className="flex-shrink-0"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>

            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Target language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="p-2 bg-slate-100 text-xs rounded-t-md border-t border-x">
                {languages.find((l) => l.code === sourceLanguage)?.name ||
                  "Source"}
              </div>
              <textarea
                className="w-full p-3 border rounded-b-md min-h-[100px]"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
              />
            </div>

            <div>
              <div className="p-2 bg-slate-100 text-xs rounded-t-md border-t border-x">
                {languages.find((l) => l.code === targetLanguage)?.name ||
                  "Translation"}
              </div>
              <textarea
                className="w-full p-3 border rounded-b-md min-h-[100px]"
                value={translatedText}
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={translateText}>Translate</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
