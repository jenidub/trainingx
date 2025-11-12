"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CareerOpportunitiesCardProps {
  unlocked: any[];
  almostUnlocked: any[];
}

export function CareerOpportunitiesCard({
  unlocked,
  almostUnlocked,
}: CareerOpportunitiesCardProps) {
  const displayMatches = unlocked.slice(0, 3);

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle>Career Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayMatches.length > 0 ? (
            displayMatches.map((match: any, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:border-blue-300 transition-colors duration-300 animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{match.careerTitle}</h4>
                  <Badge variant="outline" className="bg-blue-50">
                    {match.matchScore}% Match
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{match.description}</p>
                <div className="flex flex-wrap gap-1">
                  {match.keySkills?.slice(0, 3).map((skill: string, skillIndex: number) => (
                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Complete assessments to unlock career matches</p>
          )}

          {almostUnlocked.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg animate-in fade-in duration-500">
              <p className="text-sm text-yellow-800">
                <strong>{almostUnlocked.length}</strong> more opportunities almost unlocked!
                Improve your skills to unlock them.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

