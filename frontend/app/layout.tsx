import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://commentlab.ai"),
  title: {
    default: "CommentLab - AI Audience Intelligence & Comment Analytics",
    template: "%s | CommentLab",
  },
  description:
    "Analyze YouTube & social comments with AI precision. Extract sentiment, trends, and growth insights.",
  keywords: [
    "CommentLab",
    "YouTube comment analysis",
    "audience intelligence",
    "AI comment analyzer",
    "sentiment analysis",
    "creator tools",
    "channel health score",
  ],
  authors: [{ name: "CommentLab" }],
  creator: "CommentLab",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://commentlab.ai",
    siteName: "CommentLab",
    title: "CommentLab - AI Audience Intelligence & Comment Analytics",
    description:
      "Analyze YouTube & social comments with AI precision. Extract sentiment, trends, and growth insights.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CommentLab - AI Audience Intelligence & Comment Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CommentLab - AI Audience Intelligence & Comment Analytics",
    description:
      "Analyze YouTube & social comments with AI precision. Extract sentiment, trends, and growth insights.",
    creator: "@CommentLabAI",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-bg-base text-text-primary overflow-x-hidden">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
