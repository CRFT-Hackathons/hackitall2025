"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  AlertCircle,
  Maximize2,
  Loader2,
  StopCircle,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { transcribeAudio } from "../app/backend/stt-integration";
import { synthesizeSpeech } from "../app/backend/tts-integration";
import { toast } from "sonner";
import Image from "next/image";
import { VoiceRecordingButton } from "./voice-recording-button";

// Add TypeScript definitions for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition?: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new(): SpeechRecognition;
    };
  }
}

interface Question {
  id: string | number;
  title: string;
  description: string;
  required?: boolean;
  image?: string;
}

interface QuestionnaireProps {
  /**
   * Array of questions to display
   */
  questions: Question[];
  /**
   * Callback when questionnaire is submitted
   */
  onSubmit?: (answers: Record<string, string>) => void;
  /**
   * Callback when a question is answered
   */
  onQuestionAnswered?: (questionId: string | number, answer: string) => void;
  /**
   * Callback when the current question changes
   */
  onQuestionChange?: (index: number) => void;
  /**
   * Class name for the container
   */
  className?: string;
  /**
   * Whether to show progress
   */
  showProgress?: boolean;
  /**
   * Language code for speech recognition and synthesis
   */
  languageCode?: string;
  /**
   * Initial answers to populate the questionnaire with
   */
  initialAnswers?: Record<string, string>;
}

export function Questionnaire({
  questions,
  onSubmit,
  onQuestionAnswered,
  onQuestionChange,
  className = "",
  showProgress = true,
  languageCode = "en-US",
  initialAnswers = {},
}: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Initialize answers directly from initialAnswers prop to ensure it's always in sync
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  
  console.log("Questionnaire rendered with initialAnswers:", initialAnswers);
  
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize with current value from localStorage, default to 1.0 if not set
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  
  // Set up speech rate once the component is mounted on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRate = localStorage.getItem("speechRate");
      if (storedRate) {
        setSpeechRate(parseFloat(storedRate));
      }
    }
  }, []);

  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);

  // Helper function to get all saved answers from localStorage
  const getSavedAnswersFromLocalStorage = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    
    try {
      // Create a result object to store all found answers
      const savedAnswers: Record<string, string> = {};
      let directAnswersCount = 0;
      
      // 1. Try to get individual question answers first (most specific)
      questions.forEach(question => {
        const savedAnswer = localStorage.getItem(`questionnaire_answer_${question.id}`);
        if (savedAnswer) {
          savedAnswers[question.id] = savedAnswer;
          directAnswersCount++;
        }
      });
      
      if (directAnswersCount > 0) {
        console.log(`Found ${directAnswersCount} direct answers in localStorage`);
      }
      
      // 2. If we didn't find any individual answers, try the JSON backup
      if (Object.keys(savedAnswers).length === 0) {
        const savedAnswersJson = localStorage.getItem('questionnaire_all_answers');
        if (savedAnswersJson) {
          const parsedAnswers = JSON.parse(savedAnswersJson);
          let jsonAnswersCount = 0;
          
          // Merge with any answers we already found
          Object.entries(parsedAnswers).forEach(([id, value]) => {
            if (!savedAnswers[id] && typeof value === 'string') {
              savedAnswers[id] = value;
              jsonAnswersCount++;
            }
          });
          
          if (jsonAnswersCount > 0) {
            console.log(`Found ${jsonAnswersCount} answers in JSON backup`);
          }
        }
      }
      
      return savedAnswers;
    } catch (error) {
      console.error("Error getting saved answers from localStorage:", error);
      return {};
    }
  };

  // Set isClient to true after component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    
    // Load saved answers directly from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        // Get all saved answers from localStorage
        const savedAnswers = getSavedAnswersFromLocalStorage();
        
        // Combine with initialAnswers prop, prioritizing localStorage answers
        const combinedAnswers = { ...initialAnswers, ...savedAnswers };
        
        // If we found answers, update the state
        if (Object.keys(combinedAnswers).length > 0) {
          console.log("Setting combined answers:", combinedAnswers);
          setAnswers(combinedAnswers);
          
          // If we're on a question with a saved answer, update currentAnswer too
          if (currentQuestion && combinedAnswers[currentQuestion.id]) {
            setCurrentAnswer(combinedAnswers[currentQuestion.id]);
          }
        }
      } catch (error) {
        console.error("Error loading answers from localStorage:", error);
      } finally {
        // Mark initialization as complete
        console.log("Component initialization complete");
      }
    }
    
    // Initialize speech recognition if available
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
          setIsSpeaking(true);
        };
        
        recognition.onend = () => {
          setIsSpeaking(false);
        };
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const results = Array.from(event.results);
          const transcript = results
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          const currentQuestionId = questions[currentIndex]?.id;
          if (currentQuestionId) {
            const updatedAnswer = answers[currentQuestionId] ? 
              `${answers[currentQuestionId]} ${transcript}` : 
              transcript;
            
            setAnswers(prev => ({ ...prev, [currentQuestionId]: updatedAnswer }));
            onQuestionAnswered?.(currentQuestionId, updatedAnswer);
          }
        };
        
        setSpeechRecognition(recognition);
      }
    }
    
    // Clean up speech recognition on unmount
    return () => {
      if (speechRecognition) {
        try {
          speechRecognition.stop();
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
        }
      }
    };
  }, [isClient]);

  // Get current question
  const currentQuestion = questions[currentIndex];

  // Update answers when initialAnswers changes
  useEffect(() => {
    if (Object.keys(initialAnswers).length > 0) {
      console.log("Updating answers from changed initialAnswers:", initialAnswers);
      setAnswers(initialAnswers);
      
      // Make sure the currentAnswer is set if we're on a question with an answer
      if (currentQuestion && initialAnswers[currentQuestion.id]) {
        setCurrentAnswer(initialAnswers[currentQuestion.id]);
      }
    }
  }, [initialAnswers]);

  // Notify parent component when current question changes and sync modal answer
  useEffect(() => {
    onQuestionChange?.(currentIndex);
    
    // Sync modal index with current index when current index changes
    setModalIndex(currentIndex);
    
    // If we have an answer for this question, update the currentAnswer
    if (currentQuestion && answers[currentQuestion.id]) {
      setCurrentAnswer(answers[currentQuestion.id]);
    } else {
      setCurrentAnswer("");
    }
    
    console.log(`Changed to question ${currentIndex}:`, 
      currentQuestion?.id, 
      answers[currentQuestion?.id] ? `has answer: ${answers[currentQuestion?.id].substring(0, 20)}...` : 'no answer'
    );
  }, [currentIndex, onQuestionChange, currentQuestion, answers]);

  // Clean up MediaRecorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && isRecording) {
        const tracks = mediaRecorder.current.stream?.getTracks();
        tracks?.forEach((track) => track.stop());
      }

      // Clean up audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isRecording]);

  // Listen for changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "speechRate" && e.newValue) {
        setSpeechRate(parseFloat(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === "speechRate" && e.detail?.value) {
        setSpeechRate(parseFloat(e.detail.value));
      }
    };

    window.addEventListener(
      "localStorage",
      handleCustomStorageChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorage",
        handleCustomStorageChange as EventListener
      );
    };
  }, []);

  // Also check for localStorage changes whenever the component is focused
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleFocus = () => {
      const storedRate = localStorage.getItem("speechRate");
      if (storedRate) {
        const parsedRate = parseFloat(storedRate);
        if (parsedRate !== speechRate) {
          setSpeechRate(parsedRate);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [speechRate]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onSubmit?.(answers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Helper function to save an answer to localStorage
  const saveLocalStorageAnswer = (questionId: string | number, answer: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Save direct question answer and timestamp
      localStorage.setItem(`questionnaire_answer_${questionId}`, answer);
      localStorage.setItem(`questionnaire_answer_${questionId}_timestamp`, new Date().toISOString());
      
      // Get the current answers state with the new answer included
      const updatedAnswers = { ...answers, [questionId]: answer };
      
      // Update the JSON backup with all answers
      localStorage.setItem('questionnaire_all_answers', JSON.stringify(updatedAnswers));
      localStorage.setItem('questionnaire_all_answers_timestamp', new Date().toISOString());
      
      console.log(`Saved answer for ${questionId} to localStorage:`, answer.substring(0, 20));
      console.log('Updated questionnaire_all_answers:', updatedAnswers);
    } catch (error) {
      console.error("Error saving answer to localStorage:", error);
    }
  };

  // Helper function to fully remove an answer from localStorage
  const removeLocalStorageAnswer = (questionId: string | number) => {
    if (typeof window === 'undefined') return;
    
    try {
      console.log(`Removing answer for question ${questionId} from localStorage`);
      
      // 1. Remove direct question answer and timestamp
      localStorage.removeItem(`questionnaire_answer_${questionId}`);
      localStorage.removeItem(`questionnaire_answer_${questionId}_timestamp`);
      
      // 2. Update the JSON backup without this answer
      try {
        const savedAnswersJson = localStorage.getItem('questionnaire_all_answers');
        if (savedAnswersJson) {
          const allAnswers = JSON.parse(savedAnswersJson);
          if (allAnswers[questionId]) {
            delete allAnswers[questionId];
            localStorage.setItem('questionnaire_all_answers', JSON.stringify(allAnswers));
            localStorage.setItem('questionnaire_all_answers_timestamp', new Date().toISOString());
            console.log('Updated questionnaire_all_answers after deletion');
          }
        }
      } catch (jsonError) {
        console.error("Error updating JSON backup when removing answer:", jsonError);
      }
      
      // 3. Update any in-progress session data
      try {
        const responsesStr = localStorage.getItem('questionnaireResponses');
        if (responsesStr) {
          const responses = JSON.parse(responsesStr);
          
          // Check all sessions and remove the answer from any that have it
          let updatedAnySession = false;
          
          Object.entries(responses).forEach(([sessionId, sessionData]: [string, any]) => {
            if (sessionData.answers && sessionData.answers[questionId]) {
              delete sessionData.answers[questionId];
              updatedAnySession = true;
            }
          });
          
          if (updatedAnySession) {
            localStorage.setItem('questionnaireResponses', JSON.stringify(responses));
            console.log('Updated session data after answer deletion');
          }
        }
      } catch (sessionError) {
        console.error("Error updating session data when removing answer:", sessionError);
      }
    } catch (error) {
      console.error("Error removing answer from localStorage:", error);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const answer = e.target.value;
    
    // Update state
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      saveLocalStorageAnswer(currentQuestion.id, answer);
    }
    
    // Notify parent
    onQuestionAnswered?.(currentQuestion.id, answer);
  };

  const toggleSpeechRecognition = () => {
    if (!speechRecognition) return;
    
    if (isSpeaking) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
  };

  const openQuestionModal = (index: number) => {
    setModalIndex(index);
    setCurrentAnswer(answers[questions[index].id] || "");
    setShowModal(true);
  };

  const saveModalAnswer = () => {
    const questionId = questions[modalIndex].id;
    
    // Update state
    setAnswers((prev) => ({ ...prev, [questionId]: currentAnswer }));
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      saveLocalStorageAnswer(questionId, currentAnswer);
    }
    
    // Notify parent
    onQuestionAnswered?.(questionId, currentAnswer);
    
    // Go to next question or close modal
    if (modalIndex < questions.length - 1) {
      setModalIndex(modalIndex + 1);
      setCurrentAnswer(answers[questions[modalIndex + 1].id] || "");
      
      // Sync the main view with the modal navigation
      setCurrentIndex(modalIndex + 1);
    } else {
      setShowModal(false);
    }
  };

  const navigateModalQuestion = (direction: "next" | "prev") => {
    // Save current answer first
    const questionId = questions[modalIndex].id;
    
    // Update state
    setAnswers((prev) => ({ ...prev, [questionId]: currentAnswer }));
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      saveLocalStorageAnswer(questionId, currentAnswer);
    }
    
    // Notify parent
    onQuestionAnswered?.(questionId, currentAnswer);

    if (direction === "next" && modalIndex < questions.length - 1) {
      const nextIndex = modalIndex + 1;
      setModalIndex(nextIndex);
      setCurrentAnswer(answers[questions[nextIndex].id] || "");
      setCurrentIndex(nextIndex);
    } else if (direction === "prev" && modalIndex > 0) {
      const prevIndex = modalIndex - 1;
      setModalIndex(prevIndex);
      setCurrentAnswer(answers[questions[prevIndex].id] || "");
      setCurrentIndex(prevIndex);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Voice input functionality
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
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
              const transcription = await transcribeAudio(
                base64Audio,
                languageCode
              );

              if (transcription) {
                const currentAnswerText = answers[currentQuestion.id] || "";
                const newAnswer = currentAnswerText
                  ? `${currentAnswerText}\n${transcription}`
                  : transcription;

                setAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.id]: newAnswer,
                }));
                onQuestionAnswered?.(currentQuestion.id, newAnswer);
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
            }
          };

          reader.readAsDataURL(audioBlob);
          // Reset the chunks for the next recording
          audioChunks.current = [];
        } catch (err) {
          console.error("Audio processing error:", err);
          setTranscriptionError("Audio processing failed");
          toast.error("Audio processing failed. Please try again.");
        } finally {
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
      toast.info("Processing your voice input...");
    }
  };

  // Play question using text-to-speech
  const playQuestionAudio = async () => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlayingAudio(false);
      }
      return;
    }

    try {
      setIsTtsLoading(true);
      let currentSpeechRate = 1.0;
      
      if (typeof window !== 'undefined') {
        const storedRate = localStorage.getItem("speechRate");
        if (storedRate) {
          currentSpeechRate = parseFloat(storedRate);
        }
      }
      
      const textToRead = `${currentQuestion.title}. ${currentQuestion.description}`;
      const audioUrl = await synthesizeSpeech(
        textToRead,
        languageCode,
        currentSpeechRate
      );

      if (!audioUrl) {
        throw new Error("Failed to generate speech");
      }

      audioUrlRef.current = audioUrl;
      console.log("Audio URL received:", audioUrl);
      audioRef.current = new Audio(audioUrl);

      audioRef.current.addEventListener("ended", () => {
        console.log("Audio playback ended");
        setIsPlayingAudio(false);
      });

      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        toast.error("Error playing audio");
        setIsPlayingAudio(false);
        audioRef.current = null;
      });

      console.log("Attempting to play audio");
      await audioRef.current.play();
      console.log("Audio playback started");
      setIsPlayingAudio(true);
      toast.success("Playing question audio");
    } catch (error) {
      console.error("Text-to-speech error:", error);
      toast.error("Failed to generate or play audio");
      audioUrlRef.current = null;
    } finally {
      setIsTtsLoading(false);
    }
  };

  useEffect(() => {
    audioUrlRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
  }, [currentIndex]);

  // Add a ref to the textarea for debugging
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Debug effect to check if the answers are being correctly displayed
  useEffect(() => {
    if (isClient && currentQuestion && textareaRef.current) {
      const expectedValue = answers[currentQuestion.id] || "";
      const actualValue = textareaRef.current.value;
      
      console.log(`Checking textarea for question ${currentQuestion.id}:`, {
        expected: expectedValue.substring(0, 20) + (expectedValue.length > 20 ? '...' : ''),
        actual: actualValue.substring(0, 20) + (actualValue.length > 20 ? '...' : ''),
        match: expectedValue === actualValue
      });
      
      if (expectedValue !== actualValue) {
        console.warn("Forcing textarea value update");
        // Force update the textarea value
        textareaRef.current.value = expectedValue;
      }
    }
  }, [isClient, currentQuestion, answers]);

  // Add specific debugging for question navigation
  useEffect(() => {
    if (currentQuestion) {
      console.log(`NAVIGATION: Now on question ${currentQuestion.id} (index ${currentIndex})`);
      console.log(`ANSWER: `, answers[currentQuestion.id] ? 
        `${answers[currentQuestion.id].substring(0, 50)}${answers[currentQuestion.id].length > 50 ? '...' : ''}` : 
        'No answer yet');
    }
  }, [currentIndex, currentQuestion, answers]);

  return (
    <div className={`${className}`}>
      {/* Current question card */}
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium mr-3">
              {currentIndex + 1}
            </span>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
              {currentQuestion?.title || "Loading questions..."}
            </h3>
          </div>

          {/* Text-to-speech button */}
          <button
            onClick={() => playQuestionAudio()}
            disabled={isTtsLoading}
            className={`rounded-full p-2 ${
              isPlayingAudio
                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            } ${isTtsLoading ? "opacity-50 cursor-wait" : ""}`}
            aria-label={
              isTtsLoading
                ? "Generating audio..."
                : isPlayingAudio
                ? "Stop audio"
                : "Read question aloud"
            }
            title={
              isTtsLoading
                ? "Generating audio..."
                : isPlayingAudio
                ? "Stop audio"
                : "Read question aloud"
            }
          >
            {isTtsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {currentQuestion ? (
          <>
            <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentQuestion.description}
            </p>

            {isClient && currentQuestion.image && (
              <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={currentQuestion.image}
                  alt={`Visual for ${currentQuestion.title}`}
                  className="w-full object-cover max-h-[300px]"
                />
              </div>
            )}

            <div className="space-y-4">
              <textarea
                ref={textareaRef}
                key={`textarea-${currentQuestion.id}-${answers[currentQuestion.id] || 'empty'}-${isClient ? 'client' : 'server'}`}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#13131b] min-h-[150px] focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-700 focus:outline-none transition-all"
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ""}
                onChange={handleAnswerChange}
              />

              {transcriptionError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/30">
                  <AlertCircle className="h-4 w-4 inline-block mr-2" />
                  Error: {transcriptionError}
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Remove the answer from state
                      setAnswers((prev) => {
                        const newAnswers = { ...prev };
                        delete newAnswers[currentQuestion.id];
                        return newAnswers;
                      });
                      
                      // Remove from localStorage
                      if (typeof window !== 'undefined') {
                        removeLocalStorageAnswer(currentQuestion.id);
                      }
                      
                      // Notify parent component
                      onQuestionAnswered?.(currentQuestion.id, "");
                      toast.success("Answer deleted");
                    }}
                    disabled={!answers[currentQuestion.id]}
                    className={`rounded-xl border border-red-500 dark:border-red-600 bg-white dark:bg-[#1e1e2d] hover:bg-red-100 dark:hover:bg-red-900/30 px-4 py-2 transition-colors flex items-center text-red-600 dark:text-red-500 ${
                      !answers[currentQuestion.id]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Delete answer
                  </button>
                  
                <VoiceRecordingButton 
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  isDisabled={isProcessing || isTtsLoading}
                  onClick={toggleRecording}
                  />
                </div>
                <button 
                  onClick={() => openQuestionModal(currentIndex)}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white px-4 py-2"
                >
                  <Maximize2 className="h-4 w-4 mr-2 inline-block" />
                  Expand Question
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Navigation buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || !currentQuestion}
          className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-2 inline-block" />
          Previous Question
        </button>
        <button
          onClick={handleNext}
          disabled={
            !currentQuestion ||
            (!answers[currentQuestion.id] && currentQuestion.required)
          }
          className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentIndex === questions.length - 1 ? "Submit" : "Next Question"}
          {currentIndex < questions.length - 1 && (
            <ChevronRight className="h-4 w-4 ml-2 inline-block" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {showModal && questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f0f13]/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1a1a24] rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium mr-3">
                      {modalIndex + 1}
                    </span>
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                      {questions[modalIndex]?.title || ""}
                    </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6">
                {questions[modalIndex] && (
                  <>
                    <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {questions[modalIndex].description}
                    </p>

                    {isClient && questions[modalIndex].image && (
                      <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img
                          src={questions[modalIndex].image}
                          alt={`Visual for ${questions[modalIndex].title}`}
                          className="w-full object-cover max-h-[300px]"
                        />
                      </div>
                    )}

                    {questions[modalIndex].required && (
                      <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-700 dark:text-amber-400">
                        <AlertCircle size={16} />
                        <span className="text-sm">
                          This question requires an answer.
                        </span>
                      </div>
                    )}
                  </>
                )}

                <textarea
                  key={`modal-textarea-${modalIndex}-${currentAnswer}-${isClient ? 'client' : 'server'}`}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#13131b] min-h-[200px] focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-700 focus:outline-none transition-all"
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
              </div>

              {/* Modal footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between">
                <button
                  onClick={() => navigateModalQuestion("prev")}
                  disabled={modalIndex === 0}
                  className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2 inline-block" />
                  Previous
                </button>

                <button
                  onClick={
                    modalIndex === questions.length - 1
                      ? saveModalAnswer
                      : () => navigateModalQuestion("next")
                  }
                  disabled={
                    !currentAnswer.trim() && questions[modalIndex]?.required
                  }
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalIndex === questions.length - 1
                    ? "Save & Close"
                    : "Next Question"}
                  {modalIndex < questions.length - 1 && (
                    <ChevronRight className="h-4 w-4 ml-2 inline-block" />
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
