import { onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollAnimations() {

    const killAnimations = () => {
        ScrollTrigger.getAll().forEach(t => t.kill())
        // Reset styles for elements that might be mid-animation if needed, 
        // but usually just killing triggers is enough if we are unmounting.
    }

    const initAnimations = () => {
        // Kill any existing triggers first to avoid duplication/conflicts
        killAnimations()

        // Refresh ScrollTrigger to ensure positions are correct
        ScrollTrigger.refresh()

        // Force another refresh after a short delay to account for layout shifts/transitions
        setTimeout(() => {
            ScrollTrigger.refresh()
        }, 100)

        // 1. Appearance Animation (.mil-up)
        const appearance = document.querySelectorAll(".mil-up")
        appearance.forEach(section => {
            // If we are re-initializing, we might want to reset opacity if it was already animated?
            // Or if it's a new page verify it's clean.
            // But if it's the SAME page re-init, we might reset it.
            // For navigation, the new elements come in fresh.

            // Check if already animated to avoid double fade-in on hot reload or re-init
            if (section.classList.contains('mil-animated')) {
                section.style.opacity = 1;
                section.style.pointerEvents = 'all';
                section.style.transform = 'translateY(0) scale(1)';
                return;
            }

            const container = section.closest('.mil-half-1') || section.closest('.mil-half-2') || window;

            // Only animate if element is visible/attached
            if (!document.body.contains(section)) return;

            gsap.fromTo(section, {
                opacity: 0,
                y: 40,
                scale: 0.95,
                pointerEvents: 'none',
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.4,
                onComplete: () => {
                    section.style.pointerEvents = 'all'
                    section.classList.add('mil-animated')
                },
                scrollTrigger: {
                    trigger: section,
                    scroller: container === window ? 'body' : container, // Handle full page vs scrollable div
                    toggleActions: 'play none none reverse',
                    start: 'top+=90px bottom',
                }
            })
        })

        // 2. Scale Image Animation (.mil-scale-img)
        const scaleImage = document.querySelectorAll(".mil-scale-img")
        scaleImage.forEach(section => {
            const container = section.closest('.mil-half-1') || section.closest('.mil-half-2') || window;
            const value1 = Math.max(0.95, section.getAttribute("data-value-1") || 1);
            const value2 = section.getAttribute("data-value-2") || 1.1;

            const startValue = window.innerWidth < 1200 ? 'top-=100 bottom-=100%' : 'top bottom-=100%';

            gsap.fromTo(section, {
                scale: value1,
                y: '0%',
            }, {
                scale: value2,
                y: '10%',
                scrollTrigger: {
                    scroller: container === window ? 'body' : container,
                    trigger: section,
                    start: startValue,
                    scrub: true,
                    toggleActions: 'play none none reverse',
                }
            })
        })

        // 3. Progress Bar (.mil-progress-prog)
        const progressBars = document.querySelectorAll('.mil-progress-prog')
        progressBars.forEach(box => {
            const size = box.getAttribute('data-size')
            if (size) box.style.setProperty('--size', size)

            const container = box.closest('.mil-half-1') || box.closest('.mil-half-2') || window;

            ScrollTrigger.create({
                trigger: box,
                scroller: container === window ? 'body' : container,
                toggleActions: 'play none none reverse',
                onEnter: () => box.classList.add('mil-active'),
                onLeaveBack: () => box.classList.remove('mil-active')
            })
        })
    }

    // Cleanup on component unmount
    onUnmounted(() => {
        killAnimations()
    })

    return {
        initAnimations,
        killAnimations
    }
}
