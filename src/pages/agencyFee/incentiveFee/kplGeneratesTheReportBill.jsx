import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, agencyCodeData, momentFormat, costCategories, acquireSelectDataExtend, TradeData, acquireSelectDatas, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    UnorderedListOutlined,//生成报账单
} from '@ant-design/icons'


//---------------------------------------------- KPI生成报账单-------------------------------------------------

const confirm = Modal.confirm

const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [tableDatas,setTableDatas] = useState([])//表格数据
    const [costKey, setCostKey] = useState([]);    // 费用大类
    const [subclass,setSubclass] = useState({});    // 费用小类
    const [spinflag,setSpinflag] = useState(false)
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    const [EovData, setEovData] = useState({}); // EOV
    const [trade, setTrade] = useState({});// 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [shipTypes, setShipTypes] = useState({});// 船舶类型
    const [vesselType,setVesselType] = useState({})//船舶属性
    const [withinBoundary, setWithinBoundary] = useState({});// 是否边界内
    const [currentStatus, setCurrentStatus] = useState({});// 当前状态
    const [sfPkgProcessId,setSfPkgProcessId] = useState({});//是否删除航次
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [flagButton,setFlagButton] = useState(false)
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({});
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDatas('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDatas('AFCM.AG.KPI.EVO', setEovData, $apiUrl);// EOV
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDatas('AFCM.AG.KPI.FEETYPE',setSubclass,$apiUrl);//费用小类
        acquireSelectData('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectDatas('AFCM.BARGE.TYPE',setShipTypes ,$apiUrl);// 船舶类型
        acquireSelectDatas('VESSELTYPE',setVesselType,$apiUrl);//船舶属性
        acquireSelectDatas('CURRENT.STATUS',setCurrentStatus,$apiUrl);//当前状态
        acquireSelectDatas('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);  // 是否边界内
        acquireSelectDatas('AFCM.ADJ.MANUAL', setSfPkgProcessId, $apiUrl);  // 是否删除航次
          
    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            exFlag:withinBoundary.defaultValue,
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        })
    }, [company, acquireData,withinBoundary])
    useEffect(() => {  
        tableData.length>0?setFlagButton(true):setFlagButton(false)
    }, [tableData])
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
   
    //KPI生成报账单表格文本 
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
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
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
            dataType:subclass.values,
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.EOV" />,//EOV
            dataIndex: 'eovStatus',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.ht.statement.upload-vessel-name" />,//船名
            dataIndex: 'vslName',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.voyage-number" />,//航次
            dataIndex: 'voyageNumber',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.Ship-code" />,//船舶代码
            dataIndex: 'vesselCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.Ship-property" />,//船舶属性 
            dataIndex: 'vesselProperty',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.argue.trade-code"/>,//贸易区
            dataType:trade.values,
            dataIndex: 'tradeZoneCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Trade" />,//Trade
            dataIndex: 'tradeCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'tradeLaneCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.current-state" />,//当前状态
            dataType:currentStatus.values,
            dataIndex: 'currentStatus',
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
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'totalAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount-usd" />,//协议币调整金额（USD）
            dataType: 'dataAmount',
            dataIndex: 'totalAmountInUsd',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
            
        },
        {
            title: <FormattedMessage id="lbl.USD-currency" />,//USD汇率
            dataIndex: 'usdChangeRate',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Exchange-Rate-of-Settlement-Currency" />,//结算币汇率
            dataIndex: 'cnyChangeRate',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.within-boundary" />,//是否边界内
            dataType:withinBoundary.values,
            dataIndex: 'exFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            dataType: 'dateTime',
            dataIndex: 'vouErrorCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Whether-to-delete-the-voyage" />,//是否删除航次
            dataType:sfPkgProcessId.values,
            dataIndex: 'sfPkgProcessId',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]

    //KPI生成报账单汇总文本 
    const columnss=[
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'clearingSumAmount',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'clearingSumReviseAmount',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE'
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        let query = queryForm.getFieldValue();
        search?pagination.current=1:null
        
        if(!query.agencyCode||!query.feeClass){
            setAgencyFlag(false)
            //代理编码/费用大类必须输入
            Toast('',formatMessage({id: 'lbl.agency-categories-must-enter'}), 'alert-error', 5000, false)
        }else{
            setAgencyFlag(true)
            if(!query.activeDate&&!query.buildDate&&!query.svvdId&&!query.billReferenceCode){
                setBackFlag(false)
                //业务日期/生成日期/svvd 不能同时为空
                Toast('',formatMessage({id: 'lbl.Date-svvd-must-enter'}), 'alert-error', 5000, false)
            }else{
                setSpinflag(true)
                setBackFlag(true)
                const localsearch=await request($apiUrl.AG_FEE_KPL_SEARCH_OFFLINECR_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            'soCompanyCode':query.soCompanyCode,
                            'agencyCode':query.agencyCode,
                            'feeClass':query.feeClass,
                            'feeType':query.feeType,
                            'vesselProperty':query.vesselProperty,
                            'tradeZoneCode':query.tradeZoneCode,
                            'tradeLaneCode':query.tradeLaneCode,
                            'exFlag':query.exFlag,
                            'officeCode':query.officeCode,
                            'serviceLoopCode':query.serviceLoopCode,
                            'vesselCode':query.vesselCode,
                            'voyageNumber':query.voyageNumber,
                            'bargeType':query.bargeType,
                            'svvdId':query.svvdId,
                            'portCode':query.portCode,
                            'eovInd':query.eovInd,
                            'activeDateFrom': query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo': query.activeDate?momentFormat(query.activeDate[1]):null,
                            'buildDateFrom': query.buildDate?momentFormat(query.buildDate[0]):null,
                            'buildDateTo': query.buildDate?momentFormat(query.buildDate[1]):null,
                        },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    let data = localsearch.data
                    let datas = data ? data.resultList : null
                    let datass = data ? data.sumList : null
                    datas ? datas.map((v,i)=>[
                        v['id'] = i
                    ]) : null
                    datass ? datass.map((v,i)=>{
                        v['detail'] = i
                    }) : null
                    setSpinflag(false)
                    setTabTotal(data.totalCount)
                    datas ? setTableData([...datas]) : null
                    datass ? setTableDatas([...datass]) : null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    console.log(queryForm.getFieldValue())
                }else{
                    Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
                    setSpinflag(false)
                    setTableData([])
                    setTableDatas([])
                }
            }
        }    
    }
    // 全部生成报账单
    const GeneratingReportBill = async() =>{
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: formatMessage({id:'lbl.Generate-all-bills'}),
            content: formatMessage({id: 'lbl.Whether-current-expenses-need-billed'}),
            okText: formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                let query = queryForm.getFieldValue();
                const generation = await request($apiUrl.AG_FEE_KPL_SEARCH_BUILDBILL_ALL,{
                    method:'POST',
                    data:{
                        "params":{
                            'soCompanyCode': query.soCompanyCode,
                            'agencyCode':query.agencyCode,
                            'feeClass':query.feeClass,
                            'feeType':query.feeType,
                            'vesselProperty':query.vesselProperty,
                            'tradeZoneCode':query.tradeZoneCode,
                            'tradeLaneCode':query.tradeLaneCode,
                            'exFlag':query.exFlag,
                            'officeCode':query.officeCode,
                            'serviceLoopCode':query.serviceLoopCode,
                            'vesselCode':query.vesselCode,
                            'voyageNumber':query.voyageNumber,
                            'bargeType':query.bargeType,
                            'svvdId':query.svvdId,
                            'portCode':query.portCode,
                            'eovInd':query.eovInd,
                            'activeDateFrom': query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo': query.activeDate?momentFormat(query.activeDate[1]):null,
                            'buildDateFrom': query.buildDate?momentFormat(query.buildDate[0]):null,
                            'buildDateTo': query.buildDate?momentFormat(query.buildDate[1]):null,
                        },
                    }
                })
                console.log(generation)
                if(generation.success){
                    pageChange(page,null,'')
                    setTimeout(()=>{
                        Toast('', '', '', 5000, false);
                        Toast('',generation.message, '', 5000, false)
                    } ,1000);
                }else{
                    Toast('',generation.errorMessage , 'alert-error', 5000, false);
                }
            }
        })
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
        setAgencyFlag(true)
        setBackFlag(true)
        setTableData([])
        setTableDatas([])
    }
    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_KPL_EXP_OFFLINECR_LIST,{
            method:"POST",
            data:{
                "params":{
                    'agencyCode':query.agencyCode,
                    'feeClass':query.feeClass,
                    'feeType':query.feeType,
                    'vesselProperty':query.vesselProperty,
                    'tradeZoneCode':query.tradeZoneCode,
                    'tradeLaneCode':query.tradeLaneCode,
                    'exFlag':query.exFlag,
                    'officeCode':query.officeCode,
                    'serviceLoopCode':query.serviceLoopCode,
                    'vesselCode':query.vesselCode,
                    'voyageNumber':query.voyageNumber,
                    'bargeType':query.bargeType,
                    'svvdId':query.svvdId,
                    'portCode':query.portCode,
                    'eovInd':query.eovInd,
                    'activeDateFrom': query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo': query.activeDate?momentFormat(query.activeDate[1]):null,
                    'buildDateFrom': query.buildDate?momentFormat(query.buildDate[0]):null,
                    'buildDateTo': query.buildDate?momentFormat(query.buildDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-gen-rep-bl'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: formatMessage({id:"lbl.agency" }),//代理编码
                        vslName: formatMessage({id:"lbl.ht.statement.upload-vessel-name" }),//船名
                        activityDate: formatMessage({id:"lbl.argue.bizDate" }),//业务日期
                        svvdId: formatMessage({id:"lbl.SVVD" }),//svvd
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),//费用大类
                        feeType: formatMessage({id:"lbl.Small-class-fee" }),//费用小类
                        portCode: formatMessage({id:"lbl.port" }),//港口
                        eovStatus:formatMessage({id:"lbl.EOV" }),//EOV
                        voyageNumber:formatMessage({id:"lbl.voyage-number" }),//航次
                        vesselCode:formatMessage({id:"lbl.Ship-code" }),//船舶代码
                        vesselProperty:formatMessage({id:"lbl.Ship-property" }),//船舶属性
                        tradeZoneCode:formatMessage({id:"lbl.argue.trade-code" }),//贸易区
                        tradeCode:formatMessage({id:"lbl.Trade" }),//Trade
                        tradeLaneCode:formatMessage({id:"lbl.Trade-line" }),//贸易线
                        currentStatus:formatMessage({id:"lbl.current-state" }),//当前状态
                        rateCurrency: formatMessage({id:"lbl.Agreement-currency" }),//协议币种
                        totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),//协议币金额
                        reviseAmount:formatMessage({id:"lbl.Agreement-currency-adjustment-amount" }),//协议币调整金额
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),//结算币种
                        totalAmountInClearing:formatMessage({id:"lbl.amount-of-settlement-currency" }),//结算币金额
                        reviseAmountInClearing:formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                        totalAmountInUsd:formatMessage({id:"lbl.Agreement-currency-adjustment-amount-usd" }),
                        usdChangeRate:formatMessage({id:"lbl.USD-currency" }),
                        cnyChangeRate:formatMessage({id:"lbl.Exchange-Rate-of-Settlement-Currency" }),
                        exFlag: formatMessage({id:"lbl.within-boundary" }),
                        vouErrorCode:formatMessage({id:"lbl.generation-date"}),
                        sfPkgProcessId:formatMessage({id:"lbl.Whether-to-delete-the-voyage" }),
                    },
                    sumCol: {//汇总字段
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),//费用大类
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),//结算币种
                        clearingSumAmount:formatMessage({id:"lbl.amount-of-settlement-currency" }),//结算币金额
                        clearingSumReviseAmount: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),//代理编码

                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-gen-rep-bl'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-gen-rep-bl'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-gen-rep-bl'}) ; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    return (
        <div className='parent-box'>
            <div className='header-from' style={{marginTop:'15px'}}>
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
                            company.companyType == 0 ? <InputText styleFlag={agencyFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} style={{background: agencyFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 费用大类 */}
                        <Select name='feeClass'style={{background:agencyFlag?'white':'yellow'}} flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={costKey}/>  
                        {/* 费用小类 */}
                        <Select name='feeType'  flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={subclass.values} />  
                        {/* 船舶属性 */}
                        <Select name='vesselProperty'  flag={true} label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselType.values} />  
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='buildDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                        {/* 贸易区 */}
                        <Select name='tradeZoneCode'  flag={true} label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6} options={trade.values} selectChange={companyIncident}  />  
                        {/* Trade */}
                        <Select name='tradeCode'   flag={true} label={<FormattedMessage id='lbl.Trade'/>} span={6} options={tradeCode} selectChange={trades} />  
                        {/* 货物贸易线 */}
                        <Select name='tradeLaneCode'  flag={true}  label={<FormattedMessage id='lbl.Line-of-trade-in-goods'/>} span={6} options={tradeLine} />  
                        {/* office */}
                        <InputText name='officeCode'  label={<FormattedMessage id='lbl.office'/>} span={6}/>  
                        {/* 是否边界内 */}
                        <Select name='exFlag'  flag={true}   label={<FormattedMessage id='lbl.within-boundary'/>} span={6} options={withinBoundary.values}/>  
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>}   span={6}/>  
                        {/* 船舶代码 */}
                        <InputText name='vesselCode' flag={true}  label={<FormattedMessage id='lbl.Ship-code'/>}   span={6}/>  
                        {/* 航次 */}
                        <InputText name='voyageNumber'  label={<FormattedMessage id='lbl.voyage-number'/>}   span={6}/>  
                        {/* 船舶类型 */}
                        <Select name='bargeType'  flag={true}  label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={shipTypes.values}/>  
                        {/* SVVD */}
                        <InputText name='svvdId' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>}   span={6}/>  
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>}   span={6}/>  
                        {/* EOV */}
                        <Select name='eovInd' flag={true}   label={<FormattedMessage id='lbl.EOV'/>}   span={6} options={EovData.values}  />  
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/><FormattedMessage id='lbl.download'/></Button>
                    {/* 全部生成报账单 */}
                    <CosButton onClick={GeneratingReportBill} auth='AFCM-AG-KPI-002-B01'disabled={flagButton?false:true} ><UnorderedListOutlined/><FormattedMessage id='lbl.Generate-all-reported-bills'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=> pageChange(page,null,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
                </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    rowSelection={null}
                />
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableDatas}
                    columns={columnss}
                    rowKey='detailid'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    pagination={false}
                    rowSelection={null}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol