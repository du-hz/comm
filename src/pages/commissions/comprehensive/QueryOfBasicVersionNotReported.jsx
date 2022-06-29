// 基础版未报账查询
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, afcmCommonController, TradeData, momentFormat, acquireSelectDataExtend, agencyCodeData } from '@/utils/commonDataInterface';
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
import { result } from 'lodash';

const QueryOfBasicVersionNotReported = () => {
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
    const [withinHappen, setWithinHappen] = useState({});   // 实际是否发生
    const [tableData, setTableData] = useState([]);  // table 数据
    const [tabTabTotal, setTabTotal] = useState(0);    // table条数

    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    const [header, setHeader] = useState(true);    // table表头切换
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [exchangeRate, setExchangeRate] = useState({});   // 汇率计算方法
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectData('EXCHANGE.RATE.CALCULATION.TYPE', setExchangeRate, $apiUrl);     // 汇率计算方法
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        acquireSelectData('COMM.TYPE', setCommissionType, $apiUrl);// 佣金类型
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区

        acquireSelectData('AFCM.ER.VERIFY.STATUS', setVerify, $apiUrl);// 费用状态
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setReceipt, $apiUrl);// 预估单状态
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('COMM0001', setWithinHappen, $apiUrl);     // 实际是否发生

        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireCompanyData(setCompanysData, $apiUrl);//公司
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
    }, [])

    useEffect(() => {
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])


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
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.commission-big-type' />,// 佣金大类
            dataIndex: 'commClass',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'commissionType',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'cargoTradeLaneCode',
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
            title: <FormattedMessage id='lbl.voyage-number-calculation' />,// 航次(计算)
            dataIndex: 'businessSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.ht.statement.upload-voyage-number-Base' />,// 航次(Base)
            dataIndex: 'baseSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.voyage-number' />,// 航次
            dataIndex: 'svvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Whether-pay" />,// 是否支付
            dataIndex: 'pymtFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Invoice-or-not" />,// 是否开票
            dataIndex: 'invFlag',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port-calculation" />,// 港口(计算)
            dataIndex: 'businessPortCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port-base" />,// 港口(Base)
            dataIndex: 'basePortCode',
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
            title: <FormattedMessage id="lbl.office" />,// Office
            dataIndex: 'officeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,// 实际是否发生
            dataIndex: 'actualFlag',
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
            title: <FormattedMessage id="lbl.Standard-currency" />,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            align: 'center',
            sorter: false,
            width: 120
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
            title: <FormattedMessage id="lbl.svvd-calculation-exchange-rate" />,// SVVD(计算汇率)
            dataIndex: 'calculationSvvdId',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.port-calculation-exchange-rate" />,// 港口(计算汇率)
            dataIndex: 'calculationPortCode',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.calculation-exchange-rate-method" />,// 计算汇率方法
            dataIndex: 'exchangeMethod',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Recording-currency-exchange-rate" />,// 记账本位币汇率
            dataIndex: 'agencyExchangeRate',
            align: 'center',
            sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.Exchange-Rate-of-Settlement-Currency" />,// 结算币汇率
            dataIndex: 'clearingExchangeRate',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.twelve-size" />,// 12/20尺箱
            dataIndex: 'container20',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.forty-size" />,// 40/45尺箱
            dataIndex: 'container40',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Total-Teu-or-Freight" />,// Total Teu or Freight
            dataIndex: 'commissionBase',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.rate-one" />,// 费率
            dataIndex: 'commissionRate',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.arithmetic" />,// 记账算法
            dataIndex: 'postCalculationFlag',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.bookkeeping" />,// 记账方式
            dataIndex: 'postMode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.estimate" />,// 向谁预估
            dataIndex: 'ygSide',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.make" />,// 向谁开票
            dataIndex: 'yfSide',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,// 向谁报账
            dataIndex: 'sfSide',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.actually" />,// 应付实付是否记账
            dataIndex: 'isBill',
            align: 'center',
            sorter: false,
            width: 150
        }, {
            title: <FormattedMessage id="lbl.withholding" />,// 预提是否记账
            dataIndex: 'isYt',
            align: 'center',
            sorter: false,
            width: 120
        },
    ]

    // 查询
    const pageChange = async (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if (search) pagination.current = 1
        setSpinflag(true);
        if (!queryData.billReferenceCode && !queryData.activityDate && !queryData.svvd && !queryData.baseSvvd) {
            setBackFlag(false);
            setSpinflag(false);
            Toast('', formatMessage({ id: 'lbl.afcm_query_bas' }), 'alert-error', 5000, false);
        } else {
            setBackFlag(true);
            const result = await request($apiUrl.COMM_QUERY_QUERY_NO_REIMBURSED, {
                method: "POST",
                data: {
                    page: pagination,
                    params: {
                        ...queryData,
                        activityDate: undefined,
                        activityDateFrom: queryData.activityDate ? momentFormat(queryData.activityDate[0]) : undefined,
                        activityDateTo: queryData.activityDate ? momentFormat(queryData.activityDate[1]) : undefined,
                    },
                }
            })
            if (result.success) {
                setSpinflag(false);
                let data = result.data;
                setTableData(data.resultList);
                setTabTotal(data.totalCount);
                setPage({ ...pagination })
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
        setCommissionType({});  // 佣金类型
        setBackFlag(true); // 背景颜色
        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        setTableData([]);   // 表格数据
        setTabTotal(0);     // 表格条数
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
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 代理编码 */}
                        {/* <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}/>   */}
                        {/* 佣金模式 */}
                        <Select flag={true} name='commissionMode' span={6} options={theCommission.values} label={<FormattedMessage id='lbl.The-Commission' />} />
                        {/* 佣金类型 */}
                        <Select flag={true} name='commissionType' span={6} options={commissionType.values} label={<FormattedMessage id='lbl.Commission-type' />} />
                        {/* 实际是否发生 */}
                        <Select flag={true} name='actualFlag' span={6} options={withinHappen.values} label={<FormattedMessage id='lbl.WhetherItActuallyHappenedOrNot' />} />
                        {/* 贸易区 */}
                        <Select flag={true} name='tradeZoneCode' label={<FormattedMessage id='lbl.argue.trade-code' />} span={6} options={trade.values} selectChange={companyIncident} />
                        {/* Trade */}
                        <Select flag={true} name='tradeCode' label={<FormattedMessage id='lbl.Trade' />} options={tradeCode} selectChange={trades} span={6} />
                        {/* 贸易线 */}
                        <Select flag={true} name='tradeLaneCode' label={<FormattedMessage id='lbl.Trade-line' />} span={6} options={tradeLine} />
                        {/* 汇率计算方法 */}
                        <Select flag={true} name='exchgMthd' label={<FormattedMessage id='lbl.computing-method' />} span={6} options={exchangeRate.values} />
                        {/* 提单号码 */}
                        <InputText styleFlag={backFlag} name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 业务日期 */}
                        <DoubleDatePicker style={{ background: backFlag ? "white" : "yellow" }} span={6} name='activityDate' label={<FormattedMessage id="lbl.argue.bizDate" />} />
                        {/* 航线 */}
                        <InputText name='line' label={<FormattedMessage id='lbl.route' />} span={6} />
                        {/* SVVD */}
                        <InputText styleFlag={backFlag} name='svvd' label={<FormattedMessage id='lbl.SVVD' />} span={6} />
                        {/* 港口 */}
                        <InputText name='port' label={<FormattedMessage id='lbl.port' />} span={6} />
                        {/* 航线(Base) */}
                        <InputText name='lineBase' label={<FormattedMessage id='lbl.route-base' />} span={6} />
                        {/* SVVD(Base) */}
                        <InputText styleFlag={backFlag} name='svvdBase' label={<FormattedMessage id='lbl.ac.fee.svvd.base' />} span={6} />
                        {/* 港口(Base) */}
                        <InputText name='portBase' label={<FormattedMessage id='lbl.port-base' />} span={6} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    <CosDownLoadBtn disabled={tableData.length ? false : true} downLoadTitle={'menu.afcm.CalFeeQy.comp.bas-iuu-qy'} downColumns={[{ dataCol: columns }]} downLoadUrl={'COMM_QUERY_EXP_NO_REIMBURSED'} queryData={queryForm.getFieldValue()} setSpinflag={setSpinflag} btnName={'lbl.download'} />
                    {/* <CosButton onClick={download}> <CloudDownloadOutlined /><FormattedMessage id='btn.download' /></CosButton> */}
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
export default QueryOfBasicVersionNotReported