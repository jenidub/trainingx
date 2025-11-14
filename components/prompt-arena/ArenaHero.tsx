import { Flame } from "lucide-react";

import type { HeroTile } from "./types";

interface ArenaHeroProps {
  heroTiles: HeroTile[];
  streak: number;
}

export function ArenaHero({ heroTiles, streak }: ArenaHeroProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Prompt Arena Beta
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Prompt Arena: Card Battle Practice
          </h1>
          <p className="text-slate-600">
            Flip mission cards, self-score honestly, and keep the combo alive.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Flame className="size-5 text-orange-400" />
          Combo streak
          <span className="text-2xl font-bold text-orange-500">{streak}</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {heroTiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
              {tile.label}
            </p>
            <p className="text-2xl font-bold text-slate-900">{tile.value}</p>
            <p className="text-xs text-slate-500">{tile.detail}</p>
          </div>
        ))}
      </div>
    </header>
  );
}
