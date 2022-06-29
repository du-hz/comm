{/* 待处理费用预估单 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import { FormattedMessage,  useIntl } from 'umi';
import { Button, Form, Row, Tabs,  Modal} from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, costCategories,  agencyCodeData,acquireSelectDataExtend } from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import request from '@/utils/request';
import {Toast} from '@/utils/Toast';
import Loading from '@/components/Common/Loading';
import SelectVal from '@/components/Common/Select';
import CosButton from '@/components/Common/CosButton'
import CosModal from '@/components/Common/CosModal'

import {
    DeliveredProcedureOutlined ,//全选
    SaveOutlined,//保存
    ReloadOutlined,//取消
    SnippetsOutlined , //确认
    CloudUploadOutlined ,//上载
    CloudDownloadOutlined,//下载
    CloseOutlined, //关闭
    SearchOutlined, //查询
} from '@ant-design/icons'
const confirm = Modal.confirm;

{/* tab切换 */}
const { TabPane } = Tabs;
const pendingCostEstimate =()=> {
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData,setTableData] = useState([]);   // table 数据
    const [detailData,setDetailData] = useState([]);   // table 数据-明细
    const [detailList,setDetailList] = useState([]);   // table 数据-明细-汇总
    const [tabTotal,setTabTotal ] = useState([]);     // table 条数
    const [detailedTotal, setDetailedTotal] = useState([]);   // 明细table条数
    const [defaultKey, setDefaultKey] = useState('1');  //导航页
    const [stateData, setStateData] = useState({});   // 状态
    const [uuidData, setUuidData] = useState('');   // uuid  
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //选择
    const [queryDataCode, setQueryDataCode] = useState([]);   // 头
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [revenueData,setRevenueData] = useState([]);  // 收入信息
    const [revenueDatas,setRevenueDatas] = useState([]);  // 收入信息-汇总
    const [expenditureData,setExpenditureData] = useState([]);  // 支出信息
    const [expenditureDatas,setExpenditureDatas] = useState([]);  // 支出信息-汇总
    const [isModalVisible, setIsModalVisible] = useState(false);   // 明细弹窗
    const [headerTitle, setHeaderTitle] = useState(""); //弹窗标题
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning
    const [showFlag1,setShowFlag1] = useState(false);    // 控制不同tableId,弹窗显示不同的明细列表
    const [showFlag2,setShowFlag2] = useState(false);
    const [showFlag3,setShowFlag3] = useState(false);
    const [showFlag4,setShowFlag4] = useState(false);
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeCategory,setFeeCategory] = useState ([])
    const [vesselProperty,setVesselProperty] = useState ({}); //船舶属性
    const [tradeZoneCode,setTradeZoneCodeData] = useState ({}); //贸易区
    const [detailedUuid, setDetailedUuid] = useState('');
    const [parameter, setParameter] = useState('');
    const [dtlUid, setDtlUid] = useState('');
    const [searchData, setSearchData] = useState([]); 
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
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company,acquireData])

    useEffect(() => {
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setStateData, $apiUrl);     // 状态
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大类
        acquireSelectData('VESSELTYPE',setVesselProperty,$apiUrl);//船舶属性
        acquireSelectData('AFCM.TRADE.ZONE',setTradeZoneCodeData, $apiUrl);// 贸易区
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
    }, [])
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
                v['label']=v.feeCode+'(' + v.feeName +')';
            })
            setFeeCategory(listAgTypeToClass)
        }
    }

    {/* 预估单列表 */}
    const column=[
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Estimated-order-number' />,//预估单号码
            dataIndex: 'ygListCode',
            align:'left', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Temporary.estimated-order-number' />,//临时预估单号码
            dataIndex: 'tmpYgListCode',
            align:'left', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.generation-date' />,//生成日期
            dataIndex: 'generateDate',
            align:'left', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Generation-personnel' />,//生成人员
            dataIndex: 'generateUser',
            align:'left', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.update-people' />,//更新人员
            dataIndex: 'recordUpdateUser',
            align:'left', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.update-date' />,//更新日期
            dataIndex: 'recordUpdateDate',
            align:'left', 
            sorter: false,
            width: 120,
        },
        // {
        //     title: <FormattedMessage id='lbl.basic-uuid' />,//basicUUID
        //     dataIndex: 'ygListUuid',
        //     align:'left', 
        //     sorter: false,
        //     width: 140,
        // },
    ]
    {/* 明细信息列表 */}
    const columnDetail=[
        {
            title: <FormattedMessage id='lbl.state' />,//状态
            dataIndex: 'verifyStatus',
            dataType: stateData.values,
            align:'left', 
            sorter: false,
            width: 50,
        },
        {
            title: <FormattedMessage id='lbl.ac.pymt.claim-note' />,//备注
            dataIndex: 'userNote',
            align:'left', 
            sorter: false,
            width: 50,
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            align:'left',
            sorter: false,
            width: 50
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
            title: <FormattedMessage id="lbl.EOV" />,// EOV
            dataIndex: 'eovStatus',
            align:'left',
            sorter: false,
            width: 50
        },
        {
            title: <FormattedMessage id='lbl.Ship-property' />,// 船舶属性
            dataIndex: 'vesselProperty',
            dataType: vesselProperty.values,
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.argue.trade-code' />,// 贸易区
            dataIndex: 'tradeZoneCode',
            dataType: tradeZoneCode.values,
            align:'left',
            sorter: false,
            width: 60
        },
        {
            title: <FormattedMessage id='lbl.Trade' />,// Trade
            dataIndex: 'tradeCode',
            align:'left',
            sorter: false,
            width: 60
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'tradeLaneCode',
            align:'left',
            sorter: false,
            width: 60
        },
        {
            title: <FormattedMessage id='lbl.profit-center'/>,// 利润中心
            dataIndex: 'profitCenterCode',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency' />,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount' />,// 协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            align:'right',
            sorter: false,
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount' />,// 协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Whether-the-price-includes-tax' />,// 是否含税价
            dataIndex: 'vatFlag',
            dataType: priceIncludingTax.values,
            align:'left',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference' />,// 协议币税金(参考)
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference' />,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140
        },
        {
            title: <FormattedMessage id= 'lbl.Amount-payable-to-outlets'/>,// 应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'paymentAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.AP-outlets' />,// 应付网点
            dataIndex: 'customerSAPId',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id= 'lbl.Agency-net-income'/>,// 代理净收入
            dataType: 'dataAmount',
            dataIndex: 'recAmount',
            align:'right',
            sorter: false,
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.estimate'/>,// 向谁预估
            dataIndex: 'ygSide',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Standard-currency' />,// 本位币种
            dataIndex: 'agencyCurrency',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Amount-in-base-currency'/>,// 本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyAmount',
            align:'right',
            sorter: false,
            width: 90
        },
        {
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency' />,// 本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyReviseAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-in-local-currency' />,// 本位币税金(参考)
            dataIndex: 'vatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency'/>,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140
        },
        {
            title: <FormattedMessage id= 'lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'cleaningCurrencyCode',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'cleaningAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id= 'lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseCleaningAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id= 'lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency' />,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140
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
            title: <FormattedMessage id='lbl.basic-uuid' />,// EntityUuid
            dataIndex: 'entryUuid',
            align:'left',
            sorter: false,
            width: 100
        },
    ]
    {/* 明细信息列表-汇总 */}
    const columnList=[
        {
            title: <FormattedMessage id='lbl.Agreement-currency' />,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount' />,// 协议币金额
            dataType: 'dataAmount',
            dataIndex: 'rateSumAmount',
            align:'right',
            sorter: false,
            width: 90
        },
        {
            title: <FormattedMessage id= 'lbl.Agreement-currency-adjustment-amount' />,//协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'rateSumReviseAmount',
            align:'right', 
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference' />,//协议币税金(参考)
            dataIndex: 'sumVatAmt',
            dataType: 'dataAmount',
            align:'right', 
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference' />,//协议币调整税金(参考)
            dataIndex: 'sumVatReviseAmt',
            dataType: 'dataAmount',
            align:'right', 
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets' />,//应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'sumPaymentAmount',
            align:'right', 
            sorter: false,
            width: 100
        },
        {
            title: <FormattedMessage id= 'lbl.Agency-net-income' />,//代理净收入
            dataType: 'dataAmount',
            dataIndex: 'sumRecAmount',
            align:'right', 
            sorter: false,
            width: 90
        },
        {
            title: <FormattedMessage id= 'lbl.estimate' />,//向谁预估
            dataIndex: 'ygSide',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.Standard-currency' />,//本位币种
            dataIndex: 'agencyCurrencyCode',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.Amount-in-base-currency' />,//本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencySumAmount',
            align:'right', 
            sorter: false,
            width: 90
        },
        {
            title: <FormattedMessage id= 'lbl.Adjustment-amount-in-base-currency' />,//本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencySumReviseAmount',
            align:'right', 
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-in-local-currency' />,// 本位币税金(参考)
            dataIndex: 'sumVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency'/>,// 本位币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140
        },
        {
            title: <FormattedMessage id= 'lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumAmount',
            align:'right',
            sorter: false,
            width: 90
        },
        {
            title: <FormattedMessage id= 'lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumReviseAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id= 'lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataType: 'dataAmount',
            dataIndex: 'sumVatAmtInClearing',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency' />,// 结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140
        },
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
            dataIndex: 'feeType',
            dataType: feeCategory,
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id= 'lbl.ccy'/>,//币种
            dataIndex: 'currencyCode',
            align:'left', 
            width: 40,
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
            width: 60,
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
            width: 70,
        },{
            title: <FormattedMessage id='lbl.Container-capacity' />,//箱量
            dataIndex: 'num',
            align:'right', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.rate-one'/>,//费率
            dataIndex: 'rate',
            dataIndex: 'totalAmount',
            align:'right', 
            width: 45,
        },{
            title: <FormattedMessage id= 'lbl.amount'/>,//金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
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
            align:'left', 
            width: 100,
        },{
            title: <FormattedMessage id='lbl.Net-tonnage'/>,//船舶净吨位
            // dataIndex: 'netWeightRepeat',
            dataIndex: 'netWeight',
            align:'right', 
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
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Algorithm'/>,//算法
            dataIndex: 'calculationMode',
            align:'left', 
            width: 45,
        },{
            title: <FormattedMessage id='lbl.generation-date'/>,//生成日期
            dataIndex: 'recUpdDate',
            align:'left', 
            width: 80,
        },
    ]

    {/* 明细弹窗-明细列表4  SVVD--BL--生成日期*/}
    const feeBill = [
        {
            title: <FormattedMessage id='lbl.SVVD'/>,//svvd
            dataIndex: 'svvd',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Bl'/>,//BL
            dataIndex: 'referenceCode',
            align:'left', 
            width: 40,
        },{
            title: <FormattedMessage id='lbl.Belong-company'/>,//所属公司
            dataIndex: 'billCompanyCode',
            align:'left', 
            width: 80,
        },{
            title: <FormattedMessage id='lbl.ccy'/>,//币种
            dataIndex: 'agencyCurrency',
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

    {/* 预估单列表 */}
    const ForecastList = async(pagination,search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        const result =await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_IN_PROCESS_BILL,{
            method:"POST",
            data:{
                "page": pagination,
                "params":{
                    "verifyStatus": "W"  ,
                    "searchStatus": "Y"  ,
                    // ...queryForm.getFieldValue()
                    soCompanyCode: queryForm.getFieldValue().soCompanyCode ,
                    agencyCode: queryForm.getFieldValue().agencyCode ,
                }
            }
        })
        let data=result.data
        if(result.success) {
            setSpinflag(false);
            let datas=result.data.resultList
            setSearchData(datas)
            if(datas!=null){
                datas.map((v,i)=>{
                    v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                    // v.recordUpdateDate ? v["recordUpdateDate"] = v.recordUpdateDate.substring(0, 10) : null;
                })
            }
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
        }else{
            setSpinflag(false);
            setTableData([])
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }

    {/* 明细信息 */}
    const pageChange = async (pagination, ygListUuid) =>{
        Toast('', '', '', 5000, false);
        if(pagination.pageSize!=page1.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result =await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_IN_PROCESS_BILL_DTL,{
            method:"POST",
            data:{
                page: pagination,
                uuid: ygListUuid ? ygListUuid : detailedUuid,
            }
        })
        if(result.success){
            setSpinflag(false);
            let data=result.data
            let verifyStatus = '';
            let queryData = data.agencyYg;
            setUuidData(queryData.ygListUuid);  //获取uuid
            setQueryDataCode(queryData);
            let checkedUuid = [];
            if(data.agencyYgDetailList!=null){
                data.agencyYgDetailList.map((v, i) => {
                    if(v.verifyStatus == stateData.values[2].value) {
                        checkedUuid.push(v.entryUuid);
                    }
                })
            }
            setChecked(checkedUuid);
            let agencyYgDetailList=result.data.agencyYgDetailList
            let summaryList=result.data.summaryList
            if(summaryList!=null){
                summaryList.map((v,i)=>{
                    v.id=i
                })
            }
            if(agencyYgDetailList!=null){
                agencyYgDetailList.map((v,i)=>{
                    v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                })
            }
            setPage1({...pagination})
            setDetailData([...agencyYgDetailList]) //明细
            setDetailedTotal(data.totalCount)   //明细-条数
            setDetailList([...summaryList])    // 明细-汇总
            setSelectedRowKeys([data.summaryList.verifyStatus])
            queryForm.setFieldsValue({
                tmpYgListCode: queryData.tmpYgListCode,
                generateDate: queryData.generateDate ? queryData.generateDate.substring(0, 10) : null,
                generateUser: queryData.generateUser,
                recordUpdateUser: queryData.recordUpdateUser,
                recordUpdateDate: queryData.recordUpdateDate ? queryData.recordUpdateDate.substring(0, 10) : null,
            })
        }else {
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }

    {/* 双击 */}
    const handleDoubleClickRow = (parameter) => {
        Toast('', '', '', 5000, false);
        page1.current=1
        page1.pageSize=10
        // setDetailedUuid('');
        setDetailedUuid(parameter.ygListUuid);
        pageChange(page1, parameter.ygListUuid);
        setDefaultKey('2');
    }
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key)
	}

    {/* 保存 */}
    const saveBtn = async() => {
        Toast('', '', '', 5000, false);
        let data = [];
        detailData.map((v, i) => {
            data.push({
                entryUuid: v.entryUuid,
                verifyStatus: v.verifyStatus,
                userNote: v.userNote
            })
        })
        setSpinflag(true);
        const save =await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SAVE_LIST_DTL,{
            method:"POST",
            data:{
                paramsList: data,
                agencyCode: queryDataCode.agencyCode,
                uuid: queryDataCode.ygListUuid
            }
        })
        if(save.success) {
            setSpinflag(false);
            Toast('',save.message, 'alert-success', 5000, false)
        }else{
            setSpinflag(false);
            Toast('',save.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 全选/全不选 */}
    const allSelect = (flag) => {
        Toast('', '', '', 5000, false);
        let data = detailData.map((v, i) => {
            return v.entryUuid;
        })
        flag ? setChecked(data) : setChecked([]);
        flag ? selectFun(detailData, detailData) : selectFun(detailData, []);
    }
    {/* 选择和状态的联动 */}
    const selectFun = (detailData, row) => {
        detailData.map((v, i) => {
            v.verifyStatus = stateData.values[3].value;
        })
        row.map((v, i) => {
            v.verifyStatus = stateData.values[2].value;
        })
    }
    {/* 确认&确认所有&取消 */}
    const clickBtn = async(operate,state) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title:  intl.formatMessage({id:  'lbl.Info-tips'}),
            content: intl.formatMessage({ id: `lbl.${state == 'P' ? 'ag-fee-pending-confirm' : 'ag-fee-pending-cancel'}` }),
            okText: intl.formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                let data = [];
                detailData.map((v, i) => {
                    data.push({
                        entryUuid: v.entryUuid,
                        verifyStatus: v.verifyStatus,
                        userNote: v.userNote
                    })
                })
                const result =await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_CONFIRM_TABLE_LIST,{
                    method:"POST",
                    data:{
                        paramsList: data,
                        uuid: uuidData,
                        "params":{
                            "verifyStatus": state
                        },
                        "operateType": operate 
                    }
                })
                if(result.success) {
                    setSpinflag(false);
                    // queryForm.resetFields();
                    queryForm.setFieldsValue({
                        // agencyCode: company.agencyCode,
                        soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
                    },[company]) 
                    setTableData([]);
                    setDetailData([])
                    setDetailList([])
                    setDefaultKey('1');
                    if(searchData.length>1){
                        ForecastList(page);
                        Toast('',result.message, 'alert-success', 5000, false)
                    }else{
                        setTableData([])
                        Toast('',result.message, 'alert-success', 5000, false)
                    }
                }else{
                    setSpinflag(false);
                    Toast('',result.errorMessage, 'alert-error', 5000, false)
                }
            }
        })
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
    {/* 重置 */}
    const reset = ()=>{
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        page.current=1;
        setTableData([]);
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }
    {/* 双击获取明细弹窗 */}
    const handleDoubleClickRowModel = async(parameter) => {
        Toast('', '', '', 5000, false);
        setParameter(parameter)
        setDtlUid(parameter.entryUuid)
        setSpinflag(true);
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
            // let feeBills = data.feeBills
            let feeBills = data.feeSvvds
            queryForm.setFieldsValue({   // 明细-头部信息
                popData: {
                    activityDate:  headData.activityDate ? headData.activityDate.substring(0, 10) : null,
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
                    if(feeBills!=null){
                        feeBills.map((v,i)=>{
                            v.recUpdDate ? v["recUpdDate"] = v.recUpdDate.substring(0, 10) : null;
                            v.feeAgmtItemUUID=i
                        })
                    }
                    setRevenueData(feeBills);   
                    setExpenditureData();  //暂无
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
        setSpinflag(true);
        if(uuidData==""){
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return;
        }
        const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_SHEET_DOWNLOAD,{
            method:"POST",
            data:{
                page: {
                    pageSize: 0,
                    current: 0
                },
                uuid: uuidData,
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.pendingCost'}), //文件名
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                            ygListCode: intl.formatMessage({id: "lbl.Estimated-order-number"}),   
                            tmpYgListCode: intl.formatMessage({id: "lbl.Temporary.estimated-order-number"}),   
                            generateDate: intl.formatMessage({id: "lbl.generation-date"}),  
                            generateUser: intl.formatMessage({id: "lbl.Generation-personnel"}),
                            recordUpdateUser: intl.formatMessage({id: "lbl.update-people"}),
                            recordUpdateDate: intl.formatMessage({id: "lbl.update-date"}),
                            // ygListUuid: intl.formatMessage({id: "lbl.basic-uuid"}),
                        },
                        sumCol: {},//汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Pedding-estimate'}),//待处理预估单
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            verifyStatus: intl.formatMessage({id: "lbl.state"}),
                            userNote: intl.formatMessage({id: "lbl.ac.pymt.claim-note"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                            portCode: intl.formatMessage({id: "lbl.port"}),
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                            eovStatus: intl.formatMessage({id: "lbl.EOV"}),
                            vesselProperty: intl.formatMessage({id: "lbl.Ship-property"}),
                            tradeZoneCode: intl.formatMessage({id: "lbl.argue.trade-code"}),
                            tradeCode: intl.formatMessage({id: "lbl.Trade"}),
                            tradeLaneCode: intl.formatMessage({id: "lbl.Trade-line"}),
                            profitCenterCode: intl.formatMessage({id: "lbl.profit-center"}),
                            rateCurrency: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            vatFlag: intl.formatMessage({id: "lbl.Whether-the-price-includes-tax"}),
                            vatAmt: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),
                            vatReviseAmt: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),
                            paymentAmount: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),
                            customerSAPId: intl.formatMessage({id: "lbl.AP-outlets"}),
                            recAmount: intl.formatMessage({id: "lbl.Agency-net-income"}),
                            ygSide: intl.formatMessage({id: "lbl.estimate"}),
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
                            entryUuid: intl.formatMessage({id: "lbl.basic-uuid"}),
                        },
                        sumCol: {},//汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Pedding-estimate-info'}),//待处理预估单详细信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            rateCurrency: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            rateSumAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            rateSumReviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            sumVatAmt: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),
                            sumVatReviseAmt: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),
                            sumPaymentAmount: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),
                            sumRecAmount: intl.formatMessage({id: "lbl.Agency-net-income"}),
                            ygSide: intl.formatMessage({id: "lbl.estimate"}),
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
                        sumCol: {},//汇总字段
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.pendingCost'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.pendingCost'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
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
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.pendingCost'}), //文件名
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.pendingCost'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
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
            <Tabs type="card"   onChange={callback} activeKey={defaultKey}>
                <TabPane tab={<FormattedMessage id='lbl.Forecast-list' />} key="1">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 船东 */}
                                <SelectVal span={6} name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values}/>
                                {/* 代理编码 */}
                                {
                                    company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <SelectVal showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                                }
                                {/* <SelectVal showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 重置 */}
                            <Button onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></Button>
                            {/* 查询 */}
                            <Button onClick={()=> ForecastList(page,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                        </div>
                    </div>
                    <div className='footer-table'>
                        <div style={{width: '80%'}}>
                            <PaginationTable
                                dataSource={tableData}
                                columns={column}
                                rowKey='ygListUuid'
                                pageChange={ForecastList}
                                scrollHeightMinus={200}
                                pageSize={page.pageSize}
                                current={page.current}
                                total={tabTotal}
                                rowSelection={null}
                                selectWithClickRow={true}
                                handleDoubleClickRow={handleDoubleClickRow}
                            />
                        </div>
                    </div>
                </TabPane>
                <TabPane tab={<FormattedMessage id='lbl.Detailed-information' />} key="2">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 临时预估单号码 */}
                                <InputText disabled name='tmpYgListCode' label={<FormattedMessage id='lbl.Temporary.estimated-order-number'/>} span={6}  />   
                                {/* 生成日期 */}
                                <InputText disabled name='generateDate' label={<FormattedMessage id="lbl.generation-date" />} span={6} />
                                {/* 更新日期 */}
                                <InputText disabled name='recordUpdateDate' label={<FormattedMessage id='lbl.update-date' span={6} />} />
                                {/* 生成人员 */}
                                <InputText disabled name='generateUser' label={<FormattedMessage id='lbl.Generation-personnel'/>} span={6} />  
                                {/* 更新人员 */}
                                <InputText disabled name='recordUpdateUser' label={<FormattedMessage id='lbl.update-people'/>} span={6}/>  
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.es-header-info'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 全选 */}
                            <Button onClick={()=>allSelect(true)}><DeliveredProcedureOutlined  /><FormattedMessage id='btn.select-all' /></Button>
                            {/* 全不选 */}
                            <Button onClick={()=>allSelect(false)}><DeliveredProcedureOutlined  /><FormattedMessage id='btn.no-at-all' /></Button>
                            {/* 保存 */}
                            <CosButton onClick={saveBtn} auth='AFCM-AG-ER-003-B01'><SaveOutlined /><FormattedMessage id='btn.save' /></CosButton>
                            {/* 确认 */}
                            <CosButton onClick={()=> clickBtn("alone",'P')} auth='AFCM-AG-ER-003-B02'><SnippetsOutlined  /><FormattedMessage id='btn.ok'/></CosButton>
                            {/* 确认所有 */}
                            <CosButton onClick={()=> clickBtn("all",'P')} auth='AFCM-AG-ER-003-B03'><SnippetsOutlined  /><FormattedMessage id='btn.ok-all'/></CosButton>
                            {/* 取消 */}
                            <CosButton onClick={()=> clickBtn("all",'E')} auth='AFCM-AG-ER-003-B04'>< ReloadOutlined/><FormattedMessage id='btn.cancel'/></CosButton>
                            {/* 上载全部 */}
                            <Button><CloudUploadOutlined  /><FormattedMessage id='btn.upload-all'/></Button>
                            {/* 上载错误 */}
                            <Button><CloudUploadOutlined  /><FormattedMessage id='btn.upload-error'/></Button>
                            {/* 下载 */}
                            <Button onClick={downloadBtn}><CloudDownloadOutlined/><FormattedMessage id='btn.download'/></Button>
                        </div>
                        <div className='button-right'></div>
                    </div>
                    <div className='footer-table'>
                        {/* 表格 */}
                        <PaginationTable
                            dataSource={detailData}
                            columns={columnDetail}
                            rowKey='entryUuid'
                            pageChange={pageChange}
                            scrollHeightMinus={200}
                            pageSize={page1.pageSize}
                            current={page1.current}
                            total={detailedTotal}
                            selectedRowKeys = {selectedRowKeys}
                            rowSelection={{
                                selectedRowKeys:checked,
                                onChange:(key, row)=>{
                                    setChecked(key);
                                    // setUuidData(row);
                                    selectFun(detailData, row);
                                }
                            }}
                            selectWithClickRow={true}
                            handleDoubleClickRow={handleDoubleClickRowModel}
                        />
                    </div>
                    <div className='footer-table' style={{marginTop:'10px'}}>
                        <PaginationTable
                            rowKey="id"
                            columns={columnList} 
                            dataSource={detailList}
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={200}
                        />
                    </div>
                </TabPane>
            </Tabs>
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
                <Tabs type="card" style={{marginTop:'5px',minWidth: '300px'}}>
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
export default pendingCostEstimate