{/* 班列佣金-班列航线配置 */}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,  useIntl} from 'umi'
import request from '@/utils/request';
import { acquireSelectData, acquireSelectDataExtend, momentFormat,acquireCompanyData,allCompany,agencyCodeData} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText';
import Select from '@/components/Common/Select';
import { Button, Form, Row, Tooltip, Modal, } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import moment from 'moment';
import CosButton from '@/components/Common/CosButton'
import {CosToast}  from '@/components/Common/index'
import LogPopUp from '../commissions/agmt/LogPopUp';
import CosModal from '@/components/Common/CosModal'

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    FileAddOutlined,//新增
    SaveOutlined, //保存
    CloudDownloadOutlined,//日志
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CheckSquareOutlined ,
    CloseSquareOutlined ,
    ReadOutlined, //日志
} from '@ant-design/icons'
import { findLastKey } from 'lodash';
const confirm = Modal.confirm

const trainRoute =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [tableData,setTableData] = useState([]) // table数据
    const [tabTotal,setTabTotal ] = useState([]) // table条数
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [txt, setTxt] = useState(''); //弹窗标题
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]);  //选择行
    const [writeFlag,setWriteFlag] = useState(false);  //编辑修改权限
    const [signFlag,setSignFlag] = useState(true) //生效标记禁用
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const [hrchyType, setHrchyType] = useState({}); //层次类型
    const [validData, setValidData] = useState({}); //生效标记
    const [hidden,setHidden] = useState(false); //显示/隐藏
    const [infoTips, setInfoTips] = useState({});   //message info
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [companyData, setCompanyData] = useState('')
    const [PopupAcquireData, setPopupAcquireData] = useState([]); // 弹窗船东
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "shipownerCompanyCode": null,
        "companyCode": null,
        "hierarchyType": null,
        "serviceLoopCode": null,
        "validIndicator": null,
        "activeDate": null,
    });
    let formlayouts={
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
    }

    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('BANLIE.SVC.HRCHY.TYPES', setHrchyType, $apiUrl);  // 层次类型 
        acquireSelectData('VALID.INDICATOR', setValidData, $apiUrl);  // 生效标记 
        // acquireCompanyData(setCompanysData, $apiUrl);   // 公司
        // allCompany(setCompanysData,$apiUrl)
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        companys()
    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            // companyCode: companyData,
            // shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
            companyCode: '*',
            shipownerCompanyCode: '*'
        })
    }, [company, acquireData,companyData])
    useEffect(() => {   // 默认值
        shipowner();   // 船东
    }, [])
    {/* from 数据 */}
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    {/* 公司 */}
    const companys = async() =>{
        await request.post($apiUrl.AG_FEE_AGMT_SEARCH_INIT)
        .then((resul) => {
            if(!resul.data)return
            var data = resul.data.companys;
            data.map((val, idx)=> {
                val['value'] = val.companyCode ;
                val['label'] = val.companyCode + '-' + val.companyNameCn;

            })
            data.unshift({label: '*', value: "*"});
            setCompanysData(data);
        })

        let company = await request($apiUrl.CURRENTUSER,{
            method:"POST",
            data:{}
        })
        console.log(company)
        if(company.success){
            setCompanyData(company.data.companyCode)
        }
    }
    {/* 船东 */}
        const shipowner = async() => {
        await request.post($apiUrl.COMMON_DICT_ITEM + '?key=' + 'CB0068', {
            method:"POST",
        })
        .then((result) => {
            if(result.success) {
                let data = result.data.values;
                data.map((v, i) => {
                    v['value']=v.value
                    v['label']=v.value+'(' + v.label +')';
                })
                data.unshift({label: '*', value: "*"});
                setPopupAcquireData(data);
                console.log(data)
            }
        })
    }

    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align:'center',
            fixed: false,
            render:(text,record, index) => {
                return <div className='operation'>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={() => {deleteBtn(record, index)}} disabled={record.show?false:true} style={{color:record.show?'red':'#ccc'}}><CloseCircleOutlined/></a>&nbsp; */}
                        <a><CosButton auth='AFCM-CMS-BANLIE-001-B02' onClick={() => {deleteBtn(record, index)}} disabled={record.show?false:true} ><CloseCircleOutlined style={{color:record.show?'red':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        {/* <a onClick={() => {editViewBtn(record, false)}} disabled={record.show?false:true} ><FormOutlined/></a>&nbsp; */}
                        <a><CosButton auth='AFCM-CMS-BANLIE-001-B06' onClick={() => {editViewBtn(record, false)}} disabled={record.show?false:true}><FormOutlined style={{color:record.show?'#1890ff':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => {editViewBtn(record, true)}}><FileSearchOutlined/></a>&nbsp; 
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}><a onClick={() => {logBtn(record)}}><ReadOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.carrier'/>,//SO_COMPANY_CODE   
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Hrchy-type'/>,//HRCHY_TYPE  
            dataIndex: 'hierarchyType',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.company'/>,//公司
            dataIndex: 'companyCode',
            // dataType: companysData,
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.route'/>,//航线
            dataIndex: 'serviceLoopCode',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Take-effect-sign'/>,//生效标记
            dataIndex: 'validIndicator',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.effective-date'/>,//生效日期
            dataIndex: 'fromDate',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.expiration-date'/>,//失效日期
            dataIndex: 'toDate',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.effective-date-id'/>,//生效日期ID
            dataIndex: 'fromDateId',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.expiration-date-id'/>,//失效日期ID
            dataIndex: 'toDateId',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.update-date'/>,//更新时间
            dataIndex: 'recordUpdateDatetime',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Update-users'/>,//更新用户
            dataIndex: 'recordUpdateUser',
            align:'left', 
            sorter: false,
            width: 80,
        },
    ]

    {/* 查询 */}
    const pageChange = async (pagination,search) =>{
        Toast('', '', '', 5000, false);  
        let queryData = queryForm.getFieldValue()
        setSpinflag(true);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        const result = await request($apiUrl.TRAIN_COMM_TRAIN_ROUTE_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    // ...queryForm.getFieldValue(),
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    companyCode: queryData.companyCode,
                    hierarchyType: queryData.hierarchyType,
                    serviceLoopCode: queryData.serviceLoopCode,
                    validIndicator: queryData.validIndicator,
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
                    // v.recordUpdateDatetime ? v["recordUpdateDatetime"] = v.recordUpdateDatetime.substring(0, 10) : null;
                    if(companysData!=null){
                        companysData.map((val, i) => {
                            if(val.value == v.companyCode) {
                                v.companyCode =  val.label 
                            }
                        })
                    }
                })
            }
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
            setSelectedRowKeys([...datas])
        }
        else {
            setSpinflag(false);
            setTableData([])
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 新增 */}
    const addBtn = () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        setTxt(intl.formatMessage({id:'menu.afcm.trainComm.trainRoute'})); 
        setButtonFlag(false)
        setWriteFlag(false);
        setSignFlag(true);
        setHidden(true);
        queryForm.setFieldsValue({
            popData: {
                // shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                shipownerCompanyCode: '*',
                companyCode: '*',
                // companyCode: companyData,
                hierarchyType: null,
                serviceLoopCode: null,
                validIndicator: null,
                activeDate: null,
            }
        })
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,1000);
    }
    {/* 查看明细 */}
    const editViewBtn = async(record,flag) => {
        Toast('', '', '', 5000, false);
        setHidden(false)
        setSpinflag(true);
        const result = await request($apiUrl.TRAIN_COMM_TRAIN_ROUTE_SEARCH_DETAIL,      
            {
                method:'POST',
                data: {
                    uuid: record.id,
                }
            }
        )
        if(result.success) {
            setSpinflag(false);
            setButtonFlag(flag);
            setWriteFlag(flag);
            setSignFlag(true);
            let data = result.data;
            if(data.validIndicator=="N"){
                setWriteFlag(true);
                setButtonFlag(true);
            }
            queryForm.setFieldsValue({
                popData:{
                    shipownerCompanyCode: data.shipownerCompanyCode,
                    companyCode: data.companyCode,
                    hierarchyType: data.hierarchyType,
                    serviceLoopCode: data.serviceLoopCode,
                    validIndicator: data.validIndicator,
                    activeDate: [moment(data.fromDate),moment(data.toDate)],
                    id: data.id, 
                }
            })
            // if(flag) {
            //     setTxt(intl.formatMessage({id:'lbl.ViewDetails'}));
            // } else {
            //     setTxt(intl.formatMessage({id:'lbl.edit'}));
            // }
            setTxt(intl.formatMessage({id:'menu.afcm.trainComm.trainRoute'})); 
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 删除 */}
    const deleteBtn = async(record,flag) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id:'lbl.delete.select.content'}),
            okText: intl.formatMessage({id:'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const deleteData = await request($apiUrl.TRAIN_COMM_TRAIN_ROUTE_DELETE_UUID,{
                    method:'POST',
                    data:{
                        params:{
                            id: record.id,
                        }
                    } 
                })
                if(deleteData.success) {
                    setSpinflag(false);
                    setChecked([])
                    setCheckedRow([])
                    pageChange(page);
                    Toast('',deleteData.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                    Toast('',deleteData.errorMessage, 'alert-error', 5000, false)
                }
            }
        })   
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.hierarchyType){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.serviceLoopCode){setBackFlag2(false)}else{setBackFlag2(true)}
        if(/^[\u4e00-\u9fa5]+$/i.test(queryData.serviceLoopCode)){//检测输入的中文汉字
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});
            return
        }else if(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.serviceLoopCode)){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});//检测输入的中文符号
            return
        }
        if(queryData.serviceLoopCode){
            if(queryData.serviceLoopCode.length>15){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.route'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(!queryData.hierarchyType || !queryData.serviceLoopCode){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Train-route-warn'})});
           return;
       }else{
            setSpinflag(true);
            const save = await request($apiUrl.TRAIN_COMM_TRAIN_ROUTE_SAVE,{
                method:"POST",
                data:{
                    "params": {
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        companyCode: queryData.companyCode,
                        hierarchyType: queryData.hierarchyType,
                        serviceLoopCode: queryData.serviceLoopCode,
                        validIndicator: queryData.validIndicator,
                        fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                        id: queryData.id, 
                    },
                }
            })
            if(save.success) {
                setSpinflag(false);
                queryForm.resetFields()
                queryForm.setFieldsValue({
                    // companyCode: companyData,
                    companyCode: '*',
                    shipownerCompanyCode: '*'
                    // shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
                })
                setIsModalVisible(false)
                pageChange(page)
                Toast('', save.message, 'alert-success', 5000, false)
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
       }
    }
    {/* 清空 */}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            // companyCode: companyData,
            companyCode: '*',
            shipownerCompanyCode: '*'
            // shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        setTableData([]);
        setChecked([]);
        setCheckedRow([])
        setBackFlag1(true)
        setBackFlag2(true)
    }
    {/* 下载 */} 
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.TRAIN_COMM_TRAIN_ROUTE_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    // entryCode:"AFCM_B_BANLIE_SVC",
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    companyCode: queryData.companyCode,
                    hierarchyType: queryData.hierarchyType,
                    serviceLoopCode: queryData.serviceLoopCode,
                    validIndicator: queryData.validIndicator,
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.trainComm.trainRoute'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                        hierarchyType: intl.formatMessage({id: "lbl.Hrchy-type"}),
                        companyCode: intl.formatMessage({id: "lbl.company"}),
                        serviceLoopCode: intl.formatMessage({id: "lbl.route"}),
                        validIndicator: intl.formatMessage({id: "lbl.Take-effect-sign"}),
                        fromDate: intl.formatMessage({id: "lbl.effective-date"}),
                        toDate: intl.formatMessage({id: "lbl.expiration-date"}),
                        fromDateId: intl.formatMessage({id: "lbl.effective-date-id"}),
                        toDateId: intl.formatMessage({id: "lbl.expiration-date-id"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.update-date"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.Update-users"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.trainComm.trainRoute'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.trainComm.trainRoute'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.trainComm.trainRoute'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    {/* 取消 */}
    const handleCancel = () => {
        setInfoTips({});
        setBackFlag1(true)
        setBackFlag2(true)
        setIsModalVisible(false)
        queryForm.setFieldsValue({
            popData: null
        })
    }
    const effectBtn = (type)=>{
        Toast('', '', '', 5000, false);
        console.log(checkedRow)
        const confirmModal = confirm({
            title: intl.formatMessage({id: type=='Y'?'lbl.Confirmation-effectiveness':type=='N'?'lbl.Confirmation-failure':null}),
            content: intl.formatMessage({id: 'lbl.confirmable'}),
            okText: intl.formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const save = await request($apiUrl.TRAIN_COMM_TRAIN_ROUTE_SAVE,{
                    method:"POST",
                    data:{
                        "params": {
                            shipownerCompanyCode: checkedRow[0].shipownerCompanyCode,
                            companyCode: checkedRow[0].companyCode,
                            hierarchyType: checkedRow[0].hierarchyType,
                            serviceLoopCode: checkedRow[0].serviceLoopCode,
                            validIndicator: type,
                            fromDate: checkedRow[0].fromDate + ' 00:00:00',
                            toDate: checkedRow[0].toDate + ' 00:00:00',
                            id: checkedRow[0].id, 
                        },
                    }
                })
                if(save.success) {
                    setSpinflag(false);
                    setChecked([])
                    setCheckedRow([])
                    pageChange(page)
                    Toast('', save.message, 'alert-success', 5000, false)
                }else{
                    setSpinflag(false);
                    Toast('', save.errorMessage, 'alert-error', 5000, false)
                }
            }
        })   
    }

    {/* 日志展示 */}
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
        setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }
    {/* 日志 */}
    const logBtn = async(record)=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_SEARCH_LOG,       
            {
                method:'POST',
                data: {
                    params: {
                        referenceType: "BANLIE_LOOP",
                        referenceUuid: record.id
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
                        {/* <Select  name='shipownerCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} flag={true} span={6}/> */}
                        <Select span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} options={PopupAcquireData}/>
                        {/* 公司 */}
                        <Select name='companyCode' label={<FormattedMessage id='lbl.company'/>} options={companysData} span={6} showSearch={true} flag={true}/>
                        {/* HRCHY_TYPE */}
                        <Select name='hierarchyType' label={<FormattedMessage id='lbl.Hrchy-type'/>} options={hrchyType.values} span={6} flag={true}/>
                        {/* 生效日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.effective-date'/>} span={6} formlayouts={formlayouts} /> 
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>} span={6} />
                        {/* 生效标记 */}
                        <Select name='validIndicator' label={<FormattedMessage id='lbl.Take-effect-sign'/>} options={validData.values} span={6} flag={true}/>
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增 */}
                    <CosButton  onClick={addBtn} auth='AFCM-CMS-BANLIE-001-B03'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                    {/* 生效 */}
                    <CosButton  onClick={()=>effectBtn('Y')} disabled={checkedRow.length == 1 && checkedRow[0].validIndicator == "N" ? false : true} auth='AFCM-CMS-BANLIE-001-B04'><CheckSquareOutlined  /><FormattedMessage id='lbl.Take-effect'/></CosButton>
                    {/* 失效 */}
                    <CosButton  onClick={()=>effectBtn('N')} disabled={checkedRow.length == 1 && checkedRow[0].validIndicator == "Y" ? false : true} auth='AFCM-CMS-BANLIE-001-B05'><CloseSquareOutlined /><FormattedMessage id='lbl.Invalid'/></CosButton>
                    {/* 下载按钮 */}
                    <Button onClick={downloadBtn}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询 */}
                    <Button onClick={()=> pageChange(page,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    selectedRowKeys = {selectedRowKeys}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setCheckedRow(row);
                        }
                    }}
                />
            </div>
            {/* 弹窗 */}
            {/* <Modal title={txt} visible={isModalVisible} footer={null} width={"50%"} height={"50%"} onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/>  
                <div className='modalContent' style={{minWidth: '300px'}}>    
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 船东 */}
                                {/* <Select  name={['popData','shipownerCompanyCode']} disabled={writeFlag} disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} span={12} isSpan={true} flag={true}/> */}
                                <Select span={12} name={['popData','shipownerCompanyCode']} disabled={writeFlag} label={<FormattedMessage id='lbl.carrier'/>} options={PopupAcquireData} isSpan={true}/>
                                {/* 公司 */}
                                <Select name={['popData','companyCode']} disabled={writeFlag} label={<FormattedMessage id='lbl.company'/>} options={companysData} span={12} showSearch={true} isSpan={true}/>
                                {/* HRCHY_TYPE */}
                                <Select name={['popData','hierarchyType']} disabled={writeFlag} style={{background:backFlag1?'white':'yellow'}} label={<FormattedMessage id='lbl.Hrchy-type'/>} options={hrchyType.values} span={12} isSpan={true} flag={true}/>
                                {/* 生效日期 */}
                                <DoubleDatePicker flag={false} disabled={writeFlag} name={['popData','activeDate']} label={<FormattedMessage id='lbl.effective-date'/>} span={12} isSpan={true}/> 
                                {/* 航线 */}
                                <InputText name={['popData','serviceLoopCode']} disabled={writeFlag} styleFlag={backFlag2} label={<FormattedMessage id='lbl.route'/>} span={12} maxLength={15} isSpan={true}/>
                                {/* 生效标记 */}
                                <Select name={['popData','validIndicator']} disabled={signFlag} label={<FormattedMessage id='lbl.Take-effect-sign'/>} options={validData.values}  span={12} isSpan={true} flag={true} hidden={hidden}/>
                            </Row>
                        </Form>
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存 */}
                                <CosButton disabled={buttonFlag?true:false} onClick={() => handleSave()} auth='AFCM-CMS-BANLIE-001-B01'><FormattedMessage id='lbl.save' /></CosButton>
                                {/* 取消 */}
                                <Button onClick={() => handleCancel()}><FormattedMessage id='lbl.cancel' /></Button>
                            </div>
                    </div>
                </div>
            </CosModal>
            <LogPopUp logData={logData}/>
            <Loading spinning={spinflag}/> 
        </div>
    )

}
export default trainRoute