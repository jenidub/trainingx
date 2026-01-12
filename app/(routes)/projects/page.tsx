"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { motion } from "framer-motion";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function ProjectsPage() {
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

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
          <div className="mb-10">
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
            <div className="mt-20 flex flex-col items-center justify-center text-slate-400">
              <div className="text-6xl mb-4">👾</div>
              <h3 className="text-lg font-bold text-slate-600">
                No projects found
              </h3>
              <p>Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
