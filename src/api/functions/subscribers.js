const { default: to } = require('await-to-js');
const { sleep } = require('../../helpers/sleep.helper');
const { getLogger } = require('../../helpers/logger.helper');
const {
  clickSelector,
  clickSelectorElement, waitForSelector
} = require('../../helpers/everything.helper');
const { retryAsync } = require('ts-retry');
const LOGGER = getLogger('Subscribe helper');


let ACCEPTED_COOKIES = [
  'DEVICE_INFO',
  'VISITOR_INFO1_LIVE',
  'GPS'
];

module.exports = (pageContainer, options) => {
  return new Promise(async (resolve, reject) => {
    try {
      let videoInfo = pageContainer.videoInfo;
      let scrollAmount = options.scroll || 10;

      let page = pageContainer.page;
      try {
        try {
          await Promise.all([
            page.waitForNavigation({
              waitUntil: 'networkidle2',
              timeout: 20000
            }),
            page._cursor.click(`//a[contains(@href,"/feed/subscriptions")]`)
          ]);
          // await page._cursor.click(`//a[contains(@href,"/feed/subscriptions")]`);
          // await page.waitForNavigation({waitUntil: 'networkidle2',timeout:15000});
        } catch (e) {

          await clickSelector(page, `#logo-icon`);
          await page.reload();
          await sleep(3000);
          await page._cursor.click(`//a[contains(@href,"/feed/subscriptions")]`);
        }

        // await page._cursor.click(`//a[contains(@href,"/feed/subscriptions")]`);
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      } catch (e) {
        LOGGER.error(e?.stack ? e.stack : e);
        await page.goto(`https://www.youtube.com/feed/subscriptions`, { waitUntil: 'networkidle2' }).catch(reject);
      }

      await page.waitForSelector(`#contents`).catch(reject);
      await sleep(2000);
      let currentCookies = await page.cookies().catch(reject);
      let isLoggedIn = false;

      if (!currentCookies) return;
      for (let cookie of currentCookies) {
        if (ACCEPTED_COOKIES.includes(cookie.name)) {
          isLoggedIn = true;
          break;
        }
      }

      if (!isLoggedIn) {
        let rejectCookies = await Promise.race([
          page.waitForSelector('#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.eom-buttons.style-scope.ytd-consent-bump-v2-lightbox > div:nth-child(1) > ytd-button-renderer:last-child > yt-button-shape > button'),
          page.waitForXPath('/html/body/c-wiz/div/div/div/div[2]/div[1]/div[3]/div[1]/form[1]/div/div/button/div[1]')
        ]).catch(reject);
        if (!rejectCookies) return;

        await Promise.all([
          page.waitForNavigation(),
          rejectCookies.click()
        ]).catch(reject);
      }

      if (options.forceFind) {
        await page.evaluate((videoInfo) => {
          let urlFormat = videoInfo.isShort
            ? 'shorts/'
            : 'watch?v=';

          let finalURL = 'https://www.youtube.com/' + urlFormat + videoInfo.id;

          let urlDocuments = document.querySelectorAll('a');
          let chosen;

          for (let urlDocument of urlDocuments) {
            let url = urlDocument.href;
            if (!(url.includes('?watch?v=') || url.includes('/shorts'))) {
              urlDocument.href = finalURL;
              chosen = urlDocument;

              break;
            }
          }

          chosen.click();
        }, videoInfo).catch(reject);

        return;
      }


      let videoFound = (await page.$x(`//a[contains(@href,"${videoInfo.id}")]`).catch(reject))[0];

      if (videoFound) {
        let t = 1;
        try {
          // await clickSelector(page,`//a[contains(@href,"${videoInfo.id}")]`,0)
          await retryAsync(async () => {
              // if (t != 1) {
              //   await page.reload({ waitUntil: 'networkidle2' });
              // }
              // t++;
              await page.reload({ waitUntil: 'networkidle2' });
              await page._cursor.click(`//a[contains(@href,"${videoInfo.id}")]`);
            }, {
              delay: 3000,
              maxTry: 5
            }
          );

        } catch (e) {
          // await Promise.all([
          //    page.waitForNavigation({ waitUntil: 'domcontentloaded' ,timeout:15000}),
          //    clickSelectorElement(page, videoFound)
          // ]);
          await clickSelectorElement(page, videoFound).catch(reject);
        }

        resolve(true);
      } else {
        let [err, wasFound] = await to(page.evaluate((data) => {
          let { scrollAmount, id } = data;
          return new Promise((resolve, reject) => {
            function getElementByXpath(path) {
              return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            }

            let start = Date.now() / 1000;
            let interval = setInterval(() => {
              let element = getElementByXpath(`//a[contains(@href,"${id}")]`);
              if (element) {
                clearInterval(interval);
                return resolve(element);
              }

              if ((Date.now() / 1000) > start + scrollAmount) {
                clearInterval(interval);
                return resolve(false);
              }

              window.scrollBy(0, 800);
            }, 1000);
          });
        }, { id: videoInfo.id, scrollAmount }));

        if (err) {
          return reject(err);
        }

        if (wasFound) {
          await wasFound.click().catch(reject);
        }

        resolve(wasFound);
      }
    } catch (err) {
      reject(new Error(err));
    }
  });
};
