// composables/useZoom.js
import { ref, watchEffect, onMounted, onUnmounted } from 'vue';
import { UI_CONFIG } from '@/constants';

/**
 * Composable for text zoom functionality
 * @returns {Object} Zoom state and methods
 */
export default function useZoom() {
    // Reactive state
    const showZoomControls = ref(false);
    const zoomLevel = ref(
        parseInt(localStorage.getItem(UI_CONFIG.ZOOM.STORAGE_KEY)) || UI_CONFIG.ZOOM.DEFAULT
    );
    
    // Timer for auto-hide functionality
    let hideTimeout = null;

    /**
     * Toggle zoom controls visibility
     */
    function toggleZoomControls() {
        showZoomControls.value = !showZoomControls.value;
        _resetAutoHideTimer();
    }

    /**
     * Increase zoom level
     */
    function increaseZoom() {
        if (zoomLevel.value < UI_CONFIG.ZOOM.MAX) {
            zoomLevel.value += UI_CONFIG.ZOOM.STEP;
            _resetAutoHideTimer();
        }
    }

    /**
     * Decrease zoom level
     */
    function decreaseZoom() {
        if (zoomLevel.value > UI_CONFIG.ZOOM.MIN) {
            zoomLevel.value -= UI_CONFIG.ZOOM.STEP;
            _resetAutoHideTimer();
        }
    }

    /**
     * Handle keyboard shortcuts for zoom
     * @param {KeyboardEvent} event 
     */
    function handleKeyboard(event) {
        // Ctrl + Plus to zoom in
        if (event.ctrlKey && (event.key === '+' || event.key === '=')) {
            event.preventDefault();
            increaseZoom();
            showZoomControls.value = true;
            _resetAutoHideTimer();
        }
        // Ctrl + Minus to zoom out
        if (event.ctrlKey && event.key === '-') {
            event.preventDefault();
            decreaseZoom();
            showZoomControls.value = true;
            _resetAutoHideTimer();
        }
    }

    /**
     * Reset the auto-hide timer
     * @private
     */
    function _resetAutoHideTimer() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }

        if (showZoomControls.value) {
            hideTimeout = setTimeout(() => {
                showZoomControls.value = false;
            }, UI_CONFIG.ZOOM.AUTO_HIDE_DELAY);
        }
    }

    /**
     * Clear any pending timeout
     * @private
     */
    function _clearTimeout() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }

    // Watch for zoom level changes and save to localStorage
    watchEffect(() => {
        try {
            localStorage.setItem(UI_CONFIG.ZOOM.STORAGE_KEY, zoomLevel.value.toString());
        } catch (error) {
            console.warn('Could not save zoom preference:', error);
        }
    });

    // Setup keyboard event listeners on mount
    onMounted(() => {
        window.addEventListener('keydown', handleKeyboard);
    });

    // Cleanup on unmount
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyboard);
        _clearTimeout();
    });

    return {
        // State
        showZoomControls,
        zoomLevel,
        
        // Methods
        toggleZoomControls,
        increaseZoom,
        decreaseZoom,
        
        // Computed properties for template
        canIncreaseZoom: () => zoomLevel.value < UI_CONFIG.ZOOM.MAX,
        canDecreaseZoom: () => zoomLevel.value > UI_CONFIG.ZOOM.MIN,
    };
}