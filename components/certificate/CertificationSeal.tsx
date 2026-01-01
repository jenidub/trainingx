"use client";

interface CertificationSealProps {
  size?: number;
  className?: string;
}

/**
 * TrainingX.AI Certification Seal
 * Circular seal with:
 * - "TrainingX.AI" around top arc
 * - "Research-Backed Since 2012" around bottom arc
 * - "AI Ready" in center with checkmark
 */
export function CertificationSeal({
  size = 120,
  className = "",
}: CertificationSealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for the seal */}
        <linearGradient id="sealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0074b9" />
          <stop offset="100%" stopColor="#46bc61" />
        </linearGradient>

        {/* Gold gradient for the border */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>

        {/* Text paths for curved text */}
        <path id="topArc" d="M 15, 60 A 45, 45 0 0 1 105, 60" fill="none" />
        <path id="bottomArc" d="M 105, 60 A 45, 45 0 0 1 15, 60" fill="none" />
      </defs>

      {/* Outer ring with gold gradient */}
      <circle
        cx="60"
        cy="60"
        r="58"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="4"
      />

      {/* Inner ring */}
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="url(#sealGradient)"
        strokeWidth="2"
      />

      {/* Background circle */}
      <circle cx="60" cy="60" r="48" fill="white" />

      {/* Decorative inner circle */}
      <circle
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="1"
        strokeDasharray="3,2"
      />

      {/* Top curved text - TrainingX.AI */}
      <text fill="#334155" fontSize="9" fontWeight="bold" letterSpacing="1">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">
          TRAININGX.AI
        </textPath>
      </text>

      {/* Bottom curved text - Research-Backed Since 2012 */}
      <text fill="#64748b" fontSize="6.5" fontWeight="600" letterSpacing="0.5">
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
          RESEARCH-BACKED SINCE 2012
        </textPath>
      </text>

      {/* Center content */}
      <g transform="translate(60, 55)">
        {/* Checkmark icon */}
        <circle cx="0" cy="-8" r="10" fill="url(#sealGradient)" />
        <path
          d="M -5, -8 L -2, -5 L 5, -12"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* AI READY text */}
        <text
          y="12"
          textAnchor="middle"
          fill="#1e293b"
          fontSize="11"
          fontWeight="800"
          letterSpacing="1"
        >
          AI READY
        </text>
      </g>

      {/* ORCID indicator */}
      <g transform="translate(60, 95)">
        <rect
          x="-22"
          y="-6"
          width="44"
          height="12"
          rx="6"
          fill="#a5dc86"
          opacity="0.2"
        />
        <text
          textAnchor="middle"
          y="3"
          fill="#15803d"
          fontSize="6"
          fontWeight="600"
        >
          ORCID VERIFIED
        </text>
      </g>
    </svg>
  );
}
