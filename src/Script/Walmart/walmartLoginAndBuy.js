const puppeteer = require('puppeteer');
const { openUrl, reload, newTab, closeActiveTab } = require(global.root_path+'/src/actions/Navigation/navigation');
const { findActiveTab } = require(global.root_path+'/src/actions/Helper/helper')
const { pressKey } = require(global.root_path+'/src/actions/Keyboard/keyboard');
const { readAndDeleteLine } = require(global.root_path+'/src/actions/Data/data');
const helper = require(global.root_path+'/src/actions/Helper/helper');
const config = require('./config');
const { del } = require('request');
const activateTabByDomain = require(global.root_path+'/src/actions/Navigation/activeTabByDomain');
const goBack = require(global.root_path+'/src/actions/Navigation/goBack');
const scrollByPixel = require(global.root_path+'/src/actions/Mouse/scrollByPixel');
const scrollRandom = require(global.root_path+'/src/actions/Mouse/scrollRandom');
async function walmartLoginAndBuy(browser,profile) {
    try {
        let process = true;
        let result = '';
        let page = await activateTabByDomain(browser, 'https://www.walmart.com/');
        if (page) page = await openUrl(page, 'https://www.walmart.com/');
        else page = await newTab(browser, 'https://www.walmart.com/');
        if (!page) {
            console.log('error tại vị trí open walmart');
            return false;
        }
        await resolveCaptcha(page)
        // let randomTextSearch = helper.getRandomPhrase(config.listKeyword);
        await scrollRandom(page, helper.randomInt(8, 10), helper.randomFloat(250, 400));
        process = await page.evaluate(() => {
            const btnLogin = document.querySelector('[data-automation-id="headerSignIn"');
            if (btnLogin) {
                btnSearch.click();
                return true
            }
            return false;
        });
        await resolveCaptcha(page)

        if(process){
            const clickLogin = await page.evaluate(() => {
                const btnLogin = document.querySelector('[data-testid="sign-in"');
                if (btnLogin) {
                    btnSearch.click();
                    return true
                }
                return false;
            });
        }
        await resolveCaptcha(page)
        if(!clickLogin){
            return false
        }

        process = await page.evaluate(() => {
            const input = document.querySelector('input[type="email"');
            if (input) {
                input.focus();
                return true;
            }
            return false;
        });
        process = await pressKey(page, profile.email);
        process = await page.evaluate(() => {
            try {
                const verify = document.evaluate("//div[text()='This account has been closed. Please refer to the email we sent for more details.']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if(verify){
                    return true;
                }
                return false;
            }
            catch (e) {
                return false;
            }
        });
        if(process){
            result = 'Account is disabled';
            return result;
        }
        if (!process) await page.keyboard.press("Enter");
        await resolveCaptcha(page)
        process = await page.evaluate(() => {
            const input = document.querySelector('form[id="verify-phone-otp-form"');
            if (input) {
                return true;
            }
            return false;
        });
        if(process){
            result = 'Require OTP';
            return result;
        }
        process = await page.evaluate(() => {
            const input = document.querySelector('form[id="verify-phone-otp-form"');
            if (input) {
                return true;
            }
            return false;
        });
        if(process){
            result = 'Require OTP';
            return result;
        }


        await delay()
        process = await page.evaluate(() => {
            const input = document.querySelector('input[type="password"');
            if (input) {
                input.focus();
                return true;
            }
            return false;
        });
        process = await pressKey(page, profile.password);
        process = await page.evaluate(() => {
            try {
                document.querySelector('button[type=submit]').click();
                return true;
            }
            catch (e) {
                return false;
            }
        });
        await resolveCaptcha(page)
        if (!process) await page.keyboard.press("Enter");
        //check password wrong
        process = await page.evaluate(() => {
            try {
                const verify = document.querySelector('[data-testid="alert"] [link-identifier="resetPasswordLink"]')
                if(verify){
                    return true
                }
                return false;
            }
            catch (e) {
                return false;
            }
        });
        if(process){
            result = 'Wrong password';
            return result;
        }

        process = await page.evaluate(() => {
            try {
                const verify = document.querySelector('[data-testid="verifyitsyou-title"]')
                if(verify){
                    let button = document.evaluate("//button[text()='Send Code']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if(button){
                        button.click();
                    }
                }
                return true;
            }
            catch (e) {
                return false;
            }
        });
        await resolveCaptcha(page)
        if(process){
            result = 'Login need to verify by email';
            return result;
        }
        await delay()
        await resolveCaptcha(page);
        process = await page.evaluate(() => {
            try {
                const verify = document.querySelector('[data-testid="logged-in-account-button-name"]')
                if(verify){
                    document.querySelector('[link-identifier="Account"]').click()
                    return true                    
                }
                return false;
            }
            catch (e) {
                return false;
            }
        });
        if(!process){
            //login failed
            result = 'Login failed'
            return result
        }
        //click lai lan nua de thoat popup
        await page.evaluate(() => {
            try {
                const verify = document.querySelector('[link-identifier="Account"]')
                if(verify){
                    if(!verify.getAttribute('aria-expanded')){
                        document.querySelector('[link-identifier="Account"]').click()
                    }
                }
                return false;
            }
            catch (e) {
                return false;
            }
        });
        
        process = await page.evaluate(() => {
            try {
                document.querySelector('[data-testid="account-flyout"]').querySelector('a[link-identifier="Account"').click()
                return true
            }
            catch (e) {
                return false;
            }
        });

        if(!process){

        }

        process = await page.evaluate(() => {
            try {
                document.querySelector('a[href="/orders"]').click()
                return true
            }
            catch (e) {
                return false;
            }
        });

        if(!process){
            page = await openUrl(page, 'https://www.walmart.com/orders');
        }
        await delay()
        let historyStr = ''
        //copy first order history
        process = await page.evaluate(() => {
            try {
                const history = document.querySelectorAll('[data-automation-id="purchase-history-slot"]')
                if(history && history.length > 0){
                    historyStr = history[0].querySelector('h2').querySelectorAll('span')[0].innerText+'|'+history[0].querySelector('h2').querySelectorAll('span')[1].innerText
                }else{
                    historyStr = '';
                }
                return true
            }
            catch (e) {
                return false;
            }
        });
        //get full name
        process = await page.evaluate(() => {
            try {
                document.querySelector('a[href="/account/profile"]').click()
                return true
            }
            catch (e) {
                return false;
            }
        });

        if(!process){
            page = await openUrl(page, 'https://www.walmart.com/account/profile');
        }

        let fullName = ''
        process = await page.evaluate(() => {
            try {
                fullName = document.querySelector('.w-100.di-m .flex.justify-between.pt1.pb2-m')
                .querySelector('span').innerText
            }
            catch (e) {
                return false;
            }
        });
        //get address
        process = await page.evaluate(() => {
            try {
                document.querySelector('a[href="/account/delivery-addresses"]').click()
                return true
            }
            catch (e) {
                return false;
            }
        });

        if(!process){
            page = await openUrl(page, 'https://www.walmart.com/account/delivery-addresses');
        }
        let address = ''
        process = await page.evaluate(() => {
            try {
                const elems = document.querySelectorAll('section .w-100.di-m .pl4-m.pr4-m .pv3.bb.b--near-white')
                if(elems.length > 0){
                    for(let i=0; i< elems.length;i++){
                        address += elems[i].querySelector('.w-100 span').innerText + elems[i].querySelector('.w-100 p').innerText
                        if(i < elems.length-1){
                            address += '|'
                        }
                    }
                }
            }
            catch (e) {
                console.log(e)
                return false;
            }
        });

        //get card
        process = await page.evaluate(() => {
            try {
                document.querySelector('a[href="/wallet"]').click()
                return true
            }
            catch (e) {
                return false;
            }
        });

        if(!process){
            page = await openUrl(page, 'https://www.walmart.com/wallet');
            await resolveCaptcha(page)
        }
        let cardStr = ''
        await delay()
        process = await page.evaluate(() => {
            try {
                const allCard = document.querySelectorAll('[data-testid="carousel-container"] li')
                if(allCard.length > 0){
                    for(let i=0; i< allCard.length;i++){
                        cardStr += allCard[i].querySelector('.f6.pr3.white').innerText
                        cardStr += ' '+allCard[i].querySelectorAll('.flex.justify-between.items-end.f6 .white')[1].innerText
                        if(i < allCard.length-1){
                            cardStr += '|'
                        }
                    }
                }
            }
            catch (e) {
                console.log(e)
                return false;
            }
        });

        page = await openUrl(page, 'https://www.walmart.com/wallet');

        //check cvv
        process = await page.evaluate(() => {
            try {
                document.querySelector('a[href="/"]').click()
                return true
            }
            catch (e) {
                return false;
            }
        });

        process = await page.evaluate(() => {
            try {
                document.querySelector('form input[type="search"]').focus()
                return true
            }
            catch (e) {
                return false;
            }
        });

        process = await pressKey(page, helper.getRandomPhrase(config.listKeyword));
        await page.keyboard.press("Enter");

        process = await page.evaluate(() => {
            try {
                document.querySelector('section div[data-item-id] a[link-identifier]').click()
                return true
            }
            catch (e) {
                return false;
            }
        });

        process = await page.evaluate(() => {
            try {
                document.querySelector('[data-testid="buy-now-wrapper"]').click()
                return true
            }
            catch (e) {
                return false;
            }
        });


        result = `${historyStr}|${fullName}|${address}|${cardStr}`
        return result
        // await closeActiveTab(page);
    }
    catch (e) {
        console.error('Lỗi tại walmartloginandbuy',e);
        return false;
    }
}

async function resolveCaptcha(page){
    if(page){
    }
}

async function delay(){
    return await helper.delay(helper.randomInt(1, 15))
}
module.exports = walmartLoginAndBuy;
