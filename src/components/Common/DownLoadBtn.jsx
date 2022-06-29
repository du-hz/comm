import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import { momentFormat } from '@/utils/commonDataInterface';
import {
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'
import CosButton from '@/components/Common/CosButton'
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'

// downLoadTitle    文件名
// 已弃用   columns          下载表信息
// downLoadUrl      下载路径信息
// queryData        下载查询数据
// downDataUuid         需要下载的单条数据
// setSpinflag      加载
// btnName          button名称
// disabled         是否禁用---默认不禁用
// downIf           判断是否下载
// downNo           提示
// messFlag         判断是否是弹窗内部提示信息，true
// downMessage    弹窗内部提示



//  传入参数例子
// let data= [{
//     dataCol: [{}],   // 列表字段
//     sumCol: [{}],    // 汇总字段
//     sheetName: ''//sheet名称--协议Item
// }, {
//     dataCol: [{}],   // 列表字段
//     sumCol: [{}],    // 汇总字段
//     sheetName: ''//sheet名称--协议Item
// }]

const DownloadBtn = (props) => {
    let { downLoadTitle, downColumns, downLoadUrl, queryData, downDataUuid = undefined, downUuids = undefined, setSpinflag, btnName, disabled = false, downIf = true, downNo = undefined, messFlag = false, downMessage } = props
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    // 下载
    const downBtn = async () => {
        Toast('', '', '', 5000, false);
        messFlag ? downMessage({}) : undefined;
        if (downIf) {
            setSpinflag(true);
            let sheetData = [];     // sheetList列表
            let dataHeadJson = {};   // 头字段
            let dataColJson = {};   // 列表字段
            let sumColJson = {};    // 汇总字段
            // 处理接收数据
            for (let i = 0; i <= downColumns.length - 1; i++) {
                dataHeadJson = {};
                dataColJson = {}
                sumColJson = {}
                let v = downColumns[i];
                v.dataHead ? dataHeadJson = v.dataHead : undefined;
                for (let j = 0; j <= v.dataCol.length - 1; j++) {  // 列表字段
                    if (v.dataCol[j].dataIndex == 'operate') {   // 判断是不是操作
                        continue;
                    }
                    dataColJson[v.dataCol[j].dataIndex] = intl.formatMessage({ id: v.dataCol[j].title.props.id })
                }
                if (v.sumCol) {  // 汇总字段---判断是否存在
                    for (let j = 0; j <= v.sumCol.length - 1; j++) {
                        sumColJson[v.sumCol[j].dataIndex] = intl.formatMessage({ id: v.sumCol[j].title.props.id })
                    }
                }
                // sheetData最终处理数据
                sheetData.push({
                    dataHead: dataHeadJson,
                    dataCol: dataColJson,
                    sumCol: sumColJson,
                    sheetName: intl.formatMessage({ id: v.sheetName ? v.sheetName : downLoadTitle })
                })
            }

            // 请求接口开始
            const result = await request($apiUrl[downLoadUrl], {
                method: "POST",
                data: {
                    page: {
                        pageSize: 0,
                        current: 0
                    },
                    uuid: downDataUuid,
                    uuids: downUuids,
                    params: downDataUuid || downUuids ? undefined : {
                        ...queryData,
                        activityDate: undefined,
                        activityDateFrom: queryData.activityDate ? momentFormat(queryData.activityDate[0]) : undefined,
                        activityDateTo: queryData.activityDate ? momentFormat(queryData.activityDate[1]) : undefined,
                        // activityDateFrom
                        // activityDateTo
                        activeDate: undefined,
                        generateDate: undefined,
                        activeDateFrom: queryData.activeDate ? momentFormat(queryData.activeDate[0]) : undefined,
                        activeDateTo: queryData.activeDate ? momentFormat(queryData.activeDate[1]) : undefined,
                        generateDateFrom: queryData.generateDate ? momentFormat(queryData.generateDate[0]) : undefined,
                        generateDateTo: queryData.generateDate ? momentFormat(queryData.generateDate[1]) : undefined,

                        // 查询结转实付报账单--下载
                        checkDate: undefined,
                        checkDateFrom: queryData.checkDate ? momentFormat(queryData.checkDate[0]) : undefined,
                        checkDateTo: queryData.checkDate ? momentFormat(queryData.checkDate[1]) : undefined,
                    },
                    excelFileName: intl.formatMessage({ id: downLoadTitle }), //文件名
                    // sheetList: [{//sheetList列表
                    //     dataCol: downloadData,  //列表字段
                    //     sheetName: intl.formatMessage({id: downLoadTitle}),//sheet名称
                    // }],
                    sheetList: sheetData
                },
                headers: { "biz-source-param": "BLG" },
                responseType: 'blob',
            })
            // if(result && result.success == false){  //若无数据，则不下载
            //     setSpinflag(false);
            //     Toast('', result.errorMessage, 'alert-error', 5000, false);
            //     return
            // }else{
            if (result.size < 1) {
                setSpinflag(false)
                messFlag ? downMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Unclock-agFee-download' }) }) : Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
                return
            } else {
                let blob = new Blob([result], { type: "application/x-xls" });
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, intl.formatMessage({ id: downLoadTitle }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = intl.formatMessage({ id: downLoadTitle }) + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
                setSpinflag(false);
            }
        } else {
            messFlag ? downMessage({ alertStatus: 'alert-error', message: formatMessage({ id: downNo }) }) : Toast('', formatMessage({ id: downNo }), 'alert-error', 5000, false)
        }
    }

    return (<CosButton disabled={disabled} onClick={downBtn}><CloudDownloadOutlined /><FormattedMessage id={btnName} /></CosButton>)
}
export default DownloadBtn

// let downloadData = {};
// columns.map((v, i) => {
//     downloadData[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
// })

// const downBtn = async() => {
    // data.map((val, idx) => {
    //     dataColJson = {}
    //     sumColJson = {}
    //     val.dataCol.map((v, i) => {
    //         if(v.dataIndex == 'operate') {
    //             continue;
    //             console.log('成功', v.dataIndex == 'operate')
    //         }
    //         console.log(v, i)
    //         dataColJson[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
    //     })
    //     val.sumCol.map((v, i) => {
    //         console.log(v, i)
    //         sumColJson[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
    //     })

    //     console.log(dataColJson, sumColJson)
    //     // sheetData[idx].dataCol = dataColJson;
    //     sheetData.push({dataCol: dataColJson, sumCol: sumColJson})
    // })
    // console.log(sheetData)
// }