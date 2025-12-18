<script setup>
import { computed, onMounted, onUpdated, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import md from '@/utils/markdown'

const route = useRoute()
const router = useRouter()
const { getPostBySlug, getAdjacentPosts } = useMarkdown()

// The router param is named 'id' but serves as the slug
const slug = computed(() => route.params.id)
const post = getPostBySlug(slug.value, 'blog')
const adjacentPosts = getAdjacentPosts(slug.value, 'blog')

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

                        <!-- Back to Listing -->
                        <router-link to="/blog" class="mil-link">Back to Blog</router-link>

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
</style>
