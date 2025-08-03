const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
	const UbndhoankiemModel = sequelize.define("ubndhoankiem", {
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
		name: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		district: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		ward: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		}
	});
  
	return UbndhoankiemModel;
  };
