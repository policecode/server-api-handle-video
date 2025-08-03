const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
	const ProcessModel = sequelize.define("proxy", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		type: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING,
		},
		status: {
			allowNull: false,
			defaultValue: 0,
			type: DataTypes.NUMBER
		},
		notes: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
	});
  
	return ProcessModel;
  };
