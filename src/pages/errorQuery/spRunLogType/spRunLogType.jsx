{/*SP运行日志类型*/}
import React, { useEffect, useState, $apiUrl} from 'react'
import {FormattedMessage, useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import { Button, Form, Row,Modal, Tooltip } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import Selects from '@/components/Common/Select';
import { acquireSelectData} from '@/utils/commonDataInterface';
import Loading from '@/components/Common/Loading';
import {CosToast}  from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import CosModal from '@/components/Common/CosModal'

import {
    DeleteOutlined,//删除
    FileAddOutlined,//新增
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    FormOutlined,//编辑
    SaveOutlined,//保存
    FileSearchOutlined,//查看详情
} from '@ant-design/icons'
const confirm = Modal.confirm

const spRunLogType =()=> {
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    const [tableData, setTableData] = useState([]);     // 编辑查看详情数据
    const [tabTotal,setTabTotal] = useState([]);//表格的数据
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [needLog, setNeedLog] = useState({}); //需要Log
    const [continueFlag, setContinueFlag] = useState({}); //继续标记
    const [txt, setTxt] = useState('');
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [operType,setOperType] = useState('NEW')  //保存传的操作类型
    const [queryDataCode, setQueryDataCode] = useState([]);   // 代码标记
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]);  //选择行
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [infoTips, setInfoTips] = useState({});   //message info
	const [lastCondition, setLastCondition] = useState({
        "messageCode": null,

    });
    {/*初始化*/}
	useEffect(()=>{
        acquireSelectData('NEED.LOG',setNeedLog, $apiUrl); //需要Log
        acquireSelectData('GO.FLAG',setContinueFlag, $apiUrl); //继续标记
    },[])

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
        setTableData([]);
        setChecked([]);
        setCheckedRow([]);
        setBackFlag(true);
    }

    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align:'center',
            fixed: false,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 编辑 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={()=>addView(record,false)}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-ERR-QUERY-003-B04' onClick={() => {addView(record, false)}} ><FormOutlined style={{color:'#1890ff',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a onClick={()=>addView(record,true)}><FileSearchOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Message-code'/>,//消息编码
            dataIndex: 'messageCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Desc'/>,//描述
            dataIndex: 'messageCodeDescription',
            align:'left', 
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id= 'lbl.Need-log'/>,//需要Log
            dataIndex: 'needLog',
            dataType: needLog.values,
            align:'left', 
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id= 'lbl.Continue-marking'/>,//继续标记
            dataIndex: 'continueFlag',
            dataType: continueFlag.values,
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Email'/>,//E-mail
            dataIndex: 'mailAddress',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Mobile-phone'/>,//移动电话
            dataIndex: 'mobilePhoneNumber',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Revision-personnel'/>,//修改人员
            dataIndex: 'recordUpdateUser',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.Revision-time'/>,//修改时间
            dataIndex: 'recordUpdateDatetime',
            align:'left', 
            sorter: false,
            width: 80,
        },
    ]
    {/*查询表格数据*/}
    const pageChange = async (pagination,search) =>{
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
            const result = await request($apiUrl.ERROR_SEARCH_SP_RUN_LOG_TYPE_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        // ...queryForm.getFieldValue(),
                        messageCode: queryForm.getFieldValue().messageCode
                    }
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
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
    {/* 新建 */}
    const addBtn = () => {
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id:'menu.afcm.errQuery.spRunLogType'})); 
        setCommonFlag(false);  //控制读写   
        setIsModalVisible(true);
        setButtonFlag(false); //保存按钮是否禁用
        setOperType('NEW');
        queryForm.setFieldsValue({
            popData: {
                messageCode: null,
                messageCodeDescription: null,
                needLog: 'N',
                continueFlag: null,
                mailAddress: null,
                mobilePhoneNumber: null,
            }
        })
    }
    {/* 编辑/查看明细 */}
    const addView = async(record, flag)=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.ERROR_SEARCH_SP_RUN_LOG_TYPE_SEARCH_LIST,{
            method:'POST',
            data: {
                params:{
                    messageCode: record.messageCode, 
                }
            }
        })
        if(result.success) {
            setSpinflag(false);
            setCommonFlag(flag); //控制读写
            setButtonFlag(flag); //保存按钮是否禁用
            setOperType('UPD') 
            let data = result.data;
            let datas=data.resultList[0]
            queryForm.setFieldsValue({
                popData:{
                    messageCode: datas.messageCode,
                    messageCodeDescription: datas.messageCodeDescription,
                    needLog: datas.needLog,
                    continueFlag: datas.continueFlag,
                    mailAddress: datas.mailAddress,
                    mobilePhoneNumber: datas.mobilePhoneNumber,
                }
            })
            setQueryDataCode(datas)
            // if(flag) {
            //     setTxt(intl.formatMessage({id:'lbl.ViewDetails'})); 
            // } else {
            //     setTxt(intl.formatMessage({id:'lbl.edit'}));  
            // }
            setTxt(intl.formatMessage({id:'menu.afcm.errQuery.spRunLogType'})); 
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 取消 */}
    const handleCancel = () => {
        setInfoTips({});
        setBackFlag(true);
        setIsModalVisible(false)
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.messageCode){
            setBackFlag(false);
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Sp-runlog-type'})});
            return
        }else{
            setBackFlag(true);
            setSpinflag(true);
            const save = await request($apiUrl.ERROR_SEARCH_SP_RUN_LOG_TYPE_SAVE_LIST,{
                method:"POST",
                data:{
                    "params": {
                        ...queryForm.getFieldValue().popData,
                        tmpMessageCode: queryDataCode.messageCode,
                    },
                    operateType:operType
                }
            })
            if(save.success) {
                setSpinflag(false);
                // queryForm.resetFields();
                setIsModalVisible(false)
                pageChange(page)
                Toast('',save.message, '', 5000, false)
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
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
                return item.messageCode
            })
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
                    const deleteData = await request($apiUrl.ERROR_SEARCH_SP_RUN_LOG_TYPE_DELETE_UUID,{
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
     {/* 下载 */}
     const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode:"AFCM_B_PROG_MSG_CDE",
                    paramEntity:{
                        ...queryForm.getFieldValue(),
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.errQuery.spRunLogType'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        messageCode: intl.formatMessage({id: "lbl.Message-code"}),
                        messageCodeDescription: intl.formatMessage({id: "lbl.Desc"}),
                        needLog: intl.formatMessage({id: "lbl.Need-log"}),
                        continueFlag: intl.formatMessage({id: "lbl.Continue-marking"}),
                        mailAddress: intl.formatMessage({id: "lbl.Email"}),
                        mobilePhoneNumber: intl.formatMessage({id: "lbl.Mobile-phone"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.Revision-personnel"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.Revision-time"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.errQuery.spRunLogType'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.errQuery.spRunLogType'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.errQuery.spRunLogType'})+ '.xlsx'; // 下载后文件名
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
                        {/* 消息编码 */}
						<InputText span={6} name='messageCode' label={<FormattedMessage id='lbl.Message-code'/>} /> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-ERR-QUERY-003-B01'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                    {/* 删除 */}
                    <CosButton  onClick={deleteBtn} auth='AFCM-ERR-QUERY-003-B02'><DeleteOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
					{/* 下载 */}
                    <Button  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className="button-right">
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    <Button onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className="footer-table">
                <div style={{width: '80%'}}>
                    <PaginationTable
                        dataSource={tableData}
                        columns={columns}
                        rowKey='messageCode'
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
                {/* <Modal title={txt} visible={isModalVisible} footer={null} width="50%" height="50%" onCancel={() => handleCancel()} maskClosable={false}> */}
                <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
                <CosToast toast={infoTips}/>  
                    <div className='modalContent' style={{minWidth: '300px'}}>
                            <Form form={queryForm} name='add' onFinish={handleSave}>
                                <Row>
                                    {/* 消息编码 */}
                                    <InputText span={12} name={['popData','messageCode']} disabled={commonFlag} label={<FormattedMessage id='lbl.Message-code'/>} styleFlag={backFlag} isSpan={true}/> 
                                    {/* 描述 */}
                                    <InputText span={12} name={['popData','messageCodeDescription']} disabled={commonFlag} label={<FormattedMessage id='lbl.Desc'/>} isSpan={true} capitalized={false}/> 
                                    {/* 需要Log */}
                                    <Selects span={12} name={['popData','needLog']} options={needLog.values} disabled={commonFlag} label={<FormattedMessage id= 'lbl.Need-log'/>} isSpan={true} flag={true}/> 
                                    {/* 继续标记 */}
                                    <Selects span={12} name={['popData','continueFlag']} options={continueFlag.values} disabled={commonFlag} label={<FormattedMessage id='lbl.Continue-marking'/>} isSpan={true} flag={true}/> 
                                    {/* E-mail */}
                                    <InputText span={12} name={['popData','mailAddress']} disabled={commonFlag} label={<FormattedMessage id='lbl.Email'/>} isSpan={true} capitalized={false}/> 
                                    {/* 移动电话 */}
                                    <InputText span={12} name={['popData','mobilePhoneNumber']} disabled={commonFlag} label={<FormattedMessage id='lbl.Mobile-phone'/>} isSpan={true}/> 
                                </Row>
                            </Form>
                            <div className='main-button'>
                                <div className='button-left'></div>
                                <div className='button-right'>
                                    {/* 保存 */}
                                    <CosButton onClick={() => handleSave()} disabled={buttonFlag?true:false} auth='AFCM-ERR-QUERY-003-B03'><FormattedMessage id='lbl.save' /></CosButton>
                                    {/* 取消 */}
                                    <Button onClick={() => handleCancel()}><FormattedMessage id='lbl.cancel' /></Button>
                            </div>
                        </div>
                    </div>  
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default spRunLogType;