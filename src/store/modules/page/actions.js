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
    },
    async changeDay(context, payload) {
        if (payload.add) {
            context.commit('addDay');
        }
        else if (payload.subtract) {
            context.commit('subtractDay');
        }
        else if (payload.fullDate) {
            context.commit('changeDate', payload.fullDate);
        }
    }
}
