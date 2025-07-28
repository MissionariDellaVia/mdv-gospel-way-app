// composables/useDeviceDetection.js

/**
 * Composable for device detection utilities
 * @returns {Object} Device detection methods
 */
export default function useDeviceDetection() {
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
     * Check if the device is Android
     * @returns {Boolean} True if device is Android
     */
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    /**
     * Check if the device is tablet
     * @returns {Boolean} True if device is tablet
     */
    function isTablet() {
        return /iPad|Android.*tablet|tablet.*Android/i.test(navigator.userAgent);
    }

    /**
     * Check if the device supports touch
     * @returns {Boolean} True if device supports touch
     */
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Get device type
     * @returns {String} Device type: 'mobile', 'tablet', or 'desktop'
     */
    function getDeviceType() {
        if (isMobile() && !isTablet()) return 'mobile';
        if (isTablet()) return 'tablet';
        return 'desktop';
    }

    /**
     * Add iOS specific fixes for text selection
     */
    function addIOSFocusFix() {
        if (!isIOS()) return;
        
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

    return {
        isIOS,
        isMobile,
        isAndroid,
        isTablet,
        isTouchDevice,
        getDeviceType,
        addIOSFocusFix
    };
}