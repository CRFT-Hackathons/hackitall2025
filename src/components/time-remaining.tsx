"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Eye, EyeOff, Coffee, Bath, AlertTriangle } from "lucide-react";
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

  // Load saved state from localStorage on component mount
  useEffect(() => {
    // Load time hiding preference
    const savedIsTimeHidden = localStorage.getItem("isTimeHidden");
    if (savedIsTimeHidden) {
      setIsTimeHidden(savedIsTimeHidden === "true");
    }

    // Load break usage
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

    // Load active break status if any
    const savedBreakType = localStorage.getItem("breakType") as
      | "regular"
      | "bathroom"
      | null;
    const savedBreakStartTime = localStorage.getItem("breakStartTime");

    if (savedBreakType && savedBreakStartTime) {
      const breakStartTime = parseInt(savedBreakStartTime, 10);
      const now = Date.now();
      const breakDuration = savedBreakType === "regular" ? 300000 : 120000; // 5 min or 2 min in ms

      // Check if break is still active
      if (now - breakStartTime < breakDuration) {
        setBreakType(savedBreakType);
        setBreakStartTime(breakStartTime);
        setShowBreakOverlay(true);
        setIsRunning(false);

        // Calculate remaining break time and progress
        const elapsed = now - breakStartTime;
        const remaining = Math.max(
          0,
          Math.floor((breakDuration - elapsed) / 1000)
        );
        setRemainingBreakTime(remaining);
        setBreakProgress(elapsed / breakDuration);
      } else {
        // Break duration has passed, clear it
        localStorage.removeItem("breakType");
        localStorage.removeItem("breakStartTime");
      }
    }

    // Check if we have a saved timer state
    const savedTimeLeft = localStorage.getItem("timeLeft");
    const lastUpdateTime = localStorage.getItem("lastUpdateTime");
    const savedIsRunning = localStorage.getItem("isRunning");

    if (savedTimeLeft && lastUpdateTime) {
      // We have a saved timer state
      const parsedTimeLeft = parseInt(savedTimeLeft, 10);
      const lastUpdate = parseInt(lastUpdateTime, 10);
      const now = Date.now();

      // Calculate elapsed time in seconds since last update
      const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);

      // Only subtract elapsed time if timer was running and we're not on a break
      if (savedIsRunning === "true" && !breakType) {
        // Calculate new time left by subtracting elapsed seconds, don't go below 0
        const newTimeLeft = Math.max(0, parsedTimeLeft - elapsedSeconds);
        setTimeLeft(newTimeLeft);
        localStorage.setItem("timeLeft", newTimeLeft.toString());
      } else {
        // Timer was paused, just use saved time
        setTimeLeft(parsedTimeLeft);
      }

      // Update the last update time to now
      localStorage.setItem("lastUpdateTime", now.toString());

      // Set running state (don't run if time is 0)
      const shouldBeRunning =
        savedIsRunning === "true" && !breakType && parsedTimeLeft > 0;
      setIsRunning(shouldBeRunning);
    } else {
      // No saved state, initialize with default values
      setTimeLeft(initialTime);
      localStorage.setItem("timeLeft", initialTime.toString());
      localStorage.setItem("lastUpdateTime", Date.now().toString());
      setIsRunning(true);
      localStorage.setItem("isRunning", "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTime]);

  // Main timer effect using our custom useInterval hook
  useInterval(
    () => {
      if (timeLeft > 0) {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          // Update localStorage with current time and update timestamp
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

  // Update isRunning in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isRunning", isRunning.toString());
  }, [isRunning]);

  // Update break timer using our custom useInterval hook
  useInterval(
    () => {
      if (!breakStartTime || !breakType) return;

      const breakDuration = breakType === "regular" ? 300000 : 120000; // 5 min or 2 min in ms
      const now = Date.now();
      const elapsedTime = now - breakStartTime;

      // Calculate remaining time in seconds
      const remaining = Math.max(
        0,
        Math.floor((breakDuration - elapsedTime) / 1000)
      );
      setRemainingBreakTime(remaining);

      // Calculate progress (0 to 1)
      const progress = Math.min(1, elapsedTime / breakDuration);
      setBreakProgress(progress);

      if (elapsedTime >= breakDuration) {
        endBreak();
      }
    },
    breakStartTime ? 1000 : null
  );

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const toggleTimeVisibility = () => {
    const newValue = !isTimeHidden;
    setIsTimeHidden(newValue);
    // Save the preference to localStorage
    localStorage.setItem("isTimeHidden", String(newValue));
  };

  const startBreak = (type: "regular" | "bathroom") => {
    setShowBreakOverlay(true);
    setBreakType(type);
    const now = Date.now();
    setBreakStartTime(now);

    // Initialize break time values
    const breakDuration = type === "regular" ? 300000 : 120000; // 5 min or 2 min in ms
    setRemainingBreakTime(Math.floor(breakDuration / 1000));
    setBreakProgress(0);

    // Mark break as used in state and localStorage
    if (type === "regular") {
      setHasUsedRegularBreak(true);
      localStorage.setItem("hasUsedRegularBreak", "true");
    } else {
      setHasUsedBathroomBreak(true);
      localStorage.setItem("hasUsedBathroomBreak", "true");
    }

    // Pause the main timer while on break
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

    // Resume the main timer
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
            <div className="relative w-12 h-12">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <svg className="absolute top-0 left-0 w-12 h-12 -rotate-90" aria-hidden="true">
                {/* Background circle */}
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  stroke="#6366f110"
                  strokeWidth="3"
                  fill="transparent"
                />
                {/* Animated progress circle */}
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  stroke="#6366f1"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - timeLeft / initialTime)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            </div>

            <motion.div
              className={`ml-3 text-2xl font-medium text-indigo-600 dark:text-gray-200 font-mono tabular-nums ${
                isTimeHidden ? "blur-[6px]" : ""
              }`}
              animate={{
                scale: timeLeft <= 300 && !isTimeHidden ? [1, 1.03, 1] : 1,
                color: timeLeft <= 300 && !isTimeHidden ? ["#6366f1", "#ef4444", "#6366f1"] : "#6366f1",
              }}
              transition={{
                repeat: timeLeft <= 300 && !isTimeHidden ? Infinity : 0,
                duration: 2,
              }}
              onClick={() => {
                const newValue = !isTimeHidden;
                setIsTimeHidden(newValue);
                localStorage.setItem("isTimeHidden", String(newValue));
              }}
            >
              {formatTime(timeLeft)}
            </motion.div>
          </div>

          {showBreakButtons && !breakType && (
            <div className="flex space-x-2">
              <motion.button
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
                whileHover={!hasUsedRegularBreak ? { scale: 1.05 } : {}}
                whileTap={!hasUsedRegularBreak ? { scale: 0.95 } : {}}
              >
                <Clock className="h-3 w-3 mr-1 inline-block" />
                Break
              </motion.button>
              <motion.button
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
                whileHover={!hasUsedBathroomBreak ? { scale: 1.05 } : {}}
                whileTap={!hasUsedBathroomBreak ? { scale: 0.95 } : {}}
              >
                <Bath className="h-3 w-3 mr-1 inline-block" />
                <span>Bathroom Break</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

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
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                {breakType === "regular" ? (
                  <Clock size={32} className="text-indigo-500" />
                ) : (
                  <Bath size={32} className="text-purple-500" />
                )}
              </div>
              <svg className="absolute top-0 left-0 w-24 h-24 -rotate-90" aria-hidden="true">
                {/* Background circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="46"
                  stroke={breakType === "regular" ? "#6366f110" : "#8b5cf610"}
                  strokeWidth="4"
                  fill="transparent"
                />
                {/* Animated progress circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="46"
                  stroke={breakType === "regular" ? "#6366f1" : "#8b5cf6"}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - breakProgress)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
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
            <motion.div
              className={`text-4xl font-light mb-8 ${
                breakType === "regular" ? "text-indigo-400" : "text-purple-400"
              }`}
              animate={{
                scale: remainingBreakTime <= 10 ? [1, 1.05, 1] : 1,
                color: remainingBreakTime <= 10 
                  ? [
                      breakType === "regular" ? "#6366f1" : "#8b5cf6", 
                      "#ef4444", 
                      breakType === "regular" ? "#6366f1" : "#8b5cf6"
                    ] 
                  : breakType === "regular" ? "#6366f1" : "#8b5cf6",
              }}
              transition={{
                repeat: remainingBreakTime <= 10 ? Infinity : 0,
                duration: 1.5,
              }}
              aria-live="polite"
            >
              {formatTime(remainingBreakTime)}
            </motion.div>

            <div className="mb-6 flex items-center gap-2 px-5 py-3 bg-amber-900/20 border border-amber-800/30 rounded-lg text-amber-300 max-w-xs text-center">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="text-sm">
                Note: You can use this break only once during the interview.
              </p>
            </div>

            <motion.button
              onClick={endBreak}
              className="px-4 py-2 rounded-full text-white/70 hover:text-white/90 border border-white/20 hover:border-white/30 transition-colors"
              whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              End Break Early
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
