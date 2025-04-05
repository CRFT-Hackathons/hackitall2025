"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccessibilityPanel from "@/components/accessibility-panel";
import TimeDisplayButton from "@/components/time-display-button";
import { TimeRemaining } from "@/components/time-remaining";
import { Questionnaire } from "@/components/questionnaire";
import { TwoPersonChat } from "@/components/interview-chat";
import {
  Pause,
  Mic,
  Clock,
  UserRound,
} from "lucide-react";
import { useState } from "react";

// Sample questions for the interview
const interviewQuestions = [
  {
    id: "introduce",
    title: "Tell us about yourself",
    description: "Tell us about a challenging project you worked on and how you overcame obstacles. What skills did you develop during this process?",
    required: true
  },
  {
    id: "teamwork",
    title: "Teamwork Experience",
    description: "Describe a situation where you had to work effectively as part of a team. What was your role in the team and how did you contribute to the team's success?",
    required: true
  },
  {
    id: "technical",
    title: "Technical Knowledge",
    description: "Explain how you would design a scalable web application. What technologies would you choose and why?",
    required: true
  },
  {
    id: "challenges",
    title: "Problem Solving",
    description: "Tell us about a time when you faced a significant technical challenge. How did you approach it and what was the outcome?",
    required: true
  },
  {
    id: "goals",
    title: "Career Goals",
    description: "What are your short-term and long-term career goals? How does this position align with those goals?",
    required: false
  }
];

export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const totalQuestions = interviewQuestions.length;
  const progress = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleQuestionAnswered = (id: string | number, answer: string) => {
    console.log(`Question ${id} answered:`, answer);
    setAnswers(prev => ({ ...prev, [id]: answer }));
  };

  const handleQuestionChange = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = (submittedAnswers: Record<string, string>) => {
    console.log("All answers submitted:", submittedAnswers);
    setAnswers(submittedAnswers);
  };

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
                <UserRound className="text-indigo-400 h-10 w-auto" />
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  InAble
                </h1>
              </div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                An accessible interview platform for everyone
              </p>
            </div>

            <AccessibilityPanel />
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
            <Card className="overflow-hidden border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#16161d] relative rounded-xl">
              {/* Unique corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-transparent dark:from-indigo-900/20 -z-0"></div>

              <div className="p-6 relative z-10">
                <Tabs defaultValue="questions" className="w-full">
                  <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full w-fit">
                    <TabsTrigger
                      value="questions"
                      className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 px-6"
                    >
                      Questions
                    </TabsTrigger>
                    <TabsTrigger
                      value="instructions"
                      className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 px-6"
                    >
                      Instructions
                    </TabsTrigger>
                    <TabsTrigger
                      value="chat"
                      className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 px-6"
                    >
                      Chat
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="questions"
                    className="space-y-4 focus:outline-none"
                  >
                    <Questionnaire 
                      questions={interviewQuestions}
                      onQuestionAnswered={handleQuestionAnswered}
                      onSubmit={handleSubmit}
                      onQuestionChange={handleQuestionChange}
                    />
                  </TabsContent>

                  <TabsContent
                    value="instructions"
                    className="focus:outline-none"
                  >
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-slate-700/50">
                      <h3 className="text-xl font-medium mb-4">
                        Interview Instructions
                      </h3>
                      <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 mr-2"></span>
                          Take your time to answer each question thoroughly.
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 mr-2"></span>
                          Use the accessibility tools in the toolbar as needed.
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 mr-2"></span>
                          If you need a break, use the Timeout button.
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 mr-2"></span>
                          Your answers will be automatically saved as you type.
                        </li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="chat" className="focus:outline-none">
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-slate-700/50">
                      <TwoPersonChat
                        user1Name="Interviewer"
                        user2Name="Candidate"
                        title="Interview Chat"
                        className="h-[400px]"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
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
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span>{progress}% Complete</span>
              </div>
            </Card>

            {/* Time remaining component */}
            <Card className="border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#16161d] rounded-xl overflow-hidden">
              <TimeRemaining 
                initialTime={2700} // 45 minutes
                showBreakButtons={true}
                className="px-5 py-5 mb-1"
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
          </div>
        </div>
      </div>
    </main>
  );
}
