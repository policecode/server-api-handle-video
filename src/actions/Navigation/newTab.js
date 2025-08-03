const puppeteer = require('puppeteer');

async function newTab(browser, url) {
  try {
    const page = await browser.newPage({timeout: 60 * 1000});
    await page.goto(url, {timeout: 60 * 1000});
    // await page.focus('body');
    // await page.waitForNavigation()
    return page;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = newTab;
