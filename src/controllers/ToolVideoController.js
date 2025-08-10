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
      const myCookie  = "LOGIN_INFO=AFmmF2swRQIhAJuSZp1z9AGkyx7qI_jcQvlsVe9a2ZVpn6sNLlOOMVkxAiAoik6nKL9iSoXU4O9DGFQDH6Xu8hYyVRnLpnrOjJQvUQ:QUQ3MjNmenZfR1dyRnB2WlpmTlg0VlFpbjE2ZWMxV1FOZGRnRjZFc2lWQ2pSd01VZUszSHItaGx4QlF6RTVkYVkzb3hrcEwyNG83bWdENTJGUlJueW9tZkJDcEpfVnBoeWJtUGRodDlYYWtuNFRxbEdjUERyUVM2cmN6RGxBdnh2NjZPV3FkeVYzNG1tQnRhZko1SFdUWXAzV3M0aWk5SVV3; HSID=Anpr7bETtVYnnCKO7; SSID=A1hzMz4wrhXnOCkYY; APISID=gulaWar28pwySVQl/AEvTjQvwdPrmoazjn; SAPISID=E8wcaMq7-2kqMNjF/A2w3KS0Qg26uUpzU-; __Secure-1PAPISID=E8wcaMq7-2kqMNjF/A2w3KS0Qg26uUpzU-; __Secure-3PAPISID=E8wcaMq7-2kqMNjF/A2w3KS0Qg26uUpzU-; VISITOR_INFO1_LIVE=2DNf5jVOpmo; VISITOR_PRIVACY_METADATA=CgJWThIEGgAgNg%3D%3D; YSC=iJh_8lVbtTM; PREF=tz=Asia.Saigon&f7=100; SID=g.a0000Aj_YcJMQnjLTwsJLmYDlJ9jGcC374X6yIopszrLFNG-zMCBu8p_UaUjR9piyPQx6yk6xgACgYKAUUSARMSFQHGX2Mig5ZMnU1a9JhuZogZAUtMdRoVAUF8yKouiSgF5YWrMfNsK7ahQ9il0076; __Secure-1PSID=g.a0000Aj_YcJMQnjLTwsJLmYDlJ9jGcC374X6yIopszrLFNG-zMCBjY49mUo0LjiBH-iXCHX6fAACgYKAakSARMSFQHGX2MiBinaBIEX3FVnMQiVvwFDJRoVAUF8yKqgIMq9rqVd1q8rmqpAXMcz0076; __Secure-3PSID=g.a0000Aj_YcJMQnjLTwsJLmYDlJ9jGcC374X6yIopszrLFNG-zMCBy818vO_ZmErouQhTDZAM5wACgYKAYUSARMSFQHGX2MiEV3b7_7KY5GMmFOaKuXvuBoVAUF8yKrNsOvtoP6TDH8ps39WlXkO0076; __Secure-ROLLOUT_TOKEN=COz5pKC-gPOXUBCq9uOR4v2NAxjjg6Govf-OAw%3D%3D; __Secure-1PSIDTS=sidts-CjEB5H03P_TBvScTWxAUHUlCz8-azyPM7inF7CqD9FTYUZ-Iz44s_kkt3ShA6GYjp1yoEAA; __Secure-3PSIDTS=sidts-CjEB5H03P_TBvScTWxAUHUlCz8-azyPM7inF7CqD9FTYUZ-Iz44s_kkt3ShA6GYjp1yoEAA; SIDCC=AKEyXzV6rwxCNja-At8Q9BZGE2O3KY5JYSS6KdXdqLRb-G_DpIQlZqgJn0PmA95XBr0sTUBB_A; __Secure-1PSIDCC=AKEyXzUZ_5ahRRktxUxzJcmt16O89n_VpigRnh6DllopdeishVbR2VgJxgfaJDB73nE1Qrg4CA; __Secure-3PSIDCC=AKEyXzXkZnHGnC8NUeNRWtZpNL1CkWKbUOfuAOB7TmB81ifkeBVhmOIBMmoVkaXRZ7CCW1_eXA";
      const proxyUri = "http://euwjauzq:6ubyvn1o2nfs@45.38.107.97:6014";
      const agent = ytdl.createProxyAgent({ uri: proxyUri })
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
