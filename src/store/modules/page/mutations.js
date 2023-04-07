export default {
    setTodayGospelWay(state, payload) {
        state.todayGospelWay = payload
    },
    setConnectedGospelWay(state, payload) {
        state.connectedGospelWay = payload
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
