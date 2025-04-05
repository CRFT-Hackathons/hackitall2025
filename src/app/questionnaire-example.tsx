"use client"

import { useState, useEffect } from "react"
import { Questionnaire } from "@/components/questionnaire"
import { toast } from "sonner"

// Sample questions for the questionnaire
const sampleQuestions = [
  {
    id: "experience",
    title: "Professional Experience",
    description: "Please describe your relevant work experience, highlighting key accomplishments and responsibilities in your previous roles.",
    required: true,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "education",
    title: "Educational Background",
    description: "What is your educational background? Include degrees, certifications, and any relevant coursework or training.",
    required: true,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "skills",
    title: "Technical Skills",
    description: "List your technical skills and rate your proficiency level (beginner, intermediate, advanced) for each.",
    required: true,
    image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "projects",
    title: "Notable Projects",
    description: "Describe 1-2 significant projects you've worked on. What was your role and what were the outcomes?",
    required: false,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "strengths",
    title: "Strengths & Weaknesses",
    description: "What do you consider to be your greatest professional strength? What's one area where you're working to improve?",
    required: true,
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  }
]

export default function QuestionnaireExample() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [showSavedResponses, setShowSavedResponses] = useState(false)
  const [savedResponses, setSavedResponses] = useState<Record<string, any>>({})

  // Initialize session ID on component mount and load saved responses
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;
    
    console.log("Initializing questionnaire session...");

    // Try multiple approaches to restore answers, prioritizing the most specific and recent data
    
    // 1. First check if we have any directly saved answers in localStorage for individual questions
    const directlySavedAnswers: Record<string, string> = {};
    let hasDirectlySavedAnswers = false;
    
    // Check each sample question for a saved answer
    sampleQuestions.forEach(question => {
      const savedAnswer = localStorage.getItem(`questionnaire_answer_${question.id}`);
      if (savedAnswer) {
        directlySavedAnswers[question.id] = savedAnswer;
        hasDirectlySavedAnswers = true;
        console.log(`Found directly saved answer for ${question.id}: ${savedAnswer.substring(0, 20)}...`);
      }
    });
    
    // 2. Check if we have a JSON object with all answers
    let jsonSavedAnswers: Record<string, string> = {};
    let hasJsonSavedAnswers = false;
    
    try {
      const savedAnswersJson = localStorage.getItem('questionnaire_all_answers');
      console.log('Raw questionnaire_all_answers:', savedAnswersJson);
      
      if (savedAnswersJson) {
        jsonSavedAnswers = JSON.parse(savedAnswersJson);
        hasJsonSavedAnswers = Object.keys(jsonSavedAnswers).length > 0;
        console.log("Found JSON saved answers:", jsonSavedAnswers);
      }
    } catch (error) {
      console.error("Error parsing JSON saved answers:", error);
    }
    
    // 3. Use the answers we found, prioritizing direct saves over JSON (as they might be more recent)
    if (hasDirectlySavedAnswers) {
      console.log("Loading directly saved answers from localStorage:", directlySavedAnswers);
      setAnswers(directlySavedAnswers);
    } else if (hasJsonSavedAnswers) {
      console.log("Loading answers from JSON backup:", jsonSavedAnswers);
      setAnswers(jsonSavedAnswers);
    }
    
    // Create a unique session ID if one doesn't exist
    if (!sessionId) {
      // Check if there's an in-progress session in localStorage
      try {
        const responsesStr = localStorage.getItem('questionnaireResponses');
        console.log("Found localStorage responses:", responsesStr ? "yes" : "no");
        
        if (responsesStr) {
          const responses = JSON.parse(responsesStr);
          const inProgressSessions = Object.entries(responses).filter(
            ([_, data]: [string, any]) => data.inProgress === true
          );
          
          console.log("In-progress sessions found:", inProgressSessions.length);
          
          // If there's an in-progress session, use that session ID
          if (inProgressSessions.length > 0) {
            const sortedSessions = inProgressSessions.sort(
              ([_, dataA]: [string, any], [__, dataB]: [string, any]) => 
                new Date(dataB.timestamp).getTime() - new Date(dataA.timestamp).getTime()
            );
            
            const [latestSessionId, sessionData]: [string, any] = sortedSessions[0];
            console.log("Restoring session:", latestSessionId);
            
            setSessionId(latestSessionId);
            
            // Only restore answers from the session if we didn't find more specific saved answers
            if (!hasDirectlySavedAnswers && !hasJsonSavedAnswers) {
              console.log("Loading answers from session data");
              setAnswers(sessionData.answers || {});
            }
          } else {
            // If no in-progress session, create a new one
            const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            console.log("Creating new session (no in-progress):", newSessionId);
            setSessionId(newSessionId);
          }
        } else {
          // If no responses at all, create a new session
          const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          console.log("Creating new session (no responses at all):", newSessionId);
          setSessionId(newSessionId);
        }
      } catch (error) {
        console.error("Error checking for in-progress sessions:", error);
        // Fallback to creating a new session
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log("Creating new session (error fallback):", newSessionId);
        setSessionId(newSessionId);
      }
    }
    
    // Load saved responses from localStorage for display purposes
    loadSavedResponses();
  // Empty dependency array to run only once on mount
  }, []);
  
  const loadSavedResponses = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const responsesStr = localStorage.getItem('questionnaireResponses')
      if (responsesStr) {
        const responses = JSON.parse(responsesStr)
        setSavedResponses(responses)
      }
    } catch (error) {
      console.error("Error loading saved responses:", error)
    }
  }

  const handleSubmit = (submittedAnswers: Record<string, string>) => {
    setAnswers(submittedAnswers)
    setIsSubmitted(true)
    
    // Save the responses to localStorage in multiple formats
    if (typeof window !== 'undefined') {
      try {
        // 1. Save as individual question answers
        Object.entries(submittedAnswers).forEach(([questionId, answer]) => {
          localStorage.setItem(`questionnaire_answer_${questionId}`, answer);
          localStorage.setItem(`questionnaire_answer_${questionId}_timestamp`, new Date().toISOString());
        });
        
        // 2. Save as JSON object
        localStorage.setItem('questionnaire_all_answers', JSON.stringify(submittedAnswers));
        localStorage.setItem('questionnaire_all_answers_timestamp', new Date().toISOString());
        
        // 3. Save in the session record
        saveResponsesToLocalStorage(submittedAnswers);
        
        console.log("All answers saved to localStorage successfully");
      } catch (error) {
        console.error("Error saving answers to localStorage:", error);
      }
    }
    
    console.log("Questionnaire submitted:", submittedAnswers)
  }

  const saveResponsesToLocalStorage = (submittedAnswers: Record<string, string>) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get existing responses from localStorage
      const existingResponsesStr = localStorage.getItem('questionnaireResponses')
      const existingResponses = existingResponsesStr ? JSON.parse(existingResponsesStr) : {}
      
      // Add new response with timestamp and session ID
      const updatedResponses = {
        ...existingResponses,
        [sessionId]: {
          answers: submittedAnswers,
          timestamp: new Date().toISOString(),
          questions: sampleQuestions.map(q => ({ id: q.id, title: q.title })),
          inProgress: false,
          completed: true
        }
      }
      
      // Save back to localStorage
      localStorage.setItem('questionnaireResponses', JSON.stringify(updatedResponses))
      console.log("Responses saved to localStorage for session:", sessionId)
    } catch (error) {
      console.error("Error saving responses to localStorage:", error)
    }
  }

  // Function to save answers to localStorage with a timestamp
  const saveAnswerToLocalStorage = (questionId: string | number, answer: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get current answers and update with the new answer
      const updatedAnswers = { ...answers, [questionId]: answer };
      
      // Save the individual answer directly to localStorage with a specific key
      localStorage.setItem(`questionnaire_answer_${questionId}`, answer);
      
      // Save a timestamp for when this answer was last updated
      localStorage.setItem(`questionnaire_answer_${questionId}_timestamp`, new Date().toISOString());
      
      // Also save all current answers as a JSON object for backup/recovery
      localStorage.setItem('questionnaire_all_answers', JSON.stringify(updatedAnswers));
      localStorage.setItem('questionnaire_all_answers_timestamp', new Date().toISOString());
      
      console.log(`Saved answer for ${questionId} to localStorage. Current answers:`, updatedAnswers);
    } catch (error) {
      console.error("Error saving answer to localStorage:", error);
    }
  };

  const handleQuestionAnswered = (questionId: string | number, answer: string) => {
    // Update the current answers in state
    const updatedAnswers = { ...answers, [questionId]: answer }
    setAnswers(updatedAnswers)
    
    // Save the answer to localStorage
    saveAnswerToLocalStorage(questionId, answer);
    
    // Save the in-progress answers to session record
    if (sessionId && typeof window !== 'undefined') {
      try {
        const existingResponsesStr = localStorage.getItem('questionnaireResponses')
        const existingResponses = existingResponsesStr ? JSON.parse(existingResponsesStr) : {}
        
        // Update the in-progress answers
        const updatedResponses = {
          ...existingResponses,
          [sessionId]: {
            answers: updatedAnswers,
            timestamp: new Date().toISOString(),
            inProgress: true,
            questions: sampleQuestions.map(q => ({ id: q.id, title: q.title }))
          }
        }
        
        localStorage.setItem('questionnaireResponses', JSON.stringify(updatedResponses))
      } catch (error) {
        console.error("Error saving in-progress responses:", error)
      }
    }
    
    console.log(`Question ${questionId} answered:`, answer)
  }

  // Function to export all responses as JSON
  const exportResponses = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const responsesStr = localStorage.getItem('questionnaireResponses')
      if (responsesStr) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(responsesStr)
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", "questionnaire_responses.json")
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
      }
    } catch (error) {
      console.error("Error exporting responses:", error)
    }
  }

  // Function to clear all localStorage answers
  const clearLocalStorage = () => {
    if (typeof window === 'undefined') return;
    
    try {
      // 1. Clear individual question answers
      sampleQuestions.forEach(question => {
        localStorage.removeItem(`questionnaire_answer_${question.id}`);
        localStorage.removeItem(`questionnaire_answer_${question.id}_timestamp`);
      });
      
      // 2. Clear JSON backup
      localStorage.removeItem('questionnaire_all_answers');
      localStorage.removeItem('questionnaire_all_answers_timestamp');
      
      // 3. Clear session data
      localStorage.removeItem('questionnaireResponses');
      
      // Reset state
      setAnswers({});
      setIsSubmitted(false);
      setSavedResponses({});
      
      // Create new session
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setSessionId(newSessionId);
      
      toast.success("All saved responses cleared successfully!");
      console.log("All localStorage data cleared");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      toast.error("Failed to clear saved responses");
    }
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
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setIsSubmitted(false)}
                className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#1e1e2d] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                Edit Responses
              </button>
              <button
                onClick={() => setShowSavedResponses(!showSavedResponses)}
                className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#1e1e2d] hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-4 py-2 text-emerald-600 dark:text-emerald-400 transition-colors"
              >
                {showSavedResponses ? 'Hide' : 'Show'} Saved Responses
              </button>
              <button
                onClick={exportResponses}
                className="rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#1e1e2d] hover:bg-purple-50 dark:hover:bg-purple-900/30 px-4 py-2 text-purple-600 dark:text-purple-400 transition-colors"
              >
                Export All Responses
              </button>
              <button
                onClick={clearLocalStorage}
                className="rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-[#1e1e2d] hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 text-red-600 dark:text-red-400 transition-colors"
              >
                Clear All Responses
              </button>
            </div>
            
            {/* Display saved responses */}
            {showSavedResponses && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
                <h3 className="text-xl font-medium mb-4 text-gray-800 dark:text-gray-200">
                  All Saved Responses
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {Object.keys(savedResponses).length > 0 ? (
                    Object.entries(savedResponses).map(([session, data]: [string, any]) => (
                      <div key={session} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-indigo-600 dark:text-indigo-400">
                            Session: {session.slice(0, 14)}...
                          </h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(data.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          {data.questions?.map((q: any) => (
                            <div key={q.id} className="mb-2">
                              <p className="font-medium text-slate-700 dark:text-slate-300">{q.title}</p>
                              <p className="text-slate-600 dark:text-slate-400 ml-4">
                                {data.answers[q.id] || 'No answer'}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {data.inProgress ? '(In progress)' : '(Completed)'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400">No saved responses found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="text-slate-700 dark:text-slate-300 mb-8 text-center max-w-2xl mx-auto">
              Please complete the following questions to help us better understand your background and prepare for our upcoming interview.
            </p>
            
            <Questionnaire
              key={`questionnaire-${Object.keys(answers).length}`}
              questions={sampleQuestions}
              onSubmit={handleSubmit}
              onQuestionAnswered={handleQuestionAnswered}
              className="mb-8"
              initialAnswers={answers}
            />
          </>
        )}
      </div>
    </div>
  )
} 