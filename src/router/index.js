import {createRouter, createWebHashHistory} from 'vue-router'

// Lazy loading for better initial bundle size
// Home is loaded eagerly as it's the landing page
import MdvHome from '@/views/MdvHome.vue';

const routes = [
    {
        path: '/',
        name: 'MdvHome',
        component: MdvHome
    },
    {
        path: '/chi-siamo',
        name: 'AboutUs',
        // Lazy loaded - reduces initial bundle
        component: () => import(/* webpackChunkName: "about" */ '@/views/AboutUs.vue')
    },
    {
        path: '/via-del-vangelo/:date',
        name: 'GospelWay',
        props: true,
        // Lazy loaded - main content page
        component: () => import(/* webpackChunkName: "gospel" */ '@/views/GospelWay.vue')
    },
    {path: '/:notFound(.*)', component: MdvHome}
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior() {
        return {top: 0}
    },
});

export default router
