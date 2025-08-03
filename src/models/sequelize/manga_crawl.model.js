const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
	const MangaCrawlModel = sequelize.define("story_manga_crawl", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		story_id: {
			allowNull: false,
			defaultValue: '',
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
		
		total_image: {
			allowNull: false,
			defaultValue: '',
			type: DataTypes.INTEGER
		}
	}, {
		charset: 'utf8'
	});
  
	return MangaCrawlModel;
  };
