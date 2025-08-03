let sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function text(el) {
  return await el.evaluate((e) => e.innerText.trim());
}

module.exports = class {
  #page = {};
  #parent = {};
  #extra = {};
  currentAccount = {};
  #browser = {};

  constructor(page, parent, extra, browser) {
    this.#page = page;
    this.#parent = parent;
    this.#extra = extra;
    this.#browser = browser;
  }

  async login(cookies) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.logout();
        if (
          cookies !== '' &&
          (typeof cookies == 'string' || typeof cookies == 'object')
        ) {
          await this.#page.goto(`https://www.facebook.com`);
          await this.#parent.setFacebookCookies(cookies);
          await sleep(3000);

          this.currentAccount = {
            cookies: await this.#parent.getCookies().catch(reject),
            formatted_cookies: await this.#parent
              .getFormattedCookies()
              .catch(reject),
            loggedIn: true,
          };
          resolve(this.currentAccount);
          return;
        }
      } catch (err) {
        reject(new Error(err));
      }
    });
  }

  async logout() {
    await this.#page.goto(`https://facebook.com`);
    await this.#parent.clearCookies();

    // await this.#page.goto(`https://www.youtube.com/`);
    // await this.#parent.clearCookies()

    await this.#page.reload();

    // await this.#page.goto(`https://account.google.com/email`);
    // await this.#parent.clearCookies();
    await sleep(5000);
    this.currentAccount = {
      cookies: [],
      formatted_cookies: '',
      loggedIn: false,
    };

    return this.currentAccount;
  }
};
