"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccessibilityPanel from "@/components/accessibility-panel";
import TimeDisplayButton from "@/components/time-display-button";
import { TimeRemaining } from "@/components/time-remaining";
import { Questionnaire, AnswerData } from "@/components/questionnaire";
import { InterviewChat } from "@/components/interview-chat";
import {
  Clock,
  UserRound,
  MessageSquare,
  Book,
  Accessibility,
  Coffee,
  Save,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import WhiteboardModal from "~/components/white-board-modal";
import dynamic from "next/dynamic";
import LanguageSwitcher from "@/components/language-switcher";
import { speakText } from "@/lib/text-to-speech";
import SpeechText from "@/components/speech-text";

// Sample questions for the interview
const allInterviewQuestions = [
  {
    id: "leadership",
    title: "Leadership Experience",
    description:
      "Describe a situation where you had to lead a team through a challenging project. What leadership style did you use, how did you motivate your team members, and what was the outcome?",
    descriptionHighlight: `<p>
      Describe a situation where you had to <mark>lead a team through a challenging project</mark>. 
      What <mark>leadership style</mark> did you use, 
      how did you <mark>motivate your team members</mark>, 
      and what was the <mark>outcome</mark>?
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: true,
  },
  {
    id: "conflict_resolution",
    title: "Conflict Resolution",
    description:
      "Tell us about a time when you faced a significant conflict in a team or workplace. How did you approach the situation, what steps did you take to resolve it, and what was the outcome?",
    descriptionHighlight: `<p>
      Tell us about a time when you <mark>faced a significant conflict</mark> in a team or workplace. 
      How did you <mark>approach the situation</mark>, 
      what <mark>steps did you take to resolve it</mark>, 
      and what was the <mark>outcome</mark>?
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1646255911174-3172baff41e2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: false,
  },
  {
    id: "problem_solving",
    title: "Problem-Solving Approach",
    description:
      "Explain your approach to solving complex problems. Describe a specific example where you used critical thinking and analytical skills to overcome a difficult challenge in your work or studies.",
    descriptionHighlight: `<p>
      Explain your <mark>approach to solving complex problems</mark>. 
      Describe a specific example where you used 
      <mark>critical thinking and analytical skills</mark> 
      to <mark>overcome a difficult challenge</mark> in your work or studies.
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1587093336587-eeca6cb17cf2?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: true,
  },
  {
    id: "communication",
    title: "Communication Skills",
    description:
      "Describe a situation where effective communication was crucial to success. What communication techniques did you use, what challenges did you face, and how did you ensure your message was understood?",
    descriptionHighlight: `<p>
      Describe a situation where <mark>effective communication was crucial to success</mark>. 
      What <mark>communication techniques</mark> did you use, 
      what <mark>challenges</mark> did you face, 
      and how did you <mark>ensure your message was understood</mark>?
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: false,
  },
  {
    id: "adaptability",
    title: "Adaptability",
    description:
      "Tell us about a time when you had to adapt to a significant change or unexpected situation. How did you handle the transition, what strategies did you use to remain effective, and what did you learn?",
    descriptionHighlight: `<p>
      Tell us about a time when you had to <mark>adapt to a significant change</mark> or unexpected situation. 
      How did you <mark>handle the transition</mark>, 
      what <mark>strategies</mark> did you use to remain effective, 
      and what did you <mark>learn</mark>?
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1460530628918-ebce15e46c1f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: true,
  },
  {
    id: "time_management",
    title: "Time Management",
    description:
      "Describe how you organize your work and manage competing priorities. Give an example of a time when you had multiple deadlines to meet and explain your approach to ensuring all tasks were completed effectively.",
    descriptionHighlight: `<p>
      Describe how you <mark>organize your work</mark> and 
      <mark>manage competing priorities</mark>. 
      Give an example of a time when you had 
      <mark>multiple deadlines</mark> to meet 
      and explain your approach to 
      <mark>ensuring all tasks were completed effectively</mark>.
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1506452819137-0422416856b8?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: false,
  },
  {
    id: "ethical_dilemma",
    title: "Ethical Decision Making",
    description:
      "Describe an ethical dilemma you faced in your professional or academic life. How did you approach the situation, what factors did you consider, and how did you ultimately resolve it?",
    descriptionHighlight: `<p>
      Describe an <mark>ethical dilemma</mark> you faced in your professional or academic life. 
      How did you <mark>approach the situation</mark>, 
      what <mark>factors</mark> did you consider, 
      and how did you <mark>ultimately resolve it</mark>?
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1695720247431-2790feab65c0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: false,
  },
  {
    id: "creativity",
    title: "Creative Thinking",
    description:
      "Give an example of a time when you used creative thinking to solve a problem or improve a process. What was your inspiration, how did you implement your idea, and what was the impact?",
    descriptionHighlight: `<p>
      Give an example of a time when you used 
      <mark>creative thinking to solve a problem</mark> or improve a process. 
      What was your <mark>inspiration</mark>, 
      how did you <mark>implement your idea</mark>, 
      and what was the <mark>impact</mark>?
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1613579917953-d35e6b72d32b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: true,
  },
  {
    id: "goals",
    title: "Career Goals",
    description:
      "What are your short-term and long-term career goals? How have your past experiences shaped these goals, and what specific steps are you taking to achieve them?",
    descriptionHighlight: `<p>
      What are your <mark>short-term and long-term career goals</mark>? 
      How have your <mark>past experiences shaped these goals</mark>, 
      and what <mark>specific steps</mark> are you taking to achieve them?
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1506784926709-22f1ec395907?q=80&w=2068&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: true,
  },
  {
    id: "teamwork",
    title: "Team Collaboration",
    description:
      "Describe a successful team project you worked on. What was your specific role, how did you contribute to the team's success, and what did you learn about effective collaboration?",
    descriptionHighlight: `<p>
      Describe a <mark>successful team project</mark> you worked on. 
      What was your <mark>specific role</mark>, 
      how did you <mark>contribute to the team's success</mark>, 
      and what did you learn about <mark>effective collaboration</mark>?
    </p>`,
    required: true,
    image:
      "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    requireVideoAns: true,
  },
];

// Randomly select 5 questions
function getRandomQuestions(count = 5) {
  const shuffled = [...allInterviewQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Main component that will be wrapped with dynamic import
function HomeContent() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, AnswerData>>(
    {}
  );
  const [questions, setQuestions] = useState<typeof allInterviewQuestions>([]);
  const [isClient, setIsClient] = useState(false);
  const [isResumedSession, setIsResumedSession] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize questions on client-side only
  useEffect(() => {
    setIsClient(true);

    // Try to retrieve questions from localStorage
    const storedQuestions = localStorage.getItem("interviewQuestions");

    if (storedQuestions) {
      // If questions exist in localStorage, use them
      try {
        const parsedQuestions = JSON.parse(storedQuestions);
        setQuestions(parsedQuestions);
        setIsResumedSession(true); // Mark this as a resumed session
      } catch (error) {
        // If there's an error parsing, generate new questions
        const newQuestions = getRandomQuestions();
        setQuestions(newQuestions);
        localStorage.setItem(
          "interviewQuestions",
          JSON.stringify(newQuestions)
        );
        setIsResumedSession(false);
      }
    } else {
      // If no questions in localStorage, generate new ones for this session
      const newQuestions = getRandomQuestions();
      setQuestions(newQuestions);
      localStorage.setItem("interviewQuestions", JSON.stringify(newQuestions));
      setIsResumedSession(false);
    }

    // Also try to retrieve previous answers if they exist
    const storedAnswers = localStorage.getItem("interviewAnswers");
    if (storedAnswers) {
      try {
        setAnswers(JSON.parse(storedAnswers));
      } catch (error) {
        console.error("Failed to parse stored answers:", error);
      }
    }

    // Retrieve current question index if it exists
    const storedIndex = localStorage.getItem("currentQuestionIndex");
    if (storedIndex) {
      try {
        setCurrentQuestionIndex(parseInt(storedIndex, 10));
      } catch (error) {
        console.error("Failed to parse stored index:", error);
      }
    }
  }, []);

  // Use client-side questions or an empty array during server rendering
  const displayQuestions = isClient ? questions : [];

  const totalQuestions = displayQuestions.length;
  const progress =
    totalQuestions > 0
      ? Math.round((currentQuestionIndex / totalQuestions) * 100)
      : 0;

  // Listen for highlighting changes from accessibility panel
  useEffect(() => {
    if (isClient) {
      const handleHighlightingChange = () => {
        // Force refresh questions to trigger highlighting update
        const questionsCopy = [...questions];
        setQuestions(questionsCopy);
      };

      window.addEventListener("highlightingChanged", handleHighlightingChange);
      return () => {
        window.removeEventListener(
          "highlightingChanged",
          handleHighlightingChange
        );
      };
    }
  }, [isClient, questions]);

  // Optimized with useCallback and fixed the type to match what Questionnaire sends
  const handleQuestionAnswered = useCallback(
    (id: string | number, answer: AnswerData) => {
      // Use functional update to prevent state update during render
      setAnswers((prev) => {
        const newAnswers = { ...prev, [id]: answer };

        // Save answers to localStorage
        if (isClient) {
          localStorage.setItem("interviewAnswers", JSON.stringify(newAnswers));
        }

        return newAnswers;
      });
    },
    [isClient]
  );

  // Add useCallback to prevent recreating the handler on every render
  const handleQuestionChange = useCallback(
    (index: number) => {
      setCurrentQuestionIndex(index);

      // Save current index to localStorage
      if (isClient) {
        localStorage.setItem("currentQuestionIndex", index.toString());
      }
    },
    [isClient]
  );
  const handleSubmit = (
    submittedAnswers: Record<string | number, AnswerData>
  ) => {
    // Store answers directly without type conversion
    setAnswers(submittedAnswers);
    setIsSubmitted(true);

    // Save answers to localStorage
    if (isClient) {
      localStorage.setItem(
        "interviewAnswers",
        JSON.stringify(submittedAnswers)
      );
      localStorage.setItem("isSubmitted", "true");
    }

    // Optionally clear the stored questions to generate new ones for the next session
    // localStorage.removeItem('interviewQuestions');
  };

  // Check if submitted when component mounts
  useEffect(() => {
    if (isClient) {
      const storedSubmitted = localStorage.getItem("isSubmitted");
      if (storedSubmitted === "true") {
        setIsSubmitted(true);
      }
    }
  }, [isClient]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f0f13]">
      {/* Decorative elements for uniqueness */}
      <div className="absolute top-0 right-0 w-1/3 h-screen bg-gradient-to-b from-indigo-50/30 to-purple-50/10 dark:from-indigo-900/10 dark:to-purple-900/5 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-blue-50/20 to-transparent dark:from-blue-900/10 -z-10 blur-3xl"></div>

      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <UserRound className="text-indigo-600 dark:text-indigo-400 h-10 w-auto" />
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  InAble
                </h1>
              </div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                An accessible interview platform for everyone
              </p>
            </div>

            <div className="flex gap-2">
              <LanguageSwitcher />
              <AccessibilityPanel />
            </div>
          </div>

          {/* Unique decorative line */}
          <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent"></div>
        </header>

        {/* Grid-based layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main content area - spans 2 columns on larger screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Accessibility tools grid */}

            {/* Main question card */}
            <Card className="overflow-hidden border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-white via-white to-indigo-50/30 dark:from-[#16161d] dark:via-[#16161d] dark:to-indigo-900/10 rounded-xl">
              <div className="p-16 pt-16 pb-16 sm:p-6 relative z-10">
                {isClient ? (
                  <Tabs defaultValue="questions" className="w-full">
                    <TabsList className="mb-4 mt-4  bg-slate-100/80 dark:bg-slate-800/20 p-0 rounded-full w-full h-12 grid grid-cols-3">
                      <TabsTrigger
                        value="questions"
                        className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 py-2.5 px-3 flex items-center justify-center gap-2 text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:shadow-sm"
                      >
                        <UserRound className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="sm:inline">Questions</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="instructions"
                        className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 py-2.5 px-3 flex items-center justify-center gap-2 text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:shadow-sm"
                      >
                        <Book className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="sm:inline">Instructions</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="chat"
                        className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 py-2.5 px-3 flex items-center justify-center gap-2 text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:shadow-sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="sm:inline">Chat</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="questions"
                      className="space-y-6 focus:outline-none"
                    >
                      {!isSubmitted ? (
                        <Questionnaire
                          questions={displayQuestions}
                          onQuestionAnswered={handleQuestionAnswered}
                          onSubmit={handleSubmit}
                          onQuestionChange={handleQuestionChange}
                        />
                      ) : (
                        <div className="flex flex-col items-center py-10 space-y-6">
                          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
                            <Check className="w-16 h-16 text-green-600 dark:text-green-400" />
                          </div>
                          <h2 className="text-2xl font-bold text-center">
                            Interview Complete!
                          </h2>
                          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                            Thank you for completing your interview. Your
                            responses have been recorded.
                          </p>
                          <div className="flex gap-4 mt-6">
                            <Button
                              onClick={() =>
                                (window.location.href = "/feedback")
                              }
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                            >
                              Provide Feedback
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent
                      value="instructions"
                      className="focus:outline-none"
                    >
                      <div className="p-8 rounded-xl bg-gradient-to-br from-white via-white to-indigo-50/30 dark:from-[#1a1a24] dark:via-[#1a1a24] dark:to-indigo-900/10 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        <h3 className="text-2xl font-medium mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                          Interview Instructions
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="p-6 rounded-xl bg-white/80 dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-800/30 shadow-sm transform transition-transform duration-300 hover:scale-[1.02]">
                            <div className="flex items-center mb-4">
                              <div className="rounded-full p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mr-4">
                                <Clock className="h-5 w-5" />
                              </div>
                              <h4 className="font-medium text-lg">
                                Take Your Time
                              </h4>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 ml-14">
                              Answer each question thoroughly, thinking about
                              your past experiences and how they demonstrate
                              your skills.
                            </p>
                          </div>

                          <div className="p-6 rounded-xl bg-white/80 dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-800/30 shadow-sm transform transition-transform duration-300 hover:scale-[1.02]">
                            <div className="flex items-center mb-4">
                              <div className="rounded-full p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mr-4">
                                <Accessibility className="h-5 w-5" />
                              </div>
                              <h4 className="font-medium text-lg">
                                Accessibility Tools
                              </h4>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 ml-14">
                              Use the accessibility panel to customize your
                              experience with font size, contrast settings, and
                              more.
                            </p>
                          </div>

                          <div className="p-6 rounded-xl bg-white/80 dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-800/30 shadow-sm transform transition-transform duration-300 hover:scale-[1.02]">
                            <div className="flex items-center mb-4">
                              <div className="rounded-full p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mr-4">
                                <Coffee className="h-5 w-5" />
                              </div>
                              <h4 className="font-medium text-lg">
                                Take Breaks
                              </h4>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 ml-14">
                              If you need a moment to collect your thoughts, use
                              the break button in the timer section. You can
                              take one break during the interview.
                            </p>
                          </div>

                          <div className="p-6 rounded-xl bg-white/80 dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-800/30 shadow-sm transform transition-transform duration-300 hover:scale-[1.02]">
                            <div className="flex items-center mb-4">
                              <div className="rounded-full p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mr-4">
                                <Save className="h-5 w-5" />
                              </div>
                              <h4 className="font-medium text-lg">
                                Auto-saving
                              </h4>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 ml-14">
                              Your answers are automatically saved as you type.
                              If you need to leave and come back, your progress
                              will be preserved.
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0" />
                          <p className="text-sm text-amber-800 dark:text-amber-300">
                            Remember to prepare a professional environment
                            before starting video recordings. Ensure good
                            lighting and a clean background.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="chat" className="focus:outline-none">
                      <InterviewChat
                        candidateName="Candidate"
                        title="Interview Chat"
                        className="h-[400px] "
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex justify-center py-10">
                    <div className="animate-pulse text-indigo-600 dark:text-indigo-400">
                      Loading interview content...
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar with multiple cards in a grid layout */}
          <div className="space-y-6">
            {/* Progress card */}
            <Card className="p-5 border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#16161d] rounded-xl">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <div className="w-1 h-6 bg-indigo-500 dark:bg-indigo-400 mr-3 rounded-full"></div>
                Interview Progress
              </h3>

              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span>{progress}% Complete</span>
              </div>

              {isClient && (
                <div className="mt-2 text-xs">
                  {/* <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <span className={`w-2 h-2 mr-1.5 rounded-full ${isResumedSession ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                    {isResumedSession ? 'Resumed Session' : 'New Session'}
                  </span> */}
                </div>
              )}
            </Card>

            {/* Time remaining component */}
            <Card className="border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#16161d] rounded-xl overflow-hidden">
              <TimeRemaining
                initialTime={2700} // 45 minutes
                showBreakButtons={true}
                className="px-5 py-5"
              />
            </Card>
            {/* Interview details card */}
            <Card className="p-5 border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#16161d] rounded-xl">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <div className="w-1 h-6 bg-indigo-500 dark:bg-indigo-400 mr-3 rounded-full"></div>
                Interview Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Position
                  </p>
                  <p className="font-medium">Software Developer</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Company
                  </p>
                  <p className="font-medium">ING Hubs</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Duration
                  </p>
                  <p className="font-medium">45 minutes</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interviewer
                  </p>
                  <p className="font-medium">Stefan Rizescu</p>
                </div>
              </div>
            </Card>

            {/* Tips card */}
            <Card className="p-5 border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#16161d] rounded-xl">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <div className="w-1 h-6 bg-indigo-500 dark:bg-indigo-400 mr-3 rounded-full"></div>
                Interview Tips
              </h3>

              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 mr-2"></span>
                  Use the STAR method: Situation, Task, Action, Result
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 mr-2"></span>
                  Provide specific examples from your experience
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 mr-2"></span>
                  Take a moment to think before answering
                </li>
              </ul>
            </Card>
            <WhiteboardModal />
          </div>
        </div>
      </div>
    </main>
  );
}

// Create a dynamic version of HomeContent with SSR disabled
const DynamicHomeContent = dynamic(() => Promise.resolve(HomeContent), {
  ssr: false,
});

// Wrapper component to ensure client-side only rendering
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0f0f13]">
        <div className="animate-pulse text-indigo-600 dark:text-indigo-400">
          Loading interview platform...
        </div>
      </div>
    );
  }

  return <DynamicHomeContent />;
}
