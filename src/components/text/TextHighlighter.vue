<template>
  <div class="highlighter-wrapper" :class="{'highlight-mode-active': highlightMode}">
    <!-- Content container with highlighting capability -->
    <div ref="contentContainer" class="highlightable-content-container">
      <slot></slot>
    </div>

    <!-- Control buttons with integrated color selection -->
    <div class="highlighter-control-bar" ref="controlBar">
      <!-- Highlight toggle button -->
      <button
          @click="toggleHighlightMode"
          class="control-btn highlight-btn"
          :class="{'active': highlightMode}"
          aria-label="Attiva/disattiva evidenziazione"
      >
        <i class="fa-solid fa-highlighter"></i>
        <span class="control-label">Evidenzia</span>
      </button>

      <!-- Integrated color selection bar - shown when text is selected in highlight mode -->
      <div
          v-if="showColorSelection && highlightMode"
          class="color-selection-bar"
      >
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

      <!-- Collection button -->
      <button
          v-if="hasHighlights"
          @click="showCollection = true"
          class="control-btn collection-btn"
          aria-label="Visualizza evidenziazioni"
      >
        <i class="fa-solid fa-book-open"></i>
        <span class="control-label">Salvati ({{ highlights.length }})</span>
      </button>

      <!-- Export button -->
      <button
          v-if="hasHighlights"
          @click="exportHighlights"
          class="control-btn export-btn"
          aria-label="Esporta evidenziazioni"
      >
        <i class="fa-solid fa-file-export"></i>
        <span class="control-label">Esporta</span>
      </button>
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
              v-if="hasHighlights"
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
import html2canvas from 'html2canvas';

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
    }
  },
  data() {
    return {
      highlightMode: false,
      selectedRange: null,
      showColorSelection: false,
      highlightColors: [
        { name: 'Giallo', value: 'rgba(255, 230, 0, 0.35)' },
        { name: 'Azzurro', value: 'rgba(0, 176, 255, 0.35)' },
        { name: 'Rosa', value: 'rgba(255, 121, 168, 0.35)' },
        { name: 'Verde', value: 'rgba(0, 230, 118, 0.35)' },
        { name: 'Viola', value: 'rgba(187, 107, 217, 0.35)' }
      ],
      highlights: [],
      highlightId: 1,
      showCollection: false,
      currentDate: new Date('2025-05-13T20:20:12Z'),
      isMobile: false,
      lastTouchY: 0,
      userName: 'Alessandro-Mac7'
    };
  },
  computed: {
    hasHighlights() {
      return this.highlights.length > 0;
    },
    formattedDate() {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return this.currentDate.toLocaleDateString('it-IT', options);
    }
  },
  mounted() {
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.loadHighlights();

    // Setup event listeners
    document.addEventListener('mouseup', this.checkSelection);
    document.addEventListener('keydown', this.handleKeyDown);

    if (this.isMobile) {
      document.addEventListener('selectionchange', this.handleSelectionChange);
      document.addEventListener('touchstart', this.handleTouchStart);
      document.addEventListener('touchend', this.handleTouchEnd);
    }

    document.addEventListener('click', this.handleOutsideClick);

    if (this.isIOS()) {
      this.addIOSFocusFix();
    }
  },
  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener('mouseup', this.checkSelection);
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.isMobile) {
      document.removeEventListener('selectionchange', this.handleSelectionChange);
      document.removeEventListener('touchstart', this.handleTouchStart);
      document.removeEventListener('touchend', this.handleTouchEnd);
    }

    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    handleKeyDown(event) {
      // Handle Escape key to cancel selection
      if (event.key === 'Escape' && this.showColorSelection) {
        this.cancelSelection();
      }
    },

    isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    addIOSFocusFix() {
      const style = document.createElement('style');
      style.textContent = `
        .highlightable-content-container * {
          -webkit-user-select: text;
          user-select: text;
        }
        .highlight-mode-active .highlightable-content-container * {
          -webkit-tap-highlight-color: transparent;
        }
      `;
      document.head.appendChild(style);
    },

    handleTouchStart(event) {
      if (!this.highlightMode) return;
      this.lastTouchY = event.touches[0].clientY;
    },

    handleTouchEnd(event) {
      if (!this.highlightMode) return;

      // Avoid triggering when scrolling
      const touchEndY = event.changedTouches[0].clientY;
      if (Math.abs(touchEndY - this.lastTouchY) > 30) return;

      // Small delay to let selection complete
      setTimeout(() => this.checkSelection(event), 50);
    },

    handleSelectionChange() {
      if (!this.highlightMode || !this.isMobile) return;

      const selection = window.getSelection();
      if (!selection.toString().trim()) {
        // No text selected, hide toolbar after a short delay
        setTimeout(() => {
          if (!window.getSelection().toString().trim()) {
            this.cancelSelection();
          }
        }, 300);
      }
    },

    toggleHighlightMode() {
      this.highlightMode = !this.highlightMode;

      if (!this.highlightMode) {
        this.cancelSelection();
      } else if (this.isMobile) {
        this.showMobileTip();
      }
    },

    showMobileTip() {
      const toast = document.createElement('div');
      toast.className = 'mobile-highlight-tip';
      toast.textContent = 'Seleziona il testo tenendo premuto';
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
    },

    checkSelection(event) {
      if (!this.highlightMode) return;

      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text && this.isSelectionWithinContent(selection)) {
        // Save the selection range
        this.selectedRange = selection.getRangeAt(0).cloneRange();
        // Show color selection in the control bar
        this.showColorSelection = true;

        // Make sure control bar is visible
        this.$nextTick(() => {
          this.scrollToControlBar();
        });
      } else if (
          // Don't hide when clicking inside the color selection area
          !(event && event.target && (
              event.target.closest('.color-selection-bar') ||
              event.target.closest('.color-btn') ||
              event.target.closest('.action-btn')
          ))
      ) {
        // Hide the color selection for clicks elsewhere
        if (event && event.type === 'click') {
          this.cancelSelection();
        }
      }
    },

    scrollToControlBar() {
      // Ensure the control bar is visible when color selection is shown
      if (this.$refs.controlBar) {
        const rect = this.$refs.controlBar.getBoundingClientRect();

        // If control bar is out of viewport, scroll to it
        if (rect.bottom > window.innerHeight || rect.top < 0) {
          this.$refs.controlBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },

    isSelectionWithinContent(selection) {
      if (!selection.rangeCount) return false;

      const containerEl = this.$refs.contentContainer;
      if (!containerEl) return false;

      const range = selection.getRangeAt(0);
      return containerEl.contains(range.commonAncestorContainer);
    },

    handleOutsideClick(event) {
      // Hide colors if clicking outside the control bar and not on text
      if (this.showColorSelection &&
          this.$refs.controlBar &&
          !this.$refs.controlBar.contains(event.target) &&
          this.$refs.contentContainer &&
          !this.$refs.contentContainer.contains(event.target)) {
        this.cancelSelection();
      }
    },

    applyHighlight(color) {
      if (!this.selectedRange) return;

      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      // Create a highlight span
      const highlightId = `highlight-${this.highlightId++}`;
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'text-highlight';
      highlightSpan.id = highlightId;
      highlightSpan.style.backgroundColor = color;

      try {
        // Apply the highlight
        this.selectedRange.surroundContents(highlightSpan);

        // Store the highlight info
        this.highlights.push({
          id: highlightId,
          text: this.selectedRange.toString(),
          color,
          timestamp: this.currentDate.toISOString()
        });

        // Save highlights
        this.saveHighlights();

        // Clear selection and hide color picker
        window.getSelection().removeAllRanges();
        this.cancelSelection();
      } catch (error) {
        console.error('Error applying highlight:', error);
        this.handleComplexSelection(color);
      }
    },

    handleComplexSelection(color) {
      const selectionText = window.getSelection().toString();
      const tempId = 'temp-selection-' + Date.now();

      if (this.isIOS()) {
        this.applyHighlightToRangeAsParts(color, selectionText);
      } else {
        try {
          document.execCommand('insertHTML', false,
              `<span id="${tempId}" class="text-highlight" style="background-color:${color};">${selectionText}</span>`);

          const tempEl = document.getElementById(tempId);
          if (tempEl) {
            const highlightId = `highlight-${this.highlightId++}`;
            tempEl.id = highlightId;

            this.highlights.push({
              id: highlightId,
              text: selectionText,
              color,
              timestamp: this.currentDate.toISOString()
            });

            this.saveHighlights();
          }
        } catch (e) {
          console.error('Failed to apply complex highlight', e);
          this.showHighlightError();
        }
      }

      window.getSelection().removeAllRanges();
      this.cancelSelection();
    },

    applyHighlightToRangeAsParts(color, selectionText) {
      const tempWrapper = document.createElement('div');
      tempWrapper.className = 'temp-highlight-wrapper';
      tempWrapper.style.display = 'none';
      document.body.appendChild(tempWrapper);
      tempWrapper.innerText = selectionText;

      const highlightId = `highlight-${this.highlightId++}`;

      try {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'text-highlight';
        highlightSpan.id = highlightId;
        highlightSpan.style.backgroundColor = color;
        highlightSpan.innerText = selectionText;

        range.deleteContents();
        range.insertNode(highlightSpan);

        this.highlights.push({
          id: highlightId,
          text: selectionText,
          color,
          timestamp: this.currentDate.toISOString()
        });

        this.saveHighlights();
      } catch (e) {
        console.error('iOS highlight fallback failed', e);
        this.showHighlightError();
      } finally {
        document.body.removeChild(tempWrapper);
      }
    },

    showHighlightError() {
      const toast = document.createElement('div');
      toast.className = 'highlight-error';
      toast.textContent = 'Impossibile evidenziare questo testo. Prova a selezionare un testo più breve.';
      toast.style.position = 'fixed';
      toast.style.top = '50%';
      toast.style.left = '50%';
      toast.style.transform = 'translate(-50%, -50%)';
      toast.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
      toast.style.color = 'white';
      toast.style.padding = '12px 20px';
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
    },

    cancelSelection() {
      window.getSelection().removeAllRanges();
      this.selectedRange = null;
      this.showColorSelection = false;
    },

    removeHighlight(index) {
      const highlightId = this.highlights[index].id;

      const highlightEl = document.getElementById(highlightId);
      if (highlightEl) {
        const textNode = document.createTextNode(highlightEl.textContent);
        highlightEl.parentNode.replaceChild(textNode, highlightEl);
      }

      this.highlights.splice(index, 1);
      this.saveHighlights();
    },

    saveHighlights() {
      try {
        localStorage.setItem(`highlights-${this.reference || 'page'}`, JSON.stringify({
          highlights: this.highlights,
          html: this.$refs.contentContainer.innerHTML
        }));
      } catch (error) {
        console.error('Error saving highlights:', error);
      }
    },

    loadHighlights() {
      try {
        const stored = localStorage.getItem(`highlights-${this.reference || 'page'}`);

        if (stored) {
          const data = JSON.parse(stored);
          this.highlights = data.highlights || [];

          // Restore highlighted HTML if we have it
          const slotContent = this.$slots.default && this.$slots.default();
          if (data.html && this.$refs.contentContainer && !slotContent) {
            this.$refs.contentContainer.innerHTML = data.html;
          }

          // Update the counter to avoid ID conflicts
          if (this.highlights.length) {
            const maxId = Math.max(...this.highlights.map(h =>
                parseInt(h.id.replace('highlight-', '')) || 0
            ));
            this.highlightId = maxId + 1;
          }
        }
      } catch (error) {
        console.error('Error loading highlights:', error);
      }
    },

    async exportHighlights() {
      this.showCollection = false;
      this.showExportProgress();

      try {
        // Create export container
        const exportContainer = document.createElement('div');
        exportContainer.className = 'highlight-export-container';
        exportContainer.style.width = '750px';
        exportContainer.style.padding = '0';
        exportContainer.style.margin = '0';
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

        // App logo
        const logoImg = document.createElement('img');
        logoImg.src = '/img/icons/android-chrome-192x192.png';
        logoImg.alt = 'Logo';
        logoImg.style.width = '50px';
        logoImg.style.height = '50px';
        logoImg.style.marginRight = '15px';
        logoImg.style.borderRadius = '8px';

        const titleDiv = document.createElement('div');

        const titleH2 = document.createElement('h2');
        titleH2.style.margin = '0';
        titleH2.style.fontSize = '24px';
        titleH2.textContent = this.title;

        const subtitleP = document.createElement('p');
        subtitleP.style.margin = '5px 0 0';
        subtitleP.style.opacity = '0.9';
        subtitleP.style.fontSize = '16px';
        subtitleP.textContent = this.reference || 'Evidenziazioni';

        titleDiv.appendChild(titleH2);
        titleDiv.appendChild(subtitleP);

        header.appendChild(logoImg);
        header.appendChild(titleDiv);
        exportContainer.appendChild(header);

        // Add highlights
        const highlightsSection = document.createElement('div');
        highlightsSection.style.padding = '20px';

        this.highlights.forEach(highlight => {
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
          colorBar.style.height = 'auto';
          colorBar.style.backgroundColor = highlight.color;

          const textContent = document.createElement('div');
          textContent.style.flex = '1';
          textContent.style.fontSize = '18px';
          textContent.style.lineHeight = '1.5';
          textContent.style.color = '#3e2723';

          const openQuote = document.createElement('span');
          openQuote.style.fontSize = '24px';
          openQuote.style.color = '#A67D51';
          openQuote.style.fontFamily = 'Georgia, serif';
          openQuote.textContent = '"';

          const textSpan = document.createElement('span');
          textSpan.textContent = highlight.text;

          const closeQuote = document.createElement('span');
          closeQuote.style.fontSize = '24px';
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
        userInfo.textContent = this.userName;

        const dateInfo = document.createElement('div');
        dateInfo.textContent = this.formattedDate;

        footer.appendChild(userInfo);
        footer.appendChild(dateInfo);

        exportContainer.appendChild(footer);

        // Add to DOM temporarily but hidden
        document.body.appendChild(exportContainer);
        exportContainer.style.position = 'fixed';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '-9999px';

        // Generate canvas with html2canvas
        const canvas = await html2canvas(exportContainer, {
          backgroundColor: '#fff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        // Convert to image and download
        const imgData = canvas.toDataURL('image/png');
        this.downloadImage(imgData);

        // Clean up
        document.body.removeChild(exportContainer);
        this.hideExportProgress();
      } catch (error) {
        console.error('Error exporting highlights:', error);
        this.hideExportProgress();
        alert('Errore durante l\'esportazione. Riprova più tardi.');
      }
    },

    downloadImage(imgData) {
      const link = document.createElement('a');
      link.download = `evidenziazioni-${this.reference ? this.reference.replace(/\s+/g, '-').toLowerCase() : 'vangelo'}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgData;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    showExportProgress() {
      const progress = document.createElement('div');
      progress.id = 'export-progress';
      progress.style.position = 'fixed';
      progress.style.top = '0';
      progress.style.left = '0';
      progress.style.right = '0';
      progress.style.bottom = '0';
      progress.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      progress.style.zIndex = '9999';
      progress.style.display = 'flex';
      progress.style.flexDirection = 'column';
      progress.style.alignItems = 'center';
      progress.style.justifyContent = 'center';
      progress.style.color = 'white';
      progress.style.fontFamily = 'Barlow Semi Condensed, sans-serif';

      progress.innerHTML = `
        <div style="width: 50px; height: 50px; border: 3px solid #d3b282; border-radius: 50%; border-top-color: transparent; animation: exportSpin 1s linear infinite;"></div>
        <p style="margin-top: 20px;">Preparazione esportazione...</p>
      `;

      const style = document.createElement('style');
      style.textContent = `
        @keyframes exportSpin {
          to { transform: rotate(360deg); }
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(progress);
    },

    hideExportProgress() {
      const progress = document.getElementById('export-progress');
      if (progress) {
        progress.style.opacity = '0';
        progress.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          if (progress.parentNode) document.body.removeChild(progress);
        }, 300);
      }
    }
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

.highlightable-content-container {
  position: relative;
  -webkit-user-select: text;
  user-select: text;
}

.highlight-mode-active .highlightable-content-container {
  cursor: text;
  padding: 8px;
  background-color: rgba(166, 125, 81, 0.05);
  border-radius: 8px;
  transition: background-color 0.3s;
}

/* Control buttons and integrated color selection */
.highlighter-control-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  position: relative;
  align-items: center;
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

.collection-btn {
  background-color: rgba(166, 125, 81, 0.1);
}

.export-btn {
  background-color: rgba(110, 79, 58, 0.1);
}

/* Color selection bar integrated in toolbar */
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

  .control-btn {
    padding: 8px 10px;
    flex: 1;
    justify-content: center;
  }

  .control-btn i {
    margin-right: 4px;
  }

  .highlighter-control-bar {
    gap: 6px;
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