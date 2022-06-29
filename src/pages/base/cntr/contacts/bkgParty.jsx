{/*代理往来(Booking Party)*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,  useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import Select from '@/components/Common/Select';
import { Button, Form, Row, Tooltip, Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {acquireSelectData,agencyCodeData } from '@/utils/commonDataInterface';
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading';
import {CosToast}  from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import Selects from '@/components/Common/Select';
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

const bookingParty =()=> {
    const [commissionType, setCommissionType] = useState({}); // 佣金类型
    const [tableData, setTableData] = useState([]);     // 编辑查看详情数据
    const [tabTotal,setTabTotal] = useState([]);//表格的数据
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [writeRead,setWriteRead] = useState(false);//区别新增编辑查看详情
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [txt, setTxt] = useState(''); //弹窗标题
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const [backFlag3,setBackFlag3] = useState(true);//背景颜色
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [infoTips, setInfoTips] = useState({});   //message info
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page,setPage]=useState({
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
        setChecked([]);
        setCheckedRow([])
    }
    {/*初始化*/}
	useEffect(()=>{
        acquireSelectData('COMM.TYPE',setCommissionType, $apiUrl);// 佣金类型
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode
        })
    }, [company])

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
                    {/* 编辑 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={()=>addView(record,false)}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-BASE-CMS-002-B04' onClick={() => {addView(record, false)}} ><FormOutlined style={{color:'#1890ff',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a onClick={()=>addView(record,true)}><FileSearchOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataIndex: 'commissionType',
            dataType: commissionType.values,
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.booking-party-code" />,//预约方代码
            dataIndex: 'bookingPartyCode',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.packet-broker" />,//数据包对应的代理
            dataIndex: 'packageAgencyCode',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.correspond-sap-id" />,//对应的SAP ID
            dataIndex: 'customerSAPId',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.update-date" />,//录用日期
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            width: 120,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.update-people" />,//录用人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 80,
            align:'left', 
        },
    ]

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
        const localsearch= await request($apiUrl.AGENCY_FEE_ACCOUNT_CHECK_MONITOR_SEARCH_LIST,{
            method:'POST',
            data:{
                "page":pagination,
                "params": {
                    "paramEntity":{
                        // ...queryForm.getFieldValue(),
                        agencyCode: queryForm.getFieldValue().agencyCode,
                        commissionType: queryForm.getFieldValue().commissionType,
                        bookingPartyCode: queryForm.getFieldValue().bookingPartyCode,
                    },
                    "entryCode": "AFCM_B_AGENCY_BKG_PARTY"
                }
            }
        })
        let data=localsearch.data
        if(localsearch.success){
            setSpinflag(false);
            let datas=localsearch.data.resultList
            // if(datas!=null){
            //     datas.map((v,i)=>{
            //         v.recordUpdateDatetime ? v["recordUpdateDatetime"] = v.recordUpdateDatetime.substring(0, 10) : null;
            //     })
            // }
            setPage({...pagination})
            setTableData([...datas])
            setTabTotal(data.totalCount)
            setSelectedRowKeys([...datas])
            if(datas.length==0){
                setTableData([])
                Toast('', intl.formatMessage({id: 'lbl.query-warn'}), 'alert-error', 5000, false);
            }
        }else {
            setSpinflag(false);
            setTableData([])
            Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
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
                return {agencyBookingPartyUuid: item.agencyBookingPartyUuid, }
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
                    const deleteData = await request($apiUrl.AGENCY_CONTACTS_BOOKING_PARTY_DELETE,{
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
    {/* 新建*/}
    const addBtn = async() => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id: 'menu.afcm.base.cntr.bkgParty'})); 
        setWriteRead(false);  //编辑权限
        setCommonFlag(false);  //控制读写
        setButtonFlag(false);
        queryForm.setFieldsValue({
            popData: {
                agencyCode: null,
                commissionType: null,
                bookingPartyCode: null,
                packageAgencyCode: null,
                customerSAPId: null,
            }
        })
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,500);
    }
    {/* 编辑/查看明细 */}
    const addView = async(record, flag) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        // 查看详情为true，编辑为false
        const result = await request($apiUrl.COMM_MODULE_SEARCH_PRE_HEAD_DETAIL,       
            {
                method:'POST',
                data: {
                    "params":{
                        "entryCode": "AFCM_B_AGENCY_BKG_PARTY"
                    },
                    uuid: record.agencyBookingPartyUuid
                }
            }
        )
        if(result.success) {
            setSpinflag(false);
            setCommonFlag(flag);
            setWriteRead(true);
            setButtonFlag(flag);
            let data = result.data;
            queryForm.setFieldsValue({
                popData:{
                    agencyCode: data.agencyCode,
                    commissionType: data.commissionType,
                    bookingPartyCode: data.bookingPartyCode,
                    packageAgencyCode: data.packageAgencyCode,
                    customerSAPId: data.customerSAPId,
                    agencyBookingPartyUuid: data.agencyBookingPartyUuid
                }
            })
            // if(flag) {
            //     setTxt(intl.formatMessage({id: 'lbl.ViewDetails'}));
            // } else {
            //     setTxt(intl.formatMessage({id: 'lbl.edit'}));
            // }
            setTxt(intl.formatMessage({id: 'menu.afcm.base.cntr.bkgParty'})); 
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
        setIsModalVisible(false);
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.agencyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.commissionType){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.bookingPartyCode){setBackFlag3(false)}else{setBackFlag3(true)}
        if(/^[\u4e00-\u9fa5]+$/i.test(queryData.agencyCode) || /^[\u4e00-\u9fa5]+$/i.test(queryData.bookingPartyCode) || 
            /^[\u4e00-\u9fa5]+$/i.test(queryData.packageAgencyCode) || /^[\u4e00-\u9fa5]+$/i.test(queryData.customerSAPId)){//检测输入的中文汉字
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});
            return
        }else if(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.agencyCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.bookingPartyCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.packageAgencyCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.customerSAPId)){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});//检测输入的中文符号
            return
        }
        if(queryData.agencyCode){
            if(queryData.agencyCode.length>10){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.agency'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.bookingPartyCode){
            if(queryData.bookingPartyCode.length>10){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.booking-party-code'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.packageAgencyCode){
            if(queryData.packageAgencyCode.length>10){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.packet-broker'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.customerSAPId){
            if(queryData.customerSAPId.length>10){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.correspond-sap-id'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(!queryData.agencyCode || !queryData.commissionType || !queryData.bookingPartyCode){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.bkgParty-warn'})});
            return;
        }else{
            setSpinflag(true);
            const save = await request($apiUrl.AGENCY_CONTACTS_BOOKING_PARTY_SAVE_SUBMIT,{
                method:"POST",
                data:{
                    "params": {
                        ...queryForm.getFieldValue().popData,
                    }
                }
            })
            if(save.success) {
                setSpinflag(false);
                // queryForm.resetFields();
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
                    entryCode:"AFCM_B_AGENCY_BKG_PARTY",
                    paramEntity:{
                        ...queryForm.getFieldValue(),
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.base.cntr.bkgParty'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        commissionType: intl.formatMessage({id: "lbl.Commission-type"}),
                        bookingPartyCode: intl.formatMessage({id: "lbl.booking-party-code"}),
                        packageAgencyCode: intl.formatMessage({id: "lbl.packet-broker"}),
                        customerSAPId: intl.formatMessage({id: "lbl.correspond-sap-id"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.employment-date"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.employment-person"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.base.cntr.bkgParty'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.base.cntr.bkgParty'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.base.cntr.bkgParty'}) + '.xlsx'; // 下载后文件名
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
						{/* <InputText span={6} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} />  */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} /> : <Selects showSearch={true} flag={true} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} options={agencyCode} />
                        }
                        {/* 佣金类型 */}
                        <Select span={6} name='commissionType' flag={true}  label={<FormattedMessage id='lbl.Commission-type'/>} options={commissionType.values}/>
                        {/* 预约方代码 */}
                        <InputText span={6} name='bookingPartyCode' label={<FormattedMessage id='lbl.booking-party-code'/>} /> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-BASE-CMS-002-B01'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                    {/* 删除 */}
                    <CosButton  onClick={deleteBtn} auth='AFCM-BASE-CMS-002-B02'><DeleteOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
					{/* 下载 */}
                    <CosButton onClick={downloadBtn} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className="button-right">
                    <CosButton onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></CosButton>
                    <CosButton onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className="footer-table">
                <div style={{width: '75%'}}>
                    <PaginationTable
                            dataSource={tableData}
                            columns={columns}
                            rowKey='agencyBookingPartyUuid'
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
            <CosModal cbsWidth={600} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/>   
                <div className='modalContent' style={{minWidth: '300px'}}>
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 代理编码 */}
                                <InputText  disabled={commonFlag} span={12} name={['popData','agencyCode']} styleFlag={backFlag1} label={<FormattedMessage id='lbl.agency'/>} maxLength={10} isSpan={true}/> 
                                {/* 佣金类型 */}
                                <Select  disabled={writeRead} span={12} name={['popData','commissionType']} style={{background:backFlag2?'white':'yellow'}} options={commissionType.values} flag={true} label={<FormattedMessage id='lbl.Commission-type'/>} isSpan={true}/>
                                {/* 预约方代码 */}
                                <InputText  disabled={writeRead} span={12} name={['popData','bookingPartyCode']} styleFlag={backFlag3} label={<FormattedMessage id='lbl.booking-party-code'/>} maxLength={10} isSpan={true}/> 
                                {/* 数据包对应的代理 */}
                                <InputText  disabled={commonFlag} span={12} name={['popData','packageAgencyCode']} label={<FormattedMessage id='lbl.packet-broker'/>}  maxLength={10} isSpan={true}/> 
                                {/* 对应的SAP ID */}
                                <InputText  disabled={commonFlag} span={12} name={['popData','customerSAPId']} label={<FormattedMessage id='lbl.correspond-sap-id'/>}  maxLength={10} isSpan={true}/> 
                            </Row>
                        </Form>
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存 */}
                                <CosButton disabled={buttonFlag?true:false} onClick={() => handleSave()} auth='AFCM-BASE-CMS-002-B03'><FormattedMessage id='lbl.save' /></CosButton>
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

export default bookingParty;