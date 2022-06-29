// 查询结转实付佣金
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, acquireSelectDataExtend, formatCurrencyNew, TradeData, momentFormat, agencyCodeData } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
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
let PCqueryType = '';
const QueryaPCommission = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [eovData, setEovData] = useState({}); // EOV    
    const [reimbursementStatus, setReimbursementStatus] = useState({});  // 报账单状态
    const [reimbursementState, setReimbursementState] = useState({}); // 费用状态
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [priceIncludingTax, setPriceIncludingTax] = useState({});  // 是否含税价
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [trade, setTrade] = useState({});  // 贸易区
    const [tradeCode, setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [costStatus, setCostStatus] = useState({}); // 状态
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    // const [verify, setVerify] = useState({}); // 费用状态
    const [flagBit, setFlagBit] = useState({});         // 退回标志位
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    const [tableData, setTableData] = useState([]);  // 列表数据
    const [statisticsData, setStatisticsData] = useState([]);      // 统计
    const [tabTabTotal, setTabTotal] = useState([]);    // table条数
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [header, setHeader] = useState(true);    // table表头切换
    const [spinflag, setSpinflag] = useState(false);     // 加载
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
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    useEffect(() => {
        acquireSelectData('CR.CHECK.STATUS', setFlagBit, $apiUrl);// 退回标志位
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        acquireSelectData('AFCM.EOV.STATUS', setEovData, $apiUrl);// EOV
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);     //    是否含税价

        acquireCompanyData(setCompanysData, $apiUrl);//公司
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);    // 协议状态
        // acquireSelectData('AFCM.ER.VERIFY.STATUS', setVerify, $apiUrl);// 费用状态
        acquireSelectData('AFCM.ER.VERIFY.RECEIPT.STATUS', setCostStatus, $apiUrl);   // 状态
        acquireSelectData('AFCM.CR.VERIFY.STATUS', setReimbursementState, $apiUrl);     // 费用状态 
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setReimbursementStatus, $apiUrl);   // 报账单状态

        // company($apiUrl, setAgencyCode);     // 代理编码
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类 and 佣金小类
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
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

    // 贸易区联动
    const companyIncident = (value) => {
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        queryForm.setFieldsValue({
            tradeCode: null,
            tradeLaneCode: null
        })
        TradeData($apiUrl, value, setTradeCode);
    }

    // Trade
    const trades = (value) => {
        setTradeLine([]);   // 贸易线
        queryForm.setFieldsValue({
            tradeLaneCode: null
        })

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

    // 佣金大类与佣金类型联动
    const selectChangeBtn = (value, all) => {
        setCommissionType({});  // 佣金类型
        queryForm.setFieldsValue({
            commissionType: null
        })
        let data = all.linkage ? all.linkage.value : null;
        data ? acquireSelectData('COMMISSION.CLASS.' + data, setCommissionType, $apiUrl) : null;     // 佣金大类 and 佣金小类
    }

    // 列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.generation-date' />,// 生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDate',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Estimated-order-number' />,// 预估单号码
            dataIndex: 'ygListCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Invoice-number' />,// 发票号码
            dataIndex: 'yfListCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,// 报账单号码
            dataIndex: 'sfListCode',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commType.values,
            dataIndex: 'commissionType',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.version-number" />,// 版本号
            dataIndex: 'versionNumber',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Trade-line' />,// 贸易线
            dataIndex: 'cargoTradeLaneCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.pdr-fnd" />,// POR/FND
            dataIndex: 'porFndQskey',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ac.fee.svvd.base" />,// SVVD(Base)
            dataIndex: 'baseSvvdId',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.port-base" />,// 港口(Base)
            dataIndex: 'basePortCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.office" />,// Office
            dataIndex: 'officeCode',
            // sorter: false,
            width: 120
        }, {
            // title: <FormattedMessage id="lbl.Booking-Party" />,// Booking Party
            //     title: <FormattedMessage id="lbl.sapid" />,// SAP ID
            //     dataIndex: 'bookingPartyCode',
            //     // sorter: false,
            //     width: 120
            // }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,// 是否含税价
            dataType: priceIncludingTax.values,
            dataIndex: 'vatFlag',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,// 协议币税金(参考)
            dataIndex: 'vatAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,// 应付网点金额
            dataIndex: 'paymentAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.AP-outlets" />,// 应付网点
            dataIndex: 'customerSapId',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agency-net-income" />,// 代理净收入
            dataIndex: 'updatedTotalAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />, // 	向谁报账
            dataIndex: 'sfSide',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.profit-center" />,// 利润中心
            dataIndex: 'profitCenterCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Booking-Party" />,// Booking Party
            dataIndex: 'bookingPartyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Standard-currency" />,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,// 本位币税金(参考)
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150
        }, {
            title: <FormattedMessage id="lbl.settlement-currency" />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)
            dataIndex: 'vatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150
        }, {
            title: <FormattedMessage id="lbl.within-boundary" />,// 是否边界内
            dataType: withinBoundary.values,
            dataIndex: 'excludeFlag',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Cost-status" />,// 费用状态
            dataType: reimbursementState.values,
            dataIndex: 'verifyStatus',
            // sorter: false,
            width: 130,
        }, {
            title: <FormattedMessage id="lbl.Reimbursement-status" />,// 报账单状态
            dataType: costStatus.values,
            dataIndex: 'listVerifyStatus',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.twelve-size" />,// 12/20尺箱
            dataIndex: 'container20',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.forty-size" />,// 40/45尺箱
            dataIndex: 'container40',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Total-Teu-or-Freight" />,// Total Teu or Freight
            dataIndex: 'commissionBase',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.rate-one" />,// 费率
            dataIndex: 'commissionRate',
            align: 'right',
            // sorter: false,
            width: 120,
            render: (text, record, index) => {
                return formatCurrencyNew(text, 4)
            }
        }, {
            title: <FormattedMessage id="lbl.Contract-No" />,// 合约号
            dataIndex: 'agmtId',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Return-flag" />,// 退回标志位
            dataIndex: 'checkStatus',
            dataType: flagBit.values,
            // sorter: false,
            width: 120
        },
    ]

    // 统计列表
    const columnsdata = [
        {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'totalAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)
            dataIndex: 'vatAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金(参考)
            dataIndex: 'reviseVatAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }
    ]

    // 查询
    const pageChange = async (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        console.log(queryForm.getFieldValue())
        if (!formData.agencyCode || !formData.crReceiptCode && !formData.baseSvvd && !formData.svvd && !formData.billReferenceCode && !formData.activeDate && !formData.generateDate) {
            setBackFlag(false);
            setSpinflag(false);
            !formData.agencyCode ? Toast('', intl.formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false) : Toast('', intl.formatMessage({ id: 'lbl.cr-PaidCommission' }), 'alert-error', 5000, false);
        } else {
            setBackFlag(true);
            queryFun(formData, pagination);
        }
    }

    const queryFun = async (formData, pagination) => {
        const result = await request($apiUrl.COMM_CR_SEARCH_CR_COMMISSION_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                operateType: PCqueryType,
                "params": {
                    ...formData,
                    activeDate: undefined,
                    generateDate: undefined,
                    activeDateFrom: formData.activeDate ? momentFormat(formData.activeDate[0]) : undefined,
                    activeDateTo: formData.activeDate ? momentFormat(formData.activeDate[1]) : undefined,
                    generateDateFrom: formData.generateDate ? momentFormat(formData.generateDate[0]) : undefined,
                    generateDateTo: formData.generateDate ? momentFormat(formData.generateDate[1]) : undefined,
                },
            }
        })
        console.log(result);
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            setTableData([]);     // 列表
            setStatisticsData([]);      // 统计
            setTableData(data.commissionSfListDetail);     // 列表
            setStatisticsData(data.commissionStatistics);      // 统计
            setTabTotal(data.totalCount);   // 条数
            // if(pagination.pageSize!=page.pageSize){
            //     pagination.current=1
            // }
            setPage({ ...pagination })

            let listdata = data.commissionSfListDetail;
            // afcmCommonController(setTableData, listdata, {
            //     withinBoundary: withinBoundary,
            //     priceIncludingTax: priceIncludingTax
            // });
        } else {
            setSpinflag(false);
            setTableData([]);     // 列表
            setStatisticsData([]);      // 统计
            setTabTotal(0);   // 条数
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setCommissionType({});  // 佣金类型
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        setBackFlag(true);
        setStatisticsData([]);
        setTableData([]);
        setTabTotal([]);
        queryForm.resetFields();
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
                        {/* <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
                        {/* <InputText disabled name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} />   */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} style={{ background: backFlag ? "white" : "yellow" }} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 佣金大类 */}
                        <Select flag={true} name='commisionClass' selectChange={selectChangeBtn} label={<FormattedMessage id='lbl.commission-big-type' />} span={6} options={commissionCategories.values} />
                        {/* 佣金类型 */}
                        <Select flag={true} name='commissionType' label={<FormattedMessage id='lbl.Commission-type' />} span={6} options={commissionType.values} />
                        {/* 佣金模式 */}
                        <Select flag={true} name='commissionMode' span={6} options={theCommission.values} label={<FormattedMessage id='lbl.The-Commission' />} />
                        {/* 贸易区 */}
                        <Select flag={true} name='tradeZoneCode' label={<FormattedMessage id='lbl.argue.trade-code' />} span={6} options={trade.values} selectChange={companyIncident} />
                        {/* Trade */}
                        <Select flag={true} name='tradeCode' label={<FormattedMessage id='lbl.Trade' />} span={6} options={tradeCode} selectChange={trades} />
                        {/* 贸易线 */}
                        <Select flag={true} name='tradeLaneCode' label={<FormattedMessage id='lbl.Trade-line' />} span={6} options={tradeLine} />
                        {/* Office */}
                        <InputText name='officeCode' label={<FormattedMessage id='lbl.office' />} span={6} />
                        {/* 业务日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='activeDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.argue.bizDate" />} />
                        {/* 生成日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.generation-date" />} />
                        {/* 航线(Base) */}
                        <InputText name='baseServiceLoopCode' label={<FormattedMessage id='lbl.route-base' />} span={6} />
                        {/* SVVD(Base) */}
                        <InputText name='baseSvvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.ac.fee.svvd.base' />} span={6} />
                        {/* 港口(Base) */}
                        <InputText name='basePortCode' label={<FormattedMessage id='lbl.port-base' />} span={6} />
                        {/* 报账单状态 reimbursementStatus.values状态错误*/}
                        <Select flag={true} options={costStatus.values} name='crVerifyReceiptStatus' label={<FormattedMessage id='lbl.Reimbursement-status' />} span={6} />
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route' />} span={6} />
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD' />} span={6} />
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port' />} span={6} />
                        {/* 费用状态 costStatus状态错误*/}
                        <Select flag={true} options={reimbursementState.values} name='verifyStatus' label={<FormattedMessage id='lbl.Cost-status' />} span={6} />
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 发票号码 */}
                        <InputText name='invoiceNo' label={<FormattedMessage id='lbl.Invoice-number' />} span={6} />
                        {/* 报账单号码 */}
                        <InputText name='crReceiptCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number' />} span={6} />
                        {/* 是否边界内 */}
                        <Select flag={true} name='exFlag' label={<FormattedMessage id='lbl.within-boundary' />} options={withinBoundary.values} span={6} />
                        {/* 预估单号码 */}
                        <InputText name='erListCode' label={<FormattedMessage id='lbl.Estimated-order-number' />} span={6} />
                        {/* SAP ID */}
                        <InputText name='bookParty' label={<FormattedMessage id='lbl.sapid' />} span={6} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    {/* <CosButton onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='btn.download' /></CosButton> */}
                    <CosDownLoadBtn
                        disabled={tableData.length ? false : true}
                        downLoadTitle={'menu.afcm.comm.cr.paid-comm'}
                        downColumns={[{ dataCol: columns, sumCol: columnsdata }]}
                        downLoadUrl={'COMM_CR_EXP_CR_COMMISSION_LIST'}
                        queryData={queryForm.getFieldValue()}
                        setSpinflag={setSpinflag}
                        btnName={'lbl.download'} />
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 无条件查询 */}
                    <CosButton onClick={() => {
                        PCqueryType = 'UNCONDITIONAL'
                        pageChange(page, null, 'search')
                    }}> <SearchOutlined /><FormattedMessage id='btn.unconditional-query' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={() => {
                        PCqueryType = 'SEARCH'
                        pageChange(page, null, 'search')
                    }}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='entryUuid'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    rowSelection={null}
                />
            </div>
            <div className='footer-table' style={{ marginTop: '10px', width: '60%' }}>
                <PaginationTable
                    rowKey="lcrAgreementHeadUuid"
                    columns={columnsdata}
                    dataSource={statisticsData}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            <Loading spinning={spinflag} />
        </div>
    )
}
export default QueryaPCommission