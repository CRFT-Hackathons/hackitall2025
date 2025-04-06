"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VolumeIcon, VolumeX } from "lucide-react";
import { speakText, stopSpeaking } from "@/lib/text-to-speech";

interface SpeechTextProps {
  text: string;
  className?: string;
  buttonClassName?: string;
  rate?: number;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function SpeechText({
  text,
  className = "",
  buttonClassName = "",
  rate = 1,
  showIcon = true,
  children
}: SpeechTextProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        stopSpeaking();
      }
    };
  }, [isSpeaking]);
  
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text, { rate });

      // The speech API doesn't always fire onend events reliably,
      // so we add a safety timeout based on text length
      const wordsPerMinute = 150 * rate;
      const words = text.split(' ').length;
      const estimatedDuration = (words / wordsPerMinute) * 60 * 1000;
      
      // Add 2 seconds buffer
      setTimeout(() => {
        setIsSpeaking(false);
      }, estimatedDuration + 2000);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {children || <span>{text}</span>}
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggleSpeech}
        className={`rounded-full p-1.5 h-auto ${buttonClassName} ${
          showIcon ? "ml-1" : "sr-only"
        }`}
        aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
        title={isSpeaking ? "Stop speaking" : "Read aloud"}
      >
        {isSpeaking ? (
          <VolumeX className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <VolumeIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
        )}
      </Button>
    </div>
  );
} 