const { sleep } = require('../../helpers/sleep.helper');
const {getLogger} = require('../../helpers/logger.helper');
const LOGGER = getLogger("BrowserCheck")

async function browserCheck(browser, config, opts) {
  const { API, worker, pageContainer } = config;
  if(!opts.browser_check) return
  try {
    await pageContainer.page.goto("https://gologin.com/check-browser");
    await sleep(60000);
    await pageContainer.page.goto("https://pixelscan.net");
    // await pageContainer.page.goto("https://browserleaks.com/ip");
    // await pageContainer.page.reload();
    await sleep(60000);
  }catch (e) {
    LOGGER.error(`run browserCheck error ${e}`)
  }
  return;
}

module.exports = {
  browserCheck,
};
