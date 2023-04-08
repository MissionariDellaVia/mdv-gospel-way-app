<template>

      <base-card>
        <div v-if="isLoading">
          <base-spinner></base-spinner>
        </div>
        <header class="row mt-5 mb-3">
          <div class="col-12 header-section text-center">
            <div class="d-flex justify-content-center align-items-center">
              <i class="fa-solid fa-chevron-left home-icon px-2" @click="handleDateChange(false,true,null)"></i>
              <h1 class="color3"> {{ textDate }} </h1>
              <i class="fa-solid fa-chevron-right home-icon px-2" @click="handleDateChange(true,false,null)"></i>
            </div>
          </div>
          <div class="col-12 header-section text-center">
            <vue-date-picker
                v-model="currentDate"
                :enable-time-picker="false"
                :allowed-dates="allowedDates"
                hide-offset-dates
                auto-apply
                @update:model-value="handleDateChange(false,false,currentDate)">
              <template #trigger>
                <i class="fa-regular fa-calendar-days home-icon"></i>
              </template>
            </vue-date-picker>
          </div>
        </header>

        <section class="row header-section text-center">
          <div  v-show="saint" class="col-12 ">
            <h3 class="color5 fw-bold">{{ saint }}</h3>
          </div>
          <div v-show="liturgy" class="col-12">
            <h3 class="color4">{{ liturgy }}</h3>
          </div>
        </section>

        <section class="row my-5 g-2">
          <div class="col-md-6 text-md-end">
            <base-button title="Chi siamo" @click="handleClick('chi-siamo')" class="bg-1"></base-button>
          </div>
          <div class="col-md-6 text-md-start">
            <base-button title="Via del Vangelo" class="bg-2" @click="handleClick('via-del-vangelo', true)"></base-button>
          </div>
        </section>

        <hr class="fade-hr mx-auto">

        <section class="row">
          <p class="intro color1">
            Caro fratello o sorella <strong>benvenuto/a!</strong><br><br>
            Quest'App contiene il diario spirituale della Comunità sul Vangelo del giorno. L'abbiamo realizzata perchè potesse servire anche a te!
            Questo commento è un aiuto per meditare e costudire almeno una parola del Vangelo, perchè possa portare frutto nel cammino quotidiano alla sequela di Gesù e per vivere il carisma della comunità più intensamente!<br><br>
            Se volessi il libretto cartaceo trimestrale<br>
            (da poter sottolineare e dove poter prendere appunti)
            puoi richiederlo <strong>scrivendoci</strong>
          </p>
        </section>
      </base-card>

</template>

<script>
export default {
  created() {
    this.loadHomeInfo()
    this.loadAllowedDates()
  },
  data() {
    return {
      currentDate: new Date(),
      isLoading: false
    }
  },
  computed: {
    allowedDates() {
      return this.$store.getters['page/allowedDates'];
    },
    saint() {
      return this.$store.getters['page/saint'];
    },
    liturgy() {
      return this.$store.getters['page/liturgy'];
    },
    textDate() {
      return this.$store.getters['page/textDate'];
    }
  },
  methods: {
    handleClick(route, date) {
      if (date) {
        this.$router.push(route + '/' + this.$store.getters['page/currentDate']);
      }
      else {
        this.$router.push(route)
      }
    },
    async handleDateChange(add,subtract,date) {
      this.$store.dispatch('page/changeDay', {'add': add, 'subtract': subtract, 'fullDate': date});
      await this.loadHomeInfo()
    },
    async loadHomeInfo() {
      this.isLoading = true;
      try {
        await this.$store.dispatch('page/loadHomeInfo');
      } catch (error) {
        // this.showToast(error.message || 'Errore caricamento pagina!');
      }
      this.isLoading = false;
    },
    async loadAllowedDates() {
      this.isLoading = true;
      try {
        await this.$store.dispatch('page/loadAllowedDates');
      } catch (error) {
        // this.showToast(error.message || 'Errore caricamento pagina!');
      }
      this.isLoading = false;
    },
  }

}
</script>

<style scoped>
.home-icon {
  font-size: 1.5rem;
  color: #9d7a5b;
  cursor: pointer;
  transition: all .1s;
}
.home-icon:hover, .home-icon:focus {
  filter: brightness(140%);
  transform: scale(0.90);
}
.header-section {
  font-family: 'Barlow Semi Condensed', sans-serif;
}
.intro {
  line-height: 1.6;
  font-size: 1.2rem;
}
.bg-1 {
  background-color: #A67D51 !important;
  color: white;
}
.bg-2 {
  background-color: #B2A348 !important;
  color: white;
}
</style>
