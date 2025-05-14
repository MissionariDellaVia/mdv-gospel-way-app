// No ref import needed as we don't create reactive variables here
export default function useHighlighter(options) {
    const {
        contentContainer,
        // controlBar and highlightMode are in the options but unused in this composable
        // so we don't destructure them to avoid ESLint errors
        selectedRange,
        highlights,
        highlightId,
        showColorSelection
    } = options;

    // ====================================
    // DEVICE DETECTION
    // ====================================

    /**
     * Check if the device is iOS
     * @returns {Boolean} True if device is iOS
     */
    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    /**
     * Check if the device is mobile
     * @returns {Boolean} True if device is mobile
     */
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }

    /**
     * Add iOS specific fixes for text selection
     */
    function addIOSFocusFix() {
        const style = document.createElement('style');
        style.textContent = `
      .highlightable-content * {
        -webkit-user-select: text;
        user-select: text;
      }
      .highlight-mode-active .highlightable-content * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      }
    `;
        document.head.appendChild(style);
    }

    // ====================================
    // SELECTION METHODS
    // ====================================

    /**
     * Check if selection is within content container
     * @param {Selection} selection The current selection
     * @returns {Boolean} True if selection is within content
     */
    function isSelectionWithinContent(selection) {
        if (!selection.rangeCount) return false;

        const containerEl = contentContainer.value;
        if (!containerEl) return false;

        const range = selection.getRangeAt(0);
        return containerEl.contains(range.commonAncestorContainer);
    }

    /**
     * Cancel the current selection
     */
    function cancelSelection() {
        window.getSelection().removeAllRanges();
        selectedRange.value = null;
        showColorSelection.value = false;
    }

    // ====================================
    // HIGHLIGHTING METHODS
    // ====================================

    /**
     * Apply highlight to selected text
     * @param {String} color Background color for highlight
     */
    function applyHighlight(color) {
        if (!selectedRange.value) return;

        try {
            // Primary approach: use Range API
            applyHighlightWithRange(color);
        } catch (error) {
            console.error('Error applying highlight with Range API:', error);

            try {
                // Secondary approach: use execCommand
                applyHighlightWithExecCommand(color);
            } catch (e) {
                console.error('Error applying highlight with execCommand:', e);

                // Last resort: try manual DOM manipulation
                applyHighlightManually(color);
            }
        }

        // Clear selection state
        window.getSelection().removeAllRanges();
        showColorSelection.value = false;
    }

    /**
     * Apply highlight using the Range API
     * @param {String} color Background color for highlight
     */
    function applyHighlightWithRange(color) {
        // Create a highlight span
        const newId = `highlight-${highlightId.value++}`;
        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'text-highlight';
        highlightSpan.id = newId;
        highlightSpan.style.backgroundColor = color;

        // Get the text content
        const selectedText = selectedRange.value.toString();

        // Apply the highlight
        selectedRange.value.surroundContents(highlightSpan);

        // Store the highlight
        storeHighlight(newId, selectedText, color);
    }

    /**
     * Apply highlight using execCommand as fallback
     * @param {String} color Background color for highlight
     */
    function applyHighlightWithExecCommand(color) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (!selectedText) return;

        const newId = `highlight-${highlightId.value++}`;

        // Use execCommand to insert HTML
        document.execCommand(
            'insertHTML',
            false,
            `<span id="${newId}" class="text-highlight" style="background-color:${color};">${selectedText}</span>`
        );

        // Store the highlight
        storeHighlight(newId, selectedText, color);
    }

    /**
     * Apply highlight using manual DOM manipulation
     * @param {String} color Background color for highlight
     */
    function applyHighlightManually(color) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (!selectedText || !contentContainer.value) return;

        const newId = `highlight-${highlightId.value++}`;

        try {
            // Find text in content using regex
            const html = contentContainer.value.innerHTML;
            const safeText = selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${safeText})(?![^<]*>|[^<>]*</)`, 'i');

            if (regex.test(html)) {
                // Replace with highlight
                contentContainer.value.innerHTML = html.replace(
                    regex,
                    `<span id="${newId}" class="text-highlight" style="background-color:${color};">${selectedText}</span>`
                );

                // Store highlight
                storeHighlight(newId, selectedText, color);
            } else {
                console.log('Text not found for replacement');
                showHighlightError();
            }
        } catch (e) {
            console.error('Manual highlighting failed:', e);
            showHighlightError();
        }
    }

    /**
     * Store highlight in the highlights array and localStorage
     * @param {String} id Unique ID for the highlight
     * @param {String} text Highlighted text content
     * @param {String} color Background color
     */
    function storeHighlight(id, text, color) {
        // Add to highlights array
        highlights.value.push({
            id,
            text,
            color,
            timestamp: new Date().toISOString()
        });

        // Save to localStorage
        saveHighlights();
    }

    /**
     * Show error message when highlighting fails
     */
    function showHighlightError() {
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
    }

    /**
     * Remove a highlight by index
     * @param {Number} index Index of highlight to remove
     */
    function removeHighlight(index) {
        const highlightId = highlights.value[index].id;

        // Remove highlight from DOM
        const highlightEl = document.getElementById(highlightId);
        if (highlightEl) {
            const textNode = document.createTextNode(highlightEl.textContent);
            highlightEl.parentNode.replaceChild(textNode, highlightEl);
        }

        // Remove from data
        highlights.value.splice(index, 1);
        saveHighlights();
    }

    // ====================================
    // STORAGE METHODS
    // ====================================

    /**
     * Save highlights to localStorage
     * @param {String} reference Optional reference identifier
     */
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

    /**
     * Load highlights from localStorage
     * @param {String} reference Optional reference identifier
     */
    function loadHighlights(reference = '') {
        try {
            const stored = localStorage.getItem(`highlights-${reference || 'page'}`);

            if (stored) {
                const data = JSON.parse(stored);
                highlights.value = data.highlights || [];

                // Update counter to avoid ID conflicts
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

    /**
     * Clear all highlights
     * @param {String} reference Optional reference identifier
     */
    function clearAllHighlights(reference = '') {
        // Remove all highlight spans from the DOM
        highlights.value.forEach(highlight => {
            const highlightEl = document.getElementById(highlight.id);
            if (highlightEl) {
                const textNode = document.createTextNode(highlightEl.textContent);
                highlightEl.parentNode.replaceChild(textNode, highlightEl);
            }
        });

        // Clear the highlights array
        highlights.value = [];

        // Remove from localStorage
        try {
            localStorage.removeItem(`highlights-${reference || 'page'}`);
        } catch (error) {
            console.error('Error clearing highlights from storage:', error);
        }
    }

    return {
        // Device detection
        isIOS,
        isMobile,
        addIOSFocusFix,

        // Selection methods
        isSelectionWithinContent,
        cancelSelection,

        // Highlighting methods
        applyHighlight,
        removeHighlight,

        // Storage methods
        saveHighlights,
        loadHighlights,
        clearAllHighlights
    };
}