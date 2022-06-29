{/* 查询结转实付费用 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage, useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData,costCategories, momentFormat, agencyCodeData, TradeData, acquireSelectDataExtend,} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import {Toast} from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading';

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const queryPayExpenses =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData,setTableData] = useState([]);  // table 数据
    const [tableDatas,setTableDatas] = useState([]);  // table 数据-汇总
    const [tabTabTotal,setTabTotal ] = useState([]);    // table条数
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用小类
    const [feeCategory,setFeeCategory] = useState ([])
    const [tradeZoneCode,setTradeZoneCodeData] = useState ({}) //贸易区
    const [tradeCode,setTradeCode] = useState ([]) //Trade
    const [tradeLine, setTradeLine] = useState([]);  //贸易线
    const [vesselProperty, setVesselProperty] = useState({}); //船舶属性
    const [bargeType, setBargeType] = useState({}); //船舶类型
    const [verifyFeeStatus, setVerifyStatus] = useState({}); //费用状态
    const [billState, setVerifyBillState] = useState({}); //报账单状态
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [checkStatus,setCheckStatus] = useState({});//退回标志位
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [page,setPage]=useState({
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
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AFCM.TRADE.ZONE', setTradeZoneCodeData, $apiUrl);// 贸易区
        acquireSelectData('AFCM.BARGE.TYPE', setBargeType, $apiUrl);// 船舶类型
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大小类联动
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        acquireSelectData('AFCM.CR.VERIFY.STATUS', setVerifyStatus, $apiUrl);// 费用状态  
        // acquireSelectData('AFCM.ER.RECEIPT.STATUS', setCostStatus, $apiUrl);// 费用状态
        acquireSelectData('VESSELTYPE',setVesselProperty,$apiUrl);//船舶属性
        acquireSelectData('AG.OFFCR.VERIFYSTATUS',  setVerifyBillState,  $apiUrl);   // 报账单状态
        acquireSelectData('CR.CHECK.STATUS',setCheckStatus,$apiUrl);//退回标志
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
    },[])
    useEffect(()=>{
        felList()
    },[feeClass])
   
    {/* 表格的下拉框onchange事件 */}
    const getCommonSelectVal = (e,record,name) =>{
        record[name]=e
        if(record.key==null){
            setFeeType([])
        }
        if(feeClass!=null){
            feeClass.map((v,i)=>{
                if(e==v.feeCode){
                    let list=v.listAgTypeToClass
                    list.map((v,i)=>{
                        v['value']=v.feeCode
                        v['label']=v.feeName+'(' + v.feeCode +')';
                    })
                    if(v.listAgTypeToClass.length==list.length){
                        setFeeType('')
                        setFeeType(list)
                    }  
                }else{
                    queryForm.setFieldsValue({
                        feeType: null,
                    })
                }
            }) 
        }  
   }
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
   {/* 贸易区 */}
   const companyIncident = async(value)=>{
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        queryForm.setFieldsValue({
            tradeCode: null,
            tradeLaneCode: null
        })
        TradeData($apiUrl, value, setTradeCode);
    }
    {/* trade */}
    const trades = async(value) =>{
        queryForm.setFieldsValue({
            'tradeLaneCode':'',
        })
        queryForm.setFieldsValue({
            'tradeCode':value
        })
        if(tradeCode!=null){
            tradeCode.map((v,i)=>{
                if(v.value == value){
                    let data = v.oTradeLanes
                    data.map((v,i)=>{
                        v['value'] = v.tradeLaneCode
                        v['label'] = v.tradeLaneCode
                    })
                    setTradeLine(data)
                }
            })
        }
    }
    {/* 列表 */}
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.generation-date'/>,// 生成日期
            dataIndex: 'generateDate',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Cost-status' />,// 费用状态
            dataIndex: 'verifyStatus',
            dataType: verifyFeeStatus.values,
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Estimated-order-number'/>,// 预估单号码
            dataIndex: 'ygListCode',
            align:'left',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Invoice-number'/>,// 发票号码
            dataIndex: 'yfListCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Reimbursement-number'/>,// 报账单号码
            dataIndex: 'sfListCode',
            align:'left',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Small-class-fee' />,//费用小类
            dataIndex: 'feeType',
            dataType: feeCategory,
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.port' />,// 港口
            dataIndex: 'portCode',
            align:'left',
            sorter: false,
            width: 45,
        },
        {
            title: <FormattedMessage id='lbl.version-number' />,// 版本号
            dataIndex: 'versionNum',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Trade-line' />,// 贸易线
            dataIndex: 'tradeLaneCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.ht.statement.upload-vessel-name'/>,// 船名
            dataIndex: 'vslName',
            align:'left',
            sorter: false,
            width: 45,
        },
        {
            title: <FormattedMessage id='lbl.voyage-number'/>,// 航次
            dataIndex: 'voyageNumber',
            align:'left',
            sorter: false,
            width: 45,
        },
        {
            title: <FormattedMessage id='lbl.Ship-code'/>,// 船舶代码
            dataIndex: 'vesselCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.profit-center'/>,// 利润中心
            dataIndex: 'profitCenterCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.office' />,// Office
            dataIndex: 'officeCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount' />,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id= 'lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id= 'lbl.Whether-the-price-includes-tax'/>,// 是否含税价
            dataIndex: 'vatFlag',
            dataType: priceIncludingTax.values,
            align:'left',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference'/>,// 协议币税金(参考)
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference' />,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets' />,// 应付网点金额
            dataIndex: 'paymentAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.AP-outlets' />,// 应付网点
            dataIndex: 'customerSapId',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.Agency-net-income'/>,// 代理净收入
            dataIndex: 'recAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.submitanexpenseaccount'/>,// 向谁报账
            dataIndex: 'sfSide',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id=  'lbl.Standard-currency'/>,//本位币种
            dataIndex: 'agencyCurrency',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.Amount-in-base-currency' />,// 本位币金额
            dataIndex: 'agencyCurrencyAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id=  'lbl.Adjustment-amount-in-base-currency'/>,// 本位币调整金额
            dataIndex: 'agencyCurrencyReviseAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id= 'lbl.Tax-in-local-currency'/>,// 本位币税金(参考)
            dataIndex: 'vatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency' />,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id= 'lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'cleaningCurrencyCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id=  'lbl.amount-of-settlement-currency' />,// 结算币金额
            dataIndex: 'cleaningAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id= 'lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataIndex: 'reviseCleaningAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id= 'lbl.tax-adjustment-in-settlement-currency'/>,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id='lbl.within-boundary'/>,// 是否边界内
            dataIndex: 'exFlag',
            dataType: withinBoundary.values,
            align:'left',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Ship-type'/>,// 船舶类型
            dataIndex: 'bargeType',
            dataType: bargeType.values,
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Ship-property'/>,// 船舶属性
            dataIndex: 'vesselProperty',
            dataType: vesselProperty.values,
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Return-flag'/>,// 退回标志位
            dataType:checkStatus.values,
            dataIndex: 'checkStatus',
            align:'left',
            sorter: false,
            width: 90,
        },
    ]
    const columnsdata = [
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency' />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,//结算币金额
            dataIndex: 'clearingSumAmount',
            dataType: 'dataAmount',
            align:'right', 
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency' />,//结算币调整金额
            dataIndex: 'clearingSumReviseAmount',
            dataType: 'dataAmount',
            align:'right', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency'/>,//结算币税金(参考)
            dataIndex: 'sumVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency'/>,//结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right', 
            sorter: false,
            width: 140,
        },
    ]
    {/* 查询 */}
    const pageChange= async (pagination,search,searchType) => {
        let queryData = queryForm.getFieldValue();
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        if(!queryData.sfListCode && !queryData.activeDate && !queryData.svvd && !queryData.serviceLoopCode && 
            !queryData.generateDate && !queryData.ygListCode){
            Toast('',intl.formatMessage({id:'lbl.pay-expenses'}), 'alert-error', 5000, false)
            setSpinflag(false);
            setBackFlag(false);
        }else{
            setSpinflag(true);
            setBackFlag(true);
            const result = await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_SEARCH_BURSEMENT_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        ...queryData,
                        "searchStatus": "Y" ,
                        hasCondition: searchType,
                        activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                        generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                        generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                    },
                    operateType: "AFCM-AG-CR-003"
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                let sumList=result.data.sumList
                if(datas!=null){
                    datas.map((v,i)=>{
                        v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                        v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                    })
                }
                if(sumList!=null){
                    sumList.map((v,i)=>{
                        v.uid=i
                    })
                }
                setTabTotal(data.totalCount)
                setTableData([...datas])
                setTableDatas([...sumList])
                setPage({...pagination})
            }else {
                setTableData([])
                setTableDatas([])
                setSpinflag(false);
                Toast('',result.errorMessage, 'alert-error', 5000, false)
            }
        }
    }
    {/* 重置 */}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setBackFlag(true);
        setTableData([])
        setTableDatas([])
        setFeeType([]);
        setTradeCode([]);
        setTradeLine([]);
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.sfListCode && !queryData.activeDate && !queryData.svvd && !queryData.serviceLoopCode && 
            !queryData.generateDate && !queryData.ygListCode){
            Toast('',intl.formatMessage({id:'lbl.pay-expenses'}), 'alert-error', 5000, false)
            setBackFlag(false);
            return
        }
        setSpinflag(true);
        setBackFlag(true);
        const result = await request($apiUrl.AGENCY_FEE_GENERATE_CARRY_FWD_BILL_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    ...queryData,
                    "searchStatus": "Y" ,
                    activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                    generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryExpenses'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                        generateDate: intl.formatMessage({id: "lbl.generation-date"}),
                        verifyStatus: intl.formatMessage({id: "lbl.Cost-status"}),
                        ygListCode: intl.formatMessage({id: "lbl.Estimated-order-number"}),
                        yfListCode: intl.formatMessage({id: "lbl.Invoice-number"}),
                        sfListCode: intl.formatMessage({id: "lbl.Reimbursement-number"}),
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                        feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                        svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                        portCode: intl.formatMessage({id: "lbl.port"}),
                        versionNum: intl.formatMessage({id: "lbl.version-number"}),
                        tradeLaneCode: intl.formatMessage({id: "lbl.Trade-line"}),
                        vslName: intl.formatMessage({id: "lbl.ht.statement.upload-vessel-name"}),
                        voyageNumber: intl.formatMessage({id: "lbl.voyage-number"}),
                        vesselCode: intl.formatMessage({id: "lbl.Ship-code"}),
                        profitCenterCode: intl.formatMessage({id: "lbl.profit-center"}),
                        officeCode: intl.formatMessage({id: "lbl.office"}),
                        rateCurrency: intl.formatMessage({id: "lbl.Agreement-currency"}),
                        totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                        reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                        vatFlag: intl.formatMessage({id: "lbl.Whether-the-price-includes-tax"}),
                        vatAmt: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),
                        vatReviseAmt: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),
                        paymentAmount: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),
                        customerSapId: intl.formatMessage({id: "lbl.AP-outlets"}),
                        recAmt: intl.formatMessage({id: "lbl.Agency-net-income"}),
                        sfSide: intl.formatMessage({id: "lbl.submitanexpenseaccount"}),
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
                        bargeType: intl.formatMessage({id: "lbl.Ship-type"}),
                        vesselProperty: intl.formatMessage({id: "lbl.Ship-property"}),
                        checkStatus: intl.formatMessage({id: "lbl.Return-flag"}),
                    },
                    sumCol: {//汇总字段
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                        clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                        clearingSumAmount: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                        clearingSumReviseAmount: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                        sumVatAmtInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),
                        sumReviseVatAmtInClearing: intl.formatMessage({id: "lbl.tax-adjustment-in-settlement-currency"}),
                    }, 
                    sheetName: intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryExpenses'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryExpenses'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryExpenses'})+ '.xlsx'; // 下载后文件名
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
                        <Select span={6} name='soCompanyCode'  disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} formlayouts={formlayouts}/>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                        }
                        {/* <Select name='agencyCode' showSearch={true} label={<FormattedMessage id='lbl.agency'/>} span={6} options={agencyCode} /> */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} selectChange={getCommonSelectVal} options={feeClass} formlayouts={formlayouts}/> 
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={feeType} formlayouts={formlayouts}/>
                        {/* 业务日期 */}
                        <DoubleDatePicker style={{background:backFlag?'white':'yellow'}} flag={false} disabled={[false, false]} span={6} name='activeDate' label={<FormattedMessage id="lbl.argue.bizDate" />} span={6}  formlayouts={formlayouts}/>
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} name='generateDate'  flag={false} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} label={<FormattedMessage id="lbl.generation-date" />} span={6}  formlayouts={formlayouts}/>
                        {/* 贸易区 */}
                        <Select name='tradeZoneCode' flag={true} label={<FormattedMessage id='lbl.argue.trade-code'/>}  span={6}  options={tradeZoneCode.values} selectChange={companyIncident} formlayouts={formlayouts}/>
                        {/* Trade */}
                        <Select name='tradeCode' flag={true} label={<FormattedMessage id='lbl.Trade'/>}  span={6} options={tradeCode} selectChange={trades} formlayouts={formlayouts}/>
                        {/* 贸易线 */}
                        <Select name='tradeLaneCode' flag={true} label={<FormattedMessage id='lbl.Trade-line'/>}  span={6} options={tradeLine} span={6} formlayouts={formlayouts}/>
                        {/* 船舶属性 */}
                        <Select name='vesselProperty' flag={true} label={<FormattedMessage id='lbl.Ship-property'/>}  span={6} options={vesselProperty.values} span={6} formlayouts={formlayouts}/>
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.route'/>} span={6} formlayouts={formlayouts}/>
                        {/* 船舶代码 */}
                        <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code'/>} span={6} formlayouts={formlayouts}/>
                        {/* 航次 */}
                        <InputText name='voyageNumber' label={<FormattedMessage id='lbl.voyage-number'/>} span={6} formlayouts={formlayouts}/>
                        {/* 船舶类型 */}
                        <Select name='bargeType' flag={true} label={<FormattedMessage id='lbl.Ship-type'/>}  span={6}  options={bargeType.values} formlayouts={formlayouts}/>
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6} formlayouts={formlayouts}/>  
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6} formlayouts={formlayouts}/> 
                        {/* 费用状态 */}
                        <Select name='verifyStatus' flag={true} label={<FormattedMessage id='lbl.Cost-status'/>} span={6}  options={verifyFeeStatus.values} formlayouts={formlayouts}/>
                        {/* 是否边界内 */}
                        <Select name='exFlag' flag={true} label={<FormattedMessage id='lbl.within-boundary'/>} options={withinBoundary.values} span={6}  formlayouts={formlayouts}/>
                        {/* 报账单号码 */}
                        <InputText name='sfListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6} formlayouts={formlayouts}/> 
                        {/* 报账单状态 */}
                        <Select name='listVerifyStatus' flag={true} label={<FormattedMessage id='lbl.Reimbursement-status'/>} span={6}  options={billState.values} formlayouts={formlayouts}/>
                        {/* 预估单号码 */}
                        <InputText name='ygListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Estimated-order-number'/>} span={6} formlayouts={formlayouts}/> 
                        {/* Office */}
                        <InputText name='officeCode' label={<FormattedMessage id='lbl.office'/>}  span={6} formlayouts={formlayouts}/> 
                        {/* 发票号码 */}
                        <InputText name='yfListCode' label={<FormattedMessage id='lbl.Invoice-number'/>} span={6} formlayouts={formlayouts}/> 
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    <Button onClick={downloadBtn}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></Button>
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <Button onClick={clearBtn}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></Button>
                    {/* 无条件查询 */}
                    <Button onClick={()=> pageChange(page, 'search','N')}> <SearchOutlined /><FormattedMessage id='btn.unconditional-query' /></Button>
                    {/* 查询 */}
                    <Button onClick={()=> pageChange(page, 'search','Y')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='entryUuid'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    pageSize={page.pageSize}
                    current={page.current}
                    total={tabTabTotal}
					rowSelection={null}
                />
            </div>
            <div className='footer-table' style={{marginTop:'10px'}}>
            <div style={{width: '70%'}}>
                <PaginationTable
                    rowKey="uid"
                    columns={columnsdata} 
                    dataSource={tableDatas}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default queryPayExpenses