const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
	const ProxyModel = sequelize.define("proxy", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		host: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING,
		},
		protocol: {
			allowNull: false,
			defaultValue: 'http',
			type: DataTypes.STRING
		},
		user: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		pass: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		status: {
			allowNull: false,
			defaultValue: 1,
			type: DataTypes.TINYINT
		},
		count: {
			allowNull: false,
			defaultValue: 0,
			type: DataTypes.INTEGER
		},
	});
  
	return ProxyModel;
  };
