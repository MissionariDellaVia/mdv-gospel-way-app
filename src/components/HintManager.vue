<template>
  <div>
    <!-- Simple help button with pulse animation -->
    <div class="help-button-container">
      <button
          @click="toggleHintMenu"
          class="help-button"
          :class="{ 'pulse-notification': anyNewHints, 'active': showHintMenu }"
          aria-label="Aiuto e suggerimenti"
      >
        <i class="fa-solid fa-question"></i>
      </button>
    </div>

    <!-- Hint menu dropdown -->
    <transition name="fade">
      <div v-if="showHintMenu" class="hint-menu-overlay" @click="closeHintMenu">
        <div class="hint-menu" @click.stop>
          <h3>Guide e Suggerimenti</h3>

          <div class="hint-options">
            <!-- Add the new zoom hint button -->
            <button @click="showCarousel('zoom')" class="hint-button">
              <i class="fa-solid fa-text-height"></i>
              <div>
                <strong>Dimensione del testo</strong>
                <small>Come ingrandire o ridurre il testo</small>
              </div>
              <span class="new-badge" v-if="!seenHints.zoom">Nuovo</span>
            </button>

            <button @click="showCarousel('swipe')" class="hint-button">
              <i class="fa-solid fa-calendar-week"></i>
              <div>
                <strong>Navigazione tra giorni</strong>
                <small>Scorri per passare da un giorno all'altro</small>
              </div>
              <span class="new-badge" v-if="!seenHints.swipe">Nuovo</span>
            </button>

            <button @click="showCarousel('ptr')" class="hint-button">
              <i class="fa-solid fa-arrows-rotate"></i>
              <div>
                <strong>Aggiorna contenuti</strong>
                <small>Come aggiornare l'app</small>
              </div>
              <span class="new-badge" v-if="!seenHints.ptr">Nuovo</span>
            </button>

            <button @click="showCarousel('install')" class="hint-button">
              <i class="fa-solid fa-download"></i>
              <div>
                <strong>Installazione app</strong>
                <small>Installa l'app sul tuo dispositivo</small>
              </div>
              <span class="new-badge" v-if="!seenHints.install">Nuovo</span>
            </button>
          </div>

          <button @click="closeHintMenu" class="close-button">
            Chiudi
          </button>
        </div>
      </div>
    </transition>

    <!-- Unified Hint Carousel -->
    <hint-carousel
        :visible="showingCarousel"
        :slides="carouselSlides"
        :initial-slide="carouselInitialSlide"
        :install-available="installButtonAvailable"
        @update:visible="showingCarousel = $event"
        @close="onCarouselClose"
        @install-app="installApp"
    />
  </div>
</template>

<script>
import HintCarousel from './hints/HintCarousel.vue';
import SwipeAnimation from './hints/SwipeAnimation.vue';
import PtrAnimation from './hints/PtrAnimation.vue';
import InstallAnimation from './hints/InstallAnimation.vue';
import ZoomAnimation from './hints/ZoomAnimation.vue';

export default {
  name: 'HintManager',
  components: {
    HintCarousel
  },
  data() {
    return {
      showHintMenu: false,
      showingCarousel: false,
      currentHintType: null,
      carouselInitialSlide: 0,
      // Track which hints are seen (add zoom)
      seenHints: {
        zoom: false,
        swipe: false,
        ptr: false,
        install: false
      },
      isAndroid: false,
      isIOS: false,
      deferredPrompt: null
    }
  },
  computed: {
    anyNewHints() {
      return !this.seenHints.zoom || !this.seenHints.swipe || !this.seenHints.ptr || !this.seenHints.install;
    },
    carouselSlides() {
      // Return the appropriate slides based on the current hint type
      switch(this.currentHintType) {
          // Add zoom case
        case 'zoom': {
          return [
            {
              component: ZoomAnimation,
              title: 'Regola dimensione del testo',
              description: 'Tocca l\'icona in basso a destra per controllare lo zoom del testo'
            },
            {
              component: ZoomAnimation,
              title: 'Usa i controlli di zoom',
              description: 'Premi + per ingrandire, - per ridurre il testo del vangelo'
            },
            {
              component: ZoomAnimation,
              props: { showKeyboardShortcuts: true },
              title: 'Scorciatoie da tastiera',
              description: 'Su computer, usa Ctrl++ e Ctrl+- per regolare il testo'
            }
          ];
        }

        case 'swipe': {
          return [
            {
              component: SwipeAnimation,
              title: 'Scorri per navigare',
              description: 'Scorri a sinistra o a destra per navigare tra i giorni'
            },
            {
              // Using SwipeAnimation but with navButtons prop set to true
              component: SwipeAnimation,
              props: { showNavButtons: true },
              title: 'Navigazione con frecce',
              description: 'Puoi usare i simboli < e > in alto per passare da un giorno all\'altro'
            }
          ];
        }

        case 'ptr': {
          return [
            {
              component: PtrAnimation,
              title: 'Aggiorna i contenuti',
              description: 'Trascina verso il basso per aggiornare i contenuti dell\'app'
            },
            {
              component: PtrAnimation,
              title: 'Contenuti sempre aggiornati',
              description: 'L\'app si aggiorna automaticamente, ma puoi forzare l\'aggiornamento quando vuoi'
            }
          ];
        }

        case 'install': {
          const deviceType = this.isIOS ? 'iOS' : (this.isAndroid ? 'Android' : 'computer');
          return [
            {
              component: InstallAnimation,
              title: `Installa su ${deviceType}`,
              description: this.getInstallDescription()
            },
            {
              component: InstallAnimation,
              title: 'Accesso offline',
              description: 'Dopo l\'installazione, potrai usare l\'app anche senza connessione'
            }
          ];
        }

        default:
          return [];
      }
    },
    installButtonAvailable() {
      return !!this.deferredPrompt;
    }
  },
  mounted() {
    this.detectPlatform();
    this.loadSeenHintsFromStorage();

    // Listen for beforeinstallprompt event for PWA install
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

    // Auto-show zoom hint if it hasn't been seen (optional)
    if (!this.seenHints.zoom) {
      setTimeout(() => {
        this.showCarousel('zoom');
      }, 2000);
    }
  },
  methods: {
    toggleHintMenu() {
      this.showHintMenu = !this.showHintMenu;
    },

    closeHintMenu() {
      this.showHintMenu = false;
    },

    showCarousel(type) {
      this.closeHintMenu();
      this.currentHintType = type;
      this.carouselInitialSlide = 0;
      this.showingCarousel = true;

      // Mark this hint as seen
      this.markHintAsSeen(type);
    },

    onCarouselClose() {
      if (this.currentHintType) {
        this.markHintAsSeen(this.currentHintType);
      }
      this.currentHintType = null;
    },

    markHintAsSeen(type) {
      this.seenHints[type] = true;
      this.saveSeenHintsToStorage();
    },

    loadSeenHintsFromStorage() {
      try {
        // Load seen status for each hint
        const zoomSeen = localStorage.getItem('zoomTutorialSeen') === 'true';
        const swipeSeen = localStorage.getItem('swipeTutorialSeen') === 'true';
        const ptrSeen = localStorage.getItem('ptrTutorialSeen') === 'true';
        const installSeen = localStorage.getItem('installTutorialSeen') === 'true';

        this.seenHints = {
          zoom: zoomSeen,
          swipe: swipeSeen,
          ptr: ptrSeen,
          install: installSeen
        };
      } catch (error) {
        console.error('Error loading hint status:', error);
      }
    },

    saveSeenHintsToStorage() {
      try {
        localStorage.setItem('zoomTutorialSeen', this.seenHints.zoom);
        localStorage.setItem('swipeTutorialSeen', this.seenHints.swipe);
        localStorage.setItem('ptrTutorialSeen', this.seenHints.ptr);
        localStorage.setItem('installTutorialSeen', this.seenHints.install);
      } catch (error) {
        console.error('Error saving hint status:', error);
      }
    },

    detectPlatform() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Check for iOS
      this.isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

      // Check for Android
      this.isAndroid = /android/i.test(userAgent);
    },

    getInstallDescription() {
      if (this.installButtonAvailable) {
        return 'Tocca il pulsante qui sotto per installare l\'app';
      } else if (this.isIOS) {
        return 'Tocca l\'icona di condivisione e poi "Aggiungi a Home"';
      } else if (this.isAndroid) {
        return 'Tocca i tre puntini in alto a destra e poi "Installa app"';
      } else {
        return 'Su Chrome o Edge, clicca sull\'icona d\'installazione nella barra degli indirizzi';
      }
    },

    // Install the PWA
    installApp() {
      if (!this.deferredPrompt) return;

      // Show the install prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
      });
    }
  }
}
</script>
<style scoped>
/* Simple help button container */
.help-button-container {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 7000;
}

/* Simple minimalist help button */
.help-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #A67D51;
  color: #281D02;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.help-button:hover {
  background: #b28a5a;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.help-button:active, .help-button.active {
  transform: translateY(0);
  background: #996c45;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* Pulse animation for new hints */
.help-button.pulse-notification {
  animation: button-pulse 2s infinite;
}

@keyframes button-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(211, 178, 130, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(211, 178, 130, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(211, 178, 130, 0);
  }
}

/* Hint menu overlay */
.hint-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(40, 29, 2, 0.7);
  z-index: 8000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hint-menu {
  background-color: #58412b;
  border: 1px solid #A67D51;
  border-radius: 12px;
  padding: 20px;
  width: 85%;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

h3 {
  color: #d3b282;
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
}

.hint-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.hint-button {
  background-color: #6e4f3a;
  color: #d3b282;
  border: 1px solid #A67D51;
  border-radius: 8px;
  padding: 12px 15px;
  font-size: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  text-align: left;
}

.hint-button i {
  font-size: 18px;
  margin-right: 15px;
  color: #A67D51;
}

.hint-button div {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.hint-button small {
  opacity: 0.8;
  font-size: 12px;
  margin-top: 2px;
}

.hint-button:hover {
  background-color: #7a5940;
}

.new-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 8px;
  font-weight: bold;
}

.close-button {
  background-color: #A67D51;
  color: #281D02;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #b28a5a;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .help-button-container {
    top: 10px;
    left: 10px;
  }

  .hint-menu {
    width: 90%;
    padding: 15px;
  }
}
</style>