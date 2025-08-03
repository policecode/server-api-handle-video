const {
  basename
} = require('path');
const {
  readdirSync,
  renameSync,
  existsSync
} = require('fs-extra');
const { getLogger } = require('./helpers/logger.helper');
const LOGGER = getLogger('Fix browser cache folder');

function getAllPreviousCache (options) {
  // if (options?.fixedNameCacheFolderAccount) return;
  let cachePath = __dirname + `/../UDATA/cache`;
  if (options.cachePath) {
    cachePath = options.cachePath + `/cache`;
  }
  let allAccountCachePath = {}
  if(!existsSync(cachePath)){
    return allAccountCachePath;
  }
  try {
    for (const oldFile of readdirSync(cachePath)) {
      let name = basename(oldFile);
      if (name.includes('@')) {
        name = name.substring(0, name.lastIndexOf('_')).toString();
        allAccountCachePath[name]= oldFile
        // try {
        //   renameSync(join(cachePath, oldFile), join(cachePath, newName + '_'));
        // } catch (e) {
        //   LOGGER.error('Rename file err' + e);
        // }
      }
    }
  }catch (e) {
    LOGGER.error(e.stack)
  }

  // options.fixedNameCacheFolderAccount = true;
  return allAccountCachePath
}

module.exports = { getAllPreviousCache };
