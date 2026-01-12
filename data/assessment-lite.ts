import { Step } from "@/lib/shared-types";
import { Rubric } from "@/lib/scoring";

// NOTE: We are repurposing the 'Rubric' types to match our new 5-Lane Archetype model
// clarity -> clarity (Generative/Creative)
// constraints -> constraints (Agentic/Systems)
// iteration -> iteration (Synthetic/Logic)
// tool -> tool (Superintelligence/Strategy)
// (Vibecoding is calculated as a mix in the UI, but here we can map it to 'clarity' or spread it)

export const questions: (Step & { primaryDimension: keyof Rubric })[] = [
  {
    type: "multiple-choice",
    question:
      "You ask AI to write a sales email. It comes back flat and robotic. You:",
    primaryDimension: "clarity", // Mapping to Generative/Vibe
    options: [
      {
        quality: "good",
        text: "Give it examples of your exact tone and style",
        explanation:
          "Teaching the AI your specific voice (Vibecoding) is the most effective way to fix tone.",
      },
      {
        quality: "almost",
        text: "Tell it 'make this sound more human'",
        explanation: "A bit vague, but better than nothing.",
      },
      {
        quality: "bad",
        text: "Rewrite it yourself and move on",
        explanation: "Misses the opportunity to train the AI.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question: "AI gives you a plan, but something feels off. You:",
    primaryDimension: "iteration", // Mapping to Synthetic/Logic
    options: [
      {
        quality: "good",
        text: "Ask it to explain the logic behind each step",
        explanation:
          "Probing the AI's reasoning (Synthetic) helps uncover hallucinations or logic gaps.",
      },
      {
        quality: "almost",
        text: "Tell it your concerns and ask for alternatives",
        explanation:
          "Good collaboration, but doesn't necessarily fix the root logic error.",
      },
      {
        quality: "bad",
        text: "Accept it and adjust later if needed",
        explanation: "Accepting flawed logic leads to bad outcomes.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question: "You need AI to handle a repetitive task every week. You:",
    primaryDimension: "constraints", // Mapping to Agentic/Systems
    options: [
      {
        quality: "good",
        text: "Build a system where AI does it automatically",
        explanation:
          "True Agentic thinking involves building systems, not just running prompts.",
      },
      {
        quality: "almost",
        text: "Write one detailed prompt and reuse it each time",
        explanation: "Efficient, but still manual execution.",
      },
      {
        quality: "bad",
        text: "Ask AI for new ideas each time to keep it fresh",
        explanation: "Inefficient for repetitive tasks that need consistency.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question: "You're brainstorming ideas for a project. You ask AI to:",
    primaryDimension: "tool", // Mapping to Superintel/Strategy
    options: [
      {
        quality: "good",
        text: "Show you how to scale this into something bigger",
        explanation:
          "Superintelligence is about scale, leverage, and seeing the bigger picture.",
      },
      {
        quality: "almost",
        text: "Give you 20 wild, unconventional ideas",
        explanation:
          "Good for Generative brainstorming, but lacks the strategic leverage.",
      },
      {
        quality: "bad",
        text: "Analyze what's worked before",
        explanation:
          "Looking backward (Synthetic) isn't always best for new brainstorming.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question: "You're creating content for social media. You tell AI:",
    primaryDimension: "clarity", // Mapping to Generative/Vibecoding
    options: [
      {
        quality: "good",
        text: '"Write a post that sounds like me — here\'s my past content"',
        explanation:
          "Vibecoding mastery involves cloning your own authentic voice.",
      },
      {
        quality: "almost",
        text: '"Write 10 posts I can schedule for the week"',
        explanation:
          "Good Agentic workflow, but might lack the personal connection.",
      },
      {
        quality: "bad",
        text: '"Write a post about [topic]"',
        explanation:
          "Zero-shot prompting often yields generic, robotic results.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question: "You're solving a business problem. You use AI to:",
    primaryDimension: "tool", // Mapping to Superintel/Strategy
    options: [
      {
        quality: "good",
        text: "Map out how this problem connects to long-term growth",
        explanation:
          "Strategic thinking (Superintel) connects immediate problems to long-term goals.",
      },
      {
        quality: "almost",
        text: "Break down the problem and test each part logically",
        explanation:
          "Strong Synthetic approach, very useful but less 'big picture'.",
      },
      {
        quality: "bad",
        text: "Generate creative solutions you hadn't considered",
        explanation:
          "Creative (Generative) is good, but might miss local constraints.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question: "Your favorite way to use AI right now:",
    primaryDimension: "constraints", // Mapping to Agentic
    options: [
      {
        quality: "good",
        text: "Automate tasks and save time",
        explanation:
          "The Agentic mindset is all about leverage and time-saving.",
      },
      {
        quality: "almost",
        text: "Create content and generate ideas",
        explanation:
          "Generative use is fun but often less high-leverage than automation.",
      },
      {
        quality: "bad",
        text: "I only use it when I'm stuck",
        explanation: "Reactive use misses the vast majority of AI's potential.",
      },
    ],
  },
];
