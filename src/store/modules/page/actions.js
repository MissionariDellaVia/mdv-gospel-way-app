// noinspection JSUnresolvedVariable

export default {
    async loadHomeInfo(context) {
        const date = context.getters.currentDate;
        const url = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/info/${date}`;
        console.debug("load home info -> " + url);

        const response = await fetch(url);
        const responseData = await response.json();

        if (!response.ok) {
            console.error("Errore nella richiesta");
            throw new Error(responseData.message || 'Failed to fetch!');
        }

        context.commit('setHomeInfo', { saint: responseData.saints, liturgy: responseData.liturgy});
    },
    async loadGospelWay(context, date) {
        console.debug("load gospel -> " + `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/gospel/${date}`);
        const response = await fetch(
            `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/gospel/${date}`
        );
        const responseData = await response.json();
        if (!response.ok) {
            console.error("Errore nella richiesta");
            throw new Error(responseData.message || 'Failed to fetch!');
        }
        context.commit('setTodayGospelWay', responseData.today);
        context.commit('setConnectedGospelWay', responseData.connected);
        context.commit('setConnectedVideos', responseData.videos);
    },
    async loadAllowedDates(context) {
        const url = `${process.env.VUE_APP_MDV_BASE_URL}/api/v1/dates`;
        console.debug("load allowed dates -> " + url);

        const response = await fetch(url);
        const responseData = await response.json();

        if (!response.ok) {
            console.error("Errore nella richiesta");
            throw new Error(responseData.message || 'Failed to fetch!');
        }

        context.commit('setAllowedDates', responseData);
    },
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
