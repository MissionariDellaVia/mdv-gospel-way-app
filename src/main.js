import { createApp } from 'vue';
import { utilityFunction } from '@/utility/utility.js';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store/index.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import Vue3TouchEvents from "vue3-touch-events";
import { createMetaManager, plugin as metaPlugin } from 'vue-meta'

import '@fortawesome/fontawesome-free/css/all.min.css';
import '@vuepic/vue-datepicker/dist/main.css'
import 'vue3-carousel/dist/carousel.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap';

// Base component
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseDialog from '@/components/ui/BaseDialog.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton.vue'
import './registerServiceWorker'

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
app.component('ScrollToTopButton', ScrollToTopButton)

// Immediately execute cleanup code here, without relying on store dispatch
console.log("Starting legacy storage cleanup...");
try {
    // Get all localStorage keys
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
    }

    // Log what we found for debugging
    console.log(`Found ${keys.length} items in localStorage`);

    // Remove any old gospel_YYYY-MM-DD keys
    const gospelPattern = /^gospel_\d{4}-\d{2}-\d{2}$/;
    const homePattern = /^home_info_\d{4}-\d{2}-\d{2}$/;
    let removedCount = 0;

    keys.forEach(key => {
        if (gospelPattern.test(key) || homePattern.test(key)) {
            console.log(`Removing legacy key: ${key}`);
            localStorage.removeItem(key);
            removedCount++;
        }
    });

    console.log(`Legacy storage cleanup complete. Removed ${removedCount} items.`);
} catch (error) {
    console.warn("Error during legacy storage cleanup:", error);
}


app.mount('#app');
