const fs = require('fs');
const path = require('path');
const axios = require('axios');
const http = require('http');
const https = require('https');
const FormData = require('form-data');
const Controller = require('./Controller');
const BrowserDriver = require('../drivers/BrowserDriver');
const RandomHelper = require('../helpers/random.helper');
const FileHelper = require('../helpers/file.helper');
const SleepHelper = require('../helpers/sleep.helper');
const db = require('../models/db');

class UbndhoankiemController extends Controller {
  constructor() {
    super();
    this.model = 'UbndhoankiemModel';
    this.primaryKey = ['id'];
    this.filterTextFields = ['folder', 'title'];
    this.filterFields = [];
    this.filterFieldsNot = ['chaper_skip_not'];
  }
  async testBrowser(req, res) {
    const driver = await BrowserDriver.getDriver('dev_tool');
    const browser = await driver.getBrowser({
      // userDataDir:"D:\\WorkSpace\\automation-walmart\\public\\profile\\user1"
    });
    let page = await browser.newPage();
    await driver.gotoUrl(page, 'https://www.google.com.vn/');
    return res.status(200).send({
      message: 'Test Browser',
    });
  }

  async showDetail(where) {
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

  async createDB(data) {
    try {
      let result = await db[this.model].create(data);
      return result;
    } catch (error) {
      console.log(`Create failed ${error.message}`);
    }
  }

  async updateDB(id, data) {
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

  async destroyDB(condition) {
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



  async registerAccount(req, res) {
    const driver = await BrowserDriver.getDriver('dev_tool');
    const browser = await driver.getBrowser();
    try {
      let page = await browser.newPage();
      await driver.gotoUrl(page, 'https://mttqhanoi.vn/register');

      const name = `${RandomHelper.getLastName()} ${RandomHelper.getFirstName()}`;
      let email = '';
      if (Math.random() >= 0.5) {
        email = `${RandomHelper.getUserName(name)}@gmail.com`;
      } else {
        email = RandomHelper.randomPhone();
      }
      const district = 'Hoàn Kiếm';
      const ward = 'Phường Phan Chu Trinh';
      await page.type('#form_register input#username', email, { delay: 5 });
      await page.type('#form_register input#name', name, { delay: 5 });
      await page.select('#form_register select#office_id', '39'); //ô chọn khách đang tạm trú
      await page.type('#form_register input#direct_office_name', ward, { delay: 5 });
      // captcha
      // await page.waitForSelector('#form_register .recaptcha-checkbox-border', { visible: true });
      // await page.click('#form_register .recaptcha-checkbox-border');
      let data = await this.createDB({name, email, district, ward});
      // await driver.closeBrowser(browser);
      return res.status(200).send({
        message: "Đang chạy, xem màn hình process để xem tiến trình chạy",
        records: data
    });
    } catch (error) {
      await driver.closeBrowser(browser);
      console.log("Error in /api/v1/xuatnhapcanh/crawl_person_long_time: " + error);
      return res.send({
          code: "9999",
          message: "FAILED",
          reason: error.message
      });
    }
  }

}

module.exports = UbndhoankiemController;
