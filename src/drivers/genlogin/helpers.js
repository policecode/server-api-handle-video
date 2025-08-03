const os = require("os");
const path = require("path");
const shell = require('shelljs')
const userHomeDir = os.homedir();
const localAppData = process.env.LOCALAPPDATA;
const exec = require("child_process").execSync;

// function getUserHome() {
//
//   // Return the value using process.env
//   return process.env[(process.platform ==
//     'win32') ? 'USERPROFILE' : 'HOME'];
// }
//
// // const userHomeDir = os.homedir();
// const userHomeDir = getUserHome()
//
// const localAppData = process.env.LOCALAPPDATA;
const firefoxExecPath = path.resolve(
  userHomeDir,
  '.genlogin/nightly/firefox/firefox.exe'
);
const chromeExecPath = path.resolve(
  localAppData,
  'GenBrowser/Application/chrome.exe'
);

const firefoxFingerprintPath = path.resolve(
  userHomeDir,
  '.genlogin/fp-firefox.exe'
);
const chromeFingerprintPath = path.resolve(
  userHomeDir,
  '.genlogin/fp-chrome.exe'
);

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const checkPortAvailable = async (port) => {
  try {
    const std =  await shell.exec(`netstat -an | findstr :${port}`);
    // const stdout = exec(`netstat -an | findstr :${port}`, { encoding: "utf-8" });
   const stdout = std.stdout
    if (stdout && stdout.match(/LISTENING/gim)) {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false
  }

  return true;
};

const getRandomPort = async () => {
  const min = 2000;
  const max = 50000;
  let port = getRandomInt(min, max);
  let portAvailable = await checkPortAvailable(port);

  while (!portAvailable) {
    port = getRandomInt(min, max);
    portAvailable = await checkPortAvailable(port);
  }
  return port;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
  firefoxExecPath,
  chromeExecPath,
  firefoxFingerprintPath,
  chromeFingerprintPath,
  getRandomPort,
  sleep,
};
