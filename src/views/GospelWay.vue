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
    <div v-if="isLoading">
      <base-spinner></base-spinner>
    </div>
    <section v-else >
      <header>
        <h1 class="color3 mt-5 text-center"> Vangelo del Giorno</h1>
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
      />

      <gw-embed-video
          title="Video"
          :related="videos"
          :show-divider="true"
      />

      <gw-connected-text
          v-show="connected"
          :relatedData="connected"
      />

    </section>
  </base-card>
</template>

<script setup>
import GwGospelText from '@/components/GwGospelText.vue'
import GwEmbedVideo from "@/components/GwEmbedVideo";
import { ref, defineProps, onMounted, computed} from 'vue'
import { useStore } from 'vuex'
import GwConnectedText from "@/components/GwConnectedText";

const props = defineProps({
  date: String
})

onMounted(() => {
  loadPage(props.date)
})

const store = useStore()

const dialog = ref(false)
const isLoading = ref(false)

const textDate = computed(() => store.getters['page/textDate']);
const currentGospelWay = computed(() => store.getters['page/todayGospelWay']);
const connected = computed(() => store.getters['page/connectedGospelWay']);
const videos = computed(() => store.getters['page/connectedVideos']);
console.log(currentGospelWay)

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
  dialog.value = false
}

</script>

<style scoped>
.bg-1 {
  background-color: #A67D51 !important;
  color: white;
}

.subtitle{
  font-size: 1rem;
  color: #A67D51;
}

.dialog-text {
  font-size: 1.3rem;
  line-height: 2.2;
  color: #866a2f;
}

</style>
