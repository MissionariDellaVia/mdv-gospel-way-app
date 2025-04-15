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
  bottom: 28px;
  right: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #6e4f3a; /* Slightly darker than the previous color */
  color: #d3b282; /* Light gold color for better contrast */
  border: 2px solid #d3b282;
  box-shadow: 0 4px 12px rgba(40, 29, 2, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: v-bind('zIndex');
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: 0.9;
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

@media (max-width: 768px) {
  .scroll-to-top-btn {
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
  }
}
</style>