const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
	const MangaModel = sequelize.define("story_manga", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		title: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING,
		},
		folder: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING(500),
		},
		current: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.STRING
		},
		link: {
			allowNull: true,
			defaultValue: '',
			type: DataTypes.STRING
		},
		chaper_last_folder: {
			allowNull: true,
			defaultValue: '',
			type: DataTypes.INTEGER
		},
		chaper_last_link: {
			allowNull: true,
			defaultValue: '',
			type: DataTypes.STRING
		},
		status: {
			allowNull: false,
			defaultValue: 1,
			type: DataTypes.TINYINT
		},
	}, {
		charset: 'utf8'
	});
  
	return MangaModel;
  };
