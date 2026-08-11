import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanıcı Yönetimi",
  description: "YorumAI kullanıcı hesaplarını yönet.",
};

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
