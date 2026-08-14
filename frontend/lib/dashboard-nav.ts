export interface DashboardNavItem {
  href: string;
  label: string;
  icon: "home" | "video" | "channel" | "folder" | "settings" | "support" | "faq" | "admin" | "feedback" | "idea";
  adminOnly?: boolean;
}

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/analyze", label: "Video Analizi", icon: "video" },
  { href: "/kanal-analizi", label: "Kanal Analizi", icon: "channel" },
  { href: "/analizlerim", label: "Analizlerim", icon: "folder" },
  { href: "/fikirler", label: "Fikir & Öneri", icon: "idea" },
  { href: "/destek", label: "Destek", icon: "support" },
  { href: "/sss", label: "SSS", icon: "faq" },
  { href: "/ayarlar", label: "Ayarlar", icon: "settings" },
  { href: "/admin/feedback", label: "Geri Bildirimler", icon: "feedback", adminOnly: true },
  { href: "/admin/users", label: "Kullanıcı yönetimi", icon: "admin", adminOnly: true },
];

