<script setup>
import { computed, onMounted, onUpdated, nextTick, ref, shallowRef } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
// import md from '@/utils/markdown'
const md = shallowRef(null)
import { defineAsyncComponent } from 'vue'
// Lazy-load SimplePdfViewer to reduce initial bundle size
const SimplePdfViewer = defineAsyncComponent(() =>
  import('@/components/SimplePdfViewer.vue')
)
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
// Dynamic import of mermaid
let mermaid;

import ToastNotification from '@/components/ToastNotification.vue'

const initMarkdown = async () => {
    if (!md.value) {
        const m = await import('@/utils/markdown');
        md.value = m.default;
    }
}

const initMermaid = async () => {
    try {
        if (!mermaid) {
            const m = await import('mermaid');
            mermaid = m.default;
            mermaid.initialize({
                startOnLoad: false,
                theme: 'base',
                themeVariables: {
                    darkMode: true,
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: '14px',
                    // Node Styling
                    primaryColor: '#FFFFFF',
                    primaryTextColor: '#121212',
                    primaryBorderColor: '#DBA91C',
                    nodeBorder: '#DBA91C',
                    mainBkg: '#FFFFFF',
                    rectRadius: '8',
                    // Edge / Line Styling
                    lineColor: '#DBA91C',
                    defaultLinkColor: '#DBA91C',
                    // Edge Label Styling
                    edgeLabelBackground: '#DBA91C',
                    labelTextColor: '#121212',
                    // Cluster / Group Styling
                    clusterBkg: 'rgba(255, 255, 255, 0.05)',
                    clusterBorder: '#444444',
                    // Secondary / Tertiary
                    secondaryColor: '#DBA91C',
                    tertiaryColor: '#1A1A1A',
                    // Other
                    titleColor: '#E0E0E0',
                },
                flowchart: {
                    htmlLabels: true,
                    curve: 'basis',
                },
                securityLevel: 'loose',
            });
        }
        await mermaid.run();
    } catch (e) {
        console.warn('[Mermaid] Init failed:', e);
    }
};


const route = useRoute()
const router = useRouter()
const { posts, getAdjacentPosts } = useMarkdown()
const appStore = useAppStore()
const { currentLang } = storeToRefs(appStore)

const slug = computed(() => route.params.id)

const work = computed(() => {
    return posts.value.find(p => p.slug === slug.value && p.type === 'portfolio' && p.lang === currentLang.value);
});

const adjacentPosts = getAdjacentPosts(slug.value, 'portfolio', currentLang.value)

const hasEn = computed(() => posts.value.some(p => p.slug === slug.value && p.type === 'portfolio' && p.lang === 'en'));
const hasZh = computed(() => posts.value.some(p => p.slug === slug.value && p.type === 'portfolio' && p.lang === 'zh'));

const switchLang = (lang) => {
    if (lang === 'zh' && hasZh.value) appStore.setLang('zh');
    if (lang === 'en' && hasEn.value) appStore.setLang('en');
}

const toggleLang = () => {
    if (currentLang.value === 'zh' && hasEn.value) appStore.setLang('en');
    else if (currentLang.value === 'en' && hasZh.value) appStore.setLang('zh');
}

const renderedBody = computed(() => {
    return (work.value && md.value) ? md.value.render(work.value.body) : ''
})

const formattedDate = computed(() => {
    if (!work.value || !work.value.date) return '';
    const d = new Date(work.value.date);
    return isNaN(d.getTime()) 
        ? work.value.date 
        : d.toLocaleDateString(currentLang.value === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
});

// TOC Extraction
const toc = computed(() => {
    if (!work.value) return [];
    
    const headings = [];
    const lines = work.value.body.split('\n');
    
    lines.forEach(line => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2].trim();
            const slug = title.toLowerCase()
                .trim()
                .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            
            headings.push({ level, title, slug });
        }
    });
    
    return headings;
});

const isToeOpen = ref(false); // Legacy ref name - kept for compatibility
const isTocOpen = ref(false);
const isActionMenuOpen = ref(false);

const toggleToc = () => {
    isTocOpen.value = !isTocOpen.value;
    if (isTocOpen.value) isActionMenuOpen.value = false;
};

const toggleActionMenu = () => {
    isActionMenuOpen.value = !isActionMenuOpen.value;
    if (isActionMenuOpen.value) isTocOpen.value = false;
};

const scrollToSection = (slug) => {
    const el = document.getElementById(slug);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        isTocOpen.value = false;
    }
};

const isFullScreen = ref(false)

const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value
    if (isFullScreen.value) {
        document.body.classList.remove('mil-half-page')
        document.body.classList.add('mil-fw-page')
    } else {
        document.body.classList.remove('mil-fw-page')
        document.body.classList.add('mil-half-page')
    }
}

// Share Logic
const copied = ref(false)
const toastRef = ref(null)

const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    copied.value = true
    if (toastRef.value) {
        toastRef.value.show('Link copied to clipboard', 'success')
    }
    setTimeout(() => { copied.value = false }, 2000)
}

// Intercept clicks on rendered markdown
const handleLinkClick = (event) => {
    const link = event.target.closest('a');
    if (link && link.getAttribute('href')) {
        const targetUrl = new URL(link.href);
        const currentOrigin = window.location.origin;

        if (targetUrl.origin === currentOrigin) {
            let path = targetUrl.pathname;
            if (path.endsWith('.md')) {
                event.preventDefault();
                
                const isPortfolio = path.includes('/portfolio/');
                const isBlog = path.includes('/blog/');
                
                const parts = path.split('/');
                const slug = decodeURIComponent(parts.pop().replace('.md', ''));
                
                if (isPortfolio) {
                    path = '/portfolio/' + slug;
                } else if (isBlog) {
                    path = '/blog/' + slug;
                } else {
                    // Fallback to same section
                    path = '/portfolio/' + slug;
                }
                
                router.push(path);
            }
        } else {
            link.target = '_blank';
        }
    }
};

const attachCopyListeners = () => {
    const buttons = document.querySelectorAll('.copy-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const code = decodeURIComponent(btn.getAttribute('data-code'));
            navigator.clipboard.writeText(code).then(() => {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            });
        });
    });
};

onMounted(() => {
   nextTick(() => {
       attachCopyListeners();
       initMarkdown();
       initMermaid();
   });
})


onUpdated(() => {
    nextTick(() => {
        attachCopyListeners();
        initMarkdown();
        initMermaid();
    });
})

</script>

<template>
    <div class="mil-content-frame">
        <ToastNotification ref="toastRef" />
        <div class="mil-scroll mil-half-1 mil-bp-fix-2">
            
            <div class="mil-main-content" v-if="work">
                 <!-- Cover Logic similar to original -->
                 <div class="mil-work-card mil-no-descr mil-mb-15" v-if="work.image">
                    <a :href="work.image" data-fancybox="gallery" data-no-swup>
                        <img :src="work.image" :alt="work.title">
                    </a>
                </div>

                <div class="mil-project-description">
                    <div class="mil-space-90 mil-p-90-75">
                        <div class="row mil-mb-60 mil-up">
                            <div class="col-md-6">
                                <h1 class="mil-mb-30">{{ work.title }}</h1>
                                <!-- Language Switcher -->
                                <div class="mil-lang-switch mil-mb-30">
                                    <span 
                                        class="mil-lang-btn" 
                                        :class="{ 'active': currentLang === 'zh', 'disabled': !hasZh }" 
                                        @click="switchLang('zh')">ZH</span>
                                    <span class="mil-divider">/</span>
                                    <span 
                                        class="mil-lang-btn" 
                                        :class="{ 'active': currentLang === 'en', 'disabled': !hasEn }" 
                                        @click="switchLang('en')">EN</span>
                                </div>
                            </div>
                            <div class="col-md-6 mil-jce mil-m-jcs mil-mb-30">
                                <div class="mil-badge mil-dark mil-mr-5" v-if="work.client">{{ work.client }}</div>
                                <div class="mil-badge">{{ work.category }}</div>
                            </div>
                        </div>

                        <!-- Markdown Content -->
                        <div class="mil-markdown-content mil-mb-60 mil-up" v-html="renderedBody" @click="handleLinkClick"></div>

                        <!-- TOC Menu (Controlled by unified menu) -->
                        <div class="mil-toc-backdrop" :class="{ 'mil-active': isTocOpen }" @click="toggleToc"></div>
                        <div class="mil-toc-wrapper" :class="{ 'mil-toc-active': isTocOpen }" v-if="toc.length > 0">
                            <div class="mil-toc-menu mil-up-instant">
                                <div class="mil-sheet-handle"></div>
                                <div class="mil-toc-header">
                                    <span class="mil-link">Contents</span>
                                    <div class="mil-toc-close" @click="toggleToc"><i class="fas fa-times"></i></div>
                                </div>
                                <ul class="mil-toc-list mil-scroll">
                                    <li v-for="item in toc" :key="item.slug" 
                                        :class="['mil-toc-item', 'mil-level-' + item.level]"
                                        @click="scrollToSection(item.slug)">
                                        <span class="mil-soft">{{ item.title }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="mil-divider mil-mb-60 mil-up"></div>

                        <div class="row">
                            <div class="col-xs-12 col-sm-6 mil-up mil-mb-15" v-if="work.client">
                                <div class="mil-link"><span class="mil-accent">client:</span> {{ work.client }}</div>
                            </div>
                            <div class="col-xs-12 col-sm-6 mil-jce mil-m-jcs mil-up mil-mb-15" v-if="work.date">
                                <div class="mil-link"><span class="mil-accent">date:</span> {{ formattedDate }}</div>
                            </div>
                        </div>
                        
                        <!-- PDF Viewer Section -->
                        <div class="mil-pdf-section mil-mb-60 mil-up" v-if="work.pdf">
                            <div class="mil-divider mil-mb-60"></div>
                            <h3 class="mil-mb-30">Presentation Slides</h3>
                            <SimplePdfViewer :src="work.pdf" />
                        </div>
                    </div>
                </div>
            </div>
             <div v-else class="mil-p-90-75">
                <h1>Project not found</h1>
            </div>
                            <div class="mil-bottom-panel mil-up-instant">
                    <div class="mil-jcc mil-space-15 mil-w-100">
                            <div class="mil-jcb mil-w-100 mil-p-30-0">
                             <!-- Share Button (Far Left) for Symmetry -->
                             <div class="mil-action-trigger mil-icon-btn" @click="copyLink" title="Copy Link" style="margin-right: 20px;">
                                <i :class="['fas', copied ? 'fa-check' : 'fa-share-alt']"></i>
                             </div>

                             <!-- Navigation (Left) -->
                            <div class="mil-prev-nav">
                                 <router-link v-if="adjacentPosts.prev" :to="'/portfolio/' + adjacentPosts.prev.slug" class="mil-link mil-icon-link-left" title="Previous Project">
                                    <i class="fas fa-chevron-left"></i> <span>Previous</span>
                                 </router-link>
                                 <span v-else class="mil-link mil-disabled" style="opacity: 0.5;"><i class="fas fa-chevron-left"></i> <span>Previous</span></span>
                             </div>

                            <!-- Center Group: Back -->
                            <div class="mil-bottom-centered">
                                <router-link to="/portfolio" class="mil-link mil-back-btn">Back to Portfolio</router-link>
                            </div>

                            <!-- Next Post (Right) -->
                            <div class="mil-next-nav">
                                <router-link v-if="adjacentPosts.next" :to="'/portfolio/' + adjacentPosts.next.slug" class="mil-link mil-icon-link" title="Next Project">
                                    <span>Next</span> <i class="fas fa-chevron-right"></i>
                                </router-link>
                                <span v-else class="mil-link mil-disabled" style="opacity: 0.5;"><span>Next</span> <i class="fas fa-chevron-right"></i></span>
                            </div>

                            <!-- Unified Action Menu (Far Right) -->
                            <div class="mil-action-menu-wrapper" :class="{ 'mil-active': isActionMenuOpen }">
                                <div class="mil-action-list">
                                    <!-- TOC Toggle -->
                                    <div class="mil-action-btn" @click="toggleToc" v-if="toc.length > 0" title="Table of Contents">
                                        <i class="fas fa-list-ul"></i>
                                    </div>
                                    <!-- Language Toggle -->
                                    <div class="mil-action-btn" @click="toggleLang" title="Switch Language">
                                        <i class="fas fa-globe"></i>
                                    </div>
                                    <!-- Full Screen Toggle -->
                                    <div class="mil-action-btn" @click="toggleFullScreen" :title="isFullScreen ? 'Original View' : 'Full Screen View'">
                                        <i :class="['fas', isFullScreen ? 'fa-compress-alt' : 'fa-expand-alt']"></i>
                                    </div>
                                </div>
                                <div class="mil-action-trigger mil-icon-btn" @click="toggleActionMenu" :class="{ 'mil-active': isActionMenuOpen }">
                                    <i :class="['fas', isActionMenuOpen ? 'fa-times' : 'fa-ellipsis-v']"></i>
                                    <span class="mil-toc-dot" v-if="!isActionMenuOpen && toc.length > 0"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
        </div>
    </div>
</template>

<style>
/* Basic styles for markdown content */
.mil-markdown-content p {
    margin-bottom: 20px;
    line-height: 1.6;
}
.mil-markdown-content img {
    max-width: 100%;
    margin: 20px 0;
    border-radius: 5px;
}
.mil-markdown-content ul {
    margin-bottom: 20px;
    padding-left: 20px;
}
.mil-markdown-content li {
    list-style-type: disc;
    margin-bottom: 5px;
}

.mil-lang-btn-border {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2); /* The requested border */
    transition: all 0.3s ease;
    cursor: pointer;
}
.mil-lang-btn-border:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
}
.mil-lang-btn-border i {
    font-size: 18px !important;
    line-height: 1; /* Reset line height for perfect centering */
    display: block; /* Ensure no inline baseline weirdness */
}

.mil-lang-switch-container {
    display: flex;
    align-items: center;
    gap: 20px;
}

/* Language Switcher Styles */
.mil-lang-switch {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
}
.mil-lang-btn {
    cursor: pointer;
    opacity: 0.5;
    transition: 0.3s;
}
.mil-lang-btn.active {
    opacity: 1;
    color: var(--accent); /* Assuming accent color variable exists, else use gold/red */
}
.mil-lang-btn.disabled {
    cursor: not-allowed;
    opacity: 0.2;
    pointer-events: none;
}
.mil-lang-btn:hover:not(.disabled) {
    opacity: 1;
}

.mil-back-btn {
    border: none;
    padding: 10px 20px;
    border-radius: 0;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    position: relative;
    overflow: visible;
    backdrop-filter: none;
    box-shadow: none;
}

.mil-back-btn::before {
    display: none;
}

.mil-back-btn:hover {
    color: #fff;
    transform: translateY(-2px);
    background: transparent;
    box-shadow: none;
    border-color: transparent;
}

.mil-back-btn:hover::after {
   width: 100%; 
}

/* Underline effect for back button */
.mil-back-btn::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 0;
    width: 0%;
    height: 1px;
    background: #DBA91C;
    transition: width 0.3s ease;
    left: 50%;
    transform: translateX(-50%);
}

.mil-divider {
    opacity: 0.2;
}

.mil-fs-toggle {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    margin-right: 20px;
}
.mil-fs-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
}

/* Unified Action Menu Styles - Icon Only */
.mil-action-menu-wrapper {
    position: relative;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 20px;
}




/* Navigation Buttons (Previous / Next) Styling */
.mil-prev-nav .mil-link,
.mil-next-nav .mil-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.03); /* Semi-transparent */
    border-radius: 30px;
    border: none; /* No border */
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    text-decoration: none;
    height: 44px;
}

.mil-prev-nav .mil-link:hover,
.mil-next-nav .mil-link:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    transform: translateY(-2px);
}

.mil-prev-nav .mil-link i,
.mil-next-nav .mil-link i {
    font-size: 14px;
    transition: transform 0.3s ease;
}

.mil-prev-nav .mil-link:hover i {
    transform: translateX(-3px);
}

.mil-next-nav .mil-link:hover i {
    transform: translateX(3px);
}
.mil-prev-nav .mil-link.mil-disabled,
.mil-next-nav .mil-link.mil-disabled {
    opacity: 0.3;
    pointer-events: none;
    background: transparent;
}

/* Ensure icons have spacing */
.mil-prev-nav .mil-link span { margin-left: 10px; }
.mil-next-nav .mil-link span { margin-right: 10px; }

/* Mobile Responsiveness for Bottom Bar */
@media (max-width: 768px) {
    .mil-bottom-panel .mil-jcb {
        padding: 15px 0;
        gap: 10px;
    }
    
    .mil-bottom-centered {
        flex: 1; 
        order: 2;
    }

    .mil-back-btn {
        padding: 0 10px;
        height: 40px;
        font-size: 11px;
        white-space: nowrap;
    }

    /* Ensure Previous/Next are visible but compact on mobile */
    .mil-prev-nav .mil-link,
    .mil-next-nav .mil-link {
        padding: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
    }
    
    /* Hide text labels on mobile to save space, only show arrows */
    .mil-prev-nav .mil-link span, 
    .mil-next-nav .mil-link span {
        display: none;
    }
    
    .mil-prev-nav .mil-link i,
    .mil-next-nav .mil-link i {
        margin: 0 !important;
    }

    .mil-action-trigger {
        width: 40px;
        height: 40px;
    }
}

/* TOC Styles Update */
.mil-toc-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s ease, visibility 0.4s ease;
    will-change: opacity;
    transform: translate3d(0,0,0); /* Force hardware acceleration */
}

.mil-toc-backdrop.mil-active {
    opacity: 1;
    visibility: visible;
}

/* Desktop & Mobile: Always align to left part container */
.mil-toc-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1001;
    display: flex;
    justify-content: center;
    pointer-events: none;
    will-change: transform;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.mil-toc-menu {
    pointer-events: auto;
    width: 100%;
    max-width: 100rem; /* Match page content max-width */
    max-height: 85vh;
    height: auto;
    background: rgba(18, 18, 18, 0.98);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px 30px 0 0;
    padding: 20px 25px 40px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, visibility 0.4s;
    box-shadow: 0 -20px 60px rgba(0,0,0,0.8);
    will-change: transform, opacity;
    backface-visibility: hidden; /* Fix flickering */
    transform-style: preserve-3d;
}

.mil-toc-active .mil-toc-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.mil-sheet-handle {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    margin: 0 auto 20px;
}

.mil-toc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mil-toc-close {
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.3s;
}

.mil-toc-close:hover {
    background: #ff5e5e;
    color: #fff;
}

.mil-toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 350px;
    overflow-y: auto;
}

.mil-toc-list::-webkit-scrollbar {
    width: 3px;
}

.mil-toc-list::-webkit-scrollbar-thumb {
    background: rgba(219, 169, 28, 0.4);
    border-radius: 3px;
}

.mil-toc-item {
    padding: 10px 0;
    cursor: pointer;
    transition: all 0.3s ease;
    border-left: 2px solid transparent;
}

.mil-toc-item span {
    font-size: 1.3rem;
    line-height: 1.5;
    transition: all 0.3s ease;
}

.mil-toc-item:hover {
    padding-left: 15px;
    border-left-color: #DBA91C;
    background: rgba(255, 255, 255, 0.02);
}

.mil-toc-item:hover span {
    color: #fff !important;
}

.mil-level-1 { font-weight: 700; margin-top: 10px; font-size: 1.4rem; color: #fff !important; }
.mil-toc-item:first-child { margin-top: 0 !important; }
.mil-level-2 { padding-left: 15px; font-weight: 500; font-size: 1.3rem; }
.mil-level-3 { padding-left: 30px; font-size: 1.2rem; opacity: 0.9; }
.mil-level-4 { padding-left: 45px; font-size: 1.15rem; opacity: 0.8; }
.mil-level-5 { padding-left: 60px; font-size: 1.1rem; opacity: 0.7; }
.mil-level-6 { padding-left: 75px; font-size: 1.0rem; opacity: 0.6; }

.mil-toc-dot {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 10px;
    height: 10px;
    background: #DBA91C;
    border-radius: 50%;
    animation: mil-pulsing 2s infinite;
}

@keyframes mil-pulsing {
    0% { transform: scale(0.6); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
}

@media (max-width: 768px) {
    .mil-toc-menu {
        padding: 15px 25px 40px;
    }
    .mil-toc-item {
        padding-top: 12px;
        padding-bottom: 12px;
    }
    .mil-toc-item span {
        font-size: 1.4rem;
        color: #E0E0E0 !important;
    }
}

@media (max-width: 768px) {
    .mil-action-menu-wrapper {
        margin-left: 10px;
    }
    .mil-action-list {
        bottom: 60px; /* Adjusted spacing */
        gap: 15px; /* Increased gap */
    }
    .mil-action-btn {
        width: 45px; /* Slightly larger buttons */
        height: 45px;
    }
}
/* Mobile Optimization for Bottom Bar */
@media (max-width: 768px) {
    /* Hide the center "Back to..." button */
    .mil-bottom-centered {
        display: none;
    }

    /* Show icons and text in Prev/Next navigation on mobile */
    .mil-prev-nav .mil-link span, 
    .mil-next-nav .mil-link span {
        display: inline-block !important; /* Force show text */
        font-size: 12px;
    }

    /* Reset width/height constraints to allow text flow */
    .mil-prev-nav .mil-link, 
    .mil-next-nav .mil-link {
        display: flex; /* Ensure flexbox for gap to work */
        align-items: center;
        width: auto;
        height: 48px;
        padding: 0 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 30px;
        gap: 10px; /* Increased gap slightly for better visual separation */
    }
    
    .mil-prev-nav .mil-link i,
    .mil-next-nav .mil-link i {
        margin: 0 !important;
    }

    .mil-project-description .mil-link {
        white-space: normal;
        line-height: 1.4;
    }
}
</style>
