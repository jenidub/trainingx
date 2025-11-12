import Link from "next/link";
import { ArrowRight, Clock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import badgeRules from "@/data/badge-rules.json";
import type { PracticeProject, UserStats } from "./types";

type ProjectCardProps = {
  project: PracticeProject;
  unlocked: boolean;
  completed: boolean;
  stats: UserStats;
  isLevelUnlocked: (level: number) => boolean;
};

export function ProjectCard({
  project,
  unlocked,
  completed,
  stats,
  isLevelUnlocked,
}: ProjectCardProps) {
  const getUnlockMessage = () => {
    if (
      project.requiresPromptScore !== undefined &&
      stats.promptScore < project.requiresPromptScore
    ) {
      return `Unlock at: ${project.requiresPromptScore} Prompt Score`;
    }
    if (!isLevelUnlocked(project.level)) {
      return `Complete all Level ${project.level - 1} challenges to unlock`;
    }
    if (project.requiresCompletion && project.requiresCompletion.length > 0) {
      return `Complete required challenges to unlock`;
    }
    return "Locked";
  };

  return (
    <Card
      className={`flex flex-col justify-between ${!unlocked ? "opacity-75 !pt-0" : ""}`}
    >
      {!unlocked && (
        <div className="border-b-2 border-yellow-300 bg-yellow-50 p-4 rounded-t-xl">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">
              {project.badgeReward
                ? badgeRules[project.badgeReward as keyof typeof badgeRules]
                    ?.name
                : "Achievement"}
            </span>
          </div>
          <p className="text-xs text-yellow-700">{getUnlockMessage()}</p>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg leading-5 mb-2">
          {project.title}
        </CardTitle>
        <CardDescription>{project.description}</CardDescription>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{project.duration}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {project.isAssessment
              ? "Assessment"
              : `${project.steps || 3} steps`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm justify-end">
        <div>
          <p className="font-semibold text-gray-700 mb-2">Builds Skills:</p>
          <div className="flex flex-wrap gap-1">
            {project.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        {project.badgeReward && unlocked && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            Earn badge:{" "}
            {
              badgeRules[project.badgeReward as keyof typeof badgeRules]?.name
            }
          </div>
        )}
        <div className="pt-1">
          {completed ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/practice/${project.slug}/result`}>
                  <Trophy className="h-4 w-4 mr-0" />
                  Result
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
              >
                <Link href={project.actionLink || `#`}>
                  Retake
                  <ArrowRight className="h-4 w-4 mr-0" />
                </Link>
              </Button>
            </div>
          ) : unlocked ? (
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
            >
              <Link href={project.actionLink || `#`}>
                Start Challenge <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button disabled className="w-full" variant="outline">
              Locked
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
