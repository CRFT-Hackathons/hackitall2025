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
  RefreshCw,
  Download,
  Video,
  CameraOff,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { transcribeAudio } from "../app/backend/stt-integration";
import { synthesizeSpeech } from "../app/backend/tts-integration";
import { toast } from "sonner";
import { PiHighlighterDuotone } from "react-icons/pi";

// Define the structure for an answer, which can include text and/or video
export interface AnswerData {
  text?: string;
  video?: Blob; // Store video as Blob
  highlightedText?: string; // Add field for highlighted text
}

interface Question {
  id: string | number;
  title: string;
  description: string;
  required?: boolean;
  image?: string;
  requireVideoAns?: boolean; // Flag for video requirement
  descriptionHighlight?: string; // Optional field for highlighted description
}

interface QuestionnaireProps {
  /**
   * Array of questions to display
   */
  questions: Question[];
  /**
   * Callback when questionnaire is submitted
   * Updated to pass the new AnswerData structure
   */
  onSubmit?: (answers: Record<string | number, AnswerData>) => void;
  /**
   * Callback when a question is answered (text or video)
   * Updated to pass the new AnswerData structure
   */
  onQuestionAnswered?: (
    questionId: string | number,
    answer: AnswerData
  ) => void;
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
  // QUESTIONNAIRE STATES & REFS
  const [currentIndex, setCurrentIndex] = useState(0);
  // Update answers state to hold AnswerData objects
  const [answers, setAnswers] = useState<Record<string | number, AnswerData>>(
    {}
  );
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [currentAnswerText, setCurrentAnswerText] = useState(""); // For modal text input

  // Add state for language
  const [currentLanguage, setCurrentLanguage] = useState(languageCode);

  // Add highlighting state and ref
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Audio states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Video states
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // URL for preview only
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const videoRecorder = useRef<MediaRecorder | null>(null);
  const videoChunks = useRef<Blob[]>([]);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentObjectUrl = useRef<string | null>(null); // Ref to manage object URL lifecycle

  const [isHighlight, setIsHighlight] = useState(false);

  // Load highlighting preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedHighlight = localStorage.getItem("isHighlight");
        if (savedHighlight === "true") {
          setIsHighlight(true);
        }

        // Add event listener for highlighting changes from accessibility panel
        const handleHighlightingChange = (event: CustomEvent) => {
          if (event.detail && typeof event.detail.isHighlight === "boolean") {
            setIsHighlight(event.detail.isHighlight);
            // Force regenerate highlighting when turned on
            if (event.detail.isHighlight && questions.length > 0) {
              // This will trigger the effect to run again
              const questionsCopy = [...questions];
              questionsCopy.forEach((q, i) => {
                if (questions[i]) {
                  questions[i] = { ...q };
                }
              });
            }
          }
        };

        window.addEventListener(
          "highlightingChanged",
          handleHighlightingChange as EventListener
        );

        // Clean up event listener on unmount
        return () => {
          window.removeEventListener(
            "highlightingChanged",
            handleHighlightingChange as EventListener
          );
        };
      } catch (error) {
        console.error("Error loading highlighting preference:", error);
      }
    }
  }, [questions]);

  // Prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize speechRate from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRate = localStorage.getItem("speechRate");
      if (storedRate) {
        setSpeechRate(parseFloat(storedRate));
      }
    }
  }, []);

  // Cleanup audio recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && isRecording) {
        const tracks = mediaRecorder.current.stream?.getTracks();
        tracks?.forEach((track) => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isRecording]);

  // Cleanup video stream and object URL on unmount
  useEffect(() => {
    return () => {
      stopVideoStream();
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on unmount

  // Listen to localStorage changes for speechRate
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

  // Listen for language changes from the LanguageSwitcher component
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail && event.detail.language) {
        // Map language code to voice language code
        const languageMap: Record<string, string> = {
          en: "en-US",
          ro: "ro-RO",
          it: "it-IT",
          es: "es-ES",
        };

        setCurrentLanguage(languageMap[event.detail.language] || "en-US");
      }
    };

    window.addEventListener(
      "languageChanged",
      handleLanguageChange as EventListener
    );

    // Check for stored language preference
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("preferredLanguage");
      if (savedLang) {
        const languageMap: Record<string, string> = {
          en: "en-US",
          ro: "ro-RO",
          it: "it-IT",
          es: "es-ES",
        };
        setCurrentLanguage(languageMap[savedLang] || "en-US");
      }
    }

    return () => {
      window.removeEventListener(
        "languageChanged",
        handleLanguageChange as EventListener
      );
    };
  }, []);

  // Get current question
  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.id;
  const currentQuestionAnswer = currentQuestionId
    ? answers[currentQuestionId]
    : undefined;

  // Effect to notify parent of question change (depends only on currentIndex)
  useEffect(() => {
    // console.log("Effect: Notifying parent of index change", currentIndex);
    onQuestionChange?.(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]); // Intentionally exclude onQuestionChange if it's stable

  // Effect to sync modal index (depends only on currentIndex)
  useEffect(() => {
    // console.log("Effect: Syncing modal index", currentIndex);
    setModalIndex(currentIndex);
  }, [currentIndex]);

  // Effect to manage video preview based ONLY on the current question's video answer
  useEffect(() => {
    const question = questions[currentIndex];
    const answerVideo = question ? answers[question.id]?.video : undefined;
    // console.log("Effect: Checking video preview for index", currentIndex, "Has video:", !!answerVideo);

    // 1. Clean up previous object URL *before* creating a new one or clearing
    if (currentObjectUrl.current) {
      // console.log("Revoking old URL:", currentObjectUrl.current);
      URL.revokeObjectURL(currentObjectUrl.current);
      currentObjectUrl.current = null;
    }

    // 2. Set up new preview if needed
    if (question?.requireVideoAns && answerVideo instanceof Blob) {
      const url = URL.createObjectURL(answerVideo);
      // console.log("Creating new URL:", url);
      setVideoUrl(url); // Update state for the <video> src
      currentObjectUrl.current = url; // Store ref to the new URL for cleanup
      setShowVideoPreview(true); // Show the preview player
    } else {
      // No video for this question, or question doesn't require video
      setVideoUrl(null);
      setShowVideoPreview(false);
    }

    // Depend specifically on the current question ID and its video blob reference
    // Using `answers[currentQuestionId]?.video` ensures this only runs when the
    // specific video blob for the current question changes, or when the index changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions, answers[currentQuestionId]?.video]);

  // Effect to stop video stream if current question doesn't require it
  useEffect(() => {
    const question = questions[currentIndex];
    // console.log("Effect: Checking if video stream should stop for index", currentIndex, "Requires video:", !!question?.requireVideoAns);
    if (!question?.requireVideoAns) {
      stopVideoStream();
    }
    // This effect should run when the question itself changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions]);

  // Fix the effect to safely call onQuestionAnswered only when answers actually change
  useEffect(() => {
    if (currentQuestionId && onQuestionAnswered) {
      const currentAnswer = answers[currentQuestionId];
      if (currentAnswer) {
        // Use setTimeout to move the state update out of the render cycle
        const timerId = setTimeout(() => {
          try {
            onQuestionAnswered(currentQuestionId, currentAnswer);
          } catch (error) {
            console.error("Error in onQuestionAnswered callback:", error);
          }
        }, 0);

        // Clear timeout on cleanup
        return () => clearTimeout(timerId);
      }
    }
  }, [answers, currentQuestionId, onQuestionAnswered]);

  // Navigation Handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onSubmit?.(answers); // Pass the complete answers object
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Update text part of the answer
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (!currentQuestionId) return;

    setAnswers((prev) => {
      const existingAnswer = prev[currentQuestionId] || {};
      const updatedAnswer = { ...existingAnswer, text: newText };
      // Remove the direct call to onQuestionAnswered - now handled by the effect
      return { ...prev, [currentQuestionId]: updatedAnswer };
    });
  };

  // Handle text highlighting
  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode);

    // Focus the appropriate textarea
    if (!isHighlightMode) {
      if (showModal && modalTextareaRef.current) {
        modalTextareaRef.current.focus();
      } else if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const applyHighlight = () => {
    if (!currentQuestionId) return;

    const textarea = showModal ? modalTextareaRef.current : textareaRef.current;
    if (!textarea) return;

    const selectedText = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );

    if (selectedText) {
      // Save the highlighted text
      setAnswers((prev) => {
        const existingAnswer = prev[currentQuestionId] || {};
        const updatedAnswer = {
          ...existingAnswer,
          highlightedText: selectedText,
        };
        return { ...prev, [currentQuestionId]: updatedAnswer };
      });

      // Show feedback
      toast.success("Text highlighted");

      // Exit highlight mode
      setIsHighlightMode(false);
    } else {
      toast.error("No text selected to highlight");
    }
  };

  // Delete both text and video for the current question
  const handleDeleteAnswer = () => {
    if (!currentQuestionId) return;
    setAnswers((prev) => {
      const updatedAnswers = { ...prev };
      // Keep the key but clear the data
      updatedAnswers[currentQuestionId] = {};
      // Remove the direct call to onQuestionAnswered - now handled by the effect
      return updatedAnswers;
    });
    // If it was a video question, reset the preview
    if (currentQuestion?.requireVideoAns) {
      retakeVideo(); // Retake also clears the preview state
    }
    toast.success("Answer cleared");
  };

  const openQuestionModal = (index: number) => {
    setModalIndex(index);
    setCurrentAnswerText(answers[questions[index].id]?.text || "");
    setShowModal(true);
  };

  // Save text answer from modal
  const saveModalAnswer = () => {
    const questionId = questions[modalIndex].id;
    setAnswers((prev) => {
      const existingAnswer = prev[questionId] || {};
      const updatedAnswer = { ...existingAnswer, text: currentAnswerText };
      // Remove direct call to onQuestionAnswered - handled by the useEffect
      return { ...prev, [questionId]: updatedAnswer };
    });

    if (modalIndex < questions.length - 1) {
      setModalIndex(modalIndex + 1);
      setCurrentAnswerText(answers[questions[modalIndex + 1].id]?.text || "");
      setCurrentIndex(modalIndex + 1); // Also navigate main view
    } else {
      setShowModal(false);
    }
  };

  // Navigate modal, saving text answer first
  const navigateModalQuestion = (direction: "next" | "prev") => {
    const questionId = questions[modalIndex].id;
    setAnswers((prev) => {
      const existingAnswer = prev[questionId] || {};
      const updatedAnswer = { ...existingAnswer, text: currentAnswerText };
      // Remove direct call to onQuestionAnswered - handled by the useEffect
      return { ...prev, [questionId]: updatedAnswer };
    });

    let nextIndex = modalIndex;
    if (direction === "next" && modalIndex < questions.length - 1) {
      nextIndex = modalIndex + 1;
    } else if (direction === "prev" && modalIndex > 0) {
      nextIndex = modalIndex - 1;
    }

    if (nextIndex !== modalIndex) {
      setModalIndex(nextIndex);
      setCurrentAnswerText(answers[questions[nextIndex].id]?.text || "");
      setCurrentIndex(nextIndex); // Also navigate main view
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // VOICE INPUT FUNCTIONS (Updates text part of the answer)
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    // (Implementation remains the same as before)
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
                currentLanguage
              );
              if (transcription && currentQuestionId) {
                setAnswers((prev) => {
                  const existingAnswer = prev[currentQuestionId] || {};
                  const currentText = existingAnswer.text || "";
                  const newText = currentText
                    ? `${currentText}\n${transcription}`
                    : transcription;
                  const updatedAnswer = { ...existingAnswer, text: newText };

                  // Don't directly call onQuestionAnswered here, it will be handled by the useEffect
                  return { ...prev, [currentQuestionId]: updatedAnswer };
                });
                toast.success("Voice input added successfully");
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
              setIsProcessing(false); // Ensure processing stops
            }
          };
          reader.readAsDataURL(audioBlob);
          audioChunks.current = [];
        } catch (err) {
          console.error("Audio processing error:", err);
          setTranscriptionError("Audio processing failed");
          toast.error("Audio processing failed. Please try again.");
          setIsProcessing(false); // Ensure processing stops on error
        }
      };
      mediaRecorder.current.start();
      setIsRecording(true);
      setTranscriptionError(null);
      toast.info("Recording started. Speak now...");
    } catch (err) {
      console.error("Microphone access error:", err);
      setTranscriptionError("Microphone access denied");
      toast.error("Microphone access denied. Please check your permissions.");
      setIsRecording(false); // Ensure recording state is reset
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
      // Processing state is set in onstop handler
      toast.info("Processing your voice input...");
    }
  };

  const speakQuestion = async () => {
    if (!currentQuestion) return;

    try {
      setIsTtsLoading(true);
      const textToRead = `${currentQuestion.title}. ${currentQuestion.description}`;

      // --- START: Read latest speechRate directly ---
      let currentSpeechRate = 1.0; // Default rate
      if (typeof window !== "undefined") {
        try {
          const storedRate = localStorage.getItem("speechRate");
          if (storedRate) {
            const parsedRate = parseFloat(storedRate);
            // Use the parsed rate only if it's a valid number
            if (!isNaN(parsedRate)) {
              currentSpeechRate = parsedRate;
              // Optional: If the state is out of sync, update it now too.
              // This helps keep the state eventually consistent for other potential uses,
              // though the primary goal here is using the correct rate *now*.
              if (parsedRate !== speechRate) {
                setSpeechRate(parsedRate);
              }
            } else {
              console.warn(
                "Invalid speechRate found in localStorage:",
                storedRate
              );
              // Fallback to the current state value if localStorage is invalid
              currentSpeechRate = speechRate;
            }
          } else {
            // Fallback to the current state value if localStorage is empty
            currentSpeechRate = speechRate;
          }
        } catch (error) {
          console.error("Error reading speechRate from localStorage:", error);
          // Fallback to the current state value on error
          currentSpeechRate = speechRate;
        }
      } else {
        // Fallback for SSR or environments without window
        currentSpeechRate = speechRate;
      }
      // --- END: Read latest speechRate directly ---

      // Use the server-side TTS integration with the current language and the *directly read* rate
      const audioUrl = await synthesizeSpeech(
        textToRead,
        currentLanguage,
        currentSpeechRate // Use the rate read directly from localStorage
      );

      if (!audioUrl) throw new Error("Failed to generate speech");

      // Create a new audio element if not exists
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      // Set up audio events
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onpause = () => setIsPlayingAudio(false);
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        toast.error("Error playing audio");
        setIsPlayingAudio(false);
      };

      // Set the source and play
      audioRef.current.src = audioUrl;
      await audioRef.current.play();
      setIsPlayingAudio(true);
      toast.success(
        `Playing in ${getLanguageName(
          currentLanguage
        )} at rate ${currentSpeechRate.toFixed(1)}x`
      ); // Added rate to toast
    } catch (error) {
      console.error("Error generating or playing audio:", error);
      toast.error("Failed to play audio");
    } finally {
      setIsTtsLoading(false);
    }
  };

  // Helper function to get language name for display
  const getLanguageName = (langCode: string): string => {
    const languageMap: Record<string, string> = {
      "en-US": "English",
      "ro-RO": "Romanian",
      "it-IT": "Italian",
      "es-ES": "Spanish",
    };
    return languageMap[langCode] || langCode;
  };

  // Function to stop TTS playback
  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  // Update TTS button to toggle playback
  const toggleTTS = () => {
    if (isPlayingAudio) {
      stopTTS();
    } else {
      speakQuestion();
    }
  };

  // Clean up audio on question change
  useEffect(() => {
    stopTTS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // --- VIDEO FUNCTIONS ---

  const startVideoStream = async () => {
    // (Implementation remains the same)
    try {
      stopVideoStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setVideoStream(stream);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.muted = true;
        await liveVideoRef.current.play().catch((err) => {
          console.error("Error playing live video feed:", err);
          toast.info("Click the video to start the feed if it doesn't play.");
        });
      }
      setShowVideoPreview(false);
      toast.success("Camera activated");
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Cannot access camera. Please check permissions.");
    }
  };

  const stopVideoStream = () => {
    // (Implementation remains the same)
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
      liveVideoRef.current.muted = true;
    }
  };

  const startVideoRecording = () => {
    // (Implementation remains mostly the same, but onstop saves to answers state)
    if (!videoStream || !currentQuestionId) {
      toast.error(
        !videoStream
          ? "No camera access. Please start video feed first."
          : "Cannot record video for this question."
      );
      return;
    }

    try {
      videoChunks.current = [];
      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      // ... (mimeType checking remains the same) ...
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8,opus" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: "video/webm" };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: "" };
          }
        }
      }

      videoRecorder.current = new MediaRecorder(videoStream, options);

      videoRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          videoChunks.current.push(event.data);
        }
      };

      videoRecorder.current.onstop = () => {
        const blob = new Blob(videoChunks.current, {
          type: options.mimeType || "video/webm",
        });

        // Make sure currentQuestionId is valid before updating
        if (currentQuestionId) {
          // *** Store Blob in the answers state ***
          setAnswers((prev) => {
            const existingAnswer = prev[currentQuestionId] || {};
            const updatedAnswer = { ...existingAnswer, video: blob };

            // Don't call onQuestionAnswered directly here anymore, the useEffect will handle it safely
            return { ...prev, [currentQuestionId]: updatedAnswer };
          });

          toast.success("Recording complete. Preview ready.");
        } else {
          console.error(
            "No current question ID available when recording stopped"
          );
          toast.error("Could not save recording to current question");
        }
      };

      videoRecorder.current.start();
      setIsVideoRecording(true);
      toast.info("Recording video...");
    } catch (err) {
      console.error("Error starting video recording:", err);
      toast.error("Failed to start recording");
      setIsVideoRecording(false); // Reset state on error
    }
  };

  const stopVideoRecording = () => {
    // (Implementation remains the same)
    if (videoRecorder.current && videoRecorder.current.state === "recording") {
      videoRecorder.current.stop();
      setIsVideoRecording(false);
    }
  };

  const toggleVideoRecording = () => {
    if (isVideoRecording) {
      stopVideoRecording();
    } else {
      startVideoRecording();
    }
  };

  // Retake removes the video from the answers state
  const retakeVideo = () => {
    if (!currentQuestionId) return;

    // Remove video from answers state
    setAnswers((prev) => {
      const existingAnswer = prev[currentQuestionId] || {};
      // Create a new object without the video property
      const { video, ...rest } = existingAnswer;
      const updatedAnswer = { ...rest };

      // Don't call onQuestionAnswered directly here anymore, the useEffect will handle it safely
      return { ...prev, [currentQuestionId]: updatedAnswer };
    });

    // Clean up URL and reset preview state (handled by useEffect)
    if (currentObjectUrl.current) {
      URL.revokeObjectURL(currentObjectUrl.current);
      currentObjectUrl.current = null;
    }
    setVideoUrl(null);
    setShowVideoPreview(false);

    // Ensure the live stream is active
    if (!videoStream) {
      startVideoStream();
    } else if (liveVideoRef.current && liveVideoRef.current.paused) {
      liveVideoRef.current.play().catch(console.error);
    }
    toast.info("Previous recording discarded. Ready to record again.");
  };

  // Download uses the Blob from the answers state
  const downloadVideo = () => {
    const videoBlob = currentQuestionAnswer?.video;
    if (videoBlob) {
      // Use the existing object URL if available, otherwise create one temporarily
      const urlToDownload = videoUrl || URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = urlToDownload;
      a.download = `video-answer-${currentQuestionId}.webm`; // Use appropriate extension based on mimeType if needed
      document.body.appendChild(a);
      a.click();
      // If we created a temporary URL, revoke it
      if (!videoUrl) {
        URL.revokeObjectURL(urlToDownload);
      }
      document.body.removeChild(a);
      toast.success("Video download started");
    } else {
      toast.error("No recorded video to download for this question");
    }
  };

  // --- RENDER LOGIC ---

  const hasAnswer = currentQuestionAnswer?.text || currentQuestionAnswer?.video;

  // console.log("Current question:", currentQuestion);

  // Effect to ensure questions have highlighted descriptions
  useEffect(() => {
    if (isClient && questions.length > 0) {
      const keywordsToHighlight = [
        // Leadership and management terms
        "leadership",
        "team",
        "challenging",
        "project",
        "conflict",
        "resolution",
        "problem-solving",
        "communication",
        "techniques",
        "adaptability",
        "change",
        "time management",
        "priorities",
        "ethical",
        "dilemma",
        "creative",
        "career goals",
        "teamwork",
        "collaboration",

        // Accessibility terms
        "accessibility",
        "inclusive",
        "disability",
        "screen reader",
        "WCAG",
        "a11y",
        "assistive technology",
        "alt text",
        "aria",
        "keyboard navigation",
        "colorblind",
        "color contrast",
        "universal design",
        "accommodations",
        "captions",
        "audio description",

        // Onboarding terms
        "onboarding",
        "orientation",
        "training",
        "mentoring",
        "integration",
        "culture fit",
        "learning curve",
        "documentation",
        "knowledge transfer",
        "expectations",
        "feedback",
        "new hire",
        "process",
        "workflows",
        "procedures",
        "tools",
        "resources",
      ];

      const regex = new RegExp(`(${keywordsToHighlight.join("|")})`, "gi");

      // Process all questions and generate highlighted versions
      questions.forEach((question, index) => {
        // Always regenerate the highlighting to ensure it's consistent
        if (question.description) {
          // Generate highlighted HTML by wrapping matched keywords in span tags
          const highlightedDesc = question.description.replace(
            regex,
            '<span class="bg-yellow-100 dark:bg-yellow-800/60 text-yellow-800 dark:text-yellow-200 px-1 rounded">$1</span>'
          );

          // Update the question in place
          if (questions[index]) {
            questions[index].descriptionHighlight = highlightedDesc;
          }
        }
      });
    }
  }, [isClient, questions]);

  return (
    <div className={`${className}`}>
      {/* QUESTION CARD */}
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-slate-700/50">
        {/* ... (Question title, TTS button remain the same) ... */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium mr-3">
              {currentIndex + 1}
            </span>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
              {currentQuestion?.title || "Loading questions..."}
            </h3>
            {isHighlight && (
              <span className="ml-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/60 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                Key terms highlighted for focus
              </span>
            )}
          </div>
          <button
            onClick={toggleTTS}
            disabled={isTtsLoading || !currentQuestion}
            className={`rounded-full p-2 ${
              isPlayingAudio
                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            } ${isTtsLoading ? "opacity-50 cursor-wait" : ""} ${
              !currentQuestion ? "opacity-30 cursor-not-allowed" : ""
            }`}
            aria-label={
              isTtsLoading
                ? "Generating audio..."
                : isPlayingAudio
                ? "Stop audio"
                : `Read question aloud in ${getLanguageName(currentLanguage)}`
            }
            title={
              isTtsLoading
                ? "Generating audio..."
                : isPlayingAudio
                ? "Stop audio"
                : `Read question aloud in ${getLanguageName(currentLanguage)}`
            }
          >
            {isTtsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlayingAudio ? (
              <StopCircle className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </button>
        </div>

        {currentQuestion ? (
          <>
            {isHighlight && currentQuestion.descriptionHighlight ? (
              <div
                className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    currentQuestion.descriptionHighlight ||
                    currentQuestion.description,
                }}
              />
            ) : (
              <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQuestion.description}
              </p>
            )}

            {isClient && currentQuestion.image && (
              <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={currentQuestion.image}
                  alt={`Visual for ${currentQuestion.title}`}
                  className="w-full object-cover max-h-[300px]"
                />
              </div>
            )}
            <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent my-6 max-w-sm m-auto"></div>

            {/* --- VIDEO RECORDING SECTION (Conditional Rendering) --- */}
            {currentQuestion?.requireVideoAns && (
              <div className="flex mb-8 flex-col gap-4">
                <div className="flex items-center">
                  <div className="w-1 h-6 bg-indigo-500 dark:bg-indigo-400 mr-3 rounded-full"></div>
                  <h3 className="flex gap-2 items-center text-lg font-medium text-gray-800 dark:text-gray-200">
                    <Video className="h-5 w-5 mr-2" />
                    {showVideoPreview
                      ? "Video Response Preview"
                      : "Record Video Response"}
                  </h3>
                </div>

                <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-black aspect-video border border-slate-200 dark:border-slate-700">
                  {/* Live video feed */}
                  <video
                    ref={liveVideoRef}
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      showVideoPreview
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                    }`}
                  />

                  {/* Recorded video playback */}
                  {showVideoPreview && videoUrl && (
                    <video
                      ref={recordedVideoRef}
                      src={videoUrl}
                      controls
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain bg-black"
                      onError={(e) => {
                        console.error("Error playing preview video:", e);
                        toast.error("Could not play recorded video preview.");
                      }}
                    />
                  )}

                  {/* Overlay for when no stream is active */}
                  {!videoStream && !showVideoPreview && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                      <button
                        onClick={startVideoStream}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2 flex items-center"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Start Camera
                      </button>
                    </div>
                  )}

                  {/* Recording indicator */}
                  {isVideoRecording && (
                    <div className="absolute top-4 right-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full text-sm animate-pulse z-10">
                      <span className="h-2 w-2 bg-white rounded-full mr-2"></span>
                      Recording
                    </div>
                  )}
                </div>

                {/* Video controls */}
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {showVideoPreview ? (
                    <>
                      {/* Controls for preview mode */}
                      <button
                        onClick={retakeVideo}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retake Video
                      </button>
                      <button
                        onClick={downloadVideo}
                        disabled={!currentQuestionAnswer?.video} // Disable if no video blob exists
                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Controls for recording mode */}
                      <button
                        onClick={toggleVideoRecording}
                        disabled={!videoStream}
                        className={`px-4 py-2 rounded-xl text-white flex items-center transition-colors ${
                          isVideoRecording
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        } ${
                          !videoStream ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isVideoRecording ? (
                          <>
                            <StopCircle className="h-4 w-4 mr-2" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <span className="h-3 w-3 rounded-full bg-red-500 mr-2 border border-white"></span>
                            Start Recording
                          </>
                        )}
                      </button>
                      {videoStream && !isVideoRecording && (
                        <button
                          onClick={stopVideoStream}
                          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e1e2d] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center"
                        >
                          <CameraOff className="h-4 w-4 mr-2" />
                          Turn Off Camera
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Conditionally render textarea if video isn't required OR if it is */}
            {/* You might want to hide textarea if ONLY video is required */}
            {(!currentQuestion.requireVideoAns || true) && ( // Adjust logic if needed
              <div className="space-y-4">
                <textarea
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#13131b] min-h-[150px] focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-700 focus:outline-none transition-all"
                  placeholder={
                    currentQuestion.requireVideoAns
                      ? "Add optional text notes here..."
                      : "Type your answer here..."
                  }
                  value={currentQuestionAnswer?.text || ""}
                  onChange={handleAnswerChange}
                  disabled={!currentQuestionId}
                />

                {transcriptionError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/30">
                    <AlertCircle className="h-4 w-4 inline-block mr-2" />
                    Error: {transcriptionError}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    {/* Delete Answer Button */}
                    <button
                      onClick={handleDeleteAnswer}
                      disabled={!hasAnswer || !currentQuestionId}
                      className={`rounded-xl border border-red-500 dark:border-red-600 bg-white dark:bg-[#1e1e2d] hover:bg-red-100 dark:hover:bg-red-900/30 px-4 py-2 transition-colors flex items-center text-red-600 dark:text-red-500 ${
                        !hasAnswer || !currentQuestionId
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Answer
                    </button>
                    {/* Voice Input Button */}
                    <button
                      onClick={toggleRecording}
                      disabled={
                        isProcessing || isTtsLoading || !currentQuestionId
                      }
                      className={`rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 transition-colors flex items-center ${
                        isRecording
                          ? "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                          : "text-indigo-600 dark:text-indigo-400"
                      } ${
                        isProcessing || isTtsLoading || !currentQuestionId
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
                    {/* Highlight Keywords Toggle Button */}
                    <button
                      onClick={() => {
                        const newValue = !isHighlight;
                        setIsHighlight(newValue);

                        // More robust localStorage saving
                        try {
                          localStorage.setItem(
                            "isHighlight",
                            newValue.toString()
                          );
                        } catch (error) {
                          console.error(
                            "Error saving highlighting preference:",
                            error
                          );
                        }

                        // Force regenerate highlighting if it's being turned on
                        if (newValue && questions.length > 0) {
                          // This will trigger the effect to run again
                          const questionsCopy = [...questions];
                          questionsCopy.forEach((q, i) => {
                            if (questions[i]) {
                              questions[i] = { ...q };
                            }
                          });
                        }

                        toast.success(
                          newValue
                            ? "Keywords highlighting enabled for better readability"
                            : "Keywords highlighting disabled"
                        );
                      }}
                      className={`rounded-xl border ${
                        isHighlight
                          ? "border-yellow-400 bg-yellow-50 text-yellow-700 dark:border-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "border-gray-300 bg-white text-gray-600 dark:border-gray-700 dark:bg-[#1e1e2d] dark:text-gray-400"
                      } px-4 py-2 transition-colors flex items-center`}
                      aria-label={
                        isHighlight
                          ? "Disable keyword highlighting"
                          : "Enable keyword highlighting"
                      }
                      title={
                        isHighlight
                          ? "Disable keyword highlighting"
                          : "Enable keyword highlighting to improve focus on important terms"
                      }
                    >
                      <PiHighlighterDuotone className="h-6 w-6" />
                    </button>
                  </div>
                  {/* Expand Button */}
                  <button
                    onClick={() => openQuestionModal(currentIndex)}
                    disabled={!currentQuestionId}
                    className={`rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white px-4 py-2 ${
                      !currentQuestionId ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Maximize2 className="h-4 w-4 mr-2 inline-block" />
                    Expand Question
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Navigation Buttons */}
      {/* ... (Navigation buttons remain the same, check disabled logic if needed) ... */}
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
            !currentQuestion || (currentQuestion.required && !hasAnswer) // Check if required and no answer (text or video)
          }
          className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentIndex === questions.length - 1 ? "Submit" : "Next Question"}
          {currentIndex < questions.length - 1 && (
            <ChevronRight className="h-4 w-4 ml-2 inline-block" />
          )}
        </button>
      </div>

      {/* QUESTION MODAL */}
      {/* ... (Modal remains largely the same, ensure it uses currentAnswerText state) ... */}
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
              {/* Modal Header */}
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

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {questions[modalIndex] && (
                  <>
                    {isHighlight &&
                    questions[modalIndex].descriptionHighlight ? (
                      <div
                        className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: questions[modalIndex].descriptionHighlight,
                        }}
                      />
                    ) : (
                      <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {questions[modalIndex].description}
                      </p>
                    )}
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
                  value={currentAnswerText} // Use dedicated state for modal text
                  onChange={(e) => setCurrentAnswerText(e.target.value)}
                />
              </div>

              {/* Modal Footer */}
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
                    !currentAnswerText.trim() &&
                    questions[modalIndex]?.required &&
                    !answers[questions[modalIndex].id]?.video // Also check if video exists if required
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
