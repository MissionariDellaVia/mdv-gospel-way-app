// noinspection JSUnresolvedVariable

// Add this at the top of your file
function getProxiedUrl(url) {
    // Only add proxy in production mode and for HTTP URLs
    if (process.env.NODE_ENV === 'production' && url.startsWith('http:')) {
        // Use a reliable CORS proxy (several options available)
        return `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    }
    return url;
}

export default {
    async loadHomeInfo(context) {
        const date = context.getters.currentDate;
        const baseUrl = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/info/${date}`;
        const url = getProxiedUrl(baseUrl);
        console.debug("load home info -> " + url);

        try {
            const response = await fetch(url);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Store in localStorage for offline access
            localStorage.setItem(`home_info_${date}`, JSON.stringify(responseData));

            context.commit('setHomeInfo', { saint: responseData.saints, liturgy: responseData.liturgy});
            return responseData;
        } catch (error) {
            console.error("Errore nella richiesta:", error);

            // Try to load from cache if available
            const cachedData = localStorage.getItem(`home_info_${date}`);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                context.commit('setHomeInfo', {
                    saint: parsedData.saints,
                    liturgy: parsedData.liturgy
                });
                return parsedData;
            }

            throw error;
        }
    },

    async loadGospelWay(context, date) {
        const baseUrl = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/gospel/${date}`;
        const url = getProxiedUrl(baseUrl);
        console.debug("load gospel -> " + url);

        try {
            const response = await fetch(url);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Store in localStorage for offline access
            localStorage.setItem(`gospel_${date}`, JSON.stringify(responseData));

            context.commit('setTodayGospelWay', responseData.today);
            context.commit('setConnectedGospelWay', responseData.connected);
            context.commit('setConnectedVideos', responseData.videos);
            return responseData;
        } catch (error) {
            console.error("Errore nella richiesta:", error);

            // Try to load from cache if available
            const cachedData = localStorage.getItem(`gospel_${date}`);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                context.commit('setTodayGospelWay', parsedData.today);
                context.commit('setConnectedGospelWay', parsedData.connected);
                context.commit('setConnectedVideos', parsedData.videos);
                return parsedData;
            }

            throw error;
        }
    },

    async loadAllowedDates(context) {
        const baseUrl = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/dates`;
        const url = getProxiedUrl(baseUrl);
        console.debug("load allowed dates -> " + url);

        try {
            const response = await fetch(url);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Store in localStorage for offline access
            localStorage.setItem('allowed_dates', JSON.stringify(responseData));

            context.commit('setAllowedDates', responseData);
            return responseData;
        } catch (error) {
            console.error("Errore nella richiesta:", error);

            // Try to load from cache if available
            const cachedData = localStorage.getItem('allowed_dates');
            if (cachedData) {
                context.commit('setAllowedDates', JSON.parse(cachedData));
                return JSON.parse(cachedData);
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