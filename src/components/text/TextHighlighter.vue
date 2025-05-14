<template>
  <div class="highlighter-wrapper" :class="{'highlight-mode-active': highlightMode}">
    <!-- Content container with highlighting capability -->
    <div ref="contentContainer" class="highlightable-content">
      <slot></slot>
    </div>

    <!-- Mobile selection confirmation button -->
    <div v-if="isMobile && showMobileConfirm" class="mobile-confirm-selection">
      <button @click="confirmMobileSelection" class="confirm-selection-btn">
        <i class="fa-solid fa-check"></i> Colora selezione
      </button>
      <button @click="cancelSelection" class="cancel-selection-btn">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Control panel with buttons and color selection -->
    <div class="highlighter-controls" ref="controlBar">
      <!-- Main button group -->
      <HighlightControls
          :highlight-mode="highlightMode"
          :has-highlights="hasHighlights"
          :highlight-count="highlights.length"
          @toggle-mode="toggleHighlightMode"
          @show-collection="showCollection = true"
          @export-highlights="exportHighlights"
      />

      <!-- Color selection (appears when text is selected) -->
      <ColorSelection
          v-if="showColorSelection && highlightMode"
          :colors="highlightColors"
          @apply-color="applyHighlight"
          @cancel="cancelSelection"
      />
    </div>

    <!-- Collection modal -->
    <HighlightCollection
        v-if="showCollection"
        :highlights="highlights"
        :formatted-date="formattedDate"
        @close="showCollection = false"
        @remove="removeHighlight"
        @export="exportHighlights"
    />

    <!-- Export loading overlay -->
    <div v-if="exportLoading" class="export-overlay">
      <div class="export-progress">
        <div class="spinner"></div>
        <p>Esportazione in corso...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import HighlightControls from './HighlightControls.vue';
import ColorSelection from './ColorSelection.vue';
import HighlightCollection from './HighlightCollection.vue';
import useHighlighter from '@/composables/useHighlighter';
import useExporter from '@/composables/useExporter';

export default {
  name: 'TextHighlighter',
  components: {
    HighlightControls,
    ColorSelection,
    HighlightCollection
  },
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
    },
    textRef: {
      type: String,
      required: true
    }
  },
  setup(props) {
    // ====================================
    // STATE MANAGEMENT
    // ====================================
    const contentContainer = ref(null);
    const controlBar = ref(null);

    const highlightMode = ref(false);
    const showColorSelection = ref(false);
    const showCollection = ref(false);
    const selectedRange = ref(null);
    const highlights = ref([]);
    const highlightId = ref(1);
    const currentDate = ref(new Date('2025-05-14T09:29:08Z'));
    const exportLoading = ref(false);
    const isMobile = ref(false);
    const showMobileConfirm = ref(false);

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

    // ====================================
    // COMPOSABLES
    // ====================================
    const highlighter = useHighlighter({
      contentContainer,
      controlBar,
      highlightMode,
      selectedRange,
      highlights,
      highlightId,
      showColorSelection
    });

    const exporter = useExporter({
      highlights,
      title: props.title,
      reference: props.reference,
      formattedDate,
      organization: 'La Via del Vangelo dei Missionari e Missionarie della Via'
    });

    // Watch loading state from exporter
    watch(() => exporter.isExportLoading.value, (loading) => {
      exportLoading.value = loading;
    });

    // ====================================
    // MOBILE SELECTION HANDLING
    // ====================================
    function checkSelection(event) {
      if (!highlightMode.value) return;

      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text && highlighter.isSelectionWithinContent(selection)) {
        // Save the selection range
        selectedRange.value = selection.getRangeAt(0).cloneRange();

        if (isMobile.value) {
          // On mobile, show confirmation button without scrolling to toolbar
          showMobileConfirm.value = true;
          showColorSelection.value = false;
        } else {
          // On desktop, show color picker and scroll to it
          showColorSelection.value = true;

          // Only scroll to toolbar on desktop
          setTimeout(() => scrollToControlBar(), 0);
        }
      } else {
        // Don't cancel if clicking inside UI elements
        const target = event?.target;
        const isInsideUIElement = target && (
            target.closest('.color-selection-bar') ||
            target.closest('.mobile-confirm-selection')
        );

        if (!isInsideUIElement) {
          cancelSelection();
        }
      }
    }

    function confirmMobileSelection() {
      if (selectedRange.value) {
        // Hide mobile confirmation, show color selection
        showMobileConfirm.value = false;
        showColorSelection.value = true;

        // Now scroll to color picker
        setTimeout(() => scrollToControlBar(), 50);
      }
    }

    function scrollToControlBar() {
      if (controlBar.value) {
        const rect = controlBar.value.getBoundingClientRect();

        if (rect.bottom > window.innerHeight || rect.top < 0) {
          controlBar.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    // ====================================
    // HIGHLIGHT METHODS
    // ====================================
    function applyHighlight(color) {
      highlighter.applyHighlight(color);
      showMobileConfirm.value = false;
    }

    function cancelSelection() {
      highlighter.cancelSelection();
      showMobileConfirm.value = false;
    }

    function removeHighlight(index) {
      highlighter.removeHighlight(index);
    }

    function exportHighlights() {
      exporter.exportHighlights(isMobile.value);
      showCollection.value = false;
    }

    function toggleHighlightMode() {
      highlightMode.value = !highlightMode.value;

      if (!highlightMode.value) {
        cancelSelection();
      } else if (isMobile.value) {
        showMobileTip();
      }
    }

    // ====================================
    // UI NOTIFICATION HELPERS
    // ====================================
    function showMobileTip() {
      const toast = document.createElement('div');
      toast.className = 'mobile-highlight-tip';
      toast.innerHTML = 'Seleziona il testo tenendo premuto';
      toast.style.position = 'fixed';
      toast.style.bottom = '80px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = 'rgba(62, 39, 35, 0.9)';
      toast.style.color = 'white';
      toast.style.padding = '8px 16px';
      toast.style.borderRadius = '20px';
      toast.style.zIndex = '1000';
      toast.style.fontSize = '14px';
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          if (toast.parentNode) {
            document.body.removeChild(toast);
          }
        }, 500);
      }, 3000);
    }

    function showDateChangeNotification() {
      const toast = document.createElement('div');
      toast.className = 'date-change-notification';
      toast.textContent = 'Data cambiata. Le evidenziazioni sono state ripristinate.';
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = 'rgba(166, 125, 81, 0.9)';
      toast.style.color = 'white';
      toast.style.padding = '8px 16px';
      toast.style.borderRadius = '20px';
      toast.style.zIndex = '1000';
      toast.style.fontSize = '14px';
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          if (toast.parentNode) {
            document.body.removeChild(toast);
          }
        }, 500);
      }, 3000);
    }

    // ====================================
    // EVENT MANAGEMENT
    // ====================================
    function setupSelectionListeners() {
      // All devices: handle mouse selection
      document.addEventListener('mouseup', checkSelection);

      if (isMobile.value) {
        // Mobile: handle touch selection
        document.addEventListener('touchend', (event) => {
          if (!highlightMode.value) return;

          // Small delay to let selection complete
          setTimeout(() => checkSelection(event), 100);
        });

        // Monitor selection changes
        document.addEventListener('selectionchange', () => {
          if (!highlightMode.value) return;

          setTimeout(() => {
            const selection = window.getSelection();
            if (selection.toString().trim()) {
              checkSelection();
            }
          }, 100);
        });
      }
    }

    function cleanupSelectionListeners() {
      document.removeEventListener('mouseup', checkSelection);

      if (isMobile.value) {
        document.removeEventListener('touchend', () => {});
        document.removeEventListener('selectionchange', () => {});
      }
    }

    // ====================================
    // LIFECYCLE HOOKS
    // ====================================
    onMounted(() => {
      // Detect mobile device
      isMobile.value = highlighter.isMobile();

      // Load saved highlights
      highlighter.loadHighlights(props.reference);

      // Add iOS specific fixes if needed
      if (highlighter.isIOS()) {
        highlighter.addIOSFocusFix();
      }

      // Setup event listeners
      setupSelectionListeners();
    });

    onBeforeUnmount(() => {
      // Clean up event listeners
      cleanupSelectionListeners();
    });

    // Watch for date changes and clear highlights
    watch(() => props.currentDate, (newDate, oldDate) => {
      if (newDate !== oldDate) {
        // Clear all highlights when date changes
        highlighter.clearAllHighlights(props.reference);

        // Show subtle notification to user
        showDateChangeNotification();
      }
    });

    return {
      // Refs
      contentContainer,
      controlBar,

      // State
      highlightMode,
      showColorSelection,
      showCollection,
      highlights,
      highlightColors,
      exportLoading,
      isMobile,
      showMobileConfirm,

      // Computed
      hasHighlights,
      formattedDate,

      // Methods
      toggleHighlightMode,
      applyHighlight,
      cancelSelection,
      removeHighlight,
      exportHighlights,
      confirmMobileSelection
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

/* Mobile enhancements for touch selection */
@media (max-width: 768px) {
  .highlight-mode-active .highlightable-content {
    -webkit-user-select: text !important;
    user-select: text !important;
    -webkit-touch-callout: default !important;
  }

  .highlightable-content {
    touch-action: auto !important;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
  }

  /* Increase spacing for easier touch selection */
  .highlight-mode-active .highlightable-content p {
    line-height: 1.8 !important;
    margin-bottom: 0.8em !important;
  }
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

.highlighter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  position: relative;
  align-items: center;
}

/* Mobile selection confirmation */
.mobile-confirm-selection {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  z-index: 1100;
  animation: fadeUp 0.3s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.confirm-selection-btn {
  background-color: #A67D51;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 20px;
  font-size: 16px;
  font-family: 'Barlow Semi Condensed', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  -webkit-tap-highlight-color: transparent;
}

.cancel-selection-btn {
  background-color: #f0f0f0;
  color: #6e4f3a;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  -webkit-tap-highlight-color: transparent;
}

/* Export loading overlay */
.export-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-progress {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  border: 4px solid rgba(166, 125, 81, 0.2);
  border-top-color: #A67D51;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.export-progress p {
  color: #6e4f3a;
  margin: 0;
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