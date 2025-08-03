const puppeteer = require('puppeteer');
const { openUrl, reload, newTab } = require('../../../Action/Navigation/navigation');
const { findActiveTab } = require('../../../Action/Helper/helper')
const { pressKey } = require('../../../Action/Keyboard/keyboard');
const helper = require('../../../Action/Helper/helper');
const config = require('./config');
const { activateTabByDomain } = require('../../../Action/Navigation/navigation');
async function loginMail_1(browser, filePath) {
    try {
        let process = true;
        let page;
        page = await activateTabByDomain(browser, 'https://www.google.com/');
        if (page) page = await openUrl(page, 'https://www.google.com/');
        else page = await newTab(browser, 'https://www.google.com/');
        if (!page) {
            console.log('error tại vị trí open google');
            return false;
        }
        await helper.delay(20);
        // chuyển ngôn ngữ sang tiếng anh
        await page.evaluate(async () => {
            try {
                document.querySelector('a[href*="hl=en&source=homepage"]').click();
                return true;
            }
            catch (e) {
                return false;
            }
        });
        await helper.delay(20);
        if (!page) {
            console.log('error tại vị trí tìm active page');
            return false;
        }
        let isLogin = await page.evaluate(async () => {
            const btnLogin = document.querySelector('a[href^="https://accounts.google.com/ServiceLogin"]');
            if (btnLogin) {
                btnLogin.click();
                return false;
            }
            return true;
        });
        await helper.delay(30);
        console.log('isLogin: ', isLogin);

        let tmp = '';
        tmp = await helper.readFileAsync(filePath + "\\mail.txt");
        tmp = tmp.split("|");
        let username = tmp[0];
        let password = tmp[1];
        let mailReco = tmp[2];
        if (!isLogin) {
            process = await page.focus('input#identifierId');
            process = await pressKey(page, username);
            await page.keyboard.press("Enter");
            await helper.delay(20);
            process = await pressKey(page, password);
            await page.keyboard.press("Enter");
            await helper.delay(30);
            //check nhập mail recovery
            process = await page.evaluate(() => {
                const btnMail = document.querySelectorAll('div.vxx8jf')[2];
                if (btnMail) {
                    btnMail.click();
                    return true;
                }
                return false;
            });
            if (process) {
                await helper.delay(10);
                // focus input
                process = await page.evaluate(() => {
                    try {
                        document.querySelector('input#knowledge-preregistered-email-response').focus();
                        return true;
                    }
                    catch (e) {
                        return false;
                    }
                });
                if (process) {
                    process = await pressKey(page, mailReco);
                    await page.keyboard.press("Enter");
                    await helper.delay(30);
                }
                // check xem co thong bao confirm khong
            }
            process = await page.evaluate(() => {
                const btnConfirm = document.querySelector('#confirm');
                if (btnConfirm) {
                    btnConfirm.click();
                    return true;
                }
                return false;
            });
            await helper.delay(30);
            page = await activateTabByDomain(browser, 'https://www.google.com/');
            if (page) page = await openUrl(page, 'https://www.google.com/');
            else page = await newTab(browser, 'https://www.google.com/');
            await helper.delay(20);
            isLogin = await page.evaluate(async () => {
                const btnLogin = document.querySelector('a[href^="https://accounts.google.com/ServiceLogin"]');
                if (btnLogin) {
                    return false;
                }
                return true;
            });
        }
        console.log("isLogin", isLogin);
        // kiểm tra xem file log đã tồn tại hay chưa, nếu chưa tạo file log 
        helper.createLogFile(filePath + "\\mail-log", 'login-mail.txt');
        helper.overwriteFile(filePath + "\\mail-log\\login-mail.txt", JSON.stringify(isLogin));
        return true;
    }
    catch (e) {
        console.error(e);
        console.log('Lỗi tại loginMail_1');
        return false;
    }
}
module.exports = loginMail_1;
