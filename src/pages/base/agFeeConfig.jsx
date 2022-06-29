{/*代理费利润中心配置*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage, useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import {acquireSelectData, momentFormat, getStatus} from '@/utils/commonDataInterface';
import Selects from '@/components/Common/Select';
import { Button, Form, Row, Tooltip,Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import moment from 'moment';
import Loading from '@/components/Common/Loading';
import LogPopUp from '../commissions/agmt/LogPopUp';
import {CosToast}  from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import CosModal from '@/components/Common/CosModal'

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    FileAddOutlined,//新增
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载 
    SaveOutlined, //保存
    FileProtectOutlined, //提交
    ReadOutlined, //日志
} from '@ant-design/icons'

const confirm = Modal.confirm

const commConfig =()=> {
    const [tableData, setTableData] = useState([]);     // table数据
    const [tabTotal,setTabTotal] = useState([]);//table条数
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用代码
    const [feeTypeDel,setFeeTypeDel] = useState ([]) //费用代码
    const [txt, setTxt] = useState(''); //新增
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [writeFlag,setWriteFlag] = useState(false);  //编辑修改权限
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [submitFlag,setSubmitFlag] = useState(true)//提交按钮是否禁用
    const [direction,setDirection ]= useState({})//航向
    const [department, setDepartment] = useState([]); // 责任部门
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const [backFlag3,setBackFlag3] = useState(true);//背景颜色
    const [backFlag4,setBackFlag4] = useState(true);//背景颜色
    const [backFlag5,setBackFlag5] = useState(true);//背景颜色
    const [backFlag6,setBackFlag6] = useState(true);//背景颜色
    const [backFlag7,setBackFlag7] = useState(true);//背景颜色
    const [uid, setUid] = useState(""); // 获取uid
    const [companysData, setCompanysData] = useState([]);    // 公司
    const [infoTips, setInfoTips] = useState({});   //message info
    const [status, setStatus] = useState({});    // 状态
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    let formlayouts={
        labelCol: { span: 9 },
        wrapperCol: { span: 15 }
    }
    
	const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue(),
        })
    }
	const [lastCondition, setLastCondition] = useState({
        "feeClass": null,
        "feeType": null,
        "serviceLoopCode": null,
        "directionCode": null,
        "departmentCode": null,
        "tradeLaneCode": null,
        "activeDate": null,
    });
     {/*初始化*/}
	useEffect(()=>{
        acquireSelectData('DIRECTION',setDirection, $apiUrl);// 航向
        depart()  //责任部门
        costCategories()  //费用大类/费用代码联动
        searchCompanyCode($apiUrl,setCompanysData) 
        acquireSelectData('AFCM.KPI.AGMT.STATUS',setStatus, $apiUrl);// 状态
        getFeeType()
        getFeeTypeDel()
    },[])
    {/* 公司代码 */}
    const searchCompanyCode = async(apiUrl,setCompanysData)=>{
        const result = await request(apiUrl.COMMON_COMPANY_CURRENTUSER,{
            method:"POST",
        })
        if(result.success){
            let companyCodeData =result.data.companyCode
            setCompanysData(companyCodeData)
        }
    }

    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'center',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.delete' />}><a onClick={() => {deleteBtn(record, index)}} disabled={record.show?false:true} style={{color:record.show?'red':'#ccc'}}><CloseCircleOutlined/></a>&nbsp;</Tooltip>&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a><CosButton auth='AFCM-AG-PROFIT-001-B02' onClick={() => {deleteBtn(record, index)}} disabled={record.show?false:true} ><CloseCircleOutlined style={{color:record.show?'red':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={() => {editViewBtn(record, false)}}  disabled={record.show?false:true}><FormOutlined/></a>&nbsp;</Tooltip>&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-AG-PROFIT-001-B01' onClick={() => {editViewBtn(record, false)}} disabled={record.show?false:true} ><FormOutlined style={{color:record.show?'#1890ff':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}> <a onClick={() => {editViewBtn(record, true)}}><FileSearchOutlined/></a>&nbsp; </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}><a onClick={() => {logBtn(record)}}><ReadOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.argue.chargeCode'/>,//费用代码
            dataIndex: 'feeType',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.route'/>,//航线
            dataIndex: 'serviceLoopCode',
            sorter: false,
            width: 40,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.course'/>,//航向
            dataIndex: 'directionCode',
            sorter: false,
            width: 40,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Trade-lane-code'/>,//TradeLaneCode
            dataIndex: 'tradeLaneCode',
            sorter: false,
            width: 100,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.effective-date'/>,//生效日期
            dataIndex: 'fromDate',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.expiration-date'/>,//失效日期
            dataIndex: 'toDate',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.state'/>,//状态
            dataIndex: 'status',
            dataType: status.values,
            sorter: false,
            width: 40,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.ac.fee.department'/>,//责任部门
            dataIndex: 'departmentCode',
            dataType: department,
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-people' />,//更新人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-date'/>,//更新日期
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            width: 60,
            align:'left', 
        },
    ]
    {/* 费用大类 */}
    const costCategories = async() => {
        const result = await request($apiUrl.BASE_AG_FEE_CONFIG_SEARCH_AG_FEE,{
            method:'POST'
        })
        if(result.success){
            if(result.success) {
                let data = result.data
                if(data!=null){
                    data.map((v,i)=>{
                        v['value']=v.feeCode;
                        // v['label']=v.feeCode + '(' + v.feeName +')';
                        v['label']=v.feeName;
                        v.listAgTypeToClass.push({
                            feeCode: "*",
                            feeName: "*",
                            label: "*",
                            value: "*",
                        })
                    })
                }
                setFeeClass(data)
            }
        }
    }
    {/* 表格的下拉框onchange事件 */}
    const getCommonSelectVal = (e,record,name) =>{
        record[name]=e
        if(record.key==null){
            setFeeType([])
            getFeeType()
        }
        if(feeClass!=null){
            feeClass.map((v,i)=>{
                if(e==v.value){
                    let list=v.listAgTypeToClass
                    list.map((v,i)=>{
                        v['value']=v.feeCode
                        // v['label']=v.feeCode+'(' + v.feeName +')';
                        v['label']=v.feeName;
                    })
                    if(v.listAgTypeToClass.length==list.length){
                        setFeeType(list) 
                    }
                    console.log(list)
                }else{
                    queryForm.setFieldsValue({
                        feeType: null,
                    })
                }
            })   
        }
    }
    const getFeeType = () =>{
        let data = []
        data.push({label: '*', value: "*"});
        setFeeType(data)
    }
    const getFeeTypeDel = () =>{
        let data = []
        data.push({label: '*', value: "*"});
        setFeeTypeDel(data)
    }
    {/* 弹窗 */}
    const getCommonSelectDtlVal = (e,record,name) =>{
        record[name]=e
        if(record.key==null){
            setFeeTypeDel([])
            getFeeTypeDel()
        }
        if(feeClass!=null){
            feeClass.map((v,i)=>{
                if(e==v.value){
                    let list=v.listAgTypeToClass
                    list.map((v,i)=>{
                        v['value']=v.feeCode
                        // v['label']=v.feeCode+'(' + v.feeName +')';
                        v['label']=v.feeName;
                    })
                    if(v.listAgTypeToClass.length==list.length){
                        setFeeTypeDel(list) 
                    }  
                }else{
                    queryForm.setFieldsValue({
                        popData: {
                            feeType: null,
                        }
                    })
                }
            })   
        }
    }
    {/* 责任部门数据 */}
    const depart = async()=>{
        const result = await request($apiUrl.BASE_COMM_CONFIG_SEARCH_DEPART_DATA,       
            {
                method:'POST',
            }
        )
        if(result.success) {
            let data = result.data
            if(data!=null){
                data.map((v,i)=>{
                    v['value']=v.value;
                    v['label']=v.value + '(' + v.label +')';
                })
            }
            setDepartment(data)
        }
    }

    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setFeeType([]);
        getFeeType();
        setTableData([]);
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setBackFlag4(true);
        setBackFlag5(true);
        setBackFlag6(true);
        setBackFlag7(true);
    }

    {/*查询表格数据*/}
    const pageChange = async (pagination,search) =>{
        Toast('', '', '', 5000, false);  
        setSpinflag(true);
        let queryData = queryForm.getFieldValue()
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        const result = await request($apiUrl.BASE_AG_FEE_CONFIG_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    feeClass: queryData.feeClass,
                    feeType: queryData.feeType,
                    serviceLoopCode: queryData.serviceLoopCode,
                    directionCode: queryData.directionCode,
                    departmentCode: queryData.departmentCode,
                    tradeLaneCode: queryData.tradeLaneCode,
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
                })
            }
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
            getStatus(datas,setTableData)
            if(datas.length==0){
                setTableData([])
                Toast('', intl.formatMessage({id: 'lbl.query-warn'}), 'alert-error', 5000, false);
            }
        }else {
            setSpinflag(false);
            setTableData([])
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
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
                        referenceType: "AG_FEE_PROFIT_CENTER",
                        referenceUuid: record.cbsAgProfitCenterUuid
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
    {/* 新建 */}
    const addBtn = () => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id:'menu.afcm.base.agFeeConfig'})); 
        setWriteFlag(false);
        setButtonFlag(false);
        setSubmitFlag(false);
        setUid("");
        setFeeTypeDel([])
        queryForm.setFieldsValue({
            popData: {
                feeClass: null,
                feeType: null,
                serviceLoopCode: null,
                directionCode: null,
                departmentCode: null,
                tradeLaneCode: null,
                activeDate: null,
            }
        })
        getFeeTypeDel()
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,500);
    }
    {/* 编辑/查看明细 */}
    const editViewBtn = async(record, flag) => {
        setInfoTips({});
        setFeeTypeDel([])
        Toast('', '', '', 5000, false);
        setUid(record.cbsAgProfitCenterUuid)
        setSpinflag(true);
        const result = await request($apiUrl.BASE_AG_FEE_CONFIG_SEARCH_DETAIL,      
            {
                method:'POST',
                data: {
                    uuid: record.cbsAgProfitCenterUuid,
                }
            }
        )
        if(result.success) {
            setTxt(intl.formatMessage({id:'menu.afcm.base.agFeeConfig'})); 
            setSpinflag(false);
            setButtonFlag(flag);
            setSubmitFlag(flag);
            setWriteFlag(flag);
            let data = result.data;
            if(feeClass!=null){
                feeClass.map((v,i)=>{
                    if(data.feeClass==v.feeCode){
                        let list=v.listAgTypeToClass
                        list.map((v,i)=>{
                            v['value']=v.feeCode
                            v['label']=v.feeName;
                        })
                        if(v.listAgTypeToClass.length==list.length){
                            setFeeTypeDel(list)
                        }  
                    }
                })
            } 
            queryForm.setFieldsValue({
                popData:{
                    feeClass: data.feeClass,
                    feeType: data.feeType,
                    serviceLoopCode: data.serviceLoopCode,
                    directionCode: data.directionCode,
                    departmentCode: data.departmentCode,
                    tradeLaneCode: data.tradeLaneCode,
                    activeDate: [moment(data.fromDate),moment(data.toDate)],
                }
            })
            // if(flag) {
            //     setTxt(intl.formatMessage({id:'lbl.ViewDetails'}));
                
            // } else {
                if(data.status=="Submit"){
                    setWriteFlag(true);
                    setButtonFlag(true);
                    setSubmitFlag(true);
                }
            //     setTxt(intl.formatMessage({id:'lbl.edit'}));
            // }
            setIsModalVisible(true);
        }else{
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/*删除*/}
    const deleteBtn = async(record) => {     
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
                const deleteData = await request($apiUrl.BASE_AG_FEE_CONFIG_DELETE_UUID,{
                    method:'POST',
                    data:{
                        uuid: record.cbsAgProfitCenterUuid,
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
    {/* 取消 */}
    const handleCancel = () => {
        setIsModalVisible(false)
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setBackFlag4(true);
        setBackFlag5(true);
        setBackFlag6(true);
        setBackFlag7(true);
        queryForm.setFieldsValue({
            popData: null
        })
        setInfoTips({});
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.feeClass){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.feeType){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.serviceLoopCode){setBackFlag3(false)}else{setBackFlag3(true)}
        if(!queryData.directionCode){setBackFlag4(false)}else{setBackFlag4(true)}
        if(!queryData.activeDate){setBackFlag5(false)}else{setBackFlag5(true)}
        if(!queryData.departmentCode){setBackFlag6(false)}else{setBackFlag6(true)}
        if(!queryData.tradeLaneCode){setBackFlag7(false)}else{setBackFlag7(true)}
        if(!queryData.feeClass || !queryData.feeType || !queryData.serviceLoopCode ||
            !queryData.activeDate || !queryData.directionCode  || !queryData.departmentCode  || !queryData.tradeLaneCode ){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.agfee-config-warn'})});
           return;
        }else{
            setSpinflag(true);
            const save = await request($apiUrl.BASE_AG_FEE_CONFIG_SAVE_DATA,{
                method:"POST",
                data:{
                    "operateType": "SAVE",
                    "params": {
                        cbsAgProfitCenterUuid: uid,
                        feeClass: queryData.feeClass,
                        feeType: queryData.feeType,
                        serviceLoopCode: queryData.serviceLoopCode,
                        directionCode: queryData.directionCode,
                        departmentCode: queryData.departmentCode,
                        tradeLaneCode: queryData.tradeLaneCode,
                        fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    },
                }
            })
            if(save.success) {
                setSpinflag(false);
                let data = save.data
                setButtonFlag(true);   //保存按钮
                setWriteFlag(true);    //是否可读写
                pageChange(page)
                setIsModalVisible(false)
                setInfoTips({alertStatus: 'alert-success', message: save.message});
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
       }
    }
    {/* 提交 */}
    const submitBtn = async()=>{
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
           if(!queryData.feeClass){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.feeType){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.serviceLoopCode){setBackFlag3(false)}else{setBackFlag3(true)}
        if(!queryData.directionCode){setBackFlag4(false)}else{setBackFlag4(true)}
        if(!queryData.activeDate){setBackFlag5(false)}else{setBackFlag5(true)}
        if(!queryData.departmentCode){setBackFlag6(false)}else{setBackFlag6(true)}
        if(!queryData.tradeLaneCode){setBackFlag7(false)}else{setBackFlag7(true)}
        if(!queryData.feeClass || !queryData.feeType || !queryData.serviceLoopCode ||
            !queryData.activeDate || !queryData.directionCode  || !queryData.departmentCode  || !queryData.tradeLaneCode ){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.agfee-config-warn'})});
           return;
        }else{
            setSpinflag(true);
            const submit = await request($apiUrl.BASE_AG_FEE_CONFIG_SAVE_DATA,{
                method:"POST",
                data:{
                    "operateType": "SUBMIT",
                    "params": {
                        cbsAgProfitCenterUuid: uid,  
                        feeClass: queryData.feeClass,
                        feeType: queryData.feeType,
                        serviceLoopCode: queryData.serviceLoopCode,
                        directionCode: queryData.directionCode,
                        departmentCode: queryData.departmentCode,
                        tradeLaneCode: queryData.tradeLaneCode,
                        fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    },
                }
            })
            if(submit.success) {
                setSpinflag(false);
                setButtonFlag(true);
                setWriteFlag(true);
                setSubmitFlag(true);
                pageChange(page)
                setIsModalVisible(false)
                Toast('', submit.message, 'alert-success', 5000, false)
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: submit.errorMessage});
            }
        }
    }
    {/* 下载 */} 
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.BASE_AG_FEE_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    // entryCode:"CBS_B_AG_PROFIT_CENTER",
                    feeClass: queryData.feeClass,
                    feeType: queryData.feeType,
                    serviceLoopCode: queryData.serviceLoopCode,
                    directionCode: queryData.directionCode,
                    departmentCode: queryData.departmentCode,
                    tradeLaneCode: queryData.tradeLaneCode,
                    companyCode: companysData,
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.base.agFeeConfig'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                        feeType: intl.formatMessage({id: "lbl.argue.chargeCode"}),
                        serviceLoopCode: intl.formatMessage({id: "lbl.route"}),
                        directionCode: intl.formatMessage({id: "lbl.course"}),
                        tradeLaneCode: intl.formatMessage({id: "lbl.Trade-lane-code"}),
                        fromDate: intl.formatMessage({id: "lbl.effective-date"}),
                        toDate: intl.formatMessage({id: "lbl.expiration-date"}),
                        status: intl.formatMessage({id: "lbl.state"}),
                        departmentCode: intl.formatMessage({id: "lbl.ac.fee.department"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.update-people"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.update-date"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.base.agFeeConfig'}),//sheet名称
                }],
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        }) 
        if(result.size<1){  //若无数据，则不下载
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                setSpinflag(false);
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.base.agFeeConfig'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.base.agFeeConfig'}) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form onFinish={handleQuery} form={queryForm} name='search'>
                    <Row>
                        {/* 费用大类 */}
                        <Selects span={6} name='feeClass' label={<FormattedMessage id='lbl.Big-class-fee'/>} options={feeClass} selectChange={getCommonSelectVal} flag={true} formlayouts={formlayouts}/> 
                        {/* 费用代码 */}
                        <Selects span={6} name='feeType' label={<FormattedMessage id='lbl.argue.chargeCode'/>} options={feeType} flag={true} formlayouts={formlayouts}/> 
                        {/* 有效日期 */}
                        <DoubleDatePicker name='activeDate' flag={true}  label={<FormattedMessage id='lbl.valid-date'/>} span={6} formlayouts={formlayouts}/>
                        {/* 航线 */}
						<InputText span={6} name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>} formlayouts={formlayouts}/> 
                        {/* 航向 */}
                        <Selects span={6} name='directionCode' label={<FormattedMessage id='lbl.course'/>}  options={direction.values} flag={true} formlayouts={formlayouts}/> 
                        {/* 责任部门 */}
                        <Selects span={6} name='departmentCode' label={<FormattedMessage id='lbl.ac.fee.department'/>} options={department}  flag={true} formlayouts={formlayouts}/> 
                        {/* TradeLaneCode */}
                        <InputText span={6} name='tradeLaneCode' label={<FormattedMessage id='lbl.Trade-lane-code'/>} formlayouts={formlayouts}/> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <CosButton onClick={addBtn}  auth='AFCM-AG-PROFIT-001-B03'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
					{/* 下载 */}
                    <CosButton onClick={downloadBtn} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className="button-right">
                    <CosButton onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></CosButton>
                    <CosButton onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className="footer-table">
            <div style={{width: '85%'}}>
                <PaginationTable
                        dataSource={tableData}
                        columns={columns}
                        rowKey='cbsAgProfitCenterUuid'
                        pageChange={pageChange}
                        pageSize={page.pageSize}
                        current={page.current}
                        scrollHeightMinus={200}
                        total={tabTotal}
                        rowSelection={null}
                    />
            </div>
            </div>
            {/* 弹窗 */}
            {/* <Modal title={txt} visible={isModalVisible} footer={null} width="50%" height="50%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/> 
                <div className='modalContent' style={{minWidth: '300px'}}>
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 费用大类 */}
                                <Selects span={12} name={['popData','feeClass']} disabled={writeFlag} style={{background:backFlag1?'white':'yellow'}}  label={<FormattedMessage id='lbl.Big-class-fee'/>} options={feeClass} selectChange={getCommonSelectDtlVal} isSpan={true} flag={true}/> 
                                {/* 费用代码 */}
                                <Selects span={12} name={['popData','feeType']} disabled={writeFlag} style={{background:backFlag2?'white':'yellow'}}  label={<FormattedMessage id='lbl.argue.chargeCode'/>} options={feeTypeDel} isSpan={true} flag={true}/> 
                                {/* 航线 */}
                                <InputText span={12} name={['popData','serviceLoopCode']} disabled={writeFlag} styleFlag={backFlag3} label={<FormattedMessage id='lbl.route'/>} isSpan={true} maxLength={4}/> 
                                {/* 航向 */}
                                <Selects span={12} name={['popData','directionCode']} disabled={writeFlag} style={{background:backFlag4?'white':'yellow'}}  label={<FormattedMessage id='lbl.course'/>} options={direction.values} isSpan={true} flag={true}/> 
                                {/* 有效日期 */}
                                <DoubleDatePicker name={['popData','activeDate']} flag={false}  style={{background:backFlag5?'white':'yellow'}}  disabled={writeFlag} label={<FormattedMessage id='lbl.valid-date'/>} span={12} isSpan={true}/>
                                {/* 责任部门 */}
                                <Selects span={12} name={['popData','departmentCode']} disabled={writeFlag} style={{background:backFlag6?'white':'yellow'}}  label={<FormattedMessage id='lbl.ac.fee.department'/>} options={department} isSpan={true} flag={true}/> 
                                {/* TradeLaneCode */}
                                <InputText span={12} name={['popData','tradeLaneCode']} disabled={writeFlag} styleFlag={backFlag7} label={<FormattedMessage id='lbl.Trade-lane-code'/>} isSpan={true} maxLength={3}/> 
                            </Row>
                        </Form>
                    <div className='main-button'>
                        <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 保存 */}
                            <CosButton onClick={() => handleSave()}  disabled={buttonFlag?true:false}  auth='AFCM-AG-PROFIT-001-B04'><FormattedMessage id='lbl.save' /></CosButton>
                            {/* 提交 */}
                            <CosButton onClick={submitBtn} disabled={submitFlag?true:false} style={{marginLeft: '10px'}} auth='AFCM-AG-PROFIT-001-B05'><FormattedMessage id='lbl.Submit'/></CosButton>
                        </div>
                    </div>
                </div>  
            </CosModal>
            <LogPopUp logData={logData}/>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default commConfig;