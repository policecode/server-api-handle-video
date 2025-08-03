const {retryAsync} = require('ts-retry')
const helpers = require('../../helpers/everything.helper');
const {getLogger} = require('../../helpers/logger.helper');
const LOGGER = getLogger("Facebook Login")
const { sleep } = require('../../helpers/sleep.helper');
const webHelpers = require('./helpers');

async function loginFacebook(pageContainer, fbInfo) {
  const facebookService = pageContainer.createFacebookContext();
  const page = pageContainer.page;
  let loggedIn = false

  try {
    await webHelpers.gotoWebsite(page, 'facebook', 'https://www.facebook.com');
  }catch (e) {
    LOGGER.error(e.stack);
    await page.goto("https://www.facebook.com",{ waitUntil: 'domcontentloaded' });
  }

  // check xem login chưa
  const emailInputElement = await page.$('input#email') || undefined;
  if (emailInputElement === undefined) {
    LOGGER.info(`Facebook account logged in!`)
    loggedIn = true
  } else {
    await retryAsync(
      async ()=>{
        // await googlService.setup();
        // await API.login(page, worker.job.account, worker.job.account.cookies);
        if (fbInfo.fbCookies)
          await facebookService.login(fbInfo.fbCookies);
        else {
          return;
        }
      },{
        delay: 2000,
        maxTry: 5,
      }
    )
    loggedIn = true
  }

  if (loggedIn)
    return pageContainer;
  return -1;
}

module.exports = {
  loginFacebook,
};
