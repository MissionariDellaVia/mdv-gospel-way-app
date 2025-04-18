<template>
  <div
      class="ptr-container"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
  >
    <!-- Transparent liquid pull effect with gradient -->
    <div class="ptr-liquid-container" :class="{ 'ptr-triggered': isRefreshing }">
      <!-- Elastic wave gradient SVG with transparency -->
      <svg class="ptr-wave" :style="{ transform: `translateY(${waveOffset}px)` }" width="100%" height="120" viewBox="0 0 100 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#D3B282" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#A67D51" stop-opacity="0.15" />
          </linearGradient>
        </defs>
        <path
            :d="wavePath"
            fill="url(#waveGradient)"
            :style="{
            backdropFilter: 'blur(5px)',
            filter: `drop-shadow(0 2px 3px rgba(40, 29, 2, 0.1))`
          }"
        ></path>
      </svg>

      <!-- Glass-like pull indicator -->
      <div
          class="ptr-indicator"
          :style="{
          transform: `translateY(${indicatorOffset}px) scale(${indicatorScale})`,
          opacity: indicatorOpacity
        }"
      >
        <div class="ptr-circle-outer">
          <div class="ptr-circle-inner" :class="{ 'ptr-ready': readyToRefresh }">
            <div class="ptr-icon" :class="{ 'ptr-icon-ready': readyToRefresh }">
              <span v-if="!readyToRefresh"></span>
              <span v-if="!readyToRefresh"></span>
              <svg v-else class="ptr-refresh-icon" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Transparent glow effect -->
      <div class="ptr-glow" :style="{ opacity: readyToRefresh ? 0.4 : 0 }"></div>
    </div>

    <slot />
  </div>
</template>

<script>
export default {
  name: 'PullToRefresh',
  props: {
    threshold: { type: Number, default: 80 },
    headerSelector: { type: String, default: '.logo-img' }
  },
  data() {
    return {
      startY: 0,
      currentPull: 0,
      readyToRefresh: false,
      isRefreshing: false,
      allowedToPull: false,
      waveControlPointY: 0
    }
  },
  computed: {
    // Dynamic wave path that changes shape as you pull
    wavePath() {
      const width = 100;
      const height = this.waveControlPointY;

      return `
        M0,120
        L0,20
        C${width/4},${height} ${width*3/4},${height} ${width},20
        L${width},120
        Z
      `;
    },

    // Wave offset dynamically changes with pull distance
    waveOffset() {
      return Math.min(this.currentPull * 0.4, 60);
    },

    // Position of the indicator
    indicatorOffset() {
      return Math.min(this.currentPull * 0.5, 70);
    },

    // Scale the indicator circle based on pull distance
    indicatorScale() {
      const baseScale = 0.85;
      const pullRatio = Math.min(this.currentPull / this.threshold, 1);
      return baseScale + (pullRatio * 0.3);
    },

    // Fade in the indicator
    indicatorOpacity() {
      return Math.min(this.currentPull / 40, 1);
    }
  },
  methods: {
    onTouchStart(e) {
      if (window.scrollY === 0) {
        const header = document.querySelector(this.headerSelector);
        if (header) {
          const rect = header.getBoundingClientRect();
          this.allowedToPull = rect.bottom > 0;
        }
      }

      if (this.allowedToPull && !this.isRefreshing) {
        this.startY = e.touches[0].clientY;
        if (navigator.vibrate) navigator.vibrate(5);
      }
    },

    onTouchMove(e) {
      if (!this.allowedToPull || this.isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const dy = touchY - this.startY;

      if (dy > 0 && window.scrollY === 0) {
        e.preventDefault();

        // Apply resistance - pulls get harder the further you go
        this.currentPull = Math.pow(dy, 0.8);

        // Animate the wave control point
        this.waveControlPointY = Math.min(this.currentPull * 0.15, 70);

        // Check if we've reached threshold to refresh
        const wasReady = this.readyToRefresh;
        this.readyToRefresh = this.currentPull >= this.threshold;

        // Vibrate when crossing threshold (one-time)
        if (!wasReady && this.readyToRefresh && navigator.vibrate) {
          navigator.vibrate(15);
        }
      }
    },

    onTouchEnd() {
      if (this.allowedToPull && this.readyToRefresh && !this.isRefreshing) {
        this.isRefreshing = true;

        // Vibrate for feedback
        if (navigator.vibrate) navigator.vibrate([10, 20, 10]);

        // Emit refresh event
        this.$emit('refresh');

        // Reset with animation after the refresh completes
        setTimeout(() => {
          this.resetState();
        }, 1500);
      } else {
        // No refresh triggered - just spring back
        this.resetState();
      }
    },

    resetState() {
      this.isRefreshing = false;
      this.readyToRefresh = false;
      this.currentPull = 0;
      this.allowedToPull = false;
    }
  }
}
</script>

<style scoped>
.ptr-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Liquid pull container */
.ptr-liquid-container {
  position: absolute;
  top: -120px; /* Start offscreen */
  left: 0;
  right: 0;
  height: 120px;
  z-index: 1000;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
}

/* Wave animation */
.ptr-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  transition: transform 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
}

/* Modern indicator with transparent glass effect */
.ptr-indicator {
  position: absolute;
  top: 15px;
  left: calc(50% - 25px);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1),
  opacity 0.2s ease;
}

/* Outer circle effect */
.ptr-circle-outer {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(211, 178, 130, 0.7), rgba(166, 125, 81, 0.5));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(40, 29, 2, 0.15),
  inset 0 1px 1px rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(211, 178, 130, 0.3);
}

/* Inner circle */
.ptr-circle-inner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(to bottom, rgba(40, 29, 2, 0.8), rgba(71, 43, 33, 0.7));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

/* Ready state */
.ptr-ready {
  transform: rotate(180deg);
}

/* Arrow icon with two bars */
.ptr-icon {
  position: relative;
  width: 18px;
  height: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.3s ease;
}

.ptr-icon span {
  display: block;
  width: 12px;
  height: 2px;
  background: linear-gradient(to right, #D3B282, #A67D51);
  border-radius: 1px;
  position: relative;
}

.ptr-icon span:first-child {
  transform: rotate(-45deg) translateX(-2.5px);
}

.ptr-icon span:last-child {
  transform: rotate(45deg) translateX(2.5px);
}

/* Refresh icon when ready */
.ptr-refresh-icon {
  width: 22px;
  height: 22px;
  fill: #D3B282;
}

/* Animation when triggered */
.ptr-triggered .ptr-circle-outer {
  animation: ptr-pulse 1.5s infinite;
}

.ptr-triggered .ptr-circle-inner {
  animation: ptr-rotate 2s infinite linear;
}

/* Transparent glow effect */
.ptr-glow {
  position: absolute;
  top: 20px;
  left: calc(50% - 40px);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(211, 178, 130, 0.4) 0%, rgba(211, 178, 130, 0) 70%);
  border-radius: 50%;
  transition: opacity 0.3s ease;
  z-index: -1;
}

/* Keyframe animations */
@keyframes ptr-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 3px 8px rgba(40, 29, 2, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 5px 12px rgba(40, 29, 2, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 3px 8px rgba(40, 29, 2, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
  }
}

@keyframes ptr-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>