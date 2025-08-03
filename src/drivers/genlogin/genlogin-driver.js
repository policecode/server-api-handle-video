const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { spawn } = require("child_process");
const {
  chromeExecPath,
  firefoxExecPath,
  firefoxFingerprintPath,
  chromeFingerprintPath,
  getRandomPort,
  sleep,
} = require("./helpers");
const puppeteer = require('puppeteer')



const GENLOGIN_API_BASE_URL = 'http://localhost:55555';

const axiosIns = axios.create({
  baseURL: GENLOGIN_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const defaultOptions = {
  remoteDebuggingPort: 0,
  profile_id: null,
  isSandbox: true,
  tmpdir: null
};

const BROWSER_TYPES = {
  CHROME: 'Chrome',
  FIREFOX: 'Firefox',
  OPERA: 'Opera'
};

class GenloginDriver  {

  constructor () {
    this.profiles = {};
    this.browsers= {};
  }

  async connect(opt = {}) {
    const response = await axiosIns.get(`profiles`);
    const profiles = response.data.data.lst_profile;
    for (const element of profiles) {
      const profile = element
      const id = profile.id.toString();
      this.profiles[id] = profile;
      this.browsers[id] = null;
    }
  }

  async getBrowser(browserId, opts){
    if (!this.profiles[browserId]) throw Error('Browser not found!');
    if (!this.browsers[browserId]) {
      opts = { ...defaultOptions, ...opts };
      opts.profile_id = parseInt(browserId);
      const genProfile = new GenloginProfile(opts);
      this.browsers[browserId] = await genProfile.getBrowser();
      this.profiles[browserId].genProfile = genProfile;
    }
    return this.browsers[browserId];
  }

  async createBrowser(browserId, opts){
    this._opts = opts
    return undefined;
  }

  async removeBrowser(browserId) {
    const browser = await this.getBrowser(browserId);
    if (browser) {
      await browser.close();
      await this.profiles?.browserId?.genProfile?.stopProfile();
    }

    return undefined;
  }

  async stop() {
    const keys = Object.keys(this.browsers);
    for (const key of keys) {
      await this.removeBrowser(key);
    }
  }

}

class GenloginProfile {


  constructor(options = defaultOptions) {
    this.tmpdir = os.tmpdir();
    // this.tmpdir = osTmpdir();
    this.chromeExecPath = chromeExecPath;
    this.firefoxExecPath = firefoxExecPath;

    this.profile_id = options.profile_id;
    this.remoteDebuggingPort = options.remoteDebuggingPort || 0;
    this.isSandbox = options.isSandbox;
    this.pid = null;

    if (options.tmpdir) {
      this.tmpdir = options.tmpdir;
      fs.ensureDirSync(this.tmpdir, { recursive: true });
    }
  }

  async getBrowser() {
    if (!this._browser) {
      const { wsEndpoint } = await this.startProfile();
      const browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint.toString(),
        ignoreHTTPSErrors: true,
        defaultViewport: null
      });
      this._browser = browser;
    }
    return this._browser;
  }

  async getProfilePath() {
    const profilePath = path.resolve(
      this.tmpdir,
      `genlogin_profile_${this.profile_id}`
    );
    await fs.ensureDir(profilePath);
    return profilePath;
  }

  async clearProfileFiles() {
    const profilePath = await this.getProfilePath();
    await fs.rm(profilePath, { recursive: true, force: true });
  }

  async getRemoteDebuggingPort() {
    return this.remoteDebuggingPort || (await getRandomPort());
  }

  async stopProfile() {

    if (!this.profile_id) throw Error('Profile id not found');
    await axiosIns.get(`profiles/${this.profile_id}/stop`);

    await sleep(2000);
    await this.clearProfileFiles();
  }


  async startProfile() {
    if (!this.profile_id) throw Error('Profile id not found');
    try {
      let profile;
      const responseProfileData = await axiosIns.get(
        `profiles/${this.profile_id}`
      );
      const { success: profileSuccess, data: profileData } =
        responseProfileData.data;
      if (profileSuccess) {
        profile = profileData.profile_data;
      } else {
        console.log('API error');
        return;
      }

      const response = await axiosIns.get(`profiles/${this.profile_id}/start-automation`);
      const { success, data } = response.data;
      if (success) {
        const remoteDebuggingPort = await this.getRemoteDebuggingPort();
        const profileDir = await this.getProfilePath();
        const { expires_at, checksum } = data;
        const { browser } = profile;
        const browserExecPath =
          browser === BROWSER_TYPES.CHROME ? chromeExecPath : firefoxExecPath;
        const fingerprintExecPath =
          browser === BROWSER_TYPES.CHROME
            ? chromeFingerprintPath
            : firefoxFingerprintPath;
        const wsEndpoint = data.wsEndpoint;

        const processStart = () => {
          return new Promise((resolve, reject) => {
            const profileProcess = spawn(
              fingerprintExecPath,
              [
                browserExecPath,
                profile,
                expires_at,
                checksum,
                profileDir,
                remoteDebuggingPort.toString()
              ],
              {
                detached: true
              }
            );
            profileProcess.unref();
            this.pid = profileProcess.pid;

            // profileProcess.stdout.on("data", (data) => {
            //   if (data.includes("wsEndpoint"))
            //     wsEndpoint = data.toString().split("wsEndpoint ").pop().trim();
            //   else console.log("Get WebSocket Endpoint Error");
            //
            //   resolve({
            //     success: true,
            //     ...(wsEndpoint ? { wsEndpoint } : {}),
            //   });
            // });

            resolve({
              success: true,
              ...(wsEndpoint ? { wsEndpoint } : {})
            });
          });
        };

        const result = await processStart();
        return result;
      } else {
        console.log('Error');
      }
    } catch (error) {
      console.log(error);
    }
  }

}

module.exports ={
  GenloginDriver
}
