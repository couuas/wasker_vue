import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
    const isMenuOpen = ref(false)

    function toggleMenu() {
        isMenuOpen.value = !isMenuOpen.value
    }

    function closeMenu() {
        isMenuOpen.value = false
    }

    const isLoading = ref(true)
    function setLoading(val) {
        isLoading.value = val
    }

    // AI Assistant Trigger
    const triggerAssistant = ref(0)
    function openAssistant() {
        triggerAssistant.value++
        closeMenu()
    }

    const currentLang = ref(localStorage.getItem('wasker_lang') || 'en')

    function setLang(lang) {
        currentLang.value = lang
        localStorage.setItem('wasker_lang', lang)
    }

    function toggleLang() {
        const newLang = currentLang.value === 'zh' ? 'en' : 'zh'
        setLang(newLang)
    }

    const transitioning = ref(false)
    function setTransitioning(val) {
        transitioning.value = val
    }

    // Global Full Screen State
    const isFullScreen = ref(false)
    function toggleFullScreen() {
        isFullScreen.value = !isFullScreen.value
        if (isFullScreen.value) {
            document.body.classList.remove('mil-half-page')
            document.body.classList.add('mil-fw-page')
        } else {
            document.body.classList.remove('mil-fw-page')
            document.body.classList.add('mil-half-page')
        }
    }

    return {
        isMenuOpen, toggleMenu, closeMenu,
        isLoading, setLoading,
        transitioning, setTransitioning,
        triggerAssistant, openAssistant,
        currentLang, setLang, toggleLang,
        isFullScreen, toggleFullScreen
    }
})
