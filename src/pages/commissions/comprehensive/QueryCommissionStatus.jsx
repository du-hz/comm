// 查询佣金状态
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, TradeData, acquireSelectDataExtend, agencyCodeData } from '@/utils/commonDataInterface';
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

const QueryCommissionStatus = () => {
    const [queryForm] = Form.useForm();
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [theCommission, setTheCommission] = useState({}); // 佣金模式
    const [verify, setVerify] = useState({}); // 费用状态
    const [receipt, setReceipt] = useState({}); // 预估单状态
    const [tableData, setTableData] = useState([]);  // table 数据
    const [tabTabTotal, setTabTotal] = useState([]);    // table条数

    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态

    const [trade, setTrade] = useState({});  // 贸易区
    const [tradeCode, setTradeCode] = useState([]);//trade
    const [tradeLine, setTradeLine] = useState([]); // 贸易线
    const [columns, setColumns] = useState([]);     // 公用columns
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [flag, setFlag] = useState(false);    // 是否显示表格
    const [downLoadUrl, setDownLoadUrl] = useState(''); // 下载导出Url
    const [downLoadTitle, setDownLoadTitle] = useState(''); // 下载title
    // const [downData, setDownData] = useState({});   // 查询数据
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectData('CC0013', setTheCommission, $apiUrl);// 佣金模式
        acquireSelectData('AFCM.ER.VERIFY.STATUS', setVerify, $apiUrl);// 费用状态
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setReceipt, $apiUrl);// 预估单状态
        acquireSelectData('AFCM.TRADE.ZONE', setTrade, $apiUrl);//贸易区

        acquireCompanyData(setCompanysData, $apiUrl);//公司
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
    }, [])

    useEffect(() => {
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData, queryUrl])

    // 查询佣金状态-路径信息
    const PathInformation = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'keyBillReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Container-number" />,// 集装箱号码
            dataIndex: 'containerNumber',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.cargo-trade" />,// Cargo Trade Lane	
            dataIndex: 'cargoTradeLaneCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.POR" />,// POR
            dataIndex: 'porUuid',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.FND" />,// FND
            dataIndex: 'fndUuid',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Export-agreement" />,// 出口协议
            dataIndex: 'outBoundDoorCyIndicator',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Import-agreement" />,// 进口协议
            dataIndex: 'inboundDoorCyIndicator',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.first-svvd" />,// First SVVD
            dataIndex: 'firstLoadingSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.first-base-svvd" />,// First Base SVVD
            dataIndex: 'firstBaseLoadingSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.last-base-svvd" />,// Last Base SVVD
            dataIndex: 'lastBaseLoadingSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.lase-svvd" />,// Last SVVD
            dataIndex: 'lastLoadingSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.first-pol" />,// First POL
            dataIndex: 'firstPolCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.first-base-pol" />,// First Base POL
            dataIndex: 'firstBasePolCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.last-base-pod" />,// Last Base POD
            dataIndex: 'lastBasePodCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.last-pod" />,// Last POD
            dataIndex: 'lastPodCode',
            align: 'center',
            sorter: false,
            width: 120
        },
    ]

    //查询佣金状态-错误信息
    const errorMessage = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'entryReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Error-code' />,// 错误编码
            dataIndex: 'errorCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Error-description" />,// 错误描述
            dataIndex: 'errorDescription',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Wrong-date" />,// 产生错误的日期
            dataIndex: 'errorLogDatetime',
            align: 'center',
            sorter: false,
            width: 120
        }
    ]

    // 查询佣金状态--提单佣金计算结果
    const calResComm = [
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
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'commissionType',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Trade-line' />,// 贸易线
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
            title: <FormattedMessage id="lbl.ht.statement.upload-voyage-number-Base" />,// 航次(Base)
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
            title: <FormattedMessage id="lbl.The-amount-of-commission" />,// 佣金金额
            dataIndex: 'totalAmount',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'rateCurrencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.svvd-calculation-exchange-rate" />,// SVVD(计算汇率)
            dataIndex: 'calculationSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port-calculation-exchange-rate" />,// 港口(计算汇率)
            dataIndex: 'calculationPortCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Recording-currency-exchange-rate" />,// 记账本位币汇率
            dataIndex: 'agencyExchangeRate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Exchange-Rate-of-Settlement-Currency" />,// 结算币汇率
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
            title: <FormattedMessage id="lbl.Total-Teu-or-Freight" />,// Total Teu or Freight
            dataIndex: 'commissionBase',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.rate-one" />,// 费率
            dataIndex: 'commissionRate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.arithmetic" />,// 记账算法
            dataIndex: 'postCalculationFlag',
            align: 'center',
            sorter: false,
            width: 120
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
        },
    ]

    // 查询佣金状态-重箱佣金计算结构
    const loadComm = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ac.cntr-num" />,// 箱号
            dataIndex: 'containerNumber',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.carrier.loc" />,// 代理
            dataIndex: 'agencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Box-size" />,// 箱型尺寸
            dataIndex: 'containerSizeType',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'commissionType',
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
            title: <FormattedMessage id="lbl.amount" />,// 金额
            dataIndex: 'commissionAmount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'commissionCurrencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Computing-method" />,// 计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-freight" />,// 计佣运费
            dataIndex: 'commissionBase',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Percentage-rate" />,// 百分比/费率
            dataIndex: 'commissionRate',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-agreement" />,// 佣金协议
            dataIndex: 'commissionAgreementCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.whether-soc-Empty-box" />,// 是否SOC空箱
            dataIndex: 'socEmptyIndicator',
            sorter: false,
            width: 120
        },
    ]

    // 查询佣金状态-佣金历史信息
    const CommHistory = [
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
            dataIndex: 'currentStatus',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,// 协议币调整金额
            dataIndex: 'reviseAmount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,// 应付网点金额
            dataIndex: 'paymentAmount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.AP-outlets" />,// 应付网点
            dataIndex: 'customerSapId',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agency-net-income" />,// 代理净收入
            dataIndex: 'recAmt',
            sorter: false,
            width: 120
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
            title: <FormattedMessage id="lbl.Booking-Party" />,// Booking Party
            dataIndex: 'bookingPartyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.profit-center" />,// 利润中心
            dataIndex: 'profitCenterCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Standard-currency" />,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
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
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.voyage-number" />,// 航次
            dataIndex: 'baseSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'basePortCode',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Cargo-TL" />,// Cargo TL
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
            title: <FormattedMessage id="lbl.office" />,// Office
            dataIndex: 'officeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.error-one" />,// 错误信息1
            dataIndex: 'pendingErrorCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.error-two" />,// 错误信息2
            dataIndex: 'listErrorCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.error-three" />,// 错误信息3
            dataIndex: 'vouErrorCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Is-it-locked" />,// 是否被锁定
            dataIndex: 'lockedIndicator',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Unlock-date" />,// 解锁日期
            dataIndex: 'unlockDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Unlock-people" />,// 解锁人
            dataIndex: 'unlockUser',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Estimate-the-build-date" />,// 预估生成日期
            dataIndex: 'ygGenerateDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Estimated-order-number" />,// 预估单号码
            dataIndex: 'ygListCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Estimate-the-confirmation-date" />,// 预估确认日期
            dataIndex: 'ygVerifyDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Estimated-single-state" />,// 预估单状态
            dataIndex: 'ygVerifyStatus',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Estimated-packet-status" />,// 预估数据包状态
            dataIndex: 'ygPkgFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Estimate-the-batch-of-packets" />,// 预估数据包批次
            dataIndex: 'ygPkgProcessId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Accrual-accounting-status" />,// 预提记帐状态
            dataIndex: 'ytPostStatus',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Build-date-payable" />,// 应付生成日期
            dataIndex: 'yfGenerateDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.cope-with" />,// 应付
            dataIndex: 'yfListCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.AP-invoice-date" />,// 应付开票日期
            dataIndex: 'yfVerifyDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.AP-billing-status" />,// 应付开票状态
            dataIndex: 'yfVerifyStatus',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.accounting-status-payable" />,// 应付记账状态
            dataIndex: 'yfPostStatus',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.date-payable-at-headquarters" />,// 应付记账日期
            dataIndex: 'yfBudat',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Payable-packet-status" />,// 应付数据包状态
            dataIndex: 'yfPkgFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Payable-packet-batch" />,// 应付数据包批次
            dataIndex: 'yfPkgProcessId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Is-the-revenue-fully-invoiced" />,// 收入是否全部开AR发票
            dataIndex: 'invoiceFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Is-All-Payment" />,// 是否全部Payment
            dataIndex: 'paymentFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Date-of-payment-generation" />,// 实付生成日期
            dataIndex: 'sfGenerateDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Actual-reimbursement-No" />,// 实付报账单号码
            dataIndex: 'sfListCode',
            align: 'center',
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
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Paid-in-bookkeeping-date" />,// 实付记账日期
            dataIndex: 'sfBudat',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Paid-packet-state" />,// 实付数据包状态
            dataIndex: 'sfPkgFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Paid-packet-batch" />,// 实付数据包批次
            dataIndex: 'sfPkgProcessId',
            align: 'center',
            sorter: false,
            width: 120
        },
    ]

    // 查询佣金状态--事后退佣
    const BackComm = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.carrier.loc" />,// 代理
            dataIndex: 'agencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.seq" />,// 序号
            dataIndex: 'sequenceNumber',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.add-modify" />,// 新增/修改
            dataIndex: 'newAdjustmentFlag',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'commissionCurrencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.amount" />,// 金额
            dataIndex: 'commissionAmount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.cust-number" />,// 客户号
            dataIndex: 'customerSapId',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.customerName" />,// 客户名称
            dataIndex: 'customerName',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.profit-center" />,// 利润中心
            dataIndex: 'profitCenterCode',
            sorter: false,
            width: 120
        },
    ]

    // 查询佣金状态-提单预提贷方信息
    const BillLadPrepayment = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billBasicUuid',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.company" />,// 公司
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.commission-big-type" />,// 佣金大类
            dataIndex: 'commissionClass',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-source-currency" />,// 源币种金额
            dataIndex: 'amount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'amountInStd',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.debit-entry" />,// 借方科目
            dataIndex: 'debitNewko',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Credit-account" />,// 贷方科目
            dataIndex: 'creditNewko',
            sorter: false,
            width: 120
        }
    ]

    // 查询佣金状态-锁定状态信息
    const LockStatus = [
        {
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
            title: <FormattedMessage id="lbl.commission-big-type" />,// 佣金大类
            dataIndex: 'commissionClass',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Pre-lock-status" />,// 预提锁状态
            dataIndex: 'ytLockedFlag',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.AP-lock-status" />,// 应付锁状态
            dataIndex: 'yfLockedFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Not-online-paid-lock-status" />,// 未上线实付锁状态
            dataIndex: 'sfLockedFlag',
            align: 'center',
            sorter: false,
            width: 120
        },
    ]

    // 查询佣金状态-未上线地区佣金信息
    const CommNotOnline = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,// 报账单号码
            dataIndex: 'sfListCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.company" />,// 公司
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.commission-big-type" />,// 佣金大类
            dataIndex: 'commissionClass',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'currencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-source-currency" />,// 源币种金额
            dataIndex: 'commissionAmount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.adjustment-mark" />,// 调整标志
            dataIndex: 'adjustFlag',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.confirm-status" />,// 确认状态
            dataIndex: 'verifyStatus',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.VVD-upload" />,// 上载的VVD
            dataIndex: 'vvdIdUpload',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Port-upload" />,// 上载的港口
            dataIndex: 'portCodeUpload',
            sorter: false,
            width: 120
        }
    ]

    // 查询佣金状态-手工调整佣金信息
    const AdjustComm = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Adjust-batch" />,// 调整批次
            dataIndex: 'sequenceNumber',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.company" />,// 公司
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'adjustAgencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'adjustCommissionMode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'adjustCommissionType',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'adjustCurrencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-amount-of-adjustment" />,// 调整金额
            dataIndex: 'adjustAmount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-business-date" />,// 佣金业务日期
            dataIndex: 'adjustActivityDate',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'adjustSvvdId',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'adjustPortCode',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.office" />,// Office
            dataIndex: 'adjustOfficeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Update-flag" />,// 更新标志
            dataIndex: 'newFlag',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.update-date" />,// 更新日期
            dataIndex: 'recordUpdateDatetime',
            align: 'center',
            sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.update-people" />,// 更新人员
            dataIndex: 'recordUpdateUser',
            align: 'center',
            sorter: false,
            width: 120
        },
    ]

    // 查询佣金状态-提单预提借方信息
    const DebitInfo = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billBasicUuid',
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
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.commission-big-type" />,// 佣金大类
            dataIndex: 'commissionClass',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'commissionType',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-source-currency" />,// 源币种金额
            dataIndex: 'amount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'amountInStd',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Clearing-signs" />,// 清理标志
            dataIndex: 'clearStatus',
            sorter: false,
            width: 120
        },
    ]

    // 查询佣金状态-提单记佣运费信息
    const BillLadCharge = [
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Container-number" />,// 集装箱号码
            dataIndex: 'cntrNum',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Box-size" />,// 箱型尺寸
            dataIndex: 'cntrSizeType',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Booking-Office" />,// Booking Office
            dataIndex: 'bkgOfceCde',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Collection-office" />,// Collection Offce
            dataIndex: 'collectionOfficeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.charge-code" />,// Charge Code
            dataIndex: 'chargeCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Advance-payment-sign" />,// 预到付标志
            dataIndex: 'isPrepaidIndicator',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.amount" />,// 金额
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.All-In-Rate-Flag" />,// All In Rate标志
            dataIndex: 'includedInBaseRateIndicator',
            sorter: false,
            width: 120
        },
    ]

    // 表头
    const columnsdata = [
        {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'commissionAgreementCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'shipownerCompanyCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'commissionAgreementCode',
            align: 'center',
            sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency' />,// 结算币税金（参考）
            dataIndex: 'shipownerCompanyCode',
            align: 'center',
            sorter: false,
            width: 120
        }
    ]

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
            tradeLane: null
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
    const [queryUrl, setQueryUrl] = useState('');   // 查询url储存
    // 路径信息
    const ErrorFun = async (pagination, options, search, url, downUrl, downTitle) => {
        Toast('', '', '', 5000, false);
        let formData = queryForm.getFieldValue();
        // setDownData(formData);  // 下载查询数据
        setSpinflag(true);  // 加载
        setFlag(true);  // 显示表格
        if (search) {
            setPage({
                current: 1,
                pageSize: 10
            })
            setTableData([]);
            setTabTotal('0');
            setDownLoadUrl(downUrl);   // 下载Url
            setDownLoadTitle(downTitle); // 下载标题
            setQueryUrl(url);  // 查询url储存
            pagination.current = 1;
            switch (true) {
                case url == 'COMM_QUERY_QUERY_SHMT_CNTR_PKG_INFR': setColumns([{ dataCol: PathInformation, sheetName: downLoadTitle }]); break;   // 路径信息
                case url == 'COMM_QUERY_QUERY_ERROR_LOG': setColumns([{ dataCol: errorMessage, sheetName: downLoadTitle }]); break;   // 错误信息
                case url == 'COMM_QUERY_QUERY_CALC_RESULT': setColumns([{ dataCol: calResComm, sheetName: downLoadTitle }]); break;   // 提单佣金计算结果
                case url == 'COMM_QUERY_QUERY_LADEN_CNTR_OPER': setColumns([{ dataCol: loadComm, sheetName: downLoadTitle }]); break;  // 重箱佣金计算结果
                case url == 'COMM_QUERY_QUERY_UTIL_HISTORY': setColumns([{ dataCol: CommHistory, sheetName: downLoadTitle }]); break;  // 佣金历史信息
                case url == 'COMM_QUERY_QUERY_BREAK_COMM': setColumns([{ dataCol: BackComm, sheetName: downLoadTitle }]); break;  // 事后退佣
                case url == 'COMM_QUERY_QUERY_WITHHOLDING_COMM_ITEM': setColumns([{ dataCol: BillLadPrepayment, sheetName: downLoadTitle }]); break;  // 提单预提贷方信息
                case url == 'COMM_QUERY_QUERY_LOCK_STATUS': setColumns([{ dataCol: LockStatus, sheetName: downLoadTitle }]); break;  // 锁定状态信息
                case url == 'COMM_QUERY_QUERY_UTIL_OFFLINE': setColumns([{ dataCol: CommNotOnline, sheetName: downLoadTitle }]); break;  // 未上线地区佣金信息
                case url == 'COMM_QUERY_QUERY_COMMM_ANUAL_ADJUSTMENT': setColumns([{ dataCol: AdjustComm, sheetName: downLoadTitle }]); break;  // 手工调整佣金信息
                case url == 'COMM_QUERY_QUERY_COMM_AD_DEBIT_ITEM': setColumns([{ dataCol: DebitInfo, sheetName: downLoadTitle }]); break;  // 提单预提借方信息
                case url == 'COMM_QUERY_QUERY_BILL_OFTFREIGHT_CHARGE': setColumns([{ dataCol: BillLadCharge, sheetName: downLoadTitle }]); break;  // 提单记佣运费信息
            }
        }

        // if(!formData.billReferenceCode && !formData.svvd && !formData.disSvvd && !formData.baseSvvd && !formData.disBaseSvvd) {
        //     Toast('',formatMessage({id: 'lbl.afcm_comm_state'}), 'alert-error', 5000, false);
        // }
        // setBackFlag(false)

        const result = await request($apiUrl[url || queryUrl], {
            method: "POST",
            data: {
                page: pagination,
                params: {
                    ...formData
                }
            }
        })
        if (result.success) {
            setSpinflag(false);
            setPage({ ...pagination });
            let data = result.data;
            setTableData(data ? data.resultList : []);  // 数据
            setTabTotal(data.totalCount);     // 条数
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 查询
    const pageChange = async (pagination) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        console.log(queryForm.getFieldValue())
        const result = await request($apiUrl.COMM_QUERY_BUILD_COMM_USER_BILLBY_CONDITION, {
            method: "POST",
            data: {
                "page": pagination,
                "params": queryForm.getFieldValue(),
            }
        })
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            let datas = result.data.resultList
            setTabTotal(data.totalCount)
            setTableData([...datas])
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
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
                        {/* 提单号码 */}
                        {/* <InputText styleFlag={backFlag} name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number'/>} span={6}/>   */}
                        {/* 贸易区 */}
                        {/* <Select flag={true} name='tradeCode' label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6} options={trade.values} selectChange={companyIncident}/> */}
                        {/* Trade */}
                        {/* <Select flag={true} name='trade' label={<FormattedMessage id='lbl.Trade'/>} options={tradeCode} selectChange={trades} span={6}/> */}
                        {/* 贸易线 */}
                        {/* <Select flag={true} name='tradeLane' label={<FormattedMessage id='lbl.Trade-line'/>} span={6} options={tradeLine}/> */}
                        {/* Loading SVVD */}
                        {/* <InputText styleFlag={backFlag} name='svvd' label={<FormattedMessage id='lbl.LoadingSVVD'/>} span={6}/>   */}
                        {/* Loading Port */}
                        {/* <InputText name='port' label={<FormattedMessage id='lbl.LoadingPort'/>} span={6}/>   */}
                        {/* Discharge SVVD */}
                        {/* <InputText styleFlag={backFlag} name='disSvvd' label={<FormattedMessage id='lbl.DischargeSVVD'/>} span={6}/> */}
                        {/* Discharge Port */}
                        {/* <InputText name='disPort' label={<FormattedMessage id='lbl.DischargePort'/>} span={6}/>   */}
                        {/* Loading SVVD(Base) */}
                        {/* <InputText styleFlag={backFlag} name='baseSvvd' label={<FormattedMessage id='lbl.LoadingSVVDBase'/>} span={6}/>   */}
                        {/* Loading Port(Base) */}
                        {/* <InputText name='basePort' label={<FormattedMessage id='lbl.LoadingPortBase'/>} span={6}/>   */}
                        {/* Discharge SVVD(Base) */}
                        {/* <InputText styleFlag={backFlag} name='disBaseSvvd' label={<FormattedMessage id='lbl.DischargeSVVDBase'/>} span={6}/>   */}
                        {/* Discharge Port(Base) */}
                        {/* <InputText name='disBasePort' label={<FormattedMessage id='lbl.DischargePortBase'/>} span={6}/>      */}
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className="btn-bottom">
                <div className='main-button' style={{ borderBottom: '1px solid #ccc' }}>
                    <div className='button-left'>
                        {flag ? <CosDownLoadBtn disabled={tableData.length ? false : true} downLoadTitle={downLoadTitle} downColumns={columns} downLoadUrl={downLoadUrl} queryData={queryForm.getFieldValue()} setSpinflag={setSpinflag} btnName={'lbl.download'} /> : undefined}
                    </div>
                    <div className='button-right'>
                        {/* 上载 */}
                        <CosButton style={{ display: 'none' }} disabled={true}> <CloudDownloadOutlined /><FormattedMessage id='btn.ac.upload' /></CosButton>
                        {/* 查询上载 */}
                        <CosButton style={{ display: 'none' }} disabled={true} onClick={() => pageChange(page)}> <SearchOutlined /><FormattedMessage id='lbl.Upload-the-query' /></CosButton>
                    </div>
                </div>
                {/* <div className="btn-bottom"> */}
                {/* 路径信息 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_SHMT_CNTR_PKG_INFR', 'COMM_QUERY_EXP_SHMT_CNTR_PKG_INFR', 'btn.Path-information')}> <SearchOutlined /><FormattedMessage id='btn.Path-information' /></CosButton>
                {/* 错误信息 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_ERROR_LOG', 'COMM_QUERY_EXP_ERROR_LOG', 'btn.error-message')}> <SearchOutlined /><FormattedMessage id='btn.error-message' /></CosButton>
                {/* 提单佣金计算结果 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_CALC_RESULT', 'COMM_QUERY_EXP_CALC_RESULT', 'btn.Bill-of-lading-commission-calculation-results')}> <SearchOutlined /><FormattedMessage id='btn.Bill-of-lading-commission-calculation-results' /></CosButton>
                {/* 重箱佣金计算结果 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_LADEN_CNTR_OPER', 'COMM_QUERY_EXP_LADEN_CNTR_OPER', 'btn.Calculation-results-of-heavy-box-Commission')}> <SearchOutlined /><FormattedMessage id='btn.Calculation-results-of-heavy-box-Commission' /></CosButton>
                {/* 佣金历史信息 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_UTIL_HISTORY', 'COMM_QUERY_EXP_UTIL_HISTORY', 'btn.Commission-history-information')}> <SearchOutlined /><FormattedMessage id='btn.Commission-history-information' /></CosButton>
                {/* 事后退佣 */}
                <CosButton style={{ display: 'none' }} disabled={true} onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_BREAK_COMM', 'COMM_QUERY_EXP_BREAK_COMM', 'btn.Refund-of-commission-afterwards')}> <SearchOutlined /><FormattedMessage id='btn.Refund-of-commission-afterwards' /></CosButton>
                {/* 提单预提贷方信息 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_WITHHOLDING_COMM_ITEM', 'COMM_QUERY_EXP_WITHHOLDING_COMM_ITEM', 'btn.Credit')}> <SearchOutlined /><FormattedMessage id='btn.Credit' /></CosButton><br />
                {/* 锁定状态信息 */}
                {/* <CosButton onClick={()=>ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_LOCK_STATUS', '', '')}> <SearchOutlined /><FormattedMessage id='btn.Lock-status-information' /></CosButton> */}
                {/* 提单预提借方信息 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_COMM_AD_DEBIT_ITEM', 'COMM_QUERY_EXP_COMM_AD_DRBIT_ITEM', 'btn.Debit')}> <SearchOutlined /><FormattedMessage id='btn.Debit' /></CosButton>
                {/* 未上线地区佣金信息 */}
                <CosButton style={{ display: 'none' }} disabled={true} onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_UTIL_OFFLINE', 'COMM_QUERY_EXP_UTIL_OFFLINE', 'btn.Not-online')}> <SearchOutlined /><FormattedMessage id='btn.Not-online' /></CosButton>
                {/* 手工调整佣金信息 */}
                <CosButton style={{ display: 'none' }} disabled={true} onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_COMMM_ANUAL_ADJUSTMENT', 'COMM_QUERY_EXP_COMMM_ANUAL_ADJUSTMENT', 'btn.Manual-adjustment')}> <SearchOutlined /><FormattedMessage id='btn.Manual-adjustment' /></CosButton>
                {/* 锁定状态信息 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_LOCK_STATUS', 'COMM_QUERY_EXP_LOCK_STATUS', 'btn.Lock-status-information')}> <SearchOutlined /><FormattedMessage id='btn.Lock-status-information' /></CosButton>
                {/* 提单预提借方信息 */}
                {/* <CosButton onClick={()=>ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_COMM_AD_DEBIT_ITEM', '', '')}> <SearchOutlined /><FormattedMessage id='btn.Debit' /></CosButton> */}
                {/* 提单记佣运费信息 */}
                <CosButton onClick={() => ErrorFun(page, null, 'search', 'COMM_QUERY_QUERY_BILL_OFTFREIGHT_CHARGE', 'COMM_QUERY_EXP_BILL_OFTFREIGHT_CHARGE', 'btn.A-servant')}> <SearchOutlined /><FormattedMessage id='btn.A-servant' /></CosButton>
            </div>
            {
                flag ? <div className='footer-table'>
                    {/* 表格 */}
                    {/* <CosButton onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton> */}
                    <PaginationTable
                        dataSource={tableData}
                        columns={columns[0].dataCol}
                        // rowKey='lcrAgreementHeadUuid'
                        rowKey={(record) => record.id}
                        pageChange={ErrorFun}
                        scrollHeightMinus={200}
                        total={tabTabTotal}
                        rowSelection={null}
                        pageSize={page.pageSize}
                        current={page.current}
                    />
                </div> : undefined
            }
            <Loading spinning={spinflag} />
        </div>
    )
}
export default QueryCommissionStatus

// if(url == 'COMM_QUERY_QUERY_SHMT_CNTR_PKG_INFR') {      // 路径信息
//     setColumns(PathInformation);
// } else if(url == "COMM_QUERY_QUERY_ERROR_LOG") {        // 错误信息
//     setColumns(errorMessage);
// } else if(url == "COMM_QUERY_QUERY_CALC_RESULT") {      // 提单佣金计算结果
//     setColumns(calResComm);
// } else if(url == "COMM_QUERY_QUERY_LADEN_CNTR_OPER") {      // 重箱佣金计算结果
//     setColumns(loadComm);
// } else if(url == "COMM_QUERY_QUERY_UTIL_HISTORY") {     // 佣金历史信息
//     setColumns(CommHistory);
// } else if(url == "COMM_QUERY_QUERY_BREAK_COMM") {       // 事后退佣
//     setColumns(BackComm);
// } else if(url == "COMM_QUERY_QUERY_WITHHOLDING_COMM_ITEM") {        // 提单预提贷方信息
//     setColumns(BillLadPrepayment);
// } else if(url == "COMM_QUERY_QUERY_LOCK_STATUS") {      // 锁定状态信息
//     setColumns(LockStatus);
// } else if(url == "COMM_QUERY_QUERY_UTIL_OFFLINE") {     // 未上线地区佣金信息
//     setColumns(CommNotOnline);
// } else if(url == "COMM_QUERY_QUERY_COMMM_ANUAL_ADJUSTMENT") {   // 手工调整佣金信息
//     setColumns(AdjustComm);
// } else if(url == "COMM_QUERY_QUERY_COMM_AD_DEBIT_ITEM") {   // 提单预提借方信息
//     setColumns(DebitInfo);
// } else if(url == "COMM_QUERY_QUERY_BILL_OFTFREIGHT_CHARGE") {   // 提单记佣运费信息
//     setColumns(BillLadCharge);
// }


// 下载
    // const downloadBtn = async() => {
    //     Toast('', '', '', 5000, false);
    //     setSpinflag(true);
    //     let downloadData = {};
    //     columns.map((v, i) => {
    //         downloadData[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
    //     })
    //     let queryData = queryForm.getFieldValue();
    //     const result = await request($apiUrl[downLoadUrl],{
    //         method:"POST",
    //         data:{
    //             params: {
    //                 ...queryData,
    //             },
    //             excelFileName: intl.formatMessage({id: downLoadTitle}), //文件名
    //             sheetList: [{//sheetList列表
    //                 dataCol: downloadData,  //列表字段
    //                 sheetName: intl.formatMessage({id: downLoadTitle}),//sheet名称
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
    //             navigator.msSaveBlob(blob, intl.formatMessage({id: downLoadTitle}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
    //         } else {
    //             let downloadElement = document.createElement('a');  //创建元素节点
    //             let href = window.URL.createObjectURL(blob); // 创建下载的链接
    //             downloadElement.href = href;
    //             downloadElement.download = intl.formatMessage({id: downLoadTitle}) + '.xlsx'; // 下载后文件名
    //             document.body.appendChild(downloadElement); //添加元素
    //             downloadElement.click(); // 点击下载
    //             document.body.removeChild(downloadElement); // 下载完成移除元素
    //             window.URL.revokeObjectURL(href); // 释放掉blob对象
    //         }
    //         setSpinflag(false);
    //     }
    // }

