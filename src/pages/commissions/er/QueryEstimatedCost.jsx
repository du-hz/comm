// 查询预估佣金
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, acquireSelectDataExtend, formatCurrencyNew, momentFormat, TradeData, agencyCodeData } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Modal } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import EstimatedCommissionDetails from './EstimatedCommissionDetails';

const confirm = Modal.confirm;

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'
let QECqueryType = '';
const QueryEstimatedCost = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [tableData, setTableData] = useState([]);  // 列表
    const [tabTabTotal, setTabTotal] = useState([]);    // 列表条数
    const [tableList, setTableList] = useState([]);     // 统计列表
    // const [companysData, setCompanysData] = useState([]);   // 公司
    // const [header, setHeader] = useState(true);    // table表头切换
    const [spinflag, setSpinflag] = useState(false);     // 加载

    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [verify, setVerify] = useState({}); // 费用状态
    const [receipt, setReceipt] = useState({}); // 预估单状态
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    // const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [trade, setTrade] = useState({});  // 贸易区
    const [tradeCode, setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [messageHeader, setMessageHeader] = useState([]);  // 头信息
    const [headerTitle, setHeaderTitle] = useState([]);  // 头标题
    const [detailedIncome, setDetailedIncome] = useState([]);  // 明细列表收入
    const [aggregateRevenue, setAggregateRevenue] = useState([]);  // 汇总信息收入
    const [detailedExpenditure, setDetailedExpenditure] = useState([]);  // 明细列表支出
    const [aggregateExpenditure, setAggregateExpenditure] = useState([]);  // 汇总信息支出
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
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    useEffect(() => {
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        acquireSelectData('AFCM.ER.VERIFY.STATUS', setVerify, $apiUrl);// 费用状态
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setReceipt, $apiUrl);// 预估单状态
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东

        // acquireCompanyData(setCompanysData, $apiUrl);//公司
        // acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类 and 佣金小类
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
            title: <FormattedMessage id="lbl.Estimated-order-number" />,// 预估单号码
            dataIndex: 'ygListCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Cost-status" />,// 费用状态
            dataType: verify.values,
            dataIndex: 'verifyStatus',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Estimated-single-state" />,// 预估单状态
            dataType: receipt.values,
            dataIndex: 'listVerifyStatus',
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
            title: <FormattedMessage id="lbl.sapid" />,// SAP ID
            dataIndex: 'bookParty',
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
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,// 是否含税价
            dataType: priceIncludingTax.values,
            dataIndex: 'vatFlag',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,// 协议币税金(参考)
            dataIndex: 'vatAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,// 应付网点金额
            dataIndex: 'paymentAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.AP-outlets" />,// 应付网点
            dataIndex: 'customerSapId',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agency-net-income" />,// 代理净收入
            dataIndex: 'recAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.estimate" />,// 向谁预估
            dataIndex: 'ygSide',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.profit-center" />,// 利润中心
            dataIndex: 'profitCenterCode',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Booking-Party" />,// Booking party
            dataIndex: 'bookingPartyCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Standard-currency" />,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,// 本位币税金(参考)
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,// 本位币调整税金(参考)
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.settlement-currency" />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)
            dataIndex: 'vatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.within-boundary" />,// 是否边界内
            dataType: withinBoundary.values,
            dataIndex: 'excludeFlag',
            // sorter: true,
            width: 130,
        }, {
            title: <FormattedMessage id="lbl.twelve-size" />,// 12/20尺箱
            dataIndex: 'container20',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.forty-size" />,// 40/45尺箱
            dataIndex: 'container40',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
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
            width: 130
        }
    ]

    // 查询
    const pageChange = async (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        setBackFlag(true);
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        if (!formData.agencyCode || !formData.activeDate && !formData.generateDate && !formData.svvd && !formData.serviceLoopCode && !formData.erReceiptCode && !formData.baseServiceLoopCode && !formData.baseSvvd && !formData.billReferenceCode) {
            setBackFlag(false);
            setSpinflag(false);
            //代理/时间/SVVD/航线/SVVD(BASE)/提单号码必须输入一个
            !formData.agencyCode ? Toast('', formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false) : Toast('', formatMessage({ id: 'lbl.Date-Reference-svvd-must-enter' }), 'alert-error', 5000, false)
        } else {
            const result = await request($apiUrl.COMM_ER_SEARCH_ER_COMM_LIST, {
                method: "POST",
                data: {
                    page: pagination,
                    operateType: QECqueryType,
                    params: {
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
                setTableData([]);
                setTableList([]);
                // if(pagination.pageSize!=page.pageSize){
                //     pagination.current=1
                // }
                setPage({ ...pagination })
                setSpinflag(false);
                let data = result.data;
                setTableData(data.commissionYgDetailList);
                setTableList(data.commissionStatistics);
                setTabTotal(data.totalCount);
            } else {
                setSpinflag(false);
                setTableData([]);
                setTableList([]);
                setTabTotal(0);
                Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
        }
    }

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.COMM_ER_EXP_SEARCHCANCELER_LIST, {
            method: "POST",
            data: {
                page: {
                    pageSize: 0,
                    current: 0
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
                excelFileName: intl.formatMessage({ id: 'menu.afcm.comm.er.est-cost' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        generateDate: intl.formatMessage({ id: "lbl.generation-date" }),  // 生成日期
                        activityDate: intl.formatMessage({ id: "lbl.argue.bizDate" }),    // 业务日期  
                        ygListCode: intl.formatMessage({ id: "lbl.Estimated-order-number" }),    // 预估单号码  
                        billReferenceCode: intl.formatMessage({ id: "lbl.bill-of-lading-number" }),    // 提单号码  
                        verifyStatus: intl.formatMessage({ id: "lbl.Cost-status" }),    // 费用状态  
                        listVerifyStatus: intl.formatMessage({ id: "lbl.Estimated-single-state" }),    // 预估单状态  
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),    // 佣金模式  
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),    // 佣金类型  
                        versionNumber: intl.formatMessage({ id: "lbl.version-number" }),    // 版本号  
                        cargoTradeLaneCode: intl.formatMessage({ id: "lbl.Trade-line" }),    // 贸易线  
                        // endofVoyageStatus: intl.formatMessage({id: "lbl.EOV"}),    // EOV  
                        // cargoTradeLaneCode: intl.formatMessage({id: "lbl.Trade-routes"}),    // 贸易航线  
                        porFndQskey: intl.formatMessage({ id: "lbl.pdr-fnd" }),    // POR/FND  
                        svvdId: intl.formatMessage({ id: "lbl.SVVD" }),    // SVVD  
                        baseSvvdId: intl.formatMessage({ id: "lbl.ac.fee.svvd.base" }),    // SVVD(Base)  
                        portCode: intl.formatMessage({ id: "lbl.port" }),    // 港口  
                        basePortCode: intl.formatMessage({ id: "lbl.port-base" }),    // 港口(Base)  
                        officeCode: intl.formatMessage({ id: "lbl.office" }),    // Office  
                        bookParty: intl.formatMessage({ id: "lbl.sapid" }),    // SAP ID  
                        rateCurrencyCode: intl.formatMessage({ id: "lbl.Agreement-currency" }),    // 协议币种  
                        totalAmount: intl.formatMessage({ id: "lbl.Agreement-currency-amount" }),    // 协议币金额  
                        reviseAmount: intl.formatMessage({ id: "lbl.Agreement-currency-adjustment-amount" }),    // 协议币调整金额  
                        vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),    // 是否含税价  
                        vatAmount: intl.formatMessage({ id: "lbl.Agreement-currency-tax-reference" }),    // 协议币税金(参考)  
                        vatReviseAmount: intl.formatMessage({ id: "lbl.Tax-adjustment-in-agreement-currency-reference" }),    // 协议币调整税金(参考)  
                        paymentAmount: intl.formatMessage({ id: "lbl.Amount-payable-to-outlets" }),    // 应付网点金额  
                        customerSapId: intl.formatMessage({ id: "lbl.AP-outlets" }),    // 应付网点  
                        recAmount: intl.formatMessage({ id: "lbl.Agency-net-income" }),    // 代理净收入  
                        ygSide: intl.formatMessage({ id: "lbl.estimate" }),    // 向谁预估  
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
                        container20: intl.formatMessage({ id: "lbl.twelve-size" }),    // 12/20尺箱  
                        container40: intl.formatMessage({ id: "lbl.forty-size" }),    // 40/45尺箱  
                        commissionBase: intl.formatMessage({ id: "lbl.Total-Teu-or-Freight" }),    // Total Teu or Freight  
                        commissionRate: intl.formatMessage({ id: "lbl.rate-one" }),    // 费率  
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
                    sheetName: intl.formatMessage({ id: 'menu.afcm.comm.er.est-cost' }),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.comm.er.est-cost' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.comm.er.est-cost' }) + '.xlsx'; // 下载后文件名
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
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
        setTableData([]);
        setTableList([]);
        setTabTotal(0);
        setBackFlag(true);
        setPage({
            current: 1,
            pageSize: 10
        })
    }

    // 双击  明细信息列表
    const doubleClickRow = async (parameter) => {
        setObjMessage({});
        setSpinflag(true);
        setHeaderTitle(parameter);   // 头标题
        setIsModalVisible(true);
        console.log(parameter)

        const result = await request($apiUrl.COMM_ER_SEARCH_ER_BILL_CONTAINER_DETAIL, {
            method: "POST",
            data: {
                params: {
                    agencyCode: parameter.agencyCode,
                    uuid: parameter.billBasicUuid
                }
            }
        })
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            setMessageHeader(data.shipmentContainerPackageInformation);     // 头信息
            setDetailedIncome(data.commissionContainers);    //  明细列表收入
            setAggregateRevenue(data.summaryContainerResults);     // 汇总信息收入
            setDetailedExpenditure(data.commissionContainers1);     // 明细列表支出
            setAggregateExpenditure(data.summaryContainerResults1);     // 汇总信息支出
            setObjMessage({ alertStatus: 'alert-success', message: result.message });
        } else {
            setSpinflag(false);
            setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
        }
    }

    const initData = {
        isModalVisible,
        setIsModalVisible,
        messageHeader,
        headerTitle,
        detailedIncome,
        aggregateRevenue,
        detailedExpenditure,
        aggregateExpenditure,
        commType,
        setObjMessage,
        objMessage,
        setSpinflag,
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
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} style={{ background: backFlag ? "white" : "yellow" }} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}  />   */}
                        {/* <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} /> */}
                        {/* 佣金大类 */}
                        <Select flag={true} name='commisionClass' selectChange={selectChangeBtn} label={<FormattedMessage id='lbl.commission-big-type' />} span={6} options={commissionCategories.values} />
                        {/* 佣金类型 */}
                        <Select flag={true} name='commissionType' label={<FormattedMessage id='lbl.Commission-type' />} span={6} options={commissionType.values} />
                        {/* 佣金模式 */}
                        <Select flag={true} name='commissionMode' span={6} options={theCommission.values} label={<FormattedMessage id='lbl.The-Commission' />} />
                        {/* 业务日期 */}
                        <DoubleDatePicker styleFlag={backFlag} flag={false} disabled={[false, false]} span={6} name='activeDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.argue.bizDate" />} />
                        {/* 生成日期 */}
                        <DoubleDatePicker styleFlag={backFlag} flag={false} disabled={[false, false]} span={6} name='generateDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.generation-date" />} />
                        {/* 贸易区 */}
                        <Select flag={true} name='tradeZoneCode' label={<FormattedMessage id='lbl.argue.trade-code' />} span={6} options={trade.values} selectChange={companyIncident} />
                        {/* Trade */}
                        <Select flag={true} name='tradeCode' label={<FormattedMessage id='lbl.Trade' />} span={6} options={tradeCode} selectChange={trades} />
                        {/* 贸易航线 */}
                        <Select flag={true} name='tradeLaneCode' label={<FormattedMessage id='lbl.Trade-routes' />} span={6} options={tradeLine} />
                        {/* Office */}
                        <InputText name='officeCode' label={<FormattedMessage id='lbl.office' />} span={6} />
                        {/* 航线 */}
                        <InputText styleFlag={backFlag} name='serviceLoopCode' label={<FormattedMessage id='lbl.route' />} span={6} />
                        {/* SVVD */}
                        <InputText styleFlag={backFlag} name='svvd' label={<FormattedMessage id='lbl.SVVD' />} span={6} />
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port' />} span={6} />
                        {/* 费用状态 */}
                        <Select flag={true} name='verifyStatus' label={<FormattedMessage id='lbl.Cost-status' />} span={6} options={verify.values} />
                        {/* 航线(Base) */}
                        <InputText styleFlag={backFlag} name='baseServiceLoopCode' label={<FormattedMessage id='lbl.route-base' />} span={6} />
                        {/* SVVD(Base) */}
                        <InputText styleFlag={backFlag} name='baseSvvd' label={<FormattedMessage id='lbl.ac.fee.svvd.base' />} span={6} />
                        {/* 港口(Base) */}
                        <InputText name='basePortCode' label={<FormattedMessage id='lbl.port-base' />} span={6} />
                        {/* 预估单状态 */}
                        <Select flag={true} name='erReceiptVerifyStatus' label={<FormattedMessage id='lbl.Estimated-single-state' />} span={6} options={receipt.values} />
                        {/* 提单号码 */}
                        <InputText styleFlag={backFlag} name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 预估单号码 */}
                        <InputText styleFlag={backFlag} name='erReceiptCode' label={<FormattedMessage id='lbl.Estimated-order-number' />} span={6} />
                        {/* 是否边界内 */}
                        <Select flag={true} name='exFlag' label={<FormattedMessage id='lbl.within-boundary' />} span={6} options={withinBoundary.values} />
                        {/* SAP ID */}
                        {/* bookParty */}
                        <InputText name='bookParty' label={<FormattedMessage id='lbl.sapid' />} span={6} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    <CosButton disabled={tableData.length ? false : true} onClick={downloadBtn}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></CosButton>
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 无条件查询 */}
                    <CosButton onClick={() => {
                        QECqueryType = 'UNCONDITIONAL'
                        pageChange(page, null, 'search')
                    }}> <SearchOutlined /><FormattedMessage id='btn.unconditional-query' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={() => {
                        QECqueryType = 'SEARCH'
                        pageChange(page, null, 'search')
                    }}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
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
                    pageSize={page.pageSize}
                    current={page.current}
                    rowSelection={null}
                    handleDoubleClickRow={doubleClickRow}
                    selectWithClickRow={true}
                />
            </div>
            <div className='footer-table' style={{ marginTop: '10px', width: '60%' }}>
                <PaginationTable
                    rowKey="lcrAgreementHeadUuid"
                    columns={columnsdata}
                    dataSource={tableList}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            <EstimatedCommissionDetails initData={initData} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default QueryEstimatedCost