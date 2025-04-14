<template>
  <div v-if="showInstallBanner" class="install-banner">
    <div class="banner-content">
      <div class="banner-text">
        <h3>Aggiungi alla schermata Home</h3>
        <p>Installa La Via del Vangelo sul tuo dispositivo per un'esperienza migliore</p>
      </div>
      <div class="banner-actions">
        <button @click="installApp" class="install-button">Installa</button>
        <button @click="closeBanner" class="close-button">
          <span class="close-icon">×</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstallBanner',
  data() {
    return {
      deferredPrompt: null,
      showInstallBanner: false
    }
  },
  mounted() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
      return;
    }

    // Check if user previously dismissed the banner
    const dismissedTime = localStorage.getItem('installBannerDismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
      console.log('Install banner was dismissed less than 7 days ago');
      return;
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      this.deferredPrompt = e;
      // Show our custom banner after a delay
      setTimeout(() => {
        this.showInstallBanner = true;
      }, 1000);
    });
  },
  methods: {
    async installApp() {
      if (!this.deferredPrompt) return;

      // Show the browser's install prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const {outcome} = await this.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);

      // Clear the saved prompt
      this.deferredPrompt = null;

      // Hide our custom banner
      this.showInstallBanner = false;
    },
    closeBanner() {
      this.showInstallBanner = false;
      // Remember that user dismissed the banner
      localStorage.setItem('installBannerDismissed', Date.now().toString());
    }
  }
}
</script>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #472b21;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  padding: 16px;
  z-index: 9999;
  border-top: 4px solid #A67D51;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #d3b282;
}

.banner-text p {
  margin: 0;
  font-size: 14px;
  color: #d3b282;
}

.banner-actions {
  display: flex;
  align-items: center;
  margin-left: 15px;
}

.install-button {
  background-color: #A67D51;
  color: #281D02FF;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-right: 10px;
  transition: all 0.2s;
}

.install-button:hover {
  background-color: #d3b282;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 5px;
  color: #d3b282;
}

.close-icon {
  display: block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
}

@media (max-width: 480px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .banner-actions {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>