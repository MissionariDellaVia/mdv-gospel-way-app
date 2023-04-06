import { createStore } from 'vuex';

import pageModule from '@/store/modules/page';

export default createStore({
    modules: {
        page: pageModule
    }
});
