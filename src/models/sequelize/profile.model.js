const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
	const ProfileModel = sequelize.define("profile", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		email: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		password: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		note: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		proxy: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		group_name: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		isLogin: {
			allowNull: false,
			defaultValue: false,
			type: DataTypes.BOOLEAN,
		},
		isChangePassword: {
			allowNull: false,
			defaultValue: false,
			type: DataTypes.BOOLEAN,
		},
		walmart_checked: {
			allowNull: false,
			defaultValue: false,
			type: DataTypes.BOOLEAN,
		},
		driver: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING,
		},
		driver_id: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING,
		},
	});
  
	return ProfileModel;
  };
