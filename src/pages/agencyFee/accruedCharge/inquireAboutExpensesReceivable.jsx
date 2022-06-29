import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import {acquireSelectDatas, acquireSelectData, costCategories, agencyCodeData, momentFormat, acquireSelectDataExtend, TradeData, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'


//---------------------------------------------- 查询应收费用-------------------------------------------------
// const { TabPane } = Tabs;
// const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}

let IEqueryType = ''
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([])
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//表格数据
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [tableDatas,setTableDatas] = useState([])//表格数据
    const [feeStatusData, setFeeStatusData] = useState({}); // 费用状态
    const [tradeZoneCodeData, setTradeZoneCodeData] = useState({}); // 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [exFlagData, setExFlagData] = useState({}); // 是否边界内
    const [costKey,setCostKey] = useState ([])//费用大类
    const [subclass,setSubclass] = useState ([])//费用小类
    const [subclassAll,setSubclassAll] = useState ([])//全部费用小类
    const [shipTypes, setShipTypes] = useState({});// 船舶类型
    const [vesselType,setVesselType] = useState({})//船舶属性
    const [vatFlag,setVatFlag] = useState({})//是否含税价
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [spinflag,setSpinflag] = useState(false)
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "feeClass": null,
        "feeType": null,
        "feeStatus": null,
        "companyCode":null,
        "tradeZoneCode": null,
        "tradeCode": null,
        "tradeLaneCode": null,
        "vesselType": null,
        "serviceLoopCode": null,
        "vesselCode":null,
        "voyNum": null,
        "bargeType": null,
        "svvd": null,
        "portCode": null,
        "arReceiptCode": null,
        "exFlag":null,
        "erReceiptCode": null,
        "officeCode": null,
        'activeDateFrom':null,
        'activeDateTo':null,
        'generateDateFrom':null,
        'generateDateTo':null,
    });
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...query
        })
        console.log(query)
    }

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
            // soCompanyCode: company.companyType == 0 ? company.companyCode : defVal.shipownerCompanyCode
        })
    }, [company, acquireData])
    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDatas('AFCM.ER.RECEIPT.STATUS', setFeeStatusData, $apiUrl);// 费用状态
        acquireSelectData('AFCM.TRADE.ZONE', setTradeZoneCodeData, $apiUrl);// 贸易区
        acquireSelectDatas('AFCM.BOUNDARY.FLAG', setExFlagData, $apiUrl);// 是否边界内
        acquireSelectDatas('AFCM.BARGE.TYPE',setShipTypes ,$apiUrl);// 船舶类型
        acquireSelectDatas('VESSELTYPE',setVesselType,$apiUrl);//船舶属性
        acquireSelectDatas('AGMT.VAT.FLAG',setVatFlag,$apiUrl);//是否含税价
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY','CB0068',setAcquireData, $apiUrl);// 船东
       
    },[])
    useEffect(()=>{
        com()
    },[costKey,agencyCode])

    const com = ()=>{
        let listAgTypeToClassall = costKey.map((v,i)=>{
            return v.listAgTypeToClass
        })
        let listAgTypeToClass = listAgTypeToClassall.reduce((pre,cur)=>{
            return pre.concat(cur)
        },[])
        listAgTypeToClass.map((v,i)=>{
            v['value']=v.feeCode
            v['label']=v.feeName+'(' + v.feeCode +')';
        })
        setSubclassAll(listAgTypeToClass)
    }

    // 费用大类和费用小类联动
    const selectChangeBtn = () =>{
        costKey.map((v,i)=>{
            if(queryForm.getFieldsValue().feeClass==v.feeCode){
                let list=v.listAgTypeToClass
                    list.map((v,i)=>{
                        v['value']=v.feeCode
                        v['label']=v.feeName+'(' + v.feeCode +')';
                    })
                    if(v.listAgTypeToClass.length==list.length){
                        setSubclass('')
                        setSubclass(list)
                    }
                }
        })
    }
   
    const companyIncident = async(value)=>{
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        queryForm.setFieldsValue({
            tradeCode: null,
            tradeLaneCode: null
        })
        TradeData($apiUrl, value, setTradeCode);
    }
    const trades = async(value) =>{
        queryForm.setFieldsValue({
            'tradeLaneCode':'',
        })
        queryForm.setFieldsValue({
            'tradeCode':value
        })
        console.log(tradeCode)
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

    //查询应收费用表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width:120 ,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            // dataType: 'dateTime',
            dataIndex: 'generateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.Estimated-order-number" />,//预估单号码
            dataIndex: 'ygListCode',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Invoice-number" />,//发票号码
            dataIndex:'yfListCode',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Cost-status" />,//费用状态
            dataType:feeStatusData.values,
            dataIndex: 'verifyStatus',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclassAll,
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvd',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.ht.statement.upload-vessel-name" />,//船名
            dataIndex: 'vslName',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.version-number" />,//版本号 
            dataIndex: 'versionNum',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.voyage-number" />,//航次 
            dataIndex: 'voyNum',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-code" />,//船舶代码 
            dataIndex: 'vesselCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线 
            dataIndex: 'tradeLaneCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.office" />,//office 
            dataIndex: 'officeCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.profit-center" />,//利润中心 
            dataIndex: 'profitCenterCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种 
            dataIndex: 'rateCurrency',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额 
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额 
            dataIndex: 'reviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,//是否含税价 
            dataType:vatFlag.values,
            dataIndex: 'vatFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,//协议币税金(参考) 
            dataIndex: 'vatAmt',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,//协议币调整税金(参考) 
            dataIndex: 'vatReviseAmt',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,//应付网点金额 
            dataIndex: 'paymentAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.AP-outlets" />,//应付网点 
            dataIndex: 'customerSAPId',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Agency-net-income" />,//代理净收入 
            dataIndex: 'recAmount',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票 
            dataIndex: 'yfSide',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Standard-currency" />,//本位币种 
            dataIndex: 'agencyCurrency',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额 
            dataIndex: 'agencyCurrencyAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,//本位币调整金额 
            dataIndex: 'agencyCurrencyReviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,//本位币税金(参考) 
            dataIndex: 'vatAmtInAgency',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,//本位币调整税金(参考) 
            dataIndex: 'reviseVatAmtInAgency',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种 
            dataIndex: 'cleaningCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额 
            dataIndex: 'cleaningAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额 
            dataIndex: 'reviseCleaningAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,//结算币税金(参考) 
            dataIndex: 'vatAmtInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.within-boundary" />,//是否边界内 
            dataType:exFlagData.values,
            dataIndex: 'exFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-type" />,//船舶类型 
            dataType:shipTypes.values,
            dataIndex: 'bargeType',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-property" />,//船舶属性 
            dataType:vesselType.values,
            dataIndex: 'vesselProperty',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        }
    ]


    const columnss= [
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'clearingSumAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text)
            }
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumReviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE',
        },
        {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,//结算币税金(参考)
            dataIndex: 'sumVatAmtInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE'
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('','', '', 5000, false)
        console.log(query)
        const query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        setTableData([])
        setTableDatas([])
        if(!query.yfListCode&&!query.activeDate&&!query.generateDate&&!query.svvd&&!query.erReceiptCode&&!query.serviceLoopCode){
            // 发票号码/抵离港时间(业务时间?)/SVVD/生成时间/航线/预估单号必须输入一个且时间间隔不能超过92
            setBackFlag(false)
            Toast('', formatMessage({id: 'lbl.yfList-date-must-enter'}), 'alert-error', 5000, false)
        }else{
            let dates = query.generateDate ? Math.abs((query.generateDate[0] - query.generateDate[1]))/(1000*60*60*24) : null
            if(dates>92){
                setBackFlag(false)
                Toast('',formatMessage({id: 'lbl.generateDate-Interval-cannot-exceed'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_AR_SEARCH_AR_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params": {
                            'soCompanyCode': query.soCompanyCode,
                            "agencyCode": query.agencyCode,
                            "feeClass": query.feeClass,
                            "feeType": query.feeType,
                            "feeStatus": query.feeStatus,
                            "companyCode":query.companyCode,
                            "tradeZoneCode": query.tradeZoneCode,
                            "tradeCode": query.tradeCode,
                            "tradeLaneCode": query.tradeLaneCode,
                            "vesselType": query.vesselType,
                            "serviceLoopCode": query.serviceLoopCode,
                            "vesselCode":query.vesselCode,
                            "voyNum": query.voyNum,
                            "bargeType": query.bargeType,
                            "svvd": query.svvd,
                            "portCode": query.portCode,
                            "yfListCode": query.yfListCode,
                            "exFlag":query.exFlag,
                            "erReceiptCode": query.erReceiptCode,
                            "officeCode": query.officeCode,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                            'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                            'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                            'hasCondition': IEqueryType=='unconditional'? "N" :undefined
                        },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    setSpinflag(false)
                    let data = localsearch.data
                    let datas = localsearch.data ? localsearch.data.resultList : ''
                    let datass = localsearch.data ? localsearch.data.summaryList : ''
                    data ? setTabTotal(data.totalCount) : null
                    datas ? setTableData([...datas]) : null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    datass ? setTableDatas([...datass]) : null
                    
                }else{
                    setSpinflag(false)
                    setTableData([])
                    setTableDatas([])
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
                }
            }
        }
    }

    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        let tddata = {}
        columns.map((v, i) => {
            tddata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        let crdata = {}
        columnss.map((v, i) => {
            crdata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        setSpinflag(true)
        let downData = await request($apiUrl.AG_FEE_AR_EXP_AR_LIST,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    "agencyCode": query.agencyCode,
                    "feeClass": query.feeClass,
                    "feeType": query.feeType,
                    "feeStatus": query.feeStatus,
                    "companyCode":query.companyCode,
                    "tradeZoneCode": query.tradeZoneCode,
                    "tradeCode": query.tradeCode,
                    "tradeLaneCode": query.tradeLaneCode,
                    "vesselType": query.vesselType,
                    "serviceLoopCode": query.serviceLoopCode,
                    "vesselCode":query.vesselCode,
                    "voyNum": query.voyNum,
                    "bargeType": query.bargeType,
                    "svvd": query.svvd,
                    "portCode": query.portCode,
                    "yfListCode": query.yfListCode,
                    "exFlag":query.exFlag,
                    "erReceiptCode": query.erReceiptCode,
                    "officeCode": query.officeCode,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    'hasCondition': IEqueryType=='unconditional'? "N" :undefined
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.acc-chrg.inq-but-ex-rec'}),
                sheetList: [{//sheetList列表
                    // dataCol: {//列表字段
                    //     agencyCode: formatMessage({id:"lbl.agency" }),
                    //     activityDate: formatMessage({id:"lbl.argue.bizDate" }),
                    //     generateDate: formatMessage({id:"lbl.generation-date" }),
                    //     ygListCode: formatMessage({id:"lbl.Estimated-order-number" }),
                    //     yfListCode: formatMessage({id:"lbl.Invoice-number" }),
                    //     verifyStatus: formatMessage({id:"lbl.Cost-status" }),
                    //     feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                    //     feeType: formatMessage({id:"lbl.Small-class-fee" }),
                    //     svvdId: formatMessage({id:"lbl.SVVD" }),
                    //     portCode: formatMessage({id:"lbl.port" }),
                    //     vslName: formatMessage({id:"lbl.ht.statement.upload-vessel-name" }),
                    //     voyageNumber: formatMessage({id:"lbl.version-number" }),
                    //     vesselCode: formatMessage({id:"lbl.Ship-code" }),
                    //     tradeLaneCode: formatMessage({id:"lbl.Trade-line" }),
                    //     officeCode: formatMessage({id:"lbl.office" }),
                    //     profitCenterCode: formatMessage({id:"lbl.profit-center" }),
                    //     rateCurrency: formatMessage({id:"lbl.Agreement-currency" }),
                    //     totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                    //     reviseAmount: formatMessage({id:"lbl.Agreement-currency-adjustment-amount" }),
                    //     vatFlag: formatMessage({id:"lbl.Whether-the-price-includes-tax" }),
                    //     vatAmt: formatMessage({id:"lbl.Agreement-currency-tax-reference" }),
                    //     vatReviseAmt: formatMessage({id:"lbl.Tax-adjustment-in-agreement-currency-reference" }),
                    //     paymentAmount: formatMessage({id:"lbl.Amount-payable-to-outlets" }),
                    //     customerSAPId: formatMessage({id:"lbl.AP-outlets" }),
                    //     recAmount: formatMessage({id:"lbl.Agency-net-income" }),
                    //     yfSide: formatMessage({id:"lbl.make" }),
                    //     agencyCurrency: formatMessage({id:"lbl.Standard-currency" }),
                    //     agencyCurrencyAmount: formatMessage({id:"lbl.Amount-in-base-currency" }),
                    //     agencyCurrencyReviseAmount: formatMessage({id:"lbl.Adjustment-amount-in-base-currency" }),
                    //     vatAmtInAgency: formatMessage({id:"lbl.Tax-in-local-currency" }),
                    //     reviseVatAmtInAgency: formatMessage({id:"lbl.Tax-adjustment-in-base-currency" }),
                    //     cleaningCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                    //     cleaningAmount: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                    //     reviseCleaningAmount: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                    //     vatAmtInClearing: formatMessage({id:"lbl.tax-in-settlement-currency" }),
                    //     vatReviseAmt: formatMessage({id:"lbl.tax-adjustment-in-settlement-currency" }),
                    //     exFlag: formatMessage({id:"lbl.within-boundary" }),
                    //     bargeType: formatMessage({id:"lbl.Ship-type" }),
                    //     vesselProperty: formatMessage({id:"lbl.Ship-property" }),
                    // },
                    // sumCol: {//汇总字段
                    //     feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                    //     clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                    //     clearingSumAmount: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                    //     clearingSumReviseAmount: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                    //     sumVatAmtInClearing: formatMessage({id:"lbl.tax-in-settlement-currency" }),
                    //     sumReviseVatAmtInClearing: formatMessage({id:"lbl.tax-adjustment-in-settlement-currency" }),
                    // },
                
                    dataCol:tddata ,
                    sumCol:crdata ,
                    'sheetName':formatMessage({id:'menu.afcm.agfee-stl.acc-chrg.inq-but-ex-rec'}),
                }]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if(downData.size<1){
            setSpinflag(false)
            Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false)
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.acc-chrg.inq-but-ex-rec'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.acc-chrg.inq-but-ex-rec'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
        setTableData([])
        setTableDatas([])
        setBackFlag(true)
        setAgencyFlag(true)
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
                        <Select span={6} name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* <Select name='agencyCode' showSearch={true}  label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode} />   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} selectChange={selectChangeBtn}  label={<FormattedMessage id='lbl.Big-class-fee'/>}  span={6} options={costKey} />
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>}  span={6} options={subclass} />
                        {/* 费用状态 */}
                        <Select name='feeStatus' flag={true} label={<FormattedMessage id='lbl.Cost-status'/>} span={6} options={feeStatusData.values} />  
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}}name='generateDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                        {/* 贸易区 */}
                        <Select name='tradeZoneCode' flag={true}  label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6} options={tradeZoneCodeData.values} selectChange={companyIncident} />  
                        {/* Trade */}
                        <Select name='tradeCode' flag={true} label={<FormattedMessage id='lbl.Trade'/>} span={6} options={tradeCode}  selectChange={trades} />  
                        {/* 贸易线 */}
                        <Select name='tradeLaneCode' flag={true}  label={<FormattedMessage id='lbl.Trade-line'/>} span={6} options={tradeLine} />  
                        {/* 船舶属性 */}
                        <Select name='vesselType' flag={true} label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselType.values}/>  
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.route'/>}   span={6}/>  
                        {/* 船舶代码 */}
                        <InputText name='vesselCode'  label={<FormattedMessage id='lbl.Ship-code'/>}   span={6}/>  
                        {/* 航次 */}
                        <InputText name='voyNum'   label={<FormattedMessage id='lbl.voyage-number'/>}   span={6}/>  
                        {/* 船舶类型 */}
                        <Select name='bargeType' flag={true}  label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={shipTypes.values}/>  
                        {/* SVVD */}
                        <InputText name='svvd'  styleFlag={backFlag}  label={<FormattedMessage id='lbl.SVVD'/>}   span={6}/>  
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>}   span={6}/>  
                        {/* 发票号码 */}
                        <InputText name='yfListCode' styleFlag={backFlag}  label={<FormattedMessage id='lbl.Invoice-number'/>}   span={6}/>  
                        {/* 是否边界内 */}
                        <Select name='exFlag' flag={true}  label={<FormattedMessage id='lbl.within-boundary'/>} span={6} options={exFlagData.values} />  
                        {/* 预估单号码 */}
                        <InputText name='erReceiptCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Estimated-order-number'/>}   span={6}/>         
                        {/* Office */}
                        <InputText name='officeCode' label={<FormattedMessage id='lbl.office'/>}   span={6}/>  
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                    </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 无条件查询 */}
                    <Button onClick={()=>{
                        IEqueryType = 'unconditional'
                        pageChange(page,null)}}> <SearchOutlined /> <FormattedMessage id='lbl.unconditional-Query'/></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=>{
                        IEqueryType = 'search'
                        pageChange(page,null,'search')}}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
                </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='entryUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
					rowSelection={null}
                />
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <div style={{width:"55%"}}>
                    <PaginationTable
                        dataSource={tableDatas}
                        columns={columnss}
                        rowKey='uuid'
                        scrollHeightMinus={200}
                        rowSelection={null}
                        pagination={false}
                    />
                </div>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol