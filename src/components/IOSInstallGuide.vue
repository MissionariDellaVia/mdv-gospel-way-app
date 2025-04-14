<template>
  <div v-if="showIOSGuide" class="ios-guide">
    <button @click="closeGuide" class="close-guide-button">
      <span class="close-icon">×</span>
    </button>
    <div class="guide-content">
      <h3>Installa La Via del Vangelo</h3>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">Tocca l'icona di condivisione <span class="ios-share-icon">
            <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6V18M10 6L6 10M10 6L14 10" stroke="#A67D51" stroke-width="2" stroke-linecap="round"/>
              <path d="M3 15V21C3 22.6569 4.34315 24 6 24H14C15.6569 24 17 22.6569 17 21V15" stroke="#A67D51" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span> in basso sullo schermo</div>
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'IOSInstallGuide',
  data() {
    return {
      showIOSGuide: false
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
    if (dismissed && Date.now() - parseInt(dismissed) < 14 * 24 * 60 * 60 * 1000) {
      return; // Guide was dismissed less than 14 days ago
    }

    // Detect if using iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // Show after a delay to not overwhelm users immediately
      setTimeout(() => {
        this.showIOSGuide = true;
      }, 1000);
    }
  },
  methods: {
    closeGuide() {
      this.showIOSGuide = false;
      localStorage.setItem('iosGuideDismissed', Date.now().toString());
    }
  }
}
</script>

<style scoped>
.ios-guide {
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

.ios-share-icon {
  display: inline-block;
  margin: 0 5px;
  vertical-align: middle;
}

strong {
  color: #A67D51;
}
</style>