const {retryAsync} = require('ts-retry')
const helpers = require('../../helpers/everything.helper');
const {getLogger} = require('../../helpers/logger.helper');
const LOGGER = getLogger("Google Login")
const { sleep } = require('../../helpers/sleep.helper');

async function loginGmail(browser, config, gmailInfo) {
  const { API, worker, pageContainer } = config;
  const googlService = pageContainer.createGoogleContext();
  const page = pageContainer.page;

  let loggedIn =false
  await page.goto(`https://myaccount.google.com/email`);
  const url = page.url();
  if (url.startsWith("https://myaccount.google.com")){
    LOGGER.info(`Account ${gmailInfo.email} logged in!`)
    loggedIn = true
  }

  await retryAsync(
    async ()=>{
      if (worker.job.login && !loggedIn) {
        // await googlService.setup();
        // await API.login(page, worker.job.account, worker.job.account.cookies);
        if (gmailInfo.cookies || !gmailInfo.recover_email)
          await googlService.login(gmailInfo, gmailInfo.cookies);
        else {

          await page.waitForSelector(`#identifierId`);

          // email

          await page.click(`#identifierId`);
          await helpers.sleep(1000);
          await page.type(`#identifierId`, gmailInfo.email, { delay: 75 });

          // continue
          await page.waitForSelector(`#identifierNext`, { visible: true });
          await page.click(`#identifierNext`);

          await Promise.race([
            page.waitForXPath(
              `//*[@id="yDmH0d"]/c-wiz/div[2]/div[2]/div/div[1]/div/form/span/section/div/div/div/div[2]`
            ),
            page.waitForSelector(`#password`),
          ]);

          // password

          let selector = await page.waitForSelector(`#password`, { visible: true });
          await selector.click();
          await helpers.sleep(2000);
          await page.type(`#password`, gmailInfo.password, { delay: 75 });
          // continue

          try {
            // try with mouse click
            const passwordNextElement = await page.waitForSelector(`#passwordNext`, { visible: true ,timeout:15000 });
            const point = await passwordNextElement.clickablePoint();
            await page.mouse.move(point.x, point.y,{steps:30});
            await helpers.sleep(1000);
            await page.mouse.click(point.x, point.y);
          }catch (e) {
            LOGGER.error(`try with mouse err ${e}`)
            LOGGER.info(`try with page click}`)
            await page.click(`#passwordNext`);
          }
          //
          await helpers.sleep(5000);

          let url = page.url();
          if (url.startsWith("https://myaccount.google.com")){
            LOGGER.info(`Account ${gmailInfo.email} logged in!`)
            loggedIn = true
            return
          }

          // case need recover mail
          if(!loggedIn) {
            try {

              try {
                await page.waitForSelector(`ul.OVnw0d li`, { visible: true , timeout: 15000 });
                // await helpers.waitForSelector(page, 'ul.OVnw0d li', { visible: true });

                // click the recover email option
                await helpers.sleep(1000);
                const lis = await page.$$('ul.OVnw0d li');
                await lis[2].click();
              }catch (e) {
                LOGGER.error(e?.stack?e.stack:e)
                await page.waitForSelector(`ul > li:nth-child`, { visible: true , timeout: 15000 });
                // await helpers.waitForSelector(page, 'ul.OVnw0d li', { visible: true });

                // click the recover email option
                await helpers.sleep(1000);
                const lis = await page.$$('ul > li:nth-child');
                await lis[2].click();
              }


              // type the recover email
              await helpers.sleep(2000);
              await page.waitForSelector(`#knowledge-preregistered-email-response`, {
                visible: true,
              });
              await page.type(
                `#knowledge-preregistered-email-response`,
                gmailInfo.recover_email,
                { delay: 75 }
              );

              await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                page.keyboard.press('Enter'),
              ]);
              loggedIn = true
            } catch (e) {
              LOGGER.error(` Try case need recover mail err ${e}`)
            }
          }
          url = page.url();
          if (url.startsWith("https://myaccount.google.com")){
            LOGGER.info(`Account ${gmailInfo.email} logged in!`)
            loggedIn = true
            return
          }
          if(!loggedIn){
            // case new account
            try {
              await page.waitForSelector('input[type="submit"]',{timeout:15000});
              await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2',timeout:15000 }),
                helpers.clickSelector(page,'input[type="submit"]',0)
              ])
              // await page.click('input[type="submit"]')
              // await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
              // await page.waitFor(3000);
              loggedIn = true
            }catch (e) {
              LOGGER.error(` Try case new account  err ${e}`)
              throw e
            }
          }
          await sleep(3000)
        }
      }
    },{
      delay: 2000,
      maxTry: 5,
    }
  )

  await page.goto(`https://myaccount.google.com/email`);
  const _url = page.url();
  if (_url.startsWith("https://myaccount.google.com")){
    LOGGER.info(`Account ${gmailInfo.email} logged in!`)
    loggedIn = true
  }else {
    loggedIn = false
  }
  worker.communicate('googleLoggedIn', loggedIn)
  this.currentAccount = {
    ...gmailInfo,
    cookies: await pageContainer.getCookies(),
    formatted_cookies: await pageContainer.getFormattedCookies(),
    loggedIn: loggedIn,
  };
  return pageContainer;
}

module.exports = {
  loginGmail,
};
