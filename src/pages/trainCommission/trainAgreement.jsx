/*
 * @Author: your name
 * @Date: 2022-04-18 11:42:36
 * @LastEditTime: 2022-04-18 18:08:09
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /deyuan/afcm-web/src/pages/trainCommission/trainAgreement.jsx
 */
{/* 班列佣金-班列协议配置 */ }
import React, { useEffect, useState, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import request from '@/utils/request';
import { acquireSelectData, acquireSelectDataExtend, momentFormat, acquireCompanyData, allCompany, agencyCodeData, companyAgency } from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText';
import SelectVal from '@/components/Common/Select';
import { Button, Form, Row, Input, Tooltip, Modal, Select, Tabs, Col, InputNumber } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import LogPopUp from '../commissions/agmt/LogPopUp';
import moment from 'moment';
import AgreementDatail from './agreementDetail'
import CosButton from '@/components/Common/CosButton'
import { CosToast, CosRadio } from '@/components/Common/index'
import CosModal from '@/components/Common/CosModal'
import { CosDownLoadBtn } from '@/components/Common/index'

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    ReadOutlined,//日志
    FileAddOutlined,//新增
    SaveOutlined, //保存
    CopyOutlined, //复制
    CloudDownloadOutlined,//日志
    SearchOutlined,//查询
    ReloadOutlined,//重置
    PlusOutlined, //新增item
    FileProtectOutlined, //提交
    RightOutlined,//右箭头
    DoubleRightOutlined,  //双右箭头
    LeftOutlined,//左箭头
    DoubleLeftOutlined, //双左箭头
    EditOutlined, //详细列
    RightCircleOutlined,
} from '@ant-design/icons'
import { check } from 'prettier';

const confirm = Modal.confirm
// tab切换
const { TabPane } = Tabs;

const trainAgreement = () => {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [tableData, setTableData] = useState([{}]) // table数据
    const [detailData, setDetailData] = useState([]) // 协议item 明细数据
    const [detailsData, setDetailsData] = useState([]) // 箱量计算方法明细
    const [tabTotal, setTabTotal] = useState([]) // table条数
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [txt, setTxt] = useState(''); //弹窗标题
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]);  //选择行
    const [defaultKey, setDefaultKey] = useState('1'); //导航页
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [commissionMode, setCommissionMode] = useState({}); // 佣金模式
    const [vatFlag, setVatFlag] = useState({}); // 是否含税价
    const [officeType, setOfficeType] = useState({}); // office类型
    const [addFlag, setAddFlag] = useState(true)//动态增加按钮是否禁用
    const [addsFlag, setAddsFlag] = useState(true)//动态增加箱量计算方法按钮是否禁用
    const [buttonFlag, setButtonFlag] = useState(true)//保存按钮是否禁用
    const [submitFlag, setSubmitFlag] = useState(true)//提交按钮是否禁用
    const [agreementData, setAgreementData] = useState({}); // 计算方法
    const [clickFlag, setClickFlag] = useState(false); //保存类型
    const [isModalVisiblecopy, setIsModalVisibleCopy] = useState(false)//复制弹框开关
    const [copydata, setCopydata] = useState({})//复制的数据
    const [copyShow, setCopyShow] = useState(false)//复制
    const [itemRecord, setItemRecord] = useState([]);  //单选框记录数据
    const [saveFlag, setSaveFlag] = useState(false); //是否保存标记
    const [inputFlag, setInputFlag] = useState(false); //明细列表输入框控制
    const [itemFlag, setItemFlag] = useState(false); //明细列表操作按钮控制
    const [uidData, setUidData] = useState(undefined);   // 获取明细 uid
    const [commissionTypeItemUuid, setCommissionTypeItemUuid] = useState("");   // 获取协议item uid  
    const [showFlag, setShowFlag] = useState(true);   //箱量计算方法明细显示
    const [commissionAgreementCode, setCommissionAgreementCode] = useState(undefined); //获取新增保存后的协议代码
    const [commAgreementCode, setCommAgreementCode] = useState(""); //获取明细协议代码
    const [groupInit, setGroupInit] = useState([]); //箱型尺寸数据
    const [currentIndex, setCurrentIndex] = useState(); //增加类
    const [natureCode, setNatureCode] = useState({});  // 货类
    const [groupDatas, setGroupDatas] = useState([]) // 箱型尺寸组信息数据
    const [choose, setChoose] = useState('NEW');  // 新增or编辑
    const [infoTips, setInfoTips] = useState({});   //message info
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [toPayInAdvance, setToPayInAdvance] = useState({});  // 预到付
    const [socEmptyInd, setSocEmptyInd] = useState({});  // SOC空箱标记 
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [agencyCode, setAgencyCode] = useState([]);//代理编码
    const [companyData, setCompanyData] = useState('')
    const [kouanFlag, setKouanFlag] = useState(true)
    const [valuesAgreement, setValuesAgreement] = useState(true)
    const [wdFlag, setwdFlag] = useState(true)

    const [headFlag, setHeadFlag] = useState(false);     // 头部查看详情禁用
    const [wfFlag, setWfFlag] = useState(false); //保存成功禁用
    const [queryDataCode, setQueryDataCode] = useState(undefined);   // 获取新增uuid
    const [groupFlag, setGroupFlag] = useState(true);  // group按钮操作控制
    const [commissionType, setCommissionType] = useState({}); // 费用类型
    const [calculationMethod, setCalculationMethod] = useState({}); // 计算方法
    const [containerSizeTypeGroup, setContainerSizeTypeGroup] = useState([]); // 箱型尺寸组
    const [commissionCurrencyCode, setCommissionCurrencyCode] = useState({}); // 币种
    const [unitPriceType, setFeePriceType] = useState({}); // 单价类型
    const [route, setRoute] = useState({});    //  航线
    const [svvd, setSvvd] = useState({});    //  svvd
    const [astatus, setAstatus] = useState({});    //  协议状态
    const [boxData, setBoxData] = useState([]) // 协议item 箱量计算法明细
    const [pteData, setPteData] = useState([]) // 协议item 百分比算法明细
    const [groupData, setGroupData] = useState([]) // 协议item 百分比算法明细
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "agreementCode": null,
        "companyCode": null,
        "shipperOwner": null,
    });

    {/* 初始化 */ }
    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireCompanyData(setCompanysData, $apiUrl);   // 公司
        // allCompany(setCompanysData,$apiUrl)   // 公司
        acquireSelectData('AFCM.BANLIE.COMMTYPE', setCommissionType, $apiUrl);// 佣金类型
        acquireSelectData('AFCM.AGMT.TYPE', setAgreementData, $apiUrl);// 协议类型
        acquireSelectData('CC0013', setCommissionMode, $apiUrl);// 佣金模式
        acquireSelectData('COMM.CALC.MTHD.CB0050', setCalculationMethod, $apiUrl);// 计算方法
        acquireSelectData('AGMT.VAT.FLAG', setVatFlag, $apiUrl);// 是否含税价
        acquireSelectData('AFCM.AGMT.OFFICE.TYPE', setOfficeType, $apiUrl);// office类型
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE', setCommissionCurrencyCode, $apiUrl);// 币种
        acquireSelectData('CB0046', setFeePriceType, $apiUrl);// 计算类型
        acquireSelectData('AFCM.AGMT.CARGO.NATURE.CODE', setNatureCode, $apiUrl);// 货类
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0044', setToPayInAdvance, $apiUrl);// 预到付
        acquireSelectData('COMM.SOC.EMPTY.IND', setSocEmptyInd, $apiUrl);// SOC空箱标记
        getData();
        agencyCodeData($apiUrl, setAgencyCode, setCompany)//代理编码
        companys();
        routeFun();
    }, [])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            companyCode: companyData,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        queryForm.setFieldsValue({
            popData: {
                companyCode: companyData,
                shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            }
        })
        companyAgency($apiUrl, companyData, setAgencyCode)
    }, [company, acquireData, companyData])

    {/* from 数据 */ }
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    {/* 公司 */ }
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
        console.log(company)
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
            } else {
                setKouanFlag(true)
                setValuesAgreement(false)
                queryForm.setFieldsValue({
                    'agreementType': 2
                })
            }
        }
    }

    // 航线
    const routeFun = async() => {
        // /afcm/api/banlie/svcDict
        let result = await request($apiUrl.CURRENTUSER, {
            method: "POST",
            data: {}
        })
        if(result.success) {
            console.log(result, '航线数据');
            setRoute(result.data);
        }

    }

    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'center',
            fixed: false,
            render: (text, record, index) => {
                return <div className='operation'>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={() => {deleteBtn(record, index)}} disabled={record.show?false:true} style={{color:record.show?'red':'#ccc'}}><CloseCircleOutlined/></a>&nbsp; */}
                        <a><CosButton auth='AFCM-CMS-BANLIE-003-B02' onClick={() => { deleteBtn(record, index) }} disabled={record.show ? false : true} ><CloseCircleOutlined style={{ color: record.show ? 'red' : '#ccc', fontSize: '15px' }} /></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        {/* <a onClick={() => {editViewBtn(record, false)}} disabled={record.show?false:true} ><FormOutlined/></a>&nbsp; */}
                        <a><CosButton auth='AFCM-CMS-BANLIE-003-B11' onClick={() => { editViewBtn(record, false) }} disabled={record.show ? false : true}><FormOutlined style={{ color: record.show ? '#1890ff' : '#ccc', fontSize: '15px' }} /></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { editViewBtn(record, true) }}><FileSearchOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => { logBtn(record) }}><ReadOutlined /></a>
                    </Tooltip>
                </div>
            }
        },
        // {
        //     title: <FormattedMessage id='lbl.agreement' />,//协议代码
        //     dataIndex: 'commissionAgreementCode',
        //     align: 'left',
        //     sorter: false,
        //     width: 80,
        // },
        // {
        //     title: <FormattedMessage id='lbl.carrier' />,//船东
        //     dataIndex: 'shipownerCompanyCode',
        //     align: 'left',
        //     sorter: false,
        //     width: 60,
        // },
        // {
        //     title: <FormattedMessage id='lbl.company' />,//公司
        //     // dataIndex: 'companyNameCn',
        //     dataIndex: 'companyCode',
        //     // dataType: companysData,
        //     align: 'left',
        //     sorter: false,
        //     width: 60,
        // },
        // {
        //     title: <FormattedMessage id='lbl.agency' />,//代理编码
        //     dataIndex: 'agencyCode',
        //     align: 'left',
        //     sorter: false,
        //     width: 80,
        // },
        // {
        //     title: <FormattedMessage id='lbl.company-abbreviation' />,//公司简称
        //     dataIndex: 'commpanyNameAbbr',
        //     align: 'left',
        //     sorter: false,
        //     width: 80,
        // },
        // {
        //     title: <FormattedMessage id='lbl.effective-start-date' />,//有效开始日期
        //     dataIndex: 'fromDate',
        //     align: 'left',
        //     sorter: false,
        //     width: 100,
        // },
        // {
        //     title: <FormattedMessage id='lbl.effective-end-date' />,//有效结束日期
        //     dataIndex: 'toDate',
        //     align: 'left',
        //     sorter: false,
        //     width: 100,
        // },
        // {
        //     title: <FormattedMessage id='lbl.ProtocolState' />,//协议状态
        //     dataIndex: 'status',
        //     dataType: protocolStateData.values,
        //     align: 'left',
        //     sorter: false,
        //     width: 80,
        // },
        // {
        //     title: <FormattedMessage id='lbl.audit-date' />,//审核时间
        //     dataIndex: 'recordUpdateDatetime',
        //     align: 'left',
        //     sorter: false,
        //     width: 80,
        // },
        // {
        //     title: <FormattedMessage id='lbl.operator' />,//操作人
        //     dataIndex: 'recordUpdateUser',
        //     align: 'left',
        //     sorter: false,
        //     width: 60,
        // },
        {
            title: <FormattedMessage id="lbl.protocol" />,// 协议号
            dataIndex: 'commissionAgreementCode',
            align: 'left',
            width: 130
        }, {
            title: <FormattedMessage id="lbl.carrier" />,// 船东
            dataIndex: 'shipownerCompanyCode',
            align: 'left',
            width: 130
        }, {
            title: <FormattedMessage id='lbl.route' />,// 航线
            dataIndex: 'serviceLoopCode',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Loading-port" />,// 装港
            dataIndex: 'pol',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Unloading-port" />,// 卸港
            dataIndex: 'pod',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.start-date" />,// 开始日期
            dataIndex: 'fromDate',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.over-date" />,// 结束日期
            dataIndex: 'toDate',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.ProtocolState" />,// 协议状态
            dataIndex: 'status',
            dataType: protocolStateData.values,
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Take-effect-sign" />,// 有效标识
            dataIndex: 'toDate',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.ac.pymt.claim-note" />,// 备注
            dataIndex: 'note',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.train-comm-001" />,// 创建用户
            dataIndex: 'recordCreateUser',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.train-comm-002" />,// 创建时间
            dataIndex: 'recordCreateDatetime',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Update-users-comm" />,// 更新用户
            dataIndex: 'recordUpdateUser',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.update-date" />,// 更新时间
            dataIndex: 'recordUpdateDatetime',
            align: 'left',
            width: 120,
        },
    ]
    {/* 协议item 列表 */ }
    const detailColumn = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'center',
            fixed: false,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => { deleteItem(record, index) }} disabled={record.saveShowHide ? false : true} disabled={itemFlag} ><CloseCircleOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}>
                        <a onClick={() => { saveItem(record, index) }} disabled={record.saveShowHide ? false : true} disabled={itemFlag} ><SaveOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => { editItem(text, record, index) }} disabled={record.saveShowHide ? false : true} disabled={itemFlag} ><FormOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.porcountry-region' />,     // POR国家/地区
            dataIndex: 'porCountry',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {/* {record.saveShowHide ? <Input maxLength={3} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'porCountry')} name='porCountry' /> : text} */}
                    {record.saveShowHide ? <Input disabled defaultValue={"*"} onChange={(e) => getCommonIptVal(e, record, 'porCountry')} name='porCountry' /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.fdncountry-region' />,     // FND国家/地区
            dataIndex: 'fndCountry',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {/* {record.saveShowHide ? <Input maxLength={3} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'fndCountry')} name='fndCountry' /> : text} */}
                    {record.saveShowHide ? <Input disabled defaultValue={'*'} onChange={(e) => getCommonIptVal(e, record, 'fndCountry')} name='fndCountry' /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.office-type' />,//office类型
            dataIndex: "officeType",
            align: 'left',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Select disabled={inputFlag} defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'officeType')} name='officeType' options={officeType.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.office-code' />,//office code
            dataIndex: "officeCode",
            align: 'left',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Input disabled={inputFlag} maxLength={10} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'officeCode')} name='officeCode' /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.To-pay-in-advance' />,     // 预到付
            dataIndex: 'oftPc',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {/* {record.saveShowHide ? <Select disabled={inputFlag} defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'oftPc')} name='oftPc' options={toPayInAdvance.values} /> : text} */}
                    {record.saveShowHide ? <Input disabled defaultValue={'*'} onChange={(e) => getCommonIptVal(e, record, 'oftPc')} name='oftPc' /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Commission-type' />,//佣金类型
            dataIndex: 'commissionType',
            align: 'left',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Select disabled={inputFlag} defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionType')} name='commissionType' options={commissionType.values} /> : commissionType.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : '';
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.The-Commission' />,//佣金模式
            dataIndex: 'commissionMode',
            align: 'left',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Select disabled={inputFlag} defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionMode')} name='commissionMode' options={commissionMode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Computing-method' />,//计算方法
            dataIndex: 'calculationMethod',
            align: 'left',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Select disabled defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'calculationMethod')} name='calculationMethod' options={calculationMethod.values} /> : calculationMethod.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : '';
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.empty-box-mark' />,      // SOC空箱标记
            dataIndex: 'socEmptyIndicator',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {/* {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'socEmptyIndicator')} name='socEmptyInd' options={socEmptyInd.values} /> : text} */}
                    {record.saveShowHide ? <Input disabled defaultValue={'*'} onChange={(e) => getCommonIptVal(e, record, 'socEmptyIndicator')} name='socEmptyInd' /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.percentage' />,//百分比
            dataIndex: 'percentage',
            align: 'left',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Input disabled precision={6} defaultValue={text = 0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'percentage', true)} name='percentage' /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Freight-tax' />,//运费税
            dataIndex: 'oftTaxPercent',
            align: 'left',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <InputNumber disabled={inputFlag} defaultValue={text} precision={6} min={0} max={100} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'oftTaxPercent', true)} name='oftTaxPercent' /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Whether-the-price-includes-tax' />,//是否含税价
            dataIndex: 'vatFlag',
            align: 'left',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Select disabled={inputFlag} defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'vatFlag')} name='vatFlag' options={vatFlag.values} /> : vatFlag.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : '';
                    })}
                </div>
            }
        },
    ]
    {/* 箱量计算方法明细 */ }
    const detailsColumn = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'center',
            fixed: false,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => { deleteGroup(record, index) }} disabled={itemFlag}><CloseCircleOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}>
                        <a onClick={() => { saveGroup(record, index) }} disabled={itemFlag}><SaveOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => { editGroup(text, record, index) }} disabled={itemFlag}><FormOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Box-size-group' />,//箱型尺寸组
            dataIndex: 'containerSizeTypeGroup',
            align: 'left',
            sorter: false,
            width: 80,
            render: (text, record) => {
                return <div>
                    {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'containerSizeTypeGroup')} name='containerSizeTypeGroup' options={containerSizeTypeGroup} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'commissionCurrencyCode',
            align: 'left',
            sorter: false,
            width: 60,
            render: (text, record) => {
                return <div>
                    {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionCurrencyCode')} name='commissionCurrencyCode' options={commissionCurrencyCode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.imputed-price' />,//计算价格
            dataIndex: 'unitPrice',
            align: 'left',
            sorter: false,
            width: 80,
            render: (text, record) => {
                return <div>
                    {record.show ? <InputNumber min={0} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'unitPrice', true)} name='unitPrice' /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.imputed-type' />,//计算类型
            dataIndex: 'unitPriceType',
            align: 'left',
            sorter: false,
            width: 70,
            render: (text, record) => {
                return <div>
                    {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'unitPriceType')} name='unitPriceType' options={unitPriceType.values} /> : text}
                </div>
            }
        },
    ]
    const [sizeDetailedTable, setSizeDetailedTable] = useState([]);   //箱型尺寸group信息
    const [newSizeDetailedTable, setNewSizeDetailedTable] = useState([]);  //箱型尺寸编辑
    const [openBoxSizedetailIndex, setOpenBoxSizedetailIndex] = useState()   //展开箱型尺寸详情
    const [isEditBoxSize, setIsEditBoxSize] = useState('NEW')
    const boxSizeref = React.useRef()  //定位

    {/* 箱型尺寸详细-表头 */ }
    const sizeDetailedColumns = [
        {
            title: <FormattedMessage id='lbl.Box-size' />,      // 箱型尺寸
            dataIndex: 'containerSizeType',
            sorter: false,
            width: 80,
            render: (text, record) => {
                return <div>
                    {text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.cargo-class' />,      // 货类
            dataIndex: 'cargoNatureCode',
            sorter: false,
            width: 80,
            render: (text, record) => {
                return <div>
                    {text}
                </div>
            }
        }
    ]


    //  --------------------------

     // 新增箱量计算法明细
     const addBox = async () => {
        setBoxData([...boxData, { show: true, saveShowHide: true, calculationMethod: "CNT", commissionAgreementCode: commissionAgreementCode}]);
    }

    // 新增百分比算法明细
    const addPte = async () => {
        setPteData([...pteData, { show: true, saveShowHide: true, calculationMethod: "PCT", commissionAgreementCode: commissionAgreementCode}]);
    }

    // 箱量计算法明细
    const boxColumn = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'center',
            fixed: false,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => { deleteGroup(record, index, boxData, setBoxData) }} disabled={itemFlag}><CloseCircleOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}>
                        <a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} onClick={() => { saveGroup(record, index, boxData, setBoxData) }} disabled={itemFlag}><SaveOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} onClick={() => { editGroup(text, record, index, boxData, setBoxData) }} disabled={itemFlag}><FormOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.protocol' />,//协议号
            dataIndex: 'commissionAgreementCode',
            align: 'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.ac.invoice.fee-type' />,//费用类型
            dataIndex: 'commissionType',
            align: 'left',
            sorter: false,
            width: 60,
            render: (text, record) => {
                return <div>
                    {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionType')} name='commissionType' options={commissionType.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Computing-method' />,//计算方法
            dataIndex: 'calculationMethod',
            align: 'left',
            sorter: false,
            width: 80,
            // render: (text, record) => {
            //     return <div>
            //         {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'calculationMethod')} name='calculationMethod' options={calculationMethod.values} /> : calculationMethod.values.map((v, i) => {
            //             return text == v.value ? <span>{v.label}</span> : '';
            //         })}
            //     </div>
            // }
        },
        {
            title: <FormattedMessage id='lbl.Box-size-group' />,//箱型尺寸组
            dataIndex: 'containerSizeTypeGroup',
            align: 'left',
            sorter: false,
            width: 70,
            render: (text, record) => {
                return <div>
					{record.show ? <Input defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'containerSizeTypeGroup')} name='containerSizeTypeGroup' /> : text}
                    {/* {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'containerSizeTypeGroup')} name='containerSizeTypeGroup' options={containerSizeTypeGroup} /> : text} */}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'commissionCurrencyCode',
            align: 'left',
            sorter: false,
            width: 80,
            render: (text, record) => {
                return <div>
                    {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionCurrencyCode')} name='commissionCurrencyCode' options={commissionCurrencyCode.values} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'unitePrice',
            align: 'left',
            sorter: false,
            width: 80,
            render: (text, record) => {
                return <div>
                    {record.show ? <InputNumber min={0} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'unitePrice', true)} name='unitePrice' /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.price-type' />,//单价类型
            dataIndex: 'unitePriceType',
            align: 'left',
            sorter: false,
            width: 80,
            render: (text, record) => {
                return <div>
                    {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'unitePriceType')} name='unitePriceType' options={unitPriceType.values} /> : text}
                </div>
            }
        },
    ]

    // 百分比算法明细
    const pteColumn = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'center',
            fixed: false,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => { deleteGroup(record, index, pteData, setPteData) }} disabled={itemFlag}><CloseCircleOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}>
                        <a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} onClick={() => { saveGroup(record, index, pteData, setPteData) }} disabled={itemFlag}><SaveOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} onClick={() => { editGroup(text, record, index, pteData, setPteData) }} disabled={itemFlag}><FormOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.protocol' />,//协议号
            dataIndex: 'commissionAgreementCode',
            align: 'left',
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.ac.invoice.fee-type' />,//费用类型
            dataIndex: 'commissionType',
            align: 'left',
            sorter: false,
            width: 60,
            render: (text, record) => {
                return <div>
                    {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionType')} name='commissionType' options={commissionType.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Computing-method' />,//计算方法
            dataIndex: 'calculationMethod',
            align: 'left',
            sorter: false,
            width: 80,
            // render: (text, record) => {
            //     return <div>
            //         {record.show ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'calculationMethod')} name='calculationMethod' options={calculationMethod.values} /> : calculationMethod.values.map((v, i) => {
            //             return text == v.value ? <span>{v.label}</span> : '';
            //         })}
            //     </div>
            // }
        },
        {
            title: <FormattedMessage id='lbl.SVVD' />,//SVVD
            dataIndex: 'svvd',
            align: 'left',
            sorter: false,
            width: 70,
            render: (text, record) => {
                return <div>
					{record.show ? <Input defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'svvd')} name='svvd' /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.rate-one' />,//费率
            dataIndex: 'percentage',
            align: 'left',
            sorter: false,
            width: 80,
            render: (text, record) => {
                return <div>
                    {record.show ? <InputNumber min={0} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'percentage', true)} name='percentage' /> : text}
                </div>
            }
        },
    ]


     // 箱型尺寸明细
     const groupColumn = [
        {
            title: <FormattedMessage id='lbl.seq' />,//序号
            dataIndex: 'commissionAgreementCode',
            align: 'left',
            sorter: false,
            width: 80,
        },{
            title: <FormattedMessage id='lbl.Box-size' />,//箱型尺寸
            dataIndex: 'commissionType',
            align: 'left',
            sorter: false,
            width: 60,
        },{
            title: <FormattedMessage id='lbl.Box-size-group' />,//箱型尺寸组
            dataIndex: 'commissionAgreementCode',
            align: 'left',
            sorter: false,
            width: 80,
        }]

    //  --------------------------

    {/* 查询 */ }
    const pageChange = async (pagination, search) => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue()
        console.log(queryData);
        setSpinflag(true);
        if (search) {
            pagination.current = 1
            pagination.pageSize = 10
        }
        if (pagination.pageSize != page.pageSize) {
            pagination.current = 1
        }
        const result = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SEARCH_LIST, {
            method: "POST",
            data: {
                page: pagination,
                params: {
                    ...queryData,
                    popData: undefined,
                    companyCode: undefined
                }
            }
        })
        let data = result.data
        if (result.success) {
            setSpinflag(false);
            // setCopyShow(false)
            let datas = result.data.resultList
            if (datas != null) {
                datas.map((v, i) => {
                    v.fromDate ? v["fromDate"] = v.fromDate.substring(0, 10) : null;
                    v.toDate ? v["toDate"] = v.toDate.substring(0, 10) : null;
                    // v.recordUpdateDatetime ? v["recordUpdateDatetime"] = v.recordUpdateDatetime.substring(0, 10) : null;
                    if (companysData != null) {
                        companysData.map((val, i) => {
                            if (val.value == v.companyCode) {
                                v.companyCode = val.label
                            }
                        })
                    }
                })
            }
            setPage({ ...pagination })
            setTabTotal(data.totalCount)
            setTableData([...datas])
            setSelectedRowKeys([...datas])
        } else {
            setSpinflag(false);
            setTableData([])
            Toast('', result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 新增 */ }
    const addBtn = () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        setTxt(intl.formatMessage({ id: 'lbl.add' }));
        setHeadFlag(false);      // 头部是否禁用
        setWfFlag(false);   //明细输入控制读写
        setAddFlag(true);   //item按钮
        setAddsFlag(true);   //箱量计算方法按钮
        setButtonFlag(false); //保存按钮
        setSubmitFlag(false);  //提交按钮
        setClickFlag(false);   //保存类型标记
        setInputFlag(false); //协议item明细列表输入框控制读写
        setItemFlag(false);  //协议item操作按钮控制
        setShowFlag(true);  //箱量明细显示控制
        setGroupFlag(true)  //group按钮操作控制
        setQueryDataCode(undefined);    // 新增保存的uuid
        setCommissionTypeItemUuid("")
        setDetailData([]);
        setDetailsData([]);
        setSizeDetailedTable([])
        setCheckedRow([])
        setChecked([])
        setContainerSizeTypeGroup([])
        setGroupDatas([])
        setOpenBoxSizedetailIndex()
        setDefaultKey("1");
        setChoose("NEW");
        setSaveFlag(false);
        queryForm.setFieldsValue({
            containerSizeTypeGroup: null,
            cargoNatureCode: null,
        })
        queryForm.setFieldsValue({
            popData: {
                companyCode: companyData,
                shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                commissionAgreementCode: null,
                agencyCode: company.agencyCode,
                agreementType: null,
                activityDate: null,
            }
        })
        setTimeout(() => {
            setSpinflag(false);
            setIsModalVisible(true);
        }, 1000);
    }
    {/* 复制弹框传的参数 */ }
    const copydatas = {
        isModalVisiblecopy,//控制弹框开关
        companysData,//公司数据
        copydata,//复制的数据
        page,//表格分页显示数据
        lastCondition,//初始化表单数据
        copyShow,//复制按钮是否禁用
        txt,//标题
        setTableData,
        setTabTotal,
        setIsModalVisibleCopy,
        setCopydata,
        setCopyShow,
        setChecked,
        copyUrl: 'TRAIN_COMM_TRAIN_AGREEMENT_COPY_DATA',
    }
    {/* 复制 */ }
    const copyBtn = () => {
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({ id: 'lbl.copy' }));
        setIsModalVisibleCopy(true)
    }
    {/* 查看明细 */ }
    const editViewBtn = async (record, flag) => {
        Toast('', '', '', 5000, false);
        setInfoTips({})
        setSpinflag(true);
        setClickFlag(true);
        setChoose("EDT");
        setHeadFlag(true);      // 头部是否禁用
        const result = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SEARCH_DETAIL,
            {
                method: 'POST',
                data: {
                    uuid: record.agreementHeadUuid,
                }
            }
        )
        let data = result.data;
        if (result.success) {
            setSpinflag(false);
            setShowFlag(true);  //箱量明细显示控制
            setAddsFlag(flag);
            setAddFlag(flag);
            setButtonFlag(flag)
            setSubmitFlag(flag)
            setQueryDataCode(data.agreementHeadUuid);   // 明细uuid
            setUidData(data.agreementHeadUuid)  //获取明细uid
            setCommAgreementCode(data.commissionAgreementCode) //获取明细协议编码
            setCommissionAgreementCode(data.commissionAgreementCode);   // 获取协议号

            if (data.banlieAgmtItemList.banlieCntrPriceList == null) {
                setDetailsData([]) //箱量计算方法明细
            } else {
                setDetailsData(data.banlieAgmtItemList[0].banlieCntrPriceList) //箱量计算方法明细
            }
            queryForm.setFieldsValue({
                popData: {
                    shipownerCompanyCode: data.shipownerCompanyCode,    // 船东
                    serviceLoopCode: data.serviceLoopCode,  // 航线
                    pol: data.pol,  // 装港
                    pod: data.pod,  // 卸港
                    activityDate: [moment(data.fromDate), moment(data.toDate)],  // 开始日期
                    commissionAgreementCode: data.commissionAgreementCode,       // 协议号
                    note: data.note,    // 备注
                }
            })

            if (data.banlieAgmtItemList != null) {
                data.banlieAgmtItemList.map((v, i) => {
                    v.saveShowHide = false
                })
            }
            setDetailData(data.banlieAgmtItemList)   //协议item明细

            data.cntList.map((v, i) => {
                v.saveShowHide = false;
            })

            data.pctList.map((v, i) => {
                v.saveShowHide = false;
            })

            setBoxData(data.cntList)
            setPteData(data.pctList)
            setGroupDatas(data.banlieCntrSizeGroups) //group明细
            if (flag) {
                setWfFlag(true);
                setInputFlag(true)
                setItemFlag(true)
                setGroupFlag(true)
                setAddFlag(true);
                setAddsFlag(true);
                setTxt(intl.formatMessage({ id: 'lbl.ViewDetails' }));
            } else {
                setWfFlag(false);
                if (data.status == "W") {
                    setButtonFlag(true);   //保存按钮
                    setSubmitFlag(true);  //提交按钮
                    setWfFlag(true);      //明细弹窗输入框控制
                    setItemFlag(true);    //协议item操作按钮控制
                    setGroupFlag(true);
                    setAddFlag(true);
                    setAddsFlag(true);
                } else if (data.status == "U") {
                    setButtonFlag(true);
                    setSubmitFlag(true);
                    setWfFlag(true);
                    setItemFlag(true);
                    setGroupFlag(true);
                    setAddFlag(true);
                    setAddsFlag(true);
                } else {
                    setInputFlag(false)  //明细弹窗列表输入框控制
                    setItemFlag(false);
                    setGroupFlag(false)
                    setAddFlag(false);
                    setAddsFlag(false);
                }
                setTxt(intl.formatMessage({ id: 'lbl.edit' }));
            }
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 查询列表删除 */ }
    const deleteBtn = (record, flag) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({ id: 'lbl.delete' }),
            content: intl.formatMessage({ id: 'lbl.delete.select.content' }),
            okText: intl.formatMessage({ id: 'lbl.confirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const deleteData = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_DELETE_SEARCH_LIST_UUID, {
                    method: 'POST',
                    data: {
                        uuid: record.agreementHeadUuid,
                    }
                })
                if (deleteData.success) {
                    setSpinflag(false);
                    pageChange(page);
                    Toast('', deleteData.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                    Toast('', deleteData.errorMessage, 'alert-error', 5000, false)
                }
            }
        })
    }
    {/* 日志展示 */ }
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
        setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }
    {/* 日志 */ }
    const logBtn = async (record) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SEARCH_LOG,
            {
                method: 'POST',
                data: {
                    params: {
                        referenceType: "BANLIE_AGMT",
                        referenceUuid: record.agreementHeadUuid
                    }

                }
            }
        )
        if (result.success) {
            setSpinflag(false);
            setJournalData(result.data)
            setIsModalVisibleLog(true);
        } else {
            setSpinflag(false);
        }
    }
    {/* 清空 */ }
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            companyCode: companyData,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        companys()
        setTableData([]);
        setDetailData([]);
        setDetailsData([]);
        setChecked([]);
        setCheckedRow([]);
        setBackFlag(true);
        setCopyShow(false)
    }
    {/* 保存协议信息 */ }
    const handleSave = async (type) => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        // 新增判断必输项
        if (!queryData.shipownerCompanyCode || !queryData.serviceLoopCode || !queryData.pol || !queryData.pod || !queryData.activityDate) {
            setBackFlag(false);
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.train-comm-006' }) });
            return
        } else if (clickFlag == false) {//新增保存
            setBackFlag(true);
            setSpinflag(true);
            const result = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SAVE_SUBMIT, {
                method: "POST",
                data: {
                    "operateType": type,
                    "params": {
                        // companyCode: queryData.companyCode,
                        // shipownerCompanyCode: queryData.shipownerCompanyCode,
                        // commissionAgreementCode: queryData.commissionAgreementCode,
                        // agencyCode: queryData.agencyCode,
                        // agreementType: queryData.agreementType,
                        // banlieAgmtItemList: itemData,
                        ...queryData,
                        activityDate: undefined,
                        agreementType: undefined,
                        companyCode: undefined,
                        agreementHeadUuid: queryDataCode,
                        fromDate: queryData.activityDate ? momentFormat(queryData.activityDate[0]) : undefined,
                        toDate: queryData.activityDate ? momentFormat(queryData.activityDate[1]) : undefined,
                        cntList: boxData,
                        pctList: pteData,
                    },
                }
            })
            if (result.success) {
                setHeadFlag(true);  // 头部禁用
                let data = result.data
                setSpinflag(false);
                queryForm.setFieldsValue({  // 协议号
                    popData: {
                        commissionAgreementCode: data.commissionAgreementCode,
                    }
                })
                setQueryDataCode(data.agreementHeadUuid);   // 新增保存数据的uuid
                setDetailData(data.banlieAgmtItemList);
                let saveData = data.banlieCntrSizeGroups
                setCommissionAgreementCode(data.commissionAgreementCode)

                boxData.map((v, i) => {
                    v.show = false;
                    v.saveShowHide = false;
                })

                pteData.map((v, i) => {
                    v.show = false;
                    v.saveShowHide = false;
                })
                
                // setSaveFlag(true);
                // setAddFlag(false);
                // setAddsFlag(false);
                setGroupFlag(false);    // 放开按钮
                removeBtn()
                setGroupDatas([...saveData])
                pageChange(page)
                setInfoTips({ alertStatus: 'alert-success', message: result.message });
                if (type == 'SUBMIT') {
                    setIsModalVisible(false);
                    Toast('', result.message, 'alert-success', 5000, false);
                }
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: result.errorMessage });
            }
        } else {//编辑保存
            setSpinflag(true);
            let itemData = [];
            itemRecord.banlieCntrPriceList = detailsData
            let itemUids
            detailData.map((v, i) => {  //item明细
                if (v.agreementHeadUuid == null) {
                    itemUids = ""
                } else {
                    itemUids = v.commissionTypeItemUuid
                }
                itemData.push({
                    banlieCntrPriceList: v.banlieCntrPriceList,
                    commissionTypeItemUuid: itemUids,
                    commissionType: v.commissionType,
                    commissionMode: v.commissionMode,
                    calculationMethod: v.calculationMethod,
                    percentage: v.percentage,
                    oftTaxPercent: v.oftTaxPercent,
                    vatFlag: v.vatFlag,
                    officeCode: v.officeCode,
                    officeType: v.officeType,
                    porCountry: v.porCountry,
                    fndCountry: v.fndCountry,
                    oftPc: v.oftPc,
                    socEmptyIndicator: v.socEmptyIndicator,
                })
            })
            const save = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SAVE_SUBMIT, {
                method: "POST",
                data: {
                    "operateType": type,
                    "params": {
                        ...queryData,
                        activityDate: undefined,
                        agreementType: undefined,
                        companyCode: undefined,
                        agreementHeadUuid: queryDataCode,
                        fromDate: queryData.activityDate ? momentFormat(queryData.activityDate[0]) : undefined,
                        toDate: queryData.activityDate ? momentFormat(queryData.activityDate[1]) : undefined,
                        cntList: boxData,
                        pctList: pteData,
                    },
                }
            })
            let data = save.data
            if (save.success) {

                boxData.map((v, i) => {
                    v.show = false;
                    v.saveShowHide = false;
                })

                pteData.map((v, i) => {
                    v.show = false;
                    v.saveShowHide = false;
                })

                setSpinflag(false);
                setCommissionTypeItemUuid("")
                setQueryDataCode(data.agreementHeadUuid)
                queryForm.setFieldsValue({
                    popData: {
                        commissionAgreementCode: data.commissionAgreementCode,
                    }
                })
                setDetailData(data.banlieAgmtItemList);
                setSaveFlag(false);
                setGroupFlag(false);    // 放开按钮
                pageChange(page)
                setInfoTips({ alertStatus: 'alert-success', message: save.message });
                if (type == 'SUBMIT') {
                    setIsModalVisible(false)
                    Toast('', save.message, 'alert-success', 5000, false)
                }
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: save.errorMessage });
            }
        }
    }
    {/* 提交协议信息 */ }
    const handleSubmit = async () => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if (clickFlag == false) {//新增保存提交
            // if(saveFlag==false){
            //     setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Operate-warn'})});
            //     return;
            // }else {
            let itemData = [];
            let banlieCntrPriceList = [];
            itemRecord.banlieCntrPriceList = detailsData
            let itemUids
            detailData.map((v, i) => {  //item明细
                if (v.agreementHeadUuid == null) {
                    itemUids = ""
                } else {
                    itemUids = v.commissionTypeItemUuid
                }
                itemData.push({
                    banlieCntrPriceList: v.banlieCntrPriceList,
                    // commissionTypeItemUuid: v.commissionTypeItemUuid,
                    commissionTypeItemUuid: itemUids,
                    commissionType: v.commissionType,
                    commissionMode: v.commissionMode,
                    calculationMethod: v.calculationMethod,
                    percentage: v.percentage,
                    oftTaxPercent: v.oftTaxPercent,
                    vatFlag: v.vatFlag,
                    officeCode: v.officeCode,
                    officeType: v.officeType,
                    porCountry: v.porCountry,
                    fndCountry: v.fndCountry,
                    oftPc: v.oftPc,
                    socEmptyIndicator: v.socEmptyIndicator,
                })
            })
            let priceUids
            detailsData.map((v, i) => {
                if (v.agreementHeadUuid == null) {
                    priceUids = ""
                } else {
                    priceUids = v.commissionTypeItemUuid
                }
                banlieCntrPriceList.push({
                    agreementHeadUuid: v.agreementHeadUuid,
                    commissionAgreementCode: queryData.commissionAgreementCode,
                    commissionTypeItemUuid: priceUids,
                    commissionContainerPriceUuid: v.commissionContainerPriceUuid,
                    containerSizeTypeGroup: v.containerSizeTypeGroup,
                    commissionCurrencyCode: v.commissionCurrencyCode,
                    unitPrice: v.unitPrice,
                    unitPriceType: v.unitPriceType,
                })
            })
            setSpinflag(true);
            const submit = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SAVE_SUBMIT, {
                method: "POST",
                data: {
                    "operateType": 'SUBMIT',
                    "params": {
                        agreementHeadUuid: queryDataCode,
                        companyCode: queryData.companyCode,
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        commissionAgreementCode: queryData.commissionAgreementCode,
                        agencyCode: queryData.agencyCode,
                        agreementType: queryData.agreementType,
                        fromDate: queryData.activityDate ? momentFormat(queryData.activityDate[0]) : null,
                        toDate: queryData.activityDate ? momentFormat(queryData.activityDate[1]) : null,
                        banlieAgmtItemList: itemData,
                    },
                }
            })
            let data = submit.data
            if (submit.success) {
                setSpinflag(false);
                setCommissionTypeItemUuid("")
                setWfFlag(true);
                setGroupFlag(true)
                setSizeDetailedTable([])
                setCheckedRow([])
                setChecked([])
                setDefaultKey("1");
                queryForm.setFieldsValue({
                    containerSizeTypeGroup: null,
                    cargoNatureCode: null,
                })
                pageChange(page)
                setIsModalVisible(false)
                Toast('', submit.message, 'alert-success', 5000, false)
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: submit.errorMessage });
            }
            // }
        } else {//编辑保存提交
            setSpinflag(true);
            let itemData = [];
            let itemUids
            detailData.map((v, i) => {  //item明细
                if (v.agreementHeadUuid == null) {
                    itemUids = ""
                } else {
                    itemUids = v.commissionTypeItemUuid
                }
                itemData.push({
                    banlieCntrPriceList: v.banlieCntrPriceList,
                    commissionTypeItemUuid: itemUids,
                    commissionType: v.commissionType,
                    commissionMode: v.commissionMode,
                    calculationMethod: v.calculationMethod,
                    percentage: v.percentage,
                    oftTaxPercent: v.oftTaxPercent,
                    vatFlag: v.vatFlag,
                    officeCode: v.officeCode,
                    officeType: v.officeType,
                    porCountry: v.porCountry,
                    fndCountry: v.fndCountry,
                    oftPc: v.oftPc,
                    socEmptyIndicator: v.socEmptyIndicator,
                })
            })
            const submit = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SAVE_SUBMIT, {
                method: "POST",
                data: {
                    "operateType": 'SUBMIT',
                    "params": {
                        agreementHeadUuid: uidData,
                        companyCode: queryData.companyCode,
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        commissionAgreementCode: queryData.commissionAgreementCode,
                        agencyCode: queryData.agencyCode,
                        agreementType: queryData.agreementType,
                        fromDate: queryData.activityDate ? momentFormat(queryData.activityDate[0]) : null,
                        toDate: queryData.activityDate ? momentFormat(queryData.activityDate[1]) : null,
                        banlieAgmtItemList: itemData,
                    },
                }
            })
            let data = submit.data
            if (submit.success) {
                setSpinflag(false);
                setCommissionTypeItemUuid("")
                setWfFlag(true);
                setGroupFlag(true)
                setSizeDetailedTable([])
                setCheckedRow([])
                setChecked([])
                setDefaultKey("1");
                setCommissionTypeItemUuid("")
                queryForm.setFieldsValue({
                    containerSizeTypeGroup: null,
                    cargoNatureCode: null,
                })
                pageChange(page)
                setIsModalVisible(false)
                Toast('', submit.message, 'alert-success', 5000, false)
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: submit.errorMessage });
            }
        }
    }
    {/* 单选 */ }
    const setSelectedRows = async (val) => {
        setInfoTips({});
        // initGroup()
        setItemRecord(val);
        if (val.calculationMethod == "CNT" && val.agreementHeadUuid != null) {  // 判断item是否是计算方法 
            setShowFlag(false)
        } else {
            setShowFlag(true);
        }
        let uuids
        if (choose == "NEW") {
            uuids = queryDataCode
        } else {
            uuids = uidData
        }
        setCommissionTypeItemUuid(val.commissionTypeItemUuid);  // item的uuid
        let itemUids
        if (val.agreementHeadUuid == null) {
            itemUids = ""
        } else {
            itemUids = val.commissionTypeItemUuid
        }
        let radio = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SELECT_RADIO_VAL, {
            method: "POST",
            data: {
                "params": {
                    agreementHeadUuid: uuids,
                    commissionTypeItemUuid: itemUids,
                }
            }
        })
        let data = radio.data
        if (radio.success) {
            if (data == null) {
                setDetailsData([])
            } else {
                setDetailsData([...data])
            }
        } else {
            setDetailsData([])
            setInfoTips({ alertStatus: 'alert-error', message: radio.errorMessage });
        }
    }
    {/* 下载 */ }
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        console.log(checked.length)
        console.log(checkedRow.length)
        setSpinflag(true);
        if (checkedRow.length > 1 || checkedRow.length == 0) {
            setSpinflag(false);
            Toast('', intl.formatMessage({ id: 'lbl.banlie-alert-info' }), 'alert-error', 5000, false);
            return
        } else {
            const result = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_DOWNLOAD_BTN, {
                method: "POST",
                data: {
                    uuids: [checkedRow[0].agreementHeadUuid],
                    excelFileName: intl.formatMessage({ id: 'menu.afcm.trainComm.trainAgreement' }), //文件名
                    sheetList: [
                        {
                            dataCol: {
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                commissionAgreementCode: intl.formatMessage({ id: "lbl.agreement" }),
                                shipownerCompanyCode: intl.formatMessage({ id: "lbl.carrier" }),
                                companyNameCn: intl.formatMessage({ id: "lbl.company" }),   //companyCode
                                agencyCode: intl.formatMessage({ id: "lbl.agency" }),
                                commpanyNameAbbr: intl.formatMessage({ id: "lbl.company-abbreviation" }),
                                fromDate: intl.formatMessage({ id: "lbl.effective-start-date" }),
                                toDate: intl.formatMessage({ id: "lbl.effective-end-date" }),
                                status: intl.formatMessage({ id: "lbl.ProtocolState" }),
                                recordUpdateDatetime: intl.formatMessage({ id: "lbl.audit-date" }),
                                recordUpdateUser: intl.formatMessage({ id: "lbl.operator" }),
                            },
                            sheetName: intl.formatMessage({ id: 'lbl.afcm-head-mess' }),//查询列表
                        }, {
                            dataCol: {
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                commissionTypeItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),
                                fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),
                                officeType: intl.formatMessage({ id: "lbl.office-type" }),
                                officeCode: intl.formatMessage({ id: "lbl.office-code" }),
                                oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),
                                commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),
                                commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),
                                calculationMethod: intl.formatMessage({ id: "lbl.Computing-method" }),
                                socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),
                                percentage: intl.formatMessage({ id: "lbl.percentage" }),
                                oftTaxPercent: intl.formatMessage({ id: "lbl.Freight-tax" }),
                                vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),
                            },
                            sheetName: intl.formatMessage({ id: 'lbl.agreement-item' }),//协议item
                        }, {
                            dataCol: {
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                commissionTypeItemUuid: formatMessage({ id: "lbl.afcm-0040" }),
                                containerSizeTypeGroup: intl.formatMessage({ id: "lbl.Box-size-group" }),
                                commissionCurrencyCode: intl.formatMessage({ id: "lbl.ccy" }),
                                unitPrice: intl.formatMessage({ id: "lbl.imputed-price" }),
                                unitPriceType: intl.formatMessage({ id: "lbl.imputed-type" }),
                            },
                            sheetName: intl.formatMessage({ id: 'lbl.box-calculation-detailed' }),//箱量计算明细
                        }, {
                            dataCol: {
                                agreementHeadUuid: formatMessage({ id: "lbl.afcm-0042" }),
                                commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                                containerSizeTypeGroup: intl.formatMessage({ id: "lbl.Box-size-group" }),     // 箱型尺寸组
                                containerSizeType: intl.formatMessage({ id: "lbl.Box-size" }),     // 箱型尺寸
                                cargoNatureCode: intl.formatMessage({ id: "lbl.cargo-class" }),     // 货类
                            },
                            sheetName: intl.formatMessage({ id: 'lbl.group-message' }),//Group信息
                        }
                    ],
                },
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
            })
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                setSpinflag(false);
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.trainComm.trainAgreement' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.trainComm.trainAgreement' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    {/* 取消 */ }
    const handleCancel = () => {
        setInfoTips({});
        setBackFlag(true);
        setShowFlag(true);
        setCommissionTypeItemUuid("")
        setDetailData([]);
        setDetailsData([]);
        setSizeDetailedTable([])
        setCheckedRow([])
        setChecked([])
        setContainerSizeTypeGroup([])
        setGroupDatas([])
        setOpenBoxSizedetailIndex()
        setDefaultKey("1");
        queryForm.setFieldsValue({
            containerSizeTypeGroup: null,
            cargoNatureCode: null,
        })
        queryForm.setFieldsValue({
            popData: null
        })
        setIsModalVisible(false)
    }
    {/* 导航页 */ }
    const callback = (key) => {
        setInfoTips({});
        setDefaultKey(key);
    }

   

    {/* 新增item */ }
    const addItem = async () => {
        setInfoTips({});
        let newitem = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_ADD_NEW_INIT, {
            method: "POST",
        })
        let data = newitem.data
        setSpinflag(true);
        if (newitem.success) {
            setSpinflag(false);
            data.commissionTypeItemUuid = detailData ? detailData.length + 1 : ''
            data.saveShowHide = true
            detailData.push(data)
            setDetailData([...detailData])
        } else {
            setSpinflag(false);
            setInfoTips({ alertStatus: 'alert-error', message: newitem.errorMessage });
        }
    }
    {/* 删除item */ }
    const deleteItem = async (record, index) => {
        setInfoTips({});
        if (record.agreementHeadUuid == null) {
            detailData.splice(index, 1)
            setDetailData([...detailData])
        } else {
            setSpinflag(true);
            const deleteData = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_DELETE_ITEM_UUID, {
                method: 'POST',
                data: {
                    uuid: record.commissionTypeItemUuid,
                }
            })
            if (deleteData.success) {
                setSpinflag(false);
                detailData.splice(index, 1)
                setDetailData([...detailData])
                setDetailsData([])
                setCommissionTypeItemUuid("")
                setShowFlag(true);
                setInfoTips({ alertStatus: 'alert-success', message: deleteData.message });
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: deleteData.errorMessage });
            }
        }
    }
    {/* 保存item */ }
    const saveItem = async (record, index) => {
        setInfoTips({});
        if (!record.commissionType || !record.officeCode || !record.officeType) {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.item-warn' }) });
            return;
        } else if (clickFlag == false) { //新增保存item
            let itUid
            if (record.agreementHeadUuid == null) {
                itUid = ""
            } else {
                itUid = record.commissionTypeItemUuid
            }
            let itemData = []
            detailsData.map((v, i) => {
                itemData.push({
                    containerSizeTypeGroup: v.containerSizeTypeGroup,
                    commissionCurrencyCode: v.commissionCurrencyCode,
                    unitPrice: v.unitPrice,
                    unitPriceType: v.unitPriceType,
                    agreementHeadUuid: queryDataCode,
                    commissionAgreementCode: commissionAgreementCode,
                    commissionTypeItemUuid: itUid,
                    commissionContainerPriceUuid: v.commissionContainerPriceUuid,
                })
            })
            setSpinflag(true);
            const save = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SAVE_ITEM, {
                method: 'POST',
                data: {
                    "params": {
                        banlieCntrPriceList: itemData,
                        calculationMethod: record.calculationMethod,
                        commissionMode: record.commissionMode,
                        commissionType: record.commissionType,
                        officeCode: record.officeCode,
                        officeType: record.officeType,
                        porCountry: record.porCountry,
                        fndCountry: record.fndCountry,
                        oftPc: record.oftPc,
                        socEmptyIndicator: record.socEmptyIndicator,
                        oftTaxPercent: record.oftTaxPercent,
                        percentage: record.percentage,
                        vatFlag: record.vatFlag,
                        commissionAgreementCode: commissionAgreementCode,
                        commissionTypeItemUuid: itUid,
                        agreementHeadUuid: queryDataCode,
                    }
                }
            })
            if (save.success) {
                setSpinflag(false);
                let data = save.data
                setDetailsData(data.banlieCntrPriceList);
                detailData.splice(index, 1, data);
                setDetailData([...detailData]);
                setCommissionTypeItemUuid("")
                setShowFlag(true);
                setInfoTips({ alertStatus: 'alert-success', message: save.message });
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: save.errorMessage });
            }
        } else {//编辑保存item
            let itemUids
            if (record.agreementHeadUuid == null) {
                itemUids = ""
            } else {
                itemUids = record.commissionTypeItemUuid
            }
            let itemData = []
            detailsData.map((v, i) => {
                itemData.push({
                    containerSizeTypeGroup: v.containerSizeTypeGroup,
                    commissionCurrencyCode: v.commissionCurrencyCode,
                    unitPrice: v.unitPrice,
                    unitPriceType: v.unitPriceType,
                    agreementHeadUuid: uidData,
                    commissionAgreementCode: commAgreementCode,
                    commissionTypeItemUuid: itemUids,
                    commissionContainerPriceUuid: v.commissionContainerPriceUuid,
                })
            })
            setSpinflag(true);
            const save = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SAVE_ITEM, {
                method: 'POST',
                data: {
                    "params": {
                        banlieCntrPriceList: itemData,
                        calculationMethod: record.calculationMethod,
                        commissionAgreementCode: commAgreementCode,
                        commissionMode: record.commissionMode,
                        commissionType: record.commissionType,
                        officeCode: record.officeCode,
                        officeType: record.officeType,
                        porCountry: record.porCountry,
                        fndCountry: record.fndCountry,
                        oftPc: record.oftPc,
                        socEmptyIndicator: record.socEmptyIndicator,
                        oftTaxPercent: record.oftTaxPercent,
                        percentage: record.percentage,
                        vatFlag: record.vatFlag,
                        commissionTypeItemUuid: itemUids,
                        agreementHeadUuid: uidData,
                    }
                }
            })
            if (save.success) {
                setSpinflag(false);
                let data = save.data
                setDetailsData(data.banlieCntrPriceList);
                detailData.splice(index, 1, data);
                setDetailData([...detailData]);
                setDetailsData([])
                setCommissionTypeItemUuid("")
                setShowFlag(true);
                setInfoTips({ alertStatus: 'alert-success', message: save.message });
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: save.errorMessage });
            }
        }
    }
    {/* 编辑item */ }
    const editItem = (text, record, index) => {
        setInfoTips({});
        let data = detailData;
        data[index].saveShowHide = true;
        setDetailData([...data]);
    }
    {/* 新增箱量计算方法明细 */ }
    const commonPrice = async () => {
        setInfoTips({});
        initGroup()
        let json = {
            containerSizeTypeGroup: '',
            commissionCurrencyCode: '',
            unitPrice: '',
            unitPriceType: '',
            commissionContainerPriceUuid: '',
            commissionAgreementCode: '',
            commissionTypeItemUuid: '',
            agreementHeadUuid: '',
        }
        detailsData.push(json);
        setDetailsData([...detailsData]);
        detailsData.map((v, i) => {
            if (!v.agreementHeadUuid) {
                v.show = true
            } else {
                v.show = false
            }
        })
    }
    const addItemDetailed = async () => {
        setInfoTips({});
        let len = detailsData.length;
        if (len == 0) {
            commonPrice();
        } else {
            detailsData[len - 1].commissionContainerPriceUuid ? commonPrice() : setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.save-add-data' }) });
        }
    }
    {/* 箱型尺寸组数据初始化 */ }
    const initGroup = async () => {
        setInfoTips({});
        setContainerSizeTypeGroup([])
        let uuids
        if (choose == "NEW") {
            uuids = queryDataCode
        } else {
            uuids = uidData
        }
        let result = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_ADD_PRICE_INIT, {
            method: "POST",
            data: {
                uuid: uuids,
            }
        })
        let data = result.data
        if (result.success) {
            let cbsChargeCodes = data.cbsChargeCodes
            if (cbsChargeCodes == null) {
                setContainerSizeTypeGroup([])
            } else {
                cbsChargeCodes.map((v, i) => {
                    v['value'] = v.value;
                })
                setContainerSizeTypeGroup(cbsChargeCodes)
            }
        } else {
            setInfoTips({ alertStatus: 'alert-error', message: result.errorMessage });
        }
    }
    {/* 保存箱量计算方法明细 */ }
    const saveGroup = async (record, index, saveData, setSaveData) => {
        setInfoTips({});
        // if (!record.containerSizeTypeGroup) {
        //     setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.Containter-size-type' }) });
        //     return
        // } else if (clickFlag == false) { //新增保存箱量计算明细
        // if(clickFlag == false){
            // let itemUids
            // if(record.agreementHeadUuid==null){
            //     itemUids=""
            // }else{
            //     itemUids=record.commissionTypeItemUuid
            // }
            setSpinflag(true);
            // TRAIN_COMM_TRAIN_AGREEMENT_SAVE_PRICE
            const save = await request($apiUrl.BANLIE_AGMT_SAVE_ITEM, {
                method: 'POST',
                data: {
                    "params": {
                        commissionAgreementCode: record.commissionAgreementCode || undefined,   // 协议号
                        commissionType: record.commissionType || undefined,     // 费用类型
                        calculationMethod: record.calculationMethod || undefined,     // 计算方法
                        containerSizeTypeGroup: record.containerSizeTypeGroup || undefined,     // 箱型尺寸组
                        commissionCurrencyCode: record.commissionCurrencyCode || undefined,     // 币种
                        unitePrice: record.unitePrice || undefined,     // 单价
                        unitePriceType: record.unitePriceType || undefined,     // 单价类型
                        svvd: record.svvd || undefined,     // svvd
                        percentage: record.percentage || undefined,     // 费率
                        agreementHeadUuid: uidData,
                        // commissionTypeItemUuid: itemRecord.commissionTypeItemUuid,
                        commissionTypeItemUuid: record.commissionTypeItemUuid,
                        commissionContainerPriceUuid: record.commissionContainerPriceUuid || undefined,
                    }
                }
            })
            let data = save.data
            if (save.success) {
                setSpinflag(false);
                // itemRecord.banlieCntrPriceList = detailsData
                data.show = false;
                data.saveShowHide = false;
                saveData.splice(index, 1, data);
                // setDetailsData([...detailsData]);
                setSaveData([...saveData]);
                setInfoTips({ alertStatus: 'alert-success', message: save.message });
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: save.errorMessage });
            }
        // } else {  //编辑操作保存箱量计算明细
        //     setSpinflag(true);
        //     const save = await request($apiUrl.BANLIE_AGMT_SAVE_ITEM, {
        //         method: 'POST',
        //         data: {
        //             "params": {
        //                 // containerSizeTypeGroup: record.containerSizeTypeGroup,
        //                 // commissionCurrencyCode: record.commissionCurrencyCode,
        //                 // unitPrice: record.unitPrice,
        //                 // unitPriceType: record.unitPriceType,
        //                 // agreementHeadUuid: uidData,
        //                 // commissionAgreementCode: commAgreementCode,
        //                 // commissionTypeItemUuid: itemRecord.commissionTypeItemUuid,
        //                 // commissionContainerPriceUuid: record.commissionContainerPriceUuid,
        //                 commissionAgreementCode: record.commissionAgreementCode || undefined,   // 协议号
        //                 commissionType: record.commissionType || undefined,     // 费用类型
        //                 calculationMethod: record.calculationMethod || undefined,     // 计算方法
        //                 containerSizeTypeGroup: record.containerSizeTypeGroup || undefined,     // 箱型尺寸组
        //                 commissionCurrencyCode: record.commissionCurrencyCode || undefined,     // 币种
        //                 unitePrice: record.unitePrice || undefined,     // 单价
        //                 unitePriceType: record.unitePriceType || undefined,     // 单价类型
        //                 svvd: record.svvd || undefined,     // svvd
        //                 percentage: record.percentage || undefined,     // 费率
        //                 agreementHeadUuid: uidData,
        //                 // commissionTypeItemUuid: itemRecord.commissionTypeItemUuid,
        //                 commissionTypeItemUuid: record.commissionTypeItemUuid,
        //                 commissionContainerPriceUuid: record.commissionContainerPriceUuid || undefined,
        //             }
        //         }
        //     })
        //     let data = save.data
        //     if (save.success) {
        //         setSpinflag(false);
        //         // itemRecord.banlieCntrPriceList = detailsData
        //         // detailsData.splice(index, 1, data);
        //         // setDetailsData([...detailsData]);
        //         // setSaveData([...detailsData]);
        //         setInfoTips({ alertStatus: 'alert-success', message: save.message });
        //     } else {
        //         setSpinflag(false);
        //         setInfoTips({ alertStatus: 'alert-error', message: save.errorMessage });
        //     }
        // }
    }
    {/* 删除箱量计算方法明细 */ }
    const deleteGroup = async (record, index, delData, setDelData) => {
        setInfoTips({});
        if (!record.commissionTypeItemUuid) {
            // detailsData.splice(index, 1)
            // setDetailsData([...detailsData])
            delData.splice(index, 1);
            setDelData([...delData]);
        } else {
            setSpinflag(true);
            const result = await request($apiUrl.BANLIE_AGMT_BANLIE_AGMT_DELETE_ITEM_UUID, {
                method: 'POST',
                data: {
                    uuid: record.commissionTypeItemUuid,
                }
            })
            if (result.success) {
                setSpinflag(false);
                // detailsData.splice(index, 1)
                // setDetailsData([...detailsData])
                delData.splice(index, 1);
                setDelData([...delData]);
                setInfoTips({ alertStatus: 'alert-success', message: result.message });
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: result.errorMessage });
            }
        }
    }
    {/* 编辑箱量计算方法明细 */ }
    const editGroup = (text, record, index, editData, setEditData) => {
        setInfoTips({});
        let data = editData;
        data[index].saveShowHide = true;
        data[index].show = true;
        setEditData([...data]);
        // let data = detailsData;
        // data[index].show = true;
        // setDetailsData([...data]);
    }
    {/* 明细列表输入框 */ }
    const getCommonIptVal = (e, record, name, flag) => {
        flag ? record[name] = e : record[name] = e.target.value;
    }
    {/* 明细列表下拉框 */ }
    const getCommonSelectVal = (e, record, name) => {
        record[name] = e;
    }
    {/* 新增箱型尺寸初始化 */ }
    const getData = async () => {
        await request.post($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_ADD_GROUP_INIT)
            .then((result) => {
                if (result.success) {
                    let data = result.data;
                    setGroupInit(data);
                } else {
                    setInfoTips({ alertStatus: 'alert-error', message: result.errorMessage });
                }
            })
    }
    const changeIdx = (idx) => {
        setCurrentIndex(idx);
    }
    {/* 保存或更新协议箱型尺寸组数据 */ }
    const saveBox = async () => {
        setInfoTips({});
        if (/^[\u4e00-\u9fa5]+$/i.test(queryForm.getFieldValue().containerSizeTypeGroup)) {//检测输入的中文汉字
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.chinese-character' }) });
            return
        } else if (/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryForm.getFieldValue().containerSizeTypeGroup)) {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.chinese-character' }) });
            return
        }
        if (!queryForm.getFieldValue().containerSizeTypeGroup) {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.Box-size-group-name-is-required' }) });
            return
        } else if (queryForm.getFieldValue().containerSizeTypeGroup.length > 4) {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.banlie-box-size-group' }) });
            return
        }
        if (checked.length == 0) {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.save-group-warn' }) });
            return;
        } else if (clickFlag == false) {
            let groupSizeData = []
            checkedRow.map((v, i) => {
                groupSizeData.push({
                    cargoNatureCode: v.cargoNatureCode,
                    commissionContainerGroupUuid: v.commissionContainerGroupUuid,
                    containerSizeType: v.containerSizeType,
                    containerSizeTypeGroup: queryForm.getFieldValue().containerSizeTypeGroup,
                    agreementHeadUuid: queryDataCode,
                    commissionAgreementCode: commissionAgreementCode,
                })
            })
            setSpinflag(true);
            const save = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SAVE_GROUP, {
                method: 'POST',
                data: {
                    operateType: isEditBoxSize ? 'NEW' : 'UPD',
                    paramsList: groupSizeData
                }
            })
            let saveData = save.data
            if (save.success) {
                setSpinflag(false);
                setIsEditBoxSize('NEW')
                initGroup()
                setCheckedRow([])
                setChecked([])
                removeBtn()
                setGroupDatas([...saveData])
                setSizeDetailedTable([])
                setInfoTips({ alertStatus: 'alert-success', message: save.message });
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: save.errorMessage });
            }
        } else {
            let groupSizeData = []
            checkedRow.map((v, i) => {
                groupSizeData.push({
                    cargoNatureCode: v.cargoNatureCode,
                    commissionContainerGroupUuid: v.commissionContainerGroupUuid,
                    containerSizeType: v.containerSizeType,
                    containerSizeTypeGroup: queryForm.getFieldValue().containerSizeTypeGroup,
                    agreementHeadUuid: uidData,
                    commissionAgreementCode: commAgreementCode,
                })
            })
            setSpinflag(true);
            const save = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SAVE_GROUP, {
                method: 'POST',
                data: {
                    operateType: isEditBoxSize ? 'NEW' : 'UPD',
                    paramsList: groupSizeData
                }
            })
            let saveData = save.data
            if (save.success) {
                setSpinflag(false);
                setIsEditBoxSize('NEW')
                initGroup()
                setCheckedRow([])
                setChecked([])
                removeBtn()
                setGroupDatas([...saveData])
                setSizeDetailedTable([])
                setInfoTips({ alertStatus: 'alert-success', message: save.message });
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: save.errorMessage });
            }
        }
    }
    {/* 编辑左侧详情尺寸组 */ }
    const editBox = (item) => {
        setInfoTips({});
        let idx = newSizeDetailedTable.length;
        item.containerCargoDetails.map((item) => {
            item.id = idx++
        })
        queryForm.setFieldsValue({
            containerSizeTypeGroup: item.containerSizeTypeGroup
        })
        setIsEditBoxSize("")
        setCheckedRow([])
        setChecked([])
        setSizeDetailedTable([...item.containerCargoDetails])
        setNewSizeDetailedTable([...item.containerCargoDetails])
    }
    {/* 展开左侧箱型尺寸详情 */ }
    const openBoxSizedetail = (index) => {
        setInfoTips({});
        setOpenBoxSizedetailIndex(index)
        if (openBoxSizedetailIndex == index) {
            setOpenBoxSizedetailIndex()
        }
        boxSizeref.current.scrollTo(0, index * 20)
    }
    {/* 重置箱型尺寸组数据 */ }
    const resetBox = () => {
        setInfoTips({});
        queryForm.setFieldsValue({
            containerSizeTypeGroup: null,
            cargoNatureCode: null,
        })
        setSizeDetailedTable([])
        setCheckedRow([])
        setChecked([])
    }
    {/* 删除协议箱型尺寸组数据 */ }
    const deleteBox = async (item, index) => {
        setInfoTips({});
        const confirmModal = confirm({
            title: intl.formatMessage({ id: 'lbl.delete' }),
            content: intl.formatMessage({ id: 'lbl.delete.select.content' }),
            okText: intl.formatMessage({ id: 'lbl.confirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const deleteData = await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_DELETE_GROUP_UUID, {
                    method: 'POST',
                    data: {
                        params: {
                            agreementHeadUuid: item.agreementHeadUuid,
                            containerSizeTypeGroup: item.containerSizeTypeGroup,
                        }
                    }
                })
                if (deleteData.success) {
                    setSpinflag(false);
                    let delData = groupDatas.splice(index, 1)
                    setGroupDatas(delData)
                    setGroupDatas(groupDatas)
                    setInfoTips({ alertStatus: 'alert-success', message: deleteData.message });
                } else {
                    setSpinflag(false);
                    setInfoTips({ alertStatus: 'alert-error', message: deleteData.errorMessage });
                }
            }
        })
    }
    {/* 添加指定箱型尺寸信息 */ }
    let isSizeBoxAddflag
    const newBtn = () => {
        setInfoTips({});
        let data = queryForm.getFieldValue();
        if (data.cargoNatureCode) {
            if (groupInit[currentIndex] == undefined) {
                setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.banlie-box-size' }) });
                return
            }
            let idx = newSizeDetailedTable.length;
            isSizeBoxAddflag = true
            sizeDetailedTable.map((item) => {
                if ((data.cargoNatureCode == item.cargoNatureCode && groupInit[currentIndex] == item.containerSizeType) || idx == item.commissionContainerGroupUuid) {
                    isSizeBoxAddflag = false
                }
            })
            if (!isSizeBoxAddflag) {
                return
            }
            let json = {
                containerSizeTypeGroup: data.containerSizeTypeGroup,
                containerSizeType: groupInit[currentIndex],
                cargoNatureCode: data.cargoNatureCode,
                commissionContainerGroupUuid: idx++
            }
            sizeDetailedTable.push(json);
            newSizeDetailedTable.push(json);
            setSizeDetailedTable([...sizeDetailedTable])
            setNewSizeDetailedTable([...newSizeDetailedTable])
        } else {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.Goods-category-required' }) });
        }
    }
    {/* 添加全部箱型尺寸信息 */ }
    const allBtn = () => {
        setInfoTips({});
        setCheckedRow([])
        setChecked([])
        const newGroupInit = []
        let data = queryForm.getFieldValue();
        if (data.cargoNatureCode) {
            let idx = newSizeDetailedTable.length;
            isSizeBoxAddflag = true
            for (let i = 0; i < sizeDetailedTable.length; i++) {
                for (let j = 0; j < groupInit.length; j++) {
                    console.log(data.cargoNatureCode == sizeDetailedTable[i].cargoNatureCode, groupInit[j] == sizeDetailedTable[i].containerSizeType)
                    if ((data.cargoNatureCode == sizeDetailedTable[i].cargoNatureCode && groupInit[j] == sizeDetailedTable[i].containerSizeType) || idx == sizeDetailedTable[i].commissionContainerGroupUuid) {
                        isSizeBoxAddflag = false
                    }
                }
            }
            if (!isSizeBoxAddflag) {
                return
            }
            groupInit.map((item) => {
                newGroupInit.push({
                    containerSizeTypeGroup: data.containerSizeTypeGroup,
                    containerSizeType: item,
                    cargoNatureCode: data.cargoNatureCode,
                    commissionContainerGroupUuid: idx++
                })
            })
            let sizeDetailedTableAll = sizeDetailedTable.concat(newGroupInit)
            setSizeDetailedTable([...sizeDetailedTableAll])
            setNewSizeDetailedTable([...sizeDetailedTableAll])
        } else {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.Goods-category-required' }) });
        }
    }
    {/* 删除指定箱型尺寸 */ }
    const removeBtn = () => {
        setInfoTips({});
        if (checkedRow.length == 0) {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.Unclock-tips' }) });
        }
        if (checkedRow.length == sizeDetailedTable.length) {
            setSizeDetailedTable([])
            setCheckedRow([])
            setChecked([])
        }
        let newSizeDetailedTable3 = sizeDetailedTable;
        let sizeDetailedSelectedRows3 = [...checkedRow];
        for (var i = 0; i < checkedRow.length; i++) {
            for (var j = 0; j < sizeDetailedTable.length; j++) {
                if (checkedRow[i].commissionContainerGroupUuid == sizeDetailedTable[j].commissionContainerGroupUuid) {
                    newSizeDetailedTable3.splice(j, 1)
                    sizeDetailedSelectedRows3.splice(i, 1)
                }
            }
        }
        setSizeDetailedTable([...newSizeDetailedTable3])
        setCheckedRow([...sizeDetailedSelectedRows3])
    }
    {/* 删除全部箱型尺寸 */ }
    const deleteAllBtn = () => {
        setInfoTips({});
        setSizeDetailedTable([])
        setCheckedRow([])
        setChecked([])
    }
    {/* 公司&&代理联动 */ }
    const selectBtn = (value, all) => {
        if (all.value == "") {
            queryForm.setFieldsValue({
                popData: {
                    agencyCode: null
                }
            })
        } else {
            // queryForm.setFieldsValue({
            //     popData:{
            //         agencyCode: all.linkage.sapCustomerCode
            //     }
            // })
            queryForm.setFieldsValue({
                popData: {
                    agencyCode: all.linkage.sapCustomerCode,
                    subAgencyCode: all.linkage.sapCustomerCode,
                }
            })
            let data = all.linkage.companyCode
            companyAgency($apiUrl, data, setAgencyCode)
        }
    }
    const companyIncident = async (value, all) => {
        if (all.linkage) {
            let data = all.linkage.companyCode
            companyAgency($apiUrl, data, setAgencyCode)
        }
    }
    const agreements = async (value, number) => {
        let val = value ? value.target.value : number
        val == 1 ? setValuesAgreement(true) : setValuesAgreement(false)
    }

    return (
        <div className='parent-box'>
            <div className='header-from'>
                <Form form={queryForm} onFinish={handleQuery} >
                    <Row>
                        {/* 船东 */}
                        <SelectVal name='shipperOwner' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} disabled={company.companyType == 0 ? true : false} span={6} flag={true} />
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route' />} span={6} />
                        {/* <SelectVal span={6} name='serviceLoopCode' label={<FormattedMessage id='lbl.route' />} options={route.values} /> */}
                        {/* 装港 */}
                        <InputText span={6} name='pol' label={<FormattedMessage id='lbl.Loading-port' />} />
                        {/* 卸港 */}
                        <InputText span={6} name='pod' label={<FormattedMessage id='lbl.Unloading-port' />} />
                        {/* 协议状态 */}
                        <SelectVal span={6} name='status' label={<FormattedMessage id='lbl.ProtocolState' />} options={protocolStateData.values} />
                        {/* 协议号 */}
                        <InputText name='commissionAgreementCode' label={<FormattedMessage id='lbl.protocol' />} span={6} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-CMS-BANLIE-003-B10'><FileAddOutlined /><FormattedMessage id='lbl.new-btn' /></CosButton>
                    {/* 复制 */}
                    {/* <CosButton onClick={copyBtn} disabled={copyShow ? false : true} auth='AFCM-CMS-BANLIE-003-B09'><CopyOutlined /><FormattedMessage id='lbl.copy' /></CosButton> */}
                    {/* 下载按钮 */}
                    {/* <Button onClick={downloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='lbl.download' /></Button> */}
                    {/* 下载 */}
                    <CosDownLoadBtn
                        disabled={checkedRow.length == 1 ? false : true}
                        downLoadTitle={'menu.afcm.trainComm.trainAgreement'}
                        downColumns={[{ dataCol: columns }, { dataCol: boxColumn }, { dataCol: pteColumn }]}
                        downLoadUrl={'TRAIN_COMM_TRAIN_AGREEMENT_DOWNLOAD_BTN'}
                        downUuids={[checkedRow[0]?.agreementHeadUuid]}
                        setSpinflag={setSpinflag}
                        btnName={'lbl.download'} />
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button onClick={clearBtn}>< ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询 */}
                    <Button onClick={() => pageChange(page, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='agreementHeadUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    selectedRowKeys={selectedRowKeys}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            setChecked(key);
                            setCheckedRow(row);
                            setCopyShow(true)
                            setCopydata(row)
                            setLastCondition(queryForm.getFieldValue())
                        }
                    }}
                />
            </div>
            {/* 弹窗 */}
            {/* <Modal title={txt} visible={isModalVisible} footer={null} width={"90%"} height={"100%"} onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={1250} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
                <CosToast toast={infoTips} />
                <div className='add'>
                    <div className='topBox'>
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 船东 company.companyType == 0 ? true : false*/}
                                {/* <InputText span={6} name={['popData', 'shipownerCompanyCode']} label={<FormattedMessage id='lbl.route' />} required/> */}
                                <SelectVal name={['popData', 'shipownerCompanyCode']} label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} span={6} disabled={headFlag} isSpan={true} required/>
                                {/* 航线 */}
                                {/* <SelectVal showSearch={true} span={6} name={['popData', 'serviceLoopCode']} label={<FormattedMessage id='lbl.route' />} options={[]} /> */}
                                <InputText span={6} name={['popData', 'serviceLoopCode']} label={<FormattedMessage id='lbl.route' />} disabled={headFlag} required/>
                                {/* 装港 */}
                                <InputText span={6} name={['popData', 'pol']} label={<FormattedMessage id='lbl.Loading-port' />} disabled={headFlag} required/>
                                {/* 卸港 */}
                                <InputText span={6} name={['popData', 'pod']} label={<FormattedMessage id='lbl.Unloading-port' />} disabled={headFlag} required/>
                                {/* 开始日期/结束日期 */}
                                {/* style={{ background: backFlag ? 'white' : 'yellow' }} */}
                                <DoubleDatePicker flag={false} disabled={[false, false]} name={['popData', 'activityDate']} label={<FormattedMessage id='lbl.start-date' />} span={6} disabled={headFlag} isSpan={true} required/>
                                {/* 协议号 */}
                                <InputText disabled span={6} name={['popData', 'commissionAgreementCode']} label={<FormattedMessage id='lbl.protocol' />}/>
                                {/* 备注 */}
                                <InputText span={6} name={['popData', 'note']} disabled={headFlag} label={<FormattedMessage id='lbl.ac.pymt.claim-note' />} />
                            </Row>
                        </Form>
                    </div>
                    <div className='add-main-button'>
                        {/* 保存 */}
                        <CosButton onClick={() => handleSave('SAVE')} disabled={buttonFlag ? true : false} auth='AFCM-CMS-BANLIE-003-B01'><SaveOutlined /><FormattedMessage id='lbl.save' /></CosButton>
                        {/* 提交生效 */}
                        <CosButton onClick={() => handleSave('SUBMIT')} disabled={submitFlag ? true : false} ><FileProtectOutlined /><FormattedMessage id='lbl.Submit-effective' /></CosButton>
                    </div>
                    <div className="groupBox">
                        <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                            <TabPane tab={<FormattedMessage id='lbl.agreement-item' />} key="1">
                                {/* new item */}
                                {/* <Button onClick={addItem} disabled={addFlag} style={{ marginLeft: '10px' }} ><PlusOutlined /></Button>
                                <div className="table">
                                    <PaginationTable
                                        dataSource={detailData}
                                        columns={detailColumn}
                                        rowKey='commissionTypeItemUuid'
                                        setSelectedRows={setSelectedRows}
                                        pagination={false}
                                        selectionType='radio'
                                        scrollHeightMinus={200}
                                        rowSelection={{ selectedRowKeys: [commissionTypeItemUuid] }}
                                    />
                                </div>
                                <div className="table" hidden={showFlag} style={{ width: '50%' }}>
                                    <div style={{ padding: '10px 0px 10px 10px' }}><FormattedMessage id='lbl.box-calculation-detailed' /></div>
                                    <Button disabled={addsFlag} style={{ margin: '0 0 10px 10px' }} onClick={addItemDetailed}><PlusOutlined /></Button>
                                    <PaginationTable
                                        dataSource={detailsData}
                                        columns={detailsColumn}
                                        rowKey='commissionContainerPriceUuid'
                                        pagination={false}
                                        scrollHeightMinus={200}
                                        rowSelection={false}
                                    />
                                </div> */}
                                {/* 箱量计算法明细 */}
                                {/* disabled={groupFlag} */}
                                <Button disabled={groupFlag} onClick={addBox} style={{ marginLeft: '10px' }} ><PlusOutlined /></Button><span><FormattedMessage id='lbl.train-comm-004' /></span>
                                <div className="table">
                                    <PaginationTable
                                        dataSource={boxData}
                                        columns={boxColumn}
                                        rowKey='commissionTypeItemUuid'
                                        pagination={false}
                                        scrollHeightMinus={200}
                                        rowSelection={false}
                                    />
                                </div>
                                {/* 百分比算法明细 */}
                                <Button disabled={groupFlag} onClick={addPte} style={{ marginLeft: '10px' }} ><PlusOutlined /></Button><span><FormattedMessage id='lbl.train-comm-005' /></span>
                                <div className="table" style={{ width: '50%' }}>
                                    <PaginationTable
                                        dataSource={pteData}
                                        columns={pteColumn}
                                        rowKey='commissionTypeItemUuid'
                                        pagination={false}
                                        scrollHeightMinus={200}
                                        rowSelection={false}
                                    />
                                </div>
                            </TabPane>
                            {/* 箱型尺寸组 */}
                            <TabPane tab={<FormattedMessage id='lbl.train-comm-003' />} key="2">
                                <div className="table" style={{ width: '50%' }}>
                                    <PaginationTable
                                        dataSource={groupData}
                                        columns={groupColumn}
                                        rowKey='commissionTypeItemUuid'
                                        pagination={false}
                                        scrollHeightMinus={200}
                                        rowSelection={false}
                                    />
                                </div>
                                {/* 箱型尺寸组信息 */}
                                {/* <div style={{ width: '40%', border: '1px solid #aaaaaa', padding: '10px', display: 'inline-block', borderRadius: '10px' }}>
                                    <div><FormattedMessage id='lbl.group-message' /></div><br />
                                    <ul className="list" ref={boxSizeref}>
                                        <li style={{ height: 20 }}>
                                            <div><FormattedMessage id='lbl.operate' /></div>
                                            <div><FormattedMessage id='lbl.detailed' /></div>
                                            <div><FormattedMessage id='lbl.Box-size-group' /></div>
                                        </li>
                                        {groupDatas.map((item, index) => {
                                            return <li key={index}>
                                                <div>
                                                    <a onClick={() => editBox(item)} disabled={groupFlag}><EditOutlined /></a>
                                                    <a onClick={() => deleteBox(item, index)} disabled={groupFlag}><CloseCircleOutlined /></a>
                                                </div>
                                                <div><RightCircleOutlined className={openBoxSizedetailIndex == index ? "is-open-boxsize" : ""} onClick={() => openBoxSizedetail(index)} /></div>
                                                <div><RightCircleOutlined style={{ visibility: 'hidden' }} />{item && item.containerSizeTypeGroup || <small>&nbsp;</small>}</div>
                                                <ul style={{ display: openBoxSizedetailIndex === index ? 'block' : 'none' }}>
                                                    <li style={{ height: 20 }}>
                                                        <span></span>
                                                        <div style={{ background: '#95B3D7' }}><FormattedMessage id='lbl.Box-size' /></div>
                                                        <div style={{ background: '#95B3D7' }}><FormattedMessage id='lbl.cargo-class' /></div>
                                                    </li>
                                                    {item && item.containerCargoDetails.map((val, idx) => {
                                                        return <li key={idx}>
                                                            <span></span>
                                                            <div>{val.containerSizeType}</div>
                                                            <div>{val.cargoNatureCode}</div>
                                                        </li>
                                                    })}
                                                </ul>
                                            </li>
                                        })}
                                    </ul>
                                </div> */}
                                {/* 箱型尺寸组新增画面 */}
                                {/* <div className='box-size-group' >
                                    <div><FormattedMessage id='lbl.box-size-add-frame' /></div>
                                    <div className='box-size-group-main'>
                                        <Form form={queryForm}>
                                            <Row className='box-size-group-main-input'>
                                                <InputText span={10} isSpan={true} name='containerSizeTypeGroup' maxLength={4} disabled={groupFlag} label={<FormattedMessage id='lbl.Box-size-group' />} />
                                                <SelectVal span={10} isSpan={true} name='cargoNatureCode' label={<FormattedMessage id='lbl.cargo-class' />} options={natureCode.values} disabled={groupFlag} />
                                            </Row>
                                            <Row className='box-size-group-main-input'>

                                            </Row>
                                            <Row className='box-size-group-main-input'> */}
                                                {/* 箱型尺寸 */}
                                                {/* <div className='box-size-group-main-input-left'>
                                                    <div className='box-size'><FormattedMessage id='lbl.Box-size' /></div>
                                                    <ul className='box-size-ul'>
                                                        {
                                                            groupInit ? groupInit.map((v, i) => {
                                                                return <li onClick={() => changeIdx(i)} className={currentIndex == i ? 'current' : ''} key={i} style={{ height: '25px', lineHeight: '25px', cursor: 'pointer' }}><span>{v}</span></li>
                                                            }) : ""
                                                        }
                                                    </ul>
                                                </div>
                                                <div className="box-size-group-main-input-center-button">
                                                    <Button onClick={newBtn} disabled={groupFlag}><RightOutlined /></Button>
                                                    <Button onClick={allBtn} disabled={groupFlag}><DoubleRightOutlined /></Button>
                                                    <Button onClick={removeBtn} disabled={groupFlag}><LeftOutlined /></Button>
                                                    <Button onClick={deleteAllBtn} disabled={groupFlag}><DoubleLeftOutlined /></Button>
                                                </div> */}
                                                {/* 箱型尺寸详细 */}
                                                {/* <div className="box-size-group-main-input-bottom" >
                                                    <div className='box-size-detail'><FormattedMessage id='lbl.Box-size-detailed' /></div>
                                                    <PaginationTable
                                                        dataSource={sizeDetailedTable}
                                                        columns={sizeDetailedColumns}
                                                        rowKey='commissionContainerGroupUuid'
                                                        scroll={{ y: 100 }}
                                                        pagination={false}
                                                        scroll={{ y: 230 }}
                                                        selectedRowKeys={selectedRowKeys}
                                                        rowSelection={{
                                                            selectedRowKeys: checked,
                                                            onChange: (key, row) => {
                                                                setChecked(key);
                                                                setCheckedRow(row);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </Row> */}
                                            {/* 保存/重置箱型尺寸 */}
                                            {/* <Row style={{ margin: '15px 0', float: 'right', marginRight: '10px' }}>
                                                <Col style={{ marginRight: '15px' }}><CosButton onClick={saveBox} disabled={groupFlag} auth='AFCM-CMS-BANLIE-003-B07'><FormattedMessage id='lbl.preservation-box-size' /></CosButton></Col>
                                                <Col><Button onClick={resetBox} disabled={groupFlag}><FormattedMessage id='lbl.reset-box-size' /></Button></Col>
                                            </Row>
                                        </Form> */}
                                    {/* </div>
                                </div> */}
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            </CosModal>
            <AgreementDatail copydatas={copydatas} />
            <LogPopUp logData={logData} />
            <Loading spinning={spinflag} />
        </div>
    )

}
export default trainAgreement