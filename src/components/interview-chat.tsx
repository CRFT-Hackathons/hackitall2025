"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  Clock,
  Coffee,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecordingButton } from "./voice-recording-button";
import { transcribeAudio } from "../app/backend/stt-integration";
import { translateText } from "../app/backend/translation";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "candidate";
  content: string;
}

interface InterviewChatProps {
  candidateName: string;
  title: string;
  className: string;
  messageClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  initialMessages?: Message[];
  languageCode?: string;
}

export function InterviewChat({
  candidateName = "Candidate",
  title,
  className = "",
  messageClassName = "",
  inputClassName = "",
  buttonClassName = "",
  placeholder = "Type your response...",
  initialMessages = [],
  languageCode = "ro-RO",
}: InterviewChatProps) {
  // Custom animation styles
  const customAnimationStyles = `
    @keyframes pulse-fade {
      0% {
        transform: scale(1);
        opacity: 0.9;
      }
      100% {
        transform: scale(2.2);
        opacity: 0;
      }
    }
    
    .animate-pulse-fade {
      animation: pulse-fade 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes countdown {
      0% {
        stroke-dashoffset: 0;
      }
      100% {
        stroke-dashoffset: 100;
      }
    }
    
    .animate-countdown {
      animation: countdown 3s linear infinite;
    }
  `;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeoutActive, setTimeoutActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [bathroomTimeoutActive, setBathroomTimeoutActive] = useState(false);
  const [bathroomTimeLeft, setBathroomTimeLeft] = useState(120); // 2 minutes
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingMaxTime = 60; // 60 seconds maximum recording time
  
  // For audio recording
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Scroll to bottom when messages change or when typing
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, input, isTyping]);

  // Handle timeout countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let bathroomTimer: NodeJS.Timeout;

    if (timeoutActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimeoutActive(false);
      setIsPaused(false);
      // Could add toast notification here
    }

    if (bathroomTimeoutActive && bathroomTimeLeft > 0) {
      bathroomTimer = setInterval(() => {
        setBathroomTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (bathroomTimeLeft === 0) {
      setBathroomTimeoutActive(false);
      setIsPaused(false);
      // Could add toast notification here
    }

    return () => {
      clearInterval(timer);
      clearInterval(bathroomTimer);
    };
  }, [timeoutActive, timeLeft, bathroomTimeoutActive, bathroomTimeLeft]);

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set isTyping based on input state
  useEffect(() => {
    if (input.trim()) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [input]);
  
  // Clean up MediaRecorder on unmount
  useEffect(() => {
    return () => {
      // Clean up media recorder
      if (mediaRecorder.current && isRecording) {
        const tracks = mediaRecorder.current.stream?.getTracks();
        tracks?.forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  // Handle recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRecording && recordingTime < recordingMaxTime) {
      timer = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= recordingMaxTime) {
            // Auto-stop recording when max time is reached
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [isRecording, recordingTime]);

  // Voice input functionality
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };
  
  const startRecording = async () => {
    // Reset recording time
    setRecordingTime(0);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        setTranscriptionError(null);

        try {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          const reader = new FileReader();

          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(",")[1];
              
              // First, transcribe the audio in the original language
              toast.info("Transcribing audio...");
              const transcription = await transcribeAudio(
                base64Audio,
                languageCode
              );

              if (transcription) {
                // If Romanian, translate to English for input to the chat
                let processedText = transcription;
                
                if (languageCode === "ro-RO") {
                  toast.info("Translating to English...");
                  const translatedText = await translateText(transcription, "ro", "en");
                  if (translatedText) {
                    processedText = translatedText;
                    toast.success("Translation successful");
                  } else {
                    toast.warning("Translation failed, using original transcription");
                  }
                }
                
                // Add the transcribed/translated text to the input field
                setInput(prev => prev ? `${prev} ${processedText}` : processedText);
                toast.success("Voice input processed successfully");
              } else {
                setTranscriptionError("No transcription received");
                toast.error(
                  "Could not transcribe your speech. Please try again."
                );
              }
            } catch (err) {
              console.error("Transcription processing error:", err);
              setTranscriptionError("Transcription failed");
              toast.error("Failed to process speech. Please try again.");
            } finally {
              setIsProcessing(false);
            }
          };

          reader.readAsDataURL(audioBlob);
          // Reset the chunks for the next recording
          audioChunks.current = [];
        } catch (err) {
          console.error("Audio processing error:", err);
          setTranscriptionError("Audio processing failed");
          toast.error("Audio processing failed. Please try again.");
          setIsProcessing(false);
        }
      };

      // Start recording
      mediaRecorder.current.start();
      setIsRecording(true);
      setTranscriptionError(null);
      toast.info("Recording started. Speak now...");
    } catch (err) {
      console.error("Microphone access error:", err);
      setTranscriptionError("Microphone access denied");
      toast.error("Microphone access denied. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setRecordingTime(0); // Reset the recording time
      toast.info("Processing your voice input...");
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const activateTimeout = () => {
    setTimeoutActive(true);
    setIsPaused(true);
  };

  const activateBathroomTimeout = () => {
    setBathroomTimeoutActive(true);
    setIsPaused(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isPaused) {
      // Add candidate message
      const candidateMessage = {
        id: String(Date.now()),
        role: "candidate",
        content: input.trim(),
      };
      setMessages((prev) => [...prev, candidateMessage as Message]);
      setInput("");
      setIsTyping(false);
      // No turn switching - always remain as the candidate
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`flex flex-col h-[500px] rounded-lg border-2 border-gray-200 dark:border-gray-800 relative ${className}`}
    >
      {/* Add custom animation styles */}
      <style dangerouslySetInnerHTML={{ __html: customAnimationStyles }} />
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-medium">{title}</h2>
        <div className="text-sm text-gray-500">
          You are responding as: {candidateName}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex justify-end ${messageClassName}`}
          >
            <div className="max-w-[80%] rounded-lg px-4 py-2 backdrop-blur-sm bg-primary text-primary-foreground">
              <div className="text-xs opacity-70 mb-1">{candidateName}</div>
              {message.content}
            </div>
          </div>
        ))}

        {/* Real-time typing indicator */}
        {isTyping && input.trim() && (
          <div className={`flex justify-end ${messageClassName}`}>
            <div className="max-w-[80%] rounded-lg px-4 py-2 backdrop-blur-sm bg-primary text-primary-foreground opacity-80">
              <div className="text-xs opacity-70 mb-1">{candidateName}</div>
              {input}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                |
              </motion.span>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary text-primary-foreground bg-opacity-80 flex items-center space-x-2">
              <div
                className="flex justify-center items-end h-5 gap-[2px]"
                aria-label="Audio visualization"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[2px] bg-current rounded-full"
                    initial={{ height: 3 }}
                    animate={{
                      height: [3, Math.random() * 12 + 3, 3],
                      transition: {
                        repeat: Infinity,
                        duration: 1,
                        delay: i * 0.05,
                        ease: "easeInOut",
                      },
                    }}
                  />
                ))}
              </div>
              <span>Recording audio...</span>
            </div>
          </div>
        )}
        
        {transcriptionError && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/30">
              <AlertCircle className="h-4 w-4 inline-block mr-2" />
              Error: {transcriptionError}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2 relative"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={isPaused ? "Interview paused..." : placeholder}
          className={`flex-1 px-4 py-2 rounded-md border border-indigo-300 dark:border-indigo-700 bg-background 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 
          shadow-sm focus:shadow-md focus:shadow-indigo-300 dark:focus:shadow-indigo-900/30
          transition-all duration-200 ${inputClassName}`}
          aria-label="Type your response"
          disabled={isPaused}
        />

        <div className="flex gap-2">
          {/* Original Voice Recording Button with animation */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isProcessing || isPaused}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={`relative p-2 rounded-md ${
              isRecording
                ? "bg-indigo-500/20 text-indigo-500 border border-indigo-400/50 hover:bg-indigo-500/30"
                : "bg-indigo-500/20 text-indigo-600 border border-indigo-300/30 hover:bg-indigo-500/30"
            } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isRecording ? (
              <div className="relative flex items-center justify-center">
                <MicOff className="h-5 w-5 z-10 text-indigo-500" />
                <div className="absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30"></div>
                
                {/* Circle progress animation */}
                <svg className="absolute -inset-2 w-[34px] h-[34px] -rotate-90" aria-hidden="true">
                  {/* Background circle (always full) */}
                  <circle
                    cx="17"
                    cy="17"
                    r="14"
                    stroke="#8b5cf620"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  {/* Foreground circle (animates) */}
                  <circle
                    key={`recording-${Date.now()}`}
                    cx="17"
                    cy="17"
                    r="14"
                    stroke="#8b5cf6"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={0}
                    className="transition-all duration-1000"
                  >
                    <animate 
                      attributeName="stroke-dashoffset" 
                      from="0" 
                      to={2 * Math.PI * 14} 
                      dur="60s" 
                      fill="freeze" 
                      calcMode="linear"
                    />
                  </circle>
                </svg>
                
                {/* Pulse animations */}
                <div className="absolute rounded-full border-2 border-indigo-500/40 animate-pulse-fade h-8 w-8"></div>
                <div className="absolute rounded-full border-2 border-indigo-500/20 animate-pulse-fade h-8 w-8" style={{ animationDelay: '400ms' }}></div>
              </div>
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isPaused}
            className={`rounded-xl bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 
            text-white px-5 py-2 flex items-center justify-center transition-colors 
            disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Pause controls */}
      {isPaused && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
          <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl shadow-xl w-72 space-y-5">
            <h3 className="text-xl font-semibold text-center">
              Interview Paused
            </h3>

            {timeoutActive && (
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <div className="text-2xl font-bold text-amber-500">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Time remaining until resume
                </div>
              </div>
            )}

            {bathroomTimeoutActive && (
              <div className="text-center">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <div className="text-2xl font-bold text-amber-500">
                  {formatTime(bathroomTimeLeft)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Bathroom break remaining
                </div>
              </div>
            )}

            {!timeoutActive && !bathroomTimeoutActive && (
              <div className="flex justify-center">
                <button
                  onClick={togglePause}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Resume Interview</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
