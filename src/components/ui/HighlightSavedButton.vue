<template>
  <div class="saved-button-container" v-if="count > 0">
    <button
      @click="$emit('click')"
      class="saved-button"
      title="Evidenziazioni salvate"
    >
      <i class="fa-solid fa-bookmark"></i>
      <span class="badge">{{ count }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'HighlightSavedButton',
  props: {
    count: {
      type: Number,
      default: 0
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.saved-button-container {
  position: fixed;
  /* Aligned with help button height + safe area */
  top: calc(15px + var(--safe-top, 0px));
  right: max(15px, var(--safe-right, 0px));
  z-index: 100;
}

.saved-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 48px touch target */
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-light);
  background-color: var(--color-primary);
  color: var(--color-light);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 1.1rem;
}

.saved-button:hover {
  background-color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background-color: var(--color-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

/* Mobile - maintain 48px touch target */
@media (max-width: 480px) {
  .saved-button-container {
    right: max(10px, var(--safe-right, 0px));
    top: calc(10px + var(--safe-top, 0px));
  }

  .saved-button {
    width: var(--touch-target-min, 48px);
    height: var(--touch-target-min, 48px);
    font-size: 1.1rem;
  }
}
</style>
