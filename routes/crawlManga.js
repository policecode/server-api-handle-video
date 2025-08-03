const webApp = global.webApp;
const MangaController = require('../src/controllers/MangaController');
const MangaChapterController = require('../src/controllers/MangaChapterController');
const AllporncomicController = require('../src/controllers/crawlManga/AllporncomicController');

webApp.get('/api/manga-super/test_api', async (req, res) => {
    const mangaController = new MangaController();
    return mangaController.testBrowser(req, res);
  });

  webApp.get('/api/manga-super/list_story_folder', (req, res) => {
    const mangaController = new MangaController();
    return mangaController.list(req, res);
  });

  webApp.get('/api/manga-super/list_story_chapter_folder', (req, res) => {
    const mangaChapterController = new MangaChapterController();
    return mangaChapterController.list(req, res);
  });

  webApp.get('/api/manga-super/detail-story/:id', (req, res) => {
    const {is_file} = req.query;
    const mangaChapterController = new MangaController();
    if (is_file) {
      return mangaChapterController.showDetailFile(req, res);
    }
    return mangaChapterController.show(req, res);
  });

  webApp.post('/api/manga-super/create', (req, res) => {
    let { current } = req.body;
    if (current == 'hentaifox.com') {
      const mangaController = new MangaController();
      return mangaController.crawToolStoryManga(req, res);
    }

    if (current == 'allporncomic.com') {
      const mangaController = new AllporncomicController();
      return mangaController.crawToolStoryManga(req, res);
    }

  });

  // Cập nhật lại thông tin truyện từ trang web
webApp.post('/api/manga-super/update', (req, res) => {
  let { current } = req.body;
  if (current == 'hentaifox.com') {
    const mangaController = new MangaController();
    return mangaController.handleUpdateStoryManga(req, res);
  }
  if (current == 'allporncomic.com') {
    const mangaController = new AllporncomicController();
    return mangaController.handleUpdateStoryManga(req, res);
  }
});

// Cập nhật lại thông tin các file
webApp.post('/api/manga-super/story/update', (req, res) => {
  const mangaController = new MangaController();
  return mangaController.updateStory(req, res);

 
});

// Upload truyện lên trang web
webApp.post("/api/manga-super/handle_upload_story", (req, res) => {
  const mangaController = new MangaController();
  return mangaController.handleUploadStory(req, res);
});

webApp.post("/api/manga-super/handle_upload_all_story", (req, res) => {
  const mangaController = new MangaController();
  return mangaController.uploadAllStory(req, res);
});

// Xóa danh sách truyện
webApp.post('/api/manga-super/destroy_story', (req, res) => {
  const mangaController = new MangaController();
  return mangaController.handleDestroyDir(req, res);
});