/**
 * Utility functions for the application
 * @deprecated Consider using specific composables instead of global utilities
 */

/**
 * Get image URL, handling both relative and absolute paths
 * @param {string} pic - Image path
 * @returns {string} - Full image URL
 */
function getImgUrl(pic) {
    if (/(http(s?)):\/\//i.test(pic)) {
        return pic;
    }
    return require('@/assets/' + pic);
}

/**
 * Convert kebab-case to camelCase
 * @param {string} str - String in kebab-case
 * @returns {string} - String in camelCase
 */
function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
}

/**
 * Convert camelCase to kebab-case
 * @param {string} str - String in camelCase
 * @returns {string} - String in kebab-case
 */
function toKebabCase(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Format date to YYYY-MM-DD format
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Check if a string is a valid date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid date
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Export individual functions (preferred modern approach)
export {
    getImgUrl,
    toCamelCase,
    toKebabCase,
    formatDate,
    isValidDate
};

// Legacy export for backward compatibility
export const utilityFunction = {
    getImgUrl,
    toCamelCase,
    toKebabCase,
    formatDate,
    isValidDate
};
