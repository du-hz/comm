/*
 * @Author: Du hongzheng
 * @Date: 2021-11-27 17:49:15
 * @LastEditors: Du hongzheng
 * @LastEditTime: 2022-03-08 14:54:00
 * @Description: file content
 * @FilePath: /afcm-web/src/pages/commissions/agmt/searchPreCommissionAgmtList.jsx
 */
// 佣金协议维护
import React, { useEffect, useState, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl, connect } from 'umi'
import CommissionAgmtEdit from './commissionAgmtEdit';
import LogPopUp from './LogPopUp';
import request from '@/utils/request';
import { acquireCompanyData, acquireSelectData, acquireSelectDataExtend, momentFormat, agencyCodeData, dictionary, companyAgency, TimesFun } from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText';
import Select from '@/components/Common/Select';
import { Button, Form, Row, Tooltip, Modal, Alert } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { Toast } from '@/utils/Toast'
import LocalChargeCopy from '../../LocalChargeAgreementView/subpage/localChargeAgmtDetail'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosIcon from '@/components/Common/CosIcon'
import { CosDownLoadBtn, CosButton, CosRadio } from '@/components/Common/index'

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    ReadOutlined,//日志
    FileAddOutlined,//新增
    CopyOutlined,//复制
    FileDoneOutlined,//查看详情
    CloudDownloadOutlined,//日志
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudUploadOutlined,//上载
    SwapOutlined,//比较
    UnlockOutlined, // 使用中
    QuestionCircleOutlined, // 提示信息
    InfoCircleOutlined
} from '@ant-design/icons'
const confirm = Modal.confirm

let formlayouts = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
}

const SearchPreCommissionAgmtList = (props) => {
    // 查询
    const [queryForm] = Form.useForm();
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [defCompany, setDefCompany] = useState('');   // 默认公司
    const [agreement, setAgreementType] = useState({});  // 协议类型
    const [commission, setCommission] = useState({});  // 收取Cross Booking佣金
    const [pattern, setPattern] = useState({});  // Cross Booking模式
    const [paidCommissionModel, setPaidCommissionModel] = useState({}); // setPaidCommissionModel第三地付费佣金模式
    const [accountsArithmetic, setAccountsArithmetic] = useState({});  // 记账算法
    const [accountsWay, setAccountsWay] = useState({});  // 记账方式
    const [ytBusiness, setYtBusiness] = useState({});  // 预提是否记账
    const [yfBusiness, setYfBusiness] = useState({});  // 应付实付是否记账 

    const [officeType, setOfficeType] = useState({});  // office类型 
    const [toPayInAdvance, setToPayInAdvance] = useState({});  // 预到付
    const [commissionBasedModel, setCommissionBasedModel] = useState({});  // 佣金模式 
    const [calcMthd, setCalcMthd] = useState({});  // 佣金计算方法 
    const [socEmptyInd, setSocEmptyInd] = useState({});  // SOC空箱标记 
    const [vatFlag, setVatFlag] = useState({});  // 是否含税价 
    const [currCode, setCurrCode] = useState({});  // 币种

    const [tableData, setTableData] = useState([]);     // 编辑查看详情数据
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [dateEnd, setDateEnd] = useState();   // 结束时间
    const [addFlag, setAddFlag] = useState(true);   // 判断是新建或者编辑查看
    const [header, setHeader] = useState(true);    // table表头切换
    const [checkStatus, setCheckStatus] = useState({});//审核状态

    const [writeRead, setWriteRead] = useState(false);//区别新增编辑查看详情
    const [spinning, setSpinning] = useState(false)
    const [copyShow, setCopyShow] = useState(false)//复制
    const [copydata, setCopydata] = useState({})//复选的数据
    const [lastConditions, setLastConditions] = useState({});
    const [isModalVisiblecopy, setIsModalVisibleCopy] = useState(false);//弹框开关
    const [flag, setFlag] = useState(false);
    const [headerUuid, setHeaderUuid] = useState('');
    const [title, setTitle] = useState('');
    const [btnIdx, setBtnIdx] = useState('');   // button状态
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [stateFlags, setStateFlag] = useState(false);     // 根据状态设置
    // const [] = useState([]); // 复选的数据
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [checked, setChecked] = useState([]);

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [uploadPageChange, setUploadPageChange] = useState(false); // 更新-查询列表
    const [uploadEdit, setUploadEdit] = useState(false); // 更新-重调编辑
    const [commMess, setCommMess] = useState('');    // 来自弹窗内部的提示
    const titTooltip = <span style={{ color: '#000' }}><FormattedMessage id='lbl.messT' /></span>
    const [redioCk, setRedioCk] = useState([
        {
            value: 'KA',
            label: <FormattedMessage id='lbl.afcm-0071' />,
            disabled: false
        }, {
            value: "WD",
            label: <FormattedMessage id='lbl.afcm-0072' />,
            disabled: false
        }
    ])
    const [redioVal, setRedioVal] = useState(true); // 默认值

    const [page, setPage] = useState({    //分页
        current: 1,
        pageSize: 10
    })

    // 初始化
    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'COMM.CALC.MTHD.CB0050', setCalcMthd, $apiUrl);// 佣金计算方法
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0044', setToPayInAdvance, $apiUrl);// 预到付

        // acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        // acquireSelectData('CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.AGMT.TYPE', setAgreementType, $apiUrl);// 协议类型
        acquireSelectData('AFCM.AGMT.CB.IND', setCommission, $apiUrl);// 收取Cross Booking佣金
        acquireSelectData('AFCM.AGMT.CB.MODE', setPattern, $apiUrl);// Cross Booking模式
        acquireSelectData('AFCM.AGMT.PAY.ELSWHERE.MODE', setPaidCommissionModel, $apiUrl);// setPaidCommissionModel第三地付费佣金模式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG', setAccountsArithmetic, $apiUrl);// 记账算法
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE', setAccountsWay, $apiUrl);// 记账方式
        acquireSelectData('AFCM.AGMT.YT.BUSINESS', setYtBusiness, $apiUrl);// 预提是否记账  
        acquireSelectData('AFCM.AGMT.YF.BUSINESS', setYfBusiness, $apiUrl);// 应付实付是否记账  

        acquireSelectData('AFCM.AGMT.OFFICE.TYPE', setOfficeType, $apiUrl);// office类型 
        // acquireSelectData('CB0044',setToPayInAdvance, $apiUrl);// 预到付
        acquireSelectData('CC0013', setCommissionBasedModel, $apiUrl);// 佣金模式
        // acquireSelectData('COMM.CALC.MTHD.CB0050',setCalcMthd, $apiUrl);// 佣金计算方法
        acquireSelectData('COMM.SOC.EMPTY.IND', setSocEmptyInd, $apiUrl);// SOC空箱标记
        acquireSelectData('AGMT.VAT.FLAG', setVatFlag, $apiUrl);// 是否含税价       
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE', setCurrCode, $apiUrl);// 币种      
        acquireSelectData('AFCM.AGMT.CHECK.STATUS', setCheckStatus, $apiUrl);// 审核状态
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码

        acquireCompanyData(setCompanysData, $apiUrl);   // 公司
        // commonTableHeader()
        CompanysFun();
        defRedio();
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            companyCode: props.user.currentUser.companyCode,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        })
    }, [company, acquireData, defCompany])

    useEffect(() => {   // 提交审核、解锁、审核后查询
        uploadPageChange ? pageChange(page, null, 'search', commMess) : undefined;
    }, [uploadPageChange, commMess])

    useEffect(() => {   // 重新调用编辑
        uploadEdit ? commonBtn(editRecord, false) : undefined;
    }, [uploadEdit])

    // // 时间
    // const TimesFun = () => {
    //     var day2 = new Date();
    //     day2.setTime(day2.getTime());
    //     let month = day2.getMonth() + 1;
    //     let day = day2.getDate() < 10 ? "0" + day2.getDate() : day2.getDate();
    //     let hour = day2.getHours() < 10 ? "0" + day2.getHours() : day2.getHours();
    //     let minute = day2.getMinutes() < 10 ? "0" + day2.getMinutes() : day2.getMinutes();
    //     let second = day2.getSeconds() < 10 ? "0" + day2.getSeconds() : day2.getSeconds();
    //     month < 10 ? month = '0' + month : month;
    //     let fromDate = `${day2.getFullYear()}${month}${day}${hour}${minute}${second}`;
    //     return fromDate;
    // }

    const defRedio = async () => {
        let company = await request($apiUrl.CURRENTUSER, {
            method: "POST",
            data: {}
        })
        if (company.success) {
            if (company.data.companyType == 0 || company.data.companyType == 1) {
                setRedioVal(true)
                queryForm.setFieldsValue({
                    agreementType: "KA"
                })
                if (company.data.companyType == 0) {
                    setRedioCk([
                        {
                            value: 'KA',
                            label: <FormattedMessage id='lbl.afcm-0071' />,
                            disabled: false
                        }, {
                            value: "WD",
                            label: <FormattedMessage id='lbl.afcm-0072' />,
                            disabled: true
                        }
                    ])
                }
            } else {
                setRedioVal(false)
                setRedioCk([
                    {
                        value: 'KA',
                        label: <FormattedMessage id='lbl.afcm-0071' />,
                        disabled: true
                    }, {
                        value: "WD",
                        label: <FormattedMessage id='lbl.afcm-0072' />,
                        disabled: false
                    }
                ])
                queryForm.setFieldsValue({
                    agreementType: "WD"
                })
            }
        }
    }

    // 获取登录公司
    const CompanysFun = async () => {
        let company = await request($apiUrl.CURRENTUSER, {
            method: "POST",
            data: {}
        })
        if (company.success) {
            setDefCompany(company.data.companyCode)
        }
    }

    // console.log('船东数据', acquireData)
    // 审核table判断
    const commonTableHeader = async () => {
        // 初始化接口-船东口岸 perhaps 网点
        let result = await request($apiUrl.COMM_AGMT_SEARCH_INIT, {
            method: "POST"
        })
        if (result.success) {
            console.log(result.data.companys)
            console.log(result.data.companys[0])
            console.log(result.data.companys[0].companyType)
            let idx = result.data.companys[0] ? result.data.companys[0].companyType : 0;
            console.log(result);
            setBtnIdx(idx);
            if (idx == 0 || idx == 1) {
                setHeader(true);
            } else {
                setHeader(false);
            }
        } else {
            Toast('', '', '', 5000, false);
        }
    }

    const [tabTotal, setTabTotal] = useState([]);//表格的数据
    const [tableDatas, setTableDatas] = useState([]);

    // 清空
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        defRedio();
        queryForm.resetFields();
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            companyCode: defCompany,
        }, [company, acquireData, defCompany])
        setTableDatas([]);
        setChecked([]);
        setCopyShow(false);
        setPage({
            current: 1,
            pageSize: 10
        })
        setCopydata({});
    }

    // 表格接口
    const pageChange = async (pagination, options, search, message) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        setChecked([]);
        if (search) {
            pagination.current = 1
        }
        let sorter
        if (options?.sorter?.order) {
            sorter = {
                "field": options.sorter.columnKey,
                "order": options.sorter.order === "ascend" ? 'DESC' : options.sorter.order === "descend" ? 'ASC' : undefined
            }
        }
        let queryData = queryForm.getFieldValue();
        queryData.agreementType == 'WD' ? setRedioVal(false) : setRedioVal(true)
        // console.log(queryData.agreementType)
        if ((!queryData.fromDate && queryData.toDate) || (queryData.fromDate && !queryData.toDate)) {
            Toast('', formatMessage({ id: "lbl.date-null" }), 'alert-error', 5000, false)
            setSpinflag(false);
        } else {
            setSpinning(true)
            setCopydata({});
            let result = await request($apiUrl.REQUEST_COMMISSON_LIST_POST, {
                method: "POST",
                data: {
                    page: pagination,
                    params: {
                        ...queryData,
                        Date: undefined,
                        fromDate: queryData.Date ? momentFormat(queryData.Date[0]) : undefined,
                        toDate: queryData.Date ? momentFormat(queryData.Date[1]) : undefined,
                        // companyCode: props.user.currentUser.companyCode

                    },
                    "sorter": sorter
                }
            })
            setCopyShow(false)
            if (result.success) {
                setSpinflag(false);
                console.log(btnIdx);
                // if(pagination.pageSize!=page.pageSize){
                //     pagination.current=1
                // }
                setPage({ ...pagination })
                setSpinning(false)
                let data = result.data
                let datas = result.data.resultList
                console.log(result)
                setTableDatas([...datas])
                setTabTotal(data.totalCount)
                dictionary(datas, setTableData, protocolStateData.values, checkStatus.values)
                setUploadPageChange(false);
            } else {
                setUploadPageChange(false);
                setSpinflag(false);
                setSpinning(false);
                setTableDatas([]);
                setTabTotal(0);
                message ? undefined : Toast('', result.errorMessage, 'alert-error', 5000, false)
            }
            message ? Toast('', message, 'alert-success', 5000, false) : null;
            console.log(commMess, message);
            setCommMess('');
            setUploadPageChange(false);
        }
    }

    // 比较
    const compare = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.COMM_EXP_PRE_HEAD_COMARE, {
            method: "POST",
            data: {
                excelFileName: intl.formatMessage({ id: 'lbl.afcm-comm-compare' }), //文件名
                paramsList: [{ commissionAgreementCode: copydata[0].commissionAgreementCode }, { commissionAgreementCode: copydata[1].commissionAgreementCode }],
                sheetList: [{//sheetList列表
                    // dataHead: {
                    // agencyCode: intl.formatMessage({ id: 'lbl.afcm-head-mess' })  // 协议头信息
                    // },
                    dataCol: {//列表字段
                        commissionAgreementCode: intl.formatMessage({ id: "lbl.agreement" }),     // 协议代码
                        shipownerCompanyCode: intl.formatMessage({ id: "lbl.carrier" }),     // 船东
                        companyCode: intl.formatMessage({ id: "lbl.company" }),     // 公司
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        fromDate: intl.formatMessage({ id: "lbl.effective-start-date" }),     // 开始日期
                        toDate: intl.formatMessage({ id: "lbl.effective-end-date" }),     // 结束日期
                        agreementType: intl.formatMessage({ id: "lbl.protocol-type" }),     // 协议类型
                        crossBookingPercent: intl.formatMessage({ id: "lbl.cross" }),     // Cross Booking
                        crossBookingIndicator: intl.formatMessage({ id: "lbl.crosscommission" }),     // 收取Cross Booking佣金
                        crossBookingMode: intl.formatMessage({ id: "lbl.crosstype" }),     // Cross Booking模式
                        payElsewhereMode: intl.formatMessage({ id: "lbl.third" }),     // 第三地佣金付费模式
                        allInRate: intl.formatMessage({ id: "lbl.rate" }),     // All in Rate
                        payElsewherePercent: intl.formatMessage({ id: "lbl.payment" }),     // 异地支付
                        postCalculationFlag: intl.formatMessage({ id: "lbl.arithmetic" }),     // 记账算法
                        postMode: intl.formatMessage({ id: "lbl.bookkeeping" }),     // 记账方式
                        ygSide: intl.formatMessage({ id: "lbl.estimate" }),     // 向谁预估
                        yfSide: intl.formatMessage({ id: "lbl.make" }),     // 向谁开票
                        sfSide: intl.formatMessage({ id: "lbl.submitanexpenseaccount" }),     // 向谁报账
                        isYt: intl.formatMessage({ id: "lbl.withholding" }),     // 预提是否记账
                        isBill: intl.formatMessage({ id: "lbl.actually" }),     // 应付实付是否记账
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.afcm-head-mess' }),//sheet名称--协议头信息
                }, {
                    // dataHead: {
                    // porCountry: intl.formatMessage({ id: 'lbl.afcm-item-compare' })    // 协议明细比较
                    // },
                    dataCol: {
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                        fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                        officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                        oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),     // 佣金模式
                        calculationMethod: intl.formatMessage({ id: "lbl.Computing-method" }),     // 计算方法
                        socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                        // percentage: intl.formatMessage({id: "lbl.percentage"}),     // 百分比
                        // commissionCurrencyCode: intl.formatMessage({id: "lbl.ccy"}),     // 币种
                        crossBookingAdjustment: intl.formatMessage({ id: "lbl.Cross-Booking-adjustment-rate" }),     // Cross Booking调整比率
                        oftTaxPercent: intl.formatMessage({ id: "lbl.Freight-tax" }),     // 运输税
                        vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),     // 是否含税价
                        note: intl.formatMessage({ id: "lbl.ac.pymt.claim-note" }),     // 备注
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.agreement-item' }),//sheet名称--协议Item
                }, {
                    // dataHead: {
                    // commissionAgreementCode: intl.formatMessage({ id: 'lbl.afcm-calc-compare' }) // 计算方法比较
                    // },
                    dataCol: {
                        // commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        // commissionTypeItemUuid: formatMessage({ id: "lbl.afcm_comm_item" }),
                        // agreementHeadUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                        // ------------------------------     新填入     -----------------------------------------------------------------
                        porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                        fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                        officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                        oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                        socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        // -----------------------------------------------------------------------------------------------
                        containerSizeTypeGroup: intl.formatMessage({ id: "lbl.Box-size-group" }),     // 箱型尺寸组
                        commissionCurrencyCode: intl.formatMessage({ id: "lbl.ccy" }),     // 币种
                        unitPrice: intl.formatMessage({ id: "lbl.imputed-price" }),     // 计算价格
                        unitPriceType: intl.formatMessage({ id: "lbl.imputed-type" }),     // 计算类型
                        fromDate: intl.formatMessage({ id: "lbl.formdate" }),     // 开始时间
                        toDate: intl.formatMessage({ id: "lbl.Ending-time" }),     // 结束时间
                        note: intl.formatMessage({ id: "lbl.ac.pymt.claim-note" }),     // 备注
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.box-calculation-detailed' }),//sheet名称--箱量计算方法明细
                }, {
                    // dataHead: {
                    // commissionAgreementCode: intl.formatMessage({ id: 'lbl.comm-item-percentage-compare' }) // 百分比比较
                    // },
                    dataCol: {
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        // ------------------------------     新填入     -----------------------------------------------------------------
                        porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                        fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                        officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                        oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                        socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        percentage: intl.formatMessage({ id: "lbl.percentage" }),     // 百分比
                        fromDate: intl.formatMessage({ id: "lbl.formdate" }),     // 开始时间
                        toDate: intl.formatMessage({ id: "lbl.Ending-time" }),     // 结束时间
                        note: intl.formatMessage({ id: "lbl.ac.pymt.claim-note" }),     // 备注
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.percentage' }),//sheet名称--百分比sheet
                },
                    // {
                    //     dataHead: { 
                    //         agencyCode: intl.formatMessage({id: 'lbl.afcm-box-compare'})  // 箱型尺寸组明细比较
                    //     },
                    //     dataCol: {
                    //         agreementHeadUuid:formatMessage({id:"lbl.afcm_comm_details_id" }),
                    //         commissionAgreementCode:formatMessage({id:'lbl.agreement'}),
                    //         containerSizeTypeGroup: intl.formatMessage({id: "lbl.Box-size-group"}),     // 箱型尺寸组
                    //         containerSizeType: intl.formatMessage({id: "lbl.Box-size"}),     // 箱型尺寸
                    //         cargoNatureCode: intl.formatMessage({id: "lbl.cargo-class"}),     // 货类

                    //     },
                    //     sheetName: intl.formatMessage({id: 'lbl.group-message'}),//sheet名称--Group信息
                    // }
                ],
            },
            headers: {
                "biz-source-param": "BLG"
            },
            responseType: 'blob',
            // headers: {
            //     'Content-Type': 'application/json;charset=UTF-8'
            // },
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
            let blob = new Blob([result], { type: "application/x-xls" });
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'lbl.afcm-comm-compare' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'lbl.afcm-comm-compare' }) + '/' + TimesFun() + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.COMM_EXP_CR_AGMT_INFO, {
            method: "POST",
            data: {
                excelFileName: intl.formatMessage({ id: 'menu.afcm.agreement.commission.maintenance' }), //文件名
                uuid: copydata[0].agreementHeadUuid,
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        shipownerCompanyCode: intl.formatMessage({ id: "lbl.carrier" }),     // 船东
                        companyCode: intl.formatMessage({ id: "lbl.company" }),     // 公司
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        // commissionAgreementCode: intl.formatMessage({ id: "lbl.agreement" }),     // 协议代码
                        fromDate: intl.formatMessage({ id: "lbl.effective-start-date" }),     // 开始日期
                        toDate: intl.formatMessage({ id: "lbl.effective-end-date" }),     // 结束日期
                        agreementType: intl.formatMessage({ id: "lbl.protocol-type" }),     // 协议类型
                        crossBookingPercent: intl.formatMessage({ id: "lbl.cross" }),     // Cross Booking
                        crossBookingIndicator: intl.formatMessage({ id: "lbl.crosscommission" }),     // 收取Cross Booking佣金
                        crossBookingMode: intl.formatMessage({ id: "lbl.crosstype" }),     // Cross Booking模式
                        payElsewhereMode: intl.formatMessage({ id: "lbl.third" }),     // 第三地佣金付费模式
                        allInRate: intl.formatMessage({ id: "lbl.rate" }),     // All in Rate
                        payElsewherePercent: intl.formatMessage({ id: "lbl.payment" }),     // 异地支付
                        postCalculationFlag: intl.formatMessage({ id: "lbl.arithmetic" }),     // 记账算法
                        postMode: intl.formatMessage({ id: "lbl.bookkeeping" }),     // 记账方式
                        ygSide: intl.formatMessage({ id: "lbl.estimate" }),     // 向谁预估
                        yfSide: intl.formatMessage({ id: "lbl.make" }),     // 向谁开票
                        sfSide: intl.formatMessage({ id: "lbl.submitanexpenseaccount" }),     // 向谁报账
                        isYt: intl.formatMessage({ id: "lbl.withholding" }),     // 预提是否记账
                        isBill: intl.formatMessage({ id: "lbl.actually" }),     // 应付实付是否记账
                    },
                    // sumCol: {//汇总字段
                    // },
                    sheetName: intl.formatMessage({ id: 'lbl.afcm-head-mess' }),//sheet名称--表头
                }, {
                    dataCol: {
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        // commissionTypeItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                        porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                        fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                        officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                        oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),     // 佣金模式
                        calculationMethod: intl.formatMessage({ id: "lbl.Computing-method" }),     // 计算方法
                        socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                        percentage: intl.formatMessage({ id: "lbl.percentage" }),     // 百分比
                        commissionCurrencyCode: intl.formatMessage({ id: "lbl.ccy" }),     // 币种
                        crossBookingAdjustment: intl.formatMessage({ id: "lbl.Cross-Booking-adjustment-rate" }),     // Cross Booking调整比率
                        oftTaxPercent: intl.formatMessage({ id: "lbl.Freight-tax" }),     // 运输税
                        vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),     // 是否含税价
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.agreement-item' }),//sheet名称--协议Item
                }, {
                    dataCol: {

                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        // commissionTypeItemUuid: formatMessage({ id: "lbl.afcm_comm_item" }),
                        // agreementHeadUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                        // commissionTypeItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                        containerSizeTypeGroup: intl.formatMessage({ id: "lbl.Box-size-group" }),     // 箱型尺寸组
                        commissionCurrencyCode: intl.formatMessage({ id: "lbl.ccy" }),     // 币种
                        unitPrice: intl.formatMessage({ id: "lbl.imputed-price" }),     // 计算价格
                        unitPriceType: intl.formatMessage({ id: "lbl.imputed-type" }),     // 计算类型
                        // ------------------------------     新填入     -----------------------------------------------------------------
                        porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                        fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                        officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                        oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                        socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        // -----------------------------------------------------------------------------------------------
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.box-calculation-detailed' }),//sheet名称--箱量计算方法明细
                }, {
                    dataCol: {
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        containerSizeTypeGroup: intl.formatMessage({ id: "lbl.Box-size-group" }),     // 箱型尺寸组
                        containerSizeType: intl.formatMessage({ id: "lbl.Box-size" }),     // 箱型尺寸
                        cargoNatureCode: intl.formatMessage({ id: "lbl.cargo-class" }),     // 货类

                    },
                    sheetName: intl.formatMessage({ id: 'lbl.group-message' }),//sheet名称--Group信息
                }, {
                    dataCol: {
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        tradeLane: intl.formatMessage({ id: "lbl.Trade-line" }),     // 贸易线
                        groupCode: intl.formatMessage({ id: "lbl.group" }),     // 组
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.maintain-na' }),//sheet名称---维护NA组
                }],
            },
            headers: {
                "biz-source-param": "BLG"
            },
            responseType: 'blob',
            // headers: {
            //     'Content-Type': 'application/json;charset=UTF-8'
            // },
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
            let blob = new Blob([result], { type: "application/x-xls" });
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.agreement.commission.maintenance' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                // var day2 = new Date();
                // day2.setTime(day2.getTime());
                // let month = day2.getMonth() + 1;
                // let day = day2.getDate() > 10 ? "0" + day2.getDate() : day2.getDate();
                // let hour = day2.getHours() > 10 ? "0" + day2.getHours() : day2.getHours();
                // let minute = day2.getMinutes() > 10 ? "0" + day2.getMinutes() : day2.getMinutes();
                // let second = day2.getSeconds() > 10 ? "0" + day2.getSeconds() : day2.getSeconds();
                // month < 10 ? month = '0' + month : month;
                // let fromDate = `${day2.getFullYear()}${month}${day}${hour}${minute}${second}`;
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.agreement.commission.maintenance' }) + '/' + TimesFun() + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    // 全球协议统计报表
    const GlobalDownloadBtn = async () => {
        let queryData = queryForm.getFieldValue();
        Toast('', '', '', 5000, false);
        if (!queryData.shipperOwner || !queryData.companyCode) {
            Toast('', formatMessage({ id: 'lbl.afcm-0063' }), 'alert-error', 5000, false)
        } else {
            const result = await request($apiUrl.COMM_EXP_PRE_HEAD_GLOBAL, {
                method: "POST",
                data: {
                    excelFileName: intl.formatMessage({ id: 'btn.Glo.agreement.statistics' }), //文件名
                    paramsList: [{
                        shipownerCompanyCode: queryData.shipperOwner,
                        companyCode: queryData.companyCode
                    }],
                    sheetList: [{//sheetList列表
                        dataHead: {
                            agencyCode: intl.formatMessage({ id: 'lbl.afcm-head-mess' })  // 协议头信息
                        },
                        dataCol: {//列表字段
                            commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                            shipownerCompanyCode: intl.formatMessage({ id: "lbl.carrier" }),     // 船东
                            companyCode: intl.formatMessage({ id: "lbl.company" }),     // 公司
                            agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                            // commissionAgreementCode: intl.formatMessage({ id: "lbl.agreement" }),     // 协议代码
                            fromDate: intl.formatMessage({ id: "lbl.effective-start-date" }),     // 开始日期
                            toDate: intl.formatMessage({ id: "lbl.effective-end-date" }),     // 结束日期
                            agreementType: intl.formatMessage({ id: "lbl.protocol-type" }),     // 协议类型
                            crossBookingPercent: intl.formatMessage({ id: "lbl.cross" }),     // Cross Booking
                            crossBookingIndicator: intl.formatMessage({ id: "lbl.crosscommission" }),     // 收取Cross Booking佣金
                            crossBookingMode: intl.formatMessage({ id: "lbl.crosstype" }),     // Cross Booking模式
                            payElsewhereMode: intl.formatMessage({ id: "lbl.third" }),     // 第三地佣金付费模式
                            allInRate: intl.formatMessage({ id: "lbl.rate" }),     // All in Rate
                            payElsewherePercent: intl.formatMessage({ id: "lbl.payment" }),     // 异地支付
                            postCalculationFlag: intl.formatMessage({ id: "lbl.arithmetic" }),     // 记账算法
                            postMode: intl.formatMessage({ id: "lbl.bookkeeping" }),     // 记账方式
                            ygSide: intl.formatMessage({ id: "lbl.estimate" }),     // 向谁预估
                            yfSide: intl.formatMessage({ id: "lbl.make" }),     // 向谁开票
                            sfSide: intl.formatMessage({ id: "lbl.submitanexpenseaccount" }),     // 向谁报账
                            isYt: intl.formatMessage({ id: "lbl.withholding" }),     // 预提是否记账
                            isBill: intl.formatMessage({ id: "lbl.actually" }),     // 应付实付是否记账
                            // "commissionIndicator": intl.formatMessage({ id: "lbl.afcm-comm-10" }),     //佣金分配标志
                            // "modifyIndicator": intl.formatMessage({ id: "lbl.afcm-comm-11" }),     //协议修改标志
                            // "calculationAgainIndicator": intl.formatMessage({ id: "lbl.afcm-comm-12" }),     //是否需要重算
                            "dataSource": intl.formatMessage({ id: "lbl.afcm-comm-13" }),     //数据来源 
                            "ptCompanyCode": intl.formatMessage({ id: "lbl.afcm-comm-14" }),     //口岸公司代码
                            "crossBookingIndicator": intl.formatMessage({ id: "lbl.crosscommission" }),    // 收取Cross Booking佣金 
                            "crossBookingMode": intl.formatMessage({ id: "lbl.crosstype" }),     //Cross Booking模式
                            "crossBookingPercent": intl.formatMessage({ id: "lbl.cross" }),     //Cross Booking
                            "isCommission": intl.formatMessage({ id: "lbl.afcm-comm-15" }),     // 是否抽取佣金
                            "groupAgreementCode": intl.formatMessage({ id: "lbl.company-code" }),     // 公司代码 
                            "recordCreateDatetime": intl.formatMessage({ id: "lbl.create-date" }),     // 创建时间  
                            "recordCreateUser": intl.formatMessage({ id: "lbl.create-by" }),     // 创建人 
                            "recordUpdateDatetime": intl.formatMessage({ id: "lbl.Record-update-time" }),     // 记录更新时间   
                            "recordUpdateUser": intl.formatMessage({ id: "lbl.Record-update-by" }),     // 记录更新人员 
                        },
                        sheetName: intl.formatMessage({ id: 'lbl.afcm-head-mess' }),//sheet名称--协议头信息
                    }, {
                        dataHead: {
                            porCountry: intl.formatMessage({ id: 'lbl.afcm-item-compare' })    // 协议明细比较
                        },
                        dataCol: {
                            commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                            porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                            fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                            officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                            officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                            oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                            commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                            commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),     // 佣金模式
                            calculationMethod: intl.formatMessage({ id: "lbl.Computing-method" }),     // 计算方法
                            socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                            percentage: intl.formatMessage({ id: "lbl.percentage" }),     // 百分比
                            // commissionCurrencyCode: intl.formatMessage({id: "lbl.ccy"}),     // 币种
                            crossBookingAdjustment: intl.formatMessage({ id: "lbl.Cross-Booking-adjustment-rate" }),     // Cross Booking调整比率
                            oftTaxPercent: intl.formatMessage({ id: "lbl.Freight-tax" }),     // 运输税
                            vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),     // 是否含税价
                            "recordUpdateDatetime": formatMessage({ id: 'lbl.update-date' }),  // 更新时间
                            note: intl.formatMessage({ id: "lbl.ac.pymt.claim-note" }),     // 备注
                            // "socEmptyIndicator" "calculationMethod""percentage""recordUpdateDatetime" "percentage"       item的
                        },
                        sheetName: intl.formatMessage({ id: 'lbl.agreement-item' }),//sheet名称--协议Item
                    }, {
                        dataHead: {
                            commissionAgreementCode: intl.formatMessage({ id: 'lbl.afcm-calc-compare' }) // 计算方法比较
                        },
                        dataCol: {
                            commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                            // commissionTypeItemUuid: formatMessage({ id: "lbl.afcm_comm_item" }),
                            // agreementHeadUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                            // ------------------------------     新填入     -----------------------------------------------------------------
                            porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                            fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                            officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                            officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                            oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                            socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                            commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                            // -----------------------------------------------------------------------------------------------
                            containerSizeTypeGroup: intl.formatMessage({ id: "lbl.Box-size-group" }),     // 箱型尺寸组
                            commissionCurrencyCode: intl.formatMessage({ id: "lbl.ccy" }),     // 币种
                            unitPrice: intl.formatMessage({ id: "lbl.imputed-price" }),     // 计算价格
                            unitPriceType: intl.formatMessage({ id: "lbl.imputed-type" }),     // 计算类型
                            fromDate: intl.formatMessage({ id: "lbl.formdate" }),     // 开始时间
                            toDate: intl.formatMessage({ id: "lbl.Ending-time" }),     // 结束时间
                            "recordUpdateDatetime": formatMessage({ id: 'lbl.update-date' }),  // 更新时间
                            note: intl.formatMessage({ id: "lbl.ac.pymt.claim-note" }),     // 备注
                        },
                        sheetName: intl.formatMessage({ id: 'lbl.box-calculation-detailed' }),//sheet名称--箱量计算方法明细
                    }, {
                        dataHead: {
                            commissionAgreementCode: intl.formatMessage({ id: 'lbl.comm-item-percentage-compare' }) // 百分比比较
                        },
                        dataCol: {
                            commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                            // ------------------------------     新填入     -----------------------------------------------------------------
                            porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                            fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                            officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                            officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                            oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                            socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                            commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                            percentage: intl.formatMessage({ id: "lbl.percentage" }),     // 百分比
                            fromDate: intl.formatMessage({ id: "lbl.formdate" }),     // 开始时间
                            toDate: intl.formatMessage({ id: "lbl.Ending-time" }),     // 结束时间
                            vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),     // 是否含税价
                            oftTaxPercent: intl.formatMessage({ id: "lbl.Freight-tax" }),     // 运输税
                            "recordUpdateDatetime": formatMessage({ id: 'lbl.update-date' }),  // 更新时间
                            recordCreateDatetime: formatMessage({ id: 'lbl.create-date' }),  // 创建时间
                            crossBookingAdjustment: intl.formatMessage({ id: "lbl.Cross-Booking-adjustment-rate" }),     // Cross Booking调整比率
                            calculationMethod: intl.formatMessage({ id: "lbl.Computing-method" }),     // 计算方法
                            commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),     // 佣金模式
                            note: intl.formatMessage({ id: "lbl.ac.pymt.claim-note" }),     // 备注
                        },
                        sheetName: intl.formatMessage({ id: 'lbl.percentage' }),//sheet名称--百分比sheet
                    },
                    ],
                },
                headers: {
                    "biz-source-param": "BLG"
                },
                responseType: 'blob',
                // headers: {
                //     'Content-Type': 'application/json;charset=UTF-8'
                // },
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
                let blob = new Blob([result], { type: "application/x-xls" });
                // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, intl.formatMessage({ id: 'btn.Glo.agreement.statistics' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = intl.formatMessage({ id: 'btn.Glo.agreement.statistics' }) + '/' + TimesFun() + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        }
    }

    // 日志
    const journal = async (record) => {
        Toast('', '', '', 5000, false);
        setIsModalVisibleLog(true);
        setSpinflag(true);
        const result = await request($apiUrl.LOG_SEARCH_PRE_LIST,
            {
                method: 'POST',
                data: {
                    params: {
                        referenceType: "COMM_AGMT",
                        referenceUuid: record.agreementHeadUuid
                    }

                }
            }
        )
        if (result.success) {
            setSpinflag(false);
            setJournalData(result.data)
        } else {
            Toast('', result.errorMessage, 'alert-error', 5000, false)
            setSpinflag(false);
        }
    }

    const FormOutlinedIcon = <FormOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> // 待处理
    const UnlockOutlinedIcon = <UnlockOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> // 使用中
    const CosIconIcon = <CosIcon type={'icon-dunpai'} style={{ color: '#2795f5', fontSize: '15px' }} />       // 待审核
    //表格
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation'>
                    {/* 删除 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => { deleteTableData(record, index) }} disabled={record.show ? false : true}><CloseCircleOutlined style={{ color: record.show ? 'red' : '#ccc', fontSize: '15px' }} /></a>
                    </Tooltip> */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a> <CosButton auth='AFCM_AGMT_COMM_001_B04' onClick={() => deleteTableData(record, index)} disabled={record.show ? false : true}><CloseCircleOutlined style={{ color: record.show ? 'red' : '#ccc', fontSize: '15px' }} /> </CosButton></a>
                    </Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id={record.status == 'D' ? 'btn.edit' : (record.status == 'W' ? 'lbl.audit' : 'lbl.unlock')} />}>
                        <a onClick={() => { commonBtn(record, false) }}>
                            {
                                record ? (record.status == 'D' ? FormOutlinedIcon : (record.status == 'W' ? CosIconIcon : UnlockOutlinedIcon)) : FormOutlinedIcon
                            }
                        </a>  {/* 修改 */}
                    </Tooltip>&nbsp;&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { commonBtn(record, true) }}><FileSearchOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></a> {/* 查看详情 */}
                    </Tooltip>&nbsp;&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => { journal(record) }}><ReadOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></a>
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.agreement" />,//协议代码
            dataIndex: 'commissionAgreementCode',
            align: 'left',
            sorter: true,
            // sortOrder: false,
            // defaultSortOrder: 'false',
            key: 'COMM_AGMT_CDE',
            width: 120
        }, {
            title: <FormattedMessage id='lbl.carrier' />,//船东
            // dataType: acquireData.values,
            dataIndex: 'shipownerCompanyCode',
            align: 'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataType: companysData,
            dataIndex: 'companyCode',
            align: 'left',
            sorter: true,
            key: 'COMPANY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            align: 'left',
            sorter: true,
            key: 'AGENCY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.company-abbreviation" />,//公司简称
            dataIndex: 'commpanyNameAbbr',
            sorter: true,
            key: 'COMPANY_NME_ABBR',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataType: protocolStateData.values,
            dataIndex: 'status',
            align: 'left',
            sorter: true,
            key: 'STATUS',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataIndex: 'fromDate',
            dataType: 'dateTime',
            align: 'left',
            sorter: true,
            key: 'FM_DTE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataIndex: 'toDate',
            dataType: 'dateTime',
            align: 'left',
            sorter: true,
            key: 'TO_DTE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.payment" />,//异地支付
            dataIndex: 'payElsewherePercent',
            align: 'left',
            sorter: true,
            key: 'PAY_ELSEWHERE_PCT',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.off-site-commission" />,//第三地付费佣金模式
            dataIndex: 'payElsewhereMode',
            align: 'left',
            sorter: true,
            key: 'PAY_ELSEWHERE_MDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.all-rate-OFT" />,//All in Rate的OFT比例
            dataIndex: 'allInRate',
            align: 'left',
            sorter: true,
            key: 'ALL_IN_RATE',
            width: 130
        }, {
            title: <FormattedMessage id={redioVal ? "lbl.afcm-comm-01" : 'lbl.branch-audit-state'} />,// 口岸/网点审核状态
            // dataType: checkStatus,
            dataIndex: 'checkAgencyStatus',
            align: 'left',
            sorter: true,
            key: 'CHECK_AGENCY_STATUS',
            width: 150,
        }, {
            title: <FormattedMessage id={redioVal ? "lbl.afcm-comm-02" : 'lbl.branch-audit-person'} />,// 口岸/网点审核人
            dataIndex: 'recordCheckAgencyUser',
            align: 'left',
            sorter: true,
            key: 'REC_CHECK_AGENCY_USR',
            width: 150,
        }, {
            title: <FormattedMessage id={redioVal ? "lbl.afcm-comm-03" : 'lbl.branch-audit-date'} />,// 口岸/网点审核日期
            dataIndex: 'recordCheckAgencyDate',
            align: 'left',
            sorter: true,
            key: 'REC_CHECK_AGENCY_DTE',
            width: 150,
        }, {
            title: <FormattedMessage id={redioVal ? "lbl.afcm-comm-04" : 'lbl.afcm-comm-01'} />,// PMD/口岸审核状态
            // title: <FormattedMessage id={header ? "lbl.pmd-audit-status" : 'lbl.port-audit-state'} />,// PMD审核状态
            // dataType: checkStatus,
            dataIndex: 'checkPmdStatus',
            align: 'left',
            sorter: true,
            key: 'CHECK_HQ_STATUS',
            width: 150,
        }, {
            title: <FormattedMessage id={redioVal ? "lbl.afcm-comm-05" : 'lbl.afcm-comm-02'} />,// PMD/口岸审核人
            // title: <FormattedMessage id={header ? "lbl.PMD-audit-person" : 'lbl.port-audit-person'} />,// PMD审核人
            dataIndex: 'recordCheckPmdUser',
            align: 'left',
            sorter: true,
            key: 'REC_CHECK_HQ_USR',
            width: 150,
        }, {
            title: <FormattedMessage id={redioVal ? "lbl.afcm-comm-06" : 'lbl.afcm-comm-03'} />,// PMD/口岸审核日期
            // title: <FormattedMessage id={header ? "lbl.pmd-verify-date" : 'lbl.port-audit-date'} />,// PMD审核日期
            dataIndex: 'recordCheckPmdDate',
            // dataType: 'dateTime',
            align: 'left',
            sorter: true,
            key: 'REC_CHECK_HQ_DTE',
            width: 150,
        }, {
            title: redioVal ? <FormattedMessage id="lbl.afcm-comm-07" /> : <FormattedMessage id="lbl.afcm-00100" />,//FAD审核状态  口岸// 财务审核状态
            // title: <FormattedMessage id={header ? "lbl.finance-state" : 'lbl.share-core-state'} />,// 财务审核状态
            // dataType: checkStatus,
            dataIndex: 'checkFadStatus',
            align: 'left',
            sorter: true,
            key: 'CHECK_FAD_STATUS',
            width: redioVal ? 150 : 0,
        }, {
            title: redioVal ? <FormattedMessage id="lbl.afcm-comm-08" /> : <FormattedMessage id="lbl.afcm-00101" />,//FAD审核,// FAD审核人
            // title: <FormattedMessage id={header ? "lbl.finance-people" : 'lbl.share-core-people'} />,// 财务审核人
            dataIndex: 'recordCheckFadUser',
            align: 'left',
            sorter: true,
            key: 'REC_CHECK_FAD_USR',
            width: redioVal ? 150 : 0,
        }, {
            title: redioVal ? <FormattedMessage id="lbl.afcm-comm-09" /> : <FormattedMessage id="lbl.afcm-00102" />,//FAD审核日,// 财务审核日期
            // title: <FormattedMessage id={header ? "lbl.finance-date" : 'lbl.share-core-date'} />,// 财务审核日期
            dataIndex: 'recordCheckFadDate',
            // dataType: 'dateTime',
            align: 'left',
            sorter: true,
            key: 'REC_CHECK_FAD_DTE',
            width: redioVal ? 150 : 0,
        }, {
            title: <FormattedMessage id='lbl.Protocol-group-number' />,//协议组编号
            dataIndex: 'groupAgreementCode',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.create-by' />,//创建人
            dataIndex: 'recordCreateUser',
            align: 'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id='lbl.create-date' />,//创建时间
            dataIndex: 'recordCreateDatetime',
            align: 'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.modifier" />,//修改人
            dataIndex: 'recordUpdateUser',
            sorter: true,
            key: 'REC_UPD_USR',
            width: 80,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.modification-date" />,//修改日期
            dataIndex: 'recordUpdateDatetime',
            sorter: true,
            key: 'REC_UPD_DT',
            width: 120,
            align: 'left'
        }
    ]

    // 删除
    const deleteTableData = async (record, index) => {
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            content: formatMessage({ id: 'lbl.Confirm-deletion' }),
            okText: formatMessage({ id: 'lbl.confirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const result = await request($apiUrl.COMM_AGMT_DELETE_HEAD_UUID,
                    {
                        method: 'POST',
                        data: {
                            uuid: record.agreementHeadUuid,
                        }
                    })
                if (result.success) {
                    setSpinflag(false);
                    pageChange(page, null, 'search', result.message);
                } else {
                    Toast('', result.errorMessage, 'alert-error', 5000, false)
                    setSpinflag(false);
                }
            }
        })
    }

    const [editRecord, setEditRecord] = useState(true); // 储存编辑数据
    // 编辑查看详情公用
    const commonBtn = async (record, flag) => {
        // 查看详情为true，编辑为false
        Toast('', '', '', 5000, false);
        setSpinflag(true);  // 加载

        if (!flag) {
            setEditRecord(record);
            setUploadEdit(false);
        }
        const result = await request($apiUrl.COMM_SEARCH_PRE_HEAD_DETAIL,
            {
                method: 'POST',
                data: {
                    operateType: record.status == 'U' && !flag ? "UNLOCK" : undefined,
                    uuid: record.agreementHeadUuid
                }
            }
        )
        if (result.success) {
            setSpinflag(false);    // 关闭加载
            setAddFlag(flag);      // 判断是新建或者编辑查看
            setCommonFlag(flag);   // 控制读写
            setWriteRead(false);   // 区别新增编辑查看详情
            let data = result.data;
            setHeaderUuid(data.agreementHeadUuid);
            data.postCalculationFlag = data.postCalculationFlag + '';
            data.postMode = data.postMode + '';
            data.isYt = data.isYt + '';
            data.isBill = data.isBill + '';
            // console.log('number改成string类型', data.postCalculationFlag);
            flag ? setTitle(<FormattedMessage id='lbl.ViewDetails' />) : setTitle(<FormattedMessage id='btn.edit' />);
            setFlag(flag);
            data.commissionAgmtItems.map((v, i) => {
                v.saveShowHide = false
            })
            setTableData(data);
            setIsModalVisible(true);
            // flag ? setStateFlag(false) : setStateFlag(record.show);
            flag ? setStateFlag(false) : setStateFlag(true);
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false)
        }
    }

    // 提交审核
    const submitBtn = async () => {
        Toast('', '', '', 5000, false);
        // if(copydata.length == 1 && copydata[0].status == protocolStateData.values[0].label){
        setSpinflag(true);
        await request($apiUrl.COMM_AGMT_PRE_SAVE_SUBMIT, {
            method: 'POST',
            data: {
                "operateType": "SUBMIT",
                paramsList: [{
                    agencyCode: copydata[0].agencyCode,
                    agreementHeadUuid: copydata[0].agreementHeadUuid,
                    agreementType: copydata[0].agreementType,
                    allInRate: copydata[0].allInRate,
                    commissionAgreementCode: copydata[0].commissionAgreementCode,
                    companyCode: copydata[0].companyCode,
                    crossBookingIndicator: copydata[0].crossBookingIndicator,
                    crossBookingMode: copydata[0].crossBookingMode,
                    crossBookingPercent: copydata[0].crossBookingPercent,
                    fromDate: copydata[0].fromDate + ' 00:00:00',
                    isBill: copydata[0].isBill,
                    isYt: copydata[0].isYt,
                    payElsewhereMode: copydata[0].payElsewhereMode,
                    payElsewherePercent: copydata[0].payElsewherePercent,
                    postCalculationFlag: copydata[0].postCalculationFlag,
                    postMode: copydata[0].postMode,
                    sfSide: copydata[0].sfSide,
                    shipownerCompanyCode: copydata[0].shipownerCompanyCode,
                    toDate: copydata[0].toDate + ' 00:00:00',
                    ygSide: copydata[0].ygSide,
                    yfSide: copydata[0].yfSide,
                    status: 'D',
                }]
            }
        }).then((result) => {
            setSpinflag(false);
            result.success ? pageChange(page, null, 'search', result.message) : Toast('', result.errorMessage, 'alert-error', 5000, false);
        })
    }

    // 新建
    const addBtn = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        setIsModalVisible(true);
        setAddFlag(true);
        setWriteRead(true);
        setCommonFlag(false);
        setFlag(false);
        setHeaderUuid('')
        setStateFlag(false);
        setTitle(<FormattedMessage id='btn.add' />);
        await request.post($apiUrl.COMM_AGMT_NEW_PRE_INIT)
            .then((result) => {
                if (result.success) {
                    setSpinflag(false);
                    let data = result.data.toDate
                    let AddData = result.data
                    setTableData(AddData)
                    setDateEnd(data);
                    console.log(btnIdx, commonFlag, tableData.length, tableData.status, result);
                } else {
                    setSpinflag(false);
                }
            })
    }

    // 复制
    const copydatas = {
        isModalVisiblecopy,//控制弹框开关
        companysData,//公司数据
        copydata,//复制的数据
        page,//表格分页显示数据
        lastConditions,//初始化表单数据
        copyShow,
        setTableData,
        setTabTotal,
        setIsModalVisibleCopy,
        setCopydata,
        copyUrl: 'COMM_AGMT_COPY_SAVE',
        setCopyShow,
        setUnlockAuditFlag: setUploadPageChange,
    }
    // 佣金协议复制
    const copyBtn = async () => {
        Toast('', '', '', 5000, false);
        setIsModalVisibleCopy(true)
        // copydata.length == 1 && copydata[0].status == "U" ? setIsModalVisibleCopy(true) : Toast('', formatMessage({ id: 'lbl.once-U' }), 'alert-error', 5000, false);
    };

    // 多选
    //     const setSelectedRows = (val) =>{
    //         setCopyShow(true)
    //         setCopydata(val)
    //         setLastConditions(queryForm.getFieldValue())
    //    }

    // 编辑新增查看详情
    const initData = {
        acquireData: acquireData,        // 船东
        companysData,      // 公司
        agreement: agreement.values,          // 协议类型
        commission: commission.values,         // 收取Cross Booking佣金
        pattern: pattern.values,            // Cross Booking模式
        paidCommissionModel: paidCommissionModel.values,// setPaidCommissionModel第三地付费佣金模式
        accountsArithmetic: accountsArithmetic.values, // 记账算法
        accountsWay: accountsWay.values,        // 记账方式
        ytBusiness: ytBusiness.values,         // 预提是否记账
        yfBusiness: yfBusiness.values,         // 应付实付是否记账 
        officeType: officeType.values,         // office类型 
        toPayInAdvance: toPayInAdvance.values,     // 预到付
        commissionBasedModel: commissionBasedModel.values,  // 佣金模式 
        calcMthd: calcMthd.values,           // 佣金计算方法 
        socEmptyInd: socEmptyInd.values,        // SOC空箱标记 
        vatFlag: vatFlag.values,            // 是否含税价 
        currCode: currCode.values,           // 币种
        isModalVisible,      // 弹窗控制
        setIsModalVisible,   // 弹窗控制
        tableData,      // 编辑查看详情数据
        commonFlag,     // 控制读写
        dateEnd,        // 结束时间
        addFlag,        // 判断是新建或者编辑查看
        setTableData,   // 编辑查看详情数据
        setAddFlag,     // 判断是新建或者编辑查看
        writeRead,      //区别新增编辑查看详情
        setWriteRead,   //区别新增编辑查看详情
        flag,           // 弹窗顶部button控制       
        setHeaderUuid,  // 头uuid
        headerUuid,     // 头uuid
        title,          // 头信息
        btnIdx,         // button状态
        stateFlags,     // 根据状态设置
        setStateFlag,
        agencyCodeDRF: company,
        companyCodeDEF: defCompany,
        setUploadPageChange,    // 调用重新查询
        setUploadEdit,  // 调用重新编辑
        setCommMess,    // 弹窗内部赋值提示信息
        setEditRecord,
    }

    // 日志
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
        setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }

    // 公司与代理编码联动
    const selectChangeBtn = async (value, all, defData) => {
        // queryForm.setFieldsValue({
        // 	agencyCode: undefined
        // 	// agencyCode: all.linkage.sapCustomerCode
        // })
        let data = all.linkage ? all.linkage.companyCode : []
        companyAgency($apiUrl, data, setAgencyCode)
    }

    // const redioFun = (e) => {
    //     e.target.value == 'WD' ? setRedioVal(false) : setRedioVal(true)
    // }

    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form form={queryForm}>
                    <Row>
                        {/* 船东 */}
                        <Select disabled={company.companyType == 0 ? true : false} span={6} name='shipperOwner' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                        {/* 公司 */}
                        <Select showSearch={true} span={6} flag={true} name='companyCode' label={<FormattedMessage id='lbl.company' />} selectChange={selectChangeBtn} options={companysData} />
                        <a style={{ color: 'orange' }}><Tooltip color='#e6f7ff' style={{ color: '#000' }} className="tipsContent" title={titTooltip}><InfoCircleOutlined /></Tooltip></a>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} flag={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 协议号 */}
                        <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.protocol' />} />
                        {/* 协议状态 */}
                        <Select span={6} flag={true} name='agreementStatus' label={<FormattedMessage id='lbl.ProtocolState' />} options={protocolStateData.values} />
                        {/* 生效日期 */}
                        <DoubleDatePicker disabled={[false, false]} span={6} name='Date' label={<FormattedMessage id="lbl.effective-date" />} />
                        {/* 口岸/网点协议  onClick={redioFun}*/}
                        <CosRadio span={6} label=" " name='agreementType' options={redioCk}></CosRadio>
                    </Row>
                </Form>
                {/* <Alert message={<FormattedMessage id="lbl.messT" />} type="info" showIcon /> */}
                {/* <div style={{ color: 'red', textAlign: 'right' }}>
                    <span style={{ background: 'yellow' }}><FormattedMessage id="lbl.messT" /></span>
                </div> */}
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
                    {/* <CosButton onClick={addBtn}>    新建 */}
                    <CosButton onClick={addBtn} auth="AFCM_AGMT_COMM_001_B01">
                        <FileAddOutlined />
                        <FormattedMessage id='lbl.new-btn' />
                    </CosButton>
                    {/* 复制 */}
                    <CosButton auth="AFCM_AGMT_COMM_001_B02" disabled={copydata.length == 1 && copydata[0].status == "U" && copydata[0].toDate == "9999-12-31 00:00:00" ? false : true} onClick={copyBtn} ><CopyOutlined /><FormattedMessage id='lbl.copy' /></CosButton>
                    {/* 提交审核 */}
                    <CosButton auth="AFCM_AGMT_COMM_001_B03" disabled={copydata.length == 1 && copydata[0].status == "D" ? false : true} onClick={submitBtn}><FileDoneOutlined /> <FormattedMessage id='lbl.submit-audit' /></CosButton>
                    {/* 上载 */}
                    {/* <CosButton><CloudUploadOutlined /><FormattedMessage id='btn.ac.upload'/></CosButton> */}
                    {/* 比较 */}
                    <CosButton disabled={copydata.length == 2 ? false : true} onClick={compare}><SwapOutlined /><FormattedMessage id='btn.compare' /></CosButton>
                    {/* 下载 */}
                    {/* <CosDownLoadBtn 
                        disabled={copyShow?false:true} 
                        downLoadTitle={'menu.afcm.agreement.commission.maintenance'} 
                        downColumns={[{dataCol: columns}]} 
                        downLoadUrl={'COMM_EXP_CR_AGMT_INFO'} 
                        queryData={queryForm.getFieldValue()} 
                        setSpinflag={setSpinflag} 
                        btnName={'lbl.download'}
                        downIf={copydata.length == 1 ? true : false}
                        downNo={'lbl.one-download'}/> */}

                    <CosButton disabled={copydata.length == 1 ? false : true} onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download' /></CosButton>
                    {/* 协议模板下载 */}
                    {/* <CosButton><CloudDownloadOutlined /><FormattedMessage id='btn.protocol-template-download'/></CosButton> */}
                </div>
                <div className="button-right">
                    {/* 全球协议统计报表 */}
                    <CosButton onClick={GlobalDownloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='btn.Glo.agreement.statistics' /></CosButton>
                    {/* 重置 */}
                    <CosButton onClick={clearBtn}>< ReloadOutlined /> <FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={() => pageChange(page, null, 'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                    {/* <QuestionCircleOutlined /> */}
                </div>
            </div>
            <div className="footer-table">
                <PaginationTable
                    dataSource={tableDatas}
                    columns={columns}
                    rowKey='agreementHeadUuid'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    // setSelectedRows={setSelectedRows}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            row.length ? setCopyShow(true) : setCopyShow(false);
                            setCopydata(row)
                            setLastConditions(queryForm.getFieldValue())
                            setChecked(key);
                        }
                    }}
                />
            </div>
            <CommissionAgmtEdit initData={initData} />
            <LogPopUp logData={logData} />
            {/* <Loading spinning={spinning}/> */}
            <LocalChargeCopy copydatas={copydatas} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default connect(({ user, global }) => ({
    user: user
}))(SearchPreCommissionAgmtList)