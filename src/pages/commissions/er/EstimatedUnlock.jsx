// 预估解锁
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireSelectDataExtend, agencyCodeData, momentFormat } from '@/utils/commonDataInterface';

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
    SearchOutlined,// 查询
    ReloadOutlined,// 重置
    CloudDownloadOutlined,// 下载
    UnlockOutlined,// 解锁
} from '@ant-design/icons'

const EstimatedUnlock = () => {
    // from 数据
    const [queryForm] = Form.useForm();
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [tableData, setTableData] = useState([]) // 列表
    const [statistics, setStatistics] = useState([]) // 统计列表
    const [tabTabTotal, setTabTotal] = useState([]) // 列表条数
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [uuidData, setUuidData] = useState([]); // 选择数据
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [EOVData, setEOVData] = useState({});   // EOV
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    // const [searchFlag, setSearchFlag] = useState(false); //是否查询标记
    const [checked, setChecked] = useState([]); // 选中的数据uuid

    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    // 初始化
    useEffect(() => {
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     // 佣金类型
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类 and 佣金小类
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectData('AFCM.EOV.STATUS', setEOVData, $apiUrl);// EOV
        Toast('', '', '', 5000, false);
    }, [])

    useEffect(() => {   // 默认值
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

    // 列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.generation-date' />,// 生成日期
            dataIndex: 'generateDate',
            dataType: 'dateTime',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commType.values,
            dataIndex: 'commissionType',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.EOV" />,// EOV
            dataType: EOVData.values,
            dataIndex: 'endofVoyageStatus',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'cargoTradeLaneCode',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130,
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
            // },{
            //     title: <FormattedMessage id="lbl.Booking-Party" />,// Booking party
            //     dataIndex: 'bookingPartyCode',
            // sorter: false,
            //     width: 120,
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
            width: 130,
            // render: (text, record) => {
            //     return <div>
            //         {text ? formatCurrencyNew(text) : text}
            //     </div>
            // }
        }, {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: true,
            width: 130,
            // render: (text, record) => {
            //     return <div>
            //         {text ? formatCurrencyNew(text) : text}
            //     </div>
            // }
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
            width: 130,
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
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
        }
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
            width: 120,
            // render: (text, record) => {
            //     return <div>
            //         {text ? formatCurrencyNew(text) : text}
            //     </div>
            // }
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
            // render: (text, record) => {
            //     return <div>
            //         {text ? formatCurrencyNew(text) : text}
            //     </div>
            // }
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

    // 选中解锁 and 全部解锁
    const unlockingBtn = async (url, UnlockingType) => {
        Toast('', '', '', 5000, false);
        UnlockingType == 'UNLOCK' && checked.length < 1 ? Toast('', intl.formatMessage({ id: 'lbl.Unclock-tips' }), 'alert-error', 5000, false) : undefined;
        UnlockingType == 'ALL_UNLOCK' && tableData.length < 1 ? Toast('', intl.formatMessage({ id: 'lbl.comm-unlock-all-select' }), 'alert-error', 5000, false) : undefined;

        if (checked.length > 0 || UnlockingType == 'ALL_UNLOCK' && tableData.length > 0) {
            const confirmModal = confirm({
                title: formatMessage({ id: 'lbl.unlock' }),
                content: formatMessage({ id: `lbl.${UnlockingType == 'UNLOCK' ? 'comm-select-unlock' : 'comm-all-unlock'}` }),
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
                        data: UnlockingType == 'ALL_UNLOCK' ? {
                            operateType: UnlockingType,
                            params: {
                                ...formData,
                                activeDateFrom: formData.activeDateFrom ? momentFormat(formData.activeDateFrom) : null,
                                activeDateTo: formData.activeDateTo ? momentFormat(formData.activeDateTo) : null,
                                generateDateFrom: formData.generateDateFrom ? momentFormat(formData.generateDateFrom) : null,
                                generateDateTo: formData.generateDateTo ? momentFormat(formData.generateDateTo) : null,
                            }
                        } : {
                            operateType: UnlockingType,
                            uuids: checked,
                        }
                    })
                    if (result.success) {
                        setChecked([]);
                        setTableData([]);
                        setStatistics([]);
                        setTabTotal(0);
                        setSpinflag(false);
                        queryBtn(page, null, 'search', result.message)
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
        const result = await request($apiUrl.COMM_ER_EXP_SEARCHER_LIST, {
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
                excelFileName: intl.formatMessage({ id: 'menu.afcm.comm.er.unlock' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        generateDate: intl.formatMessage({ id: "lbl.generation-date" }),  // 生成日期
                        activityDate: intl.formatMessage({ id: "lbl.argue.bizDate" }),    // 业务日期
                        billReferenceCode: intl.formatMessage({ id: "lbl.bill-of-lading-number" }),     // 提单号码
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        svvdId: intl.formatMessage({ id: "lbl.SVVD" }),    // SVVD  
                        portCode: intl.formatMessage({ id: "lbl.port" }),    // 港口  
                        endofVoyageStatus: intl.formatMessage({ id: "lbl.EOV" }),    // EOV  
                        cargoTradeLaneCode: intl.formatMessage({ id: "lbl.Trade-line" }),     // 贸易线
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
                    },
                    sumCol: {//汇总字段
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),        // 佣金模式
                        clearingCurrencyCode: intl.formatMessage({ id: "lbl.settlement-currency" }),  // 结算币种
                        totalAmountInClearingSum: intl.formatMessage({ id: "lbl.amount-of-settlement-currency" }),   // 结算币金额
                        reviseAmountInClearingSum: intl.formatMessage({ id: "lbl.adjustment-amount-in-settlement-currency" }),  // 结算币调整金额
                        vatAmountInClearingSum: intl.formatMessage({ id: "lbl.tax-in-settlement-currency" }),        // 结算币税金(参考)
                        reviseVatAmountInClearingSum: intl.formatMessage({ id: 'lbl.tax-adjustment-in-settlement-currency' }),   //结算币调整税金(参考)
                    },
                    sheetName: intl.formatMessage({ id: 'menu.afcm.comm.er.unlock' }),//sheet名称
                }],
            },
            headers: {
                "biz-source-param": "BLG"
            },
            responseType: 'blob',
        })
        if (result.size < 1) {
            setSpinflag(false)
            Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
            return
        } else {
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            let blob = new Blob([result], { type: "application/x-xls" });
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.comm.er.unlock' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.comm.er.unlock' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
            setSpinflag(false);
        }
    }

    // 查询
    const queryBtn = async (pagination, options, search, message) => {
        Toast('', '', '', 5000, false);
        message ? Toast('', message, 'alert-success', 5000, false) : undefined;
        if (search) pagination.current = 1
        let formData = queryForm.getFieldValue();
        // 判断代理编码必须输入
        if (!formData.agencyCode) {
            setBackFlag(false);
            message ? undefined : Toast('', formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false);
        } else {
            setBackFlag(true)
            setSpinflag(true);
            setChecked([]);
            const result = await request($apiUrl.COMM_ER_SEARCH_UNLOCK_LIST, {
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
            console.log(result)
            if (result.success) {
                setSpinflag(false);
                // if(pagination.pageSize!=page.pageSize){
                //     pagination.current=1
                // }
                setPage({ ...pagination })
                let data = result.data;
                let listdata = data.commissionYgDetailList;
                setTableData(listdata);
                setStatistics(data.commissionStatistics);
                setTabTotal(data.totalCount);
            } else {
                setSpinflag(false);
                setTableData([]);
                setStatistics([]);
                setTabTotal(0);
                message ? undefined : Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
        }
    }

    // 重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setCommissionType({});  // 佣金类型
        setChecked([]);
        setBackFlag(true)
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
        setTableData([]);
        setStatistics([]);
        setTabTotal(0);
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
                        {/* <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} /> */}
                        {/* 佣金大类 */}
                        <Select flag={true} name='commisionClass' selectChange={selectChangeBtn} options={commissionCategories.values} span={6} label={<FormattedMessage id='lbl.commission-big-type' />} />
                        {/* 佣金类型 */}
                        <Select flag={true} name='commissionType' span={6} options={commissionType.values} label={<FormattedMessage id='lbl.Commission-type' />} />
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' capitalized={false} label={<FormattedMessage id='lbl.route' />} span={6} />
                        {/* SVVD */}
                        <InputText name='svvd' label={<FormattedMessage id='lbl.SVVD' />} span={6} />
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port' />} span={6} />
                        {/* 是否边界内 */}
                        <Select flag={true} name='exFlag' label={<FormattedMessage id='lbl.within-boundary' />} span={6} options={withinBoundary.values} />
                        {/* 业务日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='activeDate' label={<FormattedMessage id="lbl.argue.bizDate" />} />
                        {/* 生成日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate' label={<FormattedMessage id="lbl.generation-date" />} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 选中解锁 */}
                    <CosButton auth="AFCM_CMS_ER_001_B01" onClick={() => unlockingBtn('COMM_ER_UNLOCKING_SELECT', 'UNLOCK')}> <UnlockOutlined /><FormattedMessage id='btn.select-unlock' /></CosButton>
                    {/* 所以解锁 */}
                    <CosButton auth="AFCM_CMS_ER_001_B02" onClick={() => unlockingBtn('COMM_ER_UNLOCKING_ALL', 'ALL_UNLOCK')}> <UnlockOutlined /><FormattedMessage id='btn.all-unlock' /></CosButton>
                    {/* 下载按钮 */}
                    <CosButton disabled={tableData.length ? false : true} onClick={downloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='lbl.download' /></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询按钮 */}
                    <CosButton onClick={() => queryBtn(page, null, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='entryUuid'
                    pageChange={queryBtn}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    // setSelectedRows={setSelectedRows}
                    // rowSelection={null}
                    pageSize={page.pageSize}
                    current={page.current}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            setChecked(key);
                            setUuidData(row);
                        }
                    }}
                />
            </div>
            <div className='footer-table' style={{ marginTop: '10px', width: '60%' }}>
                <PaginationTable
                    rowKey="lcrAgreementHeadUuid"
                    columns={columnsdata}
                    dataSource={statistics}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            <Loading spinning={spinflag} />
        </div>
    )
}
export default EstimatedUnlock