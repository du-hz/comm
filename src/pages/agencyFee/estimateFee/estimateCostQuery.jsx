{/* 查询预估费用 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage, useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, costCategories ,momentFormat, agencyCodeData, TradeData, acquireSelectDataExtend, } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row, Modal, Tabs} from 'antd'
import {Toast} from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading';
import CosModal from '@/components/Common/CosModal'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    CloseOutlined, //关闭
} from '@ant-design/icons'

{/* tab切换 */}
const { TabPane } = Tabs;

const estimateCostQuery =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用小类
    const [feeCategory,setFeeCategory] = useState ([])
    const [costStatus, setCostStatus] = useState({}); // 费用状态
    const [estimateStatus, setEstimateStatus] = useState({}); // 预估单状态
    const [tradeZoneCode,setTradeZoneCodeData] = useState ({}) //贸易区
    const [tradeCode,setTradeCode] = useState ([]) //Trade
    const [tradeLine, setTradeLine] = useState([]); // Cargo trade lane - 货物贸易通道
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [eovStatus, setEovData] = useState({}); // EOV
    const [bargeType, setBargeType] = useState({});   // 船舶类型
    const [vesselProperty,setVesselProperty] = useState ({}) //船舶属性
    const [tableData,setTableData] = useState([]);  // table 数据
    const [tableDatas,setTableDatas] = useState([]);  // table 数据-汇总
    const [tabTabTotal,setTabTotal ] = useState([]);    // table条数
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [isModalVisible, setIsModalVisible] = useState(false);   // 明细弹窗
    const [headerTitle, setHeaderTitle] = useState(""); //弹窗标题
    const [revenueData,setRevenueData] = useState([]);  // 收入信息
    const [revenueDatas,setRevenueDatas] = useState([]);  // 收入信息-汇总
    const [expenditureData,setExpenditureData] = useState([]);  // 支出信息
    const [expenditureDatas,setExpenditureDatas] = useState([]);  // 支出信息-汇总
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [showFlag1,setShowFlag1] = useState(false);    // 控制不同tableId,弹窗显示不同的明细列表
    const [showFlag2,setShowFlag2] = useState(false);
    const [showFlag3,setShowFlag3] = useState(false);
    const [showFlag4,setShowFlag4] = useState(false);
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [parameter, setParameter] = useState('');
    const [dtlUid, setDtlUid] = useState('');
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

    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.TRADE.ZONE', setTradeZoneCodeData, $apiUrl);// 贸易区
        acquireSelectData('AFCM.AG.ER.RECEIPT.STATUS', setEstimateStatus, $apiUrl);// 预估单状态
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AFCM.EOV.STATUS', setEovData, $apiUrl);// EOV
        acquireSelectData('AFCM.BARGE.TYPE',setBargeType, $apiUrl);// 船舶类型
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setCostStatus, $apiUrl);// 费用状态
        acquireSelectData('VESSELTYPE',setVesselProperty,$apiUrl);//船舶属性
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大小类联动
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
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

    {/*  查询列表 */}
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.generation-date'/>,// 生成日期
            dataIndex: 'generateDate',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Small-class-fee' />,//费用小类
            dataIndex: 'feeType',
            dataType: feeCategory,
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            align:'left',
            width: 60,
        },{
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            align:'left',
            width: 45
        },{
            title: <FormattedMessage id='lbl.version-number' />,// 版本号
            dataIndex: 'versionNum',
            align:'left',
            width: 50
        },{
            title: <FormattedMessage id='lbl.ht.statement.upload-vessel-name'/>,// 船名
            dataIndex: 'vslName',
            align:'left',
            width: 45
        },{
            title: <FormattedMessage id='lbl.voyage-number'/>,// 航次
            dataIndex: 'voyageNumber',
            align:'left',
            width: 45
        },{
            title: <FormattedMessage id='lbl.Ship-code'/>,// 船舶代码
            dataIndex: 'vesselCode',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id="lbl.EOV" />,// EOV
            dataIndex: 'eovStatus',
            align:'left',
            width: 50
        },{
            title: <FormattedMessage id='lbl.trade-channel'/>,// Trade Lane
            dataIndex: 'tradeLaneCode',
            align:'left',
            width: 120
        },{
            title: <FormattedMessage id='lbl.profit-center' />,// 利润中心
            dataIndex: 'profitCenterCode',
            align:'left',
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Foot-empty-box-12-20' />,// 12/20尺 空箱
            dataIndex: 'cntr20E',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.Foot-empty-box-40-45' />,// 40/45尺 空箱
            dataIndex: 'cntr40E',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.Foot-weight-box-12-20'/>,// 12/20尺 重箱
            dataIndex: 'cntr20F',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.Foot-weight-box-40-45'/>,// 40/45尺 重箱
            dataIndex: 'cntr40F',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.office'/>,// Office
            dataIndex: 'officeCode',
            align:'left',
            width: 80
        },{
            title:<FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            align:'right',
            width: 100
        },{
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount' />,// 协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmount',
            align:'right',
            width: 130
        },{
            title: <FormattedMessage id='lbl.Whether-the-price-includes-tax' />,// 是否含税价
            dataIndex: 'vatFlag',
            dataType: priceIncludingTax.values,
            align:'left',
            width: 100
        },{
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference' />,// 协议币税金(参考)
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 130
        },{
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference' />,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },{
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets' />,// 应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'paymentAmount',
            align:'right',
            width: 110
        },{
            title: <FormattedMessage id='lbl.AP-outlets' />,// 应付网点
            dataIndex: 'customerSAPId',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Agency-net-income' />,// 代理净收入
            dataType: 'dataAmount',
            dataIndex: 'recAmount',
            align:'right',
            width: 100
        },{
            title: <FormattedMessage id='lbl.estimate' />,// 向谁预估
            dataIndex: 'ygSide',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id= 'lbl.Standard-currency' />,// 本位币种
            dataIndex: 'agencyCurrency',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id= 'lbl.Amount-in-base-currency' />,// 本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyAmount',
            align:'right',
            width: 100
        },{
            title: <FormattedMessage id= 'lbl.Adjustment-amount-in-base-currency' />,// 本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyReviseAmount',
            align:'right',
            width: 130
        },{
            title: <FormattedMessage id='lbl.Tax-in-local-currency' />,// 本位币税金(参考)
            dataIndex: 'vatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 130
        },{
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency' />,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },{
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'cleaningCurrencyCode',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'cleaningAmount',
            align:'right',
            width: 100
        },{
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseCleaningAmount',
            align:'right',
            width: 130
        },{
            title: <FormattedMessage id='lbl.tax-in-settlement-currency' />,//结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 130
        },{
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency'/>,//结算币调整税金(参考)
            dataIndex: 'reviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },{
            title: <FormattedMessage id='lbl.within-boundary'/>,//是否边界内
            dataIndex: 'exFlag',
            dataType: withinBoundary.values,
            align:'left',
            width: 100,
        },{
            title: <FormattedMessage id='lbl.Ship-type'/>,// 船舶类型
            dataIndex: 'bargeType',
            dataType: bargeType.values,
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Ship-property'/>,// 船舶属性
            dataIndex: 'vesselProperty',
            dataType: vesselProperty.values,
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Cost-status'/>,// 费用状态
            dataIndex: 'verifyStatus',
            dataType: costStatus.values,
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Estimated-order-number'/>,// 预估单号码
            dataIndex: 'ygListCode',
            align:'left',
            width: 90
        },{
            title: <FormattedMessage id='lbl.Estimated-single-state' />,// 预估单状态
            dataIndex: 'listVerifyStatus',
            dataType: estimateStatus.values,
            align:'left',
            width: 90
        },
    ]
    {/* 汇总列表 */}
    const columnsdata = [
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumAmount',
            align:'right',
            width: 90
        },{
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumReviseAmount',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)
            dataIndex: 'sumVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        }
    ]

    {/* 明细弹窗-明细列表1 代理编码--费用金额*/}
    const feeAdjustManual = [
        {
            title: <FormattedMessage id='lbl.agency'/>,//代理编码
            dataIndex: 'agencyCode',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.SVVD'/>,//SVVD
            dataIndex: 'svvd',
            align:'left', 
            width: 60,
        },{
            title: <FormattedMessage id='lbl.Small-class-fee'/>,//费用小类
            dataType: feeCategory,
            dataIndex: 'feeType',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id= 'lbl.ccy'/>,//币种
            dataIndex: 'currencyCode',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.Fee-amount'/>,//费用金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            align:'right', 
            width: 80
        },
    ]

    {/* 明细弹窗-明细列表2  箱号-->生成日期*/}
    const feeContainer = [
        {
            title: <FormattedMessage id='lbl.ac.cntr-num' />,//箱号
            dataIndex: 'appendCntNum',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.Box' />,//箱型
            dataIndex: 'containerType',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.size' />,//尺寸
            dataIndex: 'containerSize',
            align:'right', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.Empty-heavy-box' />,//空重箱
            dataIndex: 'fullEmptyInd',
            align:'left', 
            width: 60,
        },{
            title: <FormattedMessage id='lbl.Whether-the-SOC-box' />,//是否SOC箱
            dataIndex: 'socInd',
            align:'left', 
            width: 70,
        },{
            title: <FormattedMessage id='lbl.bound' />,//进出口
            dataIndex: 'expImpInd',
            align:'left', 
            width: 70,
        },{
            title: <FormattedMessage id='lbl.Transfer' />,//中转
            dataIndex: 'transmitInd',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.TEU-num' />,//TEU数
            dataIndex: 'teuMis',
            align:'right', 
            width: 50,
        },{
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'feeCurrencyCode',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.rate-one'/>,//费率
            dataType: 'dataAmount',
            dataIndex: 'feeAmount',
            align:'right', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.Loading-port' />,//装港
            dataIndex: 'firstPolCode',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.Unloading-port'/>,//卸港
            dataIndex: 'lastPodCode',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.Empty-box-bill-num' />,//空箱号/提单号
            dataIndex: 'referenceCode',
            align:'left', 
            width: 120,
        },{
            title: <FormattedMessage id='lbl.company' />,//公司
            dataIndex: 'billCompanyCode',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.Agreement-number'/>,//协议号码
            dataIndex: 'feeAgmtCode',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id="lbl.generation-date"  />,//生成日期
            dataIndex: 'recUpdDate',
            align:'left', 
            width: 80,
        },
    ]
    {/* 明细-汇总 */}
    const summaryDeatilTableViewer = [
        {
            title: <FormattedMessage id='lbl.Box-size' />,//箱型尺寸
            dataIndex: 'containerSize',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.AP-outlets' />,//应付网点
            dataIndex: 'agencyCode',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Empty-weight-sign'/>,//空重标志
            dataIndex: 'fullEmptyInd',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.bound' />,//进出口
            dataIndex: 'expImpInd',
            align:'left', 
            width: 60,
        },{
            title: <FormattedMessage id='lbl.SOC-sign'/>,//SOC标志
            dataIndex: 'socInd',
            align:'left', 
            width: 60,
        },{
            title: <FormattedMessage id='lbl.Container-capacity' />,//箱量
            dataIndex: 'num',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.rate-one'/>,//费率
            dataType: 'dataAmount',
            dataIndex: 'rate',
            align:'right', 
            width: 45,
        },{
            title: <FormattedMessage id= 'lbl.amount'/>,//金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            align:'right', 
            width: 45
        },
    ]

    {/* 明细弹窗-明细列表3  SVVD--TRADE--生成日期*/}
    const feeSvvd = [
        {
            title: <FormattedMessage id='lbl.SVVD'/>,//SVVD
            dataIndex: 'svvd',
            align:'left', 
            width: 60,
        },{
            title: <FormattedMessage id='lbl.Trade'/>,//TRADE
            dataIndex: 'tradeCode',
            align:'left', 
            width: 60,
        },{
            title: <FormattedMessage id='lbl.trade-channel'/>,//TRADE LANE
            dataIndex: 'tradeLaneCode',
            align:'left', 
            width: 120,
        },{
            title: <FormattedMessage id='lbl.Generate-new-linked-port'/>,//是否生成性挂港
            dataIndex: 'productInd',
            align:'left', 
            width: 120,
        },{
            title: <FormattedMessage id='lbl.Ship-property'/>,//船舶属性
            dataIndex: 'vesselProperty',
            dataType: vesselProperty.values,
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Total-shipping-space'/>,//船舶总箱位
            // dataIndex: 'vesselTeusRepeat',
            dataIndex: 'vesselTeus',
            align:'right', 
            width: 100,
        },{
            title: <FormattedMessage id='lbl.Net-tonnage'/>,//船舶净吨位
            // dataIndex: 'netWeightRepeat',
            dataIndex: 'netWeight',
            align:'left', 
            width: 100,
        },{
            title: <FormattedMessage id='lbl.ccy'/>,//币种
            dataIndex: 'feeCurrencyCode',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.amount'/>,//金额
            dataType: 'dataAmount',
            dataIndex: 'feeAmount',
            align:'right', 
            width: 45
        },{
            title: <FormattedMessage id='lbl.Agreement-num'/>,//协议编号
            dataIndex: 'feeAgmtCode',
            align:'left', 
            width: 100,
        },{
            title: <FormattedMessage id='lbl.Algorithm'/>,//算法
            dataIndex: 'calculationMode',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.generation-date'/>,//生成日期
            dataIndex: 'recUpdDate',
            align:'left', 
            width: 100,
        },
    ]

    {/* 明细弹窗-明细列表4  SVVD--BL--生成日期*/}
    const feeBill = [
        {
            title: <FormattedMessage id='lbl.SVVD'/>,//svvd
            dataIndex: 'svvd',
            align:'left', 
            width: 60,
        },{
            title: <FormattedMessage id='lbl.Bl'/>,//BL
            // dataIndex: 'referenceCode',
            align:'left', 
            width: 40,
        },{
            title: <FormattedMessage id='lbl.Belong-company'/>,//所属公司
            // dataIndex: 'billCompanyCode',
            dataIndex: 'soCompanyCode',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.ccy'/>,//币种
            // dataIndex: 'agencyCurrency',
            dataIndex: 'feeCurrencyCode',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id= 'lbl.amount'/>,//金额
            dataType: 'dataAmount',
            dataIndex: 'feeAmount',
            align:'right', 
            width: 45
        },{
            title: <FormattedMessage id= 'lbl.Agreement-number'/>,//协议号码
            dataIndex: 'feeAgmtCode',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.generation-date'/>,//生成日期
            dataIndex: 'recUpdDate',
            align:'left', 
            width: 80,
        },
    ]
    
    {/* 查询 */}
    const pageChange = async (pagination,search,searchType) => {
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        let queryData = queryForm.getFieldValue();
        if(!queryData.svvd && !queryData.ygListCode && !queryData.activeDate && !queryData.generateDate){
            Toast('',intl.formatMessage({id:'lbl.cost-criteria'}), 'alert-error', 5000, false)
            setSpinflag(false);
            setBackFlag(false);
        }else{
            setSpinflag(true);
            setBackFlag(true);
            const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_UNLOCK_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        ...queryData,
                        "searchStatus": "N"  ,
                        hasCondition: searchType,
                        activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                        generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                        generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                    },
                    operateType: "AFCM-AG-ER-004"
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                let sumList=result.data.sumList
                if(sumList!=null){
                    sumList.map((v,i)=>{
                        v.Uuid=i
                    })
                }
                if(datas!=null){
                    datas.map((v,i)=>{
                        v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                        v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                    })
                }
                setPage({...pagination})
                setTabTotal(data.totalCount)
                setTableData([...datas])
                setTableDatas([...sumList])
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
        setTableData([]);
        setTableDatas([]);
        setFeeType([]);
        setTradeCode([]);
        setTradeLine([]);
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }
    {/* 关闭弹窗 */}
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisible(false)
        setRevenueData([]);   
        setRevenueDatas([]);  
        setExpenditureData([]);    
        setExpenditureDatas([]); 
    }

    {/* 双击获取明细弹窗 */}
    const doubleClickRow = async(parameter) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        setParameter(parameter)
        setDtlUid(parameter.entryUuid)
        setHeaderTitle(parameter.ygListCode);   // 头标题
        const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_UNLOCK_DETAIL_LIST,{
            method:"POST",
            data:{
                params: {
                    entryUuid: parameter.entryUuid
                },
            }
        })
        if(result.success) {
            setSpinflag(false);
            Toast('', result.message, 'alert-success', 5000, false)
            let data = result.data;
            let headData = data.headData
            let feeContainers = data.feeContainers
            let feeSvvds = data.feeSvvds
            let feeBills = data.feeSvvds
            queryForm.setFieldsValue({   // 明细-头部信息
                popData: {
                    activityDate: headData.activityDate ? headData.activityDate.substring(0, 10) : null,
                    feeType: headData.feeType,
                    svvdId: headData.svvdId,
                    portCode: headData.portCode,
                    eovStatus: headData.eovStatus,
                    tradeLaneCode: headData.tradeLaneCode,
                }
            })    
            let tableId = ""
            if(parameter.adjustManualFlag == "Y"){
                setShowFlag1(false) //显示明细列表1 代理编码--费用金额
                setShowFlag2(true)  //隐藏明细列表2
                setShowFlag3(true)  //隐藏明细列表3
                setShowFlag4(true)  //隐藏明细列表4
                tableId = feeAdjustManual;
                setRevenueData(data.feeAdjustManuals);   
                setExpenditureData();  //暂无
                if(data.feeAdjustManuals!=null){
                    data.feeAdjustManuals.map((v,i)=>{
                        v.feeAgmtItemUUID=i
                    })
                }
            }else {
                if(parameter.calculationMode == "CNT" || parameter.calculationMode == "AGG"){
                    setShowFlag2(false) 
                    setShowFlag1(true)    
                    setShowFlag3(true)   
                    setShowFlag4(true)  
                    tableId = feeContainer; 
                    if(feeContainers!=null){
                        feeContainers.map((v,i)=>{
                            v.recUpdDate ? v["recUpdDate"] = v.recUpdDate.substring(0, 10) : null;
                            v.feeAgmtItemUUID=i
                        })
                    }
                    if(data.cntSummaryList!=null){
                        data.cntSummaryList.map((v,i)=>{
                            v.feeAgmtItemUUID=i
                        })
                    }
                    setRevenueData(feeContainers);   
                    setRevenueDatas(data.cntSummaryList);  
                    setExpenditureData();    //暂无
                    setExpenditureDatas();   //暂无
                }else if(parameter.calculationMode == "CALL" || parameter.calculationMode == "MCALL" || parameter.calculationMode == "VOY" || parameter.calculationMode == "DATE" || 
                         parameter.calculationMode == "VSHP" || parameter.calculationMode == "VTEU" || parameter.calculationMode == "CAL"){
                    setShowFlag3(false) 
                    setShowFlag1(true)   
                    setShowFlag2(true)   
                    setShowFlag4(true)    
                    tableId = feeSvvd;
                    if(feeSvvds!=null){
                        feeSvvds.map((v,i)=>{
                            v.recUpdDate ? v["recUpdDate"] = v.recUpdDate.substring(0, 10) : null;
                            v.vesselTeus ? v['vesselTeus'] = v.vesselTeus : v['vesselTeus'] = '0.0'
                            v.netWeight ? v['netWeight'] = v.netWeight : v['netWeight'] = '0'
                            v.feeAgmtItemUUID=i
                        })
                    }
                    setRevenueData(feeSvvds);   
                    setExpenditureData();   //暂无
                }else {
                    setShowFlag4(false)
                    setShowFlag1(true)   
                    setShowFlag2(true)   
                    setShowFlag3(true)    
                    tableId = feeBill;   
                    if(feeBill!=null){
                        feeBills.map((v,i)=>{
                            v.recUpdDate ? v["recUpdDate"] = v.recUpdDate.substring(0, 10) : null;
                            v.feeAgmtItemUUID=i
                        })
                    }
                    setRevenueData(feeBills);   
                    setExpenditureData(); //暂无
                }
            }
            setIsModalVisible(true); 
        }else{
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 下载 */} 
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.svvd && !queryData.ygListCode && !queryData.activeDate && !queryData.generateDate){
            Toast('',intl.formatMessage({id:'lbl.cost-criteria'}), 'alert-error', 5000, false)
            setBackFlag(false);
        }else{
            setBackFlag(true);
            setSpinflag(true);
            const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_UNLOCK_DOWNLOAD,{
                method:"POST",
                data:{
                    params: {
                        ...queryData,
                        searchStatus: "N"  ,
                        activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                        generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                        generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                    },
                    excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.costQuery'}), //文件名
                    sheetList: [{//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: intl.formatMessage({id: "lbl.agency"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            generateDate: intl.formatMessage({id: "lbl.generation-date"}),
                            feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                            portCode: intl.formatMessage({id: "lbl.port"}),
                            versionNum: intl.formatMessage({id: "lbl.version-number"}),
                            vslName: intl.formatMessage({id: "lbl.ht.statement.upload-vessel-name"}),
                            voyageNumber: intl.formatMessage({id: "lbl.voyage-number"}),
                            vesselCode: intl.formatMessage({id: "lbl.Ship-code"}),
                            eovStatus: intl.formatMessage({id: "lbl.EOV"}),
                            tradeLaneCode: intl.formatMessage({id: "lbl.trade-channel"}),
                            profitCenterCode: intl.formatMessage({id: "lbl.profit-center"}),
                            cntr20E: intl.formatMessage({id: "lbl.Foot-empty-box-12-20"}),
                            cntr40E: intl.formatMessage({id: "lbl.Foot-empty-box-40-45"}),
                            cntr20F: intl.formatMessage({id: "lbl.Foot-weight-box-12-20"}),
                            cntr40F: intl.formatMessage({id: "lbl.Foot-weight-box-40-45"}),
                            officeCode: intl.formatMessage({id: "lbl.office"}),
                            rateCurrency: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            vatFlag: intl.formatMessage({id: "lbl.Whether-the-price-includes-tax"}),
                            vatAmt: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),
                            vatReviseAmt: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),
                            paymentAmount: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),
                            customerSAPId: intl.formatMessage({id: "lbl.AP-outlets"}),
                            recAmount:  intl.formatMessage({id: "lbl.Agency-net-income"}),
                            ygSide:  intl.formatMessage({id: "lbl.estimate"}),
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
                            verifyStatus: intl.formatMessage({id: "lbl.Cost-status"}),   
                            ygListCode: intl.formatMessage({id: "lbl.Estimated-order-number"}),   
                            listVerifyStatus: intl.formatMessage({id: "lbl.Estimated-single-state"}),       
                        },
                        sumCol: {//汇总字段
                            feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            clearingSumAmount: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                            clearingSumReviseAmount: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                            sumVatAmtInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),
                            sumReviseVatAmtInClearing: intl.formatMessage({id: "lbl.tax-adjustment-in-settlement-currency"}),
                        },
                        sheetName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.costQuery'}),//sheet名称
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
                    navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.costQuery'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.costQuery'})+ '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        }
    }
    {/* 明细弹窗信息-下载 */} 
    const downloadDel = async() => {
        Toast('', '', '', 5000, false);
        let sheetList = []
        if(parameter.adjustManualFlag == "Y"){
            sheetList = [
                {//sheetList列表
                    dataCol: {//列表字段
                        activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                        feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                        svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                        portCode: intl.formatMessage({id: "lbl.port"}),
                        eovStatus: intl.formatMessage({id: "lbl.EOV"}),
                        tradeLaneCode: intl.formatMessage({id: "lbl.trade-channel"}),
                    },
                    sumCol: {},//汇总字段
                    sheetName: intl.formatMessage({id: 'lbl.Head-info'}),//头信息
                },
                {//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        svvd: intl.formatMessage({id: "lbl.SVVD"}),
                        feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                        currencyCode: intl.formatMessage({id: "lbl.ccy"}),
                        totalAmount: intl.formatMessage({id: "lbl.Fee-amount"}),
                    },
                    sumCol: {},//汇总字段
                    sheetName: intl.formatMessage({id: 'lbl.details'}),//明细列表
                },
            ]
        }else {
            if(parameter.calculationMode == "CNT" || parameter.calculationMode == "AGG"){
                sheetList = [
                    {//sheetList列表
                        dataCol: {//列表字段
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                            portCode: intl.formatMessage({id: "lbl.port"}),
                            eovStatus: intl.formatMessage({id: "lbl.EOV"}),
                            tradeLaneCode: intl.formatMessage({id: "lbl.trade-channel"}),
                        },
                        sumCol: {},//汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Head-info'}),//头信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            appendCntNum: intl.formatMessage({id: "lbl.ac.cntr-num"}),
                            containerType: intl.formatMessage({id: "lbl.Box"}),
                            containerSize: intl.formatMessage({id: "lbl.size"}),
                            fullEmptyInd: intl.formatMessage({id: "lbl.Empty-heavy-box"}),
                            socInd: intl.formatMessage({id: "lbl.Whether-the-SOC-box"}),
                            expImpInd: intl.formatMessage({id: "lbl.bound"}),
                            transmitInd: intl.formatMessage({id: "lbl.Transfer"}),
                            teuMis: intl.formatMessage({id: "lbl.TEU-num"}),
                            feeCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            feeAmount: intl.formatMessage({id: "lbl.rate-one"}),
                            firstPolCode: intl.formatMessage({id: "lbl.Loading-port"}),
                            lastPodCode: intl.formatMessage({id: "lbl.Unloading-port"}),
                            referenceCode: intl.formatMessage({id: "lbl.Empty-box-bill-num"}),
                            billCompanyCode: intl.formatMessage({id: "lbl.company"}),
                            feeAgmtCode: intl.formatMessage({id: "lbl.Agreement-number"}),
                            recUpdDate: intl.formatMessage({id: "lbl.generation-date"}),
                            
                        },
                        sumCol: {},//汇总字段
                        sheetName: intl.formatMessage({id: "lbl.Cnt"}),//CNT
                    },
                    {//sheetList列表
                        dataCol: {//列表字段 
                            containerSize: intl.formatMessage({id: "lbl.Box-size"}),
                            agencyCode: intl.formatMessage({id: "lbl.AP-outlets"}),
                            fullEmptyInd: intl.formatMessage({id: "lbl.Empty-weight-sign"}),
                            expImpInd: intl.formatMessage({id: "lbl.bound"}),
                            socInd: intl.formatMessage({id: "lbl.SOC-sign"}),
                            num: intl.formatMessage({id: "lbl.Container-capacity"}),
                            rate: intl.formatMessage({id: "lbl.rate-one"}),
                            totalAmount: intl.formatMessage({id: "lbl.amount"}),
                        },
                        sumCol: {},//汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Total-info'}),//汇总信息
                    }
                ]
            }else if(parameter.calculationMode == "CALL" || parameter.calculationMode == "MCALL" || parameter.calculationMode == "VOY" || parameter.calculationMode == "DATE" || 
                     parameter.calculationMode == "VSHP" || parameter.calculationMode == "VTEU" || parameter.calculationMode == "CAL"){
                        sheetList = [
                            {//sheetList列表
                                dataCol: {//列表字段
                                    activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                                    feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                                    svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                                    portCode: intl.formatMessage({id: "lbl.port"}),
                                    eovStatus: intl.formatMessage({id: "lbl.EOV"}),
                                    tradeLaneCode: intl.formatMessage({id: "lbl.trade-channel"}),
                                },
                                sumCol: {},//汇总字段
                                sheetName: intl.formatMessage({id: 'lbl.Head-info'}),//头信息
                            },
                            {//sheetList列表
                                dataCol: {//列表字段
                                    svvd: intl.formatMessage({id: "lbl.SVVD"}),
                                    tradeCode: intl.formatMessage({id: "lbl.Trade"}),
                                    tradeLaneCode: intl.formatMessage({id: "lbl.trade-channel"}),
                                    productInd: intl.formatMessage({id: "lbl.Generate-new-linked-port"}),
                                    vesselProperty: intl.formatMessage({id: "lbl.Ship-property"}),
                                    vesselTeus: intl.formatMessage({id: "lbl.Total-shipping-space"}),
                                    netWeight: intl.formatMessage({id: "lbl.Net-tonnage"}),
                                    feeCurrencyCode: intl.formatMessage({id: "lbl.ccy"}),
                                    feeAmount: intl.formatMessage({id: "lbl.amount"}),
                                    feeAgmtCode: intl.formatMessage({id: "lbl.Agreement-num"}),
                                    calculationMode: intl.formatMessage({id: "lbl.Algorithm"}),
                                    recUpdDate: intl.formatMessage({id: "lbl.generation-date"}),
                                },
                                sumCol: {},//汇总字段
                                sheetName: intl.formatMessage({id: 'lbl.details'}),//明细列表
                            },
                        ]
            }else {
                sheetList = [
                    {//sheetList列表
                        dataCol: {//列表字段
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                            portCode: intl.formatMessage({id: "lbl.port"}),
                            eovStatus: intl.formatMessage({id: "lbl.EOV"}),
                            tradeLaneCode: intl.formatMessage({id: "lbl.trade-channel"}),
                        },
                        sumCol: {},//汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Head-info'}),//头信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            svvd: intl.formatMessage({id: "lbl.SVVD"}),
                            referenceCode: intl.formatMessage({id: "lbl.Bl"}),
                            billCompanyCode: intl.formatMessage({id: "lbl.Belong-company"}),
                            agencyCurrency: intl.formatMessage({id: "lbl.ccy"}),
                            feeAmount: intl.formatMessage({id: "lbl.amount"}),
                            feeAgmtCode: intl.formatMessage({id: "lbl.Agreement-number"}),
                            recUpdDate: intl.formatMessage({id: "lbl.generation-date"}),
                        },
                        sumCol: {},//汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.details'}),//明细列表
                    },
                ]
            }
        }
        setSpinflag(true);
        const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_COST_DETAIL_DOWNLOAD,{
            method:"POST",
            data:{
                page: {
                    pageSize: 0,
                    current: 0
                },
                params:{
                    entryUuid: dtlUid
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.costQuery'}), //文件名
                sheetList,
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.costQuery'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = headerTitle + intl.formatMessage({id: 'lbl.Estimate-del-info'})+ '.xlsx'; // 下载后文件名
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
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* <Select name='agencyCode' showSearch={true} label={<FormattedMessage id='lbl.agency'/>} span={6} options={agencyCode}  />     */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} selectChange={getCommonSelectVal} options={feeClass}  /> 
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={feeType}  />
                        {/* 费用状态 */}
                        <Select name='verifyStatus' flag={true} label={<FormattedMessage id='lbl.Cost-status'/>}  span={6} options={costStatus.values} />
                        {/* 业务日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='activeDate'  style={{background:backFlag?'white':'yellow'}} label={<FormattedMessage id="lbl.argue.bizDate" />} span={6}  />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} name='generateDate' flag={false} disabled={[false, false]}  style={{background:backFlag?'white':'yellow'}} label={<FormattedMessage id="lbl.generation-date" />} span={6}  />
                        {/* 贸易区 */}
                        <Select name='tradeZoneCode' flag={true} label={<FormattedMessage id='lbl.argue.trade-code'/>}  span={6} options={tradeZoneCode.values} selectChange={companyIncident} />
                        {/* Trade */}
                        <Select name='tradeCode' flag={true} label={<FormattedMessage id='lbl.Trade'/>}  span={6} options={tradeCode} selectChange={trades} />
                        {/* Cargo Trade Lane */}
                        <Select span={6} flag={true} name='tradeLaneCode' label={<FormattedMessage id='lbl.cargo-trade'/>} options={tradeLine} /> 
                        {/* 是否边界内 */}
                        <Select name='exFlag' flag={true} label={<FormattedMessage id='lbl.within-boundary'/>}  span={6} options={withinBoundary.values} />
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>}  span={6} /> 
                        {/* 船舶代码 */}
                        <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code'/>} span={6} />  
                        {/* 航次 */}
                        <InputText name='voyageNumber' label={<FormattedMessage id='lbl.voyage-number'/>} span={6} /> 
                        {/* 船舶属性 */}
                        <Select name='vesselProperty' flag={true} label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselProperty.values} /> 
                        {/* SVVD */}
                        <InputText name='svvd'  styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6} />  
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6} /> 
                        {/* EOV */}
                        <Select name='eovStatus' flag={true} label={<FormattedMessage id='lbl.EOV'/>}  span={6} options={eovStatus.values} />
                        {/* 船舶类型 */}
                        <Select name='bargeType' flag={true} label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={bargeType.values} />  
                        {/* 预估单号码 */}
                        <InputText name='ygListCode'  styleFlag={backFlag} label={<FormattedMessage id='lbl.Estimated-order-number'/>} span={6} />  
                        {/* 预估单状态 */}
                        <Select name='listVerifyStatus' flag={true} label={<FormattedMessage id='lbl.Estimated-single-state'/>}  span={6} options={estimateStatus.values} />
                        {/* Office */}
                        <InputText name='officeCode' label={<FormattedMessage id='lbl.office'/>}  span={6} /> 
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
                    <Button onClick={()=> pageChange(page,'search','N')}> <SearchOutlined /><FormattedMessage id='btn.unconditional-query' /></Button>
                    {/* 查询 */}
                    <Button onClick={()=> pageChange(page,'search','Y')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
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
                    selectWithClickRow={true}
                    handleDoubleClickRow={doubleClickRow}
                />
            </div>
            <div className='footer-table' style={{marginTop:'10px'}}>
            <div style={{width: '70%'}}>
                <PaginationTable
                    rowKey="Uuid"
                    columns={columnsdata} 
                    dataSource={tableDatas}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            </div>
            {/* 预估费用明细弹窗 */}
            {/* <Modal title={headerTitle + intl.formatMessage({id:'lbl.Estimate-cost-details'})} visible={isModalVisible} footer={null} width="55%" height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={650} cbsVisible={isModalVisible} cbsTitle={headerTitle + intl.formatMessage({id:'lbl.Estimate-cost-details'})} cbsFun={() => handleCancel()}>
                <div className='header-from' style={{minWidth: '300px'}}>
                    <Form 
                        form={queryForm}
                        name='func'
                        onFinish={handleQuery}
                    >
                        <Row>
                            {/* 业务日期 */}
                            <InputText disabled name={['popData','activityDate']}  label={<FormattedMessage id="lbl.argue.bizDate"/>} span={8} isSpan={true}/>  
                            {/* 费用小类 */}
                            <InputText disabled name={['popData','feeType']}  label={<FormattedMessage id='lbl.Small-class-fee'/>} span={8} isSpan={true}/>  
                            {/* SVVD */}
                            <InputText disabled name={['popData','svvdId']}  label={<FormattedMessage id="lbl.SVVD"/>} span={8} isSpan={true}/>  
                            {/* 港口 */}
                            <InputText disabled name={['popData','portCode']}  label={<FormattedMessage id="lbl.port"/>} span={8} isSpan={true}/>  
                            {/* EOV */}
                            <InputText disabled name={['popData','eovStatus']}  label={<FormattedMessage id="lbl.EOV"/>} span={8} isSpan={true}/>  
                            {/* Trade Lane */}
                            <InputText disabled name={['popData','tradeLaneCode']}  label={<FormattedMessage id='lbl.trade-channel'/>} span={8} isSpan={true}/>  
                        </Row>
                    </Form>
                </div>
                <Tabs type="card" style={{marginTop:'5px'}} style={{minWidth: '300px'}}>
                    {/* 收入信息 */}
                    <TabPane tab={<FormattedMessage id='lbl.Revenue-information' />} key="1">
                        {/* 明细列表1 */}
                        <div className='footer-table' hidden={showFlag1}>
                            <PaginationTable
                                dataSource={revenueData}
                                columns={feeAdjustManual}
                                rowKey='feeAgmtItemUUID'
                                scrollHeightMinus={200}
                                pagination={false}
                                rowSelection={null}
                            />
                        </div>

                        {/* 明细列表2 */}
                        <div className='footer-table' hidden={showFlag2}>
                            <PaginationTable
                                dataSource={revenueData}
                                columns={feeContainer}
                                rowKey='feeAgmtItemUUID'
                                scrollHeightMinus={200}
                                pagination={false}
                                rowSelection={null}
                            />
                        </div>
                        {/* 明细列表2-汇总 */}
                        <div className='footer-table' style={{marginTop:'10px'}}  hidden={showFlag2}>
                            <PaginationTable
                                dataSource={revenueDatas}
                                columns={summaryDeatilTableViewer} 
                                rowKey="feeAgmtItemUUID"
                                pagination={false}
                                rowSelection={null}
                                scrollHeightMinus={200}
                            />
                        </div>

                        {/* 明细列表3 */}
                        <div className='footer-table' hidden={showFlag3}>
                            <PaginationTable
                                dataSource={revenueData}
                                columns={feeSvvd}
                                rowKey='feeAgmtItemUUID'
                                scrollHeightMinus={200}
                                pagination={false}
                                rowSelection={null}
                            />
                        </div>

                        {/* 明细列表4 */}
                        <div className='footer-table' hidden={showFlag4}>
                            <PaginationTable
                                dataSource={revenueData}
                                columns={feeBill}
                                rowKey='feeAgmtItemUUID'
                                scrollHeightMinus={200}
                                pagination={false}
                                rowSelection={null}
                            />
                        </div>
                        <div className="add-save-button">
                            {/* 下载 */}
                            <Button onClick={downloadDel}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></Button>
                            {/* 关闭 */}
                            <Button onClick={handleCancel} ><CloseOutlined  /><FormattedMessage id='lbl.close' /></Button>
                        </div>
                    </TabPane>
                    {/* 支出信息 */}
                    <TabPane tab={<FormattedMessage id='lbl.Expenditure-information' />} key="2">
                        {/* 明细列表1 */}
                        <div className='footer-table' hidden={showFlag1}>
                            <PaginationTable
                                dataSource={expenditureData}
                                columns={feeAdjustManual}
                                rowKey='feeAgmtItemUUID'
                                scrollHeightMinus={200}
                                pagination={false}
                                rowSelection={null}
                            />
                        </div>

                        {/* 明细列表2 */}
                        <div className='footer-table' hidden={showFlag2}>
                            <PaginationTable
                                dataSource={expenditureData}
                                columns={feeContainer}
                                rowKey='feeAgmtItemUUID'
                                scrollHeightMinus={200}
                                pagination={false}
                                rowSelection={null}
                            />
                        </div>
                        {/* 明细列表2-汇总 */}
                        <div className='footer-table' style={{marginTop:'10px'}}  hidden={showFlag2}>
                            <PaginationTable
                                dataSource={expenditureDatas}
                                columns={summaryDeatilTableViewer} 
                                rowKey="feeAgmtItemUUID"
                                pagination={false}
                                rowSelection={null}
                                scrollHeightMinus={200}
                            />
                        </div>

                        {/* 明细列表3 */}
                        <div className='footer-table' hidden={showFlag3}>
                            <PaginationTable
                                dataSource={expenditureData}
                                columns={feeSvvd}
                                rowKey='feeAgmtItemUUID'
                                scrollHeightMinus={200}
                                pagination={false}
                                rowSelection={null}
                            />
                        </div>

                        {/* 明细列表4 */}
                        <div className='footer-table' hidden={showFlag4}>
                            <PaginationTable
                                dataSource={expenditureData}
                                columns={feeBill}
                                rowKey='feeAgmtItemUUID'
                                scrollHeightMinus={200}
                                pagination={false}
                                rowSelection={null}
                            />
                        </div>
                        <div className="add-save-button">
                            {/* 下载 */}
                            <Button onClick={downloadDel}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></Button>
                            {/* 关闭 */}
                            <Button onClick={handleCancel} ><CloseOutlined  /><FormattedMessage id='lbl.close' /></Button>
                        </div>
                    </TabPane>
                </Tabs>
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default estimateCostQuery