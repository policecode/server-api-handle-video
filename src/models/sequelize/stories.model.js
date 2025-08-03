const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
	const StoryModel = sequelize.define("stories", {
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
		status: {
			allowNull: true,
			defaultValue: '',
			type: DataTypes.STRING
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
		chaper_skip: {
			allowNull: true,
			defaultValue: '',
			type: DataTypes.TEXT
		}
	}, {
		charset: 'utf8'
	});
  
	return StoryModel;
  };
