import React, { useState,useEffect, $apiUrl,createContext ,useContext } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import SelectVal from '@/components/Common/Select';
import { acquireSelectData,momentFormat, acquireSelectDataExtend} from '@/utils/commonDataInterface';
import {Form,Button,Row,Tooltip,Modal} from 'antd'
import { Toast } from '@/utils/Toast'
import SentServantsConfigurationAgmtEdit from './sentServantsConfigurationAgmtEdit'
import request from '@/utils/request';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import PenaltyLog from './penaltyLog'

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    SearchOutlined,//日志
    FileAddOutlined,//新增
    ReloadOutlined,
    ReadOutlined,
} from '@ant-design/icons'
export const NumContext = createContext();

const confirm = Modal.confirm

// =========================================================罚佣配置===========================================
const searchPreAgreementMailFeeAgmtList =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [remove, setRemove] = useState({});   // 删除
    const [company,setCompany] = useState([])//口岸公司
    const [commissionState,setCommissionState] = useState({})//罚佣状态
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [copyData,setCopyData] = useState([])//编辑数据
    const [taxMode,setTaxMode] = useState({})//含税模式
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
    });
   
    const [tableData,setTableData] = useState([])//表格数据
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    const [isModalVisibleLog,setIsModalVisibleLog] = useState(false)//控制日志弹框开关
    const [dataLog,setDataLog] = useState([])//控制日志弹框开关
    const [spinflag,setSpinflag] = useState(false)
    const [stateFlag,setStateFlag] = useState(true)//控制弹框删除状态是否显示
    const [messageData,setMessageData] = useState({})//提示弹框
    const [saveFlag,setSaveFlag] = useState(false)
    
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
    useEffect(() => {
        acquireSelectData('AFCM.CARRIER_COMPANY_PAIRS',setAcquireData,$apiUrl)//承运人
        acquireSelectData('AFCM.DELETEFLAG',setRemove,$apiUrl)//删除
        acquireSelectData('AGMT.VAT.FLAG',setTaxMode,$apiUrl)//含税模式
        selectChangeBtn()
    }, [])
    useEffect(()=>{
        saveFlag?pageChange(page,'','search',mes):''
    },[saveFlag])
    //口岸
    const  selectChangeBtn = async() =>{
        console.log(queryForm.getFieldValue().carrier)
       let port =  await request($apiUrl.PUNIHRSULT_GETCONFIGRENDERCOMPANYLIST,{
            method:'POST',
            data:queryForm.getFieldValue().carrier?queryForm.getFieldValue().carrier:' '
        })
       if(port.success){
        let data = port.data
        data.map((val, idx)=> {
            val['value'] = val.companyCode 
            val['label'] = val.companyCode + ' ' + val.companyName;
        })
        setCompany(data)
       }
    }

    // 新增编辑传过去的参数
    const addData = {
        isModalVisible,
        setIsModalVisible,
        copyData,
        acquireData,
        taxMode,
        remove,
        messageData,
        setMessageData,
        setSaveFlag
    }
    const add=()=>{
        Toast('', '', '', 5000, false);
        setMessageData({})
        setIsModalVisible(true)
        console.log(isModalVisible)
    }

    //编辑
    const commonBtn = async(record)=>{
        Toast('', '', '', 5000, false);
        console.log(record)
        setIsModalVisible(true)
        setSpinflag(true)
        let copy = await request($apiUrl.PUNIHRSULT_SEARCHONE,{
            method:"POST",
            data:{
                "uuid":record.punihConfigUuid
            }
        })
        console.log(copy)
        if(copy.success) {
            setSpinflag(false)
            let data = copy.data
            setCopyData(data)
            copy.message?setMessageData({alertStatus:'alert-success',message:copy.message}):null
        }else{
            setSpinflag(false)
            copy.errorMessage?setMessageData({alertStatus:'alert-error',message:copy.errorMessage}):null
        }
    }

    //删除
    const deleteTableData = async(record,flag) => {
        console.log(record)
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: formatMessage({id:'lbl.delete'}),
            content: formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true)
                let cancel = await request($apiUrl.PUNIHRSULT_DELETEBYID,{
                    method:"POST",
                    data:{
                        "uuid":record.punihConfigUuid
                    }
                })
                if(cancel.success) {
                    setSpinflag(false)
                    pageChange(page);
                    Toast('', cancel.message, '', 5000, false);  
                }else{
                    setSpinflag(false)
                    Toast('', cancel.errorMessage, 'alert-error', 5000, false);  
                }
            }
        }) 
    }

    //日志
    const logData = {
        isModalVisibleLog,
        setIsModalVisibleLog,
        dataLog,
        messageData,
        setMessageData
    }

    //日志
    const log = async(record)=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let log =  await request($apiUrl.PUNIHRCONFIG_GETPUNISHOPERATIONLOG,{
            method:'POST',
            data:{
                uuid:record.punihConfigUuid
            }
        })
        console.log(log)
        if(log.success){
            setSpinflag(false)
            setIsModalVisibleLog(true)
            if(log.data){
                let data = log.data.resultList
                data.id = data.length
                setDataLog([...data])
            }
            log.message?setMessageData({alertStatus:'alert-success',message:log.message}):null
        }else{
            setSpinflag(false)
            log.errorMessage?setMessageData({alertStatus:'alert-error',message:log.errorMessage}):null
        }
    }

    //罚佣配置表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align:'left',
            fixed: true,
            render:(text,record, index) => {
                return <div>
                    {/* 删除  disabled={record.show?false:true} style={{color:record.show?'red':'#ccc'}} */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => {deleteTableData(record)}} disabled={record.deleteIndicator=='N' ? false : true}><CloseCircleOutlined/></a>&nbsp;  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => {commonBtn(record)}}  ><FormOutlined/></a>&nbsp;  {/* 修改 */}
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.log" />,//日志
            dataIndex: 'operate',
            align:'left',
            width: 60,
            fixed: true,
            render:(text,record, index) => {
                return <div>
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => { log(record)}} ><ReadOutlined/></a>&nbsp; 
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title:<FormattedMessage id="lbl.haulier" />,//承运人
            dataType:acquireData.values,
            dataIndex: 'carrier',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title:<FormattedMessage id="lbl.Prepay-days-overdue" />,//预付超期天数
            dataIndex: 'daysPrepare',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.number-days-overdue-arrival" />,//到付超期天数
            dataIndex: 'daysCollect',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.Penalty-proportion-of-commission" />,//罚佣比例
            dataIndex: 'punihRate',
            sorter: false,
            align:'left',
            width:100,
            
        },
        {
            title: <FormattedMessage id="lbl.second-level-prepays-overdue-days" />,//第二级预付超期天数
            dataIndex: 'daysPrepareLevel2',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.The-second-level-of-the-overdue-days" />,//第二级到付超期天数
            dataIndex: 'daysCollectLevel2',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.The-second-level-penalty-ratio" />,//第二级佣罚比例
            dataIndex: 'punihRateLevel2',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.effective-date" />,//生效日期
            dataIndex: 'fromDate',
            dataType: 'dateTime',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.expiration-date" />,//失效日期
            dataIndex: 'toDate',
            dataType: 'dateTime',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.The-port-company" /> ,//口岸公司
            dataIndex: 'renderCompanyCode',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.company-abbreviation" /> ,//公司简称
            dataIndex: 'companyNameAbbr',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.delete" /> ,//删除
            dataType:remove.values,
            dataIndex: 'deleteIndicator',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.Tax-mode" /> ,//含税模式
            dataType:taxMode.values,
            dataIndex: 'agrmntFlag',
            sorter: false,
            width: 120,
            align:'left', 
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
        Toast('', '', '', 5000, false);
        search?pagination.current=1:null
        let query = queryForm.getFieldsValue()
        console.log(query.renderCompanyCode)
        setSpinflag(true)
        let localsearch= await request($apiUrl.PUNIHRCONFIG_SEARCHLIST,{
            method:"POST",
            data:{
                    "page": pagination,
                    "params": {
                    'carrier':query.carrier,
                    'deleteIndicator':query.deleteIndicator,
                    'renderCompanyCode':query.renderCompanyCode,
                },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            let data=localsearch.data 
            let datas=localsearch.data.resultList
            setSpinflag(false)
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            setPage({...pagination})
            setTableData([...datas])
            setTabTotal(data.totalCount)
        }else{
            setSpinflag(false)
            setTableData([])
            Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
        }
    }
    

    //重置
    const reset = () =>{
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setTableData([])
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
                        {/* 承运人 */}
                        <SelectVal name='carrier' flag={true} label={<FormattedMessage id='lbl.haulier'/>} span={6} options={acquireData.values} selectChange={selectChangeBtn } />
                        {/* 状态*/}
                        <SelectVal name='deleteIndicator' flag={true} label={<FormattedMessage id='lbl.state'/>} span={6} options={remove.values}/>
                        {/* 口岸公司*/}
                        <SelectVal name='renderCompanyCode'  showSearch={true}  flag={true} label={<FormattedMessage id='lbl.The-port-company'/>} span={6} options={company}/>
                    </Row>
                </Form> 
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/> </Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新建 */}
                    <CosButton onClick={add}  auth='AFCM-PUNISH-001-B01'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=>{pageChange(page,'','search')}} > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='punihConfigUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    rowSelection={null}
                />
            </div>
            <SentServantsConfigurationAgmtEdit addData={addData} />
            <Loading spinning={spinflag}/>
            <PenaltyLog logData={logData} />
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;