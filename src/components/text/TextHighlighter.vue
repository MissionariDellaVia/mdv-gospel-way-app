<template>
  <div class="highlighter-wrapper" :class="{'highlight-mode-active': highlightMode}">
    <!-- Content container with highlighting capability -->
    <div ref="contentContainer" class="highlightable-content">
      <slot></slot>
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
import html2canvas from 'html2canvas';

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
    const currentDate = ref(new Date('2025-05-13T21:53:52Z'));
    const userName = ref('Alessandro-Mac7');
    const exportLoading = ref(false);

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

    // Check if is mobile device
    function isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Check if is iOS
    function isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // Import composables with needed functionality
    const {
      addIOSFocusFix,
      applyHighlight,
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

    // Export highlights as image
    async function exportHighlights() {
      if (!hasHighlights.value) return;

      showCollection.value = false;
      exportLoading.value = true;

      try {
        // Create export container
        const exportContainer = document.createElement('div');
        exportContainer.className = 'highlight-export-container';
        exportContainer.style.width = '90%';
        exportContainer.style.maxWidth = '750px';
        exportContainer.style.padding = '0';
        exportContainer.style.margin = '0 auto';
        exportContainer.style.backgroundColor = 'white';
        exportContainer.style.fontFamily = '"Barlow Semi Condensed", sans-serif';
        exportContainer.style.color = '#281D02';
        exportContainer.style.borderRadius = '12px';
        exportContainer.style.overflow = 'hidden';
        exportContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';

        // Add header
        const header = document.createElement('div');
        header.style.padding = '20px';
        header.style.background = 'linear-gradient(to right, #6e4f3a, #A67D51)';
        header.style.color = 'white';
        header.style.display = 'flex';
        header.style.alignItems = 'center';

        const titleDiv = document.createElement('div');

        const titleH2 = document.createElement('h2');
        titleH2.style.margin = '0';
        titleH2.style.fontSize = '22px';
        titleH2.textContent = props.title;

        const subtitleP = document.createElement('p');
        subtitleP.style.margin = '5px 0 0';
        subtitleP.style.opacity = '0.9';
        subtitleP.style.fontSize = '16px';
        subtitleP.textContent = props.reference || 'Evidenziazioni';

        titleDiv.appendChild(titleH2);
        titleDiv.appendChild(subtitleP);
        header.appendChild(titleDiv);
        exportContainer.appendChild(header);

        // Add highlights
        const highlightsSection = document.createElement('div');
        highlightsSection.style.padding = '20px';

        highlights.value.forEach(highlight => {
          const highlightItem = document.createElement('div');
          highlightItem.style.display = 'flex';
          highlightItem.style.marginBottom = '15px';
          highlightItem.style.paddingBottom = '15px';
          highlightItem.style.borderBottom = '1px solid rgba(166, 125, 81, 0.2)';

          const colorBar = document.createElement('div');
          colorBar.style.width = '5px';
          colorBar.style.flexShrink = '0';
          colorBar.style.borderRadius = '3px';
          colorBar.style.marginRight = '15px';
          colorBar.style.backgroundColor = highlight.color;

          const textContent = document.createElement('div');
          textContent.style.flex = '1';
          textContent.style.fontSize = '16px';
          textContent.style.lineHeight = '1.5';
          textContent.style.color = '#3e2723';

          const openQuote = document.createElement('span');
          openQuote.style.fontSize = '20px';
          openQuote.style.color = '#A67D51';
          openQuote.style.fontFamily = 'Georgia, serif';
          openQuote.textContent = '"';

          const textSpan = document.createElement('span');
          textSpan.textContent = highlight.text;

          const closeQuote = document.createElement('span');
          closeQuote.style.fontSize = '20px';
          closeQuote.style.color = '#A67D51';
          closeQuote.style.fontFamily = 'Georgia, serif';
          closeQuote.textContent = '"';

          textContent.appendChild(openQuote);
          textContent.appendChild(textSpan);
          textContent.appendChild(closeQuote);

          highlightItem.appendChild(colorBar);
          highlightItem.appendChild(textContent);

          highlightsSection.appendChild(highlightItem);
        });

        exportContainer.appendChild(highlightsSection);

        // Add footer with user and date
        const footer = document.createElement('div');
        footer.style.padding = '0 20px 20px';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.color = '#6e4f3a';
        footer.style.fontSize = '14px';

        const userInfo = document.createElement('div');
        userInfo.textContent = userName.value;

        const dateInfo = document.createElement('div');
        dateInfo.textContent = formattedDate.value;

        footer.appendChild(userInfo);
        footer.appendChild(dateInfo);

        exportContainer.appendChild(footer);

        // Add to DOM temporarily but hidden
        document.body.appendChild(exportContainer);
        exportContainer.style.position = 'fixed';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '0';

        // Short delay to ensure everything renders properly
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate canvas with html2canvas
        const canvas = await html2canvas(exportContainer, {
          backgroundColor: '#fff',
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        // Convert to image
        const imgData = canvas.toDataURL('image/png');

        // Clean up the container
        document.body.removeChild(exportContainer);

        // Share or download based on platform
        if (isMobileDevice() && navigator.share) {
          // For mobile devices with share capability
          try {
            const blob = await (await fetch(imgData)).blob();
            const file = new File([blob], `evidenziazioni-${props.reference || 'vangelo'}.png`, { type: 'image/png' });

            await navigator.share({
              files: [file],
              title: 'Le mie evidenziazioni',
              text: 'Evidenziazioni da La Via del Vangelo'
            });
          } catch (err) {
            console.error('Error sharing', err);
            downloadImage(imgData);
          }
        } else {
          // For desktop or older mobile browsers
          downloadImage(imgData);
        }
      } catch (error) {
        console.error('Error exporting highlights:', error);
        alert('Si è verificato un errore durante l\'esportazione. Riprova più tardi.');
      } finally {
        exportLoading.value = false;
      }
    }

    // Download image helper
    function downloadImage(imgData) {
      const link = document.createElement('a');
      const filename = `evidenziazioni-${props.reference ? props.reference.replace(/\s+/g, '-').toLowerCase() : 'vangelo'}-${new Date().toISOString().split('T')[0]}.png`;

      link.download = filename;
      link.href = imgData;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Toggle highlight mode on/off
    function toggleHighlightMode() {
      highlightMode.value = !highlightMode.value;

      if (!highlightMode.value) {
        cancelSelection();
      } else if (isMobileDevice()) {
        showMobileTip();
      }
    }

    // Show tooltip for mobile users
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

    onMounted(() => {
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
      exportLoading,

      // Computed
      hasHighlights,
      formattedDate,

      // Methods
      toggleHighlightMode,
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