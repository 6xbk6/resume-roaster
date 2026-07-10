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

// ============================================================
// 简历特征关键词 — 加权匹配
// 原则：工作经历权重最高（30分），教育背景权重最低（15分）
// 纯学籍报告/成绩单只能拿到 personal+education <= 30分 → 不通过
// ============================================================

interface PatternCategory {
  weight: number; // 权重 15-30
  patterns: RegExp[];
}

const RESUME_PATTERNS: Record<string, PatternCategory> = {
  // 个人信息（15分）— 最低权重，因为所有文档都有个人信息
  personal: {
    weight: 15,
    patterns: [
      /姓名[：:\s]*[\u4e00-\u9fa5]{2,4}/,
      /电话[：:\s]*[\d\s\-+()]{7,}/,
      /手机[：:\s]*[\d\s\-+()]{7,}/,
      /邮箱[：:\s]*[\w.+-]+@[\w-]+\.[\w.]+/,
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      /求职意向/,
      /期望职位/,
      /目标岗位/,
      /期望薪资/,
      /年龄[：:\s]*\d{1,3}/,
      /性别[：:\s]*[男女]/,
      /所在地[：:\s]*[\u4e00-\u9fa5]+/,
    ],
  },
  // 教育背景（15分）— 低权重，学籍报告也会匹配此项
  education: {
    weight: 15,
    patterns: [
      /教育背景/,
      /学历[：:\s]*/,
      /毕业院校/,
      /毕业学校/,
      /专业[：:\s]*[\u4e00-\u9fa5]+/,
      /本科/,
      /硕士/,
      /博士/,
      /专科/,
      /GPA[：:\s]*\d/,
      /CET[-\s]?[46]/,
      /雅思|托福|TOEFL|IELTS/i,
    ],
  },
  // 工作/实习经历（30分）— 最高权重，简历的核心特征
  work: {
    weight: 30,
    patterns: [
      /工作经历/,
      /实习经历/,
      /项目经验/,
      /工作经验/,
      /工作履历/,
      /任职/,
      /担任/,
      /主导/,
      /负责/,
      /\d{4}[年.\-/]\d{1,2}\s*[至\-到~～]\s*(\d{4}[年.\-/]\d{1,2}|至今|现在)/,
      /至今/,
      /在职/,
      /离职/,
      /团队/,
      /部门/,
      /管理/,
    ],
  },
  // 技能（20分）— 高权重，简历特有。仅匹配技能章节标题和技术术语，避免普通文档误匹配
  skills: {
    weight: 20,
    patterns: [
      /专业技能/,
      /技术栈/,
      /语言能力/,
      /英语[：:\s]*(熟练|精通|流利|良好|四级|六级|CET|八级|专八)/,
      /证书[：:\s]*[\u4e00-\u9fa5]+/,
      /Python|Java\b|JavaScript|React|Vue|Node\.js|SQL|C\+\+|Golang|Rust|TypeScript|Docker|Kubernetes|AWS|Linux|MySQL|MongoDB|Redis|Git|Figma|Sketch|Photoshop|PR\b|AE\b|AI\b|PS\b/i,
    ],
  },
  // 自我评价/求职意向（20分）— 高权重，简历特有
  selfIntro: {
    weight: 20,
    patterns: [
      /自我评价/,
      /个人评价/,
      /个人优势/,
      /个人总结/,
      /自我介绍/,
      /自我描述/,
      /求职意向/,
      /期望薪资/,
      /期望职位/,
      /目标岗位/,
      /到岗时间/,
    ],
  },
};

// ============================================================
// 反模式（两级）
// 强反模式：命中 1 条即拒（录取通知书、成绩单等明确非简历）
// 弱反模式：命中 2 条才拒（学号、学分等辅助特征）
// ============================================================

// 强反模式 — 命中 1 条直接拒绝
const STRONG_ANTI_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /录取通知书/, label: "录取通知书" },
  { pattern: /成绩单/, label: "成绩单" },
  { pattern: /毕业证书/, label: "毕业证书" },
  { pattern: /学位证书/, label: "学位证书" },
  { pattern: /学历证书/, label: "学历证书" },
  { pattern: /结业证书/, label: "结业证书" },
  { pattern: /肄业证书/, label: "肄业证书" },
  { pattern: /学籍报告/, label: "学籍报告" },
  { pattern: /学籍证明/, label: "学籍证明" },
  { pattern: /在学证明/, label: "在学证明" },
  { pattern: /在读证明/, label: "在读证明" },
  { pattern: /报到证/, label: "报到证" },
  { pattern: /派遣证/, label: "派遣证" },
  { pattern: /劳动合同/, label: "劳动合同" },
  { pattern: /离职证明/, label: "离职证明" },
  { pattern: /在职证明/, label: "在职证明" },
  { pattern: /实习证明/, label: "实习证明" },
  { pattern: /收入证明/, label: "收入证明" },
  { pattern: /体检报告/, label: "体检报告" },
  { pattern: /培训证书/, label: "培训证书" },
  { pattern: /获奖证书/, label: "获奖证书" },
  { pattern: /荣誉证书/, label: "荣誉证书" },
  { pattern: /奖学金证书/, label: "奖学金证书" },
  { pattern: /学生证/, label: "学生证" },
  { pattern: /准考证/, label: "准考证" },
  { pattern: /入党申请/, label: "入党申请书" },
  { pattern: /入团申请/, label: "入团申请书" },
  { pattern: /无犯罪记录证明/, label: "无犯罪记录证明" },
  { pattern: /学信网/, label: "学信网验证报告" },
  { pattern: /毕业生就业推荐表/, label: "就业推荐表" },
  { pattern: /论文摘要/, label: "学术论文" },
  { pattern: /关键词[：:\s]*[\u4e00-\u9fa5]+[；;]/, label: "学术论文" },
  { pattern: /参考文献/, label: "学术论文" },
  { pattern: /专利号/, label: "专利" },
  { pattern: /户籍证明/, label: "户籍证明" },
  { pattern: /身份证号[：:\s]*\d{15,18}/, label: "身份证" },
  { pattern: /护照号/, label: "护照" },
  { pattern: /驾驶证号/, label: "驾驶证" },
  { pattern: /社保记录/, label: "社保记录" },
  { pattern: /公积金/, label: "公积金记录" },
  { pattern: /操行评定/, label: "操行评定" },
  { pattern: /学年总结/, label: "学年总结" },
  { pattern: /学期总结/, label: "学期总结" },
];

// 弱反模式 — 命中 2 条才拒绝
const WEAK_ANTI_PATTERNS = [
  /学籍/,
  /学号[：:\s]*\d/,
  /学籍号/,
  /准考证号/,
  /学分[：:\s]*\d/,
  /绩点[：:\s]*\d/,
  /学时[：:\s]*\d/,
  /课程名称/,
  /培养层次/,
  /入学日期/,
  /修业年限/,
  /毕业日期/,
  /授予学位/,
  /学年度/,
  /出生年月/,
  /户籍/,
  /民族[：:\s]*[\u4e00-\u9fa5]+/,
  /政治面貌[：:\s]*/,
  /婚否/,
  /籍贯[：:\s]*[\u4e00-\u9fa5]+/,
  /公章/,
  /盖章/,
  /特此证明/,
  /兹证明/,
  /经审查/,
  /经考核/,
  /成绩合格/,
  /准予毕业/,
  /授予.*学位/,
  /报到时间/,
  /报到地点/,
  /新生入学/,
  /缴费/,
  /学费/,
  /住宿费/,
];

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
 *
 * 识别策略：
 * 1. 反模式检测：学籍报告/成绩单/证书类 → 直接拒绝
 * 2. 加权评分：5 个维度各有权重，总分 >= 40 才通过
 *    - 工作经历（30分）→ 简历核心特征，缺此项需其他维度补齐
 *    - 技能（20分）+ 自我评价（20分）→ 简历特有
 *    - 教育（15分）+ 个人信息（15分）→ 低权重，非简历文档也有
 * 3. 边界案例：
 *    - 学籍报告：personal(15) + education(15) = 30 → 不通过
 *    - 应届生：personal(15) + education(15) + skills(20) + selfIntro(20) = 70 → 通过
 *    - 在职人员：全匹配 = 100 → 通过
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

  // 1. 强反模式检测：命中 1 条直接拒绝（录取通知书、成绩单等明确非简历）
  const strongHit = STRONG_ANTI_PATTERNS.find((p) => p.pattern.test(text));
  if (strongHit) {
    return {
      valid: false,
      reason: `文件内容被识别为「${strongHit.label}」而非简历，请上传简历 PDF`,
      score: 0,
      details,
    };
  }

  // 2. 弱反模式检测：命中 2 条及以上才拒绝（学号、学分等辅助特征）
  const weakHits = WEAK_ANTI_PATTERNS.filter((p) => p.test(text));
  if (weakHits.length >= 2) {
    const examples = weakHits.slice(0, 3).map((p) => p.source).filter(Boolean);
    return {
      valid: false,
      reason: `文件内容被识别为非简历文档（检测到 ${weakHits.length} 个非简历特征：${examples.join("、")}），请上传简历 PDF`,
      score: 0,
      details,
    };
  }

  // 3. 加权评分
  let totalScore = 0;

  // 个人信息
  if (RESUME_PATTERNS.personal.patterns.some((p) => p.test(text))) {
    details.personal = true;
    totalScore += RESUME_PATTERNS.personal.weight;
  }

  // 教育背景
  if (RESUME_PATTERNS.education.patterns.some((p) => p.test(text))) {
    details.education = true;
    totalScore += RESUME_PATTERNS.education.weight;
  }

  // 工作经历（最高权重）
  if (RESUME_PATTERNS.work.patterns.some((p) => p.test(text))) {
    details.work = true;
    totalScore += RESUME_PATTERNS.work.weight;
  }

  // 技能
  if (RESUME_PATTERNS.skills.patterns.some((p) => p.test(text))) {
    details.skills = true;
    totalScore += RESUME_PATTERNS.skills.weight;
  }

  // 自我评价
  if (RESUME_PATTERNS.selfIntro.patterns.some((p) => p.test(text))) {
    details.selfIntro = true;
    totalScore += RESUME_PATTERNS.selfIntro.weight;
  }

  // 3. 判定：总分 >= 40 且 至少匹配 2 个维度
  const matchedCount = [details.personal, details.education, details.work, details.skills, details.selfIntro]
    .filter(Boolean).length;

  if (totalScore < 40) {
    // 给出具体原因
    const missingParts: string[] = [];
    if (!details.work) missingParts.push("工作经历或项目经验");
    if (!details.skills) missingParts.push("技能描述");
    if (!details.selfIntro) missingParts.push("自我评价或求职意向");
    if (!details.personal) missingParts.push("个人信息（姓名/电话/邮箱）");
    if (!details.education) missingParts.push("教育背景");

    return {
      valid: false,
      reason: `文件内容不像一份简历（匹配度 ${totalScore}%），缺少以下关键信息：${missingParts.join("、")}。请确认上传的是简历 PDF。`,
      score: totalScore,
      details,
    };
  }

  // 低分警告（40-50分）
  if (totalScore < 50) {
    return {
      valid: true,
      reason: `简历特征匹配度一般（${totalScore}%），部分关键信息可能缺失，吐槽结果可能不够全面`,
      score: totalScore,
      details,
    };
  }

  return {
    valid: true,
    score: totalScore,
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