"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send, AlertCircle, Sparkles, RefreshCw, Edit2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContextProvider";

const TEMPLATE_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "prompt-draft", label: "Prompt Draft" },
  { value: "prompt-surgery", label: "Prompt Surgery" },
];

const SKILLS = [
  "communication",
  "clarity",
  "logic",
  "planning",
  "analysis",
  "creativity",
  "collaboration",
  "generative_ai",
  "agentic_ai",
  "synthetic_ai",
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "mixed", label: "Mixed (Varied)" },
];

const STYLE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "technical", label: "Technical" },
  { value: "creative", label: "Creative" },
  { value: "business", label: "Business" },
];

export default function TemplateEditorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createDraftFromGeneration = useMutation(api.creatorStudio.createDraftFromGeneration);
  const generateQuestions = useAction(api.creatorStudio.generateQuestionsWithAI);
  const regenerateQuestion = useAction(api.creatorStudio.regenerateQuestion);

  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Generation config
  const [templateType, setTemplateType] = useState("multiple-choice");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState("5");
  const [style, setStyle] = useState("general");
  const [targetAudience, setTargetAudience] = useState("");

  // Generated content
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const validateConfig = () => {
    const newErrors: string[] = [];
    if (selectedSkills.length === 0) newErrors.push("Select at least one topic/skill");
    if (selectedSkills.length > 5) newErrors.push("Maximum 5 topics allowed");
    const count = parseInt(questionCount);
    if (count < 1 || count > 20) newErrors.push("Question count must be between 1 and 20");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleGenerate = async () => {
    if (!validateConfig()) return;

    setGenerating(true);
    setErrors([]);
    try {
      const result = await generateQuestions({
        config: {
          difficulty,
          topics: selectedSkills,
          questionCount: parseInt(questionCount),
          style,
          targetAudience: targetAudience || undefined,
          itemType: templateType,
        },
      });

      setGeneratedQuestions(result.questions);
      
      // Auto-generate title and description
      const topicsStr = selectedSkills.slice(0, 3).join(", ");
      setTitle(`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${templateType.replace("-", " ")} - ${topicsStr}`);
      setDescription(`Practice ${templateType.replace("-", " ")} questions focusing on ${topicsStr}. Difficulty: ${difficulty}. Generated for ${targetAudience || "general learners"}.`);
      
      setStep(2);
    } catch (error) {
      console.error("Generation failed:", error);
      setErrors([error instanceof Error ? error.message : "Failed to generate questions"]);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateQuestion = async (index: number) => {
    setGenerating(true);
    try {
      const result = await regenerateQuestion({
        config: {
          difficulty,
          topics: selectedSkills,
          style,
          targetAudience: targetAudience || undefined,
          itemType: templateType,
        },
        previousQuestion: generatedQuestions[index].text,
      });

      const newQuestions = [...generatedQuestions];
      newQuestions[index] = result.question;
      setGeneratedQuestions(newQuestions);
    } catch (error) {
      console.error("Regeneration failed:", error);
      setErrors([error instanceof Error ? error.message : "Failed to regenerate question"]);
    } finally {
      setGenerating(false);
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...generatedQuestions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setGeneratedQuestions(newQuestions);
  };

  const validateGenerated = () => {
    const newErrors: string[] = [];
    if (title.length < 10) newErrors.push("Title must be at least 10 characters");
    if (description.length < 50) newErrors.push("Description must be at least 50 characters");
    if (generatedQuestions.length === 0) newErrors.push("No questions generated");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validateGenerated() || !user?._id) return;

    setSubmitting(true);
    try {
      await createDraftFromGeneration({
        title,
        description,
        questions: generatedQuestions,
        config: {
          difficulty,
          topics: selectedSkills,
          questionCount: parseInt(questionCount),
          style,
          targetAudience: targetAudience || undefined,
          itemType: templateType,
        },
      });

      router.push(`/creator`);
    } catch (error) {
      console.error("Failed to save draft:", error);
      setErrors(["Failed to save draft. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/creator" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Creator Studio
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              AI Question Generator
            </h1>
            <p className="text-gray-600">Generate practice questions with AI - no manual entry needed</p>
          </div>
          <Badge variant="outline">Step {step} of 2</Badge>
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Validation Errors</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Generation Config */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Configure AI Generation</CardTitle>
              <CardDescription>Tell the AI what kind of questions you want to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900">AI-Powered Generation</p>
                    <p className="text-sm text-purple-700 mt-1">
                      Describe what you want, and AI will generate complete questions with options, 
                      explanations, and evaluation criteria. You can edit everything afterward.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="template-type">Question Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Topics/Skills * (Select 1-5)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SKILLS.map(skill => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {selectedSkills.length}/5
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="count">Number of Questions</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">1-20 questions</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="style">Style/Context</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience (optional)</Label>
                  <Input
                    id="audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., marketers, developers"
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Questions with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review & Edit Generated Questions */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Review & Edit Generated Questions</CardTitle>
                <CardDescription>
                  Review AI-generated questions. Edit titles, regenerate individual questions, or save as draft.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this question set"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generated Questions */}
            {generatedQuestions.map((q, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegenerateQuestion(index)}
                        disabled={generating}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${generating ? "animate-spin" : ""}`} />
                        Regenerate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        {editingIndex === index ? "Done" : "Edit"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{q.difficulty}</Badge>
                    {q.topics.map((topic: string) => (
                      <Badge key={topic} variant="outline">{topic}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editingIndex === index ? (
                    <>
                      <div>
                        <Label>Question Text</Label>
                        <Textarea
                          value={q.text}
                          onChange={(e) => updateQuestion(index, "text", e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Expected Approach</Label>
                        <Textarea
                          value={q.expectedApproach}
                          onChange={(e) => updateQuestion(index, "expectedApproach", e.target.value)}
                          rows={2}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold text-sm text-gray-600">Question:</p>
                        <p className="text-gray-900">{q.text}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-600">Expected Approach:</p>
                        <p className="text-sm text-gray-700">{q.expectedApproach}</p>
                      </div>
                    </>
                  )}

                  {templateType === "multiple-choice" && q.options && (
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-2">Options:</p>
                      <div className="space-y-2">
                        {q.options.map((opt: any, optIndex: number) => (
                          <div key={optIndex} className="bg-gray-50 p-3 rounded border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{opt.text}</p>
                                <p className="text-sm text-gray-600 mt-1">{opt.explanation}</p>
                              </div>
                              <Badge
                                variant={
                                  opt.quality === "good"
                                    ? "default"
                                    : opt.quality === "almost"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {opt.quality}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-sm text-gray-600 mb-1">Hints:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {q.hints.map((hint: string, hintIndex: number) => (
                        <li key={hintIndex}>• {hint}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Config
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    disabled={submitting}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {submitting ? "Saving..." : "Save as Draft"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
