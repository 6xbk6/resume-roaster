"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import type { RoastItem } from "@/types";

interface ShareCardProps {
  roastId: string;
  score: number;
  summary: string;
  roasts: RoastItem[];
}

export function ShareCard({ roastId, score, summary, roasts }: ShareCardProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [hasShareApi, setHasShareApi] = useState(false);
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/roasts/${roastId}`;

  // 构建完整分享文案，不遗漏任何内容
  const buildShareText = () => {
    const lines: string[] = [];
    lines.push(`📄 简历吐槽报告`);
    lines.push(`🏆 综合评分：${score} / 100`);
    lines.push("");
    lines.push(`💬 总结：${summary}`);
    lines.push("");

    roasts.forEach((r, i) => {
      lines.push(`【${i + 1}】${r.category}（严重程度：${r.severity === "high" ? "🔴 高" : r.severity === "medium" ? "🟡 中" : "🟢 低"}）`);
      lines.push(`吐槽：${r.roast}`);
      lines.push(`建议：${r.suggestion}`);
      lines.push("");
    });

    lines.push(`👉 来看看你的简历能得几分？${shareUrl}`);
    return lines.join("\n");
  };

  const shareText = buildShareText();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasShareApi(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCopyText = async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "简历吐槽器 - 我的简历评分",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // 用户取消分享
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-2xl">
        <div className="text-center mb-4">
          <p className="text-white text-lg font-bold">分享到社交媒体</p>
          <p className="text-gray-400 text-sm mt-1">
            一键复制链接或文案，分享给朋友看看你的简历得分
          </p>
        </div>

        {/* 链接预览 */}
        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden">
          <p className="text-gray-300 text-sm break-all font-mono">
            {shareUrl}
          </p>
        </div>

        {/* 按钮区域 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {hasShareApi && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              <Share2 className="w-5 h-5" />
              分享
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 px-4 py-3 ${
              !hasShareApi ? "col-span-2" : ""
            } bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 transition-all`}
          >
            {linkCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            {linkCopied ? "链接已复制" : "复制链接"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
          >
            {textCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            {textCopied ? "文案已复制" : "复制文案"}
          </motion.button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            复制后直接粘贴到微信、朋友圈、微博或 Twitter 即可分享
          </p>
        </div>
      </div>
    </motion.div>
  );
}