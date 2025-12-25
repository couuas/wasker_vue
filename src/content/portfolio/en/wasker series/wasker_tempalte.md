---
title: "Wasker Template Theme"
date: "2025-12-25"
client: "Archived"
description: "A minimalist, high-performance, and beautifully designed Vue 3 portfolio and blog theme."
---

# 📂 Project Background

> **wasker** was originally a free pure HTML static site, which was difficult to extend. Therefore, I refactored it into the **vue_template** project, aiming to leverage **Vue 3** features and the **Vite** build tool. This created a highly customizable Markdown-based frontend project that supports one-click deployment via **GitHub Actions**.

🔗 **Open Source**: [github.com/couuas/wasker](https://github.com/couuas/wasker/)

---

# 🛠️ Feature List

## 1️⃣ wasker_static_template (Vanilla Static Template)
> A portfolio template built with native **HTML/JS**, designed to provide a smooth Single Page Application (SPA) experience without the complexity of heavy frameworks.

*   **Tech Stack**: `HTML5`, `CSS3`, `JavaScript (ES6)`, `Bootstrap Grid` (Grid only), `GSAP`, `Swup.js`, `Swiper.js`, `Isotope`, `Fancybox`.
*   **Core Features**:
    *   **SPA Experience**: Uses `Swup.js` for seamless navigation without full page reloads.
    *   **High-Performance Animation**: Integrated `GSAP` and `ScrollTrigger` for entrance animations, parallax effects, and smooth transitions.
    *   **Responsive Layout**: Built on `Bootstrap Grid`, fully optimized for mobile, tablet, and desktop.
    *   **Portfolio Filtering**: Integrated `Isotope` for dynamic category filtering and masonry layouts.
    *   **Lightbox Gallery**: Integrated `Fancybox` for immersive image and video previews.
    *   **Touch Slider**: Uses `Swiper.js` for smooth service cards or testimonials.
    *   **Pure Dark Mode**: Pre-configured professional dark UI for a premium visual experience.
    *   **Smooth Scrolling**: Optimized internal anchor jumps via `smooth-scroll.js`.

---

## 2️⃣ wasker_vue_template (Vue 3 Driven Template)
> The advanced version of `wasker`, refactored with **Vue 3 + Vite**, introducing a modern development architecture and content management solution.

*   **Tech Stack**: `Vue 3 (Composition API)`, `Vite`, `Pinia`, `GSAP`, `Markdown-it`, `Highlight.js`.
*   **Core Features**:
    *   **Markdown-Driven Content (CMS)**:
        *   **Database-Free Management**: Blogs, portfolios, links, and profiles are driven entirely by `.md` files.
        *   **Auto-Routing**: Routes are automatically generated based on the `src/content/` directory structure.
    *   **Efficient State Management**: Uses `Pinia` to manage global state (e.g., sidebar, data loading).
    *   **Enhanced Animation**:
        *   Integrated `GSAP` for natural page transitions.
        *   Supports typewriter effects and delicate component entrance animations.
    *   **Smart Layout System**:
        *   **Dynamic Sidebar**: Personal information is rendered dynamically from the `profile.md` Frontmatter.
        *   **Responsive Sidebar**: Deeply optimized mobile navigation.
    *   **Auto-Categorization**: Blogs and projects are automatically tagged based on their physical folder structure.
    *   **RSS Support**: Built-in script to generate `rss.xml` automatically during the build process.
    *   **Modern Dev Experience**: Benefits from `Vite`'s Instant Hot Module Replacement (HMR) and modular component development.

---

# 📈 Progress Recap

*(No detailed recap available yet)*

---

# 🚀 Future Roadmap

> [!NOTE]
> This version is archived. For future development and feature evolutions, please follow **[wasker_vue](./wasker_vue.md)**.
