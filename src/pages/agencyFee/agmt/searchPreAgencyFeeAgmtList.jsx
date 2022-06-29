import React, { useEffect, useState, $apiUrl } from 'react'
import { FormattedMessage, formatMessage } from 'umi'
import request from '@/utils/request';
import { momentFormat, acquireSelectDataExtend, acquireSelectData, agencyCodeData, dictionary, companyAgency, TimesFun } from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText';
import Select from '@/components/Common/Select';
import { Button, Form, Row, Modal, Tooltip, Alert } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import AgencyFeeAgmtEdit from "./agencyFeeAgmtEdit"
import LocalChargeCopy from './agencyFeeAgmtDetail'
import LogPopUp from '../../commissions/agmt/LogPopUp'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import CosRedio from '@/components/Common/CosRedio'
import CosIcon from '@/components/Common/CosIcon'
// import { createFromIconfontCN } from '@ant-design/icons';
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
    FileProtectOutlined,
    InfoCircleOutlined,
    UnlockOutlined
} from '@ant-design/icons'
// const MyIcon = createFromIconfontCN({
//     scriptUrl: '//at.alicdn.com/t/font_2485864_5tfm1sixbgf.js', // 在 iconfont.cn 上生成
//   });
const confirm = Modal.confirm
let formlayouts = {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const AgencyFee = () => {
    const [agencyCode, setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [agreement, setAgreementType] = useState([]);  // 
    const [tabTotal, setTabTotal] = useState([]);//表格数据的个数
    const [tableData, setTableData] = useState([]);//表格的数据
    const [AIsModalVisible, setAIsModalVisible] = useState(false);//新增编辑弹框开关 
    const [isModalVisiblecopy, setIsModalVisibleCopy] = useState(false)//复制弹框开关
    const [toDate, setToDate] = useState([]);//结束时间
    const [itemFlag, setItemFlag] = useState(false);//弹框item是否禁用  
    const [airlineFlag, setairlineFlag] = useState(false)//航线组新增按钮是否禁用
    const [addData, setAddData] = useState([]);//新增初始化数据
    const [compileData, setCompileData] = useState([]);//编辑数据
    const [detailsFlag, setdetailsFlag] = useState(true);//查看详情禁用
    const [copydata, setCopydata] = useState({})//复制的数据
    const [submitdata, setSubmitdata] = useState()//提交审核的数据
    const [copyShow, setCopyShow] = useState(false)//复制
    const [copyflag, setCopyFlag] = useState(true)//复制按钮是否可用
    const [flag, setFlag] = useState(false)//表格删除保存新增是否禁用
    const [buttonFlag, setButtonFlag] = useState(false)//新增、编辑、查看详情的弹框按钮是否禁用
    const [lastConditions, setLastConditions] = useState({});
    const [btnIndex, setBtnIndex] = useState('')
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [prdIndicator, setProduction] = useState({})//是否生产性
    const [way, setWay] = useState({})//记账方式
    const [arithmetic, seArithmetic] = useState({})//记账算法    
    const [whether, setWhether] = useState({})//通用的是否
    const [agreementReview, setAgreementReview] = useState({})//协议审核
    const [spinflag, setSpinflag] = useState(false)
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [title, setTitle] = useState('');
    const [permissionsButton, setPermissionsButton] = useState([])//按钮权限数据
    const [groupFlag, setGroupFlag] = useState(false);	// 仅供编辑group信息箱型尺寸组编辑修改尺寸组用
    const [uuid, setUuid] = useState('')
    const [uuidData, setUuidData] = useState([])
    const [shipperFlag, setShipperFlag] = useState(false)//船东禁用
    const [unlockAuditFlag, setUnlockAuditFlag] = useState(false)
    const [compyFlag, setCompyFlag] = useState(true)//公司禁用
    const [valuesAgreement, setValuesAgreement] = useState(true)
    const [kouanFlag, setKouanFlag] = useState(true)
    const [wdFlag, setwdFlag] = useState(true)
    const [valueAgreement, setValueAgreement] = useState()
    const titTooltip = <span style={{ color: '#000' }}><FormattedMessage id='lbl.messT' /></span>
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    useEffect(() => {
        agencyCodeData($apiUrl, setAgreementType, setCompany)//代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectData('COMM.SOC.EMPTY.IND', setProduction, $apiUrl);//是否生产性
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE', setWay, $apiUrl);//记账方式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG', seArithmetic, $apiUrl);//记账算法
        acquireSelectData('AFCM.AGMT.YF.BUSINESS', setWhether, $apiUrl);//应付实付是否记账
        acquireSelectData('AFCM.AGMT.CHECK.STATUS', setAgreementReview, $apiUrl);//协议审核
        companys()// 公司
        agencyFeeTableHeader()
    }, [])

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [companyData, setCompanyData] = useState('')
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            companyCode: companyData,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        })
        // companyData?alert(1):''
        // companyData?companyAgency($apiUrl,companyData,setAgencyCode):null
        if (companyData) {
            companyAgency($apiUrl, companyData, setAgencyCode)
        }
    }, [company, acquireData, companyData])
    useEffect(() => {
        unlockAuditFlag ? pageChange(page, '', 'search') : null
    }, [unlockAuditFlag])

    const [queryForm] = Form.useForm();
    const handleQuery = () => {

    }

    //公司和代理编码的联动
    const companyIncident = async (value, all) => {
        // console.log(all.linkage)
        if (all.linkage) {
            // queryForm.setFieldsValue({
            //     agencyCode:all.linkage.sapCustomerCode,
            //     subAgencyCode:all.linkage.sapCustomerCode,
            // })
            let data = all.linkage.companyCode
            // alert(2)
            data ? companyAgency($apiUrl, data, setAgencyCode) : null
        }

    }

    const agencyFeeTableHeader = async () => {
        // 初始化接口-船东口岸 perhaps 网点
        let result = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_INIT, {
            method: "POST"
        })
        if (result.success) {
            result.data.companys ? result.data.companys[0] ? setBtnIndex(result.data.companys[0].companyType) : null : null
        } else {
            Toast('', '', '', 5000, false);
        }
    }


    //公司
    const companys = async () => {
        await request.post($apiUrl.AG_FEE_AGMT_SEARCH_INIT)
            .then((resul) => {
                if (!resul.data) return
                var data = resul.data.companys;
                data.map((val, idx) => {
                    val['value'] = val.companyCode;
                    val['label'] = val.companyCode + '-' + val.companyNameCn;

                })
                setCompanysData(data);
            })

        let company = await request($apiUrl.CURRENTUSER, {
            method: "POST",
            data: {}
        })
        // console.log(company)
        if (company.success) {
            setCompanyData(company.data.companyCode)
            if (company.data.companyType == 0 || company.data.companyType == 1) {
                if (company.data.companyType == 0) {
                    setwdFlag(true)
                } else {
                    setwdFlag(false)
                }
                setValuesAgreement(true)
                setKouanFlag(false)
                queryForm.setFieldsValue({
                    'agreementType': 1
                })
                setValueAgreement(1)
            } else {
                setwdFlag(false)
                setKouanFlag(true)
                setValuesAgreement(false)
                queryForm.setFieldsValue({
                    'agreementType': 2
                })
                setValueAgreement(2)
            }
        }
    }

    //新增
    const addBtn = async () => {
        Toast('', '', '', 5000, false)
        setAIsModalVisible(true)
        setTitle(<FormattedMessage id='btn.add' />);
        const adddatas = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_INIT, {
            method: 'POST',
            data: {}
        })
        if (adddatas.success) {
            let data = adddatas.data
            setAddData(data)
            setToDate(data.toDate)
            setCompyFlag(true)
            let shipper = company.companyType == 0 ? true : false
            setShipperFlag(shipper)
            setItemFlag(false)
            setairlineFlag(false)
            setdetailsFlag(true)
            setFlag(false)
            setButtonFlag(false)
            setGroupFlag(false)
            setPermissionsButton(data)
        }

    }

    //复制弹框传的参数
    const copydatas = {
        isModalVisiblecopy,//控制弹框开关
        companysData,//公司数据
        copydata,//复制的数据
        page,//表格分页显示数据
        lastConditions,//初始化表单数据
        copyShow,//复制按钮是否禁用
        setTableData,
        setTabTotal,
        setIsModalVisibleCopy,
        setCopydata,
        setCopyShow,
        copyUrl: 'COMM_AGMT_AGMT_COPY_SAVE',
        setUnlockAuditFlag,
        copyflag,
        setCopyFlag
    }

    //复制
    const copyBtn = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisibleCopy(true)
        // console.log(copydata)
        tableData.map((v, i) => {
            //    console.log(v.checkStatus) 
        })

    }

    const [downlodFlag, setDownlodFlag] = useState(false)
    const setSelectedRows = (val) => {
        setUuidData([])
        // console.log('val',val)
        if (val.length > 0) {
            val.map((v, i) => {
                setUuid(v.agreementHeadUuid)//下载要的数据
                v.agreementStatus == 'D' ? setCopyShow(true) : setCopyShow(false)
            })
            val.length == 1 ? setDownlodFlag(true) : setDownlodFlag(false)
            if (val.length == 2) {//比较要的数据
                val.map((v, i) => {
                    setUuid(v.agreementHeadUuid)
                    uuidData.push(v.agreementHeadUuid)
                })
                setUuidData([...uuidData])
            } else {
                setUuidData([])
            }
            if (val.length == 1) {//复制是否禁用
                if (val.length > 0 && val[0].agreementStatus == 'U' && val[0].toDate == '9999-12-31') {
                    setCopyFlag(false)
                } else {
                    setCopyFlag(true)
                }
            } else {
                setCopyFlag(true)
            }

        } else {
            setUuid([])
            setCopyFlag(true)
            setCopyShow(false)
            setDownlodFlag(false)
        }

        setCopydata(val)
        setSubmitdata(val)
        setLastConditions(queryForm.getFieldValue())
    }

    // 日志
    const journal = async (record) => {
        setIsModalVisibleLog(true);
        const result = await request($apiUrl.LOG_SEARCH_PRE_LIST,
            {
                method: 'POST',
                data: {
                    params: {
                        referenceType: "AG_FEE_AGMT",
                        referenceUuid: record.agreementHeadUuid
                    }

                }
            }
        )
        if (result.success) {
            setJournalData(result.data)
        }
    }


    //表格数据  DESC降序  ASC升序
    const pageChange = async (pagination, options, search, mes) => {
        Toast('', '', '', 5000, false);
        setDownlodFlag(false)
        const query = queryForm.getFieldsValue()
        // console.log(query)
        setSpinflag(true)
        setChecked([])
        setUuidData([])
        if (search) {
            pagination.current = 1
        }
        let sorter
        if (!options) {
        } else {
            if (options && options.sorter.order) {
                // console.log(options.sorter.order)
                sorter = {
                    "field": options.sorter.columnKey,
                    "order": options.sorter.order === "ascend" ? 'ASC' : options.sorter.order === "descend" ? 'DESC' : undefined
                }
            }
        }
        valueAgreement == 1 ? setValuesAgreement(true) : valueAgreement == 2 ? setValuesAgreement(false) : ''
        let localsearch = await request($apiUrl.AG_FEE_AGMT_SEARCH_PRE_HEAD_LIST, {
            method: 'POST',
            data: {
                "page": pagination,
                "params": {
                    "shipperOwner": query.shipperOwner,
                    "agencyCode": query.agencyCode,
                    "agreementStatus": query.agreementStatus,
                    "agreementCode": query.agreementCode,
                    Date: undefined,
                    'fromDate': query.Date ? momentFormat(query.Date[0]) : null,
                    'toDate': query.Date ? momentFormat(query.Date[1]) : null,
                    "companyCode": query.companyCode,
                    'agreementType': valueAgreement == 1 ? 'KA' : valueAgreement == 2 ? 'WD' : ''
                },
                'sorter': sorter
            }
        })
        if (localsearch.success) {
            setSpinflag(false)
            setUnlockAuditFlag(false)
            let data = localsearch.data
            let datas = localsearch.data.resultList
            let replicadatas = Object.assign([], datas)
            for (let i = 0; i < replicadatas.length; i++) {
                datas[i]['id'] = i
            }
            if (pagination.pageSize != page.pageSize) {
                pagination.current = 1
            }
            setPage({ ...pagination })
            datas ? setTableData([...datas]) : null
            dictionary(datas, setTableData, protocolStateData.values)
            setTabTotal(data.totalCount)
            setCopyShow(false)
            mes ? Toast('', mes, '', 5000, false) : null
        } else {
            setTableData([])
            setSpinflag(false)
            setUnlockAuditFlag(false)
            mes ? Toast('', mes, '', 5000, false) : Toast('', localsearch.errorMessage, 'alert-error', 5000, false)
        }
    }

    //提交审核
    const submitBtn = async () => {
        Toast('', '', '', 5000, false);
        let save = await request($apiUrl.AG_FEE_AGMT_PRE_SAVE_SUBMIT, {
            method: "POST",
            data: {
                'paramsList': submitdata,
                'operateType': 'SUBMIT'
            }
        })
        if (save.message) {
            // setUnlockAuditFlag(true)
            pageChange(page, '', 'search', save.message)
            // Toast('',save.message, 'alert-success', 5000, false)
        } else {
            Toast('', save.errorMessage, 'alert-error', 5000, false)
        }
    }

    //新增,编辑,查看详情父传子数据
    const addEdit = {
        //新增传的数据
        toDate,//结束日期
        AIsModalVisible,//弹框开关
        itemFlag,//弹框item是否禁用
        addData,//新增数据
        airlineFlag,//航线组新增按钮是否禁用
        setairlineFlag,//航线组新增按钮是否禁用
        setAddData,//新增数据
        setItemFlag,
        setAIsModalVisible,
        buttonFlag,//新增、编辑、查看详情的弹框按钮是否禁用
        setButtonFlag,//新增、编辑、查看详情的弹框按钮是否禁用
        companysData,
        //编辑传的数据
        compileData,
        setCompileData,
        flag,//表格删除保存新增是否禁用
        detailsFlag,//查看详情禁用
        title,
        permissionsButton,
        groupFlag,
        setGroupFlag,
        companyData,//公司默认值
        company,//船东默认值
        acquireData,
        shipperFlag,//船东禁用
        setUnlockAuditFlag,
        setShipperFlag,
        compyFlag,
        setCompyFlag
    }

    //编辑
    const addcopy = async (record, index, flag) => {
        //编辑是false,查看详情true
        Toast('', '', '', 5000, false)
        setButtonFlag(flag)
        setSpinflag(true)
        setCompyFlag(false)
        let copyData = await request($apiUrl.AG_FEE_AGMT_PRE_HEAD_DETAIL, {
            method: "POST",
            data: {
                'uuid': record.agreementHeadUuid,
                'operateType': record.agreementStatus == 'U' && !flag ? "UNLOCK" : ''
            }
        })
        if (copyData.success) {
            let data = copyData.data
            setSpinflag(false)
            setAIsModalVisible(true)
            setFlag(flag)
            setPermissionsButton(data)
            if (!flag) {
                setItemFlag(record.show)
                setairlineFlag(record.show)
                setGroupFlag(true)
                setShipperFlag(true)
                setdetailsFlag(true)
            } else {
                setItemFlag(false)
                setairlineFlag(false)
                setGroupFlag(false)
                setShipperFlag(true)
                setdetailsFlag(false)
            }
            data.prdIndicator = data.prdIndicator + ''
            data.postCalculationFlag = data.postCalculationFlag + ''
            data.postMode = data.postMode + ''
            data.isYt = data.isYt + ''
            data.isBill = data.isBill + ''
            setCompileData(data)
            flag ? setTitle(<FormattedMessage id='lbl.ViewDetails' />) : setTitle(<FormattedMessage id='btn.edit' />);
        } else {
            setSpinflag(false)
            Toast('', copyData.errorMessage, 'alert-error', 5000, false)
        }

    }
    //删除
    const deleteTable = (record) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            content: formatMessage({ id: 'lbl.Confirm-deletion' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                let cancel = await request($apiUrl.AG_FEE_AGMT_DELETE_HEAD_UUID, {
                    method: "POST",
                    data: {
                        "uuid": record.agreementHeadUuid
                    }
                })
                if (cancel.success) {
                    pageChange(page, '', 'search', cancel.message)
                } else {
                    Toast('', cancel.errorMessage, 'alert-error', 5000, false);
                }
            }
        })
    }

    //表格文本
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}> <a> <CosButton auth='AFCM_AGMT_AG_001_B04' onClick={() => deleteTable(record)} disabled={record.show ? false : true}><CloseCircleOutlined style={{ color: record.show ? 'red' : '#ccc', fontSize: '15px' }} /> </CosButton></a></Tooltip>
                    {/* 编辑  style={{visibility: 'hidden'}}  auth='AFCM_AGMT_AG_001_B05'*/}
                    <Tooltip  title={record.agreementStatus == 'D' ? <FormattedMessage id='btn.edit' /> : record.agreementStatus == 'W' ? <FormattedMessage id='lbl.audit' /> : <FormattedMessage id='lbl.unlock' />} style={{ display: 'none' }}>
                        <a>
                            <CosButton onClick={() => addcopy(record, index, false)}   >
                                {record.agreementStatus == 'D' ? <FormOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> : record.agreementStatus == 'U' ? <UnlockOutlined style={{ color: '#2795f5', fontSize: '15px' }} /> : <CosIcon type={'icon-dunpai'} style={{ color: '#2795f5', fontSize: '15px' }} />}
                            </CosButton>
                        </a>
                    </Tooltip>
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a><CosButton onClick={() => addcopy(record, index, true)}><FileSearchOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></CosButton></a></Tooltip>
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}><a><CosButton onClick={() => { journal(record) }}><ReadOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></CosButton></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号码
            dataIndex: 'feeAgreementCode',
            sorter: true,
            align: 'left',
            width: 120,
            key: 'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id='lbl.carrier' />,//船东
            dataIndex: 'shipownerCompanyCode',
            align: 'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 50,


        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司代码
            dataIndex: 'companyCode',
            sorter: true,
            align: 'left',
            width: 50,
            key: 'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'AGENCY_CDE'

        },
        {
            title: <FormattedMessage id="lbl.agent-described" />,//代理描述
            dataIndex: 'agencyDescription',
            sorter: true,
            width: 120,
            align: 'left',
            key: 'AGENCY_DESC'

        },
        {
            title: <FormattedMessage id="lbl.Son-agency-code" />,//子代理编码
            dataIndex: 'subAgencyCode',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'AGENCY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataType: protocolStateData.values,
            dataIndex: 'agreementStatus',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'AGMT_STATUS',
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataIndex: 'fromDate',
            dataType: 'dateTime',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataIndex: 'toDate',
            dataType: 'dateTime',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.productbility" />,//是否生产性
            dataType: prdIndicator.values,
            dataIndex: 'prdIndicator',
            sorter: true,
            width: 100,
            align: 'left',
            key: 'PRD_IND',

        },
        {
            title: <FormattedMessage id="lbl.keep-account-arithmetic" />,//记账算法
            dataType: arithmetic.values,
            dataIndex: 'postCalculationFlag',
            sorter: true,
            width: 100,
            align: 'left',
            key: 'POST_CALC_FLAG',
        },
        {
            title: <FormattedMessage id="lbl.keep-account-way" />,//记帐方式 
            dataType: way.values,
            dataIndex: 'postMode',
            sorter: true,
            width: 100,
            align: 'left',
            key: 'POST_MODE',
        },
        {
            title: <FormattedMessage id="lbl.estimate" />,//向谁预估
            dataIndex: 'ygSide',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,//向谁报帐
            dataIndex: 'sfSide',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.actually" />,//应付实付是否记账
            dataType: whether.values,
            dataIndex: 'isBill',
            sorter: true,
            width: 120,
            align: 'left',
            key: 'IS_BILL',
        },
        {
            title: <FormattedMessage id="lbl.withholding" />,//预提是否记账
            dataType: whether.values,
            dataIndex: 'isYt',
            sorter: true,
            width: 80,
            align: 'left',
            key: 'IS_YT',
            // onCell: () => ({
            //     style: {
            //         whiteSpace: 'nowrap',
            //         maxWidth: 200,
            //     }
            // })
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.pmd-audit-status" /> : <FormattedMessage id="lbl.afcm-comm-01" />,//PMD审核状态、口岸审核状态
            dataType: agreementReview.values,
            dataIndex: 'checkHqStatus',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE',
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.afcm-comm-05" /> : <FormattedMessage id="lbl.afcm-comm-02" />,//PMD审核人、口岸审核人
            dataIndex: 'recordCheckHqUser',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_HQ_USR'
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.afcm-comm-06" /> : <FormattedMessage id="lbl.afcm-comm-03" />,//PMD审核日期、口岸审核日期
            dataIndex: 'recordCheckHqDate',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE'
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.afcm-comm-07" /> : <FormattedMessage id="lbl.afcm-00100" />,//FAD审核状态  口岸
            dataType: agreementReview.values,
            dataIndex: 'checkFadStatus',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE',
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.afcm-comm-08" /> : <FormattedMessage id="lbl.afcm-00101" />,//FAD审核人
            dataIndex: 'recordCheckFadUser',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_HQ_USR',
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.afcm-comm-09" /> : <FormattedMessage id="lbl.afcm-00102" />,//FAD审核日期
            dataIndex: 'recordCheckFadDate',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE',
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.afcm-comm-01" /> : <FormattedMessage id="lbl.branch-audit-state" />,//口岸审核状态   网点审核状态
            dataType: agreementReview.values,
            dataIndex: 'checkAgencyStatus',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_HQ_DTE',
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.afcm-comm-02" /> : <FormattedMessage id="lbl.branch-audit-person" />,//口岸审核人  网点审核人
            dataIndex: 'recordCheckAgencyUser',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_AGENCY_USR'
        },
        {
            title: valuesAgreement ? <FormattedMessage id="lbl.afcm-comm-03" /> : <FormattedMessage id="lbl.branch-audit-date" />,//口岸审核日期  网点审核日期
            dataIndex: 'recordCheckAgencyDate',
            sorter: true,
            width: 90,
            align: 'left',
            key: 'REC_CHECK_AGENCY_DTE'
        },
        {
            title: <FormattedMessage id='lbl.Protocol-group-number' />,//协议组编号
            dataIndex: 'groupAgreementCode',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.create-by' />,//创建人
            dataIndex: 'recordCreateUser',
            align: 'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 100
        },
        {
            title: <FormattedMessage id="lbl.create-date" />,//创建日期
            // dataType: 'dateTime',
            dataIndex: 'recordCreateDate',
            sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_UPD_DTE'
        },
        {
            title: <FormattedMessage id="lbl.last-modifier" />,//最后修改人
            dataIndex: 'recordUpdateUser',
            sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_UPD_USR'
        },
        {
            title: <FormattedMessage id="lbl.last-modification-date" />,//最后修改日期
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            sorter: true,
            width: 120,
            align: 'left',
            key: 'REC_UPD_DTE'
        },
    ]

    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
        setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }

    //下载
    const downlod = async () => {
        Toast('', '', '', 5000, false)
        if (copydata.length == 1) {
            setSpinflag(true)
            let downData = await request($apiUrl.AG_FEE_AGMT_EXP_PRE_HEAD_DWTAIL, {
                method: "POST",
                data: {
                    'uuid': uuid,
                    // 'uuid':'11111111111111',
                    'excelFileName': formatMessage({ id: 'menu.afcm.agreement.agency.agencyFee' }),
                    sheetList: [
                        {//Head头
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                companyCode: formatMessage({ id: "lbl.company" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                agencyDescription: formatMessage({ id: "lbl.agent-described" }),
                                feeAgreementCode: formatMessage({ id: "lbl.agreement" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),
                                prdIndicator: formatMessage({ id: "lbl.productbility" }),
                                postCalculationFlag: formatMessage({ id: "lbl.arithmetic" }),
                                postMode: formatMessage({ id: "lbl.bookkeeping" }),
                                ygSide: formatMessage({ id: "lbl.estimate" }),
                                yfSide: formatMessage({ id: "lbl.make" }),
                                sfSide: formatMessage({ id: "lbl.submitanexpenseaccount" }),
                                isYt: formatMessage({ id: "lbl.withholding" }),
                                isBill: formatMessage({ id: "lbl.actually" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0033' }),//head头
                        },
                        {//item列表
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),

                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),
                                feeClass: formatMessage({ id: "lbl.Big-class-fee" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                compareIndicator: formatMessage({ id: "lbl.Whether-to-vote-for-an-election" }),
                                compareCalculationMethod: formatMessage({ id: "lbl.Choose-a-large-calculation-method" }),
                                tsIndicator: formatMessage({ id: "lbl.Is-it-a-special-rate" }),
                                modifyFlag: formatMessage({ id: "lbl.Whether-or-not-tiered-rates" }),
                                vatFlag: formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0034' }),//代理费协议item
                        },
                        {//CALL/CALL2/MCALL/VOY/VOY2
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                callNumber: formatMessage({ id: "lbl.Port-number" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.CALL-particulars' }) + '-' + formatMessage({ id: 'lbl.CALL2-particulars' }) + '-' + formatMessage({ id: 'lbl.MCALL-particulars' }) + '-' + formatMessage({ id: 'lbl.VOY-particulars' }) + '-' + formatMessage({ id: 'lbl.VOY2-particulars' }),//代理费计算方法明细
                        },
                        {//箱量计算法表格文本
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                emptyFullIndicator: formatMessage({ id: "lbl.empty-container-mark" }),
                                transmitIndicator: formatMessage({ id: "lbl.lnward-outward-transit" }),
                                containerSizeTypeGroup: formatMessage({ id: "lbl.Box-size-group" }),
                                socIndicator: formatMessage({ id: "lbl.empty-box-mark" }),
                                cargoProperty: formatMessage({ id: "lbl.Domestic-trade-foreign-trade" }),
                                unitPrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                unitPriceType: formatMessage({ id: "lbl.price-type" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.CNT1-particulars' }) + '-' + formatMessage({ id: 'lbl.CNT2-particulars' }),//代理费计算方法明细
                        },
                        {//时间(DATE)计算方法
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                calculationPeriod: formatMessage({ id: "lbl.Date-of-the-period" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.DATE-particulars' }),//代理费计算方法明细
                        },
                        {//北美箱量累进(AGG)
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                groupCode: formatMessage({ id: "lbl.Group-number" }),
                                startTeu: formatMessage({ id: "lbl.volume-point" }),
                                endTeu: formatMessage({ id: "lbl.Volume-as-point" }),
                                fromDate: formatMessage({ id: "lbl.Start-date-Carton-quantity" }),
                                toDate: formatMessage({ id: "lbl.Container-volume-deadline" }),
                                unitPrice: formatMessage({ id: "lbl.teu-price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                unitPriceType: formatMessage({ id: "lbl.price-type" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.AGG-particulars' }),//代理费计算方法明细
                        },
                        {//提单法(BL)计算方法
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.VSHP-particulars' }) + '-' + formatMessage({ id: 'lbl.BL-particulars' }),//代理费计算方法明细
                        },
                        {//VTEU计算方法表格文本
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                startTeu: formatMessage({ id: "lbl.Starting-point-tonnage" }),
                                endTeu: formatMessage({ id: "lbl.Tonnage-cut-off-point" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.VSHP-particulars' }) + '-' + formatMessage({ id: 'lbl.VTEU-particulars' }),//代理费计算方法明细
                        },
                        {//箱型尺寸组
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),

                                containerSizeTypeGroup: formatMessage({ id: "lbl.Box-size-name" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                containerSizeType: formatMessage({ id: "lbl.Box-size" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0035' }),//代理费箱型尺寸组明细
                        },
                        {//航线组
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),

                                serviceLoopCode: formatMessage({ id: "lbl.Airline-code" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                fromDate: formatMessage({ id: "lbl.start-date" }),
                                toDate: formatMessage({ id: "lbl.over-date" }),
                                serviceGroupCode: formatMessage({ id: "lbl.airlines-group" }),
                                groupDescription: formatMessage({ id: "lbl.route-group-description" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0036' }),//代理费航线组明细
                        },
                        {//特殊费率
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                startTeu: formatMessage({ id: "lbl.volume-point" }),
                                endTeu: formatMessage({ id: "lbl.Volume-as-point" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                percentage: formatMessage({ id: "lbl.percentage" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0079' }),//代理费计算方法明细
                        }
                    ]
                },
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                // headers: {
                //     　　　　"biz-source-param": "BLG"
                //     　　 },
            })
            // console.log(downData)
            // let reader = new FileReader();
            // console.log(reader)
            // reader.readAsText(downData)
            // console.log(reader)
            // reader.onload = function (result) {
            // try {
            //     setSpinflag(false)
            //     let resData = JSON.parse(result.target.result);  // 解析对象成功，说明是json数据
            //     console.log(resData)
            //     if (resData.success==false) {
            //         Toast('',resData.errorMessage,'alert-error', 5000, false)
            //     }
            // } catch (err) {   // 解析成对象失败，说明是正常的文件流
            //     // let blob = new Blob([downData], {type: "application/vnd.ms-excel"});
            //     // var link = document.createElement('a');
            //     // link.href = window.URL.createObjectURL(blob);
            //     // link.download =formatMessage({id: 'menu.afcm.agreement.agency.agencyFee'}) + '.xls';
            //     // link.click()

            //     setSpinflag(false)
            //     // let blob = new Blob([downData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            //     let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            //     console.log(blob)
            //     if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
            //         navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agreement.agency.agencyFee'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            //     } else {
            //         let downloadElement = document.createElement('a');  //创建元素节点
            //         let href = window.URL.createObjectURL(blob); // 创建下载的链接
            //         downloadElement.href = href;
            //         downloadElement.download = formatMessage({id: 'menu.afcm.agreement.agency.agencyFee'}) + '.xls'; // 下载后文件名
            //         document.body.appendChild(downloadElement); //添加元素
            //         downloadElement.click(); // 点击下载
            //         document.body.removeChild(downloadElement); // 下载完成移除元素
            //         window.URL.revokeObjectURL(href); // 释放掉blob对象
            //     }


            // }
            // };

            if (downData.size < 1) {
                setSpinflag(false)
                Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
                return
            } else {
                setSpinflag(false)
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                console.log(blob)
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({ id: 'menu.afcm.agreement.agency.agencyFee' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({ id: 'menu.afcm.agreement.agency.agencyFee' }) + '/' + TimesFun() + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        } else {
            Toast('', formatMessage({ id: 'lbl.afcm-0038' }), 'alert-error', 5000, false)
        }

    }
    //比较
    const compare = async () => {
        Toast('', '', '', 5000, false)
        console.log(uuidData)
        if (uuidData.length == 2) {
            setSpinflag(true)
            let downData = await request($apiUrl.EXP_PRE_HEAD_COMARE, {
                method: "POST",
                data: {
                    'uuids': uuidData,
                    'excelFileName': formatMessage({ id: 'menu.afcm.agreement.agency.agencyFee' }) + '-' + formatMessage({ id: 'btn.compare' }),
                    sheetList: [
                        {//Head头
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: "lbl.afcm-0043" }),
                            },
                            dataCol: {//列表字段
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                companyCode: formatMessage({ id: "lbl.company" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                agencyDescription: formatMessage({ id: "lbl.agent-described" }),
                                feeAgreementCode: formatMessage({ id: "lbl.agreement" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),
                                prdIndicator: formatMessage({ id: "lbl.productbility" }),
                                postCalculationFlag: formatMessage({ id: "lbl.arithmetic" }),
                                postMode: formatMessage({ id: "lbl.bookkeeping" }),
                                ygSide: formatMessage({ id: "lbl.estimate" }),
                                yfSide: formatMessage({ id: "lbl.make" }),
                                sfSide: formatMessage({ id: "lbl.submitanexpenseaccount" }),
                                isYt: formatMessage({ id: "lbl.withholding" }),
                                isBill: formatMessage({ id: "lbl.actually" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0033' }),//head头
                        },
                        {//item列表
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: "lbl.afcm-0044" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),
                                feeClass: formatMessage({ id: "lbl.Big-class-fee" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                compareIndicator: formatMessage({ id: "lbl.Whether-to-vote-for-an-election" }),
                                compareCalculationMethod: formatMessage({ id: "lbl.Choose-a-large-calculation-method" }),
                                tsIndicator: formatMessage({ id: "lbl.Is-it-a-special-rate" }),
                                modifyFlag: formatMessage({ id: "lbl.Whether-or-not-tiered-rates" }),
                                vatFlag: formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0034' }),//代理费协议item
                        },
                        {//CALL/CALL2/MCALL/VOY/VOY2
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: 'lbl.CALL-particulars' }) + '-' + formatMessage({ id: 'lbl.CALL2-particulars' }) + '-' + formatMessage({ id: 'lbl.MCALL-particulars' }) + '-' + formatMessage({ id: 'lbl.VOY-particulars' }) + '-' + formatMessage({ id: 'lbl.VOY2-particulars' }) + formatMessage({ id: "lbl.afcm-0045" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                callNumber: formatMessage({ id: "lbl.Port-number" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                                fromDate: formatMessage({ id: "lbl.formdate" }),
                                toDate: formatMessage({ id: "lbl.Ending-time" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.CALL-particulars' }) + '-' + formatMessage({ id: 'lbl.CALL2-particulars' }) + '-' + formatMessage({ id: 'lbl.MCALL-particulars' }) + '-' + formatMessage({ id: 'lbl.VOY-particulars' }) + '-' + formatMessage({ id: 'lbl.VOY2-particulars' }),//代理费计算方法明细
                        },
                        {//箱量计算法表格文本
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: 'lbl.CNT1-particulars' }) + '-' + formatMessage({ id: 'lbl.CNT2-particulars' }) + formatMessage({ id: "lbl.afcm-0045" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                emptyFullIndicator: formatMessage({ id: "lbl.empty-container-mark" }),
                                transmitIndicator: formatMessage({ id: "lbl.lnward-outward-transit" }),
                                containerSizeTypeGroup: formatMessage({ id: "lbl.Box-size-group" }),
                                socIndicator: formatMessage({ id: "lbl.empty-box-mark" }),
                                cargoProperty: formatMessage({ id: "lbl.Domestic-trade-foreign-trade" }),
                                unitPrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                unitPriceType: formatMessage({ id: "lbl.price-type" }),
                                fromDate: formatMessage({ id: "lbl.formdate" }),
                                toDate: formatMessage({ id: "lbl.Ending-time" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.CNT1-particulars' }) + '-' + formatMessage({ id: 'lbl.CNT2-particulars' }),//代理费计算方法明细
                        },
                        {//时间(DATE)计算方法
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: 'lbl.DATE-particulars' }) + formatMessage({ id: "lbl.afcm-0045" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                calculationPeriod: formatMessage({ id: "lbl.Date-of-the-period" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                                fromDate: formatMessage({ id: "lbl.formdate" }),
                                toDate: formatMessage({ id: "lbl.Ending-time" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.DATE-particulars' }),//代理费计算方法明细
                        },
                        {//北美箱量累进(AGG)
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: 'lbl.AGG-particulars' }) + formatMessage({ id: "lbl.afcm-0045" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                groupCode: formatMessage({ id: "lbl.Group-number" }),
                                startTeu: formatMessage({ id: "lbl.volume-point" }),
                                endTeu: formatMessage({ id: "lbl.Volume-as-point" }),
                                fromDate: formatMessage({ id: "lbl.Start-date-Carton-quantity" }),
                                toDate: formatMessage({ id: "lbl.Container-volume-deadline" }),
                                unitPrice: formatMessage({ id: "lbl.teu-price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                unitPriceType: formatMessage({ id: "lbl.price-type" }),
                                fromDate: formatMessage({ id: "lbl.formdate" }),
                                toDate: formatMessage({ id: "lbl.Ending-time" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.AGG-particulars' }),//代理费计算方法明细
                        },
                        {//提单法(BL)计算方法
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: 'lbl.BL-particulars' }) + formatMessage({ id: "lbl.afcm-0045" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                fromDate: formatMessage({ id: "lbl.formdate" }),
                                toDate: formatMessage({ id: "lbl.Ending-time" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.VSHP-particulars' }) + '-' + formatMessage({ id: 'lbl.BL-particulars' }),//代理费计算方法明细
                        },
                        {//VTEU计算方法表格文本
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: 'lbl.VSHP-particulars' }) + formatMessage({ id: "lbl.afcm-0045" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                startTeu: formatMessage({ id: "lbl.Starting-point-tonnage" }),
                                endTeu: formatMessage({ id: "lbl.Tonnage-cut-off-point" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                                fromDate: formatMessage({ id: "lbl.formdate" }),
                                toDate: formatMessage({ id: "lbl.Ending-time" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.VSHP-particulars' }) + '-' + formatMessage({ id: 'lbl.VTEU-particulars' }),//代理费计算方法明细
                        },
                        {//箱型尺寸组
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: "lbl.afcm-0046" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                containerSizeTypeGroup: formatMessage({ id: "lbl.Box-size-name" }),
                                containerSizeType: formatMessage({ id: "lbl.Box-size" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0035' }),//代理费箱型尺寸组明细
                        },
                        {//航线组
                            dataHead: {
                                feeAgreementCode: formatMessage({ id: "lbl.afcm-0047" }),
                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                serviceLoopCode: formatMessage({ id: "lbl.Airline-code" }),
                                fromDate: formatMessage({ id: "lbl.start-date" }),
                                toDate: formatMessage({ id: "lbl.over-date" }),
                                serviceGroupCode: formatMessage({ id: "lbl.airlines-group" }),
                                groupDescription: formatMessage({ id: "lbl.route-group-description" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0036' }),//代理费航线组明细
                        },
                        {//特殊费率
                            "dataHead": {

                                "feeAgreementCode": formatMessage({ id: "lbl.afcm-0084" })

                            },
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                startTeu: formatMessage({ id: "lbl.volume-point" }),
                                endTeu: formatMessage({ id: "lbl.Volume-as-point" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                percentage: formatMessage({ id: "lbl.percentage" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0079' }),//代理费计算方法明细
                        }
                    ]
                },
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
            })
            console.log(downData)
            if (downData.size < 1) {
                setSpinflag(false)
                Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
                return
            } else {
                setSpinflag(false)
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                console.log(blob)
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({ id: 'menu.afcm.agreement.agency.agencyFee' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({ id: 'menu.afcm.agreement.agency.agencyFee' }) + formatMessage({ id: 'btn.compare' }) + ' / ' + TimesFun() + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        } else {
            Toast('', formatMessage({ id: 'lbl.afcm-0041' }), 'alert-error', 5000, false)
        }

    }
    //全球协议统计报表
    const statistics = async () => {
        Toast('', '', '', 5000, false)
        if (!queryForm.getFieldValue().shipperOwner || !queryForm.getFieldValue().companyCode) {
            Toast('', formatMessage({ id: 'lbl.afcm-0063' }), 'alert-error', 5000, false)
        } else {
            setSpinflag(true)
            let downData = await request($apiUrl.AG_FEE_AGMT_EXP_PRE_HEAD_GLOBAL, {
                method: "POST",
                data: {
                    'paramsList': [{
                        'shipownerCompanyCode': queryForm.getFieldValue().shipperOwner,
                        'companyCode': queryForm.getFieldValue().companyCode,
                    }],
                    'excelFileName': formatMessage({ id: 'btn.Glo.agreement.statistics' }),
                    sheetList: [
                        {//Head头
                            dataCol: {//列表字段
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                groupAgreementCode: formatMessage({ id: "lbl.Protocol-group-number" }),
                                ptCompanyCode: formatMessage({ id: "lbl.The-port-company" }),
                                // fromDateId:formatMessage({id:"lbl." }),
                                // toDateId:formatMessage({id:"lbl." }),
                                // agFeeIndicator: formatMessage({ id: "lbl.afcm-0065" }),
                                enableIndicator: formatMessage({ id: "lbl.afcm-0066" }),
                                dataSource: formatMessage({ id: "lbl.afcm-0067" }),
                                // modifyIndicator: formatMessage({ id: "lbl.afcm-0068" }),
                                // calculationAgainIndicator: formatMessage({ id: "lbl.afcm-0069" }),
                                checkHqStatus: formatMessage({ id: "lbl.afcm-comm-04" }),
                                checkAgencyStatus: formatMessage({ id: "lbl.afcm-comm-01" }),
                                checkFadStatus: formatMessage({ id: "lbl.afcm-comm-07" }),
                                agreementStatus: formatMessage({ id: "lbl.ProtocolState" }),
                                // historyFlag:formatMessage({id:"lbl." }),
                                recordCheckHqUser: formatMessage({ id: "lbl.afcm-comm-05" }),
                                recordCheckHqDate: formatMessage({ id: "lbl.afcm-comm-06" }),
                                recordCheckAgencyUser: formatMessage({ id: "lbl.afcm-comm-02" }),
                                recordCheckAgencyDate: formatMessage({ id: "lbl.afcm-comm-03" }),
                                recordCheckFadUser: formatMessage({ id: "lbl.afcm-comm-08" }),
                                recordCheckFadDate: formatMessage({ id: "lbl.afcm-comm-09" }),
                                modifyFlag: formatMessage({ id: "lbl.Whether-or-not-tiered-rates" }),
                                isCommission: formatMessage({ id: "lbl.afcm-0070" }),
                                // versionId:formatMessage({id:"lbl." }),
                                // recordCreateDate:formatMessage({id:"lbl." }),
                                // recordCreateUser:formatMessage({id:"lbl." }),
                                recordUpdateDate: formatMessage({ id: "lbl.last-modification-date" }),
                                recordUpdateUser: formatMessage({ id: "lbl.last-modifier" }),
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                companyCode: formatMessage({ id: "lbl.company" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                agencyDescription: formatMessage({ id: "lbl.agent-described" }),
                                feeAgreementCode: formatMessage({ id: "lbl.agreement" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),
                                prdIndicator: formatMessage({ id: "lbl.productbility" }),
                                postCalculationFlag: formatMessage({ id: "lbl.arithmetic" }),
                                postMode: formatMessage({ id: "lbl.bookkeeping" }),
                                ygSide: formatMessage({ id: "lbl.estimate" }),
                                yfSide: formatMessage({ id: "lbl.make" }),
                                sfSide: formatMessage({ id: "lbl.submitanexpenseaccount" }),
                                isYt: formatMessage({ id: "lbl.withholding" }),
                                isBill: formatMessage({ id: "lbl.actually" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0033' }),//head头
                        },
                        {//item列表
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),

                                serviceGroupCode: formatMessage({ id: "lbl.airlines-group" }),
                                // versionId:
                                recordUpdateDate: formatMessage({ id: "lbl.last-modification-date" }),
                                recordUpdateUser: formatMessage({ id: "lbl.last-modifier" }),
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),
                                feeClass: formatMessage({ id: "lbl.Big-class-fee" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                compareIndicator: formatMessage({ id: "lbl.Whether-to-vote-for-an-election" }),
                                compareCalculationMethod: formatMessage({ id: "lbl.Choose-a-large-calculation-method" }),
                                tsIndicator: formatMessage({ id: "lbl.Is-it-a-special-rate" }),
                                modifyFlag: formatMessage({ id: "lbl.Whether-or-not-tiered-rates" }),
                                vatFlag: formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0034' }),//代理费协议item
                        },
                        {//CALL/CALL2/MCALL/VOY/VOY2
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),

                                fromDate: formatMessage({ id: 'lbl.start-date' }),
                                toDate: formatMessage({ id: 'lbl.over-date' }),


                                callNumber: formatMessage({ id: "lbl.Port-number" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.CALL-particulars' }) + '-' + formatMessage({ id: 'lbl.CALL2-particulars' }) + '-' + formatMessage({ id: 'lbl.MCALL-particulars' }) + '-' + formatMessage({ id: 'lbl.VOY-particulars' }) + '-' + formatMessage({ id: 'lbl.VOY2-particulars' }),//代理费计算方法明细
                        },
                        {//箱量计算法表格文本
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),

                                fromDate: formatMessage({ id: 'lbl.start-date' }),
                                toDate: formatMessage({ id: 'lbl.over-date' }),

                                emptyFullIndicator: formatMessage({ id: "lbl.empty-container-mark" }),
                                transmitIndicator: formatMessage({ id: "lbl.lnward-outward-transit" }),
                                containerSizeTypeGroup: formatMessage({ id: "lbl.Box-size-group" }),
                                socIndicator: formatMessage({ id: "lbl.empty-box-mark" }),
                                cargoProperty: formatMessage({ id: "lbl.Domestic-trade-foreign-trade" }),
                                unitPrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                unitPriceType: formatMessage({ id: "lbl.price-type" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.CNT1-particulars' }) + '-' + formatMessage({ id: 'lbl.CNT2-particulars' }),//代理费计算方法明细
                        },
                        {//时间(DATE)计算方法
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),


                                fromDate: formatMessage({ id: 'lbl.start-date' }),
                                toDate: formatMessage({ id: 'lbl.over-date' }),


                                calculationPeriod: formatMessage({ id: "lbl.Date-of-the-period" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.DATE-particulars' }),//代理费计算方法明细
                        },
                        {//北美箱量累进(AGG)
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),

                                fromDate: formatMessage({ id: 'lbl.start-date' }),
                                toDate: formatMessage({ id: 'lbl.over-date' }),

                                groupCode: formatMessage({ id: "lbl.Group-number" }),
                                startTeu: formatMessage({ id: "lbl.volume-point" }),
                                endTeu: formatMessage({ id: "lbl.Volume-as-point" }),
                                fromDate: formatMessage({ id: "lbl.Start-date-Carton-quantity" }),
                                toDate: formatMessage({ id: "lbl.Container-volume-deadline" }),
                                unitPrice: formatMessage({ id: "lbl.teu-price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                unitPriceType: formatMessage({ id: "lbl.price-type" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.AGG-particulars' }),//代理费计算方法明细
                        },
                        {//提单法(BL)计算方法
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),

                                fromDate: formatMessage({ id: 'lbl.start-date' }),
                                toDate: formatMessage({ id: 'lbl.over-date' }),


                                feePrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.BL-particulars' }),//代理费计算方法明细
                        },
                        {//VTEU计算方法表格文本
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                calculationMethod: formatMessage({ id: "lbl.Computing-method" }),
                                feeType: formatMessage({ id: "lbl.Small-class-fee" }),
                                serviceGroupCode: formatMessage({ id: "lbl.afcm-0085" }),
                                vesselIndicator: formatMessage({ id: "lbl.Whether-or-not-their-own" }),
                                heryType: formatMessage({ id: "lbl.Reference-code-class" }),
                                heryCode: formatMessage({ id: "lbl.identifying-code" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),

                                fromDate: formatMessage({ id: 'lbl.start-date' }),
                                toDate: formatMessage({ id: 'lbl.over-date' }),


                                startTeu: formatMessage({ id: "lbl.Starting-point-tonnage" }),
                                endTeu: formatMessage({ id: "lbl.Tonnage-cut-off-point" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                feePrice: formatMessage({ id: "lbl.price" }),

                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.VSHP-particulars' }) + '-' + formatMessage({ id: 'lbl.VTEU-particulars' }),//代理费计算方法明细
                        },
                        {//箱型尺寸组
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),

                                fromDate: formatMessage({ id: 'lbl.start-date' }),
                                toDate: formatMessage({ id: 'lbl.over-date' }),
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                containerSizeTypeGroup: formatMessage({ id: "lbl.Box-size-name" }),
                                containerSizeType: formatMessage({ id: "lbl.Box-size" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0035' }),//代理费箱型尺寸组明细
                        },
                        {//航线组
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),

                                fromDate: formatMessage({ id: 'lbl.start-date' }),
                                toDate: formatMessage({ id: 'lbl.over-date' }),
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                serviceLoopCode: formatMessage({ id: "lbl.Airline-code" }),
                                fromDate: formatMessage({ id: "lbl.start-date" }),
                                toDate: formatMessage({ id: "lbl.over-date" }),
                                serviceGroupCode: formatMessage({ id: "lbl.airlines-group" }),
                                groupDescription: formatMessage({ id: "lbl.route-group-description" }),
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0036' }),//代理费航线组明细
                        },
                        {//特殊费率
                            dataCol: {//列表字段
                                shipownerCompanyCode: formatMessage({ id: "lbl.carrier" }),
                                agencyCode: formatMessage({ id: "lbl.agency" }),
                                subAgencyCode: formatMessage({ id: "lbl.Son-agency-code" }),
                                productInd: formatMessage({ id: "lbl.productbility" }),
                                fromDate: formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: formatMessage({ id: "lbl.effective-end-date" }),

                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                feeAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                agreementItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                startTeu: formatMessage({ id: "lbl.volume-point" }),
                                endTeu: formatMessage({ id: "lbl.Volume-as-point" }),
                                feePrice: formatMessage({ id: "lbl.price" }),
                                feeCurrencyCode: formatMessage({ id: "lbl.ccy" }),
                                percentage: formatMessage({ id: "lbl.percentage" }),
                            },
                            sumCol: {//汇总字段
                            },
                            'sheetName': formatMessage({ id: 'lbl.afcm-0079' }),//代理费计算方法明细
                        }
                    ]
                },
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
            })
            // console.log(downData)
            if (downData.size < 1) {
                setSpinflag(false)
                Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
                return
            } else {
                setSpinflag(false)
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                // console.log(blob)
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({ id: 'btn.Glo.agreement.statistics' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({ id: 'btn.Glo.agreement.statistics' }) + '/' + TimesFun() + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        }

    }
    const agreements = async (value, number) => {
        let val = value ? value.target.value : number
        // if(val==1){
        //     setValuesAgreement(true)
        //     pageChange(page,'','')
        // }else{
        //     setValuesAgreement(false)
        //     pageChange(page,'','')
        // }
        // val==1? setValuesAgreement(true): setValuesAgreement(false)
        setValueAgreement(val)
    }
    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            companyCode: companyData,
        })
        setTableData([])
        setChecked([])
        setCopyShow(false)//禁用提交审核
        companys()
        setDownlodFlag(false)//禁用下载
        setUuidData([])
        setCopyFlag(true)//禁用复制按钮
    }
    // console.log(valuesAgreement)
    // const [showFlag , setShowFlag] = useState(true)
    // const getTips = ()=>{
    //     setShowFlag(false)
    // }
    // const moveTips = ()=>{
    //     setShowFlag(true)
    // }
    return (
        <div className='parent-box'>
            <div className="header-from">
                {/* <div className="from-top"> */}
                <Form onFinish={handleQuery} form={queryForm}>
                    <Row>
                        {/* 船东 */}
                        <Select name='shipperOwner' disabled={company.companyType == 0 ? true : false} span={6} label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                        {/* 公司 */}
                        {/* <div > */}
                        <Select span={6} showSearch={true} name='companyCode' flag={true} label={<FormattedMessage id='lbl.company' />} options={companysData} selectChange={companyIncident} />
                        <a style={{ color: 'orange' }}><Tooltip color='#e6f7ff' style={{ color: '#000' }} className="tipsContent" title={titTooltip}><InfoCircleOutlined /></Tooltip></a>
                        {/* </div> */}
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} flag={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 船东 */}
                        {/* <Select span={6} name='shipperOwner' flag={true} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values}/> */}

                        {/* 代理编码 */}
                        {/* <Select span={6}  name='agencyCode' showSearch={true} flag={true} label={<FormattedMessage id='lbl.agency'/>} options={agencyCode} /> */}
                        {/* 协议状态 */}
                        <Select span={6} name='agreementStatus' flag={true} label={<FormattedMessage id='lbl.ProtocolState' />} options={protocolStateData.values} />
                        {/* 协议代码 */}
                        <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.agreement' />} />
                        {/* 有效日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='Date' label={<FormattedMessage id='lbl.valid-date' />} />
                        {/*口岸协议 网点协议 */}
                        <CosRedio name='agreementType' span={6} label=' ' onClick={agreements} options={[{ value: 1, label: <FormattedMessage id='lbl.afcm-0071' />, disabled: kouanFlag }, { value: 2, label: <FormattedMessage id='lbl.afcm-0072' />, disabled: wdFlag }]} />

                    </Row>
                    {/* <div hidden={showFlag}>
                            <Alert message={<FormattedMessage id="lbl.messT" />} type="info" showIcon onClick={moveTips}/>
                        </div> */}
                </Form>

                {/* <div style={{ color: 'red', textAlign: 'right' }}> */}

                {/* <span style={{ background: 'yellow' }}><FormattedMessage id="lbl.messT" /></span> */}
                {/* </div> */}
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
                {/* </div> */}
            </div>
            <div className="main-button">
                <div className="button-left">
                    <CosButton auth='AFCM_AGMT_AG_001_B01' onClick={addBtn}>
                        {/* 新增按钮 */}
                        <FileAddOutlined />
                        <FormattedMessage id='lbl.new-btn' />
                    </CosButton>
                    <CosButton auth='AFCM_AGMT_AG_001_B02' onClick={copyBtn} disabled={copyflag}>
                        {/* 复制按钮 */}
                        <CopyOutlined />
                        <FormattedMessage id='lbl.copy' />
                    </CosButton>
                    {/* 提交审核按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B03' disabled={copyShow ? false : true} onClick={submitBtn}><FileDoneOutlined /> <FormattedMessage id='lbl.submit-audit' /></CosButton>
                    {/* 上载按钮 */}
                    {/* <Button disabled> <CloudUploadOutlined /><FormattedMessage id='lbl.upload'/></Button> */}
                    {/* 比较按钮 */}
                    <Button onClick={compare} disabled={uuidData.length == 2 ? false : true}><SwapOutlined /><FormattedMessage id='lbl.compare' /></Button>
                    {/* 下载 */}
                    <Button onClick={downlod} disabled={downlodFlag ? false : true}><CloudDownloadOutlined /><FormattedMessage id='lbl.download' /></Button>
                    {/* 协议模板下载 */}
                    {/* <Button disabled><CloudDownloadOutlined /><FormattedMessage id='lbl.protocol-template-download'/></Button> */}

                </div>

                <div className='button-right'>
                    {/* 全球协议统计报表 */}
                    <CosButton onClick={statistics}><CloudDownloadOutlined /> <FormattedMessage id='btn.Glo.agreement.statistics' /></CosButton>
                    {/* 重置 */}
                    <Button onClick={reset}> < ReloadOutlined /><FormattedMessage id='btn.reset' /> </Button>
                    {/* 查询按钮 */}
                    <Button onClick={() => pageChange(page, '', 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /> </Button>

                </div>
            </div>
            <div className="footer-table">
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    // pageSize={10}
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            setChecked(key);
                            setCheckedRow(row);
                            setSelectedRows(row);
                        }
                    }}
                />
            </div>
            <AgencyFeeAgmtEdit addEdit={addEdit} />
            <LocalChargeCopy copydatas={copydatas} />
            <LogPopUp logData={logData} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default AgencyFee