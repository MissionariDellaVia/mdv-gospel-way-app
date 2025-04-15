<template>
  <div v-if="showGuide" class="install-guide" :class="deviceType">
    <button @click="closeGuide" class="close-guide-button">
      <span class="close-icon">×</span>
    </button>
    <div class="guide-content">
      <h3>{{ guideTitle }}</h3>

      <!-- Auto Install Button prominente -->
      <button
          v-if="canUseInstallPrompt"
          @click="tryAutoInstall"
          class="install-now-button primary-action"
      >
        Installa Ora
      </button>

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

      <!-- Android Instructions (unified) -->
      <div v-else-if="deviceType.startsWith('android')" class="steps">
        <div v-if="!canUseInstallPrompt" class="no-prompt-note">
          Per installare automaticamente, tocca <strong>"Installa Ora"</strong> sopra.
          Se non funziona, segui questi passaggi:
        </div>

        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">
            Tocca il menu <strong>⋮</strong> (tre punti)
            <span v-if="deviceType === 'android-samsung'">in basso</span>
            <span v-else>in alto</span>
            a destra
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">
            Cerca una delle seguenti opzioni:
            <ul>
              <li><strong>Installa app</strong></li>
              <li><strong>Aggiungi a schermata Home</strong></li>
              <li><strong>Installa La Via del Vangelo</strong></li>
            </ul>
          </div>
        </div>

        <!-- Sony-specific instructions -->
        <div v-if="isSonyDevice" class="step sony-specific">
          <div class="step-number">3</div>
          <div class="step-text">
            Su dispositivi Sony: tocca <strong>Impostazioni sito</strong> e poi <strong>Aggiungi a schermata Home</strong>
          </div>
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
      </div>
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
      canUseInstallPrompt: false,
      isSonyDevice: false
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
    this.checkIfAlreadyInstalled();
    this.setupInstallListeners();

    // Show guide after verification
    setTimeout(() => {
      if (!this.isAppInstalled()) {
        this.showGuide = true;
      }
    }, 1500);
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
        // Sony detection
        if (/sony/.test(ua) || /sonyericsson/.test(ua) || /xperia/.test(ua)) {
          this.deviceType = 'android-sony';
          this.isSonyDevice = true;
        } else if (/samsungbrowser/.test(ua)) {
          this.deviceType = 'android-samsung';
        } else if (/chrome/.test(ua)) {
          this.deviceType = 'android-chrome';
        } else {
          this.deviceType = 'android-other';
        }
        return;
      }

      this.deviceType = 'unknown';
    },

    isAppInstalled() {
      return window.matchMedia('(display-mode: standalone)').matches ||
          window.navigator.standalone === true;
    },

    checkIfAlreadyInstalled() {
      if (this.isAppInstalled()) {
        console.log("App is already installed");
        return true;
      }

      // Check if user previously dismissed
      const dismissed = localStorage.getItem('installGuideDismissed');
      if (dismissed) {
        const dismissalTime = parseInt(dismissed);
        const daysSinceDismissal = (Date.now() - dismissalTime) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissal < 7) {
          console.log("Install guide dismissed recently");
          return true;
        }
      }

      return false;
    },

    setupInstallListeners() {
      // For Chrome and compatible browsers
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.canUseInstallPrompt = true;

        // Backup auto-install prompt
        // If not shown within 3 seconds after page load, try auto-installation
        if (this.deviceType.startsWith('android')) {
          setTimeout(() => {
            if (this.deferredPrompt && !this.isAppInstalled()) {
              this.tryAutoInstall();
            }
          }, 3000);
        }
      });

      // Track successful installation
      window.addEventListener('appinstalled', () => {
        console.log('Installazione completata!');
        this.showGuide = false;
        localStorage.setItem('appInstalled', 'true');
      });
    },

    closeGuide() {
      this.showGuide = false;
      localStorage.setItem('installGuideDismissed', Date.now().toString());
    },

    async tryAutoInstall() {
      if (!this.deferredPrompt) {
        console.warn("Nessun prompt di installazione disponibile");
        return;
      }

      try {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`Risposta all'installazione: ${outcome}`);

        if (outcome === 'accepted') {
          this.closeGuide();
        }

        this.deferredPrompt = null;
        this.canUseInstallPrompt = false;
      } catch (error) {
        console.error("Errore durante l'installazione:", error);
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

.primary-action {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(166, 125, 81, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(166, 125, 81, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(166, 125, 81, 0);
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
  margin-top: 15px;
}

.no-prompt-note {
  padding: 10px;
  margin-bottom: 15px;
  border-left: 3px solid #A67D51;
  color: #d3b282;
  font-size: 14px;
}

.step {
  display: flex;
  align-items: flex-start;
}

.sony-specific {
  background-color: rgba(166, 125, 81, 0.1);
  padding: 10px;
  border-radius: 5px;
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

.step-text ul {
  width: 100%;
  margin: 5px 0;
  padding-left: 20px;
}

.step-text li {
  margin-bottom: 3px;
}

strong {
  color: #A67D51;
}

.install-now-button {
  display: block;
  background-color: #A67D51;
  color: #281D02FF;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: bold;
  margin: 0 auto 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
  width: 80%;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.install-now-button:hover {
  background-color: #d3b282;
  transform: scale(1.05);
}

.install-now-button:active {
  transform: scale(0.98);
}

@media (max-width: 480px) {
  .install-guide {
    width: 95%;
    max-width: none;
    bottom: 10px;
  }
}
</style>