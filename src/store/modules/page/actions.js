// noinspection JSUnresolvedVariable
export default {
    async loadHomeInfo(context) {
        console.info("Environment base URL: " + process.env.VUE_APP_MDV_BASE_URL);
        const date = context.getters.currentDate;
        const baseUrl = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/info/${date}`;
        console.debug("load home info -> " + baseUrl);

        try {
            const response = await fetch(baseUrl);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Store in localStorage - use a single key instead of date-based keys
            try {
                localStorage.setItem('current_home_info', JSON.stringify({
                    date: date,
                    data: responseData
                }));
            } catch (storageError) {
                console.warn("Failed to store home info in localStorage:", storageError);
                // Continue even if storage fails
            }

            context.commit('setHomeInfo', { saint: responseData.saints, liturgy: responseData.liturgy});
            return responseData;
        } catch (error) {
            console.error("Errore nella richiesta:", error);

            // Try to load from cache if available
            try {
                const cachedData = localStorage.getItem('current_home_info');
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    // Only use cached data if it's for the requested date
                    if (parsed.date === date) {
                        const parsedData = parsed.data;
                        context.commit('setHomeInfo', {
                            saint: parsedData.saints,
                            liturgy: parsedData.liturgy
                        });
                        return parsedData;
                    }
                }
            } catch (cacheError) {
                console.warn("Error reading from cache:", cacheError);
            }

            throw error;
        }
    },

    async loadGospelWay(context, date) {
        const baseUrl = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/gospel/${date}`;
        console.debug("load gospel -> " + baseUrl);

        try {
            const response = await fetch(baseUrl);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Store in localStorage using a single key instead of date-based keys
            try {
                localStorage.setItem('current_gospel', JSON.stringify({
                    date: date,
                    data: responseData
                }));
            } catch (storageError) {
                console.warn("Failed to store gospel in localStorage:", storageError);
                // Continue even if storage fails
            }

            context.commit('setTodayGospelWay', responseData.today);
            context.commit('setConnectedGospelWay', responseData.connected);
            context.commit('setConnectedVideos', responseData.videos);
            return responseData;
        } catch (error) {
            console.error("Errore nella richiesta:", error);

            // Try to load from cache if available
            try {
                const cachedData = localStorage.getItem('current_gospel');
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    // Only use cached data if it's for the requested date
                    if (parsed.date === date) {
                        const parsedData = parsed.data;
                        context.commit('setTodayGospelWay', parsedData.today);
                        context.commit('setConnectedGospelWay', parsedData.connected);
                        context.commit('setConnectedVideos', parsedData.videos);
                        return parsedData;
                    }
                }
            } catch (cacheError) {
                console.warn("Error reading from cache:", cacheError);
            }

            throw error;
        }
    },

    async loadAllowedDates(context) {
        const baseUrl = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/dates`;
        console.debug("load allowed dates -> " + baseUrl);

        try {
            const response = await fetch(baseUrl);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Store in localStorage for offline access - this is fine as single key
            try {
                localStorage.setItem('allowed_dates', JSON.stringify(responseData));
            } catch (storageError) {
                console.warn("Failed to store allowed dates in localStorage:", storageError);
                // Continue even if storage fails
            }

            context.commit('setAllowedDates', responseData);
            return responseData;
        } catch (error) {
            console.error("Errore nella richiesta:", error);

            // Try to load from cache if available
            try {
                const cachedData = localStorage.getItem('allowed_dates');
                if (cachedData) {
                    context.commit('setAllowedDates', JSON.parse(cachedData));
                    return JSON.parse(cachedData);
                }
            } catch (cacheError) {
                console.warn("Error reading from cache:", cacheError);
            }

            throw error;
        }
    },

    // Your existing changeDay method can remain unchanged
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
}