"use client";

import { useState } from "react";
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

export default function AccessibilityPanel() {
  const [fontSize, setFontSize] = useState(16);
  const [speechRate, setSpeechRate] = useState(1);
  const { theme, setTheme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-none"
        >
          <Accessibility className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
          <span>Accessibility</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md border-l border-indigo-100 dark:border-indigo-900 bg-white dark:bg-[#0f0f13]">
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
                  checked={false}
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
                  defaultChecked
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
                  defaultChecked
                  className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="timeoutButton" className="flex items-center">
                  <div className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 mr-2 rounded-full"></div>
                  Timeout Button
                </Label>
                <Switch
                  id="timeoutButton"
                  defaultChecked
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
          >
            Reset to Default
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white">
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
