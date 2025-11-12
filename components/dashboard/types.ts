export interface UserStats {
  promptScore: number;
  skills: Record<string, number>;
  completedProjects: any[];
  badges: any[];
  streak: number;
  assessmentComplete: boolean;
  previousPromptScore?: number;
  previousSkills?: Record<string, number>;
}

export interface NextAction {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

export interface SkillLevel {
  level: string;
  color: string;
}

