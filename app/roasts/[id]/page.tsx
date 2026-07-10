"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RoastList } from "@/components/roast/RoastList";
import { ShareCard } from "@/components/roast/ShareCard";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { addToHistory } from "@/lib/history";
import type { RoastRecord, RoastItem } from "@/types";

/** 数字递增动画 Hook */
function useCountUp(end: number, duration: number = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (end <= 0) return;
    let startTime: number | null = null;
    let raf: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * end));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return value;
}

export default function RoastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [roast, setRoast] = useState<RoastRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    async function fetchRoast() {
      try {
        const res = await fetch(`/api/roasts/${id}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        setRoast(data.data);
        // 延迟显示内容，让页面过渡动画先播放
        setTimeout(() => setShowContent(true), 100);

        // 保存到 localStorage
        if (data.data) {
          addToHistory({
            id: data.data.id,
            resume_name: data.data.resume_name || "未知简历",
            style: data.data.style,
            overall_score: data.data.overall_score,
            summary: data.data.summary,
            created_at: data.data.created_at,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoast();
  }, [id]);

  // 分数递增动画
  const animatedScore = useCountUp(roast?.overall_score ?? 0, 1200);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">加载吐槽结果...</p>
        </div>
      </div>
    );
  }

  if (error || !roast) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-red-400 text-xl mb-4">{error || "吐槽记录不存在"}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </motion.div>
      </div>
    );
  }

  const roasts = roast.roasts as RoastItem[];

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页，再试一次
          </Link>
        </motion.div>

        {/* 分数卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex flex-col items-center p-8 bg-gray-800/50 border border-gray-700 rounded-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={showContent ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 12 }}
              className="mb-4"
            >
              <span className={`text-7xl font-black tabular-nums ${getScoreColor(roast.overall_score)}`}>
                {animatedScore}
              </span>
              <span className="text-2xl text-gray-500 ml-2">/ 100</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={showContent ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full"
            >
              <span className="text-purple-300 text-sm font-medium">
                {getScoreLabel(roast.overall_score)}
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={showContent ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="text-gray-400 mt-4 text-sm italic max-w-md"
            >
              &ldquo;{roast.summary}&rdquo;
            </motion.p>
          </div>
        </motion.div>

        {/* 吐槽列表 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <RoastList roasts={roasts} />
        </motion.div>

        {/* 分享 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-10"
        >
          <ShareCard roastId={id} score={roast.overall_score} summary={roast.summary} roasts={roasts} />
        </motion.div>

        {/* 再来一次 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : {}}
          transition={{ delay: 1.0 }}
          className="mt-16 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            再来一次
          </Link>
        </motion.div>
      </div>
    </div>
  );
}