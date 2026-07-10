"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSearch,
  ShieldCheck,
  Brain,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export type ProcessStage = "uploading" | "parsing" | "validating" | "analyzing" | "complete";

interface UploadProgressProps {
  stage: ProcessStage;
  uploadProgress: number; // 0-100 真实上传进度
}

interface StageInfo {
  key: ProcessStage;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const STAGE_INFO: StageInfo[] = [
  {
    key: "uploading",
    label: "上传文件",
    icon: <Upload className="w-4 h-4" />,
    description: "正在将简历文件上传至服务器",
  },
  {
    key: "parsing",
    label: "解析内容",
    icon: <FileSearch className="w-4 h-4" />,
    description: "正在提取 PDF 中的文本内容",
  },
  {
    key: "validating",
    label: "内容审核",
    icon: <ShieldCheck className="w-4 h-4" />,
    description: "正在验证文件是否为有效简历",
  },
  {
    key: "analyzing",
    label: "AI 分析",
    icon: <Brain className="w-4 h-4" />,
    description: "AI 正在深度分析简历内容",
  },
  {
    key: "complete",
    label: "完成",
    icon: <CheckCircle2 className="w-4 h-4" />,
    description: "吐槽报告已生成",
  },
];

// 每个阶段的提示消息
const STAGE_TIPS: Record<ProcessStage, string[]> = {
  uploading: [
    "正在建立安全连接...",
    "正在传输文件数据...",
    "文件较大，请耐心等待...",
    "上传速度取决于您的网络...",
  ],
  parsing: [
    "正在识别 PDF 页面结构...",
    "正在提取文本内容...",
    "正在清理格式信息...",
    "文本提取完成，准备下一步...",
  ],
  validating: [
    "正在检查个人信息模块...",
    "正在检测教育背景信息...",
    "正在识别工作经历描述...",
    "正在分析技能关键词...",
    "正在验证简历完整性...",
  ],
  analyzing: [
    "AI 正在逐段阅读你的简历...",
    "正在从格式排版角度分析...",
    "正在评估内容质量与量化成果...",
    "正在检查措辞表达与专业度...",
    "正在综合评估整体竞争力...",
    "AI 发现了不少问题，正在组织语言...",
    "正在酝酿毒舌吐槽，马上就好...",
    "最后润色中，让吐槽更犀利一点...",
  ],
  complete: [
    "吐槽报告生成完毕！",
    "准备跳转到结果页面...",
  ],
};

export function UploadProgress({ stage, uploadProgress }: UploadProgressProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const tipIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tips = STAGE_TIPS[stage] || [];
  const stageIndex = STAGE_INFO.findIndex((s) => s.key === stage);

  // 重置计时和提示
  useEffect(() => {
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setTipIndex(0);

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    tipIntervalRef.current = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 2500);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
    };
  }, [stage, tips.length]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} 秒`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} 分 ${s} 秒`;
  };

  // 计算整体进度百分比
  const overallProgress = useMemo(() => {
    const stageWeights = [25, 15, 15, 35, 10]; // 各阶段权重
    let progress = 0;
    for (let i = 0; i < stageIndex; i++) {
      progress += stageWeights[i];
    }
    if (stage === "uploading") {
      progress += (uploadProgress / 100) * stageWeights[stageIndex];
    } else if (stage === "complete") {
      progress = 100;
    } else {
      progress += stageWeights[stageIndex] * 0.5; // 进行中的阶段给一半
    }
    return Math.min(progress, 100);
  }, [stage, stageIndex, uploadProgress]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-6 p-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-3d"
      >
        {/* 阶段步骤指示器 */}
        <div className="flex items-center justify-center gap-0">
          {STAGE_INFO.map((info, idx) => {
            const isCompleted = idx < stageIndex;
            const isCurrent = idx === stageIndex;

            return (
              <div key={info.key} className="flex items-center">
                {/* 图标 */}
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={
                      isCurrent
                        ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0 0 rgba(168,85,247,0)", "0 0 0 8px rgba(168,85,247,0.15)", "0 0 0 0 rgba(168,85,247,0)"] }
                        : isCompleted
                          ? { scale: 1 }
                          : {}
                    }
                    transition={
                      isCurrent
                        ? { duration: 2, repeat: Infinity }
                        : { duration: 0.3 }
                    }
                    className={`relative z-10 p-2 rounded-lg transition-all duration-500 ${
                      isCompleted
                        ? "bg-green-500/20 text-green-400"
                        : isCurrent
                          ? "bg-purple-500/20 text-purple-400 ring-2 ring-purple-500/30"
                          : "bg-gray-800 text-gray-600"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : info.icon}
                  </motion.div>

                  {/* 标签 */}
                  <span
                    className={`text-[11px] font-medium transition-colors duration-500 whitespace-nowrap ${
                      isCompleted
                        ? "text-green-400"
                        : isCurrent
                          ? "text-purple-300"
                          : "text-gray-600"
                    }`}
                  >
                    {info.label}
                  </span>
                </div>

                {/* 箭头分隔符 */}
                {idx < STAGE_INFO.length - 1 && (
                  <ChevronRight
                    className={`w-4 h-4 mx-1 transition-all duration-500 ${
                      isCompleted
                        ? "text-green-400"
                        : "text-gray-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 整体进度条 */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>整体进度</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 100%" }}
            >
              {/* 光点 */}
              <motion.div
                animate={{ x: ["0%", "100%"], opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"
              />
            </motion.div>
          </div>
        </div>

        {/* 当前阶段详情 */}
        <div className="text-center">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-semibold text-lg mb-1"
          >
            {STAGE_INFO[stageIndex]?.description || "处理中..."}
          </motion.p>

          {/* 轮播提示消息 */}
          <div className="h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${stage}-${tipIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-gray-400 text-sm"
              >
                {tips[tipIndex] || ""}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* 已用时间 */}
          <p className="text-gray-600 text-xs mt-2">
            已用时 {formatTime(elapsedSeconds)}
            {stage === "analyzing" && elapsedSeconds > 8 && (
              <span className="text-gray-500 ml-1">· 深度分析中，内容越丰富耗时越长</span>
            )}
          </p>
        </div>

        {/* 完成动画 */}
        <AnimatePresence>
          {stage === "complete" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-xl"
              >
                <Sparkles className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">报告生成完毕，即将跳转...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}