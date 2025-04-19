<template>
  <base-card class="bg-layout">
    <base-dialog
        :show="!!dialog"
        title="PREGHIERA ALLO SPIRITO SANTO"
        subtitle="(da recitare prima di iniziare la lettura)"
        @close="cleanDialogPreghiera">
      <p class="dialog-text text-center">
        Vieni Spirito Santo,<br>
        guidaci nella comprensione della Parola,<br>
        illumina le profondità della nostra anima<br>
        e converti i nostri cuori,<br>
        perché liberi dalle seduzioni del male,<br>
        possiamo amare Dio e i nostri fratelli e sorelle<br>
        fino a dare la vita per loro.<br>
        Amen
      </p>
    </base-dialog>

    <!-- Zoom toggle button - consistently on right side -->
    <div class="zoom-toggle" @click="toggleZoomControls" :class="{ 'expanded': showZoomControls }">
      <i class="fa-solid fa-text-height"></i>
    </div>

    <!-- Scroll to top button positioned below zoom toggle -->
    <ScrollToTopButton class="custom-scroll-top" />

    <transition name="fade">
      <div v-if="showZoomControls" class="zoom-controls" aria-label="Controllo dimensione testo">
        <button
            @click="decreaseZoom"
            class="zoom-button"
            aria-label="Riduci dimensione testo"
            :disabled="zoomLevel <= 80">
          <i class="fa-solid fa-minus"></i>
        </button>
        <span class="zoom-level">{{ zoomLevel }}%</span>
        <button
            @click="increaseZoom"
            class="zoom-button"
            aria-label="Aumenta dimensione testo"
            :disabled="zoomLevel >= 200">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </transition>

    <div v-if="isLoading">
      <base-spinner></base-spinner>
    </div>
    <section v-else>
      <header>
        <h1 class="color3 mt-5 text-center"> Vangelo del Giorno</h1>
        <h4 class="my-2 color3 text-center "> {{ liturgy }}</h4>
        <span class="subtitle mt-5 text-center "> {{ textDate }}</span>
        <div class="row mt-5 mb-3">
          <div class="col-12">
            <base-button title="Preghiera allo Spirito Santo" @click="showDialogPreghiera" class="bg-1"></base-button>
          </div>
        </div>
        <h4 class="color3 mt-5 text-center"> {{ currentGospelWay.sacred_texts }}</h4>
      </header>

      <hr class="fade-hr my-5 mx-auto">

      <gw-gospel-text
          :evangelist="currentGospelWay.evangelist"
          :gospel="currentGospelWay.text"
          :comment="currentGospelWay.comment"
          :extra="currentGospelWay.video ? null : currentGospelWay.extra"
          :clean="true"
          :show-divider="true"
          :zoom-level="zoomLevel"
      />

      <gw-embed-video
          v-show="videos"
          title="Video"
          :related="videos"
          :show-divider="true"
      />

      <gw-connected-text
          v-show="connected"
          :relatedData="connected"
          :zoom-level="zoomLevel"
      />
    </section>
  </base-card>
</template>

<script setup>
import GwGospelText from '@/components/GwGospelText.vue'
import GwEmbedVideo from "@/components/GwEmbedVideo";
import { ref, defineProps, onMounted, onUnmounted, computed, watchEffect } from 'vue'
import { useStore } from 'vuex'
import GwConnectedText from "@/components/GwConnectedText";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton.vue";

// Add state for controlling zoom controls visibility
const showZoomControls = ref(false);
// Add auto-hide timer
let hideTimeout = null;

const props = defineProps({
  date: String
})

const store = useStore()
const dialog = ref(false)
const isLoading = ref(false)
// Initialize zoom level with stored preference or default to 100%
const zoomLevel = ref(
    parseInt(localStorage.getItem('preferredZoomLevel')) || 100
)

const textDate = computed(() => store.getters['page/textDate']);
const liturgy = computed(() => store.getters['page/liturgy']);
const currentGospelWay = computed(() => store.getters['page/todayGospelWay']);
const connected = computed(() => store.getters['page/connectedGospelWay']);
const videos = computed(() => store.getters['page/connectedVideos']);

// Toggle zoom controls visibility
function toggleZoomControls() {
  showZoomControls.value = !showZoomControls.value;

  // Clear any existing timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  // Set auto-hide timer when shown
  if (showZoomControls.value) {
    hideTimeout = setTimeout(() => {
      showZoomControls.value = false;
    }, 5000); // Hide after 5 seconds of inactivity
  }
}

// Reset auto-hide timer on zoom interactions
function resetHideTimer() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  if (showZoomControls.value) {
    hideTimeout = setTimeout(() => {
      showZoomControls.value = false;
    }, 5000);
  }
}

// Save zoom preference when it changes
watchEffect(() => {
  try {
    localStorage.setItem('preferredZoomLevel', zoomLevel.value.toString());
  } catch (error) {
    console.warn('Could not save zoom preference:', error);
  }
});

// Methods for zoom functionality
function increaseZoom() {
  if (zoomLevel.value < 200) {
    zoomLevel.value += 10;
    resetHideTimer();
  }
}

function decreaseZoom() {
  if (zoomLevel.value > 80) {
    zoomLevel.value -= 10;
    resetHideTimer();
  }
}

// Add keyboard shortcuts for zoom
function handleKeyboard(event) {
  // Ctrl + Plus to zoom in
  if (event.ctrlKey && (event.key === '+' || event.key === '=')) {
    event.preventDefault();
    increaseZoom();
    showZoomControls.value = true;
    resetHideTimer();
  }
  // Ctrl + Minus to zoom out
  if (event.ctrlKey && event.key === '-') {
    event.preventDefault();
    decreaseZoom();
    showZoomControls.value = true;
    resetHideTimer();
  }
}

onMounted(() => {
  loadPage(props.date);
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyboard);
});

// Clean up event listener and timeout
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard);
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
});

async function loadPage(date) {
  isLoading.value = true;
  try {
    await store.dispatch('page/loadGospelWay', date);
  } catch (error) {
    console.error(error)
  }
  isLoading.value = false;
}

function showDialogPreghiera() {
  dialog.value = true;
}

function cleanDialogPreghiera() {
  dialog.value = false;
}
</script>

<style scoped>
.bg-1 {
  background-color: #A67D51 !important;
  color: white;
}

.subtitle{
  font-size: 1.1rem;
  color: #A67D51;
}

.dialog-text {
  font-size: 1.3rem;
  line-height: 2.2;
  color: #866a2f;
}

/* Zoom toggle button */
.zoom-toggle {
  position: fixed;
  bottom: 24px;
  right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #6e4f3a;
  color: #d3b282;
  border: 2px solid #d3b282;
  box-shadow: 0 4px 12px rgba(40, 29, 2, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  transition: all 0.3s ease;
}

/* Override the scroll-to-top button position */
:deep(.custom-scroll-top) {
  bottom: 70px !important;
  right: 15px !important;
}

.zoom-toggle:hover {
  background-color: #7d5c45;
  transform: translateY(-2px);
}

.zoom-toggle.expanded {
  background-color: #58412b;
  transform: rotate(180deg);
}

/* Zoom controls styling */
.zoom-controls {
  position: fixed;
  bottom: 24px;
  right: 65px;
  display: flex;
  align-items: center;
  background-color: #6e4f3a;
  border: 2px solid #d3b282;
  border-radius: 20px;
  padding: 8px 12px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(40, 29, 2, 0.25);
}

.zoom-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #d3b282;
  background-color: #6e4f3a;
  color: #d3b282;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-button:hover {
  background-color: #7d5c45;
  transform: translateY(-2px);
}

.zoom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.zoom-level {
  margin: 0 10px;
  color: #d3b282;
  font-size: 14px;
  min-width: 40px;
  text-align: center;
}

/* Animation for showing/hiding controls */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>