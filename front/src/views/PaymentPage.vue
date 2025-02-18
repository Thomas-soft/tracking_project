<template>
  <div class="payment">
    <h1>Page de Paiement</h1>
    <form @submit.prevent="processPayment">
      <div>
        <label for="email">Email :</label>
        <input type="email" v-model="email" id="email" required />
      </div>
      <div>
        <label for="amount">Montant (€) :</label>
        <input type="number" v-model.number="amount" id="amount" required step="0.01" />
      </div>
      <button type="submit">Payer</button>
    </form>
    <div v-if="paymentResponse">
      <h2>Réponse du Paiement</h2>
      <p>{{ paymentResponse.message }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaymentPage',
  data() {
    return {
      email: '',
      amount: 0.50, // Valeur par défaut (essai à 0.50€)
      paymentResponse: null
    };
  },
  methods: {
    async processPayment() {
      try {
        const response = await axios.post('http://localhost:3000/api/payment', {
          email: this.email,
          amount: this.amount
        });
        this.paymentResponse = response.data;
      } catch (error) {
        console.error("Erreur lors du paiement :", error);
      }
    }
  }
};
</script>

<style scoped>
.payment {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
form div {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}
button {
  padding: 10px 20px;
}
</style>
