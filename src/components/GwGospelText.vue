<template>
  <section>
    <gw-raw-text
        :title="'Dal vangelo secondo ' + evangelist"
        :text="gospel"
        :showDivider="true"
        :zoomLevel="zoomLevel"
    />

    <gw-raw-text
        title="Commento al Vangelo"
        :text="comment"
        :showDivider="!!extra"
        :zoomLevel="zoomLevel"
    />

    <gw-raw-text
        v-show="extra"
        :text="extra"
        :zoomLevel="zoomLevel"
    />

    <hr v-show="showDivider" class="fade-hr my-5 mx-auto">
  </section>
</template>

<script setup>
import GwRawText from './GwRawText.vue'
import {defineProps} from 'vue'

defineProps({
  evangelist: String,
  gospel: String,
  comment: String,
  extra: String,
  showDivider: Boolean,
  zoomLevel: {
    type: Number,
    default: 100
  }
})
</script>