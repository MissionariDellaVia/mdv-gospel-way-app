export default {
    setTodayGospelWay(state, payload) {
        state.todayGospelWay = payload
    },
    setConnectedGospelWay(state, payload) {
        state.connectedGospelWay = payload
    },
    setConnectedVideos(state, payload) {
        state.connectedVideos = payload
    },
    setHomeInfo(state, payload) {
        state.saint = payload.saint
        state.liturgy = payload.liturgy
    },
    setAllowedDates(state, payload) {
        state.allowedDates = payload
    },
    addDay(state) {
        state.currentDate = new Date(
            state.currentDate.setDate(state.currentDate.getDate() + 1)
        );
    },
    subtractDay(state) {
        state.currentDate = new Date(
            state.currentDate.setDate(state.currentDate.getDate() - 1)
        );
    },
    changeDate(state, fullDate) {
        state.currentDate = fullDate
    }
}
