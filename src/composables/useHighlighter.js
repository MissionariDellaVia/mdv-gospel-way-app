export default function useHighlighter(options) {
    const {
        contentContainer,
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
        return window.matchMedia('(pointer: coarse)').matches || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Check if device supports touch
     * @returns {Boolean} True if device supports touch
     */
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Add cross-platform fixes for text selection
     */
    function addSelectionFixes() {
        if (document.getElementById('selection-fix')) return;
        
        const style = document.createElement('style');
        style.id = 'selection-fix';
        style.textContent = `
            .highlightable-content {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
            .highlight-mode-active .highlightable-content {
                -webkit-touch-callout: default !important;
                -webkit-tap-highlight-color: rgba(166, 125, 81, 0.2) !important;
                cursor: text !important;
            }
            .highlight-mode-active .highlightable-content * {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
                pointer-events: auto !important;
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
        if (!selection || !selection.rangeCount || !selection.toString().trim()) {
            return false;
        }

        const containerEl = contentContainer.value;
        if (!containerEl) return false;

        try {
            const range = selection.getRangeAt(0);
            return containerEl.contains(range.commonAncestorContainer) ||
                   containerEl.contains(range.startContainer) ||
                   containerEl.contains(range.endContainer);
        } catch (error) {
            console.warn('Error checking selection bounds:', error);
            return false;
        }
    }

    /**
     * Get the current text selection safely
     * @returns {Selection|null} Current selection or null
     */
    function getCurrentSelection() {
        try {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return null;
            
            const selectedText = selection.toString().trim();
            return selectedText.length > 0 ? selection : null;
        } catch (error) {
            console.warn('Error getting selection:', error);
            return null;
        }
    }

    /**
     * Handle text selection with improved reliability
     * @param {Selection} selection The current selection
     * @returns {Range|null} Valid range or null
     */
    function handleTextSelection(selection) {
        if (!selection || !isSelectionWithinContent(selection)) {
            return null;
        }

        try {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString().trim();
            
            // Ensure we have meaningful text selected
            if (selectedText.length < 1 || selectedText.length > 1000) {
                return null;
            }

            return range.cloneRange();
        } catch (error) {
            console.warn('Error handling text selection:', error);
            return null;
        }
    }

    /**
     * Cancel the current selection and clean up state
     */
    function cancelSelection() {
        try {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
            }
        } catch (error) {
            console.warn('Error clearing selection:', error);
        }
        
        selectedRange.value = null;
        showColorSelection.value = false;
    }

    // ====================================
    // HIGHLIGHTING METHODS
    // ====================================

    /**
     * Apply highlight to selected text with improved reliability
     * @param {String} color Background color for highlight
     */
    function applyHighlight(color) {
        if (!selectedRange.value) {
            console.warn('No selection range available for highlighting');
            return;
        }

        try {
            const selectedText = selectedRange.value.toString().trim();
            if (!selectedText) {
                console.warn('Empty selection text');
                return;
            }

            // Create highlight with improved error handling
            const success = createHighlightSpan(selectedRange.value, color, selectedText);
            
            if (success) {
                // Clear selection state
                cancelSelection();
                showSuccessMessage('Testo evidenziato con successo');
            } else {
                showHighlightError('Impossibile evidenziare questo testo. Riprova.');
            }

        } catch (error) {
            console.error('Error applying highlight:', error);
            showHighlightError('Errore durante l\'evidenziazione del testo.');
            cancelSelection();
        }
    }

    /**
     * Create highlight span using reliable method
     * @param {Range} range The selection range
     * @param {String} color Background color
     * @param {String} text Selected text
     * @returns {Boolean} Success status
     */
    function createHighlightSpan(range, color, text) {
        try {
            if (range.collapsed) return false;

            const newId = `highlight-${highlightId.value++}`;
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'text-highlight';
            highlightSpan.id = newId;
            highlightSpan.style.backgroundColor = color;
            highlightSpan.style.borderRadius = '3px';
            highlightSpan.style.padding = '1px 2px';
            highlightSpan.style.margin = '0 1px';
            highlightSpan.style.display = 'inline';
            highlightSpan.style.boxDecorationBreak = 'clone';
            highlightSpan.style.webkitBoxDecorationBreak = 'clone';

            // Use the most reliable method for wrapping content
            try {
                range.surroundContents(highlightSpan);
            } catch (surroundError) {
                // Fallback: extract and wrap content
                const contents = range.extractContents();
                highlightSpan.appendChild(contents);
                range.insertNode(highlightSpan);
            }

            // Store the highlight
            storeHighlight(newId, text, color);
            return true;

        } catch (error) {
            console.warn('Primary highlighting method failed:', error);
            return false;
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
            text: text.trim(),
            color,
            timestamp: new Date().toISOString()
        });

        // Save to localStorage with error handling
        saveHighlights();
    }

    /**
     * Show success message when highlighting succeeds
     * @param {String} message Success message to display
     */
    function showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'highlight-success';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(40, 167, 69, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 2000;
            font-size: 14px;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (toast.parentNode) document.body.removeChild(toast);
            }, 500);
        }, 2000);
    }

    /**
     * Show error message when highlighting fails
     * @param {String} message Error message to display
     */
    function showHighlightError(message = 'Impossibile evidenziare questo testo. Prova a selezionare un testo più breve.') {
        const toast = document.createElement('div');
        toast.className = 'highlight-error';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 2000;
            font-size: 14px;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;

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
     * Remove a highlight by index with improved error handling
     * @param {Number} index Index of highlight to remove
     */
    function removeHighlight(index) {
        if (index < 0 || index >= highlights.value.length) {
            console.warn('Invalid highlight index:', index);
            return;
        }

        try {
            const highlight = highlights.value[index];
            const highlightEl = document.getElementById(highlight.id);
            
            if (highlightEl) {
                // Replace highlighted element with its text content
                const textNode = document.createTextNode(highlightEl.textContent);
                highlightEl.parentNode.replaceChild(textNode, highlightEl);
                
                // Normalize whitespace after removal
                if (textNode.parentNode) {
                    textNode.parentNode.normalize();
                }
            }

            // Remove from data
            highlights.value.splice(index, 1);
            saveHighlights();
            
        } catch (error) {
            console.error('Error removing highlight:', error);
            // Still remove from array even if DOM removal fails
            highlights.value.splice(index, 1);
            saveHighlights();
        }
    }

    // ====================================
    // STORAGE METHODS
    // ====================================

    /**
     * Save highlights to localStorage with improved error handling
     * @param {String} reference Optional reference identifier
     */
    function saveHighlights(reference = '') {
        try {
            const storageKey = `highlights-${reference || 'page'}`;
            const data = {
                highlights: highlights.value,
                html: contentContainer.value?.innerHTML,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving highlights to localStorage:', error);
            // Show user-friendly error if storage is full or unavailable
            if (error.name === 'QuotaExceededError') {
                showHighlightError('Spazio di archiviazione esaurito. Alcune evidenziazioni potrebbero non essere salvate.');
            }
        }
    }

    /**
     * Load highlights from localStorage with improved error handling
     * @param {String} reference Optional reference identifier
     */
    function loadHighlights(reference = '') {
        try {
            const storageKey = `highlights-${reference || 'page'}`;
            const stored = localStorage.getItem(storageKey);

            if (stored) {
                const data = JSON.parse(stored);
                
                // Validate data structure
                if (data && Array.isArray(data.highlights)) {
                    highlights.value = data.highlights.filter(h => h && h.id && h.text && h.color);

                    // Update counter to avoid ID conflicts
                    if (highlights.value.length) {
                        const maxId = Math.max(...highlights.value.map(h => {
                            const idNum = parseInt(h.id.replace('highlight-', ''));
                            return isNaN(idNum) ? 0 : idNum;
                        }));
                        highlightId.value = maxId + 1;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading highlights from localStorage:', error);
            // Reset highlights array if data is corrupted
            highlights.value = [];
        }
    }

    /**
     * Clear all highlights with improved cleanup
     * @param {String} reference Optional reference identifier
     */
    function clearAllHighlights(reference = '') {
        try {
            // Remove all highlight spans from the DOM
            highlights.value.forEach(highlight => {
                try {
                    const highlightEl = document.getElementById(highlight.id);
                    if (highlightEl) {
                        const textNode = document.createTextNode(highlightEl.textContent);
                        highlightEl.parentNode.replaceChild(textNode, highlightEl);
                    }
                } catch (error) {
                    console.warn('Error removing highlight element:', highlight.id, error);
                }
            });

            // Normalize whitespace after all removals
            if (contentContainer.value) {
                contentContainer.value.normalize();
            }

            // Clear the highlights array
            highlights.value = [];

            // Remove from localStorage
            const storageKey = `highlights-${reference || 'page'}`;
            localStorage.removeItem(storageKey);
            
        } catch (error) {
            console.error('Error clearing highlights:', error);
            // Still clear the array even if other operations fail
            highlights.value = [];
        }
    }

    return {
        // Device detection
        isIOS,
        isMobile,
        isTouchDevice,
        addSelectionFixes,

        // Selection methods
        isSelectionWithinContent,
        getCurrentSelection,
        handleTextSelection,
        cancelSelection,

        // Highlighting methods
        applyHighlight,
        removeHighlight,

        // Storage methods
        saveHighlights,
        loadHighlights,
        clearAllHighlights,

        // Utility methods
        showSuccessMessage,
        showHighlightError
    };
}