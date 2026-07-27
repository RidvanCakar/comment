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
    absolute: "YorumAI — YouTube Yorum Analiz Platformu",
  },
  description:
    "YouTube yorumlarını yapay zekâ ile analiz et; duygu dağılımını, gerçek izleyici temalarını ve bir sonraki videon için veriye dayalı önerileri keşfet.",
  keywords: [
    "YouTube yorum analizi",
    "içerik üretici araçları",
    "yapay zeka yorum analizi",
    "YouTube içerik stratejisi",
    "YorumAI",
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
