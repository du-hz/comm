{/*代理利润中心*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage} from 'umi'
import InputText from '@/components/Common/InputText';
import {  costCategories } from '@/utils/commonDataInterface';
import Selects from '@/components/Common/Select';
import { Button, Form, Row, Tooltip,Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'

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

const actProfitCenter =()=> {
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeType,setFeeType] = useState ([]) //费用小类
    const [tradeLane,setTradeLane] = useState ([]) //Trade lane - 贸易通道
    const [course,setCourse] = useState ([]) //航向
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    const [tableData, setTableData] = useState([]);     // 编辑查看详情数据
    const [tabTotal,setTabTotal] = useState([]);//表格的数据
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
	const [lastCondition, setLastCondition] = useState({
        "proxyCode": null,
        "feeClass": null,
        "feeType": null,
        "route": null,
        "tradeLane": null,
        "course": null,
        "packetBroker": null,
        "profitCenter": null,
    });
    {/*初始化*/}
	useEffect(()=>{
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大小类联动
        // acquireSelectData('AFCM_TRADE_LANE',setTradeLane, $apiUrl);// Trade lane
        // acquireSelectData('AFCM_COURSE',setCourse, $apiUrl);// 航向
    },[])
    {/* 新增父组件传过去的参数 */}
    const initData = {
        isModalVisible,
        setIsModalVisible
    }
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
        page.current=1;
        setTableData([])
    }
    {/* 表格的下拉框onchange事件 */}
    const getCommonSelectVal = (e,record,name) =>{
        record[name]=e
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
                }else{
                    
                }  
            }
        })   
    }
    {/* 列表 */}
    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align:'center',
            fixed: false,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <a onClick={()=>deleteTable(record)} disabled={record.show?false:true}><CloseCircleOutlined style={{color:record.show?'red':'#ccc'}} /> </a>&nbsp;
                    {/* 编辑 */}
                    {/* <a onClick={()=>addEdit(record,index,false)} style={{ cursor:'pointer'}}><FormOutlined /></a>&nbsp; */}
                    {/* 查看明细 */}
                    {/* <a onClick={()=>addEdit(record,index,true)}><FileSearchOutlined /></a>&nbsp; */}
                    {/* 日志 */}
                    {/* <a><ReadOutlined /></a> */}
                    {/* <Tooltip title={<FormattedMessage id='btn.log' />}><a onClick={() => journal(record) }><SearchOutlined /></a></Tooltip> */}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.agency' />,//代理编码
            dataIndex: 'proxyCode',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee' />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left', 
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                    { record.saveShowHide? <Select defaultValue={record.feeClass} onChange={(e)=>getCommonSelectVal(e,record,'feeClass')} options={feeClass}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Small-class-fee' />,//费用小类
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left', 
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Select defaultValue={record.feeType} onChange={(e)=>getCommonSelectVal(e,record,'feeType')} options={feeType}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.trade-channel' />,//Trade lane
            dataIndex: 'tradeLane',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.packet-account-agent' />,//数据包记账代理
            dataIndex: 'packetBroker',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.profit-center' />,//利润中心
            dataIndex: 'profitCenter',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.route' />,//航线
            dataIndex: 'route',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.course' />,//航向
            dataIndex: 'course',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-date' />,//更新日期
            dataIndex: 'updateTime',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-people' />,//更新人员
            dataIndex: 'coursePeople',
            sorter: false,
            width: 120,
            align:'left', 
        },
    ]
    {/*多选*/}
	const setSelectedRows = (val) =>{
        setLastConditions(queryForm.getFieldValue())
    }
    {/*查询表格数据*/}
    const pageChange = async (pagination) =>{

    }
    {/* 新建 */}
    const addBtn = () => {
        setIsModalVisible(true);  //弹窗控制
    }
    {/*删除*/}
    const deleteTable = async(record,flag) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: '删除',
            content: '是否确认删除',
            okText: '确定',
            okType: 'danger',
            closable:true,
            cancelText:'',
            onOk() {
                confirmModal.destroy()
            }
        })
    }
     {/* 取消 */}
     const handleCancel = () => {
        setIsModalVisible(false)
    }
    {/* 保存 */}
    const handleSave = () => {
        
    }
    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form onFinish={handleQuery} form={queryForm} name='search'>
                    <Row>
                        {/* 代理编码 */}
						<InputText span={6} name='proxyCode' label={<FormattedMessage id='lbl.agency'/>} /> 
                        {/* 费用大类 */}
                        <Selects span={6} name='feeClass' selectChange={getCommonSelectVal} options={feeClass} label={<FormattedMessage id='lbl.Big-class-fee'/>} /> 
                        {/* 费用小类 */}
                        <Selects span={6} name='feeType' label={<FormattedMessage options={feeType} id='lbl.Small-class-fee'/>} /> 
                        {/* 航线 */}
						<InputText span={6} name='route' label={<FormattedMessage id='lbl.route'/>} /> 
                        {/* Trade lane */}
                        <Selects span={6} name='tradeLane' label={<FormattedMessage id='lbl.trade-channel'/>} /> 
                        {/* 航向 */}
                        <Selects span={6} name='course' label={<FormattedMessage id='lbl.course'/>} /> 
                        {/* 数据包记账代理 */}
                        <InputText span={6} name='packetBroker' label={<FormattedMessage id='lbl.packet-account-agent'/>} /> 
                        {/* 利润中心 */}
                        <InputText span={6} name='profitCenter' label={<FormattedMessage id='lbl.profit-center'/>} /> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <Button onClick={addBtn} ><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></Button>
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
                    rowKey='actProfitUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    setSelectedRows={setSelectedRows}
                />
            </div>
            <Modal title="新增" visible={isModalVisible} footer={null} width={1000} height="50%" onCancel={() => handleCancel()} maskClosable={false}>
                <div className='add'>
                    <div className='add-header-from-searchGroup'>
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* 代理编码 */}
                                <InputText span={6} name='proxyCode' label={<FormattedMessage id='lbl.agency'/>} /> 
                                {/* 费用大类 */}
                                <Selects span={6} name='feeClass' selectChange={getCommonSelectVal} options={feeClass} label={<FormattedMessage id='lbl.Big-class-fee'/>} disabled/> 
                                {/* 费用小类 */}
                                <Selects span={6} name='feeType' label={<FormattedMessage options={feeType} id='lbl.Small-class-fee'/>} disabled/> 
                                {/* 航线 */}
                                <InputText span={6} name='route' label={<FormattedMessage id='lbl.route'/>} /> 
                                {/* Trade lane */}
                                <Selects span={6} name='tradeLane' label={<FormattedMessage id='lbl.trade-channel'/>} /> 
                                {/* 航向 */}
                                <Selects span={6} name='course' label={<FormattedMessage id='lbl.course'/>} /> 
                                {/* 数据包记账代理 */}
                                <InputText span={6} name='packetBroker' label={<FormattedMessage id='lbl.packet-account-agent'/>} /> 
                                {/* 利润中心 */}
                                <InputText span={6} name='profitCenter' label={<FormattedMessage id='lbl.profit-center'/>} /> 
                            </Row>
                        </Form>
                    </div>
                    <div className='add-save-button'> 
                        {/* 保存 */}
                        <Button onClick={() => handleSave()}><SaveOutlined/><FormattedMessage id='lbl.save' /></Button>
                    </div>
                </div>  
            </Modal>
        </div>
    )
}

export default actProfitCenter;