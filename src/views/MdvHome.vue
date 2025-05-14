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
      <div class="col-12 header-section text-center datepicker-container">
        <vue-date-picker
            v-if="isDatePickerReady"
            v-model="currentDate"
            :enable-time-picker="false"
            :max-date="allowedDates && allowedDates.length ? allowedDates[0] : new Date()"
            hide-offset-dates
            auto-apply
            :position="position"
            :teleport="false"
            :inline-position="position"
            menu-class-name="centered-datepicker"
            calendar-class-name="custom-calendar"
            calendar-cell-class-name="dp-custom-cell"
            @open="onDatePickerOpen"
            @update:model-value="handleDateChange(false, false, currentDate)">
          <template #trigger>
            <i class="fa-regular fa-calendar-days home-icon calendar-icon"></i>
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
    this.injectCustomStyles();
  },
  data() {
    return {
      currentDate: new Date(),
      isLoading: false,
      error: null,
      position: 'center',
      currentUser: 'Alessandro-Mac7',
      currentDateTime: '2025-05-14 11:18:28'
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
    onDatePickerOpen() {
      // This will execute when the date picker opens
      setTimeout(() => {
        // Force centering of the date picker menu
        const dpMenu = document.querySelector('.centered-datepicker');
        if (dpMenu) {
          dpMenu.style.left = '50%';
          dpMenu.style.transform = 'translateX(-50%)';
          dpMenu.style.position = 'absolute';
        }

        // Apply additional styling to the month button transitions
        document.querySelectorAll('.dp__month_year_select').forEach(el => {
          el.style.transition = 'all 0.3s ease';
        });

        // Add a subtle highlight to today's date
        document.querySelectorAll('.dp__today').forEach(el => {
          el.classList.add('pulse-animation');
        });
      }, 10);
    },
    // Method to inject custom CSS into the head of the document
    injectCustomStyles() {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        /* Base styles for the date picker */
        .dp__theme_light {
          --dp-background-color: #fff !important;
          --dp-text-color: #3e2723 !important;
          --dp-hover-color: rgba(166, 125, 81, 0.1) !important;
          --dp-hover-text-color: #A67D51 !important;
          --dp-hover-icon-color: #A67D51 !important;
          --dp-primary-color: #A67D51 !important;
          --dp-primary-text-color: #fff !important;
          --dp-secondary-color: rgba(166, 125, 81, 0.15) !important;
          --dp-border-color: #e4e7ed !important;
          --dp-menu-border-color: #e4e7ed !important;
          --dp-border-color-hover: #A67D51 !important;
          --dp-disabled-color: #f8f8f8 !important;
          --dp-scroll-bar-background: #f8f8f8 !important;
          --dp-scroll-bar-color: #e4e7ed !important;
          --dp-success-color: #B2A348 !important;
          --dp-success-color-disabled: #aebfad !important;
          --dp-icon-color: #A67D51 !important;
          --dp-danger-color: #ff6b6b !important;
          --dp-highlight-color: #B2A348 !important;
        }

        /* Fix for centered positioning */
        .centered-datepicker {
          left: 50% !important;
          transform: translateX(-50%) !important;
          position: absolute !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          background-color: white !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          border: none !important;
          transform-origin: top center !important;
          animation: dp-popup 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          overflow: hidden !important;
        }

        @keyframes dp-popup {
          0% { opacity: 0; transform: translateX(-50%) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }

        /* Calendar container styling */
        .dp__main {
          font-family: 'Barlow Semi Condensed', sans-serif !important;
        }

        /* Make sure all backgrounds are white */
        .dp__menu_inner,
        .dp__calendar_header,
        .dp__calendar_item,
        .dp__month_year_row,
        .dp__month_year_wrap,
        .dp__action_row,
        .dp__overlay,
        .dp__overlay_container {
          background-color: white !important;
        }

        /* Month/Year selection styling */
        .dp__month_year_select {
          color: #A67D51 !important;
          font-weight: 600 !important;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          border-radius: 8px !important;
          padding: 5px 10px !important;
        }

        .dp__month_year_select:hover {
          background-color: rgba(166, 125, 81, 0.1) !important;
          transform: scale(1.05) !important;
        }

        /* Navigation arrows */
        .dp__arrow_btn {
          border-radius: 50% !important;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          color: #A67D51 !important;
        }

        .dp__arrow_btn:hover {
          background-color: rgba(166, 125, 81, 0.1) !important;
          transform: scale(1.1) !important;
        }

        /* Calendar days styling */
        .dp__cell_inner {
          border-radius: 50% !important;
          font-family: 'Barlow Semi Condensed', sans-serif !important;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          font-weight: 500 !important;
        }

        .dp__cell_inner:hover {
          background-color: rgba(166, 125, 81, 0.15) !important;
          transform: scale(1.1) !important;
          font-weight: 600 !important;
        }

        /* Selected date styling */
        .dp__active_date {
          background-color: #A67D51 !important;
          color: white !important;
          font-weight: 600 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 2px 10px rgba(166, 125, 81, 0.3) !important;
        }

        /* Today's date styling */
        .dp__today {
          border: 2px solid #B2A348 !important;
          color: #B2A348 !important;
          font-weight: 600 !important;
        }

        /* Month/Year overlay styling */
        .dp__overlay {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          border: none !important;
          animation: dp-overlay-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        @keyframes dp-overlay-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        .dp__overlay_cell {
          background-color: white !important;
          color: #3e2723 !important;
          border-radius: 8px !important;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          font-family: 'Barlow Semi Condensed', sans-serif !important;
        }

        .dp__overlay_cell:hover {
          background-color: rgba(166, 125, 81, 0.1) !important;
          color: #A67D51 !important;
          transform: scale(1.05) !important;
        }

        .dp__overlay_cell_active {
          background-color: #A67D51 !important;
          color: white !important;
          box-shadow: 0 2px 10px rgba(166, 125, 81, 0.3) !important;
          font-weight: 600 !important;
        }

        /* Animation for today's date */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .pulse-animation {
          animation: pulse 1.5s infinite ease-in-out;
        }

        /* Month transition animations */
        .dp__calendar_header,
        .dp__calendar,
        .dp__calendar_row {
          transition: opacity 0.2s ease, transform 0.2s ease !important;
        }

        /* Text selection preview */
        .dp__selection_preview {
          color: #A67D51 !important;
          font-family: 'Barlow Semi Condensed', sans-serif !important;
          font-weight: 600 !important;
        }

        /* Week numbers */
        .dp__week_num {
          color: #ccc !important;
          font-size: 0.9em !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
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

.datepicker-container {
  position: relative;
}

.calendar-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #9d7a5b;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 1;
  background-color: transparent;

  &:hover {
    color: #A67D51;
    background-color: rgba(166, 125, 81, 0.1);
    transform: scale(1.1) rotate(15deg);
  }

  &:active {
    transform: scale(0.9);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background-color: rgba(166, 125, 81, 0.05);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
    z-index: -1;
  }

  &:hover::after {
    width: 100%;
    height: 100%;
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