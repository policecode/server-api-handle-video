const webApp = global.webApp;
const CrawController = require('../src/controllers/CrawController');
const NhasachController = require('../src/controllers/crawl/NhasachController');
const DaoquanController = require('../src/controllers/crawl/DaoquanController');
const TruyenfullController = require('../src/controllers/crawl/TruyenfullController');
const BanlongController = require('../src/controllers/crawl/BanlongController');
const VozerController = require('../src/controllers/crawl/VozerController');
const MetruyencvController = require('../src/controllers/crawl/MetruyencvController');
const TruyenfullioController = require('../src/controllers/crawl/TruyenfullioController');
const DttruyenController = require('../src/controllers/crawl/DttruyenController');
const MonkeyController = require('../src/controllers/crawl/MonkeyController');

// ===========================================================
webApp.get('/api/truyenfullsuper/test_api', async (req, res) => {
  const crawController = new CrawController();
  return crawController.testBrowser(req, res);
});

webApp.post('/api/truyenfullsuper/crawl', (req, res) => {
  let { current } = req.body;
  // if (current == 'truyenfull.tv') {
  //   const crawController = new TruyenfullController();
  //   return crawController.crawToolStoryTruyenFull(req, res);
  // }
  if (current == 'nhasachmienphi.com') {
    const crawController = new NhasachController();
    return crawController.crawToolStoryTruyenFull(req, res);
  }
  if (current == 'daoquan.vn') {
    const crawController = new DaoquanController();
    return crawController.crawToolStoryTruyenFull(req, res);
  }
  if (current == 'banlong.us') {
    const crawController = new BanlongController();
    return crawController.crawToolStoryTruyenFull(req, res);
  }

  if (current == 'vozer.vn') {
    const crawController = new VozerController();
    return crawController.crawToolStoryTruyenFull(req, res);
  }

  if (current == 'metruyencv.com') {
    const crawController = new MetruyencvController();
    return crawController.crawToolStoryTruyenFull(req, res);
  }

  if (current == 'truyenfull.io') {
    const crawController = new TruyenfullioController();
    return crawController.crawToolStoryTruyenFull(req, res);
  }

  if (current == 'monkeydtruyen.com') {
    const crawController = new MonkeyController();
    return crawController.crawToolStoryTruyenFull(req, res);
  }
});

webApp.get('/api/truyenfullsuper/list_story_folder', (req, res) => {
  const crawController = new CrawController();
  return crawController.list(req, res);
});
webApp.get('/api/truyenfullsuper/detail_story/:id', (req, res) => {
  const {is_file} = req.query;
  const crawController = new CrawController();
  if (is_file) {
    return crawController.showDetailFile(req, res);
  }
  return crawController.show(req, res);
});

webApp.post('/api/truyenfullsuper/list_chapter_story', (req, res) => {
  const crawController = new CrawController();
  return crawController.getDetailListChapter(req, res);
});

// Xóa danh sách truyện
webApp.post('/api/truyenfullsuper/destroy_story', (req, res) => {
  const crawController = new CrawController();
  return crawController.handleDestroyDir(req, res);
});

// Thêm chương truyện mới (sửa file)
webApp.get('/api/truyenfullsuper/chapter/store/:id', (req, res) => {
  const crawController = new CrawController();
  return crawController.storeChapterStory(req, res);
});
// Cập nhật lại chương truyện (sửa file)
webApp.post('/api/truyenfullsuper/chapter/update', (req, res) => {
  const crawController = new CrawController();
  return crawController.updateChapterStory(req, res);
});
// Cập nhật lại thông tin truyện (sửa file)
webApp.post('/api/truyenfullsuper/story/update', (req, res) => {
  const crawController = new CrawController();
  return crawController.updateStory(req, res);
});
// Cập nhật lại thông tin truyện từ trang web
webApp.post('/api/truyenfullsuper/update_story', (req, res) => {
  let { current } = req.body;
  if (current == 'vozer.vn') {
    const crawController = new VozerController();
    return crawController.handleUpdateStory(req, res);
  }
  if (current == 'daoquan.vn') {
    const crawController = new DaoquanController();
    return crawController.handleUpdateStory(req, res);
  }
  if (current == 'truyenfull.com') {
    const crawController = new CrawController();
    return crawController.handleUpdateStory(req, res);
  }
  if (current == 'banlong.us') {
    const crawController = new BanlongController();
    return crawController.handleUpdateStory(req, res);
  }
  if (current == 'metruyencv.com') {
    const crawController = new MetruyencvController();
    return crawController.handleUpdateStory(req, res);
  }
  if (current == 'truyenfull.io') {
    const crawController = new TruyenfullioController();
    return crawController.handleUpdateStory(req, res);
  }
  if (current == 'monkeydtruyen.com') {
    const crawController = new MonkeyController();
    return crawController.handleUpdateStory(req, res);
  }
});
webApp.post('/api/truyenfullsuper/update_story_all', (req, res) => {
  const crawController = new CrawController();
  return crawController.handleUpdateAllStory(req, res);
});
// webApp.post("/api/truyenfullsuper/update/:id", (req, res) => {
//     const crawController = new CrawController();
//     return crawController.update(req, res);
// });
// Upload truyện lên trang web
webApp.post("/api/truyenfullsuper/handle_upload_story", (req, res) => {
    const crawController = new CrawController();
    return crawController.handleUploadStory(req, res);
});
// Upload toàn bộ truyện lên trang web
webApp.post("/api/truyenfullsuper/handle_upload_all_story", (req, res) => {
  const crawController = new CrawController();
  return crawController.uploadAllStory(req, res);
});

// Spam comment
webApp.post('/api/truyenfullsuper/spam_comment', (req, res) => {
  let { current } = req.body;

  if (current == 'truyenfull.tv') {
    // console.log(current);
    const crawController = new TruyenfullController();
    return crawController.spamComment(req, res);
  }
  // if (current == 'nhasachmienphi.com') {
  //   const crawController = new NhasachController();
  //   return crawController.crawToolStoryTruyenFull(req, res);
  // }
  // if (current == 'daoquan.vn') {
  //   const crawController = new DaoquanController();
  //   return crawController.crawToolStoryTruyenFull(req, res);
  // }
  if (current == 'banlong.us') {
    const crawController = new BanlongController();
    return crawController.spamComment(req, res);
  }

  if (current == 'vozer.vn') {
    const crawController = new VozerController();
    return crawController.spamComment(req, res);
  }

  if (current == 'dtruyen.net') {
    const crawController = new DttruyenController();
    return crawController.spamComment(req, res);
  }
  
  // if (current == 'metruyencv.com') {
  //   const crawController = new MetruyencvController();
  //   return crawController.crawToolStoryTruyenFull(req, res);
  // }

  if (current == 'truyenfull.io') {
    const crawController = new TruyenfullioController();
    return crawController.spamComment(req, res);
  }
});