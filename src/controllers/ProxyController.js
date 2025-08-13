const Controller = require('./Controller');
const db = require('../models/db');
const Op = db.Sequelize.Op;
class ProxyController extends Controller {
  constructor() {
    super();
    this.model = 'ProxyModel';
    this.primaryKey = ['id'];
    this.filterTextFields = [];
    this.filterFields = [];
    this.filterFieldsNot = [];
  }
  async testProxy(req, res) {
    const checkProxy = await this.showDetailProxy({status: 1}, [['count', 'DESC']]);
    let proxy = checkProxy.data;
    return res.status(200).send({
        proxy: proxy,
      message: 'Test Browser',
    });
  }

  async showDetailProxy(where, order) {
    try {
      // return where;
      const condition = {where: where};
        // if (random) {
        //     condition.order = db.sequelize.random('id')
        // }
    if (order) {
        condition.order = order
    }
      let num = await db[this.model].findOne(condition);
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

  async createDBProxy(data) {
    try {
      let result = await db[this.model].create(data);
      return result;
    } catch (error) {
      console.log(`Create failed ${error.message}`);
    }
  }

  async updateDBProxy(id, data) {
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

  async destroyDBProxy(condition) {
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

  async storeProxy(req, res) {
    // await this.destroyStory(req.body);
    let data = req.body;
    try {
      const checkProxy = await this.showDetailProxy({ host: data.host});
      if (checkProxy.result) {
        return res.send({
          result: 0,
          message: 'Proxy already exists',
        });
      }
      const dataInsert = await this.createDBProxy(data);
      return res.send({
        result: 1,
        records: dataInsert,
        message: `Tạo proxy ${data.host} thành công`,
      });
    } catch (e) {
      console.log('Error Func storeProxy(): ' + e);
      return res.send({
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }

  async updateProxy(req, res) {
    let proxy = req.body;
    let { id } = req.params;
    try {
        const checkProxy = await this.showDetailProxy({ host: proxy.host, id: {[Op.ne]: id}  });
      if (checkProxy.result) {
        return res.send({
          result: 0,
          message: 'Proxy already exists',
        });
      }
      const dataUpdate = {}
      for (const key in proxy) {
        dataUpdate[key] = proxy[key]
      }
      await this.updateDBProxy(id, dataUpdate);
      return res.send({
        result: 1,
        message: 'Update Proxy success',
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

   async destroyProxy(req, res) {
      let { id } = req.params;
      try {
        const checkProxy = await this.showDetailProxy({ id: id});
  
        if (!checkProxy.result) {
          return res.send({
            result: 0,
            message: 'Proxy does not exists',
          });
        }
        let proxy = checkProxy.data;
        await this.destroyDBProxy({id: proxy.id});
        return res.send({
          result: 1,
          message: 'Delete Proxy success',
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
}

module.exports = ProxyController;
