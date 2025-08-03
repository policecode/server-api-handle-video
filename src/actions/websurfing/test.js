/* eslint-disable no-undef */
const config = require('./config.json');
const BOT_API = require('../../api/main');
const worker = config.worker;
const { googleSurfing } = require('./googlesurfing');
const { amazonSurfing } = require('./amazonsurfing');
const { facebookSurfing } = require('./facebooksurfing');

async function startBrowser() {
  let browser;
  try {
    let API = new BOT_API(
      config.options.browserPath,
      {
        headless: config.options.headless, // If it should be a headless browser? Its still undetectable by google.

        // Where it should save the local data, cache and cookies.
        // If undefined then it will be a random folder in the temp folder of your computer

        // proxy: config.worker.job.proxy,

        // If it should skip ads by itself. If false then you would have to use the API
        // to skip the ads
        autoSkipAds: config.options.skip_ads,

        // After how many miliseconds to error if page couldn't navigate sucessfully
        // Default is 30000, setting it to 0 makes it infinite
        timeout: 60000,

        // dont_mute_audio: false, // If it should not mute the audio by itself
        no_visuals: config.options.no_visuals, // If it should only render the video (And dont render the webpage)
      },
      [
        // "--disable-gpu",
        // "--mute-audio",
      ],
      [
        // "/path/to/extension1/",
        // "/path/to/extension2/",
      ]
    );
    browser = await API.launch();
    let pageContainer = await browser.newPage();

    await facebookSurfing(pageContainer, worker);
  } catch (err) {
    console.log(err);
  }
}

startBrowser();
