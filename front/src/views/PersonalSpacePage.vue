<template>
  <div class="personal-space">
    <h1>Espace Personnel</h1>
    <form @submit.prevent="fetchHistory">
      <label for="email">Entrez votre email pour voir votre historique :</label>
      <input type="email" id="email" v-model="email" required />
      <button type="submit">Afficher l'historique</button>
    </form>
    <div v-if="history && history.length">
      <h2>Historique de suivi</h2>
      <ul>
        <li v-for="(item, index) in history" :key="index">
          <strong>Numéro :</strong> {{ item.trackingNumber }} -
          <strong>Statut :</strong> {{ item.status }} -
          <strong>Localisation :</strong> {{ item.location }} -
          <strong>Mise à jour :</strong> {{ item.updatedAt }}
        </li>
      </ul>
    </div>
    <div v-else-if="history && history.length === 0">
      <p>Aucun historique trouvé pour cet email.</p>
    </div>

    <!-- Section pour tester l'envoi d'un email de notification -->
    <div class="notification-test">
      <h2>Envoyer un email de test</h2>
      <button @click="sendTestEmail">Envoyer l'email</button>
      <div v-if="notificationResponse">
        <p>{{ notificationResponse.message }}</p>
        <p v-if="notificationResponse.previewURL">
          Voir l'aperçu de l'email : 
          <a :href="notificationResponse.previewURL" target="_blank">Aperçu</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PersonalSpace',
  data() {
    return {
      email: '',
      history: null,
      notificationResponse: null
    };
  },
  methods: {
    async fetchHistory() {
      try {
        const response = await axios.get('http://localhost:3000/api/history', {
          params: { email: this.email }
        });
        this.history = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique :", error);
      }
    },
    async sendTestEmail() {
      try {
        const response = await axios.post('http://localhost:3000/api/notify', {
          email: this.email
        });
        this.notificationResponse = response.data;
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de test :", error);
      }
    }
  }
};
</script>

<style scoped>
.personal-space {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
form {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 10px;
}
button {
  padding: 10px 20px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 10px;
  background-color: #f7f7f7;
  padding: 10px;
  border-radius: 4px;
}
.notification-test {
  margin-top: 40px;
}
.notification-test button {
  margin-bottom: 10px;
}
</style>
