const webApp = global.webApp;
const ToolVideoController = require('../src/controllers/ToolVideoController');

// ===========================================================
webApp.get('/api/tool-video', async (req, res) => {
  return res.json('API này có hoạt động haiz ok men')
});

webApp.post('/api/tool-video/crawl-download-youtube', async (req, res) => {
  const toolVideoController = new ToolVideoController();
  return toolVideoController.crawlYoutube(req, res);
});

webApp.post('/api/tool-video/download-video', async (req, res) => {
  const toolVideoController = new ToolVideoController();
  return toolVideoController.downloadVideo(req, res);
});