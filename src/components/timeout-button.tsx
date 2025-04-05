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
import { Progress } from "@/components/ui/progress";
import { Pause, Play, RefreshCw } from "lucide-react";

export default function TimeoutButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          setProgress((newTime / 300) * 100);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPaused, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const resetTimer = () => {
    setTimeRemaining(300);
    setProgress(100);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
        >
          <Pause className="h-4 w-4" />
          <span>Timeout</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Take a Break</DialogTitle>
          <DialogDescription>
            It's okay to take a moment to collect your thoughts. The interview
            will resume when you're ready.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-slate-500">
              {isPaused ? "Timer paused" : "Time remaining"}
            </p>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex justify-center gap-4">
            <Button variant="outline" size="icon" onClick={resetTimer}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant={isPaused ? "default" : "secondary"}
              size="icon"
              onClick={togglePause}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="p-4 bg-slate-50 rounded-md">
            <h3 className="text-sm font-medium mb-2">Breathing Exercise</h3>
            <p className="text-sm text-slate-600">
              Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7 seconds,
              exhale for 8 seconds. Repeat 4 times.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => setIsOpen(false)}>Resume Interview</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
