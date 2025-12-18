# wasker_vue

**wasker_vue** is a premium, markdown-driven portfolio template built with **Vue 3** and **Vite**. Designed for creative professionals, it combines the simplicity of Markdown content with the performance and elegance of a modern SPA.

## 🚀 Features

-   **Markdown-Driven CMS**: Manage your Blog, Portfolio, Friend Links, and Profile entirely via `.md` files. No database required.
-   **Dynamic Routing**: Automatically generates routes for blog posts and portfolio items.
-   **Smooth Animations**: Integrated **GSAP** transition effects, scroll animations, and typewriter effects.
-   **Smart Layout**:
    -   **Dynamic Right Bar**: Profile information loaded from `src/content/profile/profile.md`.
    -   **Responsive Sidebar**: Mobile-friendly navigation.
    -   **Transition Overlaps**: Smooth cross-fading page transitions.
-   **Categorization**: Automatic category detection based on folder structure.
-   **RSS Feed**: Built-in script to generate `rss.xml` for blog posts.
-   **Developer Experience**: Fast HMR with Vite, scoped CSS, and modular component design.

## 🛠️ Tech Stack

-   **Framework**: [Vue 3](https://vuejs.org/) (Script Setup)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **State Management**: [Pinia](https://pinia.vuejs.org/)
-   **Styling**: Custom CSS variables, FontAwesome, Bootstrap Grid System.
-   **Animation**: [GSAP](https://greensock.com/gsap/)
-   **Markdown**: `markdown-it`, `front-matter`, `highlight.js`.

## 📦 Getting Started

### Prerequisites
-   Node.js (v16.0.0 or higher)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start local development server
npm run dev
```

### Production Build

```bash
# Build for production (includes RSS generation)
npm run build
```

## 📂 Content Management

All content lives in the `src/content/` directory.

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

## 🎨 Customization

-   **Styles**: Global styles are in `src/assets/css/style.css`.
-   **Layout**: `src/layouts/MainLayout.vue` handles the sidebar, rightbar, and page transitions.
-   **Animation**: Scroll animations are managed in `src/composables/useScrollAnimations.js`.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
