export default {
    todayGospelWay(state) {
        return state.todayGospelWay;
    },
    connectedGospelWay(state) {
        return state.connectedGospelWay;
    },
    saint(state) {
        return state.saint;
    },
    liturgy(state) {
        return state.liturgy;
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
