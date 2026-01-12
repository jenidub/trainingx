const CANONICAL_SKILLS = [
  "generative_ai",
  "agentic_ai",
  "synthetic_ai",
  "coding",
  "agi_readiness",
  "communication",
  "logic",
  "planning",
  "analysis",
  "creativity",
  "collaboration",
];

const CANONICAL_SKILL_SET = new Set(CANONICAL_SKILLS);

const TAG_SKILL_MAP: Record<string, string[]> = {
  clarity: ["communication"],
  specificity: ["communication"],
  constraints: ["planning"],
  basics: ["generative_ai"],
  advanced: ["synthetic_ai"],
  "prompt-engineering": ["generative_ai"],
  tool: ["agentic_ai"],
  "tool-selection": ["agentic_ai"],
  "ai-features": ["agentic_ai"],
  "ai-tools": ["agentic_ai"],
  chatgpt: ["agentic_ai"],
  claude: ["agentic_ai"],
  gemini: ["agentic_ai"],
  automation: ["agentic_ai"],
  patterns: ["generative_ai"],
  templates: ["generative_ai"],
  techniques: ["generative_ai"],
  "advanced-techniques": ["synthetic_ai"],
  reasoning: ["logic"],
  "chain-of-thought": ["logic"],
  analysis: ["analysis"],
  planning: ["planning"],
  optimization: ["coding"],
  debugging: ["coding"],
  testing: ["coding"],
  context: ["communication"],
  memory: ["communication"],
  conversation: ["communication"],
  safety: ["agi_readiness"],
  ethics: ["agi_readiness"],
  bias: ["agi_readiness"],
  "responsible-ai": ["agi_readiness"],
  multimodal: ["synthetic_ai"],
  vision: ["synthetic_ai"],
  images: ["synthetic_ai"],
};

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

export function mapPracticeTagsToSkills(tags?: string[]) {
  if (!tags || tags.length === 0) return [];

  const mapped = new Set<string>();

  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    const canonicalCandidate = normalized.replace(/[\s-]+/g, "_");

    if (CANONICAL_SKILL_SET.has(canonicalCandidate)) {
      mapped.add(canonicalCandidate);
      continue;
    }

    const mappedSkills = TAG_SKILL_MAP[normalized];
    if (!mappedSkills) continue;

    for (const skill of mappedSkills) {
      if (CANONICAL_SKILL_SET.has(skill)) {
        mapped.add(skill);
      }
    }
  }

  return Array.from(mapped);
}

export { CANONICAL_SKILLS };
