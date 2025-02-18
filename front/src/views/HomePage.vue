<template>
  <div class="home">
    <h1>Suivi de colis</h1>
    <form @submit.prevent="searchPackage">
      <input
        v-model="trackingNumber"
        placeholder="Entrez le numéro de suivi"
        required
      />
      <button type="submit">Suivre</button>
    </form>
    <div v-if="trackingData">
      <h2>Détails du colis</h2>
      <p><strong>Numéro:</strong> {{ trackingData.trackingNumber }}</p>
      <p><strong>Statut:</strong> {{ trackingData.status }}</p>
      <p><strong>Localisation:</strong> {{ trackingData.location }}</p>
      <p><strong>Mise à jour:</strong> {{ trackingData.updatedAt }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
  data() {
    return {
      trackingNumber: '',
      trackingData: null
    };
  },
  methods: {
    async searchPackage() {
      try {
        const response = await axios.get('http://localhost:3000/api/track', {
          params: { trackingNumber: this.trackingNumber }
        });
        this.trackingData = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération du suivi :", error);
      }
    }
  }
};
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

input {
  padding: 10px;
  width: 70%;
  margin-right: 10px;
}

button {
  padding: 10px;
}
</style>
