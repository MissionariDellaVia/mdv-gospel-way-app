<template>
  <div class="hint-overlay" v-if="visible" @click="closeHint">
    <div class="hint-carousel" @click.stop>
      <!-- Animation container -->
      <div class="hint-animation-container">
        <component
            :is="currentSlide.component"
            v-bind="currentSlide.props || {}"
            :key="currentSlideIndex">
        </component>
      </div>

      <!-- Content -->
      <div class="hint-content">
        <h3>{{ currentSlide.title }}</h3>
        <p>{{ currentSlide.description }}</p>

        <!-- Install button - show when available and on install slide -->
        <div class="install-action" v-if="showInstallButton">
          <button @click="$emit('install-app')" class="install-btn">
            <i class="fa-solid fa-download"></i> Installa App
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="hint-controls">
        <!-- Progress dots -->
        <div class="hint-dots">
          <span
              v-for="(slide, index) in slides"
              :key="index"
              class="hint-dot"
              :class="{ 'active': index === currentSlideIndex }"
              @click="goToSlide(index)">
          </span>
        </div>

        <!-- Buttons -->
        <div class="hint-buttons">
          <button v-if="currentSlideIndex > 0" class="hint-btn hint-back" @click="prevSlide">
            <i class="fa-solid fa-chevron-left"></i> Indietro
          </button>

          <button v-if="currentSlideIndex < slides.length - 1" class="hint-btn hint-next" @click="nextSlide">
            Avanti <i class="fa-solid fa-chevron-right"></i>
          </button>

          <button v-else class="hint-btn hint-close" @click="closeHint">
            Ho capito
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HintCarousel',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    slides: {
      type: Array,
      required: true,
      // Each slide should have:
      // { component, props, title, description }
    },
    initialSlide: {
      type: Number,
      default: 0
    },
    installAvailable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentSlideIndex: this.initialSlide
    }
  },
  computed: {
    currentSlide() {
      if (!this.slides || this.slides.length === 0) {
        return { component: null, props: {}, title: '', description: '' };
      }
      return this.slides[this.currentSlideIndex];
    },
    // Show install button when installation is available and on appropriate slides
    showInstallButton() {
      return this.installAvailable &&
          (this.currentSlide.title.toLowerCase().includes('installa') ||
              this.currentSlide.description.toLowerCase().includes('installa'));
    }
  },
  methods: {
    nextSlide() {
      if (this.currentSlideIndex < this.slides.length - 1) {
        this.currentSlideIndex++;
      }
    },
    prevSlide() {
      if (this.currentSlideIndex > 0) {
        this.currentSlideIndex--;
      }
    },
    goToSlide(index) {
      if (index >= 0 && index < this.slides.length) {
        this.currentSlideIndex = index;
      }
    },
    closeHint() {
      this.$emit('update:visible', false);
      this.$emit('close');
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // Reset to initial slide when opening
        this.currentSlideIndex = this.initialSlide;
      }
    },
    initialSlide(newVal) {
      this.currentSlideIndex = newVal;
    }
  }
}
</script>

<style scoped>
/* Styles remain the same */
.hint-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(40, 29, 2, 0.85);
  z-index: 9000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fade-in 0.3s ease;
}

.hint-carousel {
  background-color: #58412b;
  border: 2px solid #A67D51;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  animation: scale-in 0.3s ease;
}

.hint-animation-container {
  height: 200px;
  background: #4a3521;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hint-content {
  padding: 20px;
  text-align: center;
}

.hint-content h3 {
  color: #D3B282;
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 12px;
}

.hint-content p {
  color: #e9d5b8;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

.install-action {
  margin-top: 20px;
}

.install-btn {
  background-color: #A67D51;
  color: #281D02;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  transition: all 0.2s ease;
}

.install-btn:hover {
  transform: translateY(-2px);
  background-color: #d3b282;
}

.hint-controls {
  padding: 15px 20px 20px;
}

.hint-dots {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(211, 178, 130, 0.4);
  margin: 0 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hint-dot.active {
  background-color: #D3B282;
  transform: scale(1.2);
}

.hint-buttons {
  display: flex;
  justify-content: space-between;
}

.hint-btn {
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-back {
  background-color: rgba(211, 178, 130, 0.2);
  color: #D3B282;
}

.hint-next, .hint-close {
  background-color: #A67D51;
  color: #281D02;
  font-weight: 500;
  margin-left: auto;
}

.hint-next:hover, .hint-close:hover {
  background-color: #d3b282;
  transform: translateY(-2px);
}

.hint-back:hover {
  background-color: rgba(211, 178, 130, 0.3);
  transform: translateY(-2px);
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>