/*
    script googleSearch_1
    mô tả: nhập từ khóa bất kỳ trong danh sách listKeyword trong file config và xem bài viết bất kỳ
*/
const puppeteer = require('puppeteer');
const { openUrl, reload, newTab, closeActiveTab } = require('../../../Action/Navigation/navigation');
const { findActiveTab } = require('../../../Action/Helper/helper')
const { pressKey } = require('../../../Action/Keyboard/keyboard');
const { readAndDeleteLine } = require('../../../Action/Data/data');
const helper = require('../../../Action/Helper/helper');
const activateTabByDomain = require('../../../Action/Navigation/activeTabByDomain');
const goBack = require('../../../Action/Navigation/goBack');
const scrollByPixel = require('../../../Action/Mouse/scrollByPixel');
const scrollRandom = require('../../../Action/Mouse/scrollRandom');
async function googleSearch_1(browser, filePath, config) {
    try {
        let { listKeyword, listLinkWeb, onlyListWeb } = config;
        if (!listKeyword) listKeyword = "";
        if (!listLinkWeb) listLinkWeb = "";
        if (!onlyListWeb) onlyListWeb = false;
        console.log('listKeyword tại googleSearch_1: ', listKeyword);
        let process = true;
        let page;
        page = await activateTabByDomain(browser, 'https://www.google.com/');
        if (page) page = await openUrl(page, 'https://www.google.com/');
        else page = await newTab(browser, 'https://www.google.com/');
        if (!page) {
            console.log('error tại vị trí open google');
            return false;
        }
        await helper.delay(10);
        // let page = await findActiveTab(page);
        process = await page.evaluate(() => {
            const input = document.querySelector('input[name="q"], textarea[name="q"]');
            if (input) {
                input.focus();
                return true;
            }
            return false;
        });
        process = await pressKey(page, helper.getRandomPhrase(listKeyword));
        process = await page.evaluate(() => {
            try {
                document.querySelector('input[type=submit]').click();
                return true;
            }
            catch (e) {
                return false;
            }
        });
        if (!process) await page.keyboard.press("Enter");
        // tìm trang web không bị block
        const listWeb = listLinkWeb.split('|');
        await helper.delay(30);
        console.log('onlyListWeb', onlyListWeb)
        if (onlyListWeb) {
            await scrollRandom(page, helper.randomInt(10, 20), helper.randomFloat(250, 400));
            let timThayWeb = await page.evaluate((listWeb) => {
                try {
                    let webVaoDuoc = [];
                    for (let linkTarget of listWeb) {
                        const links = document.querySelectorAll(`#search a[href*="${linkTarget}"]`);
                        webVaoDuoc = webVaoDuoc.concat(Array.from(links));
                    }
                    console.log('listWeb', listWeb);
                    console.log('webVaoDuoc', webVaoDuoc);
                    const iLink = Math.floor(Math.random() * webVaoDuoc.length);
                    webVaoDuoc[iLink].click();
                    return true;
                }
                catch (e) {
                    return false;
                }
            }, listWeb)
            if (timThayWeb) {
                await helper.delay(30);
                await scrollRandom(page, helper.randomInt(10, 20), helper.randomFloat(250, 400));
            }
        }
        else {
            let timThayWeb = await page.evaluate(() => {
                try {
                    const links = document.querySelectorAll(`#search a[href]`);
                    const iLink = Math.floor(Math.random() * links.length);
                    links[iLink].click();
                    return true;
                }
                catch (e) {
                    return false;
                }
            },)
            if (timThayWeb) {
                await helper.delay(30);
                await scrollRandom(page, helper.randomInt(5, 10), helper.randomFloat(250, 400));
            }
        }
        if (helper.randomFloat(0, 1) < 0.5) {
            await closeActiveTab(page);
        }
        return true;
    }
    catch (e) {
        console.error(e);
        console.log('Lỗi tại googleSearch_1');
        return false;
    }
}
module.exports = googleSearch_1;
