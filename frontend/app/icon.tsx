import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          border: "1px solid rgba(99, 102, 241, 0.4)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Comment Bubble */}
          <path
            d="M13 11H33C36.31 11 39 13.69 39 17V25C39 28.31 36.31 31 33 31H22.6L16.2 36.6C15.25 37.4 13.8 36.75 13.8 35.5V31H13C9.69 31 7 28.31 7 25V17C7 13.69 9.69 11 13 11Z"
            fill="#312E81"
            stroke="#818CF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upward Growth Trend Line */}
          <path
            d="M14 25L19 22L24.5 24L32 16.5"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes */}
          <circle cx="14" cy="25" r="2.2" fill="#818CF8" />
          <circle cx="19" cy="22" r="2.2" fill="#A855F7" />
          <circle cx="24.5" cy="24" r="2.2" fill="#C084FC" />
          <circle cx="32" cy="16.5" r="2.8" fill="#06B6D4" />

          {/* AI Sparkle */}
          <path
            d="M37.5 4C37.5 6.5 39.5 8.5 42 8.5C39.5 8.5 37.5 10.5 37.5 13C37.5 10.5 35.5 8.5 33 8.5C35.5 8.5 37.5 6.5 37.5 4Z"
            fill="#FACC15"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
