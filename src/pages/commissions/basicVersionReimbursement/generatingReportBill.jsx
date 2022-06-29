import React, { useState,useEffect, $apiUrl,createContext ,useContext } from 'react'
import {FormattedMessage, formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import SelectVal from '@/components/Common/Select';
import { acquireSelectData, momentFormat, TradeData, agencyCodeData, acquireSelectDataExtend, formatCurrencyNew} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal,Tabs} from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import { createFromIconfontCN } from '@ant-design/icons';
import CosModal from '@/components/Common/CosModal'
import CosToast from '@/components/Common/CosToast'
import {
    SearchOutlined,//日志
    SelectOutlined,//新增
    CopyOutlined,//复制
    FileDoneOutlined,//查看详情
    CloudDownloadOutlined,//日志
    ReloadOutlined,
    UnorderedListOutlined,
    CloseOutlined,
    PrinterOutlined
} from '@ant-design/icons'
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_dkztm8notr4.js', // 在 iconfont.cn 上生成
  });
// ----------------------------------------------生成报账单页面-----------------------------------------

const confirm = Modal.confirm
const { TabPane } = Tabs;

const searchPreAgreementMailFeeAgmtList =()=> {
    const [agencyCode, setAgencyCode] = useState([]);   // 代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [trade, setTrade] = useState({}); // 贸易区
    const [tradeCode,setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [checkStatus,setCheckStatus] = useState({});//审核状态
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [commissionTypes, setCommissionTypes] = useState([]);    // 全部佣金类型
    const [commissionMode, setCommissionMode] = useState({});    // 佣金模式
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [selectUuid, setSelectUuid] = useState([]);    // 多选的uuid
    const [boundaries,setBoundaries] = useState({});//是否边界内
    const [currentStatus,setCurrentStatus] = useState({});//当前状态
    const [tableDataCross,setTableDataCross] = useState([])//cross
    const [defaultKey, setDefaultKey] = useState('1');
    const [tableDataCollect,setTableDataCollect] = useState([])//cross汇总
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "commisionClass": null,
        "commissionType": null,
        "commissionMode;": null,
        "tradeZoneCode": null,
        "tradeCode": null,
        "tradeLaneCode": null,
        "officeCode": null,
        "baseSvvd": null,
        "basePortCode": null,
        "Svvd": null,
        "PortCode": null,
        "billReferenceCode": null,
    });
   
    const [tableData,setTableData] = useState([])//表格数据
    const [tableDatas,setTableDatas] = useState([])//汇总数据
    const [tabTotal,setTabTotal ] = useState([])//
    const [sfPkgProcessId,setSfPkgProcessId ] = useState({})//是否删除提单
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [billUuid,setBillUuid] = useState([])//id
    const [checkedRow, setCheckedRow] = useState([]); //选择行
	const [messageData, setMessageData] = useState({});
    
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    
    const [spinflag,setSpinflag] = useState(false)
    const [detailDate,setDetailDate] = useState([])
    const [flag,setFlag] = useState(false)
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
   
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    useEffect(() => {
        acquireSelectData('CC0013',setCommissionMode, $apiUrl);// 佣金模式
        acquireSelectData('AFCM.TRADE.ZONE',setTrade,$apiUrl);//贸易区
        acquireSelectData('AFCM.BOUNDARY.FLAG',setBoundaries,$apiUrl);//是否边界内
        acquireSelectData('CURRENT.STATUS',setCurrentStatus,$apiUrl);//当前状态
        acquireSelectData('DEL.BL.FLAG',setSfPkgProcessId,$apiUrl);//是否删除提单
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl); // 佣金大类 and 佣金小类
        agencyCodeData($apiUrl,setAgencyCode, setCompany)//代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        allCommissionTypes()
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
        console.log(tradeCode)
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
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
    }
    // 佣金大类与佣金小类联动
    const selectChangeBtn = (value, all) => {
        queryForm.setFieldsValue({
            'commissionType':''
        })
        setCommissionType({})
        let data = all.linkage ? all.linkage.value : null;
        data ? acquireSelectData('COMMISSION.CLASS.' + data, setCommissionType, $apiUrl) : null    // 佣金大类 and 佣金小类
    }
    // 全部佣金小类(佣金类型)
    const allCommissionTypes = async() =>{
        await request.post($apiUrl.COMMON_SEARCH_COMM_TYPE)
        .then((resul) => {
            if(!resul.data)return
            let data=resul.data
            data.map((v,i)=>{
               let labels = v.label
               let values = v.value
               v.label = labels + '('+ values +')'
            //    v.value = labels
            })
            setCommissionTypes(resul.data)
        })
    }

    //生成报账单表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100
        },
        {
            title:<FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'billReferenceCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.The-Commission" />,//佣金模式
            dataType: commissionMode.values,
            dataIndex: 'commissionMode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataType: commissionTypes,
            dataIndex: 'commissionType',
            sorter: false,
            key:'AGMT_STATUS',
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.pdr-fnd" />,//POR/FND
            dataIndex: 'porFndQskey',
            sorter: false,
            key:'FM_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.voyage-number-comm" /> ,//航次
            dataIndex: 'svvdId',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.ht.statement.upload-voyage-number-Base" /> ,//航次（Base）
            dataIndex: 'baseSvvdId',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.port" /> ,//港口
            dataIndex: 'portCode',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.port-base" /> ,//港口（Base）
            dataIndex: 'basePortCode',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.office" />,//Office  
            dataIndex: 'officeCode',
            sorter: false,
            key:'CHECK_FAD_STATUS',
            width: 80,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.current-state" />,//当前状态
            dataType:currentStatus.values,
            dataIndex: 'currentStatus',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'totalAmount',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text) ; 
            }
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            dataIndex: 'reviseAmount',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text) ; 
            }
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'totalAmountInClearing',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text) ; 
            }
            
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text) ; 
            }
            
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount-usd" />,//协议币调整金额（USD）
            dataIndex: 'totalAmountInUsd',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text) ; 
            }
        },
        {
            title: <FormattedMessage id="lbl.USD-currency" />,//USD汇率
            dataIndex: 'usdExchangeRate',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Exchange-Rate-of-Settlement-Currency" />,//结算币汇率
            dataIndex: 'cnyExchangeRate',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.within-boundary" />,//是否边界内
            dataType:boundaries.values,
            dataIndex: 'excludeFlag',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.Whether-to-delete-the-bill-of-lading" />,//是否删除提单
            dataType:sfPkgProcessId.values,
            dataIndex: 'sfPkgProcessId',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        }

    ]

    const columnss=[
        {
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataType:commissionTypes.values,
            dataIndex: 'commissionType',
            sorter: false,
            key:'AGMT_STATUS',
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.The-Commission" />,//佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'totalAmount',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text) ; 
            }
            
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            dataIndex: 'reviseAmount',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount-usd" />,//协议币调整金额（USD）
            dataIndex: 'vatReviseAmtSum',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'totalAmountInClearingSum',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'reviseAmountInClearingSum',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        }
    ]

     //Cross表格
     const columnCross=[
        {
            title: <FormattedMessage id="lbl.Agent-number" />,//代理编号
            dataIndex: 'agencyCode',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Contract-No" />,//合约号
            dataIndex: 'agreementId',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Commission-agreement" />,//佣金协议
            dataIndex: 'commissionAgreementCode',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.ac.cntr-num" />,//箱号
            dataIndex: 'containerNumber',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Box-size" />,//箱型尺寸
            dataIndex: 'containerSizeType',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.The-Commission" />,//佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataIndex: 'commissionType',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.office" />,//office
            dataIndex: 'officeCode',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,//实际是否发生
            dataIndex: 'actualFlag',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.amount" />,//金额
            dataIndex: 'commissionAmount',
            sorter: false,
            // sortDirections:[store],
            align:'right',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'commissionCurrencyCode',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.afcm-0050" />,//计佣费用
            dataIndex: 'commissionBase',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Percentage-rate" />,//百分比/费率
            dataIndex: 'commissionRate',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataIndex: 'activityDate',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.empty-box" />,//SOC空箱
            dataIndex: 'socEmptyInd',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        }
    ]
    //Cross表格汇总
    const columnCrossDetail=[
        {
            title: <FormattedMessage id="lbl.Agent-number" />,//代理编号
            dataIndex: 'agencyCode',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Box-size" />,//箱型尺寸
            dataIndex: 'cntrSizeType',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataIndex: 'commissionType',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Container-capacity" />,//箱量
            dataIndex: 'countCntr',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Currency-of-commission-agreement" />,//佣金协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,   
        },{
            title: <FormattedMessage id="lbl.Commission-agreement-amount" />,//佣金协议金额
            dataIndex: 'totalAmount',
            sorter: false,
            // sortDirections:[store],
            align:'right',
            width: 120,   
        }
    ]

    //初始化下拉框数据
    useEffect(()=>{
        queryForm.setFieldsValue({
            ...lastCondition,
        });
        
    },[])
    // const dear = (datas)=>{
    //     datas.map((v, i) => {
    //         commissionModes.map((val, idx) => {
    //             v.commissionType == val.value ? v.commissionType = val.label : '!Error';
    //         })
    //         console.log(v.commissionType)
    //     })
    // }
    
    
    //表格数据
    const pageChange= async(pagination,options,search) =>{
        Toast('','', '', 5000, false)
        console.log(currentStatus)
        console.log(sfPkgProcessId)
        setTableData([])
        setTableDatas([])
        setChecked([])
        let sorter
        let query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        if(!query.agencyCode){
            setAgencyFlag(false)
            //代理编码必须输入
            Toast('', formatMessage({id: 'lbl.The-proxy-code-must-be-entered'}), 'alert-error', 5000, false)
        }else{
            setAgencyFlag(true)
            if(!query.activeDate&&!query.generateDate&&!query.baseSvvd&&!query.svvd&&!query.billReferenceCode){
                setBackFlag(false)
                //'业务日期/提单号 /生成日期/Svvd(Base)/Svvd 必须输入一项!!!'
                Toast('',formatMessage({id: 'lbl.Date-Reference-svvd-must-enter'}), 'alert-error', 5000, false)
            }else{
                setSpinflag(true)
                setBackFlag(true)
                let localsearch= await request($apiUrl.COMM_CROSSBOOKING_QUERY_COMM_OFFLINE_CR_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            'shipownerCompanyCode': query.shipownerCompanyCode,
                            'agencyCode':query.agencyCode,
                            'commisionClass':query.commisionClass,
                            'commissionType':query.commissionType,
                            'commissionMode':query.commissionMode,
                            'tradeZoneCode':query.tradeZoneCode,
                            'tradeCode':query.tradeCode,
                            'tradeLaneCode':query.tradeLaneCode,
                            'officeCode':query.officeCode,
                            'baseSvvd':query.baseSvvd,
                            'basePortCode':query.basePortCode,
                            'svvd':query.svvd,
                            'portCode':query.portCode,
                            'billReferenceCode':query.billReferenceCode,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                            'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                            'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                        },
                        'sorter':sorter
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    setSpinflag(false)
                    let data=localsearch.data?localsearch.data.totalCount:''
                    let datas=localsearch.data?localsearch.data.commissionOfflineHistories:''
                    let datass = localsearch.data?localsearch.data.commissionStatistics:''
                    datas?datas.map((v,i)=>{
                        v['id']=i
                    }):null
                    datass?datass.map((v,i)=>{
                        v['id']=i
                    }):null
                    setTabTotal(data)
                    // setTabTabTotal(dataTab)
                    datas?setTableData([...datas]):null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    datass?setTableDatas([...datass]):null
                    setFlag(true)
                }else{
                    setSpinflag(false)
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
            }
            }
        }
    }

    const mailing = () =>{
        setIsModalVisible(true)
    }
    const handleCancel = () =>{
        setIsModalVisible(false)

    }

    //重置
    const reset = () =>{
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company, acquireData])
        setTableData([])
        setTableDatas([])
        setBackFlag(true)
        setAgencyFlag(true)
        setFlag(false)
    }
    // 多选
    const setSelectedRows = (val) => {
        console.log(val)
        // let data = val.map((v, i) => {
        //     return v.billBasicUuid;
        // });
        // setSelectUuid(data);
        setSelectUuid([...val])

    }


    //全部生成账单
    const AllGenerateBills = () =>{
        Toast('', '', '', 5000, false);
        let query = queryForm.getFieldsValue()
        console.log(query)
        const confirmModal = confirm({
            title: formatMessage({id:'lbl.Generate-all-reported-bills'}),
            content: formatMessage({id: 'lbl.ag-fee-all-buildList'}),
            okText: formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                setSpinflag(true)
                confirmModal.destroy()
                let GenerateBills= await request($apiUrl.COMM_CROSSBOOKING_BUID_CR_OFFLINE_BY_CONDITION,{
                    method:"POST",
                    data:{
                        "params":{
                            'shipownerCompanyCode': query.shipownerCompanyCode,
                            'agencyCode':query.agencyCode,
                            'commisionClass':query.commisionClass,
                            'commissionType':query.commissionType,
                            'commissionMode':query.commissionMode,
                            'tradeZoneCode':query.tradeZoneCode,
                            'tradeCode':query.tradeCode,
                            'tradeLaneCode':query.tradeLaneCode,
                            'officeCode':query.officeCode,
                            'baseSvvd':query.baseSvvd,
                            'basePortCode':query.basePortCode,
                            'Svvd':query.Svvd,
                            'PortCode':query.PortCode,
                            'billReferenceCode':query.billReferenceCode,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                            'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                            'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                        },
                    }
                })
                console.log(GenerateBills)
                if(GenerateBills.success){
                    setSpinflag(false)
                    pageChange(page)
                    setTimeout(()=>{
                        Toast('', '', '', 5000, false);
                        Toast('',GenerateBills.message, '', 5000, false)
                    } ,1000);
                }else{
                    setSpinflag(false)
                    Toast('',GenerateBills.errorMessage, '', 5000, false)
                }
                
            }
        })
        
    }

    //选择生成账单
    const SelectGenerateBills = async() =>{
        Toast('', '', '', 5000, false);
        if(selectUuid.length>0){
            selectUuid.map((v,i)=>{
                v['shipownerCompanyCode'] = queryForm.getFieldValue().shipownerCompanyCode
            })
            console.log(selectUuid)
            const confirmModal = confirm({
                title: formatMessage({id:'lbl.Select-Generate-Report-Billing'}),
                content: formatMessage({id: 'lbl.ag-fee-select-buildList'}),
                okText: formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true)
                    let GenerateBills= await request($apiUrl.COMM_CROSSBOOKING_BUID_CR_OFFLINE_BY_SELECTION,{
                        method:"POST",
                        data:{
                            'paramsList': [...selectUuid]
                        }
                    })
                    console.log(GenerateBills)
                    if(GenerateBills.success){
                        setSpinflag(false)
                        setSelectUuid([])
                        setChecked([])
                        setCheckedRow([])
                        pageChange(page)
                        setTimeout(()=>{
                            Toast('', '', '', 5000, false);
                            Toast('',GenerateBills.message, '', 5000, false)
                        } ,1000);
                    }else{
                        setSpinflag(false)
                        Toast('',GenerateBills.errorMessage, '', 5000, false)
                    }
                }
            })
        }else{
            Toast('', formatMessage({id: 'lbl.Select-data'}), 'alert-error', 5000, false);
        }
    }

    //双击
    const doubleClickRow = async(parameter) => {
        setIsModalVisible(true)
        setMessageData({})
        setDetailDate(parameter)
        detail(pageDetail,parameter)
        
    }
    //双击明细数据
    const detail = async(pagination,parameter)=>{
        let localsearch = await request($apiUrl.QUERY_LOC_COMM_OFFLINE_CR_DETAIL,{
            method:'POST',
            data:{
                page:pagination,
                'params':parameter?{...parameter}:{...detailDate}
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            let data = localsearch.data
            let commissionStatistics = data.commissionStatistics//汇总
            let commLcrListDetail = data.commLcrListDetail//明细
            let commLcrList	= data.commLcrList//头
            setTableDataCross([...commLcrListDetail])
            setTableDataCollect([...commissionStatistics])
            setPageDetail({...pagination})
            setBillUuid(commLcrList[0].keyBillBasicUuid)
            queryForms.setFieldsValue({
                ...commLcrList[0]
            })
            setMessageData({alertStatus:'alert-success',message:localsearch.message })
        }else{
            setMessageData({alertStatus:'alert-error',message:localsearch.errorMessage })
        }
    }
    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        let query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.COMM_CROSSBOOKING_EXP_COMM_OFFLINE_CR_LIST,{
            method:"POST",
            data:{
                "params":{
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'commisionClass':query.commisionClass,
                    'commissionType':query.commissionType,
                    'commissionMode':query.commissionMode,
                    'tradeZoneCode':query.tradeZoneCode,
                    'tradeCode':query.tradeCode,
                    'tradeLaneCode':query.tradeLaneCode,
                    'officeCode':query.officeCode,
                    'baseSvvd':query.baseSvvd,
                    'basePortCode':query.basePortCode,
                    'svvd':query.svvd,
                    'portCode':query.portCode,
                    'billReferenceCode':query.billReferenceCode,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            activityDate: formatMessage({id:"lbl.argue.bizDate" }),
                            billReferenceCode: formatMessage({id:"lbl.bill-of-lading-numbe" }),
                            commissionMode: formatMessage({id:"lbl.The-Commission" }),
                            commissionType: formatMessage({id:"lbl.Commission-type" }),
                            porFndQskey: formatMessage({id:"lbl.pdr-fnd" }),
                            svvdId: formatMessage({id:"lbl.voyage-number" }),
                            baseSvvdId: formatMessage({id:"lbl.ht.statement.upload-voyage-number-Base" }),
                            portCode: formatMessage({id:"lbl.port" }),
                            basePortCode: formatMessage({id:"lbl.port-base" }),
                            officeCode: formatMessage({id:"lbl.office" }),
                            currentStatus: formatMessage({id:"lbl.current-state" }),
                            rateCurrencyCode: formatMessage({id:"lbl.Agreement-currency" }),
                            totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                            reviseAmount: formatMessage({id:"lbl.Agreement-currency-adjustment-amount" }),
                            clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                            totalAmountInClearing: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                            reviseAmountInClearing: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                            totalAmountInUsd: formatMessage({id:"lbl.Agreement-currency-adjustment-amount-usd" }),
                            usdExchangeRate: formatMessage({id:"lbl.USD-currency" }),
                            cnyExchangeRate: formatMessage({id:"lbl.Exchange-Rate-of-Settlement-Currency" }),
                            excludeFlag: formatMessage({id:"lbl.within-boundary" }),
                            recordUpdateDatetime: formatMessage({id:"lbl.generation-date" }),
                            sfPkgProcessId: formatMessage({id:"lbl.Whether-to-delete-the-bill-of-lading" }),
                            
                        },
                        sumCol: {//汇总字段
                            commissionType: formatMessage({id:"lbl.Commission-type" }),
                            commissionMode: formatMessage({id:"lbl.The-Commission" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                            reviseAmount: formatMessage({id:"lbl.Agreement-currency-adjustment-amount" }),
                            vatReviseAmtSum: formatMessage({id:"lbl.Agreement-currency-adjustment-amount-usd" }),
                            clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                            totalAmountInClearingSum: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                            reviseAmountInClearingSum: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                           
                        },
                    'sheetName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}),
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
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'})+'.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                console.log(downloadElement)
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    //明细下载
    const downlodDetail = async()=>{
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        let tddata = {}
        columnCross.map((v, i) => {
            tddata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        let crdata = {}
        columnCrossDetail.map((v, i) => {
            crdata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        setSpinflag(true)
        let downData = await request($apiUrl.COMM_CROSSBOOKING_EXP_LOC_VOMM_OFFLINE_CR_DTL,{
            method:"POST",
            data:{
                "params":{...detailDate},
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}),
                sheetList: [
                    {//sheetList列表
                        dataHead:{
                            'keyBillReferenceCode':formatMessage({id:'lbl.bill-of-lading-number'}),
                            'carrier':formatMessage({id:'lbl.company-code'}),
                            'cargoTradeLaneCode':formatMessage({id:'lbl.cargo-trade'}),
                            'por':formatMessage({id:'lbl.POR'}),
                            'outBoundDoorCyIndicator':formatMessage({id:'lbl.Export-agreement'}),
                            'inboundDoorCyIndicator':formatMessage({id:'lbl.Import-agreement'}),
                            'fnd':formatMessage({id:'lbl.FND'}),
                            'firstLoadingSvvdId':formatMessage({id:'lbl.first-svvd'}),
                            'firstPolCode':formatMessage({id:'lbl.first-pol'}),
                            'firstBaseLoadingSvvdId':formatMessage({id:'lbl.first-base-svvd'}),
                            'firstBasePolCode':formatMessage({id:'lbl.first-base-pol'}),
                            'lastBaseDischargeSvvdId':formatMessage({id:'lbl.last-base-svvd'}),
                            'lastBasePodCode':formatMessage({id:'lbl.last-base-pod'}),
                            'lastDischargeSvvdId':formatMessage({id:'lbl.last-svvd'}),
                            'lastPodCode':formatMessage({id:'lbl.last-pod'}),
                        },
                        dataCol:tddata ,
                        sumCol:crdata ,
                        'sheetName':formatMessage({id:'menu.afcm.comm.bas-ver.lal-chrge-gen-bl'}),
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
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                setSpinflag(false)
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false)
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.gen-rep-bl'}) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                console.log(downloadElement)
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
                        <SelectVal disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode'  label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={agencyFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <SelectVal showSearch={true} style={{background: agencyFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 佣金大类 */}
                        <SelectVal name='commisionClass' flag={true} label={<FormattedMessage id='lbl.commission-big-type'/>} span={6} options={commissionCategories.values} selectChange={selectChangeBtn }/>
                        {/* 佣金小类 */}
                        <SelectVal name='commissionType' flag={true} label={<FormattedMessage id='lbl.Commission-type'/>} span={6} options={commissionType.values}  />
                        {/* 佣金模式 */}
                        <SelectVal name='commissionMode' flag={true}  label={<FormattedMessage id='lbl.The-Commission'/>} span={6} options={commissionMode.values} />
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='generateDate' label={<FormattedMessage id='lbl.generation-date'/>}  />
                        {/* 贸易区 */}
                        <SelectVal name='tradeZoneCode' flag={true} label={<FormattedMessage id='lbl.argue.trade-code-comm'/>} span={6} options={trade.values} selectChange={companyIncident} />
                        {/* Trade */}
                        <SelectVal name='tradeCode' flag={true} label={<FormattedMessage id='lbl.Trade'/>} span={6} options={tradeCode} selectChange={trades} />
                        {/* 贸易线 */}
                        <SelectVal name='tradeLaneCode' flag={true} label={<FormattedMessage id='lbl.Trade-line-comm-get'/>} span={6} options={tradeLine} />
                        {/* Office */}
                        <InputText name='officeCode'  label={<FormattedMessage id='lbl.office'/>} span={6}/>
                        {/* SVVD（Base）*/}
                        <InputText name='baseSvvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.ac.fee.svvd.base'/>} span={6}/>
                        {/* 港口（Base）*/}
                        <InputText name='basePortCode' label={<FormattedMessage id='lbl.port-base'/>} span={6}/>
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6}/>
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number'/>} span={6}/>
                    </Row>
                </Form> 
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/> </Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left' style={{width:'85%'}}>
                    {/* 下载 */}
                    <Button  disabled={flag?false:true} onClick={downlod}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                    {/* 邮件发送 onClick={mailing} */}
                    <Button   disabled={flag?false:true}><MyIcon type="icon-email-success"  /><FormattedMessage id='lbl.mailing'/></Button>
                    {/* 选择生成报账单 */}
                    <CosButton onClick={()=> SelectGenerateBills()} disabled={flag?false:true} auth='AFCM_CMS_CBK_001_B01' ><SelectOutlined /> <FormattedMessage id='lbl.Select-Generate-Report-Billing'/></CosButton>
                    {/* 全部生成报账单 */}
                    <CosButton onClick={()=> AllGenerateBills()} disabled={flag?false:true} auth='AFCM_CMS_CBK_001_B02' ><UnorderedListOutlined /><FormattedMessage id='lbl.Generate-all-reported-bills'/></CosButton>
                    <span style={{color:'red'}}><FormattedMessage id='lbl.afcm-0031' /></span>
                </div>
                
                <div className='button-right' style={{width:'15%'}}>
                    {/* 重置 */}
                    <Button onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=>{pageChange(page,'','search')} }> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
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
                    // selectionType='radio'
                    selectedRowKeys={selectedRowKeys}
                    handleDoubleClickRow={doubleClickRow}
                    selectWithClickRow={true}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setCheckedRow(row);
                            setSelectedRows(row);
                        }
                    }}
                />
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableDatas}
                    columns={columnss}
                    rowKey='id'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
					rowSelection={null}
                    pagination={false}
                />
            </div>
            <CosModal cbsTitle={billUuid + formatMessage({id:'lbl.afcm-0061'})} cbsVisible={isModalVisible} cbsFun={handleCancel} cbsWidth='90%'>
                <CosToast toast={messageData}/>
                <div className='header-from'>
                    <Form  
                        form={queryForms}
                        name='func'
                        onFinish={handleQuery} 
                    >
                        <Row>
                            {/* 提单号码 */}
                            <InputText span={8} name='keyBillReferenceCode' disabled label={<FormattedMessage id='lbl.bill-of-lading-number'/>}  />
                            {/* 公司代码 */}
                            <InputText  name='carrier' disabled label={<FormattedMessage id='lbl.company-code'/>} span={8} />
                            {/* Cargo Trade Lane */}
                            <InputText name='cargoTradeLaneCode' flag={true} disabled label={<FormattedMessage id='lbl.cargo-trade'/>} span={8} />
                            {/* POR */}
                            <InputText name='por' flag={true} disabled label={<FormattedMessage id='lbl.POR'/>} span={8} />
                            {/* 出口协议 */}
                            <InputText name='outBoundDoorCyIndicator' flag={true} disabled label={<FormattedMessage id='lbl.Export-agreement'/>} span={8}/>
                            {/* 进口协议 */}
                            <InputText span={8} name='inboundDoorCyIndicator' disabled label={<FormattedMessage id='lbl.Import-agreement'/>}   />
                            {/* FND */}
                            <InputText span={8} name='fnd' disabled label={<FormattedMessage id='lbl.FND'/>}  />
                            {/* First SVVD */}
                            <InputText name='firstLoadingSvvdId' flag={true} disabled label={<FormattedMessage id='lbl.first-svvd'/>} span={8}  />
                            {/* First POL */}
                            <InputText name='firstPolCode' flag={true} disabled label={<FormattedMessage id='lbl.first-pol'/>} span={8}/>
                            {/* First Base SVVD */}
                            <InputText name='firstBaseLoadingSvvdId' flag={true} disabled label={<FormattedMessage id='lbl.first-base-svvd'/>} span={8} />
                            {/* First Base POL */}
                            <InputText name='firstBasePolCode' flag={true} disabled label={<FormattedMessage id='lbl.first-base-pol'/>} span={8} />
                            {/* Last Base SVVD */}
                            <InputText name='lastBaseDischargeSvvdId' flag={true} disabled label={<FormattedMessage id='lbl.last-base-svvd'/>} span={8} />
                            {/* Last Base POD */}
                            <InputText name='lastBasePodCode' disabled label={<FormattedMessage id='lbl.last-base-pod'/>} span={8}/>
                            {/* Last SVVD*/}
                            <InputText name='lastDischargeSvvdId'  disabled label={<FormattedMessage id='lbl.last-svvd'/>} span={8}/>
                            {/* Last POD*/}
                            <InputText name='lastPodCode' disabled label={<FormattedMessage id='lbl.last-pod'/>} span={8}/>
                        </Row>
                    </Form> 
                </div>
                
                <Tabs onChange={callback} type="card" activeKey={defaultKey} style={{marginTop:'20px'}}>
                    {/* Cross明细 */}
                    <TabPane tab={<FormattedMessage id='lbl.afcm-0048' />} key="1">
                        <div className='footer-table' >
                            {/* 表格 */}
                            <PaginationTable
                                dataSource={tableDataCross}
                                columns={columnCross}
                                rowKey='uuid'
                                pageChange={pageChange}
                                scrollHeightMinus={200}
                                pageSize={pageDetail.pageSize}
                                current={pageDetail.current}
                                rowSelection={null}
                                pagination={false}
                            />
                        </div>
                        <div className='footer-table' >
                            {/* 表格 */}
                            <PaginationTable
                                dataSource={tableDataCollect}
                                columns={columnCrossDetail}
                                rowKey='uuid'
                                pageChange={pageChange}
                                scrollHeightMinus={200}
                                rowSelection={null}
                                pagination={false}
                            />
                        </div>
                    </TabPane>
                </Tabs>
                <div className='main-button'>
                <div className='button-left'>
                </div>
                <div className='button-right'>
                    {/* 关闭按钮 */}
                    <Button onClick={handleCancel}><CloseOutlined/> <FormattedMessage id='lbl.close'/></Button>
                    {/* 下载按钮 */}
                    <Button onClick={downlodDetail}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                    {/* 打印按钮 */}
                    <Button ><PrinterOutlined/> <FormattedMessage id='lbl.Printing'/></Button>
                </div>
            </div>
            </CosModal>
            <CosModal cbsTitle="mailbox" cbsVisible={false} onFun={handleCancel} cbsWidth='30%'>
                <div style={{minWidth:'300px'}}>
                    <Form 
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery}  
                >
                    <Row>
                        {/* 邮箱 */}
                        <InputText name='agencyName' span={24}/>
                    </Row>
                </Form> 
                </div>
                <div className="copy-from-btn" style={{minWidth:'300px'}}>
                    {/* 按钮 */}
                    <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-ok" /> </Button>
                    <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-cancel" /></Button>
                </div>
            </CosModal>
            <Loading spinning={spinflag}/>  
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;