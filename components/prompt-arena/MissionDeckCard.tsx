import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { MissionDeckCardProps, Rating } from "./types";

export function MissionDeckCard({
  card,
  displayCardNumber,
  isRevealed,
  lastRating,
  ratingMeta,
  onRate,
  disableRating,
}: MissionDeckCardProps) {
  const lastMeta = lastRating ? ratingMeta[lastRating] : null;
  const LastIcon = lastMeta?.icon;

  return (
    <div className="relative z-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-4 h-[250px] w-44 rounded-2xl border border-slate-100/70 bg-white shadow-[0_15px_30px_rgba(15,23,42,0.05)]"
        style={{ transform: "rotate(-3deg)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 left-10 h-[250px] w-44 rounded-2xl border border-slate-100/60 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.04)]"
        style={{ transform: "rotate(3deg)" }}
      />
      <Card className="relative border border-slate-200 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.18)]">
        <CardContent className="py-8">
          <motion.div
            className="relative space-y-6"
            animate={{ rotateY: isRevealed ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="space-y-6"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-500">
                <span>Card {displayCardNumber}</span>
                <span>{card.type}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  Mission Brief
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {card.title}
                </h2>
                <p className="text-slate-600">{card.mission}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  Goal
                </p>
                <p>{card.goal}</p>
              </div>
              <div className="space-y-3">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  Combo cues
                </p>
                <div className="space-y-2">
                  {card.cues.map((cue) => (
                    <div
                      key={cue}
                      className="flex items-start gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      <Sparkles className="mt-0.5 size-4 text-amber-400" />
                      {cue}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {card.skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="border border-slate-200 bg-white/60 px-3 py-1 text-xs text-slate-700"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[0.65rem] text-slate-500">
                <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  <span>Mission Load</span>
                  <span>{card.skills.length * 20}%</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${Math.min(card.skills.length * 20, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                <span>Coaching Drop</span>
                {lastMeta && LastIcon && (
                  <div
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${lastMeta.color}`}
                  >
                    <LastIcon className="size-3" />
                    {lastMeta.label}
                  </div>
                )}
              </div>
              <p className="text-lg font-semibold text-slate-900">
                {card.skillBoost}
              </p>
              <p className="text-sm text-slate-600">{card.reward}</p>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                  Arena prompt
                </p>
                <p>{card.prompt}</p>
              </div>
            </div>
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-slate-100">
          <div className="grid w-full gap-3 md:grid-cols-3">
            {Object.entries(ratingMeta).map(([ratingKey, config]) => {
              const Icon = config.icon;
              const rewardXp = config.xp * card.skills.length;
              return (
                <div
                  key={ratingKey}
                  className="rounded-2xl border border-slate-100 bg-white px-2 py-2 text-center"
                >
                  <Button
                    onClick={() => onRate(ratingKey as Rating)}
                    className="w-full border border-slate-200 bg-white text-slate-700"
                    disabled={disableRating}
                  >
                    <Icon className="size-4" />
                    {config.label}
                  </Button>
                  <span className="mt-1 block text-[0.65rem] text-slate-500">
                    {config.detail} · +{rewardXp} XP
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-500">
            Tap a response to flip the card and reveal the coaching drop.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
