import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const backendOrigin = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Üst dizindeki ilgisiz package-lock dosyasının workspace root seçimini
  // etkilemesini önler.
  turbopack: {
    root: frontendRoot,
  },
  // YouTube + Gemini analizi 30 sn'den uzun sürebilir; varsayılan proxy kesintisini önler.
  experimental: {
    proxyTimeout: 300_000,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
