"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { motion } from "framer-motion";
import { Award, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { JuicyButton } from "@/components/ui/juicy-button";

export function CertificateCard() {
  const { user } = useAuth();

  const certificate = useQuery(
    api.certificates.getAICareerCertificate,
    user?._id ? { userId: user._id as any } : "skip"
  );

  const eligibility = useQuery(
    api.certificates.checkEligibility,
    user?._id && !certificate ? { userId: user._id as any } : "skip"
  );

  // Loading
  if (certificate === undefined) {
    return (
      <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-full bg-slate-100 rounded" />
      </div>
    );
  }

  // Has certificate
  if (certificate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-b-[6px] border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Award className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-700">
              AI Career Ready
            </h3>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">
              Certified
            </p>
          </div>
        </div>

        <div className="bg-white/60 rounded-xl p-3 mb-4 border border-amber-100">
          <p className="text-sm font-mono font-bold text-slate-700">
            {certificate.certificateId}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Issued{" "}
            {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <Link href="/dashboard/certificate">
          <JuicyButton
            variant="secondary"
            size="sm"
            className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300"
          >
            View Certificate
            <ArrowRight className="ml-2 h-4 w-4" />
          </JuicyButton>
        </Link>
      </motion.div>
    );
  }

  // No certificate yet - show progress
  const completedTracks = eligibility?.completedTracks ?? 0;
  const totalTracks = eligibility?.totalTracks ?? 8;
  const progress = (completedTracks / totalTracks) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <Lock className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-700">Certificate</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            In Progress
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-slate-600">
            General AI Skills
          </span>
          <span className="font-bold text-slate-500">
            {completedTracks}/{totalTracks} tracks
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0074b9] to-[#46bc61] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          {completedTracks === totalTracks ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
          )}
          <span
            className={
              completedTracks === totalTracks
                ? "text-green-600 font-semibold"
                : "text-slate-500"
            }
          >
            Complete all tracks
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
          <span className="text-slate-500">Pass domain assessment</span>
        </div>
      </div>

      <Link href="/practice/general-ai-skills">
        <JuicyButton variant="outline" size="sm" className="w-full">
          Continue Learning
          <ArrowRight className="ml-2 h-4 w-4" />
        </JuicyButton>
      </Link>
    </motion.div>
  );
}
