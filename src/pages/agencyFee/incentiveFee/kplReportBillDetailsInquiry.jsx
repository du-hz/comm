import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas, agencyCodeData, costCategories, acquireSelectDataExtend, momentFormat} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tabs} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'


//---------------------------------------------- KPI报账单明细查询-------------------------------------------------
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//
    const [costKey, setCostKey] = useState([]);    // 费用大类
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [spinflag,setSpinflag] = useState(false)
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [postStatus,setPostStatus] = useState({})//记账状态
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
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
        // acquireSelectDatas('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
    },[])
   
    //KPI报账单明细查询表格文本 
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
            title: <FormattedMessage id="lbl.audit-status" />,//审核状态
            dataIndex: 'verifyStatus',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
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
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.version-number" />,//版本号
            dataIndex: 'versionNumber',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrencyCodeSystem',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.agreement-amount" />,//协议金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'currencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.settlement-amount" />,//结算金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmountManual',
            sorter: false,
            width: 120,
            align:'right',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.update-date" />,//更新日期 
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.audit-date"/>,//审核日期
            dataType: 'dateTime',
            dataIndex: 'checkDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false); 
        setTableData([])
        let query = queryForm.getFieldValue();
        search?pagination.current=1:null
        if(!query.checkDate&&!query.buildDate&&!query.sfListCode){
            setBackFlag(false)
            //业务日期/生成日期/报账单号码 不能同时为空 
            Toast('',formatMessage({id: 'lbl.sfList-date-must-enter'}), 'alert-error', 5000, false)
        }else{
            setSpinflag(true)
            setBackFlag(true)
            const localsearch=await request($apiUrl.AG_FEE_KPL_SEARCH_DETAIL_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params":{
                        'soCompanyCode': query.soCompanyCode,
                        'agencyCode':query.agencyCode,
                        'feeClass':query.feeClass,
                        'sfListCode':query.sfListCode,
                        'verifyStatus':query.verifyStatus,
                        'clearingCurrencyCode':query.clearingCurrencyCode,
                        'checkDateFrom': query.checkDate ? momentFormat(query.checkDate[0]) : null,
                        'checkDateTo': query.checkDate ? momentFormat(query.checkDate[1]) : null,
                        'buildDateFrom': query.buildDate ? momentFormat(query.buildDate[0]) : null,
                        'buildDateTo': query.buildDate ? momentFormat(query.buildDate[1]) : null,
                        "isManu":"N" 
                    }
                }
            })
            console.log(localsearch)
            if(localsearch.success){
                setSpinflag(false)
                let data = localsearch.data
                let datas = localsearch.data ? localsearch.data.resultList : ''
                setTabTotal(data.totalCount)
                datas ? setTableData([...datas]) : null
                if(pagination.pageSize!=page.pageSize){
                    pagination.current=1
                }
                setPage({...pagination})
            }else{
                setSpinflag(false)
                Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
            }
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
        setTableData([])
        setBackFlag(true)
    }

    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_KPL_EXP_DETAIL_LIST,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    'agencyCode':query.agencyCode,
                    'feeClass':query.feeClass,
                    'sfListCode':query.sfListCode,
                    'verifyStatus':query.verifyStatus,
                    'clearingCurrencyCode':query.clearingCurrencyCode,
                    'checkDateFrom': query.checkDate ? momentFormat(query.checkDate[0]) : null,
                    'checkDateTo': query.checkDate ? momentFormat(query.checkDate[1]) : null,
                    'buildDateFrom': query.buildDate ? momentFormat(query.buildDate[0]) : null,
                    'buildDateTo': query.buildDate ? momentFormat(query.buildDate[1]) : null,
                    "isManu":"N" 
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-rep-bl-deta-iqry'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        sfListCode: formatMessage({id:"lbl.Reimbursement-number" }),
                        verifyStatus: formatMessage({id:"lbl.audit-status" }),
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        companyCode: formatMessage({id:"lbl.company" }),
                        versionNumber: formatMessage({id:"lbl.version-number" }),
                        rateCurrencyCodeSystem: formatMessage({id:"lbl.Agreement-currency" }),
                        totalAmount: formatMessage({id:"lbl.agreement-amount" }),
                        currencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        totalAmountManual: formatMessage({id:"lbl.settlement-amount" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        recordUpdateDate: formatMessage({id:"lbl.update-date" }),
                        checkDate: formatMessage({id:"lbl.audit-date" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.in-fee.kpl-rep-bl-deta-iqry'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-rep-bl-deta-iqry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.in-fee.kpl-rep-bl-deta-iqry'}) ; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    return (
        <div className='parent-box'>
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
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={costKey} />  
                        {/* 报账单号码 */}
                        <InputText name='sfListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>  
                        {/* 审核日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='checkDate' label={<FormattedMessage id='lbl.audit-date'/>}/>
                        {/* 币种 */}
                        <InputText name='clearingCurrencyCode' label={<FormattedMessage id='lbl.ccy'/>} span={6}/>  
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='buildDate' label={<FormattedMessage id='lbl.generation-date'/>}/>
                        {/* 审核状态 */}
                        <Select name='verifyStatus' flag={true} label={<FormattedMessage id='lbl.audit-status'/>} span={6} options={postStatus.values} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/><FormattedMessage id='lbl.download'/></Button>
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
                    rowKey='lcrAgreementHeadUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    rowSelection={null}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol