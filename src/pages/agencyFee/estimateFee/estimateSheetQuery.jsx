{/* 查询预估单 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage, useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, costCategories, momentFormat, agencyCodeData, acquireSelectDataExtend,} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Modal } from 'antd'
import {Toast} from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading';
import CosModal from '@/components/Common/CosModal'


import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    CloseOutlined, //关闭
    PrinterOutlined, //打印
} from '@ant-design/icons'
let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const estimateSheetQuery =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData,setTableData] = useState([]) // table数据
    const [tabTabTotal,setTabTotal ] = useState([]) // table条数 
    const [tabDetailTotal,setTabDetailTotal ] = useState([]) // table明细条数 
    const [feeClass,setFeeClass ] = useState([]) // 费用大类 
    const [feeCategory,setFeeCategory] = useState ([])
    const [receiptStatus, setReceipt] = useState({}); // 预估单状态
    const [packageData, setPackage] = useState({}); // 是否生成数据包
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [isModalVisible, setIsModalVisible] = useState(false);   // 明细弹窗
    const [headerTitle, setHeaderTitle] = useState(""); //弹窗标题
    const [detailData,setDetailData] = useState([]);  // 明细数据
    const [detailDatas,setDetailDatas] = useState([]);  // 明细数据-汇总
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [uuid, setUuid] = useState("");   // 分页uid
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [page1,setPage1]=useState({
        current: 1,
        pageSize: 10
    })

    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "agencyName": null,
        "agreementCode": null,
        "agreementStatus": null,
        "companyCode":null,
        "queryType": "PRE_AGMT",
        "soCompanyCode": null,
        "soCompanyCodeReadOnly": true
    });
     {/* form 数据 */} 
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company,acquireData])

    {/* 初始化 */} 
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.AG.ER.RECEIPT.STATUS2', setReceipt, $apiUrl);// 预估单状态
        acquireSelectData('AFCM.PACKAGE.FLAG', setPackage, $apiUrl);// 是否生成数据包
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大小类联动
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码

    },[])
    useEffect(()=>{
        felList()
    },[feeClass])
    
    
    const felList = ()=>{
        if(feeClass!=null){
            let listAgTypeToClassall = feeClass.map((v,i)=>{
                return v.listAgTypeToClass
            })
            let listAgTypeToClass = listAgTypeToClassall.reduce((pre,cur)=>{
                return pre.concat(cur)
            },[])
            listAgTypeToClass.map((v,i)=>{
                v['value']=v.feeCode
                v['label']=v.feeName+'(' + v.feeCode +')';
            })
            setFeeCategory(listAgTypeToClass)
        }
    }

    {/* 表头 */}
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.company' />,//公司
            dataIndex: 'companyCode',
            align:'left', 
            width: 45,
        },
        {
            title: <FormattedMessage id='lbl.Estimated-order-number' />,//预估单号码
            dataIndex: 'ygListCode',
            align:'left', 
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Temporary.estimated-order-number' />,//临时预估单号码
            dataIndex: 'tmpYgListCode',
            align:'left', 
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Estimated-single-state'/>,//预估单状态
            dataIndex: 'verifyStatus',
            dataType: receiptStatus.values,
            align:'left', 
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.Generation-personnel'/>,//生成人员
            dataIndex: 'generateUser',
            align:'left', 
            width: 80,
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            dataIndex: 'generateDate',
            align:'left', 
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.confirmation-personnel'/>,//确认人员
            dataIndex: 'checkUser',
            align:'left', 
            width: 80,
        },
        {
            title: <FormattedMessage id= "lbl.confirmation-date" />,//确认日期
            dataIndex: 'checkDate',
            align:'left', 
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.generate-package' />,//是否生成数据包
            dataType: packageData.values,
            dataIndex: 'pkgFlag',
            align:'left', 
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Generating-packets' />,//生成数据包的批次
            dataIndex: 'pkgProcessId',
            align:'left', 
            width: 120,
        },
    ]
    {/* 明细列表 */}
    const detailColumn=[
        {
            title: <FormattedMessage id='lbl.state' />,// 状态
            dataIndex: 'listVerifyStatus',
            dataType: receiptStatus.values,
            align:'left',
            width: 45
        },
        {
            title: <FormattedMessage id='lbl.argue.bizDate' />,// 业务日期
            dataIndex: 'activityDate',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.generation-date'/>,// 生成日期
            dataIndex: 'generateDate',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee'/>,// 费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Small-class-fee'/>,// 费用小类
            dataIndex: 'feeType',
            dataType: feeCategory,
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.trade-channel'/>,// Trade Lane
            dataIndex: 'tradeLaneCode',
            align:'left',
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.port' />,// 港口
            dataIndex: 'portCode',
            align:'left',
            width: 45
        },
        {
            title: <FormattedMessage id='lbl.SVVD' />,// SVVD
            dataIndex: 'svvdId',
            align:'left',
            width: 50
        },
        {
            title: <FormattedMessage id='lbl.office' />,// Office
            dataIndex: 'officeCode',
            align:'left',
            width: 50
        },
        {
            title: <FormattedMessage id='lbl.profit-center' />,// 利润中心
            dataIndex: 'profitCenterCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount' />,// 协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            align:'right',
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Whether-the-price-includes-tax'/>,// 是否含税价
            dataIndex: 'vatFlag',
            dataType: priceIncludingTax.values,
            align:'left',
            width: 90
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference'/>,// 协议币税金(参考)
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference'/>,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets'/>,// 应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'paymentAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.AP-outlets'/>,// 应付网点
            dataIndex: 'customerSAPId',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Standard-currency'/>,// 本位币种
            dataIndex: 'agencyCurrency',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Amount-in-base-currency'/>,// 本位币金额
            dataIndex: 'agencyCurrencyAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency' />,// 本位币调整金额
            dataIndex: 'agencyCurrencyReviseAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-in-local-currency'/>,// 本位币税金(参考)
            dataIndex: 'vatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency'/>,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'cleaningCurrencyCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency'/>,// 结算币金额
            dataIndex: 'cleaningAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataIndex: 'reviseCleaningAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency'/>,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id= 'lbl.within-boundary'/>,// 是否边界内
            dataIndex: 'exFlag',
            dataType: withinBoundary.values,
            align:'left',
            width: 90
        },
    ]
    {/* 明细列表-汇总 */}
    const detailColumns=[
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataIndex: 'rateSumAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount' />,// 协议币调整金额
            dataIndex: 'rateSumReviseAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference' />,// 协议币税金(参考)
            dataIndex: 'sumVatAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference'/>,// 协议币调整税金(参考)
            dataIndex: 'sumVatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets'/>,// 应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'sumPaymentAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Standard-currency'/>,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            align:'left',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Amount-in-base-currency'/>,// 本位币金额
            dataIndex: 'agencySumAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency' />,// 本位币调整金额
            dataIndex: 'agencySumReviseAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-in-local-currency'/>,// 本位币税金(参考)
            dataIndex: 'sumVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency'/>,// 本位币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,// 结算币金额
            dataIndex: 'clearingSumAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'clearingSumReviseAmount',
            dataType: 'dataAmount',
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'sumVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency'/>,// 结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
    ]
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.ygListCode && !queryData.tmpYgListCode && !queryData.checkDate && !queryData.generateDate && !queryData.svvd){
            setBackFlag(false);
            Toast('',intl.formatMessage({id:'lbl.sheet-criteria'}), 'alert-error', 5000, false)
            return;
        }
        setBackFlag(true);
        setSpinflag(true);
        const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_SHEET_QUERY_DOWNLOAD,{
            method:"POST",
            data:{
                page: {
                    pageSize: 0,
                    current: 0
                },
                params: {
                    ...queryData,
                    "searchStatus": "N"  ,
                    checkDateFrom: queryData.checkDate?momentFormat(queryData.checkDate[0]):null,
                    checkDateTo: queryData.checkDate?momentFormat(queryData.checkDate[1]):null,
                    generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                    generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.comm.er.est-sheet'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}), 
                        companyCode: intl.formatMessage({id: "lbl.company"}),       
                        ygListCode: intl.formatMessage({id: "lbl.Estimated-order-number"}),    
                        tmpYgListCode: intl.formatMessage({id: "lbl.Temporary.estimated-order-number"}),   
                        verifyStatus: intl.formatMessage({id: "lbl.Estimated-single-state"}),   
                        generateUser: intl.formatMessage({id: "lbl.Generation-personnel"}),   
                        generateDate: intl.formatMessage({id: "lbl.generation-date"}),   
                        checkUser: intl.formatMessage({id: "lbl.confirmation-personnel"}),   
                        checkDate: intl.formatMessage({id: "lbl.confirmation-date"}),   
                        pkgFlag: intl.formatMessage({id: "lbl.generate-package"}),   
                        pkgProcessId: intl.formatMessage({id: "lbl.Generating-packets"}),   
                    },
                    sumCol: {}, //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.comm.er.est-sheet'}),//sheet名称
                }],
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        if(result.size<=0){  //若无数据，则不下载
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false);
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.comm.er.est-sheet'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.comm.er.est-sheet'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    {/* 查询 */}
    const pageChange = async (pagination,search) => {
        let queryData = queryForm.getFieldValue();
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        if(!queryData.agencyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.ygListCode && !queryData.tmpYgListCode && !queryData.checkDate && !queryData.generateDate && !queryData.svvd){setBackFlag(false)}else{setBackFlag(true)}
        if(!queryData.ygListCode && !queryData.tmpYgListCode && !queryData.checkDate && !queryData.generateDate && !queryData.svvd){
            Toast('',intl.formatMessage({id:'lbl.sheet-criteria'}), 'alert-error', 5000, false) 
            setSpinflag(false);
        }else{
            setSpinflag(true);
            const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_IN_PROCESS_BILL,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        // ...queryData,
                        soCompanyCode: queryData.soCompanyCode,
                        agencyCode: queryData.agencyCode,
                        feeClass: queryData.feeClass,
                        ygListCode: queryData.ygListCode,
                        tmpYgListCode: queryData.tmpYgListCode,
                        svvd: queryData.svvd,
                        packageFlag: queryData.packageFlag,
                        verifyStatus: queryData.verifyStatus,
                        portCode: queryData.portCode,
                        "searchStatus": "N"  ,
                        checkDateFrom: queryData.checkDate?momentFormat(queryData.checkDate[0]):null,
                        checkDateTo: queryData.checkDate?momentFormat(queryData.checkDate[1]):null,
                        generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                        generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                    },
                    operateType:"AFCM-AG-ER-005"
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                if(datas!=null){
                    datas.map((v,i)=>{
                        v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                        v.checkDate ? v["checkDate"] = v.checkDate.substring(0, 10) : null;
                        v.pkgProcessId ? v.pkgProcessId : v.pkgProcessId = '0' 
                    })
                }
                setPage({...pagination})
                setTabTotal(data.totalCount)
                setTableData([...datas])
            }else {
                setSpinflag(false);
                setTableData([])
                Toast('',result.errorMessage, 'alert-error', 5000, false)
            }
        }
    }
    {/* 重置 */}
    const clearBtn = ()=> {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setBackFlag(true);
        setBackFlag1(true)
        setTableData([]);
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }
    {/* 关闭弹窗 */}
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisible(false)
    }
    {/* 双击获取明细弹窗 */}
    const doubleClickRow = async(parameter) => {
        Toast('', '', '', 5000, false);
        page1.current=1
        page1.pageSize=10
        setSpinflag(true);
        setUuid(parameter.ygListUuid)
        setHeaderTitle(parameter.ygListCode);   // 头标题
        const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_IN_PROCESS_BILL_DTL,{
            method:"POST",
            data:{
                page:{
                    pageSize: page.pageSize,
                    current: page.current,
                },
                uuid: parameter.ygListUuid,
            }
        })
        if(result.success) {
            setIsModalVisible(true);
            setSpinflag(false);
            Toast('', result.message, 'alert-success', 5000, false)
            let data = result.data;
            let agencyYg = data.agencyYg
            let agencyYgDetailList = data.agencyYgDetailList;
            let summaryList = data.summaryList;
            if(summaryList!=null){
                summaryList.map((v,i)=>{
                    v.Uuid=i
                })
            }
            if(agencyYgDetailList!=null){
                agencyYgDetailList.map((v,i)=>{
                    v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                    v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                })
            }
            if(receiptStatus.values!=null){
                receiptStatus.values.map((v, i) => {
                    agencyYg.verifyStatus == v.value ? agencyYg.verifyStatus = v.label : null;
                })
            }
            queryForm.setFieldsValue({          // 明细-头部信息
                popData: {
                    companyCode: agencyYg.companyCode,
                    verifyStatus: agencyYg.verifyStatus,
                    generateUser: agencyYg.generateUser,
                    generateDate: agencyYg.generateDate ? agencyYg.generateDate.substring(0, 10) : null,
                    tmpYgListCode: agencyYg.tmpYgListCode,
                    pkgProcessId: agencyYg.pkgProcessId ? agencyYg.pkgProcessId : agencyYg.pkgProcessId='0',
                    checkUser: agencyYg.checkUser,
                    checkDate: agencyYg.checkDate ? agencyYg.checkDate.substring(0, 10) : null,
                    recordUpdateUser: agencyYg.recordUpdateUser,
                    recordUpdateDate: agencyYg.recordUpdateDate ? agencyYg.recordUpdateDate.substring(0, 10) : null,
                }
            })
            setTabDetailTotal(data.totalCount)
            setDetailData(agencyYgDetailList);  // 明细-列表信息
            setDetailDatas(summaryList);        // 明细-列表信息汇总
        }else{
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 分页查询 */}
    const searchPage = async(pagination)=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        if(pagination.pageSize!=page1.pageSize){
            pagination.current=1
        }
        const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_IN_PROCESS_BILL_DTL,{
            method:"POST",
            data:{
                page: pagination,
                uuid: uuid,
            }
        })
        if(result.success) {
            setSpinflag(false);
            let data = result.data;
            let agencyYgDetailList = data.agencyYgDetailList;
            let summaryList = data.summaryList;
            if(agencyYgDetailList!=null){
                agencyYgDetailList.map((v,i)=>{
                    v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                    v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                })
            }
            setPage1({...pagination})
            setTabDetailTotal(data.totalCount)
            setDetailData(agencyYgDetailList); 
            setDetailDatas(summaryList);  
        }else{
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 明细弹窗信息-下载 */}
    const downloadDel = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_SHEET_DOWNLOAD,{
            method:"POST",
            data:{
                page: {
                    pageSize: 0,
                    current: 0
                },
                uuid: uuid,
                excelFileName: intl.formatMessage({id: 'menu.afcm.comm.er.est-sheet'}), //文件名
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            companyCode: intl.formatMessage({id: "lbl.company"}),
                            verifyStatus: intl.formatMessage({id: "lbl.Estimated-single-state"}),
                            generateUser: intl.formatMessage({id: "lbl.Generation-personnel"}),
                            generateDate: intl.formatMessage({id: "lbl.generation-date"}),
                            tmpYgListCode: intl.formatMessage({id: "lbl.Temporary.estimated-order-number"}),
                            pkgProcessId: intl.formatMessage({id: "lbl.Generating-packets"}),
                            checkUser: intl.formatMessage({id: "lbl.confirmation-personnel"}),
                            checkDate: intl.formatMessage({id: "lbl.confirmation-date"}),
                            recordUpdateUser: intl.formatMessage({id: "lbl.update-people"}),
                            recordUpdateDate: intl.formatMessage({id: "lbl.update-date"}),
                        },
                        sumCol: {}, //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Head-info'}),//头信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            ygListCode: intl.formatMessage({id: "lbl.Estimated-order-number"}),
                            listVerifyStatus: intl.formatMessage({id: "lbl.state"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            generateDate: intl.formatMessage({id: "lbl.generation-date"}),
                            feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                            tradeLaneCode: intl.formatMessage({id: "lbl.trade-channel"}),
                            portCode: intl.formatMessage({id: "lbl.port"}),
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                            officeCode: intl.formatMessage({id: "lbl.office"}),
                            profitCenterCode: intl.formatMessage({id: "lbl.profit-center"}),
                            rateCurrency: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            vatFlag: intl.formatMessage({id: "lbl.Whether-the-price-includes-tax"}),
                            vatAmt: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),
                            vatReviseAmt: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),
                            paymentAmount: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),
                            customerSAPId: intl.formatMessage({id: "lbl.AP-outlets"}),
                            agencyCurrency: intl.formatMessage({id: "lbl.Standard-currency"}),
                            agencyCurrencyAmount: intl.formatMessage({id: "lbl.Amount-in-base-currency"}),
                            agencyCurrencyReviseAmount: intl.formatMessage({id: "lbl.Adjustment-amount-in-base-currency"}),
                            vatAmtInAgency: intl.formatMessage({id: "lbl.Tax-in-local-currency"}),
                            reviseVatAmtInAgency: intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}),
                            cleaningCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            cleaningAmount: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                            reviseCleaningAmount: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                            vatAmtInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),
                            reviseVatAmtInClearing: intl.formatMessage({id: "lbl.tax-adjustment-in-settlement-currency"}),
                            exFlag: intl.formatMessage({id: "lbl.within-boundary"}),
                        },
                        sumCol: {}, //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Sheet-detail-info'}),//预估单详细信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            // listVerifyStatus: intl.formatMessage({id: "lbl.state"}),
                            rateCurrency: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            rateSumAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            rateSumReviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            sumVatAmt: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),
                            sumVatReviseAmt: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),
                            sumPaymentAmount: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),
                            agencyCurrencyCode: intl.formatMessage({id: "lbl.Standard-currency"}),
                            agencySumAmount: intl.formatMessage({id: "lbl.Amount-in-base-currency"}),
                            agencySumReviseAmount: intl.formatMessage({id: "lbl.Adjustment-amount-in-base-currency"}),
                            sumVatAmtInAgency: intl.formatMessage({id: "lbl.Tax-in-local-currency"}),
                            sumReviseVatAmtInAgency: intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            clearingSumAmount: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                            clearingSumReviseAmount: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                            sumVatAmtInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),
                            sumReviseVatAmtInClearing: intl.formatMessage({id: "lbl.tax-adjustment-in-settlement-currency"}),
                        },
                        sumCol: {}, //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Total-info'}),//汇总信息
                    }
                ],
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        if(result.size<=0){  //若无数据，则不下载
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false);
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.comm.er.est-sheet'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = headerTitle + intl.formatMessage({id: 'lbl.Sheet-del-info'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }


    return (
        <div className='parent-box'>
            <div className='header-from'>
                <Form 
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery}
                >
                    <Row>
                        {/* 船东 */}
                        <Select name='soCompanyCode' disabled={company.companyType == 0 ? true : false}  label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} span={6} formlayouts={formlayouts}/>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={backFlag1} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <Select showSearch={true} style={{background: backFlag1 ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                        }
                        {/* <Select name='agencyCode' showSearch={true} label={<FormattedMessage id='lbl.agency'/>} span={6}  options={agencyCode} />   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={feeClass} formlayouts={formlayouts}/> 
                        {/* 预估单号码 */}
                        <InputText name='ygListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Estimated-order-number'/>} span={6}  formlayouts={formlayouts}/>  
                        {/* 临时预估单号码 */}
                        <InputText name='tmpYgListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Temporary.estimated-order-number'/>} span={6} formlayouts={formlayouts}/>  
                        {/* 确认日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} style={{background:backFlag?'white':'yellow'}}  name='checkDate' label={<FormattedMessage id="lbl.confirmation-date" />} formlayouts={formlayouts}/>
                        {/* 生成日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} style={{background:backFlag?'white':'yellow'}}  name='generateDate' label={<FormattedMessage id='lbl.generation-date'/>} formlayouts={formlayouts}/>
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>}  span={6} formlayouts={formlayouts} />  
                        {/* 是否生成数据包 */}
                        <Select name='packageFlag' flag={true} label={<FormattedMessage id='lbl.generate-package'/>}  span={6}  options={packageData.values} formlayouts={formlayouts}/>
                        {/* 预估单状态 */}
                        <Select name='verifyStatus' flag={true} label={<FormattedMessage id='lbl.Estimated-single-state'/>}  span={6}  options={receiptStatus.values} formlayouts={formlayouts}/>
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6}  formlayouts={formlayouts}/>  

                       </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downloadBtn}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className='button-right'>
                    {/* 重置按钮 */}
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=> pageChange(page,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='ygListUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
					rowSelection={null}
                    selectWithClickRow={true}
                    handleDoubleClickRow={doubleClickRow}
                />
            </div>
            {/* 预估单明细弹窗 */}
            {/* <Modal title={headerTitle + intl.formatMessage({id:'lbl.Estimate-sheet-details'})} visible={isModalVisible} footer={null} width="80%" height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={1100} cbsVisible={isModalVisible} cbsTitle={headerTitle + intl.formatMessage({id:'lbl.Estimate-sheet-details'})} cbsFun={() => handleCancel()}>
                <div className='header-from'>
                    <Form 
                        form={queryForm}
                        name='func'
                        onFinish={handleQuery}
                    >
                        <Row>
                            {/* 公司 */}
                            <InputText disabled name={['popData','companyCode']} label={<FormattedMessage id='lbl.company'/>} span={6} isSpan={true}/>  
                            {/* 预估单状态 */}
                            <InputText disabled name={['popData','verifyStatus']} label={<FormattedMessage id='lbl.Estimated-single-state'/>} span={6} isSpan={true}/>  
                            {/* 生成人员 */}
                            <InputText disabled name={['popData','generateUser']} label={<FormattedMessage id='lbl.Generation-personnel'/>} span={6} isSpan={true}/>  
                            {/* 生成日期 */}
                            <InputText disabled name={['popData','generateDate']} label={<FormattedMessage id="lbl.generation-date"/>} span={6} isSpan={true}/>  
                            {/* 临时预估单号码 */}
                            <InputText disabled name={['popData','tmpYgListCode']} label={<FormattedMessage id='lbl.Temporary.estimated-order-number'/>} span={6} isSpan={true}/>  
                            {/* 生成数据包的批次 */}
                            <InputText disabled name={['popData','pkgProcessId']} label={<FormattedMessage id='lbl.Generating-packets'/>} span={6} isSpan={true}/>  
                            {/* 确认人员 */}
                            <InputText disabled name={['popData','checkUser']} label={<FormattedMessage id='lbl.confirmation-personnel'/>} span={6} isSpan={true}/>  
                            {/* 确认日期 */}
                            <InputText disabled name={['popData','checkDate']} label={<FormattedMessage id="lbl.confirmation-date"/>} span={6} isSpan={true}/>  
                            {/* 更新人员 */}
                            <InputText disabled name={['popData','recordUpdateUser']} label={<FormattedMessage id='lbl.update-people'/>} span={6} isSpan={true}/>  
                            {/* 更新日期 */}
                            <InputText disabled name={['popData','recordUpdateDate']} label={<FormattedMessage id='lbl.update-date'/>} span={6} isSpan={true}/>  
                        </Row>
                    </Form>
                </div>
                <div className='footer-table' style={{marginTop:'5px'}}>
                    {/* 表格 */}
                    <PaginationTable
                        dataSource={detailData}
                        columns={detailColumn}
                        rowKey='id'
                        pageChange={searchPage}
                        pageSize={page1.pageSize}
                        current={page1.current}
                        scrollHeightMinus={200}
                        total={tabDetailTotal}
                        rowSelection={null}
                    />
                </div>
                <div className='footer-table' style={{marginTop:'10px'}}>
                    <PaginationTable
                        dataSource={detailDatas}
                        columns={detailColumns} 
                        rowKey="Uuid"
                        pagination={false}
                        rowSelection={null}
                        scrollHeightMinus={200}
                    />
                </div>
                <div className="add-save-button" >
                    {/* 打印 */}
                    <Button><PrinterOutlined  /><FormattedMessage id='lbl.Printing' /></Button>
                    {/* 下载 */}
                    <Button onClick={downloadDel}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></Button>
                    {/* 关闭 */}
                    <Button onClick={handleCancel} ><CloseOutlined  /><FormattedMessage id='lbl.close' /></Button>
                </div>
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default estimateSheetQuery