export interface DashboardNavItem {
  href: string;
  label: string;
  icon: "home" | "video" | "channel" | "folder" | "settings" | "support" | "faq" | "admin";
  adminOnly?: boolean;
}

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/analyze", label: "Video Analizi", icon: "video" },
  { href: "/kanal-analizi", label: "Kanal Analizi", icon: "channel" },
  { href: "/analizlerim", label: "Analizlerim", icon: "folder" },
  { href: "/ayarlar", label: "Ayarlar", icon: "settings" },
  { href: "/destek", label: "Destek", icon: "support" },
  { href: "/sss", label: "SSS", icon: "faq" },
  { href: "/admin/users", label: "Kullanıcı yönetimi", icon: "admin", adminOnly: true },
];

