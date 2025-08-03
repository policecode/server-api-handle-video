const { amazonSurfing } = require('./amazonsurfing');
const { sleep } = require('../../helpers/sleep.helper');
const { googleSurfing } = require('./googlesurfing');
const { facebookSurfing } = require('./facebooksurfing');
const { getLogger } = require('../../helpers/logger.helper');
const LOGGER = getLogger('Web surfing');

async function webSurfing (browser, config, webInfo) {
  const {
    API,
    worker,
    pageContainer
  } = config;

  try {
    await googleSurfing(pageContainer, worker);
  } catch (e) {
    LOGGER.error(e.stack);
  }
  try {
    await amazonSurfing(pageContainer, worker);
  } catch (e) {
    LOGGER.error(e.stack);
  }
  try {
    await facebookSurfing(pageContainer, worker, webInfo);
  } catch (e) {
    LOGGER.error(e.stack);
  }

  return;
}

module.exports = {
  webSurfing
};
