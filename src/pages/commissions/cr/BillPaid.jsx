// 查询结转实付报账单
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, company, acquireSelectDataExtend, momentFormat, agencyCodeData } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import BillPaidDetails from './BillPaidDetails';
import Loading from '@/components/Common/Loading'
// import CosButton from '@/components/Common/CosButton'
import { CosDownLoadBtn, CosButton } from '@/components/Common/index'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

let formlayouts = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
}

const BillPaid = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [reimbursementStatus, setReimbursementStatus] = useState({});  // 报账单状态
    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [eovData, setEovData] = useState({}); // EOV
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [packageData, setPackage] = useState({}); // 是否生成数据包
    const [priceIncludingTax, setPriceIncludingTax] = useState({});  // 是否含税价
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [reimbursementState, setReimbursementState] = useState({}); // 报账单状态
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    const [tableData, setTableData] = useState([]);  // table 数据
    const [tabTabTotal, setTabTotal] = useState([]);    // table条数
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [header, setHeader] = useState(true);    // table表头切换
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [headerTitle, setHeaderTitle] = useState("");
    const [detailsList, setDetailsList] = useState([]);    // 弹窗-列表
    const [detailsListTotal, setDetailsListTotal] = useState([]);    // 弹窗-条数
    const [detailsStatisticsList, setDetailsStatisticsList] = useState([]);    // 弹窗-统计列表
    const [messageHeader, setMessageHeader] = useState([]);    // 弹窗-头信息
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [uuid, setUuid] = useState('');     // 加载
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })
    const [pageDetails, setPageDetails] = useState({
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
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    useEffect(() => {
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     //    佣金类型
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        acquireSelectData('AFCM.EOV.STATUS', setEovData, $apiUrl);// EOV
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setReimbursementStatus, $apiUrl);   // 报账单状态
        acquireSelectData('AFCM.ER.VERIFY.RECEIPT.STATUS', setReimbursementState, $apiUrl);     // 报账单状态 
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);     //    是否含税价
        acquireSelectData('AFCM.PACKAGE.FLAG', setPackage, $apiUrl);// 是否生成数据包
        acquireCompanyData(setCompanysData, $apiUrl);//公司
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    const columns = [
        {
            title: <FormattedMessage id="lbl.company" />,// 公司
            dataIndex: 'companyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,// 报账单号码
            dataIndex: 'sfListCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.provisional-reimbursement-no" />,// 临时报账单号码
            dataIndex: 'tmpSfListCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.voucher-number" />,// 凭证号码
            dataIndex: 'checkTimes',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Reimbursement-date' />,// 报账日期
            dataType: 'dateTime',
            dataIndex: 'generateDatetime',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Reimbursement-personnel" />,// 报账人员
            dataIndex: 'generateUser',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.confirmation-date' />,// 确认日期
            dataType: 'dateTime',
            dataIndex: 'checkDatetime',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.confirmation-personnel" />,// 确认人员
            dataIndex: 'checkUser',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Reimbursement-status' />,// 报账单状态
            dataType: reimbursementState.values,
            dataIndex: 'verifyStatus',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Tax-coins' />,// 税金（参考）币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Total-amount-tax" />,// 税金（参考）总金额
            dataIndex: 'vatAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.generate-package' />,// 是否生成数据包
            dataType: packageData.values,
            dataIndex: 'pkgFlag',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Generate-package-batch" />,// 生成数据包批次
            dataIndex: 'pkgProcessId',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ac.pymt.claim-note" />,// 备注
            dataIndex: 'userNote',
            // sorter: false,
            width: 120
        }
    ]

    // 查询
    const pageChange = (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        if (!formData.agencyCode || !formData.crReceiptCode && !formData.tempCrReceiptCode && !formData.billReferenceCode && !formData.generateDate && !formData.checkDate) {
            setBackFlag(false)
            setSpinflag(false);
            !formData.agencyCode ? Toast('', intl.formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false) : Toast('', intl.formatMessage({ id: 'lbl.cr-BillPaid' }), 'alert-error', 5000, false);
        } else {
            setBackFlag(true);
            queryFun(pagination, formData);
            // if((formData.checkDateFrom&&!formData.checkDateTo)||(!formData.checkDateFrom&&formData.checkDateTo)||(formData.generateDateFrom&&!formData.generateDateTo)||(!formData.generateDateFrom&&formData.generateDateTo)){
            //     Toast('', formatMessage({id: 'lbl.date-null'}), 'alert-warning', 5000, false);
            //     setSpinflag(false);
            // }else{
            // queryFun(pagination, formData);
            // }
        }
    }

    // 查询通用
    const queryFun = async (pagination, formData) => {
        const result = await request($apiUrl.COMM_CR_SEARCH_CR_INVOICE_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    ...formData,
                    generateDate: undefined,
                    checkDate: undefined,
                    generateDateFrom: formData.generateDate ? momentFormat(formData.generateDate[0]) : undefined,
                    generateDateTo: formData.generateDate ? momentFormat(formData.generateDate[1]) : undefined,
                    checkDateFrom: formData.checkDate ? momentFormat(formData.checkDate[0]) : undefined,
                    checkDateTo: formData.checkDate ? momentFormat(formData.checkDate[1]) : undefined,
                },
            }
        })
        console.log(result);
        if (result.success) {
            setSpinflag(false);
            setTableData([]);
            let data = result.data;
            setTableData(data.commissionSfLists);
            setTabTotal(data.totalCount)
            // if(pagination.pageSize!=page.pageSize){
            //     pagination.current=1
            // }
            setPage({ ...pagination })

            // let listdata = data.commissionSfLists;
            // afcmCommonController(setTableData, listdata, {
            //     packageData: packageData,
            // });
        } else {
            setSpinflag(false);
            setTableData([]);
            setTabTotal(0)
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 双击  明细信息列表
    const doubleClickRow = async (parameter) => {
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        setIsModalVisible(true);
        setUuid(parameter.sfListUuid);
        const result = await request($apiUrl.COMM_CR_SEARCH_ER_RECEIPT_BILL, {
            method: "POST",
            data: {
                params: {
                    sfListUuid: parameter.sfListUuid,
                    // pageSize: pageDetails.pageSize,
                    // start: pageDetails.current,
                    billReferenceCode: formData.billReferenceCode,
                    pageSize: 10,
                    start: 1,
                }
            }
        })
        if (result.success) {
            Toast('', result.message, 'alert-success', 5000, false)
            setSpinflag(false);
            let data = result.data;
            let setIpt = data.commissionSfLists[0];
            setDetailsList(data.commissionSfListDetail);   //  列表
            setDetailsListTotal(data.totalCount);  // 列表条数
            reimbursementState.values.map((v, i) => {
                setIpt.verifyStatus == v.value ? setIpt.verifyStatus = v.label : '';
            })
            setMessageHeader(data.commissionSfLists[0]);   //  头信息
            setHeaderTitle(data.commissionSfLists[0].sfListCode);
            setDetailsStatisticsList(data.commissionStatistics);    // 统计列表

            // let listdata = data.commissionSfLists;
            // setTableData(listdata);
            // afcmCommonController(setTableData, listdata, {
            //     priceIncludingTax: priceIncludingTax,
            //     withinBoundary: withinBoundary
            // });
        } else {
            setSpinflag(false);
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
        commType,
        withinBoundary,
        priceIncludingTax,
        uuid,
        page,
        setSpinflag,
        setDetailsList,
        setDetailsListTotal,
        setMessageHeader,
        setHeaderTitle,
        setDetailsStatisticsList,
        reimbursementState,
        setTableData,
        pageDetails,
        setPageDetails,
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setBackFlag(true);
        queryForm.resetFields();
        setTableData([]);
        setTabTotal(0)
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
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
                        {/* <Select style={{background: backFlag ? "white" : "yellow"}} showSearch={false} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
                        {/* <InputText disabled name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} />   */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} style={{ background: backFlag ? "white" : "yellow" }} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 报账单号码 */}
                        <InputText name='crReceiptCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number' />} span={6} />
                        {/* 临时报账单号码 */}
                        <InputText name='tempCrReceiptCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.provisional-reimbursement-no' />} span={6} />
                        {/* 报账单状态 */}
                        <Select flag={true} options={reimbursementState.values} name='crVerifyReceiptStatus' label={<FormattedMessage id='lbl.Reimbursement-status' />} span={6} />
                        {/* 确认日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='checkDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.confirmation-date" />} />
                        {/* 报账日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.Reimbursement-date" />} />
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
                    {/* 下载 */}
                    {/* <CosButton onClick={downloadBtn}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></CosButton> */}
                    <CosDownLoadBtn
                        disabled={tableData.length ? false : true}
                        downLoadTitle={'menu.afcm.comm.cr.bill-paid'}
                        downColumns={[{ dataCol: columns }]}
                        downLoadUrl={'COMM_CR_EXP_CR_INVOICE_LIST'}
                        queryData={queryForm.getFieldValue()}
                        setSpinflag={setSpinflag}
                        btnName={'lbl.download'} />
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={() => pageChange(page, null, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='sfListCode'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    handleDoubleClickRow={doubleClickRow}
                    selectWithClickRow={true}
                    rowSelection={null}
                />
            </div>
            <BillPaidDetails initData={initData} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default BillPaid