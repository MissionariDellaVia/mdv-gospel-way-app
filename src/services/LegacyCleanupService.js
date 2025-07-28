// services/LegacyCleanupService.js
import { LEGACY_PATTERNS } from '@/constants';

/**
 * Service to handle cleanup of legacy storage items
 */
class LegacyCleanupService {
    /**
     * Execute legacy storage cleanup
     * Removes old gospel_YYYY-MM-DD and home_info_YYYY-MM-DD keys
     */
    static executeCleanup() {
        console.log("Starting legacy storage cleanup...");
        
        try {
            const keysToRemove = this._getLegacyKeys();
            
            // Log what we found for debugging
            console.log(`Found ${keysToRemove.length} legacy items in localStorage`);
            
            this._removeLegacyKeys(keysToRemove);
            
            console.log(`Legacy storage cleanup complete. Removed ${keysToRemove.length} items.`);
        } catch (error) {
            console.warn("Error during legacy storage cleanup:", error);
        }
    }

    /**
     * Get all localStorage keys that match legacy patterns
     * @private
     * @returns {string[]} Array of legacy keys to remove
     */
    static _getLegacyKeys() {
        const keys = [];
        
        // Get all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        
        // Filter keys that match legacy patterns
        return keys.filter(key => 
            LEGACY_PATTERNS.GOSPEL.test(key) || 
            LEGACY_PATTERNS.HOME_INFO.test(key)
        );
    }

    /**
     * Remove legacy keys from localStorage
     * @private
     * @param {string[]} keysToRemove - Array of keys to remove
     */
    static _removeLegacyKeys(keysToRemove) {
        keysToRemove.forEach(key => {
            try {
                console.log(`Removing legacy key: ${key}`);
                localStorage.removeItem(key);
            } catch (error) {
                console.warn(`Failed to remove legacy key ${key}:`, error);
            }
        });
    }

    /**
     * Check if legacy cleanup is needed
     * @returns {boolean} True if legacy keys exist
     */
    static isCleanupNeeded() {
        try {
            const legacyKeys = this._getLegacyKeys();
            return legacyKeys.length > 0;
        } catch (error) {
            console.warn("Error checking for legacy cleanup need:", error);
            return false;
        }
    }
}

export default LegacyCleanupService;