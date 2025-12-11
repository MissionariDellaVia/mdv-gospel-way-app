<template>
  <transition name="banner-slide">
    <div v-if="showInstallBanner" class="install-banner" :class="{ 'android': isAndroid, 'desktop': !isAndroid }">
      <div class="banner-content">
        <!-- App icon and information -->
        <div class="banner-info">
          <div class="app-icon">
            <span>V</span>
          </div>
          <div class="banner-text">
            <h3>La Via del Vangelo</h3>
            <p v-if="isAndroid">Installa l'app per un accesso rapido e offline</p>
            <p v-else>Aggiungi al desktop per un accesso immediato</p>
          </div>
        </div>

        <!-- Banner actions -->
        <div class="banner-actions">
          <button
              @click="installApp"
              class="install-button"
              :class="{'pulse': highlightInstall, 'android': isAndroid}"
              @mouseover="stopHighlightTimer"
              @touchstart="stopHighlightTimer"
          >
            <span class="install-icon"></span>
            <span>{{ isAndroid ? 'Installa App' : 'Installa' }}</span>
          </button>
          <button @click="remindLater" class="remind-button" :class="{'android': isAndroid}">
            Più tardi
          </button>
          <button @click="closeBanner" class="close-button" aria-label="Chiudi banner">
            <span class="close-icon"></span>
          </button>
        </div>

        <!-- Progress bar for auto-dismiss countdown -->
        <div class="auto-dismiss-timer">
          <div class="progress-bar" :style="{ width: `${dismissProgress}%` }"></div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Installation guide modal for browsers -->
  <transition name="modal-fade">
    <div v-if="showInstallGuide" class="install-guide-modal" @click="closeGuide">
      <div class="guide-container" :class="{'android': isAndroid}" @click.stop>
        <div class="guide-header">
          <h3>Come installare La Via del Vangelo</h3>
          <button @click="closeGuide" class="close-guide-button" aria-label="Chiudi guida">
            <span class="close-icon"></span>
          </button>
        </div>

        <!-- Android-specific guide -->
        <div v-if="isAndroid" class="guide-content">
          <div class="guide-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <p>Quando appare il banner, tocca <strong>"Installa"</strong></p>
              <div class="mockup android-banner">
                <div class="mockup-icon"></div>
                <div class="mockup-text">
                  <div class="mockup-title">Installa app</div>
                  <div class="mockup-subtitle">La Via del Vangelo</div>
                </div>
                <div class="mockup-button pulse-highlight">Installa</div>
              </div>
            </div>
          </div>

          <div class="guide-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <p>Conferma toccando <strong>"Installa"</strong> nel popup</p>
              <div class="mockup android-popup">
                <div class="mockup-header">Aggiungi alla schermata Home</div>
                <div class="mockup-actions">
                  <div class="mockup-action-cancel">Annulla</div>
                  <div class="mockup-action-install pulse-highlight">Installa</div>
                </div>
              </div>
            </div>
          </div>

          <div class="note">
            <p>L'app sarà quindi installata sul tuo dispositivo e accessibile dalla schermata Home</p>
          </div>
        </div>

        <!-- Desktop browser guide -->
        <div v-else class="guide-content">
          <div class="guide-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <p>Clicca sull'icona di installazione <span class="browser-install-icon"></span> nella barra degli indirizzi</p>
              <div class="mockup browser-address-bar">
                <div class="mockup-url">vangelo.app</div>
                <div class="mockup-browser-icon pulse-highlight"></div>
              </div>
            </div>
          </div>

          <div class="guide-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <p>Nel menu che appare, clicca su <strong>"Installa"</strong></p>
              <div class="mockup browser-popup">
                <div class="mockup-popup-header">
                  <div class="mockup-popup-icon"></div>
                  <div class="mockup-popup-title">Installa questa app?</div>
                </div>
                <div class="mockup-popup-content">La Via del Vangelo</div>
                <div class="mockup-popup-actions">
                  <div class="mockup-popup-cancel">Annulla</div>
                  <div class="mockup-popup-install pulse-highlight">Installa</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="guide-footer">
          <button @click="closeGuide" class="guide-button">Ho capito</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'InstallBanner',
  data() {
    return {
      deferredPrompt: null,
      showInstallBanner: false,
      showInstallGuide: false,
      dismissProgress: 100,
      dismissInterval: null,
      highlightInstall: false,
      highlightInterval: null,
      isAndroid: false,
      dontShowAgain: false
    }
  },
  mounted() {
    // Immediate platform detection
    this.detectPlatform();

    // Skip everything if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        navigator.standalone === true) {
      console.log('App already installed, not showing banner');
      return;
    }

    // Check if user previously dismissed the banner
    const dismissedData = localStorage.getItem('installBannerDismissed');
    if (dismissedData) {
      if (dismissedData === 'permanent') {
        console.log('Banner permanently dismissed');
        return;
      }

      const dismissedTime = parseInt(dismissedData);
      if (!isNaN(dismissedTime) && Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        console.log('Banner temporarily dismissed');
        return;
      }
    }

    // Listen for beforeinstallprompt event with improved handling
    window.addEventListener('beforeinstallprompt', this.handleInstallPrompt);

    // If we're past the event timing or the event doesn't fire within 3 seconds,
    // but we still want to give users install instructions
    if (this.isAndroid) {
      setTimeout(() => {
        if (!this.deferredPrompt && !this.showInstallBanner) {
          console.log('No prompt event received, showing manual guide for Android');
          this.showInstallGuide = true;
        }
      }, 3000);
    }
  },
  beforeUnmount() {
    this.clearTimers();
    window.removeEventListener('beforeinstallprompt', this.handleInstallPrompt);
  },
  methods: {
    detectPlatform() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      this.isAndroid = /android/i.test(userAgent);
      console.log(`Platform detected: ${this.isAndroid ? 'Android' : 'Desktop/Browser'}`);
    },

    handleInstallPrompt(e) {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Store the event for later use
      this.deferredPrompt = e;
      console.log('Install prompt event captured and stored');

      // Show our custom banner after a short delay
      setTimeout(() => {
        this.showInstallBanner = true;
        this.startAutoDismissTimer();
        this.startHighlightTimer();
      }, 1000);
    },

    async installApp() {
      if (this.deferredPrompt) {
        try {
          console.log('Triggering stored install prompt');
          this.clearTimers();

          // Show native prompt
          this.deferredPrompt.prompt();

          // Wait for user response
          const {outcome} = await this.deferredPrompt.userChoice;
          console.log(`Installation outcome: ${outcome}`);

          if (outcome === 'accepted') {
            console.log('User accepted installation');
            localStorage.setItem('installBannerDismissed', 'permanent');
          } else {
            console.log('User declined installation');
            localStorage.setItem('installBannerDismissed', Date.now().toString());
          }

          // Clean up
          this.deferredPrompt = null;
          this.showInstallBanner = false;

        } catch (err) {
          console.error('Error during installation process:', err);
          this.showInstallGuide = true;
          this.showInstallBanner = false;
        }
      } else {
        console.log('No install prompt available, showing manual installation guide');
        this.showInstallGuide = true;
        this.showInstallBanner = false;
        this.clearTimers();
      }
    },

    remindLater() {
      console.log('User requested reminder for later');
      this.showInstallBanner = false;

      // Set a shorter reminder period (1 day instead of 7)
      const oneDayAgo = Date.now() - (6 * 24 * 60 * 60 * 1000);
      localStorage.setItem('installBannerDismissed', oneDayAgo.toString());
      this.clearTimers();
    },

    closeBanner() {
      console.log('User dismissed banner');
      this.showInstallBanner = false;
      localStorage.setItem('installBannerDismissed', Date.now().toString());
      this.clearTimers();
    },

    closeGuide() {
      console.log('Closing installation guide');
      this.showInstallGuide = false;

      // If user checked "don't show again", store permanent dismissal
      if (this.dontShowAgain) {
        localStorage.setItem('installBannerDismissed', 'permanent');
      } else {
        localStorage.setItem('installBannerDismissed', Date.now().toString());
      }
    },

    startAutoDismissTimer() {
      console.log('Starting auto-dismiss countdown');
      this.dismissProgress = 100;
      const updateInterval = 100; // Update every 100ms
      const totalTime = 15000; // 15 seconds
      const decrementPerInterval = (updateInterval / totalTime) * 100;

      this.dismissInterval = setInterval(() => {
        this.dismissProgress -= decrementPerInterval;

        if (this.dismissProgress <= 0) {
          console.log('Auto-dismiss triggered');
          this.closeBanner();
        }
      }, updateInterval);
    },

    startHighlightTimer() {
      console.log('Starting highlight animation cycle');
      this.highlightInterval = setInterval(() => {
        this.highlightInstall = true;

        setTimeout(() => {
          this.highlightInstall = false;
        }, 1000);
      }, 5000);
    },

    stopHighlightTimer() {
      clearInterval(this.highlightInterval);
      this.highlightInstall = false;
    },

    clearTimers() {
      if (this.dismissInterval) clearInterval(this.dismissInterval);
      if (this.highlightInterval) clearInterval(this.highlightInterval);
    }
  }
}
</script>

<style scoped>
/* ===================================
   Install Banner - PWA Install Prompt
   With safe-area support & CSS vars
   =================================== */

.install-banner {
  position: fixed;
  /* Safe area support for iPhone home indicator */
  bottom: var(--safe-bottom, 0px);
  left: var(--safe-left, 0px);
  right: var(--safe-right, 0px);
  background: linear-gradient(to bottom, var(--color-primary, #6e4f3a), var(--color-dark, #472b21));
  box-shadow: var(--shadow-lg, 0 -4px 20px rgba(0, 0, 0, 0.4));
  z-index: 9990;
  border-top: 2px solid var(--color-accent, #A67D51);
  padding: 0;
  overflow: hidden;
}

.install-banner.android {
  background: linear-gradient(to bottom, var(--color-dark, #472b21), var(--color-darkest, #281D02));
  border-top-color: var(--color-light, #d3b282);
}

.install-banner.desktop {
  max-width: 480px;
  left: auto;
  right: max(20px, var(--safe-right, 0px));
  bottom: max(20px, var(--safe-bottom, 0px));
  border-radius: var(--radius-xl, 16px);
  border: 2px solid var(--color-accent, #A67D51);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-md, 16px) var(--spacing-lg, 20px);
  position: relative;
}

/* App icon styling */
.banner-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.app-icon {
  /* 48px touch target */
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  background: linear-gradient(135deg, var(--color-accent, #A67D51), var(--color-light, #d3b282));
  border-radius: var(--radius-md, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md, 16px);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm, 0 2px 5px rgba(0, 0, 0, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.app-icon span {
  color: var(--color-darkest, #281D02);
  font-weight: bold;
  font-size: 24px;
  position: relative;
  z-index: 1;
}

.app-icon:after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateY(-100%) rotate(35deg);
  }
  20%, 100% {
    transform: translateY(100%) rotate(35deg);
  }
}

/* Banner text */
.banner-text {
  flex: 1;
}

.banner-text h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: var(--color-light, #d3b282);
  font-weight: 600;
}

.banner-text p {
  margin: 0;
  font-size: 14px;
  color: var(--color-light, #d3b282);
  opacity: 0.9;
  line-height: 1.3;
}

/* Action buttons */
.banner-actions {
  display: flex;
  align-items: center;
  margin-left: var(--spacing-md, 15px);
  gap: var(--spacing-sm, 8px);
}

.install-button {
  background: linear-gradient(to bottom, var(--color-light, #d3b282), var(--color-accent, #A67D51));
  color: var(--color-darkest, #281D02);
  border: none;
  /* Minimum 48px touch target */
  min-height: var(--touch-target-min, 48px);
  padding: var(--spacing-sm, 10px) var(--spacing-lg, 18px);
  border-radius: var(--radius-full, 24px);
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
  transition: all var(--transition-normal, 0.2s ease);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm, 0 2px 5px rgba(0, 0, 0, 0.2));
  -webkit-tap-highlight-color: transparent;
}

.install-button.android {
  background: var(--color-accent, #A67D51);
  border-radius: var(--radius-md, 8px);
}

.install-button:hover {
  background: linear-gradient(to bottom, #c9a882, var(--color-light, #d3b282));
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 4px 8px rgba(0, 0, 0, 0.3));
}

.install-button.android:hover {
  background: var(--color-light, #d3b282);
}

.install-button:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.2));
}

.install-button.pulse {
  animation: button-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.install-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  position: relative;
}

.install-icon:before {
  content: '';
  position: absolute;
  width: 12px;
  height: 8px;
  border-radius: 1px;
  background-color: #281D02;
  top: 4px;
  left: 2px;
}

.install-icon:after {
  content: '';
  position: absolute;
  left: 6px;
  top: -2px;
  border-style: solid;
  border-width: 6px 6px 0 0;
  border-color: #281D02 transparent transparent transparent;
  transform: rotate(45deg);
}

.remind-button {
  background: transparent;
  border: 2px solid var(--color-accent, #A67D51);
  color: var(--color-accent, #A67D51);
  /* Minimum 48px touch target */
  min-height: var(--touch-target-min, 48px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 14px);
  border-radius: var(--radius-full, 20px);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-normal, 0.2s ease);
  -webkit-tap-highlight-color: transparent;
}

.remind-button.android {
  border-radius: var(--radius-md, 8px);
}

.remind-button:hover {
  background-color: rgba(166, 125, 81, 0.15);
  color: var(--color-light, #d3b282);
  border-color: var(--color-light, #d3b282);
}

.remind-button:active {
  transform: scale(0.97);
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  /* 48px touch target */
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full, 50%);
  transition: all var(--transition-fast, 0.15s ease);
  -webkit-tap-highlight-color: transparent;
}

.close-button:hover {
  background-color: rgba(166, 125, 81, 0.15);
}

.close-button:active {
  transform: scale(0.95);
}

.close-icon {
  position: relative;
  width: 18px;
  height: 18px;
}

.close-icon:before,
.close-icon:after {
  content: '';
  position: absolute;
  width: 18px;
  height: 2px;
  background-color: var(--color-accent, #A67D51);
  top: 50%;
  left: 0;
  transition: background-color var(--transition-fast, 0.15s ease);
}

.close-button:hover .close-icon:before,
.close-button:hover .close-icon:after {
  background-color: var(--color-light, #d3b282);
}

.close-icon:before {
  transform: rotate(45deg);
}

.close-icon:after {
  transform: rotate(-45deg);
}

/* Auto-dismiss progress bar */
.auto-dismiss-timer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: rgba(211, 178, 130, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, var(--color-accent, #A67D51), var(--color-light, #d3b282));
  transition: width 0.1s linear;
}

/* Installation guide modal */
.install-guide-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(40, 29, 2, 0.8);
  z-index: 9995;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg, 20px);
  /* Safe area support */
  padding-top: max(var(--spacing-lg, 20px), var(--safe-top, 0px));
  padding-bottom: max(var(--spacing-lg, 20px), var(--safe-bottom, 0px));
}

.guide-container {
  background-color: var(--color-dark, #472b21);
  border-radius: var(--radius-xl, 16px);
  border: 2px solid var(--color-accent, #A67D51);
  width: 100%;
  max-width: 380px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl, 0 5px 30px rgba(0, 0, 0, 0.5));
}

.guide-container.android {
  border-radius: var(--radius-lg, 14px);
}

.guide-header {
  padding: var(--spacing-md, 16px) var(--spacing-lg, 20px);
  border-bottom: 1px solid var(--color-primary, #6e4f3a);
  position: relative;
  text-align: center;
}

.guide-header h3 {
  margin: 0;
  color: var(--color-light, #d3b282);
  font-size: 18px;
  font-weight: 600;
}

.close-guide-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  /* 48px touch target */
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  border-radius: var(--radius-full, 50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--transition-fast, 0.15s ease);
}

.close-guide-button:hover {
  background-color: rgba(166, 125, 81, 0.15);
}

.close-guide-button:active {
  transform: scale(0.95);
}

.guide-content {
  padding: var(--spacing-lg, 20px);
}

.guide-step {
  margin-bottom: var(--spacing-xl, 24px);
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--color-accent, #A67D51);
  color: var(--color-darkest, #281D02);
  border-radius: var(--radius-full, 50%);
  font-weight: bold;
  font-size: 16px;
  margin-bottom: var(--spacing-sm, 12px);
}

.step-content p {
  color: var(--color-light, #d3b282);
  margin: 0 0 var(--spacing-md, 14px) 0;
  line-height: 1.4;
  font-size: 15px;
}

/* Mockups */
.mockup {
  background-color: #362018;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}

.android-banner {
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
}

.mockup-icon {
  width: 24px;
  height: 24px;
  background-color: #A67D51;
  border-radius: 6px;
  margin-right: 12px;
}

.mockup-text {
  flex: 1;
}

.mockup-title {
  color: #202124;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
}

.mockup-subtitle {
  color: #5f6368;
  font-size: 12px;
}

.mockup-button {
  background-color: #1a73e8;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
}

.android-popup {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mockup-header {
  color: #202124;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

.mockup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
}

.mockup-action-cancel {
  color: #5f6368;
  font-size: 14px;
  padding: 8px 12px;
}

.mockup-action-install {
  color: #1a73e8;
  font-size: 14px;
  font-weight: bold;
  padding: 8px 12px;
}

/* Browser mockups */
.browser-address-bar {
  background-color: #f2f2f6;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  justify-content: space-between;
}

.mockup-url {
  color: #202124;
  font-size: 14px;
}

.mockup-browser-icon {
  width: 20px;
  height: 20px;
  background-color: #1a73e8;
  border-radius: 50%;
  position: relative;
}

.mockup-browser-icon:before {
  content: '+';
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  line-height: 1;
}

.browser-install-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #1a73e8;
  border-radius: 50%;
  position: relative;
  vertical-align: middle;
}

.browser-install-icon:before {
  content: '+';
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  line-height: 1;
}

.browser-popup {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mockup-popup-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.mockup-popup-icon {
  width: 24px;
  height: 24px;
  background-color: #A67D51;
  border-radius: 4px;
  margin-right: 12px;
}

.mockup-popup-title {
  color: #202124;
  font-size: 16px;
  font-weight: bold;
}

.mockup-popup-content {
  color: #5f6368;
  font-size: 14px;
  margin-bottom: 16px;
}

.mockup-popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.mockup-popup-cancel {
  color: #5f6368;
  font-size: 14px;
  padding: 8px 12px;
}

.mockup-popup-install {
  background-color: #1a73e8;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.note {
  background-color: rgba(166, 125, 81, 0.1);
  border-left: 4px solid var(--color-accent, #A67D51);
  padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  border-radius: var(--radius-sm, 4px);
  margin-top: var(--spacing-lg, 20px);
}

.note p {
  color: var(--color-light, #d3b282);
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

/* Guide footer */
.guide-footer {
  padding: var(--spacing-md, 16px) var(--spacing-lg, 20px);
  border-top: 1px solid var(--color-primary, #6e4f3a);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dont-show-again {
  font-size: 14px;
  color: var(--color-accent, #A67D51);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dont-show-again input {
  margin-right: var(--spacing-sm, 8px);
}

.guide-button {
  background-color: var(--color-accent, #A67D51);
  color: var(--color-darkest, #281D02);
  border: none;
  /* Minimum 48px touch target */
  min-height: var(--touch-target-min, 48px);
  padding: var(--spacing-sm, 8px) var(--spacing-lg, 16px);
  border-radius: var(--radius-md, 8px);
  font-weight: bold;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  -webkit-tap-highlight-color: transparent;
}

.guide-button:hover {
  background-color: var(--color-light, #d3b282);
  transform: translateY(-2px);
}

.guide-button:active {
  transform: scale(0.97);
}

/* Animation for pulsing highlight */
.pulse-highlight {
  animation: pulse-effect 2s infinite;
}

@keyframes pulse-effect {
  0% {
    box-shadow: 0 0 0 0 rgba(166, 125, 81, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(166, 125, 81, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(166, 125, 81, 0);
  }
}

@keyframes button-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
    box-shadow: var(--shadow-md, 0 4px 10px rgba(166, 125, 81, 0.5));
  }
}

/* Transitions - using smooth easing */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: transform 0.3s var(--ease-smooth, cubic-bezier(0.4, 0, 0.2, 1)),
              opacity 0.3s var(--ease-smooth, cubic-bezier(0.4, 0, 0.2, 1));
}

.banner-slide-enter-from,
.banner-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.desktop.banner-slide-enter-from,
.desktop.banner-slide-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s var(--ease-smooth, cubic-bezier(0.4, 0, 0.2, 1));
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Mobile styles - optimized for touch */
@media (max-width: 600px) {
  .banner-content {
    flex-direction: column;
    padding: var(--spacing-md, 16px);
    padding-bottom: var(--spacing-lg, 20px);
  }

  .banner-info {
    margin-bottom: var(--spacing-md, 16px);
    width: 100%;
  }

  .banner-actions {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }

  .install-button,
  .remind-button {
    flex: 1;
    justify-content: center;
  }

  .guide-container {
    width: 95%;
  }

  .guide-footer {
    flex-direction: column;
    gap: var(--spacing-md, 16px);
  }

  .guide-button {
    width: 100%;
    padding: var(--spacing-sm, 12px);
  }
}

/* For very small screens - maintain 48px touch targets */
@media (max-width: 380px) {
  .app-icon {
    width: 42px;
    height: 42px;
    margin-right: var(--spacing-sm, 12px);
  }

  .banner-text h3 {
    font-size: 16px;
  }

  .banner-text p {
    font-size: 12px;
  }

  .install-button,
  .remind-button {
    /* Maintain minimum touch target */
    min-height: var(--touch-target-min, 48px);
    padding: var(--spacing-sm, 8px) var(--spacing-sm, 8px);
    font-size: 13px;
  }

  .install-icon {
    margin-right: 4px;
  }
}

/* Accessibility - reduce motion */
@media (prefers-reduced-motion: reduce) {
  .pulse-highlight,
  .install-button.pulse {
    animation: none !important;
  }

  .banner-slide-enter-active,
  .banner-slide-leave-active,
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition-duration: 0.01ms !important;
  }
}
</style>