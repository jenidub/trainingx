import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadState } from "@/lib/storage";
import { UserState } from "@shared/schema";
import {
  Briefcase,
  Building2,
  DollarSign,
  Wrench,
  Lock,
  CheckCircle,
  MapPin,
  Home,
  ArrowRight,
  Target,
  Sparkles,
  Loader2,
  Database,
} from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

const categoryIcons = {
  career: Briefcase,
  business: Building2,
  side: DollarSign,
  trade: Wrench,
};

const categoryColors = {
  career: "from-blue-500 to-blue-600",
  business: "from-purple-500 to-purple-600",
  side: "from-green-500 to-green-600",
  trade: "from-orange-500 to-orange-600",
};

const categoryLabels = {
  career: "Career",
  business: "Business",
  side: "Side Hustle",
  trade: "Trade",
};

type AIOpportunity = {
  id: string;
  title: string;
  type: "career" | "side" | "business" | "trade";
  location: string;
  salaryRange: string;
  employmentType: string;
  seniority: string;
  description: string;
  impactHighlights: string[];
  keyTechnologies: string[];
  requiredSkills: string[];
  whyPerfectMatch: string;
  nextSteps: string;
  remotePolicy: string;
  promptScoreMin: number;
  skillThresholds: Record<string, number>;
};

export default function MatchingZone() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [aiOpportunities, setAIOpportunities] = useState<AIOpportunity[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIMatches = useAction(api.aiMatching.generateAIMatches);

  const handleGenerateMatches = async (
    answers: Record<string, string>,
    profile: UserState,
  ) => {
    setIsGenerating(true);
    try {
      const result = await generateAIMatches({
        quizAnswers: answers,
        userProfile: {
          promptScore: profile.promptScore,
          completedProjects: profile.completedProjects.length,
          skills: profile.skills,
        },
      });

      const opportunities = result.opportunities || [];
      setAIOpportunities(opportunities);

      // Store AI opportunities in localStorage with the quiz answers
      localStorage.setItem(
        "ai_generated_matches",
        JSON.stringify({
          opportunities,
          generatedAt: new Date().toISOString(),
          quizAnswers: answers,
        }),
      );
    } catch (error) {
      console.error("Failed to generate AI matches:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const state = loadState();
    setUserState(state);

    // Load quiz preferences from localStorage and map to expected format
    const quizData = localStorage.getItem("matching_quiz_results");
    if (quizData) {
      try {
        const parsed = JSON.parse(quizData);
        const answers = parsed.answers;
        if (answers) {
          setQuizAnswers(answers);

          // Check if we have existing AI-generated matches
          const aiMatchesData = localStorage.getItem("ai_generated_matches");
          if (aiMatchesData) {
            try {
              const aiParsed = JSON.parse(aiMatchesData);
              // Check if quiz answers match - if not, regenerate
              if (
                JSON.stringify(aiParsed.quizAnswers) === JSON.stringify(answers)
              ) {
                setAIOpportunities(aiParsed.opportunities || []);
              } else {
                // Quiz changed - generate new matches
                if (state) {
                  handleGenerateMatches(answers, state);
                }
              }
            } catch (e) {
              console.error("Failed to parse AI matches:", e);
            }
          } else {
            // No AI matches yet - generate them
            if (state) {
              handleGenerateMatches(answers, state);
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse quiz results:", e);
      }
    }
  }, []);

  if (!userState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const renderAIOpportunityCard = (opp: AIOpportunity) => {
    const Icon = categoryIcons[opp.type] || Sparkles;
    const colorClass = categoryColors[opp.type];
    const isUnlocked = userState.promptScore >= opp.promptScoreMin;
    const psGap = Math.max(0, opp.promptScoreMin - userState.promptScore);

    return (
      <Card
        key={opp.id}
        className={`${isUnlocked ? "border-l-4 border-l-green-500" : "border-l-4 border-l-amber-400"} relative`}
      >
        <div className="absolute top-2 right-2">
          <Badge
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0 gap-1"
            data-testid={`badge-ai-generated-${opp.id}`}
          >
            <Sparkles className="h-3 w-3" />
            AI Personalized
          </Badge>
        </div>

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{opp.title}</CardTitle>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[opp.type] || opp.type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {opp.seniority}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {opp.employmentType}
                </Badge>
              </div>
            </div>
            {isUnlocked ? (
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <Lock className="h-6 w-6 text-amber-500 flex-shrink-0" />
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">{opp.description}</p>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{opp.location}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Home className="h-4 w-4" />
                <span>{opp.remotePolicy}</span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 rounded-lg">
              <div className="font-semibold text-gray-800">
                {opp.salaryRange}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                Why this is perfect for you:
              </p>
              <p className="text-sm text-amber-800">{opp.whyPerfectMatch}</p>
            </div>

            {!isUnlocked && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      Unlock This Opportunity
                    </p>
                    <p>
                      Increase your Prompt Score by {psGap} points to access
                      this role. Complete practice projects and assessments with
                      TrainingX.ai to build your skills!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Next Step:
              </p>
              <p className="text-xs text-gray-600">{opp.nextSteps}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const unlockedCount = aiOpportunities.filter(
    (opp) => userState.promptScore >= opp.promptScoreMin,
  ).length;

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold">
              AI-Personalized Matching Zone
            </h1>
          </div>
          <p className="text-gray-600">
            Your custom AI-generated opportunities.{" "}
            {aiOpportunities.length > 0
              ? `${unlockedCount} of ${aiOpportunities.length} unlocked`
              : "Take the quiz to get started"}
          </p>
        </div>

        {/* AI Personalized Opportunities Section */}
        {aiOpportunities.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Your Personalized Matches
                </h2>
                <p className="text-sm text-gray-600">
                  Based on your quiz responses
                </p>
              </div>
              <Link href="/matching-quiz">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="button-retake-quiz"
                >
                  <Target className="h-4 w-4" />
                  Retake Quiz
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {aiOpportunities.map((opp) => renderAIOpportunityCard(opp))}
            </div>
          </div>
        )}

        {/* Loading AI Opportunities */}
        {isGenerating && (
          <Card className="mb-8 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
              <h3 className="text-xl font-bold mb-2">
                Generating Your Personalized Opportunities...
              </h3>
              <p className="text-gray-600">
                Our AI is analyzing your quiz responses to create perfect
                matches for you
              </p>
            </CardContent>
          </Card>
        )}

        {/* Career Match Quiz CTA */}
        {!quizAnswers && !isGenerating && (
          <Card className="mb-8 bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    Get AI-Personalized Opportunities
                  </h3>
                  <p className="text-muted-foreground mb-0">
                    Take our quick career matching quiz and get 5 AI-generated
                    opportunities tailored specifically to your goals, skills,
                    and preferences.
                  </p>
                </div>
                <Link href="/matching-quiz">
                  <Button
                    className="bg-gradient-to-r from-gradient-from to-gradient-to whitespace-nowrap"
                    data-testid="button-take-matching-quiz"
                  >
                    Take Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Browse Database CTA */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  Browse All AI Opportunities
                </h3>
                <p className="text-muted-foreground mb-0">
                  Explore our complete database of 39 curated AI career
                  opportunities, jobs, businesses, and side hustles.
                </p>
              </div>
              <Link href="/ai-database">
                <Button
                  variant="outline"
                  className="bg-white whitespace-nowrap hover-elevate"
                  data-testid="button-browse-database"
                >
                  Browse Database
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
