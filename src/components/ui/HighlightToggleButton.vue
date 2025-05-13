<template>
  <div class="highlight-global-toggle" :class="{ 'active': isActive }">
    <button
        @click="toggleHighlightMode"
        class="highlight-toggle-global"
        :title="isActive ? 'Disattiva evidenziazione globale' : 'Attiva evidenziazione globale'"
    >
      <i class="fa-solid fa-highlighter"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'HighlightToggleButton',
  data() {
    return {
      isActive: false
    }
  },
  methods: {
    toggleHighlightMode() {
      this.isActive = !this.isActive;

      // Emit global event for highlighters
      document.dispatchEvent(new CustomEvent('toggle-highlight-mode', {
        detail: { active: this.isActive }
      }));
    }
  }
}
</script>

<style scoped>
.highlight-global-toggle {
  position: fixed;
  bottom: 140px; /* Position above your existing buttons */
  right: 15px;
  z-index: 100;
}

.highlight-toggle-global {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #d3b282;
  background-color: #6e4f3a;
  color: #d3b282;
  box-shadow: 0 4px 12px rgba(40, 29, 2, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.highlight-toggle-global:hover {
  background-color: #7d5c45;
  transform: translateY(-2px);
}

.active .highlight-toggle-global {
  background-color: #A67D51;
  transform: rotate(45deg);
}
</style>