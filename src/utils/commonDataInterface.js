import request from './request';
import moment from 'moment';
import { cond, values } from 'lodash';
// 公司select
const acquireCompanyData = async (setData, apiUrl, flag) => {
    await request.post(apiUrl.COMM_AGMT_SEARCH_INIT)
        .then((resul) => {
            if (!resul.data) return
            let data;
            data = resul.data.companys;
            if (flag) {
                data.unshift({
                    companyCode: '*',
                    companyName: '*'
                })
                data.map((val, idx) => {
                    val['value'] = val.companyCode;
                    val['companyCode'] == "*" ? val['label'] = val.companyCode : val['label'] = val.companyCode + '-' + val.companyName;
                })
                console.log(data)
            } else {
                data.map((val, idx) => {
                    val['value'] = val.companyCode;
                    val['label'] = val.companyCode + '-' + val.companyName;
                })
            }
            setData(data);
        })
}
{/* 查询所有公司 */ }
const allCompany = async (setData, apiUrl, flag) => {
    //companyNameAbbr 为公司简称   //companyNameCn为全称
    await request.post(apiUrl.COMM_COMPANY_INIT)
        .then((resul) => {
            if (!resul.data) return
            let data;
            data = resul.data;
            if (flag) {
                data.unshift({
                    companyCode: '*',
                    companyName: '*'
                })
                data.map((val, idx) => {
                    val['value'] = val.companyCode;
                    val['companyCode'] == "*" ? val['label'] = val.companyCode : val['label'] = val.companyCode + '-' + val.companyName;
                })
                console.log(data)
            } else {
                data.map((val, idx) => {
                    val['value'] = val.companyCode;
                    val['label'] = val.companyCode + '-' + val.companyName;
                })
            }
            setData(data);
        })
}
// a-0          commissionAgmtEdit
const acquireSelectDataExtend = async (url, key, setData, apiUrl) => {
    await request.post(apiUrl[url] + '?key=' + key)
        .then((resul) => {
            if (!resul.data) return
            var data = resul.data;
            // console.log('data测试数据', data, url, key)
            data['values'].map((val, idx) => {
                val.value = val.value;
                val.label = val.value + '(' + val.label + ')';
            })
            setData(data);
        })
}

// 公共计算平台--根据key值从缓存中获取数据字典  /common/dict-item/key
const acquireSelectData = async (key, setData, apiUrl) => {
    await request.post(apiUrl.COMMON_DICT_ITEM + '?key=' + key)
        .then((resul) => {
            if (resul.success) {
                let data;
                if (key == 'TRADE.TYPE') {
                    data = resul.data ? resul.data.values : [];
                    data.unshift({
                        value: '*',
                        label: '*'
                    });
                    console.log(data);
                } else if (key == 'AFCM.AGMT.CALC.MODES.CALCMODES') {
                    data = resul.data ? resul.data.values : [];
                    data.unshift({
                        value: ' ',
                        label: ' '
                    });
                } else {
                    data = resul.data ? resul.data : {};
                }
                setData(data);
            }
        })
}
const momentFormat = (date) => {
    // console.log(moment(date).format('YYYY/MM/DD'))
    // date = moment(date).format('L')+' 00:00:00'  
    date = moment(date).format('YYYY/MM/DD') + ' 00:00:00'
    // console.log(date)
    return date.replace(/\//g, '-');
}



//费用大类
const costCategories = async (costKey, setCostKey, apiUrl) => {
    let fe = await request(apiUrl.AGENCY_FEE_ESTIMATE_FEE_DROP_DOWN_DATA_IN_FEE, {
        method: 'POST'
    })
    console.log(fe)
    if (fe.success) {
        let itemAdds = fe.data
        let costs = itemAdds.listAgTypeToClass
        costs.map((v, i) => {
            v['value'] = v.feeCode
            v['label'] = v.feeName + '(' + v.feeCode + ')';
            if (costKey.length == costs) {
            } else {
                costKey.push(v)
            }
        })
        setCostKey([...costKey])
    }
}

//登录公司的代理编码  和承运人默认
const company = async (apiUrl, setAgencyCode) => {
    //获取登录公司代码
    let company = await request(apiUrl.CURRENTUSER, {
        method: "POST",
        data: {}
    })
    if (company.success) {
        //获取代理编码
        let agencyCode = await request(apiUrl.COMMON_SEARCH_AGENCY_CODE, {
            method: 'POST',
            data: {
                'params': company.data.companyCode
            }
        })
        // console.log(agencyCode)
        if (agencyCode.success) {
            setAgencyCode(agencyCode.message)
        }
    }

}

// Trade and 贸易线Data
const TradeData = async (apiUrl, value, setTradeCode) => {
    if (value == '') {
        setTradeCode([]);
    } else {
        let result = await request(apiUrl.COMMON_SEARCH_TRADE_ZONE, {
            method: "POST",
            data: {
                'params': value
            }
        })
        if (result.success) {
            let data = result.data
            data.map((v, i) => {
                v['value'] = v.tradeCode
                v['label'] = v.tradeCode
            })
            setTradeCode(data)
        }
    }
}

//代理编码
// const agencyCodeData = async(apiUrl,setAgencyCode)=>{
//     let resul = await request(apiUrl.COMMON_COMPANY_SELF_SUB,{
//         method:"POST",
//     })
//     if(resul.success){
//         let agencyCodeData =resul.data
//         agencyCodeData.map((val,idx)=>{
//             val['value'] = val.sapCustomerCode;
//             val['label'] = val.sapCustomerCode;
//         })
//         setAgencyCode([...agencyCodeData])
//     }
// }
// 代理编码
const agencyCodeData = async (apiUrl, setAgencyCode, setCompany) => {
    let resul = await request(apiUrl.COMMON_COMPANY_CURRENTUSER, {
        method: "POST",
    })
    if (resul.success) {
        if (resul.data) {
            let agencyCodeData = resul.data ? resul.data.agencyCodes.values : null;
            // let val = resul.data ? resul.data.agencyCodes.defaultValue : null;
            let obj = {
                companyType: resul.data ? resul.data.companyType : null,
                companyCode: resul.data ? resul.data.companyCode : null,
                agencyCode: resul.data ? resul.data.agencyCodes.defaultValue : null,
            };
            setCompany ? setCompany(obj) : null;
            agencyCodeData.map((val, idx) => {
                val['value'] = val.value;
                val['label'] = val.label;
            })
            setAgencyCode([...agencyCodeData])
        }

    }
}

const Dictionaries = (text, data) => {
    data.map((v, i) => {
        return text == v.value ? <span>{v.label}</span> : '';
    })
}

// 代理费结算公共计算平台--根据key值从缓存中获取数据字典
const acquireSelectDatas = async (key, setData, apiUrl) => {
    await request.post(apiUrl.COMMON_DICT_ITEM_KEY + '?key=' + key)
        .then((resul) => {
            // console.log(resul)
            if (resul.success) {
                // let data = resul.data ? resul.data.values :null;
                // let val = resul.data ? resul.data.defaultValue :null;
                // if(valType=='Number'||valType=='number'){
                //     console.log(data)
                //     data.map((item,idx) => {
                //         item.value = Number(item.value)
                //     })
                // }

                // setData(data);
                let data = resul.data ? resul.data : [];
                setData(data);
            }
        })
}

//承运人
const carrier = async (apiUrl, setAcquireData) => {
    await request.post(apiUrl.COMMON_COMPANY_QUERYCARRIERS)
        .then((resul) => {
            console.log(resul)
            if (!resul.data) return
            var data = resul.data;
            console.log(data)
            data.map((val, idx) => {
                val['value'] = val.companyCode;
                val['label'] = val.companyNameCn;
            })
            setAcquireData(data);
        })
}

//口岸公司
const portCompany = async (apiUrl, url, setCompany, carrier) => {
    await request(apiUrl[url], {
        method: "POST",
        data: carrier ? carrier : ' '
    })
        .then((resul) => {
            if (!resul.data) return
            var data = resul.data;
            data.map((val, idx) => {
                val['value'] = val.companyCode
                val['label'] = val.companyCode + ' ' + val.companyName;
            })
            setCompany(data);
        })
}
//月份
const commissionMonth = async (apiUrl, url, setMonth) => {
    await request.get(apiUrl[url])
        .then((month) => {
            if (!month.data) return
            console.log(month)
            var data = month.data;
            setMonth(data);
        })
}
const StatePenalty = async (apiUrl, url, setCommissionState) => {
    await request.get(apiUrl[url])
        .then((month) => {
            if (!month.data) return
            console.log(month)
            var data = month.data;
            // setCommissionState(data['AFCM.PUNISH.DOCUMENTSTATE']);
            setCommissionState(data.values);
        })
}
const trackingAgencyList = async (options, setData) => {
    await request(options.apiUrl.BUDGET_TRACKING_GETACLIST_POST, {
        method: 'POST',
        data: {
            params: { companyCode: options.companyCode }
        }
    })
        .then((month) => {
            if (!month.data) return
            var data = month.data;
            setData(data);
        })
}
/**
    * 格式化金额，如100000.1格式化为100,000.10
    * @param 待格式化金额
*/
const formatCurrencyNew = (amount, number) => {
    if (isNaN(amount)) {
        return;
    }
    let amountArr = ('' + Math.abs(amount)).split(''); //将数字转换为元素为字符串的数组
    let size = amountArr.length; //获取数组的长度
    let hasDecimal = false; // 是否存在小数点
    let resultAmount = '';

    if (number) {
        let breakSize = 5; //保留包含小数点后三位
        for (let i = 0; i < size; i++) { //循环数组的长度
            if (hasDecimal) {
                breakSize--;
            }
            if (0 == breakSize) { //小数点后三位
                break;
            }
            let curr = amountArr[i]; //取出数组元素
            if ('.' == curr) { //判断是否有小数点
                hasDecimal = true;
            }
            resultAmount += curr;
        }

        if (hasDecimal) { // 存在小数点
            let index = resultAmount.indexOf('.');
            let fontStr = resultAmount.substr(0, index + 1); // 获取小数点前数据
            let backStr = resultAmount.substr(index + 1, 4); // 获取小数点后数据
            if (backStr.length == 1) {
                resultAmount = fontStr + (backStr + '000'); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
            } else if (backStr.length == 2) {
                resultAmount = fontStr + (backStr + '00'); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
            } else if (backStr.length == 3) {
                resultAmount = fontStr + (backStr + '0'); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
            } else if (backStr.length == 4) {
                resultAmount = fontStr + (backStr); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
            }
            // console.log(resultAmount)
        }
        let fontArr = null;
        let backStr = null;
        let tempStr = '';
        let timer = 0;
        if (hasDecimal) { // 存在小数点
            let index = resultAmount.indexOf('.'); //
            fontArr = resultAmount.substr(0, index).split('');
            backStr = resultAmount.substr(index, 5);
        } else {
            fontArr = resultAmount.split('');
            backStr = '.0000'; //如果没有小数点，则保留两位小数点
        }
        size = fontArr.length;
        for (let i = size - 1; i >= 0; i--) {
            let curr = fontArr[i];
            tempStr = curr + tempStr;
            if (3 == ++timer && 0 != i) {
                tempStr = ',' + tempStr;
                timer = 0;
            }
        }
        if (amount >= 0) {
            return tempStr + backStr;
        } else {
            return '-' + tempStr + backStr;
        }
    } else {
        let breakSize = 3; //保留包含小数点后三位
        for (let i = 0; i < size; i++) { //循环数组的长度
            if (hasDecimal) {
                breakSize--;
            }
            if (0 == breakSize) { //小数点后三位
                break;
            }
            let curr = amountArr[i]; //取出数组元素
            if ('.' == curr) { //判断是否有小数点
                hasDecimal = true;
            }
            resultAmount += curr;
        }
        if (hasDecimal) { // 存在小数点
            let index = resultAmount.indexOf('.');
            let fontStr = resultAmount.substr(0, index + 1); // 获取小数点前数据
            let backStr = resultAmount.substr(index + 1, 2); // 获取小数点后数据
            resultAmount = fontStr + (backStr.length == 1 ? backStr + '0' : backStr); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
        }
        let fontArr = null;
        let backStr = null;
        let tempStr = '';
        let timer = 0;
        if (hasDecimal) { // 存在小数点
            let index = resultAmount.indexOf('.'); //
            fontArr = resultAmount.substr(0, index).split('');
            backStr = resultAmount.substr(index, 3);
        } else {
            fontArr = resultAmount.split('');
            backStr = '.00'; //如果没有小数点，则保留两位小数点
        }
        size = fontArr.length;
        for (let i = size - 1; i >= 0; i--) {
            let curr = fontArr[i];
            tempStr = curr + tempStr;
            if (3 == ++timer && 0 != i) {
                tempStr = ',' + tempStr;
                timer = 0;
            }
        }
        if (amount >= 0) {
            return tempStr + backStr;
        } else {
            return '-' + tempStr + backStr;
        }
    }
}


const KeepDecimalPlace = (amount, number) => {
    if (isNaN(amount)) {
        return;
    }
    let amountArr = ('' + Math.abs(amount)).split(''); //将数字转换为元素为字符串的数组
    let size = amountArr.length; //获取数组的长度
    let hasDecimal = false; // 是否存在小数点
    let resultAmount = '';

    if (number) {
        let breakSize = 5; //保留包含小数点后三位
        for (let i = 0; i < size; i++) { //循环数组的长度
            if (hasDecimal) {
                breakSize--;
            }
            if (0 == breakSize) { //小数点后三位
                break;
            }
            let curr = amountArr[i]; //取出数组元素
            if ('.' == curr) { //判断是否有小数点
                hasDecimal = true;
            }
            resultAmount += curr;
        }

        if (hasDecimal) { // 存在小数点
            let index = resultAmount.indexOf('.');
            let fontStr = resultAmount.substr(0, index + 1); // 获取小数点前数据
            let backStr = resultAmount.substr(index + 1, 4); // 获取小数点后数据
            if (backStr.length == 1) {
                resultAmount = fontStr + (backStr + '000'); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
            } else if (backStr.length == 2) {
                resultAmount = fontStr + (backStr + '00'); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
            } else if (backStr.length == 3) {
                resultAmount = fontStr + (backStr + '0'); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
            } else if (backStr.length == 4) {
                resultAmount = fontStr + (backStr); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
            }
            // console.log(resultAmount)
        }
        let fontArr = null;
        let backStr = null;
        let tempStr = '';
        let timer = 0;
        if (hasDecimal) { // 存在小数点
            let index = resultAmount.indexOf('.'); //
            fontArr = resultAmount.substr(0, index).split('');
            backStr = resultAmount.substr(index, 5);
        } else {
            fontArr = resultAmount.split('');
            backStr = '.0000'; //如果没有小数点，则保留两位小数点
        }
        size = fontArr.length;
        for (let i = size - 1; i >= 0; i--) {
            let curr = fontArr[i];
            tempStr = curr + tempStr;
            if (3 == ++timer && 0 != i) {
                tempStr = ',' + tempStr;
                timer = 0;
            }
        }
        if (amount >= 0) {
            return tempStr + backStr;
        } else {
            return '-' + tempStr + backStr;
        }
    } else {
        let breakSize = 3; //保留包含小数点后三位
        for (let i = 0; i < size; i++) { //循环数组的长度
            if (hasDecimal) {
                breakSize--;
            }
            if (0 == breakSize) { //小数点后三位
                break;
            }
            let curr = amountArr[i]; //取出数组元素
            if ('.' == curr) { //判断是否有小数点
                hasDecimal = true;
            }
            resultAmount += curr;
        }
        // if (hasDecimal) { // 存在小数点
        //     let index = resultAmount.indexOf('.');
        //     let fontStr = resultAmount.substr(0, index + 1); // 获取小数点前数据
        //     let backStr = resultAmount.substr(index + 1, 2); // 获取小数点后数据
        // resultAmount = fontStr + (backStr.length == 1 ? backStr + '0' : backStr); // 判断小数点后数据是否之后一位，如果只有一位，则补0;
        // }
        let fontArr = null;
        let backStr = null;
        let tempStr = '';
        let timer = 0;
        if (hasDecimal) { // 存在小数点
            let index = resultAmount.indexOf('.'); //
            fontArr = resultAmount.substr(0, index).split('');
            backStr = resultAmount.substr(index, 3);
        } else {
            fontArr = resultAmount.split('');
            backStr = '.0'; //如果没有小数点，则保留两位小数点
        }
        size = fontArr.length;
        for (let i = size - 1; i >= 0; i--) {
            let curr = fontArr[i];
            tempStr = curr + tempStr;
            if (3 == ++timer && 0 != i) {
                tempStr = ',' + tempStr;
                timer = 0;
            }
        }
        if (amount >= 0) {
            return tempStr + backStr;
        } else {
            return '-' + tempStr + backStr;
        }
    }
}

const dictionary = (datas, setTableData, protocolStateData, checkStatus) => {
    datas.forEach((item, i) => {
        item.show = true
        let datasStarus
        if (item.status) {
            datasStarus = item.status
        } else {
            datasStarus = item.agreementStatus
        }
        // let labels
        // protocolStateData?protocolStateData.map((v,i)=>{
        //     if(datasStarus==v.value){
        //        labels=v.label
        //        return labels
        //     }
        // }):null
        // item.agreementStatus=labels
        // item.status=labels
        console.log(item.fromDate.length)
        // item.fromDate=item.fromDate.length>10? item.fromDate.slice(0,10):item.fromDate
        // item.toDate=item.toDate.length>10?item.toDate.slice(0,10):item.toDate
        //判断删除编辑是否禁用
        if (datasStarus == 'U' || datasStarus == 'W') {
            item.show = false
        }
        let datasCheckFadStatus = item.checkFadStatus//fad审核状态
        let datasCheckPmdStatus = item.checkPmdStatus//pmd审核状态
        let datascheckAgencyStatus = item.checkAgencyStatus//代理审核状态
        let fadlable
        let pmdlable
        let agencylable
        // console.log('代理审核状态',datasCheckFadStatus)

        if (checkStatus) {
            checkStatus.map((v, i) => {
                if (datasCheckFadStatus === v.value) {
                    // console.log('fad审核状态',datasCheckFadStatus)
                    fadlable = v.label
                }
                if (datasCheckPmdStatus === v.value) {
                    pmdlable = v.label
                }
                if (datascheckAgencyStatus === v.value) {
                    // console.log('代理审核状态',datasCheckFadStatus)
                    agencylable = v.label
                }
            })
            item.checkFadStatus = fadlable
            item.checkPmdStatus = pmdlable
            item.checkAgencyStatus = agencylable
        }
    })
    setTableData([...datas])
}
const getStatus = (datas, setTableData) => { //根据状态控制删除按钮操作权限
    datas.forEach((item, i) => {
        item.show = true
        let status
        if (item.status) {
            status = item.status
        }
        //判断删除是否禁用
        if (status == 'Submit') {
            item.show = false
        }
    })
    setTableData([...datas])
}

const excuteStatus = (datas, setTableData) => { //根据状态控制编辑按钮
    datas.forEach((item, i) => {
        item.excute = true
        let status
        if (item.status) {
            status = item.status
        }
        //判断编辑是否禁用
        if (status == 'W' || status == 'E') {
            item.excute = false
        }
    })
    setTableData([...datas])
}

//登录公司的代理编码  和承运人默认
const setCarrierDefault = async (apiUrl, setCarrierDefaultData) => {
    //获取登录公司代码
    let company = await request(apiUrl.CURRENTUSER, {
        method: "POST",
        data: {}
    })
    if (company.success) {
        //获取承运人默认值
        console.log(company.data.companyCode)
        let acquireData = await request(apiUrl.PUNIHRSULT_GETCARIERCODE, {
            method: 'POST',
            data: company.data.companyCode
        })
        // console.log(agencyCode)
        if (acquireData.success) {
            // setAgencyCode(acquireData.message)
            console.log(acquireData)
            setCarrierDefaultData(acquireData.message)

        }

    }

}
//根据公司获取代理编码
const companyAgency = async (apiUrl, data, setAgencyCode) => {
    await request.post(apiUrl.COMMON_COMPANY_QUERY_COMM + '?companyCode=' + data)
        .then((result) => {
            // console.log(result)
            if (result.success) {
                result.data ? setAgencyCode(result.data) : [];
            }
        })
}

// 时间
const TimesFun = () => {
    var day2 = new Date();
    day2.setTime(day2.getTime());
    let month = day2.getMonth() + 1;
    let day = day2.getDate() < 10 ? "0" + day2.getDate() : day2.getDate();
    let hour = day2.getHours() < 10 ? "0" + day2.getHours() : day2.getHours();
    let minute = day2.getMinutes() < 10 ? "0" + day2.getMinutes() : day2.getMinutes();
    let second = day2.getSeconds() < 10 ? "0" + day2.getSeconds() : day2.getSeconds();
    month < 10 ? month = '0' + month : month;
    let fromDate = `${day2.getFullYear()}${month}${day}${hour}${minute}${second}`;
    return fromDate;
}

export {
    acquireCompanyData,
    acquireSelectData,
    momentFormat,
    acquireSelectDataExtend,
    costCategories,
    company,
    TradeData,
    agencyCodeData,
    Dictionaries,
    acquireSelectDatas,
    carrier,
    portCompany,
    commissionMonth,
    StatePenalty,
    trackingAgencyList,
    formatCurrencyNew,
    dictionary,
    getStatus,
    KeepDecimalPlace,
    setCarrierDefault,
    allCompany,
    excuteStatus,
    companyAgency,
    TimesFun
}