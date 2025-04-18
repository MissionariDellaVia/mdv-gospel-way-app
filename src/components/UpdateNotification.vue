<template>
  <transition name="slide-down">
    <div v-if="updateAvailable" class="update-notification">
      <div v-if="isUpdating">
        <span>Aggiornamento in corso…</span>
        <div class="spinner"></div>
      </div>
      <div v-else>
        Nuova versione disponibile!
        <button @click="refreshApp">Aggiorna</button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'UpdateNotification',
  data() {
    return {
      updateAvailable: false,
      isUpdating: false,
      registration: null
    }
  },
  created() {
    // 1) Listen for the swUpdated event
    document.addEventListener('swUpdated', this.onSWUpdated)
    // 2) Check once if there's already a waiting SW (after registration)
    setTimeout(this.checkWaitingSW, 2000)
  },
  beforeUnmount() {
    document.removeEventListener('swUpdated', this.onSWUpdated)
  },
  methods: {
    onSWUpdated(evt) {
      const reg = evt.detail.registration
      // Only show the banner if a worker is truly waiting
      if (reg && reg.waiting) {
        this.registration = reg
        this.updateAvailable = true
      }
    },
    checkWaitingSW() {
      if (!('serviceWorker' in navigator)) return
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
          this.onSWUpdated({ detail: { registration: reg } })
        }
      })
    },
    refreshApp() {
      this.isUpdating = true
      const reg = this.registration
      if (reg && reg.waiting) {
        // Ask the waiting SW to activate immediately
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        // Once the new SW takes over, reload
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })
      } else {
        // Fallback if no waiting SW
        window.location.reload()
      }
      // Safety reload after 5s in case controllerchange didn’t fire
      setTimeout(() => window.location.reload(), 5000)
    }
  }
}
</script>

<style scoped>
.update-notification {
  position: fixed;
  top: 0; left: 0; right: 0;
  background: #A67D51; color: #281D02;
  padding: 12px; text-align: center;
  font-weight: bold; z-index: 10000;
}
button {
  margin-left: 8px;
  background: #281D02; color: #d3b282;
  border: none; padding: 6px 12px;
  border-radius: 4px; cursor: pointer;
}
.spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid #281D02;
  border-top: 2px solid #d3b282;
  border-radius: 50%; animation: spin 1s linear infinite;
  margin-left: 6px;
}
@keyframes spin { to { transform: rotate(360deg) } }

/* slide-down */
.slide-down-enter-active,
.slide-down-leave-active { transition: transform 0.3s ease }
.slide-down-enter-from,
.slide-down-leave-to { transform: translateY(-100%) }
</style>