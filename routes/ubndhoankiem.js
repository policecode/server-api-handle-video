const webApp = global.webApp;
const UbndhoankiemmController = require('../src/controllers/UbndhoankiemController');

// ===========================================================
webApp.get('/api/ubndhoankiem/register_account', async (req, res) => {
  const hoankiemmController = new UbndhoankiemmController();
  return hoankiemmController.registerAccount(req, res);
});

webApp.get('/api/ubndhoankiem/account/list', (req, res) => {
  const hoankiemmController = new UbndhoankiemmController();
  return hoankiemmController.list(req, res);
});

webApp.post('/api/ubndhoankiem/account/create', async (req, res) => {
  let { password, email } = req.body;
  if (!email) {
    return res.send({
      data: req.body,
      result: 0,
      message: 'email is not value',
    });
  }
  if (!password) {
    return res.send({
      result: 0,
      message: 'Email is not value',
    });
  }

  try {
    const hoankiemmController = new UbndhoankiemmController();
    let data = await hoankiemmController.createDB(req.body);
    return res.send({
      result: 1,
      records: data,
      message: 'Create Profile success',
    });
  } catch (e) {
    return res.send({
      result: 0,
      code: '9999',
      message: 'FAILED',
      reason: e.message,
    });
  }
 
});

webApp.delete('/api/ubndhoankiem/account/destroy/:id', async (req, res) => {
  const hoankiemmController = new UbndhoankiemmController();
  let { id } = req.params;
  try {
   
    await hoankiemmController.destroyDB({id: id});
    return res.send({
      result: 1,
      message: 'Delete DB ubndhoankiem success',
    });
  } catch (e) {
    return res.send({
      result: 0,
      code: '9999',
      message: 'FAILED',
      reason: e.message,
    });
  }
});

// webApp.post('/api/truyenfullsuper/crawl', (req, res) => {
//   let { current } = req.body;
//   if (current == 'truyenfull.vn') {
//     // console.log(current);
//     const crawController = new TruyenfullController();
//     return crawController.crawToolStoryTruyenFull(req, res);
//   }
//   if (current == 'truyenfull.com') {
//     const crawController = new CrawController();
//     return crawController.crawToolStoryTruyenFull(req, res);
//   }
// });
