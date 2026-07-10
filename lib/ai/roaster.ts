import OpenAI from "openai";
import type { RoastStyle, RoastResult, RoastItem } from "@/types";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";

// 检查是否配置了 AI API Key
function hasAIConfigured(): boolean {
  const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  return !!key && key !== "your_ai_api_key" && key !== "your_openai_api_key";
}

// AI 客户端（支持 OpenAI 兼容 API，如 DeepSeek）
function getAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "sk-mock",
    baseURL: process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });
}

// 模型配置
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const MAX_TOKENS = 3000;
const TEMPERATURE = 0; // 设为 0 确保同一输入产生相同输出

/**
 * 基于文本内容生成确定性 seed（0-2147483647）
 * 使用 DJB2 哈希算法，确保相同内容产生相同 seed
 */
function contentHash(text: string): number {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

/**
 * 解析 AI 返回的 JSON，处理各种格式问题
 */
function parseAIResponse(content: string): RoastResult {
  let jsonStr = content.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr) as RoastResult;

    if (!parsed.roasts || !Array.isArray(parsed.roasts)) {
      throw new Error("Missing roasts array");
    }

    parsed.roasts = parsed.roasts.map((r: RoastItem, i: number) => ({
      category: ["格式排版", "内容质量", "措辞表达", "整体印象"].includes(r.category)
        ? r.category
        : "整体印象",
      roast: r.roast || `第 ${i + 1} 条吐槽生成失败`,
      suggestion: r.suggestion || "请参考其他建议进行改进",
      severity: ["high", "medium", "low"].includes(r.severity) ? r.severity : "medium",
    }));

    if (typeof parsed.overall_score !== "number" || parsed.overall_score < 0 || parsed.overall_score > 100) {
      parsed.overall_score = 60;
    }

    if (!parsed.summary) {
      parsed.summary = "这份简历还有很大的提升空间，加油！";
    }

    return parsed;
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    console.error("Raw content:", content);
    throw new Error("AI 返回格式异常，请重试");
  }
}

// ---- Mock 模式：当未配置 AI API Key 时使用 ----

function generateMockRoast(resumeText: string, style: RoastStyle): RoastResult {
  const wordCount = resumeText.length;
  const hasNumbers = /\d+%|\d+万|\d+人|\d+元|\d+个/.test(resumeText);
  const hasKeywords = /负责|参与|协助|熟悉|了解|掌握|精通/.test(resumeText);
  const hasEnglish = /[a-zA-Z]{3,}/.test(resumeText);

  const stylePrefix: Record<RoastStyle, string> = {
    savage: "说真的，",
    versailles: "也不是说不好，就是",
    veteran: "年轻人啊，",
    cute: "喵～注意到",
  };

  const mockRoasts: RoastItem[] = [
    {
      category: "格式排版",
      roast: `${stylePrefix[style]}你这排版像是在 Word 里随便打了几行字就导出了。字体大小忽大忽小，行间距像是被猫踩过键盘一样随机。`,
      suggestion: "统一使用一种字体（推荐宋体或微软雅黑），标题 14-16pt，正文 10-12pt，行间距设为 1.15-1.5 倍。",
      severity: "medium",
    },
    {
      category: "内容质量",
      roast: hasNumbers
        ? `${stylePrefix[style]}终于看到几个数字了，但全是"提升了XX%"这种模糊表述。你是在写简历还是在写小说？数据呢？证据呢？`
        : `${stylePrefix[style]}整份简历看下来，全是"负责""参与""协助"，我都分不清你是员工还是实习生。没有一个数字，HR 怎么知道你是真干活还是摸鱼？`,
      suggestion: "每个工作经历至少包含 2-3 个量化成果，如'提升效率 30%'、'管理 50 万预算'、'带领 5 人团队'。",
      severity: "high",
    },
    {
      category: "措辞表达",
      roast: hasKeywords
        ? `${stylePrefix[style]}'熟悉'、'了解'、'掌握'...这几个词循环出现，我还以为在玩文字消消乐。你要么'精通'，要么就别写。`
        : `${stylePrefix[style]}措辞太平淡了，像是在写日记而不是简历。'做了'、'干了'、'弄了'——这是简历还是小学生作文？`,
      suggestion: "用有力的动词开头：'主导'、'设计'、'优化'、'重构'，避免'负责'、'参与'等模糊词汇。",
      severity: "medium",
    },
    {
      category: "整体印象",
      roast: `${stylePrefix[style]}这份简历看完了，HR 可能已经睡着了。没有亮点，没有记忆点，只有大段大段的文字在催眠。`,
      suggestion: "在简历顶部添加 2-3 行的个人亮点总结，让 HR 在 5 秒内就能抓住重点。",
      severity: "high",
    },
    {
      category: "格式排版",
      roast: `${stylePrefix[style]}简历长度也是个问题。太短显得没料，太长 HR 没耐心。你这份简历的长度，刚好卡在'让人烦躁'和'让人犯困'之间。`,
      suggestion: "应届生简历控制在 1 页，有经验的职场人控制在 1-2 页，超过 2 页的删减不相关内容。",
      severity: "low",
    },
    {
      category: "内容质量",
      roast: hasEnglish
        ? `${stylePrefix[style]}英文能力写了'CET-6'，但简历里连个英文句号都没用对。HR 看到这里已经在翻白眼了。`
        : `${stylePrefix[style]}项目经验写得像产品说明书，全是功能列表。HR 想看的是你解决了什么问题，带来了什么价值。`,
      suggestion: "用 STAR 法则（情境-任务-行动-结果）描述项目经验，突出你的贡献和成果。",
      severity: "medium",
    },
    {
      category: "措辞表达",
      roast: `${stylePrefix[style]}自我评价那段简直是'优秀员工'模板大合集。'吃苦耐劳''团队协作''学习能力强'——这些词 HR 一天能看 200 遍。`,
      suggestion: "自我评价要具体化：'3 年 Java 开发经验，主导过日活 100 万的项目重构'，比空洞的形容词有用 100 倍。",
      severity: "medium",
    },
    {
      category: "整体印象",
      roast: `${stylePrefix[style]}总结一下：这份简历投出去，大概率石沉大海。不是你没能力，而是简历没把你的能力展示出来。修改空间很大，加油吧。`,
      suggestion: "建议从头到尾重写一遍，重点突出量化成果、项目经验和专业技能。可以用 AI 辅助优化措辞。",
      severity: "high",
    },
  ];

  const score = Math.min(85, Math.max(25, Math.floor(40 + wordCount / 100 + (hasNumbers ? 10 : 0) + (hasEnglish ? 5 : 0))));

  return {
    roasts: mockRoasts,
    overall_score: score,
    summary: "这份简历还有很大的提升空间，改完再投，命中率至少翻倍！",
  };
}

/**
 * 生成简历吐槽（普通版）
 */
export async function generateRoast(
  resumeText: string,
  style: RoastStyle
): Promise<RoastResult> {
  // 如果未配置 AI Key，使用 Mock 模式
  if (!hasAIConfigured()) {
    console.log("[Mock Mode] AI API Key not configured, using mock data");
    // 模拟延迟，让体验更真实
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return generateMockRoast(resumeText, style);
  }

  const client = getAIClient();
  const systemPrompt = buildSystemPrompt(style);
  const userPrompt = buildUserPrompt(resumeText);

  const seed = contentHash(resumeText);

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    seed,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI 未返回内容，请重试");
  }

  return parseAIResponse(content);
}

