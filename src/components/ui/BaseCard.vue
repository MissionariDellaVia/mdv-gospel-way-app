<template>
  <div class="card mx-auto mb-5 shadow-lg">
    <div v-if="title" class="card-header">
      {{ title }}
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title']
}
</script>

<style scoped>
.card-header {
  background-color: #fff;
  border-block-color: #fff;
}

.card {
  color: #29140b;
  background-color: #E6DECA;
  width: 95%;
  -webkit-border-radius: 1.2rem;
  -moz-border-radius: 1.2rem;
  border-radius: 1.2rem;
  min-height: 75vh;
}

.card-body {
  max-width: 95%;
  margin-left: auto;
  margin-right: auto;
}

/* Small devices (landscape phones, 576px and up)
@media (min-width: 576px) { ... }

/* Medium devices (tablets, 768px and up)
@media (min-width: 768px) { ... }

/* Large devices (desktops, 992px and up)
@media (min-width: 992px) { ... }

/* Extra large devices (large desktops, 1200px and up)
@media (min-width: 1200px) { ... }*/

/* Medium devices (tablets, 768px and up)  */
@media (min-width: 768px) {
  .card {
    width: 90%;
  }
  .card-body {
    max-width: 90%;
    margin-left: auto;
    margin-right: auto;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .card-body {
    max-width: 85%;
    margin-left: auto;
    margin-right: auto;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .card {
    width: 80%;
  }
}
</style>
