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
}

export function Questionnaire({
  questions,
  onSubmit,
  onQuestionAnswered,
  onQuestionChange,
  className = "",
  showProgress = true,
  languageCode = "en-US",
}: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Initialize with current value from localStorage, default to 1.0 if not set
  const [speechRate, setSpeechRate] = useState<number>(
    parseFloat(localStorage.getItem("speechRate") || "1.0")
  );

  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get current question
  const currentQuestion = questions[currentIndex];

  // Notify parent component when current question changes
  useEffect(() => {
    onQuestionChange?.(currentIndex);
    // Sync modal index with current index when current index changes
    setModalIndex(currentIndex);
  }, [currentIndex, onQuestionChange]);

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

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const answer = e.target.value;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
    onQuestionAnswered?.(currentQuestion.id, answer);
  };

  const openQuestionModal = (index: number) => {
    setModalIndex(index);
    setCurrentAnswer(answers[questions[index].id] || "");
    setShowModal(true);
  };

  const saveModalAnswer = () => {
    const questionId = questions[modalIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: currentAnswer }));
    onQuestionAnswered?.(questionId, currentAnswer);

    // Go to next question or close modal
    if (modalIndex < questions.length - 1) {
      setModalIndex(modalIndex + 1);
      setCurrentAnswer(answers[questions[modalIndex + 1].id] || "");
      setCurrentIndex(modalIndex + 1);
    } else {
      setShowModal(false);
    }
  };

  const navigateModalQuestion = (direction: "next" | "prev") => {
    // Save current answer first
    const questionId = questions[modalIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: currentAnswer }));
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
      const currentSpeechRate = parseFloat(
        localStorage.getItem("speechRate") || "1.0"
      );
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
                <button
                  onClick={toggleRecording}
                  disabled={isProcessing || isTtsLoading}
                  className={`rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 transition-colors flex items-center ${
                    isRecording
                      ? "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                      : "text-indigo-600 dark:text-indigo-400"
                  } ${
                    isProcessing || isTtsLoading
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 inline-block animate-spin" />
                  ) : isRecording ? (
                    <StopCircle className="h-4 w-4 mr-2 inline-block" />
                  ) : (
                    <Mic className="h-4 w-4 mr-2 inline-block" />
                  )}
                  {isProcessing
                    ? "Processing..."
                    : isRecording
                    ? "Stop Recording"
                    : "Voice Input"}
                </button>
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
