import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage, formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas, acquireSelectData, acquireSelectDataExtend, momentFormat, costCategories, agencyCodeData, TradeData, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form, Button, Row, Modal, Spin, Switch, Alert} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import CosButton from '@/components/Common/CosButton'
import Loading from '@/components/Common/Loading'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SelectOutlined,//选择生成发票
    UnorderedListOutlined,//全部生成发票
} from '@ant-design/icons'
import { Toast } from '@/utils/Toast'


//---------------------------------------------- 生成应收发票-------------------------------------------------
// const { TabPane } = Tabs;
const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
let grqueryType = '' 
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([])//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//表格数据
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [withinBoundary, setWithinBoundary] = useState({});// 是否边界内
    const [trade, setTrade] = useState({});// 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [shipTypes, setShipTypes] = useState({});// 船舶类型
    const [vesselType,setVesselType] = useState({})//船舶属性
    const [costKey,setCostKey] = useState ([])//费用大类
    const [subclass,setSubclass] = useState ([])//费用小类
    const [mess,setMess] = useState([])//提示
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [spinflag,setSpinflag] = useState(false)
    const [vatFlag,setVatFlag] = useState({})//是否含税价
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [checked, setChecked] = useState([]);
    const [uuid,setUuid] = useState([])//uuid
    const [uuidData, setUuidData] = useState([]); // 选择数据
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
            ...query
        })
        console.log(query)
    } 
    
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    useEffect(()=>{
        agencyCodeData($apiUrl, setAgencyCode,setCompany); //代理编码
        acquireSelectDatas('AFCM.BARGE.TYPE',setShipTypes ,$apiUrl);// 船舶类型
        acquireSelectDatas('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);  // 是否边界内
        acquireSelectDatas('AGMT.VAT.FLAG',setVatFlag,$apiUrl);//是否含税价
        acquireSelectData('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectDatas('VESSELTYPE',setVesselType,$apiUrl);//船舶属性
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY', 'CB0068',setAcquireData, $apiUrl);// 船东
    },[])

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

   
    //生成应付发票表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期  
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE',
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            // dataType: 'dateTime',
            dataIndex: 'generateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE',
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
            dataType:subclass,
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
            title: <FormattedMessage id="lbl.voyage-number" />,//航次 
            dataIndex: 'voyageNumber',
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
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.argue.trade-code" />,//贸易区
            dataIndex: 'tradeZoneCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Trade" />,//Trade
            dataIndex: 'tradeCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.trade-channel" />,//Trade Lane
            dataIndex: 'tradeLaneCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.office" />,//Office
            dataIndex: 'officeCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.profit-center" />,//利润中心
            dataIndex: 'profitCenterCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.AP-outlets" />,//应付网点
            dataIndex: 'customerSAPId',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrency',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            dataIndex: 'reviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
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
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,//协议币税金（参考）
            dataIndex: 'vatAmt',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,//协议币调整税金（参考）
            dataIndex: 'vatReviseAmt',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,//应付网点金额
            dataIndex: 'paymentAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
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
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agency-net-income" />,//代理净收入
            dataIndex: 'recAmount',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE',
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
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Standard-currency" />,//本位币种
            dataIndex: 'agencyCurrency',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额
            dataIndex: 'agencyCurrencyAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,//本位币调整金额
            dataIndex: 'agencyCurrencyReviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,//本位币税金（参考）
            dataIndex: 'vatAmtInAgency',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,//本位币调整税金（参考）
            dataIndex: 'reviseVatAmtInAgency',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'cleaningCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'cleaningAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'reviseCleaningAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,//结算币税金（参考）
            dataIndex: 'vatAmtInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金（参考）
            dataIndex: 'reviseVatAmtInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.within-boundary" />,//是否边界内
            dataType:withinBoundary.values,
            dataIndex: 'exFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE',
        },
        {
            title: <FormattedMessage id="lbl.Estimated-order-number" />,//预估单号码
            dataIndex: 'ygListCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]
    
    const setSelectedRows = (val) =>{
        console.log(queryForm.getFieldValue())
        if(val.length>0){
            if(val.length==1){
                setUuidData([val[0].entryUuid])
            }else{
                let uuids = []
                val.map((v,i)=>{
                    uuids.push(v.entryUuid)
                    setUuidData([...uuids])
                })
            }
           
            console.log(val)
           
        }else{
            setUuidData([])
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
        setChecked([]);
        setBackFlag(true)
        setAgencyFlag(true)
        setUuidData([])
    }
    
    //生成应收发票---全部生成发票数据
    const AllGenerateInvoice = async () =>{
        Toast('', '', '', 5000, false);
        if(tableData.length<1){
            Toast('', formatMessage({id: 'lbl.Generate-info'}), 'alert-error', 5000, false);
            return
        }else{
            const query = queryForm.getFieldsValue()
            const confirmModal = confirm({
                title: formatMessage({id:'lbl.select-generate-Invoice'}),
                content: formatMessage({id: 'lbl.comm-all-buildAR'}),
                okText: formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async  onOk() {
                    confirmModal.destroy() 
                    setSpinflag(true)
                    const Invoice=await request($apiUrl.AG_FEE_AR_BUILDBILL_ALL,{
                        method:"POST",
                        data:{
                            "params":{
                                'soCompanyCode': query.soCompanyCode,
                                'agencyCode': query.agencyCode,
                                'feeClass': query.feeClass,
                                'feeType': query.feeType,
                                'vesselType': query.vesselType,
                                'tradeZoneCode': query.tradeZoneCode,
                                'tradeCode': query.tradeCode,
                                'tradeLaneCode': query.tradeLaneCode,
                                'exFlag': query.exFlag,
                                'serviceLoopCode': query.serviceLoopCode,
                                'vesselCode': query.vesselCode,
                                'voyNum': query.voyNum,
                                'bargeType': query.bargeType,
                                'svvd': query.svvd,
                                'portCode': query.portCode,
                                'erReceiptCode': query.erReceiptCode,
                                'officeCode': query.officeCode,
                                'generateUser': query.generateUser,
                                'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                                'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                                'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                                'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                            },
                        }
                    })
                    if(Invoice.success){
                        setSpinflag(false)
                        Toast('',Invoice.message, '', 5000, false);
                        setTableData([])
                    }else{
                        setSpinflag(false)
                        Toast('',Invoice.errorMessage, 'alert-error', 5000, false);
                    }
                
                }
            })
        }
    }

    //生成应收发票---选择生成发票
    const SelectGenerateInvoice = async () =>{
        Toast('', '', '', 5000, false);
        console.log(uuidData)
        if(uuidData.length>=1){
            let uuids = uuidData.map((v,i)=>{
                return {entryUuid:v}
            })
            Toast('', '', '', 5000, false);
            const confirmModal = confirm({
                title: formatMessage({id:'lbl.select-generate-Invoice'}),
                content: formatMessage({id: 'lbl.comm-select-buildAR'}),
                okText: formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async  onOk() {
                    confirmModal.destroy()
                    setSpinflag(true)
                    const Invoice=await request($apiUrl.AG_FEE_AR_BUILDBILL_SELECT,{
                        method:"POST",
                        data:{
                            "paramsList":uuids
                        }
                    })
                    console.log(Invoice)
                    if(Invoice.success){
                        if(tableData.length>1){
                            setSpinflag(false)
                            pageChange(page)
                            setUuidData([])
                            setTimeout(()=>{
                                Toast('', '', '', 5000, false);
                                Toast('',Invoice.message, '', 5000, false)
                            } ,1000);
                        }else{
                            setSpinflag(false)
                            Toast('',Invoice.errorMessage, 'alert-error', 5000, false);
                            setTableData([])
                        }    
                    }
                
                }
            })
        }else{
            Toast('', formatMessage({id: 'lbl.Select-data'}), 'alert-error', 5000, false);
        }
    }
    // 表格数据
    const pageChange= async (pagination,options,search) => {
        setTableData([])
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        //查询
        if(!query.feeClass||!query.agencyCode){
            setAgencyFlag(false)
            //代理编码 费用大类必须输入
            setSpinflag(false)
            Toast('', formatMessage({id: 'lbl.agency-categories-must-enter'}), 'alert-error', 5000, false)
        }else{
            setAgencyFlag(true)
            setSpinflag(false)
            if(!query.activeDate&&!query.generateDate&&!query.svvd&&!query.erReceiptCode&&!query.serviceLoopCode){
                ///业务时间/SVVD/航线/预估单号/生成时间必须输入一个且时间间隔不能超过92
                setBackFlag(false)
                Toast('', formatMessage({id: 'lbl.fee-date-must-enter'}), 'alert-error', 5000, false)
            }else{
                let dates = query.generateDate ? Math.abs((query.generateDate[0] - query.generateDate[1]))/(1000*60*60*24) : null
                if(dates>92){
                    setBackFlag(false)
                    Toast('',formatMessage({id: 'lbl.generateDate-Interval-cannot-exceed'}), 'alert-error', 5000, false)
                }else{
                    setBackFlag(true)
                    setSpinflag(true)
                    const localsearch = await request($apiUrl.AG_FEE_AR_SEARCH_PENDING_AR_RECEIPT_LIST,{
                        method:"POST",
                        data:{
                            "page": pagination,
                            "params":{
                                'soCompanyCode': query.soCompanyCode,
                                'agencyCode': query.agencyCode,
                                'feeClass': query.feeClass,
                                'feeType': query.feeType,
                                'vesselType': query.vesselType,
                                'tradeZoneCode': query.tradeZoneCode,
                                'tradeCode': query.tradeCode,
                                'tradeLaneCode': query.tradeLaneCode,
                                'exFlag': query.exFlag,
                                'serviceLoopCode': query.serviceLoopCode,
                                'vesselCode': query.vesselCode,
                                'voyNum': query.voyNum,
                                'bargeType': query.bargeType,
                                'svvd': query.svvd,
                                'portCode': query.portCode,
                                'erReceiptCode': query.erReceiptCode,
                                'officeCode': query.officeCode,
                                'generateUser': query.generateUser,
                                'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                                'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                                'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                                'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                                'hasCondition': grqueryType=='unconditional'? "N" :undefined
                            }
                        }
                    })
                    console.log(localsearch)
                    if(localsearch.success){
                        setSpinflag(false)
                        let data=localsearch.data
                        let datas=data ? data.resultList : null
                        data ? setTabTotal(data.totalCount) : null
                        datas ? setTableData([...datas]) : null
                        if(pagination.pageSize!=page.pageSize){
                            pagination.current=1
                        }
                        setPage({...pagination})
                    }else{
                        setSpinflag(false)
                        setTableData([])
                        Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
                    }
                }
            }
        }  
    }
    //下载
    const downlod = async () =>{ 
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        setSpinflag(true)
        let downData = await request($apiUrl.AG_FEE_AR_EXP_PENDING_AR_RECEIPT_LIST,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    'agencyCode': query.agencyCode,
                    'feeClass': query.feeClass,
                    'feeType': query.feeType,
                    'vesselType': query.vesselType,
                    'tradeZoneCode': query.tradeZoneCode,
                    'tradeCode': query.tradeCode,
                    'tradeLaneCode': query.tradeLaneCode,
                    'exFlag': query.exFlag,
                    'serviceLoopCode': query.serviceLoopCode,
                    'vesselCode': query.vesselCode,
                    'voyNum': query.voyNum,
                    'bargeType': query.bargeType,
                    'svvd': query.svvd,
                    'portCode': query.portCode,
                    'erReceiptCode': query.erReceiptCode,
                    'officeCode': query.officeCode,
                    'generateUser': query.generateUser,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    'hasCondition': grqueryType=='unconditional'? "N" :undefined
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.acc-chrg.gen-inv-rec'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        activityDate: formatMessage({id:"lbl.argue.bizDate" }),
                        generateDate: formatMessage({id:"lbl.generation-date" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        feeType: formatMessage({id:"lbl.Small-class-fee" }),
                        svvd: formatMessage({id:"lbl.SVVD" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        vslName: formatMessage({id:"lbl.ht.statement.upload-vessel-name" }),
                        voyageNumber: formatMessage({id:"lbl.voyage-number" }),
                        vesselCode: formatMessage({id:"lbl.Ship-code" }),
                        tradeZoneCode: formatMessage({id:"lbl.argue.trade-code" }),
                        tradeCode: formatMessage({id:"lbl.Trade" }),
                        tradeLaneCode: formatMessage({id:"lbl.trade-channel" }),
                        officeCode: formatMessage({id:"lbl.office" }),
                        profitCenterCode: formatMessage({id:"lbl.profit-center" }),
                        customerSAPId: formatMessage({id:"lbl.AP-outlets" }),
                        rateCurrency: formatMessage({id:"lbl.Agreement-currency" }),
                        totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                        reviseAmount: formatMessage({id:"lbl.Agreement-currency-adjustment-amount" }),
                        vatFlag: formatMessage({id:"lbl.Whether-the-price-includes-tax" }),
                        vatAmt: formatMessage({id:"lbl.Agreement-currency-tax-reference" }),
                        vatReviseAmt: formatMessage({id:"lbl.Tax-adjustment-in-agreement-currency-reference" }),
                        paymentAmount: formatMessage({id:"lbl.Amount-payable-to-outlets" }),
                        customerSAPId: formatMessage({id:"lbl.AP-outlets" }),
                        recAmount: formatMessage({id:"lbl.Agency-net-income" }),
                        yfSide: formatMessage({id:"lbl.make" }),
                        agencyCurrency: formatMessage({id:"lbl.Standard-currency" }),
                        agencyCurrencyAmount: formatMessage({id:"lbl.Amount-in-base-currency" }),
                        agencyCurrencyReviseAmount: formatMessage({id:"lbl.Adjustment-amount-in-base-currency" }),
                        vatAmtInAgency: formatMessage({id:"lbl.Tax-in-local-currency" }),
                        reviseVatAmtInAgency: formatMessage({id:"lbl.Tax-adjustment-in-base-currency" }),
                        cleaningCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        cleaningAmount: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                        reviseCleaningAmount: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                        vatAmtInClearing: formatMessage({id:"lbl.tax-in-settlement-currency" }),
                        reviseVatAmtInClearing: formatMessage({id:"lbl.tax-adjustment-in-settlement-currency" }),
                        exFlag: formatMessage({id:"lbl.within-boundary" }),
                        ygListCode: formatMessage({id:"lbl.Estimated-order-number" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.acc-chrg.gen-inv-rec'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.acc-chrg.gen-inv-rec'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.acc-chrg.gen-inv-rec'})+ '.xlsx'; // 下载后文件名
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
                        <Select name='soCompanyCode' disabled={company.companyType == 0 ? true : false} span={6} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={agencyFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} style={{background: agencyFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} style={{background:agencyFlag?'white':'yellow'}} label={<FormattedMessage id='lbl.Big-class-fee'/>}  span={6} options={costKey} selectChange={selectChangeBtn}  />
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>}  span={6} options={subclass} />
                        {/* 船舶属性 */}
                        <Select name='vesselType' flag={true} label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselType.values} />  
                        {/* 业务日期 */}
                        <DoubleDatePicker name='activeDate' span={6} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}}  label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker name='generateDate' span={6} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}}  label={<FormattedMessage id='lbl.generation-date'/>}   />
                        {/* 贸易区 */}
                        <Select flag={true} name='tradeZoneCode' label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6}  options={trade.values} selectChange={companyIncident} />  
                        {/* Trde */}
                        <Select flag={true} name='tradeCode' label={<FormattedMessage id='lbl.Trade'/>} span={6} options={tradeCode} selectChange={trades} />  
                        {/* Trade Lane */}
                        <Select flag={true} name='tradeLaneCode'   label={<FormattedMessage id='lbl.trade-channel'/>} span={6} options={tradeLine} />  
                        {/* 是否边界内 */}
                        <Select name='exFlag' label={<FormattedMessage id='lbl.within-boundary'/>} span={6} options={withinBoundary.values}/>  
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.route'/>}   span={6}/>  
                        {/* 船舶代码 */}
                        <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code'/>}   span={6}/>  
                        {/* 航次 */}
                        <InputText name='voyNum'   label={<FormattedMessage id='lbl.voyage-number'/>}   span={6}/>  
                        {/* 船舶类型 */}
                        <Select flag={true} name='bargeType'   label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={shipTypes.values} />  
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>}   span={6}/>  
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>}   span={6}/>  
                        {/* 预估单号码 */}
                        <InputText name='erReceiptCode' styleFlag={backFlag}   label={<FormattedMessage id='lbl.Estimated-order-number'/>}   span={6}/>  
                        {/* Office */}
                        <InputText name='officeCode'   label={<FormattedMessage id='lbl.office'/>}   span={6}/>  
                        {/* 预估生成人员 */}
                        <InputText name='generateUser' capitalized={false} label={<FormattedMessage id='lbl.Estimate-generator'/>}   span={6}/>         
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                    {/* 选择生成发票 disabled={uuidData?false:true}*/}
                    <CosButton onClick={SelectGenerateInvoice} auth='AFCM-AG-AR-001-B01'  ><SelectOutlined /> <FormattedMessage id='lbl.select-generate-Invoice'/></CosButton>
                    {/* 全部生成发票 */}
                    <CosButton onClick={AllGenerateInvoice} auth='AFCM-AG-AR-001-B02' ><UnorderedListOutlined /> <FormattedMessage id='lbl.Generate-all-invoices'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 无条件查询 */}
                    <Button onClick={()=>{
                        grqueryType = 'unconditional',
                        pageChange(page,null)}}><SearchOutlined/> <FormattedMessage id='lbl.unconditional-Query'/></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=>{
                        grqueryType = 'search',
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
                        setSelectedRows={setSelectedRows}
                        rowSelection={{
                            selectedRowKeys: checked,
                            onChange:(key, row)=>{
                                setChecked(key);
                                setUuid(row);
                                setSelectedRows(row);
                            }
                        }}
                    />
                <Loading spinning={spinflag}/>
            </div>
        </div>
    )
}
export default LocalChargeComputationProtocol