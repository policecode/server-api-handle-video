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

class BanlongController extends CrawController {
    constructor() {
        super();
    }

    async crawToolStoryTruyenFull(req, res) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        // const browser = await driver.getBrowser();
        const { link, action, current } = req.body;
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
                const elListTruyen = await pageLocal.waitForSelector('section.section-cate', { visible: true });
                listTruyen = await elListTruyen.evaluate(el => {
                    const listElement = el.querySelectorAll('h3 a');
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
                    const elListTruyen = await pageLocal.waitForSelector('section.section-cate', { visible: true });
                    let arrStory = await elListTruyen.evaluate(el => {
                        let arr = [];
                        const listElement = el.querySelectorAll('h3 a');
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

                    let isPaging = await pageLocal.$('.pagination strong + a');
                    if (isPaging) {
                        await isPaging.click();
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
        const downloadTruyenfull = async (link, number) => {
            const browser = await driver.getBrowser();
            try {
                let page = await browser.newPage();
                await driver.gotoUrl(page, link);

                /**
                 * Tạo thư mục chứa truyện
                 */
                // Tên truyện
                await page.waitForSelector('.info-story h1.name-story', { visible: true });
                let titleStory = await page.$eval('.info-story h1.name-story', el => el.innerText);
                titleStory = titleStory.replace("[Free]", "").trim();
                titleStory = titleStory.replace("[Dịch]", "").trim();
                titleStory = titleStory.replace("[Sáng tác]", "").trim();
                titleStory = titleStory.toUpperCase();
                // Description
                await page.waitForSelector('.wrapper_tabcontent', { visible: true });
                const description = await page.$eval('.wrapper_tabcontent ', el => el.innerText);
         
                // Author & category
                await page.waitForSelector('.info-story .text-info a', { visible: true });
                const author = await page.$eval('.info-story .text-info a', el => {
                    return el.innerText;
                });
           
                const category = await page.$eval('.info-story .tag', el => {
                    let categoryList = el.querySelectorAll('.inline-block a');
                    let str = '';
                    categoryList.forEach(catEl => {
                        str += catEl.innerText + '\n';
                    });
                    return str;
                });

                // Image 
                await page.waitForSelector('.image-story img.img-fluid', { visible: true });
                const linkImage = await page.$eval('.image-story img.img-fluid', el => {
                    return el.src;
                });
                // Status
                await page.waitForSelector('.info-story .text-info span', { visible: true });
                const statusText = await page.$eval('.info-story .text-info span', el => {
                    return el.innerText;
                });
                let status = '';
                if (statusText.toLowerCase() == 'đã hoàn thành') {
                  status = 'Full';
                } else {
                  status = 'Đang ra';
                }
     
                /**
                 * File thông tin truyện
                 */
                const folderStory = `/crawl/${current}/${RandomHelper.changeSlug(titleStory)}/`;
                const dirStoryName = `${global.root_path}/public${folderStory}`;
                // Kiểm tra truyện đã tồn tại trong DB ko crawl nữa
                const checkStory = await this.showDetail({ title: titleStory });
                // console.log(checkStory);
                if (checkStory.result) {
                    await driver.closeBrowser(browser);
                    return number;
                }

                FileHelper.createFolderAnfFile(dirStoryName, 'title.txt', titleStory);
                FileHelper.createFolderAnfFile(dirStoryName, 'description.txt', description);
                FileHelper.createFolderAnfFile(dirStoryName, 'author.txt', author);
                FileHelper.createFolderAnfFile(dirStoryName, 'category.txt', category);
                FileHelper.createFolderAnfFile(dirStoryName, 'status.txt', status);

                // Save thumbnail
                const arrImage = linkImage.split('.');
                // console.log(arrImage);
                let extAvatar = arrImage[arrImage.length - 1];
                const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp']
                if (!extArr.includes(extAvatar)) {
                    extAvatar = 'jpg'
                }
                FileHelper.downloadFile(linkImage, dirStoryName, `avatar.${extAvatar}`);
                // Link truyện crawl
                FileHelper.createFolderAnfFile(dirStoryName, 'linkstory.txt', link);

                /**
                 * Lấy danh sách các chương truyện
                 */
                let listChapter = [];
                await page.waitForSelector('.tab-story__detail #but-show-list-chapter', { visible: true });
                await page.click('.tab-story__detail #but-show-list-chapter');
                while (true) {
                    const ChapterEl = await page.waitForSelector('.tabcontent #list-chapter-result .table-list__chapter tbody', { visible: true });
                    const list = await ChapterEl.evaluate(el => {
                        let listTmp = [];
                        const listElement = el.querySelectorAll('tr td a');
                        listElement.forEach(elChapter => {
                            const url = elChapter.href;
                            const chapterText = elChapter.innerText;
                            listTmp.push({ chapterText, url });
                        });
                        return listTmp;
                    });
                    for (let y = 0; y < list.length; y++) {
                        const isCheck = listChapter.find(chapter => chapter.url == list[y].url);
                        if (!isCheck) {
                            listChapter.push(list[y])
                        }
                    }

                    let isPaging = await page.$('.tabcontent #list-chapter-result .pagination strong + a');
                    if (isPaging) {
                        await isPaging.click();
                        await SleepHelper.sleep(1000);
                    } else {
                        break;
                    }
                }
             
                /**
                 * Lấy nội dung chương truyện
                */
                let index = 1;
                let lastLinkChaper = '';
                let folderSkip = [];
                let destroyFor = false;
                for (const chapter of listChapter) {
                    for (let i = 0; i <= 20; i++) {
                        try {
                            await driver.gotoUrl(page, chapter.url);
                            let contentPage = await page.waitForSelector('#chapter-content .s-content', { visible: true });
                            const isCheckLock = await page.$('#chapter-content .s-content.content-lock');
                            if (isCheckLock) {
                                destroyFor = true;
                                break;
                            }
                            let contentHTML = await contentPage.evaluate(el => {
                                const content = el.innerHTML;
                                return content;
                            });
                            /**
                             * Xử lý việc ghi file
                             */

                            // Thư mục chương
                            const dirChapterFolder = dirStoryName + index + '/';
                            // tiêu đề chương
                            FileHelper.createFolderAnfFile(dirChapterFolder, 'title.txt', chapter.chapterText);
                
                            FileHelper.createFolderAnfFile(dirChapterFolder, 'text.txt', contentHTML);

                            // Chương update cuối cùng
                            lastLinkChaper = chapter.url;
                            await SleepHelper.sleep(1000);
                            index++;
                            break;
                        } catch (error) {
                            if (i == 20) {
                                folderSkip.push({
                                    folder: index,
                                    link: chapter.url
                                });
                                index++;
                                break;
                            }
                            if (i == 19) {
                                console.log('Error link step ' + i + ' ' + chapter.url + ': ' + error);
                                await SleepHelper.sleep(1000);
                            }
                        }
                    }
                    if (destroyFor) {
                        break;
                    }
                }
                // Lưu vào DB
                this.createDBStory({
                    title: titleStory,
                    folder: folderStory,
                    status: status,
                    current: current,
                    link: link,
                    chaper_last_folder: (index - 1),
                    chaper_last_link: lastLinkChaper,
                    chaper_skip: JSON.stringify(folderSkip)
                });
                await driver.closeBrowser(browser);
                return number;
            } catch (error) {
                await driver.closeBrowser(browser);
                console.log("Error API /api/v1/truyfenull/crawl_tool_story: " + error);
                return number;
            }
        }

        // Chạy các luồng
        let number = 0;
        while (number < listTruyen.length) {
            if (queueThread.length < thread && !queueThread.includes(number)) {
                queueThread.push(number);
                downloadTruyenfull(listTruyen[number], number).then((indexNumber) => {
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

    // Cập nhật chương mới của truyện và crawl lại những trang bị lỗi
    async handleUpdateStory(req, res) {
        let { current, list_folder_obj } = req.body;
        let queueThread = [];
        let thread = req.body.thread ? req.body.thread : 1;
        const driver = await BrowserDriver.getDriver('dev_tool');

        const updateTruyenfull = async (objStory, number) => {
            if (objStory.current != 'banlong.us') {
                return number;
            }
            if (objStory.status.toLowerCase() == 'full') {
                // await driver.closeBrowser(browser);
                return number;
            }
            const browser = await driver.getBrowser();
            let page = await browser.newPage();
            const dirStoryName = `${global.root_path}/public${objStory.folder}`;

            try {
                // ====Xử lý những chương truyện crawl hỏng====
                let folderSkip = [];
                let listChapterSkip = JSON.parse(objStory.chaper_skip);
                if (listChapterSkip.length > 0) {
                    for (const chapter of listChapterSkip) {
                        for (let i = 0; i <= 20; i++) {
                            try {
                                await driver.gotoUrl(page, chapter.link);

                                let contentPage = await page.waitForSelector('#chapter-content .s-content', { visible: true, timeout: 5000 });
                                let titleText = await contentPage.evaluate(el => {
                                    const title = el.innerText;
                                    return title;
                                });
                                let contentHTML = await contentPage.evaluate(el => {
                                    const content = el.innerHTML;
                                    return content;
                                });

                                /**
                                 * Xử lý việc ghi file
                                 */

                                // Thư mục chương
                                const dirChapterFolder = dirStoryName + chapter.folder + '/';
                                // tiêu đề chương
                                FileHelper.createFolderAnfFile(dirChapterFolder, 'title.txt', titleText);
                                // Nội dung chương
                                FileHelper.createFolderAnfFile(dirChapterFolder, 'text.txt', contentHTML);
                                await SleepHelper.sleep(1000);
                                break;
                            } catch (error) {
                                if (i == 20) {
                                    folderSkip.push(chapter);
                                    break;
                                }
                                if (i == 19) {
                                    console.log('Error link ' + chapter.link + ': ' + error);
                                    await SleepHelper.sleep(1000);
                                }
                            }
                        }

                    }
                }
                // Lưu vào DB
                // this.updateDBStory(objStory.id, {
                //     chaper_skip: JSON.stringify(folderSkip),
                // });
      
                await driver.gotoUrl(page, objStory.link);

                // Status
                await page.waitForSelector('.info-story .text-info span', { visible: true });
                const statusText = await page.$eval('.info-story .text-info span', el => {
                    return el.innerText;
                });
                let status = '';
                if (statusText.toLowerCase() == 'đã hoàn thành') {
                  status = 'Full';
                } else {
                  status = 'Đang ra';
                }
                /**
                 * File thông tin truyện
                 */

                FileHelper.createFolderAnfFile(dirStoryName, 'status.txt', status);

                /**
                 * Lấy danh sách các chương truyện
                 */
                let listChapter = [];
                await page.waitForSelector('.tab-story__detail #but-show-list-chapter', { visible: true });
                await page.click('.tab-story__detail #but-show-list-chapter');
                while (true) {
                    const ChapterEl = await page.waitForSelector('.tabcontent #list-chapter-result .table-list__chapter tbody', { visible: true });
                    const list = await ChapterEl.evaluate(el => {
                        let listTmp = [];
                        const listElement = el.querySelectorAll('tr td a');
                        listElement.forEach(elChapter => {
                            const url = elChapter.href;
                            const chapterText = elChapter.innerText;
                            listTmp.push({ chapterText, url });
                        });
                        return listTmp;
                    });
                    for (let y = 0; y < list.length; y++) {
                        const isCheck = listChapter.find(chapter => chapter.url == list[y].url);
                        if (!isCheck) {
                            listChapter.push(list[y])
                        }
                    }

                    let isPaging = await page.$('.tabcontent #list-chapter-result .pagination strong + a');
                    if (isPaging) {
                        await isPaging.click();
                        await SleepHelper.sleep(1000);
                    } else {
                        break;
                    }
                }

                // Loại bỏ những chương đã crawl
                for (let i = 0; i < listChapter.length; i++) {
                    if (listChapter[i].url == objStory.chaper_last_link) {
                        listChapter = listChapter.slice(i + 1, listChapter.length);
                        break;
                    }
                }
                /**
                 * Lấy nội dung chương truyện
                */
                // ====Cập nhật các chương truyện mới====
                let index = Number(objStory.chaper_last_folder) + 1;
                let lastLinkChaper = objStory.chaper_last_link;
                let destroyFor = false;
                for (const chapter of listChapter) {
                    for (let i = 0; i <= 20; i++) {
                        try {
                            await driver.gotoUrl(page, chapter.url);
                            let contentPage = await page.waitForSelector('#chapter-content .s-content', { visible: true });
                            const isCheckLock = await page.$('#chapter-content .s-content.content-lock');
                            if (isCheckLock) {
                                destroyFor = true;
                                break;
                            }
                            let contentHTML = await contentPage.evaluate(el => {
                                const content = el.innerHTML;
                                return content;
                            });
                            //  Loại bỏ quảng cáo khi tải về

                            // Thư mục chương
                            const dirChapterFolder = dirStoryName + index + '/';

                            // tiêu đề chương
                            FileHelper.createFolderAnfFile(dirChapterFolder, 'title.txt', chapter.chapterText);
                            // Nội dung chương
                            FileHelper.createFolderAnfFile(dirChapterFolder, 'text.txt', contentHTML);
                            // Chương update cuối cùng
                            lastLinkChaper = chapter.url;
                            await SleepHelper.sleep(1000);
                            index++;
                            break;
                        } catch (error) {
                            if (i == 20) {
                                folderSkip.push({
                                    folder: index,
                                    link: chapter.url
                                });
                                index++;
                                break;
                            }
                            if (i == 19) {
                                console.log('Error link ' + chapter.url + ': ' + error);
                                await SleepHelper.sleep(1000);
                            }
                        }
                    }
                    if (destroyFor) {
                        break;
                    }
                }
                // Lưu vào DB
                this.updateDBStory(objStory.id, {
                    status: status,
                    chaper_last_folder: (index - 1),
                    chaper_last_link: lastLinkChaper,
                    chaper_skip: JSON.stringify(folderSkip)
                });
                await driver.closeBrowser(browser);
                return number;
            } catch (error) {
                await driver.closeBrowser(browser);
                console.log("Error API /api/v1/truyenfull/crawl_tool_story: " + error);
                return number;
            }
        }

        // Chạy các luồng
        let number = 0;
        while (number < list_folder_obj.length) {
            if (queueThread.length < thread && !queueThread.includes(number)) {
                queueThread.push(number);
                updateTruyenfull(list_folder_obj[number], number).then((indexNumber) => {
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
            } else {
                await SleepHelper.sleep(5000);
            }
        }
        // await HandlePage.closeBrowser(browser);
        return res.status(200).send({
            message: "Đang chạy, xem màn hình process để xem tiến trình chạy",
        });;

    }

    async spamComment(req, res) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        // const browser = await driver.getBrowser();
        const { link, action, current, comment } = req.body;
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
                const elListTruyen = await pageLocal.waitForSelector('section.section-cate', { visible: true });
                listTruyen = await elListTruyen.evaluate(el => {
                    const listElement = el.querySelectorAll('h3 a');
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
                    const elListTruyen = await pageLocal.waitForSelector('section.section-cate', { visible: true });
                    let arrStory = await elListTruyen.evaluate(el => {
                        let arr = [];
                        const listElement = el.querySelectorAll('h3 a');
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

                    let isPaging = await pageLocal.$('.pagination strong + a');
                    if (isPaging) {
                        await isPaging.click();
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
            const browser = await driver.getBrowser({
                userDataDir: "D:\\Workspace\\automation-walmart\\public\\profile\\dev\\pherohoangdat@gmail.com"
             });
            try {
                let page = await browser.newPage();
       
                await driver.gotoUrl(page, link);
                await page.waitForSelector('.emojionearea.comment-content', { visible: true });
                await page.click('.emojionearea.comment-content');
              
                await page.type('.emojionearea.comment-content', comment)
                await page.waitForSelector('button.btn-send-comment', { visible: true, hidden: true });
                await page.click('button.btn-send-comment');
                await SleepHelper.sleep(2000);
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

module.exports = BanlongController;