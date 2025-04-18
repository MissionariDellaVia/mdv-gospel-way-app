<template>
  <div>
    <!-- Enhanced help button -->
    <div class="help-button-container">
      <button
          @click="toggleHintMenu"
          @mouseenter="showTooltip = true"
          @mouseleave="showTooltip = false"
          class="help-button"
          :class="{ 'pulse-notification': anyNewHints, 'active': showHintMenu }"
          aria-label="Aiuto e suggerimenti"
      >
        <!-- Subtle glow behind the icon -->
        <div class="button-glow" :class="{ 'active': anyNewHints }"></div>

        <!-- Icon -->
        <i class="fa-solid fa-circle-question"></i>
      </button>

      <!-- Tooltip moved to the right -->
      <div class="help-tooltip" :class="{ 'active': showTooltip }">
        <div class="tooltip-arrow"></div>
        <span>Aiuto e suggerimenti</span>
      </div>
    </div>

    <!-- Hint menu dropdown -->
    <transition name="fade">
      <div v-if="showHintMenu" class="hint-menu-overlay" @click="closeHintMenu">
        <div class="hint-menu" @click.stop>
          <h3>Guide e Suggerimenti</h3>

          <div class="hint-options">
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
      showTooltip: false,
      // Track which hints are seen
      seenHints: {
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
      return !this.seenHints.swipe || !this.seenHints.ptr || !this.seenHints.install;
    },
    carouselSlides() {
      // Return the appropriate slides based on the current hint type
      switch(this.currentHintType) {
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

    // Auto-show hints removed as requested
  },
  methods: {
    toggleHintMenu() {
      this.showHintMenu = !this.showHintMenu;
      this.showTooltip = false;
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
        const swipeSeen = localStorage.getItem('swipeTutorialSeen') === 'true';
        const ptrSeen = localStorage.getItem('ptrTutorialSeen') === 'true';
        const installSeen = localStorage.getItem('installTutorialSeen') === 'true';

        this.seenHints = {
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
/* Enhanced help button styles */
.help-button-container {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 7000;
}

/* Tooltip positioned to the right of the button */
.help-tooltip {
  position: absolute;
  top: 50%;
  left: calc(100% + 10px); /* Position to the right with 10px gap */
  transform: translateY(-50%) scale(0.7);
  background-color: rgba(40, 29, 2, 0.9);
  color: #D3B282;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 7001;
}

.help-tooltip.active {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

.tooltip-arrow {
  position: absolute;
  top: 50%;
  left: -6px; /* Position arrow on the left side */
  transform: translateY(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background-color: rgba(40, 29, 2, 0.9);
}

.help-button {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b28a5a, #A67D51);
  color: #281D02;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

/* Subtle 3D lighting effect */
.help-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
  pointer-events: none;
}

/* Glow effect behind icon */
.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(211, 178, 130, 0.6) 0%, rgba(211, 178, 130, 0) 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.button-glow.active {
  opacity: 1;
}

.help-button:hover {
  transform: translateY(-3px) rotate(3deg);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.4);
  background: linear-gradient(135deg, #c69b6a, #b28a5a);
}

.help-button:active, .help-button.active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #996c45, #A67D51);
}

/* Replaced red dot with pulse effect */
.help-button.pulse-notification {
  animation: button-pulse 2s infinite;
}

@keyframes button-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(211, 178, 130, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(211, 178, 130, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(211, 178, 130, 0);
  }
}

/* Rest of your existing HintManager styles */
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
  border: 2px solid #A67D51;
  border-radius: 15px;
  padding: 25px;
  width: 85%;
  max-width: 350px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  animation: menu-appear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform-origin: top left;
}

@keyframes menu-appear {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

h3 {
  color: #d3b282;
  font-size: 22px;
  margin-top: 0;
  margin-bottom: 20px;
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
  transition: all 0.25s ease;
  position: relative;
  text-align: left;
}

.hint-button i {
  font-size: 20px;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hint-button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.new-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.close-button {
  background-color: #A67D51;
  color: #281D02;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #d3b282;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.close-button:active {
  transform: scale(0.98);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Improved Mobile Experience */
@media (max-width: 768px) {
  .help-button-container {
    top: 10px;
    left: 10px;
  }

  .help-tooltip {
    display: none;
  }
}
</style>