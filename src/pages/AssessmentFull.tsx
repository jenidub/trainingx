import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { computePromptScore, computeSkillSignals, Rubric } from "@/lib/scoring";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight, ChevronLeft, Sparkles } from "lucide-react";

const assessmentSteps = [
  {
    title: "Clarity & Structure",
    description: "How clear and well-structured are your prompts?",
    criteria: "clarity" as const,
    examples: [
      "Clearly defines the task and desired outcome",
      "Uses proper structure with context and instructions",
      "Specifies format and style requirements",
      "Provides clear success criteria",
    ],
  },
  {
    title: "Constraints & Parameters",
    description: "How well do you define constraints and parameters?",
    criteria: "constraints" as const,
    examples: [
      "Sets appropriate length and scope limits",
      "Defines tone, style, and audience",
      "Specifies required vs. optional elements",
      "Includes relevant context and background",
    ],
  },
  {
    title: "Iteration & Refinement",
    description: "How effectively do you iterate on prompts?",
    criteria: "iteration" as const,
    examples: [
      "Tests outputs and refines based on results",
      "Adds examples when AI misunderstands",
      "Adjusts parameters to improve quality",
      "Uses follow-up prompts strategically",
    ],
  },
  {
    title: "Tool Selection",
    description: "How well do you select and use AI tools?",
    criteria: "tool" as const,
    examples: [
      "Chooses the right AI tool for the task",
      "Understands model capabilities and limits",
      "Uses advanced features appropriately",
      "Adapts approach based on tool feedback",
    ],
  },
];

export default function AssessmentFull() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [promptExample, setPromptExample] = useState("");
  const [rubric, setRubric] = useState<Rubric>({
    clarity: 15,
    constraints: 15,
    iteration: 15,
    tool: 15,
  });

  const { user } = useAuth();
  const updateResults = useMutation(api.users.updateAssessmentResults);

  const currentCriteria = assessmentSteps[currentStep];
  const isLastStep = currentStep === assessmentSteps.length - 1;
  const ps = computePromptScore(rubric);
  const skills = computeSkillSignals(rubric);

  const handleNext = () => {
    if (isLastStep) {
      completeAssessment();
    } else {
      setCurrentStep(currentStep + 1);
      setPromptExample("");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeAssessment = async () => {
    if (!user?._id) return;

    try {
      await updateResults({
        userId: user._id as any,
        promptScore: ps,
        rubric,
        skills: {
          generative_ai: skills.generative_ai || 0,
          agentic_ai: skills.agentic_ai || 0,
          synthetic_ai: skills.synthetic_ai || 0,
          coding: skills.coding || 0,
          agi_readiness: skills.agi_readiness || 0,
          communication: skills.communication || 0,
          logic: skills.logic || 0,
          planning: skills.planning || 0,
          analysis: skills.analysis || 0,
          creativity: skills.creativity || 0,
          collaboration: skills.collaboration || 0,
        }
      });

      trackEvent("assessment_full_complete", { finalPS: ps });
      setLocation("/dashboard");
    } catch (error) {
      console.error("Failed to save assessment results:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Compact Header with Score and Progress */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* <Button 
              variant="ghost" 
              onClick={() => setLocation('/dashboard')} 
              className="mb-4 -ml-2"
              data-testid="button-back"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button> */}

            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">Full Assessment</h1>
                <p className="text-sm text-gray-600">
                  Comprehensive evaluation of your prompt engineering skills
                </p>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 px-4 py-3 rounded-lg border border-gradient-from/20">
                <div className="text-right">
                  <div className="text-xs text-gray-600 mb-1">
                    Current Prompt Score
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                    {ps}/100
                  </div>
                </div>
                <Sparkles className="h-8 w-8 text-gradient-from" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                size="sm"
                data-testid="button-previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Step {currentStep + 1} of {assessmentSteps.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(
                      ((currentStep + 1) / assessmentSteps.length) * 100,
                    )}
                    % Complete
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gradient-from to-gradient-to transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / assessmentSteps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={handleNext}
                size="sm"
                className="bg-gradient-to-r from-gradient-from to-gradient-to"
                data-testid="button-next"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Step */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-2">{currentCriteria.title}</h2>
            <p className="text-gray-600 mb-6">{currentCriteria.description}</p>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Key Indicators:</h3>
              <ul className="space-y-2">
                {currentCriteria.examples.map((example, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-gradient-from mt-1">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Your Assessment:</h3>
              <div className="flex justify-between mb-3">
                <span className="text-sm font-medium capitalize">
                  {currentCriteria.criteria} Score
                </span>
                <span className="text-sm text-gray-600">
                  {rubric[currentCriteria.criteria]}/25
                </span>
              </div>
              <Slider
                value={[rubric[currentCriteria.criteria]]}
                onValueChange={([v]) =>
                  setRubric({ ...rubric, [currentCriteria.criteria]: v })
                }
                max={25}
                step={1}
                className="mb-2"
                data-testid={`slider-${currentCriteria.criteria}`}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Example Prompt (Optional):</h3>
              <Textarea
                value={promptExample}
                onChange={(e) => setPromptExample(e.target.value)}
                placeholder="Share an example prompt that demonstrates your skills in this area..."
                className="min-h-24"
                data-testid="textarea-example"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
