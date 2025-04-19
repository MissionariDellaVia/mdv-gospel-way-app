<template>
  <div class="zoom-animation">
    <div class="device-screen">
      <!-- Mock webpage content -->
      <div class="mock-content">
        <div class="mock-header">Vangelo del Giorno</div>
        <div class="mock-text" :style="{fontSize: zoomMultiplier + 'rem'}">
          Dal vangelo secondo Marco
        </div>
        <div class="mock-paragraph" :style="{fontSize: 0.8 * zoomMultiplier + 'rem'}">
          In quel tempo, si avvicinarono a Gesù i farisei e alcuni degli scribi, venuti da Gerusalemme. Avendo visto che alcuni dei suoi discepoli...
        </div>
      </div>

      <!-- Zoom toggle button simulation -->
      <div class="zoom-toggle" :class="{'pulse': step === 0, 'expanded': showControls}" @click="toggleControls">
        <i class="fa-solid fa-text-height"></i>
      </div>

      <!-- Finger indicator -->
      <div v-if="step === 0" class="finger-indicator" :class="{'tap': fingerTap}">
        <div class="finger-dot"></div>
      </div>

      <!-- Zoom controls -->
      <transition name="fade">
        <div v-if="showControls" class="zoom-controls">
          <button
              class="zoom-button"
              :class="{'pulse': step === 1 && highlightMinus}"
              @click="decreaseZoom">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="zoom-level">{{ zoomLevel }}%</span>
          <button
              class="zoom-button"
              :class="{'pulse': step === 1 && !highlightMinus}"
              @click="increaseZoom">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </transition>

      <!-- Keyboard shortcut overlay -->
      <div v-if="step === 2 && showKeyboardShortcuts" class="keyboard-shortcut">
        <div class="shortcut-text">
          <strong>Scorciatoie da tastiera:</strong><br>
          <kbd>Ctrl</kbd> + <kbd>+</kbd> = Ingrandisci<br>
          <kbd>Ctrl</kbd> + <kbd>-</kbd> = Riduci
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZoomAnimation',
  props: {
    showKeyboardShortcuts: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      step: 0,
      showControls: false,
      zoomLevel: 100,
      fingerTap: false,
      highlightMinus: false,
      intervalId: null
    }
  },
  computed: {
    zoomMultiplier() {
      return this.zoomLevel / 100;
    }
  },
  mounted() {
    this.startAnimation();
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  methods: {
    toggleControls() {
      this.showControls = !this.showControls;
    },
    increaseZoom() {
      if (this.zoomLevel < 200) {
        this.zoomLevel += 10;
      }
    },
    decreaseZoom() {
      if (this.zoomLevel > 80) {
        this.zoomLevel -= 10;
      }
    },
    startAnimation() {
      let animationStep = 0;

      this.intervalId = setInterval(() => {
        // Reset for new cycle
        if (animationStep % 24 === 0) {
          this.step = 0;
          this.showControls = false;
          this.zoomLevel = 100;
          this.fingerTap = false;
        }

        // Step 0: Show finger tap on zoom toggle
        if (animationStep % 24 < 4) {
          this.step = 0;
          this.fingerTap = animationStep % 2 === 0;

          if (animationStep % 4 === 3) {
            this.showControls = true;
          }
        }
        // Step 1: Show zoom controls interaction
        else if (animationStep % 24 < 16) {
          this.step = 1;

          // Alternate between plus and minus buttons
          const cyclePos = animationStep % 8;

          if (cyclePos === 0) {
            this.highlightMinus = false;
          } else if (cyclePos === 1) {
            this.zoomLevel += 10;
          } else if (cyclePos === 4) {
            this.highlightMinus = true;
          } else if (cyclePos === 5) {
            this.zoomLevel -= 10;
          }
        }
        // Step 2: Show keyboard shortcuts
        else {
          this.step = 2;
        }

        animationStep++;
      }, 1000);
    }
  }
}
</script>

<style scoped>
.zoom-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.device-screen {
  width: 230px;
  height: 210px;
  background: #f8f8f8;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  padding: 15px;
}

.mock-content {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.mock-header {
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: #A67D51;
  margin-bottom: 15px;
}

.mock-text {
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  transition: font-size 0.3s;
  color: #6e4f3a;
}

.mock-paragraph {
  text-align: justify;
  line-height: 1.3;
  transition: font-size 0.3s;
  color: #281D02;
}

/* Zoom toggle button */
.zoom-toggle {
  position: absolute;
  bottom: 20px;
  right: 15px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #6e4f3a;
  color: #d3b282;
  border: 2px solid #d3b282;
  box-shadow: 0 4px 12px rgba(40, 29, 2, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  transition: all 0.3s ease;
}

.zoom-toggle.pulse {
  animation: button-pulse 1.5s infinite;
}

.zoom-toggle.expanded {
  background-color: #58412b;
  transform: rotate(180deg);
}

/* Zoom controls styling */
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 60px;
  display: flex;
  align-items: center;
  background-color: #6e4f3a;
  border: 2px solid #d3b282;
  border-radius: 20px;
  padding: 6px 10px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(40, 29, 2, 0.25);
}

.zoom-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #d3b282;
  background-color: #6e4f3a;
  color: #d3b282;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-button.pulse {
  animation: button-pulse 1.5s infinite;
}

.zoom-level {
  margin: 0 8px;
  color: #d3b282;
  font-size: 12px;
  min-width: 40px;
  text-align: center;
}

/* Finger indicator */
.finger-indicator {
  position: absolute;
  bottom: 20px;
  right: 15px;
  z-index: 102;
  transform: translate(-10px, -10px);
}

.finger-indicator.tap {
  animation: tap-animation 0.3s ease-in-out;
}

.finger-dot {
  width: 20px;
  height: 20px;
  background: rgba(240, 238, 237, 0.36);
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.3);
}

/* Keyboard shortcut overlay */
.keyboard-shortcut {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(40, 29, 2, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.5s ease;
}

.shortcut-text {
  background-color: white;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  line-height: 1.5;
  font-size: 0.9rem;
}

kbd {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px 4px;
  font-family: monospace;
  font-size: 0.9em;
}

/* Animation keyframes */
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

@keyframes tap-animation {
  0% {
    transform: translate(-10px, -10px) scale(1);
  }
  50% {
    transform: translate(-10px, -10px) scale(0.8);
  }
  100% {
    transform: translate(-10px, -10px) scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>