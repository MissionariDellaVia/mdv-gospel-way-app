<template>
  <section>
    <!-- Wrap the Gospel section in TextHighlighter -->
    <text-highlighter
        :title="'Dal vangelo secondo ' + evangelist"
        :reference="evangelist"
    >
      <gw-raw-text
          :title="'Dal vangelo secondo ' + evangelist"
          :text="gospel"
          :showDivider="false"
          :zoomLevel="zoomLevel"
      />
    </text-highlighter>

    <!-- Wrap the Comment section in TextHighlighter -->
    <text-highlighter
        title="Commento al Vangelo"
        reference="Commento"
    >
      <gw-raw-text
          title="Commento al Vangelo"
          :text="comment"
          :showDivider="false"
          :zoomLevel="zoomLevel"
      />
    </text-highlighter>

    <!-- Wrap the Extra section in TextHighlighter if present -->
    <text-highlighter
        v-if="extra"
        reference="Extra"
    >
      <gw-raw-text
          :text="extra"
          :zoomLevel="zoomLevel"
      />
    </text-highlighter>

    <hr v-show="showDivider" class="fade-hr my-5 mx-auto">
  </section>
</template>

<script setup>
import GwRawText from './GwRawText.vue'
import TextHighlighter from './text/TextHighlighter.vue'
import { defineProps } from 'vue'

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