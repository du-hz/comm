// 待处理佣金预估单
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi';
import { Modal, Button, Card, Input, Form, Row, Tabs } from 'antd';
import { acquireSelectData, acquireSelectDataExtend, agencyCodeData, formatCurrencyNew } from '@/utils/commonDataInterface';
import PaginationTable from "@/components/Common/PaginationTable";
import InputText from '@/components/Common/InputText'
import EstimatedCommissionDetails from './EstimatedCommissionDetails';
import request from '@/utils/request';
import Select from '@/components/Common/Select';
import Loading from '@/components/Common/Loading';
// import CosButton from '@/components/Common/CosButton'
import { CosDownLoadBtn, CosButton } from '@/components/Common/index'

import {
    SearchOutlined,//查询
    SaveOutlined,//保存
    // CheckOutlined,//选择
    ReloadOutlined,//取消
    CarryOutOutlined, //确认
    CloudUploadOutlined,//上载
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'
import { Toast } from '@/utils/Toast'
const confirm = Modal.confirm;
// tab切换
const { TabPane } = Tabs;
const PendingCommissionEstimate = () => {
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [tableData, setTableData] = useState([]);   // table 数据
    const [tabTabTotal, setTabTotal] = useState([]);     // table 条数
    const [detailedData, setDetailedData] = useState([]);   // 明细列表
    const [detailedTotal, setDetailedTotal] = useState([]);   // 明细table条数
    const [detailedList, setDetailedList] = useState([]);   // 明细列表
    const [queryDataCode, setQueryDataCode] = useState([]);   // 头
    const [uuidData, setUuidData] = useState('');   // uuid    
    const [defaultKey, setDefaultKey] = useState('1');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [messageHeader, setMessageHeader] = useState([]);  // 头信息
    const [headerTitle, setHeaderTitle] = useState([]);  // 头标题
    const [detailedIncome, setDetailedIncome] = useState([]);  // 明细列表收入
    const [aggregateRevenue, setAggregateRevenue] = useState([]);  // 汇总信息收入
    const [detailedExpenditure, setDetailedExpenditure] = useState([]);  // 明细列表支出
    const [aggregateExpenditure, setAggregateExpenditure] = useState([]);  // 汇总信息支出
    const [checked, setChecked] = useState([]);
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [detailedUuid, setDetailedUuid] = useState('');
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [objMessage, setObjMessage] = useState({});   // 提示信息对象
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    });

    const [pages, setPages] = useState({
        current: 1,
        pageSize: 10
    });

    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [stateData, setStateData] = useState({});   // 状态
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [packageData, setPackage] = useState({}); // 是否生成数据包
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内

    useEffect(() => {
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setStateData, $apiUrl);     // 状态
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AFCM.PACKAGE.FLAG', setPackage, $apiUrl);// 是否生成数据包
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     //    佣金类型
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        })
    }, [company, acquireData,])

    // 预估单列表
    const ForecastList = async (pagination, options, search, message) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        setBackFlag(true);
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        if (!formData.agencyCode) {
            setBackFlag(false);
            setSpinflag(false);
            message ? Toast('', message, 'alert-success', 5000, false) : Toast('', formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false);
        } else {
            const result = await request($apiUrl.COMM_ER_SEARCH_IN_PROCESS_BILL, {
                method: "POST",
                data: {
                    page: pagination,
                    erReceiptVerifyStatus: 'W',
                    params: {
                        shipownerCompanyCode: formData.shipownerCompanyCode,
                        agencyCode: formData.agencyCode,
                    }
                }
            })
            console.log(result)
            if (result.success) {
                setSpinflag(false);
                setPage({ ...pagination })
                let data = result.data;
                setTableData(data.commissionYgList);
                setTabTotal(data.totalCount);
            } else {
                setSpinflag(false);
                setTabTotal(0);
                setTableData([]);
                message ? undefined : Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
        }
        message ? Toast('', message, 'alert-success', 5000, false) : null;
    }

    // 预估单列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.Temporary.estimated-order-number" />,// 临时预估单号码
            dataIndex: 'tmpYgListCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Estimated-order-number' />,// 预估单号码
            dataIndex: 'ygListCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.generation-date" />,// 生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDatetime',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Generation-personnel" />,// 生成人员
            dataIndex: 'generateUser',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.update-people" />,// 更新人员
            dataIndex: 'recordUpdateUser',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.update-date" />,// 更新日期
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            // sorter: false,
            width: 120,
        }
    ]
    const inputRef = React.useRef(null);
    const sharedProps = {
        style: {
            width: '100%',
        },
        defaultValue: 'Ant Design love you!',
        ref: inputRef,
    };

    const inputValue = (e, record) => {
        let value = e.target.value;
        record.userNote = value;
        record.remarks = false;
    }
    // 明细列表
    const detailedColumns = [
        {
            title: <FormattedMessage id="lbl.state" />, // 状态	
            dataType: stateData.values,
            dataIndex: 'verifyStatus',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.ac.pymt.claim-note" />, // 备注
            dataIndex: 'userNote',
            // sorter: false,
            width: 120,
            render: (text, record, index) => {
                return <div style={{ 'width': '100%', 'height': '25px' }} onClick={() => { record.remarks = true }}>
                    {
                        record.remarks ? <Input defaultValue={text} onBlur={(e) => inputValue(e, record)} /> : <span>{text}</span>
                    }
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.Estimated-order-number" />, // 预估单号码	
            dataIndex: 'ygListCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.generation-date" />,// 生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDate',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commType.values,
            dataIndex: 'commissionType',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.pdr-fnd" />,// POR/FND
            dataIndex: 'porFndQskey',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.office" />,// OFFICE
            dataIndex: 'officeCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            // sorter: false,
            width: 120,
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
            width: 130,
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
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,// 本位币税金(参考)	
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,// 本位币调整税金(参考)	
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130,
        }, {
            title: <FormattedMessage id="lbl.settlement-currency" />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)	
            dataIndex: 'vatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,// 结算币调整税金(参考)	
            dataIndex: 'reviseVatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
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
            title: <FormattedMessage id="lbl.within-boundary" />,// 是否边界内
            dataType: withinBoundary.values,
            dataIndex: 'excludeFlag',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Contract-No" />,// 合约号
            dataIndex: 'agmtId',
            // sorter: false,
            width: 120,
        }
    ];

    // 明细统计列表
    const detailedStatisticsList = [
        {
            title: <FormattedMessage id="lbl.The-Commission" />, // 佣金模式	
            dataIndex: 'commissionMode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />, // 协议币种	
            dataIndex: 'rateCurrencyCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />, // 	协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />, // 	协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-price" />, // 	协议币税价（参考)
            dataIndex: 'vatAmtSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.agreement-currency-adjusts" />, // 	协议币调整税价（参考）
            dataIndex: 'vatReviseAmtSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130,
        }, {
            title: <FormattedMessage id="lbl.Standard-currency" />, // 	本位币种
            dataIndex: 'agencyCurrencyCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />, // 	本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />, // 	本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />, // 	本位币税金（参考）
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />, // 	本位币调整税金（参考）
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130,
        }, {
            title: <FormattedMessage id="lbl.settlement-currency" />, // 	结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />, // 	结算币金额
            dataIndex: 'totalAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />, // 	结算币调整金额
            dataIndex: 'reviseAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />, // 	结算币税金（参考）
            dataIndex: 'vatAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />, // 	结算币调整税金（参考）
            dataIndex: 'reviseVatAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 130,
        }, {
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />, // 	应付网点金额
            dataIndex: 'pymtAmtSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agency-net-income" />, // 	代理净收入
            dataIndex: 'recAmtSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.estimate" />, // 	向谁预估
            dataIndex: 'ygSide',
            // sorter: false,
            width: 120,
        }
    ]

    // 保存
    const saveBtn = async () => {
        Toast('', '', '', 5000, false);
        let data = [];
        detailedData.map((v, i) => {
            data.push({
                entryUuid: v.entryUuid,
                status: v.verifyStatus,
                userNote: v.userNote,
            })
        })

        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.save' }),
            content: formatMessage({ id: 'lbl.comm-est-save' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const result = await request($apiUrl.COMM_ER_UPDATE_YG_LIST_DTL, {
                    method: "POST",
                    data: {
                        operateType: 'SAVE',
                        params: {
                            agencyCode: queryDataCode.agencyCode,
                            commonCommissionList: data,
                            entryUuid: queryDataCode.ygListUuid
                        },
                    }
                })
                console.log(result)
                if (result.success) {
                    setSpinflag(false);
                    Toast('', result.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                    Toast('', result.errorMessage, 'alert-error', 5000, false);
                }
            }
        })
    }

    // 确认 and 确认所以
    const okBtn = async (okType, dataF) => {
        Toast('', '', '', 5000, false);
        // saveBtn();
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.affirm' }),
            content: formatMessage({ id: okType == "CONFIRM" ? 'lbl.comm-est-ok' : 'lbl.comm-est-all-ok' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const result = await request($apiUrl.COMM_ER_CONFIRM_YG_LIST, {
                    method: "POST",
                    data: {
                        operateType: okType,
                        uuid: detailedUuid
                        // uuid: uuidData,
                    }
                })
                console.log(result)
                if (result.success) {
                    setSpinflag(false);
                    setDefaultKey('1');
                    ForecastList(page, null, 'search', result.message)
                } else {
                    setSpinflag(false);
                    Toast('', result.errorMessage, 'alert-error', 5000, false)
                }
            }
        })
    }

    // 选择和状态的联动
    const selectFun = (detailedData, row) => {
        detailedData.map((v, i) => {
            v.verifyStatus = stateData.values[3].value;
        })
        row.map((v, i) => {
            v.verifyStatus = stateData.values[2].value;
        })
        setDetailedData(detailedData);
    }

    // 全选 and 全不选
    const AllSelect = async (flag) => {
        // true-全选
        Toast('', '', '', 5000, false);
        let data = detailedData.map((v, i) => {
            return v.entryUuid;
        })
        flag ? setChecked(data) : setChecked([]);
        flag ? selectFun(detailedData, detailedData) : selectFun(detailedData, []);
    }

    // 取消
    const cancelBtn = async () => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.cancel' }),
            content: formatMessage({ id: 'lbl.comm-est-cancel' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const result = await request($apiUrl.COMM_ER_CANCEL_YG_LIST, {
                    method: "POST",
                    data: {
                        operateType: 'CANCEL',
                        uuid: uuidData
                    }
                })
                console.log(result)
                if (result.success) {
                    setSpinflag(false);
                    setDefaultKey('1');
                    ForecastList(page, null, 'search', result.message)
                } else {
                    setSpinflag(false);
                    Toast('', result.errorMessage, 'alert-error', 5000, false)
                }
            }
        })
    }

    // 双击  预估单列表
    const handleDoubleClickRow = (parameter) => {
        setDetailedUuid('');
        setDetailedUuid(parameter.ygListUuid);
        pageChange(pages, null, 'search', parameter.ygListUuid);
    }

    // 明细信息--查询
    const pageChange = async (pagination, options, search, ygListUuid) => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        console.log(ygListUuid ? ygListUuid : detailedUuid, '||', ygListUuid, '||', detailedUuid)
        const result = await request($apiUrl.COMM_ER_SEARCH_IN_PROCESS_BILL_DTL, {
            method: "POST",
            data: {
                page: pagination,
                uuid: ygListUuid ? ygListUuid : detailedUuid
            }
        })
        console.log(result)
        if (result.success) {
            // if(pagination.pageSize!=pages.pageSize){
            //     pagination.current=1
            // }
            setSpinflag(false);
            setDefaultKey('2');
            setPages({ ...pagination })
            let data = result.data;
            let verifyStatus = '';
            let queryd = data.commissionYgList[0];
            setUuidData(queryd.ygListUuid);
            setQueryDataCode(queryd);
            let listdata = data.commissionYgDetailList;
            listdata.map((v, i) => {    // 备注默认不可编辑
                v['remarks'] = false;
            })
            setDetailedData(listdata)       // 列表

            let checkedUuid = [];
            console.log(detailedData, 1, data.commissionYgDetailList);
            data.commissionYgDetailList.map((v, i) => {
                if (v.verifyStatus == stateData.values[2].value) {
                    checkedUuid.push(v.entryUuid);
                }
            })
            setChecked(checkedUuid);
            setDetailedTotal(data.totalCount);    //  明细条数
            setDetailedList(data.commissionStatistics);       //  明细统计列表
            // setSelectedRowKeys(data.commissionStatistics.length ? [data.commissionStatistics[0].verifyStatus] : [])
            stateData.values.map((v, i) => {
                queryd.verifyStatus == v.value ? verifyStatus = v.label : '';
            })
            queryForm.setFieldsValue({
                ygListCode: queryd.ygListCode,
                verifyStatus: verifyStatus,
                generateDatetime: queryd.generateDatetime ? queryd.generateDatetime.substring(0, 10) : '',
                generateUser: queryd.generateUser,
                totalCount: data.totalCount,
                recordUpdateDate: queryd.recordUpdateDate ? queryd.recordUpdateDate.substring(0, 10) : '',
                recordUpdateUser: queryd.recordUpdateUser,
            })
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false)
        }
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

    // 多选
    const setSelectedRows = (val) => {
        console.log(val, 'ygListUuid');
        // setUuidData(val);
    }

    const callback = (key) => {
        Toast('', '', '', 5000, false);
        setDefaultKey(key)
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

    // 重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setObjMessage({});
        setBackFlag(true);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        })
        setTabTotal(0);
        setTableData([]);
        setPage({
            current: 1,
            pageSize: 10
        })
    }

    return (
        <div className='parent-box'>
            <Tabs type="card" onChange={callback} activeKey={defaultKey}>
                <TabPane tab={<FormattedMessage id='lbl.Forecast-list' />} key="1">
                    <div className='header-from' style={{ marginTop: '15px' }}>
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
                                    company.companyType == 0 ? <InputText name='agencyCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} name='agencyCode' options={agencyCode} style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id='lbl.agency' />} span={6} />
                                }
                                {/* <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information' /></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 重置 */}
                            <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                            {/* 查询 */}
                            <CosButton onClick={() => ForecastList(page, null, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                        </div>
                    </div>
                    <div className="footer-table" >
                        <div>
                            <PaginationTable
                                dataSource={tableData}
                                columns={columns}
                                // rowKey='lcrAgreementHeadUuid'
                                pageChange={ForecastList}
                                scrollHeightMinus={200}
                                total={tabTabTotal}
                                pageSize={page.pageSize}
                                current={page.current}
                                rowSelection={null}
                                handleDoubleClickRow={handleDoubleClickRow}
                                selectWithClickRow={true}
                            />
                        </div>
                    </div>
                </TabPane>
                <TabPane disabled tab={<FormattedMessage id='lbl.Detailed-information' />} key="2">
                    <div className='header-from' style={{ marginTop: '15px' }}>
                        <Form
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 预估单号码 */}
                                <InputText disabled name='ygListCode' label={<FormattedMessage id='lbl.Estimated-order-number' />} span={6} />
                                {/* 预估单状态 */}
                                <InputText disabled name='verifyStatus' label={<FormattedMessage id='lbl.Estimated-single-state' />} span={6} />
                                {/* 生成日期 */}
                                <InputText disabled name='generateDatetime' label={<FormattedMessage id='lbl.generation-date' />} span={6} />
                                {/* 生成人员 */}
                                <InputText disabled name='generateUser' label={<FormattedMessage id='lbl.Generation-personnel' />} span={6} />
                                {/* 行项目数 */}
                                <InputText disabled name='totalCount' label={<FormattedMessage id='lbl.Number-of-line-items' />} span={6} />
                                {/* 更新人员 */}
                                <InputText disabled name='recordUpdateUser' label={<FormattedMessage id='lbl.update-people' />} span={6} />
                                {/* 更新日期 */}
                                <InputText disabled name='recordUpdateDate' label={<FormattedMessage id='lbl.update-date' />} span={6} />
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.es-header-info' /></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 全选 */}
                            <CosButton onClick={() => AllSelect(true)}><SearchOutlined /><FormattedMessage id='btn.select-all' /></CosButton>
                            {/* 全不选 */}
                            <CosButton onClick={() => AllSelect(false)}><SearchOutlined /><FormattedMessage id='btn.no-at-all' /></CosButton>
                            {/* 保存 */}
                            <CosButton auth="AFCM_CMS_ER_003_B01" onClick={saveBtn}><SaveOutlined /><FormattedMessage id='btn.save' /></CosButton>
                            {/* 确认 */}
                            <CosButton auth="AFCM_CMS_ER_003_B02" onClick={() => okBtn('CONFIRM')}><CarryOutOutlined /><FormattedMessage id='btn.ok' /></CosButton>
                            {/* 确认所有 */}
                            <CosButton auth="AFCM_CMS_ER_003_B03" onClick={() => okBtn('ALL_CONFIRM')}><CarryOutOutlined /><FormattedMessage id='btn.ok-all' /></CosButton>
                            {/* 取消 */}
                            <CosButton auth="AFCM_CMS_ER_003_B04" onClick={cancelBtn}>< ReloadOutlined /><FormattedMessage id='btn.cancel' /></CosButton>
                            {/* 上载全部 */}
                            <CosButton><CloudUploadOutlined /><FormattedMessage id='btn.upload-all' /></CosButton>
                            {/* 上载错误 */}
                            <CosButton><CloudUploadOutlined /><FormattedMessage id='btn.upload-error' /></CosButton>
                            {/* 下载 */}
                            {/* <CosButton onClick={downloadBtn}><CloudDownloadOutlined/><FormattedMessage id='btn.download'/></CosButton> */}
                            {/* 下载 */}
                            <CosDownLoadBtn
                                disabled={detailedData.length ? false : true}
                                downLoadTitle={'menu.afcm.comm.er.pending-comm'}
                                downColumns={[{ dataCol: detailedColumns, sumCol: detailedStatisticsList }]}
                                downLoadUrl={'COMM_ER_EXP_IN_PROCESS_BILL_DTL'}
                                downDataUuid={detailedUuid}
                                setSpinflag={setSpinflag}
                                btnName={'lbl.download'} />
                        </div>
                        <div className='button-right'></div>
                    </div>
                    <div className='footer-table'>
                        {/* 表格 */}
                        <PaginationTable
                            dataSource={detailedData}
                            columns={detailedColumns}
                            rowKey='entryUuid'
                            pageChange={pageChange}
                            scrollHeightMinus={200}
                            total={detailedTotal}
                            setSelectedRows={setSelectedRows}
                            pageSize={pages.pageSize}
                            current={pages.current}
                            rowSelection={{
                                selectedRowKeys: checked,
                                onChange: (key, row) => {
                                    setChecked(key);
                                    setUuidData(row);
                                    selectFun(detailedData, row);
                                }
                            }}
                            handleDoubleClickRow={doubleClickRow}
                            selectWithClickRow={true}
                        // rowSelection={null}
                        />
                    </div>
                    <div className='footer-table' style={{ marginTop: '10px' }}>
                        <PaginationTable
                            rowKey="entryUuid"
                            columns={detailedStatisticsList}
                            dataSource={detailedList}
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={200}
                        />
                    </div>
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag} />
            <EstimatedCommissionDetails initData={initData} />
        </div >
    )
}
export default PendingCommissionEstimate

// 下载
    // const downloadBtn = async() => {
    //     Toast('', '', '', 5000, false);
    //     // let queryData = queryForm.getFieldValue();
    //     const result = await request($apiUrl.COMM_ER_EXP_IN_PROCESS_BILL_DTL,{
    //         method:"POST",
    //         data:{
    //             page: {
    //                 current: 0,
    //                 pageSize: 0
    //             },
    //             uuid: detailedUuid,
    //             excelFileName: intl.formatMessage({id: 'menu.afcm.comm.er.pending-comm'}), //文件名
    //             sheetList: [{//sheetList列表
    //                 dataCol: {//列表字段
    //                     verifyStatus: intl.formatMessage({id: "lbl.state"}),     // 状态
    //                     userNote: intl.formatMessage({id: "lbl.ac.pymt.claim-note"}),     // 备注
    //                     ygListCode: intl.formatMessage({id: "lbl.Estimated-order-number"}),     // 预估单号码
    //                     billReferenceCode: intl.formatMessage({id: "lbl.bill-of-lading-number"}),    // 提单号码
    //                     commissionMode: intl.formatMessage({id: "lbl.The-Commission"}),    // 佣金模式
    //                     generateDate: intl.formatMessage({id: "lbl.generation-date"}),  // 生成日期
    //                     commissionType: intl.formatMessage({id: "lbl.Commission-type"}),    // 佣金类型
    //                     svvdId: intl.formatMessage({id: "lbl.SVVD"}),    // SVVD
    //                     portCode: intl.formatMessage({id: "lbl.port"}),    // 港口
    //                     porFndQskey: intl.formatMessage({id: "lbl.pdr-fnd"}),    // POR/FND
    //                     officeCode: intl.formatMessage({id: "lbl.office"}),     // OFFICE
    //                     rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),    // 协议币种
    //                     totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),    // 协议币金额
    //                     reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),    // 协议币调整金额
    //                     vatFlag: intl.formatMessage({id: "lbl.Whether-the-price-includes-tax"}),    // 是否含税价
    //                     vatAmount: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),    // 协议币税金(参考)
    //                     vatReviseAmount: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),    // 协议币调整税金(参考)
    //                     paymentAmount: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),    // 应付网点金额
    //                     customerSapId: intl.formatMessage({id: "lbl.AP-outlets"}),    // 应付网点
    //                     recAmount: intl.formatMessage({id: "lbl.Agency-net-income"}),    // 代理净收入
    //                     ygSide: intl.formatMessage({id: "lbl.estimate"}),    // 向谁预估
    //                     profitCenterCode: intl.formatMessage({id: "lbl.profit-center"}),    // 利润中心
    //                     bookingPartyCode: intl.formatMessage({id: "lbl.Booking-Party"}),    // Booking Party
    //                     agencyCurrencyCode: intl.formatMessage({id: "lbl.Standard-currency"}),    // 本位币种
    //                     totalAmountInAgency: intl.formatMessage({id: "lbl.Amount-in-base-currency"}),    // 本位币金额
    //                     reviseAmountInAgency: intl.formatMessage({id: "lbl.Adjustment-amount-in-base-currency"}),    // 本位币调整金额
    //                     vatAmountInAgency: intl.formatMessage({id: "lbl.Tax-in-local-currency"}),    // 本位币税金(参考)
    //                     reviseVatAmountInAgency: intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}),    // 本位币调整税金(参考)
    //                     clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),    // 结算币种
    //                     totalAmountInClearing: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),    // 结算币金额
    //                     reviseAmountInClearing: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),    // 结算币调整金额
    //                     vatAmountInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),    // 结算币税金(参考)
    //                     reviseVatAmountInClearing: intl.formatMessage({id: "lbl.tax-adjustment-in-settlement-currency"}),    // 结算币调整税金(参考)
    //                     container20: intl.formatMessage({id: "lbl.twelve-size"}),    // 12/20尺箱
    //                     container40: intl.formatMessage({id: "lbl.forty-size"}),    // 40/45尺箱
    //                     commissionBase: intl.formatMessage({id: "lbl.Total-Teu-or-Freight"}),     // Total Teu or Freight
    //                     commissionRate: intl.formatMessage({id: "lbl.rate-one"}),    // 费率
    //                     excludeFlag: intl.formatMessage({id: "lbl.within-boundary"}),    // 是否边界内
    //                     agmtId: intl.formatMessage({id: "lbl.Contract-No"}),    // 合约号
    //                 },
    //                 sumCol: {//汇总字段
    //                     commissionMode: intl.formatMessage({id: "lbl.The-Commission"}),   // 佣金模式
    //                     rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),   // 协议币种
    //                     totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),   // 协议币金额
    //                     reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),   // 协议币调整金额
    //                     vatAmtSum: intl.formatMessage({id: "lbl.Agreement-currency-tax-price"}),   // 协议币税价（参考)
    //                     vatReviseAmtSum: intl.formatMessage({id: "lbl.Adjustment-of-tax-price-in-agreement-currency"}),   // 协议币调整税价（参考）
    //                     agencyCurrencyCode: intl.formatMessage({id: "lbl.Standard-currency"}),   // 本位币种
    //                     totalAmountInAgency: intl.formatMessage({id: "lbl.Amount-in-base-currency"}),   // 本位币金额
    //                     reviseAmountInAgency: intl.formatMessage({id: "lbl.Adjustment-amount-in-base-currency"}),   // 本位币调整金额
    //                     vatAmountInAgency: intl.formatMessage({id: "lbl.Tax-in-local-currency"}),   // 本位币税金（参考）
    //                     reviseVatAmountInAgency: intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}),   // 本位币调整税金（参考）
    //                     clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),  // 结算币种
    //                     totalAmountInClearingSum: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),   // 结算币金额
    //                     reviseAmountInClearingSum: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),  // 结算币调整金额
    //                     vatAmountInClearingSum: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),    // 结算币税金(参考)
    //                     reviseVatAmountInClearingSum: intl.formatMessage({id: 'lbl.tax-adjustment-in-settlement-currency'}),   // 结算币调整税金(参考)
    //                     pymtAmtSum: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),   // 应付网点金额
    //                     recAmtSum: intl.formatMessage({id: "lbl.Agency-net-income"}),   // 代理净收入
    //                     ygSide: intl.formatMessage({id: "lbl.estimate"}),   // 向谁预估
    //                 },
    //                 sheetName: intl.formatMessage({id: 'menu.afcm.comm.er.pending-comm'}),//sheet名称
    //             }],
    //         },
    //         headers: {
    //             "biz-source-param": "BLG"
    //         },
    //         responseType: 'blob',
    //     })
    //     // if(result && result.success == false){  //若无数据，则不下载
    //     //     Toast('', result.errorMessage, 'alert-error', 5000, false);
    //     //     return
    //     // }else{
    //         let blob = new Blob([result], { type: "application/x-xls" });
    //         // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
    //         if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
    //             navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.comm.er.pending-comm'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
    //         } else {
    //             let downloadElement = document.createElement('a');  //创建元素节点
    //             let href = window.URL.createObjectURL(blob); // 创建下载的链接
    //             downloadElement.href = href;
    //             downloadElement.download = intl.formatMessage({id: 'menu.afcm.comm.er.pending-comm'}) + '.xlsx'; // 下载后文件名
    //             document.body.appendChild(downloadElement); //添加元素
    //             downloadElement.click(); // 点击下载
    //             document.body.removeChild(downloadElement); // 下载完成移除元素
    //             window.URL.revokeObjectURL(href); // 释放掉blob对象
    //         }
    //     // }
    // }