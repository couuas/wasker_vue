---
title: "Wasker Vue Site"
date: "2025-12-25"
client: "Open Source"
description: "融合 3D 星系交互与 AI 增强体验，具备全球感知优选能力的 Vue 3 终极个人站。"
---

# 📂 项目来源（背景）

> 从 [waker_static_template](./wasker_tempalte.md) 纯静态模板到 [wasker_vue_template](./wasker_tempalte.md) Vue 3 驱动模板，我希望在该基础上构建一个现代化的个人站点，开发重心从页面展示向**内容驱动**进行衔接，转向知识库的搭建及应用。

🔗 **演示站点**：[couuas.pp.ua](https://couuas.pp.ua)

---

# 🛠️ 功能清单（展示）

这是 `wasker` 的**终极实战版本**，在 **Vue 3** 架构基础上深度集成了 **3D 交互视觉**、**AI 智能增强** 以及 **全自动化多平台分发与路由优选** 系统。

### 💻 技术栈
`Vue 3`, `Vite`, `Three.js`, `3D-Force-Graph`, `Telegram Proxy`, `Cloudflare Workers & Pages`, `Vercel`, `GitHub Actions`

### 🚀 核心功能
*   **✨ 3D 交互星系 (Galaxy System)**: 采用 `Three.js` 与 `3d-force-graph` 构建动态数据星系，支持节点交互与 `GalaxyBottomSheet` 响应式面板。
*   **🌍 自动化多站并行部署 (Multi-Platform Deploy)**:
    *   **单一构建源**: 使用 `GitHub Actions` 统一执行 CI/CD。
    *   **全球三中心分发**: 自动同步至 **Cloudflare Pages**、**Vercel Edge** 和 **GitHub Pages**，消除单点故障。
*   **⚡ 智能优选网关 (Smart Gateway)**: 基于 `gateway.js` (Cloudflare Worker) 实现。进入主站时并发探测各节点延迟，自动路由至最优线路。
*   **🤖 集成 AI 助手 (TheAiAssistant)**: 内置专门的 AI 助手组件，提供实时的智能引导与交互问答能力。
*   **🛡️ 安全通信代理**: 通过 `Cloudflare Workers` 代理后端请求，实现前端零密钥暴露的安全消息推送（如 Telegram 表单）。
*   **📄 媒体与自动化增强**: 内置 PDF 在线预览 (`vue-pdf-embed`)，支持构建时自动生成 RSS 订阅源与关联图谱。

---

# 📈 发展路径（复盘）

*(暂无详细复盘内容)*

---

# 🚀 未来规划（展望）

> [!TIP]
> 正在探索更深层次的 **AI Agent** 集成与个人知识库的自动化同步方案，敬请期待。
