// services/CacheService.js
import StorageService from './StorageService';

/**
 * Unified cache service for handling cache operations
 */
class CacheService {
    /**
     * Get data from cache or fetch from API if cache miss/expired
     * @param {string} cacheKey - Cache key configuration
     * @param {number} expiry - Cache expiry time in milliseconds
     * @param {Function} fetchFunction - Function to fetch data from API
     * @param {string} dateKey - Optional date for cache validation
     * @returns {Promise} - Cached or fresh data
     */
    async getCachedData(cacheKey, expiry, fetchFunction, dateKey = null) {
        try {
            // Try to get from cache first
            const cachedData = await StorageService.getItem(cacheKey);
            
            if (this._isCacheValid(cachedData, expiry, dateKey)) {
                console.debug(`Using cached data for key: ${cacheKey}`);
                return { data: cachedData.data, fromCache: true };
            }

            // Fetch from API if cache miss or expired
            console.debug(`Cache miss/expired for key: ${cacheKey}, fetching fresh data`);
            const freshData = await fetchFunction();

            // Update cache
            await this._updateCache(cacheKey, freshData, dateKey);
            
            return { data: freshData, fromCache: false };
        } catch (error) {
            console.error(`Error in getCachedData for key ${cacheKey}:`, error);
            throw error;
        }
    }

    /**
     * Check if cached data is valid
     * @private
     */
    _isCacheValid(cachedData, expiry, dateKey) {
        if (!cachedData) return false;
        
        // Check date match if dateKey provided
        if (dateKey && cachedData.date !== dateKey) return false;
        
        // Check expiry
        return !StorageService.isExpired(cachedData.timestamp, expiry);
    }

    /**
     * Update cache with fresh data
     * @private
     */
    async _updateCache(cacheKey, data, dateKey) {
        const cachePayload = {
            data,
            timestamp: Date.now()
        };
        
        if (dateKey) {
            cachePayload.date = dateKey;
        }
        
        await StorageService.setItem(cacheKey, cachePayload);
    }

    /**
     * Clear specific cache entry
     * @param {string} cacheKey - Cache key to clear
     */
    async clearCache(cacheKey) {
        await StorageService.removeItem(cacheKey);
    }

    /**
     * Clear all cache entries
     */
    async clearAllCache() {
        await StorageService.clearAll();
    }
}

export default new CacheService();