import StorageService from '@/services/StorageService';
import ApiService from '@/services/ApiService';

// Configuration
const CACHE_CONFIG = {
    HOME_INFO: {
        key: 'home_info_cache',
        expiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
    GOSPEL: {
        key: 'gospel_cache',
        expiry: 24 * 60 * 60 * 1000,
    },
    ALLOWED_DATES: {
        key: 'allowed_dates_cache',
        expiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    }
};

export default {
    async loadHomeInfo(context) {
        const date = context.getters.currentDate;
        const cacheKey = CACHE_CONFIG.HOME_INFO.key;

        try {
            // Try to get from cache first
            const cachedData = await StorageService.getItem(cacheKey);
            if (cachedData && cachedData.date === date && !StorageService.isExpired(cachedData.timestamp, CACHE_CONFIG.HOME_INFO.expiry)) {
                console.debug("Using cached home info for date:", date);
                context.commit('setHomeInfo', {
                    saint: cachedData.data.saints,
                    liturgy: cachedData.data.liturgy
                });
                return cachedData.data;
            }

            // Fetch from API if cache miss or expired
            const responseData = await ApiService.getHomeInfo(date);

            // Update cache
            await StorageService.setItem(cacheKey, {
                date,
                data: responseData,
                timestamp: Date.now()
            });

            context.commit('setHomeInfo', {
                saint: responseData.saints,
                liturgy: responseData.liturgy
            });
            return responseData;
        } catch (error) {
            console.error("Error in loadHomeInfo:", error);
            throw error;
        }
    },

    async loadGospelWay(context, date) {
        const cacheKey = CACHE_CONFIG.GOSPEL.key;

        try {
            // Try to get from cache first
            const cachedData = await StorageService.getItem(cacheKey);
            if (cachedData && cachedData.date === date && !StorageService.isExpired(cachedData.timestamp, CACHE_CONFIG.GOSPEL.expiry)) {
                console.debug("Using cached gospel for date:", date);
                const parsedData = cachedData.data;
                context.commit('setTodayGospelWay', parsedData.today);
                context.commit('setConnectedGospelWay', parsedData.connected);
                context.commit('setConnectedVideos', parsedData.videos);
                return parsedData;
            }

            // Fetch from API if cache miss or expired
            const responseData = await ApiService.getGospelWay(date);

            // Update cache
            await StorageService.setItem(cacheKey, {
                date,
                data: responseData,
                timestamp: Date.now()
            });

            context.commit('setTodayGospelWay', responseData.today);
            context.commit('setConnectedGospelWay', responseData.connected);
            context.commit('setConnectedVideos', responseData.videos);
            return responseData;
        } catch (error) {
            console.error("Error in loadGospelWay:", error);
            throw error;
        }
    },

    async loadAllowedDates(context) {
        const cacheKey = CACHE_CONFIG.ALLOWED_DATES.key;

        try {
            // Try to get from cache first
            const cachedData = await StorageService.getItem(cacheKey);
            if (cachedData && !StorageService.isExpired(cachedData.timestamp, CACHE_CONFIG.ALLOWED_DATES.expiry)) {
                console.debug("Using cached allowed dates");
                context.commit('setAllowedDates', cachedData.data);
                return cachedData.data;
            }

            // Fetch from API if cache miss or expired
            const responseData = await ApiService.getAllowedDates();

            // Update cache
            await StorageService.setItem(cacheKey, {
                data: responseData,
                timestamp: Date.now()
            });

            context.commit('setAllowedDates', responseData);
            return responseData;
        } catch (error) {
            console.error("Error in loadAllowedDates:", error);
            throw error;
        }
    },

    // Unchanged method
    async changeDay(context, payload) {
        let maxDate = new Date(context.getters.allowedDates[0]);
        let currDate = new Date(context.getters.currentDate);

        if (payload.add) {
            if (currDate < maxDate) {
                context.commit('addDay');
            }
        }
        else if (payload.subtract) {
            context.commit('subtractDay');
        }
        else if (payload.fullDate) {
            context.commit('changeDate', payload.fullDate);
        }
    }
};