const { connect } = require('puppeteer-real-browser');
class DevDriver {
  static $_instance;
  constructor() {}
  static getInstance() {
    if (!DevDriver.$_instance) {
      DevDriver.$_instance = new DevDriver();
    }
    return DevDriver.$_instance;
  }
  async getBrowser(launchOption = {}) {
    // let browser;
    try {
      let launch = {
        headless: 'auto',
        fingerprint: true,
        turnstile: true,
        tf: true,
        args: [],

        customConfig: {
          ignoreDefaultArgs: ['--enable-automation'],
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        },
    
        skipTarget: [],
    
        connectOption: {},
      };
      for (const key in launchOption) {
        launch.customConfig[key] = launchOption[key];
      }
      const { browser, page } = await connect(launch);
      return { browser, page  };
    } catch (error) {
      console.log('Khong tao duoc browser ' + error);
    }
    // return browser;
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
