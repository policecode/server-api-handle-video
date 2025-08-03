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
      const info = await ytdl.getBasicInfo(linkyoutube);
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