import CryptoJS from "crypto-js";
const CryptoSecret = "__CryptoJS_Secret__";
const store = require("store");

/**
 * 存储前缀
 */
const StorePrefix = "FJRH_Batch_";

/**
 * 加密数据
 * @param data - 数据
 */
export function encrypto(data: any) {
  const newData = JSON.stringify(data);
  return CryptoJS.AES.encrypt(newData, CryptoSecret).toString();
}

/**
 * 解密数据
 * @param cipherText - 密文
 */
export function decrypto(cipherText: string) {
  const bytes = CryptoJS.AES.decrypt(cipherText, CryptoSecret);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  if (originalText) {
    return JSON.parse(originalText);
  }
  return null;
}

function createLocalStorage<T extends StorageInterface.Local = StorageInterface.Local>() {
  function set<K extends keyof T>(key: string, value: string) {
    // window.localStorage.setItem(StorePrefix + key, value);
    store.set(StorePrefix + key, value);
  }

  function get<K extends keyof T>(key: string) {
    return store.get(StorePrefix + key);
    // const json = window.localStorage.getItem(StorePrefix + key);
    // if (json) {
    //     let storageData: T[K] | null = null;
    //     try {
    //         storageData = JSON.parse(json);
    //     } catch {
    //         // 防止解析失败
    //     }
    //     if (storageData) {
    //         return storageData;
    //     }
    //     remove(key);
    //     return null;
    // }
    // return null;
  }

  function remove(key: string) {
    store.remove(StorePrefix + key);
    // window.localStorage.removeItem(StorePrefix + key);
  }
  function clear() {
    window.localStorage.clear();
  }

  return {
    set,
    get,
    remove,
    clear
  };
}

export const localStg = createLocalStorage();
