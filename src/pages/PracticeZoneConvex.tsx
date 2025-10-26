import { Link } from "wouter";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContextProvider";
import { Clock, ArrowRight, CheckCircle, Target } from "lucide-react";

export default function PracticeZoneConvex() {
  const { user, isAuthenticated } = useAuth();

  // Fetch practice projects from Convex
  const projects = useQuery(api.practiceProjects.list, {});

  // Fetch user progress
  const userProgress = useQuery(
    api.users.getUserProgress,
    user?._id ? { userId: user._id as Id<"users"> } : "skip",
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access the Practice Zone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projects === undefined || userProgress === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading projects...</p>
      </div>
    );
  }

  // Group projects by difficulty level (1=beginner, 2=intermediate, 3=advanced)
  const difficultyLevels = [
    { level: 1, name: "beginner" },
    { level: 2, name: "intermediate" },
    { level: 3, name: "advanced" },
  ];

  // Note: userProgress tracks generic projects, not practiceProjects
  // For now, we'll track completion via practiceProject slugs in userStats
  const completedProjectSlugs: string[] = [];

  const isProjectCompleted = (projectSlug: string) => {
    return completedProjectSlugs.includes(projectSlug);
  };

  const getDifficultyProgress = (level: number) => {
    const difficultyProjects = projects.filter((p) => p.level === level);
    if (difficultyProjects.length === 0) return 0;
    const completed = difficultyProjects.filter((p) =>
      isProjectCompleted(p.slug),
    ).length;
    return (completed / difficultyProjects.length) * 100;
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice Zone</h1>
          <p className="text-gray-600">
            Master prompting skills through hands-on projects
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {completedProjectSlugs.length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects by Difficulty */}
        {difficultyLevels.map(({ level, name }) => {
          const difficultyProjects = projects.filter((p) => p.level === level);
          if (difficultyProjects.length === 0) return null;

          return (
            <div key={level} className="mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="capitalize">{name} Level</CardTitle>
                      <CardDescription>
                        {difficultyProjects.length} projects available
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-2xl font-bold">
                        {Math.round(getDifficultyProgress(level))}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={getDifficultyProgress(level)}
                    className="mt-2"
                  />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {difficultyProjects.map((project) => {
                      const isCompleted = isProjectCompleted(project.slug);

                      return (
                        <Card
                          key={project._id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">
                                {project.title}
                              </CardTitle>
                              {isCompleted && (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {project.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="secondary"
                                  className="capitalize"
                                >
                                  {project.category}
                                </Badge>
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {project.estTime}
                                </Badge>
                              </div>

                              <Link href={`/practice/${project.slug}`}>
                                <Button
                                  className="w-full"
                                  variant={isCompleted ? "outline" : "default"}
                                >
                                  {isCompleted ? "Review" : "Start"}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {projects.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Projects Available
              </h3>
              <p className="text-gray-600">
                Check back soon for new practice projects!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
