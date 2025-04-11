<template>
  <div v-if="show" class="api-error-notification">
    <div class="notification-content">
      <p>{{ message }}</p>
      <button @click="retry" class="retry-button">Riprova</button>
      <button @click="close" class="close-button">Chiudi</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiErrorNotification',
  props: {
    show: Boolean,
    message: {
      type: String,
      default: "Si è verificato un errore durante il caricamento dei dati."
    }
  },
  emits: ['retry', 'close'],
  methods: {
    retry() {
      this.$emit('retry');
    },
    close() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.api-error-notification {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: #472b21;
  border: 2px solid #A67D51;
  color: #d3b282;
  padding: 15px;
  border-radius: 8px;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.notification-content {
  text-align: center;
}

.notification-content p {
  margin-bottom: 15px;
}

.retry-button, .close-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  margin: 0 5px;
  cursor: pointer;
  font-weight: bold;
}

.retry-button {
  background-color: #A67D51;
  color: #281D02FF;
}

.close-button {
  background-color: transparent;
  color: #d3b282;
  border: 1px solid #d3b282;
}
</style>