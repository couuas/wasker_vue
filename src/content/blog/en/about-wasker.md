---
title: "About Wasker Vue"
date: "2025-12-25"
image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
category: "Project"
description: "Exploring the evolution of the Wasker ecosystem from static templates to the 3D + AI production version."
---

# 📜 The Evolution of Wasker

> This is a story of self-iteration and technical advancement. [Wasker](../../portfolio/en/wasker%20series/wasker_tempalte.md) has evolved from a simple HTML static page into a modern Content Management System integrated with 3D visuals, AI interaction, and a global distribution gateway.

---

## 1️⃣ wasker_static_template (Vanilla Static Template)
> **The Start**: Returning to the essence of web development, pursuing ultimate loading speed and pure interactive experiences.

🔗 **Open Source**: [github.com/couuas/wasker](https://github.com/couuas/wasker)

*   **Tech Stack**: `HTML5`, `CSS3`, `JavaScript (ES6)`, `Bootstrap Grid`, `GSAP`, `Swup.js`, `Swiper.js`, `Isotope`, `Fancybox`.
*   **Core Features**:
    *   **Seamless Navigation**: Uses `Swup.js` for logical single-page navigation, smooth and natural.
    *   **High-Performance Animation**: Integrated `GSAP` and `ScrollTrigger` for delicate parallax scrolling and entrance effects.
    *   **Responsive Layout**: Based on the `Bootstrap Grid` system, optimized for all devices.
    *   **Lightbox Gallery**: Integrated `Fancybox` for immersive previews of media content.

---

## 2️⃣ wasker_vue_template (Vue 3 Driven Template)
> **The Advancement**: Transitioning from "writing pages" to "building applications," introducing component-based development and Markdown-driven (CMS) philosophy.

🔗 **Open Source**: [github.com/couuas/wasker](https://github.com/couuas/wasker/tree/main/wasker_vue_template)

*   **Tech Stack**: `Vue 3 (Composition API)`, `Vite`, `Pinia`, `GSAP`, `Markdown-it`, `Highlight.js`.
*   **Core Features**:
    *   **Markdown-Driven Content (CMS)**: Blogs, portfolios, and resumes are driven entirely by `.md` files, achieving true database-free management.
    *   **Auto-Routing**: Automatically analyzes and generates page routes based on the `src/content/` directory structure.
    *   **Efficient State Management**: Uses `Pinia` to manage global application state, resulting in a cleaner architecture.
    *   **Smart Layout**: Basic personal information is dynamically injected and rendered from the `profile.md` Frontmatter.

---

## 3️⃣ wasker_vue (3D + AI + Global Distribution Edition)
> **The Breakthrough**: The current ultimate production version. More than just a showcase, it's a deep exploration of 3D interaction, AI assistants, and DevOps architecture.

🔗 **Demo Site**: [couuas.pp.ua](https://couuas.pp.ua)

*   **Tech Stack**: `Vue 3`, `Vite`, `Three.js`, `3D-Force-Graph`, `Telegram Proxy`, `Cloudflare Workers & Pages`, `Vercel`, `GitHub Actions`.
*   **Core Features**:
    *   **✨ 3D Galaxy System**: Built with `Three.js` and `3D-Force-Graph` to create a dynamic data galaxy with visual relationship indexing.
    *   **🌍 Global Multi-Site Distribution**: 
        *   **Single Build Source**: Unified build via `GitHub Actions`.
        *   **Tri-Center Distribution**: Synchronized to **Cloudflare**, **Vercel**, and **GitHub**, with automatic optimal path selection via `gateway.js`.
    *   **🤖 Integrated AI Assistant**: Built-in `TheAiAssistant` component to enhance the visitor's interactive browsing experience.
    *   **🛡️ Secure Communication Architecture**: All backend push logic is proxied through `Cloudflare Workers`, ensuring zero secret exposure in frontend environments.
    *   **📄 Automated Workflow**: Automatically generates RSS feeds and knowledge base graph data during the build process for a fully automated pipeline.
