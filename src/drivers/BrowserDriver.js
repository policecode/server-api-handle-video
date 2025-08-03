const GpmDriver = require('./gpmlogin/GpmDriver');
const GenloginDriver = require('./genlogin/genlogin-driver');
const DevDriver = require('./devtool/DevDriver');
const ExtraDriver = require('./devtool/ExtraDriver');
const RealBrowser = require('./devtool/RealBrowser');

class BrowserDriver  {

  static async getDriver(name){
    let driver;
    if(name=='gpm_login'){
      driver = new GpmDriver();
    }else if(name=='gen_login'){
      driver = new GenloginDriver();
    } else if (name=='dev_tool') {
      driver = DevDriver.getInstance();
    } else if (name=='dev_extra') {
      driver = ExtraDriver.getInstance();
    } else if(name=='real_browser') {
      driver = RealBrowser.getInstance();
    }else{
      driver = DevDriver.getInstance();
    }
    return driver
  }

  static async createBrowser(profile){
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


module.exports =  BrowserDriver
