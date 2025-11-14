"use client";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles } from "lucide-react";

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
    description: "OpenAI's conversational AI for text generation, coding, and problem-solving",
    url: "https://chat.openai.com",
    category: "Conversational AI",
    features: ["Text generation", "Code assistance", "Problem solving", "Research"],
  },
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic's AI assistant focused on helpful, harmless, and honest conversations",
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
    features: ["Document analysis", "Note organization", "Source grounding", "Summarization"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "AI-powered search engine with real-time web search capabilities",
    url: "https://www.perplexity.ai",
    category: "Search & Research",
    features: ["Real-time search", "Citations", "Follow-up questions", "Sources"],
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
    features: ["Video generation", "Editing tools", "Special effects", "Animation"],
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

export default function PlatformGPTsPage() {
  return (
    <SidebarLayout>
      <div className="h-full overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gradient-from to-gradient-to flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Platform Tools</h1>
                <p className="text-muted-foreground">
                  Access various AI platforms and tools to supercharge your productivity
                </p>
              </div>
            </div>
          </div>

          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms
                  .filter((p) => p.category === category)
                  .map((platform) => (
                    <Card key={platform.id}>
                      <CardHeader>
                        <CardTitle>{platform.name}</CardTitle>
                        <CardDescription>{platform.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {platform.features.map((feature) => (
                              <Badge key={feature} variant="secondary">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            className="w-full"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit Platform
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}

          <Card className="mt-8 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 border-gradient-from/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gradient-from" />
                Pro Tip
              </CardTitle>
              <CardDescription>
                Maximize your AI skills by practicing with multiple platforms. Each has unique strengths
                that can enhance different aspects of your workflow.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}

