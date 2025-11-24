"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Briefcase, CheckCircle2, Target } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";

type MatchingQuestion = {
  id: string;
  question: string;
  category: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
};

const matchingQuestions: MatchingQuestion[] = [
  {
    id: "work_preference",
    question: "What type of work arrangement appeals to you most?",
    category: "Work Style",
    options: [
      { value: "fulltime", label: "Full-time Career", description: "Stable employment with benefits and growth potential" },
      { value: "freelance", label: "Freelance & Side Hustles", description: "Flexible projects and gig-based work" },
      { value: "founder", label: "Start a Business", description: "Build and scale your own AI-powered company" },
      { value: "trade", label: "Skilled Trade Work", description: "Specialized AI tasks like prompting, annotation, QA" }
    ]
  },
  {
    id: "career_stage",
    question: "Where are you in your career journey?",
    category: "Experience",
    options: [
      { value: "entry", label: "Just Starting Out", description: "New to the workforce or changing careers" },
      { value: "early", label: "Early Career (1-3 years)", description: "Some professional experience" },
      { value: "mid", label: "Mid-Level (4-7 years)", description: "Established in my field" },
      { value: "senior", label: "Senior (8+ years)", description: "Extensive experience and expertise" }
    ]
  },
  {
    id: "ai_tools_experience",
    question: "Which AI tools have you used? (Select the one you use most)",
    category: "AI Experience",
    options: [
      { value: "chatgpt_advanced", label: "ChatGPT (extensively)", description: "Regular daily use, advanced prompting" },
      { value: "chatgpt_basic", label: "ChatGPT (occasionally)", description: "Used it a few times, still learning" },
      { value: "multiple_tools", label: "Multiple AI Tools", description: "Claude, Midjourney, GitHub Copilot, etc." },
      { value: "none", label: "No AI tools yet", description: "Ready to start learning" }
    ]
  },
  {
    id: "coding_ability",
    question: "What's your coding experience?",
    category: "Technical Skills",
    options: [
      { value: "professional", label: "Professional Developer", description: "I code for a living" },
      { value: "intermediate", label: "Can Code", description: "Built projects, comfortable with programming" },
      { value: "beginner", label: "Learning to Code", description: "Know basics, still developing skills" },
      { value: "none", label: "No Coding", description: "Prefer no-code solutions" }
    ]
  },
  {
    id: "domain_interest",
    question: "Which area interests you most?",
    category: "Domain",
    options: [
      { value: "technical", label: "Technical & Engineering", description: "Building, automating, and solving technical problems" },
      { value: "creative", label: "Creative & Content", description: "Writing, design, storytelling, and media creation" },
      { value: "business", label: "Business & Strategy", description: "Growth, operations, product development" },
      { value: "people", label: "People & Communication", description: "Customer success, sales, teaching, support" }
    ]
  },
  {
    id: "work_environment",
    question: "What's your ideal work environment?",
    category: "Culture",
    options: [
      { value: "startup", label: "Startup Energy", description: "Fast-paced, lots of ownership, high growth potential" },
      { value: "established", label: "Established Company", description: "Structured processes, clear career path, stability" },
      { value: "independent", label: "Work Independently", description: "Solo or small team, flexible schedule" },
      { value: "collaborative", label: "Highly Collaborative", description: "Team-focused, lots of interaction" }
    ]
  },
  {
    id: "learning_style",
    question: "How do you prefer to learn new skills?",
    category: "Learning",
    options: [
      { value: "hands_on", label: "Hands-on Practice", description: "Jump in and learn by doing" },
      { value: "structured", label: "Structured Courses", description: "Step-by-step guidance and curriculum" },
      { value: "self_directed", label: "Self-Directed Research", description: "Find resources and figure it out myself" },
      { value: "mentorship", label: "Mentorship & Guidance", description: "Learn from experienced professionals" }
    ]
  },
  {
    id: "income_priority",
    question: "What's most important for your income?",
    category: "Compensation",
    options: [
      { value: "stability", label: "Stable Salary", description: "Predictable income, benefits" },
      { value: "upside", label: "High Earning Potential", description: "Willing to take risks for bigger rewards" },
      { value: "flexibility", label: "Flexible Earnings", description: "Variable income based on projects" },
      { value: "equity", label: "Equity & Ownership", description: "Build long-term wealth through ownership" }
    ]
  },
  {
    id: "time_commitment",
    question: "How much time can you dedicate?",
    category: "Availability",
    options: [
      { value: "fulltime_40", label: "40+ hours/week", description: "Full-time commitment" },
      { value: "parttime_20", label: "20-30 hours/week", description: "Part-time or side project" },
      { value: "parttime_10", label: "10-15 hours/week", description: "Evenings and weekends" },
      { value: "flexible", label: "Flexible/Variable", description: "Depends on the opportunity" }
    ]
  },
  {
    id: "risk_tolerance",
    question: "How comfortable are you with uncertainty?",
    category: "Risk",
    options: [
      { value: "low", label: "Prefer Stability", description: "Want clear expectations and security" },
      { value: "moderate", label: "Some Risk OK", description: "Open to calculated risks" },
      { value: "high", label: "Embrace Uncertainty", description: "Thrive in ambiguous situations" },
      { value: "very_high", label: "High Risk, High Reward", description: "All-in on big opportunities" }
    ]
  }
];

type AssessmentStep = 'welcome' | 'questions' | 'processing';

export default function MatchingQuiz() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?._id as any;

  const [step, setStep] = useState<AssessmentStep>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const saveQuizResult = useMutation(api.quizResults.saveQuizResult);

  const progress = ((currentQuestion + 1) / matchingQuestions.length) * 100;
  const currentQ = matchingQuestions[currentQuestion];
  const hasAnswer = answers[currentQ?.id];

  const handleStartQuiz = () => {
    setStep('questions');
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQ.id]: value });
  };

  const handleNext = async () => {
    if (currentQuestion < matchingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await saveResults();
      setStep('processing');
      // Redirect to matching zone after a brief moment
      setTimeout(() => {
        router.push('/matching');
      }, 2000);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const saveResults = async () => {
    if (!userId) {
      // Fallback to localStorage if not logged in
      localStorage.setItem('matching_quiz_results', JSON.stringify({
        answers,
        completedAt: new Date().toISOString()
      }));
      return;
    }

    try {
      await saveQuizResult({
        userId,
        quizType: "matching",
        answers,
      });
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      // Fallback to localStorage
      localStorage.setItem('matching_quiz_results', JSON.stringify({
        answers,
        completedAt: new Date().toISOString()
      }));
    }
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gradient-from to-gradient-to mb-4">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Find Your Perfect AI Career Match</h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Answer 10 quick questions to discover which AI opportunities align best with your goals, skills, and preferences.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-2">We'll match you to opportunities across:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Full-time AI Careers (18 roles)</li>
                    <li>Freelance Side Hustles (7 opportunities)</li>
                    <li>AI Business Ideas (6 founder paths)</li>
                    <li>Specialized AI Trades (8 positions)</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartQuiz}
              className="w-full bg-gradient-to-r from-gradient-from to-gradient-to h-12 text-base"
              size="lg"
              data-testid="button-start-matching-quiz"
            >
              Start Career Match Quiz
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Takes about 3 minutes • No account required
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Processing Screen
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gradient-from to-gradient-to mb-4 animate-pulse">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Preferences...</h2>
            <p className="text-muted-foreground mb-6">Finding your perfect AI career matches</p>
            <Progress value={100} className="mb-4" />
            <p className="text-sm text-muted-foreground">Redirecting you to your personalized matches...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Questions Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {matchingQuestions.length}
            </span>
            <span className="text-sm font-medium text-primary">{currentQ.category}</span>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-2xl">{currentQ.question}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <RadioGroup value={answers[currentQ.id] || ""} onValueChange={handleAnswer}>
            <div className="space-y-3">
              {currentQ.options.map((option) => (
                <div
                  key={option.value}
                  className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                    answers[currentQ.id] === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => handleAnswer(option.value)}
                  data-testid={`option-${option.value}`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className="font-medium mb-1">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="bg-gradient-to-r from-gradient-from to-gradient-to"
              data-testid="button-next"
            >
              {currentQuestion === matchingQuestions.length - 1 ? 'See My Matches' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
