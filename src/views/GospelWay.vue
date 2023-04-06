<template>
  <div class="container">

    <div class="row">
      <base-card class="bg-layout">
        <header class="row mt-5 mb-3">
          <div class="col-12 header-section text-center">
            <div class="d-flex justify-content-center align-items-center">
              <i class="fa-solid fa-chevron-left home-icon px-2"></i>
              <h1 class="color3"> Lunedì 3 Aprile </h1>
              <i class="fa-solid fa-chevron-right home-icon px-2"></i>
            </div>
          </div>
          <div class="col-12 header-section text-center">
            <i class="fa-regular fa-calendar-days home-icon"></i>
          </div>
        </header>

        <section class="row header-section text-center">
          <div class="col-12 ">
            <h3 class="color5 fw-bold">S. Sisto I</h3>
          </div>
          <div class="col-12">
            <h3 class="color4">Settimana Santa</h3>
          </div>
        </section>

        <section class="row my-5 g-2">
          <div class="col-md-6">
            <base-button title="Chi siamo" class="bg-1"></base-button>
          </div>
          <div class="col-md-6">
            <base-button title="Via del Vangelo" class="bg-2"></base-button>
          </div>
        </section>

        <hr class="fade-hr mx-auto">

        <section class="row">
          <p class="intro color1">
            Caro fratello o sorella <strong>benvenuto/a!</strong><br><br>
            Quest'App contiene il diario spirituale della Comunità sul Vangelo del giorno. L'abbiamo realizzata perchè potesse servire anche a te!
            Questo commento è un aiuto per meditare e costudire almeno una parola del Vangelo, perchè possa portare frutto nel cammino quotidiano alla sequela di Gesù e per vivere il carisma della comunità più intensamente!<br><br>
            Se volessi il libretto cartaceo trimestrale<br>
            (da poter sottolineare e dove poter prendere appunti)
            puoi richiederlo <strong>scrivendoci</strong>
          </p>
        </section>

      </base-card>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: false
    }
  },
  methods: {
    handleClick() {
      this.$router.push('auth');
    }
  }

}
</script>

<style scoped>
.home-icon {
  font-size: 1.5rem;
  color: #9d7a5b;
  cursor: pointer;
  transition: all .1s;
}
.home-icon:hover, .home-icon:focus {
  filter: brightness(140%);
  transform: scale(0.90);
}
.header-section {
  font-family: 'Barlow Semi Condensed', sans-serif;
}
.intro {
  line-height: 1.6;
  font-size: 1.2rem;
}
.bg-1 {
  background-color: #A67D51 !important;
  color: white;
}
.bg-2 {
  background-color: #B2A348 !important;
  color: white;
}

</style>
