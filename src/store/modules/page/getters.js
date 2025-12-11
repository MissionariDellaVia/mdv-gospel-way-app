export default {
    todayGospelWay(state) {
        return state.todayGospelWay;
    },
    connectedGospelWay(state) {
        return state.connectedGospelWay;
    },
    connectedVideos(state) {
        return state.connectedVideos;
    },
    saint(state) {
        return state.saint;
    },
    liturgy(state) {
        // V2: liturgical_season è disponibile anche nel gospel_daily
        return state.liturgy || state.todayGospelWay?.liturgical_season;
    },
    allowedDates(state) {
        return state.allowedDates;
    },
    currentDate(state) {
        return state.currentDate.toISOString().split('T')[0];
    },
    textDate(state) {
        return state.days[state.currentDate.getDay()]
            + ' ' + state.currentDate.getDate()
            + ' ' + state.months[state.currentDate.getMonth()]
            + ' ' + state.currentDate.getFullYear();
    }
}
