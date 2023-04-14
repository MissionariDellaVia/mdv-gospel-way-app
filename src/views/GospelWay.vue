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
      <div class="html-raw my-1" v-html="dialogConnected.extra"></div>
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

      <section class="html-raw" @click.right.prevent @keydown="keydown" @copy.prevent @paste.prevent>
        <div class="row mb-3">
          <div class="col-12 header-section text-center">
            <h4 class="evangelist-title"> Dal vangelo secondo <strong>{{ currentGospelWay.evangelist }}</strong></h4>
            <div class="my-1" v-html="cleanedText"></div>
          </div>
        </div>
        <hr class="fade-hr my-5 mx-auto">
        <div class="row mb-3">
          <div class="col-12 header-section text-center">
            <h4 class="mb-4 color4 fw-bold"> Commento al Vangelo</h4>
            <div class="my-1" v-html="cleanedComment"></div>
          </div>

          <section v-show="connectedGospelComment.length > 0">
            <div class="col-12 header-section text-center">
              <h5 class="my-4 color4 fw-bold"> commenti meno recenti </h5>
            </div>
            <div v-for="(c,index) in connectedGospelComment" v-bind:key="index" class="col-12 text-center">
              <small class="color5 fw-bold clickable"
                     @click="showDialogConnected('Commento del ' + c.date, c.comment, null)">
                Commento del {{ c.date }}
              </small>
            </div>
          </section>

        </div>
        <hr v-show="cleanedExtra" class="fade-hr my-5 mx-auto">
        <div v-show="cleanedExtra" class="row mb-3">
          <div class="col-12 header-section text-center">
            <h4 class="mb-4 color4 fw-bold"> Extra </h4>
            <div class="my-1" v-html="cleanedExtra"></div>
          </div>

          <section v-show="connectedGospelComment.length > 0">
            <div class="col-12 header-section text-center">
              <h5 class="my-4 color4 fw-bold"> extra meno recenti </h5>
            </div>
            <div v-for="(c,index) in connectedGospelComment" v-bind:key="index" class="col-12 text-center">
              <small class="color5 fw-bold clickable"
                     @click="showDialogConnected('Commento extra del ' + c.date, null, c.extra)">
                Extra del {{ c.date }}
              </small>
            </div>
          </section>

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
    textDate() {
      return this.$store.getters['page/textDate'];
    },
    cleanedExtra() {
      return this.$store.getters['page/todayGospelWay'].extra.replace(/style="font-family:.*;"/gm,'')
    },
    cleanedText() {
      return this.$store.getters['page/todayGospelWay'].text.replace(/style="font-family:.*;"/gm,'')
    },
    cleanedComment() {
      return this.$store.getters['page/todayGospelWay'].comment.replace(/style="font-family:.*;"/gm,'')
    },
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
      this.dialogConnected.title = title
      if (content) {
        this.dialogConnected.content = content.replace(/style="font-family:.*;"/gm,'')
      }
      if (extra) {
        this.dialogConnected.extra = extra.replace(/style="font-family:.*;"/gm,'')
      }
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

.subtitle{
  font-size: 1rem;
  color: #A67D51;
}

.header-section {
  font-family: 'Barlow Semi Condensed', sans-serif;
}

.dialog-text {
  font-size: 1.3rem;
  line-height: 2.2;
  color: #866a2f;
}

.html-raw:deep(p), .html-raw:deep(em) {
  font-family: 'Barlow Semi Condensed', sans-serif;
  color: #281D02FF !important;
  font-size: 1.2rem;
  line-height: 1.3;
}
.html-raw:deep(strong) {
  font-family: 'Barlow Semi Condensed', sans-serif;
  color: #A67D51 !important;
  font-size: 1.2rem !important;
}

.html-raw:deep(span) {
  font-family: 'Barlow Semi Condensed', sans-serif;
  color: #281D02FF !important;
  font-size: 1.2rem !important;
}
.html-raw:deep(em) {
  font-family: 'Barlow Semi Condensed', sans-serif;
  color: #281D02FF !important;
  font-size: 1.2rem !important;
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
