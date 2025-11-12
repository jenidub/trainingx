"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadState, saveState } from "@/lib/storage";
import { computePromptScore, computeSkillSignals, Rubric } from "@/lib/scoring";
import { trackEvent } from "@/lib/analytics";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import scenariosBank from "@/data/scenarios-bank.json";
import badgeRules from "@/data/badge-rules.json";
import { ArrowRight, Lightbulb, Award, ChevronLeft, Target, Sparkles, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Step, MultipleChoiceOption, Project as ProjectType } from "@/lib/shared-types";
import { useWizardContext } from "@/contexts/WizardContextProvider";

type Scenario = {
  id: string;
  challenge: string;
  context?: string;
  requirements?: string[];
  audience?: string;
};

export default function PracticeProjectPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [promptText, setPromptText] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<MultipleChoiceOption | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rubric, setRubric] = useState<Rubric>({
    clarity: 15,
    constraints: 15,
    iteration: 15,
    tool: 15
  });
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);
  const { setContext } = useWizardContext();

  // Fetch project from Convex by slug
  const project = useQuery(
    api.practiceProjects.getBySlug,
    params.slug ? { slug: params.slug as string } : "skip"
  ) as ProjectType | undefined;

  // Track if we're still loading (undefined means loading, null means not found)
  const isLoadingProject = project === undefined && params.slug;

  // Convex mutations (must be at top level, not conditional)
  const completeProjectMutation = useMutation(api.users.completeProject);
  const updateSkillsMutation = useMutation(api.users.updateSkills);
  const updateMultipleSkillsMutation = useMutation(api.practiceUserSkills.updateMultipleSkills);

  // Fetch user stats from Convex
  const convexUserStats = useQuery(
    api.users.getUserStats,
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Load user state once and memoize it - use Convex data or localStorage or default
  const [userState] = useState(() => {
    const localState = loadState();
    if (localState) return localState;
    
    // Return default state if no localStorage
    return {
      promptScore: 0,
      previousPromptScore: 0,
      rubric: { clarity: 0, constraints: 0, iteration: 0, tool: 0 },
      skills: {
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
      },
      previousSkills: undefined,
      badges: [],
      completedProjects: [],
      assessmentHistory: [],
      streak: 0,
      lastActiveDate: Date.now(),
      assessmentComplete: false,
      unlockedCareers: [],
      weeklyPracticeMinutes: 0,
      communityActivity: {
        postsCreated: 0,
        upvotesReceived: 0,
        downvotesReceived: 0,
        helpfulAnswers: 0,
        communityScore: 0,
      },
    };
  });

  // Sync with Convex data if available
  useEffect(() => {
    if (convexUserStats && !loadState()) {
      // If we have Convex data but no localStorage, save it
      saveState({
        ...userState,
        promptScore: convexUserStats.promptScore || 0,
        rubric: convexUserStats.rubric || userState.rubric,
        skills: convexUserStats.skills || userState.skills,
        badges: convexUserStats.badges || [],
        completedProjects: convexUserStats.completedProjects || [],
        assessmentComplete: convexUserStats.assessmentComplete || false,
      });
    }
  }, [convexUserStats]);

  // Get current step data - prioritize stepDetails if available
  const currentStepData: Step | null = project?.stepDetails?.[currentStep - 1] || null;

  // Update wizard context whenever state changes
  useEffect(() => {
    if (project && userState && currentStepData) {
      const ps = computePromptScore(rubric);

      setContext({
        page: 'project-workspace',
        pageTitle: `${project.title} - Step ${currentStep}`,
        userState: {
          promptScore: userState.promptScore,
          skills: userState.skills,
          completedProjects: userState.completedProjects.length,
          badges: userState.badges.length,
          level: project.level
        },
        project: {
          slug: project.slug,
          title: project.title,
          category: project.category,
          level: project.level,
          currentStep: currentStep,
          totalSteps: project.steps,
          question: currentStepData.type === 'multiple-choice' ? currentStepData.question : undefined,
          userSelected: selectedAnswer && showFeedback ? {
            quality: selectedAnswer.quality,
            text: selectedAnswer.text,
            explanation: selectedAnswer.explanation
          } : undefined,
          stepScore: showFeedback && selectedAnswer ? ps / 4 : undefined
        },
        recentAction: showFeedback ? `Selected ${selectedAnswer?.quality} answer and viewed feedback` : selectedAnswer ? `Selected an answer` : undefined
      });
    }

    // Clear context when leaving the page
    return () => setContext(undefined);
  }, [project, currentStep, selectedAnswer, showFeedback, rubric, userState, currentStepData]);

  // Randomly select scenarios for this project session
  useEffect(() => {
    if (project && selectedScenarios.length === 0) {
      const projectScenarios = scenariosBank[project.slug as keyof typeof scenariosBank] || [];
      const shuffled = [...projectScenarios].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, project.steps);
      setSelectedScenarios(selected);
      trackEvent('project_start', { projectSlug: project.slug });
    }
  }, [project]);

  // Show loading state while fetching
  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-from mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show not found only after loading is complete
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <Link href="/practice">
              <Button>Back to Practice Zone</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // userState is always defined now (either from localStorage or default)

  const ps = computePromptScore(rubric);
  const skills = computeSkillSignals(rubric);
  const progressPercent = (currentStep / project.steps) * 100;

  const handleNextStep = () => {
    // For multiple-choice questions, first show feedback if not already shown
    if (currentStepData?.type === 'multiple-choice') {
      if (!showFeedback && selectedAnswer) {
        // Show feedback on first click
        setShowFeedback(true);

        // Score based on selected quality
        const stepBonus = currentStep * 2;
        let baseScore = 12;

        if (selectedAnswer.quality === 'good') {
          baseScore = 20;
        } else if (selectedAnswer.quality === 'almost') {
          baseScore = 15;
        } else {
          baseScore = 8;
        }

        setRubric({
          clarity: Math.min(25, baseScore + stepBonus + Math.floor(Math.random() * 2)),
          constraints: Math.min(25, baseScore + stepBonus + Math.floor(Math.random() * 2)),
          iteration: Math.min(25, baseScore + stepBonus + Math.floor(Math.random() * 2)),
          tool: Math.min(25, baseScore + stepBonus + Math.floor(Math.random() * 2))
        });
        return; // Don't advance yet, let user see feedback
      }
    } else {
      // Text-based scoring (original logic)
      const promptLength = promptText.length;
      const hasSubstance = promptLength > 50;

      if (hasSubstance) {
        const stepBonus = currentStep * 2;
        const baseScore = 12 + Math.min(Math.floor(promptLength / 30), 8);

        setRubric({
          clarity: Math.min(25, baseScore + stepBonus + Math.floor(Math.random() * 3)),
          constraints: Math.min(25, baseScore + stepBonus + Math.floor(Math.random() * 3)),
          iteration: Math.min(25, baseScore + stepBonus + Math.floor(Math.random() * 2)),
          tool: Math.min(25, baseScore + stepBonus + Math.floor(Math.random() * 2))
        });
      }
    }

    trackEvent('project_step_submit', {
      projectSlug: project.slug,
      step: currentStep,
      promptScore: ps
    });

    if (currentStep < project.steps) {
      setCurrentStep(currentStep + 1);
      setPromptText("");
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      completeProject();
    }
  };

  const completeProject = async () => {
    if (!user?._id) return;

    const badgeInfo = badgeRules[project.badge as keyof typeof badgeRules];
    const earnedBadge = ps >= (badgeInfo?.minPS || 0);

    const skillsGained: string[] = [];
    
    // Determine correctness based on score (>70 = correct)
    const correct = ps >= 70;
    
    // Map project score to item difficulty (higher score = harder item)
    const itemDifficulty = 1300 + (ps * 4); // 0->1300, 100->1700

    const newRubric = {
      clarity: Math.max(userState.rubric.clarity, rubric.clarity),
      constraints: Math.max(userState.rubric.constraints, rubric.constraints),
      iteration: Math.max(userState.rubric.iteration, rubric.iteration),
      tool: Math.max(userState.rubric.tool, rubric.tool)
    };

    const newPromptScore = Math.max(userState.promptScore, ps);

    try {
      // Update Elo ratings for each skill
      const skillUpdates = project.buildsSkills.map(skill => ({
        skillId: skill,
        itemDifficulty,
        correct,
      }));
      
      await updateMultipleSkillsMutation({
        userId: user._id as any,
        updates: skillUpdates,
      });

      // Track which skills were practiced
      skillsGained.push(...project.buildsSkills);

      // Save project completion to Convex
      await completeProjectMutation({
        userId: user._id as any,
        projectSlug: project.slug,
        finalScore: ps,
        rubric: { ...rubric },
        badgeEarned: earnedBadge,
        badgeId: earnedBadge ? project.badge : undefined,
        skillsGained,
      });

      // Update prompt score and rubric
      await updateSkillsMutation({
        userId: user._id as any,
        skills: userState.skills, // Keep old skills for now
        promptScore: newPromptScore,
        rubric: newRubric,
      });

      // Also save to localStorage for backward compatibility
      const updatedState = {
        ...userState,
        completedProjects: [...userState.completedProjects, {
          slug: project.slug,
          completedAt: new Date().toISOString(),
          finalScore: ps,
          rubric: { ...rubric },
          badgeEarned: earnedBadge,
          skillsGained
        }],
        badges: earnedBadge && !userState.badges.includes(project.badge)
          ? [...userState.badges, project.badge]
          : userState.badges,
        previousPromptScore: userState.promptScore,
        promptScore: newPromptScore,
        previousSkills: userState.skills,
        skills: userState.skills, // Skills now managed by Elo system
        rubric: newRubric
      };

      saveState(updatedState);

      trackEvent('project_complete', {
        projectSlug: project.slug,
        badgeEarned: earnedBadge,
        finalPS: ps
      });

      if (earnedBadge) {
        trackEvent('badge_earned', { badgeId: project.badge, badgeName: badgeInfo?.name });
      }

      // Redirect to results page
      router.push(`/practice/${project.slug}/result`);
    } catch (error) {
      console.error('Failed to save project completion:', error);
      // Still redirect even if save fails
      router.push(`/practice/${project.slug}/result`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/practice">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Practice Zone
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Step {currentStep} of {project.steps}</span>
            <span>•</span>
            <span>{project.category}</span>
          </div>
        </div>

        {/* Row 1: Challenge + Prompt Input */}
        <div className="flex flex-col md:flex-row gap-6 mt-[20px] mb-[20px]">
          {/* Challenge Info - Left */}
          <div className="flex-1">
            {(currentStepData || selectedScenarios[currentStep - 1]) && (
              <Card className="border-2 border-gradient-from/30 bg-gradient-to-br from-gradient-from/5 to-gradient-to/5 h-full">
                <CardContent className="px-6">
                  <div className="flex flex-col items-start gap-3 mb-4">
                    <Target className="h-6 w-6 text-gradient-from mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">
                          {project.isAssessment ? "Assessment Challenge" : `Your Challenge (Step ${currentStep})`}
                        </h3>
                        {project.isAssessment && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            No Guidance
                          </span>
                        )}
                      </div>
                      <p className="text-base font-medium text-gray-800 mb-3">
                        {currentStepData?.question || selectedScenarios[currentStep - 1]?.challenge}
                      </p>

                    </div>
                      {/* Only show detailed guidance for non-assessment challenges with legacy scenarios */}
                      {!project.isAssessment && selectedScenarios[currentStep - 1]?.context && (
                        <>
                          <div className="bg-white/70 rounded-lg p-4 mb-3">
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Context:</strong> {selectedScenarios[currentStep - 1]?.context}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Audience:</strong> {selectedScenarios[currentStep - 1]?.audience}
                            </p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-4  w-full">
                            <h4 className="text-sm font-semibold mb-2">Requirements for your prompt:</h4>
                            <ul className="space-y-1">
                              {selectedScenarios[currentStep - 1]?.requirements?.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-gradient-from mt-0.5">✓</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {project.isAssessment && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3 w-full">
                          <p className="text-sm text-yellow-800">
                            <strong>Assessment Mode:</strong> Demonstrate your prompting skills without guidance. Consider audience, constraints, format, and all necessary details in your prompt.
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Answer Section - Right */}
          <div className="flex-1">
            <Card className="">
              <CardContent className="px-6">
                {currentStepData?.type === 'multiple-choice' ? (
                  <>
                    <h3 className="text-lg font-semibold">Select the Best Prompt</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose which prompt best addresses the challenge above.
                    </p>
                    <div className="space-y-3 mb-4">
                      {currentStepData.options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        const borderColor = showFeedback
                          ? option.quality === 'good' ? 'border-green-500'
                          : option.quality === 'almost' ? 'border-yellow-500'
                          : 'border-red-500'
                          : isSelected ? 'border-gradient-from' : 'border-gray-200';
                        const bgColor = showFeedback
                          ? option.quality === 'good' ? 'bg-green-50'
                          : option.quality === 'almost' ? 'bg-yellow-50'
                          : 'bg-red-50'
                          : isSelected ? 'bg-blue-50' : 'bg-white';

                        return (
                          <button
                            key={idx}
                            onClick={() => !showFeedback && setSelectedAnswer(option)}
                            disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${bgColor} ${borderColor} ${!showFeedback ? 'hover-elevate active-elevate-2' : ''}`}
                            data-testid={`button-option-${idx}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-gray-800 flex-1">"{option.text}"</p>
                              {showFeedback && isSelected && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md whitespace-nowrap flex-shrink-0">
                                  Your Choice
                                </span>
                              )}
                            </div>
                            {showFeedback && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-start gap-2">
                                  {option.quality === 'good' && <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />}
                                  {option.quality === 'almost' && <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                                  {option.quality === 'bad' && <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />}
                                  <div>
                                    <p className={`text-xs font-semibold mb-1 ${
                                      option.quality === 'good' ? 'text-green-700' :
                                      option.quality === 'almost' ? 'text-yellow-700' :
                                      'text-red-700'
                                    }`}>
                                      {option.quality === 'good' ? 'GOOD' : option.quality === 'almost' ? 'ALMOST' : 'BAD'}
                                    </p>
                                    <p className="text-xs text-gray-600">{option.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      onClick={handleNextStep}
                      disabled={!selectedAnswer}
                      className="bg-gradient-to-r from-gradient-from to-gradient-to w-full"
                      data-testid="button-next-step"
                    >
                      {showFeedback
                        ? (currentStep < project.steps ? "Next Step" : "Complete Challenge")
                        : "Check Answer"
                      }
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Write Your Prompt</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {project.isAssessment
                        ? "Create a comprehensive prompt that addresses the challenge. Remember to include all necessary details."
                        : "Based on the challenge above, write an AI prompt that meets all the requirements."
                      }
                    </p>
                    <Textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="min-h-48 mb-4"
                      data-testid="textarea-prompt"
                    />

                    <div className="flex gap-3">
                      {!project.isAssessment && promptText.length > 20 && (
                        <Button
                          variant="outline"
                          onClick={() => alert("AI Review: This feature will provide instant feedback on your prompt quality, clarity, and completeness. Coming soon!")}
                          className="flex-1"
                          data-testid="button-ai-review"
                        >
                          <Sparkles className="mr-1 h-4 w-4" />
                          AI Review + Feedback
                        </Button>
                      )}
                      <Button
                        onClick={handleNextStep}
                        className={`bg-gradient-to-r from-gradient-from to-gradient-to ${!project.isAssessment && promptText.length > 20 ? 'flex-1' : 'w-full'}`}
                        data-testid="button-next-step"
                      >
                        {currentStep < project.steps ? "Next Step" : (project.isAssessment ? "Complete Assessment" : "Complete Challenge")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 2: Examples + Tips - Only show for non-assessment projects */}
        {!project.isAssessment && (
          <div className="flex flex-col md:flex-row gap-6 mt-[20px] mb-[20px]">
            {/* Example Prompts - Left */}
            {project.examplePrompts && project.examplePrompts.length > 0 && (
              <div className="flex-1">
                <Card className="h-full">
                  <CardContent className="px-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="h-5 w-5 text-gradient-from" />
                      <h3 className="text-lg font-semibold">Learn from Examples</h3>
                    </div>
                    <Tabs defaultValue="bad" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="bad" data-testid="tab-bad">
                          <XCircle className="mr-1 h-4 w-4" />
                          Bad
                        </TabsTrigger>
                        <TabsTrigger value="almost" data-testid="tab-almost">
                          <AlertCircle className="mr-1 h-4 w-4" />
                          Almost
                        </TabsTrigger>
                        <TabsTrigger value="good" data-testid="tab-good">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Good
                        </TabsTrigger>
                      </TabsList>

                      {project.examplePrompts.map((example) => (
                        <TabsContent key={example.quality} value={example.quality} className="mt-4">
                          <div className={`p-4 rounded-lg border-2 ${
                            example.quality === 'bad' ? 'bg-red-50 border-red-200' :
                            example.quality === 'almost' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-green-50 border-green-200'
                          }`}>
                            <div className="mb-3">
                              <p className={`text-sm font-medium mb-2 ${
                                example.quality === 'bad' ? 'text-red-800' :
                                example.quality === 'almost' ? 'text-yellow-800' :
                                'text-green-800'
                              }`}>
                                Example Prompt:
                              </p>
                              <p className="text-sm italic text-gray-700 bg-white/60 p-3 rounded">
                                "{example.prompt}"
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium mb-1 ${
                                example.quality === 'bad' ? 'text-red-800' :
                                example.quality === 'almost' ? 'text-yellow-800' :
                                'text-green-800'
                              }`}>
                                Why {example.quality === 'bad' ? "it doesn't work" : example.quality === 'almost' ? "it's close but not quite" : "it works perfectly"}:
                              </p>
                              <p className="text-sm text-gray-700">
                                {example.explanation}
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI Helper Tips - Right */}
            <div className="flex-1">
              <Card className="bg-blue-50 border-blue-200 h-full">
                <CardContent className="px-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">Quick Prompting Tips</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-600 rounded-full p-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-blue-800">
                        <strong>Be Specific:</strong> Include who, what, when, where, why, and how in your prompt
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-600 rounded-full p-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-blue-800">
                        <strong>Set Context:</strong> Explain the audience, purpose, and any constraints
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-600 rounded-full p-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-blue-800">
                        <strong>Define Format:</strong> Specify the structure and length you want
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-600 rounded-full p-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-blue-800">
                        <strong>Add Examples:</strong> Show what good output looks like when possible
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}