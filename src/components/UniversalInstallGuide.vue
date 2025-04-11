<template>
  <div v-if="showGuide" class="install-guide" :class="deviceType">
    <button @click="closeGuide" class="close-guide-button">
      <span class="close-icon">×</span>
    </button>
    <div class="guide-content">
      <h3>{{ guideTitle }}</h3>

      <!-- iOS Instructions -->
      <div v-if="deviceType === 'ios'" class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">Tocca l'icona di condivisione
            <span class="ios-share-icon">
              <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6V18M10 6L6 10M10 6L14 10" stroke="#A67D51" stroke-width="2" stroke-linecap="round"/>
                <path d="M3 15V21C3 22.6569 4.34315 24 6 24H14C15.6569 24 17 22.6569 17 21V15" stroke="#A67D51" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span> in basso sullo schermo
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">Scorri in basso e tocca <strong>"Aggiungi a Home"</strong></div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">Tocca <strong>"Aggiungi"</strong> nell'angolo in alto a destra</div>
        </div>
      </div>

      <!-- Android Chrome Instructions -->
      <div v-else-if="deviceType === 'android-chrome'" class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">Tocca il menu
            <span class="android-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" stroke="#A67D51" stroke-width="2"/>
                <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" stroke="#A67D51" stroke-width="2"/>
                <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" stroke="#A67D51" stroke-width="2"/>
              </svg>
            </span> (tre punti) in alto a destra
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">Seleziona <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong></div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">Tocca <strong>"Installa"</strong> nella finestra di dialogo</div>
        </div>
      </div>

      <!-- Android Samsung Internet Instructions -->
      <div v-else-if="deviceType === 'android-samsung'" class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">Tocca il menu
            <span class="android-menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" stroke="#A67D51" stroke-width="2"/>
                <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" stroke="#A67D51" stroke-width="2"/>
                <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" stroke="#A67D51" stroke-width="2"/>
              </svg>
            </span> (tre punti) in basso a destra
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">Seleziona <strong>"Aggiungi pagina a"</strong></div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">Tocca <strong>"Schermata Home"</strong></div>
        </div>
      </div>

      <!-- Generic Instructions (fallback) -->
      <div v-else class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">Apri il menu del browser (di solito tre punti o linee)</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">Cerca un'opzione come <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong></div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">Segui le istruzioni per completare l'installazione</div>
        </div>
      </div>

      <button
          @click="tryAutoInstall"
          v-if="canUseInstallPrompt"
          class="install-now-button"
      >
        Installa Ora
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UniversalInstallGuide',
  data() {
    return {
      showGuide: false,
      deviceType: 'unknown',
      deferredPrompt: null,
      canUseInstallPrompt: false
    }
  },
  computed: {
    guideTitle() {
      if (this.deviceType === 'ios') {
        return 'Installa La Via del Vangelo su iOS';
      } else if (this.deviceType.startsWith('android')) {
        return 'Installa La Via del Vangelo su Android';
      } else {
        return 'Installa La Via del Vangelo';
      }
    }
  },
  mounted() {
    this.detectDevice();

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator.standalone === true)) {
      console.log("App is already installed, not showing install guide");
      return;
    }

    // Check if user previously dismissed the guide
    const dismissed = localStorage.getItem('installGuideDismissed');
    if (dismissed) {
      const dismissalTime = parseInt(dismissed);
      const now = Date.now();
      const daysSinceDismissal = (now - dismissalTime) / (1000 * 60 * 60 * 24);

      // If dismissed less than 7 days ago, don't show again
      if (daysSinceDismissal < 7) {
        console.log("Install guide was dismissed less than 7 days ago");
        return;
      }
    }

    // For Android/Chrome, listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      this.deferredPrompt = e;
      this.canUseInstallPrompt = true;
    });

    // Show the guide quickly after the page loads
    setTimeout(() => {
      this.showGuide = true;
    }, 1000); // Just 1 second delay to allow the main content to load first
  },
  methods: {
    detectDevice() {
      const ua = navigator.userAgent.toLowerCase();

      // iOS detection
      if (/ipad|iphone|ipod/.test(ua) && !window.MSStream) {
        this.deviceType = 'ios';
        return;
      }

      // Android detection
      if (/android/.test(ua)) {
        // Check for Samsung Internet Browser
        if (/samsungbrowser/.test(ua)) {
          this.deviceType = 'android-samsung';
        } else if (/chrome/.test(ua)) {
          this.deviceType = 'android-chrome';
        } else {
          this.deviceType = 'android-other';
        }
        return;
      }

      // Default fallback
      this.deviceType = 'unknown';
    },
    closeGuide() {
      this.showGuide = false;
      localStorage.setItem('installGuideDismissed', Date.now().toString());
    },
    async tryAutoInstall() {
      if (!this.deferredPrompt) {
        console.warn("No installation prompt available");
        return;
      }

      try {
        // Show the browser's install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // If the user accepted, hide our guide
        if (outcome === 'accepted') {
          this.closeGuide();
        }

        // Clear the saved prompt
        this.deferredPrompt = null;
        this.canUseInstallPrompt = false;
      } catch (error) {
        console.error("Error during installation attempt:", error);
      }
    }
  }
}
</script>

<style scoped>
.install-guide {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 350px;
  background-color: #472b21;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  padding: 20px;
  z-index: 9999;
  border: 2px solid #A67D51;
  animation: slide-up 0.5s ease;
}

@keyframes slide-up {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.close-guide-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  padding: 5px;
  cursor: pointer;
  color: #d3b282;
}

.guide-content {
  padding-right: 20px;
}

.guide-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #A67D51;
  text-align: center;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.step {
  display: flex;
  align-items: flex-start;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #A67D51;
  color: #281D02FF;
  border-radius: 50%;
  font-weight: bold;
  font-size: 16px;
  margin-right: 10px;
  flex-shrink: 0;
}

.step-text {
  font-size: 14px;
  line-height: 1.4;
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: #d3b282;
}

.ios-share-icon, .android-menu-icon {
  display: inline-block;
  margin: 0 5px;
  vertical-align: middle;
}

strong {
  color: #A67D51;
}

.install-now-button {
  display: block;
  background-color: #A67D51;
  color: #281D02FF;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  margin: 20px auto 0;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.install-now-button:hover {
  background-color: #d3b282;
  transform: scale(1.05);
}

.install-now-button:active {
  transform: scale(0.98);
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .install-guide {
    width: 95%;
    max-width: none;
    bottom: 10px;
  }
}
</style>