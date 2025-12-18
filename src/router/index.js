import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Portfolio from '../views/Portfolio.vue'
import PortfolioDetail from '../views/PortfolioDetail.vue'
import Blog from '../views/Blog.vue'
import Contact from '../views/Contact.vue'
import Friends from '../views/Friends.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: { bodyClass: 'mil-fw-page' }
        },
        {
            path: '/portfolio',
            name: 'portfolio',
            component: Portfolio,
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/portfolio/:id',
            name: 'portfolio-detail',
            component: PortfolioDetail,
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/blog',
            name: 'blog',
            component: Blog,
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/friends',
            name: 'friends',
            component: Friends,
            meta: { bodyClass: 'mil-half-page' }
        },
        {
            path: '/blog/:id',
            name: 'blog-detail',
            component: () => import('../views/BlogDetail.vue'),
            meta: { bodyClass: 'mil-fw-page' }
        },
        {
            path: '/contact',
            name: 'contact',
            component: Contact,
            meta: { bodyClass: 'mil-half-page' }
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 }
    }
})

// Set body class based on route meta
// Removed: Handling this in MainLayout to sync// Set body class based on route meta
router.beforeEach((to, from, next) => {
    // Body class handling is primarily done in MainLayout.vue transition hooks
    // to ensure smooth transitions. We only set it here if needed for initial load or as fallback.
    next()
})

export default router
