import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil",
  description: "CommentLab profil ve güvenlik ayarlarını yönet.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
