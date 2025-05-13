<template>
  <div class="color-selection-bar">
    <div class="color-selection-label">Colori:</div>
    <div class="highlight-colors">
      <button
          v-for="color in colors"
          :key="color.name"
          @click="$emit('apply-color', color.value)"
          class="color-btn"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
      ></button>
    </div>
    <button @click="$emit('cancel')" class="action-btn cancel-btn">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ColorSelection',
  props: {
    colors: {
      type: Array,
      required: true
    }
  },
  emits: ['apply-color', 'cancel']
};
</script>

<style scoped>
.color-selection-bar {
  display: flex;
  align-items: center;
  background-color: rgba(166, 125, 81, 0.15);
  border-radius: 20px;
  padding: 6px 10px;
  animation: fadeIn 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-selection-label {
  margin-right: 8px;
  font-size: 0.9rem;
  color: #6e4f3a;
  white-space: nowrap;
}

.highlight-colors {
  display: flex;
  gap: 6px;
}

.color-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
}

.color-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn {
  background: #f0f0f0;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  cursor: pointer;
  color: #6e4f3a;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .color-selection-bar {
    flex-wrap: wrap;
    justify-content: center;
    padding: 8px;
    margin: 8px 0;
    width: 100%;
  }

  .color-selection-label {
    width: 100%;
    text-align: center;
    margin-bottom: 4px;
    margin-right: 0;
  }

  .highlight-colors {
    justify-content: center;
  }

  .color-btn {
    width: 28px;
    height: 28px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>