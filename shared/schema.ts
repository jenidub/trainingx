import { SkillSignals, Rubric } from "../client/src/lib/scoring";
import { Match } from "../client/src/lib/matching";
import { z } from "zod";

export interface AssessmentHistory {
  date: string;
  promptScore: number;
  skills: SkillSignals;
  rubric: Rubric;
}

export interface ProjectResult {
  slug: string;
  completedAt: string;
  finalScore: number;
  rubric: Rubric;
  badgeEarned: boolean;
  skillsGained: string[];
}

export interface CommunityActivity {
  postsCreated: number;
  upvotesReceived: number;
  downvotesReceived: number;
  helpfulAnswers: number;
  communityScore: number;
}

export interface UserState {
  userId: string;
  userName?: string;
  isLoggedIn: boolean;
  currentProject: string | null;
  currentStep: number;
  rubric: Rubric;
  completedProjects: ProjectResult[];
  badges: string[];
  promptScore: number;
  previousPromptScore: number;
  skills: SkillSignals;
  previousSkills: SkillSignals;
  assessmentComplete: boolean;
  assessmentHistory: AssessmentHistory[];
  lastActiveDate: string;
  streak: number;
  targetMatch: Match | null;
  unlockedCareers: string[];
  communityActivity: CommunityActivity;
}

export interface PromptExample {
  quality: 'bad' | 'almost' | 'good';
  prompt: string;
  explanation: string;
}

export interface MultipleChoiceOption {
  quality: 'bad' | 'almost' | 'good';
  text: string;
  explanation: string;
}

export type Step = 
  | {
      type: 'text';
      question: string;
      expectedAnswer: string;
    }
  | {
      type: 'multiple-choice';
      question: string;
      options: MultipleChoiceOption[];
    };

export interface Project {
  slug: string;
  title: string;
  category: string;
  level: number;
  levelOrder: number;
  estTime: string;
  difficulty: number;
  badge: string;
  steps: number;
  stepDetails?: Step[];  // Actual step questions
  buildsSkills: string[];
  description: string;
  isAssessment: boolean;
  requiresCompletion?: string[];
  examplePrompts?: PromptExample[];
}

export interface Badge {
  id: string;
  name: string;
  minPS: number;
  project: string;
  earnedDate?: string;
}

export interface CustomGPT {
  id: string;
  name: string;
  instructions: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const insertCustomGPTSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  instructions: z.string().min(1, "Instructions are required").max(5000),
  createdBy: z.string(),
});

export type InsertCustomGPT = z.infer<typeof insertCustomGPTSchema>;
export type SelectCustomGPT = CustomGPT;

export function getInitialState(): UserState {
  const initialSkills = {
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
    collaboration: 0
  };

  return {
    userId: crypto.randomUUID(),
    isLoggedIn: false,
    currentProject: null,
    currentStep: 0,
    rubric: {
      clarity: 0,
      constraints: 0,
      iteration: 0,
      tool: 0
    },
    completedProjects: [],
    badges: [],
    promptScore: 0,
    previousPromptScore: 0,
    skills: initialSkills,
    previousSkills: initialSkills,
    assessmentComplete: false,
    assessmentHistory: [],
    lastActiveDate: new Date().toISOString(),
    streak: 0,
    targetMatch: null,
    unlockedCareers: [],
    communityActivity: {
      postsCreated: 0,
      upvotesReceived: 0,
      downvotesReceived: 0,
      helpfulAnswers: 0,
      communityScore: 0
    }
  };
}
