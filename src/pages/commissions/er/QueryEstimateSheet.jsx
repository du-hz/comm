// 查询预估单   
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, agencyCodeData, momentFormat, acquireSelectDataExtend, formatCurrencyNew } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Tooltip } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import QueryEstimateSheetPopup from './QueryEstimateSheetPopup';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

let formlayouts = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
}
// 预估解锁
const QueryEstimateSheet = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData, setTableData] = useState([]) // table数据
    const [tabTabTotal, setTabTotal] = useState([]) // table条数
    const [commissionCategories, setCommissionCategories] = useState([]);    // 佣金大类
    const [commissionType, setCommissionType] = useState([]);    // 佣金类型
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [headerTitle, setHeaderTitle] = useState("");
    const [detailsList, setDetailsList] = useState([]);    // 弹窗-列表
    const [detailsListTotal, setDetailsListTotal] = useState([]);    // 弹窗-条数
    const [detailsStatisticsList, setDetailsStatisticsList] = useState([]);    // 弹窗-统计列表
    const [messageHeader, setMessageHeader] = useState([]);    // 弹窗-头信息
    const [spinflag, setSpinflag] = useState(false);     // 加载

    const [acquireData, setAcquireData] = useState({}); // 船东
    const [receipt, setReceipt] = useState({}); // 预估单状态
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [packageData, setPackage] = useState({}); // 是否生成数据包
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [parameter, setparameter] = useState([]); // popup要有
    const [objMessage, setObjMessage] = useState({});   // 提示信息对象
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "agencyName": null,
        "agreementCode": null,
        "agreementStatus": null,
        "companyCode": null,
        "queryType": "PRE_AGMT",
        "soCompanyCode": null,
        "soCompanyCodeReadOnly": true
    });
    // from 数据
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    // 初始化
    useEffect(() => {
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setReceipt, $apiUrl);// 预估单状态
        acquireSelectData('AFCM.PACKAGE.FLAG', setPackage, $apiUrl);// 是否生成数据包
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     //    佣金类型
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])
    // useEffect(() => {
    //     queryForm.setFieldsValue({
    //         shipownerCompanyCode: '2000',
    //         agencyCode: agencyCode.length > 0 ? Object.values(agencyCode[0])[0] : undefined
    //     })
    // }, [agencyCode])

    // 列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.company" />,// 公司
            dataIndex: 'companyCode',
            align: 'left',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'left',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Estimated-order-number' />,// 预估单号码
            dataIndex: 'ygListCode',
            align: 'left',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Temporary.estimated-order-number" />,// 临时预估单号码
            dataIndex: 'tmpYgListCode',
            align: 'left',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Estimated-single-state" />,// 预估单状态
            dataType: receipt.values,
            dataIndex: 'verifyStatus',
            align: 'left',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.generation-date" />,// 生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDatetime',
            align: 'left',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Generation-personnel" />,// 生成人员
            dataIndex: 'generateUser',
            align: 'left',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.confirmation-date" />,// 确认日期
            dataType: 'dateTime',
            dataIndex: 'checkDatetime',
            align: 'left',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.confirmation-personnel" />,// 确认人员
            dataIndex: 'checkUser',
            align: 'left',
            // sorter: false,
            width: 130
        }, {
            //     title: <FormattedMessage id="lbl.update-people" />,// 更新人员
            //     dataIndex: 'recordUpdateUser',
            //     align:'left',
            // sorter: false,
            //     width: 120
            // },{
            //     title: <FormattedMessage id="lbl.update-date" />,// 更新日期
            //     dataType: 'dateTime',
            //     dataIndex: 'recordUpdateDate',
            //     align:'left',
            // sorter: false,
            //     width: 120,
            // },{
            title: <FormattedMessage id="lbl.generate-package" />,// 是否生成数据包
            dataType: packageData.values,
            dataIndex: 'pkgFlag',
            align: 'left',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Generate-package-batch" />,// 生成数据包批次
            dataIndex: 'pkgProcessId',
            // dataType: 'dataAmount',
            align: 'left',
            // sorter: false,
            width: 120,
            render: (text, record) => {
                return text ? text : 0;
            }
        }
    ]

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.COMM_ER_EXP_SEARCHERRECEIPTBILL_LIST, {
            method: "POST",
            data: {
                page: {
                    pageSize: 0,
                    current: 0
                },
                params: {
                    ...queryData,
                    checkDate: undefined,
                    generateDate: undefined,
                    checkDateFrom: queryData.checkDate ? momentFormat(queryData.checkDate[0]) : undefined,
                    checkDateTo: queryData.checkDate ? momentFormat(queryData.checkDate[1]) : undefined,
                    generateDateFrom: queryData.generateDate ? momentFormat(queryData.generateDate[0]) : undefined,
                    generateDateTo: queryData.generateDate ? momentFormat(queryData.generateDate[1]) : undefined,
                },
                excelFileName: intl.formatMessage({ id: 'menu.afcm.comm.er.est-sheet' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        companyCode: intl.formatMessage({ id: "lbl.company" }),     // 公司
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        // activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),    // 业务日期  
                        ygListCode: intl.formatMessage({ id: "lbl.Estimated-order-number" }),    // 预估单号码  
                        tmpYgListCode: intl.formatMessage({ id: "lbl.Temporary.estimated-order-number" }),    // 临时预估单号码  
                        verifyStatus: intl.formatMessage({ id: "lbl.Estimated-single-state" }),    // 预估单状态  
                        generateDatetime: intl.formatMessage({ id: "lbl.generation-date" }),  // 生成日期
                        generateUser: intl.formatMessage({ id: "lbl.Generation-personnel" }),  // 生成人员
                        checkDatetime: intl.formatMessage({ id: "lbl.confirmation-date" }),  // 确认日期
                        checkUser: intl.formatMessage({ id: "lbl.confirmation-personnel" }),  // 确认人员
                        pkgFlag: intl.formatMessage({ id: "lbl.generate-package" }),  // 是否生成数据包
                        pkgProcessId: intl.formatMessage({ id: "lbl.Generate-package-batch" }),  // 生成数据包批次
                    },
                    // sumCol: {//汇总字段
                    // },
                    sheetName: intl.formatMessage({ id: 'menu.afcm.comm.er.est-sheet' }),//sheet名称
                }],
            },
            headers: {
                "biz-source-param": "BLG"
            },
            responseType: 'blob',
        })
        // if (result && result.success == false) {  //若无数据，则不下载
        //     setSpinflag(false);
        //     Toast('', result.errorMessage, 'alert-error', 5000, false);
        //     return
        // } else {
        if (result.size < 1) {
            setSpinflag(false)
            Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
            return
        } else {
            setSpinflag(false);
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            let blob = new Blob([result], { type: "application/x-xls" });
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.comm.er.est-sheet' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.comm.er.est-sheet' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    const queryFun = async (pagination, formData) => {
        const result = await request($apiUrl.COMM_ER_SEARCH_ER_RECEIPT_BILL, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    ...formData,
                    checkDate: undefined,
                    generateDate: undefined,
                    checkDateFrom: formData.checkDate ? momentFormat(formData.checkDate[0]) : undefined,
                    checkDateTo: formData.checkDate ? momentFormat(formData.checkDate[1]) : undefined,
                    generateDateFrom: formData.generateDate ? momentFormat(formData.generateDate[0]) : undefined,
                    generateDateTo: formData.generateDate ? momentFormat(formData.generateDate[1]) : undefined,
                }
            }
        })
        if (result.success) {
            let data = result.data;
            if (pagination.pageSize != page.pageSize) {
                pagination.current = 1
            }
            setPage({ ...pagination })
            setSpinflag(false);
            setTableData([]);
            let listdata = data.commissionYgList;
            setTableData(data.commissionYgList);
            setTabTotal(data.totalCount);
            // afcmCommonController(setTableData, listdata, {
            //     packageData: packageData
            // });
        } else {
            setSpinflag(false);
            setTableData([]);
            setTabTotal(0);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 查询
    const queryBtn = async (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        setBackFlag(true);
        setSpinflag(true);
        let query = queryForm.getFieldValue();
        if (!query.agencyCode || !query.checkDate && !query.generateDate && !query.temperReceiptCode && !query.erReceiptCode && !query.billReferenceCode) {
            setBackFlag(false);
            setSpinflag(false);
            // 预估单号码/生成日期/确认日期/提单号码/临时预估单号码不能同时为空
            !query.agencyCode ? Toast('', formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false) : Toast('', formatMessage({ id: 'lbl.check-query-estimate-sheet' }), 'alert-error', 5000, false)
        } else {
            queryFun(pagination, query);
        }
    }

    // 多选
    const setSelectedRows = (val) => {
        console.log(val);
    }

    // 双击  明细信息列表
    const doubleClickRow = async (parameterNew) => {
        console.log(parameterNew)
        setObjMessage({});
        setSpinflag(true);
        setDetailsList([]);   //  列表
        setDetailsStatisticsList([]);    // 统计列表
        // setHeaderTitle(parameterNew.ygListCode);   // 头标题
        setparameter(parameterNew);
        setIsModalVisible(true);
        let formData = queryForm.getFieldValue();

        const result = await request($apiUrl.COMM_ER_LOAD_ER_RECEIPT, {
            method: "POST",
            data: {
                params: {
                    uuid: parameterNew.ygListUuid,
                    pageSize: 10,
                    start: 1,
                }
            }
        })
        console.log(result)
        if (result.success) {
            Toast('', result.message, 'alert-success', 5000, false)
            setSpinflag(false);
            let data = result.data;
            setDetailsList(data.commissionYgDetailList);   //  列表
            setDetailsListTotal(data.totalCount);  // 列表条数
            setMessageHeader(data.commissionYgList[0]);   //  头信息
            setHeaderTitle(data.commissionYgList[0].ygListCode);
            setDetailsStatisticsList(data.commissionStatistics);    // 统计列表
            setObjMessage({ alertStatus: 'alert-success', message: result.message });
        } else {
            setSpinflag(false);
            setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
        }
    }

    const initData = {
        isModalVisible,
        setIsModalVisible,
        headerTitle,
        detailsList,
        detailsStatisticsList,
        messageHeader,
        detailsListTotal,
        receipt,
        withinBoundary,
        commType,
        parameter,
        setDetailsList,   //  列表
        setDetailsListTotal,  // 列表条数
        setMessageHeader,   //  头信息
        setHeaderTitle,
        setDetailsStatisticsList,    // 统计列表
        setObjMessage,
        objMessage,
    }

    // 重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setObjMessage({});
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
        setTableData([]);
        setTabTotal(0);
        setBackFlag(true);
        setPage({
            current: 1,
            pageSize: 10
        })
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
                        <Select disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select style={{ background: backFlag ? "white" : "yellow" }} showSearch={true} styleFlag={backFlag} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}/>   */}
                        {/* <Select showSearch={true} styleFlag={backFlag} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
                        {/* 佣金大类 */}
                        {/* <Select name='commissionBigType' label={<FormattedMessage id='lbl.commission-big-type'/>}  span={6} options={commissionCategories}/> */}
                        {/* 预估单号码 */}
                        <InputText name='erReceiptCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Estimated-order-number' />} span={6} />
                        {/* 临时预估单号码 */}
                        <InputText name='temperReceiptCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Temporary.estimated-order-number' />} span={6} />
                        {/* 预估单状态 */}
                        <Select flag={true} name='erReceiptVerifyStatus' label={<FormattedMessage id='lbl.Estimated-single-state' />} span={6} options={receipt.values} />
                        {/* 确认日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='checkDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.confirmation-date" />} />
                        {/* 生成日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.generation-date" />} />
                        {/* SVVD */}
                        {/* <InputText name='billOfLadingNumber' label={<FormattedMessage id='lbl.SVVD'/>}  disabled span={6}/> */}
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 是否生成数据包 */}
                        <Select flag={true} name='packageFlag' label={<FormattedMessage id='lbl.generate-package' />} span={6} options={packageData.values} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <CosButton disabled={tableData.length ? false : true} onClick={downloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='lbl.download' /></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置按钮 */}
                    <CosButton onClick={reset}> < ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询按钮 */}
                    <CosButton onClick={() => queryBtn(page, null, 'search')}> < SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={queryBtn}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    setSelectedRows={setSelectedRows}
                    pageSize={page.pageSize}
                    current={page.current}
                    // rowSelection={{
                    // selectedRowKeys:checked,
                    // onChange:(key, row)=>{
                    //     setChecked(key);
                    //     setUuidData(row);
                    //     selectFun(detailedData, row);
                    // }
                    // }}
                    handleDoubleClickRow={doubleClickRow}
                    selectWithClickRow={true}
                    rowSelection={null}
                />
            </div>
            <QueryEstimateSheetPopup initData={initData} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default QueryEstimateSheet