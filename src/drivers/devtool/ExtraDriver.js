const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
class DevDriver {
  USER_AGENT = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
  ];
  static $_instance;
  constructor() {}
  static getInstance() {
    if (!DevDriver.$_instance) {
      DevDriver.$_instance = new DevDriver();
    }
    return DevDriver.$_instance;
  }
  async getBrowser(launchOption = {}) {
    let browser;
    try {
      let launch = {
        headless: false,
        defaultViewport: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-client-side-phishing-detection',
          '--disable-default-apps',
          '--disable-dev-shm-usage',
          '--disable-extensions',
          '--disable-features=site-per-process',
          '--disable-hang-monitor',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-sync',
          '--disable-translate',
          '--metrics-recording-only',
          '--disable-gpu',
          '--enable-webgl',
          // `--proxy-server=13.228.200.6:80`
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        // userDataDir:"D:\\WorkSpace\\automation-walmart\\public\\profile\\user1",
        //   proxy: {
        //     host: '127.0.0.1',
        //     port: '8080',
        //     username: 'username',
        //     password: 'password'
        // },
        ignoreHTTPSErrors: true,
      };
      for (const key in launchOption) {
        launch[key] = launchOption[key];
      }
      browser = await puppeteer.launch(launch);
    } catch (error) {
      console.log('Khong tao duoc browser ' + error);
    }
    return browser;
  }
  /**
   * Điều hướng đến trang web chỉ định
   */
  async gotoUrl(page, url) {
    await page.goto(url, {
      waitUntil: 'load',
    });
  }

  /**
   * thực hiện scrrll trên trang web
   * sizeScroll > 0 kéo xuống dưới
   * sizeScroll < 0 kéo lên trên
   */
  async scroll(page, sizeScroll) {
    try {
      await page.mouse.wheel({ deltaY: sizeScroll });
      await page.waitForTimeout(500);
    } catch (error) {
      console.log('lỗi scroll: ' + error);
    }
  }

  /**
   * Đóng tất cả các trang web
   */
  async closeBrowser(browser) {
    try {
      let pages = await browser.pages();
      for (const page of pages) {
        await page.close();
      }
      await browser.close();
    } catch (error) {
      console.log('closeBrowser: ' + error);
    }
  }

  /**
   * Thao tác trên bàn phím
   * - Key Input: https://pptr.dev/api/puppeteer.keyinput
   */
  async setKeyboard(page, keyInput) {
    await page.keyboard.press(keyInput);
  }


  async setUserAgent(page) {
    await page.setUserAgent(this.USER_AGENT[0]);
  }

}

module.exports = DevDriver;
