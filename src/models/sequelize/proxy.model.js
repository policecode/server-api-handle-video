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
		provider: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
	});
  
	return ProxyModel;
  };
