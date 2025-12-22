<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { useScrollAnimations } from '@/composables/useScrollAnimations'

const { getPosts, getCategories } = useMarkdown()
const { initAnimations } = useScrollAnimations()

const allPosts = getPosts('blog')
const categories = getCategories('blog')

const activeCategory = ref('All')
const isExpanded = ref(false)
const toggledSlug = ref(null)
const currentLang = ref('en')

const filteredPosts = computed(() => {
    let posts = allPosts.value.filter(p => p.lang === currentLang.value)
    if (activeCategory.value !== 'All') {
        posts = posts.filter(p => p.category === activeCategory.value)
    }
    return posts
})

const toggleLang = () => {
    currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
}

const displayedPosts = computed(() => {
    if (isExpanded.value) {
        return filteredPosts.value
    }
    return filteredPosts.value.slice(0, 6)
})

const showViewMore = computed(() => {
    return !isExpanded.value && filteredPosts.value.length > 6
})

const switchCategory = (cat) => {
    activeCategory.value = cat
    isExpanded.value = false // Reset expansion on category change
}

const switchToFullWidth = () => {
    isExpanded.value = true
    document.body.classList.remove('mil-half-page')
    document.body.classList.add('mil-fw-page')
}

const toggleCard = (slug) => {
    if (window.innerWidth <= 768) {
        toggledSlug.value = toggledSlug.value === slug ? null : slug
    }
}

// Watch for changes in displayed posts to trigger animations
watch(displayedPosts, async () => {
    await nextTick()
    initAnimations()
}, { deep: true })
</script>

<template>
    <div class="mil-content-frame mil-up">
        <div class="mil-scroll mil-half-1 mil-bp-fix">
            <div class="mil-row-fix">
                <div class="row">
                    <!-- Posts Loop -->
                    <div v-for="(post, index) in displayedPosts" :key="post.slug" :class="(displayedPosts.length % 2 !== 0 && index === 0) ? 'col-lg-12' : 'col-lg-6'">
                        <div 
                            class="mil-blog-card mil-mb-15 mil-up"
                            :class="{ 'mil-active': toggledSlug === post.slug }"
                            @click="toggleCard(post.slug)"
                        >
                            <img :src="post.image" :alt="post.title" v-if="post.image">
                            <div class="mil-descr">
                                <div class="mil-post-text">
                                    <div class="mil-left">
                                        <h3 class="mil-line-height mil-mb-30">{{ post.title }}</h3>
                                        <router-link :to="'/blog/' + post.slug" class="mil-link mil-hover-link mil-accent">read more</router-link>
                                    </div>
                                    <div class="mil-right">
                                        <p>{{ post.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                   
                    <div v-if="filteredPosts.length === 0" class="col-12 mil-mb-15">
                        <p>No posts found in this category.</p>
                    </div>

                </div>
            </div>
            
            <a v-if="showViewMore" @click="switchToFullWidth" class="mil-btn mil-mb-15 cursor-pointer">View more posts</a>
            
            <div class="mil-bottom-panel">
                <div class="mil-w-100 mil-list-footer">
                    <div class="mil-footer-spacer"></div>
                    <div class="mil-filter">
                        <a v-for="cat in categories" :key="cat" 
                           @click.prevent="switchCategory(cat)"
                           href="#" 
                           :class="['mil-link', { 'mil-current': activeCategory === cat }]" 
                           data-no-swup>
                           {{ cat }}
                        </a>
                    </div>
                    
                    <div class="mil-footer-spacer"></div>

                    <div class="mil-lang-switch">
                        <a href="#" @click.prevent="toggleLang"  title="Switch Language">
                            <i class="fas fa-language" style="font-size: 24px;"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.mil-list-footer {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
}

.mil-footer-spacer {
    display: block;
    flex: 1;
    min-width: 10px; /* Balance the icon width */
}

.mil-filter {
    flex: 0 1 auto;
    display: flex;
    align-items: center;
    /* justify-content: center; */ /* Not needed if flex 0 auto handles it, but keeps text centered if unwrapped */
    flex-wrap: nowrap;
    overflow-x: auto;
    white-space: nowrap;
    gap: 20px;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    padding: 0 5px; /* Tiny padding to prevent cut-off italic fonts if any */
}
.mil-filter::-webkit-scrollbar {
    display: none;
}

.mil-lang-switch {
    flex: 0 0 auto; /* Do not grow, just take needed space */
    display: flex;
    justify-content: flex-end;
    min-width: auto;
}
.mil-lang-switch a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.05); 
    transition: all 0.3s ease;
    flex-shrink: 0;
    margin-left: 8px;
    margin-right: 8px; /* Add visual margin to the right */
}
.mil-lang-switch a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
}
.mil-lang-switch i {
    font-size: 18px !important;
}
</style>