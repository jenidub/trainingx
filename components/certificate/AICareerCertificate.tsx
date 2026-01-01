"use client";

import React, { RefObject } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CertificationSeal } from "./CertificationSeal";
import {
  Download,
  Share2,
  Copy,
  Check,
  Calendar,
  Award,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

interface AICareerCertificateProps {
  userName: string;
  certificateId: string;
  score: number;
  issuedAt: number;
  onDownload?: () => void;
  onShare?: () => void;
  certificateRef?: RefObject<HTMLDivElement | null>;
}

export function AICareerCertificate({
  userName,
  certificateId,
  score,
  issuedAt,
  onDownload,
  onShare,
  certificateRef,
}: AICareerCertificateProps) {
  const [copied, setCopied] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${certificateId}`;

  const copyVerifyLink = async () => {
    await navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Certificate Card - Landscape orientation styling */}
      {/* Using inline styles for html2canvas compatibility (Tailwind 4 uses lab() colors which html2canvas can't parse) */}
      <motion.div
        ref={certificateRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-2xl shadow-2xl overflow-hidden"
        style={{
          aspectRatio: "11/8.5",
          backgroundColor: "#ffffff",
          border: "4px solid #fcd34d",
        }}
      >
        {/* Decorative border pattern */}
        <div
          className="absolute inset-4 rounded-xl pointer-events-none"
          style={{ border: "2px solid #fde68a" }}
        />
        <div
          className="absolute inset-6 rounded-lg pointer-events-none"
          style={{ border: "1px solid #fef3c7" }}
        />

        {/* Content container */}
        <div className="relative h-full flex flex-col justify-between p-8 md:p-12">
          {/* Header */}
          <div className="text-center">
            {/* TrainingX.AI Logo/Branding */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0074b9] to-[#46bc61] flex items-center justify-center">
                <span
                  className="text-white font-black text-sm"
                  style={{ color: "#ffffff" }}
                >
                  T
                </span>
              </div>
              <span
                className="font-bold tracking-wide"
                style={{ color: "#475569" }}
              >
                TrainingX.AI
              </span>
            </div>

            {/* Main Title */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-black mb-2"
              style={{ color: "#1e293b" }}
            >
              AI Career Readiness Certificate
            </h1>

            {/* Subtitle */}
            <p
              className="text-sm sm:text-base font-medium max-w-xl mx-auto"
              style={{ color: "#64748b" }}
            >
              Awarded for completion of TrainingX.AI&apos;s research-based
              continuous learning program
            </p>
          </div>

          {/* Center Section - Name and Body */}
          <div className="text-center flex-1 flex flex-col justify-center py-6">
            <p className="text-sm mb-2" style={{ color: "#64748b" }}>
              This certifies that
            </p>

            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-4"
              style={{ color: "#1e293b" }}
            >
              {userName}
            </h2>

            <p
              className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
              style={{ color: "#475569" }}
            >
              has successfully completed TrainingX.AI&apos;s AI Career Readiness
              Program, demonstrating mastery of adaptive AI tools, strategies,
              and techniques through our proven{" "}
              <span className="font-bold" style={{ color: "#0074b9" }}>
                Learn
              </span>{" "}
              →{" "}
              <span className="font-bold" style={{ color: "#46bc61" }}>
                Apply
              </span>{" "}
              →{" "}
              <span className="font-bold" style={{ color: "#f59e0b" }}>
                Align
              </span>{" "}
              methodology.
            </p>
          </div>

          {/* Bottom Section - Signature, Seal, Details */}
          <div className="flex items-end justify-between gap-4">
            {/* Left - Signature */}
            <div className="text-left flex-1">
              <div
                className="pt-2 inline-block min-w-[180px]"
                style={{ borderTop: "2px solid #cbd5e1" }}
              >
                <p className="font-bold" style={{ color: "#1e293b" }}>
                  Derrick O&apos;Neal
                </p>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  Founder & Lead Instructor
                </p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                  ORCID: 0009-0004-3282-7042
                </p>
              </div>
            </div>

            {/* Center - Seal */}
            <div className="flex-shrink-0">
              <CertificationSeal size={100} />
            </div>

            {/* Right - Certificate Details */}
            <div className="text-right flex-1">
              <div className="space-y-1">
                <div
                  className="flex items-center justify-end gap-2 text-sm"
                  style={{ color: "#64748b" }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(issuedAt)}</span>
                </div>
                <div
                  className="flex items-center justify-end gap-2"
                  style={{ color: "#475569" }}
                >
                  <Award className="w-4 h-4" />
                  <span className="font-mono font-bold text-sm">
                    {certificateId}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  Verify at trainingx.ai/verify
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div
          className="absolute top-0 left-0 w-20 h-20 rounded-tl-xl"
          style={{
            borderLeft: "4px solid #fbbf24",
            borderTop: "4px solid #fbbf24",
          }}
        />
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-tr-xl"
          style={{
            borderRight: "4px solid #fbbf24",
            borderTop: "4px solid #fbbf24",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-20 h-20 rounded-bl-xl"
          style={{
            borderLeft: "4px solid #fbbf24",
            borderBottom: "4px solid #fbbf24",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-20 h-20 rounded-br-xl"
          style={{
            borderRight: "4px solid #fbbf24",
            borderBottom: "4px solid #fbbf24",
          }}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3 mt-6 justify-center"
      >
        {onDownload && (
          <Button
            onClick={onDownload}
            size="lg"
            className="py-5 px-8 text-lg font-bold bg-gradient-to-r from-[#0074b9] to-[#46bc61] hover:opacity-90 text-white rounded-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </Button>
        )}

        <Button
          onClick={copyVerifyLink}
          variant="outline"
          size="lg"
          className="py-5 px-6 text-lg font-bold rounded-xl border-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              Copy Link
            </>
          )}
        </Button>

        {onShare && (
          <Button
            onClick={onShare}
            variant="outline"
            size="lg"
            className="py-5 px-6 text-lg font-bold rounded-xl border-2"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </Button>
        )}
      </motion.div>

      {/* Verification Link Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center"
      >
        <p className="text-sm text-slate-500 mb-2">
          Anyone can verify this certificate at:
        </p>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#0074b9] font-mono font-semibold hover:underline"
        >
          {verifyUrl}
          <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>
    </div>
  );
}
