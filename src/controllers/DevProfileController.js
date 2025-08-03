const fs = require('fs');
const path = require('path');
// const axios = require('axios');
// const http = require('http');
// const https = require('https');
// const FormData = require('form-data');
const Controller = require('./Controller');
const BrowserDriver = require('../drivers/BrowserDriver');
// const RandomHelper = require('../helpers/random.helper');
const FileHelper = require('../helpers/file.helper');
const Urls = require('../helpers/urls.helper');
// const SleepHelper = require('../helpers/sleep.helper');
const db = require('../models/db');

class DevProfileController extends Controller {
  constructor() {
    super();
    this.model = 'DevProfileModel';
    this.primaryKey = ['id'];
    this.filterTextFields = [];
    this.filterFields = ['group_name'];
    this.filterFieldsNot = [];
  }
  async testBrowser(req, res) {
    const driver = await BrowserDriver.getDriver('dev_tool');
    const browser = await driver.getBrowser({
      // userDataDir:"D:\\WorkSpace\\automation-walmart\\public\\profile\\0CDrwRGItM20062023"
    });
    let page = await browser.newPage();
    await driver.gotoUrl(page, 'https://www.google.com.vn/');
    return res.status(200).send({
      message: 'Test Browser',
    });
  }

  async listDBProfile(where){
    // console.log('call list')
    const conditions = this.getConditionFromReq(where);
    // return res.status(200).send(conditions);
    delete conditions.limit;
    delete conditions.offset;
    try {
      let total = 0;
      let data = [];
      if(where.is_paginate){
        total = await db[this.model].count({
          where: conditions.where
        })
        return total;
      }else{
        data = await db[this.model].findAll(conditions)
        return data
      }
    }
    catch (e) {
        return e.message;
    }
  }

  async showDetailProfile(where) {
    try {
      // return where;
      let num = await db[this.model].findOne({
        where: where,
      });
      if (num) {
        return {
          result: 1,
          data: num,
        };
      } else {
        return {
          result: 0,
          message: `Not found with ...`,
          data: {},
        };
      }
    } catch (error) {
      return {
        result: 0,
        message: `Error search with ...`,
        reason: error.message,
        data: {},
      };
    }
  }

  async createDBProfile(data) {
    try {
      let result = await db[this.model].create(data);
      return result;
    } catch (error) {
      console.log(`Create failed ${error.message}`);
    }
  }

  async updateDBProfile(id, data) {
    try {
      const where = {};
      for (const i of this.primaryKey) {
        where[i] = id;
      }
      const model = db[this.model];
      let num = await model.update(data, {
        where: where,
      });
      if (num == 1) {
        model.findOne({ where: where });
        console.log(`Update success: ${where}`);
      } else {
        console.log(`err: Cannot update with ${where}`);
      }
    } catch (error) {
      console.log(`Error updating with ${where}: ${err.message}`);
    }
  }

  async destroyDBProfile(condition) {
    try {
      const where = {};
      for (const i of this.primaryKey) {
        where[i] = condition[i];
      }
      // console.log('where',where)
      let num = await db[this.model].destroy({
        where: where,
      });
      if (num == 1) {
        return {
          result: 1,
          message: 'record was deleted successfully.',
        };
      } else {
        return {
          result: 0,
          message: `Cannot deleted with ${where.id}.`,
        };
      }
    } catch (error) {
      return {
        result: 0,
        message: `Error deleted with ${where.id}; ${error}`,
      };
    }
  }


  async updateProfile(req, res) {
    let profile = req.body;
    let { id } = req.params;
    try {
      await this.updateDBProfile(id, {
        password: profile.password,
        facebook: profile.facebook,
        password_facebook: profile.password_facebook,
        full_name: profile.full_name,
        gender: profile.gender,
        birth_day: profile.birth_day,
        phone: profile.phone,

      });
      return res.send({
        result: 1,
        message: 'Update Profile success',
      });
    } catch (e) {
      return res.send({
        result: 0,
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }

  async destroyProfile(req, res) {
    let { id } = req.params;
    try {
      const checkProfile = await this.showDetailProfile({ id: id});

      if (!checkProfile.result) {
        return res.send({
          result: 0,
          message: 'Profile does not exists',
        });
      }
      let profile = checkProfile.data;
      const dirProfileName = path.join( `${global.root_path}/public`, profile.folder );
      fs.rmSync(dirProfileName, { recursive: true, force: true });
      await this.destroyDBProfile({id: profile.id});
      return res.send({
        result: 1,
        message: 'Delete Profile success',
      });
    } catch (e) {
      return res.send({
        result: 0,
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }

    async storeDevPorofile(req, res) {
      // await this.destroyStory(req.body);
      let data = req.body;
      try {
        const checkProfile = await this.showDetailProfile({ email: data.email });
        if (checkProfile.result) {
          return res.send({
            result: 0,
            message: 'Profile already exists',
          });
        }
        data.folder = `profile/${data.group_name}/${data.email}`;
        const dataInsert = await this.createDBProfile(data);
        return res.send({
            result: 1,
            records: dataInsert,
            message: `Tạo profile ${data.email} thành công` 
          });
      } catch (e) {
        console.log('Error Func handleDestroyDir(): ' + e);
        return res.send({
          code: '9999',
          message: 'FAILED',
          reason: e.message,
        });
      }
    }

  async openBrowser(req, res) {
    let { id } = req.params;
    const driver = await BrowserDriver.getDriver('dev_extra');
    try {
      const checkProfile = await this.showDetailProfile({ id: id});

      if (!checkProfile.result) {
        return res.send({
          result: 0,
          message: 'Profile does not exists',
        });
      }
      let profile = checkProfile.data;
      const dirProfileName = path.join( `${global.root_path}/public`, profile.folder );
      const browser = await driver.getBrowser({
        userDataDir: dirProfileName
     });
     let pages = await browser.pages();
     let page = pages[0];
    //  await driver.setUserAgent(page);
     await driver.gotoUrl(page, Urls.HOME_PAGE);
    
    //  console.log(await browser.pages());
      return res.send({
        result: 1,
        message: `Open Profile ${profile.email} success`,
      });
    } catch (e) {
      // await driver.closeBrowser(browser);
      return res.status(500).send({
        result: 0,
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }
}

module.exports = DevProfileController;
