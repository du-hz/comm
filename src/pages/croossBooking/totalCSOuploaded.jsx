//----------------------------------------------------中货总CSO上载---------------------------------------
import React, { useState,useEffect, $apiUrl,createContext} from 'react'
import {FormattedMessage, formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import InputArea from "@/components/Common/InputArea";
import request from '@/utils/request';
import { acquireSelectData, momentFormat, acquireSelectDataExtend, agencyCodeData} from '@/utils/commonDataInterface';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tooltip,Modal} from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import TotalCsoUploadedEdit from './totalCsoUploadedEdit'
import DatePicker from '@/components/Common/DatePicker'
import {
    FileSearchOutlined,//查看详情
    SearchOutlined,//查询
    CloudDownloadOutlined,//下载
    ReloadOutlined,//重置
    CloudUploadOutlined,
    CloseCircleOutlined
} from '@ant-design/icons'
export const NumContext = createContext();
import { createFromIconfontCN } from '@ant-design/icons';
import { values } from 'lodash';
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_22kmz5g3ty7.js', // 在 iconfont.cn 上生成
  });


const confirm = Modal.confirm
const Index =()=> {
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
        "companyCode": null,
        "agreementStatus": null,
        "agencyCode": null,
        "agencyName": null,
        'fromDate':null,
        'toDate':null
    });
    const [agencyCode, setAgencyCode] = useState([]);   // 代理编码
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [tableData,setTableData] = useState([]);//表格的数据 
    const [calculationPattern,setCalculationPattern] = useState({})//计算模式
    const [tradeType,setTradeType] = useState({})//贸易类型
    const [protocolType,setProtocolType] = useState({})//协议类型
    const [isModalVisible,setIsModalVisible] = useState(false)//弹框开关
    const [spinflag,setSpinflag] = useState(false)
    const [checked, setChecked] = useState([]);
    const [uuid,setUuid] = useState([])//uuid
    const [detailData,setDetailData] = useState([])
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

    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM','COMM.CALC.MTHD.CB0050',setCalculationPattern, $apiUrl);// 计算模式
        acquireSelectData('TRADE_TYPE',setTradeType, $apiUrl);// 贸易类型
        // acquireSelectData('AFCM.AGMT.TYPE',setProtocolType, $apiUrl);// 协议类型
        acquireSelectData('CSO.AGMT.TYPE',setProtocolType, $apiUrl);// 协议类型
        agencyCodeData($apiUrl,setAgencyCode, setCompany)//代理编码
    },[])
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
   
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: '9999100100',
        })
    }, [company])

    //删除
    const deleteTable = () => {
        Toast('', '', '', 5000, false);
        console.log(uuid)
        const confirmModal = confirm({
            title: formatMessage({id:'lbl.delete'}),
            content: formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                const cancel = await request($apiUrl.AGMT_COS_DELETE_COS_AGMT,{
                   method:'POST',
                   data:{
                    "params": {
                        "entryCode":"AFCM_B_AGMT"
                       },
                        "paramsList":[...uuid]
                   }
               })
               if(cancel.success) {
                    pageChange(page)
                    setTimeout(()=>{
                        Toast('', '', '', 5000, false);
                        Toast('',cancel.message, '', 5000, false)
                    } ,1000);
                }else{
                    Toast('', cancel.errorMessage , 'alert-error', 5000, false);
                }
            }
        })

        
       
    }

   
   
    //中货总CSO表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.company-code" />,//公司代码  
            dataIndex: 'companyCode',
            sorter: false,
            width: '70px',
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.Application-proxy-code" />,//申请代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.customerName-cos" />,//客户名称
            dataIndex: 'customerName',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100,
            
        },
        {
            title:<FormattedMessage id="lbl.argue.trade-code-cos" />,//贸易区
            dataIndex: 'tradeZoneCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 60,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Trade-line-cos" />,//贸易线
            dataIndex: 'tradeLaneCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 60,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Contract-No-Cos" />,//合约号
            dataIndex: 'agreementId',
            sorter: false,
            key:'AGMT_STATUS',
            width: 60,
            align:'left', 
        },
        // {
        //     title: <FormattedMessage id="lbl.Contract-type" />,//合约类型
        //     dataIndex: 'agreementType',
        //     sorter: false,
        //     key:'FM_DTE',
        //     width: 80,
        //     align:'left'
        // },
        {
            title:<FormattedMessage id="lbl.Computing-method" /> ,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.Loading-port-agent-code" />,//装港代理编码
            dataIndex: 'polAgencyCode',
            sorter: false,
            key:'CHECK_FAD_STATUS',
            width: 100,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Effective-time-from-cos" />,//有效时间 从
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            sorter: false,
            key:'REC_CHECK_FAD_USR',
            width: 80,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.Expiry-time-cos" />,//有效时间 到
            dataType: 'dateTime',
            dataIndex: 'toDate',
            sorter: false,
            key:'REC_CHECK_FAD_DTE',
            width: 80,
            align:'left'
        },
        {
            title:<FormattedMessage id="lbl.approver-cos" />,//批准人
            dataIndex: 'approvedUser',
            sorter: false,
            key:'CHECK_PMD_STATUS',
            width: 80,
            align:'left',
        },
        {
            title:<FormattedMessage id="lbl.ac.pymt.claim-note" />,//备注
            dataIndex: 'memo',
            sorter: false,
            key:'REC_CHECK_PMD_USR',
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.update-date-cos" />,//更新日期
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            key:'REC_CHECK_PMD_DTE',
            width: 120,
            align:'left'
        },
        {
            title:<FormattedMessage id="lbl.update-by-cos" />,//更新人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            key:'CHECK_AGENCY_STATUS',
            width: 80,
            align:'left', 
        }
    ]

    //表格数据
    const pageChange= async(pagination,options,search,mes) =>{
        Toast('', '', '', 5000, false);
        const query = queryForm.getFieldsValue()
        console.log(query)
        setSpinflag(true)
        setChecked([])
        search?pagination.current=1:null
        let localsearch=await request($apiUrl.CROOSS_BOOKING_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params":{
                    // "entryCode":"AFCM_B_AGMT",
                    // 'paramEntity':{
                        ...query,
                        recordUpdateDatetime: query.recordUpdateDatetime?momentFormat(query.recordUpdateDatetime):"",
                        // 'dateFrom_fromDate':query.recordUpdateDatetime?momentFormat(query.recordUpdateDatetime[0]):null,
                        // 'dateTo_toDate':query.recordUpdateDatetime?momentFormat(query.recordUpdateDatetime[1]):null,
                    // }
                },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            let data=localsearch.data
            let datas=localsearch.data.resultList
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            datas.map((v,i)=>{
                v['id'] = i
            })
            setPage({...pagination})
            setTableData([...datas])
            setTabTotal(data.totalCount)
            // setCopyShow(false)
            setSpinflag(false)
            mes?Toast('',mes, '', 5000, false):''
        }else{
            setTableData([])
            setSpinflag(false)
            mes?Toast('',mes, '', 5000, false):Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
        }  
       
    }
    const setSelectedRows = (val) =>{
        console.log(val)
        setUuid(val)
        // val.length?val.map((v,i)=>{
        //     uuid.push({'afcmAgreementUuid':v.afcmAgreementUuid})
        //     setUuid([...uuid])
        // }):setUuid([])
    }

    const detailDatas={
        isModalVisible,
        setIsModalVisible,
        protocolType,//协议类型
        calculationPattern,//计算方法
        detailData,
    }
    const doubleClickRow = async(parameter) =>{
        Toast('', '', '', 5000, false);
        setIsModalVisible(true)
        setDetailData(parameter)
    }
    
    //重置
    const reset = () => {
    Toast('', '', '', 5000, false);
    setTableData([])
    setChecked([])
    queryForm.resetFields()
    queryForm.setFieldsValue({
        agencyCode: '9999100100',
    })
    }

    const download = async()=>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.CROOSS_BOOKING_DOWNLOAD,{
            method:"POST",
            data:{
                "params":{
                    // entryCode:'AFCM_B_AGMT',
                    // 'paramEntity':{
                        ...query,
                        recordUpdateDatetime: query.recordUpdateDatetime?momentFormat(query.recordUpdateDatetime):null,
                        // recordUpdateDatetime:undefined,
                        // 'dateFrom_fromDate':query.recordUpdateDatetime?momentFormat(query.recordUpdateDatetime[0]):null,
                        // 'dateTo_toDate':query.recordUpdateDatetime?momentFormat(query.recordUpdateDatetime[1]):null,
                    // }
                },
                'excelFileName':formatMessage({id:'menu.afcm.agreement.croossBooking.totalCSOuploaded'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        companyCode: formatMessage({id:"lbl.company-code" }),
                        agencyCode: formatMessage({id:"lbl.Application-proxy-code" }),
                        customerName: formatMessage({id:"lbl.customerName-cos" }),
                        tradeZoneCode: formatMessage({id:"lbl.argue.trade-code-cos" }),
                        tradeLaneCode: formatMessage({id:"lbl.Trade-line-cos" }),
                        agreementId: formatMessage({id:"lbl.Contract-No-cos" }),
                        agreementType: formatMessage({id:"lbl.Contract-type" }),
                        calculationMethod: formatMessage({id:"lbl.Computing-method" }),
                        polAgencyCode: formatMessage({id:"lbl.Loading-port-agent-code" }),
                        fromDate: formatMessage({id:"lbl.Effective-time-from" }),
                        toDate: formatMessage({id:"lbl.Expiry-time" }),
                        approvedUser: formatMessage({id:"lbl.approver" }),
                        memo: formatMessage({id:"lbl.ac.pymt.claim-note" }),
                        recordUpdateDatetime: formatMessage({id:"lbl.update-date" }),
                        recordUpdateUser: formatMessage({id:"lbl.update-by" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agreement.croossBooking.totalCSOuploaded'}),
                }]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if(downData.success||downData){
            setSpinflag(false)
            if(downData.size<1){
                Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
                return
            }else{
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agreement.croossBooking.totalCSOuploaded'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({id: 'menu.afcm.agreement.croossBooking.totalCSOuploaded'}) + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        }else{
            setSpinflag(false)
            console.log(downData.errorMessage)
            Toast('',downData.errorMessage, 'alert-error', 5000, false)
        }
        
    }
    // const [data,setData] = useState([])
    const handlechang = () =>{
        const file = document.getElementById('file').files[0]
        console.log(document.getElementById('file').files)
        console.log(file)
        // setData(file)
        const result = document.getElementById("result")
        let reader = new FileReader();
        reader.readAsBinaryString(file)
        console.log(reader.result)
        reader.onload=function(f){
        console.log(result)
        //   result.innerHTML=this.result
        }
        uploadbuton(file)
    }
    //上传
    const uploadbuton = async(data) =>{
            Toast('', '', '', 5000, false);
            let fd = new FormData()
            fd.append('file',data)
            fd.append('name',data.name)
            fd.append('type',data.type)
            setSpinflag(true)
            console.log(fd)
            let result = await request($apiUrl.AGMT_COS_UPLOAD_CSO,{
                method:'POST',
                data: fd,
                requestType:'form',
            })
            console.log(result)
            if(result.success){
                setSpinflag(false)
                pageChange(page,'','',result.message)
            }else{
                setSpinflag(false)
                Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
        
    }
    
    //下载模板
    const downlod = async()=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let downData = await request($apiUrl.CONFIG_DOWNLOADTEMP,{
            method:"POST",
            data:{
                // "importCSOTemplate.xlsx"
                "excelFileName":formatMessage({id: 'lbl.afcm-0087'}), 
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        // if(downData.success){
            if(downData.size<1){
                setSpinflag(false)
                Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
                return
            }else{
                setSpinflag(false)
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                console.log(blob)
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({id: 'lbl.afcm-0086'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    console.log(href)
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({id: 'lbl.afcm-0086'})+ '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    console.log(downloadElement)
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        // }else{

        // }
        
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
                        {/* 申请代理编码 */}
                        <InputText name='agencyCode' disabled label={<FormattedMessage id='lbl.Application-proxy-code'/>}   span={6}/>  
                        {/* 合约号 */}
                        <InputText name='agreementId' label={<FormattedMessage id='lbl.Contract-No-Cos'/>}  span={6} capitalized={false}/>
                        {/* 计算方法 */}
                        <Select name='calculationMethod' flag={true} label={<FormattedMessage id='lbl.Computing-method'/>}  span={6}  options={calculationPattern.values}/>  
                        {/* 贸易区 */}
                        <InputText name='tradeZoneCode' label={<FormattedMessage id='lbl.argue.trade-code'/>} span={6}/> 
                        {/* 贸易线 */}
                        <InputText name='tradeLaneCode' label={<FormattedMessage id='lbl.Trade-line'/>} span={6}/> 
                        {/* 装港代理编码 */}
                        <InputText name='podAgencyCode' label={<FormattedMessage id='lbl.Loading-port-agent-code'/>} span={6}/> 
                        {/* 协议类型 addonAfter={<FileSearchOutlined onClick={()=> portBounced()} />} */}
                        <Select name='agreementType'  flag={true}  label={<FormattedMessage id='lbl.protocol-type'/>} span={6} options={protocolType.values}  />  
                        {/* 上载日期 */}
                        {/* <DoubleDatePicker span={6} disabled={[false, false]} name='recordUpdateDatetime'  label={<FormattedMessage id='lbl.Upload-date'/>}   /> */}
                        <DatePicker name='recordUpdateDatetime' label={<FormattedMessage id="lbl.Upload-date" />} span={6} />             
                    </Row>
                </Form> 
                {/* 基本查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Basic-Query-Conditions'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载上载模板 */}
                    <Button onClick={downlod}><FormattedMessage id='lbl.Download-upload-Template' /></Button>
                    {/* 下载 */}
                    <Button onClick={download}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                    {/* 上载 */}
                    <Button className='filebutton' ><CloudUploadOutlined /><FormattedMessage id='lbl.upload'/><input type="file" id="file"  onChange={() =>handlechang()}/></Button>
                    {/* 删除 */}
                    <CosButton onClick={() =>deleteTable()} disabled={uuid.length>0?false:true} ><CloseCircleOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 清空 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='lbl.empty' /></Button>
                    {/* 查询按钮 */}
                    <Button  onClick={() => pageChange(page,'','search')}> <SearchOutlined /><FormattedMessage id='btn.search-cos' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    setSelectedRows={setSelectedRows}
                    handleDoubleClickRow={doubleClickRow}
                    selectWithClickRow={true}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setUuid(row);
                            setSelectedRows(row);
                        }
                    }}
                    total={tabTotal}
                />
            </div>
            <TotalCsoUploadedEdit detailDatas={detailDatas}/>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default Index;