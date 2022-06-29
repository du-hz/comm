// 生成结转实付报账单
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl, connect } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, company, TradeData, momentFormat, agencyCodeData, acquireSelectDataExtend } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Modal } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
const confirm = Modal.confirm;

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SelectOutlined,// 选择预估单
    UnorderedListOutlined,// 全部预估单
} from '@ant-design/icons'

let formlayouts = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
}
let GCFqueryType = '';
const QueryaPCommission = (props) => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [eovData, setEovData] = useState({}); // EOV
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [commisType, setCommisType] = useState({});    // 佣金种类
    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [trade, setTrade] = useState({});  // 贸易区
    const [tradeCode, setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [manualAdjustment, setManualAdjustment] = useState({});    // 手工调整
    const [priceIncludingTax, setPriceIncludingTax] = useState({});  // 是否含税价
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [flagBit, setFlagBit] = useState({});         // 退回标志位
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [tableData, setTableData] = useState([]);  // table 数据
    const [tabTabTotal, setTabTotal] = useState([]);    // table条数
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [header, setHeader] = useState(true);    // table表头切换
    const [statisticsData, setStatisticsData] = useState([]);    // 统计列表
    const [uuidData, setUuidData] = useState([]);    // uuids
    const [spinflag, setSpinflag] = useState(false);     // 加载

    const [checked, setChecked] = useState([]);

    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })
    const [backFlag, setBackFlag] = useState(true);//背景颜色
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
        acquireSelectData('AFCM.COMMISSION.CARGO', setCommisType, $apiUrl);     // 佣金种类 
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区
        acquireSelectData('AFCM.ADJ.MANUAL', setManualAdjustment, $apiUrl);    //    手工调整
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);     //    是否含税价
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     //    佣金类型
        acquireCompanyData(setCompanysData, $apiUrl);//公司
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类 and 佣金小类
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            exFlag: withinBoundary.defaultValue,
            vatFlag: priceIncludingTax.defaultValue,
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        console.log(company.companyType == 0, company.companyCode, acquireData.defaultValue)

    }, [company, acquireData])

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
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
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
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
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
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,// 向谁报账
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
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            // dataType: commType,
            dataIndex: 'commissionType',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: true,
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
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150
        },
    ]

    // // 多选
    // const setSelectedRows = (val) =>{
    //     let data = val.map((v, i) => {
    //         return v.entryUuid;
    //     })
    //     setUuidData(data);
    // }

    // 选中生成报账单 and 全部生成报账单
    const GenerateReimbursement = async (ReimbursementFormType, url) => {
        Toast('', '', '', 5000, false);
        if (tableData.length <= 0) {
            Toast('', intl.formatMessage({ id: 'lbl.Generate-info' }), 'alert-error', 5000, false);
            return;
        } else {
            const confirmModal = confirm({
                title: formatMessage({ id: 'lbl.Generate-Report-Billing' }),
                content: formatMessage({ id: `${ReimbursementFormType == "SELECT_BUILD_CR" ? 'lbl.true-Generate-Report-Billing' : 'lbl.afcm-cr-mess'}` }),
                okText: formatMessage({ id: 'lbl.affirm' }),
                okType: 'danger',
                closable: true,
                cancelText: '',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    let formData = queryForm.getFieldValue();
                    const result = await request($apiUrl[url], {
                        method: "POST",
                        data: ReimbursementFormType == "SELECT_BUILD_CR" ? {
                            operateType: ReimbursementFormType,
                            uuids: uuidData
                        } : {
                            operateType: ReimbursementFormType,
                            params: {
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

                    if (result.success) {
                        setSpinflag(false);
                        pageChange(page, null, 'search', result.message)
                    } else {
                        setSpinflag(false);
                        Toast('', result.errorMessage, 'alert-error', 5000, false);
                    }
                }
            })
        }
    }

    // 查询
    const pageChange = (pagination, options, search, message) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        if (props.user.currentUser.companyCode == '2001' ? (!formData.agencyCode || !formData.commissionCargo) : !formData.agencyCode) {
            setBackFlag(false)
            setSpinflag(false);
            props.user.currentUser.companyCode == '2001' ? Toast('', intl.formatMessage({ id: 'lbl.agencyCode-commissionCargo' }), 'alert-error', 5000, false) : Toast('', intl.formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false)
        } else {
            if (!formData.baseServiceLoopCode && !formData.baseSvvd && !formData.svvd && !formData.billReferenceCode && !formData.activeDate && !formData.generateDate && !formData.serviceLoopCode) {
                setBackFlag(false)
                setSpinflag(false);
                Toast('', intl.formatMessage({ id: 'lbl.query-aP-commission' }), 'alert-error', 5000, false)
            } else {
                setBackFlag(true)
                setChecked([]);
                queryFun(pagination, formData, message);
            }
        }
    }

    // 查询封装
    const queryFun = async (pagination, formData, message) => {
        const result = await request($apiUrl.COMM_CR_SEARCH_PENDING_CR_INVOICE_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                operateType: GCFqueryType,
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
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            setUuidData([]);
            setStatisticsData([]);   // 统计列表
            setTableData([]);     // 列表
            setStatisticsData(data.commissionStatistics);   // 统计列表
            setTableData(data.commissionSfListDetail);     // 列表
            setTabTotal(data.totalCount);  // 条数
            // if (pagination.pageSize != page.pageSize) {
            //     pagination.current = 1
            // }
            setPage({ ...pagination });
            // let listdata = data.commissionSfListDetails;
            // afcmCommonController(setTableData, listdata, {
            //     withinBoundary: withinBoundary,
            //     priceIncludingTax: priceIncludingTax
            // });
        } else {
            setSpinflag(false);
            setUuidData([]);
            setStatisticsData([]);   // 统计列表
            setTableData([]);     // 列表
            setTabTotal(0);  // 条数
            message ? undefined : Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
        message ? Toast('', message, 'alert-success', 5000, false) : undefined;
    }

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.COMM_CR_EXP_PENDING_CR_INVOICE_LIST, {
            method: "POST",
            data: {
                page: {
                    current: 0,
                    pageSize: 0
                },
                params: {
                    ...queryData,
                    activeDate: undefined,
                    generateDate: undefined,
                    activeDateFrom: queryData.activeDate ? momentFormat(queryData.activeDate[0]) : undefined,
                    activeDateTo: queryData.activeDate ? momentFormat(queryData.activeDate[1]) : undefined,
                    generateDateFrom: queryData.generateDate ? momentFormat(queryData.generateDate[0]) : undefined,
                    generateDateTo: queryData.generateDate ? momentFormat(queryData.generateDate[1]) : undefined,
                },
                excelFileName: intl.formatMessage({ id: 'menu.afcm.comm.cr.gen-reimb' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        generateDate: intl.formatMessage({ id: "lbl.generation-date" }),  // 生成日期
                        activityDate: intl.formatMessage({ id: "lbl.argue.bizDate" }),    // 业务日期  
                        ygListCode: intl.formatMessage({ id: "lbl.Estimated-order-number" }),    // 预估单号码  
                        yfListCode: intl.formatMessage({ id: "lbl.Invoice-number" }),    // 发票号码  
                        billReferenceCode: intl.formatMessage({ id: "lbl.bill-of-lading-number" }),     // 提单号码
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),     // 佣金模式
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        versionNumber: intl.formatMessage({ id: "lbl.version-number" }),    // 版本号  
                        cargoTradeLaneCode: intl.formatMessage({ id: "lbl.Trade-line" }),     // 贸易线
                        porFndQskey: intl.formatMessage({ id: "lbl.pdr-fnd" }),    // POR/FND  
                        svvdId: intl.formatMessage({ id: "lbl.SVVD" }),    // SVVD  
                        baseSvvdId: intl.formatMessage({ id: "lbl.ac.fee.svvd.base" }),    // SVVD(Base)  
                        portCode: intl.formatMessage({ id: "lbl.port" }),    // 港口  
                        basePortCode: intl.formatMessage({ id: "lbl.port-base" }),    // 港口(Base)  
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // OFFICE
                        // bookingPartyCode: intl.formatMessage({id: "lbl.sapid"}),     // SAP ID
                        rateCurrencyCode: intl.formatMessage({ id: "lbl.Agreement-currency" }),    // 协议币种  
                        totalAmount: intl.formatMessage({ id: "lbl.Agreement-currency-amount" }),    // 协议币金额  
                        reviseAmount: intl.formatMessage({ id: "lbl.Agreement-currency-adjustment-amount" }),    // 协议币调整金额 
                        vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),    // 是否含税价  
                        vatAmount: intl.formatMessage({ id: "lbl.Agreement-currency-tax-reference" }),    // 协议币税金(参考)  
                        vatReviseAmount: intl.formatMessage({ id: "lbl.Tax-adjustment-in-agreement-currency-reference" }),    // 协议币调整税金(参考)  
                        paymentAmount: intl.formatMessage({ id: "lbl.Amount-payable-to-outlets" }),    // 应付网点金额  
                        customerSapId: intl.formatMessage({ id: "lbl.AP-outlets" }),    // 应付网点  
                        updatedTotalAmount: intl.formatMessage({ id: "lbl.Agency-net-income" }),    // 代理净收入  
                        sfSide: intl.formatMessage({ id: "lbl.submitanexpenseaccount" }),    // 向谁报账  
                        profitCenterCode: intl.formatMessage({ id: "lbl.profit-center" }),    // 利润中心  
                        // yfSide: intl.formatMessage({id: "lbl.make"}),    // 向谁开票  
                        bookingPartyCode: intl.formatMessage({ id: "lbl.Booking-Party" }),    // Booking Party  
                        agencyCurrencyCode: intl.formatMessage({ id: "lbl.Standard-currency" }),    // 本位币种  
                        totalAmountInAgency: intl.formatMessage({ id: "lbl.Amount-in-base-currency" }),    // 本位币金额  
                        reviseAmountInAgency: intl.formatMessage({ id: "lbl.Adjustment-amount-in-base-currency" }),    // 本位币调整金额  
                        vatAmountInAgency: intl.formatMessage({ id: "lbl.Tax-in-local-currency" }),    // 本位币税金(参考)  
                        reviseVatAmountInAgency: intl.formatMessage({ id: "lbl.Tax-adjustment-in-base-currency" }),    // 本位币调整税金(参考)  
                        clearingCurrencyCode: intl.formatMessage({ id: "lbl.settlement-currency" }),    // 结算币种  
                        totalAmountInClearing: intl.formatMessage({ id: "lbl.amount-of-settlement-currency" }),    // 结算币金额  
                        reviseAmountInClearing: intl.formatMessage({ id: "lbl.adjustment-amount-in-settlement-currency" }),    // 结算币调整金额  
                        vatAmountInClearing: intl.formatMessage({ id: "lbl.tax-in-settlement-currency" }),    // 结算币税金(参考)  
                        reviseVatAmountInClearing: intl.formatMessage({ id: "lbl.tax-adjustment-in-settlement-currency" }),    // 结算币调整税金(参考) 
                        excludeFlag: intl.formatMessage({ id: "lbl.within-boundary" }),    // 是否边界内  
                        agmtId: intl.formatMessage({ id: "lbl.Contract-No" }),    // 合约号 
                        checkStatus: intl.formatMessage({ id: "lbl.Return-flag" }),    // 退回标志位 
                    },
                    sumCol: {//汇总字段
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),   // 佣金类型
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),   // 佣金模式
                        clearingCurrencyCode: intl.formatMessage({ id: "lbl.settlement-currency" }),  // 结算币种
                        totalAmountInClearingSum: intl.formatMessage({ id: "lbl.amount-of-settlement-currency" }),   // 结算币金额
                        reviseAmountInClearingSum: intl.formatMessage({ id: "lbl.adjustment-amount-in-settlement-currency" }),  // 结算币调整金额
                        vatAmountInClearingSum: intl.formatMessage({ id: "lbl.tax-in-settlement-currency" }),    // 结算币税金(参考)
                        reviseVatAmountInClearingSum: intl.formatMessage({ id: 'lbl.tax-adjustment-in-settlement-currency' }),   // 结算币调整税金(参考)
                    },
                    sheetName: intl.formatMessage({ id: 'menu.afcm.comm.cr.gen-reimb' }),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.comm.cr.gen-reimb' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.comm.cr.gen-reimb' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setCommissionType({});  // 佣金类型
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        setBackFlag(true);
        setChecked([]);
        // setSpinflag(false);
        // setUuidData([]);
        setStatisticsData([]);   // 统计列表
        setTableData([]);     // 列表
        setTabTotal(0);  // 条数
        queryForm.resetFields();
        queryForm.setFieldsValue({
            exFlag: withinBoundary.defaultValue,
            vatFlag: priceIncludingTax.defaultValue,
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
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
                        {/* 业务日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='activeDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.argue.bizDate" />} />
                        {/* 生成日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.generation-date" />} />
                        {/* 贸易区 */}
                        <Select flag={true} name='tradeZoneCode' label={<FormattedMessage id='lbl.argue.trade-code' />} span={6} options={trade.values} selectChange={companyIncident} />
                        {/* Trade */}
                        <Select flag={true} name='tradeCode' label={<FormattedMessage id='lbl.Trade' />} span={6} options={tradeCode} selectChange={trades} />
                        {/* 贸易线 */}
                        <Select flag={true} name='tradeLaneCode' label={<FormattedMessage id='lbl.Trade-line' />} span={6} options={tradeLine} />
                        {/* Office */}
                        <InputText name='officeCode' label={<FormattedMessage id='lbl.office' />} span={6} />
                        {/* 航线(Base) */}
                        <InputText name='baseServiceLoopCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.route-base' />} span={6} />
                        {/* SVVD(Base) */}
                        <InputText name='baseSvvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.ac.fee.svvd.base' />} span={6} />
                        {/* 港口(Base) */}
                        <InputText name='basePortCode' label={<FormattedMessage id='lbl.port-base' />} span={6} />
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.route' />} span={6} />
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD' />} span={6} />
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port' />} span={6} />
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 发票号码 */}
                        <InputText name='invoiceNo' label={<FormattedMessage id='lbl.Invoice-number' />} span={6} />
                        {/* 是否边界内 */}
                        <Select flag={true} name='exFlag' label={<FormattedMessage id='lbl.within-boundary' />} span={6} options={withinBoundary.values} />
                        {/* 是否手工调整 */}
                        <Select flag={true} name='adjManual' label={<FormattedMessage id='lbl.Manual-adjustment-or-not' />} span={6} options={manualAdjustment.values} />
                        {/* 预估单号码 */}
                        <InputText name='erReceiptCode' label={<FormattedMessage id='lbl.Estimated-order-number' />} span={6} />
                        {/* 发票生成人员 */}
                        <InputText name='generateUser' label={<FormattedMessage id='lbl.Invoice-generator' />} span={6} />
                        {/* 是否含税价 */}
                        <Select flag={true} name='vatFlag' label={<FormattedMessage id='lbl.Whether-the-price-includes-tax' />} span={6} options={priceIncludingTax.values} />
                        {/* 佣金种类 */}
                        {
                            props.user.currentUser.companyCode == '2001' ? <Select flag={true} name='commissionCargo' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id='lbl.comm-type' />} span={6} options={commisType.values} /> : undefined
                        }
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    <CosButton disabled={tableData.length ? false : true} onClick={downloadBtn}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></CosButton>{/* 下载 */}
                    {/* 选中生成报账单 */}
                    <CosButton auth="AFCM_CMS_CR_001_B01" onClick={() => GenerateReimbursement('SELECT_BUILD_CR', 'COMM_CR_BUILD_CR_RECEIPT')}> <SelectOutlined /><FormattedMessage id='btn.select-Generate-reimbursement' /></CosButton>{/* 下载 */}
                    {/* 全部生成报账单 */}
                    <CosButton auth="AFCM_CMS_CR_001_B02" onClick={() => GenerateReimbursement('ALL_BUILD_CR', 'COMM_CR_BUILD_CR_RECEIPT_ALL')}> <UnorderedListOutlined /><FormattedMessage id='btn.all-Generate-reimbursement' /></CosButton>
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 无条件查询 */}
                    <CosButton onClick={() => {
                        GCFqueryType = 'UNCONDITIONAL'
                        pageChange(page, null, 'search')
                    }}> <SearchOutlined /><FormattedMessage id='btn.unconditional-query' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={() => {
                        GCFqueryType = 'SEARCH'
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
                    // setSelectedRows={setSelectedRows}
                    // rowSelection={null}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            setChecked(key);
                            let data = row.map((v, i) => {
                                return v.entryUuid;
                            })
                            setUuidData(data);
                        }
                    }}
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
export default connect(({ user, global }) => ({
    user: user
}))(QueryaPCommission)