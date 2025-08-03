/* eslint-disable no-undef */
const helpers = require('../../helpers/everything.helper');
const {getLogger} = require('../../helpers/logger.helper');
const LOGGER = getLogger( "Amazon surfing")
// in seconds
const webHelpers = require('./helpers');
const { exeFuncInDuration } = require('../../helpers/sleep.helper');

async function amazonSurfing(pageContainer,worker) {
  const page = pageContainer.page;
  let videoConfig = worker?.job?.videoConfig
  let amazonViewDuration = videoConfig?.amazonViewDuration || 300
  LOGGER.info('Amazon Surfing: ' + `Navigating to Amazon...`);

  // await helpers.goto(page, 'https://www.amazon.com/');
  try {
    await webHelpers.gotoWebsite(page, 'amazon', 'https://www.amazon.com');
  }catch (e) {
    LOGGER.error(e.stack);
    await page.goto("https://www.amazon.com",{ waitUntil: 'domcontentloaded' });
  }


  if(videoConfig?.amazonViewDuration===0) return;

  await exeFuncInDuration(async ()=>{
    await randomView(page);
  },amazonViewDuration,3
  )
}
async  function randomView (page) {
  try {
    await page._cursor.click("#nav-logo-sprites");
  }catch (e) {
    LOGGER.error(e.stack)
    await page.goto("https://www.amazon.com")
  }
  LOGGER.info('Amazon Surfing: ' + 'Click random trending keywords...');
  await helpers.clickSelector(page, 'input#twotabsearchtextbox', 0);
  await helpers.sleep(6000);

  await helpers.clickSelector(
    page,
    '.left-pane-results-container .s-suggestion-trending-container',
    helpers.random(0, 9)
  );
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await helpers.sleep(6000);

  LOGGER.info( 'Amazon Surfing: ' + `Scroll up and down...`);
  await webHelpers.scroll(page);
}

module.exports = {
  amazonSurfing,
};
