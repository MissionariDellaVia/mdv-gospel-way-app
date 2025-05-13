<template>
  <PullToRefresh @refresh="onPullRefresh">

    <metainfo>
      <template v-slot:title="{ content }">{{ content }}</template>
    </metainfo>
    <HintManager/>
    <NetworkStatus/>
    <div class="row">
      <div class="col my-3 mx-auto">
        <img src="./assets/logo-mdv.png" class="logo-img clickable" alt="logo-img" @click="pushRoute('/')"/>
      </div>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="paper-reveal" mode="out-in">
        <component :is="Component"/>
      </transition>
    </router-view>

    <!-- PWA Install Banners -->
    <InstallBanner/>
    <IOSInstallGuide/>

    <!-- App update notification -->
    <UpdateNotification/>
  </PullToRefresh>
</template>

<script setup>
import {useRouter} from 'vue-router'
import {useMeta} from 'vue-meta'
import NetworkStatus from './components/NetworkStatus.vue'
import InstallBanner from './components/InstallBanner.vue'
import IOSInstallGuide from './components/IOSInstallGuide.vue'
import UpdateNotification from './components/UpdateNotification.vue'
import './registerServiceWorker'
import PullToRefresh from "@/components/PullToRefresh.vue";
import HintManager from "@/components/HintManager.vue";

const router = useRouter()

function pushRoute(route) {
  router.push(route)
}

function onPullRefresh() {
  document.dispatchEvent(new CustomEvent('swUpdatedCheck'))
  window.location.reload()
}

useMeta({
  title: 'La Via del Vangelo',
  htmlAttrs: {lang: 'it', amp: true}
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@300&family=Questrial&display=swap');

.color1 {
  color: #281D02FF;
}

.color2 {
  color: #472b21;
}

.color3 {
  color: #6e4f3a;
}

.color4 {
  color: #A67D51;
}

.color5 {
  color: #d3b282;
}

.color6 {
  color: #908286;
}

body {
  background-color: #6E4F3A !important;
}

#app {
  font-family: 'Barlow Semi Condensed', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #d3b282;
  overflow-x: hidden;
}

.logo-img {
  width: 10rem;
  padding-top: 1rem;
}

.max-height {
  max-height: 60vh !important;
  overflow-y: scroll;
  scrollbar-width: none;
}

hr {
  border: 0;
  max-width: 70%;
  background-position: 50%;
  box-sizing: border-box;
}

.fade-hr {
  height: 0.15rem;
  color: #281D02FF;
  background-image: linear-gradient(90deg, rgba(255, 0, 0, 0), #a67d51 50%, rgba(255, 0, 0, 0) 100%);
}

.clickable {
  cursor: pointer;
  transition: all .1s;
  -webkit-tap-highlight-color: transparent; /* Removes the default tap highlight on iOS */
  user-select: none; /* Prevents text selection during taps */
  touch-action: manipulation; /* Improves touch behavior */
}

.clickable:hover {
  filter: brightness(130%);
  transform: scale(0.98);
}

.clickable:focus {
  filter: brightness(150%);
  transform: scale(0.93);
}

.paper-reveal-enter-active,
.paper-reveal-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.paper-reveal-enter-from {
  opacity: 0;
  transform: translateY(10px);
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

.paper-reveal-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* PWA update notification styles */
.update-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #A67D51;
  color: #281D02FF;
  text-align: center;
  padding: 12px;
  font-size: 14px;
  z-index: 9999;
  font-weight: bold;
}

.update-button {
  background-color: #281D02FF;
  color: #d3b282;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.update-button:hover {
  background-color: #472b21;
}

/* Only apply focus styles when not using touch */
@media (hover: hover) {
  .clickable:focus {
    filter: brightness(150%);
    transform: scale(0.93);
  }
}

/* For touch devices, use active state instead of focus */
@media (hover: none) {
  .clickable:active {
    filter: brightness(100%);
    transform: scale(1);
    outline: none;
  }
}
</style>