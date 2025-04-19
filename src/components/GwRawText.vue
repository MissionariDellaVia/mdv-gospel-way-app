<template>
  <section>
    <div class="row my-3">
      <div class="col-12 font-section text-center html-raw" :class="{'zoomed': zoomLevel !== 100}">
        <h4 v-show="title" class="mb-4 color4 fw-bold" :style="{ fontSize: titleSize }"> {{ title }}</h4>
        <h4 v-show="heading" class="heading" :style="{ fontSize: headingSize }">{{ heading }}</h4>
        <div class="my-1 content-area" :style="zoomStyle" @click.right.prevent @copy.prevent @paste.prevent v-html="cleanedText"></div>
      </div>
    </div>
    <hr v-show="showDivider" class="fade-hr my-5 mx-auto">
  </section>
</template>

<script setup>
import {computed, defineProps} from 'vue'

const props = defineProps({
  title: String,
  heading: String,
  text: String,
  showDivider: Boolean,
  zoomLevel: {
    type: Number,
    default: 100
  }
})

const cleanedText = computed(() => {
  let c = props.text?.replace(/style="font-family:.*;"/gm, '');
  return c?.replaceAll(/IMG\d/gm, '');
})

// Calculate sizes based on zoom level
const headingSize = computed(() => {
  return `${1.3 * (props.zoomLevel / 100)}rem`;
})

const titleSize = computed(() => {
  return `${1.15 * (props.zoomLevel / 100)}rem`;
})

// Compute style based on zoom level
const zoomStyle = computed(() => {
  return {
    '--zoom-factor': props.zoomLevel / 100
  };
})
</script>

<style>
/* Global styles to affect deeply nested content */
.zoomed .content-area p,
.zoomed .content-area div,
.zoomed .content-area span:not(.fa-solid),
.zoomed .content-area li,
.zoomed .content-area blockquote {
  font-size: calc(1.2rem * var(--zoom-factor, 1)) !important;
}

.zoomed .content-area strong,
.zoomed .content-area em,
.zoomed .content-area b,
.zoomed .content-area i,
.zoomed .content-area a {
  font-size: calc(1.2rem * var(--zoom-factor, 1)) !important;
}
</style>

<style scoped>
.heading {
  color: #a57c4f;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.font-section {
  font-family: 'Barlow Semi Condensed', sans-serif;
}

.html-raw:deep(p), .html-raw:deep(div) {
  font-family: 'Barlow Semi Condensed', sans-serif;
  color: #281D02FF !important;
  font-size: 1.2rem !important;
  text-align: justify;
  text-justify: inter-word;
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
</style>