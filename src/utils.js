'use strict'
// 深拷贝
export function deepClone(obj) {
    let objClone = Array.isArray(obj) ? [] : {}
    if (obj && typeof obj === 'object') {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 判断ojb子元素是否为对象，如果是，递归复制
                if (obj[key] && typeof obj[key] === 'object') {}
                objClone[key] = obj[key]
            }
        }
    }
    return objClone
}

// 生成UUID
export function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

// 对比两个对象是否相等
export function isEqual(obj1, obj2) {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
    }
    for (let key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
    }
    return true;
}

// 像素转换为百分比
export function percentOrPixelToDecimal(str) {
    if (str.indexOf('%') > -1) {
        return +(str.replace('%', '') / 100)
    }
    if (str.indexOf('px') > -1) {
        return +(str.replace('px', '') / 100)
    }
}

// 小数点转百分比
export function decimalToPercent(num) {
    return num * 100 + '%'
}

// 获取图片真实宽高
export function getImageInfo(imgUrl) {
    return new Promise((resolve, reject) => {
        const labelImage = new Image()
        labelImage.src = imgUrl
        labelImage.onload = () => {
            resolve({
                width: labelImage.width,
                height: labelImage.height
            })
        }
    })
}