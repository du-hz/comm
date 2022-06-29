// 查询佣金计算结果
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, TradeData, momentFormat, agencyCodeData, acquireSelectDataExtend } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Tabs } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import CommResultDetails from './CommResultDetails';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import { CosDownLoadBtn } from '@/components/Common/index'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'
import { result } from 'lodash';
const { TabPane } = Tabs;

const QueryCommissionCalculationResults = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [queryForm] = Form.useForm();
    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [commissionType, setCommissionType] = useState({}); // 佣金类型
    const [verify, setVerify] = useState({}); // 费用状态
    const [receipt, setReceipt] = useState({}); // 预估单状态
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [withinHappen, setWithinHappen] = useState({});   // 实际是否发生
    const [exchangeRate, setExchangeRate] = useState({});   // 汇率计算方法
    // 提单
    const [statistics, setStatistics] = useState([]) // 统计列表
    const [tableData, setTableData] = useState([]);  // table 数据
    const [tabTabTotal, setTabTotal] = useState([]);    // table条数

    // 提单详细
    const [messageHeader, setMessageHeader] = useState([]);   // 详细头部
    const [detailsList, setDetailsList] = useState([]);   // 详细列表
    const [detailsStatisticsList, setDetailsStatisticsList] = useState([]);   // 详细下列表
    const [detaUuid, setDetaUuid] = useState('');    // 详情uuid

    // 箱子
    const [boxStatisticsData, setBoxStatisticsData] = useState([]) // 统计列表
    const [boxTableData, setBoxTableData] = useState([]);  // table 数据
    const [boxTabTabTotal, setBoxTabTotal] = useState([]);    // table条数

    // local
    const [localStatisticsData, setLocalStatisticsData] = useState([]) // 统计列表
    const [localTableData, setLocalTableData] = useState([]);  // table 数据
    const [localTabTabTotal, setLocalTabTotal] = useState([]);    // table条数


    const [companysData, setCompanysData] = useState({});   // 公司
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [header, setHeader] = useState(true);    // table表头切换
    const [isModalVisible, setIsModalVisible] = useState(false);     // 弹窗
    const [defaultKey, setDefaultKey] = useState('1');
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [trade, setTrade] = useState({});  // 贸易区
    const [tradeCode, setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })
    const [pageBox, setPageBox] = useState({
        current: 1,
        pageSize: 10
    })
    const [pageLoc, setPageLoc] = useState({
        current: 1,
        pageSize: 10
    })


    useEffect(() => {
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        acquireSelectData('COMM.TYPE', setCommissionType, $apiUrl);// 佣金类型
        acquireSelectData('AFCM.ER.VERIFY.STATUS', setVerify, $apiUrl);// 费用状态
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setReceipt, $apiUrl);// 预估单状态
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('COMM0001', setWithinHappen, $apiUrl);     // 实际是否发生
        acquireSelectData('EXCHANGE.RATE.CALCULATION.TYPE', setExchangeRate, $apiUrl);     // 汇率计算方法
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区

        acquireCompanyData(setCompanysData, $apiUrl);//公司
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码

        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
    }, [])

    useEffect(() => {
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        callback('1', false)
    }, [company, acquireData, queryUrl])

    const [queryUrl, setQueryUrl] = useState('');   // 查询Url地址

    // tab切换
    const callback = async (key, oneFlag = true) => {
        Toast('', '', '', 5000, false);
        setDefaultKey(key)
        // setSpinflag(true);
        let formData = queryForm.getFieldValue();

        if (key == 1) {
            oneFlag ? pageChange(page, null, 'search', 'COMM_QUERY_QUERY_COMM_Bill') : null;
            setQueryUrl('COMM_QUERY_QUERY_COMM_Bill');  // 提单
        } else if (key == 2) {
            pageChange(pageBox, null, 'search', 'QUERY_QUERY_SAPCOMM_CNTR')
            setQueryUrl('QUERY_QUERY_SAPCOMM_CNTR');    // 箱子
        } else if (key == 3) {
            pageChange(pageLoc, null, 'search', 'QUERY_QUERY_SAP_COMM_LCR')
            setQueryUrl('QUERY_QUERY_SAP_COMM_LCR');  // local charge
        }
        // oneFlag ? pageChange(page, null, 'search') : null;
    }

    // 提单列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataType: 'dateTime',
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
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commissionType.values,
            dataIndex: 'commissionType',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'cargoTradeLaneCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.pdr-fnd" />,// POR/FND
            dataIndex: 'porFndQskey',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.voyage-number-calculation" />,// 航次（计算）
            dataIndex: 'businessSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ht.statement.upload-voyage-number-Base" />,// 航次（base）
            dataIndex: 'baseSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.voyage-number" />,// 航次
            dataIndex: 'svvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.route" />,// 航线
            dataIndex: 'svcLoopCde',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.vvd" />,// SVVD
            dataIndex: 'vvd',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port-calculation" />,// 港口（计算）
            dataIndex: 'businessPortCode',
            align: 'center',
            sorter: false,
            width: 120,
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
            dataType: withinHappen.values,
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
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,// 是否含税价
            dataIndex: 'vatFlag',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,// 协议币税金(参考)
            dataIndex: 'vatAmount',
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
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,// 本位币税金(参考)
            dataIndex: 'vatAmountInAgency',
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
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)
            dataIndex: 'vatAmountInClearing',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.svvd-calculation-exchange-rate" />,// SVVD（计算汇率）
            dataIndex: 'calculationSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port-calculation-exchange-rate" />,// 港口（计算汇率）
            dataIndex: 'calculationPortCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.calculation-exchange-rate-method' />,// 计算汇率方法
            dataIndex: 'exchangeMethod',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Recording-currency-exchange-rate" />,// 记账本位币汇率
            dataIndex: 'agencyExchangeRate',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Exchange-Rate-of-Settlement-Currency' />,// 结算币汇率
            dataIndex: 'clearingExchangeRate',
            align: 'center',
            sorter: false,
            width: 120
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
            title: <FormattedMessage id="lbl.Total-teu-or-Freight" />,// Total teu or Freight-----20,40尺箱量TEU 
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
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.estimate" />,// 向谁预估
            dataIndex: 'ygSide',
            align: 'center',
            sorter: false,
            width: 120,
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
            width: 120
        }, {
            title: <FormattedMessage id="lbl.withholding" />,// 预提是否记账
            dataIndex: 'isYt',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Contract-No" />,// 合约号
            dataIndex: 'agmtId',
            align: 'center',
            sorter: false,
            width: 120
        },
    ]

    // 提单统计列表
    const columnsdata = [
        {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commissionType.values,
            dataIndex: 'commissionType',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'totalAmountInClearingSum',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency' />,// 结算币税金（参考）
            dataIndex: 'vatAmountInClearingSum',
            align: 'center',
            sorter: false,
            width: 120
        }
    ]

    // 箱子列表
    const boxlist = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
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
            title: <FormattedMessage id='lbl.ac.cntr-num' />,// 箱号
            dataIndex: 'containerNumber',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Box-size' />,// 箱型尺寸
            dataIndex: 'containerSizeType',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Computing-method' />,// 计算方法
            dataIndex: 'calculationMethod',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.The-Commission' />,// 佣金模式
            dataIndex: 'commissionMode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Contract-No' />,// 合约号
            dataIndex: 'agreementId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Commission-type' />,// 佣金类型
            dataType: commissionType.values,
            dataIndex: 'commissionType',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Percentage-rate' />,// 百分比/费率
            dataIndex: 'commissionRate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.port' />,// 港口
            dataIndex: 'portCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.argue.bizDate' />,// 业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.office' />,// office
            dataIndex: 'officeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Commission-agreement' />,// 佣金协议
            dataIndex: 'commissionAgreementCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.WhetherItActuallyHappenedOrNot' />,// 实际是否发生
            dataIndex: 'actualFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.empty-box' />,// SOC空箱
            dataIndex: 'socEmptyIndicator',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.ccy' />,// 币种
            dataIndex: 'commissionCurrencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Calculate-freight' />,// 计算运费
            dataIndex: 'commissionBase',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.amount' />,// 金额
            dataIndex: 'commissionAmount',
            align: 'center',
            sorter: false,
            width: 120
        }
    ]

    // 箱子统计列表
    const boxStatistics = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Box-size' />,// 箱型尺寸
            dataIndex: 'cntrSizeType',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commissionType.values,
            dataIndex: 'commissionType',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Container-capacity' />,// 箱量
            dataIndex: 'countCntr',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.ccy' />,// 币种
            dataIndex: 'commCcyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.The-amount-of-commission' />,// 佣金金额
            dataIndex: 'commAmt',
            align: 'center',
            sorter: false,
            width: 120
        }
    ]

    // local列表
    const locallist = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.agency' />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.The-Commission' />,// 佣金模式
            dataIndex: 'commissionMode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Commission-type' />,// 佣金类型
            dataType: commissionType.values,
            dataIndex: 'commissionType',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.charge-code' />,// charge code
            dataIndex: 'chargeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.act-flag' />,// act flag
            dataIndex: 'actualFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Return-the-currency" />,// 返还币种
            dataIndex: 'rateCurrencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.refund' />,// 返还金额
            dataIndex: 'refund',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.return-the-proportion' />,// 返还比例
            dataIndex: 'refundRate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Exchange-Rate-of-Settlement-Currency' />,// 结算币汇率
            dataIndex: 'exchangeRateClearing',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Return-the-base' />,// 返还基数
            dataIndex: 'commissionBase',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.office' />,// office
            dataIndex: 'officeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.carrier' />,// 船东
            dataIndex: 'companyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.argue.bizDate' />,// 业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Record-update-time' />,// 记录更新时间
            dataIndex: 'recordUpdateDatetime',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Record-the-uploaded-lot' />,// 记录上载批次
            dataIndex: 'recordLoadDate',
            align: 'center',
            sorter: false,
            width: 120
        },
    ]

    // local统计列表
    const localStatistics = [
        {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commissionType.values,
            dataIndex: 'commissionType',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Return-the-currency" />,// 返还币种
            dataIndex: 'rateCurrencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Amount-of-returned-currency' />,// 返还币金额
            dataIndex: 'totalAmount',
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
            dataIndex: 'totalAmountInClearingSum',
            align: 'center',
            sorter: false,
            width: 120
        },
    ]

    // 查询
    const pageChange = async (pagination, options, search, url = queryUrl) => {
        Toast('', '', '', 5000, false);
        if (search) pagination.current = 1
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        if (!formData.billReferenceCode && !formData.activityDate && !formData.svvd && !formData.baseSvvd) {
            setBackFlag(false);
            setSpinflag(false);
            Toast('', formatMessage({ id: 'lbl.afcm_query_bas' }), 'alert-error', 5000, false);
        } else {
            setBackFlag(true);
            // 提单
            const result = await request($apiUrl[url], {
                method: "POST",
                data: {
                    "page": pagination,
                    "params": {
                        ...formData,
                        activityDate: undefined,
                        activityDateFrom: formData.activityDate ? momentFormat(formData.activityDate[0]) : undefined,
                        activityDateTo: formData.activityDate ? momentFormat(formData.activityDate[1]) : undefined,
                    }
                }
            })
            if (result.success) {
                setSpinflag(false);
                let data = result.data;


                // setQueryUrl('COMM_QUERY_QUERY_COMM_Bill');  // 提单
                // setQueryUrl('QUERY_QUERY_SAPCOMM_CNTR');    // 箱子
                // setQueryUrl('QUERY_QUERY_SAP_COMM_LCR');  // local charge

                switch (url) {
                    case 'COMM_QUERY_QUERY_COMM_Bill':
                        setTableData(data.billResult.resultList);      // 提单列表
                        setStatistics(data.commissionStatistics);       // 提单明细
                        setTabTotal(data.billResult.totalCount);       // 提单列表条数
                        setPage({ ...pagination })
                        break;
                    case 'QUERY_QUERY_SAPCOMM_CNTR':
                        setBoxTableData(data.containerResult.resultList);      // 箱子列表
                        setBoxStatisticsData(data.commissionStatistics);       // 箱子明细
                        setBoxTabTotal(data.containerResult.totalCount);
                        setPageBox({ ...pagination })
                        break;
                    case 'QUERY_QUERY_SAP_COMM_LCR':
                        setLocalTableData(data.billChgResult.resultList);  // table 数据
                        setLocalStatisticsData(data.commissionStatistics) // 统计列表
                        setLocalTabTotal(data.billChgResult.totalCount);    // table条数
                        setPageLoc({ ...pagination })
                        break;
                }

                // if (defaultKey == '1') {
                //     setTableData(data.billResult.resultList);      // 提单列表
                //     setStatistics(data.commissionStatistics);       // 提单明细
                //     setTabTotal(data.billResult.totalCount);       // 提单列表条数
                // } else if (defaultKey == '2') {
                //     setBoxTableData(data.containerResult.resultList);      // 箱子列表
                //     setBoxStatisticsData(data.commissionStatistics);       // 箱子明细
                //     setBoxTabTotal(data.containerResult.totalCount);
                // } else if (defaultKey == '3') {
                //     setLocalTableData(data.billChgResult.resultList);  // table 数据
                //     setLocalStatisticsData(data.commissionStatistics) // 统计列表
                //     setLocalTabTotal(data.billChgResult.totalCount);    // table条数
                // }
            } else {
                Toast('', result.errorMessage, 'alert-error', 5000, false);
                setSpinflag(false);

                switch (url) {
                    case 'COMM_QUERY_QUERY_COMM_Bill':
                        setTableData([]);      // 提单列表
                        setStatistics([]);       // 提单明细
                        setTabTotal(0);       // 提单列表条数
                        break;
                    case 'QUERY_QUERY_SAPCOMM_CNTR':
                        setBoxTableData([]);      // 箱子列表
                        setBoxStatisticsData([]);       // 箱子明细
                        setBoxTabTotal(0);
                        break;
                    case 'QUERY_QUERY_SAP_COMM_LCR':
                        setLocalTableData([]);  // table 数据
                        setLocalStatisticsData([]) // 统计列表
                        setLocalTabTotal(0);    // table条数
                        break;
                }
                // if (defaultKey == '1') {
                //     setTableData([])    // 提单列表
                //     setStatistics([])   // 提单明细
                //     setTabTotal(0);     // 提单列表条数 
                // } else if (defaultKey == '2') {
                //     setBoxTableData([]);      // 箱子列表
                //     setBoxStatisticsData([]);       // 箱子明细
                //     setBoxTabTotal(0);
                // } else if (defaultKey == '3') {
                //     setLocalTableData([]);  // table 数据
                //     setLocalStatisticsData([]) // 统计列表
                //     setLocalTabTotal(0);    // table条数
                // }
            }
        }
    }

    // 详细页传值
    const initData = {
        isModalVisible,
        setIsModalVisible,
        messageHeader,  // 详细头部
        detailsList,    // 详细列表
        detailsStatisticsList,  // 详情汇总列表
        detaUuid,    // 详情uuid
        setSpinflag,    // 加载
    }
    // 双击  明细信息列表
    const doubleClickRow = async (parameter) => {
        setDetaUuid({
            billBasicUuid: parameter.billBasicUuid,
            commissionType: parameter.commissionType,
            currencyCode: parameter.rateCurrencyCode,
            agencyCode: parameter.agencyCode
        })
        setSpinflag(true);
        setIsModalVisible(true);
        const result = await request($apiUrl.COMM_QUERY_LOAD_COMM_BILL, {
            method: "POST",
            data: {
                page: {
                    current: 0,
                    pageSize: 10
                },
                params: {
                    billBasicUuid: parameter.billBasicUuid,
                    commissionType: parameter.commissionType,
                    currencyCode: parameter.rateCurrencyCode,
                    agencyCode: parameter.agencyCode
                }
            }
        })
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            setMessageHeader(data.billBasicInfo[0]);   // 详细头部
            setDetailsList(data.commissionContainers);   // 详细列表
            setDetailsStatisticsList(data.summaryContainerResult);   // 详细下列表
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
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

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })

        setTableData([])    // table 数据
        setStatistics([]);  // 统计列表
        setTabTotal(0); // table条数

        setBoxStatisticsData([]);       // 箱子明细
        setBoxTableData([]);  // 列表
        setBoxTabTotal(0);  // 条数

        setLocalTableData([]);      // local列表
        setLocalStatisticsData([]);       // local明细
        setLocalTabTotal(0);       // local列表条数

        setTradeCode([]);   // trade
        setTradeLine([]);   // 贸易线
        setBackFlag(true);  // 颜色

        setPage({
            current: 1,
            pageSize: 10
        })

        setPageBox({
            current: 1,
            pageSize: 10
        })

        setPageLoc({
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
                        {/* <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} />   */}
                        {/* <Select showSearch={true} styleFlag={backFlag} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} /> */}
                        {/* 佣金模式 */}
                        <Select flag={true} name='commissionMode' span={6} options={theCommission.values} label={<FormattedMessage id='lbl.The-Commission' />} />
                        {/* 佣金类型 */}
                        <Select flag={true} name='commissionType' span={6} options={commissionType.values} label={<FormattedMessage id='lbl.Commission-type' />} />
                        {/* 实际是否发生 */}
                        <Select flag={true} name='actualFlag' span={6} options={withinHappen.values} label={<FormattedMessage id='lbl.WhetherItActuallyHappenedOrNot' />} />
                        {/* 贸易区 */}
                        <Select flag={true} name='tradeZoneCode' label={<FormattedMessage id='lbl.argue.trade-code' />} span={6} options={trade.values} selectChange={companyIncident} />
                        {/* Trade */}
                        <Select flag={true} name='tradeCode' label={<FormattedMessage id='lbl.Trade' />} span={6} options={tradeCode} selectChange={trades} />
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
                        {/* 邮件发送 */}
                        <Select flag={true} name='btnExportMail' label={<FormattedMessage id='lbl.mailing' />} span={6} options={withinHappen.values} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载提单 */}
                    <CosDownLoadBtn
                        disabled={tableData.length ? false : true}
                        downLoadTitle={'lbl.query_comm_bl'}
                        downColumns={[
                            { dataCol: columns, sumCol: columnsdata, sheetName: 'lbl.query_comm_bl' }
                        ]}
                        downLoadUrl={'COMM_QUERY_EXP_COMM_BILL'}
                        queryData={queryForm.getFieldValue()}
                        setSpinflag={setSpinflag}
                        btnName={'btn.Download-bill-of-lading'} />
                    {/* 下载提单及箱子 */}
                    <CosDownLoadBtn
                        disabled={boxTableData.length ? false : true}
                        downLoadTitle={'lbl.query_comm_bl_cntr'}
                        downColumns={[
                            { dataCol: columns, sumCol: columnsdata, sheetName: 'lbl.query_comm_bl' },
                            { dataCol: boxlist, sumCol: boxStatistics, sheetName: 'lbl.query_comm_bl_cntr' }
                        ]}
                        downLoadUrl={'COMM_QUERY_EXP_SAPCOMM_CNTR'}
                        queryData={queryForm.getFieldValue()}
                        setSpinflag={setSpinflag}
                        btnName={'btn.Download-bill-of-lading-and-box'} />
                    {/* 下载提单及Local Charge */}
                    <CosDownLoadBtn
                        disabled={localTableData.length ? false : true}
                        downLoadTitle={'lbl.query_comm_bl_lcr'}
                        downColumns={[
                            { dataCol: columns, sumCol: columnsdata, sheetName: 'lbl.query_comm_bl' },
                            { dataCol: locallist, sumCol: localStatistics, sheetName: 'lbl.query_comm_bl_lcr' }
                        ]}
                        downLoadUrl={'COMM_QUERY_EXP_SAP_COMM_LCR'}
                        queryData={queryForm.getFieldValue()}
                        setSpinflag={setSpinflag}
                        btnName={'btn.Download-bill-of-lading-Local-Charge'} />
                    {/* 下载接口文件CSV */}
                    <CosDownLoadBtn
                        // disabled={tableData.length ? false : true}
                        downLoadTitle={'lbl.query_comm_csv'}
                        downColumns={[]}
                        downLoadUrl={'COMM_QUERY_EXP_COMM_CALC_RST_CSV'}
                        queryData={queryForm.getFieldValue()}
                        setSpinflag={setSpinflag}
                        btnName={'btn.Download-interface-file-CSV'} />
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={() => pageChange(page, null, 'search', queryUrl)}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <Tabs type="card" onChange={callback} activeKey={defaultKey}>
                <TabPane tab={<FormattedMessage id='lbl.Bill-of-lading' />} key="1">
                    <div className='footer-table'>
                        {/* 表格 */}
                        <PaginationTable
                            dataSource={tableData}
                            columns={columns}
                            rowKey='lcrAgreementHeadUuid'
                            pageChange={pageChange}
                            scrollHeightMinus={60}
                            total={tabTabTotal}
                            handleDoubleClickRow={doubleClickRow}
                            selectWithClickRow={true}
                            pageSize={page.pageSize}
                            current={page.current}
                            rowSelection={null}
                        />
                    </div>
                    <div className='footer-table' style={{ marginTop: '10px', width: '60%' }}>
                        <PaginationTable
                            rowKey="lcrAgreementHeadUuid"
                            columns={columnsdata}
                            dataSource={statistics}
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={60}
                        />
                    </div>
                </TabPane>
                <TabPane tab={<FormattedMessage id='lbl.box' />} key="2">
                    <div className='footer-table'>
                        {/* 表格 */}
                        <PaginationTable
                            dataSource={boxTableData}
                            columns={boxlist}
                            rowKey='lcrAgreementHeadUuid'
                            pageChange={pageChange}
                            scrollHeightMinus={200}
                            total={boxTabTabTotal}
                            // handleDoubleClickRow={doubleClickRow}
                            selectWithClickRow={true}
                            pageSize={pageBox.pageSize}
                            current={pageBox.current}
                            rowSelection={null}
                        />
                    </div>
                    <div className='footer-table' style={{ marginTop: '10px', width: '60%' }}>
                        <PaginationTable
                            rowKey="lcrAgreementHeadUuid"
                            columns={boxStatistics}
                            dataSource={boxStatisticsData}
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={200}
                        />
                    </div>
                </TabPane>
                <TabPane tab={<FormattedMessage id='lbl.Local-Charge' />} key="3">
                    <div className='footer-table'>
                        {/* 表格 */}
                        <PaginationTable
                            dataSource={localTableData}
                            columns={locallist}
                            rowKey='lcrAgreementHeadUuid'
                            pageChange={pageChange}
                            scrollHeightMinus={200}
                            total={localTabTabTotal}
                            // handleDoubleClickRow={doubleClickRow}
                            selectWithClickRow={true}
                            pageSize={pageLoc.pageSize}
                            current={pageLoc.current}
                            rowSelection={null}
                        />
                    </div>
                    <div className='footer-table' style={{ marginTop: '10px', width: '60%' }}>
                        <PaginationTable
                            rowKey="lcrAgreementHeadUuid"
                            columns={localStatistics}
                            dataSource={localStatisticsData}
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={200}
                        />
                    </div>
                </TabPane>
            </Tabs>
            <CommResultDetails initData={initData} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default QueryCommissionCalculationResults