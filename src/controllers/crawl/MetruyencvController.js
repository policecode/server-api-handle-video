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
const { timeout } = require('puppeteer');
const {NST_BROWSER_PROFILE_ID} = require('../../helpers/random.helper');
class MetruyencvController extends CrawController {
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

    // await this.loginWeb();
    let listTruyen = [];
    if (action == 'one') {
      listTruyen.push(link);
    } else if (action == 'mutiple') {
      const browserLocal = await driver.getBrowser();
      try {
        let pageLocal = await browserLocal.newPage();
        await driver.gotoUrl(pageLocal, link);
        // Login trước khi crawl
        await this.loginWeb(pageLocal);
        await pageLocal.waitForSelector('.grid .flex-shrink-0 a', {
          visible: true,
        });
        listTruyen = await pageLocal.$eval('.grid', (el) => {
          const listElement = el.querySelectorAll('.flex .flex-shrink-0 a');
          let arr = [];
          listElement.forEach((a) => {
            arr.push(a.href);
          });
          return arr;
        });
        await driver.closeBrowser(browserLocal);
      } catch (error) {
        await driver.closeBrowser(browserLocal);
        return res.send('Lỗi ở /api/v1/truyenfull/crawl_tool_story: ' + error);
      }
    } else if (action == 'limit') {
      const browserLocal = await driver.getBrowser();
      try {
        let pageLocal = await browserLocal.newPage();
        await driver.gotoUrl(pageLocal, link);
        // Login trước khi crawl
        await this.loginWeb(pageLocal);
        while (true) {
          await pageLocal.waitForSelector('.grid .flex-shrink-0 a', {
            visible: true,
          });
          let arrStory = await pageLocal.$eval('.grid', (el) => {
            let arr = [];
            const listElement = el.querySelectorAll('.flex .flex-shrink-0 a');
            listElement.forEach((a) => {
              arr.push(a.href);
            });
            return arr;
          });
          for (let y = 0; y < arrStory.length; y++) {
            if (!listTruyen.includes(arrStory[y])) {
              listTruyen.push(arrStory[y]);
            }
          }

          let isPaging = await pageLocal.$('button[data-x-bind="NextPage"]');
          const isChoosePage = await isPaging.evaluate((el) => {
            return el.getAttribute('disabled');
          });
          if (!isChoosePage) {
            await pageLocal.click('button[data-x-bind="NextPage"]');
            await SleepHelper.sleep(1000);
          } else {
            break;
          }
        }
        await driver.closeBrowser(browserLocal);
      } catch (error) {
        await driver.closeBrowser(browserLocal);
        return res.send('Lỗi ở /api/v1/truyenfull/crawl_tool_story: ' + error);
      }
    }

    const downloadTruyenfull = async (link, number) => {
      const browser = await driver.getBrowser();
      try {
        let page = await browser.newPage();
        await driver.gotoUrl(page, link);
        // Login trước khi crawl
        await this.loginWeb(page);
        /**
         * Tạo thư mục chứa truyện
         */
        // Tên truyện
        await page.waitForSelector('.mb-4 h1 a', { visible: true });
        let titleStory = await page.$eval('.mb-4 h1 a', (el) => el.innerText);
        titleStory = titleStory.toUpperCase();
        // Description
        await page.waitForSelector('#synopsis .py-4', { visible: true });
        const description = await page.$eval(
          '#synopsis .py-4 ',
          (el) => el.innerText
        );

        // Author & category
        await page.waitForSelector('.mb-4 .mb-6 a', { visible: true });
        const author = await page.$eval('.mb-4 .mb-6 a', (el) => {
          return el.innerText;
        });

        const category = await page.$eval('.mb-4 .leading-10', (el) => {
          let categoryList = el.querySelectorAll('a');
          let str = 'convert\n';
          categoryList.forEach((catEl, index) => {
            if (index != 0) {
              str += catEl.innerText + '\n';
            }
          });
          return str;
        });

        // Status
        // await page.waitForSelector('#book-status', { visible: true });
        const statusText = await page.$eval('.mb-4 .leading-10', (el) => {
          let statusEl = el.querySelectorAll('a')[0];
          return statusEl.innerText;
        });
        let status = '';
        if (statusText.toLowerCase() == 'hoàn thành') {
          status = 'Full';
        } else {
          status = 'Đang ra';
        }

        // Image
        await page.waitForSelector('.mb-4 .mb-3 a img', {
          visible: true,
        });
        const linkImage = await page.$eval('.mb-4 .mb-3 a img', (el) => {
          return el.src;
        });
        /**
         * File thông tin truyện
         */
        const folderStory = `/crawl/${current}/${RandomHelper.changeSlug(
          titleStory
        )}/`;
        const dirStoryName = `${global.root_path}/public${folderStory}`;
        // Kiểm tra truyện đã tồn tại trong DB ko crawl nữa
        const checkStory = await this.showDetail({ title: titleStory });
        // console.log(checkStory);
        if (checkStory.result) {
          await driver.closeBrowser(browser);
          if (checkStory.data.current == 'metruyencv.com') {
            await SleepHelper.sleep(5000);
            const responeUpdate = await axios({
              url: `http://${req.get('host')}/api/truyenfullsuper/update_story`,
              method: 'post',
              data: {
                list_folder_obj: [checkStory.data],
                current: 'metruyencv.com',
                thread: 1,
              },
            });
          }
          return number;
        }
        FileHelper.createFolderAnfFile(
          dirStoryName,
          'title.txt',
          titleStory + ' (C)'
        );
        FileHelper.createFolderAnfFile(
          dirStoryName,
          'description.txt',
          description
        );
        FileHelper.createFolderAnfFile(dirStoryName, 'author.txt', author);
        FileHelper.createFolderAnfFile(dirStoryName, 'category.txt', category);
        FileHelper.createFolderAnfFile(dirStoryName, 'status.txt', status);

        // Save thumbnail
        const arrImage = linkImage.split('.');
        // console.log(arrImage);
        let extAvatar = arrImage[arrImage.length - 1];
        const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp'];
        if (!extArr.includes(extAvatar)) {
          extAvatar = 'jpg';
        }
        FileHelper.downloadFile(linkImage, dirStoryName, `avatar.${extAvatar}`);
        // Link truyện crawl
        FileHelper.createFolderAnfFile(dirStoryName, 'linkstory.txt', link);

        /**
         * Lấy danh sách các chương truyện
         */
        let listChapter = [];
        let buttonChapter = await page.waitForSelector('.pb-3 .flex button.flex', {visible: true});
        await buttonChapter.click();
        while (true) {
          await page.waitForSelector('#chapters .pt-6 div .grid a', {
            visible: true,
          });
          const ChapterEl = await page.$('#chapters .pt-6 div .grid');
          const list = await ChapterEl.evaluate((el) => {
            let listTmp = [];
            const listElement = el.querySelectorAll('a');
            listElement.forEach((elChapter) => {
              const url = elChapter.href;
              const chapterText = elChapter.querySelector('.text-sm').innerText;
              listTmp.push({ chapterText, url });
            });
            return listTmp;
          });
          for (let y = 0; y < list.length; y++) {
            const isCheck = listChapter.find(
              (chapter) => chapter.url == list[y].url
            );
            if (!isCheck) {
              listChapter.push(list[y]);
            }
          }
          break;
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
              let contentPage = await page.waitForSelector(
                '#chapter-detail div.break-words',
                {
                  visible: true,
                }
              );

              let contentHTML = await contentPage.evaluate((el) => {
                const content = el.innerHTML;
                return content;
              });

              /**
               * Xử lý việc ghi file
               */

              // Thư mục chương
              const dirChapterFolder = dirStoryName + index + '/';
              // tiêu đề chương
              FileHelper.createFolderAnfFile(
                dirChapterFolder,
                'title.txt',
                chapter.chapterText
              );

              FileHelper.createFolderAnfFile(
                dirChapterFolder,
                'text.txt',
                contentHTML
              );

              // Chương update cuối cùng
              lastLinkChaper = chapter.url;
              await SleepHelper.sleep(1000);
              index++;
              break;
            } catch (error) {
              if (i == 20) {
                folderSkip.push({
                  folder: index,
                  link: chapter.url,
                });
                index++;
                break;
              }
              if (i == 19) {
                console.log(
                  'Error link step ' + i + ' ' + chapter.url + ': ' + error
                );
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
          chaper_last_folder: index - 1,
          chaper_last_link: lastLinkChaper,
          chaper_skip: JSON.stringify(folderSkip),
        });
        await driver.closeBrowser(browser);
        return number;
      } catch (error) {
        await driver.closeBrowser(browser);
        console.log('Error API /api/v1/truyfenull/crawl_tool_story: ' + error);
        return number;
      }
    };

    // Chạy các luồng
    let number = 0;
    while (number < listTruyen.length) {
      if (queueThread.length < thread && !queueThread.includes(number)) {
        queueThread.push(number);
        downloadTruyenfull(listTruyen[number], number)
          .then((indexNumber) => {
            const index = queueThread.indexOf(indexNumber);
            if (index !== -1) {
              console.log('success theard: ' + indexNumber);
              queueThread.splice(index, 1);
            }
          })
          .catch((indexNumber) => {
            const index = queueThread.indexOf(indexNumber);
            if (index !== -1) {
              console.log('error theard: ' + indexNumber);
              queueThread.splice(index, 1);
            }
          });
        number++;
      }
      await SleepHelper.sleep(10000);
    }
    // await HandlePage.closeBrowser(browser);
    return res.status(200).send({
      message: 'Đang chạy, xem màn hình process để xem tiến trình chạy',
    });
  }

  // Cập nhật chương mới của truyện và crawl lại những trang bị lỗi
  async handleUpdateStory(req, res) {
    let { current, list_folder_obj } = req.body;
    let queueThread = [];
    let thread = req.body.thread ? req.body.thread : 1;
    const driver = await BrowserDriver.getDriver('dev_tool');

    const updateTruyenfull = async (objStory, number) => {
      if (objStory.current != 'metruyencv.com') {
        return number;
      }
      if (objStory.status.toLowerCase() == 'full') {
        // await driver.closeBrowser(browser);
        return number;
      }
      const browser = await driver.getBrowser();
      let page = await browser.newPage();
      const dirStoryName = `${global.root_path}/public${objStory.folder}`;
      // Login trước khi crawl
      try {
        // ====Xử lý những chương truyện crawl hỏng====
        let folderSkip = [];

        await driver.gotoUrl(page, objStory.link);
        await this.loginWeb(page);

        // Status
        await page.waitForSelector('.mb-4 .leading-10', {
          visible: true,
        });

        const statusText = await page.$eval('.mb-4 .leading-10', (el) => {
          let statusEl = el.querySelectorAll('a')[0];
          return statusEl.innerText;
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
        let buttonChapter = await page.waitForSelector(
          '.pb-3 .flex button.flex',
          {
            visible: true,
          }
        );
        await buttonChapter.click();
        while (true) {
          await page.waitForSelector('#chapters .pt-6 div .grid a', {
            visible: true,
          });
          const ChapterEl = await page.$('#chapters .pt-6 div .grid');
          const list = await ChapterEl.evaluate((el) => {
            let listTmp = [];
            const listElement = el.querySelectorAll('a');
            listElement.forEach((elChapter) => {
              const url = elChapter.href;
              const chapterText = elChapter.querySelector('.text-sm').innerText;
              listTmp.push({ chapterText, url });
            });
            return listTmp;
          });
          for (let y = 0; y < list.length; y++) {
            const isCheck = listChapter.find(
              (chapter) => chapter.url == list[y].url
            );
            if (!isCheck) {
              listChapter.push(list[y]);
            }
          }
          break;
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
              let contentPage = await page.waitForSelector(
                '#chapter-detail div.break-words',
                { visible: true }
              );

              let contentHTML = await contentPage.evaluate((el) => {
                const content = el.innerHTML;
                return content;
              });
              //  Loại bỏ quảng cáo khi tải về

              // Thư mục chương
              const dirChapterFolder = dirStoryName + index + '/';

              // tiêu đề chương
              FileHelper.createFolderAnfFile(
                dirChapterFolder,
                'title.txt',
                chapter.chapterText
              );
              // Nội dung chương
              FileHelper.createFolderAnfFile(
                dirChapterFolder,
                'text.txt',
                contentHTML
              );
              // Chương update cuối cùng
              lastLinkChaper = chapter.url;
              await SleepHelper.sleep(1000);
              index++;
              break;
            } catch (error) {
              if (i == 20) {
                folderSkip.push({
                  folder: index,
                  link: chapter.url,
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
          chaper_last_folder: index - 1,
          chaper_last_link: lastLinkChaper,
          chaper_skip: JSON.stringify(folderSkip),
        });
          await driver.closeBrowser(browser);
        return number;
      } catch (error) {
          await driver.closeBrowser(browser);
        console.log('Error API /api/v1/truyenfull/crawl_tool_story: ' + error);
        return number;
      }
    };

    // Chạy các luồng
    let number = 0;
    while (number < list_folder_obj.length) {
      if (queueThread.length < thread && !queueThread.includes(number)) {
        queueThread.push(number);
        updateTruyenfull(list_folder_obj[number], number)
          .then((indexNumber) => {
            const index = queueThread.indexOf(indexNumber);
            if (index !== -1) {
              console.log('success theard: ' + indexNumber);
              queueThread.splice(index, 1);
            }
          })
          .catch((indexNumber) => {
            const index = queueThread.indexOf(indexNumber);
            if (index !== -1) {
              console.log('error theard: ' + indexNumber);
              queueThread.splice(index, 1);
            }
          });
        number++;
      }
      await SleepHelper.sleep(10000);
    }
    // await HandlePage.closeBrowser(browser);
    return res.status(200).send({
      message: 'Đang chạy, xem màn hình process để xem tiến trình chạy',
    });
  }

  async loginWeb(page, user="dat0961555152@gmail.com", pass="dat9531487") {
    await page.click(`button[data-x-bind="OpenModal('menu')"`);
    let loginBtn = await page.$(
      `button[data-x-bind="OpenModal('login')"]`,
      { visible: true }
    );
    await loginBtn.click();
    await page.waitForSelector('input[data-x-model="form.email"]', {
      visible: true,
    });
    await page.type('input[data-x-model="form.email"]', user);
    await page.waitForSelector('input[data-x-model="form.password"]', {
      visible: true,
    });
    await page.type('input[data-x-model="form.password"]', pass);
    while (true) {
      await page.waitForSelector(
        '.flex.justify-center button[data-x-bind="Submit"].bg-primary',
        { visible: true }
      );
      await page.click(
        '.flex.justify-center button[data-x-bind="Submit"].bg-primary'
      );
      try {
        await page.waitForSelector(
          'div.px-4 .flex.items-center.justify-between .ml-3 button',
          { visible: true, timeout: 20000}
        );
        await page.click(
          'div.px-4 .flex.items-center.justify-between .ml-3 button'
        );
        break;
      } catch (error) {
        console.log('Đăng nhập lại');
      }
    }
  }
}

module.exports = MetruyencvController;
