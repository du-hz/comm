{/*未开票查询-代理费*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi';
import request from '@/utils/request';
import { Button, Form, Row, Tabs, } from 'antd';
import Select from '@/components/Common/Select';
import InputText from '@/components/Common/InputText';
import { acquireSelectData, costCategories, momentFormat, acquireSelectDataExtend,agencyCodeData} from '@/utils/commonDataInterface';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import Loading from '@/components/Common/Loading'

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

const noBillingQuery =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [detailInfoTable,setDetailInfoTable] = useState([]);   //  明细信息数据
    const [statisticsDetailTable,setStatisticsDetailTable] = useState([]);   //  统计明细信息数据
    const [agencySummaryTable,setAgencySummaryTable] = useState([]);   //  代理月份汇总数据
    const [monthDetailTable,setMonthDetailTable] = useState([]);   //  月份汇总明细数据
    const [defaultKey, setDefaultKey] = useState('1');
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用小类
    const [infoCategory,setInfoCategory] = useState ({}) //信息类别
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [loading,setLoading] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectData('AFCM.REPORT.CATEGORY', setInfoCategory, $apiUrl);  // 信息类别 
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大小类联动
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
    },[])
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])
    const [queryForm] = Form.useForm();
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "activityDate": null,
        "feeClass": null,
        "feeType": null,
        "svvdId": null,
        "portCode": null,
        "ygListCode": null,
        "infoCategory": null,
    });
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    {/* 表格的下拉框onchange事件 */}
    const getCommonSelectVal = (e,record,name) =>{
        record[name]=e
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

    {/* 明细信息列表 */}
    const detailInfoColumns = [
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
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id= 'lbl.ac.invoice.fee-type' />,// 费用类型
            // dataType:feeType.values,
            dataIndex: 'feeType',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id= 'lbl.Whether-it-actually-happens'/>,// 是否实际发生
            dataIndex: 'actFlag',
            align:'left',
            sorter: false,
            width: 90,
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
            dataIndex: 'verNum',
            align:'left',
            sorter: false,
            width: 50,
        },
        {
            title: <FormattedMessage id=  'lbl.Cost-status'/>,// 费用状态
            dataIndex: 'currStatus',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCcyCde',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCcyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'ttlAmt',
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
        },
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
            // dataType:feeType.values,
            dataIndex: 'feeClass',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id= 'lbl.Data-state'/>,// 数据状态
            dataIndex: 'dateStatus',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCcyCde',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCcyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'ttlAmt',
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
            dataIndex: 'rateCcyCde',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCcyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'ttlAmt',
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
            dataIndex: 'rateCcyCde',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-adjustment-amount'/>,// 协议币调整金额
            dataIndex: 'reviseAmt',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCcyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency'/>,// 结算币调整金额
            dataIndex: 'ttlAmt',
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
        if(!queryData.activityDate && !queryData.svvdId && !queryData.ygListCode){
            Toast('',intl.formatMessage({id:'lbl.Report-agfee-bill'}), 'alert-error', 5000, false)
            setBackFlag(false);
            return;
        }
        setLoading(true);
        setBackFlag(true);
        const result = await request($apiUrl.REPORT_FORM_AGENCY_FEE_NO_BILLING_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    ...queryData,
                    activeDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activeDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                    status: "YF"
                },
                operateType: "AFCM-AG-MR-002",
                excelFileName: intl.formatMessage({id: 'menu.afcm.reportForm.agFee.noBillQuery'}), //文件名
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            svvdId: intl.formatMessage({id: "lbl.SVVD"}),
                            portCode: intl.formatMessage({id: "lbl.port"}),
                            agencyCode: intl.formatMessage({id: "lbl.agency"}),
                            feeType: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                            actFlag: intl.formatMessage({id: "lbl.Whether-it-actually-happens"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            verNum: intl.formatMessage({id: "lbl.version-number"}),
                            currStatus: intl.formatMessage({id: "lbl.Cost-status"}),
                            rateCcyCde: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            reviseAmt: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            clearingCcyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            ttlAmt: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                            category: intl.formatMessage({id: "lbl.Info-category"}),
                            reason: intl.formatMessage({id: "lbl.cause"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Detailed-information'}),//明细信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: intl.formatMessage({id: "lbl.agency"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            feeClass: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                            dateStatus: intl.formatMessage({id: "lbl.Data-state"}),
                            rateCcyCde: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            reviseAmt: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            clearingCcyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            ttlAmt: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Statistical-details'}),//统计明细信息
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: intl.formatMessage({id: "lbl.agency"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            rateCcyCde: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            reviseAmt: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            clearingCcyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            ttlAmt: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Agent-month-summary'}),//代理月份汇总
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            rateCcyCde: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            reviseAmt: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),
                            clearingCcyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            ttlAmt: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),
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
            setLoading(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setLoading(false);
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.reportForm.agFee.noBillQuery'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.reportForm.agFee.noBillQuery'})+ '.xlsx'; // 下载后文件名
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
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }

    {/* 查询表格数据 WAX2AM4047W*/}
    const pageChange = async () =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.activityDate && !queryData.svvdId && !queryData.ygListCode){
            Toast('',intl.formatMessage({id:'lbl.Report-agfee-bill'}), 'alert-error', 5000, false)
            setBackFlag(false);
            setLoading(false);
            return;
        }else{
            setBackFlag(true);
            setLoading(true);
        }
        const result = await request($apiUrl.REPORT_FORM_AGENCY_FEE_NO_BILLING_SEARCH_LIST,{
            method:"POST",
            data:{
                "params": {
                    soCompanyCode: queryData.soCompanyCode,
                    agencyCode: queryData.agencyCode,
                    feeClass: queryData.feeClass,
                    feeType: queryData.feeType,
                    svvdId: queryData.svvdId,
                    portCode: queryData.portCode,
                    ygListCode: queryData.ygListCode,
                    category: queryData.category,
                    activeDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activeDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                    status: "YF"
                },
                operateType: "AFCM-AG-MR-002"
            }
        })
        let data=result.data
        if(result.success){
            setLoading(false);
            if(data.dtlList!=null){
                data.dtlList.map((v,i)=>{
                    v.uid=i
                    v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                })
            }
            if(data.firstList!=null){
                data.firstList.map((v,i)=>{
                    v.uid=i
                })
            }
            if(data.secondList!=null){
                data.secondList.map((v,i)=>{
                    v.uid=i
                })
            }
            if(data.thirdList!=null){
                data.thirdList.map((v,i)=>{
                    v.uid=i
                })
            }
            setDetailInfoTable(data.dtlList);         //  明细信息数据
            setStatisticsDetailTable(data.firstList);   //  统计明细信息数据
            setAgencySummaryTable(data.secondList);      //  代理月份汇总数据
            setMonthDetailTable(data.thirdList);        //  月份汇总明细数据
        }else {
            setLoading(false);
            setDetailInfoTable([]);      
            setStatisticsDetailTable([]); 
            setAgencySummaryTable([]);   
            setMonthDetailTable([]);  
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 导航页 */}
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setLoading(true);
		setDefaultKey(key);
        if(key==1 && detailInfoTable.length==0){
            setLoading(false);
        }else if(key==2 && statisticsDetailTable.length==0){
            setLoading(false);
        }else if(key==3 && agencySummaryTable.length==0){
            setLoading(false);
        }else if(key==4 && monthDetailTable.length==0){
            setLoading(false);
        }else{ 
            setTimeout(()=>{
                setLoading(false);
            } ,1000);
        }
	}

    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form form={queryForm} name='search' onFinish={handleQuery}>
                    <Row>
                        {/* 船东 */}
                        <Select span={6} name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} formlayouts={formlayouts}/>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <Select showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                        }
                        {/* 业务日期 */}
                        <DoubleDatePicker disabled={[false, false]} name='activityDate'  style={{background:backFlag?'white':'yellow'}} label={<FormattedMessage id="lbl.argue.bizDate" />} span={6}  formlayouts={formlayouts}/>
                        {/* 费用大类 */}
                        <Select name='feeClass' label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} flag={true} selectChange={getCommonSelectVal} options={feeClass} formlayouts={formlayouts}/> 
                        {/* 费用小类 */}
                        <Select name='feeType' label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} flag={true} options={feeType} formlayouts={formlayouts}/>
                        {/* SVVD */}
                        <InputText name='svvdId' label={<FormattedMessage id='lbl.SVVD'/>} styleFlag={backFlag} span={6} formlayouts={formlayouts}/> 
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6} formlayouts={formlayouts}/> 
                        {/* 预估单号码 */}
                        <InputText name='ygListCode' label={<FormattedMessage id='lbl.Estimated-order-number'/>} styleFlag={backFlag} span={6} formlayouts={formlayouts}/> 
                        {/* 信息类别 */}
                        <Select name='category' label={<FormattedMessage id='lbl.Info-category'/>} flag={true} span={6} options={infoCategory.values} formlayouts={formlayouts}/>
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
            <Loading spinning={loading}/>
        </div>
    )
}

export default noBillingQuery