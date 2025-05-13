<template>
  <div class="highlighter-wrapper" :class="{'highlight-mode-active': highlightMode}">
    <!-- Content container with highlighting capability -->
    <div
        ref="contentContainer"
        class="highlightable-content"
        :class="{'mobile-selection-enabled': highlightMode && isMobileDevice}"
    >
      <slot></slot>
    </div>

    <!-- Control panel with buttons and color selection -->
    <div class="highlighter-controls" ref="controlBar">
      <!-- Main button group -->
      <HighlightControls
          :highlight-mode="highlightMode"
          :has-highlights="hasHighlights"
          :highlight-count="highlights.length"
          :is-mobile="isMobileDevice"
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

      <!-- Mobile-specific selection helper -->
      <div v-if="highlightMode && isMobileDevice && !showColorSelection" class="mobile-selection-help">
        <p>{{ mobileSelectionTip }}</p>
        <button @click="checkSelectionNow" class="done-selecting-btn">Ho selezionato il testo</button>
      </div>
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
    const currentDate = ref(new Date('2025-05-13T20:59:03Z'));
    const userName = ref('Alessandro-Mac7');
    const isMobileDevice = ref(false);

    // Mobile selection helper text
    const mobileSelectionTip = computed(() => {
      return isIOS() ?
          'Seleziona il testo usando due dita o tenendo premuto, poi clicca il pulsante sotto' :
          'Seleziona il testo tenendo premuto, quindi clicca il pulsante sotto';
    });

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

    // Import composables with needed functionality
    const {
      isIOS,
      applyHighlight,
      cancelSelection,
      removeHighlight,
      clearAllHighlights,
      loadHighlights,
      setupSelectionListeners,
      cleanupSelectionListeners,
    } = useHighlighter({
      contentContainer,
      controlBar,
      highlightMode,
      selectedRange,
      highlights,
      highlightId,
      showColorSelection
    });

    const { exportHighlights } = useExporter({
      highlights,
      title: props.title,
      reference: props.reference,
      formattedDate,
      userName
    });

    // Check for text selection when button is clicked
    function checkSelectionNow() {
      // Get current selection
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text) {
        // We have a selection, show the color palette
        selectedRange.value = selection.getRangeAt(0).cloneRange();
        showColorSelection.value = true;

        // Make sure control bar is visible
        setTimeout(() => {
          if (controlBar.value) {
            controlBar.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        // No selection, show a message
        showNoSelectionMessage();
      }
    }

    function showNoSelectionMessage() {
      const toast = document.createElement('div');
      toast.className = 'selection-error-toast';
      toast.textContent = 'Nessun testo selezionato. Seleziona del testo prima di procedere.';
      toast.style.position = 'fixed';
      toast.style.bottom = '60px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
      toast.style.color = 'white';
      toast.style.padding = '12px 16px';
      toast.style.borderRadius = '8px';
      toast.style.zIndex = '2000';
      toast.style.fontSize = '14px';
      toast.style.maxWidth = '90%';
      toast.style.textAlign = 'center';

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          if (toast.parentNode) document.body.removeChild(toast);
        }, 500);
      }, 3000);
    }

    // Toggle highlight mode on/off
    function toggleHighlightMode() {
      highlightMode.value = !highlightMode.value;

      if (!highlightMode.value) {
        cancelSelection();
      } else if (isMobileDevice.value) {
        enableMobileTextSelection();
      }
    }

    // Enhanced mobile text selection
    function enableMobileTextSelection() {
      if (!contentContainer.value) return;

      // For iOS we need a special approach
      if (isIOS()) {
        // Apply iOS-specific selection fixes
        const styleEl = document.createElement('style');
        styleEl.id = 'ios-selection-fix';
        styleEl.textContent = `
          .mobile-selection-enabled,
          .mobile-selection-enabled * {
            -webkit-user-select: text !important;
            user-select: text !important;
            -webkit-touch-callout: default !important;
            cursor: text !important;
          }

          /* Increase spacing to make selection easier */
          .mobile-selection-enabled p {
            line-height: 1.8 !important;
            margin-bottom: 0.8em !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    }

    onMounted(() => {
      // Load saved highlights for the current date
      loadHighlights(props.reference);

      // Detect mobile device
      isMobileDevice.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
      );

      // Setup event listeners
      setupSelectionListeners();
    });

    onBeforeUnmount(() => {
      // Clean up event listeners
      cleanupSelectionListeners();

      // Remove any iOS-specific styles
      const styleEl = document.getElementById('ios-selection-fix');
      if (styleEl) {
        styleEl.parentNode.removeChild(styleEl);
      }
    });

    // Watch for date changes and clear highlights
    watch(() => props.currentDate, (newDate, oldDate) => {
      if (newDate !== oldDate) {
        // Clear all highlights when date changes
        clearAllHighlights(props.reference);

        // Show subtle notification to user
        showDateChangeNotification();
      }
    });

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
      mobileSelectionTip,

      // Computed
      hasHighlights,
      formattedDate,

      // Methods
      toggleHighlightMode,
      applyHighlight,
      cancelSelection,
      removeHighlight,
      exportHighlights,
      checkSelectionNow,
      isIOS
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

/* Mobile selection specific styles */
.mobile-selection-enabled {
  -webkit-user-select: text !important;
  user-select: text !important;
  -webkit-touch-callout: default !important;
  touch-action: auto !important;
}

/* Add a visual indicator when in highlight mode on mobile */
.highlight-mode-active .mobile-selection-enabled {
  padding: 15px !important;
  border: 2px dashed rgba(166, 125, 81, 0.5) !important;
  background-color: rgba(255, 250, 240, 0.5) !important;
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

/* Mobile selection helper */
.mobile-selection-help {
  width: 100%;
  background-color: rgba(166, 125, 81, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  text-align: center;
}

.mobile-selection-help p {
  margin: 0 0 10px;
  font-size: 14px;
  color: #6e4f3a;
}

.done-selecting-btn {
  background-color: #A67D51;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.done-selecting-btn:hover,
.done-selecting-btn:active {
  background-color: #8c6943;
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