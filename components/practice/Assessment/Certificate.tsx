"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/StarRating";
import {
  Award,
  ArrowLeft,
  ArrowRight,
  Share2,
  Trophy,
  Sparkles,
} from "lucide-react";

interface CertificateViewProps {
  userName: string;
  domainTitle: string;
  domainIcon: string;
  score: number;
  issuedAt: number;
  verificationCode: string;
  onBack: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function CertificateView({
  domainTitle,
  domainIcon,
  score,
  onBack,
  onDownload,
  onShare,
}: CertificateViewProps) {
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 mb-6 rounded-xl font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </motion.div>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden"
        >
          {/* Celebration header */}
          <div className="bg-gradient-to-r from-[#0074b9] to-[#46bc61] px-8 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Assessment Passed!
            </h1>
            <p className="text-white/80 font-medium">
              You&apos;ve earned a certificate
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-8 text-center">
            {/* Domain badge */}
            <div className="inline-flex items-center gap-3 bg-slate-100 rounded-2xl px-5 py-3 mb-6">
              <span className="text-3xl">{domainIcon}</span>
              <span className="text-xl font-bold text-slate-800">
                {domainTitle}
              </span>
            </div>

            {/* Score and stars */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-black text-[#46bc61] mb-1">
                  {score}%
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  Score
                </div>
              </div>

              <div className="w-px h-12 bg-slate-200" />

              <div className="text-center">
                <StarRating stars={stars} size="lg" />
                <div className="text-sm font-semibold text-slate-500 mt-2">
                  Rating
                </div>
              </div>
            </div>

            {/* Info text */}
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Your certificate is ready. View and download the full certificate
              with verification details.
            </p>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 mt-6"
        >
          {onDownload && (
            <Button
              onClick={onDownload}
              size="lg"
              className="flex-1 py-5 text-lg font-bold bg-gradient-to-r from-[#0074b9] to-[#46bc61] hover:opacity-90 text-white rounded-2xl"
            >
              View Certificate
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}

          {onShare && (
            <Button
              onClick={onShare}
              variant="outline"
              size="lg"
              className="py-5 px-6 text-lg font-bold rounded-2xl border-2"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
