{/* 协议维护-激励代理费-计算协议 */}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,  useIntl} from 'umi'
import request from '@/utils/request';
import { acquireSelectData,  acquireSelectDataExtend, momentFormat,getStatus,agencyCodeData} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText';
import SelectVal from '@/components/Common/Select';
import { Button, Form, Row, Input, Tooltip, Modal, Select,InputNumber} from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import LogPopUp from '../commissions/agmt/LogPopUp';
import moment from 'moment';
import CosButton from '@/components/Common/CosButton'
import {CosToast}  from '@/components/Common/index'
import CosModal from '@/components/Common/CosModal'

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    ReadOutlined,//日志
    FileAddOutlined,//新增
    SaveOutlined, //保存
    CloudDownloadOutlined,//日志
    SearchOutlined,//查询
    ReloadOutlined,//重置
    PlusOutlined, //新增item
    FileProtectOutlined, //提交
    UploadOutlined , //上载
    SelectOutlined, // 选择
} from '@ant-design/icons'
const confirm = Modal.confirm

const calcProtocol =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [status, setStatus] = useState({});    // 状态
    const [tableData,setTableData] = useState([]) // table数据
    const [tabTotal,setTabTotal ] = useState([]) // table条数
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [addFlag,setAddFlag] = useState(false)//动态增加按钮是否禁用
    const [txt, setTxt] = useState(''); //弹窗标题
    const [writeFlag,setWriteFlag] = useState(false);//控制读写
    const [editFlag,setEditFlag] = useState(false);//是否可编辑
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [submitFlag,setSubmitFlag] = useState(true)//提交按钮是否禁用
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const [backFlag3,setBackFlag3] = useState(true);//背景颜色
    const [queryDataCode, setQueryDataCode] = useState([]);   // 获取新增uid
    const [queryDatasCode, setQueryDatasCode] = useState([]);   // 获取明细uid
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [detailData, setDetailData] = useState([]);  //新增item数据
    const [feeType, setFeeType] = useState([]); //费用类型
    const [calculationMethod, setCalculationMethode] = useState([]); //计算方法
    const [feePriceType, setFeePriceType] = useState([]); //计算类型
    const [expansionImportIndicator, setExpansionImportIndicator] = useState([]); //进出口标记
    const [emptyFullIndicator, setEmptyFullIndicator] = useState([]); //空重箱标识
    const [socIndicator, setSocIndicator] = useState([]); //SOC空箱标识
    const [heryType, setHeryType] = useState([]); //层次类型
    const [saveFlag, setSaveFlag] = useState(false); //是否保存标记
    const [clickFlag, setClickFlag] = useState(false); //保存类型
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [edit,setEdit] = useState(true)//点击编辑
    const [feeCurrencyCode, setFeeCurrencyCode] = useState({}); // 币种
    const [infoTips, setInfoTips] = useState({});   //message info
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [company, setCompany,] = useState([]); // 代理编码默认companyType and companyCode
    const [uploadModal, setUploadModal] = useState(false);    // 上传
    const [data,setData] = useState({})  //file
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "feeAgreementCode": null,
        "shipownerCompanyCode": null,
    });

    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.KPI.AGMT.STATUS',setStatus, $apiUrl);// 状态
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE', setFeeCurrencyCode, $apiUrl);// 币种
        agencyCodeData($apiUrl, setAgencyCode,setCompany);     // 代理编码
    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        })
    }, [company, acquireData])

    {/* from 数据 */}
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    {/*  列表 */}
    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 80,
            align:'center',
            fixed: true,
            render:(text,record, index) => {
                return <div className='operation'>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={() => {deleteBtn(record, index)}} disabled={record.show?false:true} style={{color:record.show?'red':'#ccc'}}><CloseCircleOutlined/></a>&nbsp; */}
                        <a><CosButton auth='AFCM-AGMT-AG-KPI-001-B03' onClick={() => {deleteBtn(record, index)}} disabled={record.show?false:true} ><CloseCircleOutlined style={{color:record.show?'red':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        {/* <a onClick={() => {editViewBtn(record, false)}}  disabled={record.show?false:true}><FormOutlined/></a>&nbsp; */}
                        <a><CosButton auth='AFCM-AGMT-AG-KPI-001-B05' onClick={() => {editViewBtn(record, false)}} disabled={record.show?false:true} ><FormOutlined style={{color:record.show?'#1890ff':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => {editViewBtn(record, true)}}><FileSearchOutlined/></a>&nbsp; 
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => {logBtn(record)}}><ReadOutlined /></a>
                    </Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Agreement-num' />,// 协议编号
            dataIndex: 'feeAgreementCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.carrier' />,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            width: 50
        },
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.effective-start-date' />,// 有效开始日期
            dataIndex: 'fromDate',
            align:'left',
            width: 100
        },
        {
            title: <FormattedMessage id= 'lbl.effective-end-date' />,// 有效结束日期
            dataIndex: 'toDate',
            align:'left',
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.state' />,// 状态
            dataIndex: 'status',
            dataType: status.values,
            align:'left',
            width: 40
        },
        {
            title: <FormattedMessage id='lbl.ac.invoice.fee-type' />,// 费用类型
            dataIndex: 'feeType',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Computing-method'/>,// 计算方法
            dataIndex: 'calculationMethod',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.imputed-price' />,// 计算价格
            dataIndex: 'feePrice',
            dataType: 'dataAmount',
            align:'right',
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.imputed-type'/>,// 计算类型
            dataIndex: 'feePriceType',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.ccy'/>,// 币种
            dataIndex: 'feeCurrencyCode',
            align:'left',
            width: 40
        },
        {
            title: <FormattedMessage id='lbl.Import-export-sign' />,// 进出口标记
            dataIndex: 'expansionImportIndicator',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Empty-heavy-box-flag'/>,// 空重箱标识
            dataIndex: 'emptyFullIndicator',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Empty-soc-box-flag'/>,// SOC空箱标识
            dataIndex: 'socIndicator',
            align:'left',
            width: 100
        },
        {
            title: <FormattedMessage id='lbl.Route-group-code' />,// 航线组编码
            dataIndex: 'serviceGroupCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Son-agency-code' />,// 子代理编码
            dataIndex: 'subAgencyCode',
            align:'left',
            width: 80
        },
        {
            title: <FormattedMessage id='lbl.Arrangement-type'/>,// 层次类型
            dataIndex: 'heryType',
            align:'left',
            width: 80
        },
    ]
    {/* 明细 */}
    const detailColumn=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'center',
            fixed: false,
            render:(text,record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => {deleteItem(record, index)}} disabled={record.afcmKpiAgFeeAgreementUuid?true:false}><CloseCircleOutlined/></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => {editItem(text, record, index)}} disabled={edit?true:false}><FormOutlined/></a>&nbsp;
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ac.invoice.fee-type'/>,// 费用类型
            dataIndex: 'feeType',
            width: 70,
            render: (text, record) => {
				return <div>
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeType')} name='feeType' options={feeType} /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id= 'lbl.Computing-method'/>,// 计算方法
            dataIndex: 'calculationMethod',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select  defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'calculationMethod')} name='calculationMethod' options={calculationMethod} /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.imputed-price' />,// 计算价格
            dataIndex: 'feePrice',
            align:'right',
            width: 60,
            render: (text, record) => {
				return <div>
                    {record.saveShowHide ? <InputNumber defaultValue={text} autoComplete="off" min={0} onChange={(e) => getCommonIptVal(e, record, 'feePrice', true)} name='feePrice' /> : text}
                </div>
			}
        },
        {
            title: <FormattedMessage id='lbl.imputed-type'/>,// 计算类型
            dataIndex: 'feePriceType',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select  defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feePriceType')} name='feePriceType' options={feePriceType} /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.ccy'/>,// 币种
            dataIndex: 'feeCurrencyCode',
            width: 60,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select  defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} name='feeCurrencyCode' options={feeCurrencyCode.values} /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.Import-export-sign' />,// 进出口标记
            dataIndex: 'expansionImportIndicator',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select  defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'expansionImportIndicator')} name='expansionImportIndicator' options={expansionImportIndicator} /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.Empty-heavy-box-flag'/>,// 空重箱标识
            dataIndex: 'emptyFullIndicator',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select  defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'emptyFullIndicator')} name='emptyFullIndicator' options={emptyFullIndicator} /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.Empty-soc-box-flag'/>,// SOC空箱标识
            dataIndex: 'socIndicator',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select  defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'socIndicator')} name='socIndicator' options={socIndicator} /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.Route-group-code'/>,// 航线组编码
            dataIndex: 'serviceGroupCode',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Input defaultValue={text} maxLength={5}  autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'serviceGroupCode')} name='serviceGroupCode' /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.Son-agency-code' />,// 子代理编码
            dataIndex: 'subAgencyCode',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Input maxLength={10}  defaultValue={text} autoComplete="off"  maxLength={10} onChange={(e) => getCommonIptVal(e, record, 'subAgencyCode')} name='subAgencyCode' /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.Arrangement-type'/>,// 层次类型
            dataIndex: 'heryType',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select  defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'heryType')} name='heryType' options={heryType} /> : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id='lbl.Arrangement-type-code'/>,// 层次类型编码
            dataIndex: 'heryCode',
            width: 90,
            render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Input maxLength={10}  defaultValue={text} autoComplete="off"  maxLength={10} onChange={(e) => getCommonIptVal(e, record, 'heryCode')} name='heryCode' /> : text}
				</div>
			}
        },
    ]
    {/* 删除 */}
    const deleteBtn = (record,flag) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.afcm-delete'}),
            content: intl.formatMessage({id:'lbl.delete.select.content'}),
            okText: intl.formatMessage({id:'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const deleteData = await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_DELETE_UUID,{
                    method:'POST',
                    data:{
                        uuid: record.afcmKpiAgFeeAgreementUuid,
                    } 
                })
                if(deleteData.success) {
                    setSpinflag(false);
                    pageChange(page);
                    Toast('',deleteData.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                    Toast('', deleteData.errorMessage, 'alert-error', 5000, false);
                }
            }
        })   
    }
    {/* 新增 */}
    const addBtn = () => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id:'lbl.add'})); 
        setEditFlag(true);
        setWriteFlag(false);
        setButtonFlag(false);
        setEdit(false);
        setSubmitFlag(false);
        setAddFlag(false);
        setClickFlag(false)

        setSaveFlag(false);
        queryForm.setFieldsValue({
            popData: {
                feeAgreementCode: null,
                shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                agencyCode: null,
                activeDate: null,
            }
        })
        setTimeout(() => {
            setSpinflag(false);
            setIsModalVisible(true);
        }, 1000);
    }
    {/* 查看明细 */}
    const editViewBtn = async(record,flag) => {
        Toast('', '', '', 5000, false);
        setInfoTips({});
        initData()
        setClickFlag(true)
        setSpinflag(true);
        const result = await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_SEARCH_DETAIL,       
            {
                method:'POST',
                data: {
                    uuid: record.afcmKpiAgFeeAgreementUuid,
                }
            }
        )
        let data = result.data;
        if(result.success) {
            setSpinflag(false);
            setEditFlag(true)
            setAddFlag(flag);
            setEdit(flag);
            setWriteFlag(flag)
            setButtonFlag(flag)
            setSubmitFlag(flag)
            setQueryDatasCode([data.afcmKpiAgFeeAgreementUuid])
            queryForm.setFieldsValue({
                popData:{
                    agencyCode: data.agencyCode,
                    feeAgreementCode: data.feeAgreementCode,
                    activeDate: [moment(data.fromDate),moment(data.toDate)],
                    shipownerCompanyCode: data.shipownerCompanyCode,
                }
            })
            if(flag) {
                if(data.status=="Submit" ){
                    setButtonFlag(true);
                    setSubmitFlag(true);
                    setEdit(true);
                }else if(data.status=="Draft"){
                    setButtonFlag(true);
                    setSubmitFlag(true);
                    setEdit(true);
                }
                setTxt(intl.formatMessage({id:'lbl.ViewDetails'}));
            } else {
                if(data.status=="Submit"){
                    setButtonFlag(true);
                    setSubmitFlag(true);
                    setEdit(true);
                }else{
                    setAddFlag(flag);
                }
                setTxt(intl.formatMessage({id:'lbl.edit'}));
            }
            setDetailData([data])
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        let detailDatas = [];
        detailData.map((v, i) => {  //item明细
            detailDatas.push({
                afcmKpiAgFeeAgreementUuid: v.afcmKpiAgFeeAgreementUuid,  
                feeType: v.feeType,
                calculationMethod: v.calculationMethod,
                feePrice: v.feePrice,
                feePriceType: v.feePriceType,
                expansionImportIndicator: v.expansionImportIndicator,
                feeCurrencyCode: v.feeCurrencyCode,
                emptyFullIndicator: v.emptyFullIndicator,
                socIndicator: v.socIndicator,
                serviceGroupCode: v.serviceGroupCode,
                subAgencyCode: v.subAgencyCode,
                heryType: v.heryType,
                heryCode: v.heryCode,	
            })
        })
        if(!queryData.shipownerCompanyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.agencyCode){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.activeDate){setBackFlag3(false)}else{setBackFlag3(true)}
        if(!queryData.agencyCode || !queryData.shipownerCompanyCode || !queryData.activeDate){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Calc-protocol-warn'})});
            return
        }else if(clickFlag==false){
            setSpinflag(true);
            const save = await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_NEW_EDIT_SAVE,{
                method:"POST",
                data:{
                    operateType: "NEW" ,
                    "params": {
                        agencyCode: queryData.agencyCode,
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        feeAgreementCode: queryData.feeAgreementCode,
                        fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    },
                    "paramsList": detailDatas,
                }
            })
            let data = save.data
            if(save.success) {
                setSpinflag(false);
                setDetailData([...data]);
                let datas = save.data
                if(datas!=null){
                    let dataId = datas.map((item,index)=>{
                        return item.afcmKpiAgFeeAgreementUuid
                    })
                    setQueryDataCode(dataId)
                }
                queryForm.setFieldsValue({
                    popData:{
                        feeAgreementCode: data[0].feeAgreementCode,
                    }
                })
                setButtonFlag(false);
                setSaveFlag(true)
                getStatus(data,setDetailData,status)
                pageChange(page)
                setInfoTips({alertStatus: 'alert-success', message: save.message});
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
        }else{
            setSpinflag(true);
            const save = await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_NEW_EDIT_SAVE,{
                method:"POST",
                data:{
                    operateType: "UPD" ,
                    "params": {
                        agencyCode: queryData.agencyCode,
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        feeAgreementCode: queryData.feeAgreementCode,
                        fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    },
                    "paramsList": detailData,
                }
            })
            if(save.success) {
                setSpinflag(false);
                let data = save.data
                if(data!=null){
                    let dataId = data.map((item,index)=>{
                        return item.afcmKpiAgFeeAgreementUuid
                    })
                    setQueryDatasCode(dataId)
                }
                setButtonFlag(false);
                setSaveFlag(false)
                setDetailData(data)
                pageChange(page)
                setInfoTips({alertStatus: 'alert-success', message: save.message});
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
        }    
    }
    {/* 提交 */}
    const submitBtn = async() => {
        setInfoTips({});
        if(clickFlag==false){
            if(saveFlag==false){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Operate-warn'})});
                return;
            }else {
                setSpinflag(true);
                const submit =await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_SUBMIT,{
                    method:"POST",
                    data:{
                        uuids: queryDataCode
                    }
                })
                if(submit.success) {
                    setSpinflag(false);
                    setSubmitFlag(true);
                    pageChange(page)
                    setIsModalVisible(false)
                    Toast('',submit.message, 'alert-success', 5000, false)
                }else{
                    setSpinflag(false);
                    setInfoTips({alertStatus: 'alert-error', message: submit.errorMessage});
                }
            }
        }else{
            setSpinflag(true);
            const submit =await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_SUBMIT,{
                method:"POST",
                data:{
                    uuids: queryDatasCode
                }
            })
            if(submit.success) {
                setSpinflag(false);
                setSubmitFlag(true);
                pageChange(page)
                setIsModalVisible(false)
                setDetailData([])
                Toast('',submit.message, 'alert-success', 5000, false)
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: submit.errorMessage});
            }
        }
    }
    {/* 日志展示 */}
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
		setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }
    {/* 日志 */}
    const logBtn = async(record) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_SEARCH_LOG,       
            {
                method:'POST',
                data: {
                    params: {
                        referenceType: "KPI_AGMT",
                        referenceUuid: record.afcmKpiAgFeeAgreementUuid
                    }
                    
                }
            }
        )
        if(result.success) {
            setSpinflag(false);
            setJournalData(result.data)
            setIsModalVisibleLog(true);
            Toast('', result.message, 'alert-success', 5000, false);
        }else{
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 查询 */}
    const pageChange = async (pagination,search) =>{
        Toast('', '', '', 5000, false);  
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        const result = await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    ...queryData,
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                }
            }
        })
        let data=result.data
        if(result.success){
            setSpinflag(false);
            let datas=result.data.resultList
            if(datas!=null){
                datas.map((v,i)=>{
                    v.fromDate ? v["fromDate"] = v.fromDate.substring(0, 10) : null;
                    v.toDate ? v["toDate"] = v.toDate.substring(0, 10) : null;
                })
            }
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
            setSelectedRowKeys([...datas])
        }else {
            setSpinflag(false);
            setTableData([])
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 新增item */}
    const addItem = async()=>{
        setInfoTips({});
        setSpinflag(true);
        let newitem=await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_CHOOSE_INFO,{
            method:"POST",
        })
        let data=newitem.data
        // data.afcmKpiAgFeeAgreementUuid=detailData.length+1
        if(newitem.success){
            setSpinflag(false);
            data.id=detailData?detailData.length+1:''
            setFeeType(data.FEETYPE);
            setCalculationMethode(data.CALCULATIONMETHOD);
            setFeePriceType(data.FEEPRICETYPE)
            setExpansionImportIndicator(data.EXPANSIONIMPORTINDICATOR)
            setEmptyFullIndicator(data.EMPTYFULLINDICATOR)
            setSocIndicator(data.SOCINDICATOR)
            setHeryType(data.HERYTYPE)
            data.saveShowHide=true
            detailData.push(data)
            setDetailData([...detailData])
        }else{
            setSpinflag(false);
            setInfoTips({alertStatus: 'alert-error', message: newitem.errorMessage});
        }
    }
    {/* 数据初始化 */}
    const initData = async()=>{
        Toast('', '', '', 5000, false);
        let newitem=await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_CHOOSE_INFO,{
            method:"POST",
        })
        let data=newitem.data
        if(newitem.success){
            setFeeType(data.FEETYPE);
            setCalculationMethode(data.CALCULATIONMETHOD);
            setFeePriceType(data.FEEPRICETYPE)
            setExpansionImportIndicator(data.EXPANSIONIMPORTINDICATOR)
            setEmptyFullIndicator(data.EMPTYFULLINDICATOR)
            setSocIndicator(data.SOCINDICATOR)
            setHeryType(data.HERYTYPE)
        }else{
            Toast('', newitem.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 编辑item */}
    const editItem = (text, record, index)=>{
        setInfoTips({});
		let data = detailData;
        data[index].saveShowHide = true;
		setDetailData([...data]);
    }
    {/* 删除item项 */}
    const deleteItem = (record,index)=>{
        if(record.afcmKpiAgFeeAgreementUuid==null){
            record.afcmKpiAgFeeAgreementUuid=true
        }
        detailData.splice(index,1)
        setDetailData([...detailData])
    }
    {/* 取消 */}
    const handleCancel = () => {
        setInfoTips({});
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setIsModalVisible(false)
        setDetailData([]);
        queryForm.setFieldsValue({
            popData: null
        })
    }
    {/* 清空 */}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        setTableData([]);
        setChecked([]);
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
    }
    {/* 明细列表输入框 */}
    const getCommonIptVal = (e, record, name, flag) => {
        flag ? record[name] = e : record[name] = e.target.value;
    }
    {/* 明细列表下拉框 */}
    const getCommonSelectVal = (e, record, name) => {
        record[name] = e;
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setSpinflag(true);
        const result = await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_SEARCH_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    ...queryForm.getFieldValue(),
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.agreement.inspireAgFee.calcProtocol'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        feeAgreementCode: intl.formatMessage({id: "lbl.Agreement-num"}),
                        shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        fromDate: intl.formatMessage({id: "lbl.effective-start-date"}),
                        toDate: intl.formatMessage({id: "lbl.effective-end-date"}),
                        status: intl.formatMessage({id: "lbl.state"}),
                        feeType: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                        calculationMethod: intl.formatMessage({id: "lbl.Computing-method"}),
                        feePrice: intl.formatMessage({id: "lbl.imputed-price"}),
                        feePriceType: intl.formatMessage({id: "lbl.imputed-type"}),
                        feeCurrencyCode: intl.formatMessage({id: "lbl.ccy"}),
                        expansionImportIndicator: intl.formatMessage({id: "lbl.Import-export-sign"}),
                        emptyFullIndicator: intl.formatMessage({id: "lbl.Empty-heavy-box-flag"}),
                        socIndicator: intl.formatMessage({id: "lbl.Empty-soc-box-flag"}),
                        serviceGroupCode: intl.formatMessage({id: "lbl.Route-group-code"}),
                        subAgencyCode: intl.formatMessage({id: "lbl.Son-agency-code"}),
                        heryType: intl.formatMessage({id: "lbl.Arrangement-type"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.agreement.inspireAgFee.calcProtocol'}),//sheet名称
                }],
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        if(result.size==0){  //若无数据，则不下载
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false);
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agreement.inspireAgFee.calcProtocol'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.agreement.inspireAgFee.calcProtocol'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    {/* 下载模板 */}
    const downloadModal = async()=>{
        setInfoTips({});
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        const result = await request($apiUrl.CONFIG_DOWNLOADTEMP,{
            method:"POST",
            data: {
                excelFileName: "KPI-Agreement.xlsx"
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
        if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
            setSpinflag(false);
            navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agreement.inspireAgFee.calcProtocol'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
        } else {
            setSpinflag(false);
            let downloadElement = document.createElement('a');  //创建元素节点
            let href = window.URL.createObjectURL(blob); // 创建下载的链接
            downloadElement.href = href;
            downloadElement.download = intl.formatMessage({id: 'menu.afcm.agreement.inspireAgFee.calcProtocol'})+ '.xlsx'; // 下载后文件名
            document.body.appendChild(downloadElement); //添加元素
            downloadElement.click(); // 点击下载
            document.body.removeChild(downloadElement); // 下载完成移除元素
            window.URL.revokeObjectURL(href); // 释放掉blob对象
        }
    }
    {/* 上载 */}
    const uploadBtn = () =>{
        setInfoTips({});
        const file = document.getElementById('file').files[0]
        if(file){
            setData(file)
            let reader = new FileReader();
            reader.readAsBinaryString(file)
            reader.onload=function(){
            }
            console.log(file)
            uploadbuton(file)
        }
    }
    const uploadbuton = async(data) =>{
        Toast('', '', '', 5000, false);
        let fd = new FormData()
        fd.append('file',data)
        fd.append('name',data.name)
        fd.append('type',data.type)
        setSpinflag(true)
        console.log(fd)
        let result = await request($apiUrl.INCENTIVE_AG_FEE_CALC_PROTOCOL_UPLOAD,{
            method:'POST',
            data: fd,
            requestType:'form',
        })
        console.log(result)
        if(result.success){
            setSpinflag(false)
            pageChange(page)
            Toast('', result.message, 'alert-success', 5000, false);
        }else{
            setSpinflag(false)
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    return (
        <div className='parent-box'>
            <div className='header-from'>
                <Form 
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery}
                >
                    <Row>
                        {/* 船东 */}
                        <SelectVal span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} disabled={company.companyType == 0 ? true : false} options={acquireData.values}/>
                        {/* 代理编码 */}
                        <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>}  span={6}   maxLength={10}/> 
                        {/* 协议编码 */}
                        <InputText name='feeAgreementCode' label={<FormattedMessage id='lbl.Protocol-code'/>} span={6}  /> 
                        {/* 有效日期 */}
                        <DoubleDatePicker name='activeDate' flag={true}  label={<FormattedMessage id='lbl.valid-date'/>} span={6}/>
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增 */}
                    <CosButton  onClick={addBtn} auth='AFCM-AGMT-AG-KPI-001-B04'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                    {/* 上载 */}
                    <Button className='filebutton'><UploadOutlined  /> <input type="file" id="file"  onChange={() =>uploadBtn()}/> <FormattedMessage id='lbl.uploading'/></Button>
                    {/* 下载模板 */}
                    <CosButton onClick={downloadModal}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download-template'/></CosButton>
                    {/* 下载按钮 */}
                    <CosButton onClick={downloadBtn}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <CosButton onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询 */}
                    <CosButton onClick={()=> pageChange(page,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='afcmKpiAgFeeAgreementUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    rowSelection={null}
                    // selectedRowKeys = {selectedRowKeys}
                    // rowSelection={{
                    //     selectedRowKeys:checked,
                    //     onChange:(key, row)=>{
                    //         setChecked(key);
                    //         // setCheckedRow(row);
                    //     }
                    // }}
                />
            </div>
            {/* 弹窗 */}
            {/* <Modal title={txt} visible={isModalVisible} footer={null} width={"90%"} height={"50%"} onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={1200} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/> 
                <div className='add'>    
                    <div className='topBox' > 
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 船东 */}
                                <SelectVal disabled={writeFlag} style={{background:backFlag1?'white':'yellow'}} name={['popData','shipownerCompanyCode']} disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} span={6} isSpan={true}/>
                                {/* 代理编码 */}
                                {/* <SelectVal disabled={writeFlag} style={{background:backFlag2?'white':'yellow'}} name={['popData','agencyCode']} label={<FormattedMessage id='lbl.agency'/>}  span={6} options={agencyCode} flag={true} isSpan={true}/>  */}
                                <InputText disabled={writeFlag} style={{background:backFlag2?'white':'yellow'}} name={['popData','agencyCode']} label={<FormattedMessage id='lbl.agency'/>} span={6} isSpan={true} maxLength={10}/> 
                                {/* 协议编码 */}
                                <InputText disabled={editFlag} name={['popData','feeAgreementCode']} label={<FormattedMessage id='lbl.Protocol-code'/>} span={6} isSpan={true}/> 
                                {/* 有效日期 */}
                                <DoubleDatePicker disabled={writeFlag} style={{background:backFlag3?'white':'yellow'}} name={['popData','activeDate']} flag={false}  label={<FormattedMessage id='lbl.valid-date'/>} span={6} isSpan={true}/>
                            </Row>
                        </Form>
                    </div>
                    <div className='add-mail-button' style={{marginTop: '5px'}}> 
                        {/* 保存 */}
                        <CosButton onClick={handleSave} disabled={buttonFlag?true:false} auth='AFCM-AGMT-AG-KPI-001-B01'><SaveOutlined/><FormattedMessage id='lbl.save'/></CosButton>
                        {/* 提交 */}
                        <CosButton onClick={submitBtn} disabled={submitFlag?true:false} auth='AFCM-AGMT-AG-KPI-001-B02' style={{marginLeft: '10px'}}><FileProtectOutlined/><FormattedMessage id='lbl.Submit'/></CosButton>
                    </div>
                    <div className="groupBox">
                        {/* new item */}
                        <CosButton onClick={addItem} disabled={addFlag} style={{ marginLeft: '10px' }} ><PlusOutlined /></CosButton>
                        <div className="table">
                            <PaginationTable
                                dataSource={detailData}
                                columns={detailColumn}
                                rowKey='afcmKpiAgFeeAgreementUuid'
                                rowKey='id'
                                pagination={false}
                                scrollHeightMinus={200}
                                rowSelection={false}
                            />
                        </div>
                    </div>
                </div>
            </CosModal>
            <LogPopUp logData={logData}/>
            <Loading spinning={spinflag}/> 
        </div>
    )

}
export default calcProtocol