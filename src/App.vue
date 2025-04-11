<template>
  <metainfo>
    <template v-slot:title="{ content }">{{ content }}</template>
  </metainfo>
  <div class="row">
    <div class="col my-3 mx-auto">
      <img src="./assets/logo-mdv.png" class="logo-img clickable" alt="logo-img" @click="pushRoute('/')"/>
    </div>
  </div>
  <router-view v-slot="{ Component }">
    <transition name="scale" mode="out-in">
      <component :is="Component"/>
    </transition>
  </router-view>

  <!-- PWA Install Banners -->
  <InstallBanner />
  <IOSInstallGuide />

  <!-- App update notification -->
  <div v-if="updateAvailable" class="update-notification">
    Nuova versione disponibile!
    <button @click="refreshApp" class="update-button">Aggiorna</button>
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue'
import {useMeta} from 'vue-meta'
import {useRouter} from 'vue-router'
import InstallBanner from './components/InstallBanner.vue'
import IOSInstallGuide from './components/IOSInstallGuide.vue'

const router = useRouter()
const updateAvailable = ref(false)
const registration = ref(null)

function pushRoute(route) {
  router.push(route)
}

// Handle service worker updates
function handleSwUpdate(event) {
  updateAvailable.value = true
  registration.value = event.detail
}

function refreshApp() {
  updateAvailable.value = false
  // Check if there's a waiting service worker
  if (registration.value && registration.value.waiting) {
    // Send message to the waiting service worker
    registration.value.waiting.postMessage({type: 'SKIP_WAITING'})
  }
  // Reload the page for the new version
  window.location.reload()
}

onMounted(() => {
  // Listen for service worker updates
  document.addEventListener('swUpdated', handleSwUpdate)

  // Check if the app is in standalone mode (installed)
  window.addEventListener('load', () => {
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      console.log('App is running in standalone mode')
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('swUpdated', handleSwUpdate)
})

useMeta({
  title: 'La Via del Vangelo',
  htmlAttrs: {
    lang: 'it',
    amp: true
  }
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
}

.clickable:hover {
  filter: brightness(120%);
  transform: scale(0.98);
}

.clickable:focus {
  filter: brightness(150%);
  transform: scale(0.93);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.5s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
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
</style>