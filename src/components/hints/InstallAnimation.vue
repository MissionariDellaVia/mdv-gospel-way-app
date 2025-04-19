<template>
  <div class="install-animation">
    <div class="device-screen" :class="deviceType">
      <!-- iOS-specific UI (Safari-style) -->
      <div v-if="deviceType === 'ios'" class="ios-browser">
        <!-- Top URL bar - slimmer -->
        <div class="ios-browser-top">
          <div class="ios-url-bar">
            <i class="fa-solid fa-lock fa-xs"></i>
            <span>ViaDelVangelo</span>
          </div>
        </div>

        <!-- Content area - smaller to fit everything -->
        <div class="ios-browser-content">
          <div class="app-icon mini"></div>
          <div class="app-name">ViaDelVangelo</div>
        </div>

        <!-- Bottom toolbar -->
        <div class="ios-browser-toolbar">
          <div class="ios-toolbar-button">
            <i class="fa-solid fa-arrow-left"></i>
          </div>
          <div class="ios-share-button" :class="{'pulse': isHighlighted}">
            <i class="fa-solid fa-arrow-up-from-bracket"></i>
          </div>
          <div class="ios-toolbar-button">
            <i class="fa-solid fa-table-cells"></i>
          </div>
        </div>

        <!-- iOS share sheet (appears after clicking share) - compact version -->
        <div v-if="showPrompt" class="ios-share-sheet">
          <div class="ios-sheet-header">
            <div class="sheet-app-icon"></div>
            <div class="sheet-app-url">ViaDelVangelo</div>
          </div>

          <div class="ios-sheet-actions">
            <div class="ios-action">
              <div class="ios-action-icon gray">
                <i class="fa-solid fa-message"></i>
              </div>
              <div class="ios-action-text">Messaggi</div>
            </div>
            <div class="ios-action highlight" :class="{'pulse-highlight': showSecondStep}">
              <div class="ios-action-icon blue">
                <i class="fa-solid fa-square-plus"></i>
              </div>
              <div class="ios-action-text">Aggiungi a Home</div>
            </div>
            <div class="ios-action">
              <div class="ios-action-icon gray">
                <i class="fa-solid fa-share"></i>
              </div>
              <div class="ios-action-text">Condividi</div>
            </div>
          </div>
        </div>

        <!-- Click indicator -->
        <div v-if="isHighlighted" class="ios-click-indicator">
          <div class="finger-dot"></div>
        </div>

        <!-- iOS final add to home screen dialog -->
        <div v-if="showFinalStep" class="ios-add-to-home-dialog">
          <div class="ios-dialog-content">
            <div class="ios-dialog-icon">
              <div class="app-icon mini"></div>
            </div>
            <div class="ios-dialog-title">Aggiungi a Home</div>
            <div class="ios-dialog-text">Questa app web sarà installata sulla Home</div>
            <button class="ios-dialog-button">Aggiungi</button>
          </div>
        </div>
      </div>

      <!-- Android-specific UI -->
      <div v-else-if="deviceType === 'android'" class="browser-bar">
        <div class="url-bar">ViaDelVangelo</div>
        <div class="menu-button" :class="{'pulse': isHighlighted}">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
      </div>

      <!-- Desktop-specific UI -->
      <div v-else class="browser-bar">
        <div class="url-bar">
          <span class="url-protocol">https://</span>ViaDelVangelo
          <span v-if="isHighlighted" class="install-icon">
            <i class="fa-solid fa-plus-square"></i>
          </span>
        </div>
      </div>

      <!-- Common browser content -->
      <div v-if="deviceType !== 'ios'" class="browser-content">
        <div class="app-icon"></div>
        <div class="app-name">ViaDelVangelo</div>
      </div>

      <!-- Installation prompt for Android/Desktop -->
      <div v-if="deviceType !== 'ios'" class="install-prompt" :class="{'visible': showPrompt}">
        <div class="prompt-arrow" :class="deviceType"></div>
        <div class="prompt-content">
          <div class="prompt-title">{{ promptTitle }}</div>
          <div class="prompt-text">{{ promptText }}</div>
        </div>
      </div>

      <!-- Android install UI -->
      <div v-if="deviceType === 'android' && showSecondStep" class="android-install-panel">
        <div class="android-panel-title">Installa app</div>
        <div class="android-panel-text">Aggiungi quest'app alla schermata Home</div>
        <div class="android-panel-buttons">
          <span>Annulla</span>
          <span class="android-install-button">Installa</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstallAnimation',
  data() {
    return {
      deviceType: 'desktop', // Default to desktop, will be updated
      isHighlighted: false,
      showPrompt: false,
      showSecondStep: false,
      showFinalStep: false,
      animationStep: 0,
      interval: null
    }
  },
  computed: {
    promptTitle() {
      switch(this.deviceType) {
        case 'ios':
          return 'Installa su iOS';
        case 'android':
          return 'Installa su Android';
        default:
          return 'Installa l\'app';
      }
    },
    promptText() {
      switch(this.deviceType) {
        case 'ios':
          return 'Tocca l\'icona di condivisione ⬆️, poi "Aggiungi a Home"';
        case 'android':
          return 'Tocca il menu (⋮), poi "Installa app"';
        default:
          return 'Clicca sull\'icona di installazione nella barra';
      }
    }
  },
  mounted() {
    this.detectDevice();
    this.startAnimation();
  },
  methods: {
    detectDevice() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // iOS detection
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        this.deviceType = 'ios';
      }
      // Android detection
      else if (/android/i.test(userAgent)) {
        this.deviceType = 'android';
      }
      // Default to desktop
      else {
        this.deviceType = 'desktop';
      }
    },

    startAnimation() {
      // Clear any existing intervals
      if (this.interval) {
        clearInterval(this.interval);
      }

      // For iOS, use a more detailed sequence to demonstrate the steps
      if (this.deviceType === 'ios') {
        this.interval = setInterval(() => {
          // Progress through animation steps
          this.animationStep = (this.animationStep + 1) % 6;

          // Step 0-1: Highlight share button
          this.isHighlighted = this.animationStep < 2;

          // Step 2-3: Show share sheet
          this.showPrompt = this.animationStep >= 2 && this.animationStep < 4;

          // Step 3: Highlight Add to Home option
          this.showSecondStep = this.animationStep === 3;

          // Step 4-5: Show Add to Home final dialog
          this.showFinalStep = this.animationStep >= 4;
        }, 1600);
      } else {
        // For other platforms, use the simpler animation sequence
        this.interval = setInterval(() => {
          // Progress through animation steps
          this.animationStep = (this.animationStep + 1) % 4;

          // First highlight the button
          this.isHighlighted = this.animationStep === 0;

          // Then show the prompt
          this.showPrompt = this.animationStep === 1;

          // Then show the installation UI
          this.showSecondStep = this.animationStep === 2;
        }, 2000);
      }
    }
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
</script>

<style scoped>
.install-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.device-screen {
  width: 160px;
  height: 210px; /* Reduced height to ensure visibility */
  background: #f8f8f8;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

/* Generic browser styles */
.browser-bar {
  height: 36px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 10px;
  position: relative;
}

.url-bar {
  flex: 1;
  background: #ffffff;
  border-radius: 4px;
  height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  position: relative;
  padding: 0 8px;
}

.url-protocol {
  color: #888;
  margin-right: 2px;
  font-size: 10px;
}

.install-icon {
  position: absolute;
  right: 6px;
  color: #1A73E8;
  animation: pulse 1.5s infinite;
}

.menu-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  border-radius: 50%;
  margin-left: 8px;
}

.menu-button.pulse {
  animation: button-pulse 1s infinite;
  color: #1A73E8;
}

.browser-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Safari-style iOS browser UI - more compact */
.ios-browser {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.ios-browser-top {
  padding: 8px;
  display: flex;
  align-items: center;
  background-color: #f2f2f7;
  border-bottom: 1px solid #d1d1d6;
}

.ios-url-bar {
  flex: 1;
  background: rgba(230, 230, 230, 0.8);
  border-radius: 8px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 12px;
  gap: 6px;
}

.ios-url-bar .fa-lock {
  color: #8e8e93;
}

.ios-browser-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 10px 0;
}

/* Safari bottom toolbar - simplified */
.ios-browser-toolbar {
  height: 40px;
  background: #f2f2f7;
  border-top: 1px solid #d1d1d6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
}

.ios-toolbar-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007AFF;
  font-size: 14px;
}

.ios-share-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007AFF;
  font-size: 18px;
}

.ios-share-button.pulse {
  animation: ios-button-pulse 1.5s infinite;
}

/* iOS Share Sheet - compact version */
.ios-share-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(240, 240, 240, 0.95);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
  animation: slide-up 0.35s ease;
  z-index: 10;
}

.ios-sheet-header {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sheet-app-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #A67D51, #d3b282);
  border-radius: 6px;
  margin-bottom: 3px;
  position: relative;
}

.sheet-app-icon::after {
  content: 'V';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #281D02;
  font-weight: bold;
  font-size: 12px;
}

.sheet-app-url {
  font-size: 10px;
  color: #8e8e93;
}

.ios-sheet-actions {
  display: flex;
  justify-content: space-around;
  padding: 10px 5px;
}

.ios-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 0;
  width: 50px;
  border-radius: 6px;
}

.ios-action.highlight {
  background-color: rgba(0, 122, 255, 0.1);
}

.ios-action.pulse-highlight {
  animation: action-highlight-pulse 1.5s infinite;
}

.ios-action-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
}

.ios-action-icon.blue {
  background: #007AFF;
  color: white;
}

.ios-action-icon.gray {
  background: #8e8e93;
  color: white;
}

.ios-action-text {
  font-size: 9px;
  color: #000;
  text-align: center;
  white-space: nowrap;
}

/* Final Add to Home dialog - more compact */
.ios-add-to-home-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: fade-in 0.3s ease;
  z-index: 20;
}

.ios-dialog-content {
  padding: 15px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ios-dialog-icon {
  margin-bottom: 6px;
}

.app-icon.mini {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 16px;
}

.ios-dialog-title {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.ios-dialog-text {
  font-size: 10px;
  text-align: center;
  color: #666;
  margin-bottom: 10px;
}

.ios-dialog-button {
  width: 85%;
  padding: 8px 0;
  background: #007AFF;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: bold;
}

.app-icon {
  width: 48px; /* Smaller */
  height: 48px; /* Smaller */
  background: linear-gradient(135deg, #A67D51, #d3b282);
  border-radius: 12px;
  margin-bottom: 6px; /* Less margin */
  position: relative;
}

.app-icon::after {
  content: 'V';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #281D02;
  font-weight: bold;
  font-size: 20px;
}

.app-name {
  color: #281D02;
  font-size: 13px;
  margin-bottom: 8px; /* Less margin */
}

/* Click indicator */
.ios-click-indicator {
  position: absolute;
  bottom: 20px;
  left: 80px; /* Center on share button */
  z-index: 30;
  animation: tap-animation 1.5s infinite;
}

.finger-dot {
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.3);
}

/* Install prompts for all devices */
.install-prompt {
  position: absolute;
  background: rgba(40, 40, 40, 0.9);
  border-radius: 8px;
  padding: 10px;
  width: 120px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
  color: white;
  z-index: 20;
}

/* Different prompt positions based on device */
.android .install-prompt {
  top: 40px;
  right: 10px;
}

.desktop .install-prompt {
  top: 40px;
  right: 10px;
}

.install-prompt.visible {
  opacity: 1;
  transform: translateY(0);
}

.prompt-arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: rgba(40, 40, 40, 0.9);
  transform: rotate(45deg);
}

.prompt-arrow.android {
  top: -5px;
  right: 12px;
}

.prompt-arrow.desktop {
  top: -5px;
  right: 12px;
}

.prompt-title {
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
}

.prompt-text {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.3;
}

/* Android install panel */
.android-install-panel {
  position: absolute;
  top: 50%;
  left: 15px;
  right: 15px;
  transform: translateY(-50%);
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: fade-in 0.3s ease;
  z-index: 10;
}

.android-panel-title {
  padding: 12px 15px 5px;
  font-weight: bold;
  font-size: 14px;
}

.android-panel-text {
  padding: 0 15px 12px;
  font-size: 12px;
  color: #666;
  border-bottom: 1px solid #eee;
}

.android-panel-buttons {
  display: flex;
  justify-content: flex-end;
  padding: 10px 15px;
  gap: 15px;
  font-size: 12px;
}

.android-install-button {
  color: #1A73E8;
  font-weight: bold;
}

/* Animation keyframes */
@keyframes tap-animation {
  0%, 100% { opacity: 0; transform: scale(1); }
  30%, 70% { opacity: 1; transform: scale(1); }
  50% { opacity: 1; transform: scale(0.8); }
}

@keyframes button-pulse {
  0%, 100% { transform: scale(1); background-color: transparent; }
  50% { transform: scale(1.2); background-color: rgba(26, 115, 232, 0.2); }
}

@keyframes ios-button-pulse {
  0%, 100% { transform: scale(1); background-color: transparent; }
  50% { transform: scale(1.2); background-color: rgba(0, 122, 255, 0.2); }
}

@keyframes action-highlight-pulse {
  0%, 100% { background-color: rgba(0, 122, 255, 0.1); }
  50% { background-color: rgba(0, 122, 255, 0.3); }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>