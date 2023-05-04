<template>
  <section>
    <div class="row my-3">
      <div class="col-12 font-section text-center html-raw">
        <h4 v-show="title" class="mb-4 color4 fw-bold"> {{ title }}</h4>
        <h4 v-show="heading" class="heading ">{{ heading }}</h4>
        <div class="my-1" @click.right.prevent @copy.prevent @paste.prevent v-html="cleanedText"></div>
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
  showDivider: Boolean
})
const cleanedText = computed( () => {
  let c = props.text?.replace(/style="font-family:.*;"/gm, '');
  return c?.replaceAll(/IMG\d/gm, '');
})
</script>

<style scoped>
.heading {
  color: #a57c4f;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}
.font-section {
  font-family: 'Barlow Semi Condensed', sans-serif;
}

.html-raw:deep(p), .html-raw:deep(div){
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
