"use client";
import { useState, useEffect, useRef } from "react";
import {
  Clock,
  Eye,
  EyeOff,
  Bath,
  AlertTriangle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom hook for more accurate interval timing
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

interface TimeRemainingProps {
  /**
   * Initial time in seconds
   */
  initialTime?: number;
  /**
   * Callback when time is up
   */
  onTimeUp?: () => void;
  /**
   * Class name for the container
   */
  className?: string;
  /**
   * Whether to show the breaks section
   */
  showBreakButtons?: boolean;
}

export function TimeRemaining({
  initialTime = 1800, // 30 minutes by default
  onTimeUp,
  className = "",
  showBreakButtons = true,
}: TimeRemainingProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(true);
  const [isTimeHidden, setIsTimeHidden] = useState(true);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [breakType, setBreakType] = useState<"regular" | "bathroom" | null>(
    null
  );
  const [hasUsedRegularBreak, setHasUsedRegularBreak] = useState(false);
  const [hasUsedBathroomBreak, setHasUsedBathroomBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
  const [remainingBreakTime, setRemainingBreakTime] = useState<number>(0);
  const [breakProgress, setBreakProgress] = useState<number>(0);
  // Track whether the rain sound is muted
  const [isRainSoundMuted, setIsRainSoundMuted] = useState(false);
  // Track whether the user has interacted with the document (audio allowed)
  const [hasInteracted, setHasInteracted] = useState(() => {
    // Only attempt to read localStorage if running in the browser.
    if (typeof window !== "undefined") {
      return localStorage.getItem("hasInteracted") === "true";
    }
    return false;
  });
  // When play() fails, we mark that a manual interaction is needed.
  const [needsAudioInteraction, setNeedsAudioInteraction] = useState(false);

  // Global listener to detect user interaction (click or keydown)
  useEffect(() => {
    if (!hasInteracted) {
      const handleInteraction = () => {
        setHasInteracted(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("hasInteracted", "true");
        }
      };
      window.addEventListener("click", handleInteraction, { once: true });
      window.addEventListener("keydown", handleInteraction, { once: true });
      return () => {
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };
    }
  }, [hasInteracted]);

  // Ref for the rain audio during break
  const breakAudioRef = useRef<HTMLAudioElement>(null);

  // When a break starts, attempt to play the audio only if the user has interacted.
  useEffect(() => {
    if (breakType && breakAudioRef.current) {
      const audio = breakAudioRef.current;
      // Set initial volume to 0 for smooth fade in.
      audio.volume = 0;
      audio.muted = false;

      if (hasInteracted) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setNeedsAudioInteraction(false))
            .catch((error: any) => {
              // Suppress NotAllowedError
              if (error.name !== "NotAllowedError") {
                console.error(
                  "Error playing rain sound on break start:",
                  error
                );
              }
              setNeedsAudioInteraction(true);
            });
        }
      }
    } else if (!breakType && breakAudioRef.current) {
      // When break ends: pause and reset the audio.
      const audio = breakAudioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0.2;
    }
  }, [breakType, hasInteracted]);

  // Smooth fade for audio volume when muting or starting audio.
  useEffect(() => {
    if (breakType && breakAudioRef.current && hasInteracted) {
      const audio = breakAudioRef.current;
      const targetVolume = isRainSoundMuted ? 0 : 0.2;
      const fadeDuration = 1000; // ms
      const fps = 60;
      const intervalTime = 1000 / fps;
      const steps = fadeDuration / intervalTime;
      const volumeStep = (targetVolume - audio.volume) / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(0.2, Math.max(0, audio.volume + volumeStep));
        if (currentStep >= steps) {
          audio.volume = targetVolume;
          clearInterval(fadeInterval);
        }
      }, intervalTime);

      return () => clearInterval(fadeInterval);
    }
  }, [isRainSoundMuted, breakType, hasInteracted]);

  // Handler to explicitly enable audio.
  const handleUnmuteClick = () => {
    setHasInteracted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("hasInteracted", "true");
    }
    if (breakAudioRef.current) {
      breakAudioRef.current
        .play()
        .then(() => setNeedsAudioInteraction(false))
        .catch((error: any) => {
          if (error.name !== "NotAllowedError") {
            console.error("Error enabling audio:", error);
          }
          setNeedsAudioInteraction(true);
        });
    }
  };

  // Load saved state from localStorage on component mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedIsTimeHidden = localStorage.getItem("isTimeHidden");
    if (savedIsTimeHidden) {
      setIsTimeHidden(savedIsTimeHidden === "true");
    }

    const savedHasUsedRegularBreak = localStorage.getItem(
      "hasUsedRegularBreak"
    );
    if (savedHasUsedRegularBreak) {
      setHasUsedRegularBreak(savedHasUsedRegularBreak === "true");
    }

    const savedHasUsedBathroomBreak = localStorage.getItem(
      "hasUsedBathroomBreak"
    );
    if (savedHasUsedBathroomBreak) {
      setHasUsedBathroomBreak(savedHasUsedBathroomBreak === "true");
    }

    const savedBreakType = localStorage.getItem("breakType") as
      | "regular"
      | "bathroom"
      | null;
    const savedBreakStartTime = localStorage.getItem("breakStartTime");

    if (savedBreakType && savedBreakStartTime) {
      const breakStartTime = parseInt(savedBreakStartTime, 10);
      const now = Date.now();
      const breakDuration = savedBreakType === "regular" ? 300000 : 120000;

      if (now - breakStartTime < breakDuration) {
        setBreakType(savedBreakType);
        setBreakStartTime(breakStartTime);
        setShowBreakOverlay(true);
        setIsRunning(false);
        const elapsed = now - breakStartTime;
        const remaining = Math.max(
          0,
          Math.floor((breakDuration - elapsed) / 1000)
        );
        setRemainingBreakTime(remaining);
        setBreakProgress(elapsed / breakDuration);
      } else {
        localStorage.removeItem("breakType");
        localStorage.removeItem("breakStartTime");
      }
    }

    const savedTimeLeft = localStorage.getItem("timeLeft");
    const lastUpdateTime = localStorage.getItem("lastUpdateTime");
    const savedIsRunning = localStorage.getItem("isRunning");

    if (savedTimeLeft && lastUpdateTime) {
      const parsedTimeLeft = parseInt(savedTimeLeft, 10);
      const lastUpdate = parseInt(lastUpdateTime, 10);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);

      if (savedIsRunning === "true" && !breakType) {
        const newTimeLeft = Math.max(0, parsedTimeLeft - elapsedSeconds);
        setTimeLeft(newTimeLeft);
        localStorage.setItem("timeLeft", newTimeLeft.toString());
      } else {
        setTimeLeft(parsedTimeLeft);
      }

      localStorage.setItem("lastUpdateTime", now.toString());
      const shouldBeRunning =
        savedIsRunning === "true" && !breakType && parsedTimeLeft > 0;
      setIsRunning(shouldBeRunning);
    } else {
      setTimeLeft(initialTime);
      localStorage.setItem("timeLeft", initialTime.toString());
      localStorage.setItem("lastUpdateTime", Date.now().toString());
      setIsRunning(true);
      localStorage.setItem("isRunning", "true");
    }
  }, [initialTime]);

  // Main timer effect
  useInterval(
    () => {
      if (timeLeft > 0) {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          localStorage.setItem("timeLeft", newTime.toString());
          localStorage.setItem("lastUpdateTime", Date.now().toString());
          return newTime;
        });
      } else {
        setIsRunning(false);
        localStorage.setItem("isRunning", "false");
        onTimeUp?.();
      }
    },
    isRunning ? 1000 : null
  );

  useEffect(() => {
    localStorage.setItem("isRunning", isRunning.toString());
  }, [isRunning]);

  // Break timer effect
  useInterval(
    () => {
      if (!breakStartTime || !breakType) return;
      const breakDuration = breakType === "regular" ? 300000 : 120000;
      const now = Date.now();
      const elapsedTime = now - breakStartTime;
      const remaining = Math.max(
        0,
        Math.floor((breakDuration - elapsedTime) / 1000)
      );
      setRemainingBreakTime(remaining);
      const progress = Math.min(1, elapsedTime / breakDuration);
      setBreakProgress(progress);

      if (elapsedTime >= breakDuration) {
        endBreak();
      }
    },
    breakStartTime ? 1000 : null
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const toggleTimeVisibility = () => {
    const newValue = !isTimeHidden;
    setIsTimeHidden(newValue);
    localStorage.setItem("isTimeHidden", String(newValue));
  };

  const startBreak = (type: "regular" | "bathroom") => {
    setShowBreakOverlay(true);
    setBreakType(type);
    const now = Date.now();
    setBreakStartTime(now);
    const breakDuration = type === "regular" ? 300000 : 120000;
    setRemainingBreakTime(Math.floor(breakDuration / 1000));
    setBreakProgress(0);

    if (type === "regular") {
      setHasUsedRegularBreak(true);
      localStorage.setItem("hasUsedRegularBreak", "true");
    } else {
      setHasUsedBathroomBreak(true);
      localStorage.setItem("hasUsedBathroomBreak", "true");
    }

    setIsRunning(false);
    localStorage.setItem("isRunning", "false");
    localStorage.setItem("breakStartTime", now.toString());
    localStorage.setItem("breakType", type);
  };

  const endBreak = () => {
    setShowBreakOverlay(false);
    setBreakType(null);
    setBreakStartTime(null);
    setRemainingBreakTime(0);
    setBreakProgress(0);
    setIsRunning(true);
    localStorage.setItem("isRunning", "true");
    localStorage.removeItem("breakStartTime");
    localStorage.removeItem("breakType");
  };

  return (
    <div className={`rounded-xl ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-indigo-500 dark:bg-indigo-400 mr-3 rounded-full"></div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Time Remaining
            </h3>
          </div>
          <button
            onClick={toggleTimeVisibility}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded"
            aria-label={isTimeHidden ? "Show time" : "Hide time"}
          >
            {isTimeHidden ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <div
              className={`text-2xl font-medium text-indigo-600 dark:text-gray-200 font-mono tabular-nums ${
                isTimeHidden ? "blur-[6px]" : ""
              }`}
              onClick={toggleTimeVisibility}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
          {showBreakButtons && !breakType && (
            <div className="flex space-x-2">
              <button
                onClick={() => startBreak("regular")}
                disabled={hasUsedRegularBreak}
                className={`rounded-full border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-xs px-3 py-1 text-indigo-600 dark:text-indigo-400 transition-colors ${
                  hasUsedRegularBreak ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={
                  hasUsedRegularBreak
                    ? "You've already used your break"
                    : "Take a break"
                }
              >
                <Clock className="h-3 w-3 mr-1 inline-block" />
                Break
              </button>
              <button
                onClick={() => startBreak("bathroom")}
                disabled={hasUsedBathroomBreak}
                className={`rounded-full border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-xs px-3 py-1 text-indigo-600 dark:text-indigo-400 transition-colors ${
                  hasUsedBathroomBreak ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={
                  hasUsedBathroomBreak
                    ? "You've already used your bathroom break"
                    : "Take a bathroom break"
                }
              >
                <Bath className="h-3 w-3 mr-1 inline-block" />
                <span>Bathroom Break</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element for rain sound during break */}
      {breakType && (
        <audio ref={breakAudioRef} loop>
          <source src="/rain.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {/* Full-page break overlay */}
      <AnimatePresence>
        {breakType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f0f13]/95 backdrop-blur-md flex flex-col items-center justify-center z-50"
            style={{ zIndex: 9999 }}
          >
            {/* Mute toggle button */}
            <button
              onClick={() => setIsRainSoundMuted((prev) => !prev)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20"
              aria-label={
                isRainSoundMuted ? "Unmute rain sound" : "Mute rain sound"
              }
            >
              {isRainSoundMuted ? (
                <VolumeX size={24} className="text-white" />
              ) : (
                <Volume2 size={24} className="text-white" />
              )}
            </button>

            {/* Show Unmute/Enable Audio button if needed */}
            {(!hasInteracted || needsAudioInteraction) && (
              <div className="absolute top-20 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                <button onClick={handleUnmuteClick}>Tap to enable audio</button>
              </div>
            )}

            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                {breakType === "regular" ? (
                  <Clock size={32} className="text-indigo-500" />
                ) : (
                  <Bath size={32} className="text-purple-500" />
                )}
              </div>
              <svg
                className="absolute top-0 left-0 w-24 h-24 -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx="48"
                  cy="48"
                  r="46"
                  stroke={breakType === "regular" ? "#6366f1" : "#8b5cf6"}
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * breakProgress}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2 text-white">
              {breakType === "regular" ? "BREAK TIME" : "BATHROOM BREAK"}
            </h3>
            <p className="text-white/60 mb-4 text-sm">
              {breakType === "regular"
                ? "Take a moment to breathe"
                : "We'll wait for you to return"}
            </p>
            <div className="text-4xl font-light mb-8 text-indigo-400">
              {formatTime(remainingBreakTime)}
            </div>

            <div className="mb-6 flex items-center gap-2 px-5 py-3 bg-amber-900/20 border border-amber-800/30 rounded-lg text-amber-300 max-w-xs text-center">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="text-sm">
                Note: You can use this break only once during the interview.
              </p>
            </div>

            <button
              onClick={endBreak}
              className="px-4 py-2 rounded-full text-white/70 hover:text-white/90 border border-white/20 hover:border-white/30 transition-colors"
            >
              End Break Early
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
