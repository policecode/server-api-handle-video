/*
    script viewTiktok_1
    mô tả: lướt lên xuống xem video tại trang chủ tiktok, random follow, like
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
async function viewTikTok_1(browser, filePath) {
    try {
        let process = true;
        let page;
        page = await activateTabByDomain(browser, 'https://www.tiktok.com/');
        if (page) page = await openUrl(page, 'https://www.tiktok.com/');
        else page = await newTab(browser, 'https://www.tiktok.com/');
        if (!page) {
            console.log('error tại vị trí open tiktok');
            return false;
        }
        await helper.delay(30);
        // let page = await findActiveTab(page);
        // lướt tìm video, xem 10 video
        let indexLastVideo = -1;
        const countVideo = 10;
        while (indexLastVideo < countVideo) {
            indexLastVideo = await page.evaluate(async (indexLastVideo) => {
                function delay(time) {
                    return new Promise(function (resolve) {
                        setTimeout(resolve, time * 1000)
                    });
                }
                function randomFloat(x, y) {
                    return x + (y - x) * Math.random();
                }
                const divs = document.querySelectorAll('div[data-e2e="recommend-list-item-container"]');
                for (let i = indexLastVideo + 1; i < divs.length; i++) {
                    try {
                        divs[i].scrollIntoView();
                        await delay(randomFloat(10, 50));
                        let btns = divs[i].querySelectorAll('button');
                        //follow 50%
                        if (randomFloat(0, 1) < 0.5) btns[0].click();
                        //like 50%
                        if (randomFloat(0, 1) < 0.5) btns[2].click()
                    }
                    catch (e) {

                    }
                    indexLastVideo++;
                    // countVideo = 10
                    if (indexLastVideo >= 10) break;
                }
                console.log('indexLastVideo', indexLastVideo);
                return indexLastVideo;
            }, indexLastVideo);
        }
        if (helper.randomFloat(0, 1) < 0.5) {
            await closeActiveTab(page);
        }
        return true;
    }
    catch (e) {
        console.error(e);
        console.log('Lỗi tại viewTikTok_1');
        return false;
    }
}
module.exports = viewTikTok_1;
