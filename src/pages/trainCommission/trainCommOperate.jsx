{/* 班列佣金-班列放弃佣金航线操作 */}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,  useIntl} from 'umi'
import request from '@/utils/request';
import { acquireSelectData, momentFormat,acquireSelectDataExtend,acquireCompanyData,allCompany,agencyCodeData,companyAgency} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText';
import SelectVal from '@/components/Common/Select';
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
    ReadOutlined
} from '@ant-design/icons'
const confirm = Modal.confirm

const trainComm =()=> {
    const [tableData,setTableData] = useState([]) // table数据
    const [tabTotal,setTabTotal ] = useState([]) // table条数
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [txt, setTxt] = useState(''); //弹窗标题
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]);  //选择行
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [writeFlag,setWriteFlag] = useState(false);  //编辑修改权限
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [commType,setCommType] = useState({}) // 佣金类型
    const [hrchyType, setHrchyType] = useState({}); //层次类型
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
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
        "agencyCode": null,
        "commissionType": null,
        "companyCode": null,
        "hierarchyType": null,
        "portCode": null,
        "serviceLoopCode": null,
        "svvd": null,
        "activeDate": null,
    });

    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectData('COMMISSION.CLASS.L', setCommType, $apiUrl);  // 佣金类型 
        acquireSelectData('BANLIE.SVC.HRCHY.TYPES', setHrchyType, $apiUrl);  // 层次类型 
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireCompanyData(setCompanysData, $apiUrl);   // 公司
        // allCompany(setCompanysData,$apiUrl)
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        companys()
    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            companyCode: companyData,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        companyAgency($apiUrl,companyData,setAgencyCode)
    }, [company, acquireData,companyData])
    useEffect(() => {   // 默认值
        shipowner(company);   // 船东
    }, [company])
    {/* from 数据 */}
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    let formlayouts={
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
    }
    {/* 公司 */}
    const companys = async() =>{
        setCompanyData('')
        await request.post($apiUrl.AG_FEE_AGMT_SEARCH_INIT)
        .then((resul) => {
            if(!resul.data)return
            var data = resul.data.companys;
            data.map((val, idx)=> {
                val['value'] = val.companyCode ;
                val['label'] = val.companyCode + '-' + val.companyNameCn;

            })
            data?setCompanysData(data):null;
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
    const shipowner = async(company) => {
        await request.post($apiUrl.COMMON_DICT_ITEM + '?key=' + 'CB0068', {
            method:"POST",
        })
        .then((result) => {
            if(result.success) {
                let data = result.data.values;
                const newData = [];   // 新船东

                data.map((v, i) => {
                    if(v.value == company.companyCode) {
                        newData.unshift({label: '*', value: "*"});
                        newData.push(v);
                        queryForm.setFieldsValue({
                            shipownerCompanyCode: v.label + `(${v.value})`
                        })
                        console.log(newData)
                    }
                    console.log(newData)
                })
                console.log(newData)
                data.map((v, i) => {
                    v.label = v.label + `(${v.value})`; 
                })
                data.unshift({label: '*', value: "*"});

                newData.length > 0 ? data = newData : data;
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
                        {/* <a onClick={() => {deleteBtn(record, index)}} style={{color:'red'}}><CloseCircleOutlined/></a>&nbsp; */}
                        <a><CosButton auth='AFCM-CMS-BANLIE-002-B02' onClick={() => {deleteBtn(record, index)}} ><CloseCircleOutlined style={{color:'red',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        {/* <a onClick={() => {editViewBtn(record, false)}}  ><FormOutlined/></a>&nbsp; */}
                        <a><CosButton auth='AFCM-CMS-BANLIE-002-B04' onClick={() => {editViewBtn(record, false)}} ><FormOutlined style={{color:'#1890ff',fontSize: '15px'}}/></CosButton> </a>
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
            title: <FormattedMessage id='lbl.ac.invoice.fee-type'/>,//费用类型   
            dataIndex: 'commissionType',
            // dataType: commType.values,
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id= 'lbl.company'/>,//公司
            dataIndex: 'companyCode',
            // dataType: companysData,
            align:'left', 
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.carrier.loc'/>,//代理
            dataIndex: 'agencyCode',
            align:'left', 
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.port'/>,//港口
            dataIndex: 'portCode',
            align:'left', 
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.route'/>,//航线
            dataIndex: 'serviceLoopCode',
            align:'left', 
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.SVVD'/>,//SVVD
            dataIndex: 'svvd',
            align:'left', 
            sorter: false,
            width: 40,
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
        const result = await request($apiUrl.TRAIN_COMM_GIVE_UP_COMM_ROUTE_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    // ...queryForm.getFieldValue(),
                    agencyCode: queryData.agencyCode,
                    commissionType: queryData.commissionType,
                    companyCode: queryData.companyCode,
                    hierarchyType: queryData.hierarchyType,
                    portCode: queryData.portCode,
                    serviceLoopCode: queryData.serviceLoopCode,
                    svvd: queryData.svvd,
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
                    if(commType.values!=null){
                        commType.values.map((val, i) => {
                            if(val.value == v.commissionType) {
                                v.commissionType =  val.label 
                            }
                        })
                    }
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
        setTxt(intl.formatMessage({id:'menu.afcm.trainComm.trainCommOperate'})); 
        setButtonFlag(false)
        setWriteFlag(false);
        queryForm.setFieldsValue({
            popData: {
                shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                agencyCode: company.agencyCode,
                commissionType: null,
                companyCode: companyData,
                hierarchyType: null,
                portCode: null,
                serviceLoopCode: null,
                svvd: null,
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
        setSpinflag(true);
        const result = await request($apiUrl.TRAIN_COMM_GIVE_UP_COMM_ROUTE_SEARCH_DETAIL,      
            {
                method:'POST',
                data: {
                    uuid: record.banlieServiceExcludeUuid,
                }
            }
        )
        if(result.success) {
            setSpinflag(false);
            setButtonFlag(flag);
            setWriteFlag(flag);
            let data = result.data;
            queryForm.setFieldsValue({
                popData:{
                    shipownerCompanyCode: data.shipownerCompanyCode,
                    agencyCode: data.agencyCode,
                    companyCode: data.companyCode,
                    commissionType: data.commissionType,
                    hierarchyType: data.hierarchyType,
                    portCode: data.portCode,
                    serviceLoopCode: data.serviceLoopCode,
                    svvd: data.svvd,
                    activeDate: [moment(data.fromDate),moment(data.toDate)],
                    banlieServiceExcludeUuid: data.banlieServiceExcludeUuid, 
                }
            })
            // if(flag) {
            //     setTxt(intl.formatMessage({id:'lbl.ViewDetails'}));
                
            // } else {
            //     setTxt(intl.formatMessage({id:'lbl.edit'}));
            // }
            setTxt(intl.formatMessage({id:'menu.afcm.trainComm.trainCommOperate'}));
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
                const deleteData = await request($apiUrl.TRAIN_COMM_GIVE_UP_COMM_ROUTE_DELETE_UUID,{
                    method:'POST',
                    data:{
                        params: {
                            banlieServiceExcludeUuid: record.banlieServiceExcludeUuid,
                        }
                    } 
                })
                if(deleteData.success) {
                    setSpinflag(false);
                    pageChange(page);
                    Toast('',deleteData.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                    Toast('',deleteData.errorMessage, 'alert-error', 5000, false)
                }
            }
        })  
    }
    {/* 清空 */}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            companyCode: companyData,
        })
        setTableData([]);
        setChecked([]);
        setBackFlag1(true)
        setBackFlag2(true)
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.serviceLoopCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.hierarchyType){setBackFlag2(false)}else{setBackFlag2(true)}
        if(/^[\u4e00-\u9fa5]+$/i.test(queryData.serviceLoopCode) || /^[\u4e00-\u9fa5]+$/i.test(queryData.portCode) || /^[\u4e00-\u9fa5]+$/i.test(queryData.svvd)){//检测输入的中文汉字
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});
            return
        }else if(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.serviceLoopCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.portCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.svvd)){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});//检测输入的中文符号
            return
        }
        if(queryData.serviceLoopCode){
            if(queryData.serviceLoopCode.length>5){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.route'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.portCode){
            if(queryData.portCode.length>10){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.port'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.svvd){
            if(queryData.svvd.length>15){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.SVVD'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(!queryData.hierarchyType || !queryData.serviceLoopCode){
           setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Train-route-warn'})});
           return;
       }else{
            setSpinflag(true);
            const save = await request($apiUrl.TRAIN_COMM_GIVE_UP_COMM_ROUTE_SAVE_SUBMIT,{
                method:"POST",
                data:{
                    "params": {
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        agencyCode: queryData.agencyCode,
                        companyCode: queryData.companyCode,
                        hierarchyType: queryData.hierarchyType,
                        serviceLoopCode: queryData.serviceLoopCode,
                        commissionType: queryData.commissionType,
                        portCode: queryData.portCode,
                        svvd: queryData.svvd,
                        fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                        banlieServiceExcludeUuid: queryData.banlieServiceExcludeUuid, 
                    },
                }
            })
            if(save.success) {
                setSpinflag(false);
                queryForm.resetFields()
                queryForm.setFieldsValue({
                    // agencyCode: company.agencyCode,
                    companyCode: companyData,
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
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.TRAIN_COMM_GIVE_UP_COMM_ROUTE_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    // entryCode:"AFCM_BANLIE_SVC_EX",
                    agencyCode: queryData.agencyCode,
                    commissionType: queryData.commissionType,
                    companyCode: queryData.companyCode,
                    hierarchyType: queryData.hierarchyType,
                    portCode: queryData.portCode,
                    serviceLoopCode: queryData.serviceLoopCode,
                    svvd: queryData.svvd,
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.trainComm.trainCommOperate'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        commissionType: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                        companyCode: intl.formatMessage({id: "lbl.company"}),
                        agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                        portCode: intl.formatMessage({id: "lbl.port"}),
                        serviceLoopCode: intl.formatMessage({id: "lbl.route"}),
                        svvd: intl.formatMessage({id: "lbl.SVVD"}),
                        fromDate: intl.formatMessage({id: "lbl.effective-date"}),
                        toDate: intl.formatMessage({id: "lbl.expiration-date"}),
                        fromDateId: intl.formatMessage({id: "lbl.effective-date-id"}),
                        toDateId: intl.formatMessage({id: "lbl.expiration-date-id"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.update-date"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.Update-users"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.trainComm.trainCommOperate'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.trainComm.trainCommOperate'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.trainComm.trainCommOperate'})+ '.xlsx'; // 下载后文件名
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
    {/* 公司&&代理联动 */}
	const selectBtn = async(value, all) => {
        if(all.value==""){
            queryForm.setFieldsValue({
                popData:{
                    agencyCode: null
                }
            })
        }else{
        //     queryForm.setFieldsValue({
        //         popData:{
        //             agencyCode: all.linkage.sapCustomerCode
        //         }
        //     })
            queryForm.setFieldsValue({
                popData:{
                    agencyCode:all.linkage.sapCustomerCode,
                    subAgencyCode:all.linkage.sapCustomerCode,
                }
            })
            let data = all.linkage.companyCode
            companyAgency($apiUrl,data,setAgencyCode)
        }
	}
    const  companyIncident = async (value,all) => {
        if(all.linkage){
            let data = all.linkage.companyCode
            companyAgency($apiUrl,data,setAgencyCode)
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
                        referenceType: "BANLIE_EXCLUDE",
                        referenceUuid: record.banlieServiceExcludeUuid
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
                        {/* 公司 */}
                        <SelectVal name='companyCode' label={<FormattedMessage id='lbl.company'/>} span={6} options={companysData} showSearch={true} formlayouts={formlayouts} selectChange={companyIncident} flag={true}/>
                        {/* 代理编码 */}
                        {/* <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}   maxLength={10} formlayouts={formlayouts}/> */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <SelectVal showSearch={true} flag={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                        }
                        {/* 佣金类型 */}
                        <SelectVal name='commissionType' label={<FormattedMessage id='lbl.Commission-type'/>} span={6} options={commType.values} flag={true} formlayouts={formlayouts}/>
                        {/* 生效日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.effective-date'/>} span={6}  formlayouts={formlayouts}/> 
                        {/* HRCHY_TYPE */}
                        <SelectVal name='hierarchyType' label={<FormattedMessage id='lbl.Hrchy-type'/>} span={6} options={hrchyType.values} flag={true} formlayouts={formlayouts}/>
                        {/* 港口 */}
                        <InputText name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6} formlayouts={formlayouts}/>
                        {/* 航线 */}
                        <InputText name='serviceLoopCode' label={<FormattedMessage id='lbl.route'/>} span={6} formlayouts={formlayouts}/>
                        {/* svvd */}
                        <InputText name='svvd' label={<FormattedMessage id='lbl.SVVD'/>} span={6} formlayouts={formlayouts}/>
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增 */}
                    <CosButton  onClick={addBtn} auth="AFCM-CMS-BANLIE-002-B03"><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
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
                    rowKey='banlieServiceExcludeUuid'
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
                                {/* <SelectVal  name={['popData','shipownerCompanyCode']} disabled={writeFlag} label={<FormattedMessage id='lbl.carrier'/>} disabled={company.companyType == 0 ? true : false} options={acquireData.values} span={12} isSpan={true}/> */}
                                <SelectVal span={12} name={['popData','shipownerCompanyCode']} disabled={writeFlag} label={<FormattedMessage id='lbl.carrier'/>} options={PopupAcquireData} isSpan={true}/>
                                {/* 公司 */}
                                <SelectVal name={['popData','companyCode']} disabled={writeFlag} label={<FormattedMessage id='lbl.company'/>} span={12} options={companysData} showSearch={true} isSpan={true} flag={true} selectChange={selectBtn}/>
                                {/* 代理编码 */}
                                <InputText name={['popData','agencyCode']} disabled label={<FormattedMessage id='lbl.agency'/>}   span={12} isSpan={true}/>
                                {/* <SelectVal name={['popData','agencyCode']} disabled={writeFlag} label={<FormattedMessage id='lbl.agency'/>} isSpan={true} span={12} options={agencyCode}/>   */}
                                {/* 佣金类型 */}
                                <SelectVal name={['popData','commissionType']} disabled={writeFlag} label={<FormattedMessage id='lbl.Commission-type'/>} span={12} options={commType.values} flag={true} isSpan={true}/>
                                {/* 航线 */}
                                <InputText name={['popData','serviceLoopCode']} disabled={writeFlag} styleFlag={backFlag1} label={<FormattedMessage id='lbl.route'/>} span={12} maxLength={5} isSpan={true}/>
                                {/* HRCHY_TYPE */}
                                <SelectVal name={['popData','hierarchyType']} disabled={writeFlag} style={{background:backFlag2?'white':'yellow'}} label={<FormattedMessage id='lbl.Hrchy-type'/>} span={12} options={hrchyType.values} isSpan={true} flag={true}/>
                                {/* 港口 */}
                                <InputText name={['popData','portCode']} disabled={writeFlag} label={<FormattedMessage id='lbl.port'/>} span={12} maxLength={10} isSpan={true}/>
                                {/* 生效日期 */}
                                <DoubleDatePicker flag={false} disabled={writeFlag} name={['popData','activeDate']} label={<FormattedMessage id='lbl.effective-date'/>} span={12} isSpan={true} /> 
                                {/* svvd */}
                                <InputText name={['popData','svvd']} disabled={writeFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={12} maxLength={15} isSpan={true}/>
                            </Row>
                        </Form>
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存 */}
                                <CosButton disabled={buttonFlag?true:false} onClick={() => handleSave()} auth='AFCM-CMS-BANLIE-002-B01'><FormattedMessage id='lbl.save' /></CosButton>
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
export default trainComm