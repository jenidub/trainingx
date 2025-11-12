"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { TrendingDown, TrendingUp, Target, BookOpen, Zap } from "lucide-react";
import Link from "next/link";
import { Id } from "convex/_generated/dataModel";

type CoachPanelProps = {
  userId: Id<"users">;
};

export function CoachPanel({ userId }: CoachPanelProps) {
  const skillRatings = useQuery(api.adaptiveEngine.getUserSkillRatings, { userId });
  const weakestSkill = useQuery(api.adaptiveEngine.getWeakestSkill, { userId });
  const reviewStats = useQuery(api.spacedRepetition.getReviewStats, { userId });

  if (!skillRatings || !reviewStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasSkillData = skillRatings.length > 0;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Your AI Coach</CardTitle>
        </div>
        <CardDescription>
          Personalized recommendations based on your performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasSkillData ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-4">
              Complete some practice items to get personalized recommendations!
            </p>
            <Button asChild>
              <Link href="/practice">Start Practicing</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Weakest Skill Alert */}
            {weakestSkill && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                      Focus Area Identified
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Your <span className="font-medium">{weakestSkill.skillId.replace(/_/g, ' ')}</span> skill 
                      could use some attention (Rating: {Math.round(weakestSkill.rating)})
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/practice?skill=${weakestSkill.skillId}`}>
                        Practice This Skill
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Review Deck Status */}
            {reviewStats.dueToday > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                      Review Time!
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      You have <span className="font-medium">{reviewStats.dueToday} items</span> ready 
                      for review to strengthen your memory
                    </p>
                    <Button size="sm" asChild>
                      <Link href="/practice/review">
                        <Zap className="h-4 w-4 mr-1" />
                        Start Review
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Skill Progress Summary */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">
                Your Skill Ratings
              </h4>
              <div className="space-y-2">
                {skillRatings
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 5)
                  .map((skill) => (
                    <div key={skill.skillId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 capitalize">
                          {skill.skillId.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {skill.band}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {Math.round(skill.rating)}
                        </span>
                        {skill.rating >= 1500 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Upcoming Reviews */}
            {reviewStats.dueTomorrow > 0 && (
              <div className="text-sm text-gray-600 pt-2 border-t">
                <p>
                  📅 <span className="font-medium">{reviewStats.dueTomorrow}</span> items 
                  due tomorrow · <span className="font-medium">{reviewStats.dueThisWeek}</span> this week
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
