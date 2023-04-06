<template>
  <button class="btn action-button rounded"> {{ title }}</button>
</template>

<script>
export default {
  props: ['title']
}
</script>


<style scoped>
.action-button {
  color: #fff;
  padding: 0.7em 1.7em;
  width: 16rem;
  border-color: transparent;
  font-size: 1.4rem;
  background-color: #908286;
  transition: all .1s;
  -webkit-box-shadow: 3px 4px 15px -5px #7E7E7E;
  box-shadow: 3px 4px 15px -5px #7E7E7E;
}

.action-button:hover {
  filter: brightness(130%);
  transform: scale(0.97);
}

.action-button:focus {
  filter: brightness(140%);
  transform: scale(0.93);
  border-color: transparent;
  color: white;
}

/* Medium devices (tablets, 768px and up)  */
@media (min-width: 768px) {
  .action-button {
    width: 14rem;
    font-size: 1.2rem;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .action-button {
    width: 16rem;
    font-size: 1.5rem;
  }
}
</style>
