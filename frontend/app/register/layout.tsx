import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description: "Ücretsiz YorumAI hesabını oluştur.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
