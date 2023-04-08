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
    <base-dialog
        :show="!!dialogConnected.show"
        :title="dialogConnected.title"
        @close="cleanDialogConnected">
      <div class="html-raw my-1" v-html="dialogConnected.content"></div>
      <div class="html-raw my-1" v-html="currentGospelWay.extra"></div>
    </base-dialog>

    <div v-if="isLoading">
      <base-spinner></base-spinner>
    </div>
    <section v-else class="html-raw">
      <h1 class="color3 mt-5 text-center"> Vangelo del Giorno</h1>
      <section class="row mt-5 mb-3">
        <div class="col-12">
          <base-button title="Preghiera allo Spirito Santo" @click="showDialogPreghiera" class="bg-1"></base-button>
        </div>
      </section>
      <hr class="fade-hr my-5 mx-auto">
      <section class="row mb-3">
        <div class="col-12 header-section text-center">
          <h4 class="evangelist-title"> Dal vangelo secondo <strong>{{ currentGospelWay.evangelist }}</strong></h4>
          <div class="my-1" v-html="currentGospelWay.text"></div>
        </div>
      </section>
      <hr class="fade-hr my-5 mx-auto">
      <section class="row mb-3">
        <div class="col-12 header-section text-center">
          <h4 class="mb-4 color4 fw-bold"> Commento al Vangelo</h4>
          <div class="my-1" v-html="currentGospelWay.comment"></div>
        </div>
      </section>
      <hr class="fade-hr my-5 mx-auto">
      <section class="row mb-3">
        <div class="col-12 header-section text-center">
          <h4 class="mb-4 color4 fw-bold"> Extra </h4>
          <div class="my-1" v-html="currentGospelWay.extra"></div>
        </div>
      </section>
      <hr v-if="connectedGospelComment.length > 0" class="fade-hr my-5 mx-auto">
      <section v-if="connectedGospelComment.length > 0" class="row mb-3">
        <div class="col-12 header-section text-center">
          <h4 class="mb-4 color4 fw-bold"> Commenti al Vangelo passati </h4>
        </div>
        <div v-for="(c,index) in connectedGospelComment" v-bind:key="index" class="col-12 text-center">
          <h5 class="color5 fw-bold clickable"
              @click="showDialogConnected(c.date, c.comment, c.extra)">
            Commenti al Vangelo del {{ c.date }}
          </h5>
        </div>
      </section>
    </section>
  </base-card>
</template>

<script>
export default {
  props: ['date'],
  created() {
    this.loadPage(this.date);
  },
  data() {
    return {
      dialog: false,
      isLoading: false,
      dialogConnected: {
        show: false,
        title: null,
        content: null,
        extra: null
      }
    }
  },
  computed: {
    currentGospelWay() {
      return this.$store.getters['page/todayGospelWay'];
    },
    connectedGospelComment() {
      return this.$store.getters['page/connectedGospelWay'];
    },
  },
  methods: {
    async loadPage(date) {
      this.isLoading = true;
      try {
        await this.$store.dispatch('page/loadGospelWay', date);
      } catch (error) {
        // this.showToast(error.message || 'Errore caricamento pagina!');
      }
      this.isLoading = false;
    },
    showDialogPreghiera() {
      this.dialog = true;
    },
    cleanDialogPreghiera() {
      this.dialog = false
    },
    showDialogConnected(title, content, extra) {
      this.dialogConnected.show = true;
      this.dialogConnected.title = 'Commento del ' + title
      this.dialogConnected.content = content
      this.dialogConnected.extra = extra
    },
    cleanDialogConnected() {
      this.dialogConnected.show = false
      this.dialogConnected.title = null
      this.dialogConnected.content = null
      this.dialogConnected.extra = null
    }
  }

}
</script>

<style scoped>
.bg-1 {
  background-color: #A67D51 !important;
  color: white;
}

.header-section {
  font-family: 'Barlow Semi Condensed', sans-serif;
}

.dialog-text {
  font-size: 1.3rem;
  line-height: 2.2;
  color: #866a2f;
}

.html-raw:deep(p) {
  color: #281D02FF;
  font-size: 1.2rem;
  line-height: 1.3;
}

.html-raw:deep(a) {
  text-decoration: none !important;
  color: #A67D51;
  transition: all .1s;
}

.html-raw:deep(a):hover {
  color: #ecb071;
}

.evangelist-title {
  color: #6e4f3a;
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}
</style>
