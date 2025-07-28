<template>
  <div class="test-page">
    <h1>Test TextHighlighter</h1>
    <p>This page tests the simplified TextHighlighter functionality.</p>
    
    <TextHighlighter 
      :current-date="new Date()"
      title="Test Page"
      reference="test-page"
      text-ref="test-content"
    >
      <div class="test-content">
        <h2>Dal vangelo secondo Marco</h2>
        <p>
          Dopo che Giovanni fu arrestato, Gesù andò nella Galilea, proclamando il vangelo di Dio, e diceva: 
          <strong>«Il tempo è compiuto</strong> e il regno di Dio è vicino; convertitevi e credete nel Vangelo».
        </p>
        <p>
          Passando lungo il mare di Galilea, vide Simone e Andrea, fratello di Simone, mentre gettavano le reti 
          in mare; erano infatti pescatori. Gesù disse loro: «Venite dietro a me, vi farò diventare pescatori di 
          uomini». E subito lasciarono le reti e lo seguirono.
        </p>
        <p>
          Andando un poco oltre, vide Giacomo, figlio di Zebedeo, e Giovanni suo fratello, mentre anch'essi 
          nella barca riparavano le reti. E subito li chiamò. Ed essi lasciarono il loro padre Zebedeo nella barca 
          con i garzoni e andarono dietro a lui.
        </p>
        
        <h3>Commento al Vangelo</h3>
        <p>
          Gesù inizia la sua missione pubblica con un annuncio chiaro e diretto: il regno di Dio è vicino. Questo 
          non è solo un messaggio di speranza, ma una chiamata all'azione.
        </p>
        <p>
          La conversione che Gesù richiede non è solo un cambiamento morale, ma una trasformazione del cuore 
          che ci apre alla nuova realtà del regno di Dio. È un invito a vedere il mondo con gli occhi di Dio.
        </p>
        <p>
          La chiamata dei primi discepoli ci mostra come rispondere a Gesù: con prontezza e generosità, 
          lasciando tutto per seguirlo. La loro risposta immediata è un esempio per tutti noi.
        </p>
      </div>
    </TextHighlighter>
    
    <div class="navigation">
      <router-link to="/" class="back-button">← Torna alla home</router-link>
    </div>
  </div>
</template>

<script>
import TextHighlighter from '@/components/text/TextHighlighter.vue';

export default {
  name: 'TestTextHighlighter',
  components: {
    TextHighlighter
  }
};
</script>

<style scoped>
.test-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-content {
  line-height: 1.6;
  font-size: 16px;
}

.test-content h2 {
  color: #6e4f3a;
  margin-bottom: 20px;
}

.test-content h3 {
  color: #6e4f3a;
  margin-top: 30px;
  margin-bottom: 15px;
}

.test-content p {
  margin-bottom: 15px;
  text-align: justify;
}

.navigation {
  margin-top: 40px;
  text-align: center;
}

.back-button {
  color: #6e4f3a;
  text-decoration: none;
  padding: 10px 20px;
  border: 1px solid #6e4f3a;
  border-radius: 5px;
  transition: all 0.3s;
}

.back-button:hover {
  background-color: #6e4f3a;
  color: white;
}
</style>