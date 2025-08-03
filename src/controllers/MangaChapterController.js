const Controller = require('./Controller');
const BrowserDriver = require('../drivers/BrowserDriver');

const db = require('../models/db');

class MangaChapterController extends Controller {
  constructor() {
    super();
    this.model = 'MangaCrawlModel';
    this.primaryKey = ['id'];
    this.filterTextFields = ['folder', 'title', 'story_id'];
    this.filterKeywords = ['folder', 'title', 'story_id'];
    this.filterFields = [];
    this.filterFieldsNot = ['status_not'];
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

  async createDBStory(data) {
    try {
      let result = await db[this.model].create(data);
      return result;
    } catch (error) {
      console.log(`Create failed ${error.message}`);
    }
  }

  async updateDBStory(id, data) {
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

  async destroyDBStory(condition) {
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

}

module.exports = MangaChapterController;
