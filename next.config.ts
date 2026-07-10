import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产部署：独立输出模式，减少依赖体积
  output: "standalone",

  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // 现代格式优先
    formats: ["image/avif", "image/webp"],
  },

  // 压缩
  compress: true,

  // 生产优化
  poweredByHeader: false,
  reactStrictMode: true,

  // 实验性功能
  serverExternalPackages: ["pdf-parse"],

  // 性能优化
  experimental: {
    optimizeCss: true,
    // 优化包导入
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-slot",
    ],
  },

  // 转发 headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 静态资源缓存
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API 路由不缓存
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;