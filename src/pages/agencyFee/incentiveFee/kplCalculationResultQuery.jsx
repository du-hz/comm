import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDataExtend, agencyCodeData, momentFormat, costCategories, acquireSelectDatas, acquireSelectData, TradeData, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tabs} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import SelectVal from '@/components/Common/Select';
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    FileAddOutlined,
} from '@ant-design/icons'

//---------------------------------------------- KPI计算结果查询-------------------------------------------------
const { TabPane } = Tabs;
// const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//表格数据
    const [tableDataDetailed,setTableDataDetailed] = useState([])//明细表格数据
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [tabTotalDetailed,setTabTotalDetailed] = useState([]);//明细表格数据的个数
    const [calculationMethod,setcalculationMethod] = useState('')//判断明细表格
    const [tableDataDetails,setTableDataDetails] = useState([])//明细表格数据
    const [collectFlag,setCollectFlag] = useState(true)//汇总表格是否显示
    const [tableName,setTableName] = useState([])//弹框表格字段
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [spinflag,setSpinflag] = useState(false)
    const [costKey,setCostKey] = useState ([])//费用大类
    const [subclass,setSubclass] = useState ({})//费用小类
    const [shipTypes, setShipTypes] = useState({});// 船舶类型
    const [vesselType,setVesselType] = useState({})//船舶属性
    const [trade, setTrade] = useState({});// 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [actualFlag, setActualFlag] = useState({}); // 实际是否发生
    const [vatFlag,setVatFlag] = useState({})//是否含税价
    const [postCalcFlg,setPostCalcFlg] = useState({})//记账算法
    const [postMode,setPostMode] = useState({})//记账方式
    const [isYt,setIsYt] = useState({})//预提是否记账
    const [isBill,setIsBill] = useState({})//应付实付是否记账
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [defaultKey, setDefaultKey] = useState('1');
    const [value, setValue] = useState('')
    const [parameterData,setParameterData] = useState([])//
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
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        console.log(columnsSVVDs.length)
    }, [company, acquireData])

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDatas('AFCM.BARGE.TYPE',setShipTypes ,$apiUrl);// 船舶类型
        acquireSelectDatas('VESSELTYPE',setVesselType,$apiUrl);//船舶属性
        acquireSelectDatas('AFCM.AG.KPI.FEETYPE',setSubclass,$apiUrl);//费用小类
        acquireSelectDatas('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectDatas('AFCM.AG.KPI.ACTUALFLAG',setActualFlag,$apiUrl);//实际是否发生
        acquireSelectDatas('AGMT.VAT.FLAG',setVatFlag,$apiUrl);//是否含税价
        acquireSelectDatas('AFCM.AGMT.POST.CALC.FLAG',setPostCalcFlg,$apiUrl);//记账算法
        acquireSelectDatas('AFCM.AGMT.POST.CALC.MODE',setPostMode,$apiUrl);//记账方式
        acquireSelectDatas('AFCM.AGMT.YT.BUSINESS',setIsYt,$apiUrl);//预提是否记账
        acquireSelectDatas('AFCM.AGMT.YF.BUSINESS',setIsBill,$apiUrl);//应付实付是否记账
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        console.log(value)
    },[value])

    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
        
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
    
    //KPI计算结果查询表格文本 
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
            title: <FormattedMessage id="lbl.ht.statement.upload-vessel-name" />,//船名
            dataIndex: 'vslName',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
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
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
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
            title: <FormattedMessage id="lbl.office" />,//office
            dataIndex: 'officeCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,//实际是否发生 
            dataType:actualFlag.values,
            dataIndex: 'actualFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency"/>,//协议币种
            dataIndex: 'rateCurrency',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'YF_SIDE',
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
            title: <FormattedMessage id="lbl.Standard-currency" />,//本位币种
            dataIndex: 'agenceCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmountInAgency',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
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
            title: <FormattedMessage id="lbl.Tax-amount" />,//税额
            dataIndex: 'taxAmountInAgency',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?text.toFixed(1):text); 
            }
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
            dataType: 'dataAmount',
            dataIndex: 'totalAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
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
            title: <FormattedMessage id="lbl.On-line-area" />,//是否上线地区
            dataIndex: 'enableIndicator',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.argue.trade-code" />,//贸易区
            dataIndex: 'tradeZoneCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
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
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-production-port" />,//是否生产性挂港
            dataIndex: 'productIndicator',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.within-boundary" />,//是否边界内
            dataIndex: 'exFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-type" />,//船舶类型
            dataType:shipTypes.values,
            dataIndex: 'bargeType',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-property" />,//船舶属性
            dataType:vesselType.values,
            dataIndex: 'vesselProperty',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.arithmetic" />,//记账算法
            dataType:postCalcFlg.values,
            dataIndex: 'postCalcFlg',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.bookkeeping" />,//记账方式
            dataType:postMode.values,
            dataIndex: 'postMode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.estimate" />,//向谁预估
            dataIndex: 'ygSide',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
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
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,//向谁报账
            dataIndex: 'sfSide',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.actually" />,//应付实付是否记账
            dataType:isBill.values,
            dataIndex: 'isBill',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.withholding" />,//预提是否记账
            dataType:isYt.values,
            dataIndex: 'isYt',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]
    //BL明细
    const columnsBL = [
        {
            title:<FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataIndex: 'feeType',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'feeType',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Company (B/L)" />,//公司(提单)
            dataIndex: 'referenceCode',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataIndex: 'activityDate',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,//实际是否发生
            dataIndex: 'actualFlag',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'feeCurrencyCode',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.price" />,//单价
            dataIndex: 'feePrice',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'feeAmount',
            sorter: true,
            align:'right',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Agreement-number" />,//协议号码
            dataIndex: 'feeAgmtCode',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMode',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.On-line-area" />,//是否上线地区
            dataIndex: 'enableInd',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Whether-to-choose-to-charge" />,//是否择大收取
            dataIndex: 'compareInd',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Data-source" />,//数据源
            dataIndex: 'dataSource',
            sorter: true,
            align:'center',
            width: 100,
            
        }
    ]

    //明细列表1
    const columnss=[
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
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
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclass.values,
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'referenceCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Company (B/L)" />,//公司（提单）
            dataIndex: 'billCompanyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,//实际是否发生 
            dataType:actualFlag.values,
            dataIndex: 'actualFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency"/>,//协议币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.price" />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.The-unit-price-categories" />,//单价类别
            dataIndex: 'feePriceType',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.TEU" />,//TEU
            dataIndex: 'teuMis',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'feeAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-number" />,//协议号码
            dataIndex: 'feeAgmtCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.The-loading-port" />,//第一装港
            dataIndex: 'firstPolCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.The-final-port-of-discharge" />,//最后卸港
            dataIndex: 'lastPodCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Box" />,//箱型
            dataIndex: 'containerType',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.size" />,//尺寸
            dataIndex: 'containerSize',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.ac.cntr-num" />,//箱号
            dataIndex: 'appendCnt',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'cargoTradeLaneCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.cargo-class" />,//货类
            dataIndex: 'cargoNatureCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.empty-container-mark" />,//空重箱标志
            dataIndex: 'fullEmptyInd',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.bound-sign" />,//进出口标志
            dataIndex: 'bound',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Transit-logo" />,//中转标志
            dataIndex: 'transmitInd',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-SOC-box" />,//是否SOC箱
            dataIndex: 'socInd',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]
    
    //明细列表2
    const columnsss=[
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
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
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclass.values,
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,//实际是否发生 
            dataType:actualFlag.values,
            dataIndex: 'actualFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency"/>,//协议币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.price" />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'feeAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-type" />,//船舶类型
            dataType:shipTypes.values,
            dataIndex: 'bargeType',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Ship-property" />,//船舶属性
            dataType:vesselType.values,
            dataIndex: 'vesselProperty',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
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
            title: <FormattedMessage id="lbl.Agreement-number" />,//协议号码
            dataIndex: 'feeAgmtCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Whether-to-choose-to-charge" />,//是否择大收取
            dataIndex: 'compareInd',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.On-line-area" />,//是否上线地区
            dataIndex: 'enableInd',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-production-port" />,//是否生产性挂港
            dataIndex: 'productInd',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.percentage" />,//百分比
            dataIndex: 'percentage',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Shipping-space" />,//船舶箱位
            dataIndex: 'vesselTeus',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Vessel-net-tons" />,//船舶净吨
            dataIndex: 'netWeight',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]
    const columnsSVVDs = [
        {
            title:<FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'COMPANY_CDE',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.agency" />,//箱型尺寸
            dataIndex: 'POR_COUNTRY_CDE',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.agency" />,//佣金类型
            dataIndex: 'FND_COUNTRY_CDE',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.agency" />,//箱量
            dataIndex: 'TEU_RATE',
            sorter: true,
            align:'center',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.agency" />,//佣金金额
            dataIndex: 'CCY_CDE',
            sorter: true,
            align:'right',
            width: 100,
            
        },
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        let query = queryForm.getFieldValue();
        search?pagination.current=1:null
        setTableData([])
        if(!query.activeDate&&!query.svvdId&&!query.portCode){
            setBackFlag(false)
            //业务日期/svvd/港口 不能同时为空
            Toast('',formatMessage({id: 'lbl.Date-svvd--port-must-enter'}), 'alert-error', 5000, false)
        }else{
            setSpinflag(true)
            setBackFlag(true)
            const localsearch=await request($apiUrl.AG_FEE_KPL_SEARCH_QC_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params":{
                        'soCompanyCode': query.soCompanyCode,
                        "agencyCode":query.agencyCode,
                        "actualFlag":query.actualFlag,
                        "feeClass":query.feeClass,
                        "feeType":query.feeType,
                        "feeType":query.feeType,
                        "bargeType":query.bargeType,
                        "vesselProperty":query.vesselProperty,
                        "tradeZoneCode":query.tradeZoneCode,
                        "tradeCode":query.tradeCode,
                        "tradeLaneCode":query.tradeLaneCode,
                        "serviceLoopCode":query.serviceLoopCode,
                        "vesselCode":query.vesselCode,
                        "svvdId":query.svvdId,
                        "portCode":query.portCode,
                        'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                        'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                    },
                }
            })
            console.log(localsearch)
            if(localsearch.success){
                let data = localsearch.data
                let datas = data ? data.resultList : null
                datas ? datas.map((v,i)=>{
                    v['id'] = i
                    v.taxAmountInAgency==null?v.taxAmountInAgency=0:''
                }) : null
                setSpinflag(false)
                setTabTotal(data.totalCount)
                datas ? setTableData([...datas]) : null
                if(pagination.pageSize!=page.pageSize){
                    pagination.current=1
                }
                setPage({...pagination})
            }else{
                Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
                setTableData([])
                setSpinflag(false)
            }
        }
    }

     // 双击  MINARW0192E
     const doubleClickRow = async(parameter) => {
        console.log(parameter)
        setParameterData(parameter)
        setcalculationMethod(parameter.calculationMethod)
        setDefaultKey('2')
        setSpinflag(true)
        const result = await request($apiUrl.AG_FEE_KPL_SEARCH_QC_DETAIL,{
            method:"POST",
            data:{
                page:{
                    current: 1,
                    pageSize: 10
                },
                params: parameter
            }
        })
        console.log(result)
        if(result.success) {
            setSpinflag(false)
            Toast('', result.message, 'alert-success', 5000, false)
            let data = result.data;
            let datas = data.list;
            let headData = data.headData;
            let totalCount = data.totalCount
            let  mode = parameter.calculationMethod;
            console.log(parameter.calculationMethod)
            if(mode=='CNT') {
                setTableDataDetailed([...datas])
                setTableName([...columnss])
                setCollectFlag(false)
                setTableDataDetails([])
            }else if(mode=='BL') {
                setTableDataDetailed([...datas])
                setTableName([...columnsBL])
                setCollectFlag(false)
            }else {
                setTableDataDetailed([...datas])
                setTableName([...columnsss])
                setCollectFlag(true)
            }
            
            setTabTotalDetailed(totalCount)
            queryForms.setFieldsValue({
                svvdId: headData.svvdId,
                portCode: headData.portCode,
                tradeZoneCode: headData.tradeZoneCode,
                tradeCode: headData.tradeCode,
                tradeLaneCode: headData.tradeLaneCode,
            })
        }else{
            setSpinflag(false)
            Toast('',result.errorMessage,'alert-error',5000,false)
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
        setBackFlag(true)
        setTableData([])
    }

    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_KPL_EXP_QC_LIST,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    "agencyCode":query.agencyCode,
                    "actualFlag":query.actualFlag,
                    "feeClass":query.feeClass,
                    "feeType":query.feeType,
                    "feeType":query.feeType,
                    "bargeType":query.bargeType,
                    "vesselProperty":query.vesselProperty,
                    "tradeZoneCode":query.tradeZoneCode,
                    "tradeCode":query.tradeCode,
                    "tradeLaneCode":query.tradeLaneCode,
                    "serviceLoopCode":query.serviceLoopCode,
                    "vesselCode":query.vesselCode,
                    "svvdId":query.svvdId,
                    "portCode":query.portCode,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        vslName: formatMessage({id:"lbl.ht.statement.upload-vessel-name" }),
                        activityDate: formatMessage({id:"lbl.argue.bizDate" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        feeType: formatMessage({id:"lbl.Small-class-fee" }),
                        svvdId: formatMessage({id:"lbl.SVVD" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        officeCode: formatMessage({id:"lbl.office" }),
                        actualFlag: formatMessage({id:"lbl.WhetherItActuallyHappenedOrNot" }),
                        rateCurrency: formatMessage({id:"lbl.Agreement-currency" }),
                        totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                        vatFlag: formatMessage({id:"lbl.Whether-the-price-includes-tax" }),
                        vatAmt: formatMessage({id:"lbl.Agreement-currency-tax-reference" }),
                        agenceCurrencyCode: formatMessage({id:"lbl.Standard-currency" }),
                        totalAmountInAgency: formatMessage({id:"lbl.Amount-in-base-currency" }),
                        vatAmtInAgency: formatMessage({id:"lbl.Tax-in-local-currency" }),
                        taxAmountInAgency: formatMessage({id:"lbl.Tax-amount" }),
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        totalAmountInClearing: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                        vatAmtInClearing: formatMessage({id:"lbl.tax-in-settlement-currency" }),
                        enableIndicator: formatMessage({id:"lbl.On-line-area" }),
                        tradeZoneCode: formatMessage({id:"lbl.argue.trade-code" }),
                        tradeCode: formatMessage({id:"lbl.Trade" }),
                        tradeLaneCode: formatMessage({id:"lbl.Trade-line" }),
                        calculationMethod: formatMessage({id:"lbl.Computing-method" }),
                        productIndicator: formatMessage({id:"lbl.Whether-the-production-port" }),
                        exFlag: formatMessage({id:"lbl.within-boundary" }),
                        bargeType: formatMessage({id:"lbl.Ship-type" }),
                        vesselProperty: formatMessage({id:"lbl.Ship-property" }),
                        postCalcFlg: formatMessage({id:"lbl.arithmetic" }),
                        postMode: formatMessage({id:"lbl.bookkeeping" }),
                        ygSide: formatMessage({id:"lbl.estimate" }),
                        yfSide: formatMessage({id:"lbl.make" }),
                        sfSide: formatMessage({id:"lbl.submitanexpenseaccount" }),
                        isBill: formatMessage({id:"lbl.actually" }),
                        isYt: formatMessage({id:"lbl.withholding" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}) ; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

     //下载箱子
     const  downlodBox = async()=>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        console.log(parameterData)
        const query = queryForm.getFieldsValue()
        let tddata = {}
        tableName.map((v, i) => {
            tddata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        console.log(tddata)
        let downData = await request($apiUrl.AG_FEE_KPL_EXP_QC_DETAIL,{
            method:"POST",
            data:{
                'page':{
                    current: 0,
                    pageSize: 0
                },
                "params":{
                    ...parameterData,
                    // svvdId:undefined,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}),
                sheetList: [
                    {//sheetList列表
                        dataCol:tddata,
                        sumCol: {//汇总字段
                        },
                        'sheetName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}),
                    }
                ]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        // console.log(downData)
        // let jsonData = JSON.parse(downData)
        // console.log(jsonData)
        if(downData.size){
            if(downData.size<1){
                setSpinflag(false)
                Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
                return
            }else{
                setSpinflag(false)
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}); // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        }else{
            setSpinflag(false)
            Toast('',downData.errorMessage, 'alert-error', 5000, false)
        }
    }

    //下载航次及箱子
    const downlodVoyage = async()=>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        console.log(parameterData)
        const query = queryForm.getFieldsValue()
        let tddata = {}
        columns.map((v, i) => {
            tddata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        let cntData = {}
        columnss.map((v, i) => {
            cntData[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        console.log(tddata)
        let downData = await request($apiUrl.AG_FEE_KPL_EXP_CN,{
            method:"POST",
            data:{
                'page':{
                    current: 0,
                    pageSize: 0
                },
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    "agencyCode":query.agencyCode,
                    "actualFlag":query.actualFlag,
                    "feeClass":query.feeClass,
                    "feeType":query.feeType,
                    "feeType":query.feeType,
                    "bargeType":query.bargeType,
                    "vesselProperty":query.vesselProperty,
                    "tradeZoneCode":query.tradeZoneCode,
                    "tradeCode":query.tradeCode,
                    "tradeLaneCode":query.tradeLaneCode,
                    "serviceLoopCode":query.serviceLoopCode,
                    "vesselCode":query.vesselCode,
                    "svvdId":query.svvdId,
                    "portCode":query.portCode,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}),
                sheetList: [
                    {//sheetList列表
                        dataCol:tddata,
                        sumCol: {//汇总字段
                        },
                        'sheetName':formatMessage({id:'lbl.afcm-0058'}),
                    },
                    {//sheetList列表
                        dataCol:cntData,
                        sumCol: {//汇总字段
                        },
                        'sheetName':formatMessage({id:'lbl.afcm-0059'}),
                    }
                ]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if(downData.size){
            if(downData.size<1){
                setSpinflag(false)
                Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
                return
            }else{
                setSpinflag(false)
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-cal-reu-qry'}); // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        }else{
            Toast('',downData.errorMessage, 'alert-error', 5000, false)
            setSpinflag(false)
        }
        
    }

    return (
        <div className='parent-box'>
            <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                <TabPane tab={<FormattedMessage id='btn.search' />} key="1">
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
                                    company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                                }
                                {/* 业务日期 */}
                                <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                                {/* 实际是否发生 */}
                                <Select name='actualFlag' flag={true} label={<FormattedMessage id='lbl.WhetherItActuallyHappenedOrNot'/>}  span={6} options={actualFlag.values} />
                                {/* 费用大类 */}
                                <Select name='feeClass'  flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={costKey} />  
                                {/* 费用小类 */}
                                <Select name='feeType' flag={true}  label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={subclass.values}/>  
                                {/* 船舶类型 */}
                                <Select name='bargeType' flag={true}  label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={shipTypes.values}/>  
                                {/* 船舶属性 */}
                                <Select name='vesselProperty' flag={true}  label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselType.values}/>  
                                {/* 贸易区 */}
                                <Select name='tradeZoneCode' flag={true}  label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6}  options={trade.values} selectChange={companyIncident} />  
                                {/* Trade */}
                                <Select name='tradeCode' flag={true}  label={<FormattedMessage id='lbl.Trade'/>} span={6} options={tradeCode} selectChange={trades} />  
                                {/* 贸易线 */}
                                <Select name='tradeLaneCode' flag={true}  label={<FormattedMessage id='lbl.Trade-line'/>} span={6} options={tradeLine}/>  
                                {/* 航线 */}
                                <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>} span={6}/>  
                                {/* 船舶代码 */}
                                <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code'/>} span={6}/>  
                                {/* SVVD */}
                                <InputText name='svvdId' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>  
                                {/* 港口 */}
                                <InputText name='portCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.port'/>} span={6}/>
                            </Row>
                        </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 下载航次 */}
                            <Button onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/><FormattedMessage id='lbl.download.voyage'/></Button>
                            {/* 下载航次及箱子 */}
                            <Button onClick={downlodVoyage} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/><FormattedMessage id='lbl.download-voyage-box'/></Button>
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
                            total={tabTotal}
                            handleDoubleClickRow={doubleClickRow}
                            selectWithClickRow={true}
                            rowSelection={null}
                        />
                    </div>
                </TabPane>
                <TabPane tab={<FormattedMessage id='lbl.details' />} key="2">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForms}
                            name='func'
                            onFinish={handleQuery} 
                        >
                            <Row>
                                {/* SVVD */}
                                <InputText name='svvdId'  disabled={true} label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>
                                {/* 港口 */} 
                                <InputText name='portCode'  disabled={true}  label={<FormattedMessage id='lbl.port'/>} span={6}/>
                                {/* 贸易区 */}
                                <InputText name='tradeZoneCode'  disabled={true} label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6}/>
                                {/* Trader */}
                                <InputText name='tradeCode'  disabled={true} label={<FormattedMessage id='lbl.Trader'/>} span={6}/>
                                {/* 贸易线 */}
                                <InputText name='tradeLaneCode' disabled={true} label={<FormattedMessage id='lbl.Trade-line'/>} span={6}/>
                            </Row>
                        </Form> 
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/> </Button> </div>
                    </div>
                    {tableName.length>0?<div className='main-button'>
                        <div className='button-left'>
                            {/* 下载箱子 */}
                            <Button onClick={downlodBox} ><CloudDownloadOutlined /><FormattedMessage id='lbl.Download-box'/></Button>
                        </div>
                        <div className='button-right'>
                          
                        </div>
                    </div>:null}
                   {tableName.length>0? <div className='footer-table' style={{marginTop:'10px'}}>
                       <div style={{width:tableName.length<8?'50%':'100%'}}>
                            <PaginationTable
                                dataSource={tableDataDetailed}
                                columns={tableName}
                                rowKey='cntrPackgUuid'
                                pageChange={pageChange}
                                pageSize={page.pageSize}
                                current={page.current}
                                scrollHeightMinus={200}
                                total={tabTotalDetailed}
                                rowSelection={null}
                                // selectionType='radio'
                                // setSelectedRows={setSelectedRows}
                            />
                       </div>
                        
                    </div>:null}
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol