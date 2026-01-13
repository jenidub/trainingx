import type { LucideIcon } from "lucide-react";
import {
  Palette,
  Cpu,
  Brain,
  Crown,
  Laptop,
  Smartphone,
  DollarSign,
  GraduationCap,
} from "lucide-react";

export type ScoreCategory = "creator" | "tech" | "logic" | "ceo";
export type FilterType = "hasLaptop" | "wantsMoney";

export interface YouthQuestionOption {
  id: "a" | "b";
  text: string;
  score?: Partial<Record<ScoreCategory, number>>;
  filter?: Partial<Record<FilterType, boolean>>;
}

export interface YouthQuestion {
  id: string;
  text: string;
  section: ScoreCategory | "filter";
  sectionTitle?: string;
  options: [YouthQuestionOption, YouthQuestionOption];
}

export interface PathwayProfile {
  id: ScoreCategory;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const pathwayProfiles: Record<ScoreCategory, PathwayProfile> = {
  creator: {
    id: "creator",
    title: "The Creator",
    subtitle: "Visual & Creative Genius",
    description:
      "You have a natural eye for aesthetics and love bringing ideas to life visually. AI tools like image generators and video editors are your playground.",
    icon: Palette,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  tech: {
    id: "tech",
    title: "The Technician",
    subtitle: "Hardware & Systems Expert",
    description:
      "You love understanding how things work under the hood. Building, fixing, and optimizing tech comes naturally to you.",
    icon: Cpu,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  logic: {
    id: "logic",
    title: "The Strategist",
    subtitle: "Logic & Prompting Pro",
    description:
      "You think in systems and love solving complex problems. You'll excel at crafting precise AI prompts and building automation workflows.",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  ceo: {
    id: "ceo",
    title: "The Leader",
    subtitle: "Business & Influence Master",
    description:
      "You're a natural decision-maker and communicator. Building brands, leading teams, and turning ideas into businesses is your strength.",
    icon: Crown,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
};

export const youthQuestions: YouthQuestion[] = [
  // SECTION 1: VISUAL & CREATIVE APTITUDE (Creator_Score)
  {
    id: "creator_1",
    text: "When scrolling social media, do you care more about:",
    section: "creator",
    sectionTitle: "Visual & Creative",
    options: [
      { id: "a", text: "Just watching the content" },
      {
        id: "b",
        text: 'The aesthetic, the editing, and the "vibe" of the post',
        score: { creator: 1 },
      },
    ],
  },
  {
    id: "creator_2",
    text: "In a group project, which job do you naturally grab?",
    section: "creator",
    options: [
      {
        id: "a",
        text: "Making the slides and visuals look perfect",
        score: { creator: 1 },
      },
      { id: "b", text: "Doing the research or the speaking" },
    ],
  },
  {
    id: "creator_3",
    text: "In your free time, do you find yourself creating things (Digital Art, Fashion, Music, or Room Decor)?",
    section: "creator",
    options: [
      { id: "a", text: "Yes, I love designing things", score: { creator: 1 } },
      { id: "b", text: "No, I prefer consuming content" },
    ],
  },
  {
    id: "creator_4",
    text: "If you had an AI Assistant, would you use it to:",
    section: "creator",
    options: [
      {
        id: "a",
        text: "Generate amazing images and videos for your feed",
        score: { creator: 1 },
      },
      { id: "b", text: "Handle your schedule and homework" },
    ],
  },

  // SECTION 2: HARDWARE & SYSTEMS APTITUDE (Tech_Score)
  {
    id: "tech_1",
    text: "When an app keeps crashing or your phone acts up, do you:",
    section: "tech",
    sectionTitle: "Hardware & Systems",
    options: [
      {
        id: "a",
        text: "Google the fix and try to troubleshoot it yourself",
        score: { tech: 1 },
      },
      { id: "b", text: "Get frustrated and ask someone else to fix it" },
    ],
  },
  {
    id: "tech_2",
    text: "Do you prefer tasks that are hands-on and active, or tasks that involve sitting and writing?",
    section: "tech",
    options: [
      { id: "a", text: "Hands-On / Active", score: { tech: 1 } },
      { id: "b", text: "Writing / Chill" },
    ],
  },
  {
    id: "tech_3",
    text: "How do you feel about the physical side of Tech (Drones, Sensors, or building PCs)?",
    section: "tech",
    options: [
      {
        id: "a",
        text: "I want to learn how the hardware actually works",
        score: { tech: 1 },
      },
      { id: "b", text: "I just want to use the technology, not build it" },
    ],
  },
  {
    id: "tech_4",
    text: "When you get a new device (Phone, Laptop, Console), do you:",
    section: "tech",
    options: [
      {
        id: "a",
        text: "Immediately go into settings to customize and optimize it",
        score: { tech: 1 },
      },
      { id: "b", text: "Just use it exactly how it came out of the box" },
    ],
  },

  // SECTION 3: STRATEGIC & PROMPTING APTITUDE (Logic_Score)
  {
    id: "logic_1",
    text: "When playing games (Roblox, Sims, Fortnite, or Strategy apps), are you the type who:",
    section: "logic",
    sectionTitle: "Strategy & Logic",
    options: [
      { id: "a", text: "Just plays for fun/socializing" },
      {
        id: "b",
        text: "Obsesses over the strategy, stats, and optimal way to win",
        score: { logic: 1 },
      },
    ],
  },
  {
    id: "logic_2",
    text: 'When you have a massive "To-Do" list, do you:',
    section: "logic",
    options: [
      { id: "a", text: "Just start doing random things" },
      {
        id: "b",
        text: "Make a plan or list to get it done efficiently",
        score: { logic: 1 },
      },
    ],
  },
  {
    id: "logic_3",
    text: "Do you enjoy puzzles, escape rooms, or figuring out the plot twist in a movie before it happens?",
    section: "logic",
    options: [
      { id: "a", text: "Yes, I love solving the mystery", score: { logic: 1 } },
      { id: "b", text: "No, I just want to watch the movie" },
    ],
  },
  {
    id: "logic_4",
    text: 'Are you the "Translator" in your friend group? (Do you find yourself explaining complex things so others understand?)',
    section: "logic",
    options: [
      {
        id: "a",
        text: "Yes, I'm good at breaking things down",
        score: { logic: 1 },
      },
      { id: "b", text: "No, people usually misunderstand me" },
    ],
  },

  // SECTION 4: BUSINESS & INFLUENCE APTITUDE (CEO_Score)
  {
    id: "ceo_1",
    text: "In your friend group, when no one can decide what to do, do you:",
    section: "ceo",
    sectionTitle: "Business & Leadership",
    options: [
      { id: "a", text: "Step up and make the plan", score: { ceo: 1 } },
      { id: "b", text: "Wait for someone else to decide" },
    ],
  },
  {
    id: "ceo_2",
    text: "Does the idea of building your own Brand or Business excite you?",
    section: "ceo",
    options: [
      { id: "a", text: "Yes, I want to be my own boss", score: { ceo: 1 } },
      { id: "b", text: "It sounds like too much stress" },
    ],
  },
  {
    id: "ceo_3",
    text: "Are you good at convincing your friends or parents to see things your way?",
    section: "ceo",
    options: [
      { id: "a", text: "Yes, I'm pretty persuasive", score: { ceo: 1 } },
      { id: "b", text: "No, I hate debating" },
    ],
  },

  // SECTION 5: FILTER (Constraints)
  {
    id: "filter_laptop",
    text: "Do you have access to a laptop/computer at home?",
    section: "filter",
    sectionTitle: "Your Situation",
    options: [
      { id: "a", text: "Yes", filter: { hasLaptop: true } },
      {
        id: "b",
        text: "No, mostly just my phone",
        filter: { hasLaptop: false },
      },
    ],
  },
  {
    id: "filter_goal",
    text: "What is your main focus right now?",
    section: "filter",
    options: [
      {
        id: "a",
        text: "I need to make money ASAP",
        filter: { wantsMoney: true },
      },
      {
        id: "b",
        text: "I want to learn skills for a future high-paying career",
        filter: { wantsMoney: false },
      },
    ],
  },
];

export interface YouthQuizScores {
  creator: number;
  tech: number;
  logic: number;
  ceo: number;
}

export interface YouthQuizFilters {
  hasLaptop: boolean;
  wantsMoney: boolean;
}

export interface YouthQuizResult {
  scores: YouthQuizScores;
  filters: YouthQuizFilters;
  dominantPath: ScoreCategory;
  answers: Record<string, "a" | "b">;
}

export function calculateYouthResults(
  answers: Record<string, "a" | "b">
): YouthQuizResult {
  const scores: YouthQuizScores = { creator: 0, tech: 0, logic: 0, ceo: 0 };
  const filters: YouthQuizFilters = { hasLaptop: true, wantsMoney: false };

  youthQuestions.forEach((question) => {
    const answer = answers[question.id];
    if (!answer) return;

    const selectedOption = question.options.find((opt) => opt.id === answer);
    if (!selectedOption) return;

    // Apply scores
    if (selectedOption.score) {
      Object.entries(selectedOption.score).forEach(([category, points]) => {
        scores[category as ScoreCategory] += points || 0;
      });
    }

    // Apply filters
    if (selectedOption.filter) {
      Object.entries(selectedOption.filter).forEach(([key, value]) => {
        filters[key as FilterType] = value as boolean;
      });
    }
  });

  // Determine dominant path
  const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const dominantPath = sortedScores[0][0] as ScoreCategory;

  return { scores, filters, dominantPath, answers };
}
