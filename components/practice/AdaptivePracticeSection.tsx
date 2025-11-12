"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { useState } from "react";

type AdaptivePracticeSectionProps = {
  userId: Id<"users">;
};

export function AdaptivePracticeSection({ userId }: AdaptivePracticeSectionProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Get adaptive item recommendation
  const nextItem = useQuery(api.adaptiveEngine.pickNextItem, {
    userId,
    excludeItemIds: [],
  });

  // Get all available items
  const allItems = useQuery(api.itemTemplates.getItemsByTemplate, {
    templateId: nextItem?.templateId || ("skip" as any),
    status: "live",
  });

  const handleStartItem = (item: any) => {
    setSelectedItem(item);
    setUserAnswer(null);
    setShowResult(false);
  };

  const handleSubmitAnswer = (optionIndex: number) => {
    setUserAnswer(optionIndex.toString());
    setShowResult(true);
  };

  if (!nextItem && !allItems) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If viewing a specific item
  if (selectedItem) {
    const options = selectedItem.params?.options || [];
    const correctOption = options.find((o: any) => o.quality === "good");
    const selectedOption = userAnswer !== null ? options[parseInt(userAnswer)] : null;

    return (
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Adaptive Practice Item</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">{selectedItem.params?.question}</p>
          </div>

          <div className="space-y-3">
            {options.map((option: any, index: number) => {
              const isSelected = userAnswer === index.toString();
              const isCorrect = option.quality === "good";
              const showFeedback = showResult && isSelected;

              return (
                <button
                  key={index}
                  onClick={() => !showResult && handleSubmitAnswer(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showFeedback
                      ? isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : isSelected
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        showFeedback
                          ? isCorrect
                            ? "border-green-500 bg-green-500"
                            : "border-red-500 bg-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      {showFeedback && (
                        <span className="text-white text-sm">
                          {isCorrect ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{option.text}</p>
                      {showFeedback && (
                        <p className="text-sm text-gray-600 mt-2">{option.explanation}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="pt-4 border-t">
              <Button onClick={() => setSelectedItem(null)} className="w-full">
                Try Another Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show list of available items
  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>Adaptive Practice (Phase 2)</CardTitle>
          </div>
          <CardDescription>
            AI-powered items that adapt to your skill level. These use Elo ratings and spaced repetition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nextItem && (
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900 mb-1">Recommended for You</p>
                  <p className="text-sm text-purple-700">
                    Based on your skills, we recommend practicing items around difficulty {Math.round(nextItem.elo)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {allItems && allItems.length > 0 ? (
              allItems.slice(0, 6).map((item) => (
                <Card key={item._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        Elo: {Math.round(item.elo)}
                      </Badge>
                      <Badge
                        variant={
                          item.difficultyBand === "foundation"
                            ? "secondary"
                            : item.difficultyBand === "challenge"
                              ? "default"
                              : "outline"
                        }
                      >
                        {item.difficultyBand}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {item.params?.question || "Practice item"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" onClick={() => handleStartItem(item)}>
                        <Zap className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-600">
                <p>No adaptive items available yet.</p>
                <p className="text-sm mt-2">Run: npx convex run seedPhase3:seedProductionPracticeItems</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
