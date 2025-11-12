"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Swords, Trophy, Clock, Target, TrendingUp, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Id } from "convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContextProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function DuelArena() {
  const [selectedTab, setSelectedTab] = useState("active");
  const { user } = useAuth();

  const userDuels = useQuery(
    api.duels.getUserDuels,
    user?._id ? { userId: user._id as any } : "skip"
  );
  const openDuels = useQuery(api.duels.getOpenDuels, { limit: 10 });
  const duelStats = useQuery(
    api.duels.getDuelStats,
    user?._id ? { userId: user._id as any } : "skip"
  );
  const createDuel = useMutation(api.duels.createDuel);
  const acceptDuel = useMutation(api.duels.acceptDuel);

  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [duelParams, setDuelParams] = useState({
    itemCount: 5,
    difficulty: "matched",
  });

  const handleCreateDuel = async () => {
    if (!user?._id) return;
    setCreating(true);
    try {
      const result = await createDuel({ 
        userId: user._id as any,
        itemCount: duelParams.itemCount,
        minPlayers: 2,
        maxPlayers: 10,
      });
      setShowCreateDialog(false);
      // Redirect to room lobby
      window.location.href = `/duels/${result.roomId}`;
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptDuel = async (roomId: Id<"practiceDuels">) => {
    if (!user?._id) return;
    try {
      await acceptDuel({ 
        userId: user._id as any,
        roomId 
      });
      window.location.href = `/duels/${roomId}`;
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  // Show loading only if undefined
  if (duelStats === undefined) {
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

  // If null, user not authenticated
  if (duelStats === null) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please log in to access Duels</p>
        </CardContent>
      </Card>
    );
  }

  const activeDuels = userDuels?.filter((d) => d.status === "active") || [];
  const completedDuels =
    userDuels?.filter((d) => d.status === "completed") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Swords className="h-8 w-8 text-red-600" />
            Duel Arena
          </h1>
          <p className="text-gray-600 mt-1">
            Challenge others and prove your prompting skills
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Duel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Duels</div>
                <div className="text-2xl font-bold">{duelStats.totalRooms}</div>
              </div>
              <Swords className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Wins</div>
                <div className="text-2xl font-bold text-green-600">
                  {duelStats.wins}
                </div>
              </div>
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Win Rate</div>
                <div className="text-2xl font-bold">{duelStats.winRate}%</div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Active</div>
                <div className="text-2xl font-bold">
                  {duelStats.activeRooms}
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duels Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeDuels.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Open Challenges ({openDuels?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedDuels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeDuels.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Swords className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No active duels</p>
                <Button onClick={handleCreateDuel}>
                  Create Your First Duel
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeDuels.map((duel) => (
              <Card
                key={duel._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Duel #{duel._id.slice(-6)}
                    </CardTitle>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <CardDescription>
                    {duel.itemIds.length} items · Started{" "}
                    {new Date(duel.startedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm">
                        Your Score:{" "}
                        <span className="font-bold">
                          {duel.challengerScore}
                        </span>
                      </div>
                      {duel.opponentScore !== undefined && (
                        <div className="text-sm">
                          Opponent:{" "}
                          <span className="font-bold">
                            {duel.opponentScore}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button asChild>
                      <Link href={`/duels/${duel._id}`}>Continue</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          {!openDuels || openDuels.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No open challenges available</p>
              </CardContent>
            </Card>
          ) : (
            openDuels.map((duel) => (
              <Card
                key={duel._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Open Challenge #{duel._id.slice(-6)}
                    </CardTitle>
                    <Badge>Open</Badge>
                  </div>
                  <CardDescription>
                    {duel.itemIds.length} items · Created{" "}
                    {new Date(duel.startedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Expires in{" "}
                      {Math.ceil(
                        (duel.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </div>
                    <Button onClick={() => handleAcceptDuel(duel._id)}>
                      Accept Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedDuels.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No completed duels yet</p>
              </CardContent>
            </Card>
          ) : (
            completedDuels.map((duel) => (
              <Card key={duel._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Duel #{duel._id.slice(-6)}
                    </CardTitle>
                    <Badge variant={duel.winnerId ? "default" : "outline"}>
                      {duel.winnerId ? "Completed" : "Draw"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Completed{" "}
                    {new Date(duel.completedAt || 0).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm">
                        Final Score:{" "}
                        <span className="font-bold">
                          {duel.challengerScore}
                        </span>{" "}
                        vs{" "}
                        <span className="font-bold">
                          {duel.opponentScore || 0}
                        </span>
                      </div>
                      {duel.winnerId && (
                        <div className="text-sm font-medium text-green-600">
                          {duel.winnerId === duel.challengerId
                            ? "Victory!"
                            : "Defeat"}
                        </div>
                      )}
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/duels/${duel._id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Duel Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Create Battle Room
            </DialogTitle>
            <DialogDescription>
              Create a multi-player room for 2-10 players
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-count">Number of Items</Label>
              <Select
                value={duelParams.itemCount.toString()}
                onValueChange={(value) => setDuelParams({ ...duelParams, itemCount: parseInt(value) })}
              >
                <SelectTrigger id="item-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Items (Quick - 5 min)</SelectItem>
                  <SelectItem value="5">5 Items (Standard - 10 min)</SelectItem>
                  <SelectItem value="10">10 Items (Marathon - 20 min)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                More items = longer duel but more accurate skill test
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={duelParams.difficulty}
                onValueChange={(value) => setDuelParams({ ...duelParams, difficulty: value })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matched">Matched (Your Skill Level)</SelectItem>
                  <SelectItem value="easy">Easy (Practice Mode)</SelectItem>
                  <SelectItem value="hard">Hard (Challenge Mode)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Items will be selected based on your current skill rating
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>💡 Multi-Player:</strong> 2-10 players can join! Items are selected at your skill level for fair competition.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDuel}
              disabled={creating}
              className="flex-1"
            >
              {creating ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
