import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import PaymentPage from "@/views/PaymentPage.vue";
import PersonalSpacePage from "@/views/PersonalSpacePage.vue";
import LoginPage from "@/views/LoginPage.vue";
import SubscriptionPage from "@/views/SubscriptionPage.vue";
import ResetPasswordPage from "@/views/ResetPasswordPage.vue";
import RegisterPage from "@/views/RegisterPage.vue";

const routes = [
	{ path: "/", name: "HomePage", component: HomePage },
	{ path: "/payment", name: "PaymentPage", component: PaymentPage },
	{
		path: "/personal-space",
		name: "PersonalSpacePage",
		component: PersonalSpacePage,
		meta: { requiresAuth: true },
	},
	{ path: "/login", name: "LoginPage", component: LoginPage },
	{
		path: "/subscription",
		name: "SubscriptionPage",
		component: SubscriptionPage,
		meta: { requiresAuth: true },
	},
	{
		path: "/reset-password",
		name: "ResetPasswordPage",
		component: ResetPasswordPage,
	},
	{ path: "/register", name: "RegisterPage", component: RegisterPage },
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

// Garde globale pour les routes nécessitant une authentification
router.beforeEach((to, from, next) => {
	const token = localStorage.getItem("token");
	if (to.meta.requiresAuth && !token) {
		next({ name: "LoginPage" });
	} else {
		next();
	}
});

export default router;
