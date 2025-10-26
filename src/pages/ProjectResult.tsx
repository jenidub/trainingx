import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { loadState } from "@/lib/storage";
import { UserState, ProjectResult as ProjectResultType } from "@shared/schema";
import badgeRules from "@/data/badge-rules.json";
import {
  Trophy,
  Star,
  CheckCircle2,
  ArrowRight,
  Home,
  RotateCcw,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ProjectResult() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [result, setResult] = useState<ProjectResultType | null>(null);
  // const [showConfetti, setShowConfetti] = useState(true);

  // Fetch project from Convex
  const project = useQuery(
    api.practiceProjects.getBySlug,
    params.slug ? { slug: params.slug } : "skip",
  );

  useEffect(() => {
    const state = loadState();
    if (!state) {
      navigate("/");
      return;
    }
    setUserState(state);

    // Find the result for this project
    const projectResult = state.completedProjects.find(
      (r: ProjectResultType) => r.slug === params.slug,
    );
    if (!projectResult) {
      navigate("/practice");
      return;
    }
    setResult(projectResult);

    // Hide confetti after 5 seconds
    // const timer = setTimeout(() => setShowConfetti(false), 5000);
    // return () => clearTimeout(timer);
  }, [params.slug, navigate]);

  if (!userState || !result || project === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!project) {
    navigate("/practice");
    return null;
  }

  const badgeInfo = badgeRules[project.badge as keyof typeof badgeRules];
  const scorePercentage = result.finalScore;
  const scoreColor =
    scorePercentage >= 75
      ? "text-green-600"
      : scorePercentage >= 50
        ? "text-yellow-600"
        : "text-orange-600";
  const scoreGrade =
    scorePercentage >= 75
      ? "Excellent!"
      : scorePercentage >= 50
        ? "Good Job!"
        : "Keep Practicing!";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      <Navigation />

      {/* Confetti Effect - Simple CSS Animation */}
      {/* {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                backgroundColor: ['#0074B9', '#46BC61', '#FFD700', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )} */}

      <div className="container mx-auto px-4 py-8 pt-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-gradient-from to-gradient-to mb-4 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
            Challenge Complete!
          </h1>
          <p className="text-xl text-gray-600">{project.title}</p>
          <p className="text-sm text-gray-500 mt-2">
            Completed on{" "}
            {new Date(result.completedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-6 border-2 border-gradient-from/30 bg-white/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Score Circle */}
              <div className="relative">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${scoreColor}`}>
                      {result.finalScore}
                    </div>
                    <div className="text-sm text-gray-600">Prompt Score</div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                </div>
              </div>

              {/* Grade & Message */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold mb-2">{scoreGrade}</h2>
                <p className="text-gray-600 mb-4">
                  {scorePercentage >= 75
                    ? "Outstanding work! Your prompting skills are impressive. You've demonstrated excellent clarity, constraint management, and tool selection."
                    : scorePercentage >= 50
                      ? "Nice work! You're developing solid prompting fundamentals. Keep practicing to refine your technique and boost your score."
                      : "Good effort! Every practice session builds your skills. Review the examples and tips, then try again to improve your score."}
                </p>

                {/* Badge Status */}
                {result.badgeEarned && badgeInfo && (
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg px-6 py-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div className="text-left">
                      <div className="font-bold text-yellow-900">
                        {badgeInfo.name} Earned!
                      </div>
                      <div className="text-sm text-yellow-700">
                        Achievement unlocked
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rubric Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gradient-from" />
                Rubric Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Clarity</span>
                  <span className="text-sm font-bold">
                    {result.rubric.clarity}/25
                  </span>
                </div>
                <Progress
                  value={(result.rubric.clarity / 25) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Constraints</span>
                  <span className="text-sm font-bold">
                    {result.rubric.constraints}/25
                  </span>
                </div>
                <Progress
                  value={(result.rubric.constraints / 25) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Iteration</span>
                  <span className="text-sm font-bold">
                    {result.rubric.iteration}/25
                  </span>
                </div>
                <Progress
                  value={(result.rubric.iteration / 25) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tool Selection</span>
                  <span className="text-sm font-bold">
                    {result.rubric.tool}/25
                  </span>
                </div>
                <Progress
                  value={(result.rubric.tool / 25) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-gradient-from" />
                Skills Developed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.skillsGained.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.skillsGained.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 text-gradient-from border border-gradient-from/20"
                    >
                      {skill.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Practice more challenges to develop new skills!
                </p>
              )}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Pro Tip:</strong> Each skill you develop unlocks new
                  career and business opportunities in the Matching Zone!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/practice">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              data-testid="button-back-practice"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Practice Zone
            </Button>
          </Link>
          <Link href={`/practice/${params.slug}`}>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              data-testid="button-retry-challenge"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>
          <Link href="/matching">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-gradient-from to-gradient-to"
              data-testid="button-view-matches"
            >
              View Your Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}
