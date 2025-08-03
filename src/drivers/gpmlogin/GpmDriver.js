const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { spawn,exec } = require("child_process");
const puppeteer = require('puppeteer')

const { API_GPM_URL, DRIVERS } = require(global.root_path+'/const');

const axiosIns = axios.create({
  baseURL: API_GPM_URL,
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

class GpmDriver  {

  constructor () {
    this.profiles = {};
    this.browsers= {};
  }

  async connect(opt = {}) {
    const response = await axiosIns.get(`profiles`);
    const profiles = response.data;
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
      const genProfile = new GpmLoginProfile(opts);
      this.browsers[browserId] = await genProfile.getBrowser();
      this.profiles[browserId].genProfile = genProfile;
    }
    return this.browsers[browserId];
  }

  async createProfile(profile){
    const apiRes = (await axios.get(API_GPM_URL + `/create?name=${profile.email}&gorup=${profile.group_name}&proxy=${profile.proxy}`)).data;
    if(apiRes && apiRes.profile_id){
      profile.driver_id = apiRes.profile_id;
      profile.driver = DRIVERS.GPM_LOGIN;
      this.profiles[profile.email] = profile;
      profile.save();
      return profile
    }else{
      return false
    }
  }

  async createBrowser(profile){
    if(!profile.driver_id){
        this.createProfile(profile)
    }
    if(this.profiles[profile.email].driver_id){
      return this.startProfile(profile)
      // if(res.data && res.data.selenium_remote_debug_address){

      //   this.browsers[profile.driver_id] = new GpmLoginProfile(profile.)
      // }
    }
    return false
  }

  async startProfile(profile){
    const res = (await axios.get(API_GPM_URL + `/start?profile_id=${this.profiles[profile.driver_id].driver_id}`)).data;
    if(!res.selenium_remote_debug_address){
      this.createProfile(profile);
      const res = (await axios.get(API_GPM_URL + `/start?profile_id=${this.profiles[profile.driver_id].driver_id}`)).data;
    }
    return res
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

  async clearWhenLimit(){
    const res = (await axios.get(API_GPM_URL + `/profiles`)).data;
    if(res.length >= global.raw.limit){
      fs.remove(global.driver_gpm_profile_path, err =>{
        if (err) return console.error('Clear profile GPM Error',err)
        console.log('Clear profile GPM success!')
      })
    }
  }

}

class GpmLoginProfile {


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
      `GpmLogin_profile_${this.profile_id}`
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

module.exports =  GpmDriver
