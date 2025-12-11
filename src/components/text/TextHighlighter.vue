<template>
  <div class="highlighter-wrapper" :class="{'highlight-mode-active': highlightModeActive}">
    <!-- Content container with highlighting capability -->
    <div ref="contentContainer" class="highlightable-content">
      <slot></slot>
    </div>

    <!-- Collection modal -->
    <HighlightCollection
        v-if="showCollection"
        :highlights="highlights"
        :formatted-date="formattedDate"
        @close="showCollection = false"
        @remove="removeHighlight"
        @export="showExportOptions"
    />

    <!-- Export options dialog -->
    <div v-if="showExportDialog" class="export-dialog">
      <div class="export-dialog-content">
        <h3>Scegli il formato</h3>
        <div class="export-options">
          <button @click="exportAsImage" class="export-option-btn">
            <i class="fa-solid fa-image"></i> Immagine
          </button>
          <button @click="exportAsText" class="export-option-btn">
            <i class="fa-solid fa-file-alt"></i> Testo
          </button>
        </div>
        <button @click="showExportDialog = false" class="export-dialog-close">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    </div>

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
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import HighlightCollection from './HighlightCollection.vue';
import useHighlighter from '@/composables/useHighlighter';
import useExporter from '@/composables/useExporter';

export default {
  name: 'TextHighlighter',
  components: {
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
      default: ''
    },
    // External control props
    highlightMode: {
      type: Boolean,
      default: false
    },
    highlightColor: {
      type: String,
      default: 'rgba(255, 230, 0, 0.35)'
    }
  },
  emits: ['highlight-count-change'],
  setup(props, { emit }) {
    // ====================================
    // STATE MANAGEMENT
    // ====================================
    const contentContainer = ref(null);
    const controlBar = ref(null);

    const showCollection = ref(false);
    const showExportDialog = ref(false);
    const selectedRange = ref(null);
    const highlights = ref([]);
    const highlightId = ref(1);
    const exportLoading = ref(false);
    const isMobile = ref(false);

    // Use prop for highlight mode state (controlled externally)
    const highlightModeActive = computed(() => props.highlightMode);

    // Use prop for highlight color (controlled externally)
    const currentHighlightColor = computed(() => props.highlightColor);

    // Formatted date for UI display
    const formattedDate = computed(() => {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date().toLocaleDateString('it-IT', options);
    });

    // Computed properties
    const hasHighlights = computed(() => highlights.value.length > 0);

    // ====================================
    // COMPOSABLES
    // ====================================
    const highlighter = useHighlighter({
      contentContainer,
      controlBar,
      highlightMode: highlightModeActive,
      selectedRange,
      highlights,
      highlightId
    });

    const exporter = useExporter({
      highlights,
      title: 'Vangelo del Giorno',
      reference: props.textRef || props.reference,
      formattedDate,
      organization: 'La Via del Vangelo a cura dei Missionari e Missionarie della Via'
    });

    // Watch loading state from exporter
    watch(() => exporter.isExportLoading.value, (loading) => {
      exportLoading.value = loading;
    });

    // Update reference when textRef changes
    watch(() => props.textRef, (newRef) => {
      if (exporter.updateReference) {
        exporter.updateReference(newRef || props.reference);
      }
    });

    // ====================================
    // SIMPLIFIED SELECTION HANDLING
    // ====================================
    const selectionTimeout = ref(null);
    const isProcessingHighlight = ref(false);

    function handleTextSelection() {
        if (!highlightModeActive.value) return;

        // Prevent re-entry while processing
        if (isProcessingHighlight.value) return;

        // Clear any existing timeout
        if (selectionTimeout.value) {
            clearTimeout(selectionTimeout.value);
        }

        // Debounce selection handling - longer delay for iOS stability
        const delay = highlighter.isIOS() ? 200 : 100;

        selectionTimeout.value = setTimeout(() => {
            // Double-check we're not already processing
            if (isProcessingHighlight.value) return;

            const selection = highlighter.getCurrentSelection();
            const validRange = highlighter.handleTextSelection(selection);

            if (validRange) {
                // Lock to prevent duplicate highlights
                isProcessingHighlight.value = true;

                selectedRange.value = validRange;

                // Auto-apply with current color from props
                applyHighlight(currentHighlightColor.value);

                // Clear the selection to prevent re-triggering
                window.getSelection()?.removeAllRanges();

                // Unlock after a short delay
                setTimeout(() => {
                    isProcessingHighlight.value = false;
                }, 300);
            }
        }, delay);
    }

    // Remove unused function
    // function scrollToControlBar() { ... }

    // ====================================
    // HIGHLIGHT METHODS
    // ====================================
    function applyHighlight(color) {
        highlighter.applyHighlight(color);
    }

    function cancelSelection() {
        highlighter.cancelSelection();
    }

    function removeHighlight(index) {
        highlighter.removeHighlight(index);
    }

    // ====================================
    // EXPORT METHODS
    // ====================================
    function showExportOptions() {
      showExportDialog.value = true;
    }

    function exportAsImage() {
      showExportDialog.value = false;
      showCollection.value = false;
      exporter.exportAsImage(isMobile.value);
    }

    function exportAsText() {
      showExportDialog.value = false;
      showCollection.value = false;
      exporter.exportAsText();
    }

    function exportHighlights() {
      // Legacy method to maintain backward compatibility
      showExportOptions();
    }

    // toggleHighlightMode is now controlled externally via props

    // ====================================
    // UI NOTIFICATION HELPERS
    // ====================================

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
    // EVENT MANAGEMENT - SIMPLIFIED
    // ====================================
    function setupSelectionListeners() {
        // Use a unified approach for all devices
        // mouseup for desktop, touchend for mobile
        document.addEventListener('mouseup', handleTextSelection);
        document.addEventListener('touchend', handleTextSelection, { passive: true });

        // Note: We intentionally do NOT use 'selectionchange' event here
        // because on iOS it fires too frequently and causes duplicate highlights
    }

    function cleanupSelectionListeners() {
        // Clean up timeout
        if (selectionTimeout.value) {
            clearTimeout(selectionTimeout.value);
            selectionTimeout.value = null;
        }

        // Reset processing flag
        isProcessingHighlight.value = false;

        // Remove event listeners
        document.removeEventListener('mouseup', handleTextSelection);
        document.removeEventListener('touchend', handleTextSelection);
    }

    // ====================================
    // LIFECYCLE HOOKS
    // ====================================
    onMounted(() => {
        // Detect mobile device
        isMobile.value = highlighter.isMobile();

        // Load saved highlights
        highlighter.loadHighlights(props.reference);

        // Add cross-platform selection fixes
        highlighter.addSelectionFixes();

        // Setup event listeners
        setupSelectionListeners();
    });

    onBeforeUnmount(() => {
      // Clean up event listeners
      cleanupSelectionListeners();
    });

    // Watch for date changes in props
    watch(() => props.currentDate, (newDate, oldDate) => {
      if (newDate !== oldDate) {
        // Clear all highlights when date changes
        highlighter.clearAllHighlights(props.reference);
        showDateChangeNotification();
      }
    });

    // Watch for highlight count changes and emit to parent
    watch(() => highlights.value.length, (count) => {
      emit('highlight-count-change', count);
    }, { immediate: true });

    // Watch for highlight mode changes to cancel selection when deactivated
    watch(() => props.highlightMode, (active) => {
      if (!active) {
        cancelSelection();
      }
    });

    return {
      // Refs
      contentContainer,
      controlBar,
      selectionTimeout,

      // State
      highlightModeActive,
      showCollection,
      showExportDialog,
      highlights,
      currentHighlightColor,
      exportLoading,
      isMobile,

      // Computed
      hasHighlights,
      formattedDate,
      highlightCount: computed(() => highlights.value.length),

      // Methods (exposed for external control)
      openCollection: () => { showCollection.value = true; },
      closeCollection: () => { showCollection.value = false; },
      applyHighlight,
      cancelSelection,
      removeHighlight,
      exportHighlights,
      exportAsImage,
      exportAsText,
      showExportOptions
    };
  }
};
</script>

<style>
/* Global styles for the highlighted text elements - NO layout changes */
.text-highlight {
  /* No padding/margin to prevent text displacement */
  display: inline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  transition: background-color 0.2s ease;
  cursor: default;
}

.text-highlight:hover {
  filter: brightness(1.05);
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
  /* Ensure inheritance of text decoration */
  text-decoration: inherit;
}

/* Mobile enhancements for touch selection - NO layout changes */
@media (max-width: 768px) {
  .highlight-mode-active .highlightable-content {
    -webkit-user-select: text !important;
    user-select: text !important;
    -webkit-touch-callout: default !important;
    touch-action: manipulation !important;
  }

  /* Selection color customization */
  .highlight-mode-active .highlightable-content::selection {
    background-color: rgba(166, 125, 81, 0.3);
    color: inherit;
  }

  .highlight-mode-active .highlightable-content::-moz-selection {
    background-color: rgba(166, 125, 81, 0.3);
    color: inherit;
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
  /* Subtle background only - no padding to avoid layout shift */
  background-color: rgba(166, 125, 81, 0.04);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

/* Export dialog */
.export-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: modalFadeIn 0.3s;
}

.export-dialog-content {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 350px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: modalSlideUp 0.3s;
}

.export-dialog h3 {
  color: #6e4f3a;
  margin-top: 0;
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
}

.export-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.export-option-btn {
  background-color: #f0f0f0;
  color: #6e4f3a;
  border: none;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.export-option-btn:hover {
  background-color: #e6e6e6;
}

.export-option-btn i {
  font-size: 24px;
  color: #A67D51;
}

.export-dialog-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #6e4f3a;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.export-dialog-close:hover {
  background-color: #f0f0f0;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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