import { createRouter, createWebHashHistory } from 'vue-router'

import MdvHome from '@/views/MdvHome.vue';
import AboutUs from '@/views/AboutUs.vue';

const routes = [
  {
    path: '/',
    name: 'MdvHome',
    component: MdvHome
  },
  {
    path: '/chi-siamo',
    name: 'AboutUs',
    component: AboutUs
  },
  { path: '/:notFound(.*)', component: MdvHome }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
});

export default router
