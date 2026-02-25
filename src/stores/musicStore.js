import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { pulseEntropy } from '../utils/glitch'

export const useMusicStore = defineStore('music', () => {
    // Audio element (single instance)
    const audio = ref(null)

    // Playback state
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)
    const volume = ref(0.7)
    const isMuted = ref(false)
    const currentTrackIndex = ref(0)

    // Playlist
    const playlist = ref([
        {
            title: 'Call of Silence',
            artist: 'PIANO',
            album: 'Unknown',
            src: '/audio/call_of_silence.mp3'
        }
    ])

    // Computed
    const currentTrack = computed(() => playlist.value[currentTrackIndex.value])
    const progress = computed(() => {
        return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
    })

    // Initialize audio element
    const initAudio = (audioElement) => {
        if (audio.value) return // Already initialized

        audio.value = audioElement
        audio.value.src = currentTrack.value.src
        audio.value.volume = volume.value

        // Setup event listeners
        audio.value.addEventListener('loadedmetadata', () => {
            duration.value = audio.value.duration
        })

        audio.value.addEventListener('timeupdate', () => {
            currentTime.value = audio.value.currentTime
        })

        audio.value.addEventListener('play', () => {
            isPlaying.value = true
        })

        audio.value.addEventListener('pause', () => {
            isPlaying.value = false
        })

        audio.value.addEventListener('ended', () => {
            // Single track loop
            audio.value.currentTime = 0
            audio.value.play().catch(err => {
                console.error('Loop playback failed:', err)
            })
        })

        audio.value.addEventListener('volumechange', () => {
            volume.value = audio.value.volume
            isMuted.value = audio.value.muted
        })

        audio.value.addEventListener('error', (e) => {
            console.error('Audio loading error:', e)
            console.error('Current audio source:', audio.value.src)
        })
    }

    // Actions
    const togglePlay = () => {
        if (!audio.value) return

        if (isPlaying.value) {
            audio.value.pause()
        } else {
            audio.value.play().catch(err => {
                console.error('Playback failed:', err)
            })
        }
    }

    const play = () => {
        if (!audio.value) return
        audio.value.play().catch(err => {
            console.error('Play failed:', err)
        })
    }

    const pause = () => {
        if (!audio.value) return
        audio.value.pause()
    }

    const seek = (time) => {
        if (!audio.value) return
        audio.value.currentTime = time
    }

    const seekByPercentage = (percentage) => {
        if (!audio.value || !duration.value) return
        audio.value.currentTime = (percentage / 100) * duration.value
    }

    const setVolume = (newVolume) => {
        if (!audio.value) return
        const vol = Math.max(0, Math.min(1, newVolume))
        audio.value.volume = vol
        volume.value = vol
        if (vol > 0) {
            audio.value.muted = false
            isMuted.value = false
        }
    }

    const toggleMute = () => {
        if (!audio.value) return
        audio.value.muted = !audio.value.muted
        isMuted.value = audio.value.muted
    }

    const previousTrack = () => {
        if (currentTrackIndex.value > 0) {
            currentTrackIndex.value--
            loadTrack()
        }
    }

    const nextTrack = () => {
        if (currentTrackIndex.value < playlist.value.length - 1) {
            currentTrackIndex.value++
            loadTrack()
        }
    }

    const loadTrack = () => {
        if (!audio.value) return

        const wasPlaying = isPlaying.value
        audio.value.src = currentTrack.value.src
        audio.value.load()

        if (wasPlaying) {
            audio.value.play().catch(err => {
                console.error('Playback failed:', err)
            })
        }
    }

    const tryAutoPlay = async () => {
        if (!audio.value) return

        try {
            await audio.value.play()
            console.log('Auto-play successful')
        } catch (err) {
            console.warn('Auto-play blocked by browser:', err.message)
            console.log('Please click play button to start music')
        }
    }

    // Effect: Pulse entropy on play/pause
    watch(isPlaying, (val) => {
        pulseEntropy(val ? 0.05 : -0.05)
    })

    return {
        // State
        audio,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        currentTrackIndex,
        playlist,

        // Computed
        currentTrack,
        progress,

        // Actions
        initAudio,
        togglePlay,
        play,
        pause,
        seek,
        seekByPercentage,
        setVolume,
        toggleMute,
        previousTrack,
        nextTrack,
        loadTrack,
        tryAutoPlay
    }
})
