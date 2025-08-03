const db = require('../models/db');
const Op = db.Sequelize.Op;
class Controller {
    constructor() {
      this.model = '';
      this.primaryKey = ['id'];
      this.filterKeywords = [];
      this.limit = 30;
      this.filterTextFields = [];
      this.filterFields = [];
      this.filterFieldsNot = [];
    }

    getFactory(name){
      // const instance = new {name}();
      // return instance;
    }

    getConditionFromReq(req){
      const where = {}
      const filters = {...req.query};
      const page = filters['page'] ? filters['page'] : 1;
      const perPage = filters['per_page'] ? filters['per_page'] : 20;
      
      const orderField = filters['order_by'] ? filters['order_by'] : this.primaryKey[0];
      const orderType = filters['order_type'] ? filters['order_type'] : 'DESC';

      delete filters['is_paginate'];
      delete filters['page'];
      delete filters['perPage'];
      delete filters['order_by'];
      delete filters['order_type'];

      const keyFilters = Object.keys(filters);
      // console.log(filters);
      for(const key of keyFilters){
        // if(!keyFilters[key]){
        //   continue;
        // }
        
        const value = filters[key];
        if(key === 'keyword'){
          if (this.filterKeywords.length > 0) {
            const or = [];
            for (const keyTextField of this.filterKeywords){
              or.push({
                [keyTextField]: {[Op.like]:`%${value}%`}
              })
            }
            where[Op.or] = or;
          }
        }else if (this.filterTextFields.length > 0 && this.filterTextFields.includes(key)) {
          where[key] = {[Op.like]: `%${value}%`};
        }else if(this.filterFields.length > 0 && this.filterFields.includes(key)){
          where[key] = value;
        } else if(this.filterFieldsNot.length > 0 && this.filterFieldsNot.includes(key)) {
          const keyArr = key.split('_');
          keyArr.pop();
          where[keyArr.join('_')] = {[Op.ne]: value};
        } else if(key.lastIndexOf('_min') > 0) {
          if ((typeof Number(value) == 'number') && value > 0) {
            const keyArr = key.split('_');
            keyArr.pop();
            where[keyArr.join('_')] = {[Op.gte]: value};
          }
        } else if(key.lastIndexOf('_max') > 0) {
          if ((typeof Number(value) == 'number') && value > 0) {
            const keyArr = key.split('_');
            keyArr.pop();
            where[keyArr.join('_')] = {[Op.lte]: value};
          }
        }
          
      }
      // console.log(where);
      const conditions = {
        where: where, 
        offset: (page-1)*perPage, 
        limit: perPage,
        order: [
          [orderField, orderType]
        ]
      }
      return conditions
    }

    async list(req,res){
      // console.log('call list')
      const conditions = this.getConditionFromReq(req);
      // return res.status(200).send(conditions);
      try {
        let total = 0;
        let data = [];
        if(req.query.is_paginate){
          total = await db[this.model].count({
            where: conditions.where
          })
        }else{
          data = await db[this.model].findAll(conditions)
        }
          
        return res.status(200).send({
            message: "OK",
            records: data,
            total_records: total
        });
      }
      catch (e) {
          console.log('Error', e);
          res.status(500).json({
              message: "FAILED",
              reason: e.message,
          });
      }
    }

    create(req, res){
      const data = req.body;
      // Save Tutorial in the database
      db[this.model].create(data)
        .then(result => {
          res.send(result);
        })
        .catch(err => {
          res.status(500).send({
            message: "Create failed",
            reason: err.message,
            records: []
          });
        });
    }

    show(req, res){
        const where = {}
        for(const i of this.primaryKey){
          where[i] = req.params[i]
        }

        db[this.model].findOne({
          where: where
        })
          .then(num => {
            if (num ) {
              res.send(num);
            } else {
              res.send({
                message: `Not found with ${where}.`
              });
            }
          })
          .catch(err => {
            res.status(500).send({
              message: `Error search with ${where}`,
              reason: err.message,
              records: {}
            });
          }); 
    }

    update(req, res){
        const where = {}
        for(const i of this.primaryKey){
          where[i] = req.params[i]
        }
        const model = db[this.model]

        model.update(req.body, {
          where: where
        })
          .then(num => {
            if (num == 1) {
              res.send(
                model.findOne({where: where})
              );
            } else {
              res.send({
                message: `Cannot update with ${where}.`
              });
            }
          })
          .catch(err => {
            res.status(500).send({
              message: `Error updating with ${where}`,
              code: "9999",
              reason: err.message
            });
          }); 
    }

    destroy(req, res){
        const where = {}
        for(const i of this.primaryKey){
          where[i] = req.params[i]
        }
        console.log('where',where)

        db[this.model].destroy({
          where: where
        })
          .then(num => {
            if (num == 1) {
              res.status(202).send({
                message: "record was deleted successfully."
              });
            } else {
              res.send({
                message: `Cannot deleted with ${where}.`
              });
            }
          })
          .catch(err => {
            console.log('err',err)
            res.status(500).send({
              message: `Error deleted with ${where}`,
              reason: err
            });
          }); 
    }

    deleteAll(req, res){
      return db[this.model].truncate()
          .then(num => {
            res.status(202).send({
              message: `${num} records was deleted successfully.`
            });
          })
          .catch(err => {
            res.status(500).send({
              message: err
            });
          }); 
    }
}

module.exports = Controller;