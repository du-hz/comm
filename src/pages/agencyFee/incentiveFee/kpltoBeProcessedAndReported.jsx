import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage, formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas, agencyCodeData, momentFormat, acquireSelectDataExtend} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tabs} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import DatePicker from '@/components/Common/DatePicker'
import SelectVal from '@/components/Common/Select';
import { Toast } from '@/utils/Toast'
import moment from 'moment';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    FileProtectOutlined,
    FileExclamationOutlined,
    ImportOutlined
} from '@ant-design/icons'

//---------------------------------------------- KPI待处理报账单-------------------------------------------------
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
    const [tabTabTotal,setTabTotal ] = useState([])//表格数据条数
    const [auditStatus, setAuditStatus] = useState({}); // 审核状态
    const [uuidData, setUuidData] = useState('');   // uuid  
    const [checked, setChecked] = useState([]); //选择
    const [tableDataDetailed,setTableDataDetailed] = useState([]);//明细数据
    const [tabTotalDetailed,setTabTotalDetailed] = useState([]);//明细数据总条数
    const [businessThrough,setBusinessThrough] = useState(true) // 业务审核通过  
    const [businessBack,setBusinessBack] = useState(true) // 业务审核退回
    const [financeThrough,setFinanceThrough] = useState(true) // 财务审核通过 
    const [financeBack,setFinanceBack] = useState(true) // 财务审核退回
    const [cancel,setCancel] = useState(true) // 取消报账单  
    const [tableFlag,setTableFlag] = useState(true) // 明细表格选择是否禁用
    const [postStatus,setPostStatus] = useState({})//记账状态
    const [defaultKey, setDefaultKey] = useState('1');
    const [spinflag,setSpinflag] = useState(false)
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [parameter,setParameter] = useState([]) //双击数据
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [pageDetailed,setPageDetailed]=useState({
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
    }, [company, acquireData])

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDatas('AG.OFFCR.POSTSTATUS', setPostStatus, $apiUrl);// 记账状态
        acquireSelectDatas('AG.OFFCR.VERIFYSTATUS', setAuditStatus, $apiUrl);// 审核状态
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
    },[])

  
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
    }

    //KPI待处理报账单表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,//报账单号码
            dataIndex: 'sfListCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.audit-status" />,//审核状态
            dataIndex: 'verifyStatus',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.State-of-charge-to-an-account" />,//记账状态
            dataType:postStatus,
            dataIndex: 'postStatus',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.Generation-personnel" />,//生成人员
            dataIndex: 'generateUser',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.audit-date" />,//审核日期 
            dataType: 'dateTime',
            dataIndex: 'checkDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.auditor"/>,//审核人员
            dataIndex: 'checkUser',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.accounting-date" />,//记账日期
            dataType: 'dateTime',
            dataIndex: 'postDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
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
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        }
    ]

    //明细列表
    const columnss=[
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
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
            title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataType: 'dateTime',
            dataIndex: 'activityDate',
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
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            dataIndex: 'reviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额 
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Exchange-Rate-of-Settlement-Currency"/>,//结算币汇率
            dataIndex: 'clerRate',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Settlement-currency-amount" />,//结算币总金额
            dataIndex: 'totalAmountManual',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.version-number" />,//版本号
            dataIndex: 'versionNumber',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]

    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        console.log(pagination,options)
        setTableData([])
        let query = queryForm.getFieldValue();
        search?pagination.current=1:null
        if(!query.agencyCode){
            //代理编码   必须输入
            setAgencyFlag(false)
            Toast('',formatMessage({id: 'lbl.The-proxy-code-must-be-entered'}), 'alert-error', 5000, false)
        }else{
            setAgencyFlag(true)
            if(!query.buildDate&&!query.svvdId&&!query.sfListCode&&!query.checkDate&&!query.tocheckDate&&!query.checkDate&&!query.tocheckDate&&!query.postDate){
                setBackFlag(false)
                //代理编号/报帐单号 /生成日期/确认日期/记帐日期  必须输入一项
                Toast('',formatMessage({id: 'lbl.agency-postDate-must-enter'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_KPL_SEARCH_CR_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            'soCompanyCode': query.soCompanyCode,
                            "agencyCode":query.agencyCode,
                            "sfListCode":query.sfListCode,
                            "postStatus":query.postStatus,
                            'verifyStatus':query.verifyStatus,
                            'buildDateFrom':query.buildDate?momentFormat(query.buildDate[0]):null,
                            'buildDateTo':query.buildDate?momentFormat(query.buildDate[1]):null,
                            'checkDateFrom':query.checkDate?momentFormat(query.checkDate[0]):null,
                            'checkDateTo':query.checkDate?momentFormat(query.checkDate[1]):null,
                            'postDateFrom':query.postDate?momentFormat(query.postDate[0]):null,
                            'postDateTo':query.postDate?momentFormat(query.postDate[1]):null,
                        },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    let data=localsearch.data
                    let datas=data ? data.resultList : null
                    datas ? datas.map((v,i)=>{
                        v['id'] = i
                    }) : null
                    setTabTotal(data.totalCount)
                    datas ? setTableData([...datas]) : null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    setSpinflag(false)
                }else{
                    setSpinflag(false)
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
                }
            }
        }
    }

    // 双击  TF01220A2106IC01
    const doubleClickRow = (parameter) => {
        console.log(parameter)
        setParameter(parameter)
        setDefaultKey('2')
        pageChangeDetailed(pageDetailed,'',parameter)
    }

    const pageChangeDetailed = async(pagination,options,parameterData) =>{
        console.log('parameter',parameter)
        console.log('parameterData',parameterData)
        setSpinflag(true)
        const result = await request($apiUrl.AG_FEE_KPL_SEARCH_CR_DETAIL,{
            method:"POST",
            data:{
                page:pagination,
                params:{
                    sfListCode: parameterData?parameterData.sfListCode:parameter.sfListCode
                }
            }
        })
        console.log(result)
        if(result.success) {
            Toast('', result.message, 'alert-success', 5000, false)
            setSpinflag(false)
            let data = result.data;
            let datas = data.list;
            let headData = data.headData;
            let totalCount = data.totalCount
            console.log('审核状态',headData.verifyStatus)
            datas?datas.map((v,i)=>{
                v['id'] = i
            }):null
            setPageDetailed({...pagination})
            setTableDataDetailed([...datas])
            setTabTotalDetailed(totalCount)
            let checkedUuid = [];
            datas.map((v, i) => {
                let verify = v.verifyStatus.slice(10)
                v['verifyStatus'] = verify
                if(verify == auditStatus.values[0].value) {
                    checkedUuid.push(v.id);
                }
            })
            setChecked(checkedUuid);
            if(headData.verifyStatus == 'SF_VERIFY_W'){//待处理
                setCancel(false);//取消报账单
                setBusinessThrough(true);//业务审核通过
                setBusinessBack(true);//业务审核退回
                setFinanceBack(false);//财务审核退回
                setFinanceThrough(false);//财务审核通过
                setTableFlag(true)
            }else if(headData.verifyStatus == 'SF_VERIFY_C'){//
                setTableFlag(false)
                setCancel(false);//取消报账单
                setBusinessThrough(false);//业务审核通过
                setBusinessBack(false);//业务审核退回
                setFinanceBack(true);//财务审核退回
                setFinanceThrough(true);//财务审核通过
            }else if(headData.verifyStatus == 'SF_VERIFY_Q' || headData.verifyStatus == 'SF_VERIFY_R'){
                setTableFlag(false)
                setBusinessThrough(false);//业务审核通过
                setBusinessBack(false);//业务审核退回 
                setFinanceBack(false);//财务审核退回
                setFinanceThrough(false);//财务审核通过
                setCancel(true);//取消报账单
            }else if(headData.verifyStatus == 'SF_VERIFY_P'){
                setTableFlag(false)
                setBusinessThrough(false);//业务审核通过
                setBusinessBack(false);//业务审核退回 
                setFinanceBack(false);//财务审核退回
                setFinanceThrough(false);//财务审核通过
                setCancel(false);//取消报账单
            }
            postStatus.values?postStatus.values.map((v,i)=>{
                v.value == headData.postStatus ? headData.postStatus = v.label : null
            }):null
            queryForms.setFieldsValue({
                sfListCode: headData.sfListCode,
                agencyCode: headData.agencyCode,
                verifyStatus: headData.verifyStatus,
                postStatus: headData.postStatus,
                generateDate: headData.generateDate ? moment(headData.generateDate) : '',
                generateUser:  headData.generateUser ? headData.generateUser.toUpperCase() : '',
                checkDate: headData.checkDate ? moment(headData.checkDate) : '',
                checkUser: headData.checkUser ? headData.checkUser.toUpperCase() : '',
                postDate: headData.postDate ? moment(headData.postDate) :  moment(Date()),
                totalAmount: headData.totalAmount,
                clearingCurrencyCode: headData.clearingCurrencyCode,
            })
            
        }else{
            setSpinflag(false)
            setTableDataDetailed([])
        }
    }

    //审核
    const business= async (operate)=>{
        Toast('', '', '', 5000, false);
        console.log()
        if(!queryForms.getFieldsValue().postDate){
            // 记账日期必须输入
            Toast('',formatMessage({id: 'postDate-must-enter'}), 'alert-error', 5000, false)
        }else{
            console.log(momentFormat(queryForms.getFieldsValue().postDate))
            setSpinflag(true)
            let business=await request($apiUrl.AG_FEE_KPL_KPLIBUILDOFF,{
                method:'POST',
                data:{
                    'params':{
                        "sfListCode":queryForms.getFieldsValue().sfListCode,
                        "postDate":momentFormat(queryForms.getFieldsValue().postDate),
                    },
                    "paramsList":[...tableDataDetailed],
                    "operateType":operate //处理模式
                }
            })
            console.log(business)
            if(business.success){
                setSpinflag(false)
                Toast('', business.message, 'alert-success', 5000, false)
                setDefaultKey('1')
                setTableDataDetailed([])
                queryForms.resetFields();
                pageChange(page,null,'')
            }else{
                setSpinflag(false)
            }
        }
       
        
    }

     //   选择和状态的联动
     const selectFun = (tableDatas, row) => {
        // console.log(verifyStatus) 
        // console.log(verifyStatuss) 
        //取消
        tableDataDetailed.map((v, i) => {
            let verify = v.verifyStatus.slice(10)
            console.log(auditStatus)
            verify = auditStatus.values[1].value;
            v.verifyStatus = verify
        })
        //确认
        row.map((v, i) => {
            let verify = v.verifyStatus.slice(10)
            verify = auditStatus.values[0].value;
            v.verifyStatus = verify
        })
    }

     //取消报账单
     const CancelBill = async () =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        const save =await request($apiUrl.AG_FEE_KPL_KPICANCEL,{
            method:"POST",
            data:{
                params:{
                    sfListCode:queryForms.getFieldsValue().sfListCode
                }
            }
        })
        console.log(save)
        if(save.success){
            setSpinflag(false)
            Toast('', save.message, 'alert-success', 5000, false)
            setDefaultKey('1')
            setTableDataDetailed([])
            queryForms.resetFields();
            doubleClickRow(parameter)
        }else{
            setSpinflag(false)
        }
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForms.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
        setTableData([])
        setTableDataDetailed([])
        setBackFlag(true)
        setAgencyFlag(true)
        setPage({
            current: 1,
            pageSize: 10
        })
        setPageDetailed({
            current: 1,
            pageSize: 10
        })
    }
    
    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_KPL_EXP_CR_LIST,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    "agencyCode":query.agencyCode,
                    "sfListCode":query.sfListCode,
                    "postStatus":query.postStatus,
                    'verifyStatus':query.verifyStatus,
                    'buildDateFrom':query.buildDate?momentFormat(query.buildDate[0]):null,
                    'buildDateTo':query.buildDate?momentFormat(query.buildDate[1]):null,
                    'checkDateFrom':query.checkDate?momentFormat(query.checkDate[0]):null,
                    'checkDateTo':query.checkDate?momentFormat(query.checkDate[1]):null,
                    'postDateFrom':query.postDate?momentFormat(query.postDate[0]):null,
                    'postDateTo':query.postDate?momentFormat(query.postDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-be-proce-rep'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        sfListCode: formatMessage({id:"lbl.Reimbursement-number" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        verifyStatus: formatMessage({id:"lbl.audit-status" }),
                        postStatus: formatMessage({id:"lbl.State-of-charge-to-an-account" }),
                        generateDate: formatMessage({id:"lbl.generation-date" }),
                        generateUser: formatMessage({id:"lbl.Generation-personnel" }),
                        checkDate: formatMessage({id:"lbl.audit-date" }),
                        checkUser: formatMessage({id:"lbl.auditor" }),
                        postDate: formatMessage({id:"lbl.accounting-date" }),
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        totalAmount: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-be-proce-rep'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-be-proce-rep'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-be-proce-rep'}) ; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
     //下载
    const downlodDetail = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        let downData = await request($apiUrl.AG_FEE_KPL_EXP_CR_DETAIL,{
            method:"POST",
            data:{
                "params":{
                    sfListCode: parameter.sfListCode
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-be-proce-rep'}),
                sheetList: [
                    {//sheetList列表
                        dataHead:{
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            sfListCode: formatMessage({id:"lbl.Reimbursement-number" }),
                            verifyStatus: formatMessage({id:"lbl.audit-status" }),
                            postStatus: formatMessage({id:"lbl.State-of-charge-to-an-account" }),
                            totalAmount: formatMessage({id:"lbl.settlement-currency" }),
                            generateDate: formatMessage({id:"lbl.generation-date" }),
                            generateUser: formatMessage({id:"lbl.Generation-personnel" }),
                            checkDate: formatMessage({id:"lbl.audit-date" }),
                            checkUser: formatMessage({id:"lbl.auditor" }),
                            postDate: formatMessage({id:"lbl.accounting-date" }),
                            totalAmount: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                        },
                        dataCol: {//列表字段
                        },
                        sumCol: {//汇总字段
                        
                        },
                    'sheetName':formatMessage({id:'lbl.afcm-0024'}),
                },
                {//sheetList列表
                    dataHead:{
                    },
                    dataCol: {//列表字段
                        svvdId: formatMessage({id:"lbl.SVVD" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        activityDate: formatMessage({id:"lbl.argue.biz-date" }),
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        rateCurrencyCode: formatMessage({id:"lbl.Agreement-currency" }),
                        reviseAmount: formatMessage({id:"lbl.Agreement-currency-adjustment-amount" }),
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        totalAmount: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                        clerRate: formatMessage({id:"lbl.Exchange-Rate-of-Settlement-Currency" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        feeType: formatMessage({id:"lbl.Small-class-fee" }),
                        companyCode: formatMessage({id:"lbl.company" }),
                        totalAmountManual: formatMessage({id:"lbl.Settlement-currency-amount" }),
                        versionNumber: formatMessage({id:"lbl.version-number" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'lbl.afcm-0023'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-be-proce-rep'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-be-proce-rep'}); // 下载后文件名
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
            <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                {/* 代理费列表 */}
                <TabPane tab={<FormattedMessage id='lbl.List-agency' />} key="1">
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
                                    company.companyType == 0 ? <InputText styleFlag={agencyFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} style={{background: agencyFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                                }
                                {/* 报账单号码 */}
                                <InputText name='sfListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number'/>}   span={6}/>  
                                {/* 生成日期 */}
                                <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='buildDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                                {/* 审核日期 */}
                                <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='checkDate' label={<FormattedMessage id='lbl.audit-date'/>}   />
                                {/* 记账日期 */}
                                <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='postDate' label={<FormattedMessage id='lbl.accounting-date'/>}   />
                                {/* 审核状态 */}
                                <Select name='verifyStatus' flag={true}    label={<FormattedMessage id='lbl.audit-status'/>}  span={6} options={auditStatus.values} />
                                {/* 记账状态 */}
                                <Select name='postStatus' flag={true} label={<FormattedMessage id='lbl.State-of-charge-to-an-account'/>} span={6} options={postStatus.values} />  
                            </Row>
                        </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 下载报账单 */}
                            <CosButton onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/><FormattedMessage id='lbl.Download-the-bill-aff'/></CosButton>
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
                            total={tabTabTotal}
                            rowSelection={null}
                            handleDoubleClickRow={doubleClickRow}
                            selectWithClickRow={true}
                        />
                    </div>
                </TabPane>
                {/* 明细信息 */}
                <TabPane tab={<FormattedMessage id='lbl.Detailed-information' />} key="2">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForms}
                            name='func'
                            onFinish={handleQuery} 
                        >
                            <Row>
                                {/* 报账单号码 */}
                                <InputText name='sfListCode' disabled={true}  label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>
                                {/* 代理编码 */} 
                                <InputText name='agencyCode' disabled={true}  label={<FormattedMessage id='lbl.agency'/>} span={6}/>
                                {/* 审核状态 */}
                                <InputText name='verifyStatus' disabled={true}  label={<FormattedMessage id='lbl.audit-status'/>} span={6}/>
                                {/* 记账状态 */}
                                <InputText name='postStatus' disabled={true}  label={<FormattedMessage id='lbl.State-of-charge-to-an-account'/>} span={6}/>
                                {/* 生成日期 */}
                                <DatePicker span={6} disabled={[true, true]} name='generateDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                                {/* 生成人员 */}
                                <InputText name='generateUser' disabled={true} label={<FormattedMessage id='lbl.Generation-personnel'/>} span={6}/>
                                {/* 审核日期 */}
                                <DatePicker span={6} disabled={[true, true]} name='checkDate' label={<FormattedMessage id='lbl.audit-date'/>}   />
                                {/* 审核人员 */}
                                <InputText name='checkUser'  disabled={true} label={<FormattedMessage id='lbl.auditor'/>} span={6}/>
                                {/* 记账日期 */}
                                <DatePicker span={6} disabled={[true, true]} name='postDate' label={<FormattedMessage id='lbl.accounting-date'/>}   />
                                {/* 结算币调整金额 */}
                                <InputText name='totalAmount' disabled={true}  label={<FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>} span={6}/>
                                {/* 结算币种 */}
                                <InputText name='clearingCurrencyCode' disabled={true}  label={<FormattedMessage id='lbl.settlement-currency'/>} span={6}/>
                            </Row>
                        </Form> 
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/> </Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'  style={{margin:'0px 1px',width:'90%'}}>
                            {/* 业务审核通过 */}
                            <CosButton onClick={()=>{business('C')} } disabled={businessThrough?false:true} auth='AFCM-AG-KPI-003-B01' ><FileProtectOutlined /><FormattedMessage id='lbl.Passed-the-business-audit'/></CosButton>
                            {/* 业务审核退回 */}
                            <CosButton onClick={()=>{business('Q')} } disabled={businessBack?false:true} auth='AFCM-AG-KPI-003-B02' ><ImportOutlined /><FormattedMessage id='lbl.Business-review-return'/></CosButton>
                            {/* 财务审核通过 */}
                            <CosButton onClick={()=>{business('P')} } disabled={financeThrough?false:true} auth='AFCM-AG-KPI-003-B03' ><FileProtectOutlined /><FormattedMessage id='lbl.Passed-financial-audit'/></CosButton>
                            {/* 财务审核退回 */}
                            <CosButton onClick={()=>{business('R')} } disabled={financeBack?false:true} auth='AFCM-AG-KPI-003-B04' ><ImportOutlined /><FormattedMessage id='lbl.Financial-audit-return'/></CosButton>
                            {/* 取消账单 */}
                            <CosButton onClick={CancelBill} disabled={cancel?false:true} auth='AFCM-AG-KPI-003-B05' ><FileExclamationOutlined /><FormattedMessage id='lbl.Cancel-the-bill'/></CosButton>
                            {/* 下载 */}
                            <Button onClick={downlodDetail}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                        </div>
                        <div className='button-right'  style={{width:'10%'}}>
                        </div>
                    </div>
                    <div className='footer-table'>
                            <PaginationTable
                                dataSource={tableDataDetailed}
                                columns={columnss}
                                rowKey='id'
                                pageChange={pageChangeDetailed}
                                pageSize={pageDetailed.pageSize}
                                current={pageDetailed.current}
                                scrollHeightMinus={200}
                                total={tabTotalDetailed}
                                rowSelection={
                                    tableFlag?{
                                        selectedRowKeys:checked,
                                        onChange:(key, row)=>{
                                            setChecked(key);
                                            setUuidData(row);
                                            selectFun(tableDataDetailed, row);
                                        }
                                    }:null
                                }
                            />
                        </div>
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol