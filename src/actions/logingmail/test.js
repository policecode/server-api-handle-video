const puppeteer = require('puppeteer-core');
const helpers = require('../../helpers/everything.helper');
const gmailInfo = {
  email: 'sayannmichay@gmail.com',
  password: 'Test3FIEwKKGGAy3f',
  recover_email: 'dt01codwh0u@nguyenmail.top',
};

async function automate(page) {
  await page.goto(`https://myaccount.google.com/email`);
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

  await page.waitForSelector(`#passwordNext`, { visible: true });
  await page.click(`#passwordNext`);

  await helpers.sleep(1000);
  const els = await page.$$('.lCoei.YZVTmd.SmR8');
  await els[2].click();

  console.log('Success');
}

async function startBrowser() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      executablePath:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    });

    const page = await browser.newPage();

    await automate(page);
  } catch (err) {
    console.log(err);
  }
}

startBrowser();
