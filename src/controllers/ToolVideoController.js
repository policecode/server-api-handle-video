// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
const http = require('http');
const https = require('https');
// const FormData = require('form-data');
const Controller = require('./Controller');
// const BrowserDriver = require('../drivers/BrowserDriver');
// const RandomHelper = require('../helpers/random.helper');
const FileHelper = require('../helpers/file.helper');
// const SleepHelper = require('../helpers/sleep.helper');
// const db = require('../models/db');
const ytdl = require('@distube/ytdl-core');
class ToolVideoController extends Controller {
  constructor() {
    super();
    this.model = '';
    this.primaryKey = [];
    this.filterTextFields = [];
    this.filterFields = [];
    this.filterFieldsNot = [];
  }

  async testToolVideo(req, res) {
    const { linkyoutube } = req.body;

    try {
      // const folderStory = `/video/`;
      // const dirStoryName = `${global.root_path}/public${folderStory}`;
      // FileHelper.createFolderAnfFile(dirStoryName);
      // Get video info
      const info = await ytdl.getBasicInfo(linkyoutube);
      const video = await ytdl.getInfo(linkyoutube);
      const listVideo = {};
      const listAudio = {};

      // console.log(info.videoDetails.title);
      // Download a video
      // await FileHelper.downloadImage(info.formats[1].url, dirStoryName, `${info.videoDetails.title}.mp4`)

      // ytdl(info.formats[0].url).pipe(fs.createWriteStream(`${dirStoryName}${info.videoDetails.title}.mp4`));
      // console.log(info.formats[0].url);

      video.formats.forEach((el, index) => {
        if (el.container == 'mp4' && el.qualityLabel) {
          // el.hasVideo && el.hasAudio &&
          if (!listVideo[el.qualityLabel]) {
            listVideo[el.qualityLabel] = el;
          } else if (el.hasVideo && el.hasAudio) {
            if (
              !(
                listVideo[el.qualityLabel].hasVideo &&
                listVideo[el.qualityLabel].hasAudio
              )
            ) {
              listVideo[el.qualityLabel] = el;
            }
          }
        }
        if (!el.hasVideo) {
          listAudio[el.quality] = el;
        }
      });

      let information = {
        title: info.videoDetails.title,
        videoUrl: info.videoDetails.video_url,
        thumbnail:
          info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
            .url,
        description: info.videoDetails.description,
        lengthSeconds: info.videoDetails.lengthSeconds,
        authorName: info.videoDetails.ownerChannelName,
        authorUrl: info.videoDetails.ownerProfileUrl,
        authorThumbnail:
          info.videoDetails.author.thumbnails[
            info.videoDetails.author.thumbnails.length - 1
          ]?.url,
        isFamilySafe: info.videoDetails.isFamilySafe,
        viewCount: info.videoDetails.viewCount,
        likeCount: info.videoDetails.likeCount,
      };

      return res.status(200).send({
        result: 1,
        type: 'Success',
        information: information,
        audio: listAudio,
        video: listVideo,
      });
    } catch (e) {
      return res.status(200).send({
        result: 0,
        type: 'Error',
        message: e.message,
      });
    }
  }

  async crawlYoutube(req, res) {
    const { linkyoutube } = req.body;

    try {
      const cookies  = ([
        [
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.405374,
            hostOnly: false,
            httpOnly: false,
            name: '__Secure-1PAPISID',
            path: '/',
            sameSite: 'unspecified',
            secure: true,
            session: false,
            storeId: '0',
            value: 'E8wcaMq7-2kqMNjF/A2w3KS0Qg26uUpzU-',
            id: 1,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.405557,
            hostOnly: false,
            httpOnly: true,
            name: '__Secure-1PSID',
            path: '/',
            sameSite: 'unspecified',
            secure: true,
            session: false,
            storeId: '0',
            value:
              'g.a0000Aj_YcJMQnjLTwsJLmYDlJ9jGcC374X6yIopszrLFNG-zMCBjY49mUo0LjiBH-iXCHX6fAACgYKAakSARMSFQHGX2MiBinaBIEX3FVnMQiVvwFDJRoVAUF8yKqgIMq9rqVd1q8rmqpAXMcz0076',
            id: 2,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1786294203.070964,
            hostOnly: false,
            httpOnly: true,
            name: '__Secure-1PSIDCC',
            path: '/',
            sameSite: 'unspecified',
            secure: true,
            session: false,
            storeId: '0',
            value:
              'AKEyXzU9TqfzstyoXX_Pzf8U1OXbzsv-r4YpuO0sDEAl8GsBKXq3BX3fscKMP9jhbsufw58b6Q',
            id: 3,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1786293790.881007,
            hostOnly: false,
            httpOnly: true,
            name: '__Secure-1PSIDTS',
            path: '/',
            sameSite: 'unspecified',
            secure: true,
            session: false,
            storeId: '0',
            value:
              'sidts-CjEB5H03P76X6iqhohQBceuuEU2tZBRXUL6OXL1OXNy1ydpCcdm2FENp4PlG1S8J46k9EAA',
            id: 4,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.405394,
            hostOnly: false,
            httpOnly: false,
            name: '__Secure-3PAPISID',
            path: '/',
            sameSite: 'no_restriction',
            secure: true,
            session: false,
            storeId: '0',
            value: 'E8wcaMq7-2kqMNjF/A2w3KS0Qg26uUpzU-',
            id: 5,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.405575,
            hostOnly: false,
            httpOnly: true,
            name: '__Secure-3PSID',
            path: '/',
            sameSite: 'no_restriction',
            secure: true,
            session: false,
            storeId: '0',
            value:
              'g.a0000Aj_YcJMQnjLTwsJLmYDlJ9jGcC374X6yIopszrLFNG-zMCBy818vO_ZmErouQhTDZAM5wACgYKAYUSARMSFQHGX2MiEV3b7_7KY5GMmFOaKuXvuBoVAUF8yKrNsOvtoP6TDH8ps39WlXkO0076',
            id: 6,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1786294203.070992,
            hostOnly: false,
            httpOnly: true,
            name: '__Secure-3PSIDCC',
            path: '/',
            sameSite: 'no_restriction',
            secure: true,
            session: false,
            storeId: '0',
            value:
              'AKEyXzVDnnsBzv-BmCQCHKr9lVXNAGCrYRnoHSnazIIcfcBX5cGY36vDbOnhTsU-3fV8JrN0fg',
            id: 7,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1786293790.881128,
            hostOnly: false,
            httpOnly: true,
            name: '__Secure-3PSIDTS',
            path: '/',
            sameSite: 'no_restriction',
            secure: true,
            session: false,
            storeId: '0',
            value:
              'sidts-CjEB5H03P76X6iqhohQBceuuEU2tZBRXUL6OXL1OXNy1ydpCcdm2FENp4PlG1S8J46k9EAA',
            id: 8,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.405331,
            hostOnly: false,
            httpOnly: false,
            name: 'APISID',
            path: '/',
            sameSite: 'unspecified',
            secure: false,
            session: false,
            storeId: '0',
            value: 'gulaWar28pwySVQl/AEvTjQvwdPrmoazjn',
            id: 9,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.405204,
            hostOnly: false,
            httpOnly: true,
            name: 'HSID',
            path: '/',
            sameSite: 'unspecified',
            secure: false,
            session: false,
            storeId: '0',
            value: 'Anpr7bETtVYnnCKO7',
            id: 10,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1773505285.487379,
            hostOnly: false,
            httpOnly: true,
            name: 'LOGIN_INFO',
            path: '/',
            sameSite: 'no_restriction',
            secure: true,
            session: false,
            storeId: '0',
            value:
              'AFmmF2swRQIhAJuSZp1z9AGkyx7qI_jcQvlsVe9a2ZVpn6sNLlOOMVkxAiAoik6nKL9iSoXU4O9DGFQDH6Xu8hYyVRnLpnrOjJQvUQ:QUQ3MjNmenZfR1dyRnB2WlpmTlg0VlFpbjE2ZWMxV1FOZGRnRjZFc2lWQ2pSd01VZUszSHItaGx4QlF6RTVkYVkzb3hrcEwyNG83bWdENTJGUlJueW9tZkJDcEpfVnBoeWJtUGRodDlYYWtuNFRxbEdjUERyUVM2cmN6RGxBdnh2NjZPV3FkeVYzNG1tQnRhZko1SFdUWXAzV3M0aWk5SVV3',
            id: 11,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789316785.097249,
            hostOnly: false,
            httpOnly: false,
            name: 'PREF',
            path: '/',
            sameSite: 'unspecified',
            secure: true,
            session: false,
            storeId: '0',
            value: 'tz=Asia.Saigon&f7=100',
            id: 12,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.405353,
            hostOnly: false,
            httpOnly: false,
            name: 'SAPISID',
            path: '/',
            sameSite: 'unspecified',
            secure: true,
            session: false,
            storeId: '0',
            value: 'E8wcaMq7-2kqMNjF/A2w3KS0Qg26uUpzU-',
            id: 13,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.40554,
            hostOnly: false,
            httpOnly: false,
            name: 'SID',
            path: '/',
            sameSite: 'unspecified',
            secure: false,
            session: false,
            storeId: '0',
            value:
              'g.a0000Aj_YcJMQnjLTwsJLmYDlJ9jGcC374X6yIopszrLFNG-zMCBu8p_UaUjR9piyPQx6yk6xgACgYKAUUSARMSFQHGX2Mig5ZMnU1a9JhuZogZAUtMdRoVAUF8yKouiSgF5YWrMfNsK7ahQ9il0076',
            id: 14,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1786294203.070874,
            hostOnly: false,
            httpOnly: false,
            name: 'SIDCC',
            path: '/',
            sameSite: 'unspecified',
            secure: false,
            session: false,
            storeId: '0',
            value:
              'AKEyXzV3Rkywbdo1V9zdLuJdAdETkIfRxvlGgDRimVWYSdn9GMXTWKbGoLmTd4Cw6VJsrjgqyw',
            id: 15,
          },
          {
            domain: '.youtube.com',
            expirationDate: 1789264365.405296,
            hostOnly: false,
            httpOnly: true,
            name: 'SSID',
            path: '/',
            sameSite: 'unspecified',
            secure: true,
            session: false,
            storeId: '0',
            value: 'A1hzMz4wrhXnOCkYY',
            id: 16,
          },
        ],
      ]);
      const agentOptions = {
 
      };
      const agent = ytdl.createAgent(cookies, agentOptions);
      const info = await ytdl.getBasicInfo(linkyoutube, {agent});
      // const video = await ytdl.getInfo(linkyoutube )
      // const listVideo = {};
      // const listAudio = {};

      // video.formats.forEach((el, index) => {
      //   if (el.container == 'mp4' && el.qualityLabel) {
      //   // el.hasVideo && el.hasAudio &&
      //     if (!listVideo[el.qualityLabel]) {
      //       listVideo[el.qualityLabel] = el
      //     } else if(el.hasVideo && el.hasAudio) {
      //       if (!(listVideo[el.qualityLabel].hasVideo && listVideo[el.qualityLabel].hasAudio)) {
      //         listVideo[el.qualityLabel] = el
      //       }
      //     }
      //   }
      //   if (!el.hasVideo) {
      //     listAudio[el.quality] = el
      //   }
      // });

      let information = {
        title: info.videoDetails.title,
        videoUrl: info.videoDetails.video_url,
        thumbnail:
          info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
            .url,
        description: info.videoDetails.description,
        lengthSeconds: info.videoDetails.lengthSeconds,
        authorName: info.videoDetails.ownerChannelName,
        authorUrl: info.videoDetails.ownerProfileUrl,
        authorThumbnail:
          info.videoDetails.author.thumbnails[
            info.videoDetails.author.thumbnails.length - 1
          ]?.url,
        isFamilySafe: info.videoDetails.isFamilySafe,
        viewCount: info.videoDetails.viewCount,
        likeCount: info.videoDetails.likeCount,
      };

      return res.status(200).send({
        result: 1,
        type: 'Success',
        information: information,
        // audio: listAudio,
        // video: listVideo
      });
    } catch (e) {
      return res.status(200).send({
        result: 0,
        type: 'Error',
        message: e.message,
      });
    }
  }

  async downloadVideo(req, res) {
    try {
      const videoUrl = req.body.url;
      https
        .get(videoUrl, (videoRes) => {
          console.log(videoRes.statusCode);
          res.setHeader(
            'Content-Disposition',
            'attachment; filename=video.mp4'
          );
          res.setHeader('Content-Type', 'video/mp4');
          videoRes.pipe(res);
        })
        .on('error', (err) => {
          console.error(err);
          res.status(500).send('Lỗi tải video');
        });

      //   return res.status(200).send({
      //     result: 1,
      //     type: 'Success',
      //     data: videoUrl
      //   });
    } catch (e) {
      return res.status(200).send({
        result: 0,
        type: 'Error',
        message: e.message,
      });
    }
  }
}

module.exports = ToolVideoController;
