import React from "react";
import Link from "next/link";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  href?: string;
  isLink?: boolean;
}

const sizeConfig = {
  sm: {
    iconSize: 28,
    textSize: "text-base",
    labBadge: "text-[9px] px-1.5 py-0.5",
    gap: "gap-2",
  },
  md: {
    iconSize: 34,
    textSize: "text-lg",
    labBadge: "text-[10px] px-2 py-0.5",
    gap: "gap-2.5",
  },
  lg: {
    iconSize: 42,
    textSize: "text-2xl",
    labBadge: "text-xs px-2.5 py-0.5",
    gap: "gap-3",
  },
  xl: {
    iconSize: 52,
    textSize: "text-3xl",
    labBadge: "text-sm px-3 py-1",
    gap: "gap-3.5",
  },
};

/**
 * Modern CommentLab Brand Logo Icon (SVG)
 * Concept: Social Comment Bubble + Rising Growth/Trend Line + Connected Data Nodes + AI Sparkle
 */
export function BrandIcon({
  size = 34,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Main Bubble & Border Gradient */}
        <linearGradient id="cl-bubble-gradient" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Growth Trend Line Gradient */}
        <linearGradient id="cl-trend-gradient" x1="14" y1="26" x2="33" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Growth Area Fill Gradient */}
        <linearGradient id="cl-area-gradient" x1="24" y1="16" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
        </linearGradient>

        {/* AI Sparkle Gradient */}
        <linearGradient id="cl-spark-gradient" x1="32" y1="4" x2="42" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>

        {/* Subtle Ambient Glow */}
        <filter id="cl-bubble-glow" x="-15%" y="-15%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dark Glassmorphic Outer Container with Neon Hue */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="13"
        fill="#0F172A"
        fillOpacity="0.8"
        stroke="url(#cl-bubble-gradient)"
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        fill="url(#cl-bubble-gradient)"
        fillOpacity="0.08"
      />

      <g filter="url(#cl-bubble-glow)">
        {/* Comment / Speech Bubble Silhouette */}
        <path
          d="M13 11H33C36.31 11 39 13.69 39 17V25C39 28.31 36.31 31 33 31H22.6L16.2 36.6C15.25 37.4 13.8 36.75 13.8 35.5V31H13C9.69 31 7 28.31 7 25V17C7 13.69 9.69 11 13 11Z"
          fill="#1E1B4B"
          fillOpacity="0.5"
          stroke="url(#cl-bubble-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Growth Area Chart Under Trend Line */}
        <path
          d="M13.5 25.5L18.5 22.5L24.5 24.5L32.5 16.5V27.5H13.5V25.5Z"
          fill="url(#cl-area-gradient)"
        />

        {/* Upward Growth / Trend Line */}
        <path
          d="M13.5 25.5L18.5 22.5L24.5 24.5L32.5 16.5"
          stroke="url(#cl-trend-gradient)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Connected Data Nodes */}
        <circle cx="13.5" cy="25.5" r="2" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="18.5" cy="22.5" r="2" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="24.5" cy="24.5" r="2" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1" />

        {/* Peak Growth Node (Glow / Highlight) */}
        <circle cx="32.5" cy="16.5" r="3.2" fill="#38BDF8" fillOpacity="0.25" />
        <circle cx="32.5" cy="16.5" r="2.2" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1.2" />

        {/* AI Sparkle 1 (Top-Right 4-Point Star) */}
        <path
          d="M37.5 4C37.5 6.5 39.5 8.5 42 8.5C39.5 8.5 37.5 10.5 37.5 13C37.5 10.5 35.5 8.5 33 8.5C35.5 8.5 37.5 6.5 37.5 4Z"
          fill="url(#cl-spark-gradient)"
        />

        {/* AI Sparkle 2 (Mini Accent) */}
        <circle cx="42" cy="16" r="1.2" fill="#38BDF8" />
      </g>
    </svg>
  );
}

export default function BrandLogo({
  size = "md",
  showText = true,
  className = "",
  href = "/",
  isLink = false,
}: BrandLogoProps) {
  const config = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div className={`group inline-flex items-center ${config.gap} select-none ${className}`}>
      <BrandIcon size={config.iconSize} />

      {showText && (
        <div className="flex items-center tracking-tight leading-none">
          <span className={`font-display font-bold text-text-primary ${config.textSize}`}>
            Comment
          </span>
          <span
            className={`font-display font-extrabold bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent ${config.textSize}`}
          >
            Lab
          </span>
          <span
            className={`ml-1.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 font-mono font-bold tracking-wider text-indigo-400 dark:text-cyan-300 uppercase shadow-sm ${config.labBadge}`}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );

  if (isLink) {
    return (
      <Link
        href={href}
        className="inline-flex min-h-11 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-xl"
        aria-label="CommentLab ana sayfa"
      >
        {content}
      </Link>
    );
  }

  return content;
}
