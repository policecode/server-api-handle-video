
class Profile{
  setWorkerCachePath(worker, index = '0') {
    let cacheFolderName = '';
    if (!worker.job.login) {
      cacheFolderName = index;
    } else {
      cacheFolderName = '';
    }
    let cachePath = __dirname + `/../UDATA/cache/${worker.job?.account?.email}_${cacheFolderName}`;
    if (options.cachePath) {
      if (worker.job?.account?.email && allPreviousCache[worker.job?.account?.email]) {
        cachePath = options.cachePath + `/cache/${allPreviousCache[worker.job?.account?.email]}`;
        configLogFolder(options.cachePath);
      } else {
        cachePath = options.cachePath + `/cache/${worker.job?.account?.email}_${cacheFolderName}`;
        configLogFolder(options.cachePath);
      }
    }
  
    worker.cachePath = cachePath;
    return cachePath;
  }
}

module.exports = { Profile };