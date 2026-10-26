// import { ElMessage } from "element-plus";
import moment from "moment";
const CryptoJS = require("crypto-js");
/**
 * 字符串转json，失败返回字符串
 * @param str
 * @return {any}
 */
export const strConvertJson: any = (str: any): any => {
  try {
    if (typeof JSON.parse(str) === "object") {
      return JSON.parse(str);
    }
  } catch (e) {}
  return str;
};

/**
 * 数字左边补0
 * @param num
 * @param n
 * @returns
 */
export function Pad(num: any, n: any) {
  return Array(n > ("" + num).length ? n - ("" + num).length + 1 : 0).join("0") + num;
}

/**
 * 创建Guid
 * @returns
 */
export function CreateGuid(time: any) {
  let now = moment();
  if (time) {
    now = time;
  }
  const millisecond = now.millisecond();
  const dayOfYear = now.dayOfYear();
  const check = Math.round(Math.random() * 999);
  let rand = window.crypto.getRandomValues(new Uint32Array(1))[0].toString();
  if (rand.length > 6) {
    rand = rand.substring(0, 6);
  }
  const guid = `${now.format("YYYYMMDDHHmmssSSS")}${Pad(dayOfYear + millisecond + check, 6)}${Pad(rand, 6)}${Pad(
    check,
    3
  )}`;
  return guid;
}

// 转义
export function Uint8ArrayToBase64(array: any) {
  array = new Uint8Array(array);
  const length = array.byteLength;
  const table = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/"
  ];
  let base64Str = "";
  let i = 0;
  for (i = 0; length - i >= 3; i += 3) {
    const num1 = array[i];
    const num2 = array[i + 1];
    const num3 = array[i + 2];
    base64Str +=
      table[num1 >>> 2] +
      table[((num1 & 0b11) << 4) | (num2 >>> 4)] +
      table[((num2 & 0b1111) << 2) | (num3 >>> 6)] +
      table[num3 & 0b111111];
  }
  const lastByte = length - i;
  if (lastByte === 1) {
    const lastNum1 = array[i];
    base64Str += table[lastNum1 >>> 2] + table[(lastNum1 & 0b11) << 4] + "==";
  } else if (lastByte === 2) {
    const lastNum1 = array[i];
    const lastNum2 = array[i + 1];
    base64Str +=
      table[lastNum1 >>> 2] +
      table[((lastNum1 & 0b11) << 4) | (lastNum2 >>> 4)] +
      table[(lastNum2 & 0b1111) << 2] +
      "=";
  }
  return base64Str;
}

/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {Promise}
 */
export function getBlob(url: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error("下载出错"));
      }
    };

    xhr.send();
  });
}

/**
 * MD5值
 * @param value
 */
export function MD5(value: string) {
  const CryptoJS = require("crypto-js");
  return CryptoJS.MD5(value).toString();
}
/**
 * 导出文件保存公共方法
 * @param Template 字节
 * @param Type     时间戳前面文字
 * @param Title    自定义标题
 */
// export function Export(Template: any, Type: string, Title = "") {
//   const FileSaver = require("file-saver");
//   let filename = "";
//   if (Title) {
//     filename = Title;
//   } else {
//     filename = `${Type}_${moment().format("YYYY_MM_DD_HH_mm_ss")}.xlsx`;
//   }
//   FileSaver.saveAs(
//     new Blob([Template], {
//       type: "application/octet-stream"
//     }),
//     filename
//   );
// }
// 验证字符串字节大小
export function BytesCount(str: string) {
  let cnt = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i);
    if (/^[\\x00-\\x7F]$/.test(c)) {
      cnt++;
    } else {
      cnt += 2;
    }
  }

  return cnt;
}

// 默认展开树形所有节点
export const expandAllNodes = (treeData: any) => {
  let result = [] as any;
  treeData.forEach((item: any) => {
    if (item.Children && item.Children.length) {
      result.push(item);
      const childrens = expandAllNodes(item.Children);
      if (childrens && childrens.length) {
        result = result.concat(childrens);
      }
    }
  });
  return result;
};

export const arrayBufferToBase64 = (u8Arr: any) => {
  if (u8Arr && u8Arr.length) {
    const CHUNK_SIZE = 0x8000; //arbitrary number
    let index = 0;
    const length = u8Arr.length;
    let result = "";
    let slice;
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    // web image base64图片格式: "data:image/png;base64," + b64encoded;
    return "data:image/png;base64," + btoa(result);
  } else {
    return "";
  }
};
/**
 * 数字处理
 * 如果是小数，要保留两位小数
 * 如果是整数就是整数
 *  */
export const save2Decimal = (val: number) => {
  const numToStr = val.toString();
  if (numToStr.split(".") && numToStr.split(".").length === 2) {
    return val.toFixed(2);
  } else {
    return val.toString();
  }
};

export function pw2(pwd: string, username: string, ip: string) {
  return CryptoJS.MD5((Date.now() + "").slice(0, 8) + pwd + username + ip).toString();
}
/**
 * 时间戳转 时分秒
 * @param ts 秒或毫秒时间戳
 */
export function formatTime(ts: number | string) {
  if (!ts) return "";
  let t = Number(ts);
  // 自动判断毫秒级时间戳
  if (t.toString().length >= 13) t = Math.floor(t / 1000);
  const date = new Date(t * 1000);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * 时间戳转 年-月-日 时:分:秒
 * @param ts 秒或毫秒时间戳
 */
export function formatDateTime(ts: number | string): string {
  if (!ts) return "";
  let t = Number(ts);

  // 自动识别：长度 >=13 → 毫秒级
  if (t.toString().length >= 13) {
    t = Math.floor(t / 1000);
  }

  const date = new Date(t * 1000);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${h}:${m}:${s}`;
}

// 时间戳 转 年月日
export function formatDate(timestamp: number | string) {
  if (!timestamp) return "";

  let time = Number(timestamp);
  // 10位秒级时间戳转毫秒
  if (String(time).length === 10) {
    time = time * 1000;
  }

  const date = new Date(time);
  // 校验日期是否合法
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
