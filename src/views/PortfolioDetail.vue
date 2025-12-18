<script setup>
import { computed, onMounted, onUpdated, nextTick } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import md from '@/utils/markdown'

const route = useRoute()
const router = useRouter()
const { getPostBySlug, getAdjacentPosts } = useMarkdown()

const slug = computed(() => route.params.id)
const work = getPostBySlug(slug.value, 'portfolio')
const adjacentPosts = getAdjacentPosts(slug.value, 'portfolio')

const renderedBody = computed(() => {
    return work.value ? md.render(work.value.body) : ''
})

const handleLinkClick = (event) => {
    const link = event.target.closest('a');
    if (link && link.getAttribute('href')) {
        const targetUrl = new URL(link.href);
        const currentOrigin = window.location.origin;

        if (targetUrl.origin === currentOrigin) {
            event.preventDefault();
            let path = targetUrl.pathname;
            if (path.endsWith('.md')) {
                path = path.replace('.md', '');
                // Prepend /portfolio/ if missing
                if (!path.startsWith('/blog/') && !path.startsWith('/portfolio/')) {
                    path = '/portfolio' + path;
                }
            }
            router.push(path);
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
   nextTick(() => attachCopyListeners());
})

onUpdated(() => {
    nextTick(() => attachCopyListeners());
})
</script>

<template>
    <div class="mil-content-frame">
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
                            </div>
                            <div class="col-md-6 mil-jce mil-m-jcs mil-mb-30">
                                <div class="mil-badge mil-dark mil-mr-5" v-if="work.client">{{ work.client }}</div>
                                <div class="mil-badge">{{ work.category }}</div>
                            </div>
                        </div>

                        <!-- Markdown Content -->
                        <div class="mil-markdown-content mil-mb-60 mil-up" v-html="renderedBody" @click="handleLinkClick"></div>

                        <div class="mil-divider mil-mb-60 mil-up"></div>

                        <div class="row">
                            <div class="col-6 mil-up" v-if="work.client">
                                <div class="mil-link"><span class="mil-accent">client:</span> {{ work.client }}</div>
                            </div>
                            <div class="col-6 mil-jce mil-up" v-if="work.date">
                                <div class="mil-link"><span class="mil-accent">date:</span> {{ work.date }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <div v-else class="mil-p-90-75">
                <h1>Project not found</h1>
            </div>

             <div class="mil-bottom-panel">
                 <div class="mil-space-90 mil-jcb mil-w-100">
                     <div class="mil-jcb mil-w-100">
                         <!-- Previous Work -->
                        <div class="mil-prev-nav">
                             <router-link v-if="adjacentPosts.prev" :to="'/portfolio/' + adjacentPosts.prev.slug" class="mil-link mil-icon-link-left" title="Previous Project">
                                <i class="fas fa-chevron-left"></i> <span>Previous</span>
                             </router-link>
                             <span v-else class="mil-link mil-disabled" style="opacity: 0.5;"><i class="fas fa-chevron-left"></i> Previous</span>
                        </div>

                        <!-- Back to Listing -->
                        <router-link to="/portfolio" class="mil-link">Back to Portfolio</router-link>

                        <!-- Next Work -->
                        <div class="mil-next-nav">
                            <router-link v-if="adjacentPosts.next" :to="'/portfolio/' + adjacentPosts.next.slug" class="mil-link mil-icon-link" title="Next Project">
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
/* Basic styles for markdown content */
.mil-markdown-content h1, 
.mil-markdown-content h2, 
.mil-markdown-content h3 {
    margin-bottom: 20px;
    margin-top: 30px;
}
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
</style>
