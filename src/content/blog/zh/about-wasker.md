---
title: "关于 Wasker Vue"
date: "2025-12-25"
image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
category: "Project"
description: "回望 Wasker 体系从静态模板到 3D + AI 实战版的演进之路，见证个人站点的技术迭代。"
---

# 📜 关于 Wasker 发展历程

> 这是一个关于自我迭代与技术进阶的故事。[Wasker](../../portfolio/zh/wasker%20series/wasker_tempalte.md) 从最初的纯 HTML 静态页，逐步演进为一套集成了 3D 视觉、AI 交互与全球分发网关的现代化内容管理系统。

---

## 1️⃣ wasker_static_template (原生静态模板)
> **起步**：回归 Web 开发的本质，追求极致的加载速度与纯粹的交互体验。

🔗 **开源地址**：[github.com/couuas/wasker](https://github.com/couuas/wasker)

*   **技术栈**: `HTML5`, `CSS3`, `JavaScript (ES6)`, `Bootstrap Grid`, `GSAP`, `Swup.js`, `Swiper.js`, `Isotope`, `Fancybox`。
*   **核心功能**:
    *   **无刷新页面跳转**: 使用 `Swup.js` 实现逻辑上的单页导航，流畅自然。
    *   **高性能动画**: 集成 `GSAP` 和 `ScrollTrigger` 实现细腻的视差滚动与入场特效。
    *   **响应式布局**: 基于 `Bootstrap Grid` 网格系统适配全平台设备。
    *   **灯箱画廊**: 集成 `Fancybox`，用于媒体内容的沉浸式预览。

---

## 2️⃣ wasker_vue_template (Vue 3 驱动模板)
> **进阶**：从“写页面”向“写应用”转变，引入组件化开发与 Markdown 内容驱动（CMS）思想。

🔗 **开源地址**：[github.com/couuas/wasker](https://github.com/couuas/wasker/tree/main/wasker_vue_template)

*   **技术栈**: `Vue 3 (Composition API)`, `Vite`, `Pinia`, `GSAP`, `Markdown-it`, `Highlight.js`。
*   **核心功能**:
    *   **Markdown 内容驱动 (CMS)**: 博客、作品集和简历完全由 `.md` 文件驱动，实现真正的免数据库管理。
    *   **自动化路由**: 根据 `src/content/` 目录结构自动分析并生成页面路由。
    *   **高效状态管理**: 使用 `Pinia` 统一管理应用全局状态，架构更清晰。
    *   **智能化布局**: 个人基本信息直接从 `profile.md` 的 Frontmatter 中动态注入渲染。

---

## 3️⃣ wasker_vue (进阶 3D + AI + 全球分发版)
> **突破**：当前的终极实战版本。不仅是展示，更是对 3D 交互、智能助手与 DevOps 架构的深度探索。

🔗 **演示地址**：[couuas.pp.ua](https://couuas.pp.ua)

*   **技术栈**: `Vue 3`, `Vite`, `Three.js`, `3D-Force-Graph`, `Telegram Proxy`, `Cloudflare Workers & Pages`, `Vercel`, `GitHub Actions`。
*   **核心核心功能**:
    *   **✨ 3D 交互星系 (Galaxy System)**: 采用 `Three.js` 构建动态数据星系，通过 `3D-Force-Graph` 实现内容的视觉化关联索引。
    *   **🌍 全球多站分发系统**: 
        *   **单一构建源**: `GitHub Actions` 统一构建。
        *   **三中心分发**: 同步至 **Cloudflare**, **Vercel** 和 **GitHub**，通过 `gateway.js` 实现全球最优路径自动接入。
    *   **🤖 集成 AI 助手**: 内置 `TheAiAssistant` 组件，通过 AI 增强访客的交互式浏览体验。
    *   **🛡️ 安全通信架构**: 所有的后端推送逻辑均通过 `Cloudflare Workers` 代理，确保前端环境零密钥泄露。
    *   **📄 自动化工作流**: 构建过程中自动生成 RSS 订阅源与知识库图谱数据，实现全链路自动化。
