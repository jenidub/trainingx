"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { computeMatches } from "@/lib/matching";
import { SkillSignals } from "@/lib/scoring";
import { Briefcase, Building2, DollarSign, Sparkles, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const categoryIcons = {
  career: Briefcase,
  business: Building2,
  side: DollarSign,
};

const categoryColors = {
  career: "from-blue-500 to-blue-600",
  business: "from-purple-500 to-purple-600",
  side: "from-green-500 to-green-600",
};

const categoryLabels = {
  career: "Career Path",
  business: "Business",
  side: "Side Project",
};

const defaultSkills: SkillSignals = {
  generative_ai: 0,
  agentic_ai: 0,
  synthetic_ai: 0,
  coding: 0,
  agi_readiness: 0,
  communication: 0,
  logic: 0,
  planning: 0,
  analysis: 0,
  creativity: 0,
  collaboration: 0,
};

const demoQuizQuestions = [
  { question: "What's your primary interest?", answer: "Building AI products" },
  { question: "Preferred work style?", answer: "Remote-first teams" },
  { question: "Income goals?", answer: "High growth potential" },
];

export default function SkillsMatchingDemo() {
  const [quizStep, setQuizStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchesVisible, setMatchesVisible] = useState(false);
  const [demoSkills, setDemoSkills] = useState<SkillSignals>(defaultSkills);

  // Get real matches
  const allMatches = useMemo(
    () => computeMatches(65, demoSkills, 3, []),
    [demoSkills]
  );

  const previewMatches = useMemo(() => {
    const matchesByType = allMatches.reduce(
      (acc, match) => {
        if (!acc[match.type]) acc[match.type] = [];
        acc[match.type].push(match);
        return acc;
      },
      {} as Record<string, typeof allMatches>
    );

    const preview: typeof allMatches = [];
    ['career', 'business', 'side'].forEach(type => {
      if (matchesByType[type] && matchesByType[type].length > 0) {
        preview.push(matchesByType[type][0]);
      }
    });
    
    return preview.slice(0, 3);
  }, [allMatches]);

  useEffect(() => {
    // Auto-play the demo
    const timer1 = setTimeout(() => {
      setQuizStep(1);
    }, 1000);

    const timer2 = setTimeout(() => {
      setQuizStep(2);
    }, 2500);

    const timer3 = setTimeout(() => {
      setQuizStep(3);
    }, 4000);

    const timer4 = setTimeout(() => {
      setIsAnalyzing(true);
      // Simulate skill building
      setDemoSkills({
        generative_ai: 70,
        agentic_ai: 65,
        synthetic_ai: 60,
        coding: 55,
        agi_readiness: 68,
        communication: 75,
        logic: 72,
        planning: 68,
        analysis: 70,
        creativity: 73,
        collaboration: 70,
      });
    }, 5500);

    const timer5 = setTimeout(() => {
      setIsAnalyzing(false);
      setMatchesVisible(true);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  return (
    <AnimatedSection className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Skills-Based{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Opportunity Matching
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            See how we match your skills to real opportunities
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Quiz Demo */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Quick Skills Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoQuizQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                    quizStep > idx
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{q.question}</p>
                      {quizStep > idx && (
                        <p className="font-semibold text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {q.answer}
                        </p>
                      )}
                    </div>
                    {quizStep > idx && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
              
              {quizStep >= 3 && (
                <div className="mt-4">
                  <Progress value={100} className="h-2" />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Assessment complete!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analyzing State */}
          {isAnalyzing && (
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-bold mb-2">Analyzing Your Skills...</h3>
                <p className="text-gray-600">
                  Matching your profile to {allMatches.length}+ opportunities
                </p>
              </CardContent>
            </Card>
          )}

          {/* Matches Reveal */}
          {matchesVisible && previewMatches.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">
                  🎯 Your Personalized Matches
                </h3>
                <p className="text-gray-600">
                  Based on your skills and preferences
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {previewMatches.map((match, idx) => {
                  const Icon = categoryIcons[match.type as keyof typeof categoryIcons] || Briefcase;
                  const colorClass = categoryColors[match.type as keyof typeof categoryColors] || categoryColors.career;
                  
                  return (
                    <Card
                      key={match.title}
                      className="flex flex-col hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${idx * 200}ms` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <CardTitle className="text-lg">{match.title}</CardTitle>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            Match
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[match.type as keyof typeof categoryLabels] || match.type}
                          </Badge>
                          {match.seniority && (
                            <Badge variant="secondary" className="text-xs">
                              {match.seniority}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        {match.salaryRange && (
                          <div className="p-3 bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 rounded-lg">
                            <div className="font-semibold text-gray-800">
                              {match.salaryRange}
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-gray-600 italic">{match.reason}</p>

                        {match.requiredSkills.length > 0 && (
                          <div>
                            <div className="text-sm text-gray-600 mb-2 font-medium">
                              Skills Matched:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {match.requiredSkills.slice(0, 3).map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-xs capitalize bg-green-50 border-green-200"
                                >
                                  {skill.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-gradient-from to-gradient-to"
                        >
                          <Link href="/matching">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              <div className="text-center pt-6">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white hover:bg-gray-50"
                >
                  <Link href="/matching">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Your Personalized Matches
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}

