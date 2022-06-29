import React, { useState,useEffect, $apiUrl,createContext ,useContext } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import {momentFormat, company, agencyCodeData, acquireSelectDataExtend} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal,Tabs} from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import SelectVal from '@/components/Common/Select';
import DatePicker from '@/components/Common/DatePicker'
import moment from 'moment';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'

import {
    SearchOutlined,//日志
    FileAddOutlined,//新增
    ReloadOutlined,
    CloudDownloadOutlined
} from '@ant-design/icons'
export const NumContext = createContext();

//------------------------------------------------------ 导出历史查询------------------------------------------------
const { TabPane } = Tabs;
const confirm = Modal.confirm

const searchPreAgreementMailFeeAgmtList =()=> {
    const [agencyCode, setAgencyCode] = useState([]);   // 公司
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
    });
    const [defaultKey, setDefaultKey] = useState('1');
    const [tableData,setTableData] = useState([])//表格数据
    const [detailedtableData,setDetailedTableData] = useState([])//表格数据
    const [detailedtableDatas,setDetailedTableDatas] = useState([])//表格数据
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [detailedTabTotal,setDetailedTabTotal] = useState([]);//表格数据的个数
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [detailParameter,setDetailParameter] = useState('')//双击数据
    const [spinflag,setSpinflag] = useState(false)
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
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
    }, [])

    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
    }

    //导出历史查询表格文本
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
            title:<FormattedMessage id="lbl.provisional-reimbursement-no" />,//临时报账单号码
            dataIndex: 'tmpYgListCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,//报账单号码
            dataIndex: 'ygListCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.generation-date" />,//生成日期
            // dataType: 'dateTime',
            dataIndex: 'generateDatetime',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100
        },
        {
            title: <FormattedMessage id="lbl.confirmation-date" />,//确认日期
            dataType: 'dateTime',
            dataIndex: 'checkDatetime',
            sorter: false,
            key:'AGMT_STATUS',
            width: 80,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.Generation-personnel" />,//生成人员
            dataIndex: 'generateUser',
            sorter: false,
            key:'FM_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.update-people" /> ,//更新人员
            dataIndex: 'recordUpdateUser',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.update-date" /> ,//更新日期
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left'
        }
    ]

    //导出历史查询明细信息表格文本
    const Detailedcolumns=[
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
            title:<FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'billReferenceCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.office" />,//office
            dataIndex: 'officeCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100
        },
        {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,//报账单号码
            dataIndex: 'ygListCode',
            sorter: false,
            key:'AGMT_STATUS',
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.income" />,//收入
            dataIndex: 'chargeTotalAmountInCny',
            sorter: false,
            key:'FM_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.cost" /> ,//成本
            dataIndex: 'vtmTotalAmountInCny',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.Reimbursement-currency" /> ,//报账币种
            dataIndex: 'localCurrencyCode',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.rate-one" /> ,//费率
            dataIndex: '',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.argue.ttlAmt" /> ,//总金额
            dataIndex: 'totalAmountInLocal',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.Tax-amount" /> ,//税额
            dataIndex: 'vatAmountInLocal',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.The-amount-of-adjustment" /> ,//调整金额
            dataIndex: 'reviseAmountInLocal',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.Adjust-the-amount-of" /> ,//调整税额
            dataIndex: 'reviseVatAmountInLocal',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.cost-office-code" /> ,//成本 office code
            dataIndex: 'vtmOfficeCodeDescription',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.cbs-company-code" /> ,//CBS company code
            dataIndex: 'cbsCompanyCode',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
    ]

    const Detailedcolumnss=[
        {
            title: <FormattedMessage id="lbl.Reimbursement-currency" />,//报账币种
            dataIndex: 'localCurrencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.argue.ttlAmt" />,//总金额
            dataIndex: 'totalAmountInLocalSum',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Tax-amount" />,//税额
            dataIndex: 'vatAmountInLocalSum',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        },
        {
            title:<FormattedMessage id="lbl.The-amount-of-adjustment" /> ,//调整金额
            dataIndex: 'reviseAmountInLocalSum',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.Adjust-the-amount-of" /> ,//调整税额
            dataIndex: 'reviseVatAmountInLocalSum',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
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
        setSpinflag(true)
        setTableData([])
        search?pagination.current=1:null
        let query = queryForm.getFieldsValue()
        let localsearch= await request($apiUrl.COMM_EXTENSION_QUERYER_EXTENSION_CHECK,{
            method:"POST",
            data:{
                "page": pagination,
                "params":{
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'crReceiptCode':query.crReceiptCode,
                    'tempERReceiptCode':query.tempERReceiptCode,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    'checkDateFrom':query.checkDate?momentFormat(query.checkDate[0]):null,
                    'checkDateTo':query.checkDate?momentFormat(query.checkDate[1]):null,
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
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            setPage({...pagination})
            data ? setTableData([...datas]) : null
            setTabTotal(data.totalCount)
            setSpinflag(false)
        }else{
            setSpinflag(false)
            Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
        }
    }

     // 双击
     const doubleClickRow = (parameter) => {
        setDefaultKey('2')
        setDetailParameter(parameter.ygListCode)
        detail(pageDetail,'',parameter)
    }
    const detail = async(pagination,options,parameter)=>{
        console.log(detailParameter,parameter)
        setSpinflag(true)
        const result = await request($apiUrl.COMM_EXTENSION_LOAD_ER_RECEIPT_EXTENSION_CHECK,{
            method:"POST",
            data:{
                "page": pagination,
                params: {
                    'crReceiptCode':detailParameter?detailParameter:parameter.ygListCode,
                }
            }
        })
        if(result.success) {
            Toast('', result.message, 'alert-success', 5000, false)
            setSpinflag(false)
            let data = result.data;
            let datas = data.commissionStatistics;
            let detailed = data.extensionYgListDetailCbs;
            let qury = data.extensionYgListCbs
            // console.log(datas)
            datas?datas.map((v,i)=>{
                v['id'] = i
            }):null
            // console.log(datas)
            setDetailedTableData([...detailed])
            setDetailedTableDatas([...datas])
            setDetailedTabTotal(data.totalCount)
            if(pagination.pageSize!=pageDetail.pageSize){
                pagination.current=1
            }
            setPageDetail({...pagination})
            // console.log(qury)
            // console.log(qury.verifyStatus)
            qury?qury.map((v,i)=>{
                queryForms.setFieldsValue({
                    verifyStatus: v.verifyStatus,
                    ygListCode: v.ygListCode,
                    recordUpdateUser: v.recordUpdateUser,
                    generateUser: v.generateUser,
                    totalCount: data.totalCount,
                    recordUpdateDate:moment(v.recordUpdateDate),
                    generateDatetime:moment(v.generateDatetime),
                    budateUpload:moment(v.budateUpload),
                })
            }):null
            
        }else{
            setSpinflag(false)
            Toast('',result.errorMessage, 'alert-error', 5000, false);
        }
    }

    //重置
    const reset = () =>{
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        },[company, acquireData])
        setTableData([])
    }

    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        let query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.COMM_EXTENSION_EXP_EXTENSION_CHECK,{
            method:"POST",
            data:{
                "params":{
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'crReceiptCode':query.crReceiptCode,
                    'tempERReceiptCode':query.tempERReceiptCode,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    'checkDateFrom':query.checkDate?momentFormat(query.checkDate[0]):null,
                    'checkDateTo':query.checkDate?momentFormat(query.checkDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.comm.ext-stl.exp-his-qry'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            tmpYgListCode: formatMessage({id:"lbl.provisional-reimbursement-no" }),
                            ygListCode: formatMessage({id:"lbl.Reimbursement-number" }),
                            generateDatetime: formatMessage({id:"lbl.generation-date" }),
                            checkDatetime: formatMessage({id:"lbl.confirmation-date" }),
                            generateUser: formatMessage({id:"lbl.Generation-personnel" }),
                            recordUpdateUser: formatMessage({id:"lbl.update-people" }),
                            recordUpdateDate: formatMessage({id:"lbl.update-date" }),
                        },
                        sumCol: {//汇总字段
                        
                        },
                    'sheetName':formatMessage({id:'menu.afcm.comm.ext-stl.exp-his-qry'}),
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
            Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false)
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.comm.ext-stl.exp-his-qry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.comm.ext-stl.exp-his-qry'}) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                console.log(downloadElement)
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    //明细下载
    const downlodDetail = async () =>{
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        setSpinflag(true)
        let downData = await request($apiUrl.COMM_EXTENSION_EXP_ER_RECEIPT_EXTENSION_CHECK,{
            method:"POST",
            data:{
                "params":{
                    'crReceiptCode':detailParameter.ygListCode
                },
                'excelFileName':formatMessage({id:'lbl.afcm-0028'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            billReferenceCode: formatMessage({id:"lbl.bill-of-lading-number" }),
                            officeCode: formatMessage({id:"lbl.office" }),
                            activityDate: formatMessage({id:"lbl.argue.biz-date" }),
                            ygListCode: formatMessage({id:"lbl.Reimbursement-number" }),
                            chargeTotalAmountInCny: formatMessage({id:"lbl.income" }),
                            vtmTotalAmountInCny: formatMessage({id:"lbl.cost" }),
                            localCurrencyCode: formatMessage({id:"lbl.Reimbursement-currency" }),
                            '': formatMessage({id:"lbl.rate-one" }),
                            totalAmountInLocal: formatMessage({id:"lbl.argue.ttlAmt" }),
                            vatAmountInLocal: formatMessage({id:"lbl.Tax-amount" }),
                            reviseAmountInLocal: formatMessage({id:"lbl.The-amount-of-adjustment" }),
                            reviseVatAmountInLocal: formatMessage({id:"lbl.Adjust-the-amount-of" }),
                            vtmOfficeCodeDescription: formatMessage({id:"lbl.cost-office-code" }),
                            cbsCompanyCode: formatMessage({id:"lbl.cbs-company-code" }),
                        },
                        sumCol: {//汇总字段
                            localCurrencyCode: formatMessage({id:"lbl.Reimbursement-currency" }),
                            totalAmountInLocalSum: formatMessage({id:"lbl.argue.ttlAmt" }),
                            vatAmountInLocalSum: formatMessage({id:"lbl.Tax-amount" }),
                            reviseAmountInLocalSum: formatMessage({id:"lbl.The-amount-of-adjustment" }),
                            reviseVatAmountInLocalSum: formatMessage({id:"lbl.Adjust-the-amount-of" }),
                        
                        },
                    'sheetName':formatMessage({id:'lbl.afcm-0028'}),
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
            Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false)
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'lbl.afcm-0028'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'lbl.afcm-0028'}) + '.xlsx'; // 下载后文件名
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
                {/* 报账单列表 */}
                <TabPane tab={<FormattedMessage id='lbl.Reimbursement-list' />} key="1">
                    <div className='header-from' style={{marginTop:"15px"}}>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 船东 */}
                                <SelectVal disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                                {/* 代理编码 */}
                                {
                                    company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <SelectVal showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                                }
                                {/* 临时报账单号码 */}
                                <InputText name='tempERReceiptCode' label={<FormattedMessage id='lbl.provisional-reimbursement-no'/>} span={6}/>
                                {/* 报账单号码 */}
                                <InputText name='crReceiptCode' label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>
                                {/* 生成日期 */}
                                <DoubleDatePicker span={6} disabled={[false, false]} name='generateDate'  label={<FormattedMessage id='lbl.generation-date'/>}   />
                                {/* 确认日期 */}
                                <DoubleDatePicker span={6} disabled={[false, false]} name='checkDate'  label={<FormattedMessage id='lbl.confirmation-date'/>}   />
                            </Row>
                        </Form> 
                        {/* 查询条件 */}
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/> </Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 下载 */}
                            <Button onClick={downlod} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                        </div>
                        <div className='button-right'>
                            {/* 重置 */}
                            <Button onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                            {/* 查询按钮 */}
                            <Button onClick={()=>{pageChange(page,'','search')}} > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                        </div>
                    </div>
                    <div className='footer-table'>
                        <div style={{width:'60%'}}>
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
                                rowSelection={null}
                            />
                        </div>
                        
                    </div>
                </TabPane>
                {/* 明细信息 */}
                <TabPane tab={<FormattedMessage id='lbl.Detailed-information' />} key="2">
                    <div className='header-from' style={{marginTop:"15px"}}>
                        <Form 
                            form={queryForms}
                            name='func'
                            onFinish={handleQuery} 
                        >
                            <Row>
                                {/* 报账单状态 */}
                                <InputText name='verifyStatus' disabled={true}   label={<FormattedMessage id='lbl.Reimbursement-status'/>} span={6}/>
                                {/* 报账单号码 */}
                                <InputText name='ygListCode'  disabled={true} label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>
                                {/* 更新日期 */}
                                <DatePicker span={6} disabled={[false, false]} name='recordUpdateDate'  label={<FormattedMessage id='lbl.update-date'/>}   />
                                {/* 更新人员 */}
                                <InputText name='recordUpdateUser'  disabled={true} label={<FormattedMessage id='lbl.update-people'/>} span={6}/>
                                {/* 生成日期 */}
                                <DatePicker span={6} disabled={[false, false]} name='generateDatetime'  label={<FormattedMessage id='lbl.generation-date'/>}   />
                                {/* 生成人员 */}
                                <InputText name='generateUser'  disabled={true} label={<FormattedMessage id='lbl.Generation-personnel'/>} span={6}/>
                                {/* 行项目数 */}
                                <InputText name='totalCount'  disabled={true}   label={<FormattedMessage id='lbl.Number-of-line-items'/>} span={6}/>
                                
                            </Row>
                        </Form> 
                        {/* 报账单头信息 */}
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/> </Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 下载 */}
                            <Button onClick={downlodDetail} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                        </div>
                        <div className='button-right'>
                        </div>
                    </div>
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={detailedtableData}
                            columns={Detailedcolumns}
                            rowKey='lcrAgreementHeadUuid'
                            pageChange={detail}
                            pageSize={pageDetail.pageSize}
                            current={pageDetail.current}
                            scrollHeightMinus={200}
                            total={detailedTabTotal}
                            rowSelection={null}
                            // selectionType='radio'
                            // setSelectedRows={setSelectedRows}
                        />
                    </div>
                    <div className='footer-table' style={{marginTop:'15px'}}>
                        <div style={{width:'50%'}}>
                            <PaginationTable
                                dataSource={detailedtableDatas}
                                columns={Detailedcolumnss}
                                rowKey='entryUuid'
                                pageChange={pageChange}
                                pageSize={page.pageSize}
                                current={page.current}
                                scrollHeightMinus={200}
                                rowSelection={null}
                                pagination={false}
                            />
                        </div>
                    </div>
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;