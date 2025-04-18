<template>
  <div v-if="showVersion" class="version-display">v{{ version }}</div>
</template>

<script>
export default {
  name: 'VersionDisplay',
  data() {
    return {
      version: '0.0.0',
      showVersion: false
    }
  },
  mounted() {
    // Get version from service worker or fallback to package
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Create a MessageChannel for the response
      const messageChannel = new MessageChannel();

      // Set up message handler
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.version) {
          this.version = event.data.version;
          this.showVersion = true;
        }
      };

      // Ask service worker for version
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_VERSION'
      }, [messageChannel.port2]);

      // Fallback if no response after 1 second
      setTimeout(() => {
        if (!this.showVersion) {
          // Try to get from localStorage
          this.version = localStorage.getItem('appVersionInstalled') || '?';
          this.showVersion = true;
        }
      }, 1000);
    } else {
      // Fallback if no service worker
      try {
        this.version = localStorage.getItem('appVersionInstalled') || '?';
        this.showVersion = true;
      } catch (e) {
        console.error('Error getting version:', e);
      }
    }
  }
}
</script>

<style scoped>
.version-display {
  position: fixed;
  bottom: 5px;
  left: 5px;
  font-size: 10px;
  opacity: 0.5;
  background-color: rgba(0,0,0,0.1);
  border-radius: 3px;
  padding: 2px 4px;
  z-index: 10;
  font-family: monospace;
  pointer-events: none;
}
</style>