<template>
  <div v-if="!isOnline" class="offline-banner">
    <span>Sei offline. Utilizzando dati salvati.</span>
  </div>
</template>

<script>
export default {
  name: 'NetworkStatus',
  data() {
    return {
      isOnline: navigator.onLine
    }
  },
  mounted() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
    }
  }
}
</script>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #A67D51;
  color: #281D02FF;
  text-align: center;
  padding: 8px;
  font-size: 14px;
  z-index: 9998;
  font-weight: bold;
}
</style>