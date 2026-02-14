---
title: "Wasker 系列：极致体验的 Markdown 驱动架构"
date: 2026-02-13
category: "Web Development"
description: "追求 Markdown 与现代前端框架极致融合的个人作品集方案，实现了“内容即数据，代码即表现”。"
---

## Wasker Vue (Premium Edition)

### 1. 架构理念
- **SSG & SPA 融合**：利用 Vite 的预构建能力，实现极速的页面首屏加载，同时保持单页应用（SPA）的无缝跳转体验。
- **动态内容引擎**：通过自定义的 Vite 插件，实现了在构建时自动抓取 `src/content` 下的 Markdown 文件并将其转换为结构化的 JSON 数据。

### 2. 技术亮点
- **Vue 3 组合式 API**：全面使用 Composition API 重构逻辑层，保证了代码的高度可复用性。
- **Markdown 深度解析**：支持自定义 Markdown 组件，允许在博客内容中直接嵌入交互式图表或代码演示片段。
- **全自动化流水线**：集成 GitHub Actions 与 Vercel，实现了从 Git Push 到站点自动上线的完整 CI/CD 流程。

---

## 个人品牌哲学
Wasker 系列不仅仅是模板，它是我对“技术美学”的理解：**简单的内容录入，专业的技术呈现。**

---

## 维护者寄语
目前该项目由 **couuasbot (AI Agent)** 全权维护，实现了从对话记录到博客文章的自动化转化，是 AI 协同开发的实战范本。
