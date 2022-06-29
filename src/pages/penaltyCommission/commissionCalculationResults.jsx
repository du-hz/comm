import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import InputArea from "@/components/Common/InputArea";
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, portCompany, momentFormat, setCarrierDefault, commissionMonth,acquireSelectDatas,allCompany} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Col,Tooltip} from 'antd'
import {Toast} from '@/utils/Toast'
import SelectVal from '@/components/Common/Select';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    ReadOutlined,
} from '@ant-design/icons'
import { createFromIconfontCN } from '@ant-design/icons';
import { values } from 'lodash';
import PenaltyLog from './commissionAllocation/penaltyLog'

const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2485864_padu19mvy5.js', // 在 iconfont.cn 上生成
});

//----------------------------------------------罚佣计算结果------------------------------------------------------
const LocalChargeComputationProtocol =()=> {
    const [acquireData, setAcquireData] = useState({}); // 承运人
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [carrierDefaultData,setCarrierDefaultData] = useState('')
    const [shipmentBound,setShipmentBound] = [{}]//进出口
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [moneyData,setMoneyData] = useState([])//合计罚佣金额
    const [company,setCompany] = useState([])//口岸公司
    const [month,setMonth] = useState([])//月份
    const [currency,setCurrency] = useState([])//币种
    const [commissionState,setCommissionState] = useState({})//罚佣状态
    const [isModalVisibleLog,setIsModalVisibleLog] = useState(false)//控制日志弹框开关
    const [spinflag,setSpinflag] = useState(false)
    const [buttonFlag,setButtonFlag] = useState(false)//按钮
    const [checked, setChecked] = useState([]);
    const [uuid,setUuid] = useState([])//uuid
    const [messageData,setMessageData] = useState({})//提示弹框
    const [dataLog,setDataLog] = useState([])//控制日志弹框开关
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
        // acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 承运人
        acquireSelectData('AFCM.CARRIER_COMPANY_PAIRS',setAcquireData,$apiUrl)//承运人
        acquireSelectDatas('AFCM.PUNISH.CURRENCYCODE',setCurrency,$apiUrl)//币种
        acquireSelectData('AFCM.PUNISH.DOCUMENTSTATE',setCommissionState,$apiUrl)//罚佣状态
        commissionMonth($apiUrl,'PUNIHRSULT_GETCALMONTHELIST',setMonth)//月份
        setCarrierDefault($apiUrl,setCarrierDefaultData)
        uuid.length>0?setButtonFlag(false):setButtonFlag(true)
        // acquireSelectDatas('AFCM.PUNISH.SHMTBOUND',setShipmentBound,$apiUrl)//进出口
        uuid.length>0?setButtonFlag(false):setButtonFlag(true)
    },[uuid])
    useEffect(()=>{//默认值
         queryForm.setFieldsValue({
            'carrier':carrierDefaultData
        })
        portCompany($apiUrl,'PUNIHRSULT_GETCONFIGRENDERCOMPANYLIST',setCompany,carrierDefaultData)//口岸公司
        allCompany(setCompanysData,$apiUrl,false)//公司
    },[carrierDefaultData])

    // const acquireSelectDatas = async(key, setData, apiUrl)=>{
    //     await request.post(apiUrl.COMMON_DICT_ITEM+'?key='+key)
    //     .then((resul) => {
    //         if(resul.success){
    //             console.log(resul.data.values)
    //             let data = resul.data.values;
    //             setCurrency(data);
    //         }
    //     })
    // }
    //公司
    // const companys = async() =>{
    //     await request.post($apiUrl.AG_FEE_AGMT_SEARCH_INIT)
    //     .then((resul) => {
    //         if(!resul.data)return
    //         var data = resul.data.companys;
    //         data.map((val, idx)=> {
    //             val['value'] = val.companyCode ;
    //             val['label'] = val.companyCode + '-' + val.companyNameCn;

    //         })
    //         setCompanysData(data);
    //     })
        
    // }



    const logData = {
        isModalVisibleLog,
        setIsModalVisibleLog,
        dataLog,
        messageData,
        setMessageData
    }

    //日志
    const log = async(value)=>{
        console.log(value)
        Toast('', '', '', 5000, false);
        setIsModalVisibleLog(true)
        setSpinflag(true)
        await request.post($apiUrl.PUNIHRSULT_GETPUNISHOPERATIONLOG,{
            data:{
                uuid:value.punihResultUuid
            }
        })
        .then((result) => {
            if(result.success){
                let data = result.data
                setSpinflag(false)
                data.length>0?data.map((v,i)=>{
                    v['id'] = i
                }):''
                setDataLog([...data.resultList])
                setMessageData({alertStatus:'alert-success',message:result.message })
            }else{
                setSpinflag(false)
                setMessageData({alertStatus:'alert-error',message:result.errorMessage })
            }
        })
    }
  
    //罚佣计算结果表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.log" />,//日志
            dataIndex: 'operate',
            sorter: false,
            width: 50,
            align:'center',
            fixed: true,
            render:(text,record, index) => {
                return <div>
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />} >
                        <a onClick={() => {log(record)}}  ><ReadOutlined/></a>&nbsp;  {/* 日志 */}
                    </Tooltip>&nbsp;
                </div>
            }
        },
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
            dataType:company.values,
            dataIndex: 'kouAnName',
            key:'COMPANY_CDE',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataType:companysData,
            dataIndex: 'companyCode',
            key:'AGENCY_CDE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.month" />,//月份
            dataIndex: 'calMonthe',
            key:'FM_DTE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Beyond-the-amount" />,//超期金额
            dataIndex: 'overTotalAmount',
            key:'TO_DTE',
            sorter: false,
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Sent-servants-currency" />,//罚佣币种
            dataIndex:'currencyCode',
            key:'CGO_TRADE_LANE_CDE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Penalty-fees-amount" />,//罚佣金额
            dataIndex: 'punihTotalAmount',
            key:'CHRG_CDE',
            sorter: false,
            align:'right',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.Service-identification-number" />,//业务识别号
            dataIndex: 'businessReferenceCode',
            key:'OB_IB_IND',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex:'svvdId',
            key:'OFCE_CDE',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.bound" />,//进出口
            dataType:shipmentBound.values,
            dataIndex: 'shipmentBound',
            key:'REFUND_RATE',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.modification-date" />,//修改日期
            dataType:'dateTime',
            dataIndex: 'recordUpdateDatetime',
            key:'REC_UPD_DT',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.state" />,//状态
            dataType:commissionState.values,
            dataIndex: 'status',
            key:'REC_UPD_USR',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.loc-ccy" />,//原币币种
            dataIndex: 'currencyCode',
            key:'REC_UPD_USR',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.ac.report.occ-amount" />,//原币金额
            dataIndex: 'outstandTotalAmount',
            key:'REC_UPD_USR',
            sorter: false,
            width: 120,
            align:'right',
            
        },
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        console.log(currency)
        search?pagination.current=1:null
        let query = queryForm.getFieldValue();
        setChecked([]);
        setSpinflag(true)
        console.log()
        const localsearch=await request($apiUrl.PUNIHRSULT_SEARCHLIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    ...query,
                    // 'renderCompanyCode':query.renderCompanyCode,
                    'overDate':undefined,
                    'fromOverDate':queryForm.getFieldValue().overDate?momentFormat(queryForm.getFieldValue().overDate[0]):null,
                    'toOverDate':queryForm.getFieldValue().overDate?momentFormat(queryForm.getFieldValue().overDate[1]):null,
                },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            setSpinflag(false)
            let data=localsearch.data
            let datas=localsearch.data.resultList
            setTabTotal(data.totalCount)
            setTableData([...datas])
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            setPage({...pagination})
            money()
        }else{
            setSpinflag(false)
            setTableData([])
            Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
        }    
    }
    const setSelectedRows = (params) =>{
        console.log(params)
        setButtonFlag(true)
       let data = params.map((v,i)=>{
            return v.punihResultUuid
        })
        setUuid([...data])
    }

    //减免
    const mitigate= async() =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let  mitigate= await request($apiUrl.PUNIHRSULT_DRAFTTOREDUCE,{
            method:"POST",
            data:{
                uuids:[...uuid]
            }
        })
        console.log(mitigate)
        if(mitigate.success){
            setSpinflag(false)
            Toast('', mitigate.message, '', 5000, false);
            pageChange(page)
        }else{
            setSpinflag(false)
            Toast('',mitigate.errorMessage, 'alert-error', 5000, false)
        }
    }

    //全部减免
    const mitigateAll = async() =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let queryData = queryForm.getFieldValue();
        let  mitigate= await request($apiUrl.PUNIHRSULT_ALLDRAFTTOREDUCE,{
            method:"POST",
            data:{
                "params": {
                    ...queryData,
                    Date:undefined,
                    'fromOverDate':queryData.overDate?momentFormat(queryData.overDate[0]):null,
                    'toOverDate':queryData.overDate?momentFormat(queryData.overDate[1]):null,
                },
            }
        })
        console.log(mitigate)
        if(mitigate.success){
            setSpinflag(false)
            Toast('', mitigate.message, '', 5000, false);
            pageChange(page)
        }else{
            setSpinflag(false)
            Toast('',mitigate.errorMessage, 'alert-error', 5000, false)
        }
    }
    // 标记为不退还
    const Marked= async()=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let  mitigate= await request($apiUrl.PUNIHRSULT_CONFIRMTONOTRETURN,{
            method:"POST",
            data:{
                uuids:[...uuid]
            }
        })
        console.log(mitigate)
        if(mitigate.success){
            setSpinflag(false)
            Toast('', mitigate.message, '', 5000, false);
            pageChange(page)
        }else{
            setSpinflag(false)
            Toast('',mitigate.errorMessage, 'alert-error', 5000, false)
        }
    }
    // 取消标记
    const unmark= async()=>{
        Toast('', '', '', 5000, false);
        console.log(uuid)
        setSpinflag(true)
        let  unmark= await request($apiUrl.PUNIHRSULT_NOTRETURNTOCONFIRM,{
            method:"POST",
            data:{
                uuids:[...uuid]
            }
        })
        console.log(unmark)
        if(unmark.success){
            setSpinflag(false)
            Toast('', unmark.message, '', 5000, false);
            pageChange(page)
        }else{
            setSpinflag(false)
            Toast('',unmark.errorMessage, 'alert-error', 5000, false)
        }
    }
    // 页面统计金额
    const money= async()=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let queryData = queryForm.getFieldValue();
        let  money= await request($apiUrl.PUNIHRSULT_GETPUNIHTOTALAMOUNT,{
            method:"POST",
            data:{
                "params": {
                    ...queryData,
                    overDate:undefined,
                    'fromOverDate':queryData.overDate?momentFormat(queryData.overDate[0]):null,
                    'toOverDate':queryData.overDate?momentFormat(queryData.overDate[1]):null,
                },
            }
        })
        console.log(money)
        if(money.success){
            setSpinflag(false)
            let data = money.data
            setMoneyData([...data])
            // Toast('', money.message, '', 5000, false);
        }else{
            setSpinflag(false)
            setMoneyData([])
        }
    }
    //全部取消减免
    const FullCancellationDeductions= async() =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let queryData = queryForm.getFieldValue()
        let Breaks  = await request($apiUrl.PUNIHRSULT_ALLREDUCETODRAFT,{
            method:'POST',
            data:{
                "params": {
                    ...queryData,
                    Date:undefined,
                    'fromOverDate':queryData.overDate?momentFormat(queryData.overDate[0]):null,
                    'toOverDate':queryData.overDate?momentFormat(queryData.overDate[1]):null,
                },
            }
        })
        console.log(Breaks)
        if(Breaks.success){
            setSpinflag(false)
            Toast('', Breaks.message, '', 5000, false)
            pageChange(page)
        }else{
            setSpinflag(false)
            Toast('',Breaks.errorMessage, 'alert-error', 5000, false)
        }
    }
    //取消减免
    const CancelBreaks= async() =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let Breaks  = await request($apiUrl.PUNIHRSULT_REDUCETODRAFT,{
            method:'POST',
            data:{
                uuids:[...uuid]
            }
        })
        console.log(Breaks)
        if(Breaks.success){
            setSpinflag(false)
            Toast('', Breaks.message, '', 5000, false)
            pageChange(page)
        }else{
            setSpinflag(false)
            Toast('',Breaks.errorMessage, 'alert-error', 5000, false)
        }
    }
   const downlod = async(search) =>{
    Toast('','', '', 5000, false)
    setSpinflag(true)
    const query = queryForm.getFieldsValue()
    let downData = await request($apiUrl.PUNIHRSULT_EXP_PUNISHRESULTITEM_LIST,{
        method:"POST",
        data:{
            "params":{
                    ...query,
                    // 'renderCompanyCode':query.renderCompanyCode,
                    'overDate':undefined,
                    'fromOverDate':queryForm.getFieldValue().overDate?momentFormat(queryForm.getFieldValue().overDate[0]):null,
                    'toOverDate':queryForm.getFieldValue().overDate?momentFormat(queryForm.getFieldValue().overDate[1]):null,
            },
            "uuids":search?[...uuid]:null,
            'excelFileName':formatMessage({id:'lbl.afcm-001'}),
            sheetList: [{//sheetList列表
                dataCol: {//列表字段
                    calMonthe:formatMessage({id:"lbl.month" }),//月份
                    carrier:formatMessage({id:"lbl.haulier" }),//承运人
                    companyCode:formatMessage({id:"lbl.company" }),//公司
                    custUuid:formatMessage({id:"lbl.cust" }),//客户
                    businessReferenceCode:formatMessage({id:"lbl.Service-identification-number" }),//业务识别号
                    svvdId:formatMessage({id:"lbl.SVVD" }),//SVVD
                    portCode:formatMessage({id:'lbl.port'}),  //港口
                    chargeCode :formatMessage({id:'lbl.chargeCode'}),  //Charge Code
                    shipmentBound :formatMessage({id:'lbl.bound'}),  //进出口
                    tradeLaneCode :formatMessage({id:'lbl.trade-channel'}),  //Trade Lane
                    fromActivityDate :formatMessage({id:'lbl.afcm-002'}),  //业务开始时间
                    toActivityDate :formatMessage({id:'lbl.afcm-003'}),  //业务结束时间
                    // firstCreditDate :formatMessage({id:'lbl.afcm-004'}),  //首次扣减信用UUID
                    // lastCreditDate :formatMessage({id:'lbl.afcm-005'}),  //最近扣减信用
                    blDate :formatMessage({id:'lbl.afcm-006'}),  //账单日
                    setDate :formatMessage({id:'lbl.afcm-007'}),  //到期日
                    creditCancelInd :formatMessage({id:'lbl.afcm-008'}),  //是否已扣减信用（信用/票结）
                    currencyCode :formatMessage({id:'lbl.loc-ccy'}),  //原币币种
                    outstandTotalAmount :formatMessage({id:'lbl.afcm-009'}),  //欠费总金额原币
                    outstandLocalTotalAmount :formatMessage({id:'lbl.afcm-0010'}),  //欠费本位币金额
                    payMethod :formatMessage({id:'lbl.afcm-0011'}),  //支付方式
                    calculateDate :formatMessage({id:'lbl.afcm-0012'}),  //计算时间
                    releasedAmount :formatMessage({id:'lbl.afcm-0013'}),  //已释放金额
                    verificationAmount :formatMessage({id:'lbl.afcm-0015'}),  //已核销金额
                    releasedLocalAmount :formatMessage({id:'lbl.afcm-0014'}),  //已释放金额本币
                    verificationLocalAmount :formatMessage({id:'lbl.afcm-0016'}),  //已核销金额本币
                    punihResultUuid :formatMessage({id:'lbl.afcm-0017'}),  //罚佣头UUID
                    punihRate :formatMessage({id:'lbl.Penalty-proportion-of-commission'}),  //罚佣比例
                    overTotalAmount :formatMessage({id:'lbl.Beyond-the-amount'}),  //超期金额（本位币超期金额）
                    punihCurrencyCode :formatMessage({id:'lbl.Sent-servants-currency'}),  //罚佣币种（使用承运人对应的LOC币种）
                    punihTotalAmount :formatMessage({id:'lbl.Penalty-fees-amount'}),  //罚佣金额（本位币罚佣金额）
                    createUser :formatMessage({id:'lbl.create-by'}),  //创建人
                    bkgOfficeCode :formatMessage({id:'lbl.afcm-0021'}),  //BKG OFFICE
                    userName:formatMessage({id:'lbl.afcm-0022'}),  //Sales name
                },
                sumCol: {//汇总字段
                },
            'sheetName':formatMessage({id:'lbl.afcm-001'}),
            }]
        },
        responseType: 'blob',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
    })
    console.log(downData)
    if(downData.size<1){
        setSpinflag(false)
        Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
        return
    }else{
        setSpinflag(false)
        let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
        if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
            navigator.msSaveBlob(blob, formatMessage({id: 'lbl.afcm-001'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
        } else {
            let downloadElement = document.createElement('a');  //创建元素节点
            let href = window.URL.createObjectURL(blob); // 创建下载的链接
            downloadElement.href = href;
            downloadElement.download = formatMessage({id: 'lbl.afcm-001'}) + '.xlsx'; // 下载后文件名
            document.body.appendChild(downloadElement); //添加元素
            downloadElement.click(); // 点击下载
            document.body.removeChild(downloadElement); // 下载完成移除元素
            window.URL.revokeObjectURL(href); // 释放掉blob对象
        }
    }
   }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            'carrier':carrierDefaultData
        })
        setTableData([])
        setChecked([]);
        setMoneyData([])
        setButtonFlag(true)
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
                        <SelectVal span={6} required name='carrier' disabled={true} label={<FormattedMessage id='lbl.haulier'/>} options={acquireData.values} />
                        {/* 口岸公司 */}
                        <Select showSearch={true} name='renderCompanyCode' flag={true} label={<FormattedMessage id='lbl.The-port-company'/>}  span={6} options={company} />
                        {/* 业务识别号*/}
                        <InputArea name='businessReferenceCode'   label={<FormattedMessage id='lbl.Service-identification-number'/>}   span={6}/>  
                        {/* SVVD */}
                        <InputText name='svvdId' label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>  
                        {/* 月份 */}
                        <Select showSearch={true} name='calMonthe' flag={true} label={<FormattedMessage id='lbl.month'/>}  span={6} options={month} />
                        {/* 原币币种 */}
                        <InputText showSearch={true} name='currencyCode' flag={true} label={<FormattedMessage id='lbl.loc-ccy'/>}  span={6} />
                        {/* 超期日 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='overDate'  label={<FormattedMessage id='lbl.Expiration-date'/>}   />          
                        {/* 状态 */}
                        <Select showSearch={true} name='status' flag={true} label={<FormattedMessage id='lbl.state'/>}  span={6} options={commissionState.values} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 减免 */}
                    <CosButton onClick={mitigate} disabled={buttonFlag} auth='AFCM-PUNISH-002-B01'><MyIcon type="icon-jianmiantui" /> <FormattedMessage id='lbl.mitigate'/></CosButton>
                    {/* 全部减免 */}
                    <CosButton onClick={mitigateAll} auth='AFCM-PUNISH-002-B02'><MyIcon type="icon-jianmiantui" /> <FormattedMessage id='lbl.all-credits'/></CosButton>
                    {/* 取消减免 */}
                    <CosButton onClick={CancelBreaks} disabled={buttonFlag} auth='AFCM-PUNISH-002-B03'><MyIcon type="icon-fuwufeijianmian" /> <FormattedMessage id='lbl.Cancel-the-breaks'/></CosButton>
                    {/* 全部取消减免 */}
                    <CosButton onClick={FullCancellationDeductions} auth='AFCM-PUNISH-002-B04'><MyIcon type="icon-fuwufeijianmian" /> <FormattedMessage id='lbl.Eliminate-all-exemptions'/></CosButton>
                    {/* 标记为不退还 */}
                    <CosButton onClick={Marked} disabled={buttonFlag} auth='AFCM-PUNISH-002-B05'><MyIcon type="icon-biaoji" /> <FormattedMessage id='lbl.Marked-as-non-returnable'/></CosButton>
                    {/* 取消标记 */}
                    <CosButton onClick={unmark} disabled={buttonFlag} auth='AFCM-PUNISH-002-B06'><MyIcon type="icon-quxiaobiaoji" /> <FormattedMessage id='lbl.unmark'/></CosButton>
                    {/* 根据查询条件导出罚佣明细 */}
                    <Button onClick={()=> downlod('')} ><MyIcon type="icon-upload" /> <FormattedMessage id='lbl.Querying-Export-Details'/></Button>
                    {/* 根据选择导出罚佣明细 */}
                    <Button onClick={()=> downlod('choice')} disabled={buttonFlag}><MyIcon type="icon-upload" /> <FormattedMessage id='lbl.Select-Export-Details'/></Button>
                </div>
                <div className='button-right'>
                    {/* 导出Excel按钮 */}
                    {/* <Button onClick={downlod}><MyIcon type="icon-daochuexcel" /><FormattedMessage id='lbl.derive-Excel' /></Button> */}
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=> pageChange(page,null,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
                </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='punihResultUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    // rowSelection={null}
                    setSelectedRows={setSelectedRows}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setUuid(row);
                            setSelectedRows(row);
                        }
                    }}
                />
                <div className='footer-money'>
                    {
                        moneyData.map((v,i)=>{
                            return <Row className='footer-money-all'>
                                {
                                    currency.values.map((val,ind)=>{
                                    return v.currencyCode==val.value?<Col >{val.label}：<FormattedMessage id='lbl.Add-up-the-penalty-commission'/>&nbsp;{v.sumAmount}</Col>:''
                                    })
                                }
                            </Row>
                        })
                    }
                </div>
            </div>
            <Loading spinning={spinflag}/>
            <PenaltyLog logData={logData} />
        </div>
    )
}
export default LocalChargeComputationProtocol