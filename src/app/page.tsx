import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccessibilityPanel from "@/components/accessibility-panel";
import TimeDisplayButton from "@/components/time-display-button";
import { TwoPersonChat } from "@/components/interview-chat";
import {
  Eye,
  Pause,
  Volume2,
  Globe,
  Mic,
  Clock,
  ChevronRight,
  ChevronLeft,
  UserRound,
  MessageSquare,
} from "lucide-react";

export default function Home() {
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
              >
                <Volume2 className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                <span>Text to Speech</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
              >
                <Globe className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                <span>Translate</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
              >
                <Eye className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                <span>Eye Tracking</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:hover:bg-indigo-800 dark:text-indigo-300 transition-all"
              >
                <Pause className="h-4 w-4 mr-2" />
                <span>Timeout</span>
              </Button>
            </div>

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
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="questions"
                    className="space-y-4 focus:outline-none"
                  >
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center mb-4">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium mr-3">
                          1
                        </span>
                        <h3 className="text-xl font-medium">
                          Tell us about yourself
                        </h3>
                      </div>

                      <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                        Tell us about a challenging project you worked on and
                        how you overcame obstacles. What skills did you develop
                        during this process?
                      </p>

                      <div className="space-y-4">
                        <textarea
                          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#13131b] min-h-[150px] focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-700 focus:outline-none transition-all dyslexic-font"
                          placeholder="Type your answer here..."
                        />

                        <div className="flex flex-wrap gap-3 justify-between">
                          <Button
                            variant="outline"
                            className="rounded-xl border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                          >
                            <Mic className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                            Voice Input
                          </Button>
                          <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white">
                            Submit Answer
                          </Button>
                        </div>
                      </div>
                    </div>
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

                  <TabsContent
                    value="chat"
                    className="focus:outline-none"
                  >
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

            {/* Navigation buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="rounded-xl border-indigo-200 dark:border-indigo-800"
                disabled
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Question
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              >
                Next Question
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
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
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span>Question 1 of 5</span>
                <span>20% Complete</span>
              </div>
            </Card>

            {/* Time card */}
            <Card className="p-5 border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-[#16161d] rounded-xl">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <div className="w-1 h-6 bg-indigo-500 dark:bg-indigo-400 mr-3 rounded-full"></div>
                Time Remaining
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center"></div>
                  <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <TimeDisplayButton />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                >
                  <Pause className="h-4 w-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                  Pause
                </Button>
              </div>
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
