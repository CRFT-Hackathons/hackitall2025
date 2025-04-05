"use client";

import { useState } from "react";
import { Clock, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { NeedABreak, BathroomBreak } from "@/components/break-timer";

export interface BreakButtonsProps {
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Primary color for buttons and timers
   */
  primaryColor?: string;
  /**
   * Secondary color for buttons and timers
   */
  secondaryColor?: string;
  /**
   * Callback function when a break starts
   */
  onBreakStart?: (type: "regular" | "bathroom") => void;
  /**
   * Callback function when a break ends
   */
  onBreakEnd?: (type: "regular" | "bathroom") => void;
}

export function BreakButtons({
  className = "",
  primaryColor = "#6366f1",
  secondaryColor = "#8b5cf6",
  onBreakStart,
  onBreakEnd,
}: BreakButtonsProps) {
  const [showRegularBreak, setShowRegularBreak] = useState(false);
  const [showBathroomBreak, setShowBathroomBreak] = useState(false);
  const [isRegularHovered, setIsRegularHovered] = useState(false);
  const [isBathroomHovered, setIsBathroomHovered] = useState(false);

  const startRegularBreak = () => {
    setShowRegularBreak(true);
    onBreakStart?.("regular");
  };

  const startBathroomBreak = () => {
    setShowBathroomBreak(true);
    onBreakStart?.("bathroom");
  };

  const endRegularBreak = () => {
    setShowRegularBreak(false);
    onBreakEnd?.("regular");
  };

  const endBathroomBreak = () => {
    setShowBathroomBreak(false);
    onBreakEnd?.("bathroom");
  };

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    disabled: { scale: 1, opacity: 0.5 },
  };

  const iconVariants = {
    initial: { rotate: 0 },
    hover: {
      rotate: 15,
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 1,
      },
    },
  };

  const pulseVariants = {
    initial: { opacity: 0.7, scale: 1 },
    animate: {
      opacity: [0.7, 1, 0.7],
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        duration: 2,
      },
    },
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <motion.button
        onClick={startRegularBreak}
        disabled={showRegularBreak || showBathroomBreak}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors bg-opacity-20 border border-opacity-30 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f13] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative`}
        style={{
          backgroundColor: `${primaryColor}20`,
          borderColor: `${primaryColor}30`,
          color: primaryColor,
        }}
        aria-label="Take a 5-minute break"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={showRegularBreak || showBathroomBreak ? "disabled" : "initial"}
        onHoverStart={() => setIsRegularHovered(true)}
        onHoverEnd={() => setIsRegularHovered(false)}
      >
        {/* Background pulse effect */}
        {isRegularHovered && !showRegularBreak && !showBathroomBreak && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: primaryColor }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
        )}

        <div className="relative z-10 flex items-center gap-2">
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate={
              isRegularHovered && !showRegularBreak && !showBathroomBreak
                ? "hover"
                : "initial"
            }
          >
            <Clock size={16} />
          </motion.div>
          <span className="text-sm font-medium">NEED A BREAK</span>
        </div>
      </motion.button>

      <motion.button
        onClick={startBathroomBreak}
        disabled={showRegularBreak || showBathroomBreak}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors bg-opacity-20 border border-opacity-30 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f13] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative`}
        style={{
          backgroundColor: `${secondaryColor}20`,
          borderColor: `${secondaryColor}30`,
          color: secondaryColor,
        }}
        aria-label="Take a 2-minute bathroom break"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={showRegularBreak || showBathroomBreak ? "disabled" : "initial"}
        onHoverStart={() => setIsBathroomHovered(true)}
        onHoverEnd={() => setIsBathroomHovered(false)}
      >
        {/* Background pulse effect */}
        {isBathroomHovered && !showRegularBreak && !showBathroomBreak && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: secondaryColor }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
        )}

        <div className="relative z-10 flex items-center gap-2">
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate={
              isBathroomHovered && !showRegularBreak && !showBathroomBreak
                ? "hover"
                : "initial"
            }
          >
            <Coffee size={16} />
          </motion.div>
          <span className="text-sm font-medium">BATHROOM BREAK</span>
        </div>
      </motion.button>

      {showRegularBreak && (
        <NeedABreak
          primaryColor={primaryColor}
          onComplete={endRegularBreak}
          onCancel={endRegularBreak}
        />
      )}

      {showBathroomBreak && (
        <BathroomBreak
          primaryColor={secondaryColor}
          onComplete={endBathroomBreak}
          onCancel={endBathroomBreak}
        />
      )}
    </div>
  );
}
