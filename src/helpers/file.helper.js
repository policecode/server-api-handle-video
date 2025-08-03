const {
  stringify
} = require('yaml');
const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');
class FileHelper{

  static parseLine(line,sortParams,splitStr = '|'){
    console.log(line,sortParams,splitStr)
    if(!line || line.length == 0){
      return null
    }
    const head = sortParams.split(splitStr)
    const data = line.split(splitStr)
    const result = {}
    for(const i in head){
      if(head[i])
        result[head[i]] = data[i]
    }
    return result
  }

  
  static async fileMailToYaml (filePath) {

    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    const accounts = []
    for await (const line of rl) {
      let account = this.parseLine(line,'email|password|recover_email|cookies');
      accounts.push(account)
    }
    const accountYaml = stringify(accounts)
    return accountYaml
  }

  static async streamInsert(filePath, model, headStr, splitStr){
      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
      });
      let data = []
      for await (const line of rl) {
          data.push(this.parseLine(line, headStr, splitStr))
          if(data.length == 1000){
              await model.bulkCreate(data)
              data = []
          }
      }
      if(data.length){
          await model.bulkCreate(data)
      }

      fs.unlinkSync(filePath);
      return true
  }

  static createFolderAnfFile(__pathFolder, __fileName='', __text='') {
    const dirParent = path.join(__pathFolder);
    if (!fs.existsSync(dirParent)) {
      fs.mkdirSync(dirParent, {recursive: true})
    }
    const pathText = path.join(dirParent, __fileName);
    if (__fileName) {
      fs.writeFileSync(pathText, __text, 'utf-8');
    }
  }

  static downloadFile (__url, __pathFolder, __fileName) {
    const dirParent = path.join(__pathFolder);
    if (!fs.existsSync( dirParent)) {
        fs.mkdirSync(dirParent, {recursive: true})
    }
    https.get(__url, (res) => {
        res.pipe(fs.createWriteStream(path.join(dirParent, __fileName)));
    });
  }

  static async downloadFileBuffer (__url, __pathFolder, __fileName) {
      const response = await fetch(__url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer, 'binary');
      const pathFolder = path.join(__pathFolder, __fileName);
      fs.writeFileSync(pathFolder, buffer);
  }

  static async downloadImage(__url, __pathFolder, __fileName) {
    const dirParent = path.join(__pathFolder);  
    if (!fs.existsSync( dirParent)) {
      fs.mkdirSync(dirParent, {recursive: true})
    }
    return new Promise((resolve, reject) => {
      https.get(__url, (res) => {
          if (res.statusCode === 200) {
              res.pipe(fs.createWriteStream(path.join(dirParent, __fileName)))
                  .on('error', reject)
                  .once('close', () => resolve(`Success: ${path.join(dirParent, __fileName)}`));
          } else {
              // Consume response data to free up memory
              res.resume();
              reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

          }
      });
  });
}


  static totalFolder(__path_folder_parent) {
    try {
      const listDir = fs.readdirSync(__path_folder_parent);
      let total = 0;
      listDir.forEach(dir => {
        const pathFolderChild = path.join(__path_folder_parent, dir);
        const dirent = fs.statSync(pathFolderChild);
        if (dirent.isDirectory()) total++;
      });
      return total;
    } catch (error) {
      console.log('FileHelper class totalFolder(): ' +error);
      return 0;
    }
  }

  static readFile(__path_dir) {
    const pathFile = path.join(__path_dir);
    if (fs.existsSync(pathFile)) {
      return fs.readFileSync(pathFile, {
        encoding: 'utf-8'
      });
    }
    return '';
  }

  // Lấy danh danh thư mục các chương và sắp xếp
  static getFolderChapter (__path_dir) {
    const tmp = fs.readdirSync(__path_dir);
    const listChapter = [];
    for (let index = 0; index < tmp.length; index++) {
        let objNumber = tmp[index].match(/[0-9]+/);
        if (objNumber) {
            let number = Number(objNumber[0]);
            listChapter.push({
                index: number,
                path: tmp[index]
            });
        }
    }
    
    for (let i = 0; i < listChapter.length - 1; i++) {
        for (let j = listChapter.length - 1; j > i; j--) {
          if (listChapter[j].index < listChapter[j - 1].index) {
            let t = listChapter[j];
            listChapter[j] = listChapter[j - 1];
            listChapter[j - 1] = t;
          }
        }
      }
    
    const result = [];
    for (let a = 0; a < listChapter.length; a++) {
        result.push(listChapter[a].path)
    }
    return result;
  }

  /**
   * Tìm kiếm một file hoặc thư mục (DIR) trong thư mục
   * - __path_dir: Thu mục tiến hành tìm kiếm
   * - __file_key: Từ khóa tìm kiếm
   * - resulit: Trả ra DIR đầu tiên phù hợp với kết quả
   * - Tìm kiếm theo kiểu String LIKE __file_key%
   */
  static findFile (__path_dir, __file_key) {
      let listDirStory = fs.readdirSync(__path_dir);
      const result = listDirStory.find(el => {
          return el.includes(__file_key) && el.indexOf(__file_key) == 0;
      })
      if (result) {
        return result;
      }
      return false;
  }
}
module.exports = FileHelper;
