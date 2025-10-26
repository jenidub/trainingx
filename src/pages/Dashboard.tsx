import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getLiveMatchPreview } from "@/lib/live-matching";
import projects from "@/data/projects";
import badgeRules from "@/data/badge-rules.json";
import { Flame, Target, Trophy, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useWizardContext } from "@/contexts/WizardContextProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStatsMigration } from "@/hooks/useUserStatsMigration";

export default function Dashboard() {
  const { user } = useAuth();
  const { setContext } = useWizardContext();
  
  // Migrate localStorage data to Convex on first load
  useUserStatsMigration();
  
  // Fetch user stats from Convex
  const userStats = useQuery(
    api.users.getUserStats,
    user?._id ? { userId: user._id as any } : "skip"
  );
  
  const updateStreakMutation = useMutation(api.users.updateStreak);

  useEffect(() => {
    // Update streak on mount
    if (user?._id) {
      updateStreakMutation({ userId: user._id as any });
    }
  }, [user?._id]);

  // Update wizard context with dashboard info
  useEffect(() => {
    if (userStats) {
      setContext({
        page: 'dashboard',
        pageTitle: 'Dashboard',
        userState: {
          promptScore: userStats.promptScore,
          skills: userStats.skills,
          completedProjects: userStats.completedProjects?.length || 0,
          badges: userStats.badges?.length || 0
        },
        recentAction: `Viewing dashboard with ${userStats.promptScore}/100 prompt score`
      });
    }

    return () => setContext(undefined);
  }, [userStats]);

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Please log in to view your dashboard</p>
    </div>;
  }

  if (userStats === undefined) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  // If no stats exist yet, show empty state
  if (!userStats) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl mb-4">Welcome! Let's get started</p>
        <p className="text-gray-600">Complete your first assessment to begin</p>
      </div>
    </div>;
  }

  const completedProjectSlugs = userStats.completedProjects?.map(p => p.slug) || [];
  
  const liveMatches = getLiveMatchPreview(
    userStats.promptScore,
    userStats.skills,
    userStats.completedProjects.length,
    completedProjectSlugs,
    userStats.previousPromptScore,
    userStats.previousSkills || userStats.skills
  );

  const availableProjects = projects.filter(
    p => !completedProjectSlugs.includes(p.slug)
  );

  const nextBestAction = () => {
    if (!userStats.assessmentComplete) {
      return {
        title: "Complete Full Assessment",
        description: "Unlock detailed skill insights and career matches",
        link: "/assessment",
        icon: <Target className="h-5 w-5" />
      };
    }
    
    if (userStats.completedProjects.length === 0) {
      return {
        title: "Start Your First Project",
        description: "Build and earn your first badge",
        link: "/practice",
        icon: <Sparkles className="h-5 w-5" />
      };
    }

    if (liveMatches.almostUnlocked.length > 0) {
      const next = liveMatches.almostUnlocked[0];
      return {
        title: `Unlock: ${next.match.title}`,
        description: `${next.missingPoints} points away from this ${next.match.type} opportunity`,
        link: "/practice",
        icon: <TrendingUp className="h-5 w-5" />
      };
    }

    return {
      title: "Continue Building Projects",
      description: "Strengthen your skills and unlock more opportunities",
      link: "/practice",
      icon: <ArrowRight className="h-5 w-5" />
    };
  };

  const action = nextBestAction();

  const topSkills = Object.entries(userStats.skills || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const earnedBadges = Object.entries(badgeRules).filter(([badgeId]) => 
    userStats.badges?.includes(badgeId)
  );

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || 'there'}!</h1>
          <p className="text-gray-600">Here's your AI skills journey</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Prompt Score</span>
                  {userStats.previousPromptScore > 0 && userStats.promptScore > userStats.previousPromptScore && (
                    <Badge variant="default" className="bg-green-500">
                      +{userStats.promptScore - userStats.previousPromptScore}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                    {userStats.promptScore}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-400">/100</div>
                    <div className="text-sm text-gray-500">Universal Score</div>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Clarity</span>
                      <span className="text-sm text-gray-600">{userStats.rubric.clarity}/25</span>
                    </div>
                    <Progress value={(userStats.rubric.clarity / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Constraints</span>
                      <span className="text-sm text-gray-600">{userStats.rubric.constraints}/25</span>
                    </div>
                    <Progress value={(userStats.rubric.constraints / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Iteration</span>
                      <span className="text-sm text-gray-600">{userStats.rubric.iteration}/25</span>
                    </div>
                    <Progress value={(userStats.rubric.iteration / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Tool Selection</span>
                      <span className="text-sm text-gray-600">{userStats.rubric.tool}/25</span>
                    </div>
                    <Progress value={(userStats.rubric.tool / 25) * 100} />
                  </div>
                </div>
                <Link href="/assessment">
                  <Button variant="outline" className="w-full" data-testid="button-retake-assessment">
                    <Target className="mr-2 h-4 w-4" />
                    Retake Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Score History */}
            {userStats.assessmentHistory && userStats.assessmentHistory?.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Score History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userStats.assessmentHistory.slice().reverse().slice(0, 5).map((assessment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(assessment.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(assessment.date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-gradient-from">
                            {assessment.promptScore}
                          </div>
                          {idx < userStats.assessmentHistory.length - 1 && (
                            <Badge variant={
                              assessment.promptScore > userStats.assessmentHistory[userStats.assessmentHistory.length - idx - 2].promptScore 
                                ? "default" 
                                : "secondary"
                            } className={
                              assessment.promptScore > userStats.assessmentHistory[userStats.assessmentHistory.length - idx - 2].promptScore 
                                ? "bg-green-500" 
                                : ""
                            }>
                              {assessment.promptScore > userStats.assessmentHistory[userStats.assessmentHistory.length - idx - 2].promptScore 
                                ? `+${assessment.promptScore - userStats.assessmentHistory[userStats.assessmentHistory.length - idx - 2].promptScore}` 
                                : `${assessment.promptScore - userStats.assessmentHistory[userStats.assessmentHistory.length - idx - 2].promptScore}`
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topSkills.map(([skill, value]) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{skill.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-gray-600">{value}/100</span>
                      </div>
                      <Progress value={value} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Best Action */}
            <Card className="bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 border-gradient-from/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {action.icon}
                  <span className="ml-2">Next Best Action</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                  <p className="text-gray-600">{action.description}</p>
                </div>
                <Link href={action.link}>
                  <Button className="bg-gradient-to-r from-gradient-from to-gradient-to">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flame className="h-5 w-5 text-orange-500 mr-2" />
                  Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-1">
                    {userStats.streak}
                  </div>
                  <div className="text-sm text-gray-600">days in a row</div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                {earnedBadges.length > 0 ? (
                  <div className="space-y-2">
                    {earnedBadges.map(([badgeId, badge]) => (
                      <div key={badgeId} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                        <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No badges yet. Complete projects to earn badges!</p>
                )}
              </CardContent>
            </Card>

            {/* Unlocked Matches */}
            {liveMatches.unlocked.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Career Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {liveMatches.unlocked.slice(0, 3).map((match, idx) => (
                      <div key={idx} className="p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800">{match.title}</div>
                        <div className="text-xs text-green-600 capitalize">{match.type}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/matching">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Matches
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/practice">
                  <Button variant="outline" size="sm" className="w-full justify-start" data-testid="link-practice">
                    <Target className="mr-2 h-4 w-4" />
                    Practice Zone
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button variant="outline" size="sm" className="w-full justify-start" data-testid="link-portfolio">
                    <Trophy className="mr-2 h-4 w-4" />
                    View Portfolio
                  </Button>
                </Link>
                <Link href="/matching-quiz">
                  <Button variant="outline" size="sm" className="w-full justify-start" data-testid="link-matching-quiz">
                    <Target className="mr-2 h-4 w-4" />
                    Career Match Quiz
                  </Button>
                </Link>
                <Link href="/matching">
                  <Button variant="outline" size="sm" className="w-full justify-start" data-testid="link-matching">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Career Matching
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
