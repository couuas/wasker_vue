import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    visualizer({ filename: 'dist/stats.html' }),

    // pursecss removed for now to ensure build stability with Vite 7
    // imagemin configuration
    // Note: vite-plugin-imagemin might require binary downloads which can fail. 
    // If it fails, we might need to remove it or use a different strategy.
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'mermaid': 'mermaid/dist/mermaid.esm.mjs'
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Isolate heavy libraries from node_modules
          if (id.includes('node_modules')) {
            if (id.includes('3d-force-graph') || id.includes('force-graph') || id.includes('three')) {
              return 'three-libs';
            }
            if (id.includes('mermaid')) {
              return 'mermaid';
            }
            if (id.includes('gsap')) {
              return 'gsap';
            }
            if (id.includes('@fancyapps')) {
              return 'fancyapps';
            }
            if (id.includes('highlight.js')) {
              return 'highlight';
            }
            if (id.includes('markdown-it')) {
              return 'markdown';
            }
            if (id.includes('pdf')) { // vue-pdf-embed
              return 'pdf-libs';
            }
            if (id.includes('swiper')) {
              return 'swiper';
            }
            if (id.includes('d3-')) {
              return 'd3';
            }
          }

          // Group common list views into one chunk to optimize navigation speed 
          // while keeping detail pages dynamic.
          if (id.includes('src/views/')) {
            if (
              id.endsWith('Blog.vue') ||
              id.endsWith('Portfolio.vue') ||
              id.endsWith('Journal.vue') ||
              id.endsWith('Contact.vue') ||
              id.endsWith('Friends.vue')
            ) {
              return 'views-common';
            }
          }
        }
      }
    },
    // Enable source maps for easier debugging if needed, or disable for smaller build
    sourcemap: false,
    // Ensure smaller assets are inlined
    assetsInlineLimit: 4096,
  }
})
