"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Coffee, Timer } from "lucide-react"

export interface BreakTimerProps {
  /**
   * Duration of the break in seconds
   */
  duration?: number
  /**
   * Title displayed during the break
   */
  title?: string
  /**
   * Subtitle displayed during the break
   */
  subtitle?: string
  /**
   * Icon to display (defaults to Clock)
   */
  icon?: "clock" | "coffee" | "timer"
  /**
   * Primary color (used for icon and timer)
   */
  primaryColor?: string
  /**
   * Background color for the timer overlay
   */
  backgroundColor?: string
  /**
   * Callback function when timer completes
   */
  onComplete?: () => void
  /**
   * Callback function when timer is canceled
   */
  onCancel?: () => void
  /**
   * Whether to show a cancel button
   */
  showCancelButton?: boolean
  /**
   * Custom class name for the container
   */
  className?: string
}

export function BreakTimer({
  duration = 300, // 5 minutes by default
  title = "BREAK TIME",
  subtitle = "Take a moment to breathe",
  icon = "clock",
  primaryColor = "#6366f1",
  backgroundColor = "rgba(15, 15, 19, 0.95)",
  onComplete,
  onCancel,
  showCancelButton = true,
  className = "",
}: BreakTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isActive, setIsActive] = useState(true)

  // Handle timeout countdown
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      onComplete?.()
    }

    return () => clearInterval(timer)
  }, [isActive, timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleCancel = () => {
    setIsActive(false)
    onCancel?.()
  }

  const getIcon = () => {
    switch (icon) {
      case "coffee":
        return <Coffee size={32} style={{ color: primaryColor }} />
      case "timer":
        return <Timer size={32} style={{ color: primaryColor }} />
      case "clock":
      default:
        return <Clock size={32} style={{ color: primaryColor }} />
    }
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 flex flex-col items-center justify-center z-50 backdrop-blur-md ${className}`}
          style={{ backgroundColor }}
          role="alert"
          aria-live="assertive"
        >
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              {getIcon()}
            </div>
            <svg className="absolute top-0 left-0 w-24 h-24 -rotate-90" aria-hidden="true">
              <motion.circle
                cx="48"
                cy="48"
                r="46"
                stroke={primaryColor}
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                initial={{ strokeDashoffset: 0 }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 46 * (1 - timeLeft / duration)
                }}
                transition={{ 
                  duration: 1,
                  ease: "linear"
                }}
              />
            </svg>
          </div>
          <h3 className="text-xl font-light mb-2 text-white">{title}</h3>
          <p className="text-white/60 mb-4 text-sm">{subtitle}</p>
          <motion.div 
            className="text-4xl font-light mb-8" 
            style={{ color: primaryColor }} 
            aria-live="polite"
            animate={{ 
              scale: timeLeft <= 10 ? [1, 1.05, 1] : 1,
              color: timeLeft <= 10 ? [primaryColor, "#ff5555", primaryColor] : primaryColor
            }}
            transition={{ 
              repeat: timeLeft <= 10 ? Infinity : 0, 
              duration: timeLeft <= 10 ? 0.8 : 0 
            }}
          >
            {formatTime(timeLeft)}
          </motion.div>

          {showCancelButton && (
            <motion.button
              onClick={handleCancel}
              className="px-4 py-2 rounded-full text-white/70 hover:text-white/90 border border-white/20 hover:border-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                "--tw-ring-color": primaryColor,
                "--tw-ring-offset-color": backgroundColor,
              } as React.CSSProperties}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              End Break Early
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * A component that displays a 5-minute break timer
 */
export function NeedABreak(props: Omit<BreakTimerProps, "duration" | "title" | "subtitle" | "icon">) {
  return (
    <BreakTimer
      duration={300} // 5 minutes
      title="BREAK TIME"
      subtitle="Take a moment to breathe"
      icon="clock"
      {...props}
    />
  )
}

/**
 * A component that displays a 2-minute bathroom break timer
 */
export function BathroomBreak(props: Omit<BreakTimerProps, "duration" | "title" | "subtitle" | "icon">) {
  return (
    <BreakTimer
      duration={120} // 2 minutes
      title="BATHROOM BREAK"
      subtitle="We'll wait for you to return"
      icon="timer"
      {...props}
    />
  )
}

