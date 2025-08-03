// const fs = require('fs');
const path = require('path');
const BrowserDriver = require('../../drivers/BrowserDriver');
const SleepHelper = require('../../helpers/sleep.helper');
const Urls = require('../../helpers/urls.helper');
// const FileHelper = require('../helpers/file.helper');
// const db = require('../models/db');
const DevProfileController = require('../DevProfileController');
const FacebookActions = require('../../actions/social/facebook.action');
class FacebookController extends DevProfileController {
  constructor() {
    super();
  }
  async testBrowser(req, res) {
    const driver = await BrowserDriver.getDriver('dev_extra');
    const listProfiles = await this.listDBProfile({group_name: 'dev'});
    const dirProfileName = path.join( `${global.root_path}/public`, listProfiles[0].folder );
    const browser = await driver.getBrowser({
      userDataDir: dirProfileName
    });

    let page = await browser.newPage();
    await driver.gotoUrl(page, Urls.FACEBOONK_LOGIN);
    let isLogin = await FacebookActions.isLogin(page);
    if (isLogin == 'logout') {
      await FacebookActions.loginFacebook(page, listProfiles[0].facebook, listProfiles[0].password_facebook);
    }
    // console.log(isLogin);
    return res.status(200).send({
      message: 'Test Browser',
      data: listProfiles
    });
  }

  async loginFacebook(req, res) {
    const driver = await BrowserDriver.getDriver('dev_extra');
    const { group_name } = req.body;
    let queueThread = [];
    let thread = req.body.thread ? req.body.thread : 1;
    const listProfiles = await this.listDBProfile({group_name});
    const loginFacebookAuth = async (profile, number) => {
      if (!profile.facebook) {
        return number;
      }
      const dirProfileName = path.join( `${global.root_path}/public`, profile.folder );

      const browser = await driver.getBrowser({
         userDataDir: dirProfileName
      });
     
      try {
        let pages = await browser.pages();
        let page = pages[0];
        await driver.gotoUrl(page, Urls.FACEBOONK_LOGIN);
        let isLogin = await FacebookActions.isLogin(page);
        if (isLogin == 'logout') {
          await FacebookActions.loginFacebook(page, profile.facebook, profile.password_facebook);
        }
        await driver.closeBrowser(browser);
        return number;
      } catch (e) {
        await driver.closeBrowser(browser);
        console.log('Error API /dev/profile/facebook/login: ' + e.message());
        return number;
      }
    }

    // Chạy các luồng
    let number = 0;
    while (number < listProfiles.length) {
      if (queueThread.length < thread && !queueThread.includes(number)) {
        queueThread.push(number);
        loginFacebookAuth(listProfiles[number], number)
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

  async addFriends(req, res) {
    const driver = await BrowserDriver.getDriver('dev_extra');
    const { group_name } = req.body;
    let queueThread = [];
    let thread = req.body.thread ? req.body.thread : 1;
    const listProfiles = await this.listDBProfile({group_name});
    const handleAddFriends = async (profile, number) => {
      if (!profile.facebook) {
        return number;
      }
      const dirProfileName = path.join( `${global.root_path}/public`, profile.folder );

      const browser = await driver.getBrowser({
         userDataDir: dirProfileName
      });
     
      try {
        let pages = await browser.pages();
        let page = pages[0];
        await FacebookActions.activeFriends(page); 
        await FacebookActions.addFiends(page); 
      
        await driver.closeBrowser(browser);
        return number;
      } catch (e) {
        await driver.closeBrowser(browser);
        console.log('Error API /dev/profile/facebook/login: ' + e.message());
        return number;
      }
    }

    // Chạy các luồng
    let number = 0;
    while (number < listProfiles.length) {
      if (queueThread.length < thread && !queueThread.includes(number)) {
        queueThread.push(number);
        handleAddFriends(listProfiles[number], number)
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

  async handlePostFacebook(req, res) {
    const driver = await BrowserDriver.getDriver('dev_extra');
    const { group_name, post_links, comments, post, is_like, is_share } = req.body;
    let queueThread = [];
    let thread = req.body.thread ? req.body.thread : 1;
    let listProfiles = await this.listDBProfile({group_name});
    // listProfiles = [listProfiles[0]]
    const postFacebook = async (profile, number) => {
      if (!profile.facebook) {
        return number;
      }
      const dirProfileName = path.join( `${global.root_path}/public`, profile.folder );
      const browser = await driver.getBrowser({
         userDataDir: dirProfileName
      });
    
      try {
        let pages = await browser.pages();
        let page = pages[0];
        await driver.gotoUrl(page, Urls.FACEBOONK_LOGIN);
        const isLoginFacebook = await FacebookActions.isLogin(page); 
        if (isLoginFacebook == 'login') {
            if (post == 'post') {
                await FacebookActions.handlePost(page, post_links, comments, is_share, is_like); 
            }
            if (post == 'video') {
                await FacebookActions.handlePostVideo(page, post_links, comments, is_share, is_like); 
            }
            if (post == 'image') {
                await FacebookActions.handlePostImage(page, post_links, comments, is_share, is_like); 
            }
        } else {
            console.log(isLoginFacebook + ' ' + profile.facebook);
        }
        await driver.closeBrowser(browser);
        return number;
      } catch (e) {
        await driver.closeBrowser(browser);
        console.log('Error API /dev/profile/facebook/handle_post: ' + e.message());
        return number;
      }
    }

    // Chạy các luồng
    let number = 0;
    while (number < listProfiles.length) {
      if (queueThread.length < thread && !queueThread.includes(number)) {
        queueThread.push(number);
        postFacebook(listProfiles[number], number)
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

module.exports = FacebookController;
