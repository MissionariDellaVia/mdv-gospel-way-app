<template>
  <div class="swipe-animation">
    <div class="phone-frame">
      <div class="screen">
        <!-- Date navigation at top -->
        <div v-if="showNavButtons" class="nav-header">
          <div class="nav-arrow left">
            &lt;
          </div>

          <div class="date-display">18 Aprile</div>

          <div class="nav-arrow right">
            &gt;
          </div>
        </div>

        <!-- Content area -->
        <div class="app-content">
          <div class="app-row"></div>
          <div class="app-row"></div>
          <div class="app-row"></div>
        </div>

        <!-- Hand icon that demonstrates swipe -->
        <div v-if="!showNavButtons" class="swipe-hand" :class="{ 'swipe-right': direction === 'right', 'swipe-left': direction === 'left' }">
          <i class="fa-solid fa-hand-pointer"></i>
        </div>

        <!-- Button click animation -->
        <div v-if="showNavButtons" class="click-hand" :class="{ 'click-left': direction === 'left', 'click-right': direction === 'right' }">
          <i class="fa-solid fa-hand-pointer"></i>
        </div>

        <!-- Visual swipe indicator -->
        <div v-if="!showNavButtons" class="swipe-indicator left" :class="{ 'active': direction === 'left' }">
          <i class="fa-solid fa-chevron-left"></i>
        </div>
        <div v-if="!showNavButtons" class="swipe-indicator right" :class="{ 'active': direction === 'right' }">
          <i class="fa-solid fa-chevron-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SwipeAnimation',
  props: {
    showNavButtons: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      direction: 'right',
      interval: null
    }
  },
  mounted() {
    // Alternate direction every 2.5 seconds
    this.interval = setInterval(() => {
      this.direction = this.direction === 'right' ? 'left' : 'right';
    }, 2500);
  },
  beforeUnmount() {
    if (this.interval) clearInterval(this.interval);
  }
}
</script>

<style scoped>
.swipe-animation {
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
  padding-top: 45px; /* Make room for the nav header */
}

.app-row {
  height: 20px;
  margin-bottom: 12px;
  background: rgba(211, 178, 130, 0.2);
  border-radius: 4px;
}

/* Navigation header styling */
.nav-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  background: rgba(40, 29, 2, 0.3);
  border-bottom: 1px solid rgba(211, 178, 130, 0.2);
}

.nav-arrow {
  font-size: 18px;
  color: #D3B282;
  font-weight: 300;
  cursor: pointer;
  user-select: none;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-arrow.left {
  text-align: left;
}

.nav-arrow.right {
  text-align: right;
}

.date-display {
  color: #D3B282;
  font-size: 16px;
  font-weight: 500;
}

/* Hand animation for swiping */
.swipe-hand {
  position: absolute;
  bottom: 60px;
  left: 50%;
  font-size: 26px;
  color: rgba(255, 255, 255, 0.9);
  transform: translateX(-50%);
}

/* Updated animations to ensure hand stays within screen boundaries */
.swipe-hand.swipe-right {
  animation: swipe-right-contained 2.5s ease-in-out;
}

.swipe-hand.swipe-left {
  animation: swipe-left-contained 2.5s ease-in-out;
}

/* Hand animation for clicking navigation arrows */
.click-hand {
  position: absolute;
  top: 20px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.click-hand.click-left {
  left: 15px;
  animation: click-arrow-left 2.5s ease-in-out;
}

.click-hand.click-right {
  right: 15px;
  animation: click-arrow-right 2.5s ease-in-out;
}

.swipe-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #D3B282;
  font-size: 28px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.swipe-indicator.left {
  left: 10px;
}

.swipe-indicator.right {
  right: 10px;
}

.swipe-indicator.active {
  opacity: 1;
  animation: pulse 1.5s infinite;
}

/* Animation for right swipe - contained within screen */
@keyframes swipe-right-contained {
  0% { transform: translateX(-50%); opacity: 1; }
  15% { transform: translateX(-50%); opacity: 1; }
  30% { transform: translateX(20%); opacity: 0.8; }
  35% { opacity: 0; }
  40% { transform: translateX(-50%); opacity: 0; }
  45% { opacity: 1; }
  100% { transform: translateX(-50%); opacity: 1; }
}

/* Animation for left swipe - contained within screen */
@keyframes swipe-left-contained {
  0% { transform: translateX(-50%); opacity: 1; }
  15% { transform: translateX(-50%); opacity: 1; }
  30% { transform: translateX(-120%); opacity: 0.8; }
  35% { opacity: 0; }
  40% { transform: translateX(-50%); opacity: 0; }
  45% { opacity: 1; }
  100% { transform: translateX(-50%); opacity: 1; }
}

/* Arrow click animations */
@keyframes click-arrow-left {
  0% { transform: scale(1) translateY(0); opacity: 1; }
  20% { transform: scale(0.9) translateY(1px); opacity: 1; }
  25% { transform: scale(1) translateY(0); opacity: 0.8; }
  30% { transform: scale(1) translateY(0); opacity: 0; }
  40% { transform: scale(1) translateY(0); opacity: 0; }
  45% { opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes click-arrow-right {
  0% { transform: scale(1) translateY(0); opacity: 1; }
  20% { transform: scale(0.9) translateY(1px); opacity: 1; }
  25% { transform: scale(1) translateY(0); opacity: 0.8; }
  30% { transform: scale(1) translateY(0); opacity: 0; }
  40% { transform: scale(1) translateY(0); opacity: 0; }
  45% { opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.15); }
}
</style>