const fs = require('fs');
const BrowserDriver = require('../../drivers/BrowserDriver');
const SleepHelper = require('../../helpers/sleep.helper');
// const FileHelper = require('../helpers/file.helper');
// const db = require('../models/db');
const DevProfileController = require('../DevProfileController');
const GmailActions = require('../../actions/social/gmail.action');
class GmailController extends DevProfileController {
  constructor() {
    super();
  }
  async testBrowser(req, res) {
    
    const driver = await BrowserDriver.getDriver('dev_tool');
    const listProfiles = await this.listDBProfile({group_name: 'dev'});
    const dirProfileName = `${global.root_path}/public${listProfiles[0].folder}`;
    const browser = await driver.getBrowser({
      userDataDir: dirProfileName
    });
    let page = await browser.newPage();
    await GmailActions.loginGmail(page, listProfiles[0].email, listProfiles[0].password);
    return res.status(200).send({
      message: 'Test Browser',
      data: listProfiles
    });
  }

  async loginProfiles(req, res) {
    const driver = await BrowserDriver.getDriver('dev_tool');
    const { group_name } = req.body;
    let queueThread = [];
    let thread = req.body.thread ? req.body.thread : 1;
    const listProfiles = await this.listDBProfile({group_name});

    const loginProfilesGoogle = async (profile, number) => {
      const dirProfileName = `${global.root_path}/public${profile.folder}`;
      const browser = await driver.getBrowser({
         userDataDir: dirProfileName
      });
      try {
        let page = await browser.newPage();
        await GmailActions.loginGmail(page, profile.email, profile.password);
        // await driver.closeBrowser(browser);
        return number;
      } catch (e) {
        await driver.closeBrowser(browser);
        console.log('Error API /dev/profile/gmail/login: ' + e.message());
        return number;
      }
    }

    // Chạy các luồng
    let number = 0;
    while (number < listProfiles.length) {
      if (queueThread.length < thread && !queueThread.includes(number)) {
        queueThread.push(number);
        loginProfilesGoogle(listProfiles[number], number)
          .then((indexNumber) => {
            const index = queueThread.indexOf(indexNumber);
            if (index !== -1) {
              console.log('success theard: ' + indexNumber);
              queueThread.splice(index, 1);
            }
          })
          .catch((indexNumber) => {
            const index = queueThread.indexOf(indexNumber);
            if (index !== -1) {
              console.log('error theard: ' + indexNumber);
              queueThread.splice(index, 1);
            }
          });
        number++;
      } else {
        await SleepHelper.sleep(2000);
      }
    }
    return res.status(200).send({
      message: 'Đang chạy, xem màn hình process để xem tiến trình chạy',
    });
  }

}

module.exports = GmailController;
