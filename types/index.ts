// 简历吐槽器 - 全局类型定义

// 吐槽风格
export type RoastStyle = "savage" | "versailles" | "veteran" | "cute";

export const ROAST_STYLES: { value: RoastStyle; label: string; emoji: string; description: string }[] = [
  { value: "savage", label: "毒舌模式", emoji: "🔥", description: "毫不留情，直击痛点" },
  { value: "versailles", label: "凡尔赛模式", emoji: "👑", description: "阴阳怪气，优雅讽刺" },
  { value: "veteran", label: "职场老油条", emoji: "🧓", description: "过来人语气，语重心长" },
  { value: "cute", label: "可爱模式", emoji: "🐱", description: "萌系吐槽，温柔一刀" },
];

// 吐槽条目
export interface RoastItem {
  category: "格式排版" | "内容质量" | "措辞表达" | "整体印象";
  roast: string;
  suggestion: string;
  severity: "high" | "medium" | "low";
}

// 吐槽结果
export interface RoastResult {
  roasts: RoastItem[];
  overall_score: number;
  summary: string;
}

// 简历信息
export interface ResumeInfo {
  id: string;
  file_name: string;
  file_size: number;
  content_text: string;
  created_at: string;
}

// 吐槽记录
export interface RoastRecord {
  id: string;
  resume_id: string;
  style: RoastStyle;
  roasts: RoastItem[];
  overall_score: number;
  summary: string;
  created_at: string;
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// 上传响应
export interface UploadResponse {
  resume_id: string;
  file_name: string;
  text_preview: string;
}

// 吐槽响应
export interface RoastResponse {
  roast_id: string;
  preview: RoastResult;
}