{/*自动生成报账单配置*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage, useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import { acquireSelectData,momentFormat,costCategories,excuteStatus,agencyCodeData} from '@/utils/commonDataInterface';
import Selects from '@/components/Common/Select';
import { Button, Form, Row, Tooltip,Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import Loading from '@/components/Common/Loading';
import {CosToast}  from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import CosModal from '@/components/Common/CosModal'

import {
    DeleteOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    FileAddOutlined,//新增
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载 
    SaveOutlined, //保存
} from '@ant-design/icons'

const confirm = Modal.confirm

const reimburConfig =()=> {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [tableData, setTableData] = useState([]);     // table数据
    const [tabTotal,setTabTotal] = useState([]);//table条数
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [txt, setTxt] = useState(''); //新增
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]);  //选择行
    const [businessType, setBusinessType] = useState({})  //业务类型
    const [billType, setBillType] = useState({})  //报账单类型
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用小类
    const [feeCategory,setFeeCategory] = useState ([]) //大小类
    const [writeRead,setWriteRead] = useState(false);//是否可读写
    const [editFlag,setEditFlag] = useState(false);//是否可修改
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [click, setClick] = useState([]);  //点击业务类型
    const [clicks, setClicks] = useState([]);  //点击业务类型
    const [uid, setUid] = useState('');  //id
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const [backFlag3,setBackFlag3] = useState(true);//背景颜色
    const [backFlag4,setBackFlag4] = useState(true);//背景颜色
    const [infoTips, setInfoTips] = useState({});   //message info
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [diffVal, setDiffVal] = useState("NEW");    // 取值
    const [bigType, setBigType] = useState("");    // 获取大类值
    const [smallType, setSmallType] = useState("");    // 获取小类值
    const [dateList, setDateList] = useState({});    // 日期
    const [recordData, setRecordData] = useState({});   //单条数据内容
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    
	const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue(),
        })
    }
	const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "businessType": null,
        "feeClass": null,
        "billType": null,
        "feeType": null,
        "recordCrtDate": null,
    });

    {/*初始化*/}
	useEffect(()=>{
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('AFCM.BUSINESS.TYPE',setBusinessType, $apiUrl);// 业务类型
        acquireSelectData('AFCM.BILL.TYPE',setBillType, $apiUrl);// 报账单类型
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl); 
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     // 佣金类型
        costCategories(feeClass,setFeeClass,$apiUrl); 
        acquireSelectData('AFCM.BUILD.DUE', setDateList, $apiUrl);     // 日期
    },[])
    useEffect(()=>{
        felList()
    },[feeClass])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode
        })
    }, [company])


    {/* 不同业务类型显示不同费用 */}
    const getSelectValFee = (e) =>{
        setFeeType([])
        queryForm.setFieldsValue({
            feeClass: null,
            feeType: null,
            commissionCategories: null,
            commissionType: null,
        })
        setClick(e)
    }
    {/* 业务类型为佣金时的费用类型联动 */}
	const selectChangeBtn = (value, all) => {
        setCommissionType({});  
        queryForm.setFieldsValue({
            feeType: null,
            commissionType: null,
        })
        let data = all.linkage ? all.linkage.value : null;
        data ? acquireSelectData('COMMISSION.CLASS.' + data, setCommissionType, $apiUrl) : null;     // 佣金大类 and 佣金小类
	}
    {/* 表格的下拉框onchange事件 */}
    const getCommonSelectVal = (e,record,name) =>{
        record[name]=e
        if(record.key==null){
            setFeeType([])
        }
        if(feeClass!=null){
            feeClass.map((v,i)=>{
                if(e==v.feeCode){
                    let list=v.listAgTypeToClass
                    list.map((v,i)=>{
                        v['value']=v.feeCode
                        v['label']=v.feeName+'(' + v.feeCode +')';
                    })
                    if(v.listAgTypeToClass.length==list.length){
                        setFeeType('')
                        setFeeType(list)
                    }  
                }else{
                    queryForm.setFieldsValue({
                        feeType: null,
                    })
                }
            })  
        } 
    }
    const getSelectValFeeDel = (e) =>{
        setFeeType([])
        queryForm.setFieldsValue({
            popData:{
                feeClass: null,
                feeType: null,
                commissionCategories: null,
                commissionType: null,
            }
        })
        setClicks(e)
    }
    const selectChangeDelBtn = (value, all) => {
        setCommissionType({});  
        queryForm.setFieldsValue({
            popData:{
                feeType: null,
                commissionType: null,
            }
        })
        let data = all.linkage ? all.linkage.value : null;
        data ? acquireSelectData('COMMISSION.CLASS.' + data, setCommissionType, $apiUrl) : null;     
	}
    const getCommonSelectValDel = (e,record,name) =>{
        record[name]=e
        if(record.key==null){
            setFeeType([])
        }
        if(feeClass!=null){
            feeClass.map((v,i)=>{
                if(e==v.feeCode){
                    let list=v.listAgTypeToClass
                    list.map((v,i)=>{
                        v['value']=v.feeCode
                        v['label']=v.feeName+'(' + v.feeCode +')';
                    })
                    if(v.listAgTypeToClass.length==list.length){
                        setFeeType('')
                        setFeeType(list)
                    }  
                }else{
                    queryForm.setFieldsValue({
                        popData:{
                            feeType: null,
                        }
                    })
                }
            })
        }   
    }
    const felList = ()=>{
        if(feeClass!=null){
            let listAgTypeToClassall = feeClass.map((v,i)=>{
                return v.listAgTypeToClass
            })
            let listAgTypeToClass = listAgTypeToClassall.reduce((pre,cur)=>{
                return pre.concat(cur)
            },[])
            listAgTypeToClass.map((v,i)=>{
                v['value']=v.feeCode
                v['label']=v.feeCode+'(' + v.feeName +')';
            })
            setFeeCategory(listAgTypeToClass)
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
                    {/* 编辑 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={() => {editViewBtn(record, false)}}  disabled={record.excute?false:true}><FormOutlined/></a>&nbsp;</Tooltip>&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />} >
                        <a><CosButton auth='AFCM-BASE-BLD-001-B04' disabled={record.excute?false:true} onClick={() => {editViewBtn(record, false)}} ><FormOutlined style={{color:record.excute?'#1890ff':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}> <a onClick={() => {editViewBtn(record, true)}}><FileSearchOutlined/></a>&nbsp; </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.agency'/>,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.business-type'/>,//业务类型
            dataIndex: 'businessType',
            dataType: businessType.values,
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee'/>,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 80,
            align:'left',
        },
        {
            title: <FormattedMessage id='lbl.Small-class-fee'/>,//费用小类
            dataIndex: 'feeType',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.due-scope'/>,//时间周期
            dataIndex: 'dueScope',
            dataType: dateList.values,
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.bill-type'/>,//报账单类型
            dataIndex: 'billType',
            dataType: billType.values,
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.effective-date'/>,//生效日期
            dataIndex: 'startDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.execution-status'/>,//执行状态
            dataIndex: 'status',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.create-date'/>,//创建时间
            dataIndex: 'recordCrtDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.create-by'/>,//创建人
            dataIndex: 'recordCreateUser',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-date'/>,//更新时间
            dataIndex: 'recordUpdateDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-by'/>,//更新人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 80,
            align:'left', 
        },
    ]

    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
        }, [company])
        setTableData([]);
        setChecked([]);
        setCheckedRow([]);
        setFeeType([]);
        setCommissionType({});
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setBackFlag4(true);
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
            const result = await request($apiUrl.AGENCY_FEE_ACCOUNT_CHECK_MONITOR_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        entryCode: "AFCM_B_BUILD_BILL_CONFIG",
                        paramEntity:{
                            agencyCode: queryData.agencyCode,
                            businessType: queryData.businessType,
                            feeClass: queryData.feeClass,
                            feeType: queryData.feeType,
                            billType: queryData.billType,
                            dateFrom_recordCrtDate: queryData.recordCrtDate?momentFormat(queryData.recordCrtDate[0]):null,
                            dateTo_recordCrtDate: queryData.recordCrtDate?momentFormat(queryData.recordCrtDate[1]):null,
                        }
                    }
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                excuteStatus(datas,setTableData)
                if(datas!=null){
                    datas.map((v,i)=>{
                        v.startDate ? v["startDate"] = v.startDate.substring(0, 10) : null;
                        // v.recordCrtDate ? v["recordCrtDate"] = v.recordCrtDate.substring(0, 10) : null;
                        // v.recordUpdateDate ? v["recordUpdateDate"] = v.recordUpdateDate.substring(0, 10) : null;
                        if(feeClass!=null){
                            feeClass.map((val, i) => {
                                if(val.feeCode == v.feeClass) {
                                    v.feeClass = val.feeName + '(' + val.feeCode + ')'
                                }
                            })
                        }
                        if(feeCategory!=null){
                            feeCategory.map((val, i) => {
                                if(val.feeCode == v.feeType) {
                                 v.feeType = val.feeName + '(' + val.feeCode + ')'
                                }
                            })
                        }
                        if(commissionCategories.values!=null){
                            commissionCategories.values.map((val, i) => {
                                if(val.value == v.feeClass) {
                                    v.feeClass =  val.label 
                                }
                            })
                        }
                        if(commType.values==undefined){
                            return
                        }else{
                            commType.values.map((val, i) => {
                                if(val.value == v.feeType) {
                                    v.feeType =  val.label 
                                }
                            })
                        }
                    })
                }
                setPage({...pagination})
                setTabTotal(data.totalCount)
                setTableData([...datas])
                setSelectedRowKeys([...datas])
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
    {/* 新建 */}
    const addBtn = () => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id:'menu.afcm.base.generateReimburConfig'})); 
        setWriteRead(false);
        setEditFlag(false)
        setButtonFlag(false);
        setFeeType([])
        setCommissionType({})
        setUid('')
        setDiffVal('NEW')
        setClicks('AG')
        queryForm.setFieldsValue({
            popData: {
                agencyCode: null,
                businessType: null,
                feeClass: null,
                feeType: null,
                dueScope: null,
                billType: null,
            }
        })
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,500);
    }
    {/* 编辑/查看明细 */}
    const editViewBtn = async(record, flag) => {
        Toast('', '', '', 5000, false);
        setFeeType([])
        setCommissionType({})
        setUid(record.uuid)
        setDiffVal('EDT')
        if(record.businessType=='COMM'){
            setClicks('COMM')
        }else{
            setClicks('AG')
        }
        setSpinflag(true);  
        // 查看详情为true，编辑为false
        const result = await request($apiUrl.COMM_MODULE_SEARCH_PRE_HEAD_DETAIL,       
            {
                method:'POST',
                data: {
                    "params": {
                        "entryCode": "AFCM_B_BUILD_BILL_CONFIG"
                    },
                    uuid: record.uuid
                }
            }
        )
        if(result.success) {
            setTxt(intl.formatMessage({id:'menu.afcm.base.generateReimburConfig'})); 
            setRecordData(record)
            setSpinflag(false);
            setWriteRead(flag);
            setEditFlag(true)
            setButtonFlag(flag)
            let data = result.data;
            let commVal = data.feeClass
            if(data.businessType=='COMM'){
                commVal ? acquireSelectData('COMMISSION.CLASS.' + commVal, setCommissionType, $apiUrl) : null;
            }
            if(feeClass!=null){
                feeClass.map((v,i)=>{
                    if(data.feeClass==v.feeCode){
                        let list=v.listAgTypeToClass
                        list.map((v,i)=>{
                            v['value']=v.feeCode
                            v['label']=v.feeName+'(' + v.feeCode +')';
                        })
                        if(v.listAgTypeToClass.length==list.length){
                            setFeeType(list)
                        }  
                    }
                })
            } 
            queryForm.setFieldsValue({
                popData:{
                    agencyCode: data.agencyCode,
                    businessType: data.businessType,
                    feeClass: data.feeClass,
                    feeType: data.feeType,
                    dueScope: data.dueScope,
                    billType: data.billType,
                }
            })
            if(data.dueScope=="-1"){
                queryForm.setFieldsValue({
                    popData:{
                        dueScope: '不限',
                    }
                })
            }
            setBigType(data.feeClass)
            setSmallType(data.feeType)
            // if(flag) {
            //     setTxt(intl.formatMessage({id: 'lbl.ViewDetails'}));
            // } else {
            //     setTxt(intl.formatMessage({id: 'lbl.edit'}));
            // }
            setIsModalVisible(true);
        }else{
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/*删除*/}
    const deleteBtn = async() => {     
        Toast('', '', '', 5000, false); 
        if(checkedRow.length<1){
            Toast('', intl.formatMessage({id: 'lbl.Select-record'}), 'alert-error', 5000, false);
            return
        }else{
            let params = checkedRow.map((item,index)=>{
                return {uuid:item.uuid, }
            })
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
                    const deleteData = await request($apiUrl.AUTO_GENERATE_REIMBUR_CONFIG_DELETE_UID,{
                        method:'POST',
                        data:{
                            "params": {
                                "entryCode": "AFCM_B_BUILD_BILL_CONFIG"
                            },
                            paramsList:params
                        } 
                    })
                    if(deleteData.success) {
                        setSpinflag(false);
                        pageChange(page);
                        Toast('',deleteData.message, 'alert-success', 5000, false)
                        setCheckedRow([])
                    } else{
                        setSpinflag(false);
                        Toast('', deleteData.errorMessage, 'alert-error', 5000, false);
                    }  
                }
            })
        }   
    }
    {/* 取消 */}
    const handleCancel = () => {
        setInfoTips({});
        setIsModalVisible(false)
        setFeeType([])
        setCommissionType({})
        queryForm.setFieldsValue({
            popData: null
        })
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setBackFlag4(true);
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.agencyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.businessType){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.dueScope){setBackFlag3(false)}else{setBackFlag3(true)}
        if(!queryData.billType){setBackFlag4(false)}else{setBackFlag4(true)}
        if(/^[\u4e00-\u9fa5]+$/i.test(queryData.agencyCode)){//检测输入的中文汉字
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});
            return
        }else if(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.agencyCode)){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});//检测输入的中文符号
            return
        }
        if(!queryData.agencyCode || !queryData.businessType || !queryData.dueScope || !queryData.billType){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Auto-generate-rembur'})});
            return
        }
        let dateIpt
        if(queryData.dueScope == "不限"){
            dateIpt = '-1'
        }else{
            dateIpt = queryData.dueScope
        }
        setSpinflag(true);
        const save = await request($apiUrl.AUTO_GENERATE_REIMBUR_CONFIG_SAVE_SUBMIT,{
            method:"POST",
            data:{
                "params": {
                    agencyCode: queryData.agencyCode,
                    businessType: queryData.businessType,
                    feeClass: queryData.feeClass,
                    feeType: queryData.feeType,
                    dueScope: dateIpt,
                    billType: queryData.billType,
                    uuid: uid,
                    recordCreateUser: recordData.recordCreateUser,
                    recordCrtDate: recordData.recordCrtDate ? momentFormat(recordData.recordCrtDate) : null,
                    recordUpdateDate: recordData.recordUpdateDate ? momentFormat(recordData.recordUpdateDate) : null,
                    recordUpdateUser: recordData.recordUpdateUser,
                    startDate: recordData.startDate ? momentFormat(recordData.startDate) : null,
                    status: recordData.status,
                }
            }
        })
        if(save.success) {
            setSpinflag(false);
            // queryForm.resetFields();
            setIsModalVisible(false)
            setFeeType([])
            setCommissionType({})
            pageChange(page)
            Toast('', save.message, 'alert-success', 5000, false)
        }else{
            setSpinflag(false);
            setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
        }
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                excelFileName: intl.formatMessage({id: 'menu.afcm.base.generateReimburConfig'}), //文件名
                params: {
                    entryCode: "AFCM_B_BUILD_BILL_CONFIG",
                    paramEntity: {
                        agencyCode: queryData.agencyCode,
                        businessType: queryData.businessType,
                        feeClass: queryData.feeClass,
                        feeType: queryData.feeType,
                        billType: queryData.billType,
                        dateFrom_recordCrtDate: queryData.recordCrtDate?momentFormat(queryData.recordCrtDate[0]):null,
                        dateTo_recordCrtDate: queryData.recordCrtDate?momentFormat(queryData.recordCrtDate[1]):null,
                    }
                },
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        businessType: intl.formatMessage({id: "lbl.business-type"}),
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                        feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                        dueScope: intl.formatMessage({id: "lbl.due-scope"}),
                        billType: intl.formatMessage({id: "lbl.bill-type"}),
                        startDate: intl.formatMessage({id: "lbl.effective-date"}),
                        status: intl.formatMessage({id: "lbl.execution-status"}),
                        recordCrtDate: intl.formatMessage({id: "lbl.create-date"}),
                        recordCreateUser: intl.formatMessage({id: "lbl.create-by"}),
                        recordUpdateDate: intl.formatMessage({id: "lbl.update-date"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.update-by"}),
                    },
                    // sumCol: {//汇总字段
                    // },
                    sheetName: intl.formatMessage({id: 'menu.afcm.base.generateReimburConfig'}),//sheet名称
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
            let blob = new Blob([result], { type: "application/x-xls" });
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                setSpinflag(false);
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.base.generateReimburConfig'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.base.generateReimburConfig'}) + '.xlsx'; // 下载后文件名
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
                        {/* 代理编码 */}
                        {/* <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}/>  */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} /> : <Selects showSearch={true} flag={true} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} options={agencyCode} />
                        }
                        {/* 业务类型*/}
                        <Selects name='businessType' label={<FormattedMessage id='lbl.business-type'/>} span={6} selectChange={getSelectValFee} options={businessType.values} flag={true}/>
                        {/* 费用大类 */}
                        {
                            click == 'COMM' ? <Selects name='feeClass' label={<FormattedMessage id='lbl.Big-class-fee' span={6}/>} flag={true} selectChange={selectChangeBtn} options={commissionCategories.values}/> : <Selects name='feeClass' label={<FormattedMessage id='lbl.Big-class-fee' span={6}/>} flag={true} selectChange={getCommonSelectVal} options={feeClass}/>
                        }
                        {/* 费用小类 */}
                        {
                            click == 'COMM' ? <Selects name='feeType'  label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} flag={true} options={commissionType.values}/> : <Selects name='feeType'  label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} flag={true} options={feeType}/> 
                        }
                        {/* 创建时间 */}
                        <DoubleDatePicker name='recordCrtDate'  label={<FormattedMessage id='lbl.create-date'/>} span={6}/>
                        {/* 报账单类型 */}
                        <Selects name='billType'  label={<FormattedMessage id='lbl.bill-type'/>} span={6} options={billType.values} flag={true}/>
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-BASE-BLD-001-B01'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                    {/* 删除 */}
                    <CosButton  onClick={deleteBtn} auth='AFCM-BASE-BLD-001-B02'><DeleteOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
					{/* 下载 */}
                    <CosButton  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className="button-right">
                    <CosButton onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></CosButton>
                    <CosButton onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className="footer-table">
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='uuid'
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
            {/* <Modal title={txt} visible={isModalVisible} footer={null} width="50%" height="50%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/> 
                <div className='modalContent' style={{minWidth: '300px'}}>
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 代理编码 */}
                                <InputText disabled={editFlag} name={['popData','agencyCode']} label={<FormattedMessage id='lbl.agency'/>} span={12} maxLength={10} isSpan={true} styleFlag={backFlag1}/> 
                                {/* 业务类型*/}
                                <Selects  name={['popData','businessType']} label={<FormattedMessage id='lbl.business-type'/>} span={12} selectChange={getSelectValFeeDel} options={businessType.values} flag={true} isSpan={true} style={{background:backFlag2?'white':'yellow'}} disabled={editFlag}/>
                                {/* 费用大类 */}
                                {
                                    clicks == 'COMM' ? <Selects  name={['popData','feeClass']} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={12} flag={true} selectChange={selectChangeDelBtn} options={commissionCategories.values} isSpan={true} disabled={writeRead}/> : <Selects  name={['popData','feeClass']} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={12} flag={true} selectChange={getCommonSelectValDel} options={feeClass} isSpan={true} disabled={writeRead}/>
                                } 
                                {/* 费用小类 */}
                                {
                                    clicks == 'COMM' ? <Selects  name={['popData','feeType']} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={12} flag={true} options={commissionType.values} isSpan={true} disabled={writeRead}/> : <Selects  name={['popData','feeType']} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={12} flag={true} options={feeType} isSpan={true} disabled={writeRead}/> 
                                }
                                {/* 时间周期 */}
                                <Selects disabled={writeRead} name={['popData','dueScope']} label={<FormattedMessage id='lbl.due-scope'/>} span={12} isSpan={true} styleFlag={backFlag3} options={dateList.values} flag={true}/>
                                {/* <DoubleDatePicker disabled={writeRead} picker="month" style={{background:backFlag3?'white':'yellow'}} name={['popData','dueScope']} label={<FormattedMessage id='lbl.due-scope'/>} span={12} isSpan={true}/> */}
                                {/* 报账单类型 */}
                                <Selects disabled={editFlag} name={['popData','billType']} label={<FormattedMessage id='lbl.bill-type'/>} span={12} options={billType.values} flag={true} isSpan={true} style={{background:backFlag4?'white':'yellow'}}/> 
                            </Row>
                        </Form>
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存 */}
                                <CosButton onClick={() => handleSave()} disabled={buttonFlag?true:false} auth='AFCM-BASE-BLD-001-B03'><FormattedMessage id='lbl.save' /></CosButton>
                                {/* 取消 */}
                                <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.cancel' /></CosButton>
                        </div>
                    </div>
                </div>  
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default reimburConfig;