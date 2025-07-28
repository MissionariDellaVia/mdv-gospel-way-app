import ApiService from '@/services/ApiService';
import CacheService from '@/services/CacheService';
import { CACHE_CONFIG } from '@/constants';

export default {
    async loadHomeInfo(context) {
        const date = context.getters.currentDate;

        try {
            const result = await CacheService.getCachedData(
                CACHE_CONFIG.HOME_INFO.key,
                CACHE_CONFIG.HOME_INFO.expiry,
                () => ApiService.getHomeInfo(date),
                date
            );

            context.commit('setHomeInfo', {
                saint: result.data.saints,
                liturgy: result.data.liturgy
            });
            
            return result.data;
        } catch (error) {
            console.error("Error in loadHomeInfo:", error);
            throw error;
        }
    },

    async loadGospelWay(context, date) {
        try {
            const result = await CacheService.getCachedData(
                CACHE_CONFIG.GOSPEL.key,
                CACHE_CONFIG.GOSPEL.expiry,
                () => ApiService.getGospelWay(date),
                date
            );

            const responseData = result.data;
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
        try {
            const result = await CacheService.getCachedData(
                CACHE_CONFIG.ALLOWED_DATES.key,
                CACHE_CONFIG.ALLOWED_DATES.expiry,
                () => ApiService.getAllowedDates()
            );

            context.commit('setAllowedDates', result.data);
            return result.data;
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