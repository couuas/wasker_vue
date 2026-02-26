import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import MusicPlayer from '../components/MusicPlayer.vue'

// Mock the music store
vi.mock('../stores/musicStore', () => ({
  useMusicStore: () => ({
    isPlaying: false,
    currentTrack: { title: 'Test Track', artist: 'Test Artist' },
    progress: 30,
    volume: 0.7,
    isMuted: false,
    currentTime: 90,
    duration: 300,
    togglePlay: vi.fn(),
    previousTrack: vi.fn(),
    nextTrack: vi.fn(),
    toggleMute: vi.fn(),
    seekByPercentage: vi.fn(),
    setVolume: vi.fn()
  })
}))

describe('MusicPlayer.vue', () => {
  let wrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(MusicPlayer)
  })

  it('renders the music player component', () => {
    expect(wrapper.find('.mil-music-player').exists()).toBe(true)
  })

  it('displays track title', () => {
    expect(wrapper.find('.mil-track-title').text()).toBe('Test Track')
  })

  it('displays track artist', () => {
    expect(wrapper.find('.mil-track-artist').text()).toBe('Test Artist')
  })

  it('displays play/pause button', () => {
    expect(wrapper.find('.mil-play-btn').exists()).toBe(true)
  })

  it('displays progress bar', () => {
    expect(wrapper.find('.mil-progress-bar').exists()).toBe(true)
  })

  it('displays volume controls on desktop', () => {
    // Mock desktop width
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    const DesktopWrapper = mount(MusicPlayer)
    expect(DesktopWrapper.find('.mil-volume-control').exists()).toBe(true)
  })

  it('renders control buttons', () => {
    const controlButtons = wrapper.findAll('.mil-control-btn')
    expect(controlButtons.length).toBe(3) // prev, play/pause, next
  })

  it('formats current time correctly', () => {
    // 90 seconds = 1:30
    expect(wrapper.find('.mil-current').text()).toBe('1:30')
  })

  it('formats duration correctly', () => {
    // 300 seconds = 5:00
    expect(wrapper.find('.mil-duration').text()).toBe('5:00')
  })

  it('shows correct play icon when not playing', () => {
    expect(wrapper.find('.mil-play-btn i').classes('fa-play')).toBe(true)
  })
})
