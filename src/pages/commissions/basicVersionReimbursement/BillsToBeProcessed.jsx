import React, { useState, useEffect, $apiUrl, createContext } from 'react'
import { FormattedMessage, formatMessage } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import SelectVal from '@/components/Common/Select';
import { acquireSelectData, momentFormat, agencyCodeData, acquireSelectDataExtend } from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Modal, Tabs } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import DatePicker from '@/components/Common/DatePicker'
import moment from 'moment';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import { createFromIconfontCN } from '@ant-design/icons';
import CosModal from '@/components/Common/CosModal'
import {
    SearchOutlined,//日志
    SaveOutlined,//保存
    FileProtectOutlined,//审核
    CloudDownloadOutlined,//日志
    ReloadOutlined,
    FileExclamationOutlined,
    ImportOutlined
} from '@ant-design/icons'
export const NumContext = createContext();
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_dkztm8notr4.js', // 在 iconfont.cn 上生成
});

// ------------------------------------待处理报账单--------------------------

const confirm = Modal.confirm
const { TabPane } = Tabs;
let formlayouts = {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const searchPreAgreementMailFeeAgmtList = () => {
    const [agencyCode, setAgencyCode] = useState([]);   // 代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [checkStatus, setCheckStatus] = useState({});//审核状态
    const [auditStatus, setAuditStatus] = useState({});//审核状态
    const [postStatus, setPostStatus] = useState({});//记账状态
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [tableFlag, setTableFlag] = useState(true) // 明细表格选择是否禁用
    const [tabTabTotal, setTabTotal] = useState([])//
    const [localChargeTabTotal, setLocalChargeTabTotal] = useState([])//
    const [detailedTabTabTotal, setDetailedTabTotal] = useState([])//

    const [defaultKey, setDefaultKey] = useState('1');
    const [checked, setChecked] = useState([]); //选择
    const [uuidData, setUuidData] = useState('');   // uuid  
    const [selectedRowKeys, setSelectedRowKeys] = useState([])//明细的选择
    const [spinflag, setSpinflag] = useState(false)
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
    });

    const [tableData, setTableData] = useState([])//表格数据
    const [tableDataDetailed, setTableDataDetailed] = useState([])//明细表格数据
    const [tableDataLocalChargeData, setTableDataLocalChargeData] = useState([])//明细表格数据
    const [isModalVisible, setIsModalVisible] = useState(false)//控制弹框开关
    const [cancel, setCancel] = useState(false) // 取消报账单  
    const [checkAll, setCheckAll] = useState(false) // 全选  
    const [checkDontAll, setCheckDontAll] = useState(false) // 全不选  
    const [save, setSave] = useState(false) // 保存  
    const [businessThrough, setBusinessThrough] = useState(false) // 业务审核通过  
    const [businessBack, setBusinessBack] = useState(false) // 业务审核退回
    const [financeThrough, setFinanceThrough] = useState(false) // 财务审核通过 
    const [financeBack, setFinanceBack] = useState(false) // 财务审核退回
    const [agencyFlag, setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [commissionTypes, setCommissionTypes] = useState({});    // 佣金类型
    const [ytStatusSystem, setYtStatusSystem] = useState({})//预提状态
    const [buttonFlag, setButtonFlag] = useState(false)
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })
    const [pageDetail, setPageDetail] = useState({
        current: 1,
        pageSize: 10
    })
    const [pageLcDetail, setPageLcDetail] = useState({
        current: 1,
        pageSize: 10
    })
    const [queryForm] = Form.useForm();
    const [queryForms] = Form.useForm();
    const [queryFormss] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        queryForms.setFieldsValue({
            budateUpload: moment(Date())
        })
    }, [company, acquireData])

    useEffect(() => {
        acquireSelectData('AFCM.ER.VERIFY.RECEIPT.STATUS', setCheckStatus, $apiUrl)//审核状态
        acquireSelectData('AFCM.OFFCR.DTL.VERIFYSTATUS', setAuditStatus, $apiUrl)//审核状态
        acquireSelectData('CERTIFICATE.STATUS', setPostStatus, $apiUrl)//记账状态
        acquireSelectData('COMM.TYPE', setCommissionTypes, $apiUrl); // 佣金类型
        acquireSelectData('YT.STATUS.FOR.CROSS', setYtStatusSystem, $apiUrl); // 预提状态
        agencyCodeData($apiUrl, setAgencyCode, setCompany)//代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
    }, [])

    // 全部佣金小类(佣金类型)
    const allCommissionTypes = async () => {
        await request.post($apiUrl.COMMON_SEARCH_COMM_TYPE)
            .then((resul) => {
                if (!resul.data) return
                let data = resul.data
                data.map((v, i) => {
                    let labels = v.label
                    let values = v.value
                    v.label = values + '(' + labels + ')'
                    v.value = labels
                })
                setCommissionTypes(resul.data)
            })
    }
    const callback = (key) => {
        Toast('', '', '', 5000, false);
        setDefaultKey(key);
        //    if( defaultKey == '1' ){
        //     queryFormss.resetFields()
        //     setTableDataDetailed([])
        //     setTableDataLocalChargeData([])
        //    }
    }

    //待处理报账单表格文本
    const columns = [
        {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,//报账单号码
            dataIndex: 'sfListCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key: 'COMPANY_CDE',
            sorter: false,
            align: 'left',
            width: 100,

        },
        {
            title: <FormattedMessage id="lbl.audit-status" />,//审核状态
            dataType: checkStatus.values,
            dataIndex: 'verifyStatus',
            sorter: false,
            key: 'COMPANY_NME_ABBR',
            width: 120,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.State-of-charge-to-an-account" />,//记账状态
            dataType: postStatus.values,
            dataIndex: 'postStatus',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            // dataType: 'dateTime',
            dataIndex: 'generateDatetime',
            sorter: false,
            key: 'AGMT_STATUS',
            width: 80,
            align: 'left'
        },
        {
            title: <FormattedMessage id="lbl.Generation-personnel" />,//生成人员
            dataIndex: 'generateUser',
            sorter: false,
            key: 'FM_DTE',
            width: 120,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.audit-date" />,//审核日期
            dataType: 'dateTime',
            dataIndex: 'checkDatetime',
            sorter: false,
            key: 'TO_DTE',
            width: 120,
            align: 'left'
        },
        {
            title: <FormattedMessage id="lbl.auditor-comm" />,//审核人员
            dataIndex: 'checkUser',
            sorter: false,
            key: 'TO_DTE',
            width: 120,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.accounting-date" />,//记账日期
            dataType: 'dateTime',
            dataIndex: 'budatUpload',
            sorter: false,
            key: 'TO_DTE',
            width: 120,
            align: 'left'
        },
        {
            title: <FormattedMessage id="lbl.voucher-number" />,//凭证号码
            dataIndex: 'checkTimes',
            sorter: false,
            key: 'TO_DTE',
            width: 120,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种  
            dataIndex: 'currencyCode',
            sorter: false,
            key: 'CHECK_FAD_STATUS',
            width: 80,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.Cal-cur-adt-tal-amt" />,//结算币调整总金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'right',

        }

    ]
    //明细表格
    const informationcolumns = [
        {
            title: <FormattedMessage id="lbl.audit-status" />,//审核状态
            dataType: auditStatus.values,
            dataIndex: 'verifyStatus',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'billReferenceCode',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            key: 'AGMT_STATUS',
            width: 80,
            align: 'left'
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            // dataIndex: 'clerExchangeRate',
            dataIndex: 'rateTotalAmount',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'right',

        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'currencyCode',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'commissionAmount',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.Settlement-currency-amount" />,//结算币总金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmountManual',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'right',

        },
        {
            title: <FormattedMessage id="lbl.Settlement-currency-exchange-rate" />,//结算币种汇率
            dataIndex: 'clerExchangeRate',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.commission-big-type" />,//佣金大类
            dataIndex: 'commissionClass',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 150,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.Remark" />,//Remark
            dataIndex: 'adjustFlag',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 150,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.company-code" />,//公司代码
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 150,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdIdSystem',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 150,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCodeSystem',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 150,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.The-Commission" />,//佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 150,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.versions" />,//版本
            dataIndex: 'versionNumber',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 150,
            align: 'left',

        }

    ]
    //LocalCharge表格
    const LocalChargecolumns = [
        {
            title: <FormattedMessage id="lbl.Provisional-bill-number" />,//临时报账单号
            dataIndex: 'tmpSfListCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.bill-no" />,//提单号
            dataIndex: 'billReferenceCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.The-Commission" />,//佣金模式
            dataIndex: 'commissionMode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataIndex: 'commissionType',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.chargeCode" />,//Charge code
            dataIndex: 'chargeCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.act-flag" />,//Act flag
            dataIndex: 'actualFlag',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.versions" />,//版本
            dataIndex: 'versionNumber',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.Return-the-currency" />,//返还币种
            dataIndex: 'rateCurrencyCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.refund" />,//返还金额
            dataIndex: 'refund',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'right',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.Refund-of-adjustment" />,//返还调整金额
            dataIndex: 'reviseAmount',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'right',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.return-the-proportion" />,//返还比例
            dataType: 'dataAmount',
            dataIndex: 'refundRate',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'totalAmountInClearing',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'right',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'right',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.Return-the-base" />,//返还基数
            dataIndex: 'commissionBase',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.office" />,//office
            dataIndex: 'officeCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.Record-update-date" />,//记录更新日期
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.Record-the-uploaded-lot" />,//记录上载批次
            dataIndex: 'recordLoadDate',
            key: 'COMM_AGMT_CDE',
            sorter: false,
            align: 'left',
            width: 120,
        }
    ]
    //初始化下拉框数据
    useEffect(() => {
        queryForm.setFieldsValue({
            ...lastCondition,
        });

    }, [])

    //表格数据
    const pageChange = async (pagination, options, search) => {
        Toast('', '', '', 5000, false)
        setTableData([])
        let query = queryForm.getFieldsValue()
        queryForms.resetFields();
        queryFormss.resetFields();
        queryForms.setFieldsValue({
            'budateUpload': moment(Date())
        })
        setTableDataLocalChargeData([])
        setTableDataDetailed([])
        if (!query.agencyCode) {
            setAgencyFlag(false)
            //代理编码必须输入
            Toast('', formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false)
        } else {
            setAgencyFlag(true)
            if (!query.checkDate && !query.generateDate && !query.sfListCode && !query.Svvd && !query.billReferenceCode && !query.budateUpload) {
                setBackFlag(false)
                //代理编码不能为空,报帐单号/生成日期/确认日期/记帐日期不能同时为空'
                Toast('', formatMessage({ id: 'lbl.sfList-budateUpload-must-enter' }), 'alert-error', 5000, false)
            } else {
                setSpinflag(true)
                setBackFlag(true)
                let localsearch = await request($apiUrl.COMM_CROSSBOOKING_QUERY_HEAD_INFO, {
                    method: 'POST',
                    data: {
                        "page": pagination,
                        "params": {
                            'shipownerCompanyCode': query.shipownerCompanyCode,
                            'agencyCode': query.agencyCode,
                            'sfListCode': query.sfListCode,
                            'verifyStatus': query.verifyStatus,
                            'postStatus': query.postStatus,
                            'checkDateFrom': query.checkDate ? momentFormat(query.checkDate[0]) : null,
                            'checkDateTo': query.checkDate ? momentFormat(query.checkDate[1]) : null,
                            'generateDateFrom': query.generateDate ? momentFormat(query.generateDate[0]) : null,
                            'generateDateTo': query.generateDate ? momentFormat(query.generateDate[1]) : null,
                            'budateUploadFrom': query.budateUpload ? momentFormat(query.budateUpload[0]) : null,
                            'budateUploadTo': query.budateUpload ? momentFormat(query.budateUpload[1]) : null,
                        },
                    }
                })
                console.log(localsearch)
                if (localsearch.success) {
                    setSpinflag(false)
                    let data = localsearch.data
                    let datas = localsearch.data ? localsearch.data.resultList : null
                    datas ? datas.map((v, i) => {
                        v['id'] = i
                    }) : null
                    data ? setTabTotal(data.totalCount) : null
                    datas ? setTableData([...datas]) : null
                    if (pagination.pageSize != page.pageSize) {
                        pagination.current = 1
                    }
                    setPage({ ...pagination })
                    Toast('', localsearch.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false)
                    Toast('', localsearch.errorMessage, 'alert-error', 5000, false)
                }
            }
        }
    }
    const mailing = () => {
        setIsModalVisible(true)
    }
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisible(false)
    }

    //待处理报账单---查询明细数据
    const Detailed = async (pagination) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let verifyStatus = queryForms.getFieldsValue().verifyStatus
        checkStatus.values.map((v, i) => {
            verifyStatus == v.label ? verifyStatus = v.value : '';
        })
        let detailed = await request($apiUrl.COMM_CROSSBOOKING_QUERY_DETAIL_INFO, {
            method: 'POST',
            data: {
                "page": pagination,
                "params": {
                    'sfListCode': queryForms.getFieldValue().sfListCode,
                    'billReferenceCode': queryFormss.getFieldsValue().billReferenceCode,
                    'ytStatusSystem': queryFormss.getFieldsValue().ytStatusSystem,
                    'shipownerCompanyCode': detaileData.companyCode
                }
            }
        })
        console.log(detailed)
        if (detailed.success) {
            let data = detailed.data;
            if (data) {
                let datas = data.cResult.resultList;
                let totalCount = data.cResult.totalCount
                let LocalChargeData = data.lcrSfListChgManus.resultList
                datas ? datas.map((v, i) => {
                    v['id'] = i
                }) : null
                setSpinflag(false)
                let checkedUuidDetailed = [];
                datas ? datas.map((v, i) => {
                    if (v.verifyStatus == auditStatus.values[0].value) {
                        checkedUuidDetailed.push(v.id);
                    }
                }) : null
                // setTableFlag()
                checkedUuidDetailed ? setChecked(checkedUuidDetailed) : null;
                datas ? setTableDataDetailed([...datas]) : setTableDataDetailed([])
                setLocalChargeTabTotal(data.lcrSfListChgManus.totalCount)
                if (pagination.pageSize != page.pageSize) {
                    pagination.current = 1
                }
                setPageDetail({ ...pagination })
                setPageLcDetail({ ...pagination })
                setDetailedTabTotal(totalCount)
                LocalChargeData == null ? setTableDataLocalChargeData([]) : setTableDataLocalChargeData([...LocalChargeData])
                queryForms.setFieldsValue({
                    budateUpload: data.budateUpload ? moment(data.budateUpload) : moment(Date()),
                })
            }

        } else {
            setSpinflag(false)
            setTableDataDetailed([])
            setTableDataLocalChargeData([])
            Toast('', detailed.errorMessage, 'alert-error', 5000, false);
        }

    }
    //待处理报账单---查询明细数据
    const Detaileds = async (pagination) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let verifyStatus = queryForms.getFieldsValue().verifyStatus
        checkStatus.values.map((v, i) => {
            verifyStatus == v.label ? verifyStatus = v.value : '';
        })
        let detailed = await request($apiUrl.COMM_CROSSBOOKING_QUERY_DETAIL_INFO, {
            method: 'POST',
            data: {
                "page": pagination,
                "params": {
                    'sfListCode': queryForms.getFieldValue().sfListCode,
                    'billReferenceCode': queryFormss.getFieldsValue().billReferenceCode,
                    'ytStatusSystem': queryFormss.getFieldsValue().ytStatusSystem,
                    'shipownerCompanyCode': detaileData.companyCode
                }
            }
        })
        console.log(detailed)
        if (detailed.success) {
            let data = detailed.data;
            if (data) {
                let datas = data.cResult.resultList;
                let totalCount = data.cResult.totalCount
                // let LocalChargeData = data.lcrSfListChgManus.resultList
                datas ? datas.map((v, i) => {
                    v['id'] = i
                }) : null
                setSpinflag(false)
                let checkedUuidDetailed = [];
                datas ? datas.map((v, i) => {
                    if (v.verifyStatus == auditStatus.values[0].value) {
                        checkedUuidDetailed.push(v.id);
                    }
                }) : null
                // setTableFlag()
                checkedUuidDetailed ? setChecked(checkedUuidDetailed) : null;
                datas ? setTableDataDetailed([...datas]) : setTableDataDetailed([])
                // setLocalChargeTabTotal(data.lcrSfListChgManus.totalCount)
                if (pagination.pageSize != pageDetail.pageSize) {
                    pagination.current = 1
                }
                setPageDetail({ ...pagination })
                setDetailedTabTotal(totalCount)
                // LocalChargeData==null?setTableDataLocalChargeData([]):setTableDataLocalChargeData([...LocalChargeData])
                queryForms.setFieldsValue({
                    budateUpload: data.budateUpload ? moment(data.budateUpload) : moment(Date()),
                })
            }

        } else {
            setSpinflag(false)
            setTableDataDetailed([])
            setTableDataLocalChargeData([])
            Toast('', detailed.errorMessage, 'alert-error', 5000, false);
        }

    }
    //待处理报账单---查询明细数据
    const LcDetailed = async (pagination) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let verifyStatus = queryForms.getFieldsValue().verifyStatus
        checkStatus.values.map((v, i) => {
            verifyStatus == v.label ? verifyStatus = v.value : '';
        })
        let detailed = await request($apiUrl.COMM_CROSSBOOKING_QUERY_DETAIL_INFO, {
            method: 'POST',
            data: {
                "page": pagination,
                "params": {
                    'sfListCode': queryForms.getFieldValue().sfListCode,
                    'billReferenceCode': queryFormss.getFieldsValue().billReferenceCode,
                    'ytStatusSystem': queryFormss.getFieldsValue().ytStatusSystem,
                    'shipownerCompanyCode': detaileData.companyCode
                }
            }
        })
        console.log(detailed)
        if (detailed.success) {
            let data = detailed.data;
            if (data) {
                let datas = data.cResult.resultList;
                let totalCount = data.cResult.totalCount
                let LocalChargeData = data.lcrSfListChgManus.resultList
                datas ? datas.map((v, i) => {
                    v['id'] = i
                }) : null
                setSpinflag(false)
                let checkedUuidDetailed = [];
                datas ? datas.map((v, i) => {
                    if (v.verifyStatus == auditStatus.values[0].value) {
                        checkedUuidDetailed.push(v.id);
                    }
                }) : null
                // setTableFlag()
                checkedUuidDetailed ? setChecked(checkedUuidDetailed) : null;
                setLocalChargeTabTotal(data.lcrSfListChgManus.totalCount)
                if (pagination.pageSize != pageLcDetail.pageSize) {
                    pagination.current = 1
                }
                setPageLcDetail({ ...pagination })
                LocalChargeData == null ? setTableDataLocalChargeData([]) : setTableDataLocalChargeData([...LocalChargeData])
                // queryForms.setFieldsValue({
                //     budateUpload:data.budateUpload ? moment(data.budateUpload) :  moment(Date()),
                // })
            }

        } else {
            setSpinflag(false)
            setTableDataDetailed([])
            setTableDataLocalChargeData([])
            Toast('', detailed.errorMessage, 'alert-error', 5000, false);
        }

    }

    //待处理报账单---审核
    const business = async (operate) => {
        Toast('', '', '', 5000, false);
        if (!queryForms.getFieldsValue().postDate) {
            // 记账日期必须输入
            Toast('', formatMessage({ id: 'lbl.postDate-must-enter' }), 'alert-error', 5000, false)
        } else {
            // const confirmModal = confirm({
            //     title: formatMessage({id:'lbl.audit'}),
            //     content: formatMessage({id: 'lbl.Excute-operation'}),
            //     okText: formatMessage({id: 'lbl.affirm'}),
            //     okType: 'danger',
            //     closable:true,
            //     cancelText:'',
            //     async onOk() {
            //         confirmModal.destroy()
            setSpinflag(true)
            let business = await request($apiUrl.COMM_CROSSBOOKING_BUILD_CBOF_OFFLINE, {
                method: 'POST',
                data: {
                    'params': {
                        "sfListCode": queryForms.getFieldsValue().sfListCode,
                        "budateUpload": momentFormat(queryForms.getFieldsValue().budateUpload),
                    },
                    "operateType": operate //处理模式
                }
            })
            console.log(business)
            if (business.success) {
                setSpinflag(false)
                pageChange(page)
                queryForms.resetFields()
                setTableDataLocalChargeData([])
                setTableDataDetailed([])
                setDefaultKey('1')
                setTimeout(() => {
                    Toast('', '', '', 5000, false);
                    Toast('', business.message, '', 5000, false)
                }, 1000);
                queryForms.setFieldsValue({
                    'budateUpload': moment(Date())
                })
            } else {
                setSpinflag(false)
                Toast('', business.message, 'alert-error', 5000, false)
            }
        }
        // })
        // }

    }
    //保存
    const Save = async () => {
        Toast('', '', '', 5000, false);
        // const confirmModal = confirm({
        //     title: formatMessage({id:'lbl.save'}),
        //     content: formatMessage({id: 'lbl.whether-save'}),
        //     okText: formatMessage({id: 'lbl.affirm'}),
        //     okType: 'danger',
        //     closable:true,
        //     cancelText:'',
        //     async onOk() {
        // confirmModal.destroy()
        setSpinflag(true)
        const save = await request($apiUrl.COMM_CROSSBOOKING_MODIFY_CR, {
            method: "POST",
            data: {
                paramsList: [...tableDataDetailed]
            }
        })
        console.log(save)
        if (save.success) {
            Toast('', save.message, 'alert-success', 5000, false)
            setSpinflag(false)
        } else {
            Toast('', save.errorMessage, 'alert-error', 5000, false)
            setSpinflag(false)
        }
        //     }
        // })
    }
    //取消报账单
    const CancelBill = async () => {
        Toast('', '', '', 5000, false);
        // const confirmModal = confirm({
        //     title: formatMessage({id:'lbl.Cancel-reimbursement'}),
        //     content: formatMessage({id: 'lbl.Excute-operation'}),
        //     okText: formatMessage({id: 'lbl.affirm'}),
        //     okType: 'danger',
        //     closable:true,
        //     cancelText:'',
        //     async onOk() {
        //         confirmModal.destroy()
        setSpinflag(true)
        const save = await request($apiUrl.COMM_CROSSBOOKING_CANCEL_CR_RECEIPT, {
            method: "POST",
            data: {
                params: {
                    sfListCode: queryForms.getFieldsValue().sfListCode
                }
            }
        })
        if (save.success) {
            setSpinflag(false)
            pageChange(page)
            queryForms.resetFields()
            setTableDataLocalChargeData([])
            setTableDataDetailed([])
            setTimeout(() => {
                Toast('', '', '', 5000, false);
                Toast('', save.message, '', 5000, false)
            }, 1000);
            setDefaultKey('1')
            queryForms.setFieldsValue({
                postDate: moment(Date())
            })
        } else {
            setSpinflag(false)
            Toast('', save.errorMessage, 'alert-error', 5000, false)
        }
        // }
        // })

    }
    // 
    //   全选/全不选 
    const allSelect = (flag) => {
        Toast('', '', '', 5000, false);
        let data = tableDataDetailed.map((v, i) => {
            return v.id;
        })
        flag ? setChecked(data) : setChecked([]);
        flag ? selectFun(tableDataDetailed, tableDataDetailed) : selectFun(tableDataDetailed, []);
    }
    const [detaileData, setDetaileData] = useState({})
    // 双击
    const doubleClickRow = async (parameter) => {
        console.log(parameter)
        setDetaileData({ ...parameter })
        queryFormss.resetFields();
        setSpinflag(true)
        const result = await request($apiUrl.COMM_CROSSBOOKING_QUERY_DETAIL_INFO, {
            method: "POST",
            data: {
                page: {
                    "current": 1,
                    "pageSize": 10
                },
                params: {
                    sfListCode: parameter.sfListCode,
                    shipownerCompanyCode: parameter.companyCode
                }
            }
        })
        console.log(result)
        if (result.success) {
            Toast('', result.message, 'alert-success', 5000, false)
            setDefaultKey('2')
            setSpinflag(false)
            setButtonFlag(true)
            let data = result.data;
            let datas = data ? data.cResult.resultList : null;
            let detailed = data ? data.cResult.totalCount : null;
            let LocalChargeData = data ? data.lcrSfListChgManus.resultList : null
            let LocalChargeTabTotal = data ? data.lcrSfListChgManus.totalCount : null
            LocalChargeTabTotal ? setLocalChargeTabTotal(LocalChargeTabTotal) : null
            detailed ? setDetailedTabTotal(detailed) : null
            console.log(datas)
            let pagination = {
                "current": 1,
                "pageSize": 10
            }
            // if(pagination.pageSize!=pageDetail.pageSize){
            //     pagination.current=1
            // }
            setPageDetail({ ...pagination })
            setPageLcDetail({ ...pagination })
            datas ? datas.map((v, i) => {
                v['id'] = i
            }) : null
            LocalChargeData ? LocalChargeData.map((v, i) => {
                v['id'] = i
            }) : null
            let checkedUuid = [];
            datas ? datas.map((v, i) => {
                if (v.verifyStatus == auditStatus.values[0].value) {
                    checkedUuid.push(v.id);
                }
            }) : null
            checkedUuid ? setChecked(checkedUuid) : null;
            data ? setUuidData(data.sfListUuid) : null;
            datas ? setTableDataDetailed([...datas]) : setTableDataDetailed([])
            LocalChargeData ? setTableDataLocalChargeData([...LocalChargeData]) : setTableDataLocalChargeData([])
            if (data) {
                if (data.verifyStatus == 'W') {
                    setTableFlag(true)
                    setCancel(false);//取消报账单
                    setBusinessThrough(true);//业务审核通过
                    setBusinessBack(true);//业务审核退回
                    setCheckAll(true);//全选
                    setCheckDontAll(true);//全不选
                    setSave(true);//保存
                    setFinanceBack(false);//财务审核退回
                    setFinanceThrough(false);//财务审核通过
                } else if (data.verifyStatus == 'C') {
                    setTableFlag(false)

                    setCancel(false);//取消报账单
                    setBusinessThrough(false);//业务审核通过
                    setBusinessBack(false);//业务审核退回
                    setCheckAll(false);//全选
                    setCheckDontAll(false);//全不选
                    setSave(false);//保存
                    setFinanceBack(true);//财务审核退回
                    setFinanceThrough(true);//财务审核通过
                } else if (data.verifyStatus == 'Q' || data.verifyStatus == 'R') {
                    setTableFlag(false)
                    setBusinessThrough(false);//业务审核通过
                    setBusinessBack(false);//业务审核退回 
                    setFinanceBack(false);//财务审核退回
                    setFinanceThrough(false);//财务审核通过
                    setCheckAll(false);//全选
                    setCheckDontAll(false);//全不选
                    setSave(false);//保存
                    setCancel(true);//取消报账单
                } else if (data.verifyStatus == 'P') {
                    setTableFlag(false)

                    setBusinessThrough(false);//业务审核通过
                    setBusinessBack(false);//业务审核退回 
                    setFinanceBack(false);//财务审核退回
                    setFinanceThrough(false);//财务审核通过
                    setCheckAll(false);//全选
                    setCheckDontAll(false);//全不选
                    setSave(false);//保存
                    setCancel(false);//取消报账单
                }
            }
            data ? postStatus.values.map((v, i) => {
                data.postStatus == v.value ? data.postStatus = v.label : '';
            }) : null
            data ? checkStatus.values.map((v, i) => {
                data.verifyStatus == v.value ? data.verifyStatus = v.label : '';
            }) : null
            // console.log(postStatus,data.verifyStatus)
            data ? setSelectedRowKeys([data.verifyStatus]) : null
            data ? queryForms.setFieldsValue({
                agencyCode: data.agencyCode,
                sfListCode: data.sfListCode,
                verifyStatus: data.verifyStatus,
                postStatus: data.postStatus,
                generateUser: data.generateUser ? data.generateUser.toUpperCase() : null,
                checkUser: data.checkUser ? data.checkUser.toUpperCase() : null,
                currencyCode: data.currencyCode,
                totalAmount: data.totalAmount,
                generateDatetime: data.generateDatetime ? moment(data.generateDatetime) : null,
                checkDatetime: data.checkDatetime ? moment(data.checkDatetime) : null,
                postDate: data.postDate ? moment(data.postDate) : moment(Date()),
            }) : null
        } else {
            setSpinflag(false)
            Toast('', result.errorMessage, 'alert-error', 5000, false)
        }
    }
    //   选择和状态的联动
    const selectFun = (tableDataDetailed, row) => {
        //退回
        tableDataDetailed.map((v, i) => {
            v.verifyStatus = auditStatus.values[1].value;
        })
        //通过
        row.map((v, i) => {
            v.verifyStatus = auditStatus.values[0].value;
        })
    }
    const setSelectedRows = (value) => {
        console.log(value)
        // setDetailDate([...value])
    }

    //下载
    const downlod = async () => {
        Toast('', '', '', 5000, false)
        let query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.COMM_CROSSBOOKING_EXP_HEAD_INFO, {
            method: "POST",
            data: {
                "params": {
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode': query.agencyCode,
                    'sfListCode': query.sfListCode,
                    'verifyStatus': query.verifyStatus,
                    'postStatus': query.postStatus,
                    'checkDateFrom': query.checkDate ? momentFormat(query.checkDate[0]) : null,
                    'checkDateTo': query.checkDate ? momentFormat(query.checkDate[1]) : null,
                    'generateDateFrom': query.generateDate ? momentFormat(query.generateDate[0]) : null,
                    'generateDateTo': query.generateDate ? momentFormat(query.generateDate[1]) : null,
                    'budateUploadFrom': query.budateUpload ? momentFormat(query.budateUpload[0]) : null,
                    'budateUploadTo': query.budateUpload ? momentFormat(query.budateUpload[1]) : null,
                },
                'excelFileName': formatMessage({ id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro' }),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            sfListCode: formatMessage({ id: "lbl.Reimbursement-number" }),
                            agencyCode: formatMessage({ id: "lbl.agency" }),
                            verifyStatus: formatMessage({ id: "lbl.audit-status" }),
                            postStatus: formatMessage({ id: "lbl.State-of-charge-to-an-account" }),
                            generateDatetime: formatMessage({ id: "lbl.generation-date" }),
                            generateUser: formatMessage({ id: "lbl.Generation-personnel" }),
                            checkDatetime: formatMessage({ id: "lbl.audit-date" }),
                            checkUser: formatMessage({ id: "lbl.auditor" }),
                            budatUpload: formatMessage({ id: "lbl.accounting-date" }),
                            checkTimes: formatMessage({ id: "lbl.voucher-number" }),
                            currencyCode: formatMessage({ id: "lbl.settlement-currency" }),
                            totalAmount: formatMessage({ id: "lbl.Cal-cur-adt-tal-amt" }),
                        },
                        sumCol: {//汇总字段

                        },
                        'sheetName': formatMessage({ id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro' }),
                    },
                ]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if (downData.size < 1) {
            Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
            return
        } else {
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({ id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({ id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                console.log(downloadElement)
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    //明细下载
    const downlodDetail = async () => {
        Toast('', '', '', 5000, false)
        let query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.COMM_CROSSBOOKING_EXP_DETAIL_INFO, {
            method: "POST",
            data: {
                "params": {
                    'sfListCode': queryForms.getFieldValue().sfListCode,
                    'billReferenceCode': queryFormss.getFieldsValue().billReferenceCode,
                    'ytStatusSystem': queryFormss.getFieldsValue().ytStatusSystem,
                    'shipownerCompanyCode': queryForm.getFieldValue().shipownerCompanyCode
                },
                'excelFileName': formatMessage({ id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro' }),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            sfListCode: formatMessage({ id: "lbl.Reimbursement-number" }),
                            agencyCode: formatMessage({ id: "lbl.agency" }),
                            verifyStatus: formatMessage({ id: "lbl.audit-status" }),
                            postStatus: formatMessage({ id: "lbl.State-of-charge-to-an-account" }),
                            generateDatetime: formatMessage({ id: "lbl.generation-date" }),
                            generateUser: formatMessage({ id: "lbl.Generation-personnel" }),
                            checkDatetime: formatMessage({ id: "lbl.audit-date" }),
                            postDate: formatMessage({ id: "lbl.accounting-date" }),
                            currencyCode: formatMessage({ id: "lbl.settlement-currency" }),
                            checkUser: formatMessage({ id: "lbl.auditor" }),
                            totalAmount: formatMessage({ id: "lbl.Cal-cur-adt-tal-amt" }),

                        },
                        sumCol: {//汇总字段

                        },
                        'sheetName': formatMessage({ id: 'lbl.afcm-0024' }),
                    },
                    {//sheetList列表
                        dataCol: {
                            verifyStatus: formatMessage({ id: "lbl.audit-status" }),
                            billReferenceCode: formatMessage({ id: "lbl.bill-of-lading-number" }),
                            activityDate: formatMessage({ id: "lbl.argue.bizDate" }),
                            agencyCode: formatMessage({ id: "lbl.agency" }),
                            rateCurrencyCode: formatMessage({ id: "lbl.Agreement-currency" }),
                            rateTotalAmount: formatMessage({ id: "lbl.Agreement-currency-adjustment-amount" }),
                            currencyCode: formatMessage({ id: "lbl.settlement-currency" }),
                            commissionAmount: formatMessage({ id: "lbl.adjustment-amount-in-settlement-currency" }),
                            totalAmountManual: formatMessage({ id: "lbl.Settlement-currency-amount" }),
                            clerExchangeRate: formatMessage({ id: "lbl.Settlement-currency-exchange-rate" }),
                            commissionClass: formatMessage({ id: "lbl.commission-big-type" }),
                            adjustFlag: formatMessage({ id: "lbl.Remark" }),
                            shipownerCompanyCode: formatMessage({ id: "lbl.company-code" }),
                            svvdIdSystem: formatMessage({ id: "lbl.SVVD" }),
                            portCodeSystem: formatMessage({ id: "lbl.port" }),
                            commissionMode: formatMessage({ id: "lbl.The-Commission" }),
                            versionNumber: formatMessage({ id: "lbl.versions" }),
                        },
                        sumCol: {//汇总字段

                        },
                        'sheetName': formatMessage({ id: 'lbl.afcm-0027' }),
                    },
                    {//sheetList列表
                        dataCol: {
                            tmpSfListCode: formatMessage({ id: "lbl.Provisional-bill-number" }),
                            billReferenceCode: formatMessage({ id: "lbl.bill-no" }),
                            agencyCode: formatMessage({ id: "lbl.agency" }),
                            commissionMode: formatMessage({ id: "lbl.The-Commission" }),
                            commissionType: formatMessage({ id: "lbl.Commission-type" }),
                            chargeCode: formatMessage({ id: "lbl.chargeCode" }),
                            actualFlag: formatMessage({ id: "lbl.act-flag" }),
                            versionNumber: formatMessage({ id: "lbl.versions" }),
                            rateCurrencyCode: formatMessage({ id: "lbl.Return-the-currency" }),
                            refund: formatMessage({ id: "lbl.refund" }),
                            refundRate: formatMessage({ id: "lbl.return-the-proportion" }),
                            clearingCurrencyCode: formatMessage({ id: "lbl.settlement-currency" }),
                            totalAmountInClearing: formatMessage({ id: "lbl.amount-of-settlement-currency" }),
                            reviseAmountInClearing: formatMessage({ id: "lbl.adjustment-amount-in-settlement-currency" }),
                            commissionBase: formatMessage({ id: "lbl.Return-the-base" }),
                            officeCode: formatMessage({ id: "lbl.office" }),
                            shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                            activityDate: formatMessage({ id: "lbl.argue.bizDate" }),
                            recordUpdateDatetime: formatMessage({ id: "lbl.Record-update-date" }),
                            recordLoadDate: formatMessage({ id: "lbl.Record-the-uploaded-lot" }),
                        },
                        sumCol: {//汇总字段

                        },
                        'sheetName': formatMessage({ id: 'lbl.afcm-0026' }),
                    },
                ]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if (downData.size < 1) {
            Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
            return
        } else {
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({ id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({ id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                console.log(downloadElement)
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForms.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
        queryForms.setFieldsValue({
            budateUpload: moment(Date())
        })
        setBackFlag(true)
        setAgencyFlag(true)
        setButtonFlag(false)
        setBusinessBack(false)
        setBusinessThrough(false)
        setCheckAll(false)
        setFinanceThrough(false)
        setFinanceBack(false)
        setTableData([])
        setTableDataDetailed([])
        setDetailedTabTotal([])
        setLocalChargeTabTotal([])
    }
    return (
        <div className='parent-box'>
            <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                {/* 佣金列表 */}
                <TabPane tab={<FormattedMessage id='lbl.Commission-list' />} key="1">
                    <div className='header-from' style={{ marginTop: '15px' }}>
                        <Form
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 船东 */}
                                <SelectVal disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                                {/* 代理编码 */}
                                {
                                    company.companyType == 0 ? <InputText styleFlag={agencyFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <SelectVal showSearch={true} style={{ background: agencyFlag ? "white" : "yellow" }} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                                }
                                {/* 报账单号码 */}
                                <InputText name='sfListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number' />} span={6} />
                                {/* 生成日期 */}
                                <DoubleDatePicker span={6} style={{ background: backFlag ? 'white' : 'yellow' }} disabled={[false, false]} name='generateDate' label={<FormattedMessage id='lbl.generation-date' />} />
                                {/* 审核日期 */}
                                <DoubleDatePicker span={6} style={{ background: backFlag ? 'white' : 'yellow' }} disabled={[false, false]} name='checkDate' label={<FormattedMessage id='lbl.audit-date' />} />
                                {/* 记账日期 */}
                                <DoubleDatePicker span={6} style={{ background: backFlag ? 'white' : 'yellow' }} disabled={[false, false]} name='budateUpload' label={<FormattedMessage id='lbl.accounting-date' />} />
                                {/* 审核状态 */}
                                <SelectVal name='verifyStatus' flag={true} label={<FormattedMessage id='lbl.audit-status' />} span={6} options={checkStatus.values} />
                                {/* 记账状态 */}
                                <SelectVal name='postStatus' flag={true} label={<FormattedMessage id='lbl.State-of-charge-to-an-account' />} span={6} options={postStatus.values} />
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /> </Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 下载报账单 */}
                            <Button onClick={downlod} ><CloudDownloadOutlined /><FormattedMessage id='lbl.Download-the-bill' /></Button>
                        </div>
                        <div className='button-right'>
                            {/* 重置 */}
                            <Button onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                            {/* 查询按钮 */}
                            <Button onClick={() => { pageChange(page, '', 'search') }} > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                        </div>
                    </div>
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={tableData}
                            columns={columns}
                            rowKey='id'
                            pageChange={pageChange}
                            pageSize={page.pageSize}
                            current={page.current}
                            scrollHeightMinus={200}
                            handleDoubleClickRow={doubleClickRow}
                            selectWithClickRow={true}
                            rowSelection={null}
                            total={tabTabTotal}
                        // selectionType='radio'
                        // setSelectedRows={setSelectedRows}
                        />
                    </div>
                </TabPane>
                {/* 明细信息 */}
                <TabPane tab={<FormattedMessage id='lbl.Detailed-information' />} key="2">
                    <div className='header-from' style={{ marginTop: '15px' }}>
                        <Form
                            form={queryForms}
                            name='titlequery'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 报账单号码 */}
                                <InputText name='sfListCode' disabled={true} label={<FormattedMessage id='lbl.Reimbursement-number' />} span={6} />
                                {/* 代理编码 */}
                                <InputText name='agencyCode' disabled={true} flag={true} label={<FormattedMessage id='lbl.agency' />} span={6} />
                                {/* 审核状态 */}
                                <InputText name='verifyStatus' disabled={true} flag={true} label={<FormattedMessage id='lbl.audit-status' />} span={6} />
                                {/* 记账状态 */}
                                <InputText name='postStatus' disabled={true} flag={true} label={<FormattedMessage id='lbl.State-of-charge-to-an-account' />} span={6} />
                                {/* 生成日期 */}
                                <DatePicker span={6} disabled={[true, true]} name='generateDatetime' label={<FormattedMessage id='lbl.generation-date' />} />
                                {/* 生成人员 */}
                                <InputText name='generateUser' disabled={true} label={<FormattedMessage id='lbl.Generation-personnel' />} span={6} />
                                {/* 审核日期 */}
                                <DatePicker span={6} disabled={[true, true]} name='checkDatetime' label={<FormattedMessage id='lbl.audit-date' />} />
                                {/* 审核人员 */}
                                <InputText name='checkUser' disabled={true} label={<FormattedMessage id='lbl.auditor-comm' />} span={6} />
                                {/* 记账日期 */}
                                <DatePicker span={6} disabled={[true, true]} name='postDate' label={<FormattedMessage id='lbl.accounting-date' />} />
                                {/* 结算币种 */}
                                <InputText name='currencyCode' disabled={true} label={<FormattedMessage id='lbl.settlement-currency' />} span={6} />
                                {/* 结算币调整总金额 */}
                                <InputText name='totalAmount' disabled={true} label={<FormattedMessage id='lbl.Cal-cur-adt-tal-amt' />} span={6} />
                            </Row>
                        </Form>
                        {/* 报账单头信息 */}
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information' /> </Button> </div>
                    </div>
                    <div className='header-from' style={{ marginTop: '15px' }}>
                        <Form
                            form={queryFormss}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 提单号码 */}
                                <InputText name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={9} />
                                {/* 预提状态 */}
                                <SelectVal name='ytStatusSystem' flag={true} label={<FormattedMessage id='lbl.Withholding-state' />} span={9} options={ytStatusSystem.values} />
                            </Row>
                        </Form>
                        {/* 查询条件 */}
                        <div className='query-condition' ><Button type="primary"><FormattedMessage id='lbl.search-terms' /> </Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 全选 */}
                            <Button onClick={() => { allSelect(true) }} disabled={checkAll ? false : true} ><MyIcon type='icon-quanbuxuan1' /> <FormattedMessage id='lbl.check-all-comm' /></Button>
                            {/* 全不选 */}
                            <Button onClick={() => { allSelect(false) }} disabled={checkDontAll ? false : true} ><MyIcon type='icon-quanxuan2' /><FormattedMessage id='lbl.All-dont-choose-comm' /></Button>
                            {/* 保存 */}
                            <CosButton onClick={Save} disabled={save ? false : true} auth='AFCM_CMS_CBK_003_B01' ><SaveOutlined /><FormattedMessage id='lbl.save' /></CosButton>
                            {/* 业务审核通过 */}
                            <CosButton onClick={() => { business('ACTIVITY_APPROVE') }} disabled={businessThrough ? false : true} auth='AFCM_CMS_CBK_003_B02' ><FileProtectOutlined /><FormattedMessage id='lbl.Passed-the-business-audit' /></CosButton>
                            {/* 业务审核退回 */}
                            <CosButton onClick={() => { business('ACTIVITY_RETURN') }} disabled={businessBack ? false : true} auth='AFCM_CMS_CBK_003_B03' ><ImportOutlined /><FormattedMessage id='lbl.Business-review-return-comm' /></CosButton>
                            {/* 财务审核通过 */}
                            <CosButton onClick={() => { business('FINANCE_APPROVE') }} disabled={financeThrough ? false : true} auth='AFCM_CMS_CBK_003_B04' ><FileProtectOutlined /><FormattedMessage id='lbl.Passed-financial-audit-comm' /></CosButton>
                            {/* 财务审核退回 */}
                            <CosButton onClick={() => { business('FINANCE_RETURN') }} disabled={financeBack ? false : true} auth='AFCM_CMS_CBK_003_B05' ><ImportOutlined /><FormattedMessage id='lbl.Financial-audit-return' /></CosButton>
                            {/* 取消报账单 */}
                            <CosButton onClick={CancelBill} disabled={cancel ? false : true} auth='AFCM_CMS_CBK_003_B06' ><FileExclamationOutlined /><FormattedMessage id='lbl.Cancel-reimbursement' /></CosButton>
                            {/* 下载 */}
                            <Button onClick={downlodDetail} disabled={buttonFlag ? false : true}><CloudDownloadOutlined /><FormattedMessage id='lbl.download' /></Button>
                            {/* 邮件发送 onClick={mailing}*/}
                            <Button disabled={buttonFlag ? false : true}><MyIcon type="icon-email-success" /><FormattedMessage id='lbl.mailing' /></Button>
                        </div>

                        <div className='button-right'>
                            {/* 查询按钮 */}
                            <Button onClick={() => { Detailed(page) }} > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                        </div>
                    </div>
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={tableDataDetailed}
                            columns={informationcolumns}
                            rowKey='id'
                            pageChange={Detaileds}
                            scrollHeightMinus={200}
                            total={detailedTabTabTotal}
                            setSelectedRows={setSelectedRows}
                            pageSize={pageDetail.pageSize}
                            current={pageDetail.current}
                            rowSelection={
                                tableFlag ? {
                                    selectedRowKeys: checked,
                                    onChange: (key, row) => {
                                        setChecked(key);
                                        setUuidData(row);
                                        selectFun(tableDataDetailed, row);
                                    }
                                } : null
                            }
                        />
                    </div>
                    <CosModal cbsTitle="mailbox" cbsVisible={isModalVisible} onFun={handleCancel} cbsWidth='30%'>
                        <div style={{ minWidth: '300px' }}>
                            <Form
                                form={queryForm}
                                name='func'
                                onFinish={handleQuery}
                            >
                                <Row>
                                    {/* 邮箱 */}
                                    <InputText name='agencyName' span={24} />
                                </Row>
                            </Form>
                        </div>
                        <div className="copy-from-btn" style={{ minWidth: '300px' }}>
                            {/* 按钮 */}
                            <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-ok" /> </Button>
                            <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-cancel" /></Button>
                        </div>
                    </CosModal>
                </TabPane>
                {/* LocalCharge明细信息 */}
                <TabPane tab={<FormattedMessage id='lbl.LocalCharge-Detailed-information' />} key="3">
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={tableDataLocalChargeData}
                            columns={LocalChargecolumns}
                            rowKey='lcrAgreementHeadUuid'
                            pageChange={LcDetailed}
                            pageSize={pageLcDetail.pageSize}
                            current={pageLcDetail.current}
                            scrollHeightMinus={200}
                            rowSelection={null}
                            total={localChargeTabTotal}
                        />
                    </div>
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag} />
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;