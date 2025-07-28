// services/StorageService.js
import { STORAGE_CONFIG } from '@/constants';

class StorageService {
  constructor() {
    // Maximum size to keep storage usage under (in bytes)
    this.maxSize = STORAGE_CONFIG.MAX_SIZE;
    this.storagePrefix = STORAGE_CONFIG.PREFIX;
    
    // Keep track of cache entries for LRU eviction
    this._initCacheTracker();
  }

  _initCacheTracker() {
    try {
      this.cacheTracker = JSON.parse(localStorage.getItem(`${this.storagePrefix}${STORAGE_CONFIG.CACHE_TRACKER_KEY}`)) || {};
    } catch (e) {
      console.warn("Error reading cache tracker, resetting:", e);
      this.cacheTracker = {};
      this._saveCacheTracker();
    }
  }

  _saveCacheTracker() {
    try {
      localStorage.setItem(`${this.storagePrefix}${STORAGE_CONFIG.CACHE_TRACKER_KEY}`, JSON.stringify(this.cacheTracker));
    } catch (e) {
      console.warn("Error saving cache tracker:", e);
    }
  }

  _updateAccessTime(key) {
    if (!this.cacheTracker[key]) {
      this.cacheTracker[key] = {};
    }
    this.cacheTracker[key].lastAccessed = Date.now();
    this._saveCacheTracker();
  }

  async _estimateStorageSize() {
    let size = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.storagePrefix)) {
          size += localStorage.getItem(key).length * 2; // Approximate size in bytes (UTF-16)
        }
      }
    } catch (e) {
      console.warn("Error estimating storage size:", e);
    }
    return size;
  }

  async _freeUpSpace(requiredBytes) {
    // Sort cache items by last access time (oldest first)
    const items = Object.keys(this.cacheTracker)
      .map(key => ({ key, ...this.cacheTracker[key] }))
      .sort((a, b) => a.lastAccessed - b.lastAccessed);
    
    let freedBytes = 0;
    
    for (const item of items) {
      try {
        const fullKey = `${this.storagePrefix}${item.key}`;
        const content = localStorage.getItem(fullKey);
        if (content) {
          freedBytes += content.length * 2; // Approximate size
          localStorage.removeItem(fullKey);
          delete this.cacheTracker[item.key];
          
          console.debug(`Cache cleanup: removed ${item.key}, freed ~${freedBytes} bytes`);
          
          if (freedBytes >= requiredBytes) {
            break;
          }
        }
      } catch (e) {
        console.warn(`Error removing item ${item.key} during cleanup:`, e);
      }
    }
    
    this._saveCacheTracker();
    return freedBytes;
  }

  // Check if a cache entry is expired
  isExpired(timestamp, expiryTime) {
    if (!timestamp || !expiryTime) return true;
    return (Date.now() - timestamp) > expiryTime;
  }

  // Get item from storage
  async getItem(key) {
    const fullKey = `${this.storagePrefix}${key}`;
    try {
      const value = localStorage.getItem(fullKey);
      if (value === null) return null;
      
      this._updateAccessTime(key);
      return JSON.parse(value);
    } catch (e) {
      console.warn(`Error reading from storage: ${key}`, e);
      return null;
    }
  }

  // Set item in storage with eviction if necessary
  async setItem(key, value) {
    const fullKey = `${this.storagePrefix}${key}`;
    const data = JSON.stringify(value);
    
    try {
      // Try to store directly
      localStorage.setItem(fullKey, data);
      this._updateAccessTime(key);
      return true;
    } catch (e) {
      // Handle QuotaExceededError or other storage errors
      console.warn(`Storage error for ${key}, attempting cleanup:`, e);
      
      try {
        // Calculate how much space we need
        const requiredBytes = data.length * 2; // Approximate size
        const currentSize = await this._estimateStorageSize();
        console.debug(`Storage status: using ~${currentSize} bytes, need ${requiredBytes} more`);
        
        // Free up space
        const freedBytes = await this._freeUpSpace(requiredBytes);
        
        if (freedBytes >= requiredBytes) {
          // Try again after cleanup
          localStorage.setItem(fullKey, data);
          this._updateAccessTime(key);
          return true;
        } else {
          console.error(`Could not free enough space: ${freedBytes}/${requiredBytes} bytes`);
          return false;
        }
      } catch (cleanupError) {
        console.error("Failed during storage cleanup:", cleanupError);
        return false;
      }
    }
  }

  // Remove item from storage
  async removeItem(key) {
    const fullKey = `${this.storagePrefix}${key}`;
    try {
      localStorage.removeItem(fullKey);
      if (this.cacheTracker[key]) {
        delete this.cacheTracker[key];
        this._saveCacheTracker();
      }
      return true;
    } catch (e) {
      console.warn(`Error removing from storage: ${key}`, e);
      return false;
    }
  }

  // Clear all items related to this app
  async clearAll() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      this.cacheTracker = {};
      this._saveCacheTracker();
      
      return true;
    } catch (e) {
      console.error("Error clearing storage:", e);
      return false;
    }
  }
}

export default new StorageService();