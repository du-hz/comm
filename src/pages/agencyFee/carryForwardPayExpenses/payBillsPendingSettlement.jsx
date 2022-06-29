{/*  待处理结转实付报账单 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import { FormattedMessage, useIntl } from 'umi';
import { Button,  Form, Row, Tabs,  Modal} from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {acquireSelectData,momentFormat, agencyCodeData, acquireSelectDataExtend,costCategories,} from '@/utils/commonDataInterface';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import request from '@/utils/request';
import {Toast} from '@/utils/Toast';
import Loading from '@/components/Common/Loading';
import CosButton from '@/components/Common/CosButton'

import {
    FileExclamationOutlined , //取消报账单
    SearchOutlined,//查询
    CloudDownloadOutlined,//下载
    CheckCircleOutlined, //审核通过
    SaveOutlined,//保存
    DeliveredProcedureOutlined  , //选择
    FileDoneOutlined, //审核退回
    ReloadOutlined, //清空
} from '@ant-design/icons'

const confirm = Modal.confirm //弹窗
let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

{/* tab切换 */}
const { TabPane } = Tabs;
const payBillsPendingSettlement =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData,setTableData] = useState([]);   // table 报账单列表数据
    const [detailData,setDetailData] = useState([]);   // table 明细数据
    const [detailList,setDetailList] = useState([]);   // table 明细数据-汇总
    const [tabTabTotal,setTabTotal ] = useState([]);     // table 条数
    const [detailedTotal, setDetailedTotal] = useState([]);   // 明细table条数
    const [defaultKey, setDefaultKey] = useState('1');  //导航页
    const [selectedRows,setSelectedRows] = useState([])  //选择项
    const [uuidData, setUuidData] = useState('');   // uuid  
    const [checked, setChecked] = useState([]); //选择
    const [queryDataCode, setQueryDataCode] = useState([]);   // 头
    const [receiptStatus,setVerifyStatus] = useState({})// 报账单状态
    const [stateData, setStateData] = useState({});   // 状态
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [cancelFlag, setCancelFlag] =  useState(true); //取消报账单权限
    const [financeFlag,setFinanceFlag] = useState(false);  //财务审核权限
    const [businessFlag, setBusinessFlag] = useState(false);  //业务及其它按钮审核权限
    const [rowFlag,setRowFlag] = useState(true) // 明细列表权限
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeCategory,setFeeCategory] = useState ([])
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [checkStatus,setCheckStatus] = useState({});//退回标志位
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [queryForm] = Form.useForm();
    const [queryFormDetailed] = Form.useForm();
    const [queryFormDetaileds] = Form.useForm();
    const [paramterUid,setParamterUid] = useState ("")
    const [headerTitle, setHeaderTitle] = useState(""); //弹窗标题
    const [searchData, setSearchData] = useState([]); 
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [pageDetailed,setPageDetailed]=useState({
        current: 1,
        pageSize: 10
    })
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
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

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company,acquireData])
    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        acquireSelectData('AG.OFFCR.VERIFYSTATUS',setVerifyStatus,$apiUrl) // 报账单状态
        acquireSelectData('AFCM.OFFCR.DTL.VERIFYSTATUS',setStateData,$apiUrl) //状态
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大类
        acquireSelectData('AGMT.VAT.FLAG',setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectData('CR.CHECK.STATUS',setCheckStatus,$apiUrl);//退回标志
        setCancelFlag(false);//取消报账单禁用
        setRowFlag(false); //明细列表禁用
        setBusinessFlag(true);//选择/保存/业务审核禁用
        setFinanceFlag(true);//财务审核禁用
    },[])
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
                v['label']=v.feeName+'(' + v.feeCode +')';
            })
            setFeeCategory(listAgTypeToClass)
        }
    }

    {/* 报账单列表 */}
    const column=[
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Reimbursement-number' />,// 报账单号码
            dataIndex: 'sfListCode',
            align:'left',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id="lbl.Reimbursement-date" />,// 报账日期
            dataType: 'dateTime',
            dataIndex: 'generateDate',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Reimbursement-personnel' />,// 报账人员
            dataIndex: 'generateUser',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.auditor' />,// 审核人员
            dataIndex: 'checkUser',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.audit-date'/>,// 审核日期
            dataType: 'dateTime',
            dataIndex: 'checkDate',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Reimbursement-status'/>,// 报账单状态
            dataIndex: 'verifyStatus',
            dataType: receiptStatus.values,
            align:'left',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Tax-coins'/>,// 税金（参考）币种 
            dataIndex: 'clearingCcyCde',
            align:'left',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Total-amount-tax'/>,// 税金（参考）总金额 
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
    ]
    {/* 明细信息列表 */}
    const columns=[
        {
            title: <FormattedMessage id='lbl.state'/>,//状态
            dataIndex: 'verifyStatus',
            dataType: stateData.values,
            align:'left', 
            sorter: false,
            width: 45,
        },
        {
            title: <FormattedMessage id='lbl.Estimated-order-number'/>,//预估单号码
            dataIndex: 'ygListCode',
            align:'left', 
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Return-flag'/>,//退回标志位
            dataType:checkStatus.values,
            dataIndex: 'checkStatus',
            align:'left', 
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate"/>,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id="lbl.generation-date"/>,//生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDate',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            sorter: false,
            width: 80,
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
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'tradeLaneCode',
            align:'left',
            sorter: false,
            width: 60,
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
            width: 45,
        },
        {
            title: <FormattedMessage id='lbl.version-number' />,// 版本号
            dataIndex: 'versionNum',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
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
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference' />,// 协议币税金(参考)
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference'/>,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id='lbl.Standard-currency' />,// 本位币种
            dataIndex: 'agencyCurrency',
            align:'left',
            sorter: false,
            width: 80,
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
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency'/>,// 本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyReviseAmount',
            align:'right',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Tax-in-local-currency'/>,// 本位币税金(参考)
            dataIndex: 'vatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency' />,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'cleaningCurrencyCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency'/>,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'cleaningAmount',
            align:'right',
            sorter: false,
            width: 90
        },
        {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency'/>,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id= 'lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseCleaningAmount',
            align:'right',
            sorter: false,
            width: 120
        },
    ]
    {/* 明细信息列表-汇总*/}
    const columnsdata=[
        {
            title: <FormattedMessage id='lbl.Agreement-currency' />,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataType: 'dataAmount',
            dataIndex: 'rateSumAmount',
            align:'right',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'rateSumReviseAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference'/>,// 协议币税金(参考)
            dataIndex: 'sumVatAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference'/>,// 协议币调整税金(参考)
            dataIndex: 'sumVatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id= 'lbl.Amount-payable-to-outlets'/>,// 应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'sumPaymentAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id= 'lbl.Agency-net-income'/>,// 代理净收入
            dataType: 'dataAmount',
            dataIndex: 'sumRecAmount',
            align:'right',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.submitanexpenseaccount'/>,// 向谁报账
            dataIndex: 'sfSide',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Standard-currency'/>,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Amount-in-base-currency'/>,// 本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencySumAmount',
            align:'right',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency'/>,// 本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencySumReviseAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id= 'lbl.Tax-in-local-currency'/>,// 本位币税金(参考)
            dataIndex: 'sumVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency'/>,// 本位币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
        {
            title: <FormattedMessage id= 'lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id=  'lbl.amount-of-settlement-currency' />,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumAmount',
            align:'right',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id= 'lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumReviseAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'sumVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id= 'lbl.tax-adjustment-in-settlement-currency'/>,// 结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
    ]

    {/* 报账单列表-查询 */}
    const searchList= async (pagination,search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        const result =await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_SEARCH_IN_PROCESS_BILL_LIST,{ 
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    ...queryForm.getFieldValue(),
                    "searchStatus": "Y",
                    "companyCode": "2000",
                    generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                    generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                },
                operateType: "AFCM-AG-CR-002"
            }
        })
        let data=result.data
        if(result.success){
            setSpinflag(false);
            let datas=result.data.resultList
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
            setSearchData(datas)
        }else{
            setSpinflag(false);
            setTableData([])
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 取消报账单 */}
    const ReimbursementBtn = async() =>{
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id: 'lbl.Cancel-reimbursement'}),   
            content: intl.formatMessage({id: 'lbl.Excute-operation'}),
            okText: intl.formatMessage({id: 'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                let result= await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_RECEIPT_CANCEL,{
                    method:"POST",
                    data:{
                        uuid: queryDataCode.sfListUuid
                    }
                })
                if(result.success){
                    setSpinflag(false);
                    setDetailData([])
                    setDetailList([])
                    setDefaultKey('1')
                    queryForm.resetFields();
                    queryForm.setFieldsValue({
                        agencyCode: company.agencyCode,
                        soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
                    },[company,agencyCode]) 
                    setCancelFlag(false);//取消报账单禁用
                    setRowFlag(false); //明细列表禁用
                    setBusinessFlag(true);//选择/保存/业务审核禁用
                    setFinanceFlag(true);//财务审核禁用
                    if(searchData.length>1){
                        searchList(page);
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
    {/* 明细svvd-查询 */}
    const searchDetailList= async (pagination,search) => {
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=pageDetailed.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result =await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_SEARCH_CR_RECEIPT_DETAIL,{ 
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                     svvd: queryFormDetaileds.getFieldValue().svvdId,
                },
                uuid: queryDataCode.sfListUuid,
            }
        })
        let data=result.data
        if(result.success){
            setSpinflag(false);
            let datas=result.data.list
            let summaryList= result.data.summaryList
            let checkedUuid = [];
            if(datas!=null){
                datas.map((v, i) => {
                    if(v.verifyStatus == stateData.values[0].value) {
                        checkedUuid.push(v.entryUuid);
                    }
                })
            }
            setChecked(checkedUuid);
            setPageDetailed({...pagination})
            setDetailedTotal(data.totalCount)
            setDetailData([...datas])
            setDetailList([...summaryList])
        }else{
            setSpinflag(false);
            setDetailData([])
            setDetailList([])
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 明细信息-查询 */}
    const pageChange = async (uuid,pagination,parameter) =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result =await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_SEARCH_CR_RECEIPT_DETAIL,{
            method:"POST",
            data:{
                "page": pagination,
                uuid: uuid
            }
        })
        if(result.success){
            setSpinflag(false);
            let data=result.data
            let queryData = data.headData;  //报账头数据
            setUuidData(queryData.sfListUuid);  //获取uuid
            setQueryDataCode(queryData);
            let checkedUuid = [];
            if(data.list!=null){
                data.list.map((v, i) => {
                    if(v.verifyStatus == stateData.values[0].value) {
                        checkedUuid.push(v.entryUuid);
                    }
                })
            }
            setChecked(checkedUuid);
            if(queryData.verifyStatus == 'W'){
                setCancelFlag(false);//取消报账单禁用
                setRowFlag(true); //明细列表可操作
                setBusinessFlag(false);//选择/保存/业务审核可操作
                setFinanceFlag(true);//财务审核禁用
            }else if(queryData.verifyStatus == 'C'){
                setCancelFlag(false);//取消报账单禁用
                setRowFlag(false); //明细列表禁用
                setBusinessFlag(true);//选择/保存/业务审核禁用
                setFinanceFlag(false);//财务审核可操作
            }else if(queryData.verifyStatus == 'Q' || queryData.verifyStatus == 'R'){
                setCancelFlag(true);//取消报账单可操作
                setRowFlag(false); //明细列表禁用
                setBusinessFlag(true);//选择/保存/业务审核禁用
                setFinanceFlag(true);//财务审核禁用
            }else if(queryData.verifyStatus == 'P'){
                setCancelFlag(false);//取消报账单禁用
                setRowFlag(false); //明细列表禁用
                setBusinessFlag(true);//选择/保存/业务审核禁用
                setFinanceFlag(true);//财务审核禁用
            }
            let list=result.data.list
            let summaryList=result.data.summaryList
            if(summaryList!=null){
                summaryList.map((v,i)=>{
                    v.Uuid=i
                })
            }
            setPageDetailed({...pagination})
            setDetailData([...list]) //明细
            setDetailedTotal(data.totalCount)   //明细-条数
            setDetailList([...summaryList])    // 明细-汇总
            setSelectedRowKeys([data.summaryList.verifyStatus])
            if(receiptStatus.values!=null){
                receiptStatus.values.map((v, i) => {
                    queryData.verifyStatus == v.value ? queryData.verifyStatus = v.label : '';
                })
            }
            queryFormDetailed.setFieldsValue({
                companyCode: queryData.companyCode,
                verifyStatus: queryData.verifyStatus,
                packageProcessId: queryData.packageProcessId ? queryData.packageProcessId : '0',
                checkDate: queryData.checkDate ? queryData.checkDate.substring(0, 10) : null,
                checkUser: queryData.checkUser,
                tmpSfListCode: queryData.tmpSfListCode,
                vatAmt: parameter.vatAmt,
                clearingCcyCde: parameter.clearingCcyCde ? parameter.clearingCcyCde : null,
                popData:{
                    generateDate: queryData.generateDate ? queryData.generateDate.substring(0, 10) : null,
                    generateUser: queryData.generateUser,
                    sfListCode: queryData.sfListCode,
                }
            })
        }else {
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 双击 */}
    const handleDoubleClickRow = (parameter) => {
        Toast('', '', '', 5000, false);
        queryFormDetaileds.resetFields();
        pageDetailed.current=1
        pageDetailed.pageSize=10
        pageChange(parameter.sfListUuid,pageDetailed,parameter);
        setDefaultKey('2');
        setParamterUid(parameter.sfListUuid)
        setHeaderTitle(parameter.sfListCode)
    }
    {/* 选择的导航页 */}
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key)
	}
    {/* 选择 */}
    const getSelectedRows = (selectrows) =>{
        setSelectedRows(selectrows)
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
            v.verifyStatus = stateData.values[1].value;
        })
        row.map((v, i) => {
            v.verifyStatus = stateData.values[0].value;
        })
    }
    {/* 保存 */}
    const saveBtn = async() => {
        Toast('', '', '', 5000, false);
        let data = [];
        detailData.map((v, i) => {
            data.push({
                entryUuid: v.entryUuid,
                verifyStatus: v.verifyStatus,
            })
        })
        setSpinflag(true);
        const result = await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_RECEIPT_SAVE,{
            method:"POST",
            data:{
                paramsList: data,
                agencyCode: queryDataCode.agencyCode,
                uuid: queryDataCode.sfListUuid
            }
        })
        if(result.success) {
            setSpinflag(false);
            Toast('',result.message, '', 5000, false)
        }else{
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/*  审核通过 and 审核退回 */}
    const examineBtn = async(operate,listNum) => {
        Toast('', '', '', 5000, false);
        if(listNum=='one'){
            listNum = 'lbl.ag-fee-paybill-business-approved'
        }else if(listNum=='two'){
            listNum = 'lbl.ag-fee-paybill-business-reject'
        }else if(listNum=='three'){
            listNum = 'lbl.ag-fee-paybill-financial-approved'
        }else{
            listNum = 'lbl.ag-fee-paybill-financial-reject'
        }
        const confirmModal = confirm({
            title: intl.formatMessage({id: 'lbl.Info-tips'}),    
            content: intl.formatMessage({id: listNum}),    
            okText: intl.formatMessage({id: 'lbl.confirm'}),    
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
                let verifyStatus = queryDataCode.verifyStatus
                if(receiptStatus.values!=null){
                    receiptStatus.values.map((v, i) => {
                        verifyStatus == v.label ? verifyStatus = v.value : '';
                    })
                }
                const result =await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_REVIEW_CR_RECEIPT,{
                    method:"POST",
                    data:{
                        paramsList: data,
                        "params":{
                            "verifyStatus": verifyStatus
                        },
                        "operateType": operate ,
                        uuid: uuidData
                    }
                })
                if(result.success) {
                    setSpinflag(false);
                    setDetailData([])
                    setDetailList([])
                    // queryForm.resetFields();
                    queryFormDetailed.resetFields();
                    queryFormDetaileds.resetFields();
                    queryForm.setFieldsValue({
                        // agencyCode: company.agencyCode,
                        soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
                    },[company]) 
                    setDefaultKey('1')
                    setCancelFlag(false);//取消报账单禁用
                    setRowFlag(false); //明细列表禁用
                    setBusinessFlag(true);//选择/保存/业务审核禁用
                    setFinanceFlag(true);//财务审核禁用
                    let page = {
                        current: 1,
                        pageSize: 10
                    }
                    searchList(page)
                    Toast('',result.message, '', 5000, false)
                }else{
                    setSpinflag(false);
                    Toast('',result.errorMessage, 'alert-error', 5000, false)
                }
            }
        })
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
    {/* 报账单列表-下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setSpinflag(true);
        const result = await request($apiUrl.AGENCY_FEE_PAY_BILL_PEND_SETTLEMENT_DOWNLOAD,{
            method:"POST",
            data:{
                page: {
                    pageSize: 0,
                    current: 0
                },
                params: {
                    ...queryData,
                    "searchStatus": "Y",
                    "companyCode": "2000",
                    generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                    generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                },
                operateType: "AFCM-AG-CR-002",
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.PendingBill'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}), 
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        sfListCode: intl.formatMessage({id: "lbl.Reimbursement-number"}),
                        generateDate: intl.formatMessage({id: "lbl.Reimbursement-date"}),
                        generateUser: intl.formatMessage({id: "lbl.Reimbursement-personnel"}),
                        checkDate: intl.formatMessage({id: "lbl.audit-date"}),
                        checkUser: intl.formatMessage({id: "lbl.auditor"}),
                        verifyStatus: intl.formatMessage({id: "lbl.Reimbursement-status"}), 
                        clearingCcyCde: intl.formatMessage({id: "lbl.Tax-coins"}), 
                        vatAmt: intl.formatMessage({id: "lbl.Total-amount-tax"}), 
                    },
                    sumCol: {}, //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.PendingBill'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.PendingBill'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.PendingBill'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    {/* 明细信息-下载 */}
    const downLoadDtl = async() => {
        Toast('', '', '', 5000, false);
        if(paramterUid==""){
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return;
        }
        const result = await request($apiUrl.AGENCY_FEE_PAY_BILL_PEND_SETTLEMENT_DETAIL_DOWNLOAD,{
            method:"POST",
            data:{
                page: {
                    pageSize: 0,
                    current: 0
                },
                uuid: paramterUid,
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.PendingBill'}), //文件名
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            companyCode: intl.formatMessage({id: "lbl.company"}), 
                            verifyStatus: intl.formatMessage({id: "lbl.state"}), 
                            packageProcessId: intl.formatMessage({id: "lbl.Generating-packets"}), 
                            generateDate: intl.formatMessage({id: "lbl.generation-date"}), 
                            generateUser: intl.formatMessage({id: "lbl.Generation-personnel"}), 
                            sfListCode: intl.formatMessage({id: "lbl.Reimbursement-number"}), 
                            checkDate: intl.formatMessage({id: "lbl.confirmation-date"}), 
                            checkUser: intl.formatMessage({id: "lbl.confirmation-personnel"}), 
                            tmpSfListCode: intl.formatMessage({id: "lbl.provisional-reimbursement-no"}), 
                            vatAmt: intl.formatMessage({id: "lbl.Total-amount-tax"}), 
                            clearingCcyCde: intl.formatMessage({id: "lbl.Tax-coins"}), 
                        },
                        sumCol: {}, //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Reimbursement-header-information'}),//报账单头信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            verifyStatus: intl.formatMessage({id: "lbl.state"}), 
                            ygListCode: intl.formatMessage({id: "lbl.Estimated-order-number"}), 
                            checkStatus: intl.formatMessage({id: "lbl.Return-flag"}), 
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}), 
                            generateDate: intl.formatMessage({id: "lbl.generation-date"}), 
                            feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}), 
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}), 
                            tradeLaneCode: intl.formatMessage({id: "lbl.Trade-line"}), 
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}), 
                            portCode: intl.formatMessage({id: "lbl.port"}), 
                            versionNum: intl.formatMessage({id: "lbl.version-number"}), 
                            rateCurrency: intl.formatMessage({id: "lbl.Agreement-currency"}), 
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}), 
                            reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}), 
                            vatFlag: intl.formatMessage({id: "lbl.Whether-the-price-includes-tax"}), 
                            vatAmt: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}), 
                            vatReviseAmt: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}), 
                            agencyCurrency: intl.formatMessage({id: "lbl.Standard-currency"}), 
                            agencyCurrencyAmount: intl.formatMessage({id: "lbl.Amount-in-base-currency"}), 
                            agencyCurrencyReviseAmount: intl.formatMessage({id: "lbl.Adjustment-amount-in-base-currency"}), 
                            vatAmtInAgency: intl.formatMessage({id: "lbl.Tax-in-local-currency"}), 
                            reviseVatAmtInAgency: intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}), 
                            cleaningCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}), 
                            cleaningAmount: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}), 
                            vatAmtInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}), 
                            reviseVatAmtInClearing: intl.formatMessage({id: "lbl.tax-adjustment-in-settlement-currency"}), 
                            reviseCleaningAmount: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}), 
                        },
                        sumCol: {}, //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.reimbur-del-info'}),//实付报账单详细信息
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
                            sfSide: intl.formatMessage({id: "lbl.submitanexpenseaccount"}), 
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
                        sumCol: {}, //汇总字段
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
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.PendingBill'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = headerTitle + intl.formatMessage({id: 'lbl.reimbur-detail-info'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    return (
        <div className='parent-box'>
            <Tabs type="card" onChange={callback} activeKey={defaultKey}>
                <TabPane tab={<FormattedMessage id='lbl.Reimbursement-list' />} key="1">
                    <div className='header-from' style={{marginTop:'15px'}}>
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
                                    company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                                }
                                {/* <Select name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>} span={6}/>   */}
                                {/* 报账单号码 */}
                                <InputText name='sfListCode' label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6} formlayouts={formlayouts}/>  
                                {/* 报账人员 */}
                                <InputText name='generateUser' label={<FormattedMessage id='lbl.Reimbursement-personnel'/>} span={6} formlayouts={formlayouts} capitalized={false}/>  
                                {/* 报账日期 */}
                                <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate'  label={<FormattedMessage id="lbl.Reimbursement-date" />} formlayouts={formlayouts}/>
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 下载 */}
                            <Button onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='btn.download'/></Button>
                        </div>
                        <div className='button-right'>
                            {/* 重置 */}
                            <Button onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></Button>
                            {/* 查询 */}
                            <Button onClick={() => searchList(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search'/></Button>
                        </div>
                    </div>
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={tableData}
                            columns={column}
                            rowKey='sfListUuid'
                            pageChange={searchList}
                            scrollHeightMinus={200}
                            total={tabTabTotal}
                            pageSize={page.pageSize}
                            current={page.current}
                            // selectionType='radio'
                            rowSelection={null}
                            setSelectedRows={getSelectedRows}
                            selectWithClickRow={true}
                            handleDoubleClickRow={handleDoubleClickRow}
                        />
                    </div>
                </TabPane>
                <TabPane tab={<FormattedMessage id='lbl.Detailed-information' />} key="2">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryFormDetailed}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 公司 */}
                                <InputText disabled name='companyCode' label={<FormattedMessage id='lbl.company'/>} span={6}/>  
                                {/* 状态 */}
                                <InputText disabled name='verifyStatus' label={<FormattedMessage id='lbl.state'/>} span={6}/>  
                                {/* 生成数据包的批次 */}
                                <InputText disabled name='packageProcessId' label={<FormattedMessage id='lbl.Generating-packets'/>} span={6}/> 
                                {/* 生成日期 */}
                                <InputText disabled name={['popData','generateDate']} label={<FormattedMessage id="lbl.generation-date" />} span={6} />
                                {/* 生成人员 */}
                                <InputText disabled name={['popData','generateUser']} label={<FormattedMessage id='lbl.Generation-personnel'/>} span={6}/> 
                                {/* 报账单号码 */}
                                <InputText disabled name={['popData','sfListCode']} label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>  
                                {/* 确认日期 */}
                                <InputText disabled name='checkDate'  label={<FormattedMessage id='lbl.confirmation-date'/>} span={6}/>  
                                {/* 确认人员 */}
                                <InputText disabled name='checkUser' label={<FormattedMessage id='lbl.confirmation-personnel'/>} span={6}/>  
                                {/* 临时报账单号码 */}
                                <InputText disabled name='tmpSfListCode' label={<FormattedMessage id='lbl.provisional-reimbursement-no'/>} span={6}/>  
                                {/* 税金（参考）总金额 */}
                                <InputText disabled name='vatAmt' label={<FormattedMessage id='lbl.Total-amount-tax'/>} span={6}/> 
                                {/* 税金（参考）币种 */}
                                <InputText disabled name='clearingCcyCde' label={<FormattedMessage id='lbl.Tax-coins'/>} span={6}/>
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/></Button> </div>
                    </div>
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryFormDetaileds} 
                            name='svvdSearch'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* SVVD */}
                                <InputText name='svvdId' label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>  
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 全选 */}
                            <Button onClick={()=>allSelect(true)} disabled={businessFlag}><DeliveredProcedureOutlined  /><FormattedMessage id='btn.select-all' /></Button>
                            {/* 全不选 */}
                            <Button onClick={()=>allSelect(false)} disabled={businessFlag}><DeliveredProcedureOutlined  /><FormattedMessage id='btn.no-at-all' /></Button>
                            {/* 保存 */}
                            <CosButton onClick={saveBtn} disabled={businessFlag} auth='AFCM-AG-CR-002-B02'><SaveOutlined /><FormattedMessage id='btn.save' /></CosButton>
                            {/* 业务审核通过 */}
                            <CosButton onClick={()=>examineBtn("confirm",'one')} disabled={businessFlag} auth='AFCM-AG-CR-002-B03'><CheckCircleOutlined  /><FormattedMessage id='btn.Business-approved'/></CosButton>
                            {/* 业务审核退回 */}
                            <CosButton onClick={()=>examineBtn("return",'two')} disabled={businessFlag} auth='AFCM-AG-CR-002-B04'><FileDoneOutlined /><FormattedMessage id='btn.Business-Review-return'/></CosButton>
                            {/* 财务审核通过 */}
                            <CosButton onClick={()=>examineBtn("confirm",'three')} disabled={financeFlag} auth='AFCM-AG-CR-002-B05'><CheckCircleOutlined  /><FormattedMessage id='btn.Financial-audit-passed'/></CosButton>
                            {/* 财务审核退回 */}
                            <CosButton onClick={()=>examineBtn("return",'four')} disabled={financeFlag} auth='AFCM-AG-CR-002-B06'><FileDoneOutlined /><FormattedMessage id='btn.Financial-audit-return'/></CosButton>
                            {/* 取消报账单 */}
                            <CosButton onClick={ReimbursementBtn}  disabled={cancelFlag?false:true} auth='AFCM-AG-CR-002-B01'><FileExclamationOutlined   /><FormattedMessage id='btn.Cancel-reimbursement'/></CosButton>
                            {/* 下载 */}
                            <Button onClick={downLoadDtl}><CloudDownloadOutlined /><FormattedMessage id='btn.download'/></Button>
                        </div>
                        <div className='button-right'>
                            {/* 查询 */}
                            <Button onClick={() => searchDetailList(pageDetailed,'search')}><SearchOutlined /><FormattedMessage id='btn.search'/></Button>
                        </div>
                    </div>
                    <div className='footer-table'>
                        {/* 表格 */}
                        <PaginationTable
                            dataSource={detailData}
                            columns={columns}
                            rowKey='entryUuid'
                            pageChange={searchDetailList}
                            scrollHeightMinus={200}
                            total={detailedTotal}
                            pageSize={pageDetailed.pageSize}
                            current={pageDetailed.current}
                            setSelectedRows={getSelectedRows}
                            selectedRowKeys = {selectedRowKeys}
                            rowSelection={
                                rowFlag?{
                                selectedRowKeys:checked,
                                onChange:(key, row)=>{
                                        setChecked(key);
                                        // setUuidData(row);
                                        selectFun(detailData, row);
                                    }
                                }:null
                            }
                        />
                    </div>
                    <div className='footer-table' style={{marginTop:'10px'}}>
                        <PaginationTable
                            rowKey="Uuid"
                            columns={columnsdata} 
                            dataSource={detailList}
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={200}
                        />
                    </div>
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default payBillsPendingSettlement
