import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, portCompany, momentFormat, setCarrierDefault, commissionMonth, StatePenalty, acquireSelectDatas,allCompany} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import {Form, Button, Row, Col } from 'antd'
import {Toast} from '@/utils/Toast'
import SelectVal from '@/components/Common/Select';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import PenaltyLog from './commissionAllocation/penaltyLog'
import {
    SearchOutlined,//查询
    ReadOutlined,//日志
    CheckOutlined,//下载
} from '@ant-design/icons'
import { createFromIconfontCN } from '@ant-design/icons';

const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2485864_uveiapdij29.js', // 在 iconfont.cn 上生成
});

//----------------------------------------------罚佣确认------------------------------------------------------
const LocalChargeComputationProtocol =()=> {
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [acquireData, setAcquireData] = useState({}); // 承运人
    const [companyPort,setCompanyPort] = useState([])//口岸公司
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [month,setMonth] = useState([])//月份
    const [money,setMoney] = useState([])//金额
    const [commissionState,setCommissionState] = useState([])//罚佣状态
    const [affirmData,setAffirmData] = useState([])//确认参数
    const [renderStatus,setRenderStatus] = useState({})//是否可确认
    const [spinflag,setSpinflag] = useState(false)
    const [carrierDefaultData,setCarrierDefaultData] = useState('')
    const [isModalVisibleLog,setIsModalVisibleLog] = useState(false)//控制日志弹框开关
    const [dataLog,setDataLog] = useState([])//控制日志弹框开关
    const [buttonFlag,setButtonFlag] = useState(false)//按钮
    const [shipmentData,setShipmentData] = useState({}) //进出口
    const [messageData,setMessageData] = useState({})//提示弹框
    const [checked, setChecked] = useState([]); //勾选项
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "shipperOwner": null,
        "agencyName": null,
        "agreementCode": null,
        "agreementStatus": null,
        "companyCode":null,
        "queryType": "PRE_AGMT",
        "soCompanyCode": null,
        "soCompanyCodeReadOnly": true
    });
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    useEffect(()=>{
        acquireSelectData('AFCM.CARRIER_COMPANY_PAIRS',setAcquireData,$apiUrl)//承运人
        commissionMonth($apiUrl,'PUNIHRSULT_GETCALMONTHELIST',setMonth)//月份
        acquireSelectData('COMM0001',setRenderStatus,$apiUrl);//是否可确认  
        StatePenalty($apiUrl,'PUNIHRSULT_GETSTATELIST',setCommissionState);//状态
        setCarrierDefault($apiUrl,setCarrierDefaultData)
        acquireSelectDatas('AFCM.PUNISH.SHMTBOUND',setShipmentData,$apiUrl)//进出口
        
        allCompany(setCompanysData,$apiUrl,false)//公司
        // companys()
    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            'carrier': carrierDefaultData,
            'status':commissionState.length>0?commissionState[0].value:null,
            // 'renderStatus':renderStatus.values?renderStatus.values[0].value:null
        })
        console.log(carrierDefaultData)
        portCompany($apiUrl,'PUNIHRSULT_GETCONFIGRENDERCOMPANYLIST',setCompanyPort,carrierDefaultData)//口岸公司
    }, [commissionState , carrierDefaultData,renderStatus])
    useEffect(()=>{
        affirmData.length>0?setButtonFlag(false):setButtonFlag(true)
    },[affirmData])
      //公司
    //   const companys = async() =>{
    //     await request.post($apiUrl.COMMON_COMPANY_SELF_SUB)
    //     .then((resul) => {
    //         if(!resul.data)return
    //         console.log(resul)
    //         var data = resul.data;
    //         data.map((val, idx)=> {
    //             val['value'] = val.companyCode ;
    //             val['label'] = val.companyCode + '-' + val.companyNameCn;

    //         })
    //         setCompanysData(data);
    //     })
        
    // }
    
    //罚佣确认表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.haulier" />,//承运人
            dataType:acquireData.values,
            dataIndex: 'carrier',
            key:'COMM_AGMT_CDE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.The-port-company" />,//口岸公司
            dataType:companyPort,
            dataIndex: 'renderCompanyCode',
            key:'COMPANY_CDE',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.Branch-company" />,//网点公司
            dataType:companysData,
            dataIndex: 'companyCode',
            key:'AGENCY_CDE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.bound" />,//进出口
            dataType:shipmentData.values,
            dataIndex: 'shipmentBound',
            key:'FM_DTE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'punihCurrencyCode',
            key:'TO_DTE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Total-overdue-amount" />,//超期总金额
            dataIndex:'overTotalAmount',
            key:'CGO_TRADE_LANE_CDE',
            sorter: false,
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Total-penalty-amount" />,//罚佣总金额
            dataIndex: 'punihTotalAmount',
            key:'CHRG_CDE',
            sorter: false,
            align:'right',
            width: 120,
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        setChecked([])
        let queryData = queryForm.getFieldValue();
        search?pagination.current=1:null
        const localsearch=await request($apiUrl.PUNIHRSULT_AEARCHPUNIHCONFIRM,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    ...queryData
                }
            }
        })
        if(localsearch.success){
            console.log(localsearch)
            let data=localsearch.data
            let datas=localsearch.data.resultList
            datas.map((v,i)=>{
                v['id'] = i
            })
            setSpinflag(false)
            setTabTotal(data.totalCount)
            setTableData([...datas])
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            setPage({...pagination})
        }else{
            setSpinflag(false)
            setTableData([])
            Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
        }
        const money=await request($apiUrl.PUNIHRSULT_GETPUNIHCOMMONTOTALAMOUTS,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    ...queryData,
                }
            }
        })
        console.log(money)
        if(money.success){
            let data=money.data
            setMoney([...data])
        }else{
            setMoney([])
        }
    }

    const setSelectedRows = (params) =>{
        console.log(params)
        setAffirmData([...params])
        setButtonFlag(true)
    }

    //确认
    const affirm = async() =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let queryData = queryForm.getFieldValue();
        let arr = affirmData
        console.log(affirmData)
        let aff = await request($apiUrl.PUNIHRSULT_CONFIRMPUNISH,{
            method:"POST",
            data:{
                "params": {
                    ...queryData,
                },
                'paramsList':[...affirmData]
            }
        })
        console.log(aff)
        if(aff.success){
            setSpinflag(false)
            setChecked([])
            Toast('', aff.message, '', 5000, false);
        }else{
            setSpinflag(false)
            Toast('',aff.errorMessage, 'alert-error', 5000, false)
        }
    }

    //取消确认
    const affirmCancel = async() =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setSpinflag(true)
        let affirmCan = await request($apiUrl.PUNIHRSULT_CANCELCONFIRMPUNISH,{
            method:"POST",
            data:{
                "params": {
                    ...queryData,
                },
                'paramsList':[...affirmData]
            }
        })
        console.log(affirmCan)
        if(affirmCan.success){
            setSpinflag(false)
            setChecked([])
            Toast('', affirmCan.message, '', 5000, false);
        }else{
            setSpinflag(false)
            Toast('',affirmCan.errorMessage, 'alert-error', 5000, false)
        }
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
    const operationLog = async()=>{
        Toast('', '', '', 5000, false);
        setIsModalVisibleLog(true)
        setSpinflag(true)
        await request.post($apiUrl.PUNIHCONFIRM_GETPUISHOPERATIONLOG)
        .then((month) => {
            if(month.success){
                setSpinflag(false)
                let data = month.data
                data?data.map((v,i)=>{
                    v['id'] = i
                }):''
                setDataLog([...data.resultList])
                setMessageData({alertStatus:'alert-success',message:month.message })

            }else{
                setSpinflag(false)
                setMessageData({alertStatus:'alert-error',message:month.errorMessage })
            }
        })
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
                        <SelectVal required span={6} name='carrier' disabled={true} flag={true} label={<FormattedMessage id='lbl.haulier'/>} options={acquireData.values} />       
                        {/* 口岸公司 */}
                        <Select  showSearch={true} name='renderCompanyCode' flag={true} label={<FormattedMessage id='lbl.The-port-company'/>}  span={6} options={companyPort} />
                        {/* 月份 */}
                        <Select showSearch={true} name='calMonthe' flag={true} label={<FormattedMessage id='lbl.month'/>}  span={4} options={month} />
                        {/* 状态 */}
                        <Select required showSearch={true} name='status' label={<FormattedMessage id='lbl.state'/>}  span={4} options={commissionState} />
                        {/* 是否可确认 */}
                        <Select showSearch={true} name='renderStatus' flag={true} label={<FormattedMessage id='lbl.confirmable'/>}  span={6} options={renderStatus.values} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 确认 */}
                    <CosButton onClick={affirm} disabled={buttonFlag} auth='AFCM-PUNISH-003-B01'><CheckOutlined /> <FormattedMessage id='lbl.affirm'/></CosButton>
                    {/* 取消确认 */}
                    <CosButton onClick={affirmCancel} disabled={buttonFlag} auth='AFCM-PUNISH-003-B02'><MyIcon type="icon-quxiaoqueren"/><FormattedMessage id='lbl.Cancel-the-confirmation'/></CosButton>
                    {/* 操作日志 */}
                    <CosButton onClick={operationLog} auth='AFCM-PUNISH-003-B03'><ReadOutlined/> <FormattedMessage id='lbl.operater-log'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 查询按钮 */}
                    <Button onClick={()=> pageChange(page,null,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    // setSelectedRows={setSelectedRows}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setSelectedRows(row);
                        }
                    }}
                />
                {/* 合计: 超期总金额: 罚佣总金额: */}
            <div className='footer-money' style={{textAlign:'center'}}>
                <Row style={{display:'inline-block'}}><Col><span><FormattedMessage id='lbl.Total'/></span></Col></Row>
                {
                    money.map((val, idx) => {
                        return <Row className='footer-money-all' style={{display:'inline-block'}}>
                        <Col style={{display:'inline-block'}}><FormattedMessage id='lbl.Total-overdue-amount'/>:{val.overTotalAmountTotal} </Col>
                        <Col style={{display:'inline-block'}}><FormattedMessage id='lbl.Total-penalty-amount'/>:{val.punihTotalAmountTotal} </Col>
                        </Row>
                    })
                }
                {/* <span><FormattedMessage id='lbl.Total'/> </span>&nbsp;&nbsp;
                <span><FormattedMessage id='lbl.Total-overdue-amount'/> </span>&nbsp;&nbsp;
                <span><FormattedMessage id='lbl.Total-commission-penalty'/> </span> */}
            </div>
        
            </div>
            
            <PenaltyLog logData={logData} />
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol