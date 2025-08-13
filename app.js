const express = require('express');
const fileUpload = require('express-fileupload');
const http = require('http');
const path = require('path');
require('dotenv').config();
global.root_path = __dirname;


// const shell = require('shelljs');
const webApp = express();
const server = http.createServer(webApp);
// const io = new (require('socket.io').Server)(server);
webApp.use(require('cors')());
webApp.use(express.json());
webApp.use(express.static(path.join(global.root_path, 'public')));
const fs = require('fs-extra');
const {
  LOGGER, configLogFolder,
} = require('./src/helpers/logger.helper.js');

const {
  spawn
} = require('child_process');
const {
  parse,
  stringify
} = require('yaml');

let logs = [];
let jobs = [];
//setup config
let _options_path = './_UDATA/options.yaml';
let _cache_path = './_UDATA/cache.json';
let options_path = './UDATA/options.yaml';
let cache_path = './UDATA/cache.json';
let _ALV_PRX_path = './_UDATA/ALV_PRX';
let ALV_PRX_path = './UDATA/ALV_PRX';

// if (!fs.pathExistsSync(global.root_path+'/UDATA/database.sqlite3')) {
//   fs.createFile(global.root_path+'/UDATA/database.sqlite3')
// }

if (!fs.pathExistsSync(_cache_path)) {
  _cache_path = './resources/_UDATA/cache.json';
}

if (!fs.pathExistsSync(_options_path)) {
  _options_path = './resources/_UDATA/options.yaml';
}

if (!fs.pathExistsSync(_ALV_PRX_path)) {
  _ALV_PRX_path = './resources/_UDATA/ALV_PRX';
}

if (!fs.pathExistsSync(cache_path)) {
  fs.copySync(_cache_path, cache_path);
}

if (!fs.pathExistsSync(options_path)) {
  fs.copySync(_options_path, options_path);
}
if (!fs.pathExistsSync(ALV_PRX_path)) {
  fs.copySync(_ALV_PRX_path, ALV_PRX_path);
}
//setup db
const db = require("./src/models/db.js");
const { sleep } = require('./src/helpers/sleep.helper.js');
const { DRIVERS } = require('./const.js');
db.sequelize.sync()
.then(() => {
  console.log("Synced db.");
})
.catch((err) => {
  console.log("Failed to sync db: " + err.message);
});

let options = parse(fs.readFileSync(options_path, 'utf-8'));

global.env = process.env.NODE_ENV;
global.good_proxies = JSON.parse(fs.readFileSync(ALV_PRX_path, 'utf-8'));
global.cache = JSON.parse(fs.readFileSync(cache_path, 'utf-8'));

global.server = server;
global.webApp = webApp;

global.options = options;
global.raw_options = options;
global.raw_videos = options.videos;
global.raw_accounts = options.accounts;

global.VERSION = fs.readFileSync('./VERSION');

global.proxy_stats = {
  untested: [],
  good: [],
  bad: []
};


global.jobs = jobs;
webApp.use(fileUpload({
  useTempFiles : true,
  tempFileDir : global.root_path+'/tmp/'
}));
webApp.get('/api', (req, res) => {
  return res.json('set up api pupperteer')
});

require('./routes/toolvideo.js');

// require('./routes/crawl.js');
// require('./routes/devprofile.js');
// require('./routes/xuatnhapcanh.js');
// require('./routes/ubndhoankiem.js');
// require('./routes/crawlManga.js');
require('./routes/proxy.js');

const PORT = process.env.PORT || 8080;
webApp.listen(PORT, () => console.log(`Serve running on port ${PORT}`));