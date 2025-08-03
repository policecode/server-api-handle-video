const db = require('../../models/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const http = require('http');
const https = require('https');
const FormData = require('form-data');
const CrawController = require('../CrawController');
const BrowserDriver = require('../../drivers/BrowserDriver');
const RandomHelper = require('../../helpers/random.helper');
const FileHelper = require('../../helpers/file.helper');
const SleepHelper = require('../../helpers/sleep.helper');
const Config = require('../../config');

class DttruyenController extends CrawController {
    constructor() {
        super();
    }



    async spamComment(req, res) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        // const browser = await driver.getBrowser();
        const { link, action, current, isComment, comment } = req.body;
        let queueThread = [];
        let thread = req.body.thread ? req.body.thread : 1;
        /**
         * Lấy bắt đầu từ trang danh sách các truyện
         * - action: one - lấy theo link một bộ truyện cụ thể; mutiple - Lấy theo danh sách liệt kê các bộ truyện
         */

        let listTruyen = [];
        if (action == 'one') {
            listTruyen.push(link);
        } else if (action == 'mutiple') {
            const browserLocal = await driver.getBrowser();
            try {
                let pageLocal = await browserLocal.newPage();
                await driver.gotoUrl(pageLocal, link);
                await pageLocal.waitForSelector('.list-stories ul li.story-list a.thumb', { visible: true });
                listTruyen = await pageLocal.$eval('.list-stories ul', el => {
                    const listElement = el.querySelectorAll('li.story-list a.thumb');
                    let arr = [];
                    listElement.forEach(a => {
                        arr.push(a.href);
                    });
                    return arr;
                });
                await driver.closeBrowser(browserLocal);
            } catch (error) {
                await driver.closeBrowser(browserLocal);
                return res.send("Lỗi ở /api/v1/truyenfull/crawl_tool_story: " + error);
            }
        } else if (action == 'limit') {
            const browserLocal = await driver.getBrowser();
            try {
                let pageLocal = await browserLocal.newPage();
                await driver.gotoUrl(pageLocal, link);
                while (true) {
                    await pageLocal.waitForSelector('.list-stories ul li.story-list a.thumb', { visible: true });
                    let arrStory = await pageLocal.$eval('.list-stories ul', el => {
                        let arr = [];
                        const listElement = el.querySelectorAll('li.story-list a.thumb');
                        listElement.forEach(a => {
                            arr.push(a.href);
                        });
                        return arr;
                    });

                    for (let y = 0; y < arrStory.length; y++) {
                        if (!listTruyen.includes(arrStory[y])) {
                            listTruyen.push(arrStory[y])
                        }
                    }

                    await pageLocal.hover('.pagination-control .pagination');
                    let isPaging = await pageLocal.$('.pagination-control .pagination li.active + li');
                    if (isPaging) {
                        await isPaging.click();
                        await SleepHelper.sleep(2000);
                    } else {
                        break;
                    }
                }
                await driver.closeBrowser(browserLocal);
            } catch (error) {
                await driver.closeBrowser(browserLocal);
                return res.send("Lỗi ở /api/v1/truyenfull/crawl_tool_story: " + error);
            }
        }
        const spamComment = async (link, number) => {
            // const browser = await driver.getBrowser();
            const indexDir = number%Config.list_profile.length
            let dataDir = Config.list_profile[indexDir];
            const browser = await driver.getBrowser({
                userDataDir: dataDir
            });
            try {
                let page = await browser.newPage();
                await driver.gotoUrl(page, link);

                if (isComment) {
                    // Comment page
                    await page.waitForSelector('form.comment-form textarea', { visible: true });
                    await page.click('form.comment-form textarea');
                    // await SleepHelper.sleep(2000);
                    await page.type('form.comment-form textarea', comment)
                    await page.waitForSelector('form.comment-form button', { visible: true, hidden: true });
                    await page.click('form.comment-form button');
                    await SleepHelper.sleep(2000);
                } else {
                    // Comment Facebook
                    await page.waitForSelector('#facebook-comments', { visible: true, hidden: true });
                    await page.hover('#facebook-comments');
                    await page.waitForSelector('#facebook-comments .fb-comments.fb_iframe_widget.fb_iframe_widget_fluid_desktop', { visible: true, hidden: true });

                   const srcComment = await page.$eval('.fb-comments.fb_iframe_widget.fb_iframe_widget_fluid_desktop iframe', el => el.src);
                    await driver.gotoUrl(page, srcComment);
                    await page.waitForSelector('.UFIInputContainer', { visible: true, hidden: true });
                    await page.click('.UFIInputContainer');
                    await page.type('.UFIInputContainer', comment)
                    await page.waitForSelector('button.rfloat', { visible: true, hidden: true });
                    await page.click('button.rfloat');
                    await SleepHelper.sleep(5000);
                }
                await driver.closeBrowser(browser);
                return number;
            } catch (error) {
                await driver.closeBrowser(browser);
                console.log("Error API /api/v1/truyfenull/spam_comment: " + error);
                return number;
            }
        }

        // Chạy các luồng
        let number = 0;
        while (number < listTruyen.length) {
            if (queueThread.length < thread && !queueThread.includes(number)) {
                queueThread.push(number);
                spamComment(listTruyen[number], number).then((indexNumber) => {
                    const index = queueThread.indexOf(indexNumber);
                    if (index !== -1) {
                        console.log('success theard: ' + indexNumber);
                        queueThread.splice(index, 1);
                    }
                }).catch((indexNumber) => {
                    const index = queueThread.indexOf(indexNumber);
                    if (index !== -1) {
                        console.log('error theard: ' + indexNumber);
                        queueThread.splice(index, 1);
                    }
                });
                number++;
                await SleepHelper.sleep(5000);
            } else {
                await SleepHelper.sleep(2000);
            }
        }
        // await HandlePage.closeBrowser(browser);
        return res.status(200).send({
            message: "Đang chạy, xem màn hình process để xem tiến trình chạy",
        });
    }
}

module.exports = DttruyenController;