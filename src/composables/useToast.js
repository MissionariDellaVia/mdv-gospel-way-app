// composables/useToast.js
import { UI_CONFIG, THEME_COLORS } from '@/constants';

/**
 * Composable for toast notifications
 * @returns {Object} Toast methods
 */
export default function useToast() {
    
    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type: 'error', 'success', 'warning', 'info'
     * @param {number} duration - Display duration in milliseconds
     */
    function showToast(message, type = 'info', duration = UI_CONFIG.TOAST.DURATION) {
        const toast = _createToastElement(message, type);
        document.body.appendChild(toast);
        
        _scheduleToastRemoval(toast, duration);
    }

    /**
     * Show error toast
     * @param {string} message - Error message
     */
    function showError(message) {
        showToast(message, 'error');
    }

    /**
     * Show success toast
     * @param {string} message - Success message
     */
    function showSuccess(message) {
        showToast(message, 'success');
    }

    /**
     * Show warning toast
     * @param {string} message - Warning message
     */
    function showWarning(message) {
        showToast(message, 'warning');
    }

    /**
     * Show info toast
     * @param {string} message - Info message
     */
    function showInfo(message) {
        showToast(message, 'info');
    }

    /**
     * Show highlight error with predefined message
     */
    function showHighlightError() {
        showError('Impossibile evidenziare questo testo. Prova a selezionare un testo più breve.');
    }

    /**
     * Create toast DOM element
     * @private
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @returns {HTMLElement} Toast element
     */
    function _createToastElement(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const styles = _getToastStyles(type);
        Object.assign(toast.style, styles);
        
        return toast;
    }

    /**
     * Get styles for toast type
     * @private
     * @param {string} type - Toast type
     * @returns {Object} Style object
     */
    function _getToastStyles(type) {
        const baseStyles = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '2000',
            fontSize: '14px',
            maxWidth: '90%',
            textAlign: 'center',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        };

        const typeColors = {
            error: THEME_COLORS.ERROR,
            success: THEME_COLORS.SUCCESS,
            warning: THEME_COLORS.WARNING,
            info: THEME_COLORS.INFO
        };

        return {
            ...baseStyles,
            backgroundColor: _getBackgroundColor(typeColors[type])
        };
    }

    /**
     * Convert hex color to RGB values or use CSS variables
     * @private
     * @param {string} hex - Hex color or CSS variable
     * @returns {string} RGB values or CSS variable
     */
    function _getBackgroundColor(hex) {
        // If it's already a CSS variable, return as is with opacity
        if (hex.startsWith('var(')) {
            return hex;
        }
        
        // Convert hex to RGB for backward compatibility
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 0.9)`
            : 'rgba(0, 0, 0, 0.9)';
    }

    /**
     * Schedule toast removal
     * @private
     * @param {HTMLElement} toast - Toast element
     * @param {number} duration - Display duration
     */
    function _scheduleToastRemoval(toast, duration) {
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = `opacity ${UI_CONFIG.TOAST.FADE_DURATION}ms`;
            
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, UI_CONFIG.TOAST.FADE_DURATION);
        }, duration);
    }

    return {
        showToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        showHighlightError
    };
}