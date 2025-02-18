// backend/models/ResetToken.js
const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const ResetToken = sequelize.define(
	"ResetToken",
	{
		token: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// Référence à l'utilisateur concerné (clé étrangère)
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		// Date d'expiration du token
		expiresAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: "reset_tokens",
		timestamps: false, // Tu peux l'activer si tu souhaites enregistrer createdAt/updatedAt
	}
);

module.exports = ResetToken;
