// 生成应收发票
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, company, acquireSelectDataExtend, TradeData, momentFormat, agencyCodeData } from '@/utils/commonDataInterface';
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
let GPqueryType = ''
// 预估解锁
const QueryEstimateSheet = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [tabTabTotal, setTabTotal] = useState([]) // table条数
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [statisticsData, setStatisticsData] = useState([]);    // 统计列表
    const [listData, setListData] = useState([]);    // 列表
    const [selectUuids, setSelectUuids] = useState([]);  // uuids
    const [spinflag, setSpinflag] = useState(false);     // 加载

    const [acquireData, setAcquireData] = useState({}); // 船东
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [trade, setTrade] = useState({});  // 贸易区
    const [tradeCode, setTradeCode] = useState();//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    const [checked, setChecked] = useState([]); // 选中数据的uuid

    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            // ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    // 初始化
    useEffect(() => {
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区
        acquireSelectData('CC0013', setTheCommission, $apiUrl);     // 佣金模式
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类 and 佣金小类
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     //    佣金类型
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            exFlag: withinBoundary.defaultValue,
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    // 贸易区联动
    const companyIncident = async (value) => {
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        queryForm.setFieldsValue({
            tradeCode: null,
            tradeLaneCode: null
        })
        TradeData($apiUrl, value, setTradeCode);
    }

    // Trade
    const trades = async (value) => {
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
    let tengquna = withinBoundary
    // 表头
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
            title: <FormattedMessage id="lbl.Estimated-order-number" />,// 预估单号码
            dataIndex: 'ygListCode',
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
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'cargoTradeLaneCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.pdr-fnd" />,// POR/FND
            dataIndex: 'porFndQskey',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.ac.fee.svvd.base" />,// SVVD(Base)
            dataIndex: 'baseSvvdId',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            // sorter: false,
            width: 120
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
            // },{
            //     title: <FormattedMessage id="lbl.twelve-size" />,// 12/20尺箱
            //     dataIndex: 'container20',
            // sorter: false,
            //     width: 120
            // },{
            //     title:<FormattedMessage id="lbl.forty-size" />,// 40/45尺箱
            //     dataIndex: 'container40',
            // sorter: false,
            //     width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
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
            title: <FormattedMessage id="lbl.make" />,// 向谁开票
            dataIndex: 'yfSide',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.profit-center" />,// 利润中心
            dataIndex: 'profitCenterCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Booking-Party" />,// Booking party
            dataIndex: 'bookingPartyCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Standard-currency" />,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,// 本位币税金(参考)
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.settlement-currency" />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)
            dataIndex: 'vatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.within-boundary" />,// 是否边界内
            dataType: withinBoundary.values,
            dataIndex: 'excludeFlag',
            // sorter: false,
            width: 130,
        }, {
            title: <FormattedMessage id="lbl.Contract-No" />,// 合约号
            dataIndex: 'agmtId',
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

    // 选择生成发票 and 全部生成发票
    const GenerateInvoice = async (selectType) => {
        Toast('', '', '', 5000, false);
        selectType == 'SELECT_BUILD_AR' && checked.length < 1 ? Toast('', intl.formatMessage({ id: 'lbl.Unclock-tips' }), 'alert-error', 5000, false) : undefined;
        selectType == 'ALL_BUILD_AR' && listData.length < 1 ? Toast('', intl.formatMessage({ id: 'lbl.Generate-info' }), 'alert-error', 5000, false) : undefined;

        if (checked.length > 0 || selectType == 'ALL_BUILD_AR' && listData.length > 0) {
            const confirmModal = confirm({
                title: formatMessage({ id: 'lbl.generate-Invoice' }),
                content: formatMessage({ id: `lbl.${selectType == 'SELECT_BUILD_AR' ? 'comm-select-buildAR' : 'comm-all-buildAR'}` }),
                okText: formatMessage({ id: 'lbl.affirm' }),
                okType: 'danger',
                closable: true,
                cancelText: '',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    let formData = queryForm.getFieldValue();
                    // COMM_AR_RECEIPT_INVOICE_ALL
                    const result = await request(selectType == "SELECT_BUILD_AR" ? $apiUrl.COMM_AR_BUILD_AR_RECEIPT_INVOICE : $apiUrl.COMM_AR_RECEIPT_INVOICE_ALL, {
                        method: "POST",
                        data: selectType == "SELECT_BUILD_AR" ? {
                            "operateType": selectType,
                            "uuids": checked
                        } : {
                            "operateType": selectType,
                            "params": {
                                ...formData,
                                activeDate: undefined,
                                generateDate: undefined,
                                activeDateFrom: formData.activeDate ? momentFormat(formData.activeDate[0]) : undefined,
                                activeDateTo: formData.activeDate ? momentFormat(formData.activeDate[1]) : undefined,
                                generateDateFrom: formData.generateDate ? momentFormat(formData.generateDate[0]) : undefined,
                                generateDateTo: formData.generateDate ? momentFormat(formData.generateDate[1]) : undefined,
                            }
                        }
                    })
                    if (result.success) {
                        setChecked([]);
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

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.COMM_AR_EXP_PENDING_AR_INVOICE_LIST, {
            method: "POST",
            data: {
                params: {
                    ...queryData,
                    activeDate: undefined,
                    generateDate: undefined,
                    activeDateFrom: queryData.activeDate ? momentFormat(queryData.activeDate[0]) : undefined,
                    activeDateTo: queryData.activeDate ? momentFormat(queryData.activeDate[1]) : undefined,
                    generateDateFrom: queryData.generateDate ? momentFormat(queryData.generateDate[0]) : undefined,
                    generateDateTo: queryData.generateDate ? momentFormat(queryData.generateDate[1]) : undefined,
                },
                excelFileName: intl.formatMessage({ id: 'menu.afcm.comm.ar.gen-inv' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        generateDate: intl.formatMessage({ id: "lbl.generation-date" }),  // 生成日期
                        activityDate: intl.formatMessage({ id: "lbl.argue.bizDate" }),    // 业务日期  
                        billReferenceCode: intl.formatMessage({ id: "lbl.bill-of-lading-number" }),     // 提单号码
                        ygListCode: intl.formatMessage({ id: "lbl.Estimated-order-number" }),    // 预估单号码  
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),     // 佣金模式
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        cargoTradeLaneCode: intl.formatMessage({ id: "lbl.Trade-line" }),     // 贸易线
                        porFndQskey: intl.formatMessage({ id: "lbl.pdr-fnd" }),    // POR/FND  
                        svvdId: intl.formatMessage({ id: "lbl.SVVD" }),    // SVVD  
                        baseSvvdId: intl.formatMessage({ id: "lbl.ac.fee.svvd.base" }),    // SVVD(Base)  
                        portCode: intl.formatMessage({ id: "lbl.port" }),    // 港口  
                        basePortCode: intl.formatMessage({ id: "lbl.port-base" }),    // 港口(Base)  
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // OFFICE
                        rateCurrencyCode: intl.formatMessage({ id: "lbl.Agreement-currency" }),    // 协议币种  
                        totalAmount: intl.formatMessage({ id: "lbl.Agreement-currency-amount" }),    // 协议币金额  
                        reviseAmount: intl.formatMessage({ id: "lbl.Agreement-currency-adjustment-amount" }),    // 协议币调整金额 
                        vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),    // 是否含税价  
                        vatAmount: intl.formatMessage({ id: "lbl.Agreement-currency-tax-reference" }),    // 协议币税金(参考)  
                        vatReviseAmount: intl.formatMessage({ id: "lbl.Tax-adjustment-in-agreement-currency-reference" }),    // 协议币调整税金(参考)  
                        paymentAmount: intl.formatMessage({ id: "lbl.Amount-payable-to-outlets" }),    // 应付网点金额  
                        customerSapId: intl.formatMessage({ id: "lbl.AP-outlets" }),    // 应付网点  
                        updatedTotalAmount: intl.formatMessage({ id: "lbl.Agency-net-income" }),    // 代理净收入  
                        yfSide: intl.formatMessage({ id: "lbl.make" }),    // 向谁开票  
                        profitCenterCode: intl.formatMessage({ id: "lbl.profit-center" }),    // 利润中心  
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
                    },
                    sumCol: {//汇总字段
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),   // 佣金模式
                        clearingCurrencyCode: intl.formatMessage({ id: "lbl.settlement-currency" }),  // 结算币种
                        totalAmountInClearingSum: intl.formatMessage({ id: "lbl.amount-of-settlement-currency" }),   // 结算币金额
                        reviseAmountInClearingSum: intl.formatMessage({ id: "lbl.adjustment-amount-in-settlement-currency" }),  // 结算币调整金额
                        vatAmountInClearingSum: intl.formatMessage({ id: "lbl.tax-in-settlement-currency" }),    // 结算币税金(参考)
                        reviseVatAmountInClearingSum: intl.formatMessage({ id: 'lbl.tax-adjustment-in-settlement-currency' }),   // 结算币调整税金(参考)
                    },
                    sheetName: intl.formatMessage({ id: 'menu.afcm.comm.ar.gen-inv' }),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.comm.ar.gen-inv' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.comm.ar.gen-inv' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    // 查询
    const pageChange = async (pagination, options, search, message) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        console.log(queryForm.getFieldValue())
        if (!formData.agencyCode || !formData.baseSvvd && !formData.svvd && !formData.billReferenceCode && !formData.activeDate && !formData.generateDate) {
            setSpinflag(false);
            setBackFlag(false);
            message ? Toast('', message, 'alert-success', 5000, false) : (!formData.agencyCode ? Toast('', intl.formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false) : Toast('', intl.formatMessage({ id: 'lbl.generatea-plnvoice-null' }), 'alert-error', 5000, false));
        } else {
            setBackFlag(true)
            setChecked([]);
            queryFun(pagination, formData, message);
            // if((formData.checkDateFrom&&!formData.checkDateTo)||(!formData.checkDateFrom&&formData.checkDateTo)||(formData.generateDateFrom&&!formData.generateDateTo)||(!formData.generateDateFrom&&formData.generateDateTo)){
            //     Toast('','开始时间和结束时间不能只填一个!!!', 'alert-warning', 5000, false)
            //     setSpinflag(false);
            // }else{
            // setChecked([]);
            // queryFun(pagination, formData, message);
            // }
        }
    }

    // 查询封装
    const queryFun = async (pagination, formData, message) => {
        const result = await request($apiUrl.COMM_AR_SEARCH_PENDING_AR_INVOICE_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                operateType: GPqueryType, //'UNCONDITIONAL',
                "params": {
                    ...formData,
                    activeDate: undefined,
                    generateDate: undefined,
                    activeDateFrom: formData.activeDate ? momentFormat(formData.activeDate[0]) : undefined,
                    activeDateTo: formData.activeDate ? momentFormat(formData.activeDate[1]) : undefined,
                    generateDateFrom: formData.generateDate ? momentFormat(formData.generateDate[0]) : undefined,
                    generateDateTo: formData.generateDate ? momentFormat(formData.generateDate[1]) : undefined,
                }
            }
        })
        if (result.success) {
            setChecked([]);
            setSpinflag(false);
            let data = result.data;
            setListData([]);   // 列表
            setStatisticsData([]);   // 统计列表
            setStatisticsData(data.commissionStatistics);   // 统计列表
            setListData(data.commissionYfListDetail);   // 列表
            setTabTotal(data.totalCount);
            // if(pagination.pageSize!=page.pageSize){
            //     pagination.current=1
            // }
            setPage({ ...pagination })
            // let listdata = data.commissionYfListDetailList;
            // afcmCommonController(setListData, listdata, {
            //     withinBoundary: withinBoundary,
            //     priceIncludingTax: priceIncludingTax
            // });
        } else {
            setChecked([]);
            setStatisticsData([]);   // 统计列表
            setListData([]);   // 列表
            setTabTotal(0);
            setSpinflag(false);
            message ? undefined : Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
        message ? Toast('', message, 'alert-success', 5000, false) : undefined;
    }

    // // 多选
    // const setSelectedRows = (val) =>{
    //     let data = val.map((v, i) => {
    //         return v.entryUuid;
    //     })
    //     setSelectUuids(data);
    // }

    // 重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        setCommissionType({});  // 佣金类型
        queryForm.resetFields();
        setChecked([]);
        queryForm.setFieldsValue({
            exFlag: withinBoundary.defaultValue,
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
        setBackFlag(true);
        setStatisticsData([]);   // 统计列表
        setListData([]);   // 列表
        setTabTotal(0);
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
                        {/* <InputText disabled name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}/>   */}
                        {/* <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
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
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route' />} span={6} />
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD' />} span={6} />
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port' />} vspan={6} />
                        {/* 航线(Base) */}
                        <InputText name='baseServiceLoopCode' label={<FormattedMessage id='lbl.route-base' />} span={6} />
                        {/* SVVD(Base) */}
                        <InputText name='baseSvvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.ac.fee.svvd.base' />} span={6} />
                        {/* 港口(Base) */}
                        <InputText name='basePortCode' label={<FormattedMessage id='lbl.port-base' />} span={6} />
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 预估单号码 */}
                        <InputText name='arReceiptCode' label={<FormattedMessage id='lbl.Estimated-order-number' />} span={6} />
                        {/* 是否边界内 */}
                        <Select flag={true} name='exFlag' label={<FormattedMessage id='lbl.within-boundary' />} options={withinBoundary.values} span={6} />
                        {/* 预估生成人员 */}
                        <InputText name='generateUser' capitalized={false} label={<FormattedMessage id='lbl.Estimate-generator' />} span={6} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <CosButton disabled={listData.length ? false : true} onClick={downloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='btn.download' /></CosButton>
                    {/* 选择生成发票 */}
                    <CosButton auth="AFCM_CMS_AR_001_B01" onClick={() => GenerateInvoice('SELECT_BUILD_AR')}><SelectOutlined /> <FormattedMessage id='btn.select-generate-invoice' /></CosButton>
                    {/* 全部生成发票 */}
                    <CosButton auth="AFCM_CMS_AR_001_B02" onClick={() => GenerateInvoice('ALL_BUILD_AR')}><UnorderedListOutlined /> <FormattedMessage id='btn.generate-all-invoices' /></CosButton>
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 无条件查询 */}
                    <CosButton onClick={() => {
                        GPqueryType = 'UNCONDITIONAL'
                        pageChange(page, null, 'search')
                    }}> <SearchOutlined /><FormattedMessage id='btn.unconditional-query' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={() => {
                        GPqueryType = 'SEARCH'
                        pageChange(page, null, 'search')
                    }}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={listData}
                    columns={columns}
                    rowKey='entryUuid'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    // setSelectedRows={setSelectedRows}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            setChecked(key);
                            // let data = row.map((v, i) => {
                            //     return v.entryUuid;
                            // })
                            setSelectUuids(row);
                        }
                    }}
                // rowSelection={null}
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
export default QueryEstimateSheet