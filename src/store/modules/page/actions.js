// noinspection JSUnresolvedVariable

export default {
    async loadHomeInfo(context) {
        const date = context.getters.currentDate;
        const url = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/info/${date}`;
        console.debug("load home info -> " + url);

        try {
            // Try to fetch from network
            const response = await fetch(url);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Cache the successful response
            localStorage.setItem(`home_info_${date}`, JSON.stringify(responseData));

            context.commit('setHomeInfo', {
                saint: responseData.saints,
                liturgy: responseData.liturgy
            });

            return responseData;
        } catch (error) {
            console.error("Network error fetching home info:", error);

            // Try to load from cache if network fails
            const cachedData = localStorage.getItem(`home_info_${date}`);
            if (cachedData) {
                console.log("Loading home info from cache");
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
        const url = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/gospel/${date}`;
        console.debug("load gospel -> " + url);

        try {
            // Try to fetch from network
            const response = await fetch(url);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Cache the successful response
            localStorage.setItem(`gospel_${date}`, JSON.stringify(responseData));

            context.commit('setTodayGospelWay', responseData.today);
            context.commit('setConnectedGospelWay', responseData.connected);
            context.commit('setConnectedVideos', responseData.videos);

            return responseData;
        } catch (error) {
            console.error("Network error fetching gospel:", error);

            // Try to load from cache if network fails
            const cachedData = localStorage.getItem(`gospel_${date}`);
            if (cachedData) {
                console.log("Loading gospel from cache");
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
        const url = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/dates`;
        console.debug("load allowed dates -> " + url);

        try {
            // Try to fetch from network
            const response = await fetch(url);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("Errore nella richiesta");
                throw new Error(responseData.message || 'Failed to fetch!');
            }

            // Cache the successful response
            localStorage.setItem('allowed_dates', JSON.stringify(responseData));

            context.commit('setAllowedDates', responseData);

            return responseData;
        } catch (error) {
            console.error("Network error fetching allowed dates:", error);

            // Try to load from cache if network fails
            const cachedData = localStorage.getItem('allowed_dates');
            if (cachedData) {
                console.log("Loading allowed dates from cache");
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