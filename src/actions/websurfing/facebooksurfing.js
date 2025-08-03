const { exeFuncInDuration } = require('../../helpers/sleep.helper');
const {getLogger} = require('../../helpers/logger.helper');
const webHelpers = require('./helpers');
const LOGGER = getLogger( "Face surfing")
const { loginFacebook } = require('./fbCookiesHandler');
const { random } = require('../../helpers/everything.helper');
const { header } = require('request/lib/hawk');

async function facebookSurfing(pageContainer, worker, fbInfo) {
  const page = pageContainer.page;
  let videoConfig = worker?.job?.videoConfig
  let facebookViewDuration = videoConfig?.facebookViewDuration || 300
  LOGGER.info("Navigating to facebook ");
  if(videoConfig?.facebookViewDuration===0) return;

  const result = await loginFacebook(pageContainer, fbInfo);
  if (result === -1) return;

  await exeFuncInDuration(async ()=>{
      await runSurfingFacebook(pageContainer, page, worker, fbInfo);
    },facebookViewDuration,3
  )
  return;
}
async function runSurfingFacebook (pageContainer, page, worker, fbInfo) {
  // login facebook


  // scroll
  // await page.waitForTimeout(10000);
  await webHelpers.scroll(page);
  await page.waitForTimeout(10000);
}
module.exports = {
  facebookSurfing,
};
