import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { CursorGlow } from "@/components/effects/CursorGlow";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Roaster — AI 花式吐槽你的简历",
  description:
    "上传简历 PDF，让 AI 用最毒舌的方式吐槽你的简历，帮你发现简历问题。",
  keywords: ["简历", "AI", "吐槽", "求职", "简历优化", "Resume Roaster"],
  openGraph: {
    title: "Resume Roaster — AI 花式吐槽你的简历",
    description: "上传简历，让 AI 用最毒舌的方式告诉你简历哪里有多差劲。你敢试试吗？",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Roaster — AI 花式吐槽你的简历",
    description: "上传简历，让 AI 用最毒舌的方式告诉你简历哪里有多差劲。你敢试试吗？",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="antialiased">
      <body className="min-h-screen flex flex-col bg-gray-950 text-white">
        <ParticleBackground />
        <CursorGlow />
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
          }}
        />
      </body>
    </html>
  );
}