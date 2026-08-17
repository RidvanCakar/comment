import type { Metadata } from "next";
import Benefits from "@/components/landing/Benefits";
import BottomCTA from "@/components/landing/BottomCTA";
import FAQ from "@/components/landing/FAQ";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import ReportPreview from "@/components/landing/ReportPreview";

export const metadata: Metadata = {
  title: {
    absolute: "CommentLab - AI Audience Intelligence & Comment Analytics",
  },
  description:
    "Analyze YouTube & social comments with AI precision. Extract sentiment, trends, and growth insights.",
  keywords: [
    "YouTube yorum analizi",
    "Audience Intelligence",
    "CommentLab",
    "içerik üretici araçları",
    "yapay zeka yorum analizi",
    "YouTube içerik stratejisi",
    "sentiment analysis",
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-base text-text-primary selection:bg-accent-record/25 selection:text-text-primary">
      <LandingHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <ReportPreview />
        <FAQ />
        <BottomCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
