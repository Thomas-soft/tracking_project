// backend/models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("./index"); // Assure-toi que le chemin est correct

const User = sequelize.define(
	"User",
	{
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		subscription: {
			type: DataTypes.JSON,
			allowNull: true,
		},
	},
	{
		tableName: "users",
	}
);

module.exports = User;
