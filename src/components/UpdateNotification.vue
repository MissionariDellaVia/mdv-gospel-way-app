<template>
  <transition name="slide-down">
    <div v-if="updateAvailable" class="update-notification">
      <div v-if="isUpdating">
        <span>Aggiornamento in corso…</span>
        <div class="spinner"></div>
      </div>
      <div v-else>
        Nuova versione disponibile!
        <!-- on iOS you must close & reopen the PWA for the SW to activate -->
        <button @click="refreshApp">Chiudi e riapri</button>
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
    // 1) Listen for SW update events
    document.addEventListener('swUpdated', this.onSWUpdated)
    // 2) When app resumes visibility, trigger a check
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    // 3) Also do an initial check once SW has registered
    setTimeout(this.checkWaitingSW, 2000)
  },
  beforeUnmount() {
    document.removeEventListener('swUpdated', this.onSWUpdated)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  },
  methods: {
    onSWUpdated(evt) {
      const reg = evt.detail.registration
      if (reg && reg.waiting) {
        this.registration = reg
        this.updateAvailable = true
      }
    },
    checkWaitingSW() {
      if (!('serviceWorker' in navigator)) return
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
          this.onSWUpdated({detail: {registration: reg}})
        }
      })
    },
    onVisibilityChange() {
      if (document.visibilityState !== 'visible') return
      // when user returns to the PWA, check for new SW
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return
        reg.update()
        // if it’s already waiting, fire the event
        if (reg.waiting) {
          document.dispatchEvent(
              new CustomEvent('swUpdated', {detail: {registration: reg}})
          )
        }
      })
    },
    refreshApp() {
      this.isUpdating = true
      // on iOS the only way to activate the new SW is to close+reopen
      // so here we just show the spinner, then clear state
      setTimeout(() => {
        // give user time to read the message, then hide it
        this.isUpdating = false
        this.updateAvailable = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.update-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #A67D51;
  color: #281D02;
  padding: 12px;
  text-align: center;
  font-weight: bold;
  z-index: 10000;
}

button {
  margin-left: 8px;
  background: #281D02;
  color: #d3b282;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #281D02;
  border-top: 2px solid #d3b282;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 6px;
}

@keyframes spin {
  to {
    transform: rotate(360deg)
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%)
}
</style>