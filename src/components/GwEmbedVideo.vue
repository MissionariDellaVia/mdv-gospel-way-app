<template>
    <section >
      <div class="row my-3">
        <div class="col-12 font-section text-center html-raw">
          <h4 v-show="title" class="mb-4 color4 fw-bold"> {{ title }}</h4>
        </div>
      </div>
      <div class="rwd-video mb-5">
        <iframe :src="'//www.youtube.com/embed/'+videoId"
                allowfullscreen=""
                height="300"
                width="300">
        </iframe>
      </div>
      <h5 v-show="related && related.length > 0" class="mb-4 color4 fw-bold"> Altri video </h5>
      <div v-for="(v,index) in related" v-bind:key="index"  class="rwd-video mb-4">
        <iframe :src="'//www.youtube.com/embed/'+getYoutubeId(v)"
                allowfullscreen=""
                height="300"
                width="300">
        </iframe>
      </div>

      <hr v-show="showDivider" class="fade-hr my-5 mx-auto">

    </section>
</template>

<script setup>
import {computed, defineProps} from 'vue'

const props = defineProps({
  title: String,
  url: String,
  related: Array,
  showDivider: Boolean
})

function getYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url?.match(regExp);

  return (match && match[2].length === 11)
      ? match[2]
      : null;
}

const videoId = computed( () => {
  let id = getYoutubeId(props.url);
  console.log(id)
  return getYoutubeId(props.url);
})
</script>

<style scoped>

.rwd-video {
  height: 0;
  overflow: hidden;
  padding-bottom: 15rem;
  /*padding-top: 30px;*/
  position: relative;
}
.rwd-video iframe,
.rwd-video object,
.rwd-video embed {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

</style>
