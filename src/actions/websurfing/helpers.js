/* eslint-disable no-undef */
const helpers = require('../../helpers/everything.helper');
const {getLogger} = require('../../helpers/logger.helper');
const LOGGER = getLogger("web surfing helper")
const { random } = require('../../helpers/everything.helper');

const googleHelper = {
  async gotoWebsite(page, name, url) {
    let _url = page.url();
    if (!_url.startsWith("https://www.google.com")){
      await helpers.goto(page, 'https://www.google.com',{ waitUntil: 'domcontentloaded' });
    }else {
      // await this.scroll(page);
      await page.evaluate(() => {
        window.scroll(0, 0);
      });

    }

    // find the website
    try {
      const input = await page.$('[name=q]');
      await input.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await helpers.typeSelector(page, '[name=q]', name, 0);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.keyboard.press('Enter'),
      ]);
      await helpers.sleep(2000);
      try {
        //click
        // await page._cursor.move(`//a[contains(@href,"${url}")]`);
        // await page.mouse.down({button:"left"});
        // await page.mouse.up({button:"left"});
        // await page._cursor.click(`//a[contains(@href,"${url}")]`);
        const linkIndex = await page.$$eval('.tjvcx.GvPZzd.cHaqb', (links) => {
          return links.findIndex(
            (link) => link.textContent.includes(url) === true
          );
        });
        const links = await page.$$eval('.tjvcx.GvPZzd.cHaqb');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          // links[linkIndex].click()
          helpers.clickSelectorElement(links[linkIndex])
        ]);

        await helpers.sleep(5000);
      }catch (e) {
        LOGGER.error(e.stack)
        await helpers.clickSelector(page,`//a[contains(@href,"${url.replace(/.+\/\/|www.|\..+/g, '')}")]`,0);
        await helpers.sleep(5000);

      }
    } catch(e) {
      LOGGER.info(e.stack)
      // go direct to the website
      await page.goto(url,{ waitUntil: 'domcontentloaded' });


    }
  },

  async scroll(page) {
    // await page.setViewport({ width: 1280, height: 800 });
    const start = Date.now();
    while (Date.now() - start < 10000) {
      await page.evaluate(() => {
        window.scrollBy(0, 600);
      });
      await page.waitForTimeout(1000);
      await page.evaluate(() => {
        window.scrollBy(0, -300);
      });
      await page.waitForTimeout(1000);
    }
    await page.waitForTimeout(1000);
  },

  async randomGoogleSearchActions(page) {
    try {
      const rand = helpers.random(1, 3);
      for (let i = 0; i < rand; i++) {
        await this.scroll(page);
        try {
          await helpers.clickSelector(
            page,
            // 'h3.LC20lb.MBeuO.DKV0Md',
            '.LC20lb',
            helpers.random(0, 5)
          );
        } catch (e) {
          LOGGER.error(`click  .LC20lb` + e)
          try {
            await helpers.clickSelector(
              page,
              'div.Z26q7c.UK95Uc.jGGQ5e > div > a',
              // 'h3.LC20lb',
              helpers.random(0, 5)
            );
          } catch (e) {
            LOGGER.error(`click div.Z26q7c.UK95Uc.jGGQ5e > div > a` + e)
            return
          }
        }

        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await helpers.sleep(random(1000, 3000));
        await this.scroll(page);
        await helpers.sleep(helpers.random(3000, 6000));
        try {
          await page.goBack({
            waitUntil: 'networkidle2',
            timeout: 10000
          });
          // await page.waitForNavigation({ waitUntil: 'domcontentloaded' ,timeout:10000});
        } catch (e) {
          LOGGER.error(e?.stack?e.stack:e)
          await helpers.goto(page, 'https://www.google.com/');
        }

        // await this.scroll(page);
        // await helpers.sleep(random(1000, 3000));
        // await page.evaluate(() => {
        //   window.scroll(0, 0);
        // });
        await page.mouse.wheel({ deltaY: -200 })
        await helpers.sleep(random(1000, 3000));
      }
    }catch (e) {
      LOGGER.error(e?.stack?e.stack:e)
    }

  },
};

module.exports = googleHelper;
