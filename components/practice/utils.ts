export const levelLabel = (level: number): string => {
  if (level === 1) return "Beginner";
  if (level === 2) return "Intermediate";
  return "Advanced";
};

export const levelGradient = (level: number): string => {
  if (level === 1) return "from-green-500 to-green-600";
  if (level === 2) return "from-yellow-500 to-yellow-600";
  return "from-purple-500 to-purple-600";
};

export const getUnlockPromptScore = (
  level: number,
  difficulty: number
): number | undefined => {
  if (level === 1) return undefined;
  if (level === 2) return 65;
  return 70 + (difficulty - 1) * 5;
};
