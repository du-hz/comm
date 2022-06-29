/*
 * @Author: Du hongzheng
 * @Date: 2021-12-27 17:36:41
 * @LastEditors: Du hongzheng
 * @LastEditTime: 2022-03-07 17:23:27
 * @Description: file content
 * @FilePath: /afcm-web/src/pages/protocolGroup/index.jsx
 */
import React, { useState, useEffect, $apiUrl, createContext } from 'react';
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import { Button, Form, Row, Tooltip, Modal, Tabs, Col, Upload, Checkbox, Input } from 'antd';
import InputText from '@/components/Common/InputText';
import CheckboxSelect from '@/components/Common/CheckboxSelect';
import Select from '@/components/Common/Select';
import DatePicker from '@/components/Common/DatePicker'
import InputArea from '@/components/Common/InputArea'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireCompanyData, acquireSelectDataExtend, momentFormat, acquireSelectData, agencyCodeData } from '@/utils/commonDataInterface';
import moment from 'moment';
import LogPopUp from '../commissions/agmt/LogPopUp';
import CommissionAgmtEdit from '../commissions/agmt/commissionAgmtEdit';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'

import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import AddModifcation from '../LocalChargeAgreementView/subpage/localChargeAgmtEdit'
import AgencyFeeAgmtEdit from '../agencyFee/agmt/agencyFeeAgmtEdit';
// import { CosToast } from '@/components/Common/index'
// import CosButton from '@/components/Common/CosButton'
{/* <CosToast toast={messageData}/> */ }
import { CosDownLoad, CosToast, CosButton } from '@/components/Common/index'
import CosIcon from '@/components/Common/CosIcon'
import CosModal from '@/components/Common/CosModal'
export const NumContext = createContext();

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    ReadOutlined,//日志
    FileAddOutlined,//新增
    CopyOutlined,//复制
    FileDoneOutlined,//查看详情
    SaveOutlined,
    CloudDownloadOutlined,//日志
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudUploadOutlined,//上载
    SwapOutlined,//比较
    UploadOutlined,//上传
    CloseOutlined,//取消
    UnlockOutlined, // 使用中
} from '@ant-design/icons'
const { TabPane } = Tabs;
const confirm = Modal.confirm

const formlayout1 = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
};

const formlayout2 = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

const formlayout3 = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};

const ProtocolGroupPage = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [queryForm] = Form.useForm();
    const [page, setPage] = useState({    //分页
        current: 1,
        pageSize: 10
    })
    const [defaultKey, setDefaultKey] = useState('1');
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [defCompany, setDefCompany] = useState('');   // 默认公司
    const [protocolGroupTable, setProtocolGroupTable] = useState([]);    //  协议组数据
    const [protocolGroupDetailTable, setProtocolGroupDetailTable] = useState([]);    // 佣金协议
    const [AgencyFeeTable, setAgencyFeeTable] = useState([]);   // 代理费协议
    const [LocalChargeTable, setLocalChargeTable] = useState([]); //Local Charge协议
    const [selectedRows, setSelectedRows] = useState()
    const [tabTotal, setTabTotal] = useState(0);//表格的数据
    const [isModalVisibleGroup, setIsModalVisibleGroup] = useState(false)
    const [fileListData, setFileListData] = useState([]) // 附件信息
    const [proxyCode, setProxyCode] = useState([]);  //  代理编码
    const [fadFlag, setFadFlag] = useState(true); // FAD审核
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [journalFlag, setJournalFlag] = useState(1); // 日志数据
    const [uuid, setUuid] = useState('');
    const [titlePopup, setTitlePopup] = useState(<FormattedMessage id='lbl.add' />); // 弹窗title    
    const [header, setHeader] = useState(true);    // table表头切换
    const [fileArr, setFileArr] = useState([]);    // 附件Arr
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [groupkey, setGroupKey] = useState('');
    const [objMessage, setObjMessage] = useState({});   // 报错对象

    // 佣金
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [tableData, setTableData] = useState([]);     // 编辑查看详情数据
    const [txt, setTxt] = useState('');
    const [flag, setFlag] = useState(false);
    const [addFlag, setAddFlag] = useState(true);   // 判断是新建或者编辑查看
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [writeRead, setWriteRead] = useState(false);//区别新增编辑查看详情
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
    const [btnIdx, setBtnIdx] = useState('');
    const [headerUuid, setHeaderUuid] = useState('');
    const [stateFlags, setStateFlag] = useState(false);     // 根据状态设置
    const [checkStatus, setCheckStatus] = useState({});//审核状态
    const [tabFlag, setTabFlag] = useState(true);   // tab禁用
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码

    // Local Ch
    const [tabData, setTabData] = useState({});//编辑的数据
    const [toData, setToData] = useState();//弹框的结束时间
    const [AgencyFeeflag, setAgencyFeeflag] = useState(true);//查看详情禁用
    const [AgencyFeeIsModalVisible, setAgencyFeeIsModalVisible] = useState(false);//新增编辑弹框开关
    const [dataFlag, setDataFlag] = useState(false)
    const [adddatas, setAddDatas] = useState([])//新增数据
    const [flags, setflags] = useState(false)//判断新增item是否禁用
    const [formDatas, setFromDatas] = useState([])

    // 代理费
    const [itemFlag, setItemFlag] = useState(false);//弹框item是否禁用
    const [airlineFlag, setairlineFlag] = useState(false)//航线组新增按钮是否禁用
    const [AIsModalVisible, setAIsModalVisible] = useState(false);//新增编辑弹框开关
    const [detailsFlag, setdetailsFlag] = useState(true);//查看详情禁用
    const [buttonFlag, setButtonFlag] = useState(true)//新增、编辑、查看详情的弹框按钮是否禁用
    const [compileData, setCompileData] = useState([]);//编辑数据
    const [addData, setAddData] = useState([]);//新增初始化数据
    const [btnIndex, setBtnIndex] = useState([]);
    const [prdIndicator, setProduction] = useState({})//是否生产性
    const [way, setWay] = useState({})//记账方式
    const [arithmetic, seArithmetic] = useState({})//记账算法    
    const [whether, setWhether] = useState({})//通用的是否
    const [agreementReview, setAgreementReview] = useState({})//协议审核
    const [permissionsButton, setPermissionsButton] = useState([])//按钮权限数据

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [checked, setChecked] = useState([]);
    const [companyData, setCompanyData] = useState('')
    const [shipperFlag, setShipperFlag] = useState(false)
    const [fillUuid, setFillUuid] = useState(undefined);   // 上传附件uuid
    const [deleteFill, setDeleteFill] = useState(undefined);   // 未保存需要删除的fill文件
    const [checkedAee, setCheckedAee] = useState([]);   // 选择协议的数据
    const [subCode, setSubCode] = useState(true);   // 子代理编码禁用


    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'COMM.CALC.MTHD.CB0050', setCalcMthd, $apiUrl);// 佣金计算方法
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0044', setToPayInAdvance, $apiUrl);// 预到付
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectData('AFCM.AGMT.TYPE', setAgreementType, $apiUrl);// 协议类型
        acquireSelectData('AFCM.AGMT.CB.IND', setCommission, $apiUrl);// 收取Cross Booking佣金
        acquireSelectData('AFCM.AGMT.CB.MODE', setPattern, $apiUrl);// Cross Booking模式
        acquireSelectData('AFCM.AGMT.PAY.ELSWHERE.MODE', setPaidCommissionModel, $apiUrl);// setPaidCommissionModel第三地付费佣金模式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG', setAccountsArithmetic, $apiUrl);// 记账算法
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE', setAccountsWay, $apiUrl);// 记账方式
        acquireSelectData('AFCM.AGMT.YT.BUSINESS', setYtBusiness, $apiUrl);// 预提是否记账  
        acquireSelectData('AFCM.AGMT.YF.BUSINESS', setYfBusiness, $apiUrl);// 应付实付是否记账  
        acquireSelectData('COMM.SOC.EMPTY.IND', setProduction, $apiUrl);//是否生产性
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE', setWay, $apiUrl);//记账方式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG', seArithmetic, $apiUrl);//记账算法
        acquireSelectData('AFCM.AGMT.YF.BUSINESS', setWhether, $apiUrl);//应付实付是否记账

        acquireSelectData('AFCM.AGMT.OFFICE.TYPE', setOfficeType, $apiUrl);// office类型 
        acquireSelectData('CC0013', setCommissionBasedModel, $apiUrl);// 佣金模式
        acquireSelectData('COMM.SOC.EMPTY.IND', setSocEmptyInd, $apiUrl);// SOC空箱标记
        acquireSelectData('AGMT.VAT.FLAG', setVatFlag, $apiUrl);// 是否含税价       
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE', setCurrCode, $apiUrl);// 币种     
        acquireSelectData('AFCM.AGMT.CHECK.STATUS', setCheckStatus, $apiUrl);// 审核状态
        acquireSelectData('AFCM.AGMT.CHECK.STATUS', setAgreementReview, $apiUrl);//协议审核
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码

        InitializeQuery();  // 初始化查询条件
        commonTableHeader();
        agencyFeeTableHeader();//代理费弹框登录公司
        agency()//代理费默认公司
        CompanysFun();     // 获取登录公司
    }, [isModalVisibleGroup])

    const [uploadPageChange, setUploadPageChange] = useState(false); // 更新-查询列表
    const [commMess, setCommMess] = useState('');    // 来自弹窗内部的提示

    useEffect(() => {
        uploadPageChange ? pageChange(page, null, 'search', commMess) : undefined;
    }, [uploadPageChange, commMess])

    useEffect(() => {   // 默认值
        console.log(agreementReview)
        queryForm.setFieldsValue({
            search: {
                // agencyCode: company.agencyCode,
                shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                companyCode: defCompany,
            }
        })
        DownLQ();
    }, [company, acquireData, defCompany])

    useEffect(() => {   // 新增代理费协议和子代理编码联动
        setSubCode(true);
        if (checkedAee.length > 0) {
            if (checkedAee.includes('AGENCY_FEE')) {
                setSubCode(false);
            } else {
                queryForm.setFieldsValue({
                    addProtocolGroup: {
                        subAgencyCode: undefined
                    }
                });
            }
        } else {
            queryForm.setFieldsValue({
                addProtocolGroup: {
                    subAgencyCode: undefined
                }
            });
        }
    }, [checkedAee])

    // 下载
    const [downFlag, setDownFlag] = useState(true);
    const DownLQ = async (auth = 'AFCM_AGMT_GRP_001_B05') => {
        let result = await request($apiUrl.PAGE_BUTTOB_CHECKOUT, {
            method: "POST",
            data: {
                authCode: auth
            }
        })
        if (result) {
            setDownFlag(result.data)
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

    // tab切换
    const callback = (key) => {
        Toast('', '', '', 5000, false);
        setDefaultKey(key);
    }

    // 代理费默认公司
    const agency = async () => {
        let company = await request($apiUrl.CURRENTUSER, {
            method: "POST",
            data: {}
        })
        if (company.success) {
            setCompanyData(company.data.companyCode)
        }
    }

    // 审核table判断
    const commonTableHeader = async () => {
        // 初始化接口-船东口岸 perhaps 网点
        let result = await request($apiUrl.COMM_AGMT_SEARCH_INIT, {
            method: "POST"
        })
        if (result.success && result.data.companys.length) {
            console.log(result.data.companys)
            setBtnIdx(result.data.companys[0].companyType);
            if (result.data.companys[0].companyType == 0 || result.data.companys[0].companyType == 1) {
                setHeader(true);
            } else {
                setHeader(false);
            }
        } else {
            Toast('', '', '', 5000, false);
        }
    }

    // 初始化查询条件       
    const InitializeQuery = async () => {
        await request.post($apiUrl.AGMT_GRP_SEARCH_INIT)
            .then((result) => {
                if (result.success) {
                    var data = result.data.companys;
                    data.map((val, idx) => {
                        val['value'] = val.companyCode;
                        val['label'] = val.companyCode + '-' + val.companyName;
                    })
                    setCompanysData(data);  // 公司
                }
            })
    }

    // 新增协议
    const InitializeAdd = async () => {
        Toast('', '', '', 5000, false);
        setFileListData([]);    // 附件清空
        setFillUuid(undefined);    // 附件uuid清空
        setDeleteFill(undefined);   // 删除fill itemuuid
        setObjMessage({})   // 弹窗清空
        setSpinflag(true);  // 加载
        setIsModalVisibleGroup(true);
        setJournalFlag(1);
        setTitlePopup(<FormattedMessage id='lbl.add' />)
        setUuid('');
        queryForm.setFieldsValue({
            addProtocolGroup: null
        })
        queryForm.setFieldsValue({
            addProtocolGroup: {
                shipownerCompanyCodes: company.companyType == 0 ? [company.companyCode] : [acquireData.defaultValue],
            }
        })
        await request.post($apiUrl.AGMT_GRP_PRE_NEW_INIT)
            .then((result) => {
                if (result.success) {
                    setSpinflag(false);
                    queryForm.setFieldsValue({
                        addProtocolGroup: {
                            toDate: moment(result.data.toDate)
                        }
                    });
                } else {
                    setSpinflag(false);
                }
            })
    }

    // FAD审核
    const FADExamine = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        await request.post($apiUrl.AGMT_GRP_PRE_APPROVE, {
            data: {
                "operateType": 'FAD_APPROVE',
                params: selectedRows
            }
        })
            .then((result) => {
                if (result.success) {
                    setSpinflag(false);
                    Toast('', result.message, 'alert-success', 5000, false);
                } else {
                    setSpinflag(false);
                    Toast('', result.errorMessage, 'alert-error', 5000, false);
                }
            })
    }

    // 删除协议
    const deleteTableData = async (record, index, key) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.afcm-delete' }),
            content: formatMessage({ id: 'lbl.afcm-idx-delete' }),
            okText: formatMessage({ id: 'lbl.confirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const result = await request($apiUrl[key],
                    {
                        method: 'POST',
                        data: {
                            "operateType": 'DEL',
                            uuid: record.groupAgreementHeadUuid || record.agHeadUuid || record.agreementHeadUuid || record.lcrAgreementHeadUuid,
                        }
                    })
                if (result.success) {
                    setSpinflag(false);
                    if (key == 'COMM_AGMT_DELETE_HEAD_UUID') {
                        setProtocolGroupDetailTable([]);        // 佣金协议
                    } else if (key == 'AG_FEE_AGMT_DELETE_HEAD_UUID') {
                        setAgencyFeeTable([]);          // 代理费协议
                    } else if (key == 'LCR_AGMT_DELETE_HEAD_UUID') {
                        setLocalChargeTable([]);        // Local Charge协议
                    } else if (key == 'AGMT_GRP_DELETE_HEAD_UUIT') {
                        pageChange(page, null, 'search', result.message);
                        setProtocolGroupDetailTable([]);        // 佣金协议
                        setAgencyFeeTable([]);          // 代理费协议
                        setLocalChargeTable([]);        // Local Charge协议
                        setTabFlag(true);
                        setFadFlag(true);
                    }
                } else {
                    setSpinflag(false);
                    Toast('', result.errorMessage, 'alert-error', 5000, false)
                }
            }
        })
    }

    // 日志
    const journal = async (record, key) => {
        setSpinflag(true);
        setIsModalVisibleLog(true);
        const result = await request($apiUrl.LOG_SEARCH_PRE_LIST, {
            method: 'POST',
            data: {
                params: {
                    referenceType: key,
                    referenceUuid: record.groupAgreementHeadUuid || record.agHeadUuid || record.agreementHeadUuid || record.lcrAgreementHeadUuid,
                }
            }
        })
        if (result.success) {
            setSpinflag(false);
            setJournalData(result.data)
        } else {
            setSpinflag(false);
        }
    }

    // 协议组 编辑 and 查看详情 and 
    const commonBtn = (record, flag) => {
        Toast('', '', '', 5000, false);
        setObjMessage({})
        setIsModalVisibleGroup(true);
        setJournalFlag(flag);
        if (flag == 2) {
            setTitlePopup(<FormattedMessage id='lbl.edit' />)
        } else if (flag == 3) {
            setTitlePopup(<FormattedMessage id='lbl.particulars' />)
        }
        commonFun(record, false);
    }

    const commonFun = async (record, flag) => {
        setSpinflag(true);
        let agreementArr = [];      // 协议
        // let agencyCodeArr = [];     // 代理编码
        // let shipownerCompanyCodeArr = [];   // 船东
        // 是否显示附件
        (record.attachmentItems ? record.attachmentItems.length > 0 : undefined) ? record.attachmentItems[0]['name'] = record.attachmentItems[0].originalFileName : undefined;
        setFileListData(record.attachmentItems ? record.attachmentItems : [])    // 附件赋值
        console.log((record.attachmentItems ? record.attachmentItems.length > 0 : undefined) ? record.attachmentItems[0]['name'] = record.attachmentItems[0].originalFileName : undefined)
        console.log(fileListData)
        const result = await request($apiUrl.AGMT_GRP_SEARCH_PRE_HEAD_DETAIL, {
            method: 'POST',
            data: {
                uuid: record.groupAgreementHeadUuid
            }
        })
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            if (flag) {  // 单选走
                let ProtocolGroupDetailArr = [];    // 佣金协议
                let AgencyFeeArr = [];    // 代理费协议
                let LocalChargeArr = [];    // Local Charge协议
                if (data.commissionAgmtHead) {
                    let commissData = data.commissionAgmtHead;
                    if (commissData.status == 'U' || commissData.status == 'W') {
                        commissData.show = false
                    } else if (commissData.status == 'D') {
                        commissData.show = true
                    }
                    ProtocolGroupDetailArr.push(commissData);
                }
                if (data.agFeeAgreementHead.length > 0) {
                    // AgencyFeeArr.push(data.agFeeAgreementHead);
                    AgencyFeeArr = data.agFeeAgreementHead;
                }
                if (data.localChargeAgmtHead) {
                    LocalChargeArr.push(data.localChargeAgmtHead);
                }
                setLocalChargeTable(LocalChargeArr);
                setAgencyFeeTable(AgencyFeeArr);
                setProtocolGroupDetailTable(ProtocolGroupDetailArr);
            }

            // 获取协议
            if (data.commissionAgmtHead) {   // 佣金协议
                agreementArr.push('COMMISSION');
            }
            if (data.agFeeAgreementHead.length > 0) {     // 代理费协议
                agreementArr.push('AGENCY_FEE');
            }
            if (data.localChargeAgmtHead) {    // Local Charge协议
                agreementArr.push('LOCAL_CHARGE');
            }
            console.log(agreementArr)
            // agencyCodeArr.push(data.agencyCode);
            // shipownerCompanyCodeArr.push(data.shipownerCompanyCode);

            queryForm.setFieldsValue({
                addProtocolGroup: {
                    shipownerCompanyCodes: [data.shipownerCompanyCode],
                    companyCode: data.companyCode,
                    agencyCodes: data.agencyCode,
                    subAgencyCode: data.subAgencyCode,
                    fromDate: moment(data.fromDate),
                    toDate: moment(data.toDate),
                    agreementDescription: data.agreementDescription,
                    agreementType: agreementArr,
                    // attachUuid: data.attachUuid
                }
            })
            setFillUuid(data.attachUuid ? data.attachUuid : undefined);   // 附件uuid赋值
            setDeleteFill(undefined);   // 删除fill itemuuid
            setUuid(data.groupAgreementHeadUuid);
            // pageChange(page);
            // } else {
            //     setLocalChargeTable([]);
            //     setAgencyFeeTable([]);
            //     setProtocolGroupDetailTable([]);
        } else {
            setSpinflag(false);
        }
    }

    // 佣金
    const commissionFun = async (record, flag) => {
        // 查看详情为true，编辑为false
        console.log(record, record.agreementHeadUuid, '测');
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.COMM_SEARCH_PRE_HEAD_DETAIL,
            {
                method: 'POST',
                data: {
                    uuid: record.agreementHeadUuid || record.commHeaduuid
                }
            }
        )
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            setAddFlag(flag);
            setCommonFlag(flag);
            setWriteRead(false);
            setHeaderUuid(data.agreementHeadUuid);
            data.postCalculationFlag = data.postCalculationFlag + '';
            data.postMode = data.postMode + '';
            data.isYt = data.isYt + '';
            data.isBill = data.isBill + '';
            data.agreementType = data.agreementType + '';
            // data.status = data.status + '';
            flag ? setTxt(<FormattedMessage id='lbl.ViewDetails' />) : setTxt(<FormattedMessage id='btn.edit' />);
            setFlag(flag);
            data.commissionAgmtItems.map((v, i) => {
                v.saveShowHide = false
            })
            setTableData(data);
            setIsModalVisible(true);
            console.log(flag, record.show, record)
            flag ? setStateFlag(false) : (record.status == "D" ? setStateFlag(true) : '')
            // flag ? setStateFlag(false) : setStateFlag(record.show);
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 代理费
    const [groupFlag, setGroupFlag] = useState(false);	// 仅供编辑group信息箱型尺寸组编辑修改尺寸组用
    const AgencyCommonBtn = async (record, flag) => {
        Toast('', '', '', 5000, false)
        // alert(flag)
        setAIsModalVisible(true)
        console.log(record)
        setButtonFlag(flag)
        let b = await request($apiUrl.AG_FEE_AGMT_PRE_HEAD_DETAIL, {
            method: "POST",
            data: {
                'uuid': record.agreementHeadUuid || record.agFeeHeaduuid,
            }
        })
        if (b.success) {
            let data = b.data
            console.log(data.agreementHeadUuid)
            setFlag(flag)
            setPermissionsButton(data)
            if (!flag) {
                if (record.agreementStatus == 'D') {
                    setGroupFlag(true)
                    setItemFlag(true)
                    setairlineFlag(true)
                } else {
                    setairlineFlag(false)
                    setGroupFlag(false)
                    setItemFlag(false)
                }

                setTitlePopup(<FormattedMessage id='lbl.edit' />)
                let shipper = company.companyType == 0 ? true : false
                setShipperFlag(shipper)
                setdetailsFlag(true)

            } else {
                setTitlePopup(<FormattedMessage id='lbl.ViewDetails' />)
                setItemFlag(false)
                setairlineFlag(false)
                setShipperFlag(true)
                setdetailsFlag(false)
                setGroupFlag(false)
            }
            // data.agreementHeadUuid=Number(data.agHeadUuid)
            data.prdIndicator = data.prdIndicator + ''
            data.postCalculationFlag = data.postCalculationFlag + ''
            data.postMode = data.postMode + ''
            data.isYt = data.isYt + ''
            data.isBill = data.isBill + ''
            // console.log(b.data)
            setCompileData(data)


        }
    }
    //代理费登录公司
    const agencyFeeTableHeader = async () => {
        // 初始化接口-船东口岸 perhaps 网点
        let result = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_INIT, {
            method: "POST"
        })
        if (result.success) {
            // console.log(result.data.companys[0].companyType)
            setBtnIndex(result.data.companys ? result.data.companys[0] ? setBtnIndex(result.data.companys[0].companyType) : null : null);
        } else {
            Toast('', '', '', 5000, false);
        }
    }

    const [compyFlag, setCompyFlag] = useState(false)
    // Local Charge
    const LocalCommonBtn = async (record, index, flagss) => {
        Toast('', '', '', 5000, false);
        setAgencyFeeIsModalVisible(true)
        //编辑接口数据
        // console.log('编辑')
        setDataFlag(false)
        setSpinflag(true)
        setAgencyFeeflag(flagss)
        let copy = await request($apiUrl.LCR_AGMT_SEARCH_PRE_HEAD_DETAIL, {
            method: "POST",
            data: {
                params: record.commissionAgreementCode,
            }
        })
        // if(copy.success){
        //     let data=copy.data
        //     console.log(data)
        //     data.localChargeAgmtItems.map((v,i)=>{
        //         v.saveShowHide=false
        //     })
        //     if(flagss){
        //         setAgencyFeeflag(record.show)
        //         setflags(record.show)//新增item
        //         setTitlePopup(<FormattedMessage id='lbl.edit' />) 
        //         let shipper =company.companyType == 0 ? true : false
        //         setShipperFlag(shipper)
        //         setButtonFlag(false)
        //     }else{
        //         setShipperFlag(true)
        //         setAgencyFeeflag(false)
        //         setflags(false)//新增item
        //         setTitlePopup(<FormattedMessage id='lbl.ViewDetails' />)
        //         setButtonFlag(true)
        //     }
        //     data.id=data.length+1
        //     console.log(protocolStateData.values)
        //     setTabData(data)
        //     console.log(tabData)
        //     setFromDatas(data)
        // } 
        if (copy.success) {
            setCompyFlag(true)
            let data = copy.data
            console.log(data)
            setFromDatas(data)
            setAgencyFeeIsModalVisible(true)
            setSpinflag(false)
            data.localChargeAgmtItems.map((v, i) => {
                v.saveShowHide = false
            })
            data.id = data.length + 1

            if (flagss) {
                if (record.agreementStatus == 'D') {
                    setflags(true)
                    setAgencyFeeflag(true)
                } else {
                    setflags(false)
                    setAgencyFeeflag(false)
                }
                //新增item
                console.log(record)
                setTitlePopup(<FormattedMessage id='lbl.edit' />)
                let shipper = company.companyType == 0 ? true : false
                setShipperFlag(shipper)
                setButtonFlag(false)
            } else {
                setShipperFlag(true)
                setAgencyFeeflag(false)
                setflags(false)//新增item
                setTitlePopup(<FormattedMessage id='lbl.ViewDetails' />)
                setButtonFlag(true)
            }
            setTabData(data)
            Toast('', copy.message, '', 5000, false);
        } else {
            setSpinflag(false)
            Toast('', copy.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 协议组
    const ProtocolGroupColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            // sorter: false,
            width: '120px',
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => deleteTableData(record, index, 'AGMT_GRP_DELETE_HEAD_UUIT')} style={{ color: 'red' }}><CloseCircleOutlined /></a>&nbsp;  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => { commonBtn(record, 2) }}><FormOutlined /></a>&nbsp;  {/* 修改 */}
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { commonBtn(record, 3) }}><FileSearchOutlined /></a>&nbsp; {/* 查看详情 */}
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => { journal(record, 'GRP_AGMT') }}><ReadOutlined /></a>
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.Agreement-text' />,//协议文本
            dataIndex: 'attachmentItems',
            // dataIndex: 'attachmentItems[0].originalFileName',
            key: '',
            width: 120,
            render: (text, record) => {
                return <div>
                    {/* 下载 */}
                    {/* {console.log(text, text ? text.length>0 : undefined)} */}
                    {
                        <CosDownLoad onClick={() => { downFlag ? downEnclosure(text, record) : null }}>
                            {(text ? text.length > 0 : undefined) ? text[0].originalFileName : undefined}
                        </CosDownLoad>
                    }
                    {/* <CosDownLoad auth={'AFCM_AGMT_GRP_001_B05'} onClick={() => { downEnclosure(text, record) }}>
                        {(text ? text.length > 0 : undefined) ? text[0].originalFileName : undefined}
                    </CosDownLoad> */}
                    {/* {text || text.length>0 ? text[0].originalFileName : undefined} */}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.carrier' />,// 船东
            dataType: acquireData.valuse,
            dataIndex: 'shipownerCompanyCode',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.company-code' />,//公司代码
            dataIndex: 'companyCode',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.company-abbreviation' />,//公司简称
            dataIndex: 'commpanyNameAbbr',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.agency' />,//代理编码
            dataIndex: 'agencyCode',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.Son-agency-code' />,// 子代理编码
            dataIndex: 'subAgencyCode',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.start-date' />,//开始日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.over-date' />,//截止日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.Protocol-group-number' />,//协议组编号
            dataIndex: 'groupAgreementCode',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.Protocol-group-status' />,//协议组状态
            dataType: protocolStateData.values,
            dataIndex: 'status',
            key: '',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.Commission-agreement-approval-status' />,//佣金协议审核状态
            children: [
                // {
                //     title: <FormattedMessage id='lbl.Protocol-code'/>,   // 协议头
                //     dataIndex: 'commHeaduuid',
                //     // dataIndex: 'commHeaduuid',commissionAgreementCode
                //     key: 'age',
                //     width: 100,
                //     render:(text,record) => {
                //         return <div>
                //             <a onClick={() => {commissionFun(record, false)}}>{text}</a>&nbsp;
                //         </div>
                //     }
                // },
                {
                    title: <FormattedMessage id='lbl.Protocol-code' />,   // 协议编码
                    dataIndex: 'commissionAgreementCodeInGroup',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            <a onClick={() => { commissionFun(record, false) }}>{text}</a>&nbsp;
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.ProtocolState' />,   // 状态
                    dataIndex: 'statusInGroup',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? protocolStateData.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.pmd' />,    // PMD
                    dataIndex: 'commPmdStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? agreementReview.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.calculation.port' />,   // 口岸
                    dataIndex: 'commAgencyStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? agreementReview.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.fad' />,   // FAD
                    dataIndex: 'commFadStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? agreementReview.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }
            ]
        }, {
            title: <FormattedMessage id='lbl.Agency-fee-audit-status' />,   // 代理费审核状态
            children: [
                {
                    title: <FormattedMessage id='lbl.Protocol-code' />,  // 协议编码
                    dataIndex: 'feeAgreementCode',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            <a onClick={() => { AgencyCommonBtn(record, false) }}>{text}</a>
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.ProtocolState' />,   // 状态
                    dataIndex: 'agreementStatusInGroup',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? protocolStateData.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.pmd' />,   // PMD
                    dataIndex: 'agFeePmdStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? checkStatus.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.calculation.port' />,    // 口岸
                    dataIndex: 'agFeeAgencyStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? checkStatus.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.fad' />,   // FAD
                    dataIndex: 'agFeeFadStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? checkStatus.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }
            ]
        }, {
            title: <FormattedMessage id='lbl.Localcharge-audit-status' />,   // LocalCharge审核状态
            children: [
                {
                    title: <FormattedMessage id='lbl.Protocol-code' />,   // 协议编码
                    dataIndex: 'commissionAgreementCode',
                    key: 'age',
                    width: 100,
                    render: (text, record, index) => {
                        return <div>
                            <a onClick={() => { LocalCommonBtn(record, index, true) }}>{text}</a>&nbsp;
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.ProtocolState' />,   // 状态
                    dataIndex: 'agreementStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? protocolStateData.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.pmd' />,   // PMD
                    dataIndex: 'locPmdStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? agreementReview.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.calculation.port' />,   // 口岸
                    dataIndex: 'locAgencyStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? agreementReview.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }, {
                    title: <FormattedMessage id='lbl.fad' />,  // FAD
                    dataIndex: 'locFadStatus',
                    key: 'age',
                    width: 100,
                    render: (text, record) => {
                        return <div>
                            {text ? agreementReview.values.map((v, i) => {
                                if (text == v.value) return v.label
                            }) : undefined}
                        </div>
                    }
                }
            ]
        }, {
            title: <FormattedMessage id='lbl.update-date' />,   // 更新时间
            // dataType: 'dateTime',
            key: '',
            dataIndex: 'recordUpdateDatetime',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.Update-users' />,   // 更新用户
            key: '',
            dataIndex: 'recordUpdateUser',
            width: 120
        }, {
            title: <FormattedMessage id='lbl.create-date' />,   // 创建时间
            // dataType: 'dateTime', 
            key: '',
            dataIndex: 'recordCreateDatetime',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.create-by' />,   // 创建人
            key: '',
            dataIndex: 'recordCreateUser',
            width: 120
        }
    ]

    const FormOutlinedIcon = <FormOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> // 待处理
    const UnlockOutlinedIcon = <UnlockOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> // 使用中
    const CosIconIcon = <CosIcon type={'icon-dunpai'} style={{ color: '#2795f5', fontSize: '15px' }} />       // 待审核

    // 佣金协议
    const ProtocolGroupDetailColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            // sorter: false,
            width: '120px',
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={() => deleteTableData(record,index,'COMM_AGMT_DELETE_HEAD_UUID')} style={{color:'red'}}><CloseCircleOutlined/></a>&nbsp; */}
                        <a onClick={() => { deleteTableData(record, index, 'COMM_AGMT_DELETE_HEAD_UUID') }} disabled={record.show ? false : true} style={{ color: record.show ? 'red' : '#ccc' }}><CloseCircleOutlined /></a>&nbsp;  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id={record.status == 'D' ? 'btn.edit' : (record.status == 'W' ? 'lbl.audit' : 'lbl.unlock')} />}>
                        <a onClick={() => { commissionFun(record, false) }}>
                            {
                                record ? (record.status == 'D' ? FormOutlinedIcon : (record.status == 'W' ? CosIconIcon : UnlockOutlinedIcon)) : FormOutlinedIcon
                            }
                        </a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { commissionFun(record, true) }}><FileSearchOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => { journal(record, 'COMM_AGMT') }}><ReadOutlined /></a>
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.Protocol-group-code" />,//协议组编码
            dataIndex: 'groupAgreementCode',
            key: '',
            width: 120
            // },{
            //     title: <FormattedMessage id="lbl.Agreement-text"/>,//协议文本
            //     dataIndex: 'status',
            //     key:'',
            //     width:120,
            //     render: (text, record) => {
            // 		return <div>
            // 			{/* 下载 */}
            //             <a><FormattedMessage id='lbl.download'/></a>
            // 		</div>
            // 	}
        }, {
            title: <FormattedMessage id="lbl.agreement" />,//协议代码
            dataIndex: 'commissionAgreementCode',
            align: 'center',
            // sorter: false,
            // sortOrder: false,
            // defaultSortOrder: 'false',
            key: 'COMM_AGMT_CDE',
            width: '120px',
            // render:(text,record, index) => {
            //     return <div>
            //         {/* 查看详情 */}
            //         <a onClick={() => {commissionFun(record, false)}}>{text}</a>
            //     </div>
            // }
        }, {
            title: <FormattedMessage id='lbl.carrier' />,//船东
            dataIndex: 'shipownerCompanyCode',
            align: 'center',
            // sorter: false,
            key: 'SO_COMPANY_CDE',
            width: '120px'
        }, {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            align: 'center',
            // sorter: false,
            key: 'COMPANY_CDE',
            width: '120px'
        }, {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            // sorter: false,
            key: 'AGENCY_CDE',
            width: '120px'
        }, {
            title: <FormattedMessage id="lbl.company-abbreviation" />,//公司简称
            dataIndex: 'commpanyNameAbbr',
            // sorter: false,
            key: 'COMPANY_NME_ABBR',
            width: '120px'
        }, {
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataType: protocolStateData.values,
            dataIndex: 'status',
            align: 'center',
            // sorter: false,
            key: 'STATUS',
            width: '120px',
        }, {
            title: <FormattedMessage id="lbl.effective-start-date" />,//有效开始日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            align: 'center',
            // sorter: false,
            key: 'FM_DTE',
            width: '120px',
        }, {
            title: <FormattedMessage id="lbl.effective-end-date" />,//有效结束日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'center',
            // sorter: false,
            key: 'TO_DTE',
            width: '120px',
        }, {
            title: <FormattedMessage id="lbl.payment" />,//异地支付
            dataIndex: 'payElsewherePercent',
            align: 'center',
            // sorter: false,
            key: 'PAY_ELSEWHERE_PCT',
            width: '120px'
        }, {
            title: <FormattedMessage id="lbl.off-site-commission" />,//第三地付费佣金模式
            dataIndex: 'payElsewhereMode',
            align: 'center',
            // sorter: false,
            key: 'PAY_ELSEWHERE_MDE',
            width: '120px'
        }, {
            title: <FormattedMessage id="lbl.all-rate-OFT" />,//All in Rate的OFT比例
            dataIndex: 'allInRate',
            align: 'center',
            // sorter: false,
            key: 'ALL_IN_RATE',
            width: '130px'
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-04" />,// PMD审核状态
            dataIndex: 'checkPmdStatus',
            align: 'left',
            // sorter: true,
            key: 'CHECK_HQ_STATUS',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.afcm-comm-05" />,// PMD审核人
            dataIndex: 'recordCheckPmdUser',
            align: 'left',
            // sorter: true,
            key: 'REC_CHECK_HQ_USR',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.afcm-comm-06" />,// PMD审核日期
            dataIndex: 'recordCheckPmdDate',
            // dataType: 'dateTime',
            align: 'left',
            // sorter: true,
            key: 'REC_CHECK_HQ_DTE',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.afcm-comm-01" />,// 口岸审核状态
            // dataType: checkStatus,
            dataIndex: 'checkAgencyStatus',
            align: 'left',
            // sorter: true,
            key: 'CHECK_AGENCY_STATUS',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.afcm-comm-02" />,// 口岸审核人
            dataIndex: 'recordCheckAgencyUser',
            align: 'left',
            // sorter: true,
            key: 'REC_CHECK_AGENCY_USR',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.afcm-comm-03" />,// 口岸审核日期
            dataIndex: 'recordCheckAgencyDate',
            // dataType: 'dateTime',
            align: 'left',
            // sorter: true,
            key: 'REC_CHECK_AGENCY_DTE',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.afcm-comm-07" />,// FAD审核状态
            dataIndex: 'checkFadStatus',
            align: 'left',
            // sorter: true,
            key: 'CHECK_FAD_STATUS',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.afcm-comm-08" />,// FAD审核人
            dataIndex: 'recordCheckFadUser',
            align: 'left',
            // sorter: true,
            key: 'REC_CHECK_FAD_USR',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.afcm-comm-09" />,// FAD审核日期
            dataIndex: 'recordCheckFadDate',
            // dataType: 'dateTime',
            align: 'left',
            // sorter: true,
            key: 'REC_CHECK_FAD_DTE',
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.operator" />,//操作人
            dataIndex: 'recordCreateUser',
            align: 'center',
            // sorter: false,
            key: 'REC_UPD_USR',
            width: '120px'
        },
    ]

    // 代理费协议
    const AgencyFeeColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            // sorter: false,
            width: '120px',
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => deleteTableData(record, index, 'AG_FEE_AGMT_DELETE_HEAD_UUID')} disabled={record.agreementStatus == 'D' ? false : true} style={{ color: record.agreementStatus == 'D' ? 'red' : '#ccc' }}><CloseCircleOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={record.agreementStatus == 'D' ? <FormattedMessage id='btn.edit' /> : record.agreementStatus == 'W' ? <FormattedMessage id='lbl.audit' /> : <FormattedMessage id='lbl.unlock' />} style={{ display: 'none' }}>
                        <a onClick={() => AgencyCommonBtn(record, false)}>
                            {record.agreementStatus == 'D' ? <FormOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> : record.agreementStatus == 'U' ? <UnlockOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> : <CosIcon type={'icon-dunpai'} style={{ color: '#2795f5', fontSize: '15px' }} />}
                        </a>
                    </Tooltip>&nbsp;
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => {AgencyCommonBtn(record, false)}}><FormOutlined/></a>&nbsp;
                    </Tooltip> */}
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { AgencyCommonBtn(record, true) }}><FileSearchOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => { journal(record, 'AG_FEE_AGMT') }}><ReadOutlined /></a>
                    </Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号码
            dataIndex: 'feeAgreementCode',
            // sorter: true,
            align: 'left',
            width: 120,
            key: 'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id='lbl.carrier' />,//船东
            dataIndex: 'shipownerCompanyCode',
            align: 'left',
            // sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司代码
            dataIndex: 'companyCode',
            // sorter: true,
            align: 'left',
            width: 120,
            key: 'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'AGENCY_CDE'

        },
        {
            title: <FormattedMessage id="lbl.agent-described" />,//代理描述
            dataIndex: 'agencyDescription',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'AGENCY_CDE'

        },
        {
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataType: protocolStateData.values,
            dataIndex: 'agreementStatus',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'AGMT_STATUS',
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataIndex: 'fromDate',
            dataType: 'dateTime',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataIndex: 'toDate',
            dataType: 'dateTime',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.productbility" />,//是否生产性
            dataType: prdIndicator.values,
            dataIndex: 'prdIndicator',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'PRD_IND',
        },
        {
            title: <FormattedMessage id="lbl.keep-account-arithmetic" />,//记账算法
            dataType: arithmetic.values,
            dataIndex: 'postCalculationFlag',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'POST_CALC_FLAG',
        },
        {
            title: <FormattedMessage id="lbl.keep-account-way" />,//记帐方式 
            dataType: way.values,
            dataIndex: 'postMode',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'POST_MODE',
        },
        {
            title: <FormattedMessage id="lbl.estimate" />,//向谁预估
            dataIndex: 'ygSide',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,//向谁报帐
            dataIndex: 'sfSide',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.actually" />,//应付实付是否记账
            dataType: whether.values,
            dataIndex: 'isBill',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'IS_BILL',
        },
        {
            title: <FormattedMessage id="lbl.withholding" />,//预提是否记账
            dataType: whether.values,
            dataIndex: 'isYt',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'IS_YT',
        },
        {
            title: <FormattedMessage id="lbl.pmd-audit-status" />,//PMD审核状态、口岸审核状态
            dataType: agreementReview.values,
            dataIndex: 'checkHqStatus',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-05" />,//PMD审核人、口岸审核人
            dataIndex: 'recordCheckHqUser',
            // sorter: true,
            width: 150,
            align: 'left',
            key: 'REC_CHECK_HQ_USR'
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-06" />,//PMD审核日期、口岸审核日期
            // dataType: 'dateTime',
            dataIndex: 'recordCheckHqDate',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE'
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-07" />,//FAD审核状态  口岸
            dataType: agreementReview.values,
            dataIndex: 'checkFadStatus',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-08" />,//FAD审核人
            dataIndex: 'recordCheckFadUser',
            // sorter: true,
            width: 150,
            align: 'left',
            key: 'REC_CHECK_HQ_USR',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-09" />,//FAD审核日期
            // dataType: 'dateTime',
            dataIndex: 'recordCheckFadDate',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-01" />,//口岸审核状态   网点审核状态
            dataType: agreementReview.values,
            dataIndex: 'checkAgencyStatus',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-02" />,//口岸审核人  网点审核人
            dataIndex: 'recordCheckAgencyUser',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_CHECK_AGENCY_USR'
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-03" />,//口岸审核日期  网点审核日期
            // dataType: 'dateTime',
            dataIndex: 'recordCheckAgencyDate',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_CHECK_AGENCY_DTE'
        },
        {
            title: <FormattedMessage id='lbl.create-by' />,//创建人
            dataIndex: 'recordCreateUser',
            align: 'left',
            // sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.last-modifier" />,//最后修改人
            dataIndex: 'recordUpdateUser',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_UPD_USR'
        },
        {
            title: <FormattedMessage id="lbl.last-modification-date" />,//最后修改日期
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            // sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_UPD_DTE'
        },
    ]

    // Local Charge协议
    const LocalChargeColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            // sorter: false,
            width: '120px',
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => deleteTableData(record, index, 'LCR_AGMT_DELETE_HEAD_UUID')} disabled={record.agreementStatus == 'D' ? false : true} style={{ color: 'red' }}><CloseCircleOutlined style={{ color: record.agreementStatus == 'D' ? 'red' : '#ccc', fontSize: '15px' }} /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={record.agreementStatus == 'D' ? <FormattedMessage id='btn.edit' /> : record.agreementStatus == 'W' ? <FormattedMessage id='lbl.audit' /> : <FormattedMessage id='lbl.unlock' />} style={{ display: 'none' }}>
                        <a onClick={() => LocalCommonBtn(record, index, true)} >
                            {record.agreementStatus == 'D' ? <FormOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> : record.agreementStatus == 'U' ? <UnlockOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> : <CosIcon type={'icon-dunpai'} style={{ color: '#2795f5', fontSize: '15px' }} />}
                        </a>
                    </Tooltip>&nbsp;
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => {LocalCommonBtn(record, index, true)}}><FormOutlined/></a>&nbsp;
                    </Tooltip> */}
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { LocalCommonBtn(record, index, false) }}><FileSearchOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => { journal(record, 'LCR_AGMT') }}><ReadOutlined /></a>
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.Protocol-group-code" />,//协议组编码
            dataIndex: 'groupAgreementCode',
            key: '',
            width: 120
            // },{
            //     title: <FormattedMessage id="lbl.Agreement-text"/>,// 协议文本
            //     dataIndex: 'status',
            //     key:'',
            //     width:120,
            //     render: (text, record) => {
            // 		return <div>
            // 			{/* 下载 */}
            //             <a><FormattedMessage id='lbl.download'/></a>
            // 		</div>
            // 	}
        },
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号
            dataIndex: 'commissionAgreementCode',
            key: 'COMM_AGMT_CDE',
            // sorter: true,
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.company-code" />,//公司代码
            dataIndex: 'companyCode',
            key: 'COMPANY_CDE',
            // sorter: true,
            align: 'center',
            width: '100px',

        },
        {
            title: <FormattedMessage id="lbl.company-abbreviation" />,//公司简称
            dataIndex: 'commpanyNameAbbr',
            // sorter: true,
            key: 'COMPANY_NME_ABBR',
            width: '120px',
            align: 'center',

        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            // sorter: true,
            key: 'AGENCY_CDE',
            width: '120px',
            align: 'center',

        },
        {
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataIndex: 'agreementStatus',
            // sorter: true,
            key: 'AGMT_STATUS',
            width: '80px',
            align: 'center',
            render: (text, record) => {
                return <div>
                    {text ? protocolStateData.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : '';
                    }) : null}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataIndex: 'fromDate',
            // sorter: true,
            key: 'FM_DTE',
            width: '120px',
            align: 'center',
            render: (text, record) => {
                return <div>
                    {text ? text.substring(0, 10) : null}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataIndex: 'toDate',
            // sorter: true,
            key: 'TO_DTE',
            width: '120px',
            align: 'center',
            render: (text, record) => {
                return <div>
                    {text ? text.substring(0, 10) : null}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.fad-audit-status" />,//FAD审核状态
            dataType: checkStatus.values,
            dataIndex: 'checkFadStatus',
            // sorter: true,
            key: 'CHECK_FAD_STATUS',
            width: 80,
            align: 'left',

        },
        {
            title: <FormattedMessage id="lbl.fad-audit-person" />,//FAD审核人
            dataIndex: 'recordCheckFadUser',
            // sorter: true,
            key: 'REC_CHECK_FAD_USR',
            width: 80,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.fad-verify-date" />,//FAD审核日期
            // dataType: 'dateTime',
            dataIndex: 'recordCheckFadDate',
            // sorter: true,
            key: 'REC_CHECK_FAD_DTE',
            width: 120,
            align: 'left'
        },
        {
            title: <FormattedMessage id="lbl.pmd-audit-status" />,//PMD审核状态、口岸审核状态
            dataType: checkStatus.values,
            dataIndex: 'checkPmdStatus',
            // sorter: true,
            key: 'CHECK_PMD_STATUS',
            width: 80,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-05" />,//PMD审核人、口岸审核人
            dataIndex: 'recordCheckPmdUser',
            // sorter: true,
            key: 'REC_CHECK_PMD_USR',
            width: 80,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-06" />,//PMD审核日期、口岸审核日期
            // dataType: 'dateTime',
            dataIndex: 'recordCheckPmdDate',
            // sorter: true,
            key: 'REC_CHECK_PMD_DTE',
            width: 120,
            align: 'left'
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-01" />,//口岸审核状态   网点审核状态
            dataType: checkStatus.values,
            dataIndex: 'checkAgencyStatus',
            // sorter: true,
            key: 'CHECK_AGENCY_STATUS',
            width: 80,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-02" />,//口岸审核人  网点审核人
            dataIndex: 'recordCheckAgencyUser',
            // sorter: true,
            key: 'REC_CHECK_AGENCY_USR',
            width: 80,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.afcm-comm-03" />,//口岸审核日期  网点审核日期
            // dataType: 'dateTime',
            dataIndex: 'recordCheckAgencyDate',
            // sorter: true,
            key: 'REC_CHECK_AGENCY_DTE',
            width: 120,
            align: 'left'
        },
        {
            title: <FormattedMessage id="lbl.modification-date" />,//修改日期
            dataIndex: 'recordUpdateDatetime',
            // sorter: true,
            key: 'REC_UPD_DT',
            width: '120px',
            align: 'center',
            render: (text, record) => {
                return <div>
                    {text ? text.substring(0, 10) : null}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.modifier" />,//修改人
            dataIndex: 'recordUpdateUser',
            // sorter: true,
            key: 'REC_UPD_USR',
            width: '80px',
            align: 'center',
        }
    ]

    //  查询列表
    const pageChange = async (pagination, options, search, mess) => {
        Toast('', '', '', 5000, false);
        // setProtocolGroupDetailArr([])
        setDefaultKey('1');
        setProtocolGroupDetailTable([]);        // 佣金协议
        setAgencyFeeTable([]);          // 代理费协议
        setLocalChargeTable([]);        // Local Charge协议
        setProtocolGroupTable([]);
        setChecked([]);
        setTabFlag(true);
        setFadFlag(true);
        setSpinflag(true);
        if (search) {
            pagination.current = 1
        }
        let queryData = queryForm.getFieldValue().search;
        let hedqy = queryForm.getFieldValue();
        await request.post($apiUrl.AGMT_GRP_SEARCH_PRE_HEAD_LIST, {
            data: {
                page: pagination,
                params: {
                    ...queryData,
                    Date: undefined,
                    'fromDate': hedqy.Date ? momentFormat(hedqy.Date[0]) : undefined,
                    'toDate': hedqy.Date ? momentFormat(hedqy.Date[1]) : undefined,
                }
            }
        }).then((result) => {
            if (result.success) {
                setUploadPageChange(false);
                setCommMess('');
                setSpinflag(false);
                setGroupKey('');
                let data = result.data.resultList;
                let total = result.data.totalCount;
                // data.map((val, idx)=> {
                //     val['agreementHeadUuid'] = val.commHeaduuid;
                //     val['agHeadUuid'] = val.agFeeHeaduuid;
                //     val['commissionAgreementCode'] = val.locHeaduuid;
                // })
                setPage({ ...pagination });
                setTabTotal(total);
                setProtocolGroupTable(data);
            } else {
                setSpinflag(false);
                mess ? undefined : Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
        })
        mess ? Toast('', mess, 'alert-success', 5000, false) : undefined;

    }

    // 下载
    // const downloadBtn = async() => {
    //     Toast('', '', '', 5000, false);
    //     let queryData = queryForm.getFieldValue().search;
    //     let hedqy = queryForm.getFieldValue();
    //     const result = await request($apiUrl.AGMT_GRP_EXP_PRE_HEAD_LIST,{
    //         method:"POST",
    //         data:{
    //             excelFileName: intl.formatMessage({id: 'menu.afcm.agreement.protocolGroup.maintain'}), //文件名
    //             params: {
    //                 entryCode: 'AFCM_B_AGENCY_CCY',
    //                 paramEntity: {
    //                     params: {
    //                         ...queryData,
    //                         Date: undefined,
    //                         fromDate: hedqy.Date?momentFormat(hedqy.Date[0]) : undefined,
    //                         toDate: hedqy.Date?momentFormat(hedqy.Date[1]) : undefined,
    //                     }
    //                 }
    //             },
    //             sheetList: [{//sheetList列表
    //                 dataCol: {//列表字段
    //                     agreementDescription: intl.formatMessage({id: "lbl.Agreement-text"}),     // 协议文本
    //                     shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),     // 船东
    //                     companyCode: intl.formatMessage({id: "lbl.company-code"}),     // 公司代码
    //                     commpanyNameAbbr: intl.formatMessage({id: "lbl.company-abbreviation"}),     // 公司简称
    //                     agencyCode: intl.formatMessage({id: "lbl.agency"}),     // 代理编码
    //                     fromDate: intl.formatMessage({id: "lbl.start-date"}),    // 开始日期  
    //                     toDate: intl.formatMessage({id: "lbl.closingDate"}),    // 截止日期  
    //                     groupAgreementCode: intl.formatMessage({id: "lbl.Protocol-group-number"}),     // 协议组编号
    //                     status: intl.formatMessage({id: "lbl.Protocol-group-status"}),     // 协议组状态

    //                     // 佣金协议审核状态 Commission-agreement-approval-status
    //                     commHeaduuid: intl.formatMessage({id: "lbl.Protocol-code"}),     // 协议编码
    //                     commPmdStatus: intl.formatMessage({id: "lbl.pmd"}),     // PMD
    //                     commAgencyStatus: intl.formatMessage({id: "lbl.carrier.loc"}),     // 代理
    //                     commFadStatus: intl.formatMessage({id: "lbl.fad"}),     // FAD

    //                     // 代理费审核状态  Agency-fee-audit-status
    //                     agFeeHeaduuid: intl.formatMessage({id: "lbl.Protocol-code"}),     // 协议编码
    //                     agFeePmdStatus: intl.formatMessage({id: "lbl.pmd"}),     // PMD
    //                     agFeeAgencyStatus: intl.formatMessage({id: "lbl.carrier.loc"}),     // 代理
    //                     agFeeFadStatus: intl.formatMessage({id: "lbl.fad"}),     // FAD

    //                     // LocalCharge审核状态  Localcharge-audit-status
    //                     locHeaduuid: intl.formatMessage({id: "lbl.Protocol-code"}),     // 协议编码
    //                     locPmdStatus: intl.formatMessage({id: "lbl.pmd"}),     // PMD
    //                     locAgencyStatus: intl.formatMessage({id: "lbl.carrier.loc"}),     // 代理
    //                     locFadStatus: intl.formatMessage({id: "lbl.fad"}),     // FAD

    //                     recordUpdateDatetime: intl.formatMessage({id: "lbl.update-date"}),  // 更新时间
    //                     recordUpdateUser: intl.formatMessage({id: "lbl.Update-users"}),  // 更新用户
    //                     recordCreateDatetime: intl.formatMessage({id: "lbl.create-date"}),    // 创建时间  
    //                     recordCreateUser: intl.formatMessage({id: "lbl.create-by"}),    // 创建人  
    //                 },
    //                 // sumCol: {//汇总字段
    //                 // },
    //                 sheetName: intl.formatMessage({id: 'menu.afcm.agreement.protocolGroup.maintain'}),//sheet名称
    //             }],
    //         },
    //         // responseType: 'blob',
    //         // headers: {
    //         //     'Content-Type': 'application/json;charset=UTF-8'
    //         // },
    //     })
    //     if(result && result.success == false){  //若无数据，则不下载
    //         Toast('', result.errorMessage, 'alert-error', 5000, false);
    //         return
    //     }else{
    //         let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
    //         if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
    //             navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agreement.protocolGroup.maintain'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
    //         } else {
    //             let downloadElement = document.createElement('a');  //创建元素节点
    //             let href = window.URL.createObjectURL(blob); // 创建下载的链接
    //             downloadElement.href = href;
    //             downloadElement.download = intl.formatMessage({id: 'menu.afcm.agreement.protocolGroup.maintain'}); // 下载后文件名
    //             document.body.appendChild(downloadElement); //添加元素
    //             downloadElement.click(); // 点击下载
    //             document.body.removeChild(downloadElement); // 下载完成移除元素
    //             window.URL.revokeObjectURL(href); // 释放掉blob对象
    //         }
    //     }
    // }

    // 关闭弹窗
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setObjMessage({});
        setProxyCode([]);
        setSubCode(true);
        setIsModalVisibleGroup(false);
    }

    // 上传
    const props = {
        name: 'uploadFile',
        action: `/afcm${$apiUrl.COM_ONE_UPLOADFILE}`,
        headers: {
            authorization: 'authorization-text',
        }
    }

    // 判断是否成功
    const onChange = async (info) => {
        // if (info.file.status !== 'uploading') {
        //   console.log(info.file, info.fileList);
        // }
        // if (info.file.status === 'done') {
        //   console.log(`${info.file.name}成功 file uploaded successfully`);
        // } else if (info.file.status === 'error') {
        //     console.log(`${info.file.name}失败 file upload failed.`);
        // }
        if ((info.file.status == "removed") && (journalFlag == 3 ? false : true)) {
            setObjMessage({})
            const confirmModal = confirm({
                title: formatMessage({ id: 'lbl.delete' }),
                content: formatMessage({ id: 'lbl.delete-ok' }),
                okText: formatMessage({ id: 'lbl.confirm' }),
                okType: 'danger',
                closable: true,
                cancelText: '',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    const result = await request($apiUrl.COM_ONE_DELETEFILE, {
                        method: "POST",
                        data: {
                            uuid: info.file.attItemUuid || deleteFill
                        }
                    })
                    if (result.success) {
                        setFillUuid(undefined);
                        setDeleteFill(undefined);   // 删除fill itemuuid
                        setFileListData(fileList)
                        setObjMessage({ alertStatus: 'alert-success', message: result.message });
                        setSpinflag(false);
                    } else {
                        setSpinflag(false);
                        setObjMessage({ alertStatus: 'alert-error', message: result.message });
                    }
                }
            })
        }
        let fileList = [...info.fileList];
        // console.log('一', fileList);
        // fileList = fileList.slice(-2);
        // console.log('二', fileList);
        // fileList = fileList.map(file => {
        //     if (file.response) {
        //       file.url = file.response.url;
        //     }
        //     return file;
        // });
        // console.log('三', fileList);
        let result = info.file.status === 'done' ? info.fileList[0].response : false;
        if (result.success) {
            setFillUuid(result.data.attHeadUuid)
            setDeleteFill(result.data.items[0].attItemUuid);  // 未报错的uuid
            setFileListData(fileList)
        }
    }

    // 新增保存
    const addProtocolGroupSave = async () => {
        setSpinflag(true);
        setObjMessage({})
        let queryFormData = queryForm.getFieldValue().addProtocolGroup;
        console.log(queryFormData)
        if ((!queryFormData.subAgencyCode && !subCode) || !queryFormData.shipownerCompanyCodes || !queryFormData.companyCode || !queryFormData.agencyCodes || !queryFormData.fromDate || !queryFormData.toDate || !fillUuid || !queryFormData.agreementDescription || !queryFormData.agreementType) {
            setSpinflag(false);
            setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: !queryFormData.subAgencyCode && !subCode ? "lbl.Son-agency-code-no-null" : "lbl.afcm_ind_save" }) });
        } else {
            await request.post($apiUrl.AGMT_GRP_PRE_SAVE_SUBMIT, {
                data: {
                    "operateType": uuid ? 'UPD' : 'SAVE',
                    // requestType:'form',
                    params: {
                        ...queryFormData,
                        uploadFile: undefined,
                        agencyCodes: [queryFormData.agencyCodes],
                        fromDate: queryFormData.fromDate ? momentFormat(queryFormData.fromDate) : undefined,
                        toDate: queryFormData.toDate ? momentFormat(queryFormData.toDate) : undefined,
                        groupAgreementHeadUuid: uuid ? uuid : undefined,
                        agreementType: queryFormData.agreementType || [],
                        // attHeadUuid: fillUuid ? fillUuid : undefined
                        attachUuid: fillUuid ? fillUuid : undefined
                        // attItemUuid: fillUuid ? fillUuid : undefined
                    }
                }
            })
                .then((result) => {
                    if (result.success) {
                        setSpinflag(false);
                        setProxyCode([]);
                        setSubCode(true);
                        setIsModalVisibleGroup(false);
                        pageChange(page, null, 'search', result.message)
                    } else {
                        setSpinflag(false);
                        setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
                    }
                })
        }
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            search: {
                shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                companyCode: defCompany,
            }
        }, [company, acquireData, defCompany])
        setChecked([]);
        setTabFlag(true);
        setFadFlag(true);
        setProtocolGroupTable([]);      // 协议组   
        setProtocolGroupDetailTable([]);        // 佣金协议
        setAgencyFeeTable([]);          // 代理费协议
        setLocalChargeTable([]);        // Local Charge协议
        setPage({    //分页
            current: 1,
            pageSize: 10
        })
    }

    // 新增多选框数据
    const plainOptions = [
        { label: <FormattedMessage id='lbl.Commission-agreement' />, value: 'COMMISSION' },
        { label: <FormattedMessage id='lbl.Agency-fee-agreement' />, value: 'AGENCY_FEE' },
        { label: <FormattedMessage id='lbl.Local-charge-protocol' />, value: 'LOCAL_CHARGE' },
        // {label: <FormattedMessage id='lbl.Demurrage-agreement'/>,value: 'DEMURRAGE'},
    ];

    // 日志
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
        setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }

    // 新建   公司编码 and 代理编码联调
    const selectChangeBtn = async (value, all) => {
        Toast('', '', '', 5000, false);
        setProxyCode([]);
        queryForm.setFieldsValue({
            addProtocolGroup: {
                agencyCodes: undefined,
                subAgencyCode: undefined,
            }
        });
        let data = all.linkage ? all.linkage.companyCode : [];
        console.log(data)
        // await request.post(apiUrl[url] + '?key=' + key)
        await request.post($apiUrl.COMMON_COMPANY_QUERY_COMM + '?companyCode=' + data)
            .then((result) => {
                console.log(result)
                if (result.success) {
                    result.data ? setProxyCode(result.data) : [];
                }
            })
    }

    // 下载附件
    const downEnclosure = async (text, record) => {
        Toast('', '', '', 5000, false);
        // console.log(text)
        //  删除    COM_ONE_DELETEFILE
        // 下载     COM_ONE_DOWNLOADFILE
        setSpinflag(true);
        const result = await request($apiUrl.COM_ONE_DOWNLOADFILE, {
            method: "POST",
            data: {
                uuid: text[0].attItemUuid
            },
            headers: {
                "biz-source-param": "BLG"
            },
            responseType: 'blob',
        })
        if (result && result.success == false) {  //若无数据，则不下载
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            return
        } else {
            let blob = new Blob([result], { type: "application/x-xls" });
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: text[0].originalFileName }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: text[0].originalFileName }); // 下载后文件名
                // downloadElement.download = intl.formatMessage({id: 'menu.afcm.CalFeeQy.comp.bas-hist-info'}) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
            setSpinflag(false);
        }
    }

    // 编辑新增查看详情
    const initData = {
        acquireData: acquireData,
        companysData,
        agreement: agreement.values,
        commission: commission.values,
        pattern: pattern.values,
        paidCommissionModel: paidCommissionModel.values,
        accountsArithmetic: accountsArithmetic.values,
        accountsWay: accountsWay.values,
        ytBusiness: ytBusiness.values,
        yfBusiness: yfBusiness.values,
        officeType: officeType.values,
        toPayInAdvance: toPayInAdvance.values,
        commissionBasedModel: commissionBasedModel.values,
        calcMthd: calcMthd.values,
        socEmptyInd: socEmptyInd.values,
        vatFlag: vatFlag.values,
        currCode: currCode.values,
        isModalVisible,
        setIsModalVisible,
        tableData,
        setTableData,
        commonFlag,
        // dateEnd,
        addFlag,
        setAddFlag,
        writeRead,
        setWriteRead,
        flag,
        setHeaderUuid,
        headerUuid,
        title: txt,
        btnIdx,
        stateFlags,
        setStateFlag,
        // flag ? setStateFlag(false) : setStateFlag(record.show);
        agencyCodeDRF: company,
        setUploadPageChange,    // 调用重新查询
        setCommMess,	// 添加外层提示
    }

    // local
    const LocalInitData = {
        AgencyFeeIsModalVisible,//弹框显示
        tabData,//编辑数据
        toData,//结束时间
        AgencyFeeflag,
        setAgencyFeeIsModalVisible,
        adddatas,
        dataFlag,
        flags,
        setflags,
        setDataFlag,
        setTabData,
        setAddDatas,
        formDatas,//按钮权限
        company,
        buttonFlag,
        setButtonFlag,
        shipperFlag,
        title: titlePopup,
        compyFlag,
        setCompyFlag
    }

    // 代理费
    const addEdit = {
        // toDate,
        AIsModalVisible,
        itemFlag,
        addData,
        airlineFlag,
        setairlineFlag,
        setAddData,
        setItemFlag,
        setAIsModalVisible,
        // setToDate,
        buttonFlag,
        setButtonFlag,
        btnIndex,
        setBtnIndex,
        // //编辑传的数据
        compileData,
        setCompileData,
        // flag,//表格删除保存新增是否禁用
        // setFlag,
        // //查看详情禁用
        detailsFlag,
        setdetailsFlag,
        companysData,
        permissionsButton,
        companyData,//公司默认值
        company,//船东默认值
        acquireData,
        shipperFlag,//船东禁用
        title: titlePopup,
        setShipperFlag,
        groupFlag,
        setGroupFlag
    }

    return (<div className='parent-box'>
        <div className="header-from">
            <Form form={queryForm} name='search'>
                <Row>
                    {/* 船东 */}
                    <Select disabled={company.companyType == 0 ? true : false} span={6} name={['search', 'shipperOwner']} label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                    {/* 公司 */}
                    <Select showSearch={true} span={6} flag={true} name={['search', 'companyCode']} label={<FormattedMessage id='lbl.company' />} options={companysData} />
                    {/* 协议状态 */}
                    <Select span={6} flag={true} name={['search', 'agreementStatus']} label={<FormattedMessage id='lbl.ProtocolState' />} options={protocolStateData.values} />
                    {/* 代理编码 */}
                    {
                        company.companyType == 0 ? <InputText name={['search', 'agencyCode']} label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select flag={true} showSearch={true} name={['search', 'agencyCode']} options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                    }
                    {/* 生效日期 */}
                    <DoubleDatePicker disabled={[false, false]} span={6} name='Date' label={<FormattedMessage id="lbl.effective-date" />} />
                </Row>
            </Form>
            <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
        </div>
        <div className="main-button">
            <div className="button-left">
                {/* 新增 */}
                <CosButton auth="AFCM_AGMT_GRP_001_B01" onClick={() => InitializeAdd()}><FileAddOutlined /><FormattedMessage id='lbl.new-btn' /></CosButton>
                {/* FAD审核 */}
                <CosButton auth="AFCM_AGMT_GRP_001_B02" disabled={fadFlag} onClick={FADExamine}><FileDoneOutlined /><FormattedMessage id='lbl.fad-audit' /></CosButton>
                {/* 下载协议 */}
                {/* <CosButton onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton> */}
                {/* 协议比较下载 */}
                {/* <Button><CloudDownloadOutlined /><FormattedMessage id='lbl.ProtocolComparisonDownload'/></Button> */}
            </div>
            <div className="button-right">
                {/* 重置 */}
                <CosButton onClick={reset}><ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                {/* 查询 */}
                <CosButton onClick={() => pageChange(page, null, 'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
            </div>
        </div>
        <div className="groupBox">
            <Tabs onChange={callback} activeKey={defaultKey} type="card" defaultActiveKey="1">
                {/* 协议组 */}
                <TabPane tab={<FormattedMessage id='lbl.protocolGroup' />} key="1">
                    <div className="table">
                        <PaginationTable
                            dataSource={protocolGroupTable}
                            columns={ProtocolGroupColumns}
                            rowKey='groupAgreementHeadUuid'
                            pageSize={page.pageSize}
                            current={page.current}
                            pageChange={pageChange}
                            scrollHeightMinus={200}
                            total={tabTotal}
                            // setSelectedRows={getSelectedRows}
                            rowSelection={{
                                selectedRowKeys: checked,
                                onChange: (key, row) => {
                                    setChecked(key);
                                    setGroupKey(row[0].groupAgreementHeadUuid)
                                    setSelectedRows(row[0]);
                                    setTabFlag(false);
                                    setFadFlag(false);
                                    commonFun(row[0], true);
                                }
                            }}
                            selectionType='radio'
                        />
                    </div>
                </TabPane>
                {/* 佣金协议 */}
                <TabPane disabled={tabFlag} tab={<FormattedMessage id='lbl.Commission-agreement' />} key="2">
                    <div className="table">
                        <PaginationTable
                            dataSource={protocolGroupDetailTable}
                            columns={ProtocolGroupDetailColumns}
                            rowKey='agreementHeadUuid'
                            pageSize={10}
                            pagination={false}
                            scrollHeightMinus={200}
                            // total={tabTotal}
                            rowSelection={null}
                        />
                    </div>
                </TabPane>
                {/* 代理费协议 */}
                <TabPane disabled={tabFlag} tab={<FormattedMessage id='lbl.Agency-fee-agreement' />} key="3">
                    <div className="table">
                        <PaginationTable
                            dataSource={AgencyFeeTable}
                            columns={AgencyFeeColumns}
                            rowKey='agreementHeadUuid'
                            pageSize={10}
                            pagination={false}
                            scrollHeightMinus={200}
                            // total={tabTotal}
                            rowSelection={null}
                        />
                    </div>
                </TabPane>
                <TabPane disabled={tabFlag} tab={<FormattedMessage id='lbl.Local-charge-protocol' />} key="4">
                    <div className="table">
                        <PaginationTable
                            dataSource={LocalChargeTable}
                            columns={LocalChargeColumns}
                            rowKey='agreementHeadUuid'
                            pageSize={10}
                            pagination={false}
                            scrollHeightMinus={200}
                            // total={tabTotal}
                            rowSelection={null}
                        />
                    </div>
                </TabPane>
                {/* <TabPane disabled={true} tab={<FormattedMessage id='lbl.Demurrage-agreement' />} key="5">
                    <div className="table">
                        <PaginationTable
                            dataSource={protocolGroupDetailTable}
                            columns={ProtocolGroupDetailColumns}
                            rowKey='agreementHeadUuid'
                            pageSize={10}
                            scrollHeightMinus={200}
                            // total={tabTotal}
                            rowSelection={null}
                        />
                    </div>
                </TabPane> */}
            </Tabs>
        </div>
        <CosModal cbsWidth={550} cbsVisible={isModalVisibleGroup} cbsTitle={titlePopup} cbsFun={() => handleCancel()}>
            <CosToast toast={objMessage} />
            <div style={{ minWidth: '450px' }}>
                <Form form={queryForm} name='add' id="add_comm_fee">
                    <Row>
                        <Col span={24}>
                            {/* 船东 */}
                            <Select disabled={company.companyType == 0 ? true : false} span={24} name={['addProtocolGroup', 'shipownerCompanyCodes']} label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} formlayouts={formlayout1} isSpan={true} required />
                            {/* <Select disabled={journalFlag == 1 ? false : true} span={24} name={['addProtocolGroup','shipownerCompanyCodes']} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} formlayouts={formlayout1} isSpan={true}/> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            {/* 公司编码 */}
                            <Select showSearch={true} disabled={journalFlag == 1 ? false : true} span={24} name={['addProtocolGroup', 'companyCode']} label={<FormattedMessage id='lbl.companyCode' />} options={companysData} formlayouts={formlayout1} selectChange={selectChangeBtn} isSpan={true} required />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            {/* 代理编码 */}
                            <Select disabled={journalFlag == 1 ? false : true} span={24} name={['addProtocolGroup', 'agencyCodes']} label={<FormattedMessage id='lbl.agency' />} options={proxyCode} formlayouts={formlayout1} isSpan={true} required />
                            {/* <Select disabled={journalFlag == 3 ? true : false} mode="multiple" span={24} name={['addProtocolGroup','agencyCodes']} label={<FormattedMessage id='lbl.agency'/>} options={proxyCode} formlayouts={formlayout1}/> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            {/* 子代理编码 */}
                            <Select placeholder={<FormattedMessage id='lbl.afcm_comm_fee' />} disabled={(journalFlag == 1 ? false : true) || subCode} span={24} name={['addProtocolGroup', 'subAgencyCode']} label={<FormattedMessage id='lbl.Son-agency-code' />} options={proxyCode} formlayouts={formlayout1} isSpan={true} required />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            {/* 开始日期 */}
                            <DatePicker disabled={journalFlag == 3 || journalFlag == 2 ? true : false} span={24} name={['addProtocolGroup', 'fromDate']} label={<FormattedMessage id='lbl.start-date' />} formlayouts={formlayout1} isSpan={true} required />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            {/* 截止日期 */}
                            <DatePicker disabled={true} span={24} name={['addProtocolGroup', 'toDate']} label={<FormattedMessage id='lbl.closingDate' />} formlayouts={formlayout3} isSpan={true} required />
                        </Col>
                        <Col span={14}>
                            <div style={{ lineHeight: '26px', marginLeft: '10px' }}><FormattedMessage id="lbl.TipsMess" /></div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            {/* 协议文本 */}
                            <Form.Item
                                {...formlayout1}
                                name={['addProtocolGroup', 'uploadFile']}
                                label={<FormattedMessage id='lbl.Agreement-text' />}
                                required
                            // valuePropName="fileList"
                            // getValueFromEvent={normFile}
                            >
                                <Upload
                                    maxCount={1}
                                    {...props}
                                    onChange={onChange}
                                    fileList={fileListData}>
                                    <Button disabled={journalFlag == 3 ? true : false} icon={<UploadOutlined />}><FormattedMessage id='btn.add-attachment' /></Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            {/* 协议文本描述 */}
                            <InputArea disabled={journalFlag == 3 ? true : false} span={24} name={['addProtocolGroup', 'agreementDescription']} label={<FormattedMessage id='lbl.textDescription' />} formlayouts={formlayout1} isSpan={true} rows={8} required />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            {/* 选择协议  ==1?false:true*/}
                            <CheckboxSelect disabled={journalFlag == 1 ? false : true} span={24} flag={true} options={plainOptions} onChange={onChange} setCheckedAee={setCheckedAee} name={['addProtocolGroup', 'agreementType']} label={<FormattedMessage id='lbl.selectCheckbox' />} formlayouts={formlayout2} isSpan={true} required />
                        </Col>
                    </Row>
                </Form>
            </div>
            <div style={{ textAlign: 'center', minWidth: '450px' }}>
                <CosButton disabled={journalFlag == 3 ? true : false} onClick={() => addProtocolGroupSave()} style={{ marginRight: '10px' }}><SaveOutlined /><FormattedMessage id='lbl.save' /></CosButton>
                <CosButton onClick={() => handleCancel()}><CloseOutlined /><FormattedMessage id='lbl.cancel' /></CosButton>
            </div>
        </CosModal>
        {/* <Modal id='modal-drag' className='modal-drag' title={titlePopup} visible={isModalVisibleGroup} footer={null} width={550} onCancel={() => handleCancel()} maskClosable={false}>
            
            <div className='drag-move'></div>
        </Modal> */}
        <LogPopUp logData={logData} />
        <CommissionAgmtEdit initData={initData} />
        <AddModifcation LocalInitData={LocalInitData} />
        <AgencyFeeAgmtEdit addEdit={addEdit} />
        <Loading spinning={spinflag} />
    </div>)
}
export default ProtocolGroupPage