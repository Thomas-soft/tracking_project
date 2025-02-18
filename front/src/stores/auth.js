import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		token: localStorage.getItem("token") || null,
		email: localStorage.getItem("email") || null,
	}),
	actions: {
		setAuth({ token, email }) {
			this.token = token;
			this.email = email;
			localStorage.setItem("token", token);
			localStorage.setItem("email", email);
		},
		logout() {
			this.token = null;
			this.email = null;
			localStorage.removeItem("token");
			localStorage.removeItem("email");
		},
	},
});
