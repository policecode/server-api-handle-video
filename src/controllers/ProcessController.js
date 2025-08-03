const Controller = require('./Controller');

class ProcessController extends Controller{
    constructor(){
        super();
        this.model = 'ProcessModel';
        this.primaryKey = ['id'];
    }
	
	async startScan(req,res){
        try {
            const browser = BrowserDriver.getDriver()
			let page = await newTab(browser, 'https://www.walmart.com/');
			process = await page.evaluate(() => {
				const btnLogin = document.querySelector('[data-automation-id="headerSignIn"');
				if (btnLogin) {
					btnSearch.click();
					return true
				}
				return false;
			});
			
        }
        catch (e) {
            console.error(e);
            return res.status(400).send({
                code: "9999",
                message: "FAILED",
                reason: e.message
            });
        }
    }
}

module.exports = ProcessController;