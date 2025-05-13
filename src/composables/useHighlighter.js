import { ref } from 'vue';

export default function useHighlighter(options) {
    const {
        contentContainer,
        controlBar,
        highlightMode,
        selectedRange,
        highlights,
        highlightId,
        showColorSelection
    } = options;

    // Device detection
    const isMobile = ref(false);
    const lastTouchY = ref(0);

    // Check if the device is iOS
    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // Add fix for iOS text selection
    function addIOSFocusFix() {
        const style = document.createElement('style');
        style.textContent = `
      .highlightable-content * {
        -webkit-user-select: text;
        user-select: text;
      }
      .highlight-mode-active .highlightable-content * {
        -webkit-tap-highlight-color: transparent;
      }
    `;
        document.head.appendChild(style);
    }

    // Handle text selection
    function checkSelection(event) {
        if (!highlightMode.value) return;

        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && isSelectionWithinContent(selection)) {
            // Save the selection range
            selectedRange.value = selection.getRangeAt(0).cloneRange();
            // Show color selection in the control bar
            showColorSelection.value = true;

            // Make sure control bar is visible
            setTimeout(() => {
                scrollToControlBar();
            }, 0);
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
                cancelSelection();
            }
        }
    }

    // Check if selection is within the content container
    function isSelectionWithinContent(selection) {
        if (!selection.rangeCount) return false;

        const containerEl = contentContainer.value;
        if (!containerEl) return false;

        const range = selection.getRangeAt(0);
        return containerEl.contains(range.commonAncestorContainer);
    }

    // Scroll to ensure control bar is visible
    function scrollToControlBar() {
        if (controlBar.value) {
            const rect = controlBar.value.getBoundingClientRect();

            // If control bar is out of viewport, scroll to it
            if (rect.bottom > window.innerHeight || rect.top < 0) {
                controlBar.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Apply highlight to the selected text
    function applyHighlight(color) {
        if (!selectedRange.value) return;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Create a highlight span - avoid name conflict
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
            saveHighlights();

            // Clear selection and hide color picker
            window.getSelection().removeAllRanges();
            cancelSelection();
        } catch (error) {
            console.error('Error applying highlight:', error);
            handleComplexSelection(color);
        }
    }

    // Handle complex selection (spanning multiple nodes)
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

                    saveHighlights();
                }
            } catch (e) {
                console.error('Failed to apply complex highlight', e);
                showHighlightError();
            }
        }

        window.getSelection().removeAllRanges();
        cancelSelection();
    }

    // Apply highlight to range as separate parts (for iOS)
    function applyHighlightToRangeAsParts(color, selectionText) {
        const tempWrapper = document.createElement('div');
        tempWrapper.className = 'temp-highlight-wrapper';
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

            saveHighlights();
        } catch (e) {
            console.error('iOS highlight fallback failed', e);
            showHighlightError();
        } finally {
            document.body.removeChild(tempWrapper);
        }
    }

    // Clear all highlights
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

    // Show an error message when highlighting fails
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

    // Cancel selection and hide color selection
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
        saveHighlights();
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

                // Update the counter to avoid ID conflicts
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

    // Handle touch events for mobile
    function handleTouchStart(event) {
        if (!highlightMode.value) return;
        lastTouchY.value = event.touches[0].clientY;
    }

    function handleTouchEnd(event) {
        if (!highlightMode.value) return;

        // Avoid triggering when scrolling
        const touchEndY = event.changedTouches[0].clientY;
        if (Math.abs(touchEndY - lastTouchY.value) > 30) return;

        // Small delay to let selection complete
        setTimeout(() => checkSelection(event), 50);
    }

    function handleSelectionChange() {
        if (!highlightMode.value) return;

        // Only apply this logic on mobile
        if (isMobile.value) {
            const selection = window.getSelection();
            if (!selection.toString().trim()) {
                // No text selected, hide toolbar after a short delay
                setTimeout(() => {
                    if (!window.getSelection().toString().trim()) {
                        cancelSelection();
                    }
                }, 300);
            } else {
                // Text is selected, check if it's within our content
                checkSelection();
            }
        }
    }

    // Handle key events (escape to cancel)
    function handleKeyDown(event) {
        if (event.key === 'Escape' && showColorSelection.value) {
            cancelSelection();
        }
    }

    // Handle clicks outside the color selection area
    function handleOutsideClick(event) {
        if (showColorSelection.value &&
            controlBar.value &&
            !controlBar.value.contains(event.target) &&
            contentContainer.value &&
            !contentContainer.value.contains(event.target)) {
            cancelSelection();
        }
    }

    // Setup all selection-related event listeners
    function setupSelectionListeners() {
        // Check if device is mobile
        isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

        // Setup events based on device
        document.addEventListener('mouseup', checkSelection);
        document.addEventListener('keydown', handleKeyDown);

        if (isMobile.value) {
            document.addEventListener('selectionchange', handleSelectionChange);
            document.addEventListener('touchstart', handleTouchStart);
            document.addEventListener('touchend', handleTouchEnd);
        }

        document.addEventListener('click', handleOutsideClick);
    }

    // Clean up all event listeners
    function cleanupSelectionListeners() {
        document.removeEventListener('mouseup', checkSelection);
        document.removeEventListener('keydown', handleKeyDown);

        if (isMobile.value) {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        }

        document.removeEventListener('click', handleOutsideClick);
    }

    return {
        isMobile,
        isIOS,
        addIOSFocusFix,
        checkSelection,
        applyHighlight,
        cancelSelection,
        removeHighlight,
        loadHighlights,
        clearAllHighlights,
        setupSelectionListeners,
        cleanupSelectionListeners
    };
}