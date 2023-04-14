import { createApp } from 'vue';
import { utilityFunction } from '@/utility/utility.js';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store/index.js';
import VueDatePicker from '@vuepic/vue-datepicker';
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
app.config.globalProperties.$util = utilityFunction;

app.component('base-card', BaseCard);
app.component('base-button', BaseButton);
app.component('base-dialog', BaseDialog);
app.component('base-spinner', BaseSpinner);
app.component('vue-date-picker', VueDatePicker);

app.mount('#app');
