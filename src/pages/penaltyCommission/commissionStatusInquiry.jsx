//罚佣状态查询
import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { momentFormat, portCompany, acquireSelectData,allCompany} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import {Toast} from '@/utils/Toast'
import SelectVal from '@/components/Common/Select';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import {
    SearchOutlined,//查询
    ReloadOutlined ,
} from '@ant-design/icons'

let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}

const LocalChargeComputationProtocol =()=> {
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [spinflag,setSpinflag] = useState(false)
    const [company,setCompany] = useState([])//口岸公司
    const [companyAll,setCompanyAll] = useState([])//全部口岸公司
    const [agencyFlag,setAgencyFlag] = useState(true);//背景颜色
    const [carrierDefaultData,setCarrierDefaultData] = useState('')
    const [messageData,setMessageData] = useState({})//提示弹框
    const [allWhether,setAllWhether] = useState ({})//通用的是否
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
        console.log(queryForm.getFieldValue())
    }

    useEffect(()=>{
        portCompany($apiUrl,'PUNIHRSULT_GETCONFIGRENDERCOMPANYLIST',setCompany,'')
        acquireSelectData('AFCM.PUNISH.CURRSTATUS',setAllWhether,$apiUrl)//通用是否
        allCompany(setCompanyAll,$apiUrl,false)//公司
        // copmay()
    },[])
    // const  copmay = async() =>{
    //     await request($apiUrl.PUNIHRSULT_GETCONFIGRENDERCOMPANYLIST,{
    //         method:"POST",
    //         data:' '
    //     })
    //     .then((resul) => {
    //         if(!resul.data)return
    //         var data = resul.data;
    //         data.map((val, idx)=> {
    //             val['value'] = val.companyCode 
    //             val['label'] = val.companyCode + ' ' + val.companyNameAbbr;
    //         })
    //         setCompanyAll(data);
    //     })
    // }
     
    //localcharge表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.company-code" />,//公司代码
            dataType:companyAll,
            dataIndex: 'companyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.SVVDID" />,//SVVDID
            dataIndex: 'svvdId',
            key:'COMPANY_CDE',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.Penalty-fees-amount" />,//罚佣金额
            dataIndex: 'localTotalAmount',
            key:'AGENCY_CDE',
            sorter: false,
            width: 120,
            align:'right',  
        },
        {
            title: <FormattedMessage id="lbl.Service-identification-number" />,//业务识别号
            dataIndex: 'billReferenceCode',
            key:'FM_DTE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.operation-date" />,//操作时间
            dataType:'dateTime',
            dataIndex: 'recordUpdateDatetime',
            key:'TO_DTE',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.Is-the-order-created" />,//托单是否创建
            dataType:allWhether.values,
            dataIndex:'currentStatus',
            key:'CGO_TRADE_LANE_CDE',
            sorter: false,
            width: 120,
            align:'left',
            
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(search){
            pagination.current=1
        }
        console.log(queryData)
        if(!queryData.companyCode&&!queryData.businessReferenceCode&&!queryData.Date){
            //[公司] [业务识别号] [操作时间] 必须有一项必填
            Toast('', formatMessage({id: 'lbl.company-busCode-overDate'}), 'alert-error', 5000, false)
            setAgencyFlag(false)
        }else{
            setAgencyFlag(true)
            setSpinflag(true)
            const localsearch=await request($apiUrl.PUNIHSTATEQUERY_SEARCHRUNIHSTATE,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        ...queryData,
                        Date:undefined,
                        'startime':queryData.Date?momentFormat(queryData.Date[0]):null,
                        'endtime':queryData.Date?momentFormat(queryData.Date[1]):null,
                    },
                }
            })
            console.log(localsearch)
            if(localsearch.success){
                let data=localsearch.data
                let datas=localsearch.data.resultList
                datas?datas.map((v,i)=>{
                    v['id'] = i
                }):null
                setTabTotal(data.totalCount)
                setTableData([...datas])
                if(pagination.pageSize!=page.pageSize){
                    pagination.current=1
                }
                setPage({...pagination})
                setSpinflag(false)
            }else{
                setSpinflag(false)
                setTableData([])
                Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
            }
        }
    }

      //重置
      const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setTableData([])
        setAgencyFlag(true)
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
                        <SelectVal span={6} showSearch={true} name='companyCode' flag={true}  style={{background:agencyFlag?'white':'yellow'}} label={<FormattedMessage id='lbl.company'/>} options={company} />
                        {/* 业务识别号 */}
                        <InputText showSearch={true} name='businessReferenceCode' flag={true} styleFlag={agencyFlag} label={<FormattedMessage id='lbl.Service-identification-number'/>}  span={6} />
                        {/* 操作日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='Date' style={{background:agencyFlag?'white':'yellow',}} formlayouts={formlayouts} label={<FormattedMessage id='lbl.Operation-date'/>}   />          
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=> pageChange(page,null,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
                </div>
            <div className='footer-table' >
                <div style={{width:'60%'}}>
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
                        rowSelection={null}
                    />
                </div>
                
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol