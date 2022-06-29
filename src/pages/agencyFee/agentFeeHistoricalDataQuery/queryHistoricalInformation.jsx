import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
// import PcmSearchGroups from "@/components/Common/CosSearchGroups";
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, agencyCodeData, momentFormat, costCategories, acquireSelectDataExtend, acquireSelectDatas, TradeData} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SelectOutlined,//选择生成发票
    UnorderedListOutlined,//全部生成发票
} from '@ant-design/icons'


//---------------------------------------------- 查询历史信息-------------------------------------------------
// const { TabPane } = Tabs;
// const confirm = Modal.confirm

const LocalChargeComputationProtocol =()=> {
    const [tableData,setTableData] = useState([])//表格数据
    const [tabTabTotal,setTabTotal] = useState([])//表格数据
    const [agencyCode, setAgencyCode] = useState([])//代理编码
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    const [costKey,setCostKey] = useState ([])//费用大类
    const [subclass,setSubclass] = useState ([])//费用小类
    const [subclassAll,setSubclassAll] = useState ([])//全部费用小类
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [shipTypes, setShipTypes] = useState({});// 船舶类型
    const [vesselType,setVesselType] = useState({})//船舶属性
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [trade, setTrade] = useState({});// 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [state,setState] = useState({})//当前状态
    const [withinBoundary, setWithinBoundary] = useState({});// 是否边界内
    const Intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [confirmationStatus,setConfirmationStatus] = useState({})//应付确认状态
    const [yfPostStatus,setYfPostStatus] = useState({})//总部应付记账状态
    const [sfVerifyStatus,setSfVerifyStatus] = useState({})//实付确认状态
    const [sfPkgFlag,setSfPkgFlag] = useState({})//实付数据包状态
    const [sfPostStatus,setSfPostStatus] = useState({})//总部实付记帐状态
    const [ygVerifyStatus,setYgVerifyStatus] = useState({})//预估确认状态
    const [stateTable,setStateTable] = useState({})//表格状态
    const [spinflag,setSpinflag] = useState(false)
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
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        // acquireSelectData('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDatas('AFCM.BARGE.TYPE',setShipTypes ,$apiUrl);// 船舶类型
        acquireSelectDatas('VESSELTYPE',setVesselType,$apiUrl);//船舶属性
        acquireSelectDatas('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectData('AGMT.VAT.FLAG',setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectDatas('CURRENT.STATUS',setState ,$apiUrl);// 当前状态
        acquireSelectDatas('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);  // 是否边界内
        acquireSelectDatas('AFCM.HIS.YFVERIFYSTATUS',setConfirmationStatus,$apiUrl)//应付确认状态
        acquireSelectDatas('AFCM.HIS.YFPOSTSTATUS',setYfPostStatus,$apiUrl)//总部应付记账状态
        acquireSelectDatas('AFCM.OFF.VERIFYSTATUS',setSfVerifyStatus,$apiUrl)//实付确认状态
        acquireSelectDatas('AFCM.PACKAGE.FLAG',setSfPkgFlag,$apiUrl)//实付数据包状态
        acquireSelectDatas('AFCM.OFF.POSTSTATUS',setSfPostStatus,$apiUrl)//总部实付记帐状态
        acquireSelectDatas('AFCM.HIS.POSTSTATUS',setYgVerifyStatus,$apiUrl)//预估确认状态
        acquireSelectDatas('AFCM.HIS.CURRSTATUS',setStateTable ,$apiUrl);// 表格当前状态
        
        
    },[])

    useEffect(()=>{
        queryForm.setFieldsValue({
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            agencyCode: company.agencyCode,
        })
    },[company,acquireData])

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
   
    //查询历史信息表格文本 
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
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
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
            key:'SF_SIDE'
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
            title: <FormattedMessage id="lbl.Agreement-currency-amount-USD" />,//协议币金额（USD）
            dataType: 'dataAmount',
            dataIndex: 'totalAmountinUSD',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount-CNY" />,//协议币金额（CNY）
            dataType: 'dataAmount',
            dataIndex: 'totalAmountInCNY',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount-USDb" />,//协议币金额（本位币种）
            dataType: 'dataAmount',
            dataIndex: 'totalAmountInStd',
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
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,//是否含税价
            dataType:priceIncludingTax.values,
            dataIndex: 'vatFlag',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,//协议币税金（参考）
            dataIndex: 'vatAmount',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,//协议币调整税金（参考）
            dataIndex: 'vatReviseAmount',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Standard-currency" />,//本位币种
            dataIndex: 'agencyCurrencyCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmountInAgency',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,//本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmountInAgency',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,//本位币税金（参考）
            dataIndex: 'vatAmountInAgency',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,//本位币调整税金(参考)
            dataIndex: 'reviseVatAmountInAgency',
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
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,//应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'paymentAmount',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.AP-outlets" />,//应付网点
            dataIndex: 'customerSapID',
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
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.estimate" />,//向谁预估
            dataIndex: 'ygSide',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,//向谁报账
            dataIndex: 'sfSide',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
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
            title: <FormattedMessage id="lbl.Whether-the-lock" />,//是否锁定
            dataIndex: 'lockedIndicator',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Unlock-date" />,//解锁日期
            dataType: 'dateTime',
            dataIndex: 'unLockDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.afcm-0056" />,//解锁人员
            dataIndex: 'unLockUser',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.current-state" />,//当前状态
            dataType:stateTable.values,
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
            title: <FormattedMessage id="lbl.Estimate-the-build-date" />,//预估生成日期
            // dataType: 'dateTime',
            dataIndex: 'ygGenDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Estimated-order-number" />,//预估单号码
            dataIndex: 'ygListCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Estimate-the-confirmation-date" />,//预估确认日期
            dataType: 'dateTime',
            dataIndex: 'ygVerifyDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Estimate-confirmation-status" />,//预估确认状态
            dataType:ygVerifyStatus.values,
            dataIndex: 'ygVerifyStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Whether-to-generate-estimated-packets" />,//是否生成预估数据包
            dataIndex: 'ygPkgFlag',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Estimate-the-batch-of-packets" />,//预估数据包批次
            dataIndex: 'ygPkgProcessId',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Estimate-billing-status" />,//预估记账状态
            dataType:ygVerifyStatus.values,
            dataIndex: 'ytPostStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.To-cope-with-logo" />,//应付标志
            dataIndex: 'yfFlag',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Build-date-payable" />,//应付生成日期
            dataType: 'dateTime',
            dataIndex: 'yfGenDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Invoice-number" />,//发票号码
            dataIndex: 'yfListCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Confirmation-due-date" />,//应付确认日期
            dataType: 'dateTime',
            dataIndex: 'yfVerifyDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Payable-confirmation-status" />,//应付确认状态
            dataType:confirmationStatus.values,
            dataIndex: 'yfVerifyStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Payable-packet-status" />,//应付数据包状态
            dataType:sfPkgFlag.values,
            dataIndex: 'yfPkgFlag',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Payable-packet-batch" />,//应付数据包批次
            dataIndex: 'yfPkgProcessId',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Headquarter-accounting-status-payable" />,//总部应付记账状态
            dataType:yfPostStatus.values,
            dataIndex: 'yfPostStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Billing-date-payable-at-headquarters" />,//总部应付记账日期
            dataType: 'dateTime',
            dataIndex: 'yfBudat',
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
            dataType:sfVerifyStatus.values,
            dataIndex: 'sfVerifyStatus',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Paid-packet-state" />,//实付数据包状态
            dataType:sfPkgFlag.values,
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
            title: <FormattedMessage id="lbl.afcm-0055" />,//总部实付记帐状态
            dataType:sfPostStatus.values,
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
        },
        {
            title: <FormattedMessage id="lbl.Tax-amount" />,//税额
            dataType: 'dataAmount',//保留小数点后一位
            dataIndex: 'taxAmountInAgency',
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
            dataType: 'dataAmount',
            dataIndex: 'reviseAmountInClearing',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,//结算币税金(参考)
            dataIndex: 'reviseVatAmountInClearing',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金(参考)
            dataIndex: 'reviseVatAmountInClearing',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Manual-adjustment-mark" />,//手工调整标志
            dataIndex: 'adjustManual',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]

    const columnsCNT = [
        {
            title:<FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclass,
            dataIndex: 'feeType',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'referenceCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Company (B/L)" />,//公司(提单)
            dataIndex: 'billCompanyCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,//实际是否发生
            dataIndex: 'actualFlag',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.price" />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.The-unit-price-categories" />,//单价类别
            dataIndex: 'feePriceType',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.TEU" />,//TEU
            dataIndex: 'teuMis',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'feeAmount',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Agreement-number" />,//协议号码
            dataIndex: 'feeAgmtCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.The-loading-port" />,//第一装港
            dataIndex: 'firstPolCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.The-final-port-of-discharge" />,//最后卸港
            dataIndex: 'lastPodCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Box" />,//箱型
            dataIndex: 'containerType',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.size" />,//尺寸
            dataIndex: 'containerSize',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.ac.cntr-num" />,//箱号
            dataIndex: 'appendCnt',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'cargoTradeLaneCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.cargo-class" />,//货类
            dataIndex: 'cargoNatureCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.empty-container-mark" />,//空重箱标志
            dataIndex: 'fullEmptyInd',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.bound-sign" />,//进出口标志
            dataIndex: 'bound',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Transit-logo" />,//中转标志
            dataIndex: 'transmitInd',
            sorter: false,
            align:'left',
            width: 100,
            
        },{
            title:<FormattedMessage id="lbl.Whether-the-SOC-box" />,//是否SOC箱
            dataIndex: 'socInd',
            sorter: false,
            align:'left',
            width: 100,
            
        },
    ]
    // 
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false)
        com()
        setTableData([])
        if(search){
            pagination.current=1
        }
        let query = queryForm.getFieldValue()
        // 业务时间/SVVD/港口至少输入一项
        if(!query.activeDate&&!query.svvdId&&!query.portCode){
            setBackFlag(false)
            Toast('',Intl.formatMessage({id:'lbl.afcm-0053'}) , 'alert-error', 5000, false)
        }else{
            //业务时间间隔不能超过92天
            let dates =query.activeDate ? Math.abs((query.activeDate[0] - query.activeDate[1]))/(1000*60*60*24) : null
            if(dates>92){
                setBackFlag(false)
                Toast('',Intl.formatMessage({id: 'lbl.afcm-0064'}), 'alert-error', 5000, false)
            }else{
                setSpinflag(true)
                setBackFlag(true)
                const localsearch=await request($apiUrl.AG_FEE_HIS_SEARCH_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            ...query,
                            'activeDate':undefined,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                        },
                        // 'sorter':sorter
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    let data=localsearch.data
                    let datas=localsearch.data.resultList
                    setTabTotal(data.totalCount)
                    setTableData([...datas])
                    setPage({...pagination})
                    setSpinflag(false)
                }else{
                    Toast('', localsearch.errorMessage , 'alert-error', 5000, false)
                    setSpinflag(false)
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
                let downData = await request($apiUrl.AG_FEE_HIS_EXP_LIST,{
                    method:"POST",
                    data:{
                        "params":{
                            ...query,
                            Date:undefined,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                        },
                        'excelFileName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF-hist.qy-hist-info'}),
                        sheetList: [{//sheetList列表
                            dataCol:tddata,
                            sumCol: {//汇总字段
                            },
                        'sheetName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF-hist.qy-hist-info'}),
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
                        navigator.msSaveBlob(blob, Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF-hist.qy-hist-info'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                    } else {
                        let downloadElement = document.createElement('a');  //创建元素节点
                        let href = window.URL.createObjectURL(blob); // 创建下载的链接
                        downloadElement.href = href;
                        downloadElement.download = Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF-hist.qy-hist-info'}) + '.xlsx'; // 下载后文件名
                        document.body.appendChild(downloadElement); //添加元素
                        downloadElement.click(); // 点击下载
                        document.body.removeChild(downloadElement); // 下载完成移除元素
                        window.URL.revokeObjectURL(href); // 释放掉blob对象
                    }
                }
            }
        }
    }
    //下载航次及箱子
    const downlodVoyage = async () =>{
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
                let cntData = {}
                columnsCNT.map((v, i) => {
                    cntData[v.dataIndex] = Intl.formatMessage({id: v.title.props.id})
                })
                console.log(tddata)
                let downData = await request($apiUrl.AG_FEE_HIS_EXP_CN,{
                    method:"POST",
                    data:{
                        "params":{
                            ...query,
                            Date:undefined,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                        },
                        'excelFileName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF-hist.qy-hist-info'}),
                        sheetList: [
                            {//sheetList列表
                                dataCol:tddata,
                                sumCol: {//汇总字段
                                },
                            'sheetName':Intl.formatMessage({id:'lbl.afcm-0058'}),
                            },
                            {//sheetList列表
                                dataCol:cntData,
                                sumCol: {//汇总字段
                                },
                            'sheetName':Intl.formatMessage({id:'lbl.afcm-0059'}),
                            },
                        ]
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
                        navigator.msSaveBlob(blob, Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF-hist.qy-hist-info'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                    } else {
                        let downloadElement = document.createElement('a');  //创建元素节点
                        let href = window.URL.createObjectURL(blob); // 创建下载的链接
                        downloadElement.href = href;
                        downloadElement.download = Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF-hist.qy-hist-info'}) + '.xlsx'; // 下载后文件名
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
                        {/* <Select name='agencyCode' showSearch={true} flag={true}   label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode} />   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} selectChange={selectChangeBtn}  label={<FormattedMessage id='lbl.Big-class-fee'/>}  span={6} options={costKey} />
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>}  span={6} options={subclass} />
                        {/* 船舶属性 */}
                        <Select name='vesselProperty' flag={true} label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselType.values}/>  
                        {/* 贸易区 */}
                        <Select name='tradeZoneCode' flag={true}  label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6}  options={trade.values} selectChange={companyIncident}/>  
                        {/* Trde */}
                        <Select name='tradeCode' flag={true} label={<FormattedMessage id='lbl.Trade'/>} span={6} options={tradeCode} selectChange={trades} />  
                        {/* 贸易线 */}
                        <Select name='tradeLaneCode' flag={true}  label={<FormattedMessage id='lbl.Trade-line'/>} span={6} options={tradeLine}/>  
                        {/* 预估单号码 */}
                        <InputText name='ygListCode'  label={<FormattedMessage id='lbl.Estimated-order-number'/>}   span={6}/>  
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate'  label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 当前状态 */}
                        <Select name='currentStatus' flag={true} label={<FormattedMessage id='lbl.current-state'/>} span={6} options={state.values}/>  
                        {/* 发票号码 */}
                        <InputText name='yfListCode' label={<FormattedMessage id='lbl.Invoice-number'/>}   span={6}/>  
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>}   span={6}/> 
                        {/* 船舶代码 */}
                        <InputText name='vesselCode'   label={<FormattedMessage id='lbl.Ship-code'/>}   span={6}  />  
                        {/* 船舶类型 */}
                        <Select name='bargeType' flag={true}  label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={shipTypes.values}/>  
                        {/* 报账单号码 */}
                        <InputText name='sfListCode'   label={<FormattedMessage id='lbl.Reimbursement-number'/>}   span={6}/>  
                        {/* SVVD */}
                        <InputText name='svvdId' styleFlag={backFlag}  label={<FormattedMessage id='lbl.SVVD'/>}   span={6}/>  
                        {/* 港口 */}
                        <InputText name='portCode' styleFlag={backFlag}   label={<FormattedMessage id='lbl.port'/>}   span={6}/>       
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载航次及箱子 */}
                    <Button onClick={downlodVoyage} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download-voyage-box'/></Button>
                    {/* 下载航次 */}
                    <Button onClick={downlod} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download.voyage'/></Button>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button onClick={reset} ><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=>{pageChange(page,'','search')}} > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
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