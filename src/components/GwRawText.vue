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
import DOMPurify from 'dompurify'

const props = defineProps({
  title: String,
  heading: String,
  text: String,
  reference: String,
  showDivider: Boolean,
  zoomLevel: {
    type: Number,
    default: 100
  }
})

const cleanedText = computed(() => {
  if (!props.text) return '';
  // Rimuove placeholder IMG (legacy) e sanitizza HTML per sicurezza
  const cleaned = props.text.replaceAll(/IMG\d/gm, '');
  let sanitized = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: ['p', 'div', 'span', 'strong', 'em', 'b', 'i', 'a', 'br', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'style', 'class']
  });

  // Appende il riferimento alla fine del testo se presente
  if (props.reference) {
    const refSpan = ` <span class="gospel-reference">(${props.reference})</span>`;
    // Cerca l'ultimo tag di chiusura </p> o </div> per inserire il riferimento prima
    const lastPClose = sanitized.lastIndexOf('</p>');
    const lastDivClose = sanitized.lastIndexOf('</div>');
    const insertPos = Math.max(lastPClose, lastDivClose);

    if (insertPos > -1) {
      sanitized = sanitized.slice(0, insertPos) + refSpan + sanitized.slice(insertPos);
    } else {
      // Se non ci sono tag, appende alla fine
      sanitized += refSpan;
    }
  }

  return sanitized;
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

  /* Improved text alignment properties */
  text-align: justify;

  /* Better hyphenation for improved spacing */
  hyphens: auto;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;

  /* Improved spacing controls */
  word-spacing: -0.05em;
  letter-spacing: 0.01em;

  /* Text balance for more even distribution of words */
  text-wrap: balance;

  /* Improved line height for readability */
  line-height: 1.4;

  /* Add padding to prevent text touching edges */
  padding: 0 2px;
}

/* Paragraph margins for better spacing between blocks */
.html-raw:deep(p) {
  margin-bottom: 1.2em;
}

/* Special handling for last paragraph to avoid extra space */
.html-raw:deep(p:last-child) {
  margin-bottom: 0;
}

/* Better handling for paragraphs with few words */
.html-raw:deep(p.short-line) {
  text-align: left;
}

.html-raw:deep(strong) {
  font-family: 'Barlow Semi Condensed', sans-serif;
  color: #A67D51 !important;
  font-size: 1.2rem !important;
  font-weight: 600;
}

.html-raw:deep(span) {
  font-family: 'Barlow Semi Condensed', sans-serif;
  color: #281D02FF !important;
  font-size: 1.2rem !important;
  /* Preserve inline spacing */
  word-spacing: inherit;
  letter-spacing: inherit;
}

.html-raw:deep(em) {
  font-family: 'Barlow Semi Condensed', sans-serif;
  color: #281D02FF !important;
  font-size: 1.2rem !important;
  font-style: italic;
}

.html-raw:deep(.gospel-reference) {
  color: #A67D51;
  font-style: italic;
  font-weight: 500;
  white-space: nowrap;
}

.html-raw:deep(a) {
  text-decoration: none !important;
  color: #A67D51;
  transition: all .1s;
}

.html-raw:deep(a):hover {
  color: #ecb071;
}

/* Add better list spacing */
.html-raw:deep(ul), .html-raw:deep(ol) {
  text-align: left;
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.html-raw:deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

/* Add blockquote styling */
.html-raw:deep(blockquote) {
  border-left: 3px solid #A67D51;
  padding-left: 1rem;
  margin-left: 1rem;
  font-style: italic;
  color: #4b3621;
}

/* Media query for mobile - adjust spacing for small screens */
@media (max-width: 768px) {
  .html-raw:deep(p), .html-raw:deep(div) {
    /* Slightly tighter spacing on mobile */
    word-spacing: normal;
    letter-spacing: normal;
    line-height: 1.35;
  }
}
</style>

<script>
// Add this script to enhance text justification with JavaScript
export default {
  mounted() {
    this.$nextTick(() => {
      // Find paragraphs with few words that shouldn't be justified
      const contentArea = this.$el.querySelector('.content-area');
      if (contentArea) {
        const paragraphs = contentArea.querySelectorAll('p');
        paragraphs.forEach(p => {
          const wordCount = p.textContent.split(/\s+/).length;
          // For paragraphs with few words (less than 8), don't justify
          if (wordCount < 8) {
            p.classList.add('short-line');
          }
        });
      }
    });
  }
}
</script>