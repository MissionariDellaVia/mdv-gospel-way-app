<template>
  <teleport to="#app">
    <transition name="fade">
      <div v-if="show" @click="tryClose" class="backdrop"></div>
    </transition>
    <transition name="dialog" @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <dialog open v-if="show" class="fullscreen-dialog">
        <!-- Close icon positioned at the top right border -->
        <div class="close-button-container">
          <div class="close-icon-wrapper">
            <i class="fa-solid fa-xmark close-icon clickable" @click="tryClose"></i>
          </div>
        </div>

        <div class="dialog-container">
          <header ref="header" class="animate-item">
            <slot name="header">
              <h3 class="pt-4 text-center">{{ title }}</h3>
              <h5 v-show="subtitle" class="pt-1 text-center">{{ subtitle }}</h5>
            </slot>
          </header>
          <section ref="content" class="dialog-content animate-item">
            <slot></slot>
          </section>
        </div>
      </dialog>
    </transition>
  </teleport>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    subtitle: {
      type: String,
      required: false,
    },
  },
  emits: ['close'],
  methods: {
    tryClose() {
      this.$emit('close');
    },
    // Animation hooks for custom transitions
    beforeEnter(el) {
      el.style.opacity = 0;
      el.style.transform = 'scale(1.05) translateY(30px)';
    },
    enter(el, done) {
      const delay = 50;

      // Animate the main dialog
      setTimeout(() => {
        el.style.transition = 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.opacity = 1;
        el.style.transform = 'scale(1) translateY(0)';
      }, delay);

      // Animate header and content with staggered timing
      const header = this.$refs.header;
      const content = this.$refs.content;

      if (header) {
        header.style.opacity = 0;
        header.style.transform = 'translateY(20px)';
        setTimeout(() => {
          header.style.transition = 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)';
          header.style.opacity = 1;
          header.style.transform = 'translateY(0)';
        }, delay + 150);
      }

      if (content) {
        content.style.opacity = 0;
        content.style.transform = 'translateY(30px)';
        setTimeout(() => {
          content.style.transition = 'all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)';
          content.style.opacity = 1;
          content.style.transform = 'translateY(0)';
        }, delay + 300);
      }

      setTimeout(done, 800);
    },
    leave(el, done) {
      // Quick fade out with slight scale and upward movement
      el.style.transition = 'all 300ms cubic-bezier(0.5, 0, 0.75, 0)';
      el.style.opacity = 0;
      el.style.transform = 'scale(0.95) translateY(-20px)';

      // Also animate content quickly
      const content = this.$refs.content;
      if (content) {
        content.style.transition = 'all 200ms ease-out';
        content.style.opacity = 0;
        content.style.transform = 'translateY(-15px)';
      }

      setTimeout(done, 300);
    }
  }
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 10;
}

.fullscreen-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  border: none;
  padding: 0;
  margin: 0;
  background-color: rgba(229, 234, 223, 0.95); /* Added transparency to the background */
  color: #6e4f3a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.dialog-container {
  width: 100%;
  max-width: 900px;
  min-height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-top: 40px; /* Added padding to account for the close button */
}

/* Close button container positioned at the top-right corner */
.close-button-container {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 110;
}

.close-icon-wrapper {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
}

.close-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  font-size: 1.7rem;
  background-color: rgba(110, 79, 58, 0.7); /* Semi-transparent background */
  color: #e5eadf;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.close-icon:hover {
  background-color: rgba(110, 79, 58, 0.9);
  transform: rotate(90deg);
}

.close-icon:active {
  transform: rotate(90deg) scale(0.9);
}

header {
  padding: 1rem 1rem 0.5rem 1rem;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-weight: 800;
  position: relative;
  will-change: transform, opacity;
}

.dialog-content {
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1;
  overflow-y: auto;
  text-align: center;
  will-change: transform, opacity;
}

/* Animate item base styling */
.animate-item {
  transition-property: transform, opacity;
  transition-duration: 0.5s;
}

/* Main fade transition for the backdrop */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Dialog transitions are now handled via JavaScript */

/* Responsive adjustments */
@media (min-width: 768px) {
  .dialog-container {
    padding: 40px;
    padding-top: 60px; /* More space on desktop */
  }

  .dialog-content {
    font-size: 1rem;
  }
}

/* For very large screens, improve readability */
@media (min-width: 1400px) {
  .dialog-container {
    max-width: 1100px;
  }
}

/* For smaller screens */
@media (max-width: 576px) {
  .dialog-content {
    padding: 1rem 0.5rem;
  }

  header h3 {
    font-size: 1.4rem;
  }

  header h5 {
    font-size: 1rem;
  }
}

/* Add a subtle pulse animation for new content */
@keyframes subtle-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
</style>