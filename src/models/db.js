const Sequelize = require("sequelize");
const sequelize = new Sequelize('database', 'user','password', {
  host: 'localhost',
  dialect: 'sqlite',
  operatorsAliases: 0,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  storage: global.root_path+'/UDATA/database.sqlite3'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.StoryModel = require("./sequelize/stories.model.js")(sequelize, Sequelize);
// db.DevProfileModel = require("./sequelize/devprofile.model.js")(sequelize, Sequelize);
// db.UbndhoankiemModel = require("./sequelize/ubndhoankiem.model copy.js")(sequelize, Sequelize);
// db.MangaModel = require("./sequelize/manga.model.js")(sequelize, Sequelize);
// db.MangaCrawlModel = require("./sequelize/manga_crawl.model.js")(sequelize, Sequelize);

module.exports = db;
