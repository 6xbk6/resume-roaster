"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Sparkles, Share2, Zap, Star } from "lucide-react";
import { toast } from "sonner";
import { DropZone } from "@/components/upload/DropZone";
import { StyleSelector } from "@/components/upload/StyleSelector";
import { UploadProgress } from "@/components/upload/UploadProgress";
import type { ProcessStage } from "@/components/upload/UploadProgress";
import { TiltCard } from "@/components/effects/TiltCard";
import { addToHistory } from "@/lib/history";
import type { RoastStyle, UploadResponse, RoastResponse } from "@/types";

const STEPS = [
  {
    icon: <Flame className="w-6 h-6" />,
    title: "上传简历",
    description: "拖拽或点击上传你的 PDF 简历",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "选择风格",
    description: "毒舌、凡尔赛、老油条、可爱模式任选",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "AI 吐槽",
    description: "AI 用幽默方式指出你的简历问题",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: "分享结果",
    description: "一键分享到社交媒体，看看朋友多少分",
    color: "from-green-500/20 to-emerald-500/20",
  },
];

// 3D 浮动几何体
const FloatingGeometry = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-[10%] animate-float-3d">
      <div className="w-16 h-16 border-2 border-purple-500/20 rounded-lg rotate-12"
        style={{ transformStyle: "preserve-3d", animation: "spin-slow 12s linear infinite" }} />
    </div>
    <div className="absolute top-1/3 right-[15%] animate-float-3d" style={{ animationDelay: "2s" }}>
      <div className="w-24 h-24 border-2 border-pink-500/15 rounded-full" />
    </div>
    <div className="absolute bottom-1/4 left-[20%] animate-float-3d" style={{ animationDelay: "4s" }}>
      <div className="w-8 h-8 border-2 border-blue-500/20 rounded rotate-45" />
    </div>
    <div className="absolute top-1/2 right-[25%] animate-float-3d" style={{ animationDelay: "1.5s" }}>
      <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-purple-500/15"
        style={{ animation: "spin-slow 8s linear infinite reverse" }} />
    </div>
    <div className="absolute bottom-1/3 right-[10%] animate-float-3d" style={{ animationDelay: "3s" }}>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500/20" />
        ))}
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RoastStyle>("savage");
  const [stage, setStage] = useState<ProcessStage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  /**
   * 使用 XMLHttpRequest 上传文件，获取真实上传进度
   */
  function uploadFileWithProgress(formData: FormData): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              resolve(data.data as UploadResponse);
            } else {
              reject(new Error(data.error || "上传失败"));
            }
          } catch {
            reject(new Error("服务器返回异常"));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || "上传失败"));
          } catch {
            reject(new Error(`上传失败 (${xhr.status})`));
          }
        }
      });

      xhr.addEventListener("error", () => reject(new Error("网络错误，请检查连接")));
      xhr.addEventListener("abort", () => reject(new Error("上传已取消")));

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  }

  const handleStartRoast = async () => {
    if (!selectedFile) {
      toast.error("请先上传简历文件");
      return;
    }

    // 预加载结果页面
    router.prefetch("/roasts/placeholder");

    try {
      // 阶段 1: 上传文件
      setStage("uploading");
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadData = await uploadFileWithProgress(formData);

      // 阶段 2: 解析 PDF（服务器已完成，快速过渡）
      setStage("parsing");
      await new Promise((r) => setTimeout(r, 600));

      // 阶段 3: 内容审核
      setStage("validating");
      await new Promise((r) => setTimeout(r, 500));

      // 阶段 4: AI 分析
      setStage("analyzing");

      const roastRes = await fetch("/api/roasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_id: uploadData.resume_id,
          style: selectedStyle,
        }),
      });

      if (!roastRes.ok) {
        const error = await roastRes.json();
        throw new Error(error.error || "AI 分析失败");
      }

      const roastData: RoastResponse = (await roastRes.json()).data;

      // 阶段 5: 完成
      setStage("complete");

      addToHistory({
        id: roastData.roast_id,
        resume_name: selectedFile.name,
        style: selectedStyle,
        overall_score: roastData.preview.overall_score,
        summary: roastData.preview.summary,
        created_at: new Date().toISOString(),
      });

      // 短暂展示完成状态后跳转
      await new Promise((r) => setTimeout(r, 1200));
      router.push(`/roasts/${roastData.roast_id}`);
    } catch (error) {
      setStage(null);
      toast.error(error instanceof Error ? error.message : "操作失败，请重试");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <FloatingGeometry />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6 shadow-3d"
            >
              <Flame className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">AI 简历吐槽器</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">AI 吐槽你的简历</span>
              <br />
              <span className="text-gradient">你敢试试吗？</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              上传简历 PDF，让 AI 用最毒舌的方式告诉你简历哪里有多差劲。
              每条吐槽都附带专业改进建议，在笑声中提升求职竞争力。
            </p>
          </motion.div>

          {/* 上传区 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <TiltCard maxTilt={5} scale={1.02}>
              <DropZone
                onFileSelected={handleFileSelected}
                selectedFile={selectedFile}
                onClear={handleClearFile}
              />
            </TiltCard>

            {selectedFile && !stage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <StyleSelector selected={selectedStyle} onSelect={setSelectedStyle} />

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleStartRoast}
                  className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white font-bold text-lg rounded-2xl shadow-3d hover:shadow-purple-500/40 transition-all overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-3">
                    开始吐槽
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </motion.div>
            )}

            {stage && (
              <UploadProgress
                stage={stage}
                uploadProgress={uploadProgress}
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* 使用步骤 */}
      <section id="how-it-works" className="relative px-4 py-20 bg-gray-900/50 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              三步<span className="text-gradient">玩转</span>简历吐槽
            </h2>
            <p className="text-gray-400">简单三步，AI 帮你发现简历盲区</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step, index) => (
              <TiltCard key={index} maxTilt={8} scale={1.05}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl hover:border-purple-500/30 transition-all duration-500 group"
                >
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>

                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.color} border border-purple-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-purple-400">{step.icon}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>

                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2">
                      <ArrowRight className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="relative px-4 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/3 to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              准备好被<span className="text-gradient">毒舌</span>了吗？
            </h2>
            <p className="text-gray-400">
              已有 10,000+ 份简历被吐槽，你的呢？
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "10,000+", label: "简历被吐槽" },
              { value: "95%", label: "用户好评" },
              { value: "4", label: "吐槽风格" },
              { value: "0 元", label: "完全免费" },
            ].map((stat, i) => (
              <TiltCard key={i} maxTilt={5} scale={1.03}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-2xl hover:border-purple-500/20 transition-all duration-500"
                >
                  <div className="text-2xl md:text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="px-4 py-20 text-center">
        <TiltCard maxTilt={3} scale={1.02}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto p-10 bg-gray-800/50 border border-gray-700 rounded-2xl"
          >
            <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              你的简历到底能得<span className="text-gradient">几分</span>？
            </h2>
            <p className="text-gray-400 mb-8">
              上传简历，让 AI 给你一个意想不到的答案
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-3d hover:shadow-purple-500/40 transition-all"
            >
              立即试试
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </TiltCard>
      </section>
    </div>
  );
}