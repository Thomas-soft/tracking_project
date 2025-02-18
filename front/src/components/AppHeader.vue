<template>
  <header>
    <nav>
      <router-link to="/">Accueil</router-link>
      <router-link to="/payment">Paiement</router-link>
      <router-link to="/personal-space">Espace personnel</router-link>
      <router-link to="/subscription">Abonnement</router-link>
      <router-link to="/reset-password">Réinitialiser mot de passe</router-link>
      <router-link v-if="!authStore.token" to="/login">Connexion</router-link>
      <button v-if="authStore.token" @click="logout">Déconnexion</button>
    </nav>
  </header>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'AppHeader',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const logout = () => {
      authStore.logout();
      router.push({ name: 'HomePage' });
    };
    return { authStore, logout };
  }
};
</script>

<style scoped>
header {
  background-color: #f5f5f5;
  padding: 1rem;
}
nav {
  display: flex;
  align-items: center;
}
nav a {
  margin-right: 1rem;
  text-decoration: none;
  color: #333;
}
button {
  padding: 6px 12px;
  border: none;
  background-color: #e74c3c;
  color: white;
  cursor: pointer;
}
</style>