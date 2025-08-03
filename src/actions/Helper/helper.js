const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
async function findActiveTab(browser) {
  try {
    const pages = await browser.pages();
    let arr = [];
    // let tmp = false;
    for (let page of pages) {
      const isActive = await page.evaluate(() => {
        console.log('visible', document.visibilityState === 'visible');
        return document.visibilityState === 'visible';
      });
      // tmp = tmp || isActive;
      arr.push(isActive);
      // if (isActive) {
      //   return page;
      // }
    }
    console.log(arr);
    await delay(300)
    return null;
  }
  catch (e) {
    console.log('Error: ', e)
    return null;
  }
}
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time * 1000)
  });
}
function getDirectoriesRecursively(dirPath) {
  try {
    let directories = [];

    // Lấy danh sách các đối tượng trong thư mục đang xét
    let items = fs.readdirSync(dirPath);

    for (let item of items) {
      let itemPath = path.join(dirPath, item);

      // Kiểm tra xem đối tượng là thư mục hay không
      let isDirectory = fs.statSync(itemPath).isDirectory();

      if (isDirectory) {
        directories.push(itemPath);
        // Lấy danh sách thư mục con của thư mục hiện tại và nối vào danh sách thư mục
        directories = directories.concat(getDirectoriesRecursively(itemPath));
      }
    }

    return items;
  }
  catch (e) {
    console.log('Error', e);
    return [];
  }
}
function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.promises.readFile(filePath, 'utf8')
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        if (err.code === 'ENOENT') { // Kiểm tra lỗi "no such file or directory"
          fs.promises.writeFile(filePath, '')
            .then(() => {
              resolve('');
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(err);
        }
      });
  });
}
function appendToLog(logFilePath, logData) {
  logData = logData + '\n'; // Thêm ký tự xuống dòng
  fs.appendFileSync(logFilePath, logData);
}
function overwriteFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log('Ghi đè thành công vào file.');
}
function createLogFile(logDir, logFile) {
  const logPath = path.join(logDir, logFile);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
    // console.log('Đã tạo thư mục: ' + logFile);
  }

  // Kiểm tra xem file log.txt đã tồn tại hay chưa
  if (fs.existsSync(logPath)) {
    // console.log('File đã tồn tại.');
  } else {
    fs.writeFileSync(logPath, '', 'utf-8');
    // console.log('File đã được tạo thành công.');
  }
}
async function checkPageBlock(page) {
  try {
    const process = await page.evaluate(() => {
      const spanElement = document.querySelector('#main-message span[jsselect="heading"]');
      const content = spanElement.innerHTML;
      if (content === 'This site can’t be reached') return true;
      return false;
    });
    return process;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}
function getRandomPhrase(phrasesString, chr = "|") {
  try {
    const phrasesArray = phrasesString.split(chr);
    const randomIndex = Math.floor(Math.random() * phrasesArray.length);
    return phrasesArray[randomIndex];
  }
  catch (e) {
    return null;
  }
}
function randomFloat(x, y) {
  return x + (y - x) * Math.random();
}
function randomInt(x, y) {
  return Math.floor(Math.random() * (y - x + 1)) + x;
}
function convertTimeToSeconds(time) {
  try {
    const timeParts = time.split(':');
    let hours = 0;
    let minutes = parseInt(timeParts[0], 10) || 0;
    let seconds = parseInt(timeParts[1], 10) || 0;
    if (timeParts.length === 3) {
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
      seconds = parseInt(timeParts[2], 10) || 0;
    }
    return (hours * 3600) + (minutes * 60) + seconds;
  } catch (error) {
    console.log('Error converting time:', error.message);
    return 0;
  }
}
function getIdVideoFromUrl(url) {
  try {
    return url.split('v=')[1].split('&')[0];
  }
  catch (e) {
    console.error(e);
    return '';
  }
}
function getIdChannelFromUrl(url) {
  try {
    let arr = url.split('/');
    return arr[arr.length - 1];
  }
  catch (e) {
    console.error(e);
    return '';
  }
}
function parseListVideoYoutubeBuff(strs) {
  try {
    strs = strs.split('\n');
    let data = [];
    for (let str of strs) {
      str = str.split('|');
      let videoId = getIdVideoFromUrl(str[0]);
      let listKeywordTitle = str[1];
      let listLinkChannel = str[2];
      let channelName = str[3];
      let listKeywordChannel = str[4];
      data.push({
        videoId,
        listKeywordTitle,
        listLinkChannel,
        channelName,
        listKeywordChannel
      })
    }
    return data;
  }
  catch (e) {
    console.error(e);
    return null;
  }
}
async function parseLogWatchedVideo(filePath) {
  try {
    createLogFile(filePath + "\\youtube-log", 'watched-video-log.txt');
    return (await helper.readFileAsync(filePath + "\\youtube-log\\watched-video-log.txt"))?.split('\n')?.filter(o => o !== '')?.map(o => o.split("|")[0]);
  }
  catch (e) {
    console.error(e);
    return null;
  }
}
async function checkElementExist(page, selector, timeout) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true; // Nếu element tồn tại sau timeout, trả về true
  } catch (error) {
    return false; // Nếu element không tồn tại sau timeout, trả về false
  }
}
function getNowFormatDate() {
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();

  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  if (second < 10) {
    second = "0" + second;
  }

  let formattedDate = year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
  return formattedDate;
}
function deepCopy(obj){
  return JSON.parse(JSON.stringify(obj));
}

async function test() {
  let data = await readFileAsync('D:\\GPM-Profiles\\qI6WoawbD318042023\\youtube-log\\watched-video-log.txt');
  console.log(data.split('\n'));
}
// test();
const helper = {
  findActiveTab,
  delay,
  getDirectoriesRecursively,
  readFileAsync,
  checkPageBlock,
  getRandomPhrase,
  randomFloat,
  randomInt,
  convertTimeToSeconds,
  createLogFile,
  getIdVideoFromUrl,
  appendToLog,
  overwriteFile,
  checkElementExist,
  parseListVideoYoutubeBuff,
  parseLogWatchedVideo,
  getNowFormatDate,
  getIdChannelFromUrl,
  deepCopy
}
module.exports = helper;