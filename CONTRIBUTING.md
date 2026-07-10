# 贡献指南

感谢你考虑为 Resume Roaster 做出贡献！

## 如何贡献

### 报告 Bug

1. 在 [Issues](https://github.com/6xbk6/resume-roaster/issues) 中搜索是否已有相同问题
2. 如果没有，创建一个新 Issue，包含：
   - 问题的详细描述
   - 复现步骤
   - 期望行为 vs 实际行为
   - 截图（如适用）
   - 环境信息（浏览器、操作系统等）

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feature/amazing-feature`
3. 提交你的更改：`git commit -m 'feat: 添加某个功能'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 创建一个 Pull Request

### 提交信息规范

使用约定式提交格式：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具链

### 代码风格

- 使用 TypeScript 严格模式
- 使用 ESLint 检查代码
- 保持组件简洁，单个组件不超过 200 行
- 优先使用 Tailwind CSS 类名而非内联样式
- 新功能需同步更新类型定义

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/6xbk6/resume-roaster.git
cd resume-roaster

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API Key

# 启动开发服务器
npm run dev
```

### Pull Request 检查清单

- [ ] 代码通过 TypeScript 类型检查（`npx tsc --noEmit`）
- [ ] 代码通过 ESLint（`npm run lint`）
- [ ] 新功能有适当的类型定义
- [ ] 没有引入新的 console.log（服务端日志除外）
- [ ] 没有包含敏感信息（API Key 等）