const webApp = global.webApp;
const DevProfileController = require('../src/controllers/DevProfileController');
const GmailController = require('../src/controllers/social/GmailController');
const FacebookController = require('../src/controllers/social/FacebookController');

// ===========================================================
webApp.get('/dev/profile/gmail/test_api', async (req, res) => {
  // const controller = new GmailController();
  const controller = new FacebookController();
  return controller.testBrowser(req, res);
});

webApp.get('/dev/profile/list', (req, res) => {
  const devProfileController = new DevProfileController();
  return devProfileController.list(req, res);
});

webApp.post('/dev/profile/create', (req, res) => {
    let { group_name, email } = req.body;
    if (!group_name) {
      return res.send({
        data: req.body,
        result: 0,
        message: 'Group name is not value',
      });
    }
    if (!email) {
      return res.send({
        result: 0,
        message: 'Email is not value',
      });
    }
    const devProfileController = new DevProfileController();
    return devProfileController.storeDevPorofile(req, res);
});
webApp.put('/dev/profile/update/:id', (req, res) => {
  const devProfileController = new DevProfileController();
  return devProfileController.updateProfile(req, res);
});

webApp.delete('/dev/profile/destroy/:id', (req, res) => {
  const devProfileController = new DevProfileController();
  return devProfileController.destroyProfile(req, res);
});
webApp.post('/dev/profile/open_browser/:id', (req, res) => {
  const devProfileController = new DevProfileController();
  return devProfileController.openBrowser(req, res);
});

webApp.post('/dev/profile/gmail/login', async (req, res) => {
  const gmailController = new GmailController();
  return gmailController.loginProfiles(req, res);
});
webApp.post('/dev/profile/facebook/login', async (req, res) => {
  const facebookController = new FacebookController();
  return facebookController.loginFacebook(req, res);
});
webApp.post('/dev/profile/facebook/handle_posts', async (req, res) => {
  const facebookController = new FacebookController();
  return facebookController.handlePostFacebook(req, res);
});
webApp.post('/dev/profile/facebook/add_friends', async (req, res) => {
  const facebookController = new FacebookController();
  return facebookController.addFriends(req, res);
});