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

class TruyenfullController extends CrawController {
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
                const elListTruyen = await pageLocal.waitForSelector('.container .col-truyen-main .list.list-truyen', { visible: true });
                listTruyen = await elListTruyen.evaluate(el => {
                    const listElement = el.querySelectorAll('h3.truyen-title a');
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
                    const elListTruyen = await pageLocal.waitForSelector('.container .col-truyen-main .list.list-truyen', { visible: true });
                    let arrStory = await elListTruyen.evaluate(el => {
                        let arr = [];
                        const listElement = el.querySelectorAll('h3.truyen-title a');
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

                    let isPaging = await pageLocal.$('.pagination-container ul.pagination  li.active + li');
                    if (isPaging) {
                        const isChoosePage = await isPaging.evaluate(el => {
                            return !el.classList.contains('page-nav');
                        });
                        if (isChoosePage) {
                            await pageLocal.click('.pagination-container ul.pagination li.active + li a');
                            await SleepHelper.sleep(1000);
                        } else {
                            break;
                        }
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
                await page.waitForSelector('.col-truyen-main h3.title', { visible: true });
                const titleStory = await page.$eval('.col-truyen-main h3.title', el => el.innerText);
                // Description
                await page.waitForSelector('.col-truyen-main .desc-text', { visible: true });
                const description = await page.$eval('.col-truyen-main .desc-text', el => el.innerText);
                // Author & category
                await page.waitForSelector('.col-truyen-main .info-holder .info', { visible: true });
                const author = await page.$eval('.col-truyen-main .info-holder .info', el => {
                    return el.querySelector('a[itemprop="author"]').innerText;
                });
                const category = await page.$eval('.col-truyen-main .info-holder .info', el => {
                    let categoryList = el.querySelectorAll('a[itemprop="genre"]');
                    let str = '';
                    categoryList.forEach(catEl => {
                        str += catEl.innerText + '\n';
                    });
                    return str;
                });
                // Image 
                await page.waitForSelector('.col-truyen-main .info-holder .book', { visible: true });
                const linkImage = await page.$eval('.col-truyen-main .info-holder .book', el => {
                    return el.querySelector('img').src;
                });
                // Status
                await page.waitForSelector('.col-truyen-main .info-holder .info span', { visible: true });
                const status = await page.$eval('.col-truyen-main .info-holder .info', el => {
                    let elementBlock = el.querySelector('span.text-primary');
                    if (elementBlock) {
                        return elementBlock.innerText;
                    }
                    elementBlock = el.querySelector('span.text-success');
                    if (elementBlock) {
                        return elementBlock.innerText;
                    }
                    return '';
                });
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
                    if (checkStory.data.current == 'truyenfull.tv') {
                        const responeUpdate = await axios({
                            url: `http://${req.get('host')}/api/truyenfullsuper/update_story`,
                            method: 'post',
                            data: {
                              list_folder_obj: [checkStory.data],
                              current: 'truyenfull.tv',
                              thread: 1
                            },
                      
                          });
                    }
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
                while (true) {
                    const ChapterEl = await page.waitForSelector('#list-chapter', { visible: true });
                    const list = await ChapterEl.evaluate(el => {
                        let listTmp = [];
                        const listElement = el.querySelectorAll('.list-chapter li');
                        listElement.forEach(elChapter => {
                            const url = elChapter.querySelector('a').href;
                            const chapterText = elChapter.querySelector('a').innerText;
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

                    let isPaging = await page.$('#list-chapter .pagination li.active + li');
                    if (isPaging) {
                        const isChoosePage = await isPaging.evaluate(el => {
                            return !el.classList.contains('page-nav');
                        });
                        if (isChoosePage) {
                            let url = await isPaging.evaluate(el => {
                                return el.querySelector('a').href;
                            })
                            await driver.gotoUrl(page, url);
                            await SleepHelper.sleep(3000);
                        } else {
                            break;
                        }
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
                for (const chapter of listChapter) {
                    for (let i = 0; i <= 20; i++) {
                        try {
                            await driver.gotoUrl(page, chapter.url);
                            let contentPage = await page.waitForSelector('#chapter-big-container', { visible: true });
                            let contentHTML = await contentPage.evaluate(el => {
                                const content = el.querySelector('.chapter-c').innerHTML;
                                return content;
                            });
                            //  Loại bỏ quảng cáo khi tải về
                            contentHTML = contentHTML.replaceAll(/<div.*?\/div>/gms, '');
                            contentHTML = contentHTML.replaceAll(/<script.*?\/script>/gms, '');
                            contentHTML = contentHTML.replaceAll(/<style.*?\/style>/gms, '');
                            contentHTML = contentHTML.replaceAll(/<\/div>/gms, '');

                            /**
                             * Xử lý việc ghi file
                             */

                            // Thư mục chương
                            const dirChapterFolder = dirStoryName + index + '/';
                            // tiêu đề chương
                            FileHelper.createFolderAnfFile(dirChapterFolder, 'title.txt', chapter.chapterText);
                            /**
                             * Xử lý trường hợp trang truyện có hình ảnh hoặc có nội dung chữ
                             * - Trường hợp này lấy luôn hình ảnh của trang web mình craw
                             */
                            // let rexgex = /<img.*?>/g;
                            // let arrImg = contentHTML.match(rexgex);
                            // if (arrImg) {
                            //     const dirImage = dirChapterFolder + 'image/';
                            //     for (let i = 0; i < arrImg.length; i++) {
                            //         try {
                            //             const resultMatch = /src="(.*?)"/g.exec(arrImg[i]);
                            //             const urlImage = resultMatch[1];
                            //             // Loại bỏ đường dẫn ảnh cũ đổi thành {{image-i}}; i tương ứng với tên ảnh trong folder image
                            //             contentHTML = contentHTML.replace(urlImage, '{{image-' + (i + 1) + '}}');
                            //             const arrSplitLink = urlImage.split('.');
                            //             const ext = arrSplitLink[arrSplitLink.length - 1];
                            //             const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp']
                            //             if (!extArr.includes(ext)) {
                            //                 ext = 'jpg'
                            //             }
                            //             FileHelper.downloadFile(urlImage, dirImage, `${i + 1}.${ext}`);

                            //         } catch (error) {
                            //             console.log('Error save image ' + titleStory + ' chapter-' + index + ' :' + error);
                            //         }
                            //     }

                            // }
                            FileHelper.createFolderAnfFile(dirChapterFolder, 'text.txt', contentHTML);

                            // Chương update
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
            if (objStory.current != 'truyenfull.tv') {
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

                                let contentPage = await page.waitForSelector('#chapter-big-container', { visible: true, timeout: 5000 });
                                let titleText = await contentPage.evaluate(el => {
                                    const title = el.querySelector('a.chapter-title').innerText;
                                    return title;
                                });
                                let contentHTML = await contentPage.evaluate(el => {
                                    const content = el.querySelector('.chapter-c').innerHTML;
                                    return content;
                                });
                                //  Loại bỏ quảng cáo khi tải về
                                contentHTML = contentHTML.replaceAll(/<div.*?\/div>/gms, '');
                                contentHTML = contentHTML.replaceAll(/<script.*?\/script>/gms, '');
                                contentHTML = contentHTML.replaceAll(/<style.*?\/style>/gms, '');
                                contentHTML = contentHTML.replaceAll(/<\/div>/gms, '');

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
                this.updateDBStory(objStory.id, {
                    chaper_skip: JSON.stringify(folderSkip),
                });
                /**
                 * =================== Điều kiện để được update =====================
                 */
                await driver.gotoUrl(page, objStory.link);

                // Status
                await page.waitForSelector('.col-truyen-main .info-holder .info span', { visible: true });
                const status = await page.$eval('.col-truyen-main .info-holder .info', el => {
                    let elementBlock = el.querySelector('span.text-primary');
                    if (elementBlock) {
                        return elementBlock.innerText;
                    }
                    elementBlock = el.querySelector('span.text-success');
                    if (elementBlock) {
                        return elementBlock.innerText;
                    }
                    return '';
                });
                /**
                 * File thông tin truyện
                 */

                FileHelper.createFolderAnfFile(dirStoryName, 'status.txt', status);

                /**
                 * Lấy danh sách các chương truyện
                 */
                let listChapter = [];
                while (true) {
                    const ChapterEl = await page.waitForSelector('#list-chapter', { visible: true });
                    const list = await ChapterEl.evaluate(el => {
                        let listTmp = [];
                        const listElement = el.querySelectorAll('.list-chapter li');
                        listElement.forEach(elChapter => {
                            const url = elChapter.querySelector('a').href;
                            const chapterText = elChapter.querySelector('a').innerText;
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

                    let isPaging = await page.$('#list-chapter .pagination li.active + li');
                    if (isPaging) {
                        const isChoosePage = await isPaging.evaluate(el => {
                            return !el.classList.contains('page-nav');
                        });
                        if (isChoosePage) {
                            let url = await isPaging.evaluate(el => {
                                return el.querySelector('a').href;
                            })
                            await driver.gotoUrl(page, url);
                            await SleepHelper.sleep(3000);
                        } else {
                            break;
                        }
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

                if (!(listChapter.length > 0)) {
                    await driver.closeBrowser(browser);
                    return number;
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
                            let contentPage = await page.waitForSelector('#chapter-big-container', { visible: true });
                            let contentHTML = await contentPage.evaluate(el => {
                                const content = el.querySelector('.chapter-c').innerHTML;
                                return content;
                            });
                            //  Loại bỏ quảng cáo khi tải về
                            contentHTML = contentHTML.replaceAll(/<div.*?\/div>/gms, '');
                            contentHTML = contentHTML.replaceAll(/<script.*?\/script>/gms, '');
                            contentHTML = contentHTML.replaceAll(/<style.*?\/style>/gms, '');
                            contentHTML = contentHTML.replaceAll(/<\/div>/gms, '');

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
                const elListTruyen = await pageLocal.waitForSelector('.container .col-truyen-main .list.list-truyen', { visible: true });
                listTruyen = await elListTruyen.evaluate(el => {
                    const listElement = el.querySelectorAll('h3.truyen-title a');
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
                    const elListTruyen = await pageLocal.waitForSelector('.container .col-truyen-main .list.list-truyen', { visible: true });
                    let arrStory = await elListTruyen.evaluate(el => {
                        let arr = [];
                        const listElement = el.querySelectorAll('h3.truyen-title a');
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

                    let isPaging = await pageLocal.$('.pagination-container ul.pagination  li.active + li');
                    if (isPaging) {
                        const isChoosePage = await isPaging.evaluate(el => {
                            return !el.classList.contains('page-nav');
                        });
                        if (isChoosePage) {
                            await pageLocal.click('.pagination-container ul.pagination li.active + li a');
                            await SleepHelper.sleep(1000);
                        } else {
                            break;
                        }
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
                await page.setViewport({
                    width: 1000,
                    height: 680,
                    deviceScaleFactor: 1,
                  })
                await driver.gotoUrl(page, link);
                await page.waitForSelector('.comment-box.visible-md-block.visible-lg-block', { visible: true });
                await page.hover('.comment-box.visible-md-block.visible-lg-block');
                await page.waitForSelector('.fb-comments.fb_iframe_widget.fb_iframe_widget_fluid_desktop iframe', { visible: true });
                const srcComment = await page.$eval('.fb-comments.fb_iframe_widget.fb_iframe_widget_fluid_desktop iframe', el => el.src);
                await driver.gotoUrl(page, srcComment);
                await page.waitForSelector('.UFIInputContainer', { visible: true, hidden: true });
                await page.click('.UFIInputContainer');
                await page.type('.UFIInputContainer', comment)
                await page.waitForSelector('button.rfloat', { visible: true, hidden: true });
                await page.click('button.rfloat');
                await SleepHelper.sleep(5000);
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

module.exports = TruyenfullController;