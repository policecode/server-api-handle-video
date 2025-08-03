class LocalStorageHelper {
  setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  getStorage(key, valueDefault='') {
      if (localStorage.getItem(key)) {
        return JSON.parse(localStorage.getItem(key));
      } else {
        return valueDefault;
      }
    }
    
  removeStorage(key) {
      localStorage.removeItem(key);
    }
}

module.exports = LocalStorageHelper;
