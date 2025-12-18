<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { useScrollAnimations } from '@/composables/useScrollAnimations'

const { getPosts, getCategories } = useMarkdown()
const { initAnimations } = useScrollAnimations()

const allWorks = getPosts('portfolio')
const categories = getCategories('portfolio')

const activeCategory = ref('All')
const isExpanded = ref(false)

const filteredWorks = computed(() => {
    let works = allWorks.value
    if (activeCategory.value !== 'All') {
        works = works.filter(p => p.category === activeCategory.value)
    }
    return works
})

const displayedWorks = computed(() => {
    if (isExpanded.value) {
        return filteredWorks.value
    }
    return filteredWorks.value.slice(0, 6)
})

const showViewMore = computed(() => {
    return !isExpanded.value && filteredWorks.value.length > 6
})

const switchCategory = (cat) => {
    activeCategory.value = cat
    isExpanded.value = false
}

const switchToFullWidth = () => {
    isExpanded.value = true
}

// Watch for changes in displayed works to trigger animations
watch(displayedWorks, async () => {
    await nextTick()
    initAnimations()
}, { deep: true })
</script>

<template>
    <div class="mil-content-frame mil-up">
        <div class="mil-scroll mil-bp-fix mil-half-1">
            <div class="mil-row-fix">
                <div class="row">
                    <div v-for="work in displayedWorks" :key="work.slug" class="col-lg-6">
                        <div class="mil-blog-card mil-sm mil-mb-15 mil-up">
                            <img :src="work.image" :alt="work.title" v-if="work.image">
                            <div class="mil-descr">
                                <div class="mil-post-text">
                                    <div class="mil-left">
                                        <h3 class="mil-line-height mil-mb-20">{{ work.title }}</h3>
                                        <router-link :to="'/portfolio/' + work.slug" class="mil-link mil-hover-link mil-accent">read more</router-link>
                                    </div>
                                    <div class="mil-right">
                                        <p>{{ work.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="filteredWorks.length === 0" class="col-12 mil-mb-15">
                        <p>No projects found in this category.</p>
                    </div>
                </div>
            </div>

            <a v-if="showViewMore" @click="switchToFullWidth" class="mil-btn mil-mb-15 cursor-pointer">View more projects</a>
            
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
