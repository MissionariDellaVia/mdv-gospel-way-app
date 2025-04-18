<template>
  <base-card v-touch:swipe="handleSwipe">
    <!-- Date transition container -->
    <transition-group
        name="date-slide"
        tag="div"
        class="date-content-wrapper"
        @after-leave="transitionComplete"
    >
      <div v-if="isLoading" key="spinner" class="spinner-overlay">
        <base-spinner></base-spinner>
      </div>

      <div
          v-else
          key="content"
          class="content-container"
          :class="{
          'swipe-left-active': swipeAnimation === 'left',
          'swipe-right-active': swipeAnimation === 'right'
        }"
      >
        <header class="row mt-5 mb-3">
          <div class="col-12 header-section text-center">
            <div class="d-flex justify-content-center align-items-center position-relative">
              <!-- Left nav with ripple -->
              <div class="nav-button-container">
                <div class="ripple-container" :class="{ 'ripple-active': rippleLeft }">
                  <div class="ripple"></div>
                </div>
                <i class="fa-solid fa-chevron-left home-icon px-2"
                   @click="handleDateChange(false, true, null)"
                   @mousedown="activateRipple('left')"
                   @touchstart.prevent="activateRipple('left')"></i>
              </div>

              <!-- Date display with animation -->
              <h1 class="color3 date-title" :class="{ 'date-change': dateChangeAnimation }">
                {{ textDate || 'Data corrente' }}
              </h1>

              <!-- Right nav with ripple -->
              <div class="nav-button-container">
                <div class="ripple-container" :class="{ 'ripple-active': rippleRight }">
                  <div class="ripple"></div>
                </div>
                <i class="fa-solid fa-chevron-right home-icon px-2"
                   @click="handleDateChange(true, false, null)"
                   @mousedown="activateRipple('right')"
                   @touchstart.prevent="activateRipple('right')"></i>
              </div>
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
                <div class="calendar-icon-wrapper">
                  <i class="fa-regular fa-calendar-days home-icon"></i>
                  <div class="calendar-pulse" :class="{ 'pulse-active': calendarPulse }"></div>
                </div>
              </template>
            </vue-date-picker>
          </div>
        </header>

        <section class="row header-section text-center">
          <div v-if="saint" class="col-12 saint-section" :class="{ 'fade-in': contentFadeIn }">
            <h3 class="color5 fw-bold">{{ saint }}</h3>
          </div>
          <div v-if="liturgy" class="col-12 liturgy-section" :class="{ 'fade-in': contentFadeIn }">
            <h3 class="color4">{{ liturgy }}</h3>
          </div>
        </section>

        <!-- Rest of the content remains the same -->
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
      </div>
    </transition-group>

    <!-- Swipe hint overlay -->
    <div v-if="isSwipeActive" class="swipe-hint-overlay" :class="swipeDirection">
      <div class="swipe-arrow">
        <i :class="[swipeDirection === 'left' ? 'fa-solid fa-arrow-left' : 'fa-solid fa-arrow-right']"></i>
      </div>
      <div class="swipe-date">
        {{ swipeDirection === 'left' ? 'Giorno successivo' : 'Giorno precedente' }}
      </div>
    </div>
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

    // Initialize user interaction tracking
    this.hasUserInteracted = false;
    document.addEventListener('click', this.markUserInteraction);
    document.addEventListener('touchstart', this.markUserInteraction);
  },
  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener('click', this.markUserInteraction);
    document.removeEventListener('touchstart', this.markUserInteraction);
  },
  data() {
    return {
      currentDate: new Date(),
      isLoading: false,
      error: null,
      swipeAnimation: null,
      isSwipeActive: false,
      swipeDirection: null,
      swipeProgress: 0,
      dateChangeAnimation: false,
      contentFadeIn: false,
      rippleLeft: false,
      rippleRight: false,
      calendarPulse: false,
      transitionInProgress: false,
      hasUserInteracted: false // Track if user has interacted with the page
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
    },
    // Check if vibration is available
    canVibrate() {
      return this.hasUserInteracted && typeof navigator !== 'undefined' &&
          'vibrate' in navigator && typeof navigator.vibrate === 'function';
    }
  },
  methods: {
    // Track user interaction with the page (for vibration API)
    markUserInteraction() {
      this.hasUserInteracted = true;
      // Only need to listen once
      document.removeEventListener('click', this.markUserInteraction);
      document.removeEventListener('touchstart', this.markUserInteraction);
    },

    // Safe vibration function that checks permissions first
    safeVibrate(pattern) {
      if (this.canVibrate) {
        try {
          navigator.vibrate(pattern);
        } catch (e) {
          // Silently fail if vibration fails
          console.debug('Vibration failed', e);
        }
      }
    },

    async initialize() {
      try {
        this.isLoading = true;
        await Promise.all([
          this.loadHomeInfo(),
          this.loadAllowedDates()
        ]);
        this.contentFadeIn = true;
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },
    handleError(error) {
      this.error = error.message || 'Si è verificato un errore';
      console.error(this.error);
    },
    handleSwipe(direction, event) {
      // Don't process new swipes during transition
      if (this.transitionInProgress) return;

      // Calculate swipe progress (0-100%)
      if (event && event.srcEvent) {
        const { deltaX } = event;
        const width = window.innerWidth;
        this.swipeProgress = Math.min(Math.abs(deltaX) / (width * 0.3), 1);

        // Show swipe hint when in progress
        if (this.swipeProgress > 0.1 && !this.isSwipeActive) {
          this.isSwipeActive = true;
          this.swipeDirection = direction;

          // Light haptic feedback when crossing threshold
          this.safeVibrate(10);
        }

        // If swipe was released but not complete
        if (event.isFinal && this.swipeProgress < 0.5) {
          this.isSwipeActive = false;
          return;
        }
      }

      if (direction === 'left') {
        this.executeSwipe('left');
      } else if (direction === 'right') {
        this.executeSwipe('right');
      }
    },

    executeSwipe(direction) {
      this.transitionInProgress = true;
      this.isSwipeActive = false;
      this.swipeAnimation = direction;

      // Success haptic feedback pattern
      this.safeVibrate([15, 30]);

      setTimeout(() => {
        if (direction === 'left') {
          this.handleDateChange(true, false, null);
        } else {
          this.handleDateChange(false, true, null);
        }
      }, 300);
    },

    transitionComplete() {
      this.swipeAnimation = null;
      this.transitionInProgress = false;
      this.contentFadeIn = true;
    },

    activateRipple(direction) {
      if (direction === 'left') {
        this.rippleLeft = true;
        setTimeout(() => this.rippleLeft = false, 600);
      } else {
        this.rippleRight = true;
        setTimeout(() => this.rippleRight = false, 600);
      }

      // Light haptic feedback (single tap)
      this.safeVibrate(5);
    },

    handleClick(route, date) {
      if (date) {
        this.$router.push(`${route}/${this.$store.getters['page/currentDate']}`);
      } else {
        this.$router.push(route);
      }
    },

    async handleDateChange(add, subtract, date) {
      // Don't allow new date changes during transition
      if (this.transitionInProgress && !date) return;

      this.transitionInProgress = true;
      this.contentFadeIn = false;
      this.isLoading = true;
      this.dateChangeAnimation = true;

      if (date) {
        // Calendar date selection animation
        this.calendarPulse = true;
        setTimeout(() => this.calendarPulse = false, 500);
      }

      // Change date in store
      this.$store.dispatch('page/changeDay', {
        add: add,
        subtract: subtract,
        fullDate: date
      });

      try {
        await this.loadHomeInfo();
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
        this.dateChangeAnimation = false;

        // Trigger content fade-in
        setTimeout(() => {
          this.contentFadeIn = true;
          this.transitionInProgress = false;
        }, 100);
      }
    },

    async loadHomeInfo() {
      try {
        await this.$store.dispatch('page/loadHomeInfo');
      } catch (error) {
        this.handleError(error);
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
// Base styles (preserved from original)
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

// New animation and interaction styles
.date-content-wrapper {
  position: relative;
  width: 100%;
}

// Swipe animations
.date-slide-enter-active,
.date-slide-leave-active {
  transition: all 0.4s ease-in-out;
}

.date-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.date-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

// Content container with swipe effects
.content-container {
  position: relative;
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.4);

  &.swipe-left-active {
    transform: translateX(-100%);
    opacity: 0;
  }

  &.swipe-right-active {
    transform: translateX(100%);
    opacity: 0;
  }
}

// Spinner overlay
.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

// Date title animation
.date-title {
  transition: transform 0.2s ease, opacity 0.2s ease;

  &.date-change {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

// Ripple effect for nav buttons
.nav-button-container {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ripple-container {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(166, 125, 81, 0.3) 0%, rgba(166, 125, 81, 0) 70%);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  transition: width 0s, height 0s;
}

.ripple-active .ripple {
  width: 80px;
  height: 80px;
  transition: width 0.6s ease-out, height 0.6s ease-out;
}

// Calendar pulse animation
.calendar-icon-wrapper {
  position: relative;
  display: inline-block;
}

.calendar-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(178, 163, 72, 0.2) 0%, rgba(178, 163, 72, 0) 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.pulse-active {
  animation: pulse-expand 0.5s ease-out forwards;
}

@keyframes pulse-expand {
  0% {
    width: 0;
    height: 0;
    opacity: 0.8;
  }
  100% {
    width: 60px;
    height: 60px;
    opacity: 0;
  }
}

// Content fade-in animation
.saint-section, .liturgy-section {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.4s ease, transform 0.4s ease;

  &.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.liturgy-section.fade-in {
  transition-delay: 0.1s;
}

// Swipe hint overlay
.swipe-hint-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
  color: #A67D51;
  opacity: 0.85;
  background: linear-gradient(to right,
      rgba(40, 29, 2, 0.15) 0%,
      rgba(0, 0, 0, 0) 50%,
      rgba(40, 29, 2, 0.15) 100%);

  &.left {
    justify-content: center;
    background: linear-gradient(to left,
        rgba(40, 29, 2, 0.01) 0%,
        rgba(40, 29, 2, 0.05) 30%,
        rgba(40, 29, 2, 0.15) 100%);
  }

  &.right {
    justify-content: center;
    background: linear-gradient(to right,
        rgba(40, 29, 2, 0.01) 0%,
        rgba(40, 29, 2, 0.05) 30%,
        rgba(40, 29, 2, 0.15) 100%);
  }
}

.swipe-arrow {
  font-size: 3rem;
  margin-bottom: 10px;
}

.swipe-date {
  font-size: 1.2rem;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-weight: 600;
}
</style>