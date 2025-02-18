// backend/middleware/authenticateToken.js
const jwt = require("jsonwebtoken");

// On récupère la clé secrète depuis les variables d'environnement
const secretKey = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
	// On attend que le token soit dans l'en-tête Authorization au format "Bearer <token>"
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		// Si aucun token n'est fourni, on renvoie une erreur 401
		return res.status(401).json({ error: "Token requis" });
	}

	jwt.verify(token, secretKey, (err, user) => {
		if (err) {
			// Si le token est invalide ou expiré, on renvoie une erreur 403
			return res.status(403).json({ error: "Token invalide ou expiré" });
		}
		// On attache les informations décodées (payload) à la requête
		req.user = user;
		// On passe au middleware suivant ou à la route protégée
		next();
	});
}

module.exports = authenticateToken;
