<template>
  <div class="skeleton-wrapper" :class="variant">
    <!-- Gospel Page Skeleton -->
    <template v-if="variant === 'gospel'">
      <div class="skeleton-header">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-subtitle"></div>
        <div class="skeleton-line skeleton-date"></div>
      </div>

      <div class="skeleton-button-container">
        <div class="skeleton-button"></div>
      </div>

      <div class="skeleton-divider"></div>

      <div class="skeleton-content">
        <div class="skeleton-line skeleton-evangelist"></div>
        <div class="skeleton-line skeleton-reference"></div>

        <div class="skeleton-text-block">
          <div class="skeleton-line" v-for="i in 6" :key="'text-'+i" :style="{ width: getRandomWidth() }"></div>
        </div>

        <div class="skeleton-divider"></div>

        <div class="skeleton-comment-block">
          <div class="skeleton-line skeleton-comment-title"></div>
          <div class="skeleton-line" v-for="i in 8" :key="'comment-'+i" :style="{ width: getRandomWidth() }"></div>
        </div>
      </div>
    </template>

    <!-- Home Header Only Skeleton - for date changes -->
    <template v-if="variant === 'home-header'">
      <!-- Date row with navigation arrows -->
      <div class="d-flex justify-content-center align-items-center">
        <div class="skeleton-nav-icon"></div>
        <div class="skeleton-line skeleton-date-title-inline"></div>
        <div class="skeleton-nav-icon"></div>
      </div>
      <!-- Calendar icon -->
      <div class="text-center mt-2">
        <div class="skeleton-calendar-icon"></div>
      </div>
      <!-- Saint name (h3 bold) -->
      <div class="text-center mt-3">
        <div class="skeleton-line skeleton-saint-inline"></div>
      </div>
      <!-- Liturgy (h3) -->
      <div class="text-center">
        <div class="skeleton-line skeleton-liturgy-inline"></div>
      </div>
    </template>

    <!-- Home Page Skeleton - exact same structure as MdvHome.vue -->
    <template v-else-if="variant === 'home'">
      <!-- Header row: mt-5 mb-3 -->
      <header class="row mt-5 mb-3">
        <div class="col-12 text-center">
          <div class="d-flex justify-content-center align-items-center">
            <div class="skeleton-nav-icon"></div>
            <div class="skeleton-line skeleton-date-title"></div>
            <div class="skeleton-nav-icon"></div>
          </div>
        </div>
        <div class="col-12 text-center">
          <div class="skeleton-calendar-icon"></div>
        </div>
      </header>

      <!-- Saint/Liturgy section -->
      <section class="row text-center">
        <div class="col-12">
          <div class="skeleton-line skeleton-saint"></div>
        </div>
        <div class="col-12">
          <div class="skeleton-line skeleton-liturgy"></div>
        </div>
      </section>

      <!-- Buttons section: my-5 g-2 -->
      <section class="row my-5 g-2">
        <div class="col-md-6 text-center text-md-end">
          <div class="skeleton-btn skeleton-btn-brown"></div>
        </div>
        <div class="col-md-6 text-center text-md-start">
          <div class="skeleton-btn skeleton-btn-green"></div>
        </div>
      </section>

      <!-- Divider -->
      <hr class="fade-hr mx-auto">

      <!-- Intro text section -->
      <section class="row">
        <div class="col-12 skeleton-intro-text">
          <div class="skeleton-line" v-for="i in 5" :key="'intro-'+i" :style="{ width: getRandomWidth() }"></div>
        </div>
      </section>
    </template>

    <!-- Simple Line Skeleton -->
    <template v-else>
      <div class="skeleton-line" :style="{ width: width, height: height }"></div>
    </template>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  variant: {
    type: String,
    default: 'default' // 'gospel', 'home', 'default'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  }
});

function getRandomWidth() {
  const widths = ['95%', '88%', '92%', '85%', '90%', '78%', '96%'];
  return widths[Math.floor(Math.random() * widths.length)];
}
</script>

<style scoped>
.skeleton-wrapper {
  /* No padding for home variant to match exact layout */
}

.skeleton-wrapper.gospel {
  padding: 1rem;
}

.skeleton-line {
  background: linear-gradient(
    90deg,
    #e8dcc8 25%,
    #f5ece0 50%,
    #e8dcc8 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Gospel variant styles */
.skeleton-wrapper.gospel {
  max-width: 800px;
  margin: 0 auto;
}

.skeleton-header {
  text-align: center;
  margin-bottom: 2rem;
}

.skeleton-title {
  height: 2rem;
  width: 60%;
  margin: 0 auto 1rem;
}

.skeleton-subtitle {
  height: 1.2rem;
  width: 40%;
  margin: 0 auto 0.5rem;
}

.skeleton-date {
  height: 1rem;
  width: 35%;
  margin: 0 auto;
}

.skeleton-button-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.skeleton-button {
  width: 200px;
  height: 45px;
  background: linear-gradient(
    90deg,
    #d4c4a8 25%,
    #e0d4be 50%,
    #d4c4a8 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    #c9b896 50%,
    transparent
  );
  margin: 2rem auto;
  width: 80%;
}

.skeleton-content {
  padding: 0 1rem;
}

.skeleton-evangelist {
  height: 1.5rem;
  width: 25%;
  margin: 0 auto 0.5rem;
}

.skeleton-reference {
  height: 1rem;
  width: 20%;
  margin: 0 auto 1.5rem;
}

.skeleton-text-block {
  margin-bottom: 2rem;
}

.skeleton-comment-block {
  margin-top: 1rem;
}

.skeleton-comment-title {
  height: 1.3rem;
  width: 30%;
  margin: 0 auto 1.5rem;
}

/* Home variant styles - exact same dimensions as MdvHome.vue */

/* Nav icon (chevron) - same as .home-icon font-size: 1.5rem */
.skeleton-nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  margin: 0 0.5rem;
  background: linear-gradient(90deg, #d4c4a8 25%, #e0d4be 50%, #d4c4a8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Date title - h1 size */
.skeleton-date-title {
  height: 2.5rem;
  width: 180px;
  margin: 0;
}

/* Calendar icon */
.skeleton-calendar-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  margin: 0.5rem auto 0;
  background: linear-gradient(90deg, #d4c4a8 25%, #e0d4be 50%, #d4c4a8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  display: inline-block;
}

/* Saint - h3 */
.skeleton-saint {
  height: 1.75rem;
  width: 55%;
  max-width: 280px;
  margin: 0 auto 0.5rem;
}

/* Liturgy - h3 */
.skeleton-liturgy {
  height: 1.5rem;
  width: 35%;
  max-width: 180px;
  margin: 0 auto;
}

/* ============================================ */
/* HOME-HEADER VARIANT - Inline skeleton styles */
/* ============================================ */

/* Date title inline - h1 size (approx 2rem default browser h1) */
.skeleton-date-title-inline {
  height: 2.5rem;
  width: 220px;
  max-width: 280px;
  margin: 0 0.5rem;
  display: inline-block;
  background: linear-gradient(90deg, #e8dcc8 25%, #f5ece0 50%, #e8dcc8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Saint inline - h3 bold (approx 1.17rem * 1.2 line-height) */
.skeleton-saint-inline {
  height: 1.75rem;
  width: 280px;
  max-width: 90%;
  margin: 0 auto 0.5rem;
  display: inline-block;
  background: linear-gradient(90deg, #e8dcc8 25%, #f5ece0 50%, #e8dcc8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Liturgy inline - h3 (approx 1.17rem) */
.skeleton-liturgy-inline {
  height: 1.5rem;
  width: 180px;
  max-width: 60%;
  margin: 0 auto;
  display: inline-block;
  background: linear-gradient(90deg, #e8dcc8 25%, #f5ece0 50%, #e8dcc8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Buttons - EXACT same as BaseButton: width 18rem, padding 0.8em 1.8em, font-size 1.2rem */
.skeleton-btn {
  width: 18rem;
  height: 3rem; /* approx 0.8em * 2 + 1.2rem line */
  border-radius: 0.375rem;
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  display: inline-block;
}

/* Button brown - #A67D51 */
.skeleton-btn-brown {
  background: linear-gradient(90deg, #c9a882 25%, #d4b896 50%, #c9a882 75%);
  background-size: 200% 100%;
}

/* Button green/olive - #B2A348 */
.skeleton-btn-green {
  background: linear-gradient(90deg, #c5c078 25%, #d1cc8f 50%, #c5c078 75%);
  background-size: 200% 100%;
}

/* Intro text - same line-height 1.6, font-size 1.2rem as .intro */
.skeleton-intro-text .skeleton-line {
  height: 1.2rem;
  margin-bottom: 0.8rem;
}

/* Medium devices - same as BaseButton */
@media (min-width: 768px) {
  .skeleton-btn {
    width: 16rem;
  }
}

/* Large devices - same as BaseButton */
@media (min-width: 992px) {
  .skeleton-btn {
    width: 22rem;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .skeleton-title {
    width: 80%;
  }

  .skeleton-subtitle {
    width: 60%;
  }

  .skeleton-evangelist {
    width: 40%;
  }

  .skeleton-reference {
    width: 35%;
  }
}
</style>
