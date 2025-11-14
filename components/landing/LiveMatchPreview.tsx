"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { computeMatches } from "@/lib/matching";
import { SkillSignals } from "@/lib/scoring";
import { Briefcase, Building2, DollarSign, Wrench, MapPin, Home, ArrowRight, Sparkles } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const categoryIcons = {
  career: Briefcase,
  business: Building2,
  side: DollarSign,
  trade: Wrench,
};

const categoryColors = {
  career: "from-blue-500 to-blue-600",
  business: "from-purple-500 to-purple-600",
  side: "from-green-500 to-green-600",
  trade: "from-orange-500 to-orange-600",
};

const categoryLabels = {
  career: "Career",
  business: "Business",
  side: "Side Hustle",
  trade: "Trade",
};

// Default skills for visitors
const defaultSkills: SkillSignals = {
  generative_ai: 0,
  agentic_ai: 0,
  synthetic_ai: 0,
  coding: 0,
  agi_readiness: 0,
  communication: 0,
  logic: 0,
  planning: 0,
  analysis: 0,
  creativity: 0,
  collaboration: 0,
};

export default function LiveMatchPreview() {
  // Get real matches from the platform
  const allMatches = useMemo(
    () => computeMatches(0, defaultSkills, 0, []),
    []
  );

  // Show 3 diverse matches (one from each major category)
  const previewMatches = useMemo(() => {
    const matchesByType = allMatches.reduce(
      (acc, match) => {
        if (!acc[match.type]) acc[match.type] = [];
        acc[match.type].push(match);
        return acc;
      },
      {} as Record<string, typeof allMatches>
    );

    const preview: typeof allMatches = [];
    // Get one from each category
    ['career', 'business', 'side'].forEach(type => {
      if (matchesByType[type] && matchesByType[type].length > 0) {
        preview.push(matchesByType[type][0]);
      }
    });
    
    return preview.slice(0, 3);
  }, [allMatches]);

  if (previewMatches.length === 0) {
    return null;
  }

  return (
    <AnimatedSection className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            AI Career{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Matching
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Discover opportunities matched to your skills
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {previewMatches.map((match) => {
            const Icon = categoryIcons[match.type as keyof typeof categoryIcons] || Briefcase;
            const colorClass = categoryColors[match.type as keyof typeof categoryColors] || categoryColors.career;
            
            return (
              <Card key={match.title} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg">{match.title}</CardTitle>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[match.type as keyof typeof categoryLabels] || match.type}
                    </Badge>
                    {match.seniority && (
                      <Badge variant="secondary" className="text-xs">
                        {match.seniority}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    {match.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{match.location}</span>
                      </div>
                    )}
                    {match.remotePolicy && (
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        <span>{match.remotePolicy}</span>
                      </div>
                    )}
                  </div>

                  {match.salaryRange && (
                    <div className="p-3 bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 rounded-lg">
                      <div className="font-semibold text-gray-800">
                        {match.salaryRange}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 italic">{match.reason}</p>

                  {match.requiredSkills.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2 font-medium">
                        Key Skills:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {match.requiredSkills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {skill.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-gradient-from to-gradient-to"
                  >
                    <Link href="/ai-database">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-white"
          >
            <Link href="/ai-database">
              <Sparkles className="mr-2 h-5 w-5" />
              Explore All {allMatches.length}+ Opportunities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}
