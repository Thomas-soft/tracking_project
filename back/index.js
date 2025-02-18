require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("./models"); // Instance Sequelize
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.JWT_SECRET;
const refreshSecretKey = process.env.REFRESH_JWT_SECRET;
// Importer notre middleware d'authentification
const authenticateToken = require("./middleware/authenticateToken");
const ResetToken = require("./models/ResetToken");

app.use(
	cors({
		// configurez cors selon vos besoins, notamment l'option credentials: true si vous utilisez des cookies
		credentials: true,
		origin: "http://localhost:8080", // ou votre domaine en production
	})
);
app.use(express.json());
app.use(cookieParser());

// Connexion à la base de données et synchronisation des modèles
sequelize
	.authenticate()
	.then(() => {
		console.log("Connexion à la base de données réussie");
		return sequelize.sync(); // Cela synchronisera tous les modèles (User, ResetToken, etc.)
	})
	.then(() => {
		console.log("Les modèles ont été synchronisés");
	})
	.catch((err) => {
		console.error("Erreur de connexion à la base de données", err);
	});

app.get("/", (req, res) => {
	res.send("Backend is running");
});

// Exemple d'endpoint pour interroger Ship24
app.get("/api/ship24/track", async (req, res) => {
	const trackingNumber = req.query.trackingNumber;
	if (!trackingNumber) {
		return res.status(400).json({ error: "Numéro de suivi requis" });
	}

	try {
		const response = await axios.get(
			`https://api.ship24.com/public/v1/trackers/search/{trackingNumber}/results/`,
			{
				headers: {
					Authorization: `Bearer ${process.env.SHIP24_API_TOKEN}`,
				},
			}
		);
		res.json(response.data);
	} catch (error) {
		console.error("Erreur lors de l'appel à Ship24:", error.message);
		res.status(500).json({
			error: `Erreur lors de l'interrogation de l'API Ship24.${error.message}`,
		});
	}
});

// Endpoint pour simuler le suivi d'un colis
app.get("/api/track", (req, res) => {
	const { trackingNumber } = req.query;
	if (!trackingNumber) {
		return res.status(400).json({ error: "Le numéro de suivi est requis" });
	}
	// Données fictives pour le suivi
	const dummyData = {
		trackingNumber,
		status: "En transit",
		location: "Paris, France",
		updatedAt: new Date(),
	};
	res.json(dummyData);
});

// Endpoint pour simuler un paiement
app.post("/api/payment", (req, res) => {
	const { email, amount } = req.body;
	if (!email || !amount) {
		return res.status(400).json({ error: "Email et montant sont requis" });
	}
	// Simulation d'un traitement de paiement (attente de 1 seconde)
	setTimeout(() => {
		res.json({ success: true, message: "Paiement effectué avec succès" });
	}, 1000);
});

// Stockage en mémoire de l'historique des recherches par email
const userHistories = {};

// Endpoint pour enregistrer un historique de suivi
app.post("/api/history", (req, res) => {
	const { email, trackingData } = req.body;
	if (!email || !trackingData) {
		return res
			.status(400)
			.json({ error: "Email et données de suivi sont requis" });
	}
	if (!userHistories[email]) {
		userHistories[email] = [];
	}
	userHistories[email].push(trackingData);
	res.json({ success: true, message: "Historique sauvegardé" });
});

// Endpoint pour récupérer l'historique d'un utilisateur
app.get("/api/history", (req, res) => {
	const { email } = req.query;
	if (!email) {
		return res
			.status(400)
			.json({ error: "Email requis pour récupérer l'historique" });
	}
	const history = userHistories[email] || [];
	res.json(history);
});

// Endpoint pour simuler l'envoi d'un email de notification via nodemailer
app.post("/api/notify", async (req, res) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({ error: "L'email est requis" });
	}
	try {
		// Création d'un compte test sur Ethereal
		let testAccount = await nodemailer.createTestAccount();

		// Création du transporteur SMTP avec les infos d'Ethereal
		let transporter = nodemailer.createTransport({
			host: testAccount.smtp.host,
			port: testAccount.smtp.port,
			secure: testAccount.smtp.secure, // true pour 465, false pour les autres ports
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});

		// Envoi de l'email
		let info = await transporter.sendMail({
			from: '"Package Tracker" <no-reply@example.com>',
			to: email,
			subject: "Bienvenue sur Package Tracker",
			text: "Merci de vous être inscrit sur Package Tracker !",
			html: "<b>Merci de vous être inscrit sur Package Tracker !</b>",
		});

		res.json({
			success: true,
			message: "Email envoyé avec succès",
			previewURL: nodemailer.getTestMessageUrl(info), // Lien pour voir l'email sur Ethereal
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
	}
});

// Stockage en mémoire des utilisateurs
const users = {};
// Endpoint pour l'inscription
app.post("/api/register", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: "Email et mot de passe requis" });
	}
	try {
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) {
			return res.status(400).json({ error: "Utilisateur déjà existant" });
		}
		// Hash du mot de passe avant stockage
		const hashedPassword = await bcrypt.hash(password, 10);
		await User.create({ email, password: hashedPassword });
		res.json({
			success: true,
			message: "Utilisateur enregistré avec succès",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur lors de l'enregistrement" });
	}
});

app.post("/api/refresh", (req, res) => {
	// Le refresh token est dans le cookie httpOnly
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) {
		return res.status(401).json({ error: "Refresh token non fourni" });
	}
	try {
		const payload = jwt.verify(refreshToken, refreshSecretKey);
		// Générer un nouveau token d'accès
		const newAccessToken = jwt.sign(
			{ email: payload.email, id: payload.id },
			secretKey,
			{ expiresIn: "15m" }
		);
		res.json({ token: newAccessToken });
	} catch (error) {
		console.error("Erreur lors du rafraîchissement du token :", error);
		return res
			.status(403)
			.json({ error: "Refresh token invalide ou expiré" });
	}
});

// Endpoint pour la connexion
app.post("/api/login", async (req, res) => {
	const { email, password, rememberMe } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: "Email et mot de passe requis" });
	}
	try {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res
				.status(401)
				.json({ error: "Email ou mot de passe incorrect" });
		}
		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			return res
				.status(401)
				.json({ error: "Email ou mot de passe incorrect" });
		}
		// Définir l'expiration du token d'accès courte (15 minutes)
		const accessToken = jwt.sign(
			{ email: user.email, id: user.id },
			secretKey,
			{ expiresIn: "15m" }
		);
		// Générer un refresh token avec une durée plus longue (7 jours)
		const refreshToken = jwt.sign(
			{ email: user.email, id: user.id },
			refreshSecretKey,
			{ expiresIn: "7d" }
		);
		// Optionnel : sauvegarder le refresh token en base pour le révoquer si besoin

		// Stocker le refresh token dans un cookie httpOnly
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // true en production avec HTTPS
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
		});
		res.json({
			success: true,
			message: "Connexion réussie",
			token: accessToken,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur lors de la connexion" });
	}
});

// Endpoint pour s'abonner
app.post("/api/subscribe", authenticateToken, (req, res) => {
	const { subscriptionType } = req.body; // "trial" ou "monthly"
	const email = req.user.email;
	if (!users[email]) {
		return res.status(404).json({ error: "Utilisateur non trouvé" });
	}
	// Simulation d'un paiement et activation de l'abonnement
	users[email].subscription = {
		active: true,
		type: subscriptionType || "trial",
		subscribedAt: new Date(),
	};
	res.json({
		success: true,
		message: "Abonnement activé",
		subscription: users[email].subscription,
	});
});

// Endpoint pour se désabonner
app.post("/api/unsubscribe", authenticateToken, (req, res) => {
	const email = req.user.email;
	if (!users[email]) {
		return res.status(404).json({ error: "Utilisateur non trouvé" });
	}
	if (!users[email].subscription || !users[email].subscription.active) {
		return res.status(400).json({ error: "Aucun abonnement actif trouvé" });
	}
	users[email].subscription.active = false;
	res.json({ success: true, message: "Désabonnement effectué" });
});

// Endpoint pour demander une réinitialisation de mot de passe
app.post("/api/reset-password-request", async (req, res) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({ error: "Email requis" });
	}
	// Vérifier que l'utilisateur existe
	const user = await User.findOne({ where: { email } });
	if (!user) {
		return res.status(404).json({ error: "Utilisateur non trouvé" });
	}
	// Générer un token de réinitialisation simple
	const token = Math.random().toString(36).substring(2, 15);
	// Définir une date d'expiration (par exemple, 1 heure à partir de maintenant)
	const expiresAt = new Date(Date.now() + 3600000);

	try {
		// Créer ou mettre à jour le token dans la base
		await ResetToken.upsert({
			userId: user.id,
			token,
			expiresAt,
		});

		// Utiliser Ethereal Email pour simuler l'envoi d'email
		let testAccount = await nodemailer.createTestAccount();
		let transporter = nodemailer.createTransport({
			host: testAccount.smtp.host,
			port: testAccount.smtp.port,
			secure: testAccount.smtp.secure,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});
		let info = await transporter.sendMail({
			from: '"Package Tracker" <no-reply@example.com>',
			to: email,
			subject: "Réinitialisation de votre mot de passe",
			text: `Votre token de réinitialisation est: ${token}`,
			html: `<p>Votre token de réinitialisation est: <b>${token}</b></p>`,
		});
		res.json({
			success: true,
			message: "Email de réinitialisation envoyé",
			previewURL: nodemailer.getTestMessageUrl(info),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
	}
});

// Endpoint pour réinitialiser le mot de passe avec le token
app.post("/api/reset-password", async (req, res) => {
	const { email, token, newPassword } = req.body;
	if (!email || !token || !newPassword) {
		return res
			.status(400)
			.json({ error: "Email, token et nouveau mot de passe requis" });
	}
	// Vérifier que l'utilisateur existe
	const user = await User.findOne({ where: { email } });
	if (!user) {
		return res.status(404).json({ error: "Utilisateur non trouvé" });
	}
	try {
		// Rechercher le token correspondant dans la base
		const resetEntry = await ResetToken.findOne({
			where: { userId: user.id, token },
		});
		if (!resetEntry) {
			return res.status(400).json({ error: "Token invalide" });
		}
		// Vérifier si le token est expiré
		if (new Date() > resetEntry.expiresAt) {
			return res.status(400).json({ error: "Token expiré" });
		}
		// Hasher le nouveau mot de passe
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();
		// Supprimer le token après réinitialisation
		await ResetToken.destroy({ where: { userId: user.id, token } });
		res.json({
			success: true,
			message: "Mot de passe réinitialisé avec succès",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: "Erreur lors de la réinitialisation du mot de passe",
		});
	}
});

// Exemple d'endpoint protégé
app.get("/api/protected", authenticateToken, (req, res) => {
	res.json({ message: "Accès autorisé à la route protégée", user: req.user });
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
