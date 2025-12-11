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

/* ============================================
   CSS CUSTOM PROPERTIES (Design System)
   ============================================ */
:root {
  /* Color Palette */
  --color-darkest: #281D02;
  --color-dark: #472b21;
  --color-primary: #6e4f3a;
  --color-accent: #A67D51;
  --color-light: #d3b282;
  --color-muted: #908286;

  /* Semantic Colors */
  --color-text: var(--color-light);
  --color-text-muted: var(--color-muted);
  --color-background: var(--color-primary);
  --color-surface: rgba(255, 246, 217, 0.95);
  --color-border: var(--color-accent);

  /* Safe Areas for iPhone notch/Dynamic Island */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Touch Targets (minimum 48px for accessibility) */
  --touch-target-min: 48px;
  --touch-target-sm: 44px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 50%;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(40, 29, 2, 0.15);
  --shadow-md: 0 4px 12px rgba(40, 29, 2, 0.25);
  --shadow-lg: 0 8px 24px rgba(40, 29, 2, 0.3);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-Index Scale */
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
}

/* Legacy color classes (for backward compatibility) */
.color1 {
  color: var(--color-darkest);
}

.color2 {
  color: var(--color-dark);
}

.color3 {
  color: var(--color-primary);
}

.color4 {
  color: var(--color-accent);
}

.color5 {
  color: var(--color-light);
}

.color6 {
  color: var(--color-muted);
}

body {
  background-color: var(--color-primary) !important;
  /* Safe area padding for notched devices */
  padding-top: var(--safe-top);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
}

#app {
  font-family: 'Barlow Semi Condensed', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--color-text);
  overflow-x: hidden;
  /* Ensure minimum height accounts for safe areas */
  min-height: calc(100vh - var(--safe-top) - var(--safe-bottom));
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