const { getRandomProperty } = require('./helpers/random.helper')
const { GenloginDriver } = require('./drivers/genlogin/genlogin-driver')
const { doAction } = require('./actions')
const { config } = require('./config')

async function runOne() {
  try {
    const genLoginDriver = new GenloginDriver();
    await genLoginDriver.connect()
    const browsers = genLoginDriver.browsers

    const browserId = getRandomProperty(browsers);

    const browser = await genLoginDriver.getBrowser(browserId);
    const otps = {
      gmailInfo:{
        email:"nvttest1234@gmail.com",
        password:"Test@1234"
      }
    }
    await doAction(browser,config,otps);

    await genLoginDriver.removeBrowser(browserId)
  } catch (error) {
    console.log(error);
  }
};

runOne()
