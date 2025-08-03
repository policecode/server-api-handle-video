const helper = require('../Helper/helper');
async function openUrl(page, url) {
  try {
    // const page = await helper.findActiveTab(browser);
    await page.goto(url, {timeout: 60 * 1000});
    // await page.focus('body');
    // await page.waitForNavigation(); 
    return page;
  } catch (error) {
    console.error(error);
    return null;
  }
}
module.exports = openUrl;
