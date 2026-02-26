import { computed, onMounted, onUnmounted, ref } from 'vue'

/**
 * Minimal Moltbook /api/v1/home poller.
 *
 * Env:
 *  - VITE_MOLTBOOK_BASE_URL (default: https://www.moltbook.com)
 *  - VITE_MOLTBOOK_TOKEN (Bearer)
 */
export function useMoltbookHome(options = {}) {
  const baseUrl = options.baseUrl || import.meta.env.VITE_MOLTBOOK_BASE_URL || 'https://www.moltbook.com'
  const token = (options.token ?? import.meta.env.VITE_MOLTBOOK_TOKEN) || ''
  const pollMs = typeof options.pollMs === 'number' ? options.pollMs : 60_000
  const immediate = options.immediate !== false

  const loading = ref(false)
  const lastError = ref('')
  const updatedAt = ref(null)
  const payload = ref(null)

  const isConfigured = computed(() => Boolean(token && token.length > 10))

  const notificationsCount = computed(() => {
    const p = payload.value
    if (!p) return null

    // Best-effort parsing across potential API shapes
    if (typeof p.notifications_count === 'number') return p.notifications_count
    if (Array.isArray(p.notifications)) return p.notifications.length
    if (Array.isArray(p.data?.notifications)) return p.data.notifications.length
    if (typeof p.data?.notifications_count === 'number') return p.data.notifications_count

    return null
  })

  const karma = computed(() => {
    const p = payload.value
    if (!p) return null

    if (typeof p.karma === 'number') return p.karma
    if (typeof p.user?.karma === 'number') return p.user.karma
    if (typeof p.data?.karma === 'number') return p.data.karma
    if (typeof p.data?.user?.karma === 'number') return p.data.user.karma

    return null
  })

  async function fetchHome() {
    if (!isConfigured.value) return

    loading.value = true
    lastError.value = ''

    try {
      const res = await fetch(`${baseUrl}/api/v1/home`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${res.statusText}${body ? `: ${body.slice(0, 200)}` : ''}`)
      }

      payload.value = await res.json()
      updatedAt.value = new Date()
    } catch (e) {
      lastError.value = e?.message || String(e)
    } finally {
      loading.value = false
    }
  }

  let intervalId = null

  onMounted(() => {
    if (immediate) fetchHome()
    if (pollMs > 0) intervalId = setInterval(fetchHome, pollMs)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return {
    baseUrl,
    isConfigured,
    loading,
    lastError,
    updatedAt,
    payload,
    notificationsCount,
    karma,
    fetchHome,
  }
}
