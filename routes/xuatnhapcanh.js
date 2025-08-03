const webApp = global.webApp
const XuatnhapcanhController = require('../src/controllers/XuatnhapcanhController');
webApp.post("/api/xuatnhapcanh/temporary_residence", (req, res) => {
    const {action}= req.body;
    const xuatnhapcanhController = new XuatnhapcanhController();
    if (action == 'long_term') {
        return xuatnhapcanhController.getListFolderStory(req, res);
    } else if(action == 'staying') {
        return xuatnhapcanhController.getTouristsTemporary(req, res);
    }
});

webApp.post("/api/xuatnhapcanh/test", async (req, res) => {
    const xuatnhapcanhController = new XuatnhapcanhController();
    let data = await xuatnhapcanhController.uploadApiTourist(req.body);
    return res.send({
        result: 1,
        message: "success",
        data: data
    });
});
