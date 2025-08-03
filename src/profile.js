const { doAction } = require('./actions');
const BOT_API = require('./api/main');
const {
  LOGGER,
  configLogFolder,
  setLoggerGlobalName
} = require('./helpers/logger.helper');
const {
  exeFuncInDuration
} = require('./helpers/sleep.helper');

let worker;
let options;
let index;
try {
  worker = JSON.parse(process.argv[2]);
  options = JSON.parse(process.argv[3]);
  index = JSON.parse(process.argv[4]);
} catch (e) {
}

function communicate (type, message) {
  let typeMessage = typeof message;

  if (typeof message == 'object') {
    message = JSON.stringify(message);
  } else {
    message = message.toString();
  }

  process.stdout.write(`CMT_DATA+${type}+${typeMessage}+${message}`);
}

(async () => {
  if (!worker) {
    return;
  }
  if (!worker.job.login) {
    setLoggerGlobalName(`worker ${index}`)
  } else {

    setLoggerGlobalName(`worker ${worker.job.account.email}`)
  }
  let cachePath = worker.cachePath
  configLogFolder(worker.cachePath)

  const windowW = worker.job.account.windowW || 1920;
  const windowH = worker.job.account.windowH || 1080;

  // let cacheFolder =path.join(__dirname, `../UDATA/cache/${worker.job.account.email}_${cachePath}`)
  // if (process.env.PORTABLE_EXECUTABLE_DIR) {
  //   cacheFolder = process.env.PORTABLE_EXECUTABLE_DIR + `/UDATA/cache/${worker.job.account.email}_${cachePath}`;
  // }
  let API = new BOT_API(options.browserPath, {
      headless: options.headless, // If it should be a headless browser? Its still undetectable by google.

      // Where it should save the local data, cache and cookies.
      // If undefined then it will be a random folder in the temp folder of your computer
      userDataDir: cachePath,

      /*
        an proxy should look like this:
          * protocol://ip:port
          * protocol://user:password@ip:port
          * protocol://ip:port:user:password
          * ip:port
          * user:password@ip:port
          * ip:port:user:password
       */
      proxy: worker.job.proxy,

      // If it should skip ads by itself. If false then you would have to use the API
      // to skip the ads
      autoSkipAds: options.skip_ads,

      // After how many miliseconds to error if page couldn't navigate sucessfully
      // Default is 30000, setting it to 0 makes it infinite
      timeout: 60000,

      // dont_mute_audio: false, // If it should not mute the audio by itself
      no_visuals: options.no_visuals // If it should only render the video (And dont render the webpage)
    }, [
      // "--single-process",
      // "--mute-audio",
      // '--start-fullscreen',
      // `--window-size=${windowW},${windowH}`
    ], [
      __dirname + '/extensions/webrtc',
      __dirname + '/extensions/protectTrace'
      // "/path/to/extension2/",
    ]
  );

  let browser = await API.launch({
    resolution: {
      width: windowW,
      height: windowH
    }
  });
  // let p = browser.#browser.process();
  const browserPID = browser.browser.process().pid;
  worker.browser = browser;
  communicate('openProfilePID', browserPID);

  try {
    //setup extention
    let _pageContainer = await browser.newPage(null, { showMouse: false });
    await _pageContainer.page.goto('chrome-extension://kchbjncbmfkmnjlfeohieeoabmopgmbc/html/settings.html');
    const highProtectE = await _pageContainer.page.waitForSelector('#prot_high');
    await highProtectE.click();
    const extremeProtectE = await _pageContainer.page.waitForSelector('#prot_extreme');
    await extremeProtectE.click();
    await _pageContainer.close();
  } catch (e) {
    LOGGER.error(`Worker close all page error ${e}`);
  }

  try {
    let pages = await browser.browser.pages();
    pages.map(async (page) => await page.close());
  } catch (e) {
    LOGGER.error(`Worker close all page error ${e}`);
  }

  let pageContainer = await browser.newPage(null, { showMouse: false });
  pageContainer.page.goto('https://gologin.com/check-browser');

  const duaration = 31536000;
  await exeFuncInDuration(async () => {
    try {
      let pages = await browser.browser.pages();
      pages.map(async (page) => {
        let url = page.url();
        let loggedIn = true;
        if (url.includes('https://myaccount.google.com')) {
          communicate('googleLoggedIn', loggedIn);
        } else if (url.includes('https://accounts.google.com') || url.includes('https://www.google.com/account')) {
          loggedIn = false;
          communicate('googleLoggedIn', loggedIn);
        }
      });
    } catch (e) {
      LOGGER.error(`Worker close all page error ${e}`);
    }
  }, duaration, 1);

})();
