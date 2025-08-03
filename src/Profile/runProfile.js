// const puppeteer = require('puppeteer');
const { openUrl, reload } = require(global.root_path+'/src/actions/Navigation/navigation');
const { findActiveTab } = require(global.root_path+'/src/actions/Helper/helper');
const closeTabByIndex = require(global.root_path+'/src/actions/Navigation/closeTabByIndex');
const puppeteer = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const RandomUserAgentPlugin = require('puppeteer-extra-plugin-random-user-agent');
const helper = require(global.root_path+'/src/actions/Helper/helper');

// puppeteer.use(StealthPlugin());
// puppeteer.use(AnonymizeUAPlugin());
// puppeteer.use(RandomUserAgentPlugin());
// puppeteer.use(FontSizePlugin());
// puppeteer.use(UserPreferencesPlugin());
// puppeteer.use(RecaptchaPlugin());
// puppeteer.use(AdblockerPlugin());
// puppeteer.use(BlockResourcesPlugin());


async function runProfile(browserLink, windowSize, position, proxyServer = undefined, username = undefined, password = undefined) {
  try {
    let args = [
      `--window-size=${windowSize.width},${windowSize.height}`,
      `--window-position=${position.x},${position.y}`,
    ];
    if (proxyServer)
      args = [
        `--window-size=${windowSize.width},${windowSize.height}`,
        `--window-position=${position.x},${position.y}`,
        `--proxy-server=${proxyServer}`,
        `--proxy-auth=${username}:${password}`,
      ];
    // lấy ws 
    const browserTmp = await puppeteer.launch({
      headless: true,
    });
    const pageTmp = await browserTmp.newPage();
    await pageTmp.goto('http://' + browserLink + '/json/version');
    await helper.delay(5);

    const dataBrowser = await pageTmp.evaluate(() => {
      return JSON.parse(document.querySelector('body').innerText);
    });
    console.log(dataBrowser)
    await browserTmp.close();

    const browser = await puppeteer.connect({ browserWSEndpoint: dataBrowser.webSocketDebuggerUrl});
    const page = await browser.newPage();
    await closeTabByIndex(browser, 1);
    // await page.goto('https://getip.pro/');
    return browser;
  }
  catch (e) {
    console.log('Error', e);
    return null;
  }
}
module.exports = runProfile;
