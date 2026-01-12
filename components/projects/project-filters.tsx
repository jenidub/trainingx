"use client";

import { JuicyButton } from "@/components/ui/juicy-button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProjectFiltersProps {
  category: string;
  setCategory: (cat: string) => void;
  status: string;
  setStatus: (status: string) => void;
  search: string;
  setSearch: (term: string) => void;
}

const CATEGORIES = ["All", "Web", "AI", "Game", "Creative"];
const STATUSES = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

export function ProjectFilters({
  category,
  setCategory,
  status,
  setStatus,
  search,
  setSearch,
}: ProjectFiltersProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <JuicyButton
              key={cat}
              onClick={() => setCategory(cat)}
              variant={category === cat ? "primary" : "secondary"}
              size="sm"
              className="transition-all"
            >
              {cat}
            </JuicyButton>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-2 border-slate-200 focus-visible:ring-blue-500 rounded-xl h-10 w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Filter:
        </span>
        {STATUSES.map((stat) => (
          <button
            key={stat.value}
            onClick={() => setStatus(stat.value)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              status === stat.value
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {stat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
