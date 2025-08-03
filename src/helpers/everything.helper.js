const { LOGGER } = require('./logger.helper');
const waitForSelector = (page, selector, selectorNum = 0) => {
  return new Promise(async (resolve, reject) => {
    /*const firstElements = await page.$$(selector)
    if (firstElements[selectorNum]) {
        resolve(firstElements[selectorNum])
    } else {*/
    page.waitForSelector(selector, { timeout: 15000 }).then(async () => {
      const elements = await page.$$(selector);
      const element = elements[selectorNum];
      if (element) {
        await element.scrollIntoView();
      }
      resolve(element);
    }).catch(async (err) => {
      page.$$(selector).then((elements) => {
        if (elements[selectorNum]) {
          resolve(elements[selectorNum]);
        } else {
          reject(err);
        }
      }).catch(() => {
        reject(err);
      });
    });
    //}
  });
};

const waitForClassName = (page, ClassName, selectorNum = 0) => {
  return new Promise(async (resolve, reject) => {
    page.evaluate((e) => {
      let {
        ClassName,
        selectorNum
      } = e;

      function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
          style.display !== 'none'
        );
      }

      return new Promise((resolve, reject) => {
        let start = new Date() / 1000;

        let interval = setInterval(() => {
          let element = document.getElementsByClassName(ClassName)[selectorNum];

          if (element && isInViewport(element)) {
            clearInterval(interval);
            resolve();
          } else {
            if ((new Date() / 1000) - start > 5) {
              clearInterval(interval);
              reject();
            }
          }
        }, 500);
      });
    }, {
      ClassName,
      selectorNum: selectorNum || 0
    })
      .then(() => {
        resolve();
      }).catch(reject);
  });
};

const waitForXPath = (page, xPath, selectorNum = 0) => {
  return new Promise(async (resolve, reject) => {
    /*const firstElements = await page.$x(xPath)
    if (firstElements[selectorNum]) {
        resolve(firstElements[selectorNum])
    } else {*/
    page.waitForXPath(xPath, { visible: true }).then(async () => {
      const elements = await page.$x(xPath);
      resolve(elements[selectorNum]);
    }).catch(async (err) => {
      page.$x(xPath).then((elements) => {
        if (elements[selectorNum]) {
          resolve(elements[selectorNum]);
        } else {
          reject(err);
        }
      }).catch(() => {
        reject(err);
      });
    });
    //}
  });
};

const clickSelector = async (page, selector, selectorNum) => {
  return new Promise((resolve, reject) => {
    waitForSelector(page, selector, selectorNum).then(async (element) => {
      try {
        LOGGER.info(`clickSelector try with mouse`);
        const point = await element.clickablePoint();
        // await page.mouse.move(point.x, point.y,{steps:30});
        await page._cursor.moveTo({ x: point.x, y: point.y });
        await sleep(1000);
        await page.mouse.click(point.x, point.y);
        // await page._cursor.move(selector)

      } catch (e) {
        LOGGER.error('clickSelector try err' + e);
        try {
          await element.click();
        } catch (e) {
          LOGGER.error(e.stack);
          try {
            await page._cursor.click(selector);
          } catch (e) {
            LOGGER.error(e.stack);
            reject(e);
          }

        }
      }
      resolve();
    }).catch(reject);
  });
};

const clickSelectorElement = async (page, element) => {
  try {
    LOGGER.info(`clickSelector try with mouse`);
    const point = await element.clickablePoint();
    // const boundingBox = await element.boundingBox();
    // const point = {
    //   x: boundingBox.x + boundingBox.width / 2,
    //   y: boundingBox.y + boundingBox.height / 2
    // };
    // await page.mouse.move(point.x, point.y, { steps: 30 });
    await page._cursor.moveTo({
      x: point.x,
      y: point.y
    });
    await sleep(1000);
    await page.mouse.click(point.x, point.y);
    // await page._cursor.move(selector)

  } catch (e) {
    LOGGER.error(e.stack);
    try {
      await element.click();
    } catch (e) {
      LOGGER.error(`clickSelector mouse err :${e}`);
      return e;
    }
  }
};
const clickXPath = async (page, XPath) => {
  return new Promise((resolve, reject) => {
    waitForXPath(page, XPath).then(async (element) => {
      element.click().then(resolve).catch(reject);
    }).catch(reject);
  });
};

const typeXPath = async (page, XPath, text, selectorNum, typingSpeed = 25) => {
  return new Promise((resolve, reject) => {
    waitForXPath(page, XPath, selectorNum).then(async (element) => {
      element.focus().then(async () => {
        await page.keyboard.type(text, { delay: typingSpeed });

        resolve();
      }).catch(reject);
    }).catch(err => {
      reject(err);
    });
  });
};
const typeSelector = async (page, selector, text, selectorNum, typingSpeed = 75) => {
  return new Promise((resolve, reject) => {
    waitForSelector(page, selector, selectorNum).then(async (element) => {
      try {
        LOGGER.info(`clickSelector try with mouse`);
        // const {createCursor} = require("ghost-cursor");
        // const cursor = createCursor(page)
        await page._cursor.move(selector);
        await sleep(1000);
      } catch (e) {
        LOGGER.error(e.stack);
      }
      element.focus().then(async () => {
        await page.keyboard.type(text, { delay: typingSpeed });

        resolve();
      }).catch(reject);
    }).catch(err => {
      reject(err);
    });
  });
};

const goto = (page, website, tryNum = 0) => {
  return new Promise(async (resolve, reject) => {
    try {
      page.goto(website, { waitUntil: 'networkidle0' }).then(() => {
        resolve();
      }).catch(async (err) => {
        if (tryNum <= 3) {
          await goto(page, website, tryNum + 1);
          resolve();
        } else {
          reject(`Too many goto tries | ${err}`);
        }
      });
    } catch (err) {
      if (tryNum <= 3) {
        await goto(page, website, tryNum + 1);
        resolve();
      } else {
        reject(`Too many goto tries | ${err}`);
      }
    }
  });
};

const uploadFileSelector = async (page, selector, file, selectorNum) => {
  const [fileChooser] = await Promise.all([
    page?.waitForFileChooser(),
    clickSelector(page, selector, selectorNum)
  ]);

  await fileChooser?.accept([file]);
};

const uploadFileXPath = async (page, XPath, file) => {
  const [fileChooser] = await Promise.all([
    page?.waitForFileChooser(),
    clickXPath(page, XPath)
  ]);

  await fileChooser?.accept([file]);
};

const jiggleMouse = async (page, position) => {
  await page.mouse.move(position, position);
  await sleep(1000);
  await page.mouse.move(position, position);
};

const confirmNavigation = (page) => {
  return new Promise(async (resolve, reject) => {
    try {
      page.waitForNavigation({
        timeout: 30 * 1000,
        waitUntil: 'networkidle0'
      }).then(resolve).catch(resolve);
    } catch (err) {
      resolve(err);
    }
  });
};

const scrollUntilXPathVisible = (page, XPath, limitSeconds = 30) => {
  return new Promise(async (resolve, reject) => {
    page.evaluate((XPath, limit) => {
      function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }

      return new Promise((resolve, reject) => {
        window.scrollTo(0, 0);

        let start = new Date() / 1000;

        let interval = setInterval(() => {
          let current = new Date() / 1000;
          let element = getElementByXpath(XPath);

          if (element) {
            clearInterval(interval);
            resolve(element);
          } else {
            window.scrollBy(0, 300);
          }

          if (current - start > limit) {
            clearInterval(interval);
            reject(new Error(`Too much time spent scrolling`));
          }
        }, 500);
      });
    }, XPath, limitSeconds)
      .then(resolve)
      .catch(reject);
  });
};

const scrollUntilSelectorVisible = (page, Selector, limitSeconds = 30, options = {
  scrollByX: 0,
  scrollByY: 100
}) => {
  return new Promise(async (resolve, reject) => {
    page.evaluate((selector, limit) => {
      return new Promise((resolve, reject) => {
        window.scrollTo(0, 0);

        let start = new Date() / 1000;

        let interval = setInterval(() => {
          let current = new Date() / 1000;
          let element = document.querySelector(selector);

          if (element) {
            clearInterval(interval);
            resolve(element);
          } else {
            window.scrollBy(options.scrollByX || 0, options.scrollByY || 100);
          }

          if (current - start > limit) {
            clearInterval(interval);
            reject(new Error(`Too much time spent scrolling`));
          }
        }, 1000);
      });
    }, Selector, limitSeconds)
      .then(resolve)
      .catch(reject);
  });
};


const scrollUntilElementVisible = async (page, element, limitSeconds = 30, options = {
  scrollByX: 0,
  scrollByY: 100
}) => {

  let start = new Date() / 1000;

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });

  let interval = setInterval(async () => {
    let current = new Date() / 1000;
    let hasBound = element.boundingBox();

    if (hasBound) {
      clearInterval(interval);
    } else {
      await page.mouse.wheel({
        deltaX: options.scrollByX,
        deltaY: options.scrollByY
      });
    }

    if (current - start > limitSeconds) {
      clearInterval(interval);
    }
  }, 1000);

};
const sleep = (ms) => new Promise(r => {
  r = r < 0 ? 0 : r;
  setTimeout(r, ms);
});
const random = (min, max) => min + Math.floor(Math.random() * (max - min));
const removeNull = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] == null || obj[key] === undefined) {
      delete obj[key];
    }
  });
};

function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}

function randomChoiceArray(array) {
  const random = Math.floor(Math.random() * array.length);
  return array[random];
}

function customChoiceArray(array, index) {
  return array[index];
}

function youtubeParser(url) {
  // var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  // var match = url.match(regExp);
  // return (match&&match[7].length===11)? match[7] : false;
  try {
    let regex = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
    return regex.exec(url)[3];
  } catch (e) {
    return undefined;
  }

}

module.exports = {
  scrollUntilElementVisible,
  youtubeParser,
  clickSelectorElement,
  getMultipleRandom,
  customChoiceArray,
  randomChoiceArray,
  shuffleArray,
  uploadFileXPath,
  waitForXPath,
  clickXPath,
  typeXPath,
  uploadFileSelector,
  waitForSelector,
  clickSelector,
  typeSelector,
  scrollUntilXPathVisible,
  scrollUntilSelectorVisible,
  waitForClassName,
  goto,
  jiggleMouse,
  confirmNavigation,
  sleep,
  random,
  removeNull
};
