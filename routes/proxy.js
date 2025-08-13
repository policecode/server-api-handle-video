const webApp = global.webApp;
const ProxyController = require('../src/controllers/ProxyController');

// ===========================================================
webApp.get('/proxy/test', async (req, res) => {
 const proxyController = new ProxyController();
  return proxyController.testProxy(req, res);
});

webApp.get('/proxy/list', (req, res) => {
  const proxyController = new ProxyController();
  return proxyController.list(req, res);
});

webApp.post('/proxy/create', (req, res) => {
    const proxyController = new ProxyController();
    return proxyController.storeProxy(req, res);
});
webApp.put('/proxy/update/:id', (req, res) => {
  const proxyController = new ProxyController();
  return proxyController.updateProxy(req, res);
});

webApp.delete('/proxy/destroy/:id', (req, res) => {
  const proxyController = new ProxyController();
  return proxyController.destroyProxy(req, res);
});
