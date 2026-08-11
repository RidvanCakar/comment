import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil",
  description: "YorumAI profil ve güvenlik ayarlarını yönet.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
