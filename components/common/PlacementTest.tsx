"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Target, TrendingUp } from "lucide-react";

interface PlacementTestProps {
  userId: string;
  onComplete?: () => void;
}

export function PlacementTest({ userId, onComplete }: PlacementTestProps) {
  // @ts-ignore - API will be generated after deployment
  const testData = useQuery(api.placementTest?.getOrCreatePlacementTest, { 
    userId: userId as any 
  });
  // @ts-ignore - API will be generated after deployment
  const submitTest = useMutation(api.placementTest?.submitPlacementTest);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!testData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Placement Test
          </CardTitle>
          <CardDescription>Loading your assessment...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (testData.completed) {
    const test = testData.test;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Placement Test Complete
          </CardTitle>
          <CardDescription>
            Your skills have been assessed and your learning path is ready!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">
                Recommended Track: {test.recommendedTrack}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(test.initialSkillRatings).map(([skill, rating]) => (
                <div key={skill} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {skill.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium">{String(rating)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!testData.items || testData.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Placement Test
          </CardTitle>
          <CardDescription>
            The placement test is being prepared. Please check back soon!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const items = testData.items;
  const currentItem = items[currentIndex];
  const progress = (currentIndex / items.length) * 100;

  const handleAnswer = async (answer: any, correct: boolean) => {
    const timeMs = Date.now() - startTime;
    
    const newResponse = {
      itemId: currentItem.itemId,
      response: answer,
      correct,
      timeMs,
    };

    const newResponses = [...responses, newResponse];
    setResponses(newResponses);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStartTime(Date.now());
    } else {
      // Submit test
      setIsSubmitting(true);
      try {
        await submitTest({
          userId: userId as any,
          responses: newResponses,
        });
        onComplete?.();
      } catch (error) {
        console.error("Failed to submit test:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Placement Test
          </CardTitle>
          <Badge variant="outline">
            {currentIndex + 1} / {items.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
        <CardDescription>
          This helps us understand your current skill level and recommend the best learning path.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {currentItem.skills && currentItem.skills.length > 0 && (
              <div className="flex gap-2">
                {currentItem.skills.slice(0, 2).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-lg font-medium">
              {currentItem.question}
            </p>
          </div>

          {currentItem.type === "multiple-choice" && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleAnswer("option1", true)}
                disabled={isSubmitting}
              >
                Option 1
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleAnswer("option2", false)}
                disabled={isSubmitting}
              >
                Option 2
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleAnswer("option3", false)}
                disabled={isSubmitting}
              >
                Option 3
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleAnswer("option4", false)}
                disabled={isSubmitting}
              >
                Option 4
              </Button>
            </div>
          )}

          {isSubmitting && (
            <div className="text-center text-sm text-muted-foreground">
              Analyzing your results...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
