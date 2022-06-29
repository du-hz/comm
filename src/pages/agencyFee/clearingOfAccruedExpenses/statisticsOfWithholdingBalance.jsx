import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas,agencyCodeData, momentFormat, costCategories, acquireSelectDataExtend, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'


//---------------------------------------------- 预提余额统计-------------------------------------------------
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//
    const [tableDatas,setTableDatas] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [newko,setNewko] = useState({})//科目
    const [costKey, setCostKey] = useState([]);    // 费用大类
    const [subclass,setSubclass] = useState([]);    // 费用类型
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [spinflag,setSpinflag] = useState(false)
    const [backFlag,setBackFlag] = useState(true);//背景颜色
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
            ...query
        })
        console.log(query)
    }

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
            // soCompanyCode: company.companyType == 0 ? company.companyCode : defVal.shipownerCompanyCode
        })
    }, [company, acquireData])

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDatas('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDatas('AG.YT.NEWKO', setNewko, $apiUrl);// 科目
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
    },[])

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
   
    //预提余额统计表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.Batch-ID" />,//批次ID
            dataIndex: 'processId',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.In-charge-to-an-account" />,//记账月份
            dataIndex: 'budat',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.subject" />,//科目
            dataIndex: 'newko',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
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
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'currencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'totalAmount',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE',
           
        },
        {
            title: <FormattedMessage id="lbl.The-amount-of-withholding-bookkeeping" />,//预提记账金额
            dataIndex: 'bookAmount',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-of-withholding-write-offs" />,//预提冲销金额
            dataIndex: 'sterAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.Unwritten-amount" />,//未冲销金额
            dataIndex: 'tfixAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_CALC_FLAG'
        }
    ]
    

    const columnss=[
        {
            title: <FormattedMessage id="lbl.batch-number" />,//批次号
            dataIndex: 'processId',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.In-charge-to-an-account" />,//记账月份
            dataIndex: 'budat',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.subject" />,//科目
            dataIndex: 'newko',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.The-amount-of-withholding-bookkeeping" />,//预提记账金额
            dataIndex: 'ttlBookAmt',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-of-withholding-write-offs" />,//预提冲销金额
            dataIndex: 'ttlSterAmt',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Unwritten-amount" />,//未冲销金额
            dataIndex: 'ttlTfix',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE'
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        setTableData([])
        setTableDatas([])
        if(!query.buDate&&!query.svvd&&!query.portCode&&!query.processId){
            // 批次号/记帐日期/SVVD/港口 必须输入一项
            setBackFlag(false)
            Toast('', formatMessage({id: 'lbl.activeDate-svvd-portCode-processId'}), 'alert-error', 5000, false)
        }else{
            setBackFlag(true)
            setSpinflag(true)
            const localsearch=await request($apiUrl.AG_FEE_YTCLEAR_SEARCH_PENDING_CR_INVOICE_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        'soCompanyCode': query.soCompanyCode,
                        "agencyCode":query.agencyCode,
                        'feeClass':  query.feeClass,
                        'feeType':  query.feeType,
                        'portCode':  query.portCode,
                        'processId':  query.processId,
                        'svvd':  query.svvd,
                        'clearingFlag':query.clearingFlag,
                        'buDateFrom':  query.buDate?momentFormat(query.buDate[0]):null,
                        'buDateTo':  query.buDate?momentFormat(query.buDate[1]):null,
                    }
                }
            })
            console.log(localsearch)
            if(localsearch.success){
                let data=localsearch.data
                let datas=data ? data.resultList : null
                let datass=data ? data.sumList : null
                datas ? datas.map((v,i)=>{
                    v['id'] = i
                }) : null
                datass ? datass.map((v,i)=>{
                    v['id'] = i
                }) : null
                setTabTotal(data.totalCount)
                setTableData([...datas])
                setTableDatas([...datass])
                if(pagination.pageSize!=page.pageSize){
                    pagination.current=1
                }
                setPage({...pagination})
                setSpinflag(false)
            }else{
                Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
                setSpinflag(false)
                setTableData([])
                setTableDatas([])
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
        setBackFlag(true)
        setTableData([])
        setTableDatas([])
    }
     //下载
     const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_YTCLEAR_EXP_YTMONERY_LIST,{
            method:"POST",
            data:{
                 'page':{
                    current: 0,
                    pageSize: 0
                },
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    "agencyCode":query.agencyCode,
                    'feeClass':  query.feeClass,
                    'feeType':  query.feeType,
                    'portCode':  query.portCode,
                    'processId':  query.processId,
                    'svvd':  query.svvd,
                    'clearingFlag':query.clearingFlag,
                    'buDateFrom':  query.buDate?momentFormat(query.buDate[0]):null,
                    'buDateTo':  query.buDate?momentFormat(query.buDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.cla-acc-exp.stat-with-bal'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        companyCode: formatMessage({id:"lbl.company" }),
                        processId: formatMessage({id:"lbl.Batch-ID" }),
                        budat: formatMessage({id:"lbl.In-charge-to-an-account" }),
                        newko: formatMessage({id:"lbl.subject" }),
                        svvdId: formatMessage({id:"lbl.SVVD" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        agencyCode: formatMessage({id:"lbl.carrier.loc" }),
                        feeType: formatMessage({id:"lbl.ac.invoice.fee-type" }),
                        currencyCode: formatMessage({id:"lbl.Agreement-currency" }),
                        totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                        bookAmount: formatMessage({id:"lbl.The-amount-of-withholding-bookkeeping" }),
                        sterAmount: formatMessage({id:"lbl.Amount-of-withholding-write-offs" }),
                        tfixAmount: formatMessage({id:"lbl.Unwritten-amount" }),

                    },
                    sumCol: {//汇总字段
                        companyCode: formatMessage({id:"lbl.company" }),
                        processId: formatMessage({id:"lbl.batch-number" }),
                        budat: formatMessage({id:"lbl.In-charge-to-an-account" }),
                        newko: formatMessage({id:"lbl.subject" }),
                        ttlBookAmt: formatMessage({id:"lbl.The-amount-of-withholding-bookkeeping" }),
                        ttlSterAmt: formatMessage({id:"lbl.Amount-of-withholding-write-offs" }),
                        ttlTfix: formatMessage({id:"lbl.Unwritten-amount" }),
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.cla-acc-exp.stat-with-bal'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.cla-acc-exp.stat-with-bal'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.cla-acc-exp.stat-with-bal'})+ '.xlsx'; // 下载后文件名
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
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={costKey} selectChange={selectChangeBtn } />  
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={subclass} />  
                        {/* 批次号 */}
                        <InputText name='processId' styleFlag={backFlag} label={<FormattedMessage id='lbl.batch-number'/>}   span={6}/>  
                        {/* 记账月份 从 */}
                        <DoubleDatePicker name='buDate' style={{background:backFlag?'white':'yellow'}} picker="month" span={6}  label={<FormattedMessage id='lbl.In-charge-to-an-account'/>}   />
                        {/* 科目*/}
                        <Select name='newko' flag={true} label={<FormattedMessage id='lbl.subject'/>} span={6} options={newko.values}/> 
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6}/> 
                        {/* 港口 */}
                        <InputText name='portCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.port'/>} span={6}/> 
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
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    rowSelection={null}
                />
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableDatas}
                    columns={columnss}
                    rowKey='id'
                    pageChange={pageChange}
                    pagination={false}
                    scrollHeightMinus={200}
                    rowSelection={null}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol