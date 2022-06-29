// 生成佣金预估单
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireSelectDataExtend, agencyCodeData, momentFormat, TradeData } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Modal } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SelectOutlined,// 选择预估单
    UnorderedListOutlined,// 全部预估单
} from '@ant-design/icons'

const confirm = Modal.confirm;

const GenerateCommissionEstimate = () => {
    const [queryForm] = Form.useForm();

    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价

    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [trade, setTrade] = useState({});  // 贸易区
    const [tradeCode, setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线

    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [eovData, setEovData] = useState({}); // EOV
    const [eovDataBase, setEovDataBase] = useState({}); // EOV（Base）
    const [tableData, setTableData] = useState([]);  // 列表
    const [tableList, setTableList] = useState([]);     // 统计列表
    const [tabTabTotal, setTabTotal] = useState([]);    // table条数
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [selectData, setSelectData] = useState([]); // 选择的数据
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [commType, setCommType] = useState({}); // 佣金类型
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    const [checked, setChecked] = useState([]); // 选择数据的uuid
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 

    // const [companysData, setCompanysData] = useState([]);   // 公司
    // const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    // const [header, setHeader] = useState(true);    // table表头切换
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    useEffect(() => {
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        acquireSelectData('AFCM.EOV.STATUS', setEovData, $apiUrl);// EOV
        acquireSelectData('AFCM.EOV.STATUS', setEovDataBase, $apiUrl);// EOV(Base)
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);//佣金类型
        // acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东

        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类 and 佣金小类

        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            exFlag: withinBoundary.defaultValue,
        })
    }, [company, acquireData])

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
            title: <FormattedMessage id="lbl.EOV" />,// EOV
            dataIndex: 'endofVoyageStatus',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Trade-routes' />,// 贸易航线
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
            title: <FormattedMessage id="lbl.twelve-size" />,// 12/20尺箱
            dataIndex: 'container20',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
            // render: (text, record) => {
            //     return text ? text.toFixed(1) : null;
            // }
        }, {
            title: <FormattedMessage id="lbl.forty-size" />,// 40/45尺箱
            dataIndex: 'container40',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
            // render: (text, record) => {
            //     return text ? text.toFixed(1) : null;
            // }
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
            width: 120
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
            dataIndex: 'recAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.estimate" />,// 向谁预估
            dataIndex: 'ygSide',
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
            width: 120,
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
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,// 结算币调整税金(参考)
            dataIndex: 'reviseVatAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }
    ]

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

    // 佣金大类与佣金类型联动
    const selectChangeBtn = (value, all) => {
        setCommissionType({});  // 佣金类型
        queryForm.setFieldsValue({
            commissionType: null
        })
        let data = all.linkage ? all.linkage.value : null;
        data ? acquireSelectData('COMMISSION.CLASS.' + data, setCommissionType, $apiUrl) : null;     // 佣金大类 and 佣金小类
    }

    // 查询
    const pageChange = async (pagination, options, search, message) => {
        Toast('', '', '', 5000, false);
        if (search) pagination.current = 1
        setBackFlag(true);
        setSpinflag(true);
        let query = queryForm.getFieldValue();
        if (!query.agencyCode || !query.activeDate && !query.generateDate && !query.baseSvvd && !query.svvd && !query.serviceLoopCode && !query.billReferenceCode) {
            setBackFlag(false);
            setSpinflag(false);
            //业务日期/提单号 /生成日期/Svvd(Base)/Svvd  必须输入一项
            //代理/时间/SVVD/航线/SVVD(BASE)/提单号码必须输入一个
            message ? Toast('', message, 'alert-success', 5000, false) : (!query.agencyCode ? Toast('', formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false) : Toast('', formatMessage({ id: 'lbl.Date-Reference-svvd-must-enter' }), 'alert-error', 5000, false));
        } else {
            queryFun(pagination, query, message);
        }
    }

    const queryFun = async (pagination, formData, message) => {
        setChecked([]);
        const result = await request($apiUrl.COMM_ER_SEARCH_BUILD_LIST, {
            method: "POST",
            data: {
                "page": pagination,
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
            setSpinflag(false);
            let data = result.data;
            setPage({ ...pagination });
            // 列表
            setTableData([]);
            // 统计列表
            setTableList([]);
            // 列表
            setTableData(data.commissionYgDetailList);
            // 统计列表
            setTableList(data.commissionStatistics);
            setTabTotal(data.totalCount);
        } else {
            setSpinflag(false);
            // 列表
            setTableData([]);
            // 统计列表
            setTableList([]);
            setTabTotal(0);
            message ? undefined : Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
        message ? Toast('', message, 'alert-success', 5000, false) : null;
    }

    // 选择生成预估单 and 全部生成预估单
    const EstimateSheetBtn = async (url, ProcessingType) => {
        Toast('', '', '', 5000, false);
        // 判断是否执行
        ProcessingType == 'SELECT_BUILD_ER' && checked.length < 1 ? Toast('', intl.formatMessage({ id: 'lbl.Select-data' }), 'alert-error', 5000, false) : undefined;
        ProcessingType == 'ALL_BUILD_ER' && tableData.length < 1 ? Toast('', intl.formatMessage({ id: 'lbl.Generate-info' }), 'alert-error', 5000, false) : undefined;

        if (checked.length > 0 || ProcessingType == 'ALL_BUILD_ER' && tableData.length > 0) {
            let formData = queryForm.getFieldValue();
            const confirmModal = confirm({
                title: formatMessage({ id: 'lbl.Generate-estimate-sheet' }),
                content: formatMessage({ id: `lbl.${ProcessingType == 'SELECT_BUILD_ER' ? 'comm-select-build' : 'comm-all-build'}` }),
                okText: formatMessage({ id: 'lbl.affirm' }),
                okType: 'danger',
                closable: true,
                cancelText: '',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    const result = await request($apiUrl[url], {
                        method: "POST",
                        data: ProcessingType == 'SELECT_BUILD_ER' ? {
                            operateType: ProcessingType,
                            uuids: checked
                        } : {
                            operateType: ProcessingType,
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
                        setSpinflag(false);
                        setChecked([]);
                        pageChange(page, null, 'search', result.message);
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
        const result = await request($apiUrl.COMM_ER_EXP_SEARCHBUILDER_LIST, {
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
                excelFileName: intl.formatMessage({ id: 'menu.afcm.comm.er.gen-comm' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        generateDate: intl.formatMessage({ id: "lbl.generation-date" }),  // 生成日期
                        activityDate: intl.formatMessage({ id: "lbl.argue.bizDate" }),    // 业务日期  
                        billReferenceCode: intl.formatMessage({ id: "lbl.bill-of-lading-number" }),    // 提单号码  
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),    // 佣金模式  
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),    // 佣金类型  
                        endofVoyageStatus: intl.formatMessage({ id: "lbl.EOV" }),    // EOV  
                        cargoTradeLaneCode: intl.formatMessage({ id: "lbl.Trade-routes" }),    // 贸易航线  
                        porFndQskey: intl.formatMessage({ id: "lbl.pdr-fnd" }),    // POR/FND  
                        svvdId: intl.formatMessage({ id: "lbl.SVVD" }),    // SVVD  
                        baseSvvdId: intl.formatMessage({ id: "lbl.ac.fee.svvd.base" }),    // SVVD(Base)  
                        portCode: intl.formatMessage({ id: "lbl.port" }),    // 港口  
                        basePortCode: intl.formatMessage({ id: "lbl.port-base" }),    // 港口(Base)  
                        officeCode: intl.formatMessage({ id: "lbl.office" }),    // Office  
                        container20: intl.formatMessage({ id: "lbl.twelve-size" }),    // 12/20尺箱  
                        container40: intl.formatMessage({ id: "lbl.forty-size" }),    // 40/45尺箱  
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
                    sheetName: intl.formatMessage({ id: 'menu.afcm.comm.er.gen-comm' }),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.comm.er.gen-comm' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.comm.er.gen-comm' }) + '.xlsx'; // 下载后文件名
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
        setChecked([]);
        // 列表
        setTableData([]);
        // 统计列表
        setTableList([]);
        setTabTotal(0);
        setBackFlag(true);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            exFlag: withinBoundary.defaultValue,
        }, [company, acquireData])
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
                        {/* <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} />   */}
                        {/* <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
                        {/* 佣金大类 */}
                        <Select flag={true} name='commisionClass' selectChange={selectChangeBtn} label={<FormattedMessage id='lbl.commission-big-type' />} span={6} options={commissionCategories.values} />
                        {/* 佣金类型 */}
                        <Select flag={true} name='commissionType' label={<FormattedMessage id='lbl.Commission-type' />} span={6} options={commissionType.values} />
                        {/* 佣金模式 */}
                        <Select flag={true} name='commissionMode' span={6} options={theCommission.values} label={<FormattedMessage id='lbl.The-Commission' />} />
                        {/* 业务日期 */}
                        <DoubleDatePicker flag={false} span={6} disabled={[false, false]} name='activeDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.argue.bizDate" />} />
                        {/* 生成日期 */}
                        <DoubleDatePicker flag={false} span={6} disabled={[false, false]} name='generateDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.generation-date" />} />
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
                        {/* EOV */}
                        <Select flag={true} name='eovStatus' label={<FormattedMessage id='lbl.EOV' />} span={6} options={eovData.values} />
                        {/* 航线(Base) */}
                        <InputText name='baseServiceLoopCode' label={<FormattedMessage id='lbl.route-base' />} span={6} />
                        {/* SVVD(Base) */}
                        <InputText styleFlag={backFlag} name='baseSvvd' label={<FormattedMessage id='lbl.ac.fee.svvd.base' />} span={6} />
                        {/* 港口(Base) */}
                        <InputText name='basePortCode' label={<FormattedMessage id='lbl.port-base' />} span={6} />
                        {/* EOV(Base) 不要了*/}
                        {/* <Select flag={true} name='baseEovStatus' label={<FormattedMessage id='lbl.EOV-base'/>}  span={6} options={eovDataBase.values}/> */}
                        {/* 船舶代码 */}
                        <InputText name='vesselCode' label={<FormattedMessage id='lbl.Ship-code' />} span={6} />
                        {/* 是否边界内 */}
                        <Select flag={true} name='exFlag' label={<FormattedMessage id='lbl.within-boundary' />} span={6} options={withinBoundary.values} />
                        {/* 提单号码 */}
                        <InputText styleFlag={backFlag} name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 选择生成预估单 */}
                    <CosButton auth="AFCM_CMS_ER_002_B01" onClick={() => EstimateSheetBtn('COMM_ER_BUILD_BILL', 'SELECT_BUILD_ER')}> <SelectOutlined /><FormattedMessage id='btn.Select-generate-estimate' /></CosButton>
                    {/* 全部生成预估单 */}
                    <CosButton auth="AFCM_CMS_ER_002_B02" onClick={() => EstimateSheetBtn('COMM_ER_BUILD_BILL_ALL', 'ALL_BUILD_ER')}> <UnorderedListOutlined /><FormattedMessage id='btn.Generate-all-estimates' /></CosButton>
                    {/* 下载 */}
                    <CosButton disabled={tableData.length ? false : true} onClick={downloadBtn}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></CosButton>
                    {/* 下载HAU箱子 */}
                    {/* <CosButton><CloudDownloadOutlined/> <FormattedMessage id='btn.download-hau-box'/></CosButton> */}
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
                    rowKey='entryUuid'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    pageSize={page.pageSize}
                    current={page.current}
                    // setSelectedRows={setSelectedRows}
                    // rowSelection={null}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            setChecked(key);
                            setSelectData(row);
                        }
                    }}
                />
            </div>
            <div className='footer-table' style={{ marginTop: '10px', width: '60%' }}>
                <PaginationTable
                    rowKey="billBasicUuid"
                    columns={columnsdata}
                    dataSource={tableList}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            <Loading spinning={spinflag} />
        </div>
    )
}
export default GenerateCommissionEstimate