<template>
    <div class="subscription">
      <h1>Gestion de l'abonnement</h1>
      <div>
        <label for="subscriptionType">Type d'abonnement :</label>
        <select id="subscriptionType" v-model="subscriptionType">
          <option value="trial">Essai (48h à 0,50€)</option>
          <option value="monthly">Mensuel (29,90€)</option>
        </select>
      </div>
      <button @click="subscribe">S'abonner</button>
      <button @click="unsubscribe">Se désabonner</button>
      <div v-if="responseMessage">
        <p>{{ responseMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'SubscriptionPage',
    data() {
      return {
        subscriptionType: 'trial',
        responseMessage: '',
      };
    },
    methods: {
      async subscribe() {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            this.responseMessage = "Token non trouvé, veuillez vous connecter.";
            return;
          }
          const response = await axios.post(
            'http://localhost:3000/api/subscribe',
            { subscriptionType: this.subscriptionType },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          this.responseMessage = response.data.message;
        } catch (error) {
          console.error("Erreur lors de l'abonnement :", error);
          this.responseMessage = error.response?.data?.error || "Erreur lors de l'abonnement.";
        }
      },
      async unsubscribe() {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            this.responseMessage = "Token non trouvé, veuillez vous connecter.";
            return;
          }
          const response = await axios.post(
            'http://localhost:3000/api/unsubscribe',
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          this.responseMessage = response.data.message;
        } catch (error) {
          console.error("Erreur lors du désabonnement :", error);
          this.responseMessage = error.response?.data?.error || "Erreur lors du désabonnement.";
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .subscription {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  select {
    padding: 10px;
    margin-bottom: 1rem;
    width: 100%;
    box-sizing: border-box;
  }
  button {
    margin-right: 10px;
    padding: 10px 20px;
  }
  </style>
  