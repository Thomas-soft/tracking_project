<template>
    <div class="reset-password">
      <h1>Réinitialiser votre mot de passe</h1>
      <div v-if="!resetRequested">
        <form @submit.prevent="requestReset">
          <label for="email">Email :</label>
          <input type="email" v-model="email" required />
          <button type="submit">Demander la réinitialisation</button>
        </form>
      </div>
      <div v-else>
        <p>Un email de réinitialisation a été envoyé.</p>
        <p v-if="previewURL">
          Aperçu de l'email : <a :href="previewURL" target="_blank">Voir l'email</a>
        </p>
        <form @submit.prevent="resetPassword">
          <label for="token">Token :</label>
          <input type="text" v-model="token" required />
          <label for="newPassword">Nouveau mot de passe :</label>
          <input type="password" v-model="newPassword" required />
          <button type="submit">Réinitialiser le mot de passe</button>
        </form>
      </div>
      <div v-if="message">
        <p>{{ message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'ResetPasswordPage',
    data() {
      return {
        email: '',
        token: '',
        newPassword: '',
        resetRequested: false,
        previewURL: '',
        message: '',
      };
    },
    methods: {
      async requestReset() {
        try {
          const response = await axios.post('http://localhost:3000/api/reset-password-request', {
            email: this.email,
          });
          this.resetRequested = true;
          this.previewURL = response.data.previewURL;
          this.message = response.data.message;
        } catch (error) {
          console.error("Erreur lors de la demande de réinitialisation :", error);
          this.message = error.response.data.error;
        }
      },
      async resetPassword() {
        try {
          const response = await axios.post('http://localhost:3000/api/reset-password', {
            email: this.email,
            token: this.token,
            newPassword: this.newPassword,
          });
          this.message = response.data.message;
        } catch (error) {
          console.error("Erreur lors de la réinitialisation du mot de passe :", error);
          this.message = error.response.data.error;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .reset-password {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  label {
    display: block;
    margin-top: 10px;
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
  </style>
  