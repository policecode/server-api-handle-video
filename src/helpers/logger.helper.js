const winston = require('winston');

const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');

const { format } = winston;

const { combine } = format;

const LOG_LEVEL = 'info';
let dir = './logs';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const LOGGER = winston.createLogger({});
function configLogFolder(folderPath){
  if(!folderPath){
    folderPath = global.root_path
  }
  LOGGER.configure({
    level: LOG_LEVEL,
    format: combine(
      format.colorize({ all: false }),
      format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A'
      }),
      format.align(),
      format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    // format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({
        filename: folderPath+'/logs/bot-%DATE%.log',
        // datePattern: "YYYY-MM-DD-HH",
        auditFile: folderPath+'/logs/audit.json',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  });
}
configLogFolder()
let globalName = ""
function setLoggerGlobalName(name) {
  globalName =name;
}
function getLogger(fileName) {
  var myLogger = {
    error: function(text) {
      LOGGER.error(globalName +": "+fileName + ': ' + text)
    },
    info: function(text) {
      LOGGER.info(globalName +": "+fileName + ': ' + text)
    },
    debug: function(text) {
      LOGGER.debug(globalName +": "+fileName + ': ' + text)
    }
  }

  return myLogger
}
module.exports = { LOGGER ,configLogFolder,getLogger,setLoggerGlobalName};

