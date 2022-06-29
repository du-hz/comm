{/*未报账查询-佣金*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi';
import request from '@/utils/request';
import { Button, Form, Row, Tabs,} from 'antd';
import Select from '@/components/Common/Select';
import InputText from '@/components/Common/InputText';
import { acquireSelectData, momentFormat,agencyCodeData,acquireSelectDataExtend} from '@/utils/commonDataInterface';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import Loading from '@/components/Common/Loading';

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

const { TabPane } = Tabs;
let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const noReimbursementQuery =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [detailInfoTable,setDetailInfoTable] = useState([]);   //  明细信息数据
    const [statisticsDetailTable,setStatisticsDetailTable] = useState([]);   //  统计明细信息数据
    const [agencySummaryTable,setAgencySummaryTable] = useState([]);   //  代理月份汇总数据
    const [monthDetailTable,setMonthDetailTable] = useState([]);   //  月份汇总明细数据
    const [defaultKey, setDefaultKey] = useState('1');
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [infoCategory,setInfoCategory] = useState ({}) //信息类别
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 

    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectData('AFCM.REPORT.CATEGORY', setInfoCategory, $apiUrl);  // 信息类别 
        acquireSelectData('COMM.TYPE', setCommissionType, $apiUrl);  // 佣金类型 
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
    },[])
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])
    const [queryForm] = Form.useForm();
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "activityDate": null,
        "billNum": null,
        "commissionType": null,
        "invoiceNum": null,
        "infoCategory": null,
    });
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    {/* 明细信息列表 */}
    const detailInfoColumns = [
        {
            title: <FormattedMessage id='lbl.bill-of-lading-number'/>,// 提单号码
            dataIndex: 'billReferenceCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id= 'lbl.The-Commission'/>,// 佣金模式
            dataIndex: 'commissionMode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            // dataType:commissionType.values,
            dataIndex: 'commissionType',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id= 'lbl.Whether-it-actually-happens'/>,// 是否实际发生
            dataIndex: 'actualFlag',
            align:'left',
            sorter: false,
            width: 90,
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
            width: 40,
        },
        {
            title: <FormattedMessage id= 'lbl.argue.bizDate'/>,// 业务日期
            dataIndex: 'activityDate',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id=  'lbl.version-number'/>,// 版本号
            dataIndex: 'versionNumber',
            align:'left',
            sorter: false,
            width: 50,
        },
        {
            title: <FormattedMessage id= 'lbl.Commission-state'/>,// 佣金状态
            dataIndex: 'status',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.Info-category'/>,// 信息类别
            dataIndex: 'category',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id= 'lbl.cause'/>,// 原因
            dataIndex: 'reason',
            align:'left',
            sorter: false,
            width: 40,
        }
    ]
    {/* 统计明细信息列表 */}
    const statisticsDetailColumns = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Business-month'/>,// 业务月份
            dataIndex: 'activityDate',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id= 'lbl.ac.invoice.fee-type' />,// 费用类型
            dataIndex: 'commissionType',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Data-state'/>,// 数据状态
            dataIndex: 'status',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
    ]
    {/* 代理月份汇总列表 */}
    const agencySummaryColumns = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Business-month'/>,// 业务月份
            dataIndex: 'activityDate',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
    ]
    {/* 月份汇总明细列表 */}
    const monthDetailColumns = [
        {
            title: <FormattedMessage id='lbl.Business-month'/>,// 业务月份
            dataIndex: 'activityDate',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
    ]

    {/* 下载 */}
    const downloadBtn =async () => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.arReceiptCode && !queryData.activityDate && !queryData.billReferenceCode){
            Toast('',intl.formatMessage({id:'lbl.Report-form-burse'}), 'alert-error', 5000, false)
            setBackFlag(false);
            return;
        }
        setSpinflag(true);
        setBackFlag(true);
        const result = await request($apiUrl.REPORT_FORM_COMM_NO_BILLING_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    ...queryData,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                operateType: "AFCM-COMM-MR-003",
                excelFileName: intl.formatMessage({id: 'menu.afcm.reportForm.comm.noReimburQuery'}), //文件名
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            billReferenceCode: intl.formatMessage({id: "lbl.bill-of-lading-number"}),
                            agencyCode: intl.formatMessage({id: "lbl.agency"}),
                            commissionMode: intl.formatMessage({id: "lbl.The-Commission"}),
                            commissionType: intl.formatMessage({id: "lbl.Commission-type"}),
                            actualFlag: intl.formatMessage({id: "lbl.Whether-it-actually-happens"}),
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                            portCode: intl.formatMessage({id: "lbl.port"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            versionNumber: intl.formatMessage({id: "lbl.version-number"}),
                            status: intl.formatMessage({id: "lbl.Commission-state"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            reviseAmountInClearing: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                            category: intl.formatMessage({id: "lbl.Info-category"}),
                            reason: intl.formatMessage({id: "lbl.cause"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Detailed-information'}),//明细信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: intl.formatMessage({id: "lbl.agency"}),
                            activityDate: intl.formatMessage({id: "lbl.Business-month"}),
                            commissionType: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                            status: intl.formatMessage({id: "lbl.Data-state"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            reviseAmountInClearing: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}), 
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Statistical-details'}),//统计明细信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: intl.formatMessage({id: "lbl.agency"}),
                            activityDate: intl.formatMessage({id: "lbl.Business-month"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            reviseAmountInClearing: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}), 
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Agent-month-summary'}),//代理月份汇总
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            activityDate: intl.formatMessage({id: "lbl.Business-month"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            reviseAmountInClearing: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}), 
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Month-summary-details'}),//月份汇总明细
                    },
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.reportForm.comm.noReimburQuery'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.reportForm.comm.noReimburQuery'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    {/* 重置 */}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields()
        setBackFlag(true);
        setDetailInfoTable([]);         //  明细信息数据
        setStatisticsDetailTable([]);   //  统计明细信息数据
        setAgencySummaryTable([]);      //  代理月份汇总数据
        setMonthDetailTable([]); ;      //  月份汇总明细数据
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }

    {/* 查询表格数据 */}
    const pageChange = async () =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.arReceiptCode && !queryData.activityDate && !queryData.billReferenceCode){
            Toast('',intl.formatMessage({id:'lbl.Report-form-burse'}), 'alert-error', 5000, false)
            setSpinflag(false);
            setBackFlag(false);
            return;
        }else{
            setSpinflag(true);
            setBackFlag(true)
        }
        const result = await request($apiUrl.REPORT_FORM_COMM_NO_BILLING_SEARCH_LIST,{
            method:"POST",
            data:{
                "params": {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    billReferenceCode: queryData.billReferenceCode,
                    commissionType: queryData.commissionType,
                    categoryReason: queryData.categoryReason,
                    arReceiptCode: queryData.arReceiptCode,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                operateType: "AFCM-COMM-MR-003"
            }
        })
        let data=result.data
        if(result.success){
            setSpinflag(false);
            if(data.monitorListDtls!=null){
                data.monitorListDtls.map((v,i)=>{
                    v.uid=i
                    v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                })
            }
            if(data.monitorListFirs!=null){
                data.monitorListFirs.map((v,i)=>{
                    v.uid=i
                })
            }
            if(data.monitorListSecs!=null){
                data.monitorListSecs.map((v,i)=>{
                    v.uid=i
                })
            }
            if(data.monitorListThis!=null){
                data.monitorListThis.map((v,i)=>{
                    v.uid=i
                })
            }
            setDetailInfoTable(data.monitorListDtls);         //  明细信息数据
            setStatisticsDetailTable(data.monitorListFirs);   //  统计明细信息数据
            setAgencySummaryTable(data.monitorListSecs);      //  代理月份汇总数据
            setMonthDetailTable(data.monitorListThis);        //  月份汇总明细数据
        }else {
            setSpinflag(false);
            setDetailInfoTable([]);      
            setStatisticsDetailTable([]); 
            setAgencySummaryTable([]);   
            setMonthDetailTable([]);  
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setSpinflag(true);
		setDefaultKey(key);
        if(key==1 && detailInfoTable.length==0){
            setSpinflag(false);
        }else if(key==2 && statisticsDetailTable.length==0){
            setSpinflag(false);
        }else if(key==3 && agencySummaryTable.length==0){
            setSpinflag(false);
        }else if(key==4 && monthDetailTable.length==0){
            setSpinflag(false);
        }else{ 
            setTimeout(()=>{
                setSpinflag(false);
            } ,1000);
        }
	}

    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form form={queryForm} name='search' onFinish={handleQuery}>
                    <Row>
                        {/* 船东 */}
                        <Select span={6} name='shipownerCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} formlayouts={formlayouts}/>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <Select showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                        }
                        {/* 业务日期 */}
                        <DoubleDatePicker name='activityDate' style={{background:backFlag?'white':'yellow'}} label={<FormattedMessage id="lbl.argue.bizDate" />} span={6} formlayouts={formlayouts}/>
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode'  styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number'/>} span={6} formlayouts={formlayouts}/> 
                        {/* 佣金类型 */}
                        <Select name='commissionType' label={<FormattedMessage id= 'lbl.Commission-type'/>} span={6} options={commissionType.values} flag={true} formlayouts={formlayouts}/> 
                        {/* 发票号码 */}
                        <InputText name='arReceiptCode' styleFlag={backFlag}  label={<FormattedMessage id='lbl.Invoice-number'/>} span={6} formlayouts={formlayouts}/> 
                        {/* 信息类别 */}
                        <Select name='categoryReason' label={<FormattedMessage id='lbl.Info-category'/>} span={6} options={infoCategory.values} flag={true} formlayouts={formlayouts}/>
                    </Row>
                </Form>
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
                    {/* 下载 */}
                    <Button onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className="button-right">
                    {/* 重置 */}
                    <Button onClick={clearBtn}><ReloadOutlined/><FormattedMessage id='btn.reset' /></Button>
                    {/* 查询 */}
                    <Button onClick={pageChange}><SearchOutlined /><FormattedMessage id='btn.search'/></Button>
                </div>
            </div>
            <div className="groupBox">
                <Tabs onChange={callback} activeKey={defaultKey} type="card" defaultActiveKey="1">
                    {/* 明细信息 */}
                    <TabPane tab={<FormattedMessage id='lbl.Detailed-information' />} key="1">
                        <div className="table">
                            <PaginationTable
                                dataSource={detailInfoTable}
                                columns={detailInfoColumns}
                                rowKey='uid'
                                pagination={false}
                                pageChange={pageChange}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* 统计明细信息 */}
                    <TabPane tab={<FormattedMessage id='lbl.Statistical-details' />} key="2">
                        <div className="table" style={{width: '80%'}}>
                            <PaginationTable
                                dataSource={statisticsDetailTable}
                                columns={statisticsDetailColumns}
                                rowKey='uid'
                                pagination={false}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* 代理月份汇总 */}
                    <TabPane tab={<FormattedMessage id= 'lbl.Agent-month-summary' />} key="3">
                        <div className="table" style={{width: '70%'}}>
                            <PaginationTable
                                dataSource={agencySummaryTable}
                                columns={agencySummaryColumns}
                                rowKey='uid'
                                pagination={false}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* 月份汇总明细 */}
                    <TabPane tab={<FormattedMessage id= 'lbl.Month-summary-details' />} key="4">
                        <div className="table" style={{width: '60%'}}>
                            <PaginationTable
                                dataSource={monthDetailTable}
                                columns={monthDetailColumns}
                                rowKey='uid'
                                pagination={false}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                </Tabs>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default noReimbursementQuery