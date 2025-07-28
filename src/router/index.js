import {createRouter, createWebHashHistory} from 'vue-router'

import MdvHome from '@/views/MdvHome.vue';
import AboutUs from '@/views/AboutUs.vue';
import GospelWay from '@/views/GospelWay.vue';
import TestTextHighlighter from '@/views/TestTextHighlighter.vue';

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
    {
        path: '/via-del-vangelo/:date',
        name: 'GospelWay',
        props: true,
        component: GospelWay
    },
    {
        path: '/test-texthighlighter',
        name: 'TestTextHighlighter',
        component: TestTextHighlighter
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
