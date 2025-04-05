"use client"

import { useState } from "react"
import { Clock, Coffee, X } from "lucide-react"
import { motion } from "framer-motion"
import { NeedABreak, BathroomBreak } from "@/components/break-timer"

export interface BreakTimerButtonProps {
  /**
   * Type of break timer to show
   */
  breakType?: "regular" | "bathroom"
  /**
   * Primary color for the button and timer
   */
  primaryColor?: string
  /**
   * Text to display on the button
   */
  label?: string
  /**
   * Whether to show the button's icon
   */
  showIcon?: boolean
  /**
   * Custom class name for the button container
   */
  className?: string
  /**
   * Callback function when the break starts
   */
  onBreakStart?: () => void
  /**
   * Callback function when the break ends
   */
  onBreakEnd?: () => void
  /**
   * Custom duration for the break in seconds (overrides default durations)
   */
  duration?: number
}

export function BreakTimerButton({
  breakType = "regular",
  primaryColor = breakType === "regular" ? "#6366f1" : "#8b5cf6",
  label = breakType === "regular" ? "NEED A BREAK" : "BATHROOM BREAK",
  showIcon = true,
  className = "",
  onBreakStart,
  onBreakEnd,
  duration,
}: BreakTimerButtonProps) {
  const [showBreak, setShowBreak] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const startBreak = () => {
    setShowBreak(true)
    onBreakStart?.()
  }

  const endBreak = () => {
    setShowBreak(false)
    onBreakEnd?.()
  }

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  const iconVariants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: 15, 
      transition: { 
        repeat: Infinity, 
        repeatType: "reverse" as const, 
        duration: 1 
      } 
    }
  }

  const pulseVariants = {
    initial: { opacity: 0.7, scale: 1 },
    animate: { 
      opacity: [0.7, 1, 0.7], 
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity, 
        duration: 2
      }
    }
  }

  const Icon = breakType === "regular" ? Clock : Coffee

  return (
    <>
      <motion.button
        onClick={startBreak}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors bg-opacity-20 border border-opacity-30 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative ${className}`}
        style={{
          backgroundColor: `${primaryColor}20`,
          borderColor: `${primaryColor}30`,
          color: primaryColor,
        }}
        aria-label={label}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Background pulse effect */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 rounded-full" 
            style={{ backgroundColor: primaryColor }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
        )}
        
        <div className="relative z-10 flex items-center gap-2">
          {showIcon && (
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate={isHovered ? "hover" : "initial"}
            >
              <Icon size={16} />
            </motion.div>
          )}
          <span className="text-sm font-medium">{label}</span>
        </div>
      </motion.button>

      {showBreak && breakType === "regular" && (
        <NeedABreak 
          primaryColor={primaryColor} 
          onComplete={endBreak} 
          onCancel={endBreak}
        />
      )}

      {showBreak && breakType === "bathroom" && (
        <BathroomBreak 
          primaryColor={primaryColor} 
          onComplete={endBreak} 
          onCancel={endBreak}
        />
      )}
    </>
  )
}

// Combined button that has a dropdown to select the type of break
export function BreakTimerCombinedButton({
  regularColor = "#6366f1",
  bathroomColor = "#8b5cf6",
  className = "",
  onBreakStart,
  onBreakEnd,
}: {
  regularColor?: string,
  bathroomColor?: string,
  className?: string,
  onBreakStart?: (type: "regular" | "bathroom") => void,
  onBreakEnd?: (type: "regular" | "bathroom") => void,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showRegularBreak, setShowRegularBreak] = useState(false)
  const [showBathroomBreak, setShowBathroomBreak] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const startRegularBreak = () => {
    setShowRegularBreak(true)
    onBreakStart?.("regular")
    setIsOpen(false)
  }

  const startBathroomBreak = () => {
    setShowBathroomBreak(true)
    onBreakStart?.("bathroom")
    setIsOpen(false)
  }

  const endRegularBreak = () => {
    setShowRegularBreak(false)
    onBreakEnd?.("regular")
  }

  const endBathroomBreak = () => {
    setShowBathroomBreak(false)
    onBreakEnd?.("bathroom")
  }

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  const menuVariants = {
    closed: { 
      opacity: 0,
      y: -10,
      pointerEvents: "none" as const,
      transitionEnd: {
        display: "none" as const
      }
    },
    open: { 
      opacity: 1,
      y: 0,
      display: "flex" as const,
      pointerEvents: "auto" as const
    }
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={toggleDropdown}
        className="px-4 py-2 rounded-full flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-background transition"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <span className="text-sm font-medium">TAKE A BREAK</span>
      </motion.button>

      <motion.div
        className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-w-[200px] flex flex-col z-10"
        variants={menuVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          onClick={startRegularBreak}
          className="flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          whileHover={{ x: 4 }}
        >
          <Clock size={16} className="text-indigo-500" />
          <span>Need a Break (5m)</span>
        </motion.button>
        
        <motion.button
          onClick={startBathroomBreak}
          className="flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          whileHover={{ x: 4 }}
        >
          <Coffee size={16} className="text-purple-500" />
          <span>Bathroom Break (2m)</span>
        </motion.button>
        
        <motion.button
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-600"
          whileHover={{ x: 4 }}
        >
          <X size={16} className="text-gray-500" />
          <span>Cancel</span>
        </motion.button>
      </motion.div>

      {showRegularBreak && (
        <NeedABreak 
          primaryColor={regularColor} 
          onComplete={endRegularBreak} 
          onCancel={endRegularBreak} 
        />
      )}

      {showBathroomBreak && (
        <BathroomBreak 
          primaryColor={bathroomColor} 
          onComplete={endBathroomBreak} 
          onCancel={endBathroomBreak} 
        />
      )}
    </div>
  )
} 