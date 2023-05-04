import mutations from './mutations.js';
import actions from './actions.js';
import getters from './getters.js';

export default {
    namespaced: true,
    state() {
        return {
            todayGospelWay: {},
            connectedGospelWay: [],
            connectedVideos: [],
            saint: null,
            liturgy: null,
            allowedDates: [],
            currentDate: new Date(),
            days: ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
            months: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
        };
    },
    mutations,
    actions,
    getters
};
