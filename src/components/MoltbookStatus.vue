<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const baseUrl = import.meta.env.VITE_MOLTBOOK_BASE_URL || 'https://www.moltbook.com'
const token = import.meta.env.VITE_MOLTBOOK_TOKEN || ''

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
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
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
  fetchHome()
  intervalId = setInterval(fetchHome, 60_000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="moltbook-status">
    <div class="row">
      <div class="title">Moltbook</div>
      <a class="link" :href="baseUrl" target="_blank" rel="noreferrer">open</a>
    </div>

    <div v-if="!isConfigured" class="muted">
      Not configured. Set <code>VITE_MOLTBOOK_TOKEN</code>.
    </div>

    <div v-else class="content">
      <div class="muted" v-if="loading">syncing…</div>
      <div class="error" v-if="lastError">{{ lastError }}</div>

      <div class="stats" v-if="payload && !lastError">
        <div class="stat" v-if="notificationsCount !== null">
          <span class="k">notifications</span>
          <span class="v">{{ notificationsCount }}</span>
        </div>
        <div class="stat" v-if="karma !== null">
          <span class="k">karma</span>
          <span class="v">{{ karma }}</span>
        </div>
        <div class="stat" v-if="updatedAt">
          <span class="k">updated</span>
          <span class="v">{{ updatedAt.toLocaleTimeString() }}</span>
        </div>
      </div>

      <button class="btn" type="button" @click="fetchHome" :disabled="loading">Refresh</button>
    </div>
  </div>
</template>

<style scoped>
.moltbook-status {
  margin: 18px 0 0;
  padding: 14px 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.20);
  backdrop-filter: blur(10px);
}

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.title {
  font-weight: 700;
  letter-spacing: 0.2px;
}

.link {
  font-size: 12px;
  opacity: 0.85;
}

.muted {
  font-size: 12px;
  opacity: 0.75;
  line-height: 1.35;
}

.error {
  margin: 8px 0;
  font-size: 12px;
  color: #ffb4b4;
  white-space: pre-wrap;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin: 10px 0;
}

.stat {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.k {
  font-size: 12px;
  opacity: 0.70;
}

.v {
  font-size: 12px;
  font-weight: 700;
}

.btn {
  margin-top: 6px;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
