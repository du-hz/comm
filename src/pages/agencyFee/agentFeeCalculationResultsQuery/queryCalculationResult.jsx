import React, { useState,useEffect, $apiUrl} from 'react'
import {FormattedMessage, useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import SelectVal from '@/components/Common/Select';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal,Tabs} from 'antd'
import {agencyCodeData,acquireSelectData, costCategories, acquireSelectDatas,acquireSelectDataExtend,TradeData,momentFormat,formatCurrencyNew} from '@/utils/commonDataInterface';
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'

import {
    SearchOutlined,//日志
    CloudDownloadOutlined,//新增
    ReloadOutlined,
} from '@ant-design/icons'

// ------------------------------------查询代理费计算结果--------------------------

const confirm = Modal.confirm
const { TabPane } = Tabs;
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const searchPreAgreementMailFeeAgmtList =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [mailingData,setMailingData] = useState({});//邮件发送
    const [defaultKey, setDefaultKey] = useState('1');
    const [lastCondition, setLastCondition] = useState({
        // "shipperOwner": null,
    });
   
    const [tableData,setTableData] = useState([])//表格数据
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    const [tableName,setTableName] = useState([])//弹框表格字段
    const [collectFlag,setCollectFlag] = useState(true)//汇总表格是否显示
    const [tableDataDetail,setTableDataDetail] = useState([])//明细表格数据
    const [tabTotalDetail,setTabTotalDetail] = useState([])//明细表格数据的个数
    
    const [costKey,setCostKey] = useState ([])//费用大类
    const [subclass,setSubclass] = useState ([])//费用小类
    const [subclassAll,setSubclassAll] = useState ([])//全部费用小类
    const [shipTypes, setShipTypes] = useState({});// 船舶类型
    const [vesselType,setVesselType] = useState({})//船舶属性
    const [trade, setTrade] = useState({});// 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [actualFlag, setActualFlag] = useState({}); // 实际是否发生
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [postCalcFlg,setPostCalcFlg] = useState({})//记账算法
    const [postMode,setPostMode] = useState({})//记账方式
    const [isYt,setIsYt] = useState({})//预提是否记账
    const [isBill,setIsBill] = useState({})//应付实付是否记账
    const [spinflag,setSpinflag] = useState(false)
    const [parameterData,setParameterData] = useState({})//
    const [checked, setChecked] = useState([]);
    const [uuid,setUuid] = useState([])//uuid
    const [uuidData, setUuidData] = useState([]); // 选择数据

    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const Intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    const [pageDetail,setPageDetail]= useState({
        current: 1,
        pageSize: 10
    })
    const [queryForm] = Form.useForm();
    const [queryForms] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.ENABLEFLAG',setMailingData,$apiUrl);//邮件发送
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDatas('AFCM.BARGE.TYPE',setShipTypes ,$apiUrl);// 船舶类型
        acquireSelectDatas('VESSELTYPE',setVesselType,$apiUrl);//船舶属性
        acquireSelectDatas('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectData('AGMT.VAT.FLAG',setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectDatas('AFCM.AG.KPI.ACTUALFLAG',setActualFlag,$apiUrl);//实际是否发生
        acquireSelectDatas('AFCM.AGMT.POST.CALC.FLAG',setPostCalcFlg,$apiUrl);//记账算法
        acquireSelectDatas('AFCM.AGMT.POST.CALC.MODE',setPostMode,$apiUrl);//记账方式
        acquireSelectDatas('AFCM.AGMT.YT.BUSINESS',setIsYt,$apiUrl);//预提是否记账
        acquireSelectDatas('AFCM.AGMT.YF.BUSINESS',setIsBill,$apiUrl);//应付实付是否记账
        // console.log(pageDetail)
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


    //代理费查询计算结果表格文本
    const columns=[
        {
            title:<FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },
        {
            title: <FormattedMessage id="lbl.ht.statement.upload-vessel-name" />,//船名
            dataIndex: 'vslName',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType:'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclassAll,
            dataIndex: 'feeType',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.port" /> ,//港口
            dataIndex: 'portCode',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.office" /> ,//office
            dataIndex: 'officeCode',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" /> ,//实际是否发生
            dataIndex: 'actualFlag',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.Agreement-currency" /> ,//协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额  
            dataType:'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            width: 80,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,//是否含税价
            dataType: priceIncludingTax.values,
            dataIndex: 'vatFlag',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,//协议币税金(参考)
            dataIndex: 'vatAmt',
            sorter: false,
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Standard-currency" />,//本位币种
            dataIndex: 'agencyCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额
            dataType:'dataAmount',
            dataIndex: 'totalAmountInAgency',
            sorter: false,
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,//本位币税金(参考)
            dataIndex: 'vatAmountInAgency',
            sorter: false,
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Tax-amount" />,//税额
            // dataType:'dataAmount',
            dataIndex: 'taxAmountInAgency',
            sorter: false,
            width: 120,
            align:'right',
            render:(text,record)=>{
                return text?text.toFixed(1):'0.0'
            }
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataType:'dataAmount',
            dataIndex: 'totalAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,//结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            sorter: false,
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.On-line-area" />,//是否上线地区
            dataIndex: 'enableIndicator',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.argue.trade-code" />,//贸易区
            dataIndex: 'tradeZoneCode',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Trader" />,//Trader
            dataIndex: 'tradeCode',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'tradeLaneCode',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-production-port" />,//是否生产性挂港
            dataIndex: 'productIndicator',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.within-boundary" />,//是否边界内
            dataIndex: 'exFlag',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Ship-type" />,//船舶类型
            dataType:shipTypes.values,
            dataIndex: 'bargeType',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Ship-property" />,//船舶属性
            dataType:vesselType.values,
            dataIndex: 'vesselProperty',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.arithmetic" />,//记账算法
            dataType:postCalcFlg.values,
            dataIndex: 'postCalcFlg',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.bookkeeping" />,//记账方式
            dataType:postMode.values,
            dataIndex: 'postMode',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.estimate" />,//向谁预估
            dataIndex: 'ygSide',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,//向谁报账
            dataIndex: 'sfSide',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.actually" />,//应付实付是否记账
            dataType:isBill.values,
            dataIndex: 'isBill',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.withholding" />,//预提是否记账
            dataType:isYt.values,
            dataIndex: 'isYt',
            sorter: false,
            width: 120,
            align:'left',
            
        }
    ]
    const columnsBL = [
        {
            title:<FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclassAll,
            dataIndex: 'feeType',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'feeType',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Company (B/L)" />,//公司(提单)
            dataIndex: 'referenceCode',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,//实际是否发生
            dataIndex: 'actualFlag',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.price" />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'feeAmount',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Agreement-number" />,//协议号码
            dataIndex: 'feeAgmtCode',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.On-line-area" />,//是否上线地区
            dataIndex: 'enableInd',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Whether-to-choose-to-charge" />,//是否择大收取
            dataIndex: 'compareInd',
            sorter: false,
            align:'left',
            width: 100,
            
        }, {
            title:<FormattedMessage id="lbl.Data-source" />,//数据源
            dataIndex: 'dataSource',
            sorter: false,
            align:'left',
            width: 100,
            
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
            dataType:subclassAll,
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
    const columnsSVVD=[
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
            dataType:subclassAll,
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

    //初始化下拉框数据
    useEffect(()=>{
        queryForm.setFieldsValue({
            ...lastCondition,
        });
        
    },[])
    
    //表格数据
    const pageChange= async(pagination,options,search) =>{
		Toast('', '', '', 5000, false);
        let query = queryForm.getFieldValue()
        com()
        setChecked([])
        setTableData([])
        if(search){
            pagination.current=1
        }
        // 业务时间/SVVD/港口至少输入一项
        if(!query.activeDate&&!query.svvdId&&!query.portCode){
            setBackFlag(false)
            Toast('',Intl.formatMessage({id:'lbl.afcm-0053'}) , 'alert-error', 5000, false)
        }else{
            let dates =query.activeDate ? Math.abs((query.activeDate[0] - query.activeDate[1]))/(1000*60*60*24) : null
            if(dates>190){
                setBackFlag(false)
                Toast('',Intl.formatMessage({id: 'lbl.afcm-0062'}), 'alert-error', 5000, false)
            }else{
                setSpinflag(true)
                setBackFlag(true)
                let localsearch=await request($apiUrl.AG_FEE_CALC_SEARCH_LIST,{
                    method:'POST',
                    data:{
                        "page": pagination,
                        "params": {
                            ...query,
                            Date:undefined,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                            // "agencyCode":"9999203000",
                            // "soCompanyCode":"2000"
                        },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    let data = localsearch.data
                    let datas = data.resultList
                    datas.map((v,i)=>{
                        v['id'] = i
                    })
                    setTableData([...datas])
                    setTabTotal(data.totalCount)
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    setSpinflag(false)
                }else{
                    setSpinflag(false)
                    Toast('', localsearch.errorMessage , 'alert-error', 5000, false)
                }
            }
        }
        
    }

    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
    }
   //双击
   const doubleClickRow = async(parameter) => {
		Toast('', '', '', 5000, false);
        setDefaultKey('2')
        setParameterData(parameter)
        detail(pageDetail,parameter)
        
    }
    const detail=async(pagination,parameter)=>{
        Toast('', '', '', 5000, false);
        console.log(parameter)
        setSpinflag(true)
       
        let localsearch = await request($apiUrl.AG_FEE_CALC_LOAD_DETAIL,{
            method:'POST',
            data:{
                page:pagination,
                'params':parameter?{...parameter}:{...parameterData}
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            setSpinflag(false)
            let data = localsearch.data
            let headData = data.headData
            let listData = data.list
            //判断显示哪个明细表格
            let  mode = parameter?parameter.calculationMethod:parameterData.calculationMethod;
            // console.log(parameter.calculationMethod)
            listData?listData.map((v,i)=>{
                v['id'] = i
            }):null
            if(mode=='CNT') {
                setTableDataDetail([...listData])
                setTableName([...columnsCNT])
                setCollectFlag(false)
            }else if(mode=='BL') {
                setTableDataDetail([...listData])
                setTableName([...columnsBL])
                setCollectFlag(false)
            }else {
                setTableDataDetail([...listData])
                setTableName([...columnsSVVD])
                setCollectFlag(true)
            }
            setTabTotalDetail(data.totalCount)
            console.log(pagination)
            if(pagination.pageSize!=pageDetail.pageSize){
                pagination.current=1
            }
            setPageDetail({...pagination})
            headData?queryForms.setFieldsValue({
                'svvdId':headData.svvdId,
                'portCode':headData.portCode,
                'tradeZoneCode':headData.tradeZoneCode,
                'tradeCode':headData.tradeCode,
                'tradeLaneCode':headData.tradeLaneCode,
            }):''
        }else{
            setSpinflag(false)
            Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
        }
    }

    console.log(pageDetail)
    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        // 业务时间/SVVD/港口至少输入一项
        if(!query.activeDate&&!query.svvdId&&!query.portCode){
            setBackFlag(false)
            Toast('',Intl.formatMessage({id:'lbl.afcm-0053'}) , 'alert-error', 5000, false)
        }else{
            setSpinflag(true)
            let tddata = {}
            columns.map((v, i) => {
                tddata[v.dataIndex] = Intl.formatMessage({id: v.title.props.id})
            })
            console.log(tddata)
            let downData = await request($apiUrl.AG_FEE_CALC_EXP_LIST,{
                method:"POST",
                data:{
                    "params":{
                        ...query,
                        Date:undefined,
                        'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                        'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                    },
                    'excelFileName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF.qy-cal'}),
                    sheetList: [{//sheetList列表
                        dataCol:tddata,
                        sumCol: {//汇总字段
                        },
                    'sheetName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF.qy-cal'}),
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
                    navigator.msSaveBlob(blob, Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF.qy-cal'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF.qy-cal'}) + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
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
            let downData = await request($apiUrl.AG_FEE_CALC_EXP_CN,{
                method:"POST",
                data:{
                    "params":{
                        ...query,
                        Date:undefined,
                        'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                        'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                    },
                    'excelFileName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF.qy-cal'}),
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
                    navigator.msSaveBlob(blob, Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF.qy-cal'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF.qy-cal'}) + '.xls'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
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
            tddata[v.dataIndex] = Intl.formatMessage({id: v.title.props.id})
        })
        console.log(tddata)
        let downData = await request($apiUrl.AG_FEE_CALC_EXP_DETAIL,{
            method:"POST",
            data:{
                'page':{
                    current: 0,
                    pageSize: 0
                },
                "params":{
                    ...parameterData
                },
                'excelFileName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF.qy-cal'}),
                sheetList: [
                    {//sheetList列表
                        dataCol:tddata,
                        sumCol: {//汇总字段
                        },
                        'sheetName':Intl.formatMessage({id:'menu.afcm.CalFeeQy.qy-AF.qy-cal'}),
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
            Toast('', Intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false)
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF.qy-cal'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = Intl.formatMessage({id: 'menu.afcm.CalFeeQy.qy-AF.qy-cal'}) + '.xls'; // 下载后文件名
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
        queryForms.resetFields()
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
        setChecked([])
        setTableData([])
        setTableDataDetail([])
        setTableName([])
        setBackFlag(true)
    }
    return (
        <div className='parent-box'>
            <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                {/* 查询列表 */}
                <TabPane tab={<FormattedMessage id='btn.search' />} key="1">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery} 
                        >
                            <Row>
                                {/* 船东 */}
                                <SelectVal name='soCompanyCode' disabled={company.companyType == 0 ? true : false} span={6} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                                {/* 代理编码 */}
                                {
                                    company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <SelectVal showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                                }
                                {/* 代理编码 */} 
                                {/* <SelectVal name='agencyCode' showSearch={true} flag={true} label={<FormattedMessage id='lbl.agency'/>} span={6} options={agencyCode} /> */}
                                {/* 业务日期 */}
                                <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}}  disabled={[false, false]} name='activeDate'  label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                                {/* 实际是否发生 */}
                                <SelectVal name='actualFlag' flag={true} label={<FormattedMessage id='lbl.WhetherItActuallyHappenedOrNot'/>} span={6} options={actualFlag.values}/>
                                {/* 费用大类 */}
                                <SelectVal name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={costKey} selectChange={selectChangeBtn }/>
                                {/* 费用小类 */}
                                <SelectVal name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={subclass}/>
                                {/* 船舶类型 */}
                                <SelectVal name='bargeType' flag={true} label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={shipTypes.values}/>
                                {/* 船舶属性 */}
                                <SelectVal name='vesselProperty' flag={true} label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselType.values}/>
                                {/* 贸易区 */}
                                <SelectVal name='tradeZoneCode' flag={true} label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6} options={trade.values} selectChange={companyIncident} />
                                {/* Trade */}
                                <SelectVal name='tradeCode' flag={true} label={<FormattedMessage id='lbl.Trader'/>} span={6} options={tradeCode} selectChange={trades} />
                                {/* 贸易线 */}
                                <SelectVal name='tradeLaneCode'  flag={true} label={<FormattedMessage id='lbl.Trade-line'/>} span={6} options={tradeLine}/>
                                {/* 航线 */}
                                <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>} span={6}/>
                                {/* 船舶代码 */}
                                <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code'/>} span={6}/>
                                {/* SVVD */}
                                <InputText name='svvdId' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>
                                {/* 港口 */}
                                <InputText name='portCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.port'/>} span={6}/>
                                {/* 邮件发送 */}
                                <SelectVal name='txtMail' flag={true} label={<FormattedMessage id='lbl.mailing'/>} span={6} options={mailingData.values}/>
                            </Row>
                        </Form> 
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/> </Button> </div>
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
                            <Button  onClick={reset} ><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                            {/* 查询按钮 */}
                            <Button onClick={()=>{pageChange(page,'','search')}} > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                        </div>
                    </div>
                    <div className='footer-table'>
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
                            rowSelection={{
                                selectedRowKeys: checked,
                                onChange:(key, row)=>{
                                    setChecked(key);
                                    setUuid(row);
                                }
                            }}
                            rowSelection={null}
                        />
                    </div>
                </TabPane>
                {/* 明细信息 */}
                <TabPane tab={<FormattedMessage id='lbl.details' />} key="2">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForms}
                            name='func'
                            onFinish={handleQuery} 
                        >
                            <Row>
                                {/* SVVD */}
                                <InputText name='svvdId' disabled label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>
                                {/* 港口 */}
                                <InputText name='portCode' disabled label={<FormattedMessage id='lbl.port'/>} span={6}/>
                                {/* 贸易区 */}
                                <InputText name='tradeZoneCode' disabled label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6}/>
                                {/* Trader */}
                                <InputText name='tradeCode' disabled label={<FormattedMessage id='lbl.Trader'/>} span={6}/>
                                {/* 贸易线 */}
                                <InputText name='tradeLaneCode' disabled label={<FormattedMessage id='lbl.Trade-line'/>} span={6}/>
                            </Row>
                        </Form> 
                        {/* 报账单头信息 */}
                        {/* <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/> </Button> </div> */}
                    
                    </div>
                    {tableName.length>0?<div className='main-button'>
                        <div className='button-left'>
                            {/* 下载箱子 */}
                            <Button onClick={downlodBox} ><CloudDownloadOutlined /><FormattedMessage id='lbl.Download-box'/></Button>
                        </div>
                        <div className='button-right'>
                          
                        </div>
                    </div>:null}
                    {tableName.length>0?<div className='footer-table'>
                        <PaginationTable
                            dataSource={tableDataDetail}
                            columns={tableName}
                            rowKey='id'
                            pageChange={detail}
                            pageSize={pageDetail.pageSize}
                            current={pageDetail.current}
                            scrollHeightMinus={200}
                            total={tabTotalDetail}
                            rowSelection={null}
                        />
                    </div>:null}
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;