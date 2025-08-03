const express = require('express');
const router = express.Router();
const helper = require('../Action/Helper/helper');
const fs = require('fs');
const path = require('path');
const axios = require('axios');


const { FOLDER_PROFILE, API_GPM_URL } = require('../const');
const runProfile = require('../Profile/runProfile');
const { closeActiveTab } = require('../Action/Navigation/navigation');
const puppeteer = require('puppeteer');
const loginMail_1 = require('../Script/Mail/LoginMail_1/loginMail_1');
const googleSearch_1 = require('../Script/Google/Search/googleSearch_1');
const viewAmazon_1 = require('../Script/Amazon/Amazon_1/viewAmazon_1');
const viewTikTok_1 = require('../Script/Tiktok/ViewTiktok_1/ViewTikTok_1');
const viewTwitter_1 = require('../Script/Twitter/ViewTwitter_1/viewTwitter_1');
const walmartLoginAndBuy = require('../Script/Walmart/LoginAndBuy/walmartLoginAndBuy');
const changePassword_1 = require('../Script/Mail/ChangePassword_1/changePassword_1');




async function createProfile(profileDir) {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        userDataDir: profileDir
    });
    await browser.close();
}
router.post('/create_group', (req, res) => {
    try {
        const { groupName } = req.query;
        if (!groupName) {
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: "Hãy nhập tên group"
            });
        }
        const directory = `${FOLDER_PROFILE}\\${groupName}`;
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
            res.status(200).send({
                code: "1000",
                message: "OK",
            });
        } else {
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: "Tên group đã tồn tại"
            });
        }
    }
    catch (e) {
        console.log('Error', e);
        res.status(400).json({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
})
router.get('/get_list_group', async (req, res) => {
    try {
        const groups = helper.getDirectoriesRecursively(FOLDER_PROFILE);
        return res.status(200).send({
            code: "1000",
            message: "OK",
            groups: groups
        });
    }
    catch (e) {
        console.log('Error', e);
        res.status(400).json({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.get('/get_profile', async (req, res) => {
    try {
        const { groupName } = req.query;
        if (!groupName) {
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: "Hãy nhập groupName"
            });
        }
        const profiles = helper.getDirectoriesRecursively(FOLDER_PROFILE + `\\${groupName}`);
        const data = [];
        for (const index in profiles) {
            const filePathV4 = path.join(FOLDER_PROFILE + `\\${groupName}\\${profiles[index]}`, 'proxy_v4.txt');
            // Đọc nội dung file
            const proxy_x4 = fs.readFileSync(filePathV4, 'utf-8');
            const filePathV6 = path.join(FOLDER_PROFILE + `\\${groupName}\\${profiles[index]}`, 'proxy_v6.txt');
            // Đọc nội dung file
            const proxy_x6 = fs.readFileSync(filePathV6, 'utf-8');
            const filePathMail = path.join(FOLDER_PROFILE + `\\${groupName}\\${profiles[index]}`, 'mail.txt');
            const mail = fs.readFileSync(filePathMail, 'utf-8');
            // Đọc nội dung file
            let item = {
                profileName: profiles[index],
                proxy_v4: proxy_x4,
                proxy_v6: proxy_x6,
                mail: mail
            }
            data.push(item);
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
            profiles: data
        });
    }
    catch (e) {
        console.log('Error', e);
        res.status(400).json({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.post('/create_profile', async (req, res) => {
    try {
        const { groupName, prefix } = req.query;
        const from = +req.query.from, to = +req.query.to;
        for (let i = from; i <= to; i++) {
            const path = `${FOLDER_PROFILE}\\${groupName}\\${prefix}_${i}`;
            if (!fs.existsSync(path)) {
                console.log('Folder does not exist');
                await createProfile(path);
                let fileName = 'proxy_v4.txt';
                let filePath = `${path}\\${fileName}`;
                fs.writeFile(filePath, '', function (err) {
                    if (err) throw err;
                    console.log(`${fileName} has been created in ${path}`);
                });
                fileName = 'proxy_v6.txt';
                filePath = `${path}\\${fileName}`;
                fs.writeFile(filePath, '', function (err) {
                    if (err) throw err;
                    console.log(`${fileName} has been created in ${path}`);
                });
                fileName = 'mail.txt';
                filePath = `${path}\\${fileName}`;
                fs.writeFile(filePath, '', function (err) {
                    if (err) throw err;
                    console.log(`${fileName} has been created in ${path}`);
                });
            } else {
                console.log('Folder exists');
            }
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    }
    catch (e) {
        console.log('Error: ', e)
        res.status(400).json({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.post('/add_proxy_in_group', (req, res) => {
    const { groupName, listProxy, proxyType } = req.body;
    if (!groupName) {
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Hãy nhập groupName"
        });
    }
    if (proxyType != 'v4' && proxyType != 'v6') {
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Hãy nhập proxy type đúng"
        });
    }
    const profiles = helper.getDirectoriesRecursively(FOLDER_PROFILE + `\\${groupName}`);
    for (const index in profiles) {
        if (!listProxy[index]) break;
        const filePath = `${FOLDER_PROFILE}\\${groupName}\\${profiles[index]}\\proxy_${proxyType}.txt`;
        fs.writeFileSync(filePath, listProxy[index].trim(), { flag: 'w' });
    }
    return res.status(200).send({
        code: "1000",
        message: "OK",
    });
});
router.post('/add_mail_in_group', async (req, res) => {
    try {
        const { groupName, listMail } = req.body;
        if (!groupName) {
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: "Hãy nhập groupName"
            });
        }
        console.log('listMail', listMail)
        const groups = await axios.get(API_GPM_URL + "/profiles");
        const profiles = groups.data.filter(o => o.group_name === groupName);
        for (const index in profiles) {
            if (!listMail[index]) break;
            const filePath = `${profiles[index].path}\\mail.txt`;
            helper.overwriteFile(filePath, listMail[index].trim());
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    }
    catch (e) {
        console.error(e);
        res.status(400).json({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.post('/rename_profile', async (req, res) => {
    try {
        const { profiles, listName } = req.body;
        for (const index in profiles) {
            if (!listName[index]) continue;
            const profile = profiles[index];
            axios.get(API_GPM_URL + `/update?id=${profile.id}&name=${listName[index]}`).then((result) => {
                console.log(result);
            }).catch(e => {
                console.log(e);
            });
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    }
    catch (e) {
        console.error(e);
        res.status(400).json({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.post('/add_mail_profile', async (req, res) => {
    try {
        const { profiles, listMail } = req.body;
        for (const index in profiles) {
            if (!listMail[index]) continue;
            const filePath = `${profiles[index].path}`;
            helper.overwriteFile(filePath + "\\mail.txt", listMail[index].trim());
            //add lại mail xóa hết lịch sử log mail, youtube
            // kiểm tra xem file log đã tồn tại hay chưa, nếu chưa tạo file log 
            helper.createLogFile(filePath + "\\mail-log", 'login-mail.txt');
            helper.overwriteFile(filePath + "\\mail-log\\login-mail.txt", '');
            helper.createLogFile(filePath + "\\youtube-log", 'watched-video-log.txt');
            helper.overwriteFile(filePath + "\\youtube-log\\watched-video-log.txt", '');
            helper.createLogFile(filePath + "\\mail-log", 'change-password-mail.txt');
            helper.overwriteFile(filePath + "\\mail-log\\change-password-mail.txt", '');
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    }
    catch (e) {
        console.error(e);
        res.status(400).json({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.post('/start_profile_gpm', async (req, res) => {
    const { profiles } = req.body;
    try {
        for (const profile of profiles) {
            axios.get(API_GPM_URL + `/start?profile_id=${profile.id}`).then((result) => {

            }).catch(e => {
                console.log(e);
            });
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    }
    catch (e) {
        console.error(e);
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
})

router.post('/stop_profile_gpm', async (req, res) => {
    const { profiles } = req.body;
    try {
        for (const profile of profiles) {
            axios.get(API_GPM_URL + `/stop?profile_id=${profile.id}`).then((result) => {

            }).catch(e => {
                console.log(e);
            });
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    }
    catch (e) {
        console.error(e);
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
})
const runWithScript = async (browser, filePath, scriptId, config) => {
    let process = false;
    try {
        
        switch (scriptId) {
            case 'loginMail_1':
                process = await loginMail_1(browser, filePath);
                break;
            case 'changePassword_1':
                process = await changePassword_1(browser, filePath, config);
                break;
            case 'googleSearch_1':
                process = await googleSearch_1(browser, filePath, config);
                break;
            case 'viewAmazon_1':
                process = await viewAmazon_1(browser, filePath);
                break;
            case 'viewTiktok_1':
                process = await viewTikTok_1(browser, filePath);
                break;
            case 'viewTwitter_1':
                process = await viewTwitter_1(browser, filePath);
                break;
            case 'walmartLoginAndBuy':
                process = await walmartLoginAndBuy(browser, filePath);
                break;
            default:
                break;
        }
        // random close active tab 40% sau khi process chạy thành công
        // if (process && helper.randomFloat(0, 1) < 0.4) await closeActiveTab(browser);
        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
}
router.post('/start_profile_in_group', async (req, res) => {
    try {
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
        const { groupName, listTask, proxyType, thread } = req.body;
        if (!groupName) {
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: "Hãy nhập groupName"
            });
        }
        if (!listTask) {
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: "Hãy nhập listTask"
            });
        }
        // if (proxyType != 'v4' && proxyType != 'v6') {
        //     return res.status(400).send({
        //         code: "9999",
        //         message: "FAILED",
        //         reason: "Hãy nhập proxy type đúng"
        //     });
        // }
        const groups = await axios.get(API_GPM_URL + "/profiles");
        const profiles = groups.data.filter(o => o.group_name === groupName);

        const startProfile = async (i) => {
            try {
                let browser;
                const filePath = `${profiles[i].path}`;
                // run profile gpm
                let dataRunProfile = (await axios.get(API_GPM_URL + `/start?profile_id=${profiles[i].id}`)).data;
                // const proxy = await helper.readFileAsync(filePath + `\\proxy_${proxyType}.txt`);
                // if (proxy) {
                //     const tmp = proxy.split(':');
                //     const proxyServer = tmp[0] + ":" + tmp[1];
                //     const userName = tmp[2];
                //     const password = tmp[3];
                //     browser = await runProfile(filePath, { width: browserWidth, height: browserHeight }, { x: positions[i % (rows * columns)].x, y: positions[i % (rows * columns)].y }, proxyServer, userName, password)
                // }
                // else {
                //     browser = await runProfile(filePath, { width: browserWidth, height: browserHeight }, { x: positions[i % (rows * columns)].x, y: positions[i % (rows * columns)].y })
                // }
                // pup connect browser 
                browser = await runProfile(dataRunProfile.selenium_remote_debug_address, { width: browserWidth, height: browserHeight }, { x: positions[i % (rows * columns)].x, y: positions[i % (rows * columns)].y });
                let checkCloseBrowser = true;
                for await (const item of listTask) {
                    const task = helper.deepCopy(item);
                    if (task.type === 'seq') {
                        for await (const script of task.listScripts) {
                            const { scriptId, config } = script;
                            if (scriptId === 'checkAllWeb_1') checkCloseBrowser = false;
                            console.log('start', filePath, scriptId);
                            let run = await runWithScript(browser, filePath, scriptId, config)
                            console.log('running', run);
                            console.log('end', filePath, scriptId)
                        }
                    }
                    else if (task.type === 'random') {
                        const arr = task.listScripts;
                        while (arr.length > 0) {
                            const randomIndex = Math.floor(Math.random() * arr.length);
                            const script = arr[randomIndex];
                            const { scriptId, config } = script;
                            if (scriptId === 'checkAllWeb_1') checkCloseBrowser = false;
                            console.log('start', filePath, scriptId);
                            let run = await runWithScript(browser, filePath, scriptId, config)
                            arr.splice(randomIndex, 1);
                            console.log('running', run);
                            console.log('end', filePath, scriptId)
                        }
                    }
                    else if (task.type === 'randomOneIn') {
                        const arr = task.listScripts;
                        const randomIndex = Math.floor(Math.random() * arr.length);
                        const script = arr[randomIndex];
                        const { scriptId, config } = script;
                        if (scriptId === 'checkAllWeb_1') checkCloseBrowser = false;
                        console.log('start', filePath, scriptId);
                        let run = await runWithScript(browser, filePath, scriptId, config)
                        console.log('running', run);
                        console.log('end', filePath, scriptId)
                    }
                }
                if (checkCloseBrowser) await browser.close();
                else {
                    await helper.delay(180);
                    // await browser.close();
                }
                return i;
            }
            catch (e) {
                console.log('Error', e);
                return i;
            }
        }
        let maxThread = Math.min(profiles.length, thread);
        let queueThread = [];
        let i = 0;
        res.status(200).send({
            code: "1000",
            message: "OK",
        });
        console.log('maxThread', maxThread);
        while (i < profiles.length) {
            if (queueThread.length < maxThread && !queueThread.includes(i)) {
                queueThread.push(i);
                startProfile(i).then((indexProfile) => {
                    const index = queueThread.indexOf(indexProfile);
                    if (index !== -1) {
                        queueThread.splice(index, 1);
                    }
                }).catch((indexProfile) => {
                    const index = queueThread.indexOf(indexProfile);
                    if (index !== -1) {
                        queueThread.splice(index, 1);
                    }
                });
                i++;
            }
            await helper.delay(2);
            console.log(i);
        }
        return;
    }
    catch (e) {
        console.error(e);
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.post('/start_profile_with_task', async (req, res) => {
    try {
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
        const { profiles, listTask, thread } = req.body;
        if (!listTask) {
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: "Hãy nhập listTask"
            });
        }
        const startProfile = async (i) => {
            try {
                let browser;
                const filePath = `${profiles[i].path}`;
                // run profile gpm
                let dataRunProfile = (await axios.get(API_GPM_URL + `/start?profile_id=${profiles[i].id}`)).data;
                browser = await runProfile(dataRunProfile.selenium_remote_debug_address, { width: browserWidth, height: browserHeight }, { x: positions[i % (rows * columns)].x, y: positions[i % (rows * columns)].y });
                let checkCloseBrowser = true;
                for await (const item of listTask) {
                    const task = helper.deepCopy(item);
                    if (task.type === 'seq') {
                        for await (const script of task.listScripts) {
                            const { scriptId, config } = script;
                            if (scriptId === 'checkAllWeb_1') checkCloseBrowser = false;
                            console.log('start', filePath, scriptId);
                            let run = await runWithScript(browser, filePath, scriptId, config)
                            console.log('running', run);
                            console.log('end', filePath, scriptId)
                        }
                    }
                    else if (task.type === 'random') {
                        const arr = task.listScripts;
                        while (arr.length > 0) {
                            const randomIndex = Math.floor(Math.random() * arr.length);
                            const script = arr[randomIndex];
                            const { scriptId, config } = script;
                            if (scriptId === 'checkAllWeb_1') checkCloseBrowser = false;
                            console.log('start', filePath, scriptId);
                            let run = await runWithScript(browser, filePath, scriptId, config)
                            arr.splice(randomIndex, 1);
                            console.log('running', run);
                            console.log('end', filePath, scriptId)
                        }
                    }
                    else if (task.type === 'randomOneIn') {
                        const arr = task.listScripts;
                        const randomIndex = Math.floor(Math.random() * arr.length);
                        const script = arr[randomIndex];
                        const { scriptId, config } = script;
                        if (scriptId === 'checkAllWeb_1') checkCloseBrowser = false;
                        console.log('start', filePath, scriptId);
                        let run = await runWithScript(browser, filePath, scriptId, config)
                        console.log('running', run);
                        console.log('end', filePath, scriptId)
                    }
                }
                if (checkCloseBrowser) await browser.close();
                else {
                    await helper.delay(180);
                    // await browser.close();
                }
                return i;
            }
            catch (e) {
                console.log('Error', e);
                return i;
            }
        }
        let maxThread = Math.min(profiles.length, thread);
        let queueThread = [];
        let i = 0;
        res.status(200).send({
            code: "1000",
            message: "OK",
        });
        console.log('maxThread', maxThread);
        while (i < profiles.length) {
            if (queueThread.length < maxThread && !queueThread.includes(i)) {
                queueThread.push(i);
                startProfile(i).then((indexProfile) => {
                    const index = queueThread.indexOf(indexProfile);
                    if (index !== -1) {
                        queueThread.splice(index, 1);
                    }
                }).catch((indexProfile) => {
                    const index = queueThread.indexOf(indexProfile);
                    if (index !== -1) {
                        queueThread.splice(index, 1);
                    }
                });
                i++;
            }
            await helper.delay(2);
            console.log(i);
        }
        return;
    }
    catch (e) {
        console.error(e);
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.post('/stop_profile_in_group', async (req, res) => {
    try {
        const { groupName } = req.body;
        const groups = await axios.get(API_GPM_URL + "/profiles");
        const profiles = groups.data.filter(o => o.group_name === groupName);
        for (const profile of profiles) {
            try {
                await axios.get(API_GPM_URL + `/stop?profile_id=${profile.id}`)
            }
            catch (e) {

            }
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    }
    catch (e) {
        console.error(e);
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
})
router.get('/get_log', async (req, res) => {
    try {
        const { social, filePath } = req.query;
        let data;
        if (social === 'youtube') {
            helper.createLogFile(filePath + "\\youtube-log", 'watched-video-log.txt');
            console.log(filePath + "\\youtube-log\\watched-video-log.txt");
            data = await helper.readFileAsync(filePath + '\\youtube-log\\watched-video-log.txt');
            data = data.split('\n').filter(o => o !== '').map(o => o.replace('\r', ''));
            let result = [];
            for (const log of data) {
                let items = log.split("|");
                let tmp = {};
                for (const index in items) {
                    if (index == 0) tmp['videoId'] = items[index];
                    else {
                        tmp[items[index].split('-')[0]] = items[index].split('-')[1];
                    }
                }
                result.push(tmp);
            }
            return res.status(200).send({
                code: "1000",
                message: "OK",
                data: {
                    videos: result
                }
            });
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    } catch (e) {
        console.error(e);
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});
router.post('/delete_log', async (req, res) => {
    try {
        const { social, type, listFilePath } = req.body;
        console.log(req.body);
        if (social === 'youtube') {
            if (type === 'view') {
                for (const filePath of listFilePath) {
                    helper.createLogFile(filePath + "\\youtube-log", 'watched-video-log.txt');
                    console.log(filePath + "\\youtube-log\\watched-video-log.txt")
                    helper.overwriteFile(filePath + "\\youtube-log\\watched-video-log.txt", '')
                }
                return res.status(200).send({
                    code: "1000",
                    message: "OK",
                });
            }
        }
        return res.status(200).send({
            code: "1000",
            message: "OK",
        });
    }
    catch (e) {
        console.error(e);
        return res.status(400).send({
            code: "9999",
            message: "FAILED",
            reason: "Lỗi bất định"
        });
    }
});

module.exports = router;