{/* 生成费用预估单 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData,  costCategories, momentFormat, agencyCodeData, TradeData, acquireSelectDataExtend, } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal} from 'antd'
import {Toast} from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading';
import CosButton from '@/components/Common/CosButton'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SelectOutlined , //选择
    UnorderedListOutlined, //生成预估单
} from '@ant-design/icons'

const confirm = Modal.confirm //弹窗
let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const generateCostEstimate =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData,setTableData] = useState([]) // table数据
    const [tabTabTotal,setTabTotal ] = useState([]) // table条数
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用小类
    const [feeCategory,setFeeCategory] = useState ([])
    const [vesselProperty,setVesselProperty] = useState ({}) //船舶属性
    const [tradeZoneCode,setTradeZoneCodeData] = useState ({}) //贸易区
    const [tradeCode,setTradeCode] = useState ([]) //Trade
    const [tradeLine,setTradeLine] = useState ([]) //Trade Lane
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [shipType, setShipType] = useState({});   // 船舶类型
    const [eovStatus, setEovData] = useState({}); // EOV
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [backFlags,setBackFlags] = useState(true);//背景颜色
    const [agFlag,setAgFlag] = useState(true);//背景颜色
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [searchFlag, setSearchFlag] = useState(false); //是否查询标记
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [searchData, setSearchData] = useState([]); 
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            exFlag: withinBoundary.defaultValue,
        })
    }, [company,acquireData])

    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.TRADE.ZONE',setTradeZoneCodeData, $apiUrl);// 贸易区
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AFCM.BARGE.TYPE',setShipType, $apiUrl);// 船舶类型
        acquireSelectData('AFCM.EOV.STATUS', setEovData, $apiUrl);// EOV
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大小类联动
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        acquireSelectData('VESSELTYPE',setVesselProperty,$apiUrl);//船舶属性
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
                        v['label']=v.feeCode+'(' + v.feeName +')';
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
                v['label']=v.feeCode+'(' + v.feeName +')';
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

    {/* from 数据 */}
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    {/*  列表 */}
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.generation-date'/>,// 生成日期
            dataIndex: 'generateDate',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            align:'left',
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            align:'left',
            width: 40
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Small-class-fee' />,//费用小类
            dataIndex: 'feeType',
            dataType: feeCategory,
            align:'left', 
            width: 80,
        },
        {
            title: <FormattedMessage id="lbl.EOV" />,// EOV
            dataIndex: 'eovStatus',
            align:'left',
            width: 40
        },
        {
            title: <FormattedMessage id="lbl.ht.statement.upload-vessel-name" />,// 船名
            dataIndex: 'vslName',
            align:'left',
            width: 40
        },
        {
            title: <FormattedMessage id="lbl.voyage-number" />,// 航次
            dataIndex: 'voyageNumber',
            align:'left',
            width: 40
        },
        {
            title: <FormattedMessage id="lbl.Ship-code" />,// 船舶代码
            dataIndex: 'vesselCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Ship-property' />,// 船舶属性
            dataIndex: 'vesselProperty',
            dataType: vesselProperty.values,
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.argue.trade-code' />,// 贸易区
            dataIndex: 'tradeZoneCode',
            dataType: tradeZoneCode.values,
            align:'left',
            width: 60
        },
        {
            title: <FormattedMessage id='lbl.Trade' />,// Trade
            dataIndex: 'tradeCode',
            align:'left',
            width: 40
        },
        {
            title: <FormattedMessage id='lbl.trade-channel' />,// Trade Lane
            dataIndex: 'tradeLaneCode',
            align:'left',
            width: 70
        },
        {
            title: <FormattedMessage id='lbl.profit-center'/>,// 利润中心
            dataIndex: 'profitCenterCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Foot-empty-box-12-20' />,// 12/20尺 空箱
            dataIndex: 'cntr20E',
            align:'right',
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.Foot-empty-box-40-45' />,// 40/45尺 空箱
            dataIndex: 'cntr40E',
            align:'right',
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.Foot-weight-box-12-20'/>,// 12/20尺 重箱
            dataIndex: 'cntr20F',
            align:'right',
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.Foot-weight-box-40-45'/>,// 40/45尺 重箱
            dataIndex: 'cntr40F',
            align:'right',
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.office' />,// Office
            dataIndex: 'officeCode',
            align:'left',
            width: 70
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency' />,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount' />,// 协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            align:'right',
            width: 90
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount' />,// 协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Whether-the-price-includes-tax' />,// 是否含税价
            dataIndex: 'vatFlag',
            dataType: priceIncludingTax.values,
            align:'left',
            width: 90
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference' />,// 协议币税金(参考)
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference'/>,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets'/>,// 应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'paymentAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.AP-outlets'/>,// 应付网点
            dataIndex: 'customerSAPId',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Agency-net-income'/>,// 代理净收入
            dataType: 'dataAmount',
            dataIndex: 'recAmount',
            align:'right',
            width: 90
        },
        {
            title: <FormattedMessage id= 'lbl.estimate'/>,// 向谁预估
            dataIndex: 'ygSide',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id= 'lbl.Standard-currency'/>,// 本位币种
            dataIndex: 'agencyCurrency',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id= 'lbl.Amount-in-base-currency'/>,// 本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyAmount',
            align:'right',
            width: 90
        },
        {
            title: <FormattedMessage id= 'lbl.Adjustment-amount-in-base-currency'/>,// 本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyReviseAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id= 'lbl.Tax-in-local-currency'/>,// 本位币税金(参考)
            dataIndex: 'vatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id= 'lbl.Tax-adjustment-in-base-currency'/>,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id=  'lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'cleaningCurrencyCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id=  'lbl.amount-of-settlement-currency'/>,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'cleaningAmount',
            align:'right',
            width: 90
        },
        {
            title: <FormattedMessage id= 'lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseCleaningAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id= 'lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id= 'lbl.tax-adjustment-in-settlement-currency'/>,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.Tax-amount'/>,// 税额
            dataType: 'dataAmount',
            dataIndex: 'agencyTaxAmount',
            align:'right',
            width: 40
        },
        {
            title: <FormattedMessage id='lbl.within-boundary'/>,// 是否边界内
            dataIndex: 'exFlag',
            dataType: withinBoundary.values,
            align:'left',
            sorter: false,
            width: 90,
        },
    ]

    {/* 全部生成预估单 */}
    const EstimateSheetAllBtn = async() =>{
        Toast('', '', '', 5000, false);
        if(searchFlag==false){
            Toast('', intl.formatMessage({id: 'lbl.Generate-info'}), 'alert-error', 5000, false);
            return;
        } else{
            let queryData = queryForm.getFieldValue();
            const confirmModal = confirm({
                title: intl.formatMessage({id: 'lbl.Info-tips'}),
                content: intl.formatMessage({id: 'lbl.ag-fee-all-build'}),
                okText: intl.formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    let result= await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_BUILD_BILL_ALL,{
                        method:"POST",
                        data:{
                            "params":{
                                soCompanyCode: queryData.soCompanyCode,
                                agencyCode: queryData.agencyCode,
                                feeClass: queryData.feeClass,
                                feeType: queryData.feeType,
                                vesselProperty: queryData.vesselProperty,
                                tradeZoneCode: queryData.tradeZoneCode,
                                tradeCode: queryData.tradeCode,
                                tradeLaneCode: queryData.tradeLaneCode,
                                exFlag: queryData.exFlag,
                                serviceLoopCode: queryData.serviceLoopCode,
                                vesselCode: queryData.vesselCode,
                                voyageNumber: queryData.voyageNumber,
                                bargeType: queryData.bargeType,
                                svvd: queryData.svvd,
                                portCode: queryData.portCode,
                                eovStatus: queryData.eovStatus,
                                officeCode: queryData.officeCode,
                                activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                                activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                                generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                                generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                            }
                        }
                    })
                    if(result.success){
                        setSpinflag(false);
                        setTableData([]);
                        Toast('',result.message, 'alert-success', 5000, false)
                    }else {
                        setSpinflag(false);
                        Toast('',result.errorMessage, 'alert-error', 5000, false)
                    }
                }
            })
        } 
    }

    {/* 选择生成预估单 */}
    const EstimateSheetBtn = async() =>{
        Toast('', '', '', 5000, false);
        if(checkedRow.length<1){
            Toast('', intl.formatMessage({id: 'lbl.Select-data'}), 'alert-error', 5000, false);
            return
        }else{
            let params = checkedRow.map((item,index)=>{
                return {entryUuid:item.entryUuid}
            })
            const confirmModal = confirm({
                title: intl.formatMessage({id: 'lbl.Info-tips'}),
                content: intl.formatMessage({id: 'lbl.ag-fee-select-build'}),
                okText: intl.formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    let result= await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_BUILD_BILL_SELECT,{
                        method:"POST",
                        data:{
                                paramsList:params
                        }
                    })
                    if(result.success){
                        setSpinflag(false);
                        if(searchData.length>1){
                            pageChange(page);
                            Toast('',result.message, 'alert-success', 5000, false)
                            setCheckedRow([])
                        }else{
                            setTableData([])
                            Toast('',result.message, 'alert-success', 5000, false)
                            setCheckedRow([])
                        }
                    }else{
                        setSpinflag(false);
                        Toast('',result.errorMessage, 'alert-error', 5000, false)
                    }
                }
            })  
        }
    }
    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields(); 
        setBackFlag(true);
        setBackFlags(true);
        setAgFlag(true);
        setTableData([]);
        setTradeCode([]);
        setTradeLine([]);
        setChecked([]);
        setCheckedRow([]);
        setFeeType([]);
        setSearchFlag(false);
          queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            exFlag: withinBoundary.defaultValue,
        },[company,agencyCode])
    }
    {/* 查询 */}
    const pageChange = async (pagination,search) => {
        let queryData = queryForm.getFieldValue();
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        if(!queryData.feeClass){
            Toast('',intl.formatMessage({id:'lbl.feeClass'}), 'alert-error', 5000, false)
            setBackFlags(false)
            setSpinflag(false);
            return
        }else{
            setBackFlags(true)
            if(!queryData.svvd && !queryData.serviceLoopCode && !queryData.activeDate  && !queryData.generateDate){
                Toast('',intl.formatMessage({id:'lbl.generate-criteria'}), 'alert-error', 5000, false)
                setBackFlag(false)
                setSpinflag(false);
                return
            }else{
                setBackFlag(true)
                const result =await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_UNLOCK_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params": {
                            // ...queryData,
                            soCompanyCode: queryData.soCompanyCode,
                            agencyCode: queryData.agencyCode,
                            feeClass: queryData.feeClass,
                            feeType: queryData.feeType,
                            vesselProperty: queryData.vesselProperty,
                            tradeZoneCode: queryData.tradeZoneCode,
                            tradeCode: queryData.tradeCode,
                            tradeLaneCode: queryData.tradeLaneCode,
                            exFlag: queryData.exFlag,
                            serviceLoopCode: queryData.serviceLoopCode,
                            vesselCode: queryData.vesselCode,
                            voyageNumber: queryData.voyageNumber,
                            bargeType: queryData.bargeType,
                            svvd: queryData.svvd,
                            portCode: queryData.portCode,
                            eovStatus: queryData.eovStatus,
                            officeCode: queryData.officeCode,
                            activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                            activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                            generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                            generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                            "lockedInd":"U"  ,
                            "verifyStatus":"Z"  ,
                            "searchStatus":"Y"  ,
                        },
                        operateType:"AFCM-AG-ER-002",
                    }
                })
                let data=result.data
                if(result.success){
                    let datas=result.data.resultList
                    setSearchData(datas)
                    setSpinflag(false);
                    if(datas!=null){
                        datas.map((v,i)=>{
                            v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                            v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                            v.agencyTaxAmount ? v.agencyTaxAmount : v.agencyTaxAmount=0
                        })
                    }
                    setSearchFlag(true)
                    setPage({...pagination})
                    setTabTotal(data.totalCount)
                    setTableData([...datas])
                    setSelectedRowKeys([...datas])
                }else {
                    setTableData([])
                    setSpinflag(false);
                    Toast('',result.errorMessage, 'alert-error', 5000, false)
                }
            }

        }
    } 
    {/* 下载航次 */} 
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.agencyCode){setAgFlag(false)}else{setAgFlag(true)}
        if(!queryData.feeClass){setBackFlags(false)}else{setBackFlags(true)}
        if(!queryData.svvd && !queryData.serviceLoopCode && !queryData.activeDate  && !queryData.generateDate){setBackFlag(false)}else{setBackFlag(true)}
        if(!queryData.agencyCode){
            Toast('',intl.formatMessage({id:'lbl.agency-warn'}), 'alert-error', 5000, false)
            return
        }else if(!queryData.feeClass){
            Toast('',intl.formatMessage({id:'lbl.feeClass'}), 'alert-error', 5000, false)
            return
        }else if(!queryData.svvd && !queryData.serviceLoopCode && !queryData.activeDate  && !queryData.generateDate){
            Toast('',intl.formatMessage({id:'lbl.generate-criteria'}), 'alert-error', 5000, false)
            return
        }else{
            setSpinflag(true);
            const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_UNLOCK_DOWNLOAD,{
                method:"POST",
                data:{
                    params: {
                        ...queryData,
                        activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                        generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                        generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                        "lockedInd":"U"  ,
                        "verifyStatus":"Z"  ,
                        "searchStatus":"Y"  ,
                    },
                    operateType:"AFCM-AG-ER-002",
                    excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.generateCost'}), //文件名
                    sheetList: [{//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: intl.formatMessage({id: "lbl.agency"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            generateDate: intl.formatMessage({id: "lbl.generation-date"}),
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                            portCode: intl.formatMessage({id: "lbl.port"}),
                            feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                            eovStatus: intl.formatMessage({id: "lbl.EOV"}),
                            vslName: intl.formatMessage({id: "lbl.ht.statement.upload-vessel-name"}),
                            voyageNumber: intl.formatMessage({id: "lbl.voyage-number"}),
                            vesselCode: intl.formatMessage({id: "lbl.Ship-code"}),
                            vesselProperty: intl.formatMessage({id: "lbl.Ship-property"}),
                            tradeZoneCode: intl.formatMessage({id: "lbl.argue.trade-code"}),
                            tradeCode: intl.formatMessage({id: "lbl.Trade"}),
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
                            agencyTaxAmount: intl.formatMessage({id: "lbl.Tax-amount"}),
                            exFlag: intl.formatMessage({id: "lbl.within-boundary"}),        
                        },
                        sumCol: {//汇总字段
    
                        },
                        sheetName: intl.formatMessage({id: 'lbl.voyage-number'}),//sheet名称
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
                    navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.generateCost'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.generateCost'})+ '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        }
    }
    {/* 下载航次及箱子*/} 
    const boxVoyageNum = async() =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.agencyCode){setAgFlag(false)}else{setAgFlag(true)}
        if(!queryData.feeClass){setBackFlags(false)}else{setBackFlags(true)}
        if(!queryData.svvd && !queryData.serviceLoopCode && !queryData.activeDate  && !queryData.generateDate){setBackFlag(false)}else{setBackFlag(true)}
        if(!queryData.agencyCode){
            Toast('',intl.formatMessage({id:'lbl.agency-warn'}), 'alert-error', 5000, false)
            return
        }else if(!queryData.feeClass){
            Toast('',intl.formatMessage({id:'lbl.feeClass'}), 'alert-error', 5000, false)
            return
        }else if(!queryData.svvd && !queryData.serviceLoopCode && !queryData.activeDate  && !queryData.generateDate){
            Toast('',intl.formatMessage({id:'lbl.generate-criteria'}), 'alert-error', 5000, false)
            return
        }else{
            setSpinflag(true);
            const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_GENERATE_COST_EXPORT,{
                method:"POST",
                data:{
                    params: {
                        ...queryData,
                        activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                        generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                        generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                        "lockedInd":"U"  ,
                        "verifyStatus":"Z"  ,
                        "searchStatus":"Y"  ,
                    },
                    excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.generateCost'}), //文件名
                    sheetList: [
                        {//sheetList列表  --航次
                            dataCol: {//列表字段
                                agencyCode: intl.formatMessage({id: "lbl.agency"}),
                                activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                                generateDate: intl.formatMessage({id: "lbl.generation-date"}),
                                svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                                portCode: intl.formatMessage({id: "lbl.port"}),
                                feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                                feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                                eovStatus: intl.formatMessage({id: "lbl.EOV"}),
                                vslName: intl.formatMessage({id: "lbl.ht.statement.upload-vessel-name"}),
                                voyageNumber: intl.formatMessage({id: "lbl.voyage-number"}),
                                vesselCode: intl.formatMessage({id: "lbl.Ship-code"}),
                                vesselProperty: intl.formatMessage({id: "lbl.Ship-property"}),
                                tradeZoneCode: intl.formatMessage({id: "lbl.argue.trade-code"}),
                                tradeCode: intl.formatMessage({id: "lbl.Trade"}),
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
                                agencyTaxAmount: intl.formatMessage({id: "lbl.Tax-amount"}),
                                exFlag: intl.formatMessage({id: "lbl.within-boundary"}),        
                            },
                            sumCol: {},//汇总字段
                            sheetName: intl.formatMessage({id: 'lbl.voyage-number'}),//航次
                        },
                        {//sheetList列表   ---箱子
                            dataCol: {//列表字段
                                svvd: intl.formatMessage({id: "lbl.SVVD"}),
                                portCode: intl.formatMessage({id: "lbl.port"}),  
                                feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                                feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),   
                                referenceCode: intl.formatMessage({id: "lbl.bill-of-lading-number"}),
                                billCompanyCode: intl.formatMessage({id: "lbl.Company (B/L)"}),
                                agencyCode: intl.formatMessage({id: "lbl.agency"}),
                                activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                                actualFlag: intl.formatMessage({id: "lbl.WhetherItActuallyHappenedOrNot"}),
                                feeCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                                feePrice: intl.formatMessage({id: "lbl.price"}),
                                feePriceType: intl.formatMessage({id: "lbl.The-unit-price-categories"}),
                                teuMis: intl.formatMessage({id: "lbl.TEU"}),
                                feeAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                                feeAgmtCode: intl.formatMessage({id: "lbl.Agreement-number"}),
                                calculationMode: intl.formatMessage({id: "lbl.Computing-method"}),
                                firstPolCode: intl.formatMessage({id: "lbl.The-loading-port"}),
                                lastPodCode: intl.formatMessage({id: "lbl.The-final-port-of-discharge"}),
                                containerType: intl.formatMessage({id: "lbl.Box"}),
                                containerSize: intl.formatMessage({id: "lbl.size"}),
                                appendCntNum: intl.formatMessage({id: "lbl.ac.cntr-num"}),
                                cargoTradeLaneCode: intl.formatMessage({id: "lbl.Trade-line"}),
                                cargoNatureCode: intl.formatMessage({id: "lbl.cargo-class"}),  
                                fullEmptyInd: intl.formatMessage({id: "lbl.empty-container-mark"}),  
                                expImpInd: intl.formatMessage({id: "lbl.bound-sign"}),  
                                transmitInd: intl.formatMessage({id: "lbl.Transit-logo"}),  
                                socInd: intl.formatMessage({id: "lbl.Whether-the-SOC-box"}),
                            },
                            sumCol: {},//汇总字段
                            sheetName: intl.formatMessage({id: 'lbl.box'}),//箱子
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
                    navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.generateCost'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.generateCost'})+ '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
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
                        <Select span={6} name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} formlayouts={formlayouts}/>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts} styleFlag={agFlag}/> : <Select showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts} styleFlag={agFlag}/>
                        }
                        {/* <Select name='agencyCode' showSearch={true} label={<FormattedMessage id='lbl.agency'/>} span={6} options={agencyCode} />   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} selectChange={getCommonSelectVal} style={{background:backFlags?'white':'yellow'}} options={feeClass} formlayouts={formlayouts}/> 
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={feeType} formlayouts={formlayouts}/>
                        {/* 业务日期 */}
                        <DoubleDatePicker name='activeDate' flag={false} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}} label={<FormattedMessage id="lbl.argue.bizDate" />} span={6}  formlayouts={formlayouts}/>
                        {/* 生成日期 */}
                        <DoubleDatePicker name='generateDate' flag={false} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}} label={<FormattedMessage id="lbl.generation-date" />} span={6}  formlayouts={formlayouts}/>
                        {/* 贸易区 */}
                        <Select name='tradeZoneCode' flag={true} label={<FormattedMessage id='lbl.argue.trade-code'/>}  span={6} options={tradeZoneCode.values} selectChange={companyIncident} formlayouts={formlayouts}/>
                        {/* Trade */}
                        <Select name='tradeCode' flag={true} label={<FormattedMessage id='lbl.Trade'/>}  span={6} options={tradeCode} selectChange={trades} formlayouts={formlayouts}/>
                        {/* Trade Lane */}
                        <Select name='tradeLaneCode' flag={true} label={<FormattedMessage id='lbl.trade-channel'/>}  span={6} options={tradeLine} formlayouts={formlayouts}/> 
                        {/* 是否边界内 */}
                        <Select name='exFlag' label={<FormattedMessage id='lbl.within-boundary'/>}  span={6} options={withinBoundary.values} formlayouts={formlayouts}/>
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>} span={6} styleFlag={backFlag} formlayouts={formlayouts}/> 
                        {/* 船舶代码 */}
                        <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code'/>} span={6} formlayouts={formlayouts}/>  
                        {/* 航次 */}
                        <InputText name='voyageNumber' label={<FormattedMessage id='lbl.voyage-number'/>} span={6} formlayouts={formlayouts}/>  
                        {/* 船舶类型 */}
                        <Select name='bargeType' flag={true} label={<FormattedMessage id='lbl.Ship-type'/>} span={6} options={shipType.values} formlayouts={formlayouts}/>  
                        {/* SVVD */}
                        <InputText name='svvd' label={<FormattedMessage id='lbl.SVVD'/>} span={6} styleFlag={backFlag} formlayouts={formlayouts}/>  
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6} formlayouts={formlayouts}/>  
                        {/* EOV */}
                        <Select name='eovStatus' flag={true} label={<FormattedMessage id='lbl.EOV'/>}  span={6} options={eovStatus.values} formlayouts={formlayouts}/>
                        {/* Office */}
                        <InputText name='officeCode' label={<FormattedMessage id='lbl.office'/>}  span={6} formlayouts={formlayouts}/> 
                        {/* 船舶属性 */}
                        <Select name='vesselProperty' flag={true} label={<FormattedMessage id='lbl.Ship-property'/>} span={6} options={vesselProperty.values} formlayouts={formlayouts}/> 
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 选择生成预估单 */}
                    <CosButton onClick={EstimateSheetBtn} auth='AFCM-AG-ER-002-B02'> <SelectOutlined /><FormattedMessage id='btn.Select-generate-estimate' /></CosButton>
                    {/* 全部生成预估单 */}
                    <CosButton onClick={EstimateSheetAllBtn} auth='AFCM-AG-ER-002-B03'> <UnorderedListOutlined  /><FormattedMessage id='btn.Generate-all-estimates' /></CosButton>
                    {/* 下载航次 */}
                    <Button onClick={downloadBtn}> <CloudDownloadOutlined /><FormattedMessage id='lbl.download.voyage' /></Button>
                    {/* 下载航次及箱子 */}
                    <Button onClick={boxVoyageNum}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download-voyage-box'/></Button>
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <Button onClick={clearBtn}><ReloadOutlined /><FormattedMessage id='btn.reset' /></Button>
                    {/* 查询 */}
                    <Button onClick={()=> pageChange(page,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
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
                    selectedRowKeys = {selectedRowKeys}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setCheckedRow(row);
                        }
                    }}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default generateCostEstimate