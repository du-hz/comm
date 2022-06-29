// 基础版历史信息
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, afcmCommonController, TradeData, momentFormat, agencyCodeData, acquireSelectDataExtend } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import CosButton from '@/components/Common/CosButton'
import Loading from '@/components/Common/Loading'
import { CosDownLoadBtn } from '@/components/Common/index'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

const HistoricalInformationOfBasicEdition = () => {
    const [queryForm] = Form.useForm();
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [commissionType, setCommissionType] = useState({}); // 佣金类型
    const [trade, setTrade] = useState({});  // 贸易区
    const [tradeCode, setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [verify, setVerify] = useState({}); // 费用状态
    const [receipt, setReceipt] = useState({}); // 预估单状态
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [tableData, setTableData] = useState([]);  // table 数据
    const [tabTabTotal, setTabTotal] = useState([]);    // table条数
    const [commissionCategories, setCommissionCategories] = useState({});  // 佣金大类
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [currentState, setCurrentState] = useState({});//当前状态

    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [header, setHeader] = useState(true);    // table表头切换
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        // acquireSelectData('COMM.TYPE', setCommissionType, $apiUrl);// 佣金类型
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类 and 佣金小类
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区
        acquireSelectData('AFCM.ER.VERIFY.STATUS', setVerify, $apiUrl);// 费用状态
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setReceipt, $apiUrl);// 预估单状态
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('CURRENT.STATUS', setCurrentState, $apiUrl);     // 当前状态 
        acquireCompanyData(setCompanysData, $apiUrl);//公司
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
    }, [])

    useEffect(() => {
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    // 佣金大类与佣金类型联动
    const selectChangeBtn = (value, all) => {
        setCommissionType({});  // 佣金类型
        queryForm.setFieldsValue({
            commissionType: null
        })
        let data = all.linkage ? all.linkage.value : null;
        data ? acquireSelectData('COMMISSION.CLASS.' + data, setCommissionType, $apiUrl) : null;     // 佣金大类 and 佣金小类
    }

    // 贸易区联动
    const companyIncident = (value) => {
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        queryForm.setFieldsValue({
            trade: null,
            tradeLane: null
        })
        TradeData($apiUrl, value, setTradeCode);
    }

    // Trade
    const trades = (value) => {
        setTradeLine([]);   // 贸易线
        queryForm.setFieldsValue({
            tradeLaneCode: null
        })
        console.log(tradeCode)
        tradeCode.map((v, i) => {
            if (v.value == value) {
                let data = v.oTradeLanes
                data.map((v, i) => {
                    v['value'] = v.tradeLaneCode
                    v['label'] = v.tradeLaneCode
                })
                setTradeLine(data)
            }
        })
    }

    // 表
    const columns = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'commissionType',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.version-number" />,// 版本号
            dataIndex: 'versionNumber',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.current-state" />,// 当前状态
            dataType: currentState.values,
            dataIndex: 'currentStatus',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Contract-No" />,// 合约号
            dataIndex: 'agreementId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.start-agency' />,// 起始代理编码
            dataIndex: 'fromAgencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.eov-state" />,// EOV状态
            dataIndex: 'endofVoyageStatus',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Booking-Party" />,// Booking Party
            dataIndex: 'bookingPartyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align: 'center',
            sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataIndex: 'totalAmount',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount-usd" />,// 协议币调整金额(USD)	
            dataIndex: 'totalAmountInUsd',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,// 协议币调整金额
            dataIndex: 'reviseAmount',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.settlement-currency" />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.On-line" />,// 是否上线
            dataIndex: 'enableIndicator',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.within-boundary" />,// 是否边界内
            dataIndex: 'excludeFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align: 'center',
            sorter: false,
            width: 150
        }, {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.ht.statement.upload-voyage-number-Base" />,// 航次(Base)
            dataIndex: 'baseSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port-base" />,// 港口(Base)
            dataIndex: 'basePortCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Cargo-TL" />,// Cargo TL
            dataIndex: 'cargoTradeLaneCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Short-haul-cargo-mark" />,// 短程货标志
            dataIndex: 'shortDistanceIndicator',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Short-haul-cargo-type" />,// 短程货类型
            dataIndex: 'shortAccountType',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.pdr-fnd" />,// POR/FND
            dataIndex: 'porFndQskey',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.office" />,// Office
            dataIndex: 'officeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Date-of-payment-generation' />,// 实付生成日期
            dataIndex: 'sfGenerateDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Actual-reimbursement-No" />,// 实付报账单号码
            dataIndex: 'sfListCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Date-of-confirmation-of-actual-payment" />,// 实付确认日期
            dataIndex: 'sfVerifyDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Actual-payment-confirmation-status" />,// 实付确认状态
            dataIndex: 'sfVerifyStatus',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Paid-in-bookkeeping-status" />,// 实付记账状态
            dataIndex: 'sfPostStatus',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Paid-in-bookkeeping-date" />,// 实付记账日期
            dataIndex: 'sfBudat',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Box-size" />,// 箱型尺寸
            dataIndex: 'commissionBase',
            align: 'center',
            sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.rate-one" />,// 费率
            dataIndex: 'commissionRate',
            align: 'center',
            sorter: false,
            width: 120,
        },
    ]

    // 查询
    const pageChange = async (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        if (search) pagination.current = 1
        let formData = queryForm.getFieldValue();
        if (!formData.billReferenceCode && !formData.svvd && !formData.baseSvvd && !formData.crReceiptCode && !formData.generateDate && !formData.activityDate) {
            setSpinflag(false);
            setBackFlag(false);
            Toast('', formatMessage({ id: 'lbl.afcm_hist_mess' }), 'alert-error', 5000, false);
        } else {
            setBackFlag(true);
            const result = await request($apiUrl.COMM_QUERY_QUERY_HIS_LIST, {
                method: "POST",
                data: {
                    page: pagination,
                    params: {
                        ...formData,
                        activityDate: undefined,
                        generateDate: undefined,
                        activityDateFrom: formData.activityDate ? momentFormat(formData.activityDate[0]) : undefined,
                        activityDateTo: formData.activityDate ? momentFormat(formData.activityDate[1]) : undefined,
                        generateDateFrom: formData.generateDate ? momentFormat(formData.generateDate[0]) : undefined,
                        generateDateTo: formData.generateDate ? momentFormat(formData.generateDate[1]) : undefined,
                    }
                }
            })
            if (result.success) {
                setSpinflag(false);
                setPage({ ...pagination })
                let data = result.data;
                setTableData(data.resultList);
                setTabTotal(data.totalCount);
            } else {
                setSpinflag(false);
                setTableData([]);
                setTabTotal(0);
                Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
        }
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();

        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })

        setTableData([]);
        setTabTotal(0);
        setCommissionType({});  // 佣金类型
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        setBackFlag(true);
        setPage({
            current: 1,
            pageSize: 10
        })
    }

    return (
        <div className='parent-box'>
            <div className='header-from'>
                <Form form={queryForm} name='func'>
                    <Row>
                        {/* 船东 */}
                        <Select disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} style={{ background: backFlag ? "white" : "yellow" }} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 代理编码 */}
                        {/* <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} />   */}
                        {/* 佣金模式 */}
                        <Select flag={true} name='commissionMode' span={6} options={theCommission.values} label={<FormattedMessage id='lbl.The-Commission' />} />
                        {/* 佣金大类 */}
                        <Select flag={true} name='commissionClass' label={<FormattedMessage id='lbl.commission-big-type' />} span={6} selectChange={selectChangeBtn} options={commissionCategories.values} />
                        {/* 佣金类型 */}
                        <Select flag={true} name='commissionType' span={6} options={commissionType.values} label={<FormattedMessage id='lbl.Commission-type' />} />
                        {/* 提单号码 */}
                        <InputText styleFlag={backFlag} name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 贸易区 */}
                        <Select flag={true} name='tradeZoneCode' label={<FormattedMessage id='lbl.argue.trade-code' />} span={6} options={trade.values} selectChange={companyIncident} />
                        {/* Trade */}
                        <Select flag={true} name='tradeCode' label={<FormattedMessage id='lbl.Trade' />} span={6} options={tradeCode} selectChange={trades} />
                        {/* 贸易线 */}
                        <Select flag={true} name='tradeLaneCode' label={<FormattedMessage id='lbl.Trade-line' />} span={6} options={tradeLine} />
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} name='activityDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.argue.bizDate" />} span={6} />
                        {/* 当前状态 */}
                        <Select flag={true} name='currentStatus' label={<FormattedMessage id='lbl.current-state' />} span={6} options={currentState.values} />
                        {/* SVVD */}
                        <InputText styleFlag={backFlag} name='svvd' label={<FormattedMessage id='lbl.SVVD' />} span={6} />
                        {/* 生成日期 */}
                        <DoubleDatePicker flag={false} style={{ background: backFlag ? "white" : "yellow" }} span={6} name='generateDate' label={<FormattedMessage id="lbl.generation-date" />} />
                        {/* 港口 */}
                        <InputText name='port' label={<FormattedMessage id='lbl.port' />} span={6} />
                        {/* SVVD(Base) */}
                        <InputText styleFlag={backFlag} name='svvdBase' label={<FormattedMessage id='lbl.ac.fee.svvd.base' />} span={6} />
                        {/* 港口(Base) */}
                        <InputText name='portBase' label={<FormattedMessage id='lbl.port-base' />} span={6} />
                        {/* 报账单号码 */}
                        <InputText styleFlag={backFlag} name='sfListCode' label={<FormattedMessage id='lbl.Reimbursement-number' />} span={6} />

                        {/* <Select flag={true} name='crReceiptCode' label={<FormattedMessage id='lbl.Reimbursement-number'/>}  span={6} options={theCommission.values}/> */}
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    <CosDownLoadBtn
                        disabled={tableData.length ? false : true}
                        downLoadTitle={'menu.afcm.CalFeeQy.comp.bas-hist-info'}
                        downColumns={[{ dataCol: columns }]}
                        downLoadUrl={'COMM_QUERY_EXP_OFFFINE_HIS'}
                        queryData={queryForm.getFieldValue()}
                        setSpinflag={setSpinflag}
                        btnName={'lbl.download'} />
                    {/* <CosButton onClick={downloadBtn}> <CloudDownloadOutlined /><FormattedMessage id='btn.download'/></CosButton> */}
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <CosButton onClick={() => reset()}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={() => pageChange(page, null, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='lcrAgreementHeadUuid'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    rowSelection={null}
                    pageSize={page.pageSize}
                    current={page.current}
                />
            </div>
            <Loading spinning={spinflag} />
        </div>
    )
}
export default HistoricalInformationOfBasicEdition


// // 下载
// const downloadBtn = async() => {
//     Toast('', '', '', 5000, false);
//     setSpinflag(true);
//     let downloadData = {};
//     columns.map((v, i) => {
//         downloadData[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
//     })
//     let queryData = queryForm.getFieldValue();
//     const result = await request($apiUrl.COMM_QUERY_EXP_COMMISSION_HIS,{
//         method:"POST",
//         data:{
//             params: {
//                 ...queryData,
//                 activityDate: undefined,
//                 activityDateFrom: queryData.activityDate ? momentFormat(queryData.activityDate[0]) : undefined,
//                 activityDateTo: queryData.activityDate ? momentFormat(queryData.activityDate[1]) : undefined,
//             },
//             excelFileName: intl.formatMessage({id: 'menu.afcm.CalFeeQy.comp.bas-hist-info'}), //文件名
//             sheetList: [{//sheetList列表
//                 dataCol: downloadData,  //列表字段
//                 sheetName: intl.formatMessage({id: 'menu.afcm.CalFeeQy.comp.bas-hist-info'}),//sheet名称
//             }],
//         },
//         headers: {
//     　　　　"biz-source-param": "BLG"
//     　　 },
//         responseType: 'blob',
//     })
//     if(result && result.success == false){  //若无数据，则不下载
//         setSpinflag(false);
//         Toast('', result.errorMessage, 'alert-error', 5000, false);
//         return
//     }else{
//         // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
//         let blob = new Blob([result], { type: "application/x-xls" });
//         if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
//             navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.CalFeeQy.comp.bas-hist-info'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
//         } else {
//             let downloadElement = document.createElement('a');  //创建元素节点
//             let href = window.URL.createObjectURL(blob); // 创建下载的链接
//             downloadElement.href = href;
//             downloadElement.download = intl.formatMessage({id: 'menu.afcm.CalFeeQy.comp.bas-hist-info'}) + '.xlsx'; // 下载后文件名
//             document.body.appendChild(downloadElement); //添加元素
//             downloadElement.click(); // 点击下载
//             document.body.removeChild(downloadElement); // 下载完成移除元素
//             window.URL.revokeObjectURL(href); // 释放掉blob对象
//         }
//         setSpinflag(false);
//     }
// }