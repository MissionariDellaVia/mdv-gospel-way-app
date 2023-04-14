<template>
  <teleport to="#app">
    <div v-if="show" @click="tryClose" class="backdrop"></div>
    <transition name="dialog">
      <dialog open v-if="show">
        <header>
          <i class="float-end fa-solid fa-xmark clickable" @click="tryClose"></i>
          <slot name="header">
            <h3 class="pt-4 text-center">{{ title }}</h3>
            <h5 v-show="subtitle" class="pt-1 text-center">{{ subtitle }}</h5>
          </slot>
        </header>
        <section class="container mb-5 text-center">
          <slot></slot>
        </section>
      </dialog>
    </transition>
  </teleport>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    subtitle: {
      type: String,
      required: false,
    },
  },
  emits: ['close'],
  methods: {
    tryClose() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 10;
}

dialog {
  position: fixed;
  top: 8vh;
  left: 4%;
  width: 90%;
  max-height: 50rem;
  z-index: 100;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 0;
  margin: 0;
  overflow-y: scroll;
  background-color: #e5eadf;
  color: #6e4f3a;
  -webkit-border-radius: 1.563rem;
  -moz-border-radius: 1.563rem;
  border-radius: 1.563rem;
}

header {
  padding: 1rem;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-weight: 800;
}

section {
  padding: 1rem;
  font-size: 0.80rem;
}

.container.dialog {
  height: 50rem !important;
}

menu {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  margin: 0;
}

.fa-xmark{
  font-size: 1.7rem;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.dialog-enter-active {
  transition: all 0.3s ease-out;
}

.dialog-leave-active {
  transition: all 0.3s ease-in;
}

.dialog-enter-to,
.dialog-leave-from {
  opacity: 1;
  transform: scale(1);
}

@media (min-width: 768px) {
  dialog {
    left: calc(50% - 20rem);
    width: 40rem;
  }
}
</style>
