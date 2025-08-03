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

class NhasachController extends CrawController {
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
    //   const browserLocal = await driver.getBrowser();
    //   try {
    //     let pageLocal = await browserLocal.newPage();
    //     await driver.gotoUrl(pageLocal, link);
    //     const elListTruyen = await pageLocal.waitForSelector(
    //       '.container .col-truyen-main .list.list-truyen',
    //       { visible: true }
    //     );
    //     listTruyen = await elListTruyen.evaluate((el) => {
    //       const listElement = el.querySelectorAll('h3.truyen-title a');
    //       let arr = [];
    //       listElement.forEach((a) => {
    //         arr.push(a.href);
    //       });
    //       return arr;
    //     });
    //     await driver.closeBrowser(browserLocal);
    //   } catch (error) {
    //     await driver.closeBrowser(browserLocal);
    //     return res.send('Lỗi ở /api/v1/truyenfull/crawl_tool_story: ' + error);
    //   }
    } else if (action == 'limit') {
    //   const browserLocal = await driver.getBrowser();
    //   try {
    //     let pageLocal = await browserLocal.newPage();
    //     await driver.gotoUrl(pageLocal, link);
    //     while (true) {
    //       const elListTruyen = await pageLocal.waitForSelector(
    //         '.container .col-truyen-main .list.list-truyen',
    //         { visible: true }
    //       );
    //       let arrStory = await elListTruyen.evaluate((el) => {
    //         let arr = [];
    //         const listElement = el.querySelectorAll('h3.truyen-title a');
    //         listElement.forEach((a) => {
    //           arr.push(a.href);
    //         });
    //         return arr;
    //       });
    //       for (let y = 0; y < arrStory.length; y++) {
    //         if (!listTruyen.includes(arrStory[y])) {
    //           listTruyen.push(arrStory[y]);
    //         }
    //       }

    //       let isPaging = await pageLocal.$(
    //         '.pagination-container ul.pagination  li.active + li'
    //       );
    //       if (isPaging) {
    //         const isChoosePage = await isPaging.evaluate((el) => {
    //           return !el.classList.contains('page-nav');
    //         });
    //         if (isChoosePage) {
    //           await pageLocal.click(
    //             '.pagination-container ul.pagination li.active + li a'
    //           );
    //           await SleepHelper.sleep(1000);
    //         } else {
    //           break;
    //         }
    //       } else {
    //         break;
    //       }
    //     }
    //     await driver.closeBrowser(browserLocal);
    //   } catch (error) {
    //     await driver.closeBrowser(browserLocal);
    //     return res.send('Lỗi ở /api/v1/truyenfull/crawl_tool_story: ' + error);
    //   }
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
        await page.waitForSelector('.content_page h1.tblue', {
          visible: true,
        });
        const titleStory = await page.$eval(
            '.content_page h1.tblue',
            (el) => el.innerText
        );
        // Description
        await page.waitForSelector('.content_page .gioi_thieu_sach', {
            visible: true,
        });
        const description = await page.$eval(
            '.content_page .gioi_thieu_sach',
            (el) => el.innerText
        );
        // Author & category
    
        let getAuthors = await page.$$('.content_page .mg-t-10',{ visible: true });
        const author = await page.evaluate(author => {
          let str = author.innerText;
          str = str.replace(/tác giả:/gi, '');
          str = str.trim();
          return str;
        }, getAuthors[1]);

        const category = await page.$eval(
            '.content_page .mg-tb-10 a',
            (el) => {
                let categoryList = el.innerText.split("-");
                let str = '';
                categoryList.forEach((catEl) => {
                    str += catEl.trim() + '\n';
                });
                return str;
            }
        );
   
        // Image
        await page.waitForSelector('.content_page img', {
          visible: true,
        });
        const linkImage = await page.$eval(
          '.content_page img',
          (el) => {
            return el.src;
          }
        );
   
        // Status
        const status = 'Full';
        
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
        await page.waitForSelector('.content_page .box_chhr', {
          visible: true,
        });
        let isPaging = await page.$(
          '.content_page .box_chhr .ramd_all'
        );
        if (isPaging) {
          await isPaging.click();
          await SleepHelper.sleep(1000);
        }
        let chapterEl = await page.$$('.content_page .box_chhr .item_ch_mora .item_ch a');
        for (let i = 0; i < chapterEl.length; i++) {
          const chapter = await chapterEl[i].evaluate(el => {
            let chapterText = el.innerText;
            let url = el.href;
            return { chapterText, url};
          });
          listChapter.push(chapter);
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
                '.content_page .content_p',
                { visible: true }
              );
              
              let contentHTML = await contentPage.evaluate((el) => {
                const content = el.innerHTML;
                return content;
              });
              //  Loại bỏ quảng cáo khi tải về
              // contentHTML = contentHTML.replaceAll(/<div.*?\/div>/gms, '');
              contentHTML = contentHTML.replaceAll(/<div.*?>/gms, '');
              contentHTML = contentHTML.replaceAll(/<\/div>/gms, '');
              contentHTML = contentHTML.replaceAll(
                /<script.*?\/script>/gms,
                ''
              );
              contentHTML = contentHTML.replaceAll(/<style.*?\/style>/gms, '');

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

 
}

module.exports = NhasachController;
