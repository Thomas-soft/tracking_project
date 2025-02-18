<template>
    <div class="register">
      <h1>Inscription</h1>
      <form @submit.prevent="register">
        <div>
          <label for="email">Email :</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Mot de passe :</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
      <div v-if="responseMessage">
        <p>{{ responseMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'RegisterPage',
    data() {
      return {
        email: '',
        password: '',
        responseMessage: ''
      };
    },
    methods: {
      async register() {
        try {
          const response = await axios.post('http://localhost:3000/api/register', {
            email: this.email,
            password: this.password
          });
          this.responseMessage = response.data.message;
        } catch (error) {
          console.error("Erreur lors de l'inscription:", error);
          this.responseMessage = error.response.data.error;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .register {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  input {
    padding: 10px;
    width: 100%;
    margin-bottom: 10px;
  }
  button {
    padding: 10px 20px;
  }
  </style>
  