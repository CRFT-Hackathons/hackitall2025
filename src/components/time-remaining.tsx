"use client";
import { useState, useEffect } from "react";
import { Clock, Eye, EyeOff, Coffee, Bath, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isTimeHidden, setIsTimeHidden] = useState(true);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [showBreakTimer, setShowBreakTimer] = useState<
    "regular" | "bathroom" | null
  >(null);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [hasUsedRegularBreak, setHasUsedRegularBreak] = useState(false);
  const [hasUsedBathroomBreak, setHasUsedBathroomBreak] = useState(false);

  // Load saved preferences and break usage status from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load break usage status
      const regularBreakUsed =
        localStorage.getItem("regularBreakUsed") === "true";
      const bathroomBreakUsed =
        localStorage.getItem("bathroomBreakUsed") === "true";

      // Load time visibility preference
      const timeHidden = localStorage.getItem("isTimeHidden");

      setHasUsedRegularBreak(regularBreakUsed);
      setHasUsedBathroomBreak(bathroomBreakUsed);

      // Only update if there's a saved preference
      if (timeHidden !== null) {
        setIsTimeHidden(timeHidden === "true");
      }
    }
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Handle countdown
  useEffect(() => {
    if (isBreakActive) return;

    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isBreakActive, onTimeUp]);

  // Handle break countdown
  useEffect(() => {
    if (!showBreakTimer || breakTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setBreakTimeLeft((prev) => {
        if (prev <= 1) {
          setShowBreakTimer(null);
          setIsBreakActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breakTimeLeft, showBreakTimer]);

  const toggleTimeVisibility = () => {
    const newValue = !isTimeHidden;
    setIsTimeHidden(newValue);
    // Save the preference to localStorage
    localStorage.setItem("isTimeHidden", String(newValue));
  };

  const startBreak = (type: "regular" | "bathroom") => {
    setIsBreakActive(true);
    setShowBreakTimer(type);
    setBreakTimeLeft(type === "regular" ? 300 : 120); // 5 or 2 minutes

    // Mark break as used in state and localStorage
    if (type === "regular" && !hasUsedRegularBreak) {
      setHasUsedRegularBreak(true);
      localStorage.setItem("regularBreakUsed", "true");
    } else if (type === "bathroom" && !hasUsedBathroomBreak) {
      setHasUsedBathroomBreak(true);
      localStorage.setItem("bathroomBreakUsed", "true");
    }
  };

  const endBreak = () => {
    setShowBreakTimer(null);
    setIsBreakActive(false);
    setBreakTimeLeft(0);
  };

  return (
    <div className={`rounded-xl ${className}`}>
      <div className="flex flex-col">
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
              className={`text-2xl font-medium text-gray-200 font-mono tabular-nums ${
                isTimeHidden ? "blur-[6px]" : ""
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {showBreakButtons && !showBreakTimer && (
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

      {/* Full-page break overlay */}
      <AnimatePresence>
        {showBreakTimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f0f13]/95 backdrop-blur-md flex flex-col items-center justify-center z-50"
            style={{ zIndex: 9999 }}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                {showBreakTimer === "regular" ? (
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
                  stroke={showBreakTimer === "regular" ? "#6366f1" : "#8b5cf6"}
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    46 *
                    (1 -
                      breakTimeLeft /
                        (showBreakTimer === "regular" ? 300 : 120))
                  }
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2 text-white">
              {showBreakTimer === "regular" ? "BREAK TIME" : "BATHROOM BREAK"}
            </h3>
            <p className="text-white/60 mb-4 text-sm">
              {showBreakTimer === "regular"
                ? "Take a moment to breathe"
                : "We'll wait for you to return"}
            </p>
            <div className="text-4xl font-light mb-8 text-indigo-400">
              {formatTime(breakTimeLeft)}
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
