{/* 查询结转实付报账单 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,  useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData,costCategories , momentFormat, agencyCodeData, acquireSelectDataExtend,} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row, Modal} from 'antd'
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

let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const queryPayReimbursement =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData,setTableData] = useState([]);  // table 数据
    const [tabTabTotal,setTabTotal ] = useState([]);    // table条数
    const [tabDetailTotal,setTabDetailTotal ] = useState([]) // table明细条数 
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeCategory,setFeeCategory] = useState ([])
    const [reimbursStatus, setVerifyBillState] = useState({});   // 报账单状态
    const [stateData, setStateData] = useState({});   // 状态
    const [packageFlag, setPackage] = useState({});   // 是否生成数据包
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [isModalVisible, setIsModalVisible] = useState(false);   // 明细弹窗
    const [headerTitle, setHeaderTitle] = useState(""); //弹窗标题
    const [detailData,setDetailData] = useState([]);  // 明细数据
    const [detailDatas,setDetailDatas] = useState([]);  // 明细数据-汇总
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [checkStatus,setCheckStatus] = useState({});//退回标志位
    const [uuid, setUuid] = useState("");   // 分页uid
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
    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.PACKAGE.FLAG', setPackage, $apiUrl);// 是否生成数据包
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大类
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        // acquireSelectData('AFCM.ER.RECEIPT.STATUS',  setState,  $apiUrl);   // 报账单状态
        acquireSelectData('AG.OFFCR.VERIFYSTATUS',  setVerifyBillState,  $apiUrl);   // 报账单状态
        acquireSelectData('AFCM.OFFCR.DTL.VERIFYSTATUS',setStateData,$apiUrl) //状态
        acquireSelectData('CR.CHECK.STATUS',setCheckStatus,$apiUrl);//退回标志
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
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
                v['label']=v.feeCode+'(' + v.feeName +')';
            })
            setFeeCategory(listAgTypeToClass)
        }
    }
    {/* 列表 */}
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
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
            title: <FormattedMessage id='lbl.company' />,//公司
            dataIndex: 'companyCode',
            align:'left', 
            sorter: false,
            width: 45,
        },
        {
            title: <FormattedMessage id='lbl.Reimbursement-number'/>,// 报账单号码
            dataIndex: 'sfListCode',
            align:'left',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.provisional-reimbursement-no'/>,// 临时报账单号码
            dataIndex: 'tmpSfListCode',
            align:'left',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.voucher-number'/>,// 凭证号码
            dataIndex: 'documentNumber',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id="lbl.Reimbursement-date"/>,// 报账日期
            dataIndex: 'generateDate',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Reimbursement-personnel'/>,// 报账人员
            dataIndex: 'generateUser',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id="lbl.confirmation-date" />,// 确认日期
            dataIndex: 'checkDate',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.confirmation-personnel'/>,// 确认人员
            dataIndex: 'checkUser',
            align:'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Reimbursement-status'/>,// 报账单状态
            dataIndex: 'verifyStatus',
            dataType: reimbursStatus.values,
            align:'left',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Tax-coins'/>,// 税金(参考)币种
            dataIndex: 'clearingCcyCde',
            align:'left',
            sorter: false,
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.Total-amount-tax'/>,// 税金(参考)总金额
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 130,
        },
        {
            title: <FormattedMessage id='lbl.generate-package'/>,// 是否生成数据包
            dataIndex: 'packageFlag',
            dataType: packageFlag.values,
            align:'left',
            sorter: false,
            width: 110,
        },
        {
            title: <FormattedMessage id='lbl.Generating-packets'/>,// 生成数据包的批次
            // dataIndex: 'packageProcessIdRepeat',
            dataIndex: 'packageProcessId',
            align:'left',
            sorter: false,
            width: 120,
        },
    ]
    {/* 明细列表 */}
    const detailColumn=[
        {
            title: <FormattedMessage id='lbl.state' />,// 状态
            dataIndex: 'listVerifyStatus',
            dataType: reimbursStatus.values,
            align:'left',
            width: 45
        },{
            title: <FormattedMessage id='lbl.Return-flag' />,// 退回标志位
            dataType:checkStatus.values,
            dataIndex: 'checkStatus',
            align:'left',
            width: 90
        },{
            title: <FormattedMessage id='lbl.argue.bizDate' />,// 业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.generation-date'/>,// 生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDate',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Big-class-fee'/>,// 费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Small-class-fee'/>,// 费用小类
            dataIndex: 'feeType',
            dataType: feeCategory,
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Trade-line'/>,// 贸易线
            dataIndex: 'tradeLaneCode',
            align:'left',
            width: 60
        },{
            title: <FormattedMessage id='lbl.SVVD' />,// SVVD
            dataIndex: 'svvdId',
            align:'left',
            width: 60
        },{
            title: <FormattedMessage id='lbl.port'/>,// 港口
            dataIndex: 'portCode',
            align:'left',
            width: 45
        },{
            title: <FormattedMessage id='lbl.version-number'/>,// 版本号
            dataIndex: 'versionNum',
            align:'left',
            width: 60
        },{
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id= 'lbl.Agreement-currency-amount'/>,// 协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            align:'right',
            width: 90
        },{
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmount',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id= 'lbl.Whether-the-price-includes-tax'/>,// 是否含税价
            dataIndex: 'vatFlag',
            dataType: priceIncludingTax.values,
            align:'left',
            width: 90
        },{
            title: <FormattedMessage id= 'lbl.Agreement-currency-tax-reference'/>,// 协议币税金(参考)
            dataIndex: 'vatAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference'/>,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },{
            title: <FormattedMessage id='lbl.Standard-currency' />,// 本位币种
            dataIndex: 'agencyCurrency',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Amount-in-base-currency'/>,// 本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyAmount',
            align:'right',
            width: 90
        },{
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency'/>,// 本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyReviseAmount',
            align:'right',
            width: 110
        },{
            title: <FormattedMessage id='lbl.Tax-in-local-currency'/>,// 本位币税金(参考)
            dataIndex: 'vatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency'/>,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },{
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'cleaningCurrencyCode',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.amount-of-settlement-currency'/>,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'cleaningAmount',
            align:'right',
            width: 90
        },{
            title: <FormattedMessage id= 'lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency'/>,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },{
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseCleaningAmount',
            align:'right',
            width: 120
        },
    ]
    {/* 明细列表-汇总 */}
    const detailColumns=[
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            width: 80
        },{
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataType: 'dataAmount',
            dataIndex: 'rateSumAmount',
            align:'right',
            width: 90
        },{
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'rateSumReviseAmount',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.Agreement-currency-tax-reference'/>,// 协议币税金(参考)
            dataIndex: 'sumVatAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },{
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference'/>,// 协议币调整税金(参考)
            dataIndex: 'sumVatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },{
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets'/>,// 应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'sumPaymentAmount',
            align:'right',
            width: 100
        },{
            title: <FormattedMessage id= 'lbl.Agency-net-income'/>,// 代理净收入
            dataType: 'dataAmount',
            dataIndex: 'sumRecAmount',
            align:'right',
            sorter: false,
            width: 90
        },{
            title: <FormattedMessage id='lbl.submitanexpenseaccount'/>,// 向谁报账
            dataIndex: 'sfSide',
            align:'left',
            sorter: false,
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Standard-currency'/>,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            align:'left',
            sorter: false,
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Amount-in-base-currency'/>,// 本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencySumAmount',
            align:'right',
            sorter: false,
            width: 90
        },{
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency'/>,// 本位币调整金额
            dataIndex: 'agencySumReviseAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120
        },{
            title: <FormattedMessage id= 'lbl.Tax-in-local-currency'/>,// 本位币税金(参考)
            dataIndex: 'sumVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency'/>,// 本位币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },{
            title: <FormattedMessage id= 'lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 80,
        },{
            title: <FormattedMessage id=  'lbl.amount-of-settlement-currency' />,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumAmount',
            align:'right',
            sorter: false,
            width: 90
        },{
            title: <FormattedMessage id= 'lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumReviseAmount',
            align:'right',
            sorter: false,
            width: 120
        },{
            title: <FormattedMessage id='lbl.tax-in-settlement-currency'/>,// 结算币税金(参考)
            dataIndex: 'sumVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id= 'lbl.tax-adjustment-in-settlement-currency'/>,// 结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 140,
        },
    ]
    {/* 查询 */}
    const pageChange= async (pagination,search) => {
        let queryData = queryForm.getFieldValue();
        Toast('', '', '', 5000, false);
        setTableData([])
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        if(!queryData.agencyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.sfListCode && !queryData.checkDate && !queryData.generateDate){
            Toast('',intl.formatMessage({id:'lbl.pay-reimbur'}), 'alert-error', 5000, false)
            setSpinflag(false);
            setBackFlag(false);
        }else{
            setSpinflag(true);
            setBackFlag(true);
            const result = await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_SEARCH_IN_PROCESS_BILL_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        ...queryData,
                        "searchStatus": "N" ,
                        checkDateFrom: queryData.checkDate?momentFormat(queryData.checkDate[0]):null,
                        checkDateTo: queryData.checkDate?momentFormat(queryData.checkDate[1]):null,
                        generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                        generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                    },
                    operateType: "AFCM-AG-CR-004"
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                if(datas!=null){
                    datas.map((v,i)=>{
                        v.checkDate ? v["checkDate"] = v.checkDate.substring(0, 10) : null;
                        v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                        // v.packageProcessId ? v['packageProcessIdRepeat'] = packageProcessId : v['packageProcessIdRepeat'] = '0'
                        v.packageProcessId ? v['packageProcessId'] = packageProcessId : v['packageProcessId'] = '0'
                    })
                }
                setPage({...pagination})
                setTabTotal(data.totalCount)
                setTableData([...datas])
            }else {
                setTableData([])
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
        setBackFlag1(true);
        setTableData([])
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }
    {/* 关闭弹窗 */}
    const handleCancel = () => {
        setIsModalVisible(false)
    }
    {/* 双击获取明细弹窗 */}
    const doubleClickRow = async(parameter) => {
        Toast('', '', '', 5000, false);
        page1.current=1
        page1.pageSize=10
        setSpinflag(true);
        setUuid(parameter.sfListUuid)
        setHeaderTitle(parameter.sfListCode);   // 头标题
        const result = await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_SEARCH_CR_RECEIPT_DETAIL,{
            method:"POST",
            data:{
                page:{
                    pageSize: page.pageSize,
                    current: page.current,
                },
                uuid: parameter.sfListUuid,
            }
        })
        if(result.success) {
            setIsModalVisible(true);
            setSpinflag(false);
            Toast('', result.message, 'alert-success', 5000, false)
            let data = result.data;
            let headData = data.headData
            let list = data.list;
            let summaryList = data.summaryList;
            if(summaryList!=null){
                summaryList.map((v,i)=>{
                    v.keyId=i
                })
            }
            if(reimbursStatus.values!=null){
                reimbursStatus.values.map((v, i) => {
                    headData.verifyStatus == v.value ? headData.verifyStatus = v.label : null;
                })
            }
            queryForm.setFieldsValue({           //明细-头部信息
                popData: {
                    companyCode: headData.companyCode,
                    verifyStatus: headData.verifyStatus,
                    packageProcessId: headData.packageProcessId ? headData.packageProcessId : '0',
                    generateDate: headData.generateDate ? headData.generateDate.substring(0, 10) : null,
                    generateUser: headData.generateUser,
                    sfListCode: headData.sfListCode,
                    checkDate: headData.checkDate ? headData.checkDate.substring(0, 10) : null,
                    checkUser: headData.checkUser,
                    tmpSfListCode: headData.tmpSfListCode,
                    vatAmt:  parameter.vatAmt,
                    clearingCcyCde: parameter.clearingCcyCde,
                }
            })  
            setTabDetailTotal(data.totalCount)
            setDetailData(list);                 //明细-列表信息
            setDetailDatas(summaryList);         //明细-列表信息汇总
        }else{
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 分页查询 */}
    const searchPage = async(pagination) => {
        Toast('', '', '', 5000, false);
        if(pagination.pageSize!=page1.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result = await request($apiUrl.AGENCY_FEE_CARRY_FORWARD_PAY_EXPENSES_SEARCH_CR_RECEIPT_DETAIL,{
            method:"POST",
            data:{
                page: pagination,
                uuid: uuid,
            }
        })
        if(result.success) {
            setSpinflag(false);
            let data = result.data;
            let list = data.list;
            let summaryList = data.summaryList;
            setPage1({...pagination})
            setTabDetailTotal(data.totalCount)
            setDetailData(list);                 //明细-列表信息
            setDetailDatas(summaryList);         //明细-列表信息汇总
        }else{
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setSpinflag(true);
        if(!queryData.sfListCode && !queryData.checkDate && !queryData.generateDate){
            Toast('',intl.formatMessage({id:'lbl.pay-reimbur'}), 'alert-error', 5000, false)
            setBackFlag(false);
            return
        }
        setBackFlag(true);
        const result = await request($apiUrl.AGENCY_FEE_PAY_BILL_PEND_SETTLEMENT_DOWNLOAD,{
            method:"POST",
            data:{
                page:{
                    pageSize:0,
                    current:0
                },
                params: {
                    ...queryData,
                    "searchStatus": "N" ,
                    checkDateFrom: queryData.checkDate?momentFormat(queryData.checkDate[0]):null,
                    checkDateTo: queryData.checkDate?momentFormat(queryData.checkDate[1]):null,
                    generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                    generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                },
                operateType: "AFCM-AG-CR-004",
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryReimbur'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                        companyCode: intl.formatMessage({id: "lbl.company"}),
                        sfListCode: intl.formatMessage({id: "lbl.Reimbursement-number"}),
                        tmpSfListCode: intl.formatMessage({id: "lbl.provisional-reimbursement-no"}),
                        documentNumber: intl.formatMessage({id: "lbl.voucher-number"}),
                        generateDate: intl.formatMessage({id: "lbl.Reimbursement-date"}),
                        generateUser: intl.formatMessage({id: "lbl.Reimbursement-personnel"}),
                        checkDate: intl.formatMessage({id: "lbl.confirmation-date"}),
                        checkUser: intl.formatMessage({id: "lbl.confirmation-personnel"}),
                        verifyStatus: intl.formatMessage({id: "lbl.Reimbursement-status"}),
                        clearingCcyCde: intl.formatMessage({id: "lbl.Tax-coins"}),
                        vatAmt: intl.formatMessage({id: "lbl.Total-amount-tax"}),
                        packageFlag: intl.formatMessage({id: "lbl.generate-package"}),
                        packageProcessId: intl.formatMessage({id: "lbl.Generating-packets"}),
                    },
                    sumCol: {//汇总字段

                    }, 
                    sheetName: intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryReimbur'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryReimbur'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryReimbur'})+ '.xlsx'; // 下载后文件名
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
        const result = await request($apiUrl.AGENCY_FEE_PAY_BILL_PEND_SETTLEMENT_DETAIL_DOWNLOAD,{
            method:"POST",
            data:{
                page: {
                    pageSize: 0,
                    current: 0
                },
                uuid: uuid,
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryReimbur'}), //文件名
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
                            listVerifyStatus: intl.formatMessage({id: "lbl.state"}),
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.carryFwdPay.queryReimbur'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
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
            <div className='header-from'>
                <Form 
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery}
                >
                    <Row>
                        {/* 船东 */}
                        <Select span={6} name='soCompanyCode'  disabled={company.companyType == 0 ? true : false}  label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} formlayouts={formlayouts}/>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={backFlag1} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <Select showSearch={true} name='agencyCode'styleFlag={backFlag1}  options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                        }
                        {/* <Select name='agencyCode'  showSearch={true} label={<FormattedMessage id='lbl.agency'/>} span={6} options={agencyCode}  />   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={feeClass} formlayouts={formlayouts}/> 
                        {/* 临时报账单号码 */}
                        <InputText name='tmpSfListCode' label={<FormattedMessage id='lbl.provisional-reimbursement-no'/>} span={6} formlayouts={formlayouts}/> 
                        {/* 确认日期 */}
                        <DoubleDatePicker span={6} flag={false} name='checkDate' style={{background:backFlag?'white':'yellow'}}  disabled={[false, false]} label={<FormattedMessage id="lbl.confirmation-date" />} span={6}  formlayouts={formlayouts}/>
                        {/* 报账日期 */}
                        <DoubleDatePicker span={6} flag={false} name='generateDate' style={{background:backFlag?'white':'yellow'}}  disabled={[false, false]} label={<FormattedMessage id="lbl.Reimbursement-date" />} span={6}  formlayouts={formlayouts}/>
                        {/* 报账单号码 */}
                        <InputText name='sfListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number'/>}  span={6} formlayouts={formlayouts}/>  
                        {/* 是否生成数据包 */}
                        <Select name='packageFlag' flag={true} label={<FormattedMessage id='lbl.generate-package'/>}  span={6} options={packageFlag.values} formlayouts={formlayouts}/>
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6} formlayouts={formlayouts}/> 
                        {/* 报账单状态 */}
                        <Select name='verifyStatus' flag={true} label={<FormattedMessage id='lbl.Reimbursement-status'/>}  span={6} options={reimbursStatus.values} formlayouts={formlayouts}/> 
                        {/* SVVD */}
                        <InputText name='svvd' label={<FormattedMessage id='lbl.SVVD'/>} span={6} formlayouts={formlayouts}/> 
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
                    {/* 查询 */}
                    <Button onClick={()=> pageChange(page,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='sfListUuid'
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
            {/* 报账单明细弹窗 */}
            {/* <Modal title={headerTitle + intl.formatMessage({id:'lbl.Reimbursement-details'})} visible={isModalVisible} footer={null} width="65%" height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={900} cbsVisible={isModalVisible} cbsTitle={headerTitle + intl.formatMessage({id:'lbl.Reimbursement-details'})} cbsFun={() => handleCancel()}>
                <div className='header-from'>
                    <Form 
                        form={queryForm}
                        name='func'
                        onFinish={handleQuery}
                    >
                        <Row>
                            {/* 公司 */}
                            <InputText disabled name={['popData','companyCode']} label={<FormattedMessage id='lbl.company'/>} span={8} isSpan={true}/>  
                            {/* 状态 */}
                            <InputText disabled name={['popData','verifyStatus']} label={<FormattedMessage id='lbl.state'/>} span={8} isSpan={true}/> 
                            {/* 生成数据包的批次 */}
                            <InputText disabled name={['popData','packageProcessId']} label={<FormattedMessage id='lbl.Generating-packets'/>} span={8} isSpan={true}/> 
                            {/* 生成日期 */}
                            <InputText disabled name={['popData','generateDate']} label={<FormattedMessage id="lbl.generation-date"/>} span={8} isSpan={true}/>  
                            {/* 生成人员 */}
                            <InputText disabled name={['popData','generateUser']} label={<FormattedMessage id='lbl.Generation-personnel'/>} span={8} isSpan={true}/>  
                            {/* 报账单号码 */}
                            <InputText disabled name={['popData','sfListCode']} label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={8} isSpan={true}/>  
                            {/* 确认日期 */}
                            <InputText disabled name={['popData','checkDate']} label={<FormattedMessage id="lbl.confirmation-date"/>} span={8} isSpan={true}/>  
                            {/* 确认人员 */}
                            <InputText disabled name={['popData','checkUser']} label={<FormattedMessage id='lbl.confirmation-personnel'/>} span={8} isSpan={true}/>  
                            {/* 临时报账单号码 */}
                            <InputText disabled name={['popData','tmpSfListCode']} label={<FormattedMessage id='lbl.provisional-reimbursement-no'/>} span={8} isSpan={true}/>  
                            {/* 税金(参考)总金额 */}
                            <InputText disabled name={['popData','vatAmt']} label={<FormattedMessage id='lbl.Total-amount-tax'/>} span={8} isSpan={true}/>  
                            {/* 税金(参考)币种 */}
                            <InputText disabled name={['popData','clearingCcyCde']} label={<FormattedMessage id='lbl.Tax-coins'/>} span={8} isSpan={true}/>  
                        </Row>
                    </Form>
                </div>
                <div className='footer-table' style={{marginTop:'5px'}}>
                    {/* 表格 */}
                    <PaginationTable
                        dataSource={detailData}
                        columns={detailColumn}
                        rowKey='entryUuid'
                        pageChange={searchPage}
                        pageSize={page1.pageSize}
                        current={page1.current}
                        scrollHeightMinus={200}
                        total={tabDetailTotal}
                        rowSelection={null}
                    />
                </div>
                <div className='footer-table' style={{marginTop:'10px'}}>
                    <PaginationTable
                        dataSource={detailDatas}
                        columns={detailColumns} 
                        rowKey="keyId"
                        pagination={false}
                        rowSelection={null}
                        scrollHeightMinus={200}
                    />
                </div>
                <div className="add-save-button">
                    {/* 下载 */}
                    <Button onClick={downloadDel}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></Button>
                    {/* 关闭 */}
                    <Button onClick={handleCancel} ><CloseOutlined  /><FormattedMessage id='lbl.close' /></Button>
                </div>
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default queryPayReimbursement