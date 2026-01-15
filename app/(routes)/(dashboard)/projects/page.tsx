"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function ProjectsPage() {
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false); // Don't auto-open
  const [isGenerating, setIsGenerating] = useState(false);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [formFilters, setFormFilters] = useState<any>(null);
  const createProject = useMutation(api.projects.createProject);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const durationMap: Record<string, { min?: number; max?: number }> = {
    Quick: { max: 4 },
    Weekend: { min: 4, max: 12 },
    "Deep Dive": { min: 12 },
  };

  // Show ALL user projects - no filtering by form inputs
  const projects = useQuery(api.projects.getProjects, {
    category: category === "All" ? undefined : category,
    status: status === "all" ? undefined : status,
  });

  const filteredProjects = projects?.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="min-h-full bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 text-4xl font-extrabold text-slate-800 tracking-tight md:text-5xl"
              >
                Project <span className="text-blue-500">Arcade</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-medium text-slate-500"
              >
                Gamified Deep Dives. Build real apps. Earn XP.
              </motion.p>
            </div>

            {/* Always show Create button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => setIsFormOpen(true)}
                disabled={isGenerating}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg px-8 py-5 rounded-2xl shadow-lg border-b-4 border-blue-600 active:border-b-0 active:translate-y-[4px] transition-all"
              >
                {isGenerating ? "✨ Generating..." : "✨ New Project"}
              </Button>
            </motion.div>
          </div>

          <ProjectFormModal
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={async (filters) => {
              setFormFilters(filters);
              setIsFormOpen(false); // Close modal immediately
              setIsGenerating(true); // Show loading state
              try {
                const result = await createProject({
                  difficulty: filters.difficulty,
                  duration: filters.duration,
                  keywords: `${filters.interests} ${filters.customDetails}`,
                });
                console.log("✅ Project generation started:", result);
              } catch (error) {
                console.error("❌ Failed to create project:", error);
                alert(
                  `Error: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`
                );
              }
              // Project will appear when AI finishes (Convex auto-refreshes)
              // Keep loading for 3s to give AI time to generate
              setTimeout(() => setIsGenerating(false), 3000);
            }}
          />

          {/* Filters */}
          <ProjectFilters
            category={category}
            setCategory={setCategory}
            status={status}
            setStatus={setStatus}
            search={search}
            setSearch={setSearch}
          />

          {/* Projects Grid */}
          {projects === undefined ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[400px] animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {filteredProjects?.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredProjects?.length === 0 && (
            <div className="mt-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-6xl">🚀</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-3">
                Your Project Board is Empty
              </h3>
              <p className="text-slate-500 mb-8 text-lg">
                Ready to build something active? Generate your first project to
                start earning XP!
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold text-xl px-8 py-6 rounded-2xl shadow-lg transform transition hover:scale-105 active:scale-95 border-b-4 border-green-600 active:border-b-0"
              >
                Start a Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
