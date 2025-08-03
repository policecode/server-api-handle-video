const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const Controller = require('./Controller');
const MangaChapterController = require('./MangaChapterController');
const BrowserDriver = require('../drivers/BrowserDriver');
const RandomHelper = require('../helpers/random.helper');
const FileHelper = require('../helpers/file.helper');
const SleepHelper = require('../helpers/sleep.helper');
const db = require('../models/db');

class MangaController extends Controller {
  constructor() {
    super();
    this.model = 'MangaModel';
    this.primaryKey = ['id'];
    this.filterTextFields = ['folder', 'title', 'current'];
    this.filterKeywords = ['folder', 'title'];
    this.filterFields = [];
    this.filterFieldsNot = ['chaper_skip_not', 'status_not'];
  }
  async testBrowser(req, res) {
    const imageName = FileHelper.findFile('D:\\ProgramWork\\node work\\crawl-manga\\public\\crawl_manga\\allporncomic.com\\alpha\\1', `2.`);
    
    return res.status(200).send(imageName);
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
      return result;
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

  async destroyDBStory(condition) {
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

  async loginWeb(page, user="dat0961555152", pass="dat9531487") {
    let loginBtn = await page.$(`.navbar_right a.active`,{ visible: true });
    if (loginBtn) {
      await page.goto('https://hentaifox.com/login/', {waitUntil: 'load',});
      await page.waitForSelector('form .form-group input#username', {visible: true,});
      await page.type('orm .form-group input#username', user);
      await page.waitForSelector('form .form-group input#password', {visible: true});
      await page.type('form .form-group input#password', pass);
      // while (true) {
      //   await page.waitForSelector(
      //     '.flex.justify-center button[data-x-bind="Submit"].bg-primary',
      //     { visible: true }
      //   );
      //   await page.click(
      //     '.flex.justify-center button[data-x-bind="Submit"].bg-primary'
      //   );
      //   try {
      //     await page.waitForSelector(
      //       'div.px-4 .flex.items-center.justify-between .ml-3 button',
      //       { visible: true, timeout: 20000}
      //     );
      //     await page.click(
      //       'div.px-4 .flex.items-center.justify-between .ml-3 button'
      //     );
      //     break;
      //   } catch (error) {
      //     console.log('Đăng nhập lại');
      //   }
      // }
    }
  }
  // Crawl
  async crawToolStoryManga(req, res) {
    const driver = await BrowserDriver.getDriver('dev_extra');
    // const browser = await driver.getBrowser();
    const { list_link, action, current, chapter_name, story_id } = req.body;
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

    } else if (action == 'limit') {

    }

    const dirProfileName = path.join( `${global.root_path}/public/profile/hentai`);
    const downloadTruyenfull = async (link, number) => {
      const browser = await driver.getBrowser({
        userDataDir: dirProfileName
      });
      try {
        let page = await browser.newPage();
        await driver.setUserAgent(page);
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
        // return number;

        /**
         * Tạo thư mục chứa truyện
         */
        // Tên truyện
        await page.waitForSelector('.display_gallery .gallery_top .gallery_right .info h1', {
          visible: true,
        });
        let titleStory = await page.$eval('.display_gallery .gallery_top .gallery_right .info h1', (el) => el.innerText);
        titleStory = titleStory.toLowerCase();
        // Parodies 
        let parodies = '';
        if (await page.$('.display_gallery .gallery_top .gallery_right .info ul.parodies')) {
          parodies = await page.$eval('.display_gallery .gallery_top .gallery_right .info ul.parodies', (el) => {
              let list = el.querySelectorAll('li a');
              let str = '';
              list.forEach((catEl, index, array) => {
                let tag = catEl.innerHTML;
                tag = tag.replace(/<span.*?\/span>/g, '').trim();
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
        
        // Author
        let author = '';
        if (await page.$('.display_gallery .gallery_top .gallery_right .info ul.artists')) {
          author = await page.$eval('.display_gallery .gallery_top .gallery_right .info ul.artists', (el) => {
              let list = el.querySelectorAll('li a');
              let str = '';
              list.forEach((catEl, index, array) => {
                let tag = catEl.innerHTML;
                tag = tag.replace(/<span.*?\/span>/g, '').trim();
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
         if (await page.$('.display_gallery .gallery_top .gallery_right .info ul.characters')) {
          characters = await page.$eval('.display_gallery .gallery_top .gallery_right .info ul.characters', (el) => {
               let list = el.querySelectorAll('li a');
               let str = '';
               list.forEach((catEl, index, array) => {
                 let tag = catEl.innerHTML;
                 tag = tag.replace(/<span.*?\/span>/g, '').trim();
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
  
        // Category
        let category = await page.$eval('.display_gallery .gallery_top .gallery_right .info', (el) => {
          let str = '';
          if (el.querySelector('ul.tags')) {
            let listTags = el.querySelectorAll('ul.tags li a');
            listTags.forEach((catEl, index, array) => {
              let tag = catEl.innerHTML;
              tag = tag.replace(/<span.*?\/span>/g, '').trim();
              str += tag + '\n';
            });
          }

          if (el.querySelector('ul.categories')) {
            let listCats = el.querySelectorAll('ul.categories li a');
            listCats.forEach((catEl, index, array) => {
              let tag = catEl.innerHTML;
              tag = tag.replace(/<span.*?\/span>/g, '').trim();
              if ((index + 1) >= array.length) {
                str += tag;
              } else {
                str += tag + '\n';
              }
            });
          }
          return str;
        });

        

        // Image
        await page.waitForSelector('.display_gallery .gallery_top .gallery_left img', {
          visible: true,
        });
        const linkImage = await page.$eval('.display_gallery .gallery_top .gallery_left img',(el) => el.src);
 
        /**
         * Kiểm tra truyện đã tồn tại trong DB ko crawl nữa
         */
        let mangaChapter = new MangaChapterController();
        const checkStory = await mangaChapter.showDetail({ title: titleStory });

        if (checkStory.result) {
          console.log(`Truyện ${titleStory} đã được crawl`);
          await driver.closeBrowser(browser);
          return number;
        }
        let storyManga = '';
        if (story_id && story_id > 0) {
          storyManga = await this.showDetail({ id: story_id });
        }

        /**
       * File thông tin truyện
       */
        const folderStory = `/crawl_manga/${current}/${RandomHelper.changeSlug(titleStory)}/`;
        let dirStoryName = `${global.root_path}/public${folderStory}`;
        const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp'];
        if (!storyManga.result) {
            FileHelper.createFolderAnfFile(dirStoryName, 'title.txt', titleStory);
            FileHelper.createFolderAnfFile(dirStoryName, 'parodies.txt', parodies);
            FileHelper.createFolderAnfFile(dirStoryName, 'author.txt', author);
            FileHelper.createFolderAnfFile(dirStoryName, 'category.txt', category);
            FileHelper.createFolderAnfFile(dirStoryName, 'characters.txt', characters);
            // Save thumbnail
            const arrImage = linkImage.split('.');
            let extAvatar = arrImage[arrImage.length - 1];
            if (!extArr.includes(extAvatar)) {extAvatar = 'jpg';}
            FileHelper.downloadFile(linkImage, dirStoryName, `avatar.${extAvatar}`);
            // Link truyện crawl
            FileHelper.createFolderAnfFile(dirStoryName, 'linkstory.txt', link);
        } else {
          dirStoryName = `${global.root_path}/public${storyManga.data.folder}`;
        }
        /**
         * Lấy danh sách các chương truyện
         */
        let checkAll = await page.$('.view_group #load_all', {visible: true});
        if (checkAll) {
          await page.hover('.view_group #load_all');
          await SleepHelper.sleep(4000);
          // await page.click('.view_group #load_all');
          await page.$eval('.view_group #load_all', el => {
            el.click()
            return '';
          });
        }
        await SleepHelper.sleep(2000);

        let listChapter = await page.$eval('.gallery_bottom #append_thumbs', el => {
          let linkArr = el.querySelectorAll('.gallery_thumb .g_thumb a');
          let tmpArr = [];
          linkArr.forEach(link => {
            tmpArr.push(link.href)
          });
          return tmpArr;
        });
        
        /**
         * Lấy hình ảnh chương truyện
         */
        let index = 0;
        let chaper_last_folder = 1;
        if (storyManga.result) {
          chaper_last_folder = storyManga.data.chaper_last_folder + 1;
        }
        // Thư mục chương
        const dirChapterFolder = dirStoryName + chaper_last_folder + '/';
        fs.rmSync(dirChapterFolder, { recursive: true, force: true });
        FileHelper.createFolderAnfFile(dirChapterFolder, 'name.txt', chapter_name);

        for (const url of listChapter) {
            index++;
            try {
              await driver.gotoUrl(page, url);
              let contentPage = await page.waitForSelector('.full_image .next_img img', { visible: true });
              let imgSrc = await contentPage.evaluate((el) => {
                return el.getAttribute('data-src');
              });
                // Save image
              const arrImages = imgSrc.split('.');
              let extImg = arrImages[arrImages.length - 1];
              if (!extArr.includes(extImg)) {extImg = 'jpg';}
              FileHelper.downloadFile(imgSrc, dirChapterFolder, `${index}.${extImg}`);

              await SleepHelper.sleep(1000);
            } catch (error) {
              console.log(url + ': ' + error);
              index++;
              await SleepHelper.sleep(1000);
            }
        }
        // Lưu vào DB
        if (storyManga.result) {
          await this.updateDBStory(story_id, {
            chaper_last_folder: chaper_last_folder
          });
          await mangaChapter.createDBStory({
            title: titleStory,
            story_id: story_id,
            folder: storyManga.data.folder + chaper_last_folder + '/',
            total_image: index
          });
        } else {
          let storyCreate = await this.createDBStory({
            title: titleStory,
            folder: folderStory,
            current: current,
            link: link,
            chaper_last_folder: chaper_last_folder,
          });
          await mangaChapter.createDBStory({
            title: titleStory,
            story_id: storyCreate.id,
            folder: folderStory + chaper_last_folder + '/',
            total_image: index
          });
        }
        
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

  // Crawl lại chương truyện
  async handleUpdateStoryManga(req, res) {
    let { current, link, chapter_id, chapter_name } = req.body;

    const driver = await BrowserDriver.getDriver('dev_tool');
    const browser = await driver.getBrowser();
    let page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.resourceType() === "image") {
        // console.log("Blocking image request: " + request.url());
        request.abort();
      } else {
        request.continue();
      }
    });
    try {
      await driver.gotoUrl(page, link);

      /**
       * Tạo thư mục chứa truyện
       */
      // Tên truyện
      await page.waitForSelector('.display_gallery .gallery_top .gallery_right .info h1', {
        visible: true,
      });
      let titleStory = await page.$eval('.display_gallery .gallery_top .gallery_right .info h1', (el) => el.innerText);
      titleStory = titleStory.toLowerCase();

      /**
       * Kiểm tra truyện đã tồn tại trong DB ko crawl nữa
       */
      let mangaChapter = new MangaChapterController();
      const chapterStory = await mangaChapter.showDetail({ id: chapter_id });

      if (!chapterStory.result) {
        await driver.closeBrowser(browser);
        return res.status(200).send({
          message: 'id chương truyện không tồn tại',
        });;
      }
      const chapter = chapterStory.data;
    
      const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp'];
  
      /**
       * Lấy danh sách các chương truyện
       */
      await page.waitForSelector('.view_group #load_all', {visible: true});
      await page.hover('.view_group #load_all');
      await SleepHelper.sleep(4000);
      // await page.click('.view_group #load_all');
      await page.$eval('.view_group #load_all', el => {
        el.click()
        return '';
      });
      await SleepHelper.sleep(2000);

      let listChapter = await page.$eval('.gallery_bottom #append_thumbs', el => {
        let linkArr = el.querySelectorAll('.gallery_thumb .g_thumb a');
        let tmpArr = [];
        linkArr.forEach(link => {
          tmpArr.push(link.href)
        });
        return tmpArr;
      });
      
      /**
       * Lấy hình ảnh chương truyện
       */
      let index = 0;
    
      // Thư mục chương
      const dirChapterFolder = `${global.root_path}/public${chapter.folder}`;
      fs.rmSync(dirChapterFolder, { recursive: true, force: true });
      FileHelper.createFolderAnfFile(dirChapterFolder, 'name.txt', chapter_name);

      for (const url of listChapter) {
          index++;
          try {
            await driver.gotoUrl(page, url);
            let contentPage = await page.waitForSelector('.full_image .next_img img', { visible: true });
            let imgSrc = await contentPage.evaluate((el) => {
              return el.getAttribute('data-src');
            });
              // Save image
            const arrImages = imgSrc.split('.');
            let extImg = arrImages[arrImages.length - 1];
            if (!extArr.includes(extImg)) {extImg = 'jpg';}
            FileHelper.downloadFile(imgSrc, dirChapterFolder, `${index}.${extImg}`);

            await SleepHelper.sleep(1000);
          } catch (error) {
            console.log(url + ': ' + error);
            index++;
            await SleepHelper.sleep(1000);
          }
      }
      // Lưu vào DB
      await mangaChapter.updateDBStory(chapter_id, {
        title: titleStory,
        total_image: index
      });
      
      await driver.closeBrowser(browser);
    } catch (error) {
      await driver.closeBrowser(browser);
      console.log('Error API /api/manga-super/crawl: ' + error);
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
      let mangaChapter = new MangaChapterController();
      for (let i = 0; i < list_folder_obj.length; i++) {
        const pathFolder = path.join(root_path + '/public', list_folder_obj[i].folder);
        fs.rmSync(pathFolder, { recursive: true, force: true });
        let response = await this.destroyDBStory(list_folder_obj[i]);
        if (response.result) {
          count++;
        }
        const resChapters = await axios({
          url: `http://${req.get('host')}/api/manga-super/list_story_chapter_folder?story_id=${list_folder_obj[i].id}&order_by=id&order_type=ASC`,
          method: 'get',
        });
        const chapers = resChapters.data.records;
        for (let y = 0; y < chapers.length; y++) {
          await mangaChapter.destroyDBStory(chapers[y]);
          count++;
        }
      }
      return res.send({ message: ` Đã xóa ${count} records` });
    } catch (e) {
      console.log('Error Func handleDestroyDir(): ' + e);
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



  // Lấy thông tin truyện trong các file
  async showDetailFile(req, res) {
    const { id } = req.params;
    try {
      const { result, data } = await this.showDetail({ id: id });
      if (result) {
  
        const dirStoryName = `${global.root_path}/public${data.folder}`;
        const fileNameAvatar = FileHelper.findFile(dirStoryName, 'avatar.');
        return res.send({
          result: 1,
          records: {
            title: FileHelper.readFile(dirStoryName + 'title.txt'),
            author: FileHelper.readFile(dirStoryName + 'author.txt'),
            category: FileHelper.readFile(dirStoryName + 'category.txt'),
            status: FileHelper.readFile(dirStoryName + 'parodies.txt'),
            thumbnail: `http://${req.get('host')}${data.folder}${fileNameAvatar}`,
            description: FileHelper.readFile(dirStoryName + 'description.txt'),
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
        const parodies = FileHelper.readFile(`${pathFolder}parodies.txt`);
        const characters = FileHelper.readFile(`${pathFolder}characters.txt`);
        const download = FileHelper.readFile(`${pathFolder}download.txt`);
  
        const listAuthors = author.split('\n');
        for (let t = 0; t < listAuthors.length; t++) {
          if (listAuthors[t]) {
            form.append('authors[]', listAuthors[t]);
          }
        }

        const listCharacters = characters.split('\n');
        for (let t = 0; t < listCharacters.length; t++) {
          if (listCharacters[t]) {
            form.append('characters[]', listCharacters[t]);
          }
        }

        const listCategories = category.split('\n');
        for (let t = 0; t < listCategories.length; t++) {
          if (listCategories[t]) {
            form.append('category[]', listCategories[t]);
          }
        }

        const listParodies = parodies.split('\n');
        for (let t = 0; t < listParodies.length; t++) {
          if (listParodies[t]) {
            form.append('parodies[]', listParodies[t]);
          }
        }
        form.append('title', title);
        form.append('description', description);
        form.append('download', download);
  
        const fileNameAvatar = FileHelper.findFile(pathFolder, 'avatar.');
        // return res.send({ 
        //     domain: `${req.get('host')}${list_folder_obj[key].folder}${fileNameAvatar}`,
        //     avatar: path.join(pathFolder, fileNameAvatar),
        //     glob: path.join(global.root_path, 'public')
        //   });
        if (fileNameAvatar) {
          form.append('avatar', fs.createReadStream(path.join(pathFolder, fileNameAvatar)));
        }
        const respone = await axios({
          url: base_url + 'api/manager/stories/tool-upload-story',
          method: 'post',
          headers: form.getHeaders(),
          data: form,
        });
        let storyRes = respone.data.data;
        // // Lấy danh sách các dir con
        const chaper_last_folder = Number(list_folder_obj[key].chaper_last_folder);
        let position = 1;
        if (!is_upload_all) {
          position = respone.data.skip_position;
        }
        if (chaper_last_folder >= position) {
          const resChapters = await axios({
            url: `http://${req.get('host')}/api/manga-super/list_story_chapter_folder?story_id=${list_folder_obj[key].id}&order_by=id&order_type=ASC`,
            method: 'get',
          });
          const chapers = resChapters.data.records;
          for (let k = 0; k < chapers.length; k++) {
            
            const pathChapter = path.join(pathFolder, String(position))
            const formChapter = new FormData();
            formChapter.append('name', FileHelper.readFile(path.join(pathChapter, 'name.txt')));
            formChapter.append('position', position);
            formChapter.append('total_image', chapers[k].total_image);
        
            for (let index = 1; index <= chapers[k].total_image; index++) {
              const imageName = FileHelper.findFile(pathChapter, `${index}.`);
              
              if (imageName) {
                formChapter.append(`image_${index}`, fs.createReadStream(path.join(pathChapter, imageName)));
              }
       
            }
            
            try {
              const responeChapter = await axios({
                url: base_url + `api/manager/stories/tool-upload-chaper/${storyRes.id}`,
                method: 'post',
                headers: formChapter.getHeaders(),
                data: formChapter,
              });
              
              if (responeChapter.data.status) {
                console.log(`Chaper truyện ${title}: ${responeChapter.data.message}`);
              } else {
                console.log(responeChapter.data);
              }
              position++;
            } catch (e) {
              console.log(`Lỗi request: ${e.message}`);
              await SleepHelper.sleep(10000);
              break;
            }
            await SleepHelper.sleep(2000);
            
          }
          
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
        url: `http://${req.get('host')}/api/manga-super/list_story_folder?page=1&is_paginate=1`,
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
          url: `http://${req.get('host')}/api/manga-super/list_story_folder?page=${i}&per_page=${per_page}&order_by=updatedAt&order_type=desc`,
          method: 'get',
        });
        await SleepHelper.sleep(2000);
        const responeUpload = await axios({
          url: `http://${req.get('host')}/api/manga-super/handle_upload_story`,
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

module.exports = MangaController;
