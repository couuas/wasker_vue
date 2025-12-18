import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Import Global Styles
import './assets/css/plugins/bootstrap-grid.css'
import './assets/css/plugins/swiper.css' // Or use swiper/css if using swiper components
import './assets/css/plugins/fontawesome.css'
import './assets/css/plugins/fancybox.css'
import './assets/css/style.css'

// Create App
const app = createApp(App)

app.use(createPinia())
app.use(router)

router.isReady().then(() => {
    app.mount('#app')
})
