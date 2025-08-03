const fs = require('fs');
const path = require('path');
const axios = require('axios');
const http = require('http');
const https = require('https');
const FormData = require('form-data');
const Controller = require('./Controller');
const BrowserDriver = require('../drivers/BrowserDriver');
const RandomHelper = require('../helpers/random.helper');
const FileHelper = require('../helpers/file.helper');
const SleepHelper = require('../helpers/sleep.helper');
const db = require('../models/db');
const ytdl = require("@distube/ytdl-core");

class CrawController extends Controller {
  constructor() {
    super();
    this.model = 'StoryModel';
    this.primaryKey = ['id'];
    this.filterTextFields = ['folder', 'title', 'current'];
    this.filterKeywords = ['folder', 'title'];
    this.filterFields = [];
    this.filterFieldsNot = ['chaper_skip_not', 'status_not'];
  }
  async testBrowser(req, res) {
    const url = 'https://www.youtube.com/watch?v=cEEQ8kti2nU&ab_channel=PH%C6%AF%C6%A0NGB%E1%BA%A4T%E1%BB%94NR%C3%8CVIU';
    const list = []
    try {
      const folderStory = `/video/`;
      const dirStoryName = `${global.root_path}/public${folderStory}`;
      FileHelper.createFolderAnfFile(dirStoryName);
      // Get video info
      // const info = await ytdl.getBasicInfo(url);
      const info = await ytdl.getInfo(url)
      // console.log(info.videoDetails.title);
      // Download a video
      // await FileHelper.downloadImage(info.formats[1].url, dirStoryName, `${info.videoDetails.title}.mp4`)
      
      // ytdl(info.formats[0].url).pipe(fs.createWriteStream(`${dirStoryName}${info.videoDetails.title}.mp4`));
      // console.log(info.formats[0].url);

      // info.formats.forEach((el, index) => {
      //   if (el.hasVideo && el.hasAudio) {
      //     list.push({
      //       index: index,
      //       hasVideo: el.hasVideo,
      //       hasAudio: el.hasAudio,
      //       container: el.container,
      //       qualityLabel: el.qualityLabel,
      //       url: el.url,
      //     })
      //   }
      // });
      console.log('download video');
      return res.status(200).send({
        result: 1,
        type: 'Success',
        data: info.formats[0]
      });
    } catch (e) {
      return res.status(200).send({
        result: 0,
        type: 'Error',
        message: e.message
      });
    }
    
  }

  async showDetail(where) {
    try {
      // return where;
      let num = await db[this.model].findOne({
        where: where,
      });
      if (num) {
        return {
          result: 1,
          data: num,
        };
      } else {
        return {
          result: 0,
          message: `Not found with ...`,
          data: {},
        };
      }
    } catch (error) {
      return {
        result: 0,
        message: `Error search with ...`,
        reason: error.message,
        data: {},
      };
    }
  }

  async createDBStory(data) {
    try {
      let result = await db[this.model].create(data);
    } catch (error) {
      console.log(`Create failed ${error.message}`);
    }
  }

  async updateDBStory(id, data) {
    try {
      const where = {};
      for (const i of this.primaryKey) {
        where[i] = id;
      }
      const model = db[this.model];
      let num = await model.update(data, {
        where: where,
      });
      if (num == 1) {
        model.findOne({ where: where });
        console.log(`Update success: ${where}`);
      } else {
        console.log(`err: Cannot update with ${where}`);
      }
    } catch (error) {
      console.log(`Error updating with ${where}: ${err.message}`);
    }
  }

  async destroyStory(condition) {
    try {
      const where = {};
      for (const i of this.primaryKey) {
        where[i] = condition[i];
      }
      // console.log('where',where)
      let num = await db[this.model].destroy({
        where: where,
      });
      if (num == 1) {
        return {
          result: 1,
          message: 'record was deleted successfully.',
        };
      } else {
        return {
          result: 0,
          message: `Cannot deleted with ${where.id}.`,
        };
      }
    } catch (error) {
      return {
        result: 0,
        message: `Error deleted with ${where.id}; ${error}`,
      };
    }
  }
  // Crawl
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
        const elListTruyen = await pageLocal.waitForSelector(
          '.container .col-truyen-main .list.list-truyen',
          { visible: true }
        );
        listTruyen = await elListTruyen.evaluate((el) => {
          const listElement = el.querySelectorAll('h3.truyen-title a');
          let arr = [];
          listElement.forEach((a) => {
            arr.push(a.href);
          });
          return arr;
        });
        await driver.closeBrowser(browserLocal);
      } catch (error) {
        await driver.closeBrowser(browserLocal);
        return res.send('Lỗi ở /api/v1/truỳenull/crawl_tool_story: ' + error);
      }
    } else if (action == 'limit') {
      const browserLocal = await driver.getBrowser();
      try {
        let pageLocal = await browserLocal.newPage();
        await driver.gotoUrl(pageLocal, link);
        while (true) {
          const elListTruyen = await pageLocal.waitForSelector(
            '.container .col-truyen-main .list.list-truyen',
            { visible: true }
          );
          let arrStory = await elListTruyen.evaluate((el) => {
            let arr = [];
            const listElement = el.querySelectorAll('h3.truyen-title a');
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

          let isPaging = await pageLocal.$(
            '.pagination-container ul.pagination  li.active + li'
          );
          if (isPaging) {
            const isChoosePage = await isPaging.evaluate((el) => {
              return !el.classList.contains('page-nav');
            });
            if (isChoosePage) {
              await pageLocal.click(
                '.pagination-container ul.pagination li.active + li'
              );
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
        return res.send('Lỗi ở /api/v1/truyenfull/crawl_tool_story: ' + error);
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
        await page.waitForSelector('.col-truyen-main h3.title', {
          visible: true,
        });
        const titleStory = await page.$eval(
          '.col-truyen-main h3.title',
          (el) => el.innerText
        );
        // Description
        await page.waitForSelector(
          '.col-truyen-main .desc-text.desc-text-full',
          { visible: true }
        );
        const description = await page.$eval(
          '.col-truyen-main .desc-text.desc-text-full',
          (el) => el.innerText
        );
        // Author & category
        await page.waitForSelector('.col-truyen-main .info-holder .info', {
          visible: true,
        });
        const author = await page.$eval(
          '.col-truyen-main .info-holder .info',
          (el) => {
            return el.querySelector('a[itemprop="author"]').innerText;
          }
        );
        const category = await page.$eval(
          '.col-truyen-main .info-holder .info',
          (el) => {
            let categoryList = el.querySelectorAll('a[itemprop="genre"]');
            let str = '';
            categoryList.forEach((catEl) => {
              str += catEl.innerText + '\n';
            });
            return str;
          }
        );
        // Image
        await page.waitForSelector('.col-truyen-main .info-holder .book', {
          visible: true,
        });
        const linkImage = await page.$eval(
          '.col-truyen-main .info-holder .book',
          (el) => {
            return el.querySelector('img').src;
          }
        );
        // Status
        await page.waitForSelector('.col-truyen-main .info-holder .info span', {
          visible: true,
        });
        const status = await page.$eval(
          '.col-truyen-main .info-holder .info',
          (el) => {
            let elementBlock = el.querySelector('span.text-primary');
            if (elementBlock) {
              return elementBlock.innerText;
            }
            elementBlock = el.querySelector('span.text-success');
            if (elementBlock) {
              return elementBlock.innerText;
            }
            return '';
          }
        );
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
        const extAvatar = arrImage[arrImage.length - 1];
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
        while (true) {
          const ChapterEl = await page.waitForSelector('#list-chapter', {
            visible: true,
          });
          const list = await ChapterEl.evaluate((el) => {
            let listTmp = [];
            const listElement = el.querySelectorAll('.list-chapter li');
            listElement.forEach((elChapter) => {
              const url = elChapter.querySelector('a').href;
              const chapterText = elChapter.querySelector('a').innerText;
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

          let isPaging = await page.$(
            '#list-chapter .pagination li.active + li'
          );
          if (isPaging) {
            const isChoosePage = await isPaging.evaluate((el) => {
              return !el.classList.contains('page-nav');
            });
            if (isChoosePage) {
              await page.click('#list-chapter .pagination li.active + li');
              await SleepHelper.sleep(1000);
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
              let contentPage = await page.waitForSelector(
                '#chapter-big-container',
                { visible: true }
              );
              let contentHTML = await contentPage.evaluate((el) => {
                const content = el.querySelector('.chapter-c').innerHTML;
                return content;
              });
              //  Loại bỏ quảng cáo khi tải về
              contentHTML = contentHTML.replace(/<div.*?\/div>/g, '');
              contentHTML = contentHTML.replace(/<script.*?\/script>/g, '');

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
              // Xử lý trường hợp trang truyện có hình ảnh hoặc có nội dung chữ
              // let rexgex = /<img.*?>/g;
              // let arrImg = contentHTML.match(rexgex);
              // if (arrImg) {
              //     const dirImage = dirChapterFolder + 'image/';
              //     for (let i = 0; i < arrImg.length; i++) {
              //         try {
              //             const resultMatch = /src="(.*?)"/g.exec(arrImg[i]);
              //             const urlImage = resultMatch[1];
              //             // Loại bỏ đường dẫn ảnh cũ đổi thành {{image-i}}; i tương ứng với tên ảnh trong folder image
              //             contentHTML = contentHTML.replace(urlImage, '{{image-'+(i + 1)+'}}');
              //             const arrSplitLink = urlImage.split('.');
              //             const ext = arrSplitLink[arrSplitLink.length - 1];
              //             FileHelper.downloadFile(urlImage, dirImage, (i + 1) + '.' + ext);

              //         } catch (error) {
              //             console.log('Error save image ' + titleStory + ' chapter-'+index + ' :' + error );
              //         }
              //     }

              // }
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
        console.log('Error API /api/v1/truỳenull/crawl_tool_story: ' + error);
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
      } else {
        await SleepHelper.sleep(2000);
      }
    }
    // await HandlePage.closeBrowser(browser);
    return res.status(200).send({
      message: 'Đang chạy, xem màn hình process để xem tiến trình chạy',
    });
  }

  // Xóa truyện
  async handleDestroyDir(req, res) {
    // await this.destroyStory(req.body);
    const { list_folder_obj } = req.body;
    try {
      let count = 0;
      for (let i = 0; i < list_folder_obj.length; i++) {
        const pathFolder = path.join(
          root_path + '/public',
          list_folder_obj[i].folder
        );
        fs.rmSync(pathFolder, { recursive: true, force: true });
        let response = await this.destroyStory(list_folder_obj[i]);
        if (response.result) {
          count++;
        }
        // console.log(response.message);
      }
      return res.send({ message: ` Đã xóa ${count} folder` });
    } catch (e) {
      console.log('Error Func handleDestroyDir(): ' + e);
      return res.send({
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }

  // Lấy thông tin truyện trong các file
  async showDetailFile(req, res) {
    const { id } = req.params;
    try {
      const { result, data } = await this.showDetail({ id: id });
      if (result) {
        // FileHelper.createFolderAnfFile(dirStoryName, 'title.txt', titleStory);
        // FileHelper.createFolderAnfFile(
        //   dirStoryName,
        //   'description.txt',
        //   description
        // );
        // FileHelper.createFolderAnfFile(dirStoryName, 'author.txt', author);
        // FileHelper.createFolderAnfFile(dirStoryName, 'category.txt', category);
        // FileHelper.createFolderAnfFile(dirStoryName, 'status.txt', status);
        const dirStoryName = `${global.root_path}/public${data.folder}`;
        return res.send({
          result: 1,
          records: {
            title: FileHelper.readFile(dirStoryName + 'title.txt'),
            description: FileHelper.readFile(dirStoryName + 'description.txt'),
            author: FileHelper.readFile(dirStoryName + 'author.txt'),
            category: FileHelper.readFile(dirStoryName + 'category.txt'),
            status: FileHelper.readFile(dirStoryName + 'status.txt'),
          }
        });
      } else {
        return res.send({
          result: 0,
          message: 'No records',
          records: {}
        });
      }
    } catch (e) {
      console.log('Error Func showDetailFile(): ' + e.message);
      return res.send({
        result: 0,
        code: '9999',
        message: 'FAILED',
        reason: e.message,
        records: {}
      });
    }
  }

  // Lấy thông tin các chương truyện
  async getDetailListChapter(req, res) {
    try {
      const { story, from, to, is_detail, folder } = req.body;
      if (is_detail) {
        return res.send({
          result: 1,
          records: {
            title: FileHelper.readFile(folder + '/title.txt'),
            text: FileHelper.readFile(folder + '/text.txt'),
            folder: folder
          }
        });
      } else {
        const pathFolder = path.join(root_path + '/public', story.folder);
        let records = [];
        for (let i = Number(from); i <= Number(to); i++) {
          const folderChapter = path.join(pathFolder, String(i));
          records.push({
            index: i,
            title: FileHelper.readFile(folderChapter + '/title.txt'),
            folder: folderChapter
            // text: FileHelper.readFile(folderChapter + '/text.txt'),
          });
        }
        return res.send({
          result: 1,
          records: records
        });
      }
    } catch (e) {
      console.log('Error Func getDetailListChapter(): ' + e.message);
      return res.send({
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }
  // Sửa bằng tay thông tin về truyện
  async updateStory(req, res) {
    try {
      const { story, title, description, author, category, status } = req.body;
      const dirStoryName = `${global.root_path}/public${story.folder}`;
      if (description) {
        FileHelper.createFolderAnfFile(dirStoryName, 'description.txt', description);
      }
      return res.send({
        result: 1,
        message: `update story success: ${story.title}`
      });
    } catch (e) {
      console.log('Error Func updateChapterStory(): ' + e.message);
      return res.send({
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }

  // Thêm chương mới (sửa file)
  async storeChapterStory(req, res) {
    try {
      const { id } = req.params;
      const result = await this.showDetail({ id: id });
      const story = result.data;
      const folder = `${global.root_path}/public${story.folder}${++story.chaper_last_folder}`;
      FileHelper.createFolderAnfFile(folder, 'title.txt', '');
      FileHelper.createFolderAnfFile(folder, 'text.txt', '');
      await this.updateDBStory(id, {
        chaper_last_folder: story.chaper_last_folder,
        status: 'Full'
      });
      return res.send({
        result: 1,
        data: {
          index: story.chaper_last_folder,
          title: FileHelper.readFile(folder + '/title.txt'),
          folder: folder
        },
        message: `create chapter success: `
      });
    } catch (e) {
      console.log('Error Func updateChapterStory(): ' + e.message);
      return res.send({
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }
  // Sửa bằng tay các chương truyện
  async updateChapterStory(req, res) {
    try {
      const { title, text, folder } = req.body;
      if (title) {
        FileHelper.createFolderAnfFile(folder, 'title.txt', title);
      }
      if (text) {
        FileHelper.createFolderAnfFile(folder, 'text.txt', text);
      }
      return res.send({
        result: 1,
        message: `update chapter success: ${folder}`
      });
    } catch (e) {
      console.log('Error Func updateChapterStory(): ' + e.message);
      return res.send({
        code: '9999',
        message: 'FAILED',
        reason: e.message,
      });
    }
  }

  // Update truyện và crawl lại những trang bị lỗi
  async handleUpdateStory(req, res) {
    let { current, list_folder_obj } = req.body;

    let queueThread = [];
    let thread = req.body.thread ? req.body.thread : 1;
    const driver = await BrowserDriver.getDriver('dev_tool');

    const updateTruyenfull = async (objStory, number) => {
      if (objStory.current != 'truyenfull.com') {
        return number;
      }
      const browser = await driver.getBrowser();
      let page = await browser.newPage();

      try {
        // ====Xử lý những chương truyện crawl hỏng====
        let folderSkip = [];
        let listChapterSkip = JSON.parse(objStory.chaper_skip);
        const dirStoryName = `${global.root_path}/public${objStory.folder}`;
        if (listChapterSkip.length > 0) {
          for (const chapter of listChapterSkip) {
            for (let i = 0; i <= 20; i++) {
              try {
                await driver.gotoUrl(page, chapter.link);
                let contentPage = await page.waitForSelector(
                  '#chapter-big-container',
                  { visible: true, timeout: 5000 }
                );
                let titleText = await await contentPage.evaluate((el) => {
                  const title = el.querySelector('a.chapter-title').innerText;
                  return title;
                });
                let contentHTML = await contentPage.evaluate((el) => {
                  const content = el.querySelector('.chapter-c').innerHTML;
                  return content;
                });
                //  Loại bỏ quảng cáo khi tải về
                contentHTML = contentHTML.replace(/<div.*?\/div>/g, '');
                contentHTML = contentHTML.replace(/<script.*?\/script>/g, '');

                /**
                 * Xử lý việc ghi file
                 */

                // Thư mục chương
                const dirChapterFolder = dirStoryName + chapter.folder + '/';
                // tiêu đề chương
                FileHelper.createFolderAnfFile(
                  dirChapterFolder,
                  'title.txt',
                  titleText
                );
                // Nội dung chương
                FileHelper.createFolderAnfFile(
                  dirChapterFolder,
                  'text.txt',
                  contentHTML
                );
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
        //   chaper_skip: JSON.stringify(folderSkip),
        // });
        /**
         * =================== Điều kiện để được update =====================
         */
        if (objStory.status.toLowerCase() == 'full') {
          await driver.closeBrowser(browser);
          return number;
        }
        await driver.gotoUrl(page, objStory.link);

        // Status
        await page.waitForSelector('.col-truyen-main .info-holder .info span', {
          visible: true,
        });
        const status = await page.$eval(
          '.col-truyen-main .info-holder .info',
          (el) => {
            let elementBlock = el.querySelector('span.text-primary');
            if (elementBlock) {
              return elementBlock.innerText;
            }
            elementBlock = el.querySelector('span.text-success');
            if (elementBlock) {
              return elementBlock.innerText;
            }
            return '';
          }
        );
        /**
         * File thông tin truyện
         */
        FileHelper.createFolderAnfFile(dirStoryName, 'status.txt', status);

        /**
         * Lấy danh sách các chương truyện
         */
        let listChapter = [];
        while (true) {
          const ChapterEl = await page.waitForSelector('#list-chapter', {
            visible: true,
          });
          const list = await ChapterEl.evaluate((el) => {
            let listTmp = [];
            const listElement = el.querySelectorAll('.list-chapter li');
            listElement.forEach((elChapter) => {
              const url = elChapter.querySelector('a').href;
              const chapterText = elChapter.querySelector('a').innerText;
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

          let isPaging = await page.$(
            '#list-chapter .pagination li.active + li'
          );
          if (isPaging) {
            const isChoosePage = await isPaging.evaluate((el) => {
              return !el.classList.contains('page-nav');
            });
            if (isChoosePage) {
              await page.click('#list-chapter .pagination li.active + li');
              await SleepHelper.sleep(1000);
            } else {
              break;
            }
          } else {
            break;
          }
        }

        // Loại bỏ những chương đã crawl
        let lastLinkChaper = objStory.chaper_last_link;
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
        
        for (const chapter of listChapter) {
          for (let i = 0; i <= 20; i++) {
            try {
              await driver.gotoUrl(page, chapter.url);
              let contentPage = await page.waitForSelector(
                '#chapter-big-container',
                { visible: true }
              );
              let contentHTML = await contentPage.evaluate((el) => {
                const content = el.querySelector('.chapter-c').innerHTML;
                return content;
              });
              //  Loại bỏ quảng cáo khi tải về
              contentHTML = contentHTML.replace(/<div.*?\/div>/g, '');
              contentHTML = contentHTML.replace(/<script.*?\/script>/g, '');

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
      } else {
        await SleepHelper.sleep(5000);
      }
    }
    // await HandlePage.closeBrowser(browser);
    return res.status(200).send({
      message: 'Đang chạy, xem màn hình process để xem tiến trình chạy',
    });
  }

  async handleUpdateAllStory(req, res) {
    let { current, thread, start_page, end_page } = req.body;
    try {
      const per_page = 20;
      const respone = await axios({
        url: `http://${req.get('host')}/api/truyenfullsuper/list_story_folder?page=1&is_paginate=1&status_not=Full&current=${current}`,
        method: 'get',
      });
      if (!start_page) {
        start_page = 1;
      }
      const totalPage = Math.ceil(respone.data.total_records/per_page);
      if (!end_page || (end_page > totalPage)) {
        end_page = totalPage;
      }
      for (let i = start_page; i <= end_page; i++) {
        const respone = await axios({
          url: `http://${req.get('host')}/api/truyenfullsuper/list_story_folder?page=${i}&per_page=${per_page}&status_not=Full&current=${current}`,
          method: 'get',
        });
        await SleepHelper.sleep(2000);
        const responeUpdate = await axios({
          url: `http://${req.get('host')}/api/truyenfullsuper/update_story`,
          method: 'post',
          data: {
            list_folder_obj: respone.data.records,
            current: current,
            thread: thread
          },
    
        });
        await SleepHelper.sleep(2000);
      }
      return res.send({ 
        message: `Update truyện thành công`,
        domain: `${req.get('host')}`,
      });
    } catch (error) {
      console.log('Error Func handleUploadStory(): ' + e);
        return res.send({
          code: '9999',
          message: 'FAILED',
          reason: e.message,
        });
    }
  }

  // Upload truyện lên trang web
  async handleUploadStory(req, res) {
    let { list_folder_obj, base_url, is_upload_all, chapter_in_number } = req.body;
    if (!base_url.endsWith('/')) {
      base_url = base_url + '/';
    }

    // API upload: http://localhost/wordpress/web_truyen/wp-json/v1/import_story
    // API upload Chapter: http://localhost/wordpress/web_truyen/wp-json/v1/import_story_chapter

    for (const key in list_folder_obj) {
      try {
        const form = new FormData(); //Gửi dữ liệu tạo truyện mới
        const pathFolder = `${global.root_path}/public${list_folder_obj[key].folder}`;
        // Đưa thông tin truyền vào form dữ liệu
        const author = FileHelper.readFile(`${pathFolder}author.txt`);
        const category = FileHelper.readFile(`${pathFolder}category.txt`);
        const title = FileHelper.readFile(`${pathFolder}title.txt`).toLowerCase();
        const description = FileHelper.readFile(`${pathFolder}description.txt`);
        const status = FileHelper.readFile(`${pathFolder}status.txt`);
  
        form.append('author', author);
        const listCategories = category.split('\n');
        for (let t = 0; t < listCategories.length; t++) {
          if (listCategories[t]) {
            form.append('category[]', listCategories[t]);
          }
        }
        form.append('title', title);
        form.append('status', status);
        form.append('description', description);
  
        const fileNameAvatar = FileHelper.findFile(pathFolder, 'avatar.');
        // return res.send({ 
        //     domain: `${req.get('host')}${list_folder_obj[key].folder}${fileNameAvatar}`,
        //     avatar: path.join(pathFolder, fileNameAvatar),
        //     glob: path.join(global.root_path, 'public')
        //   });
        if (fileNameAvatar) {
          form.append(
            'avatar',
            fs.createReadStream(path.join(pathFolder, fileNameAvatar))
          );
        }
        const respone = await axios({
          url: base_url + 'api/manager/stories/tool-upload-story',
          method: 'post',
          headers: form.getHeaders(),
          data: form,
        });
        // console.log(respone.data);
        let storyRes = respone.data.data;
        // // Lấy danh sách các dir con
        const chaper_last_folder = Number(list_folder_obj[key].chaper_last_folder);
        // Làm thao tác kiểm tra các folder con, tìm những folder có nội dung giống nhau
        let position = 1;
        if (!is_upload_all) {
          position = respone.data.skip_position;
        }
        if (!chapter_in_number) {
          chapter_in_number = 20;
        }
        while (position <= chaper_last_folder) {
          let listChaperUpload = [];
          for (let index = 0; index < chapter_in_number; index++) {
            const pathChild = path.join(pathFolder, String(position));
            if (fs.existsSync(pathChild)) {
              // Lấy trạng thái của tệp
              const dirrentChild = fs.statSync(pathChild);
              if (dirrentChild.isDirectory()) {
                // Vào các folder con là các chương, kiểm tra phần title.txt xem có bị trùng lặp chương không
                let readFileTitle = FileHelper.readFile(
                  path.join(pathChild, 'title.txt')
                ).replace(/<[^>]*>/g, ''); //Loại bỏ các thẻ html
                readFileTitle = readFileTitle?readFileTitle:'continue';
                let readFileText = FileHelper.readFile(
                  path.join(pathChild, 'text.txt')
                );
                readFileText = readFileText?readFileText:'continue';

                listChaperUpload.push({
                  name: readFileTitle,
                  content: readFileText,
                  position: position
                });
              }
            }
            position++;
            // Chỉ lấy đến thư mục cuối cùng
            if (position > chaper_last_folder) {
              break;
            }
          }
          
          try {
            const responeChapter = await axios({
              url: base_url + `api/manager/stories/tool-upload-chaper/${storyRes.id}`,
              method: 'post',
              data: {list_chaper: listChaperUpload, status: status},
            });
            
            if (responeChapter.data.status) {
              // console.log(responeChapter.data);
              console.log(`Chaper truyện ${title}: ${responeChapter.data.message}`);
            } else {
              console.log(`Lỗi ${title}: ${responeChapter.data.message}`);
            }
          } catch (e) {
            console.log(`Lỗi request: ${e.message}`);
            await SleepHelper.sleep(10000);
            break;
          }
          await SleepHelper.sleep(2000);
        }
        console.log(`Upload truyện ${title} thành công`);
        
      } catch (e) {
        console.log('Error Func handleUploadStory(): ' + e);
        return res.send({
          code: '9999',
          message: 'FAILED',
          reason: e.message,
        });
      }
    }
    return res.send({ message: `Upload truyện thành công` });
  }

  async uploadAllStory(req, res) {
    /**
     * base_url: "http://unicode-study.test/",
     * list_folder_obj: []
     */
    let { base_url, is_upload_all, start_page, end_page } = req.body;
    try {
      const per_page = 20;
      const respone = await axios({
        url: `http://${req.get('host')}/api/truyenfullsuper/list_story_folder?page=1&is_paginate=1`,
        method: 'get',
      });
      if (!start_page) {
        start_page = 1;
      }
      const totalPage = Math.ceil(respone.data.total_records/per_page);
      if (!end_page || (end_page > totalPage)) {
        end_page = totalPage;
      }
      for (let i = start_page; i <= end_page; i++) {
        const respone = await axios({
          url: `http://${req.get('host')}/api/truyenfullsuper/list_story_folder?page=${i}&per_page=${per_page}&order_by=updatedAt&order_type=desc`,
          method: 'get',
        });
        await SleepHelper.sleep(2000);
        const responeUpload = await axios({
          url: `http://${req.get('host')}/api/truyenfullsuper/handle_upload_story`,
          method: 'post',
          data: {
            list_folder_obj: respone.data.records,
            base_url: base_url,
            is_upload_all: is_upload_all
          },
        });
        await SleepHelper.sleep(2000);
      }
      return res.send({ 
        message: `Upload truyện thành công`,
        domain: `${req.get('host')}`,
      });
    } catch (error) {
      console.log('Error Func handleUploadStory(): ' + e);
        return res.send({
          code: '9999',
          message: 'FAILED',
          reason: e.message,
        });
    }
  }
}

module.exports = CrawController;
