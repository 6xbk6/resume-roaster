# 🔥 Resume Roaster — AI 简历吐槽器

> 上传你的 PDF 简历，让 AI 用最毒舌的方式告诉你哪里有问题，每条吐槽附带专业改进建议。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)

![Demo](docs/demo.gif)

## ✨ 功能

- 📄 **PDF 简历上传** — 拖拽或点击上传，支持文字型 PDF 解析
- 🛡️ **智能简历识别** — 两级反模式 + 加权评分，准确拦截非简历文档（学籍报告、成绩单、录取通知书等）
- 🤖 **AI 多风格吐槽** — 4 种风格：毒舌、凡尔赛、职场老油条、可爱模式
- 📊 **专业评分体系** — 四维度量化评分（格式排版 + 内容质量 + 措辞表达 + 整体印象）
- 📝 **具体改进建议** — 每条吐槽引用原文 + 改进前后对比，直击痛点
- 🔗 **一键分享** — 复制链接或文案，分享到社交媒体
- 📋 **历史记录** — 自动保存吐槽记录，支持删除
- 🎨 **3D 视觉效果** — 粒子背景、3D 卡片倾斜、光标光晕
- 🐳 **Docker 支持** — 开箱即用的 Docker 部署

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| 动画 | Framer Motion |
| AI | DeepSeek API (OpenAI 兼容) |
| PDF 解析 | pdf-parse |
| 文件上传 | react-dropzone |
| 图标 | Lucide React |
| 通知 | Sonner |

## 🚀 快速开始

### 前提条件

- Node.js >= 18
- DeepSeek API Key（[免费获取](https://platform.deepseek.com/api_keys)）

### 安装

```bash
git clone https://github.com/6xbk6/resume-roaster.git
cd resume-roaster
npm install
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API Key：

```env
AI_API_KEY=sk-your-deepseek-api-key
AI_BASE_URL=https://api.deepseek.com
```

> 未配置 API Key 时会使用 Mock 模式，可体验界面但不会调用真实 AI。

### 启动

```bash
npm run dev
```

打开 http://localhost:3000

## 🐳 Docker 部署

```bash
docker build -t resume-roaster .
docker run -d -p 3000:3000 \
  -e AI_API_KEY=sk-your-key \
  -e AI_BASE_URL=https://api.deepseek.com \
  -v $(pwd)/.data:/app/.data \
  --name resume-roaster \
  resume-roaster
```

## 📁 项目结构

```
resume-roaster/
├── app/
│   ├── api/upload/        # 文件上传接口
│   ├── api/roasts/        # 吐槽 CRUD 接口
│   ├── roasts/[id]/        # 吐槽结果页
│   ├── dashboard/           # 历史记录页
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/
│   ├── effects/            # 粒子背景、光晕、3D 卡片
│   ├── layout/             # Header、Footer
│   ├── roast/              # 吐槽卡片、列表、分享
│   └── upload/             # 上传区、风格选择、进度
├── lib/
│   ├── ai/                 # AI 调用 + Prompt 工程
│   ├── pdf/                # PDF 解析 + 简历识别
│   ├── history.ts          # 历史记录管理
│   ├── store.ts            # 文件存储
│   └── utils.ts            # 工具函数
├── types/                  # 类型定义
├── .env.example            # 环境变量模板
├── Dockerfile
└── railway.json
```

## 📄 简历识别机制

三重防线确保只处理真正的简历：

1. **强反模式** — 43 条规则，命中 1 条即拒（录取通知书、成绩单、毕业证书、劳动合同等）
2. **弱反模式** — 35 条规则，命中 2 条即拒（学号、学分、绩点、公章等）
3. **加权评分** — 5 维度加权（工作经历 30 分 + 技能 20 分 + 自我评价 20 分 + 教育 15 分 + 个人信息 15 分），总分 >= 40 才通过

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📜 许可证

[MIT](LICENSE)