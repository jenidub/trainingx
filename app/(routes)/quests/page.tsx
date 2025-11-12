"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, CheckCircle } from "lucide-react";

export default function QuestsPage() {
  const { user } = useAuth();
  const activeQuests = useQuery(api.quests.getActiveQuests, {});
  const userQuests = useQuery(
    api.quests.getUserQuests,
    user?._id ? { userId: user._id as any } : "skip"
  );
  const startQuest = useMutation(api.quests.startQuest);
  const claimRewards = useMutation(api.quests.claimQuestRewards);
  const [loading, setLoading] = useState<string | null>(null);

  const handleStartQuest = async (questId: any) => {
    if (!user?._id) return;
    setLoading(questId);
    try {
      await startQuest({ userId: user._id as any, questId });
    } catch (error) {
      console.error("Failed to start quest:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleClaimRewards = async (userQuestId: any) => {
    if (!user?._id) return;
    setLoading(userQuestId);
    try {
      await claimRewards({ userId: user._id as any, userQuestId });
    } catch (error) {
      console.error("Failed to claim rewards:", error);
    } finally {
      setLoading(null);
    }
  };

  const inProgressQuests = userQuests?.filter(uq => uq.status === "in_progress") || [];
  const completedQuests = userQuests?.filter(uq => uq.status === "completed") || [];
  const startedQuestIds = new Set(userQuests?.map(uq => uq.questId) || []);

  return (
    <SidebarLayout>
      <div className="bg-gray-50 min-h-full">
        <div className="container mx-auto px-4 py-6 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-8 w-8 text-amber-500" />
              Quests
            </h1>
            <p className="text-gray-600">
              Complete challenges to earn XP, badges, and unlock exclusive content
            </p>
          </header>

          {/* In Progress Quests */}
          {inProgressQuests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">In Progress</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {inProgressQuests.map((userQuest) => {
                  const quest = userQuest.quest;
                  if (!quest) return null;

                  const totalProgress = userQuest.progress.reduce((sum, p) => sum + p.current, 0);
                  const totalGoal = userQuest.progress.reduce((sum, p) => sum + p.goal, 0);
                  const percentage = totalGoal > 0 ? (totalProgress / totalGoal) * 100 : 0;

                  return (
                    <Card key={userQuest._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{quest.title}</CardTitle>
                          <Badge variant="secondary">
                            {quest.type}
                          </Badge>
                        </div>
                        <CardDescription>{quest.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                          <Progress value={percentage} />
                        </div>

                        <div className="space-y-2">
                          {userQuest.progress.map((prog, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {quest.requirements[idx]?.type.replace(/_/g, ' ')}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {prog.current}/{prog.goal}
                                </span>
                                {prog.completed && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t">
                          <div className="text-sm text-gray-600">
                            Rewards: {quest.rewards.xp} XP
                            {quest.rewards.badges.length > 0 && 
                              ` + ${quest.rewards.badges.length} badge(s)`
                            }
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Completed</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedQuests.map((userQuest) => {
                  const quest = userQuest.quest;
                  if (!quest) return null;

                  return (
                    <Card key={userQuest._id} className="border-green-200 bg-green-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{quest.title}</CardTitle>
                          <Badge className="bg-green-600">Complete</Badge>
                        </div>
                        <CardDescription>{quest.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => handleClaimRewards(userQuest._id)}
                          disabled={loading === userQuest._id || userQuest.status === "claimed"}
                          className="w-full"
                        >
                          {userQuest.status === "claimed" ? "Claimed" : "Claim Rewards"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Available Quests */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Available Quests</h2>
            {!activeQuests || activeQuests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No active quests available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeQuests.map((quest) => {
                  const isStarted = startedQuestIds.has(quest._id);
                  const daysLeft = Math.ceil((quest.endDate - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <Card key={quest._id} className={isStarted ? "opacity-50" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{quest.title}</CardTitle>
                          <Badge variant="outline">
                            {quest.type}
                          </Badge>
                        </div>
                        <CardDescription>{quest.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">Requirements:</div>
                          {quest.requirements.map((req, idx) => (
                            <div key={idx} className="text-sm text-gray-700">
                              • {req.type.replace(/_/g, ' ')}: {req.goal}
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t space-y-2">
                          <div className="text-sm">
                            <span className="font-semibold">Rewards:</span> {quest.rewards.xp} XP
                            {quest.rewards.badges.length > 0 && 
                              `, ${quest.rewards.badges.join(', ')}`
                            }
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{daysLeft} days left</span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleStartQuest(quest._id)}
                          disabled={isStarted || loading === quest._id}
                          className="w-full"
                        >
                          {isStarted ? "Already Started" : "Start Quest"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
}
