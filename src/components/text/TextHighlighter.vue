<template>
  <div class="highlighter-wrapper" :class="{'highlight-mode-active': highlightMode}">
    <!-- Content container with highlighting capability -->
    <div
        ref="contentContainer"
        class="highlightable-content"
        :contenteditable="isSelectionModeActive"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
    >
      <slot></slot>
    </div>

    <!-- Mobile selection overlay (shows only in selection mode) -->
    <div v-if="isSelectionModeActive" class="mobile-selection-overlay">
      <div class="mobile-selection-controls">
        <button @click="cancelSelectionMode" class="selection-btn cancel-btn">Annulla</button>
        <div class="selection-status">{{ selectionModeText }}</div>
        <button @click="confirmSelection" class="selection-btn confirm-btn">Conferma</button>
      </div>
    </div>

    <!-- Control panel with buttons and color selection -->
    <div class="highlighter-controls" ref="controlBar">
      <!-- Main button group -->
      <div class="button-group">
        <button
            @click="toggleHighlightMode"
            class="control-btn highlight-btn"
            :class="{'active': highlightMode}"
        >
          <i class="fa-solid fa-highlighter"></i>
          <span class="control-label">Evidenzia</span>
        </button>

        <button
            v-if="highlightMode && isMobileDevice && !showColorSelection"
            @click="enableSelectionMode"
            class="control-btn selection-btn"
        >
          <i class="fa-solid fa-i-cursor"></i>
          <span class="control-label">Seleziona Testo</span>
        </button>

        <button
            v-if="hasHighlights"
            @click="showCollection = true"
            class="control-btn collection-btn"
        >
          <i class="fa-solid fa-book-open"></i>
          <span class="control-label">Salvati ({{ highlights.length }})</span>
        </button>

        <button
            v-if="hasHighlights"
            @click="exportHighlights"
            class="control-btn export-btn"
        >
          <i class="fa-solid fa-file-export"></i>
          <span class="control-label">Esporta</span>
        </button>
      </div>

      <!-- Color selection -->
      <div v-if="showColorSelection" class="color-selection-bar">
        <div class="color-selection-label">Colori:</div>
        <div class="highlight-colors">
          <button
              v-for="color in highlightColors"
              :key="color.name"
              @click="applyHighlight(color.value)"
              class="color-btn"
              :style="{ backgroundColor: color.value }"
              :title="color.name"
          ></button>
        </div>
        <button @click="cancelSelection" class="action-btn cancel-btn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <!-- Collection modal -->
    <div v-if="showCollection" class="collection-modal">
      <div class="collection-content">
        <div class="collection-header">
          <h3>Le tue evidenziazioni</h3>
          <button @click="showCollection = false" class="close-btn">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="collection-body">
          <p v-if="!highlights.length" class="no-highlights">
            Nessuna evidenziazione. Attiva la modalità evidenziazione per selezionare parti del testo.
          </p>

          <div v-else class="highlights-list">
            <div
                v-for="(highlight, index) in highlights"
                :key="index"
                class="highlight-item"
            >
              <div
                  class="highlight-color"
                  :style="{ backgroundColor: highlight.color }"
              ></div>
              <div class="highlight-text">{{ highlight.text }}</div>
              <div class="highlight-actions">
                <button @click="removeHighlight(index)" class="remove-btn">
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
              @click="exportHighlights"
              class="export-modal-btn"
          >
            <i class="fa-solid fa-file-export"></i>
            Esporta come immagine
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

export default {
  name: 'TextHighlighter',
  props: {
    title: {
      type: String,
      default: 'La Via del Vangelo'
    },
    reference: {
      type: String,
      default: ''
    },
    currentDate: {
      type: [Date, String],
      required: true
    }
  },
  setup(props) {
    // Refs for DOM elements
    const contentContainer = ref(null);
    const controlBar = ref(null);

    // States
    const highlightMode = ref(false);
    const showColorSelection = ref(false);
    const showCollection = ref(false);
    const selectedRange = ref(null);
    const highlights = ref([]);
    const highlightId = ref(1);
    const currentDate = ref(new Date('2025-05-13T21:09:56Z'));
    const isMobileDevice = ref(false);
    const isSelectionModeActive = ref(false);
    const hasTextSelected = ref(false);
    const originalContent = ref('');

    // Color palette
    const highlightColors = [
      { name: 'Giallo', value: 'rgba(255, 230, 0, 0.35)' },
      { name: 'Azzurro', value: 'rgba(0, 176, 255, 0.35)' },
      { name: 'Rosa', value: 'rgba(255, 121, 168, 0.35)' },
      { name: 'Verde', value: 'rgba(0, 230, 118, 0.35)' },
      { name: 'Viola', value: 'rgba(187, 107, 217, 0.35)' }
    ];

    // Computed properties
    const hasHighlights = computed(() => highlights.value.length > 0);

    const selectionModeText = computed(() => {
      return hasTextSelected.value ?
          "Testo selezionato!" :
          "Tocca e tieni premuto per selezionare il testo";
    });

    const formattedDate = computed(() => {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return currentDate.value.toLocaleDateString('it-IT', options);
    });

    // Check if the device is iOS
    function isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // Touch event handlers
    function handleTouchStart() {
      if (!isSelectionModeActive.value) return;

      // Clear any existing selection status
      hasTextSelected.value = false;
    }

    function handleTouchEnd() {
      if (!isSelectionModeActive.value) return;

      // Check if text is selected
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text) {
        hasTextSelected.value = true;
      }
    }

    // Enable selection mode specifically for mobile
    function enableSelectionMode() {
      if (!contentContainer.value) return;

      // Save original content before enabling contentEditable
      originalContent.value = contentContainer.value.innerHTML;

      // Add specific iOS & Android selection fix styles
      const selectionStyleEl = document.createElement('style');
      selectionStyleEl.id = 'mobile-selection-fix';
      selectionStyleEl.textContent = `
        [contenteditable="true"] {
          -webkit-user-select: text !important;
          user-select: text !important;
          -webkit-touch-callout: default !important;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.2) !important;
          cursor: text !important;
        }

        /* Prevent native zoom on iOS */
        .highlightable-content {
          max-height: 100%;
          overflow: visible;
        }

        /* Increase touch targets for selection */
        .highlightable-content p {
          margin-bottom: 0.8em !important;
          line-height: 1.8 !important;
        }
      `;
      document.head.appendChild(selectionStyleEl);

      // Activate selection mode
      isSelectionModeActive.value = true;
    }

    // Cancel selection mode
    function cancelSelectionMode() {
      window.getSelection().removeAllRanges();
      isSelectionModeActive.value = false;

      // Ensure content is restored if needed
      if (contentContainer.value && originalContent.value) {
        contentContainer.value.innerHTML = originalContent.value;
      }

      // Remove any selection-specific styles
      const styleEl = document.getElementById('mobile-selection-fix');
      if (styleEl) styleEl.remove();
    }

    // Confirm selection and proceed to color selection
    function confirmSelection() {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text) {
        // Save selection for later use
        selectedRange.value = selection.getRangeAt(0).cloneRange();

        // Exit selection mode but keep the selection
        isSelectionModeActive.value = false;

        // Restore original content while preserving selection
        const tempRange = selectedRange.value.cloneRange();

        // Exit contentEditable mode and restore content
        if (contentContainer.value && originalContent.value) {
          // Store selection details for restoration
          const startContainer = tempRange.startContainer;
          const startOffset = tempRange.startOffset;
          const endContainer = tempRange.endContainer;
          const endOffset = tempRange.endOffset;

          // Now restore content
          contentContainer.value.innerHTML = originalContent.value;

          // Try to restore selection, but note this is challenging after content change
          try {
            // This may not work perfectly if content structure changed
            const newRange = document.createRange();
            newRange.setStart(startContainer, startOffset);
            newRange.setEnd(endContainer, endOffset);

            selection.removeAllRanges();
            selection.addRange(newRange);

            // Now we can save this selection
            selectedRange.value = selection.getRangeAt(0).cloneRange();
          } catch (e) {
            console.log("Selection restoration failed, continuing with original text");
          }
        }

        // Remove selection-specific styles
        const styleEl = document.getElementById('mobile-selection-fix');
        if (styleEl) styleEl.remove();

        // Show color palette
        showColorSelection.value = true;
      } else {
        // If no text is selected, show a message
        showNoSelectionMessage();
      }
    }

    function showNoSelectionMessage() {
      alert("Per favore seleziona del testo prima di confermare.");
    }

    // Toggle highlight mode on/off
    function toggleHighlightMode() {
      highlightMode.value = !highlightMode.value;

      if (!highlightMode.value) {
        cancelSelection();
        if (isSelectionModeActive.value) {
          cancelSelectionMode();
        }
      }
    }

    // Apply highlight to the selected text
    function applyHighlight(color) {
      if (!selectedRange.value) return;

      // Create a highlight span
      const newElementId = `highlight-${highlightId.value++}`;
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'text-highlight';
      highlightSpan.id = newElementId;
      highlightSpan.style.backgroundColor = color;

      try {
        // Apply the highlight
        selectedRange.value.surroundContents(highlightSpan);

        // Store the highlight info
        highlights.value.push({
          id: newElementId,
          text: selectedRange.value.toString(),
          color,
          timestamp: new Date().toISOString()
        });

        // Save highlights
        saveHighlights(props.reference);

        // Clear selection and hide color picker
        window.getSelection().removeAllRanges();
        cancelSelection();
      } catch (error) {
        console.error('Error applying highlight:', error);
        handleComplexSelection(color);
      }
    }

    // Handle complex selections that span multiple nodes
    function handleComplexSelection(color) {
      const selectionText = window.getSelection().toString();
      const tempId = 'temp-selection-' + Date.now();

      if (isIOS()) {
        applyHighlightToRangeAsParts(color, selectionText);
      } else {
        try {
          document.execCommand('insertHTML', false,
              `<span id="${tempId}" class="text-highlight" style="background-color:${color};">${selectionText}</span>`);

          const tempEl = document.getElementById(tempId);
          if (tempEl) {
            const newElementId = `highlight-${highlightId.value++}`;
            tempEl.id = newElementId;

            highlights.value.push({
              id: newElementId,
              text: selectionText,
              color,
              timestamp: new Date().toISOString()
            });

            saveHighlights(props.reference);
          }
        } catch (e) {
          console.error('Failed to apply complex highlight', e);
          alert('Impossibile evidenziare questo testo. Prova a selezionare una parte più piccola.');
        }
      }

      window.getSelection().removeAllRanges();
      cancelSelection();
    }

    // Apply highlight for iOS
    function applyHighlightToRangeAsParts(color, selectionText) {
      const tempWrapper = document.createElement('div');
      tempWrapper.style.display = 'none';
      document.body.appendChild(tempWrapper);
      tempWrapper.innerText = selectionText;

      const newElementId = `highlight-${highlightId.value++}`;

      try {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'text-highlight';
        highlightSpan.id = newElementId;
        highlightSpan.style.backgroundColor = color;
        highlightSpan.innerText = selectionText;

        range.deleteContents();
        range.insertNode(highlightSpan);

        highlights.value.push({
          id: newElementId,
          text: selectionText,
          color,
          timestamp: new Date().toISOString()
        });

        saveHighlights(props.reference);
      } catch (e) {
        console.error('iOS highlight fallback failed', e);
        alert('Impossibile evidenziare questo testo su iOS. Prova un\'altra selezione.');
      } finally {
        document.body.removeChild(tempWrapper);
      }
    }

    // Cancel highlight selection
    function cancelSelection() {
      window.getSelection().removeAllRanges();
      selectedRange.value = null;
      showColorSelection.value = false;
    }

    // Remove a highlight by index
    function removeHighlight(index) {
      const highlightId = highlights.value[index].id;

      const highlightEl = document.getElementById(highlightId);
      if (highlightEl) {
        const textNode = document.createTextNode(highlightEl.textContent);
        highlightEl.parentNode.replaceChild(textNode, highlightEl);
      }

      highlights.value.splice(index, 1);
      saveHighlights(props.reference);
    }

    // Export highlights as image (stub)
    function exportHighlights() {
      showCollection.value = false;
      alert('Funzionalità di esportazione non ancora implementata');
    }

    // Save highlights to localStorage
    function saveHighlights(reference = '') {
      try {
        localStorage.setItem(`highlights-${reference || 'page'}`, JSON.stringify({
          highlights: highlights.value,
          html: contentContainer.value?.innerHTML
        }));
      } catch (error) {
        console.error('Error saving highlights:', error);
      }
    }

    // Load highlights from localStorage
    function loadHighlights(reference = '') {
      try {
        const stored = localStorage.getItem(`highlights-${reference || 'page'}`);

        if (stored) {
          const data = JSON.parse(stored);
          highlights.value = data.highlights || [];

          if (highlights.value.length) {
            const maxId = Math.max(...highlights.value.map(h =>
                parseInt(h.id.replace('highlight-', '')) || 0
            ));
            highlightId.value = maxId + 1;
          }
        }
      } catch (error) {
        console.error('Error loading highlights:', error);
      }
    }

    // Clear all highlights when date changes
    function clearAllHighlights(reference = '') {
      highlights.value.forEach(highlight => {
        const highlightEl = document.getElementById(highlight.id);
        if (highlightEl) {
          const textNode = document.createTextNode(highlightEl.textContent);
          highlightEl.parentNode.replaceChild(textNode, highlightEl);
        }
      });

      highlights.value = [];

      try {
        localStorage.removeItem(`highlights-${reference || 'page'}`);
      } catch (error) {
        console.error('Error clearing highlights from storage:', error);
      }
    }

    // Show a notification when date changes
    function showDateChangeNotification() {
      alert('Data cambiata. Le evidenziazioni sono state ripristinate.');
    }

    onMounted(() => {
      // Detect mobile device
      isMobileDevice.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
      );

      // Load saved highlights for the current date
      loadHighlights(props.reference);
    });

    // Watch for date changes and clear highlights
    watch(() => props.currentDate, (newDate, oldDate) => {
      if (newDate !== oldDate) {
        clearAllHighlights(props.reference);
        showDateChangeNotification();
      }
    });

    return {
      // Template refs
      contentContainer,
      controlBar,

      // State
      highlightMode,
      showColorSelection,
      showCollection,
      highlights,
      highlightColors,
      isMobileDevice,
      isSelectionModeActive,
      hasTextSelected,
      selectionModeText,

      // Computed
      hasHighlights,
      formattedDate,

      // Methods
      toggleHighlightMode,
      enableSelectionMode,
      cancelSelectionMode,
      confirmSelection,
      handleTouchStart,
      handleTouchEnd,
      applyHighlight,
      cancelSelection,
      removeHighlight,
      exportHighlights
    };
  }
};
</script>

<style>
/* Global styles for the highlighted text elements */
.text-highlight {
  border-radius: 2px;
  padding: 0 1px;
  transition: all 0.2s;
}

.text-highlight:hover {
  filter: brightness(1.1);
}

/* Make highlights work with the font styles in GwRawText */
.html-raw .text-highlight {
  font-family: inherit !important;
  color: inherit !important;
  font-size: inherit !important;
  text-align: inherit;
  word-spacing: inherit;
  letter-spacing: inherit;
  line-height: inherit;
}
</style>

<style scoped>
.highlighter-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.highlightable-content {
  position: relative;
  -webkit-user-select: text;
  user-select: text;
}

.highlight-mode-active .highlightable-content {
  cursor: text;
  padding: 8px;
  background-color: rgba(166, 125, 81, 0.05);
  border-radius: 8px;
  transition: background-color 0.3s;
}

/* Selection mode specific styles */
.highlightable-content[contenteditable="true"] {
  padding: 15px;
  border: 2px solid #B2A348;
  background-color: rgba(255, 250, 240, 0.8);
  border-radius: 8px;
  cursor: text;
  caret-color: #A67D51;
}

/* Mobile selection overlay */
.mobile-selection-overlay {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 100;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-top: 2px solid #B2A348;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.mobile-selection-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.selection-status {
  text-align: center;
  color: #6e4f3a;
  font-size: 14px;
  flex: 1;
}

.selection-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #6e4f3a;
}

.confirm-btn {
  background-color: #B2A348;
  color: white;
}

/* Control buttons */
.highlighter-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px 0;
  position: relative;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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

/* Color selection bar */
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
  width: 28px;
  height: 28px;
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
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  cursor: pointer;
  color: #6e4f3a;
}

/* Collection Modal */
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
  align-items: center;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.highlight-color {
  width: 5px;
  height: 50px;
  border-radius: 3px;
  margin-right: 15px;
}

.highlight-text {
  flex: 1;
  font-size: 0.95rem;
  color: #3e2723;
  line-height: 1.4;
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

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .control-btn {
    flex: 1;
    justify-content: center;
  }

  .control-btn i {
    margin-right: 4px;
  }

  .color-selection-bar {
    flex-wrap: wrap;
    justify-content: center;
    padding: 8px;
  }

  .color-selection-label {
    width: 100%;
    text-align: center;
    margin-bottom: 6px;
    margin-right: 0;
  }

  .highlight-colors {
    justify-content: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
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