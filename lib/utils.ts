// 通用工具函数

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * 根据严重程度获取颜色
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

/**
 * 根据严重程度获取文字颜色
 */
export function getSeverityTextColor(severity: string): string {
  switch (severity) {
    case "high":
      return "text-red-400";
    case "medium":
      return "text-yellow-400";
    case "low":
      return "text-green-400";
    default:
      return "text-gray-400";
  }
}

/**
 * 根据严重程度获取标签
 */
export function getSeverityLabel(severity: string): string {
  switch (severity) {
    case "high":
      return "严重";
    case "medium":
      return "中等";
    case "low":
      return "轻微";
    default:
      return "未知";
  }
}

/**
 * 根据分数获取颜色
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

/**
 * 根据分数获取评价
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return "简历大神";
  if (score >= 80) return "还不错";
  if (score >= 70) return "中规中矩";
  if (score >= 60) return "需要改进";
  if (score >= 40) return "问题较多";
  return "重新写吧";
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}