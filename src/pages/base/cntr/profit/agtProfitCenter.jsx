{/*代理利润中心*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import Selects from '@/components/Common/Select';
import { Button, Form, Row, Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import LogPopUp from '../../../commissions/agmt/LogPopUp'

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

const index =()=> {
    const [commissionType, setCommissionType] = useState([]); // 佣金类型
    const [tableData,setTableData] = useState([])//表格数据
    const [tabTotal,setTabTotal] = useState([]);  //table条数
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [writeRead,setWriteRead] = useState(false);//区别新增编辑查看详情
    const [flag, setFlag] = useState(false);   //查看详情禁用
    const [buttonFlag,setButtonFlag] = useState(true)//新增、编辑、查看详情的弹框按钮是否禁用
    const [editShowHide,setEditShowHide]= useState(false);//编辑数据的执行条件
    const [txt, setTxt] = useState(''); //弹窗标题
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [headerUuid, setHeaderUuid] = useState('');
    const [lastCondition, setLastCondition] = useState({
        "proxyCode": null, 
        "commissionType": null,
        "cargoTradeCode": null,
    });
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    {/*初始化*/}
	useEffect(()=>{
        // acquireSelectData('AFCM_COMMISSION_TYPE',setCommissionType, $apiUrl);// 佣金类型
        queryForm.setFieldsValue({
            ...lastCondition,
        });
    },[])
    
    {/*表格文本*/}
	const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作 
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align:'center',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <a onClick={()=>deleteTable(record)} disabled={record.show?false:true}><CloseCircleOutlined style={{color:record.show?'red':'#ccc'}} /> </a>&nbsp;
                    {/* 编辑 */}
                    <a onClick={()=>addEdit(record,index,false)} style={{ cursor:'pointer'}}><FormOutlined /></a>&nbsp;
                    {/* 查看明细 */}
                    <a onClick={()=>addEdit(record,index,true)}><FileSearchOutlined /></a>&nbsp;
                    {/* 日志 */}
                    {/* <a><ReadOutlined /></a> */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}><a onClick={() => journal(record) }><SearchOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'proxyCode',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataIndex: 'commissionType',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.cargo-trade-code" />,//Cargo trade lane code
            dataIndex: 'cargoTradeCode',
            sorter: false,
            width: 160,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.packet-broker" />,//数据包对应的代理
            dataIndex: 'packetBroker',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.profit-center" />,//利润中心
            dataIndex: 'profitCenter',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.employment-date" />,//录用日期
            dataIndex: 'employmentDate',
            sorter: false,
            width: 120,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.employment-person" />,//录用人
            dataIndex: 'employmentMan',
            sorter: false,
            width: 120,
            align:'left', 
        },
    ]
    {/* 新建 */}
    const addBtn = async() => {
        setTxt("新增"); 
        setWriteRead(true);  //区别新增编辑查看详情 
        setCommonFlag(false);  //控制读写
        setFlag(false);
        setIsModalVisible(true);
        setButtonFlag(false);
    }
    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        page.current=1;
        setTableData([]);
    }
    {/*查询表格数据*/}
    const pageChange = async (pagination) =>{
        Toast('', '', '', 5000, false);
        // console.log(pagination)
        // console.log(queryForm.getFieldValue())
        // let localsearch= await request($apiUrl.AGENT_PROFIT_CENTER_SEARCH_LIST,{
        //     method:'POST',
        //     data:{
        //         "page":pagination,
        //         "params": queryForm.getFieldValue(),
        //     }
        // })
        // console.log(localsearch)
        // let data=localsearch.data
        // if(data){
        //     let datas=localsearch.data.resultList
        //     setPage({...pagination})
        //     setTableData([...datas])
        //     setTabTotal(data.totalCount)
        // }
    }
    {/*多选*/}
	const setSelectedRows = (val) =>{
        
    }
    {/*删除*/}
    const deleteTable = (record) => {        
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: '删除',
            content: '是否删除所选内容',
            okText: '确定',
            okType: 'danger',
            closable:true,
            cancelText:'',
            onOk() {
                confirmModal.destroy()
                // console.log(record.agentProfitCenterUuid)
                // const deleteData = request($apiUrl.AGENT_PROFIT_CENTER_DELETE_TABLE,{
                //    method:'POST',
                //    data:{
                //        "uuid":record.agentProfitCenterUuid
                //    } 
                // })
                // if(deleteData.success) {
                //     pageChange(page);
                // } else {
                //     Toast('', '', '', 5000, false);
                // }
            }
        })
        console.log(record)
    }
    {/* 编辑/查看明细 */}
    const addEdit = async(record, index, flag) => {
        // 查看详情为true，编辑为false
        // const result = await request($apiUrl.AGENT_PROFIT_CENTER_PRE_HEAD_DETAIL,       
        //     {
        //         method:'POST',
        //         data: {
        //             uuid:record.agentProfitCenterUuid
        //         }
        //     }
        // )
        // console.log(result.data);
        // if(result.success) {
        //     setCommonFlag(flag);
        //     setWriteRead(false);
        //     setButtonFlag(flag);
        //     let data = result.data;
        //     setHeaderUuid(data.agentProfitCenterUuid);
        //     data.proxyCode = data.proxyCode + '';  
        //     data.cargoTradeCode = data.cargoTradeCode + '';
        //     if(flag) {
        //         setTxt("查看详情");
        //         setFlag(true);
                
        //     } else {
        //         setTxt("编辑");
        //         setFlag(false)
        //     }
        //     setTableData(data);
        //     setIsModalVisible(true);
        // } else {
        //     Toast('', '', '', 5000, false);
        // }
    }
    {/* 日志 */}
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
		setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }
    {/* 日志 */}
    const journal = async(record) => {
        setIsModalVisibleLog(true);
        // const result = await request($apiUrl.AGENT_PROFIT_CENTER_LOG_SEARCH_PRE_LIST,       
        //     {
        //         method:'POST',
        //         data: {
        //             params: {
        //                 referenceType: "AGENC_PROFIT",
        //                 referenceUuid: record.agentProfitCenterUuid
        //             }
                    
        //         }
        //     }
        // )
        // console.log(result.data);
        // if(result.success) {
        //     setJournalData(result.data)
        // }
    }
    {/* 保存 */}
    const handleSave = async() => {
        console.log(queryForm.getFieldValue())
        const save = await request($apiUrl.COMM_MODULE_BOX_BUCKLE_SAVE_SUBMIT,{
            method:"POST",
            data:{
                "params": {
                    ...queryForm.getFieldValue()
                }
            }
        })
        console.log(save)
        if(save.success) {
            Toast('', save.message, 'alert-success', 5000, false)
            console.log(queryForm.getFieldValue())
            queryForm.resetFields();
            setIsModalVisible(false)
        }
    }
    {/* 取消 */}
    const handleCancel = () => {
        setIsModalVisible(false)
    }
    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form onFinish={handleQuery} form={queryForm} name='search'>
                    <Row>
                        {/* 代理编码 */}
						<InputText span={6} name='proxyCode' label={<FormattedMessage id='lbl.agency'/>} /> 
                        {/* 佣金类型 */}
                        <Selects span={6} name='commissionType' label={<FormattedMessage id='lbl.Commission-type' options={commissionType} />} disabled/>
                        {/* Cargo trade lane code */}
                        <InputText span={8} name='cargoTradeCode' label={<FormattedMessage id='lbl.cargo-trade-code'/>} /> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <Button onClick={addBtn} onChange={()=>setEditShowHide(true)} ><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></Button>
					{/* 下载 */}
                    <Button  ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className="button-right">
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    <Button onClick={() => pageChange(page)}><SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className="footer-table">
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='agentProfitCenterUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    setSelectedRows={setSelectedRows}
                />
            </div>
            {/* 保存 */}
            <Modal title={txt} visible={isModalVisible} footer={null} width={1000} height="50%" onCancel={() => handleCancel()} maskClosable={false}>
                <div className='add'>
                    <div className='add-header-from-searchGroup'>
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 代理编码 */}
                                <InputText disabled={commonFlag} span={8} name='proxyCode' label={<FormattedMessage id='lbl.agency'/>} /> 
                                {/* 佣金类型 */}
                                <Selects disabled={commonFlag} span={8} name='commissionType' label={<FormattedMessage id='lbl.Commission-type' options={commissionType} />} disabled/>
                                {/* Cargo trade lane code */}
                                <InputText disabled={commonFlag} span={8} name='cargoTradeCode' label={<FormattedMessage id='lbl.cargo-trade-code'/>} />  
                                {/* 数据包对应的代理 */}
                                <InputText disabled={commonFlag} span={8} name='packetBroker' label={<FormattedMessage id='lbl.packet-broker'/>} /> 
                                {/* 利润中心 */}
                                <InputText disabled={commonFlag} span={8} name='profitCenter' label={<FormattedMessage id='lbl.profit-center'/>} /> 
                            </Row>
                        </Form>
                    </div>
                    <div className='add-save-button'> 
                        {/* 保存 */}
                        <Button disabled={buttonFlag?true:false} onClick={() => handleSave()}><SaveOutlined/><FormattedMessage id='lbl.save' /></Button>
                    </div>
                </div>  
            </Modal>
            <LogPopUp logData={logData}/>
        </div>
    )
}

export default index;