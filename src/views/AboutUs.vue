<template>
  <base-card>
    <header>
      <h1 class="color3 mt-5 text-center"> I Missionari e Missionarie della Via</h1>
      <h3 class="color5 fw-bold">Breve storia della comunità</h3>
      <p class="mt-5"> Questa piccola fraternità è nata dal cuore di Dio e della libera risposta di tre giovani:</p>
      <img src="../assets/chi-siamo.jpg" class="img-fluid" alt="">
    </header>
    <section class="my-4 text-start">
      <p>
        La storia della comunità è partita dal cuore di Dio e dalla libera risposta di tre giovani provenienti da
        diverse parti d’Italia, che sentendo di consacrarsi a Dio, si ritrovarono a vivere una missione comune: fra
        Faustino, fra Umile e suor Chiara. Con l’entusiasmo e la semplicità di voler vivere il Vangelo, si imbattono in
        una prima esperienza di vita evangelica, sentendo che lo Spirito Santo faceva crescere in loro un forte
        desiderio di missionarietà contemplativa, un grande amore per la Verità e per una radicale povertà. Dopo essersi
        confrontati con l’allora Vescovo di Lamezia Terme, che seguiva questo loro desiderio, mons. Luigi A. Cantafora,
        offrirono un pellegrinaggio per comprendere meglio la loro vocazione, percorrendo a piedi e senza nulla – come i
        primi discepoli del Signore – vari santuari mariani dell’Europa. Ivi, per grazia di Dio, sentirono forte nel
        cuore il richiamo missionario a donare la loro vita per testimoniare che Dio si è proclamato Verità, proprio
        quella verità che il cuore dell’uomo cerca incessantemente: la verità dell’Amore. Iniziarono così, in una Chiesa
        semi-abbandonata e in un terreno deserto alla periferia di Lamezia Terme, a vivere una vita semplice, avendo
        come unica regola il Vangelo, mettendosi sotto la protezione della Madonna della Via fiore del Carmelo e di San
        Giuseppe suo sposo, patroni e protettori della loro vita di missionari poveri e itineranti. Il percorso
        intrapreso proseguì non solo con la loro consacrazione religiosa e il loro semplice abito religioso color della
        terra (per ricordare l’umiltà di Dio che spogliò sé stesso prendendo la nostra natura umana), ma ricevettero
        anche l’approvazione da parte della Chiesa; inoltre i due fratelli divennero sacerdoti.
      </p>
      <p>
        Da qui sono nate due piccole fraternità, quella dei frati e quella delle suore, divenute un Istituto religioso
        che, ispirandosi alla vita della prima comunità cristiana (quelli della Via – cfr At 9,2) vivono la grazia della
        consacrazione religiosa come missionari apostolici, evangelizzatori poveri e itineranti e condividono dei
        momenti di preghiera e di missione. Gli Istituti non sono misti ma cooperano nell’apostolato. Con una vita
        all’insegna della semplicità, senza circolo di denaro e totalmente dedita alla Provvidenza, i fratelli e le
        sorelle, uniti dalla preghiera, fonte di ogni azione, seguono il Signore in questo stile di vita: operosi nel
        lavorare i frutti della terra che il Signore ha donato, dediti ad una formazione seria e fondata, amanti della
        Verità da testimoniare, andando incontro a tutti, specialmente agli ultimi.
      </p>
    </section>
    <section class="my-4">
      <h3 class="color5 fw-bold my-5">Contatti</h3>

      <h4 class="mt-5 color4"> I nostri siti </h4>
      <div class="row">
        <div v-for="(link, index) in links" :key="index" class="col-md-6 hoverable">
          <p class="text-center">{{ link.name }}</p>
          <a target="_blank" :href=link.ref>
            <img class="img-fluid img-link" :src=helper.getImgUrl(link.img) :alt="link.ref"/>
          </a>
        </div>
      </div>

      <h4 class="mt-5 color4"> Email Frati </h4>
      <a href="mailto:missionaridellavia.lamezia@gmail.com">missionaridellavia.lamezia@gmail.com</a><br>
      <a href="mailto:missionaridellavia.napoli@gmail.com">missionaridellavia.napoli@gmail.com</a><br>
      <a href="mailto:missionaridellavia.vibo@gmail.com">missionaridellavia.vibo@gmail.com</a>

      <h4 class="mt-5 color4"> Email Suore </h4>
      <a href="mailto:missionariedellavia.lamezia@gmail.com">missionaridellavia.lamezia@gmail.com</a><br>
      <a href="mailto:missionariedellavia.napoli@gmail.com">missionaridellavia.napoli@gmail.com</a><br>

      <div class="row my-5 text-center">
        <ul class="list-inline social-network social-circle">
          <li><a target="_blank" rel="noopener noreferrer"
                 href="https://www.facebook.com/people/Missionari-e-Missionarie-della-Via/100068706078801/"
                 class="icoFacebook " title="Facebook"><i class="fa fa-facebook fa-xl"></i></a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/missionaridellavia/"
                 class="icoInstagram " title="Instagram"><i class="fa-brands fa-instagram fa-xl"></i></a></li>
          <li><a target="_blank" rel="noopener noreferrer"
                 href="https://www.youtube.com/channel/UCI-KljGpZAOQlazH5vuRlfA" class="icoYoutube " title="Youtube"><i
              class="fa-brands fa-youtube fa-xl"></i></a></li>
        </ul>
      </div>
    </section>
  </base-card>
</template>

<script>
export default {
  data() {
    return {
      helper: this.$util,
      isLoading: false,
      page: null,
      links: [
        {name: "Missionari della via", ref: "http://www.missionaridellavia.net/", img: "footer-missionari.jpg"},
        {name: "Vocazione", ref: "https://www.vocazione.altervista.org/#/", img: "footer-vocazione.jpg"},
        {name: "Comunità", ref: "https://www.cristianidistrada.net/", img: "footer-comunita.jpg"},
        {name: "Blog", ref: "https://blogdeipiccolidellavia.blogspot.com/", img: "footer-blog.jpg"}
      ],
      breakpoints: {
        // 700px and up
        400: {
          itemsToShow: 2.8,
        },
      }
    }
  },
  methods: {
    async loadPage() {
      this.isLoading = true
      const response = await fetch(
          `${process.env.VUE_APP_MDV_BASE_URL}/app/page/get_pages/who_consecrateds_are/1/1`
      );
      const responseData = await response.json();
      if (!response.ok) {
        console.log("Errore nella richiesta");
      }
      this.isLoading = false
      this.page = responseData[0].property.split('|')[1].replace(/style=".*"/gm, '')
      this.page = this.page.replace(
          /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
          '<a href="mailto:$1">$1</a>'
      );
    }
  }

}
</script>

<style scoped>
p {
  color: #281D02FF;
  font-size: 1.2rem;
  line-height: 1.3;
}

a {
  text-decoration: none !important;
  font-size: 1.2rem;
  color: #908286;
  transition: all .1s;
}

a:hover {
  color: #b28555;
}

.img-link {
  max-width: 19rem;
}

.hoverable {
  transition-duration: 0.2s;
  transform: scale(0.9);
}

.hoverable:hover {
  transform: scale(1);
  filter: brightness(140%);
  color: #c3ac7d;
}

ul.social-network {
  list-style: none;
  display: inline;
  margin-left: 0 !important;
  padding: 0;
}

ul.social-network li {
  display: inline;
  margin: 0 5px;
}

.social-network a.icoFacebook:hover {
  background-color: #3B5998;
}

.social-network a.icoInstagram:hover {
  background-color: #b83dbd;
}

.social-network a.icoYoutube:hover {
  background-color: #ff0000;
}

.social-network a.icoFacebook:hover i,
.social-network a.icoInstagram:hover i,
.social-network a.icoYoutube:hover i {
  color: #fff;
}

.social-network a.socialIcon:hover,
.socialHoverClass {
  color: #44BCDD;
}

.social-circle li a {
  display: inline-block;
  position: relative;
  margin: 0 auto 0 auto;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  border-radius: 50%;
  text-align: center;
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.2rem;
}

.social-circle li i {
  margin: 0;
  line-height: 3.5rem;
  color: #fff;
  text-align: center;
}

.social-circle li a:hover i,
.triggeredHover {
  -moz-transform: rotate(360deg);
  -webkit-transform: rotate(360deg);
  -ms--transform: rotate(360deg);
  transform: rotate(360deg);
  -webkit-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -o-transition: all 0.2s;
  -ms-transition: all 0.2s;
  transition: all 0.2s;
}

.social-circle i {
  color: #595959;
  -webkit-transition: all 0.8s;
  -moz-transition: all 0.8s;
  -o-transition: all 0.8s;
  -ms-transition: all 0.8s;
  transition: all 0.8s;
}

.social-network a {
  background-color: #c3ac7d;
  transition: all 0.8s;
}

/* Medium devices (tablets, 768px and up)  */
@media (min-width: 768px) {
  .html-raw:deep(img) {
    width: 25rem !important;
  }
}

@media only screen and (max-width: 480px) {
  img {
    max-width: 20rem;
    padding: 0 !important;
    margin-bottom: 1rem;
  }

  .card-header {
    text-align: center;
  }
}

</style>
