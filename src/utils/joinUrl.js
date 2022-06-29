/**
 * 把对象类型的入参逐个拼接到请求地址里
 * @param {String} url [接口请求地址]
 * @param {Object} params [接口请求入参]
 * @param {boolean} isHasParams [标识入参url中是否已经带有参数]
 * @param {boolean} filterParam [入参为空时，是否需要拼接。true-不需要拼接、false-需要拼接]
 * @returns {String} 拼接完成的url
 */
export default function joinUrl(url, params, isHasParams, filterParam = true) {
    let len = url.length,
      flag = false,
      lastPosition = url.substr(len - 1, 1); // url最后一位
    if ('/' == lastPosition) {
      url = url.substr(0, len - 1); // 去掉最后一个字符串
    }
    Object.keys(params).forEach((key, index, array) => {
      let queMark = '?';
      let joinMark = '&';
  
      flag && (queMark = '');
      array.length - 1 == index && (joinMark = '');
  
      if (filterParam && !isBlank(params[key])) { // 需要过滤空参数，且参数不为空
        joinParam(queMark, joinMark, key);
      } else if (!filterParam) { // 无需过滤空参数
        joinParam(queMark, joinMark, key);
      }
  
    });
    return url;
  
    function isBlank(val) {
      if (typeof val == 'string' && val.trim()) {
        return false;
      } else if (typeof val == 'number') {
        return false;
      } else {
        return true;
      }
    }
  
    function joinParam(queMark, joinMark, key) {
      if (isHasParams) {
        url += joinMark + key + '=' + params[key] + joinMark;
      } else {
        flag = true;
        url += queMark + key + '=' + params[key] + joinMark;
      }
    }
}