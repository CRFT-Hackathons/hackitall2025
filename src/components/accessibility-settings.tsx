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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Accessibility } from "lucide-react";

export default function AccessibilitySettings() {
  const [speechRate, setSpeechRate] = useState(1);
  const [fontSize, setFontSize] = useState(16);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <Accessibility className="h-4 w-4" />
          <span>Accessibility</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
          <DialogDescription>
            Customize your interview experience to meet your accessibility
            needs.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="vision" className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="vision">Vision</TabsTrigger>
            <TabsTrigger value="hearing">Hearing</TabsTrigger>
            <TabsTrigger value="motor">Motor</TabsTrigger>
            <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
          </TabsList>

          <TabsContent value="vision" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="colorBlindMode">Color Blind Mode</Label>
                <Select defaultValue="none">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="protanopia">Protanopia</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia</SelectItem>
                    <SelectItem value="achromatopsia">Achromatopsia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <span className="text-sm">{fontSize}px</span>
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
                <Label htmlFor="highContrast">High Contrast</Label>
                <Switch id="highContrast" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="screenReader">Screen Reader Compatible</Label>
                <Switch id="screenReader" defaultChecked />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hearing" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="textToSpeech">Text to Speech</Label>
                <Switch id="textToSpeech" defaultChecked />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speechRate">Speech Rate</Label>
                  <span className="text-sm">{speechRate}x</span>
                </div>
                <Slider
                  id="speechRate"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[speechRate]}
                  onValueChange={(value) => setSpeechRate(value[0])}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="captions">Captions</Label>
                <Switch id="captions" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="voiceInput">Voice Input</Label>
                <Switch id="voiceInput" defaultChecked />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="motor" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboardNavigation">
                  Enhanced Keyboard Navigation
                </Label>
                <Switch id="keyboardNavigation" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="eyeTracking">Eye Tracking</Label>
                <Switch id="eyeTracking" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="voiceCommands">Voice Commands</Label>
                <Switch id="voiceCommands" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoComplete">Auto-Complete</Label>
                <Switch id="autoComplete" defaultChecked />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cognitive" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dyslexicFont">Dyslexic-Friendly Font</Label>
                <Switch id="dyslexicFont" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="simplifiedInterface">
                  Simplified Interface
                </Label>
                <Switch id="simplifiedInterface" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="focusMode">Focus Mode</Label>
                <Switch id="focusMode" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="profanityFilter">Profanity Filter</Label>
                <Switch id="profanityFilter" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="timeoutButton">Timeout Button</Label>
                <Switch id="timeoutButton" defaultChecked />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
