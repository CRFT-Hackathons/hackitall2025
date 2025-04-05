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
  const [isRunning, setIsRunning] = useState(true);
  const [isTimeHidden, setIsTimeHidden] = useState(false);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [breakType, setBreakType] = useState<"regular" | "bathroom" | null>(null);
  const [hasUsedRegularBreak, setHasUsedRegularBreak] = useState(false);
  const [hasUsedBathroomBreak, setHasUsedBathroomBreak] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);

  // Load saved state from localStorage on component mount
  useEffect(() => {
    // Load time hiding preference
    const savedIsTimeHidden = localStorage.getItem("isTimeHidden");
    if (savedIsTimeHidden) {
      setIsTimeHidden(savedIsTimeHidden === "true");
    }
    
    // Load break usage
    const savedHasUsedRegularBreak = localStorage.getItem("hasUsedRegularBreak");
    if (savedHasUsedRegularBreak) {
      setHasUsedRegularBreak(savedHasUsedRegularBreak === "true");
    }
    
    const savedHasUsedBathroomBreak = localStorage.getItem("hasUsedBathroomBreak");
    if (savedHasUsedBathroomBreak) {
      setHasUsedBathroomBreak(savedHasUsedBathroomBreak === "true");
    }
    
    // Load active break status if any
    const savedBreakType = localStorage.getItem("breakType") as "regular" | "bathroom" | null;
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
      const shouldBeRunning = savedIsRunning === "true" && !breakType && parsedTimeLeft > 0;
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
  
  // Main timer effect
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          // Update localStorage with current time and update timestamp
          localStorage.setItem("timeLeft", newTime.toString());
          localStorage.setItem("lastUpdateTime", Date.now().toString());
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      localStorage.setItem("isRunning", "false");
      onTimeUp?.();
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft, onTimeUp]);
  
  // Update isRunning in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isRunning", isRunning.toString());
  }, [isRunning]);

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
    setBreakStartTime(Date.now());
    
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
    localStorage.setItem("breakStartTime", Date.now().toString());
    localStorage.setItem("breakType", type);
  };

  const endBreak = () => {
    setShowBreakOverlay(false);
    setBreakType(null);
    setBreakStartTime(null);
    
    // Resume the main timer
    setIsRunning(true);
    localStorage.setItem("isRunning", "true");
    localStorage.removeItem("breakStartTime");
    localStorage.removeItem("breakType");
  };
  
  // Update break timer display and end break when time is up
  useEffect(() => {
    if (!breakStartTime || !breakType) return;
    
    const breakDuration = breakType === "regular" ? 300000 : 120000; // 5 min or 2 min in ms
    const breakInterval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - breakStartTime;
      
      if (elapsedTime >= breakDuration) {
        endBreak();
      }
    }, 1000);
    
    return () => clearInterval(breakInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakStartTime, breakType]);

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
              className={`text-2xl font-medium text-indigo-600 dark:text-gray-200 font-mono tabular-nums ${
                isTimeHidden ? "blur-[6px]" : ""
              }`}
              onClick={() => {
                const newValue = !isTimeHidden;
                setIsTimeHidden(newValue);
                localStorage.setItem("isTimeHidden", String(newValue));
              }}
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
                  strokeDashoffset={
                    46 *
                    (1 -
                     (breakStartTime ? (Date.now() - breakStartTime) / 
                       (breakType === "regular" ? 300000 : 120000) : 0))
                  }
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
              {formatTime(breakStartTime ? Math.floor((Date.now() - breakStartTime) / 1000) : 0)}
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
