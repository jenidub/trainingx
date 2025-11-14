"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Clock, CheckCircle2 } from "lucide-react";

interface DailyDrillProps {
  userId: string;
}

export function DailyDrill({ userId }: DailyDrillProps) {
  // @ts-ignore - API will be generated after deployment
  const drillData = useQuery(api.dailyDrills?.getTodaysDrill, { 
    userId: userId as any 
  });
  // @ts-ignore - API will be generated after deployment
  const createDrill = useMutation(api.dailyDrills?.createTodaysDrill);
  // @ts-ignore - API will be generated after deployment
  const completeDrillItem = useMutation(api.dailyDrills?.completeDrillItem);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCreating, setIsCreating] = useState(false);

  // Auto-create drill if it doesn't exist
  const handleCreateDrill = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      await createDrill({ userId: userId as any });
    } catch (error) {
      console.error("Failed to create drill:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (drillData === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Drill
          </CardTitle>
          <CardDescription>Loading your practice for today...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (drillData === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Drill
          </CardTitle>
          <CardDescription>
            Ready to practice today?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateDrill} disabled={isCreating}>
            {isCreating ? "Creating..." : "Start Today's Drill"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!drillData.drill || !drillData.items || drillData.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Drill
          </CardTitle>
          <CardDescription>
            No drills available yet. Complete the placement test to get started!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { drill, items, streak } = drillData;
  const progress = (drill.completedItemIds.length / drill.itemIds.length) * 100;
  const currentItem = items[currentItemIndex];

  if (!currentItem) {
    return null;
  }

  const handleComplete = async (correct: boolean) => {
    const timeMs = Date.now() - startTime;
    
    await completeDrillItem({
      userId: userId as any,
      drillId: drill._id,
      itemId: currentItem._id,
      timeMs,
    });

    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setStartTime(Date.now());
    }
  };

  if (drill.status === "completed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Daily Drill Complete!
          </CardTitle>
          <CardDescription>
            Great work! Come back tomorrow for your next drill.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {streak && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">{streak.currentStreak} day streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">
                    Best: {streak.longestStreak} days
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Completed in {Math.round(drill.timeSpentMs / 1000 / 60)} minutes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Drill
          </CardTitle>
          <div className="flex items-center gap-4">
            {streak && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold">{streak.currentStreak}</span>
              </div>
            )}
            <Badge variant="outline">
              {drill.completedItemIds.length} / {drill.itemIds.length}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Question {currentItemIndex + 1} of {items.length}
              </Badge>
              {currentItem.tags && currentItem.tags.length > 0 && (
                <Badge variant="outline">{currentItem.tags[0]}</Badge>
              )}
            </div>
            <p className="text-lg font-medium">
              {currentItem.params?.question || "Practice question"}
            </p>
          </div>

          {currentItem.params?.options && (
            <div className="space-y-2">
              {currentItem.params.options.map((option: any, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => handleComplete(option.quality === "good")}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Target: {currentItem.params?.recommendedTime || 3} minutes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
