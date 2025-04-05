"use client";

import { Loader2, Mic, StopCircle } from "lucide-react";
import { useEffect, useState } from "react";

// Custom styles for the pulsing mic animation
const pulseMicStyles = `
  @keyframes ping {
    0% {
      transform: scale(0.7);
      opacity: 0.8;
    }
    70% {
      transform: scale(2.2);
      opacity: 0;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
  
  .animate-ping-delay-200 {
    animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
    animation-delay: 200ms;
  }
  
  .animate-ping-delay-400 {
    animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
    animation-delay: 400ms;
  }
  
  @keyframes pulse-scale {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
  }
  
  .animate-pulse-scale {
    animation: pulse-scale 1s ease-in-out infinite;
  }
`;

interface VoiceRecordingButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export function VoiceRecordingButton({
  isRecording,
  isProcessing,
  isDisabled = false,
  onClick
}: VoiceRecordingButtonProps) {
  // Ensure client-side only rendering
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="relative">
      {/* Add custom styles */}
      <style dangerouslySetInnerHTML={{ __html: pulseMicStyles }} />
      
      {/* Button */}
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`relative rounded-xl border z-10 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 transition-colors flex items-center ${
          isRecording
            ? "text-red-600 dark:text-red-400 border-red-400 dark:border-red-600"
            : "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
        } ${
          isDisabled
            ? "opacity-70 cursor-not-allowed"
            : ""
        }`}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 inline-block animate-spin" />
        ) : isRecording ? (
          <div className="relative mr-2 flex items-center justify-center w-5 h-5">
            {/* Semi-transparent background circle */}
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full"></div>
            
            {/* The microphone icon */}
            <Mic className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse-scale relative z-10" />
            
            {/* Wave rings */}
            <div className="absolute inset-0 rounded-full border border-red-400/60 dark:border-red-600/60 animate-ping"></div>
            <div className="absolute -inset-1 rounded-full border border-red-400/40 dark:border-red-600/40 animate-ping-delay-200"></div>
            <div className="absolute -inset-2 rounded-full border border-red-400/20 dark:border-red-600/20 animate-ping-delay-400"></div>
          </div>
        ) : (
          <Mic className="h-4 w-4 mr-2 inline-block" />
        )}
        {isProcessing
          ? "Processing..."
          : isRecording
          ? "Stop Recording"
          : "Voice Input"}
      </button>
    </div>
  );
} 