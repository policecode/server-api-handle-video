/* eslint-disable no-undef */
const helpers = require('../../helpers/everything.helper');
const {getLogger} = require('../../helpers/logger.helper');
const LOGGER = getLogger( "Google surfing")
const googleHelper = require('./helpers');
const { getMultipleRandom } = require('../../helpers/everything.helper');
const webHelpers = require('./helpers');
const { exeFuncInDuration } = require('../../helpers/sleep.helper');

async function googleSurfing(pageContainer, worker) {
  const page = pageContainer.page;
  const randomWords = worker.job.randomWords;
  let randArray = randomWords.split(';');
  // let wordsArray = randomWords.split(';');
  // let randArray = getMultipleRandom(wordsArray,Math.min(wordsArray.length,3))

  LOGGER.info(`Navigating to Google Search...`);
  await helpers.goto(page, 'https://www.google.com/');

  let videoConfig = worker?.job?.videoConfig
  let googleViewDuration = videoConfig?.googleViewDuration || 300
  if(videoConfig?.googleViewDuration===0) return;
  await exeFuncInDuration(async ()=>{
      await runGoogleSearch(page,randArray);
    },googleViewDuration,3
  )
}

async function runGoogleSearch(page,randArray){
  const input = await page.$('[name=q]');
  await input.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  const randWord = helpers.randomChoiceArray(randArray).trim();


  LOGGER.info(`Google Search for '${randWord}'`);
  await helpers.typeSelector(page, '[name=q]', randWord, 0);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.keyboard.press('Enter'),
  ]);
  await helpers.sleep(2000);
  const rand = helpers.random(1, 3);
  for (let i = 0; i < rand; i++) {
    await googleHelper.randomGoogleSearchActions(page);
  }

}

module.exports = {
  googleSurfing,
};
