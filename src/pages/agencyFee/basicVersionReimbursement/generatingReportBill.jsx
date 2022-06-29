import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, TradeData, momentFormat, costCategories, agencyCodeData, acquireSelectDatas, acquireSelectDataExtend, formatCurrencyNew} from '@/utils/commonDataInterface';
import moment from 'moment';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row, Modal, Tabs} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import DatePicker from '@/components/Common/DatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import { createFromIconfontCN } from '@ant-design/icons';
import CosModal from '@/components/Common/CosModal'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SelectOutlined,//选择生成发票
    UnorderedListOutlined,//全部生成发票
    CloseOutlined,//关闭
} from '@ant-design/icons'
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_dkztm8notr4.js', // 在 iconfont.cn 上生成
  });

//---------------------------------------------- 生成报账单-------------------------------------------------

let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const { TabPane } = Tabs;
const confirm = Modal.confirm
const LocalChargeComputationProtocol =()=> {
    const [agencyCode, setAgencyCode] = useState([]);   // 代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    const [trade, setTrade] = useState({}); // 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [checkStatus,setCheckStatus] = useState({});//审核状态
    const [costKey, setCostKey] = useState([]);    // 费用大类
    const [subclass,setSubclass] = useState([]);    // 费用类型
    const [boundary, setboundary] = useState({});    // 是否边界内
    const [bargeType, setBargeType] = useState({});    // 船舶类型
    const [eov, setEov] = useState({});    // EOV
    const [sumList,setSumList] = useState([])//汇总数据
    const [billingData,setBillingData] = useState([])//选择报账单数据
    const [vesselProperty,setVesselProperty] = useState({})//船舶属性
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [sfPkgProcessId,setSfPkgProcessId] = useState({});//是否删除航次
    const [currentStatus, setCurrentStatus] = useState({});// 当前状态
    const [spinflag,setSpinflag] = useState(false)
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [flag,setFlag] = useState(false)
    const [checked, setChecked] = useState([]);
    const [uuidData, setUuidData] = useState([]); // 选择数据
    const [selectFlag, setSelectFlag] = useState(false)
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    const [crTableData,setCrTableData] = useState([])//cr表格数据
    const [tableName,setTableName] = useState([])//弹框表格字段
    const [collectFlag,setCollectFlag] = useState(true)//汇总表格是否显示
    const [cntSummary,setCntSummary] = useState([])
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
    const [queryForms] = Form.useForm();
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
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            exFlag:boundary.defaultValue,
        })
    }, [company, acquireData,boundary])

    useEffect(() => {
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectData('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectDatas('AFCM.BOUNDARY.FLAG',setboundary,$apiUrl);//是否边界内
        acquireSelectDatas('AFCM.BARGE.TYPE',setBargeType,$apiUrl);//船舶类型
        acquireSelectDatas('AFCM.EOV.STATUS',setEov,$apiUrl);//EOV
        acquireSelectDatas('VESSELTYPE',setVesselProperty,$apiUrl);//船舶属性
        acquireSelectDatas('AFCM.ADJ.MANUAL', setSfPkgProcessId, $apiUrl);  // 是否删除航次
        acquireSelectDatas('CURRENT.STATUS',setCurrentStatus,$apiUrl);//当前状态
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY','CB0068',setAcquireData, $apiUrl);// 船东
    }, [])

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
        setCheckStatus(value)
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

   
    //生成报账单表格文本 
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
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVd
            dataIndex: 'svvd',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
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
            title: <FormattedMessage id="lbl.EOV" />,//EOV
            dataIndex: 'eovStatus',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
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
            title: <FormattedMessage id="lbl.Ship-property" />,//船舶属性
            dataType:vesselProperty,
            dataIndex: 'vesselProperty',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.argue.trade-code" />,//贸易区
            dataType:trade,
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
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'tradeLaneCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.current-state" />,//当前状态
            dataType:currentStatus,
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
            dataType: 'dataAmount',
            dataIndex: 'reviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
            
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
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount-usd" />,//协议币调整金额（USB）
            dataType: 'dataAmount',
            dataIndex: 'totalAmountinUSD',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
            
        },
        {
            title: <FormattedMessage id="lbl.USD-currency" />,//USB汇率
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
            dataType:boundary,
            dataIndex: 'exFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            dataIndex: 'sfGenDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Whether-to-delete-the-voyage" />,//是否删除航次
            dataType:sfPkgProcessId,
            dataIndex: 'sfPackageProcessID',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
    ]

    //cr明细表格文本  箱号 - 生成日期  feeContainer
    const feeContainers=[
        {
            title: <FormattedMessage id="lbl.ac.cntr-num" />,//箱号
            dataIndex: 'appendCntNum',
            key:'COMM_AGMT_CDE',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.Box" />,//箱型
            dataIndex: 'containerType',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.size" />,//尺寸
            dataIndex: 'containerSize',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title: <FormattedMessage id="lbl.Empty-heavy-box" />,//空重箱
            dataIndex: 'fullEmptyInd',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.Whether-the-SOC-box" />,//是否SOC箱
            dataIndex: 'socInd',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100,
            
        },
        {
            title:<FormattedMessage id="lbl.bound" />,//进出口
            dataIndex: 'expImpInd',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.Transfer" />,//中转
            dataIndex: 'transmitInd',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.TEU-num" />,//TEU数
            dataIndex: 'teuMis',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.rate-one" />,//费率
            dataIndex: 'feeAmount',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.Loading-port" />,//装港
            dataIndex: 'firstPolCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.Unloading-port" />,//卸港
            dataIndex: 'lastPodCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.Empty-box-bill-num" />,//空箱号/提单号
            dataIndex: 'referenceCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'billCompanyCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.Agreement-number" />,//协议号码
            dataIndex: 'feeAgmtCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.generation-date" />,//生成日期
            dataIndex: 'recordUpdateDate',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        }
    ]
    //cr明细表格文本2 svvd - bl - 生成日期    feeSvvd
    const feeSvvd=[
        {
            title: <FormattedMessage id="lbl.SVVD" />,//svvd
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.Bl" />,//BL
            dataIndex: 'referenceCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.Belong-company" />,//所属公司
            dataIndex: 'billCompanyCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.amount" />,//金额
            dataIndex: 'feeAmount',
            key:'COMPANY_CDE',
            sorter: false,
            align:'right',
            width: 100,
            
        },
        {
            title:<FormattedMessage id="lbl.Agreement-number" />,//协议号码
            dataIndex: 'feeAgmtCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.generation-date" />,//生成日期
            dataIndex: 'recordUpdateDate',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        }
    ]
    //cr明细表格文本3 svvd - 生成日期
    const feeBill=[
        {
            title: <FormattedMessage id="lbl.SVVD" />,//svvd
            dataIndex: 'svvdId',
            key:'COMM_AGMT_CDE',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.Trade" />,//TRADE
            dataIndex: 'tradeCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'tradeLaneCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title: <FormattedMessage id="lbl.Generate-new-linked-port" />,//是否生成性挂港
            dataIndex: 'productInd',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.Ship-property" />,//船舶属性
            dataIndex: 'vesselProperty',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100,
            
        },
        {
            title:<FormattedMessage id="lbl.Total-shipping-space" />,//船舶总箱位
            dataIndex: 'vesselTeus',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.Net-tonnage" />,//船舶净吨位
            dataIndex: 'netWeight',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.amount" />,//金额
            dataIndex: 'feeAmount',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'right',
        
        },
        {
            title:<FormattedMessage id="lbl.Agreement-num" />,//协议编号
            dataIndex: 'feeAgmtCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.Algorithm" />,//算法
            dataIndex: 'calculationMethod',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },
        {
            title:<FormattedMessage id="lbl.generation-date" />,//生成日期
            dataIndex: 'recordUpdateDate',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        }
    ]

    //cr汇总表格文本
    let collectColumns =[
        {
            title:<FormattedMessage id="lbl.Box-size" />,//箱型尺寸
            dataIndex: 'containerSize',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.Empty-weight-sign" />,//空重标志
            dataIndex: 'fullEmptyInd',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.bound" />,//进出口
            dataIndex: 'expImpInd',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.SOC-sign" />,//SOC标志
            dataIndex: 'socInd',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.Container-capacity" />,//箱量
            dataIndex: 'num',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.rate-one" />,//费率
            dataIndex: 'rate',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
        
        },{
            title:<FormattedMessage id="lbl.amount" />,//金额
            dataIndex: 'totalAmount',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'right',
        
        }
    ]


    let columnss = [
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
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
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币种调整金额
            dataIndex: 'reviseAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('','', '', 5000, false)
        setChecked([])
        let query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        setTableData([])
        setSumList([])
        if(!query.agencyCode||!query.feeClass){
            setAgencyFlag(false)
            //代理编码/费用大类必须输入
            Toast('', formatMessage({id: 'lbl.agency-categories-must-enter'}), 'alert-error', 5000, false)
        }else{
            setAgencyFlag(true)
            setSpinflag(false)
            if(!query.activeDate&&!query.buildDate&&!query.svvd&&!query.erReceiptCode&&!query.serviceLoopCode){
                // 业务日期/提单号/生成日期/Svvd必须输入一个且时间间隔不能超过92 
                setBackFlag(false)
                Toast('', formatMessage({id: 'lbl.activeDate-generateDate-svvd'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_OFFCR_SEARCH_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            'soCompanyCode':query.soCompanyCode,
                            'agencyCode':  query.agencyCode,
                            'feeClass':  query.feeClass,
                            'feeType':  query.feeType,
                            'vesselProperty':  query.vesselProperty,
                            'activeDateFrom':  query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':  query.activeDate?momentFormat(query.activeDate[1]):null,
                            'buildDateFrom':  query.buildDate?momentFormat(query.buildDate[0]):null,
                            'buildDateTo':  query.buildDate?momentFormat(query.buildDate[1]):null,
                            'tradeZoneCode':  query.tradeZoneCode,
                            'itsTradeCode':  query.itsTradeCode,
                            'tradeLaneCode':  query.tradeLaneCode,
                            'officeCode':  query.officeCode,
                            'exFlag':  query.exFlag,
                            'serviceLoopCode':  query.serviceLoopCode,
                            'vesselCode':  query.vesselCode,
                            'voyageNumber':  query.voyageNumber,
                            'bargeType':  query.bargeType,
                            'svvd':  query.svvd,
                            'portCode':  query.portCode,
                            'eovStatus':  query.eovStatus,
                            },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    let data=localsearch.data
                    let datas=data ? data.resultList : null
                    let datass=data ? data.sumList : null
                    datas ? datas.map((v,i)=>{
                        v['id']=i
                    }) : null
                    datass ? datass.map((v,i)=>{
                        v['id']=i
                    }) : null
                    setTabTotal(data.totalCount)
                    setSpinflag(false)
                    datas ? setTableData([...datas]) : null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    datass ? setSumList([...datass]) : null
                    setFlag(true)
                }else{
                    setSpinflag(false)
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
                    setTableData([])
                    setSumList([])
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
        setSumList([])
        setAgencyFlag(true)
        setBackFlag(true)
        setFlag(false)
        setChecked([])
    }
    //单击
    const setSelectedRows = (val) =>{
        setBillingData([])
        console.log(billingData,val)
        setBillingData([...val])
    }
    console.log(billingData)
    //双击
    const [parameterData,setParameterData] = useState({})
    const [calculationMethod,setCalculationMethod] = useState('')
    const doubleClickRow = async(parameter) => {
        setIsModalVisible(true)
        setParameterData(parameter)
        setSpinflag(true)
        let localsearch = await request($apiUrl.AG_FEE_SEARCH_DETAILLIST,{
            method:'POST',
            data:{
                'params':{...parameter}
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            setSpinflag(false)
            let data = localsearch.data
            let his = data.feeHis
            let feeContainer = data.feeContainers?data.feeContainers:null
            let feeBills = data.feeBills?data.feeBills:null
            let feeSvvds = data.feeSvvds?data.feeSvvds:null
            let cntSummaryList = data.cntSummaryList?data.cntSummaryList:null
            let  mode = parameter.calculationMethod;
            setCalculationMethod(mode)
            console.log(parameter.calculationMethod)
            let tableName
            if (mode) {
                if ("CNT" == mode || "AGG" == mode){
                    tableName = "feeContainer"
                } else if ("CALL" == mode || "MCALL" == mode || "VOY" == mode || "DATE" == mode || "VSHP" == mode || "VTEU" == mode || "CAL" == mode) {
                    tableName = "feeSvvd";
                } else {
                    tableName = "feeBill";
                }
            }
            if ("feeContainer" == tableName) { //箱号 - 生成日期
                cntSummaryList?cntSummaryList.map((v,i)=>{
                    v['id'] = i
                }):null
                feeContainer?setCrTableData([...feeContainer]):null// 数据：列表
                cntSummaryList?setCntSummary([...cntSummaryList]):null//汇总
                setTableName([...feeContainers])// 显示字段：
                setCollectFlag(true)
            } else if ("feeSvvd" == tableName) {//svvd - bl - 生成日期
                feeSvvds?setCrTableData([...feeSvvds]):null// 数据：
                setTableName([...feeSvvd])// 显示字段：
                setCollectFlag(false)
            } else {// svvd - 生成日期
                feeBills?setCrTableData([...feeBills]):null // 数据：
                setTableName([...feeBill]) // 显示字段：
                setCollectFlag(false)
            }
            his?queryForms.setFieldsValue({
                'activityDate':his.activityDate?moment(his.activityDate):null,
                'feeType':his.feeType,
                'svvd':his.svvd,
                'portCode':his.portCode,
                'eovStatus':his.eovStatus,
                'tradeCode':his.tradeCode,
            }):null
        }else{
            setSpinflag(false)
        }
        
    }
    const handleCancel = () =>{
        setIsModalVisible(false)
        // setIncomeTableData([])
        queryForms.resetFields();
        setCntSummary([])
        setCrTableData([])
    }

     //生成报账单---全部生成报账单
     const AllGenerateInvoice = async () =>{
        Toast('', '', '', 5000, false);
        let query  =queryForm.getFieldValue()
        const confirmModal = confirm({
            title: formatMessage({id:'lbl.select-generate-Invoice'}),
            content: formatMessage({id: 'lbl.ag-fee-all-buildList'}),
            okText: formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async  onOk() {
                confirmModal.destroy()
                setSpinflag(true)
                const Invoice=await request($apiUrl.AG_FEE_OFFCR_BUILDBILL_ALL,{
                    method:"POST",
                    data:{
                        "params":{
                            'soCompanyCode': query.soCompanyCode,
                            'agencyCode':  query.agencyCode,
                            'feeClass':  query.feeClass,
                            'feeType':  query.feeType,
                            'vesselProperty':  query.vesselProperty,
                            'activeDateFrom':  query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':  query.activeDate?momentFormat(query.activeDate[1]):null,
                            'buildDateFrom':  query.buildDate?momentFormat(query.buildDate[0]):null,
                            'buildDateTo':  query.buildDate?momentFormat(query.buildDate[1]):null,
                            'tradeZoneCode':  query.tradeZoneCode,
                            'itsTradeCode':  query.itsTradeCode,
                            'tradeLaneCode':  query.tradeLaneCode,
                            'officeCode':  query.officeCode,
                            'exFlag':  query.exFlag,
                            'serviceLoopCode':  query.serviceLoopCode,
                            'vesselCode':  query.vesselCode,
                            'voyageNumber':  query.voyageNumber,
                            'bargeType':  query.bargeType,
                            'svvd':  query.svvd,
                            'portCode':  query.portCode,
                            'eovStatus':  query.eovStatus,
                        },
                    }
                })
                if(Invoice.success){
                    setSpinflag(false)
                    Toast('',Invoice.message, '', 5000, false);
                    setTableData([])
                    setSumList([])
                }else{
                    setSpinflag(false)
                }
               
            }
        })
       
    }

    //生成报账单---选择报账单
    const SelectGenerateInvoice = async () =>{
      console.log('billingData',billingData)
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: formatMessage({id:'lbl.select-generate-Invoice'}),
            content: formatMessage({id: 'lbl.ag-fee-select-buildList'}),
            okText: formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async  onOk() {
                confirmModal.destroy()
                setSpinflag(true)
                const Invoice=await request($apiUrl.AG_FEE_OFFCR_BUILDBILL_SELECT,{
                    method:"POST",
                    data:{
                        "paramsList":[
                            ...billingData,
                        ]
                    }
                })
                console.log(Invoice)
                if(Invoice.success){ 
                    setSpinflag(false) 
                    setBillingData([])
                    pageChange(page)
                    setChecked([])
                    setTimeout(()=>{
                        Toast('', '', '', 5000, false);
                        Toast('',Invoice.message, '', 5000, false)
                    } ,1000);
                }else{
                    setSpinflag(false)
                    Toast('',Invoice.errorMessage, 'alert-error', 5000, false);
                }
            
            }
        })
    }
    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        setSpinflag(true)
        let downData = await request($apiUrl.AG_FEE_OFFCR_EXP_LIST,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode':query.soCompanyCode,
                    'agencyCode':  query.agencyCode,
                    'feeClass':  query.feeClass,
                    'feeType':  query.feeType,
                    'vesselProperty':  query.vesselProperty,
                    'activeDateFrom':  query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':  query.activeDate?momentFormat(query.activeDate[1]):null,
                    'buildDateFrom':  query.buildDate?momentFormat(query.buildDate[0]):null,
                    'buildDateTo':  query.buildDate?momentFormat(query.buildDate[1]):null,
                    'tradeZoneCode':  query.tradeZoneCode,
                    'itsTradeCode':  query.itsTradeCode,
                    'tradeLaneCode':  query.tradeLaneCode,
                    'officeCode':  query.officeCode,
                    'exFlag':  query.exFlag,
                    'serviceLoopCode':  query.serviceLoopCode,
                    'vesselCode':  query.vesselCode,
                    'voyageNumber':  query.voyageNumber,
                    'bargeType':  query.bargeType,
                    'svvd':  query.svvd,
                    'portCode':  query.portCode,
                    'eovStatus':  query.eovStatus,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        activityDate: formatMessage({id:"lbl.argue.bizDate" }),
                        svvd: formatMessage({id:"lbl.SVVD" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        feeType: formatMessage({id:"lbl.Small-class-fee" }),
                        eovStatus: formatMessage({id:"lbl.EOV" }),
                        vslName: formatMessage({id:"lbl.ht.statement.upload-vessel-name" }),
                        voyageNumber: formatMessage({id:"lbl.voyage-number" }),
                        vesselCode: formatMessage({id:"lbl.Ship-code" }),
                        vesselProperty: formatMessage({id:"lbl.Ship-property" }),
                        tradeZoneCode: formatMessage({id:"lbl.argue.trade-code" }),
                        tradeCode: formatMessage({id:"lbl.Trade" }),
                        tradeLaneCode: formatMessage({id:"lbl.Trade-line" }),
                        currentStatus: formatMessage({id:"lbl.current-state" }),
                        rateCurrency: formatMessage({id:"lbl.Agreement-currency" }),
                        totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                        reviseAmount: formatMessage({id:"lbl.Agreement-currency-adjustment-amount" }),
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        totalAmountInClearing: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                        reviseAmountInClearing: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                        totalAmountinUSD: formatMessage({id:"lbl.Agreement-currency-adjustment-amount-usd" }),
                        usdChangeRate: formatMessage({id:"lbl.USD-currency" }),
                        cnyChangeRate: formatMessage({id:"lbl.Exchange-Rate-of-Settlement-Currency" }),
                        exFlag: formatMessage({id:"lbl.within-boundary" }),
                        sfGenDate: formatMessage({id:"lbl.generation-date" }),
                        sfPackageProcessID: formatMessage({id:"lbl.Whether-to-delete-the-voyage" }),
                    },
                    sumCol: {//汇总字段
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        totalAmountInClearing: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                        reviseAmountInClearing: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'})+'.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    const download = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        let tddata = {}
        tableName.map((v, i) => {
            tddata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        let detailColm = {}
        collectColumns.map((v, i) => {
            detailColm[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        setSpinflag(true)
        let downData = await request($apiUrl.AG_FEE_OFFCR_EXP_DETAILLIST,{
            method:"POST",
            data:{
                "params":{
                    ...parameterData
                },
                'excelFileName':company.agencyCode+formatMessage({id:'lbl.The-details-of'}),
                sheetList: [
                    {//sheetList列表
                    dataCol: {
                        activityDate:formatMessage({id:'lbl.argue.bizDate'}),
                        feeType:formatMessage({id:'lbl.Small-class-fee'}),
                        svvd:formatMessage({id:'lbl.SVVD'}),
                        portCode:formatMessage({id:'lbl.port'}),
                        eovStatus:formatMessage({id:'lbl.EOV'}),
                        tradeCode:formatMessage({id:'lbl.Trade-line'}),
                    },
                    sumCol: detailColm,
                    'sheetName':formatMessage({id:'lbl.Head-info'}),
                    },
                    {//sheetList列表
                        dataCol: tddata,
                        sumCol: {},
                        'sheetName':calculationMethod,
                    },
                    {//sheetList列表
                        dataCol: detailColm,
                        sumCol:{} ,
                        'sheetName':formatMessage({id:'lbl.Total-info'}),
                    }
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
            Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false)
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'})+ '.xlsx'; // 下载后文件名
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
                        <Select span={6} name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={agencyFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} style={{background: agencyFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* <Select name='agencyCode' showSearch={true}style={{background:agencyFlag?'white':'yellow'}}  label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode}/>   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true}style={{background:agencyFlag?'white':'yellow'}}  label={<FormattedMessage id='lbl.Big-class-fee'/>}  span={6} options={costKey} selectChange={selectChangeBtn } />
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>}  span={6} options={subclass} />
                        {/* 船舶属性 */}
                        <Select name='vesselProperty' flag={true}  label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselProperty.values} />  
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='buildDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                        {/* 贸易区 */}
                        <Select name='tradeZoneCode' flag={true} label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6} options={trade.values} selectChange={companyIncident}/>  
                        {/* Trade */}
                        <Select name='itsTradeCode' flag={true} label={<FormattedMessage id='lbl.Trade'/>} span={6} options={tradeCode} selectChange={trades} />  
                        {/* 货物贸易线 */}
                        <Select name='tradeLaneCode' flag={true} label={<FormattedMessage id='lbl.Line-of-trade-in-goods'/>} span={6} options={tradeLine} />  
                        {/* office  */}
                        <InputText name='officeCode'  label={<FormattedMessage id='lbl.office'/>} span={6}/>  
                        {/* 是否边界内  */}
                        <Select name='exFlag' label={<FormattedMessage id='lbl.within-boundary'/>} span={6} options={boundary.values} />  
                        {/* 航线  */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>}   span={6}/>  
                        {/* 船舶代码 */}
                        <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code'/>}   span={6}/>  
                        {/* 航次 */}
                        <InputText name='voyageNumber'  label={<FormattedMessage id='lbl.voyage-number'/>}   span={6}/>  
                        {/* 船舶类型 */}
                        <Select name='bargeType' flag={true} label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={bargeType.values}/>  
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag}  label={<FormattedMessage id='lbl.SVVD'/>}   span={6}/>  
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>}   span={6}/>  
                        {/* EOV */}
                        <Select name='eovStatus' flag={true} label={<FormattedMessage id='lbl.EOV'/>}   span={6} options={eov.values} />  
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left' style={{width:'87%'}}>
                    {/* 下载按钮 */}
                    <Button disabled={flag?false:true} onClick={downlod}> <CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                    {/* 选择生成报账单 */}
                    <CosButton onClick={SelectGenerateInvoice} auth='AFCM-AG-OFFCR-001-B01' disabled={billingData.length>0?false:true} > <SelectOutlined/> <FormattedMessage id='lbl.Select-Generate-Report-Billing'/></CosButton>
                    {/* 全部生成报账单 */}
                    <CosButton onClick={AllGenerateInvoice} auth='AFCM-AG-OFFCR-001-B02' disabled={flag?false:true}> <UnorderedListOutlined/> <FormattedMessage id='lbl.Generate-all-reported-bills'/></CosButton>
                    {/* 邮件发送 */}
                    <Button disabled={flag?false:true}> <MyIcon type="icon-email-success" /> <FormattedMessage id='lbl.mailing'/></Button>
                    <span style={{color:'red'}}><FormattedMessage id='lbl.afcm-0097' /></span>
                </div>
                <div className='button-right' style={{width:'13%'}}>
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
                    // rowSelection={null}
                    handleDoubleClickRow={doubleClickRow}
                    selectWithClickRow={true}
                    // selectedRowKeys = {selectedRowKeys}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setSelectedRows(row);
                        }
                    }}
                />
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={sumList}
                    columns={columnss}
                    rowKey='id'
                    scrollHeightMinus={200}
                    pagination={false}
                    rowSelection={null}
                    // handleDoubleClickRow={doubleClickRow}
                    
                />
            </div>
            <Loading spinning={spinflag}/>
            {/*  */}
            <CosModal cbsTitle={company.agencyCode+formatMessage({id:'lbl.The-details-of'})} cbsWidth='70%'  bodyStyle={{height:'50%'}} cbsVisible={isModalVisible}  cbsFun={handleCancel}>
                <div>
                <Form 
                    form={queryForms}
                    name='func'
                    onFinish={handleQuery} 
                >
                    <Row>
                        {/* 业务日期 */}
                        <DatePicker isSpan={true}  name='activityDate' disabled={true} label={<FormattedMessage id='lbl.argue.bizDate'/>} span={7}/>
                        {/* 费用小类 */}
                        <InputText  isSpan={true}  name='feeType' disabled={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={7}/>
                        {/* svvd */}
                        <InputText  isSpan={true}  name='svvd' disabled={true} label={<FormattedMessage id='lbl.SVVD'/>} span={7}/>
                        {/* 港口 */}
                        <InputText isSpan={true}  name='portCode' disabled={true} label={<FormattedMessage id='lbl.port'/>} span={7}/>
                        {/* EOV */}
                        <InputText isSpan={true}  name='eovStatus' disabled={true} label={<FormattedMessage id='lbl.EOV'/>} span={7}/>
                        {/* 贸易线 */}
                        <InputText  isSpan={true}  name='tradeCode' disabled={true} label={<FormattedMessage id='lbl.Trade-line'/>} span={7}/>
                    </Row>
                </Form>
                </div>
               
                <div className='footer-table' style={{height:'50%',overflowY:'scroll',overflowX:'hidden'}} > 
                    <Tabs type="card">
                        {/* CR明细 */}
                        <TabPane tab={<FormattedMessage id='lbl.CR-detail' />} key="1">
                            <PaginationTable
                                dataSource={crTableData}
                                columns={tableName}
                                rowKey='id'
                                pageChange={pageChange}
                                rowSelection={null}
                                pagination={false}
                            />
                            {collectFlag?<PaginationTable
                                dataSource={cntSummary}
                                columns={collectColumns}
                                rowKey='id'
                                pageChange={pageChange}
                                rowSelection={null}
                                pagination={false}
                            />:null}
                        </TabPane>
                    </Tabs>
                </div>  
                <div className='main-button'>
                    <div className='button-left' >
                     
                    </div>
                    <div className='button-right' >
                        {/* 关闭 */}
                        <Button  onClick={handleCancel}><CloseOutlined /> <FormattedMessage id='btn.close' /></Button>
                        {/* 下载 */}
                        <Button onClick={download} > <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></Button>
                    </div>
                </div>
            </CosModal>
        </div>
    )
}
export default LocalChargeComputationProtocol