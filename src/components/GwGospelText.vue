<template>
  <section>
    <!-- Wrap the Gospel section in TextHighlighter -->
    <text-highlighter
        ref="gospelHighlighter"
        :title="'Dal vangelo secondo ' + evangelist"
        :reference="evangelist"
        :current-date="textDate"
        :textRef="textRef"
        :highlight-mode="highlightMode"
        :highlight-color="highlightColor"
        @highlight-count-change="count => updateHighlightCount('gospel', count)"
    >
      <gw-raw-text
          :title="'Dal vangelo secondo ' + evangelist"
          :text="gospel"
          :reference="textRef"
          :showDivider="false"
          :zoomLevel="zoomLevel"
      />
    </text-highlighter>

    <!-- Wrap the Comment section in TextHighlighter -->
    <text-highlighter
        ref="commentHighlighter"
        title="Commento al Vangelo"
        reference="Commento"
        :current-date="textDate"
        :textRef="textRef"
        :highlight-mode="highlightMode"
        :highlight-color="highlightColor"
        @highlight-count-change="count => updateHighlightCount('comment', count)"
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
        ref="extraHighlighter"
        reference="Extra"
        :current-date="textDate"
        :textRef="textRef"
        :highlight-mode="highlightMode"
        :highlight-color="highlightColor"
        @highlight-count-change="count => updateHighlightCount('extra', count)"
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
import { defineProps, defineEmits, ref, computed, defineExpose } from 'vue'

defineProps({
  evangelist: String,
  textRef: String,
  gospel: String,
  comment: String,
  textDate: String,
  extra: String,
  showDivider: Boolean,
  zoomLevel: {
    type: Number,
    default: 100
  },
  // Highlight control props
  highlightMode: {
    type: Boolean,
    default: false
  },
  highlightColor: {
    type: String,
    default: 'rgba(255, 230, 0, 0.35)'
  }
})

const emit = defineEmits(['highlight-count-change', 'highlights-change'])

// Refs to highlighter instances
const gospelHighlighter = ref(null)
const commentHighlighter = ref(null)
const extraHighlighter = ref(null)

// Track counts per section
const highlightCounts = ref({
  gospel: 0,
  comment: 0,
  extra: 0
})

// Computed total count
const totalHighlightCount = computed(() => {
  return highlightCounts.value.gospel +
         highlightCounts.value.comment +
         highlightCounts.value.extra
})

// Get all highlights aggregated from all sections
function getAllHighlights() {
  const allHighlights = []

  // Get highlights from gospel section
  if (gospelHighlighter.value?.highlights) {
    gospelHighlighter.value.highlights.forEach((h, idx) => {
      allHighlights.push({
        ...h,
        section: 'gospel',
        sectionIndex: idx,
        sectionLabel: 'Vangelo'
      })
    })
  }

  // Get highlights from comment section
  if (commentHighlighter.value?.highlights) {
    commentHighlighter.value.highlights.forEach((h, idx) => {
      allHighlights.push({
        ...h,
        section: 'comment',
        sectionIndex: idx,
        sectionLabel: 'Commento'
      })
    })
  }

  // Get highlights from extra section
  if (extraHighlighter.value?.highlights) {
    extraHighlighter.value.highlights.forEach((h, idx) => {
      allHighlights.push({
        ...h,
        section: 'extra',
        sectionIndex: idx,
        sectionLabel: 'Riflessione'
      })
    })
  }

  return allHighlights
}

// Update count for a specific section
function updateHighlightCount(section, count) {
  highlightCounts.value[section] = count
  emit('highlight-count-change', totalHighlightCount.value)
  // Also emit the full highlights list
  emit('highlights-change', getAllHighlights())
}

// Remove a highlight by section and index
function removeHighlight(section, sectionIndex) {
  if (section === 'gospel' && gospelHighlighter.value) {
    gospelHighlighter.value.removeHighlight(sectionIndex)
  } else if (section === 'comment' && commentHighlighter.value) {
    commentHighlighter.value.removeHighlight(sectionIndex)
  } else if (section === 'extra' && extraHighlighter.value) {
    extraHighlighter.value.removeHighlight(sectionIndex)
  }
}

// Show export options from first available highlighter
function showExportOptions() {
  if (gospelHighlighter.value?.highlightCount > 0) {
    gospelHighlighter.value.showExportOptions()
  } else if (commentHighlighter.value?.highlightCount > 0) {
    commentHighlighter.value.showExportOptions()
  } else if (extraHighlighter.value?.highlightCount > 0) {
    extraHighlighter.value.showExportOptions()
  }
}

defineExpose({
  getAllHighlights,
  removeHighlight,
  showExportOptions,
  totalHighlightCount
})
</script>

