"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { 
  UserRound, 
  Heart, 
  Check, 
  Star, 
  ChevronLeft, 
  Send 
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import dynamic from 'next/dynamic';

// Create a component that will only render on the client side
const FeedbackContent = () => {
  const [rating, setRating] = useState(3);
  const [accessibilityRating, setAccessibilityRating] = useState(3);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [improvementArea, setImprovementArea] = useState("interface");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would send this to your backend
    console.log({
      overallRating: rating,
      accessibilityRating,
      feedbackText,
      improvementArea
    });
    
    // Show success message
    setFeedbackSubmitted(true);
    
    // In a real app, you might store this in localStorage or your backend
    // to prevent multiple submissions
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f0f13]">
      {/* Decorative elements */}
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
          </div>

          {/* Decorative line */}
          <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent"></div>
        </header>

        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-white via-white to-indigo-50/30 dark:from-[#16161d] dark:via-[#16161d] dark:to-indigo-900/10 rounded-xl p-8">
            {!feedbackSubmitted ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Share Your Feedback
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
                  Your feedback helps us improve the interview experience for everyone.
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Overall Rating */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">How was your overall experience?</h3>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="rating" className="sr-only">Rating</Label>
                      <div className="flex gap-3 w-full">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className={`flex-1 py-3 rounded-lg border ${
                              rating === value 
                                ? "bg-indigo-100 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700" 
                                : "border-slate-200 hover:border-indigo-200 dark:border-slate-700 dark:hover:border-indigo-800"
                            } transition-colors`}
                          >
                            <Star 
                              className={`w-6 h-6 mx-auto ${
                                rating >= value 
                                  ? "fill-indigo-500 text-indigo-500 dark:fill-indigo-400 dark:text-indigo-400" 
                                  : "text-slate-300 dark:text-slate-600"
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Accessibility Rating */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">How accessible was the interview platform?</h3>
                    <div className="py-4">
                      <Slider
                        defaultValue={[3]}
                        max={5}
                        step={1}
                        value={[accessibilityRating]}
                        onValueChange={(values) => setAccessibilityRating(values[0])}
                        className="py-2"
                      />
                      <div className="flex justify-between mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>Needs Improvement</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  </div>

                  {/* Improvement Areas */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Which area needs the most improvement?</h3>
                    <RadioGroup
                      value={improvementArea}
                      onValueChange={setImprovementArea}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      <div className="flex items-center space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <RadioGroupItem value="interface" id="interface" />
                        <Label htmlFor="interface" className="flex-1 cursor-pointer">User Interface</Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <RadioGroupItem value="accessibility" id="accessibility" />
                        <Label htmlFor="accessibility" className="flex-1 cursor-pointer">Accessibility Options</Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <RadioGroupItem value="questions" id="questions" />
                        <Label htmlFor="questions" className="flex-1 cursor-pointer">Interview Questions</Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <RadioGroupItem value="performance" id="performance" />
                        <Label htmlFor="performance" className="flex-1 cursor-pointer">Performance</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Detailed Feedback */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Any additional feedback for us?</h3>
                    <Textarea 
                      placeholder="Tell us what you liked or what we could improve..."
                      className="min-h-[120px] border-slate-200 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-700"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center py-6 space-y-6">
                <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
                  <Check className="w-16 h-16 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-center">
                  Thank You For Your Feedback!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                  We appreciate you taking the time to provide feedback. Your input helps us create a better platform for everyone.
                </p>
                <div className="flex items-center text-indigo-600 dark:text-indigo-400 mt-4">
                  <Heart className="h-5 w-5 mr-2 fill-indigo-500/20 text-indigo-500 dark:fill-indigo-400/20 dark:text-indigo-400" />
                  <span className="font-medium">Your feedback matters to us</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
};

// Dynamically load the component with SSR disabled
const FeedbackPage = dynamic(() => Promise.resolve(FeedbackContent), {
  ssr: false,
});

export default function Page() {
  const [mounted, setMounted] = useState(false);
  
  // Only show the component after it has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Show a minimal loading state until client-side rendering is ready
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0f0f13]">
        <div className="animate-pulse text-indigo-600 dark:text-indigo-400">Loading feedback form...</div>
      </div>
    );
  }

  return <FeedbackPage />;
} 