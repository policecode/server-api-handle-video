const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
	const ProfileModel = sequelize.define("dev_profile", {
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
		facebook: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		password_facebook: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		full_name: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		gender: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.ENUM('male', 'female', 'unknow')
		},
		birth_day: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.DATE
		},
		phone: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		group_name: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		folder: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		}
	});
  
	return ProfileModel;
  };
