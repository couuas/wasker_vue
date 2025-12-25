<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const { getPosts, getCategories } = useMarkdown()
const { initAnimations } = useScrollAnimations()
const appStore = useAppStore()
const { currentLang } = storeToRefs(appStore)

const allWorks = getPosts('portfolio')
const categories = getCategories('portfolio')

const activeCategory = ref('All')
const isExpanded = ref(false)
const toggledSlug = ref(null)

const filteredWorks = computed(() => {
    let works = allWorks.value.filter(p => p.lang === currentLang.value)
    if (activeCategory.value !== 'All') {
        works = works.filter(p => p.category === activeCategory.value)
    }
    return works
})

const toggleLang = () => {
    appStore.toggleLang()
}

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

const toggleCard = (slug) => {
    if (window.innerWidth <= 768) {
        toggledSlug.value = toggledSlug.value === slug ? null : slug
    }
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
                    <div v-for="(work, index) in displayedWorks" :key="work.slug" :class="(displayedWorks.length % 2 !== 0 && index === 0) ? 'col-lg-12' : 'col-lg-6'">
                        <div 
                            class="mil-blog-card mil-mb-15 mil-up"
                            :class="{ 'mil-active': toggledSlug === work.slug }"
                            @click="toggleCard(work.slug)"
                        >
                            <img :src="work.image" :alt="work.title" v-if="work.image">
                            <div class="mil-descr">
                                <div class="mil-post-text">
                                    <div class="mil-left">
                                        <h3 class="mil-line-height mil-mb-20">{{ work.title }}</h3>
                                        <router-link :to="'/portfolio/' + work.slug" class="mil-link mil-hover-link mil-accent">read more</router-link>
                                        <router-link v-if="work.pdf" :to="'/presentation/' + work.slug" class="mil-link mil-hover-link mil-accent" style="margin-left: 30px;">Read PPT</router-link>
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
                        <a href="#" @click.prevent="toggleLang" title="Switch Language">
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
    min-width: 40px;
}

.mil-filter {
    flex: 0 1 auto;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
    white-space: nowrap;
    gap: 20px;
    -ms-overflow-style: none; 
    scrollbar-width: none;
    padding: 0 5px;
}
.mil-filter::-webkit-scrollbar {
    display: none;
}

.mil-lang-switch {
    flex: 0 0 auto;
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
    margin-right: 15px; /* Add visual margin to the right */
}
.mil-lang-switch a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
}
.mil-lang-switch i {
    font-size: 18px !important;
}
</style>
