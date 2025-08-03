const { getLogger } = require('../helpers/logger.helper');
const { browserCheck } = require('./browsercheck');
const LOGGER = getLogger('Do actions');
const { webSurfing } = require('./websurfing');
const { loginGmail } = require('./logingmail');
const helpers = require('../helpers/everything.helper');
async function doAction(browser, config, opts) {
  // run actions
  const { API, worker, pageContainer } = config;
  const page = pageContainer.page;
  try {

    await browserCheck(browser, config, opts);
    try{
      LOGGER.info("Login gmail")
      if(!opts.skip_login)  await loginGmail(browser,config,opts?.gmailInfo);
    }catch (e) {
      LOGGER.error(e.stack)
    }
    try{
      LOGGER.info("Websurfing")
      if (!opts.skip_web_surfing) await webSurfing(browser, config, opts?.gmailInfo);
    }catch (e) {
      LOGGER.error(e.stack)
    }

  } catch (e) {
    LOGGER.error(e?.stack?e.stack:e);
    // console.log(e);
  }

  return;
}
module.exports = {
  doAction,
};
