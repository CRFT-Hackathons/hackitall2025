"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Volume2, Pause, Play, SkipBack, SkipForward } from "lucide-react";

export default function TextToSpeech() {
  const [text, setText] = useState(
    "Tell us about a challenging project you worked on and how you overcame obstacles."
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voice, setVoice] = useState("");
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Get available voices
      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !voice) {
          setVoice(voices[0].name);
        }
      };

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
      }

      getVoices();

      // Cleanup
      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice
      if (voice) {
        const selectedVoice = availableVoices.find((v) => v.name === voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Set speech properties
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Events
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      // Start speaking
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speak();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Volume2 className="h-4 w-4" />
          <span>Text to Speech</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Text to Speech</DialogTitle>
          <DialogDescription>
            Listen to interview questions and instructions.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="p-4 border rounded-md bg-slate-50">
            <p className="text-sm">{text}</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              onClick={togglePlayPause}
              variant="default"
              size="icon"
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="voice">Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((v) => (
                    <SelectItem key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rate">Speed</Label>
                <span className="text-sm">{rate}x</span>
              </div>
              <Slider
                id="rate"
                min={0.5}
                max={2}
                step={0.1}
                value={[rate]}
                onValueChange={(value) => setRate(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pitch">Pitch</Label>
                <span className="text-sm">{pitch}</span>
              </div>
              <Slider
                id="pitch"
                min={0.5}
                max={2}
                step={0.1}
                value={[pitch]}
                onValueChange={(value) => setPitch(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume">Volume</Label>
                <span className="text-sm">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                id="volume"
                min={0}
                max={1}
                step={0.1}
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
