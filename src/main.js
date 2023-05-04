import { createApp } from 'vue';
import { utilityFunction } from '@/utility/utility.js';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store/index.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import Vue3TouchEvents from "vue3-touch-events";
import { createMetaManager, plugin as metaPlugin } from 'vue-meta'


import '@vuepic/vue-datepicker/dist/main.css'
import 'vue3-carousel/dist/carousel.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap';

// Base component
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseDialog from '@/components/ui/BaseDialog.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const app = createApp(App)
app.use(router);
app.use(store);
app.use(Vue3TouchEvents);
app.use(createMetaManager());
app.use(metaPlugin, {
    keyName: 'metaInfo',
    attribute: 'data-vue-meta',
    ssrAttribute: 'data-vue-meta-server-rendered',
    tagIDKeyName: 'vmid',
    refreshOnceOnNavigation: true
}); // optional, only needed for OptionsAPI (see below)


app.config.globalProperties.$util = utilityFunction;

app.component('base-card', BaseCard);
app.component('base-button', BaseButton);
app.component('base-dialog', BaseDialog);
app.component('base-spinner', BaseSpinner);
app.component('vue-date-picker', VueDatePicker);

app.mount('#app');
