// const db = require('../../models/db');
// const fs = require('fs');
const path = require('path');
// const axios = require('axios');
// const http = require('http');
// const https = require('https');
// const FormData = require('form-data');
const CrawController = require('../CrawController');
const BrowserDriver = require('../../drivers/BrowserDriver');
const RandomHelper = require('../../helpers/random.helper');
const FileHelper = require('../../helpers/file.helper');
const SleepHelper = require('../../helpers/sleep.helper');
class VozerController extends CrawController {
    constructor() {
        super();
    }

    async crawToolStoryTruyenFull(req, res) {
        const driver = await BrowserDriver.getDriver('real_browser');
        // const browser = await driver.getBrowser();
        const { link, action, current } = req.body;
        let queueThread = [];
        let thread = req.body.thread ? req.body.thread : 1;
        /**
         * Lấy bắt đầu từ trang danh sách các truyện
         * - action: one - lấy theo link một bộ truyện cụ thể; mutiple - Lấy theo danh sách liệt kê các bộ truyện
         */
        
        const dirProfileName = path.join( `${global.root_path}/public/profile/crawl_truyen`);
        FileHelper.createFolderAnfFile(dirProfileName);
        let listTruyen = [];
        if (action == 'one') {
            listTruyen.push(link);
        } else if (action == 'mutiple') {
            const { browser, page } = await driver.getBrowser({
                userDataDir: dirProfileName
              });
            try {
                // let pageLocal = await browserLocal.newPage();
                await driver.gotoUrl(page, link);
                const elListTruyen = await page.waitForSelector('.mx-auto.bg-white.border', { visible: true });
                listTruyen = await elListTruyen.evaluate(el => {
                    const listElement = el.querySelectorAll('.flex div a.font-bold.text-blue-001');
                    let arr = [];
                    listElement.forEach(a => {
                        arr.push(a.href);
                    });
                    return arr;
                });
                await driver.closeBrowser(browser);
            } catch (error) {
                await driver.closeBrowser(browser);
                return res.send("Lỗi ở /api/v1/truyenfull/crawl_tool_story: " + error);
            }
        } else if (action == 'limit') {
      
        }

        const downloadTruyenfull = async (link, number) => {
            const { browser, page } = await driver.getBrowser({
                userDataDir: dirProfileName
              });
            try {
                // let page = await browser.newPage();
                await driver.gotoUrl(page, link);
       
                /**
                 * Tạo thư mục chứa truyện
                 */
                // Tên truyện
                await page.waitForSelector('#chapter_001 h1', { visible: true });
                let titleStory = await page.$eval('#chapter_001 h1', el => el.innerText);
                titleStory = titleStory.toUpperCase();
                titleStory = titleStory.replace(/\[.*?\]/g, "").trim();
                titleStory = titleStory.replace(/\(.*?\)/g, "");
                
                // Description
                await page.waitForSelector('#chapter_001 .smiley', { visible: true });
                const description = await page.$eval('#chapter_001 .smiley', el => el.innerText);
               
                // Author & category
                await page.waitForSelector('#chapter_001 .leading-7', { visible: true });
                const author = await page.$eval('#chapter_001 .leading-7', el => {
                    let textAuthor = el.querySelectorAll('p strong')[2];
                    return textAuthor.innerText;
                });
                
                const category = await page.$eval('#chapter_001 .leading-7', el => {
                    let textCat = el.querySelectorAll('.leading-7 p a')[1];
                    return textCat.innerText;
                });
                
                // Image 
                await page.waitForSelector('#chapter_001 .border img', { visible: true });
                const linkImage = await page.$eval('#chapter_001 .border img', el => {
                    return el.src;
                });
                // Status
                const statusText = await page.$eval('#chapter_001 .leading-7', el => {
                    let textStatus = el.querySelectorAll('p strong')[3];
                    return textStatus.innerText;
                });
                let status = '';
                if (statusText.toLowerCase() == 'hoàn thành') {
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
                    console.log(`Truyện ${titleStory} đã được crawl từ trang ${checkStory.data.current}`);
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
                // let buttonAll = await page.$$('#head-chapters div button');
                // await buttonAll[2].click();
                while (true) {
                    await page.waitForSelector('.p-3.leading-8.shadow.bg-gray-002 table.mb-5', { visible: true });
                    const ChapterEl = await page.$('.p-3.leading-8.shadow.bg-gray-002 table.mb-5 tbody');
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
                    let pagingBtn = await page.$('.p-3.leading-8.shadow.bg-gray-002 nav span[aria-current="page"] + a');
                    if (pagingBtn) {
                        let urlPaging = await pagingBtn.evaluate(el =>  el.href);
                        await driver.gotoUrl(page, urlPaging);
                    } else {
                        break;
                    }
                }
                /**
                 * Lấy nội dung chương truyện
                */
                let index = 1;
                let lastLinkChaper = '';
                for (const chapter of listChapter) {
                    for (let i = 0; i <= 20; i++) {
                        try {
                            await driver.gotoUrl(page, chapter.url);
                            let contentPage = await page.waitForSelector('#chapter_001 .smiley', { visible: true });
                            let contentHTML = await contentPage.evaluate(el => {
                                let arrContent = el.querySelectorAll('p');
                                arrContent = Array.from(arrContent).filter(item => !item.classList.contains('signature'));
                                arrContent = arrContent.map(item => item.outerHTML);
                                return arrContent.join("");
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
                                index++;
                                break;
                            }
                            if (i == 19) {
                                console.log('Error link step ' + i + ' ' + chapter.url + ': ' + error);
                                await SleepHelper.sleep(1000);
                            }
                        }
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
                    chaper_skip: JSON.stringify([])
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
        const driver = await BrowserDriver.getDriver('real_browser');
        const dirProfileName = path.join( `${global.root_path}/public/profile/crawl_truyen`);
        const updateTruyenfull = async (objStory, number) => {
            if (objStory.current != 'vozer.vn') {
                return number;
            }
            if (objStory.status.toLowerCase() == 'full') {
                // await driver.closeBrowser(browser);
                return number;
            }
            const { browser, page } = await driver.getBrowser({
                userDataDir: dirProfileName
              });
            // let page = await browser.newPage();
            const dirStoryName = `${global.root_path}/public${objStory.folder}`;

            try {
               
                // Lưu vào DB
      
                await driver.gotoUrl(page, objStory.link);

                // Status
                const statusText = await page.$eval('#chapter_001 .leading-7', el => {
                    let textStatus = el.querySelectorAll('p strong')[3];
                    return textStatus.innerText;
                });
                let status = '';
                if (statusText.toLowerCase() == 'hoàn thành') {
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
                while (true) {
                    await page.waitForSelector('.p-3.leading-8.shadow.bg-gray-002 table.mb-5', { visible: true });
                    const ChapterEl = await page.$('.p-3.leading-8.shadow.bg-gray-002 table.mb-5 tbody');
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
                    let pagingBtn = await page.$('.p-3.leading-8.shadow.bg-gray-002 nav span[aria-current="page"] + a');
                    if (pagingBtn) {
                        let urlPaging = await pagingBtn.evaluate(el =>  el.href);
                        await driver.gotoUrl(page, urlPaging);
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
                for (const chapter of listChapter) {
                    for (let i = 0; i <= 20; i++) {
                        try {
                            await driver.gotoUrl(page, chapter.url);
                            let contentPage = await page.waitForSelector('#chapter_001 .smiley', { visible: true });
                            let contentHTML = await contentPage.evaluate(el => {
                                let arrContent = el.querySelectorAll('p');
                                arrContent = Array.from(arrContent).filter(item => !item.classList.contains('signature'));
                                arrContent = arrContent.map(item => item.outerHTML);
                                return arrContent.join("");
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
                    chaper_last_link: lastLinkChaper
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
}

module.exports = VozerController;