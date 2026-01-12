"use client";

import React, { RefObject } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Share2, Copy, Check, ExternalLink } from "lucide-react";
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

  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${certificateId}`;

  const copyVerifyLink = async () => {
    await navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8">
      {/* Certificate Display */}
      {/* 
        This container is what will be captured by html2canvas. 
        We use aspect ratio to maintain the certificate shape.
      */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-white"
        style={{ aspectRatio: "5/4" }} // Updated aspect ratio for 2000x1600 image
      >
        <div
          ref={certificateRef}
          className="relative w-full h-full bg-white text-slate-900"
        >
          {/* Background Template Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/certificate-bg.png"
            alt="Certificate Template"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
          />

          {/* User Name Overlay - Centered vertically and horizontally */}
          <div className="absolute top-[32%] left-0 right-0 transform -translate-y-1/2 text-center px-12">
            <h2
              className="font-bold text-slate-800 capitalize leading-tight"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: "min(6vw, 5rem)", // Responsive but capped size, increased from previous
                textShadow: "0 1px 2px rgba(255,255,255,0.5)",
              }}
            >
              {userName}
            </h2>
          </div>

          {/* Top Details - Moved from bottom to top as requested */}
          <div className="absolute top-[10%] left-[8%] text-left">
            <p
              className="text-[1.2vw] md:text-xs text-slate-500 font-semibold uppercase tracking-wider mb-[0.2em]"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              Issued Date
            </p>
            <p
              className="text-[1.5vw] md:text-sm font-bold text-slate-800"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {new Date(issuedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="absolute top-[10%] right-[8%] text-right">
            <p
              className="text-[1.2vw] md:text-xs text-slate-500 font-semibold uppercase tracking-wider mb-[0.2em]"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              Non-Fungible ID
            </p>
            <p
              className="text-[1.5vw] md:text-sm font-bold text-slate-800 uppercase tracking-widest"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {certificateId}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center w-full">
        {onDownload && (
          <Button
            onClick={onDownload}
            size="lg"
            className="h-14 px-8 text-lg font-bold bg-[#0074b9] hover:bg-[#00639e] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Certificate
          </Button>
        )}

        <Button
          onClick={copyVerifyLink}
          variant="outline"
          size="lg"
          className="h-14 px-8 text-lg font-bold rounded-xl border-2 hover:bg-slate-50"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Copied Link!
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
            className="h-14 px-8 text-lg font-bold rounded-xl border-2 hover:bg-slate-50"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </Button>
        )}
      </div>

      {/* Verification Link Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 text-center backdrop-blur-sm"
      >
        <p className="text-sm text-slate-500 mb-1">Verification URL:</p>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#0074b9] font-mono font-medium hover:underline text-sm break-all"
        >
          {verifyUrl}
          <ExternalLink className="w-3 h-3" />
        </a>
      </motion.div>
    </div>
  );
}
