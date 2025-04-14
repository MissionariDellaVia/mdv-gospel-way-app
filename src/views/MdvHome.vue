<template>
  <base-card v-touch:swipe="handleSwipe">
    <div v-if="isLoading">
      <base-spinner></base-spinner>
    </div>

    <header class="row mt-5 mb-3">
      <div class="col-12 header-section text-center">
        <div class="d-flex justify-content-center align-items-center">
          <i class="fa-solid fa-chevron-left home-icon px-2" @click="handleDateChange(false, true, null)"></i>
          <h1 class="color3">{{ textDate || 'Data corrente' }}</h1>
          <i class="fa-solid fa-chevron-right home-icon px-2" @click="handleDateChange(true, false, null)"></i>
        </div>
      </div>
      <div class="col-12 header-section text-center">
        <vue-date-picker
            v-if="isDatePickerReady"
            v-model="currentDate"
            :enable-time-picker="false"
            :max-date="allowedDates && allowedDates.length ? allowedDates[0] : new Date()"
            hide-offset-dates
            auto-apply
            calendar-cell-class-name="dp-custom-cell"
            @update:model-value="handleDateChange(false, false, currentDate)">
          <template #trigger>
            <i class="fa-regular fa-calendar-days home-icon"></i>
          </template>
        </vue-date-picker>
      </div>
    </header>

    <section class="row header-section text-center">
      <div v-if="saint" class="col-12">
        <h3 class="color5 fw-bold">{{ saint }}</h3>
      </div>
      <div v-if="liturgy" class="col-12">
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
        Questo sito contiene il diario spirituale della Comunità sul Vangelo del giorno. L'abbiamo realizzata perchè potesse servire anche a te!<br>
        Questo commento è un aiuto per meditare e costudire almeno una parola del Vangelo, perchè possa portare frutto nel cammino quotidiano alla sequela di Gesù e per vivere il carisma della comunità più intensamente!<br><br>
        Se volessi scaricare l'app gratuita, cerca su
        <a href="https://play.google.com/store/apps/details?id=net.missionaridellavia.gospelway&hl=it&gl=US">PlayStore</a> e su
        <a href="https://apps.apple.com/ca/app/missionari-della-via/id1602977439">AppStore</a> "Missionari della Via".<br>
        Se volessi il libretto cartaceo trimestrale (da poter sottolineare e dove poter prendere appunti)
        puoi richiederlo <a href="mailto:missionaridellavia.cassano@gmail.com">scrivendoci</a>
      </p>
    </section>
  </base-card>
</template>

<script>
export default {
  metaInfo() {
    return {
      title: 'La Via del Vangelo',
    }
  },
  created() {
    this.initialize();
  },
  data() {
    return {
      currentDate: new Date(),
      isLoading: false,
      error: null
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
    },
    isDatePickerReady() {
      return Array.isArray(this.allowedDates) && this.allowedDates.length > 0;
    }
  },
  methods: {
    async initialize() {
      try {
        this.isLoading = true;
        await Promise.all([
          this.loadHomeInfo(),
          this.loadAllowedDates()
        ]);
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },
    handleError(error) {
      this.error = error.message || 'Si è verificato un errore';
      console.error(this.error);
      // Qui si potrebbe aggiungere un sistema di notifica all'utente
    },
    handleSwipe(direction) {
      if (direction === 'left') {
        this.handleDateChange(true, false, null);
      }
      if (direction === 'right') {
        this.handleDateChange(false, true, null);
      }
    },
    handleClick(route, date) {
      if (date) {
        this.$router.push(`${route}/${this.$store.getters['page/currentDate']}`);
      } else {
        this.$router.push(route);
      }
    },
    async handleDateChange(add, subtract, date) {
      this.$store.dispatch('page/changeDay', {
        add: add,
        subtract: subtract,
        fullDate: date
      });
      await this.loadHomeInfo();
    },
    async loadHomeInfo() {
      try {
        this.isLoading = true;
        await this.$store.dispatch('page/loadHomeInfo');
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadAllowedDates() {
      try {
        await this.$store.dispatch('page/loadAllowedDates');
      } catch (error) {
        this.handleError(error);
      }
    },
  }
}
</script>

<style scoped lang="scss">
.home-icon {
  font-size: 1.5rem;
  color: #9d7a5b;
  cursor: pointer;
  transition: all .1s;

  &:hover, &:focus {
    filter: brightness(140%);
    transform: scale(0.90);
  }
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

.dp-custom-cell {
  border-radius: 90% !important;
}

a {
  text-decoration: none !important;
  font-size: 1.2rem;
  font-weight: bold;
  color: #b0a247;
  transition: all .1s;

  &:hover {
    color: #b28555;
  }
}
</style>