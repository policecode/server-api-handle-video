const CrawController = require('../CrawController');
const BrowserDriver = require('../../drivers/BrowserDriver');
const RandomHelper = require('../../helpers/random.helper');
const FileHelper = require('../../helpers/file.helper');
const SleepHelper = require('../../helpers/sleep.helper');
const Config = require('../../config');

class MonkeyController extends CrawController {
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
                const elListTruyen = await pageLocal.waitForSelector('.row.product-grid', { visible: true });
                listTruyen = await elListTruyen.evaluate(el => {
                    const listElement = el.querySelectorAll('.card .position-relative a');
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
           
        }
        
        const downloadTruyenfull = async (link, number) => {
            const browser = await driver.getBrowser();
            try {
                let page = await browser.newPage();
                 // Ko load ảnh
                // await page.setRequestInterception(true);
                // page.on("request", (request) => {
                // if (request.resourceType() === "image") {
                //     request.abort();
                // } else {
                //     request.continue();
                // }
                // });
                await driver.gotoUrl(page, link);

                /**
                 * Tạo thư mục chứa truyện
                 */
                // Tên truyện
                await page.waitForSelector('.card .row.g-0 .col-md-9 h2.card-title', { visible: true });
                let titleStory = await page.$eval('.card .row.g-0 .col-md-9 h2.card-title', el => el.innerText);
                titleStory = titleStory.toUpperCase();
                // Description
                await page.waitForSelector('.card .row.g-0 .col-md-9 .story-description .ql-editor', { visible: true });
                const description = await page.$eval('.card .row.g-0 .col-md-9 .story-description .ql-editor', el => el.innerText);
                // Author & category
                await page.waitForSelector('.card .row.g-0 .col-md-9 dd.col-sm-9', { visible: true });
                let author = await page.$eval('.card .row.g-0 .col-md-9', el => {
                    if (el.querySelectorAll('dt.col-sm-3')[2].innerText.toLowerCase() == 'tác giả') {
                        return el.querySelectorAll('dd.col-sm-9')[2].innerText;
                    } else {
                        return 'Đang cập nhật';
                    }
                });
                author = author.replace("(dịch)", "").trim();
                const category = await page.$eval('.card .row.g-0 .col-md-9', el => {
                    let categoryList = el.querySelectorAll('dd.col-sm-9 a.cate-item');
                    let str = '';
                    categoryList.forEach(catEl => {
                        str += catEl.innerText + '\n';
                    });
                    return str;
                });
              
                // Image 
                // await page.waitForSelector('.card .row.g-0 .col-md-3 img', { visible: true });
                // const linkImage = await page.$eval('.card .row.g-0 .col-md-3', el => {
                //     return el.querySelector('img').src;
                // });
                // Status
                const statusText = await page.$eval('.card .row.g-0 .col-md-9', (el) => {
                    if (el.querySelectorAll('dd.col-sm-9')[8]) {
                        let statusEl = el.querySelectorAll('dd.col-sm-9')[8];
                        return statusEl.innerText;
                    } else {
                        let statusEl = el.querySelectorAll('dd.col-sm-9')[7];
                        return statusEl.innerText;
                    }
                  });
                  let status = '';
                  if (statusText.toLowerCase() == 'đã đủ bộ') {
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
                    console.log(`Truyện này đã crawl ở trang ${checkStory.data.current}`);
                    
                    // if (checkStory.data.current == 'monkeydtruyen.com') {
                        
                    //     const responeUpdate = await axios({
                    //         url: `http://${req.get('host')}/api/truyenfullsuper/update_story`,
                    //         method: 'post',
                    //         data: {
                    //           list_folder_obj: [checkStory.data],
                    //           current: 'monkeydtruyen.com',
                    //           thread: 1
                    //         },
                      
                    //       });
                    // }
                    return number;
                }

                FileHelper.createFolderAnfFile(dirStoryName, 'title.txt', titleStory);
                FileHelper.createFolderAnfFile(dirStoryName, 'description.txt', description);
                FileHelper.createFolderAnfFile(dirStoryName, 'author.txt', author);
                FileHelper.createFolderAnfFile(dirStoryName, 'category.txt', category);
                FileHelper.createFolderAnfFile(dirStoryName, 'status.txt', status);

                // Save thumbnail
                const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp']
                const screenAvatar = await page.waitForSelector('.card .row.g-0 .col-md-3 img', { visible: true });
                await screenAvatar.evaluate((el) => el.style.transform = 'scale(2.5)' );
                await screenAvatar?.screenshot({ fullPage: false,  
                    path: `${dirStoryName}/avatar.jpg`,
                    type: 'jpeg',
                    quality: 100,
                    fromSurface: true
                });
                // Link truyện crawl
                FileHelper.createFolderAnfFile(dirStoryName, 'linkstory.txt', link);

                /**
                 * Lấy danh sách các chương truyện
                 */
                let ChapterEl = await page.waitForSelector('.card .tab-content .tab-pane .list-chapters', { visible: true });
                let listChapter = await ChapterEl.evaluate(el => {
                    let listTmp = [];
                    const listElement = el.querySelectorAll('a');
                    listElement.forEach(elChapter => {
                        const url = elChapter.href;
                        const chapterText = elChapter.innerText;
                        listTmp.push({ chapterText, url });
                    });
        
                    return listTmp.reverse();
                });

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
                            let contentPage = await page.waitForSelector('#chapter-content-render', { visible: true });
                            let contentHTML = await contentPage.evaluate(el => {
                                let arrContent = el.querySelectorAll('p');
                                arrContent = Array.from(arrContent).filter(item => !item.classList.contains('signature'));
                                arrContent = arrContent.map(item => item.outerHTML);

                                // const content = el.innerHTML;
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
                console.log(`crawl thành công truyện: ${titleStory} - Tác giả: ${author}`);
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
            if (objStory.current != 'monkeydtruyen.com') {
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
         
                /**
                 * =================== Điều kiện để được update =====================
                 */
                await driver.gotoUrl(page, objStory.link);

                // Status
                const statusText = await page.$eval('.card .row.g-0 .col-md-9', (el) => {
                    if (el.querySelectorAll('dd.col-sm-9')[8]) {
                        let statusEl = el.querySelectorAll('dd.col-sm-9')[8];
                        return statusEl.innerText;
                    } else {
                        let statusEl = el.querySelectorAll('dd.col-sm-9')[7];
                        return statusEl.innerText;
                    }
                  });
                  let status = '';
                  if (statusText.toLowerCase() == 'đã đủ bộ') {
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
                let ChapterEl = await page.waitForSelector('.card .tab-content .tab-pane .list-chapters', { visible: true });
                let listChapter = await ChapterEl.evaluate(el => {
                    let listTmp = [];
                    const listElement = el.querySelectorAll('a');
                    listElement.forEach(elChapter => {
                        const url = elChapter.href;
                        const chapterText = elChapter.innerText;
                        listTmp.push({ chapterText, url });
                    });
        
                    return listTmp.reverse();
                });

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
                            let contentPage = await page.waitForSelector('#chapter-content-render', { visible: true });
                            let contentHTML = await contentPage.evaluate(el => {
                                let arrContent = el.querySelectorAll('p');
                                arrContent = Array.from(arrContent).filter(item => !item.classList.contains('signature'));
                                arrContent = arrContent.map(item => item.outerHTML);

                                // const content = el.innerHTML;
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
        });

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
                let indexPage = 1;
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
                        if (isChoosePage && (indexPage <= 10)) {
                            const urlNext = await isPaging.evaluate(el => {
                                return el.querySelector('a').href;
                            });
                            while(true) {
                                try {
                                    await driver.gotoUrl(pageLocal, urlNext);
                                    await SleepHelper.sleep(1000);
                                    await pageLocal.waitForSelector('.container .col-truyen-main .list.list-truyen', { visible: true });
                                    break;
                                } catch (error) {
                                    console.log('Load lại trang');
                                    
                                }
                            }
                            ++indexPage;
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
                await driver.gotoUrl(page, link);
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

module.exports = MonkeyController;