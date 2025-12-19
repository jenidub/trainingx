"use client";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Sparkles,
  Zap,
  Monitor,
  Image as ImageIcon,
  Video,
  Mic,
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  features: string[];
}

const platforms: Platform[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description:
      "OpenAI's conversational AI for text generation, coding, and problem-solving",
    url: "https://chat.openai.com",
    category: "Conversational AI",
    features: [
      "Text generation",
      "Code assistance",
      "Problem solving",
      "Research",
    ],
  },
  {
    id: "claude",
    name: "Claude",
    description:
      "Anthropic's AI assistant focused on helpful, harmless, and honest conversations",
    url: "https://claude.ai",
    category: "Conversational AI",
    features: ["Long context", "Analysis", "Writing", "Coding"],
  },
  {
    id: "notebook-lm",
    name: "Notebook LM",
    description: "Google's AI-powered note-taking and research assistant",
    url: "https://notebooklm.google.com",
    category: "Research & Notes",
    features: [
      "Document analysis",
      "Note organization",
      "Source grounding",
      "Summarization",
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description:
      "AI-powered search engine with real-time web search capabilities",
    url: "https://www.perplexity.ai",
    category: "Search & Research",
    features: [
      "Real-time search",
      "Citations",
      "Follow-up questions",
      "Sources",
    ],
  },
  {
    id: "gamma",
    name: "Gamma",
    description: "AI-powered presentation and document creation tool",
    url: "https://gamma.app",
    category: "Content Creation",
    features: ["Presentations", "Documents", "Webpages", "Design automation"],
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "AI image generation platform for creative visual content",
    url: "https://www.midjourney.com",
    category: "Image Generation",
    features: ["Image creation", "Art styles", "Prompting", "High quality"],
  },
  {
    id: "runway",
    name: "Runway",
    description: "AI video generation and editing platform",
    url: "https://runwayml.com",
    category: "Video Creation",
    features: [
      "Video generation",
      "Editing tools",
      "Special effects",
      "Animation",
    ],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "AI voice generation and text-to-speech platform",
    url: "https://elevenlabs.io",
    category: "Voice & Audio",
    features: ["Voice cloning", "Text-to-speech", "Dubbing", "Natural voices"],
  },
];

const categories = Array.from(new Set(platforms.map((p) => p.category)));

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Conversational AI":
      return <Monitor className="h-6 w-6 stroke-3" />;
    case "Research & Notes":
    case "Search & Research":
      return <Sparkles className="h-6 w-6 stroke-3" />;
    case "Image Generation":
      return <ImageIcon className="h-6 w-6 stroke-3" />;
    case "Video Creation":
      return <Video className="h-6 w-6 stroke-3" />;
    case "Voice & Audio":
      return <Mic className="h-6 w-6 stroke-3" />;
    default:
      return <Zap className="h-6 w-6 stroke-3" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Conversational AI":
      return "text-blue-500 bg-blue-100 border-blue-200";
    case "Research & Notes":
    case "Search & Research":
      return "text-purple-500 bg-purple-100 border-purple-200";
    case "Image Generation":
      return "text-pink-500 bg-pink-100 border-pink-200";
    case "Video Creation":
      return "text-orange-500 bg-orange-100 border-orange-200";
    case "Voice & Audio":
      return "text-green-500 bg-green-100 border-green-200";
    default:
      return "text-slate-500 bg-slate-100 border-slate-200";
  }
};

export default function PlatformGPTsPage() {
  return (
    <SidebarLayout>
      <div className="h-full overflow-auto bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-b-[6px] border-indigo-200 bg-white text-indigo-500 shadow-sm">
              <Sparkles className="h-8 w-8 stroke-3" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                AI Platform Tools
              </h1>
              <p className="text-lg font-medium text-slate-500">
                Supercharge your productivity with these tools.
              </p>
            </div>
          </div>

          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${getCategoryColor(category)}`}
                >
                  {getCategoryIcon(category)}
                </div>
                <h2 className="text-xl font-extrabold text-slate-700">
                  {category}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms
                  .filter((p) => p.category === category)
                  .map((platform) => (
                    <div
                      key={platform.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                            {platform.name}
                          </h3>
                          <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            {platform.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {platform.features.map((feature) => (
                            <span
                              key={feature}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 pt-0 mt-auto">
                        <JuicyButton
                          variant="secondary"
                          className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200"
                          asChild
                        >
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            Visit Platform
                            <ExternalLink className="h-4 w-4 stroke-3" />
                          </a>
                        </JuicyButton>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="mt-8 rounded-3xl border-2 border-b-[6px] border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
                <Zap className="h-6 w-6 stroke-3" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                  Pro Tip
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Maximize your AI skills by practicing with multiple platforms.
                  Each has unique strengths that can enhance different aspects
                  of your workflow. Try combining tools for better results!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
