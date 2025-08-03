const axios = require('axios')
const path = require('path');
const fs = require('fs');
const db = require('../models/db');
const runProfile = require(global.root_path+'/src/Profile/runProfile');
const walmartLoginAndBuy = require(global.root_path+'/src/Script/Walmart/walmartLoginAndBuy');
const helper = require(global.root_path+'/src/actions/Helper/helper');
const GpmDriver = require('../drivers/gpmlogin/GpmDriver')
const Controller = require('./Controller');
const BrowserDriver = require('../drivers/BrowserDriver');
const { STATUS_CODES } = require('http');
const FileHelper = require('../helpers/file.helper');

const { API_GPM_URL, DRIVERS, PROCESS_STATUS } = require(global.root_path+'/const');
class ProfilesController extends Controller{
    constructor(){
        super();
        this.model = 'ProfileModel';
        this.primaryKey = ['id'];
    }

    async import(req,res){
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send({message: 'No files were uploaded.'});
            }
            if(!req.body.importSort){
                return res.status(400).send({message: 'head line required'});
      }

            await FileHelper.streamInsert(req.files.importFile.tempFilePath, db.ProfileModel, req.body.importSort, req.body.importSplit)
            res.send({message: 'File uploaded!'});
        } catch (error) {
            console.log('error import profile',error)
            return res.status(500).send({
                message: error.message,
                reason: error
            });
        }
    }

    async create(req, res){
        const data = req.body;
        const profile = await BrowserDriver.getDriver(req.body.driver).createProfile()
        // Save Tutorial in the database
        data.driver_id = profile.id
        db[this.model].create(data)
          .then(result => {
            res.send({result});
          })
          .catch(err => {
            res.status(500).send({
              message: "Create failed",
              reason: err.message,
              records: []
            });
          });
      }

    async startScan(req,res){
        try {
            if(await db.ProcessModel.count({where: {status: PROCESS_STATUS.RUNNING, type: 'scan'}})){
                return res.status(400).send({message: 'Có một process đang chạy'})
            }
            
            const browserWidth = 854;
            const browserHeight = 854;
            const rows = 1;
            const columns = 12;
            const positions = [];
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    const x = j * 100;
                    const y = i * browserHeight;
                    positions.push({ x, y });
                }
            }
            const { groupName, thread } = req.body;
            const groups = await axios.get(API_GPM_URL + "/profiles");
            
            const startProfile = async (profile) => {
                try {
                    let browser;
                    const filePath = `${profiles[i].path}`;
                    // run profile gpm
                    
                    let dataRunProfile = GpmDriver.createBrowser(profile)
                    if(!dataRunProfile){
                        return false;
                    }
                    // pup connect browser 
                    browser = await runProfile(dataRunProfile.selenium_remote_debug_address, { width: browserWidth, height: browserHeight }, { x: positions[i % (rows * columns)].x, y: positions[i % (rows * columns)].y });
                    let run = await walmartLoginAndBuy(browser, config);
                    console.log('running', run);
                    profile.walmart_checked = true;
                    browser.close();
                    profile.save();
                    return profile;
                } catch (error) {
                    console.log('error start profile',error)
                    return false;
                }
            }
            const conditions = super.getConditionFromReq(req).where
            const total = await db.ProfileModel.count({where: conditions})
            let process = await db.ProcessModel.create({status: PROCESS_STATUS.RUNNING, type: 'scan', notes: `0/${total}`})
            const process_id = process.id
            let offset = 0
            const profiles = await db.ProfileModel.findAll({where: conditions,limit: thread, offset: offset})
            res.status(200).send({
                message: "Đang chạy, xem màn hình process để xem tiến trình chạy",
            });
            while (profiles.length == 0) {
                const threadRunning = []
                for(const profile of profiles){
                    threadRunning.push(startProfile(profile))
                }
                await Promise.all(threadRunning)
                // await helper.delay(2);
                offset += thread
                process = await db.ProcessModel.findByPk(process_id)
                if(!process || process.status == PROCESS_STATUS.STOPPED){
                    break;
                }
                process.notes = `${offset}/${total}`
                process.save()
                
                await GpmDriver.clearWhenLimit()
                profiles = await db.ProfileModel.findAll({where: conditions,limit: thread, offset: offset})
            }
            return;
        }
        catch (e) {
            console.error(e);
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: e.message
            });
        }
    }

    async syncGpmProfile(req, res){
        const groups = await axios.get(API_GPM_URL + "/profiles");
        const gpmProfiles = groups.data;
        const process = []
        for (const gpmProfile of gpmProfiles) {
            process.push(db.ProfileModel.findByPk(gpmProfile.name).then(data=>{
                if(data){
                    db.ProfileModel.update({
                        driver: DRIVERS.GPM_LOGIN,
                        proxy: gpmProfile.proxy,
                        driver_id: gpmProfile.id,
                        group_name: gpmProfile.group_name,
                    }, {
                        where: { email: gpmProfile.name}
                    }).catch(err => {
                        console.log(err)
                    });
                }else{
                    db.ProfileModel.create({
                        email: gpmProfile.name,
                        proxy: gpmProfile.proxy,
                        driver: DRIVERS.GPM_LOGIN,
                        driver_id: gpmProfile.id,
                        group_name: gpmProfile.group_name,
                    })
                    .then(result => {
                        console.log(result)
                    })
                    .catch(err => {
                        console.log(err)
                    });
                }
            }))
        }
        if(process.length){
            await Promise.all(process)
        }
        res.send({
            message: "Sync thành công"
          });
        
    }

    stopScan(req,res){
        return db.ProcessModel.update({status: PROCESS_STATUS.STOPPED}, {
          where: {
            status: PROCESS_STATUS.RUNNING,
            type: 'scan'
          }
        })
          .then(num => {
            if (num == 1) {
              res.send({
                message: "record was deleted successfully."
              });
            } else {
              res.send({
                message: `Cannot deleted with ${where}.`
              });
            }
          })
          .catch(err => {
            res.status(500).send({
              message: `Error deleted with ${where}`
            });
          }); 
    }
    
}

module.exports = ProfilesController;