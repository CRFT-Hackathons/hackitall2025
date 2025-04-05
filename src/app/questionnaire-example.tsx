"use client"

import { useState } from "react"
import { Questionnaire } from "@/components/questionnaire"

// Sample questions for the questionnaire
const sampleQuestions = [
  {
    id: "experience",
    title: "Professional Experience",
    description: "Please describe your relevant work experience, highlighting key accomplishments and responsibilities in your previous roles.",
    required: true
  },
  {
    id: "education",
    title: "Educational Background",
    description: "What is your educational background? Include degrees, certifications, and any relevant coursework or training.",
    required: true
  },
  {
    id: "skills",
    title: "Technical Skills",
    description: "List your technical skills and rate your proficiency level (beginner, intermediate, advanced) for each.",
    required: true
  },
  {
    id: "projects",
    title: "Notable Projects",
    description: "Describe 1-2 significant projects you've worked on. What was your role and what were the outcomes?",
    required: false
  },
  {
    id: "strengths",
    title: "Strengths & Weaknesses",
    description: "What do you consider to be your greatest professional strength? What's one area where you're working to improve?",
    required: true
  }
]

export default function QuestionnaireExample() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (submittedAnswers: Record<string, string>) => {
    setAnswers(submittedAnswers)
    setIsSubmitted(true)
    console.log("Questionnaire submitted:", submittedAnswers)
  }

  const handleQuestionAnswered = (questionId: string | number, answer: string) => {
    console.log(`Question ${questionId} answered:`, answer)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">
          Candidate Pre-Interview Questionnaire
        </h1>
        
        {isSubmitted ? (
          <div className="p-6 rounded-xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <h2 className="text-2xl font-medium mb-6 text-gray-800 dark:text-gray-200">Thank You!</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Your responses have been submitted successfully. We'll review your answers before the interview.
            </p>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
              <button
                onClick={() => setIsSubmitted(false)}
                className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                Edit Responses
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-700 dark:text-slate-300 mb-8 text-center max-w-2xl mx-auto">
              Please complete the following questions to help us better understand your background and prepare for our upcoming interview.
            </p>
            
            <Questionnaire
              questions={sampleQuestions}
              onSubmit={handleSubmit}
              onQuestionAnswered={handleQuestionAnswered}
              className="mb-8"
            />
          </>
        )}
      </div>
    </div>
  )
} 