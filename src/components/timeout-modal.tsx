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
import { BreakTimer } from "@/components/break-timer";
import { Progress } from "@/components/ui/progress";
import { Pause, Play, RefreshCw } from "lucide-react";

export default function TimeoutModal() {
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
          className="rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:hover:bg-indigo-800 dark:text-indigo-300 shadow-none"
        >
          <Pause className="h-4 w-4 mr-2" />
          <span>Timeout</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] border-0 shadow-none bg-white dark:bg-[#1e1e1e] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Take a Break
          </DialogTitle>
          <DialogDescription>
            It's okay to take a moment to collect your thoughts. The interview
            will resume when you're ready.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isPaused ? "Timer paused" : "Time remaining"}
            </p>
          </div>

          <Progress
            value={progress}
            className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500 dark:[&>div]:from-indigo-400 dark:[&>div]:to-purple-400"
          />

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="rounded-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            >
              <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </Button>
            <Button
              variant={isPaused ? "default" : "secondary"}
              size="icon"
              onClick={togglePause}
              className={`rounded-full ${
                isPaused
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white"
                  : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:hover:bg-indigo-800 dark:text-indigo-300"
              }`}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-sm font-medium mb-2 text-indigo-700 dark:text-indigo-300">
              Breathing Exercise
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7 seconds,
              exhale for 8 seconds. Repeat 4 times.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => setIsOpen(false)}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white"
          >
            Resume Interview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
