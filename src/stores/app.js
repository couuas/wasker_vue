import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
    const isMenuOpen = ref(false)

    function toggleMenu() {
        isMenuOpen.value = !isMenuOpen.value
        // Toggle class on body or main wrapper if needed by CSS
        // The original template likely toggles a class on .mil-menu-btn or .mil-menu-part
        // We will handle this in components or here
    }

    function closeMenu() {
        isMenuOpen.value = false
    }

    return { isMenuOpen, toggleMenu, closeMenu }
})
