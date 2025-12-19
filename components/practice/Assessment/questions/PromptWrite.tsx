"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Loader2,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface PromptWriteQuestionProps {
  scenario?: string;
  question: string;
  promptGoal: string;
  isImagePrompt?: boolean;
  onSubmit: (prompt: string) => void;
  onRunPrompt?: (prompt: string) => Promise<string>; // Returns AI response
}

const MAX_RUNS = 3;

export function PromptWriteQuestion({
  scenario,
  question,
  promptGoal,
  isImagePrompt = false,
  onSubmit,
  onRunPrompt,
}: PromptWriteQuestionProps) {
  const [prompt, setPrompt] = useState("");
  const [runsRemaining, setRunsRemaining] = useState(MAX_RUNS);
  const [isRunning, setIsRunning] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunPrompt = async () => {
    if (runsRemaining <= 0 || !prompt.trim()) return;

    if (isImagePrompt) {
      // Open AI Studio in new tab for image prompts
      const encodedPrompt = encodeURIComponent(prompt);
      window.open(
        `https://aistudio.google.com/prompts/new_chat/?prompt=${encodedPrompt}`,
        "_blank"
      );
      setRunsRemaining((prev) => prev - 1);
      return;
    }

    if (!onRunPrompt) return;

    setIsRunning(true);
    setError(null);

    try {
      const response = await onRunPrompt(prompt);
      setAiResponse(response);
      setRunsRemaining((prev) => prev - 1);
    } catch (err) {
      setError("Failed to run prompt. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Scenario (if present) */}
      {scenario && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-purple-50 border-2 border-purple-100 rounded-2xl">
            <CardContent className="px-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">
                Scenario
              </h3>
              <p className="text-slate-700 font-medium leading-relaxed">
                {scenario}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight mb-2">
          {question}
        </h2>
        <p className="text-slate-500 font-medium">
          <span className="text-purple-600 font-bold">Goal:</span> {promptGoal}
        </p>
      </motion.div>

      {/* Prompt input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 border-slate-200 rounded-2xl overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">
                Your Prompt
              </span>
              {/* Run prompt button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <Button
                  onClick={handleRunPrompt}
                  disabled={!prompt.trim() || runsRemaining <= 0 || isRunning}
                  variant="outline"
                  className={cn(
                    "flex-1 py-4 font-bold rounded-xl border-2 transition-all",
                    runsRemaining > 0 && prompt.trim()
                      ? "border-blue-300 text-blue-600 hover:bg-blue-50"
                      : "border-slate-200 text-slate-400"
                  )}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : isImagePrompt ? (
                    <>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Test in AI Studio
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Run Prompt
                    </>
                  )}
                </Button>

                <div
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold text-sm",
                    runsRemaining > 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {runsRemaining} run{runsRemaining !== 1 ? "s" : ""} left
                </div>
              </motion.div>

              {/* <span className="text-xs font-semibold text-slate-500">
                {prompt.length} characters
              </span> */}
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write your prompt here..."
              className="min-h-[150px] border-0 rounded-none focus-visible:ring-0 resize-none text-base font-medium p-4"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Image prompt notice */}
      {isImagePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl"
        >
          <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">
            Image prompts will open in Google AI Studio. You can test and see
            the generated image there, then return here to submit your answer.
          </p>
        </motion.div>
      )}

      {/* AI Response */}
      {aiResponse && !isImagePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-0 border-2 border-green-200 bg-green-50/50 rounded-2xl">
            <CardContent className="p-0">
              <div className="bg-green-100 px-4 py-3 border-b border-green-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">
                  AI Response (Preview Only)
                </span>
              </div>
              <div className="p-4 text-slate-700 font-medium whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {aiResponse}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </motion.div>
      )}

      {/* Submit button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim()}
          size="lg"
          className={cn(
            "w-full py-5 text-lg font-extrabold uppercase tracking-wider rounded-2xl border-b-4 transition-all",
            prompt.trim()
              ? "bg-purple-500 hover:bg-purple-600 text-white border-purple-700 active:border-b-0 active:translate-y-1"
              : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
          )}
        >
          Submit Answer
        </Button>
      </motion.div>
    </div>
  );
}
