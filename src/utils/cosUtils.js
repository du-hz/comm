import { FormattedMessage } from 'umi';
import React from "react";
import cnLables from "@/locales/zh-CN/labels";
import enLables from "@/locales/en-US/labels";
import elLables from "@/locales/el-GR/labels";
import ukLables from "@/locales/uk-UA/labels";
import {Tag} from "antd";

// 临时用，字典表的翻译后续全部从服务器加载就获取了，后续删除
export const validOptions = [
  {label: <FormattedMessage id="lbl.yes" />, value: 'Y',},
  {label: <FormattedMessage id="lbl.no" />, value: 'N',},
];

export const custVenderOptions = [
  {label: <FormattedMessage id="lbl.cust" />, value: 'cust',},
  {label: <FormattedMessage id="lbl.vender" />, value: 'vender',},
];

export const taskTypeOptions = [
  {label: <FormattedMessage id="lbl.task.inv-not-cre" />, value: 'INV_NOT_CRE',},
  {label: <FormattedMessage id="lbl.task.inv-not-imp" />, value: 'INV_NOT_IMP',},
  {label: <FormattedMessage id="lbl.task.ar-not-appr" />, value: 'AR_NOT_APPR',},
  {label: <FormattedMessage id="lbl.task.ar-not-inv" />, value: 'AR_NOT_INV',},
  {label: <FormattedMessage id="lbl.task.ar-not-rcv" />, value: 'AR_NOT_RCV',},
];

export const i18nCalculate = (label, locale) => {
  if (locale === 'zh-CN') {
    return cnLables[label];
  }
  if (locale === 'en-US') {
    return enLables[label];
  }
  if (locale === 'el-GR') {
    return elLables[label];
  }
  if (locale === 'uk-UA') {
    return ukLables[label];
  }
  return label;
};

export const dictTranslate = (dictData, value) => {
  for(let i = 0; i < dictData.length; i += 1) {
    if (dictData[i].value === value) {
      return dictData[i].label;
    }
  }
  return value;
};

export const translatePropByDict = (resultList, origProp, targetPorp, translateDict) => {
  for(let i = 0; i < resultList.length; i += 1) {
    for(let j = 0; j < translateDict.length; j += 1) {
      if (resultList[i][origProp] === translateDict[j].value) {
        // eslint-disable-next-line no-param-reassign
        resultList[i][targetPorp] = translateDict[j].label;
        break;
      }
    }
  }
};

// 请务必确保三个数组参数长度、顺序是匹配的
export const translatePropsByDict = (resultList, origProps, targetPorps, translateDicts) => {
  for(let i = 0; i < resultList.length; i += 1) {
    for(let j = 0; j < origProps.length; j += 1 ) {
      for(let k = 0; k < translateDicts[j].length; k += 1) {
        if (resultList[i][origProps[j]] === translateDicts[j][k].value) {
          // eslint-disable-next-line no-param-reassign
          resultList[i][targetPorps[j]] = translateDicts[j][k].label;
          break;
        }
      }
    }
  }
};

export const isChinese = (str) => {
  if (!str || str.length === 0) return false;
  const reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
  return reg.test(str);
};

const getValueFromObject = (object, propName, splitString, defaultValue) => {
  if (typeof(propName) === 'string') {
    return object[propName] ? object[propName] : defaultValue;
  }
  if (propName instanceof Array) {
    let val = '';
    for (let i = 0 ; i <propName.length; i += 1) {
      val += getValueFromObject(object, propName[i], defaultValue);
      if (i < propName.length - 1) {
        val += splitString;
      }
    }
    return val;
  }
  return defaultValue;
};

/**
 * 提供对象数组，自动生成指定的label/value数组，一般用于生成下拉框数据源
 * @param objectArrays 带转换的数组
 * @param labelIndex 希望显示给用户看的字段名
 * @param valueIndex 希望保存到数据库的字段名
 * @param splitString 如果label是一个数组（多个字段连接，提供期望的连接符）
 * @param defaultValue 某个字段没有值的时候，怎么展现
 * @returns {[]|*[]|{label: string, value: string}[]}
 */
export const generateOptions = (objectArrays, labelIndex, valueIndex, splitString = ' - ', defaultValue = '#unknow#') => {

  if (!objectArrays) return [];
  if (objectArrays instanceof Array) {
    const result = [];
    for(let i = 0; i < objectArrays.length; i += 1) {
      const obj = objectArrays[i];
      const option = {};

      option.label = getValueFromObject(obj, labelIndex, splitString, defaultValue);
      option.value = getValueFromObject(obj, valueIndex, splitString, defaultValue);

      result.push(option);
    }
    return result;
  }
  // 只是一个对象，只能尝试生成唯一的一个option
  return [{
    label: getValueFromObject(objectArrays, labelIndex, splitString, defaultValue),
    value: getValueFromObject(objectArrays, valueIndex, splitString, defaultValue),
  }];
};

const defaultFormat = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 1, minimumFractionDigits:2, maximumFractionDigits:2
});

export const formatCurrency = (amount, defaultZero = true) => {
  if (!amount && !defaultZero) return '';
  return defaultFormat.format(!amount ? 0 : amount);
  // return currency(!amount ? 0 : amount, {symbol:''}).format(); 如果未来ES6提供的这个format不能满足要求，可以考虑用第三方工具
  // 例如这个就是 https://currency.js.org/ 提供的第三方工具，暂时先注释掉
};

export const renderValidIndicator = (text) => {
  return (
    <Tag color={text === 'Y' ? 'green' : 'volcano'}>
      {text}
    </Tag>
  );
};
/**
 * 字符串为空的判断
 * @param str
 * @returns {boolean}
 */
export const isEmptyString = (str) => {
  return str === null || str === undefined || str.trim() === "";
}

/**
 * 对象列表分组
 * @param array
 * @param groupBy
 */
export const groupBy = (array,groupPro) => {
  const map = new Map();
  array.forEach( v => {
      if (map.has(v[groupPro])) {
        map.set(v[groupPro],[...map.get(v[groupPro]),v]);
      } else {
        map.set(v[groupPro],[v]);
      }
  });
  return map;
}
