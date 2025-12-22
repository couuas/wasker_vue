<script setup>
import { computed, onMounted, onUpdated, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import md from '@/utils/markdown'

const route = useRoute()
const router = useRouter()
const { posts, getAdjacentPosts } = useMarkdown()

// The router param is named 'id' but serves as the slug
const slug = computed(() => route.params.id)
const currentLang = ref('en')

const post = computed(() => {
    // Find post matching slug AND currentLang
    // Fallback: if default language post is missing but switching was allowed, it might be empty.
    // However, we assume at least one version exists if we are here (implied by router link).
    // If the requested language version is missing, we could fallback to the other language or show a message.
    const found = posts.value.find(p => p.slug === slug.value && p.type === 'blog' && p.lang === currentLang.value);
    
    // Auto-fallback to other language if current one doesn't exist? 
    // User Reqt: "If missing, toggle should be gray or fallback"
    // Let's implement strict matching here, and handle availability in the toggle logic.
    return found;
});

const adjacentPosts = getAdjacentPosts(slug.value, 'blog', currentLang.value)

// Check availability of other language
const hasEn = computed(() => posts.value.some(p => p.slug === slug.value && p.type === 'blog' && p.lang === 'en'));
const hasZh = computed(() => posts.value.some(p => p.slug === slug.value && p.type === 'blog' && p.lang === 'zh'));

const switchLang = (lang) => {
    if (lang === 'zh' && hasZh.value) currentLang.value = 'zh';
    if (lang === 'en' && hasEn.value) currentLang.value = 'en';
}

const toggleLang = () => {
    if (currentLang.value === 'zh' && hasEn.value) currentLang.value = 'en';
    else if (currentLang.value === 'en' && hasZh.value) currentLang.value = 'zh';
}

const renderedBody = computed(() => {
    return post.value ? md.render(post.value.body) : ''
})

// Intercept clicks on rendered markdown
const handleLinkClick = (event) => {
    const link = event.target.closest('a');
    if (link && link.getAttribute('href')) {
        const rawHref = link.getAttribute('href');
        const targetUrl = new URL(link.href);
        const currentOrigin = window.location.origin;

        // Check if internal link
        if (targetUrl.origin === currentOrigin) {
            event.preventDefault();
            let path = targetUrl.pathname;
            
            // Logic to handle basic markdown relative links
            // e.g., ./other-post.md -> /blog/other-post
            if (path.endsWith('.md')) {
                path = path.replace('.md', '');
                
                // If the path does not start with /blog/ or /portfolio/, assume it's a blog post
                // because we are in BlogDetail. Also check rawHref for relative up-nav
                if (!path.startsWith('/blog/') && !path.startsWith('/portfolio/')) {
                    // Check if it's likely a relative link that resolved to root
                    // e.g. ../foo.md -> /foo.md -> /foo
                    // We want /blog/foo
                    path = '/blog' + path;
                }
            }
            
            router.push(path);
        } else {
            // External link: open in new tab
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
   nextTick(() => attachCopyListeners());
})

onUpdated(() => {
   nextTick(() => attachCopyListeners());
})
</script>

<template>
    <div class="mil-content-frame">
        <div class="mil-scroll mil-half-1 mil-bp-fix">
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
                        <div class="mil-link mil-mb-20">{{ post.category }}</div>
                        <h1>{{ post.title }}</h1>
                        
                        <!-- Language Switcher -->
                        <div class="mil-lang-switch mil-mt-20">
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
                </div>
                <div class="mil-space-90 mil-p-0-75">
                    <!-- Markdown Content with click listener -->
                    <div class="mil-markdown-content" v-html="renderedBody" @click="handleLinkClick"></div>
                </div>
            </div>
            <!-- ... -->
            
            <div v-else class="mil-p-90-75">
                <h1>Post not found</h1>
            </div>

            <div class="mil-bottom-panel">
                <div class="mil-jcc mil-space-15 mil-w-100">
                    <div class="mil-jcb mil-w-100 mil-p-30-0">
                         <!-- Previous Post (Newer) -->
                        <div class="mil-prev-nav">
                             <router-link v-if="adjacentPosts.prev" :to="'/blog/' + adjacentPosts.prev.slug" class="mil-link mil-icon-link-left" title="Previous Post">
                                <i class="fas fa-chevron-left"></i> <span>Previous</span>
                             </router-link>
                             <span v-else class="mil-link mil-disabled" style="opacity: 0.5;"><i class="fas fa-chevron-left"></i> Previous</span>
                         </div>

                        <!-- Center Group: Back + Lang Switch -->
                        <div class="mil-bottom-centered">
                            <router-link to="/blog" class="mil-link">Back to Blog</router-link>
                            
                            <span class="mil-divider">/</span>

                            <span 
                                class="mil-link mil-icon-link" 
                                :class="{ 'mil-disabled': !hasEn && !hasZh || (currentLang === 'zh' && !hasEn) || (currentLang === 'en' && !hasZh) }"
                                @click="toggleLang"
                                title="Switch Language"
                                style="cursor: pointer;">
                                <i class="fas fa-language" style="font-size: 24px;"></i>
                            </span>
                        </div>

                        <!-- Next Post (Older) -->
                        <div class="mil-next-nav">
                            <router-link v-if="adjacentPosts.next" :to="'/blog/' + adjacentPosts.next.slug" class="mil-link mil-icon-link" title="Next Post">
                                <span>Next</span> <i class="fas fa-chevron-right"></i>
                            </router-link>
                            <span v-else class="mil-link mil-disabled" style="opacity: 0.5;">Next <i class="fas fa-chevron-right"></i></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* Basic styles for markdown content if not present globaly */
.mil-markdown-content h1, 
.mil-markdown-content h2, 
.mil-markdown-content h3 {
    margin-bottom: 20px;
}
.mil-markdown-content p {
    margin-bottom: 20px;
}
.mil-markdown-content img {
    max-width: 100%;
    border-radius: 10px;
    margin: 20px 0;
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

/* Bottom Bar Layout Styling */
.mil-bottom-centered {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.mil-divider {
    opacity: 0.2;
}
</style>
