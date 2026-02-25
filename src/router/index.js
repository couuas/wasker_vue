import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '../stores/app'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/Home.vue'),
            meta: { bodyClass: 'mil-fw-page' }
        },
        {
            path: '/portfolio',
            name: 'portfolio',
            component: () => import('../views/Portfolio.vue'),
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/portfolio/:id',
            name: 'portfolio-detail',
            component: () => import('../views/PortfolioDetail.vue'),
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/blog',
            name: 'blog',
            component: () => import('../views/Blog.vue'),
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/blog/:id',
            name: 'blog-detail',
            component: () => import('../views/BlogDetail.vue'),
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/journal',
            name: 'journal',
            component: () => import('../views/Journal.vue'),
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/journal/:id',
            name: 'journal-detail',
            component: () => import('../views/JournalDetail.vue'),
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/contact',
            name: 'contact',
            component: () => import('../views/Contact.vue'),
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/galaxy',
            name: 'galaxy',
            component: () => import('../views/GalaxyPage.vue'),
            meta: { bodyClass: 'mil-fw-page' }
        },
        {
            path: '/presentation/:id',
            name: 'presentation',
            component: () => import('../views/PresentationPage.vue'),
            meta: { bodyClass: 'mil-fw-page' }
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 }
    }
})

// Set body class based on route meta
router.beforeEach((to, from, next) => {
    const appStore = useAppStore()

    // Only show transition loader if it's an internal navigation (not first load/refresh)
    if (from.name && to.path !== from.path) {
        appStore.setTransitioning(true)
    }

    next()
})

router.afterEach((to) => {
    // Ensure body class is synced even if transition hooks delay (as a safety fallback)
    if (to.meta.bodyClass) {
        // We don't apply it here because MainLayout does it in onLeave for sync,
        // but we could set a flag if needed.
    }
})

export default router
