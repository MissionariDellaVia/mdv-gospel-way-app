// Configuration constants for the application

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
    HOME_INFO: {
        key: 'home_info_cache',
        expiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
    GOSPEL: {
        key: 'gospel_cache',
        expiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
    ALLOWED_DATES: {
        key: 'allowed_dates_cache',
        expiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    }
};

/**
 * UI configuration constants
 */
export const UI_CONFIG = {
    ZOOM: {
        MIN: 80,
        MAX: 200,
        STEP: 10,
        DEFAULT: 100,
        STORAGE_KEY: 'preferredZoomLevel',
        AUTO_HIDE_DELAY: 5000, // 5 seconds
    },
    TOAST: {
        DURATION: 3000, // 3 seconds
        FADE_DURATION: 500, // 0.5 seconds
    }
};

/**
 * Storage configuration
 */
export const STORAGE_CONFIG = {
    PREFIX: 'mdv_',
    MAX_SIZE: 4 * 1024 * 1024, // 4MB limit
    HIGHLIGHTS_PREFIX: 'highlights-',
    CACHE_TRACKER_KEY: 'cache_tracker',
};

/**
 * Legacy storage patterns for cleanup
 */
export const LEGACY_PATTERNS = {
    GOSPEL: /^gospel_\d{4}-\d{2}-\d{2}$/,
    HOME_INFO: /^home_info_\d{4}-\d{2}-\d{2}$/,
};

/**
 * Theme colors
 */
export const THEME_COLORS = {
    PRIMARY: '#6E4F3A',
    SECONDARY: '#281D02FF',
    ACCENT: '#A67D51',
    TEXT_LIGHT: '#d3b282',
    TEXT_DARK: '#281D02FF',
    BACKGROUND: '#6E4F3A',
    SUCCESS: '#28a745',
    ERROR: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
};