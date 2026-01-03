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
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'three';
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
              return 'pdf';
            }
            if (id.includes('swiper')) {
              return 'swiper';
            }
            // D3 is used by 3d-force-graph
            if (id.includes('d3-')) {
              return 'd3';
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
