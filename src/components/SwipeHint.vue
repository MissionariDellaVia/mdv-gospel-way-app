<template>
  <transition name="fade">
    <div v-if="isVisible && isMobileDevice" class="swipe-tutorial-overlay">
      <div class="tutorial-content">
        <h3 class="tutorial-title">Navigazione Semplice</h3>

        <div class="animation-container">
          <div class="phone-frame">
            <div class="phone-screen">
              <div class="sample-content">
                <div class="sample-date">15 Aprile 2025</div>
                <div class="sample-text"></div>
                <div class="sample-text"></div>
                <div class="sample-text short"></div>
              </div>

              <div class="hand-container">
                <!-- Right swipe animation (finger moves from center to right) -->
                <div class="hand right-swipe">
                  <div class="finger"></div>
                </div>

                <!-- Left swipe animation (finger moves from center to left) -->
                <div class="hand left-swipe">
                  <div class="finger"></div>
                </div>
              </div>

              <div class="direction-labels">
                <div class="direction-label left">
                  <i class="fas fa-chevron-left"></i> Giorno precedente
                </div>
                <div class="direction-label right">
                  Giorno successivo <i class="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tutorial-description">
          Scorri a <strong>sinistra</strong> o <strong>destra</strong> per navigare tra le date
        </div>

        <button @click="dismissTutorial" class="dismiss-button">
          Ho capito
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SwipeHint',
  data() {
    return {
      isVisible: false,
      isMobileDevice: false
    }
  },
  mounted() {
    // Detect if device is mobile
    this.detectMobileDevice();

    // Only check tutorial status if on mobile
    if (this.isMobileDevice) {
      // Check if tutorial has been shown before
      setTimeout(() => {
        this.checkTutorialStatus();
      }, 1000);
    }

    // Re-check device type on resize for responsive designs
    window.addEventListener('resize', this.detectMobileDevice);
  },
  beforeUnmount() {
    // Clean up event listener
    window.removeEventListener('resize', this.detectMobileDevice);
  },
  methods: {
    detectMobileDevice() {
      // Method 1: Check user agent for mobile devices
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Method 2: Check screen width (typical mobile breakpoint)
      const isMobileWidth = window.innerWidth <= 768;

      // Method 3: Check if device has touch capability
      const hasTouchCapability = ('ontouchstart' in window) ||
          (navigator.maxTouchPoints > 0) ||
          (navigator.msMaxTouchPoints > 0);

      // Combine methods for more accurate detection
      // Check user agent for common mobile platforms
      const mobileUserAgentPatterns = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
      ];

      const isMobileUserAgent = mobileUserAgentPatterns.some(pattern => {
        return pattern.test(userAgent);
      });

      // Consider a device mobile if user agent matches OR
      // it's both touch-capable and has mobile screen width
      this.isMobileDevice = isMobileUserAgent || (hasTouchCapability && isMobileWidth);

      // For debugging
      console.log("Device detection:", {
        isMobileUserAgent,
        isMobileWidth,
        hasTouchCapability,
        isMobile: this.isMobileDevice
      });
    },
    checkTutorialStatus() {
      try {
        const hasSeenTutorial = localStorage.getItem('swipeTutorialSeen');
        if (!hasSeenTutorial) {
          this.isVisible = true;
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        // Default to showing tutorial if localStorage fails
        this.isVisible = true;
      }
    },
    dismissTutorial() {
      this.isVisible = false;
      try {
        localStorage.setItem('swipeTutorialSeen', 'true');
      } catch (error) {
        console.error('Error saving tutorial status:', error);
      }
    }
  }
}
</script>

<style scoped>
.swipe-tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(40, 29, 2, 0.9);
  z-index: 10000; /* Higher than all other UI elements */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.tutorial-content {
  background-color: #472b21;
  border: 2px solid #A67D51;
  border-radius: 15px;
  padding: 25px 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.tutorial-title {
  color: #A67D51;
  font-size: 22px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 20px;
}

.animation-container {
  margin: 15px 0 25px 0;
  position: relative;
  height: 240px;
  display: flex;
  justify-content: center;
}

.phone-frame {
  position: relative;
  width: 180px;
  height: 240px;
  background-color: #281D02;
  border-radius: 20px;
  padding: 12px;
  border: 2px solid #6e4f3a;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.phone-screen {
  width: 100%;
  height: 100%;
  background-color: #6e4f3a;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.sample-content {
  padding: 15px 10px;
}

.sample-date {
  font-size: 16px;
  font-weight: bold;
  color: #d3b282;
  margin-bottom: 15px;
}

.sample-text {
  height: 12px;
  background-color: rgba(211, 178, 130, 0.6);
  border-radius: 4px;
  margin: 10px 0;
}

.sample-text.short {
  width: 65%;
}

.hand-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hand {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(166, 125, 81, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  /* Center the hand vertically in the screen */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hand.right-swipe {
  animation: right-swipe 4s infinite 0.5s;
}

.hand.left-swipe {
  animation: left-swipe 4s infinite 2.5s;
}

.finger {
  width: 14px;
  height: 14px;
  background-color: rgba(211, 178, 130, 1);
  border-radius: 50%;
}

.direction-labels {
  position: absolute;
  bottom: 15px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}

.direction-label {
  font-size: 11px;
  color: rgba(211, 178, 130, 0.8);
  opacity: 0;
  transition: opacity 0.3s;
}

.direction-label.left {
  text-align: left;
  animation: fade-left 4s infinite 2.5s;
}

.direction-label.right {
  text-align: right;
  animation: fade-right 4s infinite 0.5s;
}

.tutorial-description {
  color: #d3b282;
  font-size: 16px;
  margin: 20px 0;
  line-height: 1.5;
}

strong {
  color: #A67D51;
}

.dismiss-button {
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

.dismiss-button:hover {
  background-color: #d3b282;
  transform: scale(1.05);
}

.dismiss-button:active {
  transform: scale(0.98);
}

/* Fixed animations that move from center */
@keyframes right-swipe {
  0%, 45%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%);
  }
  5% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  40% {
    opacity: 1;
    transform: translate(10px, -50%); /* Move right from center */
  }
}

@keyframes left-swipe {
  0%, 45%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%);
  }
  5% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  40% {
    opacity: 1;
    transform: translate(-110%, -50%); /* Move left from center */
  }
}

@keyframes fade-right {
  0%, 5%, 45%, 100% { opacity: 0; }
  10%, 40% { opacity: 1; }
}

@keyframes fade-left {
  0%, 5%, 45%, 100% { opacity: 0; }
  10%, 40% { opacity: 1; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Make the tutorial more compact on small screens */
@media (max-height: 600px) {
  .animation-container {
    height: 200px;
  }

  .phone-frame {
    width: 150px;
    height: 200px;
  }

  .tutorial-title {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .tutorial-description {
    margin: 10px 0;
  }
}
</style>