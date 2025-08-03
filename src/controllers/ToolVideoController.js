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
const ytdl = require("@distube/ytdl-core");
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
    const {linkyoutube} = req.body;

    try {
      // const folderStory = `/video/`;
      // const dirStoryName = `${global.root_path}/public${folderStory}`;
      // FileHelper.createFolderAnfFile(dirStoryName);
      // Get video info
      const info = await ytdl.getBasicInfo(linkyoutube);
      const video = await ytdl.getInfo(linkyoutube)
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
            listVideo[el.qualityLabel] = el
          } else if(el.hasVideo && el.hasAudio) {
            if (!(listVideo[el.qualityLabel].hasVideo && listVideo[el.qualityLabel].hasAudio)) {
              listVideo[el.qualityLabel] = el
            }
          }
        }
        if (!el.hasVideo) {
          listAudio[el.quality] = el
        }
      });

      let information = {
        title: info.videoDetails.title,
        videoUrl: info.videoDetails.video_url,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        description: info.videoDetails.description,
        lengthSeconds: info.videoDetails.lengthSeconds,
        authorName: info.videoDetails.ownerChannelName,
        authorUrl: info.videoDetails.ownerProfileUrl,
        authorThumbnail: info.videoDetails.author.thumbnails[info.videoDetails.author.thumbnails.length - 1]?.url,
        isFamilySafe: info.videoDetails.isFamilySafe,
        viewCount: info.videoDetails.viewCount,
        likeCount: info.videoDetails.likeCount
      }


      return res.status(200).send({
        result: 1,
        type: 'Success',
        information: information,
        audio: listAudio,
        video: listVideo
      });
    } catch (e) {
      return res.status(200).send({
        result: 0,
        type: 'Error',
        message: e.message
      });
    }
    
  }

  async crawlYoutube(req, res) {
    const {linkyoutube} = req.body;
    try {
      const cookies = [
        { name: "datr", value: "aYVEaOYGngCd8xFaUrXdPVMy" },
        { name: "sb", value: "aYVEaGAbLuKlkO9Cz51e1FYC" },
        { name: "c_user", value: "100093990249296" },
        { name: "ps_l", value: "1" },
        { name: "ps_n", value: "1" },
        { name: "ar_debug", value: "1" },
        { name: "wd", value: "1920x945" },
        { name: "i_user", value: "61577351630995" },
        { name: "fr", value: "1W84p5bwQt79Fd5PD.AWfB2BaFxlhsRsKpaiJnIW6WkJiv-fdoWsuOrGm4dnEfN7UF2fo.BojypI..AAA.0.0.BojypI.AWcr9I3uzEptdFSUoQJQHOENlfU" },
        { name: "xs", value: "15%3AIgW3nEmjQ65AIw%3A2%3A1749321172%3A-1%3A-1%3A%3AAcVXzSwIJtu5ir0gI1jZ5MLGGMTZGOwYQ2ab5tNqUp_Y" },
        { name: "presence", value: "C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1754212948115%2C%22v%22%3A1%7D" }
      ];
      const agentOptions = {
        pipelining: 5,
        maxRedirections: 0,
        localAddress: "127.0.0.1",
      };
      const agent = ytdl.createAgent(cookies, agentOptions);
      const info = await ytdl.getBasicInfo(linkyoutube, agent);
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
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        description: info.videoDetails.description,
        lengthSeconds: info.videoDetails.lengthSeconds,
        authorName: info.videoDetails.ownerChannelName,
        authorUrl: info.videoDetails.ownerProfileUrl,
        authorThumbnail: info.videoDetails.author.thumbnails[info.videoDetails.author.thumbnails.length - 1]?.url,
        isFamilySafe: info.videoDetails.isFamilySafe,
        viewCount: info.videoDetails.viewCount,
        likeCount: info.videoDetails.likeCount
      }


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
        message: e.message
      });
    }
  }

  async downloadVideo(req, res) {
     try {
        const videoUrl = req.body.url
        https.get(videoUrl, (videoRes) => {
             console.log(videoRes.statusCode);
            res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
            res.setHeader('Content-Type', 'video/mp4');
            videoRes.pipe(res);
        }).on('error', (err) => {
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
        message: e.message
      });
    }
  }

}

module.exports = ToolVideoController;