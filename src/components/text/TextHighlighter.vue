<template>
  <div class="highlighter-wrapper" :class="{'highlight-mode-active': highlightMode}">
    <!-- Content container with highlighting capability -->
    <div
        ref="contentContainer"
        class="highlightable-content"
        :contenteditable="isSelectionModeActive"
    >
      <slot></slot>
    </div>

    <!-- Mobile selection overlay (shows only in selection mode) -->
    <div v-if="isSelectionModeActive" class="mobile-selection-overlay">
      <div class="mobile-selection-controls">
        <button @click="cancelSelectionMode" class="selection-btn cancel-btn">Annulla</button>
        <div class="selection-status">Seleziona il testo, quindi conferma</div>
        <button @click="confirmSelection" class="selection-btn confirm-btn">Conferma</button>
      </div>
    </div>

    <!-- Control panel with buttons and color selection -->
    <div class="highlighter-controls" ref="controlBar">
      <!-- Main button group -->
      <HighlightControls
          :highlight-mode="highlightMode"
          :has-highlights="hasHighlights"
          :highlight-count="highlights.length"
          :is-mobile="isMobile"
          @toggle-mode="toggleHighlightMode"
          @select-text="enableSelectionMode"
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
    const currentDate = ref(new Date('2025-05-13T21:42:56Z'));
    const userName = ref('Alessandro-Mac7');
    const isMobile = ref(false);
    const isSelectionModeActive = ref(false);
    const originalContent = ref('');
    const selectedText = ref('');
    let selectionStyleEl = null;

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
      addIOSFocusFix,
      cancelSelection,
      removeHighlight,
      clearAllHighlights,
      loadHighlights,
      setupSelectionListeners,
      cleanupSelectionListeners
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

    // Enable selection mode specifically for mobile
    function enableSelectionMode() {
      if (!contentContainer.value) return;

      // Save original content before enabling contentEditable
      originalContent.value = contentContainer.value.innerHTML;

      // Check if already in contentEditable mode
      if (contentContainer.value.getAttribute('contenteditable') === 'true') {
        contentContainer.value.blur();
        contentContainer.value.setAttribute('contenteditable', 'false');
        setTimeout(() => {
          contentContainer.value.setAttribute('contenteditable', 'true');
          contentContainer.value.focus();
        }, 50);
      }

      // Add specific iOS & Android selection fix styles
      selectionStyleEl = document.createElement('style');
      selectionStyleEl.id = 'mobile-selection-fix';
      selectionStyleEl.textContent = `
        [contenteditable="true"] {
          -webkit-user-select: text !important;
          user-select: text !important;
          -webkit-touch-callout: default !important;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.2) !important;
          cursor: text !important;
          caret-color: #A67D51 !important;
        }

        /* Force text selection mode */
        .highlightable-content {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }

        /* Increase touch targets for selection */
        .highlightable-content p,
        .highlightable-content div,
        .highlightable-content span {
          margin-bottom: 1em !important;
          line-height: 1.8 !important;
          min-height: 1.8em !important;
        }

        /* Fix for Safari */
        @supports (-webkit-touch-callout: none) {
          .highlightable-content {
            -webkit-touch-callout: default !important;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.2) !important;
          }
        }
      `;
      document.head.appendChild(selectionStyleEl);

      // Activate selection mode
      isSelectionModeActive.value = true;

      // Force focus on contentEditable to bring up keyboard
      setTimeout(() => {
        if (contentContainer.value) {
          contentContainer.value.focus();

          // Create a visible text cursor
          if (isIOS()) {
            // Create a text selection point for iOS
            const range = document.createRange();
            const sel = window.getSelection();

            try {
              // Try to place cursor at beginning of content
              if (contentContainer.value.firstChild) {
                range.setStart(contentContainer.value.firstChild, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              }
            } catch (e) {
              console.log("Could not set initial cursor position");
            }
          }
        }
      }, 100);
    }

    // Cancel selection mode
    function cancelSelectionMode() {
      window.getSelection().removeAllRanges();
      isSelectionModeActive.value = false;

      // Ensure content is restored if needed
      if (contentContainer.value && originalContent.value) {
        contentContainer.value.innerHTML = originalContent.value;
        contentContainer.value.setAttribute('contenteditable', 'false');
      }

      // Remove any selection-specific styles
      if (selectionStyleEl && selectionStyleEl.parentNode) {
        selectionStyleEl.parentNode.removeChild(selectionStyleEl);
      }
    }

    // Confirm selection and proceed to color selection
    function confirmSelection() {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text) {
        // Save the selected text
        selectedText.value = text;

        // Exit selection mode
        isSelectionModeActive.value = false;

        // Restore original content
        if (contentContainer.value && originalContent.value) {
          contentContainer.value.innerHTML = originalContent.value;
          contentContainer.value.setAttribute('contenteditable', 'false');
        }

        // Remove selection-specific styles
        if (selectionStyleEl && selectionStyleEl.parentNode) {
          selectionStyleEl.parentNode.removeChild(selectionStyleEl);
        }

        // Show color palette
        showColorSelection.value = true;
      } else {
        // If no text is selected, show a message
        alert("Per favore seleziona del testo prima di confermare.");
      }
    }

    // Apply highlight to the selected text
    function applyHighlight(color) {
      if (isMobile.value && selectedText.value) {
        // Mobile-specific highlighting method
        applyMobileHighlight(color);
      } else {
        // Desktop highlighting method
        applyDesktopHighlight(color);
      }
    }

    // Apply highlight for mobile devices
    function applyMobileHighlight(color) {
      if (!selectedText.value || !contentContainer.value) return;

      const text = selectedText.value;
      const content = contentContainer.value;
      const newId = `highlight-${highlightId.value++}`;

      try {
        // Escape special regex characters in the text
        const safeText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a regex that matches the text but not inside HTML tags
        const regex = new RegExp(`(${safeText})(?![^<]*>|[^<>]*</)`, 'i');

        // Replace the first occurrence with a highlighted span
        if (regex.test(content.innerHTML)) {
          content.innerHTML = content.innerHTML.replace(
              regex,
              `<span id="${newId}" class="text-highlight" style="background-color:${color};">$1</span>`
          );

          // Save highlight data
          highlights.value.push({
            id: newId,
            text: text,
            color,
            timestamp: new Date().toISOString()
          });

          // Save to localStorage
          localStorage.setItem(`highlights-${props.reference || 'page'}`, JSON.stringify({
            highlights: highlights.value,
            html: contentContainer.value?.innerHTML
          }));

          // Clear selection state
          selectedText.value = '';
          showColorSelection.value = false;
        } else {
          // If regex fails, try a manual DOM insertion approach
          insertManualHighlight(text, color);
        }
      } catch (error) {
        console.error('Error applying mobile highlight:', error);
        insertManualHighlight(text, color);
      }
    }

    // Manual fallback for highlighting
    function insertManualHighlight(text, color) {
      try {
        const content = contentContainer.value;
        const newId = `highlight-${highlightId.value++}`;

        // Create a special marker
        const marker = `##HIGHLIGHT_MARKER_${Date.now()}##`;

        // Replace the first occurrence of the text with the marker
        const contentHtml = content.innerHTML;
        const idx = contentHtml.indexOf(text);

        if (idx >= 0) {
          // We found the text, replace it with our marker
          const before = contentHtml.substring(0, idx);
          const after = contentHtml.substring(idx + text.length);
          content.innerHTML = before + marker + after;

          // Now replace the marker with our highlight span
          content.innerHTML = content.innerHTML.replace(
              marker,
              `<span id="${newId}" class="text-highlight" style="background-color:${color};">${text}</span>`
          );

          // Save highlight data
          highlights.value.push({
            id: newId,
            text: text,
            color,
            timestamp: new Date().toISOString()
          });

          // Save to localStorage
          localStorage.setItem(`highlights-${props.reference || 'page'}`, JSON.stringify({
            highlights: highlights.value,
            html: contentContainer.value?.innerHTML
          }));
        } else {
          // Last resort: just append a new highlighted element at the end
          fallbackHighlight(text, color);
        }
      } catch (e) {
        console.error('Manual highlight insertion failed:', e);
        fallbackHighlight(text, color);
      } finally {
        // Clear selection state
        selectedText.value = '';
        showColorSelection.value = false;
      }
    }

    // Last resort fallback
    function fallbackHighlight(text, color) {
      const newId = `highlight-${highlightId.value++}`;

      // Create highlighted span
      const span = document.createElement('span');
      span.id = newId;
      span.className = 'text-highlight';
      span.style.backgroundColor = color;
      span.textContent = text;

      // Save the data but don't insert anything
      highlights.value.push({
        id: newId,
        text: text,
        color,
        timestamp: new Date().toISOString()
      });

      // Save to localStorage
      localStorage.setItem(`highlights-${props.reference || 'page'}`, JSON.stringify({
        highlights: highlights.value,
        html: contentContainer.value?.innerHTML
      }));

      // Show a success message
      alert("Evidenziazione salvata!");

      // Clear selection state
      selectedText.value = '';
      showColorSelection.value = false;
    }

    // Apply highlight for desktop
    function applyDesktopHighlight(color) {
      if (!selectedRange.value) return;

      try {
        // Get original selection
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Create a highlight span
        const newId = `highlight-${highlightId.value++}`;
        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'text-highlight';
        highlightSpan.id = newId;
        highlightSpan.style.backgroundColor = color;

        // Get the text content of the selection
        const text = selectedRange.value.toString();

        // Apply the highlight
        selectedRange.value.surroundContents(highlightSpan);

        // Store highlight info
        highlights.value.push({
          id: newId,
          text: text,
          color,
          timestamp: new Date().toISOString()
        });

        // Save to localStorage
        localStorage.setItem(`highlights-${props.reference || 'page'}`, JSON.stringify({
          highlights: highlights.value,
          html: contentContainer.value?.innerHTML
        }));

        // Clear selections
        window.getSelection().removeAllRanges();
        showColorSelection.value = false;
      } catch (error) {
        console.error('Error applying desktop highlight:', error);
        // Get the text from selection range
        const text = selectedRange.value.toString();

        // Try execCommand as fallback
        try {
          const newId = `highlight-${highlightId.value++}`;
          document.execCommand('insertHTML', false,
              `<span id="${newId}" class="text-highlight" style="background-color:${color};">${text}</span>`);

          // Store highlight info
          highlights.value.push({
            id: newId,
            text,
            color,
            timestamp: new Date().toISOString()
          });

          // Save to localStorage
          localStorage.setItem(`highlights-${props.reference || 'page'}`, JSON.stringify({
            highlights: highlights.value,
            html: contentContainer.value?.innerHTML
          }));
        } catch (e) {
          console.error('Fallback highlighting failed:', e);
          alert('Si è verificato un errore durante l\'evidenziazione. Riprova con una selezione più breve.');
        }

        // Clear selections
        window.getSelection().removeAllRanges();
        showColorSelection.value = false;
      }
    }

    // Toggle highlight mode on/off
    function toggleHighlightMode() {
      highlightMode.value = !highlightMode.value;

      if (!highlightMode.value) {
        cancelSelection();
        if (isSelectionModeActive.value) {
          cancelSelectionMode();
        }
      } else if (isMobile.value) {
        showMobileTip();
      }
    }

    // Show tooltip for mobile users
    function showMobileTip() {
      const toast = document.createElement('div');
      toast.className = 'mobile-highlight-tip';
      toast.innerHTML = 'Clicca su <strong>Seleziona Testo</strong> per evidenziare';
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
      }, 4000);
    }

    onMounted(() => {
      // Detect if mobile device
      isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
      );

      // Load saved highlights for the current date
      loadHighlights(props.reference);

      // Setup iOS fixes if needed
      if (isIOS()) {
        addIOSFocusFix();
      }

      // Setup event listeners
      setupSelectionListeners();
    });

    onBeforeUnmount(() => {
      // Clean up event listeners
      cleanupSelectionListeners();

      // Remove any remaining style elements
      if (selectionStyleEl && selectionStyleEl.parentNode) {
        selectionStyleEl.parentNode.removeChild(selectionStyleEl);
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
      isMobile,
      isSelectionModeActive,

      // Computed
      hasHighlights,
      formattedDate,

      // Methods
      toggleHighlightMode,
      enableSelectionMode,
      cancelSelectionMode,
      confirmSelection,
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
  padding: 15px !important;
  border: 2px solid #B2A348 !important;
  background-color: rgba(255, 250, 240, 0.8) !important;
  border-radius: 8px !important;
  cursor: text !important;
  caret-color: #A67D51 !important;
  min-height: 100px !important;
}

/* Mobile selection overlay */
.mobile-selection-overlay {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 1050;  /* Higher z-index */
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
  padding: 10px 16px; /* Larger touch target */
  border-radius: 20px;
  border: none;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-size: 14px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #6e4f3a;
}

.confirm-btn {
  background-color: #B2A348;
  color: white;
}

.highlighter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  position: relative;
  align-items: center;
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