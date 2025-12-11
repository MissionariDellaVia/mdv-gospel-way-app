<template>
  <div class="highlight-fab-container">
    <!-- Main FAB - Solo toggle evidenziazione -->
    <button
      @click="toggleHighlightMode"
      class="highlight-fab"
      :class="{ active: isActive }"
      :title="isActive ? 'Disattiva evidenziazione' : 'Attiva evidenziazione'"
    >
      <i class="fa-solid fa-highlighter"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'HighlightToggleButton',
  emits: ['toggle'],
  data() {
    return {
      isActive: false
    }
  },
  methods: {
    toggleHighlightMode() {
      this.isActive = !this.isActive;
      this.$emit('toggle', this.isActive);

      // Also emit global event for backward compatibility
      document.dispatchEvent(new CustomEvent('toggle-highlight-mode', {
        detail: { active: this.isActive }
      }));
    }
  }
}
</script>

<style scoped>
.highlight-fab-container {
  position: fixed;
  /* Stack position with safe-area support */
  bottom: calc(72px + var(--safe-bottom, 0px));
  right: max(15px, var(--safe-right, 0px));
  z-index: 101;
  display: flex;
  justify-content: center;
}

/* Main FAB Button - 48px touch target */
.highlight-fab {
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-light);
  background-color: var(--color-primary);
  color: var(--color-light);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 1.1rem;
}

.highlight-fab:hover {
  background-color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.highlight-fab.active {
  background-color: var(--color-accent);
  color: #fff;
  border-color: #c9a882;
}

.highlight-fab.active:hover {
  background-color: #b88d5f;
}

/* Mobile - maintain 48px touch target */
@media (max-width: 480px) {
  .highlight-fab-container {
    right: max(12px, var(--safe-right, 0px));
    bottom: calc(68px + var(--safe-bottom, 0px));
  }

  .highlight-fab {
    width: var(--touch-target-min, 48px);
    height: var(--touch-target-min, 48px);
    font-size: 1.1rem;
  }
}
</style>
