{/* Office对应代理 */}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,  useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import Select from '@/components/Common/Select';
import SelectVal from '@/components/Common/Select';
import { Button, Form, Row, Tooltip, Modal,} from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {acquireSelectData, agencyCodeData,acquireSelectDataExtend,momentFormat,companyAgency } from '@/utils/commonDataInterface';
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading';
import {CosToast}  from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import moment from 'moment';
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
} from '@ant-design/icons'
const confirm = Modal.confirm

const portOffice =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [officeData, setOfficeData] = useState([]);     // office表格数据
    const [officeTotal,setOfficeTotal] = useState([]);//office 数量
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [txt, setTxt] = useState(''); //弹窗标题
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [infoTips, setInfoTips] = useState({});   //message info
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [hrchyType, setHrchyType] = useState({}); //层次类型
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [companyData, setCompanyData] = useState('')
    const [saveType, setSaveType] = useState('NEW')
    const [writeFlag,setWriteFlag] = useState(false);  //编辑修改权限
    const [recordData,setRecordData] = useState([]);  //查看明细数据
    const [officePage,setOfficePage]=useState({
        current: 1,
        pageSize: 10
    });
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "commissionType": null,
        "bookingPartyCode": null,
    });
    {/*查询*/}
	const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    {/*初始化*/}
	useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('BANLIE.SVC.HRCHY.TYPES', setHrchyType, $apiUrl);  // 层次类型 
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        companys()// 公司
    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    {/*表格文本*/}
	const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 80,
            align:'center',
            fixed: false,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.delete' />}><a onClick={() => {deleteBtn(record, index)}} style={{color:'red'}}><CloseCircleOutlined/></a>&nbsp;</Tooltip>&nbsp;&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a><CosButton auth='AFCM-BASE-CMS-005-B03' onClick={() => {deleteBtn(record, index)}} ><CloseCircleOutlined style={{color:'red',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={()=>addView(record,false)}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-BASE-CMS-005-B04' onClick={() => {addView(record, false)}} ><FormOutlined style={{color:'#1890ff',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a onClick={()=>addView(record,true)}><FileSearchOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.carrier' />,//船东 SO_COMPANY_CDE
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.office-code'/>,//OFCE_CDE
            dataIndex: 'officeCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Hrchy-type' />,//层次类型 HRCHY_TYPE
            dataIndex: 'hierarchyType',
            sorter: false,
            width: 80,
            align:'left', 
        },{
            title: <FormattedMessage id='lbl.effective-date' />,//生效日期 FM_DTE
            dataIndex: 'fromDate',
            dataType: 'dateTime',
            sorter: false,
            width: 80,
            align:'left', 
        },{
            title: <FormattedMessage id='lbl.expiration-date'/>,//失效日期 TO_DTE
            dataIndex: 'toDate',
            dataType: 'dateTime',
            sorter: false,
            width: 80,
            align:'left', 
        },{
            title: <FormattedMessage id='lbl.company-code'/>,//公司代码 COMPANY_CDE
            dataIndex: 'companyCode',
            sorter: false,
            width: 80,
            align:'left', 
        },{
            title: <FormattedMessage id='lbl.sapid'/>,//SAP_ID
            dataIndex: 'sapId',
            sorter: false,
            width: 80,
            align:'left', 
        },{
            title: <FormattedMessage id="lbl.base-agent" />,//主代理 PARENT_SAP_ID
            dataIndex: 'parentSapId',
            sorter: false,
            width: 80,
            align:'left', 
        },{
            title: <FormattedMessage id='lbl.ac.pymt.claim-note'/>,//备注 MEMO
            dataIndex: 'memo',
            sorter: false,
            width: 80,
            align:'left', 
        },{
            title: <FormattedMessage id="lbl.update-date" />,//更新日期 REC_UPD_DT
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            width: 80,
            align:'left', 
        },{
            title: <FormattedMessage id='lbl.update-people'/>,//更新人员 REC_UPD_USR
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 80,
            align:'left', 
        },
    ]

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
    {/* 公司代理联动 */}
    const companyIncident = async (value, all) => {
        queryForm.setFieldsValue({
            popData:{
                parentSapId: all.linkage.sapCustomerCode,
                sapId: all.linkage.sapCustomerCode,
            }
        })
        let data = all.linkage.companyCode
        companyAgency($apiUrl, data, setAgencyCode)
    }
    {/*查询表格数据*/}
    const pageChange = async (pagination,search) =>{
        setSpinflag(true);
        Toast('', '', '', 5000, false);  
        let queryData = queryForm.getFieldValue()
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=officePage.pageSize){
            pagination.current=1
        }
            const result = await request($apiUrl.BASE_PORT_OFFICE_SEARCH_LIST,{
                method:"POST",
                data:{
                    page: pagination,
                    params: {
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        hierarchyType: queryData.hierarchyType,
                        officeCode: queryData.officeCode,    
                        parentSapId: queryData.parentSapId,
                        fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                        toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    },
                    operateType: 'Office',
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                if(datas!=null){
                    datas.map((v,i)=>{
                        v.uid=i
                    })
                }
                setOfficePage({...pagination})
                setOfficeTotal(data.totalCount)
                if(datas==null){
                    setOfficeData([])
                    Toast('', intl.formatMessage({id: 'lbl.query-warn'}), 'alert-error', 5000, false);
                }else{
                    setOfficeData([...datas])
                }
            }else {
                setSpinflag(false);
                setOfficeData([])
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
                const deleteData = await request($apiUrl.BASE_PORT_OFFICE_DELETE_UUID,{
                    method:'POST',
                    data:{
                        params:{
                            officeCode: record.officeCode,    
                            hierarchyType: record.hierarchyType,
                            fromDate: record.fromDate,
                            shipownerCompanyCode: record.shipownerCompanyCode,
                        },
                        operateType: 'Office',

                    } 
                })
                if(deleteData.success) {
                    setSpinflag(false);
                    pageChange(officePage);
                    Toast('',deleteData.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                    Toast('', deleteData.errorMessage, 'alert-error', 5000, false);
                }
            }
        }) 
    }
    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setOfficeData([])
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }
    {/* 新建*/}
    const addBtn = async() => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setSaveType('NEW')
        setWriteFlag(false);
        setTxt(intl.formatMessage({id: 'menu.afcm.base.officeAgent'})); 
        queryForm.setFieldsValue({
            popData: {
                shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                hierarchyType: null,
                activeDate: null,
                companyCode: companyData,
                sapId: null,
                parentSapId: null,
                officeCode: null,
            }
        })
        companyAgency($apiUrl, companyData, setAgencyCode)
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,500);
    }
    {/* 编辑/查看明细 */}
    const addView = async(record, flag) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        setSaveType('UPD')
        // 查看详情为true，编辑为false
        const result = await request($apiUrl.BASE_PORT_OFFICE_SEARCH_LIST,       
            {
                method:'POST',
                data: {
                    params:{
                        officeCode: record.officeCode,   
                        hierarchyType: record.hierarchyType,
                        fromDate: record.fromDate,
                        shipownerCompanyCode: record.shipownerCompanyCode,
                        actType: 'VALID'
                    },
                    operateType: 'Office',
                }
            }
        )
        if(result.success) {
            setTxt(intl.formatMessage({id: 'menu.afcm.base.officeAgent'})); 
            setSpinflag(false);
            setWriteFlag(flag);
            let data = result.data.resultList[0];
            companyAgency($apiUrl, data.companyCode, setAgencyCode)
            setRecordData(data)
            queryForm.setFieldsValue({
                popData: {
                    shipownerCompanyCode: data.shipownerCompanyCode,
                    hierarchyType: data.hierarchyType,
                    activeDate: [moment(data.fromDate),moment(data.toDate)],
                    companyCode: data.companyCode,
                    sapId: data.sapId,
                    parentSapId: data.parentSapId,
                    officeCode: data.officeCode,
                }
            })
            // if(flag) {
            //     setTxt(intl.formatMessage({id: 'lbl.ViewDetails'}));
            // } else {
            //     setTxt(intl.formatMessage({id: 'lbl.edit'}));
            // }
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 取消 */}
    const handleCancel = () => {
        setInfoTips({});
        queryForm.setFieldsValue({
            popData: null
        })
        setIsModalVisible(false)
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        let paramList = {}
        if(saveType=='NEW'){
            paramList = [
                {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    officeCode: queryData.officeCode,  
                    hierarchyType: queryData.hierarchyType,
                    companyCode: queryData.companyCode,
                    sapId: queryData.sapId,
                    parentSapId: queryData.parentSapId,
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    actType: saveType
                },
                {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    officeCode: queryData.officeCode,  
                    hierarchyType: queryData.hierarchyType,
                    companyCode: queryData.companyCode,
                    sapId: queryData.sapId,
                    parentSapId: queryData.parentSapId,
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    actType: saveType
                }
            ]
        }else{
            paramList = [
                {   shipownerCompanyCode: queryData.shipownerCompanyCode,  //新数据
                    officeCode: queryData.officeCode,  
                    hierarchyType: queryData.hierarchyType,
                    companyCode: queryData.companyCode,
                    sapId: queryData.sapId,
                    parentSapId: queryData.parentSapId,
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                    actType: saveType,
                },
                {  //旧数据
                    shipownerCompanyCode: recordData.shipownerCompanyCode,
                    officeCode: recordData.officeCode,
                    hierarchyType: recordData.hierarchyType,
                    companyCode: recordData.companyCode,
                    sapId: recordData.sapId,
                    parentSapId: recordData.parentSapId,
                    fromDate: recordData.fromDate,
                    toDate: recordData.toDate,
                    actType: saveType
                }
            ]
        }
        if(/^[\u4e00-\u9fa5]+$/i.test(queryData.officeCode)){//检测输入的中文汉字
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});
            return
        }else if(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.officeCode)){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});//检测输入的中文符号
            return
        }
        if(!queryData.shipownerCompanyCode || !queryData.hierarchyType || !queryData.companyCode ||
            !queryData.activeDate || !queryData.sapId  || !queryData.parentSapId || !queryData.officeCode){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.port-office-save'})});
           return;
        }else if(queryData.officeCode.length>3){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.office-code'})+intl.formatMessage({id: 'lbl.comm-input'})});
            return
        }else{
            setSpinflag(true);
            const save = await request($apiUrl.BASE_PORT_OFFICE_SAVE_UPDATE,{
                method:"POST",
                data:{
                    "operateType": 'Office',
                    paramsList: paramList
                }
            })
            if(save.success) {
                setSpinflag(false);
                let data = save.data
                pageChange(officePage);
                if(data.messageCode=='SUCCESS'){
                    Toast('', data.messageDesc, 'alert-success', 5000, false);
                    setIsModalVisible(false)
                }else{
                    setInfoTips({alertStatus: 'alert-error', message: data.messageDesc});
                }
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
        const result = await request($apiUrl.BASE_PORT_OFFICE_DOWNLOAD,{
            method:"POST",
            data:{
                excelFileName: intl.formatMessage({id: 'lbl.office-download-title'}), //文件名
                params: {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    hierarchyType: queryData.hierarchyType,
                    officeCode: queryData.officeCode,   
                    parentSapId: queryData.parentSapId,
                    fromDate: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    toDate: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                },
                operateType: 'Office',
                sheetList: [{//sheetList列表
                    dataCol: {
                        shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                        officeCode: intl.formatMessage({id: "lbl.port"}),
                        hierarchyType: intl.formatMessage({id: "lbl.Hrchy-type"}),
                        fromDate: intl.formatMessage({id: "lbl.effective-date"}),
                        toDate: intl.formatMessage({id: "lbl.expiration-date"}),
                        companyCode: intl.formatMessage({id: "lbl.company-code"}),
                        sapId: intl.formatMessage({id: "lbl.sapid"}),
                        parentSapId: intl.formatMessage({id: "lbl.base-agent"}),
                        memo: intl.formatMessage({id: "lbl.ac.pymt.claim-note"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.update-date"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.update-people"}),
                    },
                    sheetName: intl.formatMessage({id: 'lbl.office-download-title'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'lbl.office-download-title'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'lbl.office-download-title'}) + '.xlsx'; // 下载后文件名
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
                        {/* 船东 */}
                        <Select  name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} disabled={company.companyType == 0 ? true : false} span={6} flag={true}/>
                        {/* Office code */}
						<InputText span={6} name='officeCode' label={<FormattedMessage id='lbl.office-code'/>}  span={6} /> 
                        {/* 层次类型 HRCHY_TYPE */}
                        <Select span={6} name='hierarchyType' flag={true}  label={<FormattedMessage id='lbl.Hrchy-type' />}  options={hrchyType.values}/>
                        {/* 有效日期 */}
                        <DoubleDatePicker name='activeDate' flag={true}  label={<FormattedMessage id='lbl.valid-date'/>} span={6}/>
                        {/* 主代理 parentSapId */}
                        <InputText span={6} name='parentSapId' label={<FormattedMessage id="lbl.base-agent"/>} /> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-BASE-CMS-005-B01'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
					{/* 下载 */}
                    <CosButton onClick={downloadBtn} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className="button-right">
                    <CosButton onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></CosButton>
                    <CosButton onClick={() => pageChange(officePage,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton> 
                </div>
            </div>
            {/* ================================================================================================================== */}
            <div className="footer-table">
                {/* Office */}
                <div style={{width: '90%'}}>
                    <PaginationTable
                        dataSource={officeData}
                        columns={columns}
                        rowKey='uid'
                        pageChange={pageChange}
                        pageSize={officePage.pageSize}
                        current={officePage.current}
                        scrollHeightMinus={200}
                        total={officeTotal}
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
                                <Select  name={['popData','shipownerCompanyCode']} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} disabled={company.companyType == 0 ? true : false} span={12} flag={true} isSpan={true}/>
                                {/* Office code */}
                                <InputText span={12} name={['popData','officeCode']} label={<FormattedMessage id='lbl.office-code'/>}  isSpan={true} maxLength={3} disabled={writeFlag}/> 
                                {/* 层次类型 HRCHY_TYPE */}
                                <Select span={12} name={['popData','hierarchyType']} flag={true}  label={<FormattedMessage id='lbl.Hrchy-type' />}  isSpan={true} options={hrchyType.values} flag={true} disabled={writeFlag}/>
                                {/* 有效日期 */}
                                <DoubleDatePicker name={['popData','activeDate']} flag={true}  label={<FormattedMessage id='lbl.valid-date'/>} span={12}  isSpan={true} disabled={writeFlag}/>
                                {/* 公司 */}
                                <Select span={12} name={['popData','companyCode']} label={<FormattedMessage id='lbl.company'/>}  isSpan={true} options={companysData} selectChange={companyIncident} showSearch={true} disabled={writeFlag}/> 
                                {/* 主代理 PARENT_SAP_ID */}
                                <SelectVal span={12} name={['popData','parentSapId']} label={<FormattedMessage id="lbl.base-agent" />}  isSpan={true} options={agencyCode} disabled={writeFlag}/>
                                {/* SAP ID */}
                                <SelectVal span={12} name={['popData','sapId']} label={<FormattedMessage id='lbl.sapid'/>}  isSpan={true} options={agencyCode} disabled={writeFlag}/> 
                            </Row>
                        </Form>
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存 */}
                                <CosButton  onClick={() => handleSave()}  disabled={writeFlag} auth='AFCM-BASE-CMS-005-B02'><FormattedMessage id='lbl.save' /></CosButton>
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

export default portOffice;