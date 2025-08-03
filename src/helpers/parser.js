function videoParser(videoConfig) {
  let whiteListVideoId = videoConfig.whiteListVideoId;
  if (!whiteListVideoId) whiteListVideoId = '';
  whiteListVideoId = whiteListVideoId.split('\n').map(s => s.trim());
  videoConfig.whiteListVideoId = whiteListVideoId;
  videoConfig.whiteListVideoIdSet = new Set(whiteListVideoId);
  return videoConfig;
}

module.exports = { videoParser };
