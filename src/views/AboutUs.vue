<template>
  <div class="container">
    <base-card class="bg-layout">
      <div v-if="isLoading">
        <base-spinner></base-spinner>
      </div>
      <section v-else class="html-raw">
        <div class="my-4" v-html="page"></div>
      </section>
    </base-card>
  </div>
</template>

<script>
export default {
  created() {
    this.loadPage()
  },
  data() {
    return {
      dialog: false,
      isLoading: false,
      page: null
    }
  },
  methods: {
    async loadPage() {
      this.isLoading = true
      const response = await fetch(
          `${process.env.VUE_APP_MDV_BASE_URL}/page/get_pages/who_consecrateds_are/1/1`
      );
       const responseData = await response.json();
      if (!response.ok) {
        console.log("Errore nella richiesta");
      }
      this.isLoading = false
      this.page = responseData[0].property.split('|')[1].replace(/style=".*"/gm,'')
      this.page = this.page.replace(
          /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
          '<a href="mailto:$1">$1</a>'
      );
    }
  }

}
</script>

<style scoped>
.html-raw:deep(img) {
  display: block;
  margin: auto;
  padding-top: 2rem;
  padding-bottom: 2rem;
  width: 16rem !important;
  text-align: center;
}

.html-raw:deep(p) {
  color: #281D02FF;
}

.html-raw:deep(table) {
  box-shadow: 5px 2px 10px -1px rgba(0,0,0,0.53);
  border: none transparent;
}

.html-raw:deep(th), .html-raw:deep(td){
  padding: 1rem;
  border: none;
}
.html-raw:deep(a){
  text-decoration: none !important;
  color: #A67D51;
  transition: all .1s;
}
.html-raw:deep(a):hover{
  color: #ecb071;
}
/* Medium devices (tablets, 768px and up)  */
@media (min-width: 768px) {
  .html-raw:deep(img) {
    width: 25rem !important;
  }
}

</style>
