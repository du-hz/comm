import React, { useState,useEffect, $apiUrl,createContext ,useContext } from 'react'
import {FormattedMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import SelectVal from '@/components/Common/Select';
import { acquireSelectData,momentFormat } from '@/utils/commonDataInterface';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tooltip,Modal} from 'antd'
import { Toast } from '@/utils/Toast'
import AgreementMailAgmtEdit from "./agmt/vatAllocationAgmtEdit"

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    SearchOutlined,//日志
    FileAddOutlined,//新增
    CopyOutlined,//复制
    FileDoneOutlined,//查看详情
    CloudDownloadOutlined,//日志
    ZoomInOutlined,//查询
    ReloadOutlined,
    CalendarTwoTone,//重置
    CaretUpOutlined,//正序
    CaretDownOutlined,//倒序
} from '@ant-design/icons'
export const NumContext = createContext();

const confirm = Modal.confirm

const searchPreAgreementMailFeeAgmtList =()=> {
    const [acquireData, setAcquireData] = useState([]); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    const [checkStatus,setCheckStatus] = useState([]);//审核状态
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
    });
   
    const [tableData,setTableData] = useState([])//表格数据
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    const [store,setStore] = useState('')
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    // 新增传过去的参数
    const addData = {
        isModalVisible,
        setIsModalVisible,
    }
    const add=()=>{
        setIsModalVisible(true)
    }

    //删除
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

    //协议邮件接收配置表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: '90px',
            align:'center',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip  title={<FormattedMessage id='btn.delete' />}><a  disabled={record.show?false:true} onClick={()=>deleteTable(record,index)}><CloseCircleOutlined style={{color:record.show?'red':'#ccc'}} /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={()=>addcopy(record,index,true)}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a onClick={()=>addcopy(record,index,false)}><FileSearchOutlined /></a></Tooltip>&nbsp;&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}><a onClick={() => journal(record) }><SearchOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司代码
            dataIndex: 'commissionAgreementCode',
            key:'COMM_AGMT_CDE',
            sorter: true,
            // sortDirections:[store],
            align:'center',
            width: '120px',
        },
        {
            title:<FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'companyCode',
            key:'COMPANY_CDE',
            sorter: true,
            align:'center',
            width: '100px',
            
        },
        {
            title:<FormattedMessage id="lbl.office" />,//OFFICE
            dataIndex: 'commpanyNameAbbr',
            sorter: true,
            key:'COMPANY_NME_ABBR',
            width: '120px',
            align:'center',
            
        },
        {
            title: <FormattedMessage id="lbl.Tax-types" />,//税率类型
            dataIndex: 'agencyCode',
            sorter: true,
            key:'AGENCY_CDE',
            width: '120px',
            align:'center',
            
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataIndex: 'agreementStatus',
            sorter: true,
            key:'AGMT_STATUS',
            width: '80px',
            align:'center', 
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataIndex: 'fromDate',
            sorter: true,
            key:'FM_DTE',
            width: '120px',
            align:'center', 
        },
        {
            title:<FormattedMessage id="lbl.value-added-tax-rate" /> ,//增值税税率
            dataIndex: 'toDate',
            sorter: true,
            key:'TO_DTE',
            width: '120px',
            align:'center', 
        },
        {
            title:<FormattedMessage id="lbl.servicing-time" /> ,//维护时间
            dataIndex: 'toDate',
            sorter: true,
            key:'TO_DTE',
            width: '120px',
            align:'center', 
        },
        {
            title:<FormattedMessage id="lbl.maintenance-man" /> ,//维护人
            dataIndex: 'toDate',
            sorter: true,
            key:'TO_DTE',
            width: '120px',
            align:'center', 
        }
    ]

    //初始化下拉框数据
    useEffect(()=>{
        queryForm.setFieldsValue({
            ...lastCondition,
        });
        
    },[])
    
    //表格数据
    const pageChange= async(pagination,options,search) =>{
       
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
                        <Select name='companyCode' flag={true} label={<FormattedMessage id='lbl.company'/>}  span={6}  />
                        {/* 代理编码 */}
                        <InputText name='agencyName' label={<FormattedMessage id='lbl.agency'/>} span={6}/> 
                        {/* OFFICE */}
                        <InputText name='' label={<FormattedMessage id='lbl.office'/>} span={6}/> 
                        {/* 税率类型 */}
                        <Select name='' flag={true} label={<FormattedMessage id='lbl.Tax-types'/>}  span={6}  />
                    </Row>
                </Form> 
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增 */}
                    <Button onClick={add} ><FileAddOutlined /><FormattedMessage id='lbl.add'/></Button>
                    {/* 复制 */}
                    <Button  ><CopyOutlined /><FormattedMessage id='lbl.copy'/></Button>
                    {/* 提交审核 */}
                    <Button><FileDoneOutlined /> <FormattedMessage id='lbl.submit-audit'/></Button>
                    {/* 下载 */}
                    <Button  ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                
                <div className='button-right'>
                    {/* 重置 */}
                    <Button ><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                     <Button  > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='lcrAgreementHeadUuid'
                    pageChange={pageChange}
                    // pageSize={page.pageSize}
                    // current={page.current}
                    scrollHeightMinus={200}
                    // total={tabTotal}
                    // selectionType='radio'
                    // setSelectedRows={setSelectedRows}
                />
            </div>
            <AgreementMailAgmtEdit addData={addData}/>
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;