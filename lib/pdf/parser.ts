// PDF 解析模块

// 使用动态 import 避免 pdf-parse 在 edge runtime 的问题
let pdfParse: ((buffer: Buffer) => Promise<{ text: string; numpages: number }>) | null = null;

async function getPdfParser() {
  if (!pdfParse) {
    const pdfParseModule = await import("pdf-parse");
    pdfParse = pdfParseModule.default;
  }
  return pdfParse;
}

export interface PdfParseResult {
  text: string;
  pageCount: number;
}

/**
 * 解析 PDF 文件 buffer，提取纯文本
 * 如果 PDF 解析失败，尝试将 buffer 作为纯文本读取
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<PdfParseResult> {
  let text = "";
  let pageCount = 1;

  try {
    const parser = await getPdfParser();
    const data = await parser(buffer);

    text = data.text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[^\S\n]+/g, " ")
      .trim();

    pageCount = data.numpages;
  } catch (pdfError) {
    // PDF 解析失败，尝试作为纯文本读取
    console.warn("PDF parse failed, trying plain text fallback:", (pdfError as Error).message);
    text = buffer.toString("utf-8").trim();

    // 如果包含 PDF 头部标记，尝试提取文本内容
    if (text.startsWith("%PDF")) {
      // 尝试从 PDF stream 中提取文本
      const streamMatch = text.match(/stream\n([\s\S]*?)\nendstream/);
      if (streamMatch) {
        text = streamMatch[1]
          .replace(/BT\s*\/F1.*?Td\s*\(/g, "")
          .replace(/\)\s*Tj\s*ET/g, "")
          .replace(/\\([()\\])/g, "$1")
          .trim();
      }
    }

    if (!text || text.length < 10) {
      throw {
        message: "无法解析 PDF，请确保文件是文字型 PDF（非扫描图片）",
        code: "PARSE_FAILED",
      };
    }
  }

  // 清理文本
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+/g, " ")
    .trim();

  return { text, pageCount };
}

// 简历特征关键词 — 一份合格的简历应该包含多个类别
const RESUME_PATTERNS = {
  // 个人信息标识
  personal: [
    /姓名[：:\s]*[\u4e00-\u9fa5]{2,4}/,
    /电话[：:\s]*[\d\s\-+()]{7,}/,
    /邮箱[：:\s]*[\w.+-]+@[\w-]+\.[\w.]+/,
    /手机[：:\s]*[\d\s\-+()]{7,}/,
    /年龄[：:\s]*\d{1,3}/,
    /性别[：:\s]*[男女]/,
    /出生[：:\s]*\d{4}/,
    /所在地[：:\s]*[\u4e00-\u9fa5]+/,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  ],
  // 教育背景
  education: [
    /教育背景/,
    /学历/,
    /毕业[院校学校]/,
    /大学/,
    /学院/,
    /本科/,
    /硕士/,
    /博士/,
    /专科/,
    /专业[：:\s]*[\u4e00-\u9fa5]+/,
    /GPA/,
    /成绩/,
  ],
  // 工作/实习经历
  work: [
    /工作经历/,
    /实习经历/,
    /项目经验/,
    /工作经验/,
    /在职/,
    /任职/,
    /担任/,
    /负责/,
    /参与/,
    /主导/,
    /管理/,
    /团队/,
    /部门/,
    /\d{4}[年.\-/]\d{1,2}\s*[至\-到]\s*/,
    /至今/,
  ],
  // 技能
  skills: [
    /技能/,
    /技术栈/,
    /掌握/,
    /熟悉/,
    /精通/,
    /熟练/,
    /了解/,
    /证书/,
    /语言能力/,
    /英语/,
    /CET[-\s]?[46]/,
    /雅思|托福|TOEFL|IELTS/i,
    /Python|Java|JavaScript|React|Vue|Node|SQL|C\+\+|Go|Rust|TypeScript/i,
  ],
  // 自我评价/求职意向
  selfIntro: [
    /自我评价/,
    /个人评价/,
    /求职意向/,
    /期望薪资/,
    /期望职位/,
    /目标岗位/,
    /自我介绍/,
    /个人优势/,
    /个人总结/,
  ],
};

export interface ResumeValidationResult {
  valid: boolean;
  reason?: string;
  score: number; // 0-100 简历特征匹配度
  details: {
    personal: boolean;
    education: boolean;
    work: boolean;
    skills: boolean;
    selfIntro: boolean;
  };
}

/**
 * 验证 PDF 内容是否为简历
 * 基于关键词模式匹配，判断内容是否具备简历特征
 */
export function validateResumeText(text: string): ResumeValidationResult {
  const details = {
    personal: false,
    education: false,
    work: false,
    skills: false,
    selfIntro: false,
  };

  // 基础长度检查
  if (!text || text.trim().length < 50) {
    return {
      valid: false,
      reason: "文件内容太少（少于 50 字），请确认上传的是完整的简历文件",
      score: 0,
      details,
    };
  }

  if (text.trim().length > 15000) {
    return {
      valid: false,
      reason: "文件内容过长（超过 15000 字），请确认上传的是简历而非其他文档",
      score: 0,
      details,
    };
  }

  // 检查各维度简历特征
  for (const pattern of RESUME_PATTERNS.personal) {
    if (pattern.test(text)) {
      details.personal = true;
      break;
    }
  }

  for (const pattern of RESUME_PATTERNS.education) {
    if (pattern.test(text)) {
      details.education = true;
      break;
    }
  }

  for (const pattern of RESUME_PATTERNS.work) {
    if (pattern.test(text)) {
      details.work = true;
      break;
    }
  }

  for (const pattern of RESUME_PATTERNS.skills) {
    if (pattern.test(text)) {
      details.skills = true;
      break;
    }
  }

  for (const pattern of RESUME_PATTERNS.selfIntro) {
    if (pattern.test(text)) {
      details.selfIntro = true;
      break;
    }
  }

  // 计算匹配度
  const matchedCategories = [details.personal, details.education, details.work, details.skills, details.selfIntro]
    .filter(Boolean).length;
  const score = Math.round((matchedCategories / 5) * 100);

  // 至少匹配 2 个类别才认为是简历
  if (matchedCategories < 2) {
    const missingParts: string[] = [];
    if (!details.personal) missingParts.push("个人信息（姓名/电话/邮箱）");
    if (!details.education) missingParts.push("教育背景");
    if (!details.work) missingParts.push("工作或项目经历");
    if (!details.skills) missingParts.push("技能描述");
    if (!details.selfIntro) missingParts.push("自我评价或求职意向");

    return {
      valid: false,
      reason: `文件内容不像一份简历，缺少以下关键信息：${missingParts.join("、")}。请确认上传的是简历 PDF。`,
      score,
      details,
    };
  }

  // 至少匹配 3 个类别才给高分
  if (matchedCategories < 3) {
    return {
      valid: true,
      reason: `简历特征匹配度较低（${score}%），部分关键信息可能缺失，吐槽结果可能不够准确`,
      score,
      details,
    };
  }

  return {
    valid: true,
    score,
    details,
  };
}

/**
 * 提取文本预览（前 200 字）
 */
export function getTextPreview(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}