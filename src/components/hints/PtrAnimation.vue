<template>
  <div class="ptr-animation">
    <div class="phone-frame">
      <div class="screen">
        <!-- Content representation -->
        <div class="app-content">
          <div class="app-header"></div>
          <div class="app-row"></div>
          <div class="app-row"></div>
        </div>
        
        <!-- Pull indicator -->
        <div class="pull-area" :class="{ 'pulled': isPulled }">
          <div class="pull-indicator">
            <div class="pull-arrow" :class="{ 'pulled': isPulled }">
              <i class="fa-solid fa-arrow-down"></i>
            </div>
            <div v-if="isPulled" class="pull-refresh-icon">
              <i class="fa-solid fa-refresh fa-spin"></i>
            </div>
          </div>
        </div>
        
        <!-- Finger indicator -->
        <div class="finger-indicator" :class="{ 'animate': true }">
          <i class="fa-solid fa-hand-pointer"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PtrAnimation',
  data() {
    return {
      isPulled: false,
      interval: null
    }
  },
  mounted() {
    // Create pull-release cycle
    this.interval = setInterval(() => {
      // Pull down
      this.isPulled = true;
      
      // Release after delay
      setTimeout(() => {
        this.isPulled = false;
      }, 2000);
    }, 4000);
  },
  beforeUnmount() {
    if (this.interval) clearInterval(this.interval);
  }
}
</script>

<style scoped>
.ptr-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.phone-frame {
  width: 160px;
  height: 200px;
  background: #281D02;
  border-radius: 18px;
  padding: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  perspective: 1000px;
}

.screen {
  width: 100%;
  height: 100%;
  background: #412e1f;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.app-content {
  padding: 15px;
  transform-origin: top center;
  transition: transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.app-header {
  height: 30px;
  margin-bottom: 20px;
  background: rgba(211, 178, 130, 0.3);
  border-radius: 4px;
}

.app-row {
  height: 20px;
  margin-bottom: 12px;
  background: rgba(211, 178, 130, 0.2);
  border-radius: 4px;
}

.pull-area {
  position: absolute;
  top: -80px;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(211, 178, 130, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.pull-area.pulled {
  transform: translateY(80px);
}

.pull-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(166, 125, 81, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pull-arrow {
  color: #D3B282;
  font-size: 16px;
  opacity: 1;
  transition: opacity 0.3s, transform 0.3s;
}

.pull-arrow.pulled {
  transform: rotate(180deg);
  opacity: 0;
}

.pull-refresh-icon {
  position: absolute;
  color: #D3B282;
  font-size: 16px;
  opacity: 1;
  animation: fade-in 0.3s;
}

.finger-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 26px;
  color: rgba(255, 255, 255, 0.9);
  transform: translate(-50%, -50%);
}

.finger-indicator.animate {
  animation: pull-finger 4s infinite;
}

@keyframes pull-finger {
  0%, 100% { transform: translate(-50%, -50%); }
  25% { transform: translate(-50%, -100%); }
  50% { transform: translate(-50%, -20%); }
  75% { transform: translate(-50%, -80%); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>