import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, momentFormat, costCategories, agencyCodeData, acquireSelectDataExtend, acquireSelectDatas, TradeData} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'


//---------------------------------------------- 查询基础版历史信息-------------------------------------------------
// const { TabPane } = Tabs;
// const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([])
    const [tableData,setTableData] = useState([])//表格数据
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    const [costKey,setCostKey] = useState ([])//费用大类
    const [subclass,setSubclass] = useState ([])//费用小类
    const [acquireData, setAcquireData] = useState({}); // 船东
    const Intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [spinflag,setSpinflag] = useState(false)
    const [backFlag,setBackFlag] = useState(true);//背景颜色

    const [vesselType,setVesselType] = useState({})//船舶属性
    const [state,setState] = useState({})//当前状态
    const [shipTypes, setShipTypes] = useState({});// 船舶类型
    const [trade, setTrade] = useState({});// 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [packetBatch,setPacketBatch] = useState({})//数据包状态
    const [paidBookkeepingStatus,setPaidBookkeepingStatus] = useState({})//实付记账状态
    const [withinBoundary, setWithinBoundary] = useState({});// 是否边界内
    const [subclassAll,setSubclassAll] = useState ([])//全部费用小类
    const [confirmationStatus,setConfirmationStatus] = useState({})//实付确认状态
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
        console.log(queryForm.getFieldValue())
    }
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectDatas('VESSELTYPE',setVesselType,$apiUrl);//船舶属性
        acquireSelectDatas('AFCM.BARGE.TYPE',setShipTypes ,$apiUrl);// 船舶类型
        acquireSelectDatas('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectDatas('AFCM.OFF.CURRSTATUS',setState ,$apiUrl);// 当前状态
        acquireSelectDatas('AFCM.PACKAGE.FLAG',setPacketBatch ,$apiUrl);// 数据包状态
        acquireSelectDatas('AFCM.OFF.POSTSTATUS',setPaidBookkeepingStatus ,$apiUrl);// 实付记账状态
        acquireSelectDatas('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);  // 是否边界内
        acquireSelectDatas('AFCM.OFF.VERIFYSTATUS',setConfirmationStatus,$apiUrl);// 实付确认状态
        // acquireSelectDatas('AFCM.OFF.CURRSTATUS',setState ,$apiUrl);// 当前状态
        
    },[])
    useEffect(()=>{
        queryForm.setFieldsValue({
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            agencyCode: company.agencyCode,
        })
        console.log(state)
    },[company,acquireData,state])
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
    //全部费用小类
    const com = ()=>{
        let listAgTypeToClassall = costKey.map((v,i)=>{
            return v.listAgTypeToClass
        })
        let listAgTypeToClass = listAgTypeToClassall.reduce((pre,cur)=>{
            return pre.concat(cur)
        },[])
        console.log(listAgTypeToClass)
        listAgTypeToClass.map((v,i)=>{
            v['value']=v.feeCode
            v['label']=v.feeName+'(' + v.feeCode +')';
        })
        setSubclassAll(listAgTypeToClass)
        console.log(listAgTypeToClass)

    }

   //贸易区和trade的联动
    const companyIncident = async(value)=>{
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        queryForm.setFieldsValue({
            tradeCode: null,
            tradeLaneCode: null
        })
        TradeData($apiUrl, value, setTradeCode);
    }
    //trade和贸易线的联动
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

    //基础版历史信息表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: true,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: true,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: true,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclassAll,
            dataIndex: 'feeType',
            sorter: true,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.version-number" />,//版本号
            dataIndex: 'versionNumber',
            sorter: true,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.ht.statement.upload-vessel-name" />,//船名 
            dataIndex: 'vslName',
            sorter: true,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-type" />,//船舶类型
            dataType:shipTypes.values,
            dataIndex: 'bargeType',
            sorter: true,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-property" />,//船舶属性
            dataType:vesselType.values,
            dataIndex: 'vesselProperty',
            sorter: true,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.argue.trade-code" />,//贸易区
            dataIndex: 'tradeZoneCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Trade" />,//Trade
            dataIndex: 'tradeCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'tradeLaneCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.EOV" />,//EOV
            dataIndex: 'eovStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmount',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'totalAmountInClearing',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.afcm-0060" />,//协议币种调整金额（USD）
            dataType: 'dataAmount',
            dataIndex: 'totalAmountinUSD',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.profit-center" />,//利润中心
            dataIndex: 'profitCenterCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agency-net-income" />,//代理净收入
            dataType: 'dataAmount',
            dataIndex: 'recAmount',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE',

        },
        {
            title: <FormattedMessage id="lbl.error-code" />,//错误代码
            dataIndex: 'pendingErrorCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.The-error-level" />,//错误级别
            dataIndex: 'pendingErrorLevel',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.error-code-list" />,//错误代码(list)
            dataIndex: 'listErrorCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.The-error-level-list" />,//错误级别(list)
            dataIndex: 'listErrorLevel',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.error-code-VOU" />,//错误代码(VOU)
            dataIndex: 'vouErrorCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.The-error-level-VOU" />,//错误级别(VOU)
            dataIndex: 'vouErrorLevel',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.current-state" />,//当前状态
            dataType:state.values,
            dataIndex: 'currentStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.within-boundary" />,//是否边界内
            dataType:withinBoundary.values,
            dataIndex: 'exFlag',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Real-pay-mark" />,//实付标志
            dataIndex: 'sfFlag',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Date-of-payment-generation" />,//实付生成日期
            dataType: 'dateTime',
            dataIndex: 'sfGenDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,//报账单号码
            dataIndex: 'sfListCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Date-of-confirmation-of-actual-payment" />,//实付确认日期
            dataType: 'dateTime',
            dataIndex: 'sfVerifyDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Actual-payment-confirmation-status" />,//实付确认状态
            dataType:confirmationStatus.values,
            dataIndex: 'sfVerifyStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Paid-packet-state" />,//实付数据包状态
            dataType:packetBatch.values,
            dataIndex: 'sfPkgFlag',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.paid-packet-batch-AFF" />,//实付数据包批次
            dataIndex: 'sfPkgProcessId',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }, 
        {
            title: <FormattedMessage id="lbl.afcm-0055" />,//总部实付记账状态
            dataType:paidBookkeepingStatus.values,
            dataIndex: 'sfPostStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Date-of-payment-from-headquarters" />,//总部实付日期
            dataType: 'dateTime',
            dataIndex: 'sfBudat',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.office" />,//office
            dataIndex: 'officeCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]
    // 
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false)
        setTableData([])
        setTabTotal([])
        com()
        if(search){
            pagination.current=1
        }
        let query = queryForm.getFieldValue()
        // 业务时间/SVVD/港口至少输入一项
        if(!query.activeDate&&!query.svvdId&&!query.portCode){
            setBackFlag(false)
            Toast('',Intl.formatMessage({id:'lbl.afcm-0053'}) , 'alert-error', 5000, false)
        }else{
            setBackFlag(true)
            //业务时间间隔不能超过92天
            let dates =query.activeDate ? Math.abs((query.activeDate[0] - query.activeDate[1]))/(1000*60*60*24) : null
            if(dates>92){
                setBackFlag(false)
                Toast('',Intl.formatMessage({id: 'lbl.afcm-0064'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_OFFCR_SEARCH_OFFLIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            ...query,
                            'activeDate':undefined,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                            'buildDate':undefined,
                            'buildDateFrom':query.buildDate?momentFormat(query.buildDate[0]):null,
                            'buildDateTo':query.buildDate?momentFormat(query.buildDate[1]):null,

                        },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    setSpinflag(false)
                    let data=localsearch.data
                    let datas=localsearch.data.resultList
                    setTabTotal(data.totalCount)
                    setTableData([...datas])
                    setPage({...pagination})
                }else{
                    setSpinflag(false)
                    Toast('', localsearch.errorMessage , 'alert-error', 5000, false)
                }
            }
        }
        
    }
    
     //下载
     const downlod = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        // 业务时间/SVVD/港口至少输入一项
        if(!query.activeDate&&!query.svvdId&&!query.portCode){
            setBackFlag(false)
            Toast('',Intl.formatMessage({id:'lbl.afcm-0053'}) , 'alert-error', 5000, false)
        }else{
            setBackFlag(true)
            //业务时间间隔不能超过92天
            let dates =query.activeDate ? Math.abs((query.activeDate[0] - query.activeDate[1]))/(1000*60*60*24) : null
            if(dates>92){
                setBackFlag(false)
                Toast('',Intl.formatMessage({id: 'lbl.afcm-0064'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                let tddata = {}
                columns.map((v, i) => {
                    tddata[v.dataIndex] = Intl.formatMessage({id: v.title.props.id})
                })
                console.log(tddata)
                let downData = await request($apiUrl.AG_FEE_OFFICR_EXP_OFFLIST,{
                    method:"POST",
                    data:{
                        "params":{
                            ...query,
                            Date:undefined,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                            'buildDate':undefined,
                            'buildDateFrom':query.buildDate?momentFormat(query.buildDate[0]):null,
                            'buildDateTo':query.buildDate?momentFormat(query.buildDate[1]):null,
                        },
                        'excelFileName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF-hist.qy-bas-hist-info'}),
                        sheetList: [{//sheetList列表
                            dataCol:tddata,
                            sumCol: {//汇总字段
                            },
                        'sheetName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF-hist.qy-bas-hist-info'}),
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
                    Toast('', Intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
                    return
                }else{
                    setSpinflag(false)
                    let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                    if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                        navigator.msSaveBlob(blob, Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF-hist.qy-bas-hist-info'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                    } else {
                        let downloadElement = document.createElement('a');  //创建元素节点
                        let href = window.URL.createObjectURL(blob); // 创建下载的链接
                        downloadElement.href = href;
                        downloadElement.download = Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF-hist.qy-bas-hist-info'}) + '.xlsx'; // 下载后文件名
                        document.body.appendChild(downloadElement); //添加元素
                        downloadElement.click(); // 点击下载
                        document.body.removeChild(downloadElement); // 下载完成移除元素
                        window.URL.revokeObjectURL(href); // 释放掉blob对象
                    }
                }
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
        setBackFlag(true)
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
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 代理编码 */}
                        {/* <Select name='agencyCode' flag={true} showSearch={true} label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode} />   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} selectChange={selectChangeBtn}  label={<FormattedMessage id='lbl.Big-class-fee'/>}  span={6} options={costKey} />
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true}  label={<FormattedMessage id='lbl.Small-class-fee'/>}  span={6} options={subclass} />
                        {/* 船舶属性 */}
                        <Select name='vesselProperty' flag={true} label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselType.values}/>  
                        {/* 贸易区 */}
                        <Select name='tradeZoneCode' flag={true} label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6} options={trade.values} selectChange={companyIncident}/>  
                        {/* Trade */}
                        <Select name='tradeCode' flag={true} label={<FormattedMessage id='lbl.Trader'/>} span={6} options={tradeCode} selectChange={trades} />
                        {/* 贸易线 */}
                        <Select name='tradeLaneCode'  flag={true} label={<FormattedMessage id='lbl.Trade-line'/>} span={6} options={tradeLine}/>
                        {/* 当前状态 */}
                        <Select name='currentStatus' flag={true}  label={<FormattedMessage id='lbl.current-state'/>} span={6} options={state.values}/>  
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6}  style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>} span={6}/>  
                        {/* 船舶代码 */}
                        <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code'/>} span={6}/>  
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='buildDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                        {/* 船舶类型 */}
                        <Select name='bargeType' flag={true} label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={shipTypes.values}/>  
                        {/* 报账单号码 */}
                        <InputText name='sfListCode' label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>  
                        {/* SVVD */}
                        <InputText name='svvdId' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>  
                        {/* 港口 */}
                        <InputText name='portCode'  styleFlag={backFlag} label={<FormattedMessage id='lbl.port'/>} span={6}/>  
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
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
                    rowKey='lcrAgreementHeadUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
					rowSelection={null}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol