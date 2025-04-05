"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Accessibility,
  Eye,
  Volume2,
  Brain,
  MousePointer2,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
} from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Accessibility settings
  const [fontSize, setFontSize] = useState(16);
  const [speechRate, setSpeechRate] = useState(1);
  const [useDyslexicFont, setUseDyslexicFont] = useState(false);
  const [useProfanityFilter, setUseProfanityFilter] = useState(false);
  const [disableAnimations, setDisableAnimations] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState("none");
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [voiceInput, setVoiceInput] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [eyeTracking, setEyeTracking] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState(false);
  const [simplifiedInterface, setSimplifiedInterface] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    // Load dyslexic font setting
    const savedDyslexicFont = localStorage.getItem("useDyslexicFont");
    if (savedDyslexicFont === "true") {
      setUseDyslexicFont(true);
    }

    // Load profanity filter setting
    const savedProfanityFilter = localStorage.getItem("useProfanityFilter");
    if (savedProfanityFilter === "true") {
      setUseProfanityFilter(true);
    }

    // Load animations setting
    const savedDisableAnimations = localStorage.getItem("disableAnimations");
    if (savedDisableAnimations === "true") {
      setDisableAnimations(true);
    }

    // Load font size
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }

    // Load speech rate
    const savedSpeechRate = localStorage.getItem("speechRate");
    if (savedSpeechRate) {
      setSpeechRate(parseFloat(savedSpeechRate));
    }

    // Load other settings
    const savedHighContrast = localStorage.getItem("highContrast");
    if (savedHighContrast === "true") {
      setHighContrast(true);
    }

    const savedColorBlindMode = localStorage.getItem("colorBlindMode");
    if (savedColorBlindMode) {
      setColorBlindMode(savedColorBlindMode);
    }

    const savedTextToSpeech = localStorage.getItem("textToSpeech");
    if (savedTextToSpeech === "true") {
      setTextToSpeech(true);
    }

    const savedVoiceInput = localStorage.getItem("voiceInput");
    if (savedVoiceInput === "true") {
      setVoiceInput(true);
    }

    const savedKeyboardNavigation = localStorage.getItem("keyboardNavigation");
    if (savedKeyboardNavigation === "true") {
      setKeyboardNavigation(true);
    }

    const savedEyeTracking = localStorage.getItem("eyeTracking");
    if (savedEyeTracking === "true") {
      setEyeTracking(true);
    }

    const savedVoiceCommands = localStorage.getItem("voiceCommands");
    if (savedVoiceCommands === "true") {
      setVoiceCommands(true);
    }

    const savedSimplifiedInterface = localStorage.getItem("simplifiedInterface");
    if (savedSimplifiedInterface === "true") {
      setSimplifiedInterface(true);
    }
  }, []);

  // Apply settings effects
  
  // Apply dyslexic font when changed
  useEffect(() => {
    try {
      if (useDyslexicFont) {
        // Apply dyslexic font to the entire body
        document.body.style.fontFamily = "'OpenDyslexic', sans-serif";

        // Also try to force it with !important through a stylesheet
        const style = document.createElement("style");
        style.id = "dyslexic-font";
        style.textContent = `
          * {
            font-family: 'OpenDyslexic', sans-serif !important;
          }
        `;
        document.head.appendChild(style);

        // Save setting to localStorage
        localStorage.setItem("useDyslexicFont", "true");
      } else {
        // Remove dyslexic font
        document.body.style.fontFamily = "";

        // Remove the stylesheet if it exists
        const existingStyle = document.getElementById("dyslexic-font");
        if (existingStyle) {
          existingStyle.remove();
        }

        // Save setting to localStorage
        localStorage.setItem("useDyslexicFont", "false");
      }
    } catch (error) {
      console.error("Error applying dyslexic font:", error);
    }
  }, [useDyslexicFont]);

  // Apply animations setting
  useEffect(() => {
    if (disableAnimations) {
      document.documentElement.classList.add("disable-animations");
    } else {
      document.documentElement.classList.remove("disable-animations");
    }
    localStorage.setItem("disableAnimations", disableAnimations.toString());
  }, [disableAnimations]);

  // Save font size
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize.toString());
    // Apply font size to root element
    document.documentElement.style.fontSize = `${fontSize / 16}rem`;
  }, [fontSize]);

  // Save all other settings
  useEffect(() => {
    localStorage.setItem("speechRate", speechRate.toString());
    localStorage.setItem("useProfanityFilter", useProfanityFilter.toString());
    localStorage.setItem("highContrast", highContrast.toString());
    localStorage.setItem("colorBlindMode", colorBlindMode);
    localStorage.setItem("textToSpeech", textToSpeech.toString());
    localStorage.setItem("voiceInput", voiceInput.toString());
    localStorage.setItem("keyboardNavigation", keyboardNavigation.toString());
    localStorage.setItem("eyeTracking", eyeTracking.toString());
    localStorage.setItem("voiceCommands", voiceCommands.toString());
    localStorage.setItem("simplifiedInterface", simplifiedInterface.toString());
  }, [
    speechRate,
    useProfanityFilter,
    highContrast,
    colorBlindMode,
    textToSpeech,
    voiceInput,
    keyboardNavigation,
    eyeTracking,
    voiceCommands,
    simplifiedInterface,
  ]);

  // Step configuration
  const steps = [
    {
      title: "Welcome to InAble",
      description:
        "Let's set up your accessibility preferences to make your interview experience more comfortable.",
      content: (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="mb-8 bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-full">
            <Accessibility className="w-20 h-20 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">
            Welcome to InAble - An Accessible Interview Platform
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-8">
            We'll guide you through setting up accessibility features to make your interview experience more comfortable and effective.
          </p>
        </div>
      ),
    },
    {
      title: "Visual Preferences",
      description: "Adjust your visual settings for better readability and comfort.",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-medium">Visual Preferences</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Dark Mode
              </Label>
              <Switch
                id="darkMode"
                checked={theme === "dark"}
                onCheckedChange={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="fontSize" className="flex items-center">
                  <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                  Font Size
                </Label>
                <span className="text-sm font-medium">{fontSize}px</span>
              </div>
              <Slider
                id="fontSize"
                min={12}
                max={32}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                className="slider-track [&>span]:slider-range [&>span>span]:slider-thumb"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="highContrast" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                High Contrast
              </Label>
              <Switch
                id="highContrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="colorBlindMode" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Color Blind Mode
              </Label>
              <Select value={colorBlindMode} onValueChange={setColorBlindMode}>
                <SelectTrigger className="w-[140px] rounded-xl border-indigo-200 dark:border-indigo-800">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="protanopia">Protanopia</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia</SelectItem>
                  <SelectItem value="achromatopsia">Grayscale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="disableAnimations" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Disable Animations
              </Label>
              <Switch
                id="disableAnimations"
                checked={disableAnimations}
                onCheckedChange={setDisableAnimations}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Hearing Preferences",
      description: "Adjust settings related to audio features and speech.",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-medium">Hearing Preferences</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="textToSpeech" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Text to Speech
              </Label>
              <Switch
                id="textToSpeech"
                checked={textToSpeech}
                onCheckedChange={setTextToSpeech}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="speechRate" className="flex items-center">
                  <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                  Speech Rate
                </Label>
                <span className="text-sm font-medium">{speechRate}x</span>
              </div>
              <Slider
                id="speechRate"
                min={0.5}
                max={2}
                step={0.1}
                value={[speechRate]}
                onValueChange={(value) => setSpeechRate(value[0])}
                className="slider-track [&>span]:slider-range [&>span>span]:slider-thumb"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="voiceInput" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Voice Input
              </Label>
              <Switch
                id="voiceInput"
                checked={voiceInput}
                onCheckedChange={setVoiceInput}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Motor Preferences",
      description: "Adjust settings to help with navigation and interaction.",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <MousePointer2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-medium">Motor Preferences</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="keyboardNavigation" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Enhanced Keyboard Navigation
              </Label>
              <Switch
                id="keyboardNavigation"
                checked={keyboardNavigation}
                onCheckedChange={setKeyboardNavigation}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="eyeTracking" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Eye Tracking
              </Label>
              <Switch
                id="eyeTracking"
                checked={eyeTracking}
                onCheckedChange={setEyeTracking}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="voiceCommands" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Voice Commands
              </Label>
              <Switch
                id="voiceCommands"
                checked={voiceCommands}
                onCheckedChange={setVoiceCommands}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Cognitive Preferences",
      description: "Adjust settings to help with reading and comprehension.",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-medium">Cognitive Preferences</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="dyslexicFont" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Dyslexic-Friendly Font
              </Label>
              <Switch
                id="dyslexicFont"
                checked={useDyslexicFont}
                onCheckedChange={setUseDyslexicFont}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="simplifiedInterface" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Simplified Interface
              </Label>
              <Switch
                id="simplifiedInterface"
                checked={simplifiedInterface}
                onCheckedChange={setSimplifiedInterface}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="profanityFilter" className="flex items-center">
                <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                Profanity Filter
              </Label>
              <Switch
                id="profanityFilter"
                checked={useProfanityFilter}
                onCheckedChange={setUseProfanityFilter}
                className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "All Set!",
      description: "Your accessibility preferences have been saved.",
      content: (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="mb-8 bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
            <Check className="w-20 h-20 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">
            You're All Set!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-8">
            Your accessibility preferences have been saved. You can always change them later from the Accessibility panel.
          </p>
          <div className="flex gap-4">
            <Link href="/">
              <Button
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
            <Link href="/profile">
              <Button
                variant="outline"
                className="rounded-xl border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              >
                <User className="mr-2 h-4 w-4" />
                Setup Profile
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Track onboarding completion
  useEffect(() => {
    if (currentStep === steps.length - 1) {
      localStorage.setItem("onboardingCompleted", "true");
    }
  }, [currentStep, steps.length]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f0f13] flex flex-col items-center justify-center">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-screen bg-gradient-to-b from-indigo-50/30 to-purple-50/10 dark:from-indigo-900/10 dark:to-purple-900/5 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-blue-50/20 to-transparent dark:from-blue-900/10 -z-10 blur-3xl"></div>

      <div className="container max-w-4xl px-4 py-8">
        {/* Logo and header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Accessibility className="text-indigo-400 h-8 w-auto" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              InAble
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            An accessible interview platform for everyone
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center space-x-1 mb-8">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-indigo-600 dark:bg-indigo-400"
                  : index < currentStep
                  ? "w-6 bg-indigo-400 dark:bg-indigo-600"
                  : "w-4 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Main card with step content */}
        <Card className="p-8 shadow-md border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#16161d] rounded-xl">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep].content}
          </motion.div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`rounded-xl border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all ${
                currentStep === 0 ? "opacity-0 pointer-events-none" : ""
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </main>
  );
} 