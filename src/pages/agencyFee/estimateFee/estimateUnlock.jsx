{/*预估解锁*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi';
import request from '@/utils/request';
import Select from '@/components/Common/Select';
import InputText from '@/components/Common/InputText';
import { acquireSelectData, costCategories, momentFormat, agencyCodeData, acquireSelectDataExtend, } from '@/utils/commonDataInterface';
import { Button, Form, Row, Modal} from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import Loading from '@/components/Common/Loading';
import CosButton from '@/components/Common/CosButton'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    UnlockOutlined , //解锁
} from '@ant-design/icons'

const confirm = Modal.confirm 
let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const estimateUnlock =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData,setTableData] = useState([]) // table数据
    const [tableDatas,setTableDatas] = useState([]) // table数据-汇总
    const [tabTotal,setTabTotal ] = useState([]) // table条数
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用小类
    const [feeCategory,setFeeCategory] = useState ([])
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
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
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
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
                v['label']=v.feeCode+'(' + v.feeName +')';
            })
            setFeeCategory(listAgTypeToClass)
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
            width: 80,
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
            title: <FormattedMessage id="lbl.EOV" />,// EOV
            dataIndex: 'eovStatus',
            align:'left',
            width: 40
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'tradeLaneCode',
            align:'left',
            width: 60
        },
        {
            title: <FormattedMessage id='lbl.profit-center'/>,// 利润中心
            dataIndex: 'profitCenterCode',
            align:'left',
            width: 80,
        },
        {
            title:<FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrency',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
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
            width: 130
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
            width: 130
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-agreement-currency-reference' />,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmt',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets' />,// 应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'paymentAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.AP-outlets' />,// 应付网点
            dataIndex: 'customerSAPId',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Agency-net-income' />,// 代理净收入
            dataType: 'dataAmount',
            dataIndex: 'recAmount',
            align:'right',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.estimate' />,// 向谁预估
            dataIndex: 'ygSide',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id= 'lbl.Standard-currency' />,// 本位币种
            dataIndex: 'agencyCurrency',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id= 'lbl.Amount-in-base-currency' />,// 本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyAmount',
            align:'right',
            width: 90
        },
        {
            title: <FormattedMessage id= 'lbl.Adjustment-amount-in-base-currency' />,// 本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencyCurrencyReviseAmount',
            align:'right',
            width: 130
        },
        {
            title: <FormattedMessage id='lbl.Tax-in-local-currency' />,// 本位币税金(参考)
            dataIndex: 'vatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 130
        },
        {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency' />,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmtInAgency',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'cleaningCurrencyCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'cleaningAmount',
            align:'right',
            width: 90
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseCleaningAmount',
            align:'right',
            width: 130
        },
        {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency' />,//结算币税金(参考)
            dataIndex: 'vatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 130
        },
        {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency'/>,//结算币调整税金(参考)
            dataIndex: 'reviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 140
        },
        {
            title: <FormattedMessage id='lbl.within-boundary'/>,//是否边界内
            dataIndex: 'exFlag',
            dataType: withinBoundary.values,
            align:'left',
            width: 90,
        },
    ]
    {/* 列表 */}
    const columnsdata = [
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left', 
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumReviseAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)
            dataIndex: 'sumVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            dataType: 'dataAmount',
            align:'right',
            width: 120
        }
    ]
    {/* 选中解锁 */} 
    const unlockingSelectBtn = async() =>{
        console.log(tableData)
        Toast('', '', '', 5000, false);
        if(searchFlag==false){
            Toast('', intl.formatMessage({id: 'lbl.Unclock-info'}), 'alert-error', 5000, false);
            return
        }else if(checkedRow.length<1){
            Toast('', intl.formatMessage({id: 'lbl.Unclock-tips'}), 'alert-error', 5000, false);
            return
        }else{
            let params = checkedRow.map((item,index)=>{
                return {entryUuid:item.entryUuid}
            })
            const confirmModal = confirm({
                title: intl.formatMessage({id: 'lbl.unlock'}),
                content: intl.formatMessage({id: 'lbl.comm-all-unlock'}),
                okText: intl.formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    let result= await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_CHOICE_UNLOCKING,{
                        method:"POST",
                        data:{
                            "paramsList": params
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
    {/* 全部解锁 */}
    const unlockingAllBtn = async() =>{
        Toast('', '', '', 5000, false);
        if(searchFlag==false){
            Toast('', intl.formatMessage({id: 'lbl.Unclock-all-info'}), 'alert-error', 5000, false);
            return;
        }else{
            let queryData = queryForm.getFieldValue();
            Toast('', '', '', 5000, false);
            const confirmModal = confirm({
                title: intl.formatMessage({id: 'lbl.unlock'}),
                content: intl.formatMessage({id: 'lbl.comm-select-unlock'}),
                okText: intl.formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    let result= await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_CHOICE_ALL_UNLOCKING,{
                        method:"POST",
                        data:{
                            "params": {
                                // ...queryData,
                                soCompanyCode: queryData.soCompanyCode,
                                agencyCode: queryData.agencyCode,
                                feeClass: queryData.feeClass,
                                feeType: queryData.feeType,
                                serviceLoopCode: queryData.serviceLoopCode,
                                svvd: queryData.svvd,
                                portCode: queryData.portCode,
                                exFlag: queryData.exFlag,
                                generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                                generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                            }
                        }
                    })
                    if(result.success){
                        setSpinflag(false);
                        setTableData([]);
                        setTableDatas([]);
                        Toast('', result.message, 'alert-success', 5000, false);
                    }else {
                        setSpinflag(false);
                        Toast('',result.errorMessage, 'alert-error', 5000, false)
                    }
                }
            })    
        }
    }

    {/* 下载 */} 
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_UNLOCK_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    soCompanyCode: queryData.soCompanyCode,
                    agencyCode: queryData.agencyCode,
                    feeClass: queryData.feeClass,
                    feeType: queryData.feeType,
                    serviceLoopCode: queryData.serviceLoopCode,
                    svvd: queryData.svvd,
                    portCode: queryData.portCode,
                    exFlag: queryData.exFlag,
                    "lockedInd":"L"  ,
                    "verifyStatus":"Z"  ,
                    "searchStatus":"Y"  ,
                    generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                    generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.unlock'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                        generateDate: intl.formatMessage({id: "lbl.generation-date"}),
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                        feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                        svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                        portCode: intl.formatMessage({id: "lbl.port"}),
                        eovStatus: intl.formatMessage({id: "lbl.EOV"}),
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
                        reviseVatAmtInAgency:intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}),
                        cleaningCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                        cleaningAmount: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                        reviseCleaningAmount: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                        vatAmtInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),
                        reviseVatAmtInClearing: intl.formatMessage({id: 'lbl.tax-adjustment-in-settlement-currency'}),
                        exFlag: intl.formatMessage({id: 'lbl.within-boundary'}),          
                    },
                    sumCol: {//汇总字段
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                        clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                        clearingSumAmount: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                        clearingSumReviseAmount: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                        sumVatAmtInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),
                        sumReviseVatAmtInClearing: intl.formatMessage({id: 'lbl.tax-adjustment-in-settlement-currency'}),
                    },
                    sheetName: intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.unlock'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.unlock'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.estimateFee.unlock'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setTableData([]);
        setTableDatas([]);
        setChecked([]);
        setCheckedRow([]);
        setFeeType([]);
        setSearchFlag(false);
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }
    {/* 查询 */}
    const pageChange = async (pagination,search) => {
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
            const result = await request($apiUrl.AGENCY_FEE_ESTIMATE_FEE_SEARCH_UNLOCK_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        // ...queryData,
                        soCompanyCode: queryData.soCompanyCode,
                        agencyCode: queryData.agencyCode,
                        feeClass: queryData.feeClass,
                        feeType: queryData.feeType,
                        serviceLoopCode: queryData.serviceLoopCode,
                        svvd: queryData.svvd,
                        portCode: queryData.portCode,
                        exFlag: queryData.exFlag,
                        "lockedInd":"L"  ,
                        "verifyStatus":"Z"  ,
                        "searchStatus":"Y"  ,
                        generateDateFrom: queryData.generateDate?momentFormat(queryData.generateDate[0]):null,
                        generateDateTo: queryData.generateDate?momentFormat(queryData.generateDate[1]):null,
                    }
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                let sumList=result.data.sumList
                if(sumList!=null){
                    sumList.map((v,i)=>{
                        v.id=i
                    })
                }
                setSearchData(datas)
                if(datas!=null){
                    datas.map((v,i)=>{
                        v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                        v.generateDate ? v["generateDate"] = v.generateDate.substring(0, 10) : null;
                    })
                }
                setSearchFlag(true)
                setPage({...pagination})
                setTabTotal(data.totalCount)
                setTableData([...datas])
                setTableDatas([...sumList])
                setSelectedRowKeys([...datas])
            }else {
                setSpinflag(false);
                setTableData([])
                setTableDatas([])
                Toast('',result.errorMessage, 'alert-error', 5000, false)
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
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <Select showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                        }
                        {/* <Select name='agencyCode' showSearch={true} label={<FormattedMessage id='lbl.agency'/>} span={6} options={agencyCode} />  */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} selectChange={getCommonSelectVal} options={feeClass} formlayouts={formlayouts}/> 
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={feeType} formlayouts={formlayouts}/>
                        {/* 生成日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate' label={<FormattedMessage id="lbl.generation-date" />} span={6}  formlayouts={formlayouts}/> 
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>} span={6} formlayouts={formlayouts}/>  
                        {/* SVVD */}
                        <InputText name='svvd' label={<FormattedMessage id='lbl.SVVD'/>} span={6} formlayouts={formlayouts}/> 
                        {/* 港口 */}
                        <InputText name='portCode'  label={<FormattedMessage id='lbl.port'/>} span={6} formlayouts={formlayouts}/>  
                        {/* 是否边界内 */}
                        <Select name='exFlag' flag={true} label={<FormattedMessage id='lbl.within-boundary'/>}  span={6} options={withinBoundary.values} formlayouts={formlayouts}/> 
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 选中解锁 */}
                    <CosButton onClick={unlockingSelectBtn} auth='AFCM-AG-ER-001-B02'> <UnlockOutlined  /><FormattedMessage id='btn.select-unlock' /></CosButton>
                    {/* 全部解锁 */}
                    <CosButton onClick={unlockingAllBtn} auth='AFCM-AG-ER-001-B03'> <UnlockOutlined  /><FormattedMessage id='btn.all-unlock' /></CosButton>
                    {/* 下载按钮 */}
                    <Button onClick={downloadBtn}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className='button-right'>
                    {/* 清除按钮 */}
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
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
                    total={tabTotal}
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
            <div className='footer-table' style={{marginTop:'10px'}}>
                <div style={{width: '70%'}}>
                    <PaginationTable
                        rowKey="id"
                        columns={columnsdata} 
                        dataSource={tableDatas}
                        pagination={false}
                        rowSelection={null}
                        scrollHeightMinus={200}
                    />
                </div>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default estimateUnlock