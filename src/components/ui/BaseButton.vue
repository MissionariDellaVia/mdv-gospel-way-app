<template>
  <button class="btn action-button rounded" :class="{ 'loading': loading }">
    <span v-if="loading" class="spinner"></span>
    <span :class="{ 'opacity-0': loading }">{{ title }}</span>
  </button>
</template>

<script>
export default {
  props: {
    title: String,
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>


<style scoped>
.action-button {
  position: relative;
  color: #fff;
  padding: 0.8em 1.8em;
  width: 18rem;
  border: none;
  font-size: 1.2rem;
  font-weight: 500;
  /* No default background - let parent classes (bg-1, bg-2) control color */
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

.action-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.action-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.action-button.loading {
  pointer-events: none;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.opacity-0 {
  opacity: 0;
}

/* Medium devices (tablets, 768px and up)  */
@media (min-width: 768px) {
  .action-button {
    width: 16rem;
    font-size: 1.2rem;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .action-button {
    width: 22rem;
    font-size: 1.4rem;
  }
}
</style>
