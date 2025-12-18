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

const filteredPosts = computed(() => {
    let posts = allPosts.value
    if (activeCategory.value !== 'All') {
        posts = posts.filter(p => p.category === activeCategory.value)
    }
    return posts
})

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
                    <div v-for="post in displayedPosts" :key="post.slug" class="col-lg-6">
                         <!-- Simplified Layout: Assuming col-lg-12 for full width list or col-lg-6 for grid. 
                              The original had a mix. Let's use a standard list card for Blog. -->
                        <div class="mil-blog-card mil-mb-15 mil-up">
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
                <div class="mil-jcc mil-w-100">
                    <div class="mil-filter mb-30">
                        <a v-for="cat in categories" :key="cat" 
                           @click.prevent="switchCategory(cat)"
                           href="#" 
                           :class="['mil-link', { 'mil-current': activeCategory === cat }]" 
                           data-no-swup>
                           {{ cat }}
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
</style>