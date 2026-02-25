<script setup>
import { computed, onMounted, onUpdated, nextTick, ref, shallowRef } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
// import md from '@/utils/markdown'
const md = shallowRef(null)
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
// Dynamic import of mermaid
let mermaid;

import ToastNotification from '@/components/ToastNotification.vue'

// Mermaid config (same as Blog)

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
                    primaryColor: '#FFFFFF',
                    primaryTextColor: '#121212',
                    primaryBorderColor: '#DBA91C',
                    nodeBorder: '#DBA91C',
                    mainBkg: '#FFFFFF',
                    rectRadius: '8',
                    lineColor: '#DBA91C',
                    defaultLinkColor: '#DBA91C',
                    edgeLabelBackground: '#DBA91C',
                    labelTextColor: '#121212',
                    clusterBkg: 'rgba(255, 255, 255, 0.05)',
                    clusterBorder: '#444444',
                    secondaryColor: '#DBA91C',
                    tertiaryColor: '#1A1A1A',
                    titleColor: '#E0E0E0',
                },
                flowchart: { htmlLabels: true, curve: 'basis' },
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

const post = computed(() => {
    return posts.value.find(p => p.slug === slug.value && p.type === 'journal' && p.lang === currentLang.value);
});

const adjacentPosts = getAdjacentPosts(slug.value, 'journal', currentLang.value)

const hasEn = computed(() => posts.value.some(p => p.slug === slug.value && p.type === 'journal' && p.lang === 'en'));
const hasZh = computed(() => posts.value.some(p => p.slug === slug.value && p.type === 'journal' && p.lang === 'zh'));

const switchLang = (lang) => {
    if (lang === 'zh' && hasZh.value) appStore.setLang('zh');
    if (lang === 'en' && hasEn.value) appStore.setLang('en');
}

const canSwitchLang = computed(() => {
    // If current is en, check if hasZh. If current is zh, check if hasEn.
    if (currentLang.value === 'en') return hasZh.value
    if (currentLang.value === 'zh') return hasEn.value
    return false
})

const toggleLang = () => {
    if (!canSwitchLang.value) return
    if (currentLang.value === 'zh') appStore.setLang('en');
    else if (currentLang.value === 'en') appStore.setLang('zh');
}

// ... existing code ...

// In template for language button:
// <div class="mil-action-btn" :class="{ 'mil-disabled': !canSwitchLang }" @click="toggleLang" :title="canSwitchLang ? 'Switch Language' : 'Translation not available'">

const renderedBody = computed(() => {
    return (post.value && md.value) ? md.value.render(post.value.body) : ''
})

const formattedDate = computed(() => {
    if (!post.value || !post.value.date) return ''
    const d = new Date(post.value.date)
    // using sv-SE locale as a hack for ISO 8601 (YYYY-MM-DD) or manually constructing it
    const year = d.getFullYear()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
})

const toc = computed(() => {
    if (!post.value) return [];
    const headings = [];
    const lines = post.value.body.split('\n');
    lines.forEach(line => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2].trim();
            const slug = title.toLowerCase().trim().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            headings.push({ level, title, slug });
        }
    });
    return headings;
});

const isTocOpen = ref(false);
const isActionMenuOpen = ref(false);
const isFullScreen = ref(false)

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

const handleLinkClick = (event) => {
    const link = event.target.closest('a');
    if (link && link.getAttribute('href')) {
        const targetUrl = new URL(link.href);
        const currentOrigin = window.location.origin;

        if (targetUrl.origin === currentOrigin) {
            let path = targetUrl.pathname;
            if (path.endsWith('.md')) {
                event.preventDefault();
                // Simple redirection logic
                const parts = path.split('/');
                const slug = decodeURIComponent(parts.pop().replace('.md', ''));
                if (path.includes('/journal/')) { path = '/journal/' + slug }
                else if (path.includes('/portfolio/')) { path = '/portfolio/' + slug }
                else { path = '/blog/' + slug }
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
                setTimeout(() => { btn.innerHTML = originalText; }, 2000);
            });
        });
    });
};

onMounted(() => { nextTick(() => { attachCopyListeners(); initMarkdown(); initMermaid(); }); })
onUpdated(() => { nextTick(() => { attachCopyListeners(); initMarkdown(); initMermaid(); }); })


</script>

<template>
    <div class="mil-content-frame">
        <ToastNotification ref="toastRef" />
        <div class="mil-scroll mil-half-1 mil-bp-fix-2">
            <div class="mil-main-content" v-if="post">
                <div class="mil-banner">
                    <div class="mil-bg-frame">
                        <img :src="post.image" alt="banner"
                            class="mil-banner-bg mil-scale-img" 
                            data-value-1="1" data-value-2="1.3"
                            v-if="post.image">
                    </div>
                    <div class="mil-banner-overlay"></div>
                    <div class="mil-banner-content mil-type-2">
                        <!-- Journal Metadata -->
                        <div class="mil-journal-meta mil-mb-20">
                            <span class="mil-link">{{ formattedDate }}</span>
                            <span v-if="post.weather" class="mil-meta-divider">|</span>
                            <span v-if="post.weather"><i class="fas fa-cloud"></i> {{ post.weather }}</span>
                            <span v-if="post.mood" class="mil-meta-divider">|</span>
                            <span v-if="post.mood"><i class="fas fa-smile"></i> {{ post.mood }}</span>
                        </div>
                        
                        <h1>{{ post.title }}</h1>
                        
                        <!-- Language Switcher -->
                        <div class="mil-lang-switch mil-mt-20">
                            <span class="mil-lang-btn" :class="{ 'active': currentLang === 'zh', 'disabled': !hasZh }" @click="switchLang('zh')">ZH</span>
                            <span class="mil-divider">/</span>
                            <span class="mil-lang-btn" :class="{ 'active': currentLang === 'en', 'disabled': !hasEn }" @click="switchLang('en')">EN</span>
                        </div>
                    </div>
                </div>
                
                <div class="mil-space-90 mil-p-90-75">
                    <div class="mil-markdown-content mil-mb-60 mil-up" v-html="renderedBody" @click="handleLinkClick"></div>
                </div>

                <!-- TOC Menu -->
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
            </div>
            
            <div v-else class="mil-p-90-75">
                <h1>Entry not found</h1>
            </div>

            <!-- Bottom Panel (Similar to Blog, return to /journal) -->
            <div class="mil-bottom-panel mil-up-instant">
                <div class="mil-jcc mil-space-15 mil-w-100">
                        <div class="mil-jcb mil-w-100 mil-p-30-0">
                             <div class="mil-action-trigger mil-icon-btn" @click="copyLink" title="Copy Link" style="margin-right: 20px;">
                                <i :class="['fas', copied ? 'fa-check' : 'fa-share-alt']"></i>
                             </div>

                            <div class="mil-prev-nav">
                                 <router-link v-if="adjacentPosts.prev" :to="'/journal/' + adjacentPosts.prev.slug" class="mil-link mil-icon-link-left" title="Previous Entry">
                                    <i class="fas fa-chevron-left"></i> <span>Previous</span>
                                 </router-link>
                                 <span v-else class="mil-link mil-disabled" style="opacity: 0.5;"><i class="fas fa-chevron-left"></i> <span>Previous</span></span>
                             </div>

                        <div class="mil-bottom-centered">
                            <router-link to="/journal" class="mil-link mil-back-btn">Back to Journal</router-link>
                        </div>

                        <div class="mil-next-nav">
                            <router-link v-if="adjacentPosts.next" :to="'/journal/' + adjacentPosts.next.slug" class="mil-link mil-icon-link" title="Next Entry">
                                <span>Next</span> <i class="fas fa-chevron-right"></i>
                            </router-link>
                            <span v-else class="mil-link mil-disabled" style="opacity: 0.5;"><span>Next</span> <i class="fas fa-chevron-right"></i></span>
                        </div>

                        <div class="mil-action-menu-wrapper" :class="{ 'mil-active': isActionMenuOpen }">
                            <div class="mil-action-list">
                                <div class="mil-action-btn" @click="toggleToc" v-if="toc.length > 0" title="Table of Contents">
                                    <i class="fas fa-list-ul"></i>
                                </div>
                                <div class="mil-action-btn" :class="{ 'mil-disabled': !canSwitchLang }" @click="toggleLang" :title="canSwitchLang ? 'Switch Language' : 'Translation not available'">
                                    <i class="fas fa-globe"></i>
                                </div>
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

<style scoped>
/* Inherit global styles, add specific ones */
.mil-journal-meta {
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 1px;
    text-transform: uppercase;
    justify-content: center;
}

.mil-journal-meta i {
    color: #DBA91C;
    margin-right: 5px;
}

.mil-meta-divider {
    opacity: 0.2;
}

/* Semi-transparent blur for cover image overlay */
.mil-banner-overlay {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.3);
}

.mil-lang-btn {
    cursor: pointer;
    opacity: 0.5;
    transition: 0.3s;
}
.mil-lang-btn.active {
    opacity: 1;
    color: #DBA91C;
}
.mil-lang-btn.disabled {
    cursor: not-allowed;
    opacity: 0.2;
    pointer-events: none;
}
.mil-lang-btn:hover:not(.disabled) {
    opacity: 1;
}

/* Bottom Bar Layout Styling */
.mil-bottom-centered {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

/* Simplified Back Button - Text Style */
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

.mil-back-btn:hover {
    color: #fff;
    transform: translateY(-2px);
    background: transparent;
}

.mil-back-btn:hover::after {
   width: 100%; 
}

/* Navigation Buttons (Previous / Next) Styling */
.mil-prev-nav .mil-link,
.mil-next-nav .mil-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 30px;
    border: none;
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

.mil-prev-nav .mil-link span { margin-left: 10px; }
.mil-next-nav .mil-link span { margin-right: 10px; }

/* Action Menu & Buttons */
.mil-action-menu-wrapper {
    position: relative;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 20px;
}



/* TOC Styles */
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
}

.mil-toc-backdrop.mil-active {
    opacity: 1;
    visibility: visible;
}

.mil-toc-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1001;
    display: flex;
    justify-content: center;
    pointer-events: none;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.mil-toc-menu {
    pointer-events: auto;
    width: 100%;
    max-width: 100rem;
    max-height: 85vh;
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
.mil-level-2 { padding-left: 15px; font-weight: 500; font-size: 1.3rem; }
.mil-level-3 { padding-left: 30px; font-size: 1.2rem; opacity: 0.9; }

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

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .mil-bottom-panel .mil-jcb {
        padding: 15px 0;
        gap: 10px;
    }
    
    /* Hide the center "Back to..." button */
    .mil-bottom-centered {
        display: none;
    }

    /* Show icons and text in Prev/Next navigation on mobile */
    .mil-prev-nav .mil-link span, 
    .mil-next-nav .mil-link span {
        display: inline-block !important; /* Force show text */
        font-size: 11px;
    }

    /* Reset width/height constraints to allow text flow */
    .mil-prev-nav .mil-link, 
    .mil-next-nav .mil-link {
        display: flex;
        align-items: center;
        width: auto;
        height: 44px;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 30px;
        gap: 8px;
        background: rgba(255, 255, 255, 0.05);
    }
    
    .mil-prev-nav .mil-link i,
    .mil-next-nav .mil-link i {
        margin: 0 !important;
    }

    .mil-action-trigger {
        width: 40px;
        height: 40px;
    }

    .mil-action-menu-wrapper {
        margin-left: 10px;
    }
    
    .mil-toc-menu {
        padding: 15px 25px 40px;
    }
    
    .mil-toc-item span {
        font-size: 1.4rem;
        color: #E0E0E0 !important;
    }
}
</style>

