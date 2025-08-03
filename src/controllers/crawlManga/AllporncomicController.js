const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const MangaController = require('../MangaController');
const MangaChapterController = require('../MangaChapterController');
const BrowserDriver = require('../../drivers/BrowserDriver');
const RandomHelper = require('../../helpers/random.helper');
const FileHelper = require('../../helpers/file.helper');
const SleepHelper = require('../../helpers/sleep.helper');
// const {NST_BROWSER_PROFILE_ID} = require('../../helpers/random.helper');

class AllporncomicController extends MangaController {
    constructor() {
        super();
    }

    // Crawl
  async crawToolStoryManga(req, res) {
    const driver = await BrowserDriver.getDriver('dev_extra');
    /**
     * link: is a array
     */
    const { list_link, action, current } = req.body;
    let queueThread = [];
    let thread = req.body.thread ? req.body.thread : 1;
    /**
     * Lấy bắt đầu từ trang danh sách các truyện
     * - action: one - lấy theo link một bộ truyện cụ thể; mutiple - Lấy theo danh sách liệt kê các bộ truyện
     */
    let listTruyen = [];
    if (action == 'one') {
      listTruyen = [...listTruyen, ...list_link];
    } else if (action == 'mutiple') {
      const browserLocal = await driver.getBrowser();
      try {
          let pageLocal = await browserLocal.newPage();
          for (let i = 0; i < list_link.length; i++) {
            await driver.gotoUrl(pageLocal, list_link[i]);
            const elListTruyen = await pageLocal.waitForSelector('.tab-content-wrap .c-tabs-item .page-content-listing', { visible: true });
            const tmplistTruyen = await elListTruyen.evaluate(el => {
                const listElement = el.querySelectorAll('.page-item-detail .item-thumb a');
                let arr = [];
                listElement.forEach(a => {
                    arr.push(a.href);
                });
                return arr;
            });
            listTruyen = [...listTruyen, ...tmplistTruyen];
          }
          await driver.closeBrowser(browserLocal);
      } catch (error) {
          await driver.closeBrowser(browserLocal);
          return res.send("Lỗi ở crawToolStoryManga: " + error);
      }
    } else if (action == 'limit') {

    }
    
    const downloadTruyenfull = async (link, number) => {
      const browser = await driver.getBrowser();
      try {
        let page = await browser.newPage();
        // Ko load ảnh
        await page.setRequestInterception(true);
        page.on("request", (request) => {
          if (request.resourceType() === "image") {
            // console.log("Blocking image request: " + request.url());
            request.abort();
          } else {
            request.continue();
          }
        });

        
        await driver.gotoUrl(page, link);
        /**
         * Tạo thư mục chứa truyện
        */
       // Tên truyện
       await page.waitForSelector('.post-title h1', {
         visible: true,
        });
        let titleStory = await page.$eval('.post-title h1', (el) => el.innerText);
        titleStory = titleStory.toLowerCase();
        titleStory = titleStory.replace(/\[.*\]/, '');
        // console.log(titleStory);
        
        // Parodies 
        let parodies = '';

        // Category
        let category = '';
        if (await page.$('.summary-content .genres-content')) {
            category = await page.$eval('.summary-content .genres-content', (el) => {
                let str = '';
                let listTags = el.querySelectorAll('a');
                listTags.forEach((catEl, index, array) => {
                let tag = catEl.innerText;
                tag = tag.trim();
                if ((index + 1) >= array.length) {
                    str += tag;
                  } else {
                    str += tag + '\n';
                  }
                });
        
                return str;
            });
        }
        
        // Author
        let author = '';
        if (await page.$('.summary-content .artist-content')) {
          author = await page.$eval('.summary-content .artist-content', (el) => {
              let listTags = el.querySelectorAll('a');
              let str = '';
              listTags.forEach((catEl, index, array) => {
                let tag = catEl.innerText;
                tag = tag.trim();
                if ((index + 1) >= array.length) {
                  str += tag;
                } else {
                  str += tag + '\n';
                }
              });
              return str;
            }
          );
        }
        
         // Characters
         let characters = '';
         if (await page.$('.post-content_item .summary-content .author-content')) {
          characters = await page.$eval('.post-content_item .summary-content .author-content', (el) => {
               let list = el.querySelectorAll('a');
               let str = '';
               list.forEach((catEl, index, array) => {
                 let tag = catEl.innerText;
                 tag = tag.trim();
                 if ((index + 1) >= array.length) {
                   str += tag;
                 } else {
                   str += tag + '\n';
                 }
               });
               return str;
             }
           );
         }
  
        //  Description
        let description = '';
        if (await page.$('.description-summary .summary__content')) {
          description = await page.$eval('.description-summary .summary__content', (el) => {
               let str = el.innerHTML;
               return str.trim();
             }
           );
         }
         
         // Image
         await page.waitForSelector('.summary_image a img', {
           visible: true,
          });
          const linkImage = await page.$eval('.summary_image a img',(el) => el.src);
 
        /**
         * Kiểm tra truyện đã tồn tại trong DB ko crawl nữa
         */
        let mangaChapter = new MangaChapterController();
        let storyCheck = await this.showDetail({ title: titleStory });

        if (storyCheck.result) {
          // console.log(`Truyện ${titleStory} đã được crawl`);
          await driver.closeBrowser(browser);
          await axios({
                  url: `http://${req.get('host')}/api/manga-super/update`,
                  method: 'post',
                  data: {
                    list_folder_obj: [storyCheck.data],
                    current: 'allporncomic.com',
                    thread: 1
                  },
            
                });
          return number;
        }
 

        /**
       * File thông tin truyện
       */
        const folderStory = `/crawl_manga/${current}/${RandomHelper.changeSlug(titleStory)}/`;
        let dirStoryName = `${global.root_path}/public${folderStory}`;
        const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp'];
        FileHelper.createFolderAnfFile(dirStoryName, 'title.txt', titleStory);
        FileHelper.createFolderAnfFile(dirStoryName, 'parodies.txt', parodies);
        FileHelper.createFolderAnfFile(dirStoryName, 'author.txt', author);
        FileHelper.createFolderAnfFile(dirStoryName, 'category.txt', category);
        FileHelper.createFolderAnfFile(dirStoryName, 'characters.txt', characters);
        FileHelper.createFolderAnfFile(dirStoryName, 'description.txt', description);

        // Save thumbnail
        const arrImage = linkImage.split('.');
        let extAvatar = arrImage[arrImage.length - 1];
        if (!extArr.includes(extAvatar)) {extAvatar = 'jpg';}
        FileHelper.downloadFile(linkImage, dirStoryName, `avatar.${extAvatar}`);
        // Link truyện crawl
        FileHelper.createFolderAnfFile(dirStoryName, 'linkstory.txt', link);
        
        /**
         * Lấy danh sách các chương truyện
         */
  
        const ChapterEl = await page.waitForSelector('.page-content-listing.single-page .listing-chapters_wrap ul', { visible: true });
        let listChapter = await ChapterEl.evaluate(el => {
            let listTmp = [];
            const listElement = el.querySelectorAll('li > a');
            listElement.forEach(elChapter => {
                const url = elChapter.href;
                let chapterText = elChapter.innerText;
                if (url != 'javascript:void(0)') {
                  let tmpArr = chapterText.split('.');
                  chapterText = tmpArr[tmpArr.length - 1];
                  tmpArr = chapterText.split('-');
                  tmpArr = tmpArr.splice(0, tmpArr.length - 1);
                  
                  chapterText = tmpArr.join(' - ');
                  chapterText = chapterText.trim();
                  chapterText = chapterText.replace(/\[.*\]/, '');
                  listTmp.push({ chapterText, url });
                }
            });
            return listTmp.reverse();
          });

        /**
         * Lấy hình ảnh chương truyện
         */
        let index = 0;
        let lastLinkChaper = '';
          // Lưu vào DB
        let storyImport = await this.createDBStory({
          title: titleStory,
          folder: folderStory,
          current: current,
          link: link,
          chaper_last_folder: index,
        });
        // Thư mục chương
        for (const chapter of listChapter) {
          index++;
          try {
            await driver.gotoUrl(page, chapter.url);
            let contentPage = await page.waitForSelector('.read-container .reading-content', { visible: true, hidden: true });
            let imgSrcArr = await contentPage.evaluate((el) => {
              let listImg = el.querySelectorAll('.page-break img');
              let listUrlImage = [];
              for (let i = 0; i < listImg.length; i++) {
                const srcImg = listImg[i].getAttribute('data-src').trim();
                listUrlImage.push(srcImg);
              }
              return listUrlImage;
            });
            const dirChapterFolder = dirStoryName + index + '/';
            FileHelper.createFolderAnfFile(dirChapterFolder, 'name.txt', chapter.chapterText);
              
              for (let y = 0; y < imgSrcArr.length; y++) {
                try {
                  // Save image
                  const arrImages = imgSrcArr[y].split('.');
                  let extImg = arrImages[arrImages.length - 1].toLowerCase();
                  if (!extArr.includes(extImg)) {extImg = 'jpg';}
                  
                  for (let session = 1; session <= 3; session++) {
                      try {
                        const respone = await FileHelper.downloadImage(imgSrcArr[y], dirChapterFolder, `${y + 1}.${extImg}`);
                        // console.log(respone);
                        break;
                      } catch (e) {
                        try {
                          await FileHelper.downloadFileBuffer(imgSrcArr[y], dirChapterFolder, `${y + 1}.${extImg}`);
                        } catch (error) {
                          console.log(`chapter ${index}, image ${y}, session ${session}: ${e}; link: ${imgSrcArr[y]}`);
                          await SleepHelper.sleep(10000);
                        }
                      }

                    }
                } catch (error) {
                  console.log(`chapter ${index}, image ${y}: ${error}`);
                }
              }
              let titleChapter = titleStory;
              if (index > 1) {
                titleChapter = `${titleChapter} - ${index}`
              }
              await mangaChapter.createDBStory({
                title: titleChapter,
                story_id: storyImport.id,
                folder: folderStory + index + '/',
                total_image: imgSrcArr.length
              });
              lastLinkChaper = chapter.url;
            } catch (error) {
              console.log(`${chapter.chapterText}, index ${index}:  ${error}`);
              await SleepHelper.sleep(1000);
            }
        }

        await this.updateDBStory(storyImport.id, {
          chaper_last_folder: index,
          chaper_last_link: lastLinkChaper
        });
        
        await driver.closeBrowser(browser);
        return number;
      } catch (error) {
        await driver.closeBrowser(browser);
        console.log('Error API /api/manga-super/crawl: ' + error);
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

  // Update
  async handleUpdateStoryManga(req, res) {
    let { current, list_folder_obj } = req.body;
    let queueThread = [];
    let thread = req.body.thread ? req.body.thread : 1;
    const driver = await BrowserDriver.getDriver('dev_extra');

    const updateTruyenfull = async (objStory, number) => {
        if (objStory.current != 'allporncomic.com') {
            return number;
        }
        const browser = await driver.getBrowser();
        let page = await browser.newPage();
        const dirStoryName = `${global.root_path}/public${objStory.folder}`;

        try {
     
            await driver.gotoUrl(page, objStory.link);
            let mangaChapter = new MangaChapterController();
            /**
             * Lấy danh sách các chương truyện
             */
            let ChapterEl = await page.waitForSelector('.page-content-listing.single-page .listing-chapters_wrap ul', { visible: true });
            let listChapter = await ChapterEl.evaluate(el => {
                let listTmp = [];
                const listElement = el.querySelectorAll('li > a');
                listElement.forEach(elChapter => {
                    const url = elChapter.href;
                    let chapterText = elChapter.innerText;
                    let tmpArr = chapterText.split('.');
                    chapterText = tmpArr[tmpArr.length - 1];
                    tmpArr = chapterText.split('-');
                    chapterText = tmpArr[0].trim();
                    chapterText = chapterText.replace(/\[.*\]/, '');
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
            // Thư mục chương
            for (const chapter of listChapter) {
              index++;
              try {
                  await driver.gotoUrl(page, chapter.url);
                  let contentPage = await page.waitForSelector('.read-container .reading-content', { visible: true, hidden: true });
                  let imgSrcArr = await contentPage.evaluate((el) => {
                    let listImg = el.querySelectorAll('.page-break img');
                    let listUrlImage = [];
                    for (let i = 0; i < listImg.length; i++) {
                      const srcImg = listImg[i].getAttribute('data-src').trim();
                      listUrlImage.push(srcImg);
                    }
                    return listUrlImage;
                  });
                  const dirChapterFolder = dirStoryName + index + '/';
                  FileHelper.createFolderAnfFile(dirChapterFolder, 'name.txt', chapter.chapterText);
                    
                  for (let y = 0; y < imgSrcArr.length; y++) {
                    try {
                      // Save image
                      const arrImages = imgSrcArr[y].split('.');
                      let extImg = arrImages[arrImages.length - 1].toLowerCase();
                      if (!extArr.includes(extImg)) {extImg = 'jpg';}
                      
                      for (let session = 1; session <= 3; session++) {
                          try {
                            const respone = await FileHelper.downloadImage(imgSrcArr[y], dirChapterFolder, `${y + 1}.${extImg}`);
                            // console.log(respone);
                            break;
                          } catch (e) {
                            try {
                              await FileHelper.downloadFileBuffer(imgSrcArr[y], dirChapterFolder, `${y + 1}.${extImg}`);
                            } catch (error) {
                              console.log(`chapter ${index}, image ${y}, session ${session}: ${e}; link: ${imgSrcArr[y]}`);
                              await SleepHelper.sleep(10000);
                            }
                          }

                        }
                    } catch (error) {
                      console.log(`chapter ${index}, image ${y}: ${error}`);
                    }
                  }
                  let titleChapter = objStory.title;
                  if (index > 1) {
                    titleChapter = `${titleChapter} - ${index}`
                  }
                  await mangaChapter.createDBStory({
                    title: titleChapter,
                    story_id: objStory.id,
                    folder: objStory.folder + index + '/',
                    total_image: imgSrcArr.length
                  });
                  lastLinkChaper = chapter.url;
                } catch (error) {
                  console.log(`${chapter.chapterText}, index ${index}:  ${error}`);
                  await SleepHelper.sleep(1000);
                }
            }
            // Lưu vào DB
            this.updateDBStory(objStory.id, {
                chaper_last_folder: index,
                chaper_last_link: lastLinkChaper
            });
            await driver.closeBrowser(browser);
            return number;
        } catch (error) {
            await driver.closeBrowser(browser);
            console.log("Error API /api/manga-super/update: " + error);
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
}

module.exports = AllporncomicController;