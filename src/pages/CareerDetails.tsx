import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCareerDetails,
  findSkillGaps,
  meetsRequirements,
  computeMatches,
  type CareerDetails as CareerDetailsType,
} from "@/lib/matching";
import { loadState } from "@/lib/storage";
import { UserState } from "@shared/schema";
import Navigation from "@/components/Navigation";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  TrendingUp,
  Globe,
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  Award,
} from "lucide-react";

export default function CareerDetails() {
  const { careerId } = useParams<{ careerId: string }>();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [career, setCareer] = useState<CareerDetailsType | null>(null);

  useEffect(() => {
    const state = loadState();
    setUserState(state);

    if (careerId) {
      const careerData = getCareerDetails(careerId);
      setCareer(careerData);
    }
  }, [careerId]);

  if (!userState || !career) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const allMatches = computeMatches(
    userState.promptScore,
    userState.skills,
    userState.completedProjects.length,
    userState.completedProjects.map((p) => p.slug),
  );

  const match = allMatches.find((m) => m.careerId === careerId);
  const isUnlocked =
    match &&
    meetsRequirements(
      match,
      userState.promptScore,
      userState.skills,
      userState.completedProjects.length,
    );

  const skillGaps = match ? findSkillGaps(userState.skills, match) : [];

  const getSkillName = (skill: string) => {
    return skill
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getSkillLevel = (skill: string) => {
    return userState.skills[skill as keyof typeof userState.skills] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation /> */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1
                  className="text-4xl font-bold mb-2"
                  data-testid="text-career-title"
                >
                  {career.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span data-testid="text-location">{career.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span data-testid="text-salary">{career.salaryRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span data-testid="text-employment">
                      {career.employmentType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span data-testid="text-seniority">{career.seniority}</span>
                  </div>
                </div>
              </div>
              <div>
                {isUnlocked ? (
                  <Badge
                    className="bg-green-500 text-white"
                    data-testid="badge-unlocked"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Qualified
                  </Badge>
                ) : (
                  <Badge variant="secondary" data-testid="badge-locked">
                    <XCircle className="w-4 h-4 mr-1" />
                    Not Yet Qualified
                  </Badge>
                )}
              </div>
            </div>

            <p
              className="text-lg text-gray-700 mb-6"
              data-testid="text-description"
            >
              {career.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Remote Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p data-testid="text-remote">{career.remotePolicy}</p>
                {career.visaSupport !== null && (
                  <p
                    className="text-sm text-gray-600 mt-2"
                    data-testid="text-visa"
                  >
                    Visa Support:{" "}
                    {career.visaSupport ? "Available" : "Not Available"}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Outlook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p data-testid="text-growth">{career.growthOutlook}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Impact Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {career.impactHighlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2"
                    data-testid={`text-impact-${index}`}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Key Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {career.keyTechnologies.map((tech, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    data-testid={`badge-tech-${index}`}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Skills Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Required Skills</h4>
                  <div className="space-y-3">
                    {career.requiredSkills.map((skill) => {
                      const threshold = career.skillThresholds[skill] || 60;
                      const currentLevel = getSkillLevel(skill);
                      const meets = currentLevel >= threshold;

                      return (
                        <div
                          key={skill}
                          className="space-y-1"
                          data-testid={`skill-${skill}`}
                        >
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {getSkillName(skill)}
                              </span>
                              {meets ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span
                              className={
                                meets
                                  ? "text-green-600 font-semibold"
                                  : "text-gray-600"
                              }
                            >
                              {currentLevel} / {threshold}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${meets ? "bg-green-500" : "bg-blue-500"}`}
                              style={{
                                width: `${Math.min((currentLevel / threshold) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {career.preferredSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Preferred Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {career.preferredSkills.map((skill) => {
                        const currentLevel = getSkillLevel(skill);
                        const hasSkill = currentLevel >= 60;

                        return (
                          <Badge
                            key={skill}
                            variant={hasSkill ? "default" : "outline"}
                            data-testid={`badge-preferred-${skill}`}
                          >
                            {getSkillName(skill)}{" "}
                            {hasSkill && `(${currentLevel})`}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Prompt Score Required</span>
                    <span
                      className={
                        userState.promptScore >= career.promptScoreMin
                          ? "text-green-600 font-bold"
                          : "text-gray-600"
                      }
                    >
                      {userState.promptScore} / {career.promptScoreMin}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${userState.promptScore >= career.promptScoreMin ? "bg-green-500" : "bg-blue-500"}`}
                      style={{
                        width: `${Math.min((userState.promptScore / career.promptScoreMin) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {career.portfolioProjects.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Required Projects</h4>
                    <div className="flex flex-wrap gap-2">
                      {career.portfolioProjects.map((projectSlug) => {
                        const completed =
                          userState.completedProjects.includes(projectSlug);
                        return (
                          <Badge
                            key={projectSlug}
                            variant={completed ? "default" : "outline"}
                            data-testid={`badge-project-${projectSlug}`}
                          >
                            {completed && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {projectSlug}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!isUnlocked && skillGaps.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  Next Steps to Qualify
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 mb-3">
                  Focus on improving these skills to unlock this opportunity:
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillGaps.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-blue-400"
                      data-testid={`badge-gap-${skill}`}
                    >
                      {getSkillName(skill)}
                    </Badge>
                  ))}
                </div>
                <Link href="/practice">
                  <Button className="mt-4" data-testid="button-practice">
                    Go to Practice Zone
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isUnlocked && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">
                  You're Qualified!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-800 mb-4">
                  Congratulations! Your skills meet the requirements for this
                  role. You're ready to pursue this opportunity.
                </p>
                <p className="text-sm text-green-700">
                  Continue building your skills and completing projects to
                  unlock even more opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
