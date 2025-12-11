<template>
  <transition name="guide-fade">
    <div v-if="showIOSGuide" class="ios-guide" :class="{ 'expanded': showFullGuide }">
      <!-- Minimized banner mode -->
      <div v-if="!showFullGuide" class="guide-banner" @click="expandGuide">
        <div class="banner-content">
          <div class="app-icon"></div>
          <div class="banner-text">
            <strong>Installa La Via del Vangelo</strong>
            <span>Aggiungi alla schermata Home per un accesso rapido</span>
          </div>
        </div>
        <button class="banner-button">Installa</button>
      </div>

      <!-- Expanded guide mode -->
      <div v-else class="guide-content">
        <div class="guide-header">
          <h3>Installa La Via del Vangelo</h3>
        </div>

        <div class="steps-container">

          <div class="steps-indicator my-3">
            <div v-for="i in 3" :key="`indicator-${i}`"
                 class="indicator-dot"
                 :class="{ 'active': currentStep === i }"></div>
          </div>

          <transition name="step-fade" mode="out-in">
            <div :key="currentStep" class="step-content">
              <!-- Step 1 -->
              <div v-if="currentStep === 1" class="step">
                <div class="step-header">
                  <div class="step-number">1</div>
                  <div class="step-title">Tocca il pulsante condivisione</div>
                </div>
                <div class="step-illustration">
                  <div class="ios-browser-mockup">
                    <div class="browser-address">vangelo.app</div>
                    <div class="browser-content"></div>
                    <div class="browser-toolbar">
                      <span></span>
                      <div class="ios-share-button pulse-animation">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3V12M10 3L6 7M10 3L14 7" stroke="#007AFF" stroke-width="2" stroke-linecap="round"/>
                          <path d="M3 12V16C3 16.6569 3.34315 17 4 17H16C16.6569 17 17 16.6569 17 16V12" stroke="#007AFF" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </div>
                      <span></span>
                    </div>
                  </div>
                </div>
                <p class="step-description">Tocca l'icona di condivisione nella barra in basso del browser Safari</p>
              </div>

              <!-- Step 2 -->
              <div v-else-if="currentStep === 2" class="step">
                <div class="step-header">
                  <div class="step-number">2</div>
                  <div class="step-title">Premi "Aggiungi a Home"</div>
                </div>
                <div class="step-illustration">
                  <div class="ios-actionsheet-mockup">
                    <div class="action-item small"></div>
                    <div class="action-item highlight pulse-animation">
                      <div class="action-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="14" height="14" rx="3" stroke="#007AFF" stroke-width="2"/>
                          <path d="M10 6V14M6 10H14" stroke="#007AFF" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </div>
                      <div class="action-text">Aggiungi a Home</div>
                    </div>
                    <div class="action-item small"></div>
                  </div>
                </div>
                <p class="step-description">Scorri le opzioni e tocca "Aggiungi a Home"</p>
              </div>

              <!-- Step 3 -->
              <div v-else class="step">
                <div class="step-header">
                  <div class="step-number">3</div>
                  <div class="step-title">Conferma l'installazione</div>
                </div>
                <div class="step-illustration">
                  <div class="ios-confirm-mockup">
                    <div class="confirm-icon">
                      <div class="app-icon small"></div>
                    </div>
                    <div class="confirm-title">La Via del Vangelo</div>
                    <div class="confirm-URL">vangelo.app</div>
                    <div class="confirm-button pulse-animation">Aggiungi</div>
                  </div>
                </div>
                <p class="step-description">Tocca "Aggiungi" in alto a destra per completare l'installazione</p>
              </div>
            </div>
          </transition>

          <div class="navigation-buttons">
            <button v-if="currentStep > 1" @click="prevStep" class="nav-button prev">
              <i class="arrow left"></i> Indietro
            </button>
            <button v-if="currentStep < 3" @click="nextStep" class="nav-button next">
              Avanti <i class="arrow right"></i>
            </button>
            <button v-else @click="closeGuide" class="nav-button done">
              Ho capito
            </button>
          </div>
        </div>

      </div>

      <div v-if="!showFullGuide" class="guide-actions">
        <button @click="closeGuide" class="dismiss-button">No grazie</button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'IOSInstallGuide',
  data() {
    return {
      showIOSGuide: false,
      showFullGuide: false,
      currentStep: 1,
      dontShowAgain: false
    }
  },
  mounted() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator.standalone === true)) {
      return;
    }

    // Check if user previously dismissed the guide
    const dismissed = localStorage.getItem('iosGuideDismissed');
    if (dismissed === 'permanent') {
      return; // Guide was permanently dismissed
    } else if (dismissed && Date.now() - parseInt(dismissed) < 14 * 24 * 60 * 60 * 1000) {
      return; // Guide was dismissed less than 14 days ago
    }

    // Detect if using iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // Show after a delay to not overwhelm users immediately
      setTimeout(() => {
        this.showIOSGuide = true;
      }, 1500);
    }
  },
  methods: {
    expandGuide() {
      this.showFullGuide = true;
    },
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    closeGuide() {
      this.showIOSGuide = false;

      // If user checked "don't show again", store permanent dismissal
      if (this.dontShowAgain) {
        localStorage.setItem('iosGuideDismissed', 'permanent');
      } else {
        localStorage.setItem('iosGuideDismissed', Date.now().toString());
      }
    }
  }
}
</script>

<style scoped>
/* ===================================
   iOS Install Guide - PWA Install Helper
   With safe-area support & CSS vars
   =================================== */

.ios-guide {
  position: fixed;
  /* Safe area support for iPhone home indicator */
  bottom: calc(20px + var(--safe-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 350px;
  background-color: var(--color-dark, #472b21);
  border-radius: var(--radius-lg, 14px);
  box-shadow: var(--shadow-xl, 0 4px 20px rgba(0,0,0,0.5));
  z-index: 9999;
  border: 2px solid var(--color-accent, #A67D51);
  overflow: hidden;
  transition: all 0.3s var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
}

.ios-guide.expanded {
  max-height: calc(460px + var(--safe-bottom, 0px));
  bottom: 50%;
  transform: translate(-50%, 50%);
}

/* Banner mode styling */
.guide-banner {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  cursor: pointer;
  justify-content: space-between;
  -webkit-tap-highlight-color: transparent;
}

.banner-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.banner-text {
  display: flex;
  flex-direction: column;
  margin-left: var(--spacing-sm, 12px);
}

.banner-text strong {
  color: var(--color-light, #d3b282);
  font-size: 15px;
  margin-bottom: 2px;
}

.banner-text span {
  color: var(--color-accent, #A67D51);
  font-size: 12px;
}

.banner-button {
  background-color: var(--color-accent, #A67D51);
  color: var(--color-darkest, #281D02);
  border: none;
  border-radius: var(--radius-full, 18px);
  /* Minimum 48px touch target */
  min-height: var(--touch-target-min, 48px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  font-weight: bold;
  font-size: 14px;
  margin-left: var(--spacing-sm, 10px);
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  -webkit-tap-highlight-color: transparent;
}

.banner-button:hover {
  background-color: var(--color-light, #d3b282);
  transform: translateY(-2px);
}

.banner-button:active {
  transform: scale(0.97);
}

.guide-actions {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border-top: 1px solid var(--color-primary, #6e4f3a);
}

.dismiss-button {
  background: transparent;
  border: none;
  color: var(--color-accent, #A67D51);
  font-size: 13px;
  /* Minimum touch target */
  min-height: var(--touch-target-min, 48px);
  padding: var(--spacing-sm, 8px) var(--spacing-sm, 10px);
  cursor: pointer;
  text-decoration: underline;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--transition-fast, 0.15s ease);
}

.dismiss-button:hover {
  color: var(--color-light, #d3b282);
}

/* Full guide styling */
.guide-content {
  padding: var(--spacing-md, 16px);
  max-height: calc(460px - 32px);
  overflow-y: auto;
}

/* Modified guide header - centered, no icon */
.guide-header {
  position: relative;
  text-align: center;
  margin-bottom: var(--spacing-md, 16px);
  padding-top: 5px;
}

.guide-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-light, #d3b282);
  width: 100%;
}

.app-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-accent, #A67D51), var(--color-light, #d3b282));
  border-radius: var(--radius-md, 8px);
  position: relative;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.2);
}

.app-icon::after {
  content: 'V';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-darkest, #281D02);
  font-weight: bold;
  font-size: 20px;
}

.app-icon.small {
  width: 28px;
  height: 28px;
}

.app-icon.small::after {
  font-size: 14px;
}

.close-guide-button {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--color-primary, #6e4f3a);
  border: 1px solid var(--color-accent, #A67D51);
  /* 48px touch target */
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  border-radius: var(--radius-full, 50%);
  font-size: 18px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-light, #d3b282);
  transition: all var(--transition-fast, 0.15s ease);
  -webkit-tap-highlight-color: transparent;
}

.close-guide-button:hover {
  background-color: var(--color-accent, #A67D51);
  color: var(--color-darkest, #281D02);
}

.close-guide-button:active {
  transform: scale(0.95);
}

.steps-container {
  position: relative;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-sm, 10px);
  gap: var(--spacing-sm, 8px);
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full, 50%);
  background-color: rgba(211, 178, 130, 0.3);
  transition: all 0.3s var(--ease-smooth, ease);
}

.indicator-dot.active {
  background-color: var(--color-accent, #A67D51);
  transform: scale(1.3);
}

.step {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 10px);
}

/* Center-aligned step header */
.step-header {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background-color: var(--color-accent, #A67D51);
  color: var(--color-darkest, #281D02);
  border-radius: var(--radius-full, 50%);
  font-weight: bold;
  font-size: 15px;
  margin-right: var(--spacing-sm, 10px);
  flex-shrink: 0;
}

.step-title {
  font-size: 15px;
  font-weight: bold;
  color: var(--color-light, #d3b282);
}

.step-illustration {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.step-description {
  text-align: center;
  color: var(--color-light, #d3b282);
  font-size: 13px;
  margin: 0 0 5px 0;
  line-height: 1.4;
}

/* iOS Browser Mockup */
.ios-browser-mockup {
  width: 200px; /* Reduced width */
  height: 130px; /* Reduced height */
  background-color: #f2f2f7;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.browser-address {
  height: 26px; /* Reduced height */
  background-color: rgba(0,0,0,0.05);
  border-radius: 6px;
  margin: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #333;
}

.browser-content {
  flex: 1;
  background-color: white;
}

.browser-toolbar {
  height: 34px; /* Reduced height */
  background-color: #f2f2f7;
  border-top: 1px solid rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  align-items: center;
}

.ios-share-button {
  width: 28px;
  height: 28px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Action Sheet Mockup */
.ios-actionsheet-mockup {
  width: 200px; /* Reduced width */
  background-color: #f2f2f7;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.action-item {
  height: 50px; /* Reduced height */
  border-bottom: 1px solid rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.action-item.small {
  height: 30px; /* Even smaller */
}

.action-item.highlight {
  background-color: rgba(0, 122, 255, 0.1);
}

.action-icon {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text {
  font-size: 14px;
  color: #007AFF;
}

/* iOS Confirm Dialog Mockup */
.ios-confirm-mockup {
  width: 200px; /* Reduced width */
  height: auto; /* Auto height */
  background-color: #f2f2f7;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.confirm-icon {
  margin-bottom: 8px;
}

.confirm-title {
  font-size: 15px;
  font-weight: bold;
  color: #000;
  margin-bottom: 3px;
}

.confirm-URL {
  font-size: 11px;
  color: #666;
  margin-bottom: 10px;
}

.confirm-button {
  background-color: #007AFF;
  color: white;
  padding: 7px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13px;
}

/* Navigation buttons */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-sm, 10px);
  gap: var(--spacing-sm, 8px);
}

.nav-button {
  background-color: transparent;
  border: none;
  /* Minimum 48px touch target */
  min-height: var(--touch-target-min, 48px);
  padding: var(--spacing-sm, 7px) var(--spacing-md, 14px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal, 0.2s ease);
  font-size: 14px;
  -webkit-tap-highlight-color: transparent;
}

.nav-button.prev {
  color: var(--color-accent, #A67D51);
  border: 2px solid var(--color-accent, #A67D51);
  border-radius: var(--radius-full, 18px);
}

.nav-button.prev:hover {
  background-color: rgba(166, 125, 81, 0.15);
  color: var(--color-light, #d3b282);
}

.nav-button.next, .nav-button.done {
  background-color: var(--color-accent, #A67D51);
  color: var(--color-darkest, #281D02);
  border-radius: var(--radius-full, 18px);
  font-weight: bold;
  margin-left: auto;
}

.nav-button.done {
  padding: var(--spacing-sm, 7px) var(--spacing-lg, 20px);
}

.nav-button.next:hover,
.nav-button.done:hover {
  background-color: var(--color-light, #d3b282);
  transform: translateY(-2px);
}

.nav-button:active {
  transform: scale(0.97);
}

.arrow {
  border: solid;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin: 0 4px;
}

.right {
  transform: rotate(-45deg);
}

.left {
  transform: rotate(135deg);
}

/* Guide footer */
.guide-footer {
  margin-top: var(--spacing-sm, 12px);
  display: flex;
  justify-content: center;
}

.dont-show-again {
  font-size: 13px;
  color: var(--color-accent, #A67D51);
  display: flex;
  align-items: center;
  cursor: pointer;
  /* Touch target */
  min-height: var(--touch-target-min, 48px);
  padding: var(--spacing-sm, 8px);
}

.dont-show-again input {
  margin-right: var(--spacing-xs, 6px);
  width: 18px;
  height: 18px;
}

/* Animations - using smooth easing */
.guide-fade-enter-active, .guide-fade-leave-active {
  transition: all 0.3s var(--ease-smooth, ease);
}

.guide-fade-enter-from, .guide-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.step-fade-enter-active, .step-fade-leave-active {
  transition: all 0.25s var(--ease-smooth, ease);
}

.step-fade-enter-from, .step-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Pulse animation - consistent with app style */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(166, 125, 81, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(166, 125, 81, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(166, 125, 81, 0);
  }
}

/* Accessibility - reduce motion */
@media (prefers-reduced-motion: reduce) {
  .pulse-animation {
    animation: none !important;
  }

  .guide-fade-enter-active,
  .guide-fade-leave-active,
  .step-fade-enter-active,
  .step-fade-leave-active {
    transition-duration: 0.01ms !important;
  }
}
</style>