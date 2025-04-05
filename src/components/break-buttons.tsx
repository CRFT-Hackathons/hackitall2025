"use client"

import { useState } from "react"
import { Clock, Coffee } from "lucide-react"
import { NeedABreak, BathroomBreak } from "./break-timer"

export interface BreakButtonsProps {
  /**
   * Custom class name for the container
   */
  className?: string
  /**
   * Primary color for buttons and timers
   */
  primaryColor?: string
  /**
   * Secondary color for buttons and timers
   */
  secondaryColor?: string
  /**
   * Callback function when a break starts
   */
  onBreakStart?: (type: "regular" | "bathroom") => void
  /**
   * Callback function when a break ends
   */
  onBreakEnd?: (type: "regular" | "bathroom") => void
}

export function BreakButtons({
  className = "",
  primaryColor = "#6366f1",
  secondaryColor = "#8b5cf6",
  onBreakStart,
  onBreakEnd,
}: BreakButtonsProps) {
  const [showRegularBreak, setShowRegularBreak] = useState(false)
  const [showBathroomBreak, setShowBathroomBreak] = useState(false)

  const startRegularBreak = () => {
    setShowRegularBreak(true)
    onBreakStart?.("regular")
  }

  const startBathroomBreak = () => {
    setShowBathroomBreak(true)
    onBreakStart?.("bathroom")
  }

  const endRegularBreak = () => {
    setShowRegularBreak(false)
    onBreakEnd?.("regular")
  }

  const endBathroomBreak = () => {
    setShowBathroomBreak(false)
    onBreakEnd?.("bathroom")
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <button
        onClick={startRegularBreak}
        disabled={showRegularBreak || showBathroomBreak}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors bg-opacity-20 border border-opacity-30 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f13] disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{
          backgroundColor: `${primaryColor}20`,
          borderColor: `${primaryColor}30`,
          color: primaryColor,
        }}
        aria-label="Take a 5-minute break"
      >
        <Clock size={16} />
        <span className="text-sm">NEED A BREAK</span>
      </button>

      <button
        onClick={startBathroomBreak}
        disabled={showRegularBreak || showBathroomBreak}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors bg-opacity-20 border border-opacity-30 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f13] disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{
          backgroundColor: `${secondaryColor}20`,
          borderColor: `${secondaryColor}30`,
          color: secondaryColor,
        }}
        aria-label="Take a 2-minute bathroom break"
      >
        <Coffee size={16} />
        <span className="text-sm">BATHROOM BREAK</span>
      </button>

      {showRegularBreak && (
        <NeedABreak onComplete={endRegularBreak} onCancel={endRegularBreak} />
      )}

      {showBathroomBreak && (
        <BathroomBreak onComplete={endBathroomBreak} onCancel={endBathroomBreak} />
      )}
    </div>
  )
}

