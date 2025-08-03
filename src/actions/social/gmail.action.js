const Urls = require('../../helpers/urls.helper');
const BrowserDriver = require('../../drivers/BrowserDriver');

class GmailActions {

    static async loginGmail(page, user, pass) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        try {
            await driver.gotoUrl(page, 'https://www.google.com.vn/');
            const isLogin = await page.$('.gb_b.gb_Rd.gb_3f.gb_x.gb_Ud');
            if (!isLogin) {
                await driver.gotoUrl(page, Urls.GMAIL_LOGIN);
                // visit page login google
                await page.waitForSelector('.button.button--medium.button--mobile-before-hero-only', { visible: true, timeout: 10000 });
                await page.click('.button.button--medium.button--mobile-before-hero-only');
                // Login Account
                await page.waitForSelector('form input[name="identifier"]', { visible: true, timeout: 10000 });
                await page.type('form input[name="identifier"]', user);
                await page.click('button.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.LQeN7');
                // Login Password
                await page.waitForSelector('form input[name="Passwd"]', { visible: true, timeout: 10000 });
                await page.type('form input[name="Passwd"]', pass);
                await page.waitForTimeout(1000);
                await page.click('button.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.LQeN7');
            }
            // Load after login
            await page.waitForSelector('.gb_b.gb_Rd.gb_3f.gb_x.gb_Ud', { visible: true });

            return true;
        } catch (error) {
            console.log('Lỗi Login tài khoản: ' + user + ' ,error: ' + error);
            return false;
        }
    }

}

module.exports = GmailActions;
