"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Mic, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: string | number
  title: string
  description: string
  required?: boolean
}

interface QuestionnaireProps {
  /**
   * Array of questions to display
   */
  questions: Question[]
  /**
   * Callback when questionnaire is submitted
   */
  onSubmit?: (answers: Record<string, string>) => void
  /**
   * Callback when a question is answered
   */
  onQuestionAnswered?: (questionId: string | number, answer: string) => void
  /**
   * Callback when the current question changes
   */
  onQuestionChange?: (index: number) => void
  /**
   * Class name for the container
   */
  className?: string
  /**
   * Whether to show progress
   */
  showProgress?: boolean
}

export function Questionnaire({
  questions,
  onSubmit,
  onQuestionAnswered,
  onQuestionChange,
  className = "",
  showProgress = true,
}: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showModal, setShowModal] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState("")
  
  // Calculate progress percentage
  //const progress = Math.round(((currentIndex + 1) / questions.length) * 100)

  // Get current question
  const currentQuestion = questions[currentIndex]

  // Notify parent component when current question changes
  useEffect(() => {
    onQuestionChange?.(currentIndex)
  }, [currentIndex, onQuestionChange])

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onSubmit?.(answers)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const answer = e.target.value
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))
    onQuestionAnswered?.(currentQuestion.id, answer)
  }

  const openQuestionModal = (index: number) => {
    setModalIndex(index)
    setCurrentAnswer(answers[questions[index].id] || "")
    setShowModal(true)
  }

  const saveModalAnswer = () => {
    const questionId = questions[modalIndex].id
    setAnswers(prev => ({ ...prev, [questionId]: currentAnswer }))
    onQuestionAnswered?.(questionId, currentAnswer)
    
    // Go to next question or close modal
    if (modalIndex < questions.length - 1) {
      setModalIndex(modalIndex + 1)
      setCurrentAnswer(answers[questions[modalIndex + 1].id] || "")
    } else {
      setShowModal(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <div className={`${className}`}>
      {/* Current question card */}
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center mb-4">
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium mr-3">
            {currentIndex + 1}
          </span>
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
            {currentQuestion.title}
          </h3>
        </div>

        <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          {currentQuestion.description}
        </p>

        <div className="space-y-4">
          <textarea
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#13131b] min-h-[150px] focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-700 focus:outline-none transition-all"
            placeholder="Type your answer here..."
            value={answers[currentQuestion.id] || ""}
            onChange={handleAnswerChange}
          />

          <div className="flex flex-wrap gap-3 justify-between">
            <button
              onClick={() => {}} // Voice input functionality would go here
              className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors"
            >
              <Mic className="h-4 w-4 mr-2 inline-block" />
              Voice Input
            </button>
            <button 
              onClick={() => openQuestionModal(currentIndex)}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white px-4 py-2"
            >
              Expand Question
            </button>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-2 inline-block" />
          Previous Question
        </button>
        <button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] && currentQuestion.required}
          className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentIndex === questions.length - 1 ? "Submit" : "Next Question"}
          {currentIndex < questions.length - 1 && <ChevronRight className="h-4 w-4 ml-2 inline-block" />}
        </button>
      </div>

      {/* Progress indicator */}
      {/* {showProgress && (
        <div className="mt-4">
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{progress}% Complete</span>
          </div>
        </div>
      )} */}

      {/* Question Modal */}
      <AnimatePresence>
        {showModal && (
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
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium mr-3">
                      {modalIndex + 1}
                    </span>
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                      {questions[modalIndex].title}
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

              <div className="flex-1 overflow-y-auto p-6">
                <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {questions[modalIndex].description}
                </p>

                {questions[modalIndex].required && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-700 dark:text-amber-400">
                    <AlertCircle size={16} />
                    <span className="text-sm">This question requires an answer.</span>
                  </div>
                )}

                <textarea
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#13131b] min-h-[200px] focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-700 focus:outline-none transition-all"
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between">
                <button
                  onClick={() => {
                    if (modalIndex > 0) {
                      const prevAnswer = answers[questions[modalIndex - 1].id] || ""
                      setModalIndex(modalIndex - 1)
                      setCurrentAnswer(prevAnswer)
                    }
                  }}
                  disabled={modalIndex === 0}
                  className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2 inline-block" />
                  Previous
                </button>

                <button
                  onClick={saveModalAnswer}
                  disabled={!currentAnswer.trim() && questions[modalIndex].required}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalIndex === questions.length - 1 ? "Save & Close" : "Next Question"}
                  {modalIndex < questions.length - 1 && <ChevronRight className="h-4 w-4 ml-2 inline-block" />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 