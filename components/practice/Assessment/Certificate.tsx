"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/StarRating";
import {
  Download,
  Share2,
  Award,
  Calendar,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useRef } from "react";

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
  userName,
  domainTitle,
  domainIcon,
  score,
  issuedAt,
  verificationCode,
  onBack,
  onDownload,
  onShare,
}: CertificateViewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Certificate Card */}
        <motion.div
          ref={certificateRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-white rounded-3xl border-4 border-yellow-300 shadow-xl overflow-hidden"
        >
          {/* Gold gradient header */}
          <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/50 mb-4"
            >
              <Award className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md mb-1">
              Certificate of Mastery
            </h1>
            <p className="text-white/80 font-semibold text-lg">
              Domain Assessment Completed
            </p>
          </div>

          {/* Certificate body */}
          <div className="px-8 py-10 text-center">
            <p className="text-slate-500 font-medium text-lg mb-2">
              This is to certify that
            </p>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">
              {userName}
            </h2>

            <p className="text-slate-500 font-medium text-lg mb-2">
              has successfully demonstrated mastery in
            </p>

            <div className="inline-flex items-center gap-3 bg-slate-100 rounded-2xl px-6 py-4 mb-6">
              <span className="text-4xl">{domainIcon}</span>
              <span className="text-2xl font-extrabold text-slate-800">
                {domainTitle}
              </span>
            </div>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-black text-green-600 mb-1">
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

            {/* Issue date and verification */}
            <div className="flex items-center justify-center gap-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  {formatDate(issuedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-mono font-semibold text-sm">
                  {verificationCode}
                </span>
              </div>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-yellow-400 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-yellow-400 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-yellow-400 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-yellow-400 rounded-br-2xl" />
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 mt-8"
        >
          {onDownload && (
            <Button
              onClick={onDownload}
              size="lg"
              className="flex-1 py-5 text-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
          )}

          {onShare && (
            <Button
              onClick={onShare}
              variant="outline"
              size="lg"
              className="flex-1 py-5 text-lg font-bold rounded-2xl border-2"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
