"use client";

import { motion } from "framer-motion";
import { Skull, Crown, Coffee, Heart } from "lucide-react";
import type { RoastStyle } from "@/types";

const styles: Array<{
  value: RoastStyle;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
}> = [
  {
    value: "savage",
    label: "毒舌模式",
    icon: <Skull className="w-6 h-6" />,
    description: "毫不留情，句句暴击",
    color: "text-red-400",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    value: "versailles",
    label: "凡尔赛",
    icon: <Crown className="w-6 h-6" />,
    description: "明贬暗褒，阴阳怪气",
    color: "text-amber-400",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    value: "veteran",
    label: "老油条",
    icon: <Coffee className="w-6 h-6" />,
    description: "职场老手，一针见血",
    color: "text-blue-400",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    value: "cute",
    label: "可爱模式",
    icon: <Heart className="w-6 h-6" />,
    description: "萌系吐槽，温柔一刀",
    color: "text-pink-400",
    borderColor: "border-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

interface StyleSelectorProps {
  selected: RoastStyle;
  onSelect: (style: RoastStyle) => void;
}

export function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <p className="text-center text-gray-400 text-sm mb-4">选择吐槽风格</p>
      <div className="grid grid-cols-2 gap-3">
        {styles.map((style, i) => {
          const isSelected = selected === style.value;
          return (
            <motion.button
              key={style.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(style.value)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? `${style.borderColor} ${style.bgColor} shadow-3d`
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
              }`}
            >
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-xl opacity-40 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, currentColor, transparent 70%)`,
                  }}
                />
              )}
              <span className={`relative z-10 ${isSelected ? style.color : "text-gray-400"}`}>
                {style.icon}
              </span>
              <span className={`relative z-10 text-sm font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
                {style.label}
              </span>
              <span className="relative z-10 text-xs text-gray-500">{style.description}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}