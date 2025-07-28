import { createApp } from 'vue';
import { utilityFunction } from '@/utility/utility.js';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store/index.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import Vue3TouchEvents from "vue3-touch-events";
import { createMetaManager, plugin as metaPlugin } from 'vue-meta'
import LegacyCleanupService from '@/services/LegacyCleanupService';

// Import CSS dependencies
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@vuepic/vue-datepicker/dist/main.css'
import 'vue3-carousel/dist/carousel.css';
import "bootstrap/dist/css/bootstrap.min.css";
import './assets/styles/mobile-selection.css';
import 'bootstrap';

// Import base components
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseDialog from '@/components/ui/BaseDialog.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton.vue'

// Import service worker
import './registerServiceWorker'

/**
 * Register global components
 * @param {Vue app instance} app 
 */
function registerGlobalComponents(app) {
    app.component('base-card', BaseCard);
    app.component('base-button', BaseButton);
    app.component('base-dialog', BaseDialog);
    app.component('base-spinner', BaseSpinner);
    app.component('vue-date-picker', VueDatePicker);
    app.component('ScrollToTopButton', ScrollToTopButton);
}

/**
 * Configure Vue plugins
 * @param {Vue app instance} app 
 */
function configurePlugins(app) {
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
    });
}

/**
 * Initialize the Vue application
 */
function initializeApp() {
    const app = createApp(App);
    
    // Configure plugins
    configurePlugins(app);
    
    // Register global components
    registerGlobalComponents(app);
    
    // Setup global properties
    app.config.globalProperties.$util = utilityFunction;
    
    return app;
}

// Execute legacy storage cleanup
LegacyCleanupService.executeCleanup();

// Initialize and mount the app
const app = initializeApp();
app.mount('#app');
