"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { RoastItem } from "@/types";
import { getSeverityColor, getSeverityLabel, getSeverityTextColor } from "@/lib/utils";

interface RoastCardProps {
  roast: RoastItem;
  index: number;
  isBlurred?: boolean;
}

export function RoastCard({ roast, index, isBlurred = false }: RoastCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityIcon = {
    high: <AlertTriangle className="w-4 h-4 text-red-400" />,
    medium: <AlertCircle className="w-4 h-4 text-yellow-400" />,
    low: <Info className="w-4 h-4 text-green-400" />,
  }[roast.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`relative bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden transition-all ${
        isBlurred ? "blur-sm select-none" : "hover:border-gray-600"
      }`}
    >
      {/* 左侧严重程度颜色条 */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(roast.severity)}`} />

      <div className="p-5 pl-6">
        {/* 头部：分类和严重程度 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
              {roast.category}
            </span>
            <span className={`flex items-center gap-1 text-xs ${getSeverityTextColor(roast.severity)}`}>
              {severityIcon}
              {getSeverityLabel(roast.severity)}
            </span>
          </div>
          <span className="text-xs text-gray-600">{index + 1}</span>
        </div>

        {/* 吐槽内容 */}
        <p className="text-white text-base leading-relaxed mb-3">
          {roast.roast}
        </p>

        {/* 改进建议（折叠） */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          <span>{isExpanded ? "收起建议" : "查看改进建议"}</span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-gray-300 leading-relaxed">
                  <span className="text-purple-400 font-medium">💡 建议：</span>
                  {roast.suggestion}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}