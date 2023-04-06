<template>
  <div class="row">
    <div class="col my-3 mx-auto">
      <img src="./assets/logo.png" class="logo-img clickable" alt="logo-img" @click="pushRoute('/')"/>
    </div>
  </div>
  <router-view v-slot="{ Component }">
    <transition name="scale" mode="out-in">
      <component :is="Component"/>
    </transition>
  </router-view>
</template>

<script>
export default {
  methods: {
    pushRoute(route) {
      this.$router.push(route);
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@300&family=Questrial&display=swap');

.color1 {color: #281D02FF;}
.color2 {color: #472b21;}
.color3 {color: #6e4f3a;}
.color4 {color: #A67D51;}
.color5 {color: #d3b282;}
.color6 {color: #908286;}

body {
  background-color: #281D02FF !important;
}

#app {
  font-family: 'Barlow Semi Condensed', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #d3b282;
}

.logo-img {
  width: 4rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.max-height {
  max-height: 60vh !important;
  overflow-y: scroll;
  scrollbar-width: none;
}

hr {
  border: 0;
  max-width: 70%;
  background-position: 50%;
  box-sizing: border-box;
}

.fade-hr {
  height: 0.15rem;
  color: #281D02FF;
  background-image: linear-gradient(90deg, rgba(255, 0, 0, 0), #a67d51 50%, rgba(255, 0, 0, 0) 100%);
}

.clickable {
  cursor: pointer;
  transition: all .1s;
}
.clickable:hover {
  filter: brightness(120%);
  transform: scale(0.98);
}

.clickable:focus  {
  filter: brightness(150%);
  transform: scale(0.93);
}

/* Medium devices (tablets, 768px and up)  */
@media (min-width: 768px) {
  .card-body {
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .card-body {
    max-width: 70%;
    margin-left: auto;
    margin-right: auto;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .card-body {
    max-width: 60%;
    margin-left: auto;
    margin-right: auto;
  }
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.5s ease;
}


.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
