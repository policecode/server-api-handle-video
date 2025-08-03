const { doAction } = require('./actions');
const BOT_API = require('./api/main');
const { join, extname, basename } = require('path');
const { readdirSync, renameSync } = require('fs');
const {
  LOGGER,
  configLogFolder,
  setLoggerGlobalName
} = require('./helpers/logger.helper');
const { sleep } = require('./helpers/sleep.helper');
const axios = require('axios');
const { videoParser } = require('./helpers/parser');

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

function ask (type, message) {
  return new Promise((resolve, reject) => {
    process.stdin.on('data', (raw_data) => {
      raw_data = raw_data.toString();
      if (raw_data.startsWith('CMT_DATA+')) {
        raw_data = raw_data.substring(9).split('+');

        let type = raw_data.shift();
        let contentType = raw_data.shift();
        let data = raw_data.join('');

        switch (contentType) {
          case 'object':
            data = JSON.parse(data);
            break;
          case 'boolean':
            data = (data == 'true' && true) || false;
            break;
          case 'number':
            data = parseFloat(data);
            break;
          case 'undefined':
            data = undefined;
            break;
        }

        resolve(data);
      }
    });

    communicate(type, message);
  });
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
      // '--start-fullscreen'
     "--force-webrtc-ip-handling-policy=default_public_interface_only"
    ], [
      __dirname + "/extensions/webrtc",
      __dirname + "/extensions/protectTrace"
      // "/path/to/extension2/",
    ]
  );

  // get video config
  let videoId = worker.job.id;
  let server_port = options.server_port;
  let res = await axios.get(`http://0.0.0.0:${server_port}/api/videos/${videoId}`);

  // worker.job.videoConfig = res.data
  worker.job.videoConfig = videoParser(res.data);
  let browser = await API.launch();
  // let p = browser.#browser.process();
  const browserPID = browser.browser.process().pid;
  worker.browser = browser;
  communicate('browserPID', browserPID);
  try {
    //setup extention
    let _pageContainer = await browser.newPage();
    await _pageContainer.page.goto('chrome-extension://kchbjncbmfkmnjlfeohieeoabmopgmbc/html/settings.html');
    const highProtectE = await _pageContainer.page.waitForSelector("#prot_high");
    await highProtectE.click();
    const extremeProtectE = await _pageContainer.page.waitForSelector("#prot_extreme");
    await extremeProtectE.click();
    await _pageContainer.close()
  } catch (e) {
    LOGGER.error(`Worker close all page error ${e}`);
  }

  try {
    let pages = await browser.browser.pages();
    pages.map(async (page) => await page.close());
  } catch (e) {
    LOGGER.error(`Worker close all page error ${e}`);
  }

  let pageContainer = await browser.newPage();


  //do action
  worker.communicate = communicate;
  options.gmailInfo = worker.job.account;
  const config = {
    pageContainer,
    worker,
    API
  };
  try {
    await doAction(browser, config, options);
  } catch (e) {
    LOGGER.error(`Do actions error ${e}`);
  }
  await browser.close();
  process.exit(0);
})();
