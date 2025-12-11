<template>
  <section>
    <base-dialog
        :show="!!show"
        :title="title"
        @close="cleanDialogConnected">
      <div class="html-raw my-1" v-html="sanitizedContent"></div>
      <div class="html-raw my-1" v-html="sanitizedExtra"></div>
    </base-dialog>

    <section v-show="relatedData && relatedData.length > 0">
      <div class="col-12 header-section text-center">
        <h4 class="my-4 color4 fw-bold"> Altri commenti </h4>
      </div>
      <div v-for="(c,index) in relatedData" v-bind:key="index" class="col-12 text-center">
        <p class="clickable conn-p"
               @click="showDialogConnected(c.date, c.comments?.main, c.comments?.reflection)">
          Commento del {{ getTextDate(c.date) }}
        </p>
      </div>
    </section>


  </section>
</template>

<script setup>
import {ref, defineProps, computed} from 'vue';
import DOMPurify from 'dompurify';

defineProps({
  relatedData: Array,
})

const show = ref(false)
const title = ref(null)
const content = ref(null)
const extra = ref(null)
const months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

// Sanitizzazione HTML per sicurezza
const sanitizeOptions = {
  ALLOWED_TAGS: ['p', 'div', 'span', 'strong', 'em', 'b', 'i', 'a', 'br', 'ul', 'ol', 'li', 'blockquote'],
  ALLOWED_ATTR: ['href', 'target', 'style', 'class']
};

const sanitizedContent = computed(() =>
  content.value ? DOMPurify.sanitize(content.value, sanitizeOptions) : ''
);

const sanitizedExtra = computed(() =>
  extra.value ? DOMPurify.sanitize(extra.value, sanitizeOptions) : ''
);

function getTextDate(textDate) {
  let date = new Date(textDate)
  return date.getDate()
      + ' ' + months[date.getMonth()]
      + ' ' + date.getFullYear();
}

function showDialogConnected(textDate, comment, extraComment) {
  show.value = true;
  title.value = 'Commento del ' + getTextDate(textDate)
  content.value = comment || null
  extra.value = extraComment || null
}

function cleanDialogConnected() {
  show.value = false
  title.value = null
  content.value = null
  extra.value = null
}
</script>

<style scoped>
.conn-p {
  font-size: 1.2rem;
  color: #8c681c;
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
