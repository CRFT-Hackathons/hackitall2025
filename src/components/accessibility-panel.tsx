"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accessibility,
  Eye,
  Volume2,
  Brain,
  MousePointer2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function AccessibilityPanel() {
  const [fontSize, setFontSize] = useState(16);
  const [speechRate, setSpeechRate] = useState(1);
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const [useDyslexicFont, setUseDyslexicFont] = useState(false);
  const [useProfanityFilter, setUseProfanityFilter] = useState(false);
  const [disableAnimations, setDisableAnimations] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
  }, []);

  // Apply dyslexic font when changed
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
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
      }
    } catch (error) {
      console.error("Error applying dyslexic font:", error);
    }
  }, [useDyslexicFont]);

  // Apply animations setting
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (disableAnimations) {
        document.documentElement.classList.add("disable-animations");
      } else {
        document.documentElement.classList.remove("disable-animations");
      }
      localStorage.setItem("disableAnimations", disableAnimations.toString());
    }
  }, [disableAnimations]);

  // Save font size
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fontSize", fontSize.toString());
      // Apply font size to root element (optional)
      document.documentElement.style.fontSize = `${fontSize / 16}rem`;
    }
  }, [fontSize]);

  // Save speech rate
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("speechRate", speechRate.toString());
    }
  }, [speechRate]);

  // Save profanity filter setting when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "useProfanityFilter",
        useProfanityFilter ? "true" : "false"
      );
    }
  }, [useProfanityFilter]);

  const handleSaveSettings = () => {
    toast("Settings saved!", {
      description: "Your settings have been saved successfully.",
    });

    setOpen(false);
  };

  const resetToDefaults = () => {
    // Reset states
    setUseDyslexicFont(false);
    setUseProfanityFilter(false);
    setDisableAnimations(false);
    setFontSize(16);
    setSpeechRate(1);

    // Clear the applied styles
    document.body.style.fontFamily = "";
    document.documentElement.style.fontSize = "";
    document.documentElement.classList.remove("disable-animations");

    const existingStyle = document.getElementById("dyslexic-font");
    if (existingStyle) {
      existingStyle.remove();
    }

    // Clear localStorage settings
    localStorage.removeItem("useDyslexicFont");
    localStorage.removeItem("useProfanityFilter");
    localStorage.removeItem("disableAnimations");
    localStorage.removeItem("fontSize");
    localStorage.removeItem("speechRate");

    toast("Settings reset!", {
      description: "Your settings have been reset to defaults.",
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-none"
        >
          <Accessibility className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
          <span>Accessibility</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md border-l border-indigo-100 dark:border-indigo-900 bg-white dark:bg-[#0f0f13] rounded-l-2xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Accessibility Settings
          </SheetTitle>
          <SheetDescription>
            Customize your interview experience to meet your accessibility
            needs.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="vision" className="w-full">
          <TabsList className="grid grid-cols-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-6 h-14">
            <TabsTrigger
              value="vision"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 flex flex-col items-center justify-center"
            >
              <Eye className="h-4 w-4 mb-1" />
              <span className="text-xs">Vision</span>
            </TabsTrigger>
            <TabsTrigger
              value="hearing"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 flex flex-col items-center justify-center"
            >
              <Volume2 className="h-4 w-4 mb-1" />
              <span className="text-xs">Hearing</span>
            </TabsTrigger>
            <TabsTrigger
              value="motor"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 flex flex-col items-center justify-center"
            >
              <MousePointer2 className="h-4 w-4 mb-1" />
              <span className="text-xs">Motor</span>
            </TabsTrigger>
            <TabsTrigger
              value="cognitive"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 flex flex-col items-center justify-center"
            >
              <Brain className="h-4 w-4 mb-1" />
              <span className="text-xs">Cognitive</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vision" className="space-y-6 focus:outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="colorBlindMode" className="flex items-center">
                  <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                  Color Blind Mode
                </Label>
                <Select defaultValue="none">
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
                  className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
                />
              </div>

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

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="disableAnimations"
                  className="flex items-center"
                >
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
          </TabsContent>

          <TabsContent value="hearing" className="space-y-6 focus:outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="textToSpeech" className="flex items-center">
                  <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                  Text to Speech
                </Label>
                <Switch
                  id="textToSpeech"
                  defaultChecked
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
                  defaultChecked
                  className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="motor" className="space-y-6 focus:outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="keyboardNavigation"
                  className="flex items-center"
                >
                  <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                  Enhanced Keyboard Navigation
                </Label>
                <Switch
                  id="keyboardNavigation"
                  defaultChecked
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
                  defaultChecked
                  className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="cognitive"
            className="space-y-6 focus:outline-none"
          >
            <div className="space-y-4">
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
                <Label
                  htmlFor="simplifiedInterface"
                  className="flex items-center"
                >
                  <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                  Simplified Interface
                </Label>
                <Switch
                  id="simplifiedInterface"
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
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            className="rounded-xl border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            onClick={resetToDefaults}
          >
            Reset to Default
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
