// 待处理结转实付报账单
import React, { useState, useEffect,$apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi';
import { Modal, Button, Card, Input, Form, Row, Col, Transfer, Tabs, Table, Tooltip, InputNumber } from 'antd';
import { acquireSelectData, acquireCompanyData, formatCurrencyNew, TradeData, momentFormat, agencyCodeData, acquireSelectDataExtend } from '@/utils/commonDataInterface';
import PaginationTable from "@/components/Common/PaginationTable";
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SelectOutlined, // 选择预估单
    UnorderedListOutlined,  // 全部预估单
    CloseSquareOutlined,    // 取消
    SaveOutlined,  // 保存
} from '@ant-design/icons'
import {Toast} from '@/utils/Toast'
// import CosButton from '@/components/Common/CosButton'
import { CosDownLoadBtn, CosButton } from '@/components/Common/index'
const confirm = Modal.confirm;

// import EstimatedCommissionDetails from './EstimatedCommissionDetails';
import request from '@/utils/request';
// tab切换
const { TabPane } = Tabs;
let formlayouts={
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
}
const PaymentBillsPendingSettlement =()=> {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [queryForm] = Form.useForm();
    const [detailedQuery] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    const [tableData,setTableData] = useState([]);   // 报账单数据
    const [tabTabTotal,setTabTotal ] = useState([]);     // 报账单条数
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [backFlag,setBackFlag] = useState(true);//背景颜色
	const [defaultKey, setDefaultKey] = useState('1');  // tab切换

    const [detailedList, setDetailedList] = useState([]);  // 明细列表
    const [detailedListdata, setDetailedListData] = useState([]);  // 明细统计列表
    const [detailedHeader, setDetailedHeader] = useState([]);  // 明细头信息
    const [detailedTabTotal, setDetailedTabTotal] = useState([]);  // 明细条数
    const [detailedUuid, setDetailedUuid] = useState([]);  // 明细uuid双击
    const [slUuid, setSldUuid] = useState([]);  // 明细uuid单选
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [checkFlag, setCheckFlag] = useState(false);     // 多选是否显示

    const [acquireData, setAcquireData] = useState({}); // 船东
    const [withinBoundary, setWithinBoundary] = useState({});   // 是否边界内
    const [priceIncludingTax, setPriceIncludingTax] = useState({});  // 是否含税价
    const [stateData, setStateData] = useState({});   // 状态
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [reimbursementState, setReimbursementState] = useState({}); // 报账单状态
    const [flagBit, setFlagBit] = useState({});         // 退回标志位
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode

    const [checked, setChecked] = useState([]);
    const [checkeds, setCheckeds] = useState([]);
    const [uuidData, setUuidData] = useState('');   // uuid    
    const [btnFlag, setBtnFlag] = useState(true);  // 取消报账单是否显示
    const [btnState, setBtnState] = useState(true);  // 详情button是否显示
    const [downUuid, setDownUuid] = useState('');   // 下载传输UUid
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    });
    const [pages, setPages] = useState({
        current: 1,
        pageSize: 10
    });

    useEffect(() => {
        acquireSelectData('CR.CHECK.STATUS', setFlagBit, $apiUrl);// 退回标志位
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('AFCM.BOUNDARY.FLAG', setWithinBoundary, $apiUrl);     // 是否边界内 
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);     //    是否含税价
        // acquireSelectData('AFCM.CR.VERIFY.STATUS', setStateData, $apiUrl);     // 状态
        acquireSelectData('AFCM.OFFCR.DTL.VERIFYSTATUS', setStateData, $apiUrl);     // 状态
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     //    佣金类型
        acquireSelectData('AFCM.ER.VERIFY.RECEIPT.STATUS', setReimbursementState, $apiUrl);     // 报账单状态 
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

    // 报账单列表
    const reimbursementFormList = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.Reimbursement-number" />,// 报账单号码
            dataIndex: 'sfListCode',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.Reimbursement-personnel" />,// 报账人员
            dataIndex: 'generateUser',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.Reimbursement-date" />,// 报账日期
            dataType: 'dateTime',
            dataIndex: 'generateDatetime',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.auditor" />,// 审核人员
            dataIndex: 'checkUser',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.audit-date" />,// 审核日期
            dataType: 'dateTime',
            dataIndex: 'checkDatetime',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Reimbursement-status" />,// 报账单状态
            dataType: reimbursementState.values,
            dataIndex: 'verifyStatus',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.ac.pymt.claim-note" />,// 备注
            dataIndex: 'userNote',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.Tax-coins" />,// 税金（参考）币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.Total-amount-tax" />,// 税金（参考）总金额
            dataIndex: 'vatAmount',
            align:'right',
            // sorter: false,
            width: 120
        },
    ]

    // 明细列表
    const detailedColumns = [
        {
            title: <FormattedMessage id="lbl.state" />, // 状态	
            dataType: stateData.values,
            dataIndex: 'verifyStatus',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Return-flag" />,// 退回标志位
            dataIndex: 'checkStatus',
            dataType: flagBit.values,
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commType.values,
            dataIndex: 'commissionType',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.version-number" />,// 版本号
            dataIndex: 'versionNumber',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'cargoTradeLaneCode',
            // sorter: false,
            width: 120
        },{
            title: <FormattedMessage id="lbl.pdr-fnd" />,// POR/FND
            dataIndex: 'porFndQskey',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.office" />,// OFFICE
            dataIndex: 'officeCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,// 是否含税价
            dataType: priceIncludingTax.values,
            dataIndex: 'vatFlag',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,// 协议币税金(参考)
            dataIndex: 'vatAmount',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,// 协议币调整税金(参考)
            dataIndex: 'vatReviseAmount',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 130,
        },{
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,// 应付网点金额
            dataIndex: 'paymentAmount',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.AP-outlets" />,// 应付网点
            dataIndex: 'customerSapId',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agency-net-income" />,// 代理净收入
            dataIndex: 'updatedTotalAmount',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,// 向谁报账
            dataIndex: 'sfSide',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.profit-center" />,// 利润中心
            dataIndex: 'profitCenterCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Booking-Party" />,// Booking party
            dataIndex: 'bookingPartyCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Standard-currency" />,// 本位币种	
            dataIndex: 'agencyCurrencyCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,// 本位币税金(参考)	
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,// 本位币调整税金(参考)	
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 130,
        },{
            title: <FormattedMessage id="lbl.settlement-currency" />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.twelve-size" />,// 12/20尺箱
            dataIndex: 'container20',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.forty-size" />,// 40/45尺箱
            dataIndex: 'container40',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Total-Teu-or-Freight" />,// Total Teu or Freight
            dataIndex: 'commissionBase',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.rate-one" />,// 费率
            dataIndex: 'commissionRate',
            align:'right',
            // sorter: false,
            width: 120,
            render: (text, record, index) => {
                return formatCurrencyNew(text, 4)
			}
        },{
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,// 结算币税金(参考)	
            dataIndex: 'vatAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,// 结算币调整税金(参考)	
            dataIndex: 'reviseVatAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 130,
        },{
            title: <FormattedMessage id="lbl.within-boundary" />,// 是否边界内
            dataType: withinBoundary.values,
            dataIndex: 'excludeFlag',
            // sorter: false,
            width: 120,
        },{
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
        },{
            title: <FormattedMessage id="lbl.Agreement-currency" />, // 协议币种	
            dataIndex: 'rateCurrencyCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />, // 	协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />, // 	协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />, // 	协议币税价（参考)
            dataIndex: 'vatAmtSum',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />, // 	协议币调整税价（参考）
            dataIndex: 'vatReviseAmtSum',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 130,
        },{
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />, // 	应付网点金额
            dataIndex: 'pymtAmtSum',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Agency-net-income" />, // 	代理净收入
            dataIndex: 'recAmtSum',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />, // 	向谁报账
            dataIndex: 'sfSide',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Standard-currency" />, // 	本位币种
            dataIndex: 'AgencyCurrencyCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />, // 	本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />, // 	本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />, // 	本位币税金（参考）
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />, // 	本位币调整税金（参考）
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 130,
        },{
            title: <FormattedMessage id="lbl.settlement-currency" />, // 	结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />, // 	结算币金额
            dataIndex: 'totalAmountInClearingSum',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />, // 	结算币调整金额
            dataIndex: 'reviseAmountInClearingSum',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />, // 	结算币税金（参考）
            dataIndex: 'vatAmountInClearingSum',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 120,
        },{
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />, // 	结算币调整税金（参考）
            dataIndex: 'reviseVatAmountInClearingSum',
            dataType: 'dataAmount',
            align:'right',
            // sorter: false,
            width: 130,
        // },{
        //     title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />, // 	应付网点金额
        //     dataIndex: 'pymtAmtSum',
        //     align:'center',
        //     sorter: false,
        //     width: 120,
        // },{
        //     title: <FormattedMessage id="lbl.Agency-net-income" />, // 	代理净收入
        //     dataIndex: 'recAmtSum',
        //     align:'center',
        //     sorter: false,
        //     width: 120,
        // },{
        //     title: <FormattedMessage id="lbl.estimate" />, // 	向谁预估
        //     dataIndex: 'ygSide',
        //     align:'center',
        //     sorter: false,
        //     width: 120,
        }
    ]	

    // 报账单查询
    const pageChange= async (pagination, options, search, message) => {
        message ? null : Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
        }
        setSpinflag(true);
        setSldUuid([]);
        setBtnFlag(true);   // 禁用取消报账单
        let formData = queryForm.getFieldValue();
        const result =await request($apiUrl.COMM_CR_SEARCH_IN_PROCESS_BILL_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    ...formData,
                    generateDate: undefined,
                    generateDateFrom: formData.generateDate ? momentFormat(formData.generateDate[0]) : undefined,
                    generateDateTo: formData.generateDate ? momentFormat(formData.generateDate[1]) : undefined,
                },
            }
        })
        if(result.success) {
            setTableData([]);
            setSpinflag(false);
            let data = result.data;
            setTableData(data.commissionSfLists);
            setTabTotal(data.totalCount);
            // if(pagination.pageSize!=page.pageSize){
            //     pagination.current=1
            // }
            setPage({...pagination})
            setCheckeds([]);
        } else {
            setSpinflag(false);
            setTableData([]);
            setTabTotal(0);
            message ? undefined : Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
        message ? Toast('',message, 'alert-success', 5000, false) : null;
    }

    // 报账单列表单选
    // const setSelectedRows = async(val) => {
    //     console.log(val, val.sfListUuid);
    //     val ? setSldUuid(val.sfListUuid) : null;
    // }
    // 报账单列表双击
    const doubleClickRow = async(val) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        setDefaultKey('2');

        setDownUuid(val.sfListUuid);

        const result = await request($apiUrl.COMM_CR_SEARCH_CR_RECEIPT_DETAIL,{
            method:"POST",
            data:{
                page: pages,
                params: {
                    sfListUuid: val.sfListUuid
                }
            }
        })
        if(result.success) {
            setSpinflag(false);
            let data = result.data;
            let setIpt = data.commissionSfLists[0];

            // let queryd = data.commissionYgList[0];
            // setUuidData(queryd.ygListUuid);
            let queryd = data.commissionSfLists[0];
            queryd.verifyStatus == "W" ? setBtnState(false) : setBtnState(true);
            console.log(queryd.verifyStatus == "W", queryd.verifyStatus, btnState)
            setUuidData(queryd.sfListUuid);
            // setIpt.verifyStatus == stateData.values[0].value ? setCheckFlag(true) : setCheckFlag(false);
            // console.log(setIpt.verifyStatus == stateData.values[0].value, setIpt.verifyStatus, stateData.values[0].value)
            setDetailedList(data.commissionSfListDetail);     // 明细列表
            setDetailedHeader(data.commissionSfLists[0]);        // 明细头信息
            setDetailedListData(data.commissionStatistics);     // 明细统计列表
            setDetailedTabTotal(data.totalCount);      // 明细条数
            setDetailedUuid(setIpt.sfListUuid);         // uuid

            // let listdata = data.commissionSfListDetails;
            // afcmCommonController(setDetailedList, listdata, {
            //     withinBoundary: withinBoundary,
            //     priceIncludingTax: priceIncludingTax,
            //     stateData: stateData
            // });

            let checkedUuid = [];
            // console.log(detailedData,1,data.commissionYgDetailList);
            data.commissionSfListDetail.map((v, i) => {
                // console.log(v.verifyStatus, stateData.values[2].value, stateData.values)
                if(v.verifyStatus == stateData.values[0].value) {   // W 待确认
                    checkedUuid.push(v.entryUuid);
                }
            })
            setChecked(checkedUuid);
            // stateData.values.map((v, i) => {
            //     setIpt.verifyStatus == v.value ? setIpt.verifyStatus = v.label : '';
            // })
            reimbursementState.values.map((v, i) => {
                setIpt.verifyStatus == v.value ? setIpt.verifyStatus = v.label : undefined;
            })
            

            queryForm.setFieldsValue({
                detailed: {
                    sfListCode: setIpt.sfListCode,
                    companyCode: setIpt.companyCode,
                    agencyCode: setIpt.agencyCode,
                    generateUser: setIpt.generateUser,
                    verifyStatus: setIpt.verifyStatus,
                    checkDatetime: setIpt.checkDatetime,
                    checkUser: setIpt.checkUser,
                    vatAmount: setIpt.vatAmount,
                    clearingCurrencyCode: setIpt.clearingCurrencyCode,
                    generateDatetime: setIpt.generateDatetime ? setIpt.generateDatetime.substring(0, 10) : null
                }
            })
        } else {
            setSpinflag(false);
        }
    }

    // 查询明细
    const pageChangeDetailed = async(pagination, options, search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        if(search){
            pagination.current=1
        }
        let formData = detailedQuery.getFieldValue();
        const result = await request($apiUrl.COMM_CR_SEARCH_CR_RECEIPT_DETAIL,{
            method:"POST",
            data:{
                page: pagination,
                params: {
                    ...formData,
                    sfListUuid: detailedUuid
                }
            }
        })
        if(result.success) {
            let data = result.data;
            let setIpt = data.commissionSfLists[0];
            setSpinflag(false);
            setPages({...pagination})

            // let queryd = data.commissionYgList[0];
            // setUuidData(queryd.ygListUuid);
            let queryd = data.commissionSfLists[0];
            setUuidData(queryd.sfListUuid);
            
            setDetailedList(data.commissionSfListDetail);     // 明细列表
            setDetailedHeader(data.commissionSfLists[0]);        // 明细头信息
            setDetailedListData(data.commissionStatistics);     // 明细统计列表
            setDetailedTabTotal(data.totalCount);      // 明细条数
            setDetailedUuid(setIpt.sfListUuid);         // uuid

            // let listdata = data.commissionSfListDetails;
            // afcmCommonController(setDetailedList, listdata, {
            //     withinBoundary: withinBoundary,
            //     priceIncludingTax: priceIncludingTax,
            //     stateData: stateData
            // });

            // let checkedUuid = [];
            // // console.log(detailedData,1,data.commissionYgDetailList);
            // data.commissionSfListDetail.map((v, i) => {
            //     if(v.verifyStatus == stateData.values[2].value) {
            //         checkedUuid.push(v.entryUuid);
            //     }
            // })
            // setChecked(checkedUuid);


            let checkedUuid = [];
            // console.log(detailedData,1,data.commissionYgDetailList);
            data.commissionSfListDetail.map((v, i) => {
                // console.log(v.verifyStatus, stateData.values[2].value, stateData.values)
                if(v.verifyStatus == stateData.values[0].value) {
                    checkedUuid.push(v.entryUuid);
                }
            })
            setChecked(checkedUuid);

            reimbursementState.values.map((v, i) => {
                setIpt.verifyStatus == v.value ? setIpt.verifyStatus = v.label : undefined;
            })

            queryForm.setFieldsValue({
                detailed: {
                    sfListCode: setIpt.sfListCode,
                    companyCode: setIpt.companyCode,
                    agencyCode: setIpt.agencyCode,
                    generateUser: setIpt.generateUser,
                    verifyStatus: setIpt.verifyStatus,
                    checkDatetime: setIpt.checkDatetime,
                    checkUser: setIpt.checkUser,
                    vatAmount: setIpt.vatAmount,
                    clearingCurrencyCode: setIpt.clearingCurrencyCode,
                    generateDatetime: setIpt.generateDatetime ? setIpt.generateDatetime.substring(0, 10) : null
                }
            })
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 保存
    const saveBtn = async() => {
        Toast('', '', '', 5000, false);
        let data = [];
        detailedList.map((v, i) => {
            data.push({
                id: v.entryUuid,
                verifyStatus: v.verifyStatus,
                userNote: v.userNote,
            })
        })

        const confirmModal = confirm({
            title: formatMessage({id: 'lbl.save'}),
            content: formatMessage({id: 'lbl.whether-save'}),
            okText: formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const result = await request($apiUrl.COMM_CR_MODIFY_CR,{
                    method:"POST",
                    data:{
                        operateType: 'SAVE',
                        agencyCode: detailedHeader.agencyCode,
                        paramsList: data,
                        entryUuid: detailedHeader.ygListUuid
                    }
                })
                console.log(result)
                if(result.success) {
                    setSpinflag(false);
                    Toast('', result.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                }
            }
        })
    }

    // 审核通过 and 审核退回
    const examineBtn = async(key) => {
        Toast('', '', '', 5000, false);
        let messages;
        switch(key) {
            case 'ACTIVITY_APPROVE': messages = 'lbl.afcm-cr-mess1';break;
            case 'ACTIVITY_RETURN': messages = 'lbl.afcm-cr-mess2';break;
            case 'FINANCE_APPROVE': messages = 'lbl.afcm-cr-mess3';break;
            case 'FINANCE_RETURN': messages = 'lbl.afcm-cr-mess4';break;
        }

        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.Info-tips' }),
            content: formatMessage({ id: `${messages}` }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const result = await request($apiUrl.COMM_CR_REVIEW_CR_RECEIPT,{
                    method:"POST",
                    data:{
                        operateType: key,
                        uuid: detailedUuid
                    }
                })
                if(result.success) {
                    setSpinflag(false);
                    setDefaultKey('1');
                    pageChange(page, null, 'search', result.message)
                } else {
                    setSpinflag(false);
                }
            }
        })

    }

    // 取消报账单
    const ReimbursementBtn = async() => {
        Toast('', '', '', 5000, false);
        if(slUuid.length <= 0){
            Toast('', intl.formatMessage({id: 'lbl.cancel-info'}), 'alert-error', 5000, false);
            return;
        }else{
            setSpinflag(true);
            const result = await request($apiUrl.COMM_CR_CANCEL_CR_RECEIPT,{
                method:"POST",
                data:{
                    uuid: slUuid
                }
            })
            if(result.success){
                setSpinflag(false);
                pageChange(page, null, 'search', result.message);
            } else {
                setSpinflag(false);
            }
        }
    }

    // 选择和状态的联动
    const selectFun = (detailedData, row) => {
        detailedData.map((v, i) => {
            v.verifyStatus = stateData.values[1].value;
        })
        row.map((v, i) => {
            v.verifyStatus = stateData.values[0].value;
        })
        // console.log(stateData.values[1], stateData.values[0])
        setDetailedList(detailedData);
        // afcmCommonController(setDetailedList, detailedData, {
        //     withinBoundary: withinBoundary,
        //     priceIncludingTax: priceIncludingTax,
        //     stateData: stateData
        // });
    }

    // 全选 and 全不选
    const AllSelect = (flag) => {
        Toast('', '', '', 5000, false);
        let data = detailedList.map((v, i) => {
            return v.entryUuid;
        })
        flag ? setChecked(data) : setChecked([]);
        flag ? selectFun(detailedList, detailedList) : selectFun(detailedList, []);
    }

    const initData = {
        isModalVisible,
        setIsModalVisible
    }

    // Tab切换
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key)
	}

    // 下载
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.COMM_CR_EXP_IN_PROCESS_BILL_LIST,{
            method:"POST",
            data:{
                page: {
                    current: 0,
                    pageSize: 0
                },
                params: {
                    ...queryData,
                    generateDate: undefined,
                    generateDateFrom: queryData.generateDate ? momentFormat(queryData.generateDate[0]) : undefined,
                    generateDateTo: queryData.generateDate ? momentFormat(queryData.generateDate[1]) : undefined,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.comm.cr.pending-reimb'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),     // 代理编码
                        sfListCode: intl.formatMessage({id: "lbl.Reimbursement-number"}),     // 报账单号码
                        generateUser: intl.formatMessage({id: "lbl.Reimbursement-personnel"}),     // 报账人员
                        generateDatetime: intl.formatMessage({id: "lbl.Reimbursement-date"}),     // 报账日期
                        checkUser: intl.formatMessage({id: "lbl.auditor"}),     // 审核人员
                        checkDatetime: intl.formatMessage({id: "lbl.audit-date"}),     // 审核日期
                        verifyStatus: intl.formatMessage({id: "lbl.Reimbursement-status"}),     // 报账单状态
                        userNote: intl.formatMessage({id: "lbl.ac.pymt.claim-note"}),     // 备注
                        clearingCurrencyCode: intl.formatMessage({id: "lbl.Tax-coins"}),     // 税金（参考）币种
                        vatAmount: intl.formatMessage({id: "lbl.Total-amount-tax"}),     // 税金（参考）总金额
                    },
                    // sumCol: {//汇总字段
                        // commissionMode: intl.formatMessage({id: "lbl.The-Commission"}),   // 佣金模式
                        // rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),    // 协议币种  
                        // totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),    // 协议币金额  
                        // reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),    // 协议币调整金额 
                        // vatAmtSum: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),    // 协议币税价（参考) 
                        // vatReviseAmtSum: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),    // 协议币调整税价（参考）
                        // pymtAmtSum: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),  // 应付网点金额
                        // recAmtSum: intl.formatMessage({id: "lbl.Agency-net-income"}),     // 代理净收入
                        // sfSide: intl.formatMessage({id: "lbl.submitanexpenseaccount"}),     // 向谁报账
                        // AgencyCurrencyCode: intl.formatMessage({id: "lbl.Standard-currency"}),     // 本位币种
                        // totalAmountInAgency: intl.formatMessage({id: "lbl.Amount-in-base-currency"}),     // 本位币金额
                        // reviseAmountInAgency: intl.formatMessage({id: "lbl.Adjustment-amount-in-base-currency"}),     // 本位币调整金额
                        // vatAmountInAgency: intl.formatMessage({id: "lbl.Tax-in-local-currency"}),     // 本位币税金（参考）
                        // reviseVatAmountInAgency: intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}),     // 本位币调整税金（参考）
                        // clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),  // 结算币种
                        // totalAmountInClearingSum: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),   // 结算币金额
                        // reviseAmountInClearingSum: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),  // 结算币调整金额
                        // vatAmountInClearingSum: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),    // 结算币税金(参考)
                        // reviseVatAmountInClearingSum: intl.formatMessage({id: 'lbl.tax-adjustment-in-settlement-currency'}),   // 结算币调整税金(参考)
                    // },
                    sheetName: intl.formatMessage({id: 'menu.afcm.comm.cr.pending-reimb'}),//sheet名称
                }],
            },
            headers: {
                "biz-source-param": "BLG"
            },
            responseType: 'blob',
        })
        // if(result && result.success == false){  //若无数据，则不下载
        //     setSpinflag(false);
        //     Toast('', result.errorMessage, 'alert-error', 5000, false);
        //     return
        // }else{
            if (result.size < 1) {
                setSpinflag(false)
                Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
                return
            } else {
            setSpinflag(false);
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            let blob = new Blob([result], { type: "application/x-xls" });
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.comm.cr.pending-reimb'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.comm.cr.pending-reimb'}) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    return (
        <div className='parent-box'>
            <Tabs type="card" onChange={callback} activeKey={defaultKey}>
                <TabPane tab={<FormattedMessage id='lbl.Reimbursement-list' />} key="1">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 船东 */}
                                <Select disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values}/>
                                {/* 代理编码 */}
                                {/* <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
                                {/* <InputText disabled name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}/>   */}
                                {
                                    company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                                }
                                {/* 报账单号码 */}
                                <InputText name='crReceiptCode' label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>  
                                {/* 报账人员 */}
                                <InputText name='generateUser' label={<FormattedMessage id='lbl.Reimbursement-personnel'/>} span={6} capitalized={false}/>  
                                {/* 报账日期 */}
                                <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate' style={{background: backFlag ? "white" : "yellow"}} label={<FormattedMessage id="lbl.Reimbursement-date" />} />
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 取消 */}
                            {/* <Button><CloseSquareOutlined/><FormattedMessage id='btn.cancel'/></Button> */}
                            {/* 取消报账单 */}
                            <CosButton style={{display: company.companyType == 0 ? 'none' : 'inline-block'}} onClick={ReimbursementBtn} disabled={btnFlag}><CloseSquareOutlined/><FormattedMessage id='btn.Cancel-reimbursement'/></CosButton>
                            {/* 下载 */}
                            <CosButton disabled={tableData.length?false:true} onClick={downloadBtn}><CloudDownloadOutlined/><FormattedMessage id='btn.download'/></CosButton>
                        </div>
                        <div className='button-right'>
                            {/* 查询 */}
                            <CosButton onClick={()=> pageChange(page, null, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                        </div>
                    </div>
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={tableData}
                            columns={reimbursementFormList}
                            rowKey='sfListUuid'
                            selectionType='radio'
                            pageSize={page.pageSize}
                            current={page.current}
                            pageChange={pageChange}
                            scrollHeightMinus={200}
                            total={tabTabTotal}
                            // setSelectedRows={setSelectedRows}
                            rowSelection={{
                                selectedRowKeys: checkeds,
                                onChange:(key, row)=>{
                                    setCheckeds(key);
                                    setSldUuid(row[0].sfListUuid);
                                    row[0].verifyStatus == "Q" || row[0].verifyStatus == "R" ? setBtnFlag(false) : setBtnFlag(true);
                                }
                            }}
                            handleDoubleClickRow={doubleClickRow}
                            selectWithClickRow={true}
                        />
                    </div>
                </TabPane>
                <TabPane disabled tab={<FormattedMessage id='lbl.Detailed-information' />} key="2">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForm}
                            name='detailed'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 报账单号码 */}
                                <InputText disabled name={['detailed', 'sfListCode']} label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>  
                                {/* 公司 */}
                                <InputText disabled name={['detailed', 'companyCode']} label={<FormattedMessage id='lbl.company'/>} span={6}/>  
                                {/* 代理编码 */}
                                <InputText disabled name={['detailed', 'agencyCode']} label={<FormattedMessage id='lbl.agency'/>} span={6}/>  
                                {/* 报账日期 */}
                                <InputText disabled name={['detailed', 'generateDatetime']} label={<FormattedMessage id='lbl.Reimbursement-date'/>} span={6}/>  
                                {/* 报账人员 */}
                                <InputText disabled name={['detailed', 'generateUser']} label={<FormattedMessage id='lbl.Reimbursement-personnel'/>} span={6}/>  
                                {/* 最后确认单状态 */}
                                <InputText disabled name={['detailed', 'verifyStatus']} label={<FormattedMessage id='lbl.Final-confirmation-status'/>} span={6}/>  
                                {/* 备注 */}
                                <InputText disabled name={['detailed', 'userNote']} label={<FormattedMessage id='lbl.ac.pymt.claim-note'/>} span={6}/>  
                                {/* 最后确认日期 */}
                                <InputText disabled name={['detailed', 'checkDatetime']} label={<FormattedMessage id='lbl.Final-confirmation-date'/>} span={6}/>  
                                {/* 最后确认人员 */}
                                <InputText disabled name={['detailed', 'checkUser']} label={<FormattedMessage id='lbl.Final-confirmation-personnel'/>} span={6}/>  
                                {/* 税金（参考）币种 */}
                                <InputText disabled name={['detailed', 'clearingCurrencyCode']} label={<FormattedMessage id='lbl.Tax-coins'/>} span={6}/>  
                                {/* 税金（参考）总金额 */}
                                <InputText disabled name={['detailed', 'vatAmount']} label={<FormattedMessage id='lbl.Total-amount-tax'/>} span={6}/>  
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/></Button> </div>
                    </div>
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={detailedQuery}
                            name='func'
                            onFinish={detailedQuery}
                        >
                            <Row>
                                {/* 提单号码 */}
                                <InputText name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number'/>} span={6}/>  
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 全选 */}
                            <CosButton disabled={btnState} onClick={() => AllSelect(true)}><FormattedMessage id='btn.select-all' /></CosButton>
                            {/* 全不选 */}
                            <CosButton disabled={btnState} onClick={() => AllSelect(false)}><FormattedMessage id='btn.no-at-all' /></CosButton>
                            {/* 保存 */}
                            <CosButton auth="AFCM_CMS_CR_002_B01" disabled={btnState} onClick={saveBtn}><SaveOutlined /><FormattedMessage id='btn.save' /></CosButton>
                            {/* 业务审核通过 */}
                            <CosButton auth="AFCM_CMS_CR_002_B02" disabled={btnState} onClick={() => examineBtn("ACTIVITY_APPROVE")}><FormattedMessage id='btn.Business-approved'/></CosButton>
                            {/* 业务审核退回 */}
                            <CosButton auth="AFCM_CMS_CR_002_B03" disabled={btnState} onClick={() => examineBtn("ACTIVITY_RETURN")}><FormattedMessage id='btn.Business-Review-return'/></CosButton>
                            {/* 财务审核通过 !*/}
                            <CosButton auth="AFCM_CMS_CR_002_B04" disabled={!btnState} onClick={() => examineBtn("FINANCE_APPROVE")}><FormattedMessage id='btn.Financial-audit-passed'/></CosButton>
                            {/* 财务审核退回 1*/}
                            <CosButton auth="AFCM_CMS_CR_002_B05" disabled={!btnState} onClick={() => examineBtn("FINANCE_RETURN")}><FormattedMessage id='btn.Financial-audit-return'/></CosButton>
                            {/* 下载 CW*/}
                            {/* <CosButton onClick={DownBtn}><CloudDownloadOutlined/><FormattedMessage id='btn.download'/></CosButton> */}
                            {/* 下载 */}
                            <CosDownLoadBtn 
                                disabled={detailedList.length ? false : true}
                                downLoadTitle={'menu.afcm.comm.cr.pending-reimb-detail'} 
                                downColumns={[{
                                    dataHead: {
                                        sfListCode: intl.formatMessage({id: "lbl.Reimbursement-number"}),     // 报账单号码
                                        companyCode: intl.formatMessage({id: 'lbl.company'}),  // 公司
                                        agencyCode: intl.formatMessage({id: 'lbl.agency'}),  // 代理编码 
                                        generateDatetime: intl.formatMessage({id: 'lbl.Reimbursement-date'}),    // 报账日期
                                        generateUser: intl.formatMessage({id: 'lbl.Reimbursement-personnel'}),   //报账人员
                                        verifyStatus: intl.formatMessage({id: 'lbl.Final-confirmation-status'}),     //最后确认单状态
                                        userNote: intl.formatMessage({id: 'lbl.ac.pymt.claim-note'}),      // 备注
                                        checkDatetime: intl.formatMessage({id: 'lbl.Final-confirmation-date'}),      // 最后确认日期
                                        checkUser: intl.formatMessage({id: 'lbl.Final-confirmation-personnel'}),     // 最后确认人员
                                        clearingCurrencyCode: intl.formatMessage({id: 'lbl.Tax-coins'}),     // 税金（参考）币种
                                        vatAmount: intl.formatMessage({id: 'lbl.Total-amount-tax'}),     // 税金（参考）总金额
                                    },
                                    dataCol: detailedColumns,   // 列表字段
                                    sumCol: detailedStatisticsList,     // 汇总字段,
                                }]} 
                                downLoadUrl={'COMM_CR_EXP_CR_RECEIPT_DETAIL'} 
                                queryData={{sfListUuid: downUuid}}
                                setSpinflag={setSpinflag}
                                btnName={'btn.download'}/>
                            </div>
                        <div className='button-right'>
                            {/* 查询 */}
                            <CosButton onClick={() => pageChangeDetailed(pages, null, 'search')}><SearchOutlined /><FormattedMessage id='btn.search'/></CosButton>
                        </div>
                    </div>
                    <div className='footer-table'>
                        {/* 表格 */}
                        <PaginationTable
                            dataSource={detailedList}
                            columns={detailedColumns}
                            rowKey='entryUuid'
                            pageSize={pages.pageSize}
                            current={pages.current}
                            pageChange={pageChangeDetailed}
                            scrollHeightMinus={200}
                            total={detailedTabTotal}
                            // getCheckboxProps={}
                            rowSelection={true ? {
                                selectedRowKeys: checked,
                                onChange:(key, row)=>{
                                    setChecked(key);
                                    setUuidData(row);
                                    selectFun(detailedList, row);
                                },
                                getCheckboxProps: (record) => ({
                                    disabled: btnState,
                                }),
                            } : null}
                            // rowSelection={null}
                        />
                    </div>
                    <div className='footer-table' style={{marginTop:'10px'}}>
                        <PaginationTable
                            rowKey="id"
                            dataSource={detailedListdata}
                            columns={detailedStatisticsList} 
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={200}
                        />
                    </div>
                </TabPane>
            </Tabs>
            {/* <EstimatedCommissionDetails initData={initData}/> */}
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default PaymentBillsPendingSettlement



// // 下载
//     const DownBtn = async() => {
//         Toast('', '', '', 5000, false);
        
//         let downDataCol = {};
//         detailedColumns.map((v, i) => {
//             downDataCol[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
//         })

//         let downSumCol = {};
//         detailedStatisticsList.map((v, i) => {
//             downSumCol[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
//         })

//         let queryData = queryForm.getFieldValue();
//         const result = await request($apiUrl.COMM_CR_EXP_CR_RECEIPT_DETAIL,{
//             method:"POST",
//             data:{
//                 page: {
//                     current: 0,
//                     pageSize: 0
//                 },
//                 sfListUuid: downUuid,
//                 excelFileName: intl.formatMessage({id: 'menu.afcm.comm.cr.pending-reimb-detail'}), //文件名
//                 sheetList: [{//sheetList列表
//                     dataHead: {
//                         sfListCode: intl.formatMessage({id: "lbl.Reimbursement-number"}),     // 报账单号码
//                         companyCode: intl.formatMessage({id: 'lbl.company'}),  // 公司
//                         agencyCode: intl.formatMessage({id: 'lbl.agency'}),  // 代理编码 
//                         generateDatetime: intl.formatMessage({id: 'lbl.Reimbursement-date'}),    // 报账日期
//                         generateUser: intl.formatMessage({id: 'lbl.Reimbursement-personnel'}),   //报账人员
//                         verifyStatus: intl.formatMessage({id: 'lbl.Final-confirmation-status'}),     //最后确认单状态
//                         agencyName: intl.formatMessage({id: 'lbl.ac.pymt.claim-note'}),      // 备注
//                         checkDatetime: intl.formatMessage({id: 'lbl.Final-confirmation-date'}),      // 最后确认日期
//                         checkUser: intl.formatMessage({id: 'lbl.Final-confirmation-personnel'}),     // 最后确认人员
//                         clearingCurrencyCode: intl.formatMessage({id: 'lbl.Tax-coins'}),     // 税金（参考）币种
//                         vatAmount: intl.formatMessage({id: 'lbl.Total-amount-tax'}),     // 税金（参考）总金额
//                     },
//                     dataCol: downDataCol,   // 列表字段
//                     sumCol: downSumCol,     // 汇总字段,
//                     sheetName: intl.formatMessage({id: 'menu.afcm.comm.cr.pending-reimb-detail'}),//sheet名称
//                 }],
//             },
//             headers: {
//                 "biz-source-param": "BLG"
//             },
//             responseType: 'blob',
//         })
//         // if(result && result.success == false){  //若无数据，则不下载
//         //     setObjMessage({alertStatus: 'alert-error', message: result.errorMessage});
//         //     return
//         // }else{
//             // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
//             let blob = new Blob([result], { type: "application/x-xls" });
//             if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
//                 navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.comm.cr.pending-reimb-detail'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
//             } else {
//                 let downloadElement = document.createElement('a');  //创建元素节点
//                 let href = window.URL.createObjectURL(blob); // 创建下载的链接
//                 downloadElement.href = href;
//                 downloadElement.download = intl.formatMessage({id: 'menu.afcm.comm.cr.pending-reimb-detail'}) + '.xlsx'; // 下载后文件名
//                 document.body.appendChild(downloadElement); //添加元素
//                 downloadElement.click(); // 点击下载
//                 document.body.removeChild(downloadElement); // 下载完成移除元素
//                 window.URL.revokeObjectURL(href); // 释放掉blob对象
//             }
//         // }
//     }