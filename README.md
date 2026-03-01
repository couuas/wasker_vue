# wasker_vue

**wasker_vue** is a premium, markdown-driven portfolio template built with **Vue 3** and **Vite**. Designed for creative professionals, it combines the simplicity of Markdown content with the performance and elegance of a modern SPA.

## 🚀 Features

-   **Knowledge Galaxy (LAB)**: Immersive 3D knowledge graph visualization of your articles and their connections, built with **Three.js**.
-   **Markdown-Driven CMS**: Manage your Blog, Portfolio, Friend Links, and Profile entirely via `.md` files. No database required.
-   **Dynamic Routing**: Automatically generates routes for blog posts and portfolio items.
-   **Smooth Animations**: Integrated **GSAP** transition effects, scroll animations, and typewriter effects.
-   **Smart Layout**:
    -   **Dynamic Right Bar**: Profile information loaded from `src/content/profile/profile.md`.
    -   **Responsive Sidebar**: Mobile-friendly navigation with a unified 1200px breakpoint.
    -   **Transition Overlaps**: Smooth cross-fading page transitions.
-   **Categorization**: Automatic category detection based on folder structure.
-   **RSS Feed**: Optimized RSS generation for **GitHub Pages** (couuas.github.io) with XML compliance.
-   **Developer Experience**: Fast HMR with Vite, scoped CSS, and modular component design.

## 🛠️ Tech Stack

-   **Framework**: [Vue 3](https://vuejs.org/) (Script Setup)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **State Management**: [Pinia](https://pinia.vuejs.org/)
-   **Styling**: Custom CSS variables, FontAwesome, Bootstrap Grid System.
-   **Animation**: [GSAP](https://greensock.com/gsap/)
-   **3D Visualization**: [Three.js](https://threejs.org/) & [3d-force-graph](https://github.com/vasturiano/3d-force-graph)
-   **Markdown**: `markdown-it`, `front-matter`, `highlight.js`.

## 📦 Getting Started

### Prerequisites
-   Node.js (v16.0.0 or higher)

### Installation

```bash
# Clone the repository with submodules
git clone --recurse-submodules https://github.com/couuas/wasker_vue.git

# Or if already cloned, initialize the submodule
git submodule update --init --recursive

# Install dependencies
npm install
```

> **Important**: The `src/content` directory is a git submodule. You must initialize it before building or running the development server.

### Development

```bash
# Start local development server
npm run dev
```

### Production Build

```bash
# Build for production
# Includes Knowledge Graph and RSS generation
npm run build
```

### Vite 静态站点优化建议（已落地）

- **需要改进点**：`rollup-plugin-visualizer` 报告文件默认会写入 `dist/stats.html`，会进入部署产物，增加静态资源体积且无线上运行价值。
- **实现方案**：仅在显式分析时生成报告。日常构建不输出 `stats.html`，需要分析时使用：

```bash
BUNDLE_ANALYZE=true npm run build
```

## 📂 Content Management

All content lives in the `src/content/` directory (managed as a **git submodule** from [wasker_content](https://github.com/couuas/wasker_content)).

> **Note**: The content is stored in a separate repository as a submodule. Make sure to initialize it with `git submodule update --init --recursive` before development.

### 1. **Profile Configuration**
Edit `src/content/profile/profile.md` to update your personal info without touching Vue code.
-   **Frontmatter**: Name, Roles, Social Links, Services, Skills, Education, Work History.
-   **Body**: "About Me" text.

### 2. **Blog Posts**
Create a markdown file in `src/content/blog/[CategoryName]/`.
-   **Folder Name**: Becomes the category (e.g., `src/content/blog/Code/` -> Category: "Code").
-   **Frontmatter**:
    ```yaml
    ---
    title: "My Post Title"
    image: "/assets/img/post-1.jpg"
    date: "2024-12-18"
    description: "Short summary..."
    ---
    ```

### 3. **Portfolio Items**
Create a markdown file in `src/content/portfolio/[CategoryName]/`.
-   Similar structure to Blog. The folder name defines the filter category.

### 4. **Friend Links**
Add link cards in `src/content/friend/`.
-   **Frontmatter**:
    ```yaml
    ---
    shortname: "Vue.js"
    description: "The Progressive JavaScript Framework"
    image: "/assets/img/vue.png"
    url: "https://vuejs.org"
    ---
    ```

### 5. **Knowledge Galaxy (Automatic)**
The galaxy graph is automatically generated based on your markdown content and internal links.
-   **Internal Links**: Use `[[PostTitle]]` or `[Label](/blog/PostSlug)` syntax in your markdown to create connections (edges) in the 3D graph.
-   **Generation**: The `scripts/generate-graph.js` logic handles link flattening and node weight calculation during the build process.
-   **Interactive UI**: Includes "Tap-to-Fly" camera, intelligent detail panels, and related entry navigation.

## 🎨 Customization

-   **Styles**: Global styles are in `src/assets/css/style.css`.
-   **Layout**: `src/layouts/MainLayout.vue` handles the sidebar, rightbar, and page transitions.
-   **Animation**: Scroll animations are managed in `src/composables/useScrollAnimations.js`.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
