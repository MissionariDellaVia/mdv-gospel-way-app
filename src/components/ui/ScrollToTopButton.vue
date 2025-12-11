<template>
  <transition name="fade-scale">
    <button
        v-show="visible"
        @click="scrollToTop"
        class="scroll-to-top-btn"
        aria-label="Torna in alto">
      <i class="fa-solid fa-chevron-up"></i>
    </button>
  </transition>
</template>

<script>
export default {
  props: {
    showAfter: {
      type: Number,
      default: 300
    },
    zIndex: {
      type: Number,
      default: 99
    }
  },
  data() {
    return {
      visible: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    this.handleScroll()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.visible = window.pageYOffset > this.showAfter
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }
}
</script>

<style scoped>
.scroll-to-top-btn {
  position: fixed;
  /* Stack position with safe-area support */
  bottom: calc(124px + var(--safe-bottom, 0px));
  right: max(15px, var(--safe-right, 0px));
  /* Minimum touch target 48px */
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: var(--color-light);
  border: 2px solid var(--color-light);
  box-shadow: var(--shadow-md);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: v-bind('zIndex');
  transition: all var(--transition-normal);
  opacity: 0.95;
}

.scroll-to-top-btn i {
  font-size: 1.2rem;
}

.scroll-to-top-btn:hover {
  background-color: #472b21; /* Darker on hover for nice effect */
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(40, 29, 2, 0.35);
  opacity: 1;
}

.scroll-to-top-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(40, 29, 2, 0.2);
}

/* Improved transition for the button */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(10px);
}

@media (max-width: 480px) {
  .scroll-to-top-btn {
    /* Maintain 48px touch target on mobile */
    bottom: calc(120px + var(--safe-bottom, 0px));
    right: max(12px, var(--safe-right, 0px));
    width: var(--touch-target-min, 48px);
    height: var(--touch-target-min, 48px);
  }
}
</style>