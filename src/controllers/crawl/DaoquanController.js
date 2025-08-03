const db = require('../../models/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
// const http = require('http');
// const https = require('https');
const FormData = require('form-data');
const CrawController = require('../CrawController');
const BrowserDriver = require('../../drivers/BrowserDriver');
const RandomHelper = require('../../helpers/random.helper');
const FileHelper = require('../../helpers/file.helper');
const SleepHelper = require('../../helpers/sleep.helper');
const { log } = require('console');
const { KnownDevices } = require('puppeteer');

class DaoquanController extends CrawController {
  constructor() {
    // --max-old-space-size=8192 --inspect
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

    } else if (action == 'limit') {

    }
    const downloadTruyenfull = async (link, number) => {
      const browser = await driver.getBrowser();
      const iPhone = KnownDevices['iPhone 11 Pro'];
      try {
        let page = await browser.newPage();
        await page.emulate(iPhone);
        await driver.gotoUrl(page, link);
        /**
         * Tạo thư mục chứa truyện
        */
        // Tên truyện
        await page.waitForSelector('.book-detail_heading .detail h4', {
          visible: true,
        });
        let titleStory = await page.$eval(
          '.book-detail_heading .detail h4',
          (el) => el.innerText
        );
        titleStory = titleStory.replace("[Dịch]", "").trim();
        titleStory = titleStory.replace("[Dịch thô]", "").trim();
        titleStory = titleStory.toUpperCase();

        // Description
        await page.waitForSelector('.desc-text a', {
          visible: true,
        });
        await page.click('.desc-text a');
        const description = await page.$eval(
          '.desc-text .book-introduce',
          (el) => el.innerText
        );

        // Author & category
        // .module-box .module-content .book-layout h4.book-title 
        await page.waitForSelector('.module-box .module-content .book-layout h4.book-title ', { visible: true });
        const author = await page.$eval('.module-box .module-content .book-layout h4.book-title ', el => {
          return el.innerText;
        });
        const category = await page.$eval(
          '.book-detail_heading .detail .item-author',
          (el) => {
            let category = el.querySelector('a').innerText;
            return category;
          }
        );

        // Image
        await page.waitForSelector('.book-detail_heading img.book-detail_heading-img', {
          visible: true,
        });

        const linkImage = await page.$eval(
          '.book-detail_heading img.book-detail_heading-img',
          (el) => {
            return el.src;
          }
        );

        // Status
        await page.waitForSelector('.book-detail_heading .detail .item-update', {
          visible: true,
        });
        const statusText = await page.$eval('.book-detail_heading .detail .item-update', (el) => {
          let tmpArr = el.innerText.split('|')
          return tmpArr[1].trim();
        }
        );
        let status = '';
        if (statusText.toLowerCase() == 'hoàn thành') {
          status = 'Full';
        } else {
          status = 'Đang ra';
        }

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
          if (checkStory.data.current == 'daoquan.vn') {
            await SleepHelper.sleep(5000);
            const responeUpdate = await axios({
              url: `http://${req.get('host')}/api/truyenfullsuper/update_story`,
              method: 'post',
              data: {
                list_folder_obj: [checkStory.data],
                current: 'daoquan.vn',
                thread: 1,
              },
            });
          }
          return number;
        }

        FileHelper.createFolderAnfFile(dirStoryName, 'title.txt', titleStory);
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
        await page.waitForSelector('.ttv-btn-group .btn-group-cell #btnAddToBookshelf', {
          visible: true,
        });
        await page.click('.ttv-btn-group .btn-group-cell #btnAddToBookshelf');
        await SleepHelper.sleep(1000);
        await page.waitForSelector('.drawer-custom__body .fl', {
          visible: true,
        });

        let chapterEl = await page.$$('.drawer-custom__body .fl ul');
        listChapter = await chapterEl[1].evaluate(el => {
          let chapterList = el.querySelectorAll('li a');
          tmpArr = [];
          chapterList.forEach(aElement => {
            tmpArr.push({
              chapterText: aElement.innerText,
              url: aElement.href
            });
          });
          return tmpArr;
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
              let contentPage = await page.waitForSelector(
                '.content-chapter-mobile',
                { visible: true }
              );

              let contentHTML = await contentPage.evaluate((el) => {
                const content = el.innerHTML;
                return content;
              });
              //  Loại bỏ quảng cáo khi tải về
              // contentHTML = contentHTML.replaceAll(/<div.*?>/gms, '');
              // contentHTML = contentHTML.replaceAll(/<\/div>/gms, '');
              // contentHTML = contentHTML.replaceAll(
              //   /<script.*?\/script>/gms,
              //   ''
              // );
              // contentHTML = contentHTML.replaceAll(/<style.*?\/style>/gms, '');

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
        await SleepHelper.sleep(5000);
      } else {
        await SleepHelper.sleep(2000);
      }
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
    const iPhone = KnownDevices['iPhone 11 Pro'];
      
    const updateTruyenfull = async (objStory, number) => {
      if (objStory.current != 'daoquan.vn') {
        return number;
      }
      if (objStory.status.toLowerCase() == 'full') {
        // await driver.closeBrowser(browser);
        return number;
      }
      const browser = await driver.getBrowser();
      let page = await browser.newPage();
      await page.emulate(iPhone);
      const dirStoryName = `${global.root_path}/public${objStory.folder}`;

      try {
        // ====Xử lý những chương truyện crawl hỏng====


        await driver.gotoUrl(page, objStory.link);

       // Status
       await page.waitForSelector('.book-detail_heading .detail .item-update', {
        visible: true,
      });
      const statusText = await page.$eval('.book-detail_heading .detail .item-update', (el) => {
        let tmpArr = el.innerText.split('|')
        return tmpArr[1].trim();
      }
      );
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
        await page.waitForSelector('.ttv-btn-group .btn-group-cell #btnAddToBookshelf', {
          visible: true,
        });
        await page.click('.ttv-btn-group .btn-group-cell #btnAddToBookshelf');
        await SleepHelper.sleep(1000);
        await page.waitForSelector('.drawer-custom__body .fl', {
          visible: true,
        });

        let chapterEl = await page.$$('.drawer-custom__body .fl ul');
        listChapter = await chapterEl[1].evaluate(el => {
          let chapterList = el.querySelectorAll('li a');
          tmpArr = [];
          chapterList.forEach(aElement => {
            tmpArr.push({
              chapterText: aElement.innerText,
              url: aElement.href
            });
          });
          return tmpArr;
        });

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
              let contentPage = await page.waitForSelector(
                '.content-chapter-mobile',
                { visible: true }
              );

              let contentHTML = await contentPage.evaluate((el) => {
                const content = el.innerHTML;
                return content;
              });
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

module.exports = DaoquanController;
