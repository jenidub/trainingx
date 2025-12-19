"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MCQQuestionProps {
  scenario?: string;
  question: string;
  options: Option[];
  onSubmit: (selectedId: string, isCorrect: boolean) => void;
}

export function MCQQuestion({
  scenario,
  question,
  options,
  onSubmit,
}: MCQQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (optionId: string) => {
    setSelectedId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedId) return;
    const selected = options.find((o) => o.id === selectedId);
    onSubmit(selectedId, selected?.isCorrect ?? false);
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
            <CardContent className="p-5">
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
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
          {question}
        </h2>
      </motion.div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "w-full p-4 text-left rounded-2xl border-2 border-b-4 transition-all",
              "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
              selectedId === option.id
                ? "bg-purple-100 border-purple-300 border-b-purple-400"
                : "bg-white border-slate-200 hover:border-slate-300"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Selection indicator */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 transition-colors",
                  selectedId === option.id
                    ? "bg-purple-500 border-purple-500 text-white"
                    : "bg-white border-slate-300"
                )}
              >
                {selectedId === option.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold text-slate-500">
                    {String.fromCharCode(65 + index)}
                  </span>
                )}
              </div>

              {/* Option text */}
              <span
                className={cn(
                  "font-semibold leading-relaxed pt-1",
                  selectedId === option.id
                    ? "text-purple-900"
                    : "text-slate-700"
                )}
              >
                {option.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Submit button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <Button
          onClick={handleSubmit}
          disabled={!selectedId}
          size="lg"
          className={cn(
            "w-full py-5 text-lg font-extrabold uppercase tracking-wider rounded-2xl border-b-4 transition-all",
            selectedId
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
