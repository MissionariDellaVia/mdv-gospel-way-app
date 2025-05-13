<template>
  <div class="highlight-buttons">
    <!-- Highlight toggle button -->
    <button
        @click="$emit('toggle-mode')"
        class="control-btn highlight-btn"
        :class="{'active': highlightMode}"
        aria-label="Attiva/disattiva evidenziazione"
    >
      <i class="fa-solid fa-highlighter"></i>
      <span class="control-label">Evidenzia</span>
    </button>

    <!-- Mobile selection button -->
    <button
        v-if="highlightMode && isMobile"
        @click="$emit('select-text')"
        class="control-btn selection-btn"
        aria-label="Seleziona testo"
    >
      <i class="fa-solid fa-i-cursor"></i>
      <span class="control-label">Seleziona Testo</span>
    </button>

    <!-- Collection button -->
    <button
        v-if="hasHighlights"
        @click="$emit('show-collection')"
        class="control-btn collection-btn"
        aria-label="Visualizza evidenziazioni"
    >
      <i class="fa-solid fa-book-open"></i>
      <span class="control-label">Salvati ({{ highlightCount }})</span>
    </button>

    <!-- Export button -->
    <button
        v-if="hasHighlights"
        @click="$emit('export-highlights')"
        class="control-btn export-btn"
        aria-label="Esporta evidenziazioni"
    >
      <i class="fa-solid fa-file-export"></i>
      <span class="control-label">Esporta</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'HighlightControls',
  props: {
    highlightMode: {
      type: Boolean,
      required: true
    },
    hasHighlights: {
      type: Boolean,
      required: true
    },
    highlightCount: {
      type: Number,
      default: 0
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-mode', 'select-text', 'show-collection', 'export-highlights']
};
</script>

<style scoped>
.highlight-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.control-btn {
  display: flex;
  align-items: center;
  background-color: rgba(166, 125, 81, 0.1);
  border: none;
  border-radius: 20px;
  padding: 8px 12px;
  color: #6e4f3a;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.control-btn:hover {
  background-color: rgba(166, 125, 81, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.control-btn i {
  margin-right: 6px;
  font-size: 1rem;
}

.control-label {
  white-space: nowrap;
}

.highlight-btn {
  background-color: rgba(166, 125, 81, 0.15);
}

.highlight-btn.active {
  background-color: #A67D51;
  color: white;
}

.selection-btn {
  background-color: #B2A348;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(178, 163, 72, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(178, 163, 72, 0); }
  100% { box-shadow: 0 0 0 0 rgba(178, 163, 72, 0); }
}

.collection-btn {
  background-color: rgba(166, 125, 81, 0.1);
}

.export-btn {
  background-color: rgba(110, 79, 58, 0.1);
}

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .control-btn {
    padding: 8px 10px;
    flex: 1;
    justify-content: center;
  }

  .control-btn i {
    margin-right: 4px;
  }

  .highlight-buttons {
    gap: 6px;
    width: 100%;
  }
}
</style>