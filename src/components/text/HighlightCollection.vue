<template>
  <div class="collection-modal" @click.self="$emit('close')">
    <div class="collection-content">
      <div class="collection-header">
        <h3>Le tue evidenziazioni</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="collection-body">
        <p v-if="!highlights.length" class="no-highlights">
          Nessuna evidenziazione salvata.<br>
          Tocca il pulsante <i class="fa-solid fa-highlighter"></i> per evidenziare parti del testo.
        </p>

        <div v-else class="highlights-list">
          <div
              v-for="(highlight, index) in highlights"
              :key="highlight.id || index"
              class="highlight-item"
          >
            <div
                class="highlight-color"
                :style="{ backgroundColor: highlight.color }"
            ></div>
            <div class="highlight-content">
              <span v-if="highlight.sectionLabel" class="highlight-section">{{ highlight.sectionLabel }}</span>
              <div class="highlight-text">{{ highlight.text }}</div>
            </div>
            <div class="highlight-actions">
              <button @click="$emit('remove', index)" class="remove-btn" title="Rimuovi">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="collection-footer">
        <span class="date-info">{{ formattedDate }}</span>
        <button
            v-if="highlights.length"
            @click="$emit('export')"
            class="export-modal-btn"
        >
          <i class="fa-solid fa-share-from-square"></i>
          Esporta
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HighlightCollection',
  props: {
    highlights: {
      type: Array,
      required: true
    },
    formattedDate: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'remove', 'export']
};
</script>

<style scoped>
.collection-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: modalFadeIn 0.3s;
}

.collection-content {
  background: linear-gradient(to bottom, rgba(255, 246, 217, 0.98), rgba(255, 240, 203, 0.98));
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: modalSlideUp 0.3s;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(166, 125, 81, 0.2);
}

.collection-header h3 {
  margin: 0;
  color: #6e4f3a;
  font-weight: 500;
  font-size: 1.2rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: #6e4f3a;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  -webkit-appearance: none;
  appearance: none;
}

.close-btn:hover {
  background-color: rgba(166, 125, 81, 0.1);
}

.collection-body {
  padding: 10px 20px;
  overflow-y: auto;
  max-height: 50vh;
  -webkit-overflow-scrolling: touch;
}

.no-highlights {
  text-align: center;
  color: #6e4f3a;
  font-style: italic;
  padding: 30px 0;
}

.highlights-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.highlight-item {
  display: flex;
  align-items: stretch;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.highlight-color {
  width: 4px;
  min-height: 40px;
  border-radius: 2px;
  margin-right: 12px;
  flex-shrink: 0;
}

.highlight-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.highlight-section {
  font-size: 0.75rem;
  color: #A67D51;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.highlight-text {
  font-size: 0.9rem;
  color: #3e2723;
  line-height: 1.5;
}

.highlight-actions {
  display: flex;
  gap: 5px;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #A67D51;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0;
  -webkit-appearance: none;
  appearance: none;
}

.remove-btn:hover {
  background-color: rgba(166, 125, 81, 0.1);
  color: #8c6943;
}

.collection-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(166, 125, 81, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-info {
  color: #6e4f3a;
  font-size: 0.85rem;
}

.export-modal-btn {
  display: flex;
  align-items: center;
  background-color: #A67D51;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.export-modal-btn i {
  margin-right: 6px;
}

.export-modal-btn:hover {
  background-color: #8c6943;
  transform: translateY(-1px);
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>