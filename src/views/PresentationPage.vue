<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import VuePdfEmbed from 'vue-pdf-embed';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/mousewheel';
import { Mousewheel, Pagination, Keyboard } from 'swiper/modules';

import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const route = useRoute();
const router = useRouter();
const { posts } = useMarkdown();
const appStore = useAppStore();
const { currentLang } = storeToRefs(appStore);

const slug = computed(() => route.params.id);
const work = computed(() => {
    // Prefer the version matching the current language preference
    const found = posts.value.find(p => p.slug === slug.value && p.pdf && p.lang === currentLang.value);
    // Fallback to any version if specific language version doesn't have PDF or doesn't exist
    return found || posts.value.find(p => p.slug === slug.value && p.pdf);
});

const pdfSource = computed(() => work.value?.pdf);
const pageCount = ref(0);
const isLoading = ref(true);

function handleDocumentLoad(doc) {
    pageCount.value = doc.numPages;
    isLoading.value = false;
}

const swiperInstance = ref(null);

function onSwiper(swiper) {
    swiperInstance.value = swiper;
}

function prevSlide() {
    swiperInstance.value?.slidePrev();
}

function nextSlide() {
    swiperInstance.value?.slideNext();
}

const currentPage = ref(1);

function onSlideChange(swiper) {
    currentPage.value = swiper.activeIndex + 1;
}

const modules = [Mousewheel, Pagination, Keyboard];

function goBack() {
    router.back();
}
</script>

<template>
    <div class="presentation-page">
        <!-- Close / Back Button -->
        <button class="close-btn" @click="goBack" title="Exit Presentation">
            <i class="fas fa-times"></i>
        </button>

        <!-- Desktop Navigation Arrows -->

        
        <!-- Scroll Indicator -->
        <div class="scroll-indicator" v-if="pageCount > 1">
            <div class="mouse">
                <div class="wheel"></div>
            </div>
            <div class="arrow-scroll">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>

        <div v-if="!work" class="error-msg">
            <p>Presentation not found.</p>
            <button @click="goBack">Go Back</button>
        </div>

        <div v-else class="pdf-container">
            <!-- Hidden loader to get page count -->
            <div class="loader-hidden" v-if="pageCount === 0">
                <VuePdfEmbed :source="pdfSource" @loaded="handleDocumentLoad" />
            </div>

            <Swiper
                v-if="pageCount > 0"
                :direction="'vertical'"
                :slidesPerView="1"
                :spaceBetween="0"
                :mousewheel="{ sensitivity: 1, thresholdTime: 400 }"
                :keyboard="{ enabled: true }"
                :modules="modules"
                :speed="700"
                :resistance="true"
                :resistanceRatio="0.85"
                class="pdf-swiper"
                @swiper="onSwiper"
                @slideChange="onSlideChange"
            >
                <SwiperSlide v-for="page in pageCount" :key="page">
                    <div class="slide-content">
                        <VuePdfEmbed 
                            :source="pdfSource" 
                            :page="page" 
                            class="slide-pdf"
                        />
                    </div>
                </SwiperSlide>
            </Swiper>
            
            <div v-if="isLoading" class="loading-overlay">
                <div class="spinner"></div>
                <p>Loading Presentation...</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.presentation-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    color: #fff;
    z-index: 2147483647; /* Max z-index to ensure it sits on top of everything */
    display: flex;
    flex-direction: column;
}

.close-btn {
    position: absolute;
    top: 30px;
    right: 30px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    z-index: 2147483647;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    background: rgba(219, 169, 28, 1);
    color: #000;
}

.close.nav-btn {
    pointer-events: auto;
    background: transparent;
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    width: 40px; /* Slightly smaller for elegance */
    height: 40px;
    border-radius: 50%;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.nav-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #DBA91C;
    transform: scale(1.1);
}

.nav-btn:active {
    transform: scale(0.95);
}
/* Navigation Controls */
.nav-controls {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    max-width: 90vw; /* Ensure it doesn't overflow screen */
    height: auto;
    z-index: 2147483647;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px; /* Slightly reduced gap for mobile */
    padding: 10px 20px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 30px;
    backdrop-filter: blur(5px);
    white-space: nowrap; /* Prevent wrapping */
}

.page-counter {
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 500;
    margin: 0 5px; /* Reduced margin */
    white-space: nowrap; /* Strictly prevent text wrap */
}

/* Ensure controls are visible on all screens */
.desktop-only {
    display: flex; /* Force display on mobile too */
}

@media (max-width: 768px) {
    .close-btn {
        top: 90px; /* Moved down to avoid top nav bar */
        right: 20px;
        width: 36px;
        height: 36px;
        background: rgba(0, 0, 0, 0.5); /* More visible on valid slides */
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
}

.error-msg {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.pdf-container {
    width: 100%;
    height: 100%;
}

.loader-hidden {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
}

.pdf-swiper {
    width: 100%;
    height: 100%;
}

.slide-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px; /* Minimal padding for close button safety */
    box-sizing: border-box;
}

.slide-pdf {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    /* Box shadow removed for cleaner look at full size */
    box-shadow: none; 
}

/* Customizing PDF embed to fit nicely */
:deep(.vue-pdf-embed) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

:deep(.vue-pdf-embed canvas) {
    width: 100% !important;
    height: 90vh !important; /* Use 90% of screen height */
    object-fit: contain !important;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 50;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #DBA91C;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Scroll Indicator */
.scroll-indicator {
    position: absolute;
    bottom: 20%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    z-index: 2147483647;
    pointer-events: none;
    opacity: 0.7;
}

.mouse {
    width: 26px;
    height: 40px;
    border: 2px solid #fff;
    border-radius: 20px;
    position: relative;
}

.wheel {
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    animation: scrollWheel 2s infinite;
}

.arrow-scroll span {
    display: block;
    width: 10px;
    height: 10px;
    border-bottom: 2px solid #fff;
    border-right: 2px solid #fff;
    transform: rotate(45deg);
    margin: -4px 0;
    animation: scrollArrow 2s infinite;
}

.arrow-scroll span:nth-child(2) {
    animation-delay: 0.2s;
}

.arrow-scroll span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes scrollWheel {
    0% { opacity: 1; top: 6px; }
    100% { opacity: 0; top: 20px; }
}

@keyframes scrollArrow {
    0% { opacity: 0; transform: rotate(45deg) translate(-5px, -5px); }
    50% { opacity: 1; }
    100% { opacity: 0; transform: rotate(45deg) translate(5px, 5px); }
}
</style>
