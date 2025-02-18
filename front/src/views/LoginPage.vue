<template>
  <div class="login">
    <h1>Connexion</h1>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email :</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Mot de passe :</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div>
        <label>
          <input type="checkbox" v-model="rememberMe" />
          Se souvenir de moi
        </label>
      </div>
      <button type="submit">Se connecter</button>
    </form>
    <div v-if="loginResponse">
      <p v-if="loginResponse.error" class="error">{{ loginResponse.error }}</p>
      <p v-else class="success">{{ loginResponse.message }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      loginResponse: null,
    };
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    return { authStore, router };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          email: this.email,
          password: this.password,
          rememberMe: this.rememberMe,
        });
        this.loginResponse = response.data;
        if (response.data.token) {
          this.authStore.setAuth({ token: response.data.token, email: this.email });
          this.router.push({ name: 'HomePage' });
        }
      } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        // Vérifier si error.response existe et récupérer le message d'erreur
        if (error.response && error.response.data) {
          this.loginResponse = error.response.data;
        } else {
          this.loginResponse = { error: "Une erreur est survenue" };
        }
      }
    },
  },
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
form > div {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input[type="email"],
input[type="password"] {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}
button {
  padding: 10px 20px;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>