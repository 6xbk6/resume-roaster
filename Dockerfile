# ---- 构建阶段 ----
FROM node:20-alpine AS builder
WORKDIR /app

# 启用 pnpm
RUN corepack enable

# 安装构建依赖
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建生产版本
RUN pnpm run build

# ---- 运行阶段 ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# 复制 standalone 输出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 创建持久化数据目录
RUN mkdir -p .data && chown -R nextjs:nodejs .data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]