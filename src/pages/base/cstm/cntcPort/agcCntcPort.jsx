{/*代理往来(港口)*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage, useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import {costCategories, momentFormat,agencyCodeData} from '@/utils/commonDataInterface';
import Selects from '@/components/Common/Select';
import { Button, Form, Row, Tooltip,Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import DatePicker from '@/components/Common/DatePicker'
import moment from 'moment';
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

const agencyContactPort =()=> {
    const [tableData, setTableData] = useState([]);     // table数据
    const [tabTotal,setTabTotal] = useState([]);//table条数
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用小类
    const [feeTypes,setFeeTypes] = useState ([]) //费用小类
    const [feeCategory,setFeeCategory] = useState ([])
    const [txt, setTxt] = useState(''); //新增
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [writeFlag,setWriteFlag] = useState(false);  //编辑修改权限
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const [backFlag3,setBackFlag3] = useState(true);//背景颜色
    const [backFlag4,setBackFlag4] = useState(true);//背景颜色
    const [backFlag5,setBackFlag5] = useState(true);//背景颜色
    const [backFlag6,setBackFlag6] = useState(true);//背景颜色
    const [backFlag7,setBackFlag7] = useState(true);//背景颜色
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [saveType, setSaveType] = useState("NEW"); //保存类型
    const [uid, setUid] = useState(""); //获取uid
    const [infoTips, setInfoTips] = useState({});   //message info
    const [smallType, setSmallType] = useState("");    // 获取小类值
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
        "feeClass": null,
        "feeType": null,
        "portCode": null,
        "pkgAgencyCode": null,
        "customerSapId": null,
    });
     {/*初始化*/}
	useEffect(()=>{
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大小类联动
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
    },[])
    useEffect(()=>{
        felList()
        felLists()
    },[feeClass])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode
        })
    }, [company])
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
                        v['label']=v.feeCode+'(' + v.feeName +')';
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
    {/* 表格的下拉框onchange事件 */}
    const getCommonSelectDtlVal = (e,record,name) =>{
        record[name]=e
        if(record.key==null){
            setFeeTypes([])
        }
        if(feeClass!=null){
            feeClass.map((v,i)=>{
                if(e==v.feeCode){
                    let list=v.listAgTypeToClass
                    list.map((v,i)=>{
                        v['value']=v.feeCode
                        v['label']=v.feeCode+'(' + v.feeName +')';
                    })
                    if(v.listAgTypeToClass.length==list.length){
                        setFeeTypes('')
                        setFeeTypes(list)
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
    const felLists = ()=>{
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
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={()=>addEdit(record,false)}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-BASE-FEE-002-B04' onClick={() => {addEdit(record, false)}} ><FormOutlined style={{color:'#1890ff',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a onClick={()=>addEdit(record,true)}><FileSearchOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.agency' />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            // dataType: feeClass,
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Small-class-fee' />,//费用小类
            dataIndex: 'feeType',
            // dataType: feeCategory,
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.port' />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.packet-account-agent' />,//数据包记账代理
            dataIndex: 'pkgAgencyCode',
            sorter: false,
            width: 90,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.customer.code' />,//客户代码
            dataIndex: 'customerSapId',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.effective-start-date' />,//有效时间起
            dataIndex: 'fromDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.effective-end-date' />,//有效时间止
            dataIndex: 'toDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-date' />,//更新日期
            dataIndex: 'recordUpdateDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-people' />,//更新人员
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
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setBackFlag4(true);
        setBackFlag5(true);
        setBackFlag6(true);
        setBackFlag7(true);
        setChecked([]);
        setCheckedRow([]);
        setFeeType([])
    }

    {/*查询表格数据*/}
    const pageChange = async (pagination,search) =>{
        Toast('', '', '', 5000, false);  
        setSpinflag(true);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
            const result = await request($apiUrl.COST_MODULE_AGENCY_CONTACT_PORT_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        // ...queryForm.getFieldValue(),
                        agencyCode: queryForm.getFieldValue().agencyCode,
                        feeClass: queryForm.getFieldValue().feeClass,
                        feeType: queryForm.getFieldValue().feeType,
                        portCode: queryForm.getFieldValue().portCode,
                        pkgAgencyCode: queryForm.getFieldValue().pkgAgencyCode,
                        customerSapId: queryForm.getFieldValue().customerSapId,
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
                        // v.recordUpdateDate ? v["recordUpdateDate"] = v.recordUpdateDate.substring(0, 10) : null;
                        if(feeClass!=null || feeCategory!=null){
                            feeClass.map((val, i) => {
                                if(val.feeCode == v.feeClass) {
                                    v.feeClass = val.feeName + '(' + val.feeCode + ')'
                                }
                            })
                            feeCategory.map((val, i) => {
                                if(val.feeCode == v.feeType) {
                                    v.feeType = val.feeName + '(' + val.feeCode + ')'
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
    const addBtn = async() => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id:'menu.afcm.base.cstm.cntcPort'})); 
        setCommonFlag(false);  //控制读写
        setButtonFlag(false);
        setWriteFlag(false);
        setSaveType('NEW')
        queryForm.setFieldsValue({
            popData: {
                agencyCode: null,
                feeClass: '*',
                feeType: '*',
                portCode: null,
                pkgAgencyCode: null,
                customerSapId: null, 
                fromDate: moment("2021-01-01"),
                toDate: moment("9999-12-31"),
            }
        })
        setFeeTypes([])
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,500);
    }
    {/* 编辑/查看明细 */}
    const addEdit = async(record, flag) => {
        Toast('', '', '', 5000, false);
        setSaveType('UPD')
        setSpinflag(true);
        // 查看详情为true，编辑为false
        const result = await request($apiUrl.COST_MODULE_AGENCY_CONTACT_PORT_SEARCH_PRE_HEAD_DETAIL,      
            {
                method:'POST',
                data: {
                    uuid: record.agFeePortUuid,
                }
            }
        )
        if(result.success) {
            setTxt(intl.formatMessage({id:'menu.afcm.base.cstm.cntcPort'})); 
            setSpinflag(false);
            setCommonFlag(flag);
            setButtonFlag(flag);
            setWriteFlag(true);
            let data = result.data;
            setUid(data.agFeePortUuid)
            queryForm.setFieldsValue({
                popData:{
                    agencyCode: data.agencyCode,
                    feeClass: data.feeClass,
                    feeType: data.feeType,
                    portCode: data.portCode,
                    pkgAgencyCode: data.pkgAgencyCode,
                    customerSapId: data.customerSapId, 
                    toDate:moment(data.toDate),
                    fromDate:moment(data.fromDate),
                    agFeePortUuid: data.agFeePortUuid, 
                }
            })
            let queryData = queryForm.getFieldValue().popData
            feeCategory.map((v, i) => {
                queryData.feeType == v.value ? queryData.feeType = v.label : '';
            })
            setSmallType(data.feeType)
            // if(flag) {
            //     setTxt(intl.formatMessage({id:'lbl.ViewDetails'}));
                
            // } else {
            //     setTxt(intl.formatMessage({id:'lbl.edit'}));
            // }
            setIsModalVisible(true);
        } else {
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
                return {agFeePortUuid:item.agFeePortUuid}
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
                    const deleteData = await request($apiUrl.COST_MODULE_AGENCY_CONTACT_PORT_DELETE_UUID,{
                        method:'POST',
                        data:{
                            paramsList:params
                        } 
                    })
                    if(deleteData.success) {
                        setSpinflag(false);
                        pageChange(page);
                        Toast('',deleteData.message, 'alert-success', 5000, false)
                        setCheckedRow([])
                    }else{
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
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.agencyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.feeType){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.portCode){setBackFlag3(false)}else{setBackFlag3(true)}
        if(!queryData.pkgAgencyCode){setBackFlag4(false)}else{setBackFlag4(true)}
        if(!queryData.customerSapId){setBackFlag5(false)}else{setBackFlag5(true)}
        if(!queryData.fromDate){setBackFlag6(false)}else{setBackFlag6(true)}
        if(!queryData.toDate){setBackFlag7(false)}else{setBackFlag7(true)}
        if(queryData.agencyCode){
            if(queryData.agencyCode.length>10){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.agency'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.portCode){
            if(queryData.portCode.length>3){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.port'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.pkgAgencyCode){
            if(queryData.pkgAgencyCode.length>10){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.packet-account-agent'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.customerSapId){
            if(queryData.customerSapId.length>10){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.customer.code'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(/^[\u4e00-\u9fa5]+$/i.test(queryData.agencyCode) || /^[\u4e00-\u9fa5]+$/i.test(queryData.portCode) || 
            /^[\u4e00-\u9fa5]+$/i.test(queryData.pkgAgencyCode) || /^[\u4e00-\u9fa5]+$/i.test(queryData.customerSapId)){//检测输入的中文汉字
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});
            return
        }else if(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.agencyCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.portCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.pkgAgencyCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.customerSapId)){
                    setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});//检测输入的中文符号
            return
        }
        if(!queryData.agencyCode || !queryData.feeType || !queryData.portCode ||
            !queryData.pkgAgencyCode || !queryData.customerSapId || !queryData.fromDate || !queryData.toDate){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.agc-contact-port-warn'})});
           return;
        }else if(queryData.fromDate>queryData.toDate){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.base-ag-fee-port'})});
            return
        }else if(saveType=='NEW'){
            setSpinflag(true);
            const save = await request($apiUrl.COST_MODULE_AGENCY_CONTACT_PORT_SAVE_SUBMIT,{
                method:"POST",
                data:{
                    "params": {
                        agencyCode: queryData.agencyCode,
                        feeClass: queryData.feeClass,
                        feeType: queryData.feeType,
                        portCode: queryData.portCode,
                        pkgAgencyCode: queryData.pkgAgencyCode,
                        customerSapId: queryData.customerSapId, 
                        fromDate: momentFormat(queryData.fromDate),
                        toDate: momentFormat(queryData.toDate),
                        agFeePortUuid: "", 
                    },
                }
            })
            if(save.success) {
                setSpinflag(false);
                // queryForm.resetFields()
                setIsModalVisible(false)
                pageChange(page)
                Toast('', save.message, 'alert-success', 5000, false)
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
        }else{
            setSpinflag(true);
            const save = await request($apiUrl.COST_MODULE_AGENCY_CONTACT_PORT_SAVE_SUBMIT,{
                method:"POST",
                data:{
                    "params": {
                        agencyCode: queryData.agencyCode,
                        feeClass: queryData.feeClass,
                        feeType: smallType,
                        portCode: queryData.portCode,
                        pkgAgencyCode: queryData.pkgAgencyCode,
                        customerSapId: queryData.customerSapId, 
                        fromDate: momentFormat(queryData.fromDate),
                        toDate: momentFormat(queryData.toDate),
                        agFeePortUuid: uid, 
                        status: "Submit"
                    },
                }
            })
            if(save.success) {
                setSpinflag(false);
                // queryForm.resetFields()
                setIsModalVisible(false)
                pageChange(page)
                Toast('', save.message, 'alert-success', 5000, false)
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
        }
    }
    {/* 下载 */} 
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode:"AFCM_B_AG_FEE_PORT",
                    paramEntity:{
                        ...queryForm.getFieldValue(),
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.base.cstm.cntcPort'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                        feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                        portCode: intl.formatMessage({id: "lbl.port"}),
                        pkgAgencyCode: intl.formatMessage({id: "lbl.packet-account-agent"}),
                        customerSapId: intl.formatMessage({id: "lbl.customer.code"}),
                        fromDate: intl.formatMessage({id: "lbl.effective-start-date"}),
                        toDate: intl.formatMessage({id: "lbl.effective-end-date"}),
                        recordUpdateDate: intl.formatMessage({id: "lbl.update-date"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.update-people"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.base.cstm.cntcPort'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.base.cstm.cntcPort'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.base.cstm.cntcPort'})+ '.xlsx'; // 下载后文件名
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
						{/* <InputText span={6} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} />   */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} /> : <Selects showSearch={true} flag={true} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} options={agencyCode} />
                        }
                        {/* 费用大类 */}
                        <Selects span={6} name='feeClass' selectChange={getCommonSelectVal} label={<FormattedMessage id='lbl.Big-class-fee'/>} options={feeClass} flag={true}/> 
                        {/* 费用小类 */}
                        <Selects span={6} name='feeType' label={<FormattedMessage id='lbl.Small-class-fee'/>} options={feeType} flag={true}/> 
                        {/* 港口 */}
						<InputText span={6} name='portCode' label={<FormattedMessage id='lbl.port'/>} /> 
                        {/* 数据包记账代理 */}
                        <InputText span={6} name='pkgAgencyCode' label={<FormattedMessage id='lbl.packet-account-agent'/>} /> 
                        {/* 客户代码 */}
                        <InputText span={6} name='customerSapId' label={<FormattedMessage id='lbl.customer.code'/>} /> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-BASE-FEE-002-B01'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                    {/* 删除 */}
                    <CosButton  onClick={deleteBtn} auth='AFCM-BASE-FEE-002-B02'><DeleteOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
					{/* 下载 */}
                    <CosButton  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className="button-right">
                    <CosButton onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></CosButton>
                    <CosButton onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className="footer-table">
                <div style={{width: '90%'}}>
                    <PaginationTable
                            dataSource={tableData}
                            columns={columns}
                            rowKey='agFeePortUuid'
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
            </div>
            {/* 弹窗 */}
            {/* <Modal title={txt} visible={isModalVisible} footer={null} width="50%" height="50%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/> 
                <div className='modalContent' style={{minWidth: '300px'}}>
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 代理编码 */}
                                <InputText disabled={writeFlag} span={12} name={['popData','agencyCode']} styleFlag={backFlag1} label={<FormattedMessage id='lbl.agency'/>} maxLength={10} isSpan={true}/> 
                                {/* 费用大类 */}
                                <Selects disabled={writeFlag} span={12} name={['popData','feeClass']} selectChange={getCommonSelectDtlVal} label={<FormattedMessage id='lbl.Big-class-fee'/>} options={feeClass} isSpan={true}/> 
                                {/* 费用小类 */}
                                <Selects disabled={writeFlag} span={12} name={['popData','feeType']} style={{background:backFlag2?'white':'yellow'}} label={<FormattedMessage id='lbl.Small-class-fee'/>} options={feeTypes} isSpan={true}/> 
                                {/* 港口 */}
                                <InputText disabled={writeFlag} span={12} name={['popData','portCode']} styleFlag={backFlag3} label={<FormattedMessage id='lbl.port'/>} maxLength={3} isSpan={true}/> 
                                {/* 数据包记账代理 */}
                                <InputText disabled={commonFlag} span={12} name={['popData','pkgAgencyCode']} styleFlag={backFlag4} label={<FormattedMessage id='lbl.packet-account-agent'/>} maxLength={10} isSpan={true}/> 
                                {/* 客户代码 */}
                                <InputText disabled={commonFlag} span={12} name={['popData','customerSapId']} styleFlag={backFlag5} label={<FormattedMessage id='lbl.customer.code'/>} maxLength={10} isSpan={true}/> 
                                {/* 有效时间起 */}
                                <DatePicker disabled={commonFlag} name={['popData','fromDate']} label={<FormattedMessage id="lbl.effective-start-date"/>} styleFlag={backFlag6} span={12} isSpan={true}/>
                                {/* 有效时间止 */}
                                <DatePicker disabled={commonFlag} name={['popData','toDate']} label={<FormattedMessage id="lbl.effective-end-date" />} styleFlag={backFlag7} span={12} isSpan={true}/>
                            </Row>
                        </Form>
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存 */}
                                <CosButton disabled={buttonFlag?true:false} onClick={() => handleSave()} auth='AFCM-BASE-FEE-002-B03'><FormattedMessage id='lbl.save' /></CosButton>
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

export default agencyContactPort;