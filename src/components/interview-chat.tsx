"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Mic, MicOff, Pause, Play, Clock, Coffee } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user1" | "user2"
  content: string
}

interface UserChatProps {
  user1Name: string;
  user2Name?: string;
  title: string;
  className: string;
  messageClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  initialMessages?: Message[];
}

export function TwoPersonChat({
  user1Name,
  user2Name = "User 2",
  title,
  className = "",
  messageClassName = "",
  inputClassName = "",
  buttonClassName = "",
  placeholder = "Type your message...",
  initialMessages = [],
}: UserChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [currentUser, setCurrentUser] = useState<"user1" | "user2">("user1")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeoutActive, setTimeoutActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [bathroomTimeoutActive, setBathroomTimeoutActive] = useState(false)
  const [bathroomTimeLeft, setBathroomTimeLeft] = useState(120) // 2 minutes

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle timeout countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    let bathroomTimer: NodeJS.Timeout

    if (timeoutActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setTimeoutActive(false)
      setIsPaused(false)
      // Could add toast notification here
    }

    if (bathroomTimeoutActive && bathroomTimeLeft > 0) {
      bathroomTimer = setInterval(() => {
        setBathroomTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (bathroomTimeLeft === 0) {
      setBathroomTimeoutActive(false)
      setIsPaused(false)
      // Could add toast notification here
    }

    return () => {
      clearInterval(timer)
      clearInterval(bathroomTimer)
    }
  }, [timeoutActive, timeLeft, bathroomTimeoutActive, bathroomTimeLeft])

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const activateTimeout = () => {
    setTimeoutActive(true)
    setIsPaused(true)
  }

  const activateBathroomTimeout = () => {
    setBathroomTimeoutActive(true)
    setIsPaused(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isPaused) {
      // Add user message
      const userMessage = {
        id: String(Date.now()),
        role: currentUser,
        content: input.trim(),
      };
      setMessages((prev) => [...prev, userMessage as Message]);
      setInput("");
      setCurrentUser(currentUser === "user1" ? "user2" : "user1");
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className={`flex flex-col h-[500px] rounded-lg border border-gray-200 dark:border-gray-800 relative ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-medium">{title}</h2>
        <div className="text-sm text-gray-500">
          Current turn: {currentUser === "user1" ? user1Name : user2Name}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user1" ? "justify-end" : "justify-start"} ${messageClassName}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 backdrop-blur-sm ${
                message.role === "user1"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground dark:bg-gray-800/80"
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {message.role === "user1" ? user1Name : user2Name}
              </div>
              {message.content}
            </div>
          </div>
        ))}
        {isRecording && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted text-muted-foreground dark:bg-gray-800/80 flex items-center space-x-2">
              <div className="flex justify-center items-end h-5 gap-[2px]" aria-label="Audio visualization">
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isPaused ? "Interview paused..." : placeholder}
          className={`flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary ${inputClassName}`}
          aria-label="Type your message"
          disabled={isPaused}
        />
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isPaused || !input.trim()}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className="p-2 rounded-md bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          
          <button
            type="submit"
            disabled={isPaused || !input.trim()}
            className={`px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {isPaused && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-b-lg">
            <div className="flex items-center gap-2 text-primary">
              <Pause className="h-5 w-5" />
              <span>Interview paused</span>
            </div>
          </div>
        )}
      </form>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-between p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <button
          onClick={togglePause}
          disabled={timeoutActive || bathroomTimeoutActive}
          className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5 transition-colors bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isPaused ? "Resume interview" : "Pause interview"}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span>{isPaused ? "Resume" : "Pause"}</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={activateBathroomTimeout}
            disabled={timeoutActive || bathroomTimeoutActive}
            className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Take a bathroom break"
          >
            <Coffee className="h-4 w-4" />
            <span>Bathroom Break</span>
          </button>

          <button
            onClick={activateTimeout}
            disabled={timeoutActive || bathroomTimeoutActive}
            className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Take a break"
          >
            <Clock className="h-4 w-4" />
            <span>Need a Break</span>
          </button>
        </div>
      </div>

      {/* Timeout overlay */}
      <AnimatePresence>
        {timeoutActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center z-10 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                <Clock size={28} className="text-indigo-500" />
              </div>
              <svg className="absolute top-0 left-0 w-20 h-20 -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - timeLeft / 300)}
                  className="text-indigo-500 transition-all duration-1000"
                />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2 text-white">BREAK TIME</h3>
            <p className="text-gray-400 mb-4 text-sm">Take a moment to breathe</p>
            <div className="text-3xl font-light text-indigo-400" aria-live="polite">
              {formatTime(timeLeft)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bathroom Timeout overlay */}
      <AnimatePresence>
        {bathroomTimeoutActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center z-10 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                <Coffee size={28} className="text-purple-500" />
              </div>
              <svg className="absolute top-0 left-0 w-20 h-20 -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - bathroomTimeLeft / 120)}
                  className="text-purple-500 transition-all duration-1000"
                />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2 text-white">BATHROOM BREAK</h3>
            <p className="text-gray-400 mb-4 text-sm">We'll wait for you to return</p>
            <div className="text-3xl font-light text-purple-400" aria-live="polite">
              {formatTime(bathroomTimeLeft)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

