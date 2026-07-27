import type { SVGProps } from "react";

export type LandingIconName =
  | "arrow"
  | "chart"
  | "check"
  | "clipboard"
  | "clock"
  | "eye"
  | "link"
  | "message"
  | "shield"
  | "sparkles"
  | "target"
  | "trend";

const paths: Record<LandingIconName, React.ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  chart: (
    <>
      <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M9 10h6m-6 4h6m-6 4h4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  link: (
    <>
      <path d="m9.5 14.5 5-5" />
      <path d="M7.5 17.5H6a4 4 0 0 1 0-8h3M16.5 6.5H18a4 4 0 1 1 0 8h-3" />
    </>
  ),
  message: (
    <>
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 9h8m-8 3h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3Z" />
      <path d="m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13ZM6 14l.6 1.4L8 16l-1.4.6L6 18l-.6-1.4L4 16l1.4-.6L6 14Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  trend: <path d="m3 17 6-6 4 4 8-9m-5 0h5v5" />,
};

export default function LandingIcon({
  name,
  ...props
}: { name: LandingIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
