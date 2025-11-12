"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Sparkles, 
  Copy, 
  FileEdit, 
  Trophy, 
  TrendingUp,
  Users,
  Star
} from "lucide-react";
import Link from "next/link";

export function CreatorStudioEntry() {
  const { user } = useAuth();
  const profile = useQuery(
    api.creatorStudio.getCreatorProfile,
    user?._id ? { userId: user._id as any } : "skip"
  );
  const drafts = useQuery(
    api.creatorStudio.getUserDrafts,
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Type guard to ensure we have a creator profile
  const isCreatorProfile = (p: any): p is { 
    _id: any; 
    userId: any;
    displayName: string;
    stats: {
      publishedItems: number;
      totalPlays: number;
      averageRating: number;
      remixCount: number;
      adoptionRate: number;
    };
    level: number;
    [key: string]: any;
  } => {
    return p && 'stats' in p && 'level' in p;
  };

  // Show loading only if undefined (still loading)
  if (profile === undefined) {
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
  if (profile === null) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please log in to access Creator Studio</p>
        </CardContent>
      </Card>
    );
  }

  // If profile doesn't have expected shape, show error
  if (!isCreatorProfile(profile)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Error loading creator profile</p>
        </CardContent>
      </Card>
    );
  }

  const draftCount = drafts?.filter(d => d.status === "draft").length || 0;
  const pendingCount = drafts?.filter(d => d.status === "pending").length || 0;
  const publishedCount = profile.stats.publishedItems;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Studio</h1>
          <p className="text-gray-600 mt-1">
            Build and share practice content with the community
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Level {profile.level} Creator
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Published</div>
                <div className="text-2xl font-bold">{publishedCount}</div>
              </div>
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Plays</div>
                <div className="text-2xl font-bold">{profile.stats.totalPlays}</div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Avg Rating</div>
                <div className="text-2xl font-bold">
                  {profile.stats.averageRating.toFixed(1)}
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Remixes</div>
                <div className="text-2xl font-bold">{profile.stats.remixCount}</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creation Options */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Start Creating</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Copy className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Remix Existing</CardTitle>
              </div>
              <CardDescription>
                Start with a proven project and customize it for your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/creator/remix">
                  Browse Projects
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <FileEdit className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Template Fill</CardTitle>
              </div>
              <CardDescription>
                Use guided templates to create new practice items quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/creator/template">
                  Choose Template
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">From Scratch</CardTitle>
              </div>
              <CardDescription>
                Full creative control with advanced editor for experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/creator/scratch">
                  Start Building
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drafts Overview */}
      {drafts && drafts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Drafts</h2>
            <Link href="/creator/drafts" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.slice(0, 4).map((draft) => (
              <Card key={draft._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{draft.title}</CardTitle>
                    <Badge
                      variant={
                        draft.status === "published"
                          ? "default"
                          : draft.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {draft.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {draft.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/creator/edit/${draft._id}`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle>Creator Resources</CardTitle>
          <CardDescription>
            Learn best practices and get help creating quality content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            href="/creator/docs"
            className="block text-sm text-blue-600 hover:underline"
          >
            📚 Creator Documentation
          </Link>
          <Link
            href="/creator/examples"
            className="block text-sm text-blue-600 hover:underline"
          >
            ✨ Example Projects
          </Link>
          <Link
            href="/creator/guidelines"
            className="block text-sm text-blue-600 hover:underline"
          >
            ✅ Content Guidelines
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
