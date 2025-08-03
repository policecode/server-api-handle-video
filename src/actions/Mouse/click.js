const helper = require('../Helper/helper')
async function click(activePage, selector) {
    try {
      // const activePage = await helper.findActiveTab(browser);
      await activePage.waitForSelector(selector);
      await activePage.click(selector);
      return true;
    } catch (error) {
      console.error(`Error clicking on element: ${error}`);
      return false;
    }
  }
  
module.exports = click;