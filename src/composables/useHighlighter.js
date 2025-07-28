// No ref import needed as we don't create reactive variables here
import useDeviceDetection from './useDeviceDetection';
import useToast from './useToast';
import { STORAGE_CONFIG } from '@/constants';

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

    // Use device detection composable
    const { isIOS, isMobile, addIOSFocusFix } = useDeviceDetection();
    
    // Use toast composable
    const { showHighlightError } = useToast();

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
            localStorage.setItem(`${STORAGE_CONFIG.HIGHLIGHTS_PREFIX}${reference || 'page'}`, JSON.stringify({
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
            const stored = localStorage.getItem(`${STORAGE_CONFIG.HIGHLIGHTS_PREFIX}${reference || 'page'}`);

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
            localStorage.removeItem(`${STORAGE_CONFIG.HIGHLIGHTS_PREFIX}${reference || 'page'}`);
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