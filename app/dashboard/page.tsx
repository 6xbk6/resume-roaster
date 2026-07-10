"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, FileText, Clock, ExternalLink, Trash2 } from "lucide-react";
import { getHistory, removeFromHistory, clearHistory, getStyleLabel } from "@/lib/history";
import type { HistoryEntry } from "@/lib/history";

export default function DashboardPage() {
  const [roasts, setRoasts] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const merged: HistoryEntry[] = [];
      const seen = new Set<string>();

      // 1. 从服务端 API 获取历史记录
      try {
        const res = await fetch("/api/roasts");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          for (const item of data.data) {
            if (!seen.has(item.id)) {
              merged.push(item);
              seen.add(item.id);
            }
          }
        }
      } catch {
        // API 不可用时忽略
      }

      // 2. 从 localStorage 补充
      for (const item of getHistory()) {
        if (!seen.has(item.id)) {
          merged.push(item);
          seen.add(item.id);
        }
      }

      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRoasts(merged);
      setIsLoading(false);
    }

    loadHistory();
  }, []);

  const handleDeleteRoast = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await fetch(`/api/roasts/${id}`, { method: "DELETE" });
    } catch {
      // ignore
    }

    removeFromHistory(id);
    setRoasts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = async () => {
    if (roasts.length === 0) return;

    const ids = roasts.map((r) => r.id);
    await Promise.allSettled(
      ids.map((id) => fetch(`/api/roasts/${id}`, { method: "DELETE" }))
    );

    clearHistory();
    setRoasts([]);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
            <h1 className="text-2xl font-bold text-white">我的吐槽记录</h1>
          </div>
          {roasts.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-500/30 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
              清空记录
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : roasts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500 text-lg mb-4">还没有吐槽记录</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              去吐槽一份简历
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {roasts.map((roast, index) => (
              <motion.div
                key={roast.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2 group/item">
                  <Link
                    href={`/roasts/${roast.id}`}
                    className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-all group flex-1"
                  >
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {roast.resume_name || "未命名简历"}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {getStyleLabel(roast.style)}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(roast.created_at).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-400">{roast.overall_score}</span>
                      <span className="text-xs text-gray-600">/100</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </Link>
                  <button
                    onClick={(e) => handleDeleteRoast(roast.id, e)}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
                    title="删除此条记录"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}