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

    <!-- Saved highlights button (top right) - shows only when there are highlights -->
    <HighlightSavedButton
        v-if="!isLoading"
        :count="highlightCount"
        @click="showSavedHighlights"
    />

    <!-- Highlight FAB (above zoom) - simple toggle only -->
    <HighlightToggleButton
        v-if="!isLoading"
        @toggle="onHighlightToggle"
    />

    <!-- Saved Highlights Modal -->
    <HighlightCollection
        v-if="showCollection"
        :highlights="allHighlights"
        :formatted-date="formattedDate"
        @close="showCollection = false"
        @remove="onRemoveHighlight"
        @export="onExportHighlights"
    />

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

    <!-- Skeleton loader durante il caricamento -->
    <skeleton-loader v-if="isLoading" variant="gospel" />

    <!-- Contenuto con transizione fade -->
    <transition name="content-fade">
    <section v-if="!isLoading">
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
          ref="gospelTextRef"
          :evangelist="currentGospelWay.gospel?.evangelist"
          :textRef="currentGospelWay.gospel?.reference"
          :gospel="currentGospelWay.gospel?.text"
          :comment="currentGospelWay.comments?.main"
          :textDate="textDate"
          :extra="currentGospelWay.comments?.reflection"
          :clean="true"
          :show-divider="true"
          :zoom-level="zoomLevel"
          :highlight-mode="highlightMode"
          @highlight-count-change="onHighlightCountChange"
          @highlights-change="onHighlightsChange"
      />

      <gw-embed-video
          v-if="videos && videos.length > 0"
          title="Video"
          :related="videos"
          :show-divider="true"
      />

      <gw-connected-text
          v-if="connected && connected.length > 0"
          :relatedData="connected"
          :zoom-level="zoomLevel"
      />
    </section>
    </transition>
  </base-card>
</template>

<script setup>
import GwGospelText from '@/components/GwGospelText.vue'
import GwEmbedVideo from "@/components/GwEmbedVideo";
import { ref, defineProps, onMounted, onUnmounted, computed, watchEffect } from 'vue'
import { useStore } from 'vuex'
import GwConnectedText from "@/components/GwConnectedText";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton.vue";
import HighlightToggleButton from "@/components/ui/HighlightToggleButton.vue";
import HighlightSavedButton from "@/components/ui/HighlightSavedButton.vue";
import HighlightCollection from "@/components/text/HighlightCollection.vue";

// Add state for controlling zoom controls visibility
const showZoomControls = ref(false);
// Add auto-hide timer
let hideTimeout = null;

// Highlight state
const highlightMode = ref(false);
const highlightCount = ref(0);
const allHighlights = ref([]);
const showCollection = ref(false);
const gospelTextRef = ref(null);

// Formatted date for collection display
const formattedDate = computed(() => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date().toLocaleDateString('it-IT', options);
});

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

// Highlight handlers
function onHighlightToggle(active) {
  highlightMode.value = active;
}

function onHighlightCountChange(count) {
  highlightCount.value = count;
}

function onHighlightsChange(highlights) {
  allHighlights.value = highlights;
}

function showSavedHighlights() {
  // Refresh the highlights list before showing
  if (gospelTextRef.value) {
    allHighlights.value = gospelTextRef.value.getAllHighlights();
  }
  showCollection.value = true;
}

function onRemoveHighlight(index) {
  // Find the highlight by index in the aggregated list
  const highlight = allHighlights.value[index];
  if (highlight && gospelTextRef.value) {
    gospelTextRef.value.removeHighlight(highlight.section, highlight.sectionIndex);
    // Refresh the highlights list
    allHighlights.value = gospelTextRef.value.getAllHighlights();
  }
}

function onExportHighlights() {
  if (gospelTextRef.value) {
    gospelTextRef.value.showExportOptions();
  }
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

/* Zoom toggle button - bottom of the stack with safe-area */
.zoom-toggle {
  position: fixed;
  bottom: calc(20px + var(--safe-bottom, 0px));
  right: max(15px, var(--safe-right, 0px));
  /* 48px touch target */
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: var(--color-light);
  border: 2px solid var(--color-light);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  transition: all var(--transition-normal);
}

.zoom-toggle:hover {
  background-color: var(--color-dark);
  transform: translateY(-2px);
}

.zoom-toggle.expanded {
  background-color: var(--color-dark);
  transform: rotate(180deg);
}

/* Zoom controls styling */
.zoom-controls {
  position: fixed;
  bottom: calc(20px + var(--safe-bottom, 0px));
  right: calc(70px + var(--safe-right, 0px));
  display: flex;
  align-items: center;
  background-color: var(--color-primary);
  border: 2px solid var(--color-light);
  border-radius: var(--radius-xl);
  padding: var(--spacing-sm) var(--spacing-md);
  z-index: 100;
  box-shadow: var(--shadow-md);
}

.zoom-button {
  /* 48px touch target */
  width: var(--touch-target-min, 48px);
  height: var(--touch-target-min, 48px);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-light);
  background-color: var(--color-primary);
  color: var(--color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.zoom-button:hover {
  background-color: var(--color-dark);
  transform: translateY(-2px);
}

.zoom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.zoom-level {
  margin: 0 var(--spacing-sm);
  color: var(--color-light);
  font-size: 14px;
  min-width: 45px;
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

/* Content fade transition */
.content-fade-enter-active {
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.content-fade-leave-active {
  transition: opacity 0.2s ease-in;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.content-fade-leave-to {
  opacity: 0;
}

/* Mobile - maintain 48px touch targets */
@media (max-width: 480px) {
  .zoom-toggle {
    bottom: calc(18px + var(--safe-bottom, 0px));
    right: max(12px, var(--safe-right, 0px));
    width: var(--touch-target-min, 48px);
    height: var(--touch-target-min, 48px);
  }

  .zoom-controls {
    bottom: calc(18px + var(--safe-bottom, 0px));
    right: calc(65px + var(--safe-right, 0px));
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .zoom-button {
    width: 44px;
    height: 44px;
  }

  .zoom-level {
    font-size: 13px;
    min-width: 38px;
    margin: 0 var(--spacing-xs);
  }
}
</style>