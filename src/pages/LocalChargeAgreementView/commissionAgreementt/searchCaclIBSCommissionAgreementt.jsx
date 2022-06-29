//----------------------------------------------------IBS返还佣金协议---------------------------------------
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
import ViewMissingRates from './viewMissingRates'
import UploadRate from './uploadRate'
import IBSCommissionAgreementtEdit from './IBSCommissionAgreementtEdit'
import FieldConfiguration from './fieldConfiguration'
import SelectSearch from '@/components/Common/SelectSearch'
import CosToast from '@/components/Common/CosToast'
import CosModal from '@/components/Common/CosModal'
import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    SearchOutlined,//查询
    CopyOutlined,//复制
    FileDoneOutlined,//提交审核
    ReadOutlined,//日志
    ReloadOutlined,//重置
    CaretDownOutlined,//导出
    CloudUploadOutlined
} from '@ant-design/icons'
export const NumContext = createContext();
import { createFromIconfontCN } from '@ant-design/icons';
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_l21xrpyzhrl.js', // 在 iconfont.cn 上生成
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
    const [isModalVisiblecopy, setIsModalVisibleCopy] = useState(false);//编辑弹框开关
    const [isModalVisibleviewMissingRates, setIsModalVisibleViewMissingRates] = useState(false);//查看缺失费率弹框开关
    const [isModalVisibleviewUploadRate, setIsModalVisibleViewUploadRate] = useState(false);//上载费率弹框开关
    const [isModalVisibleviewBoxSizeGroup, setIsModalVisibleViewBoxSizeGroup] = useState(false);//箱型尺寸组弹框开关
    const [isModalVisibleviewFieldConfiguration, setIsModalVisibleViewFieldConfiguration] = useState(false);//字段配置弹框开关
    const [isModalVisiblePortBounced, setIsModalVisiblePortBounced] = useState(false);//港口弹框开关
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [tableData,setTableData] = useState([]);//表格的数据 
    const [tableDataViewMissing,setTableDataViewMissing] = useState([]);//缺失费率表格的数据
    const [tabTotalViewMissing,setTabTotalViewMissing] = useState([]);//缺失费率表格数据的个数
    const [tableDataUploadRate,setTableDataUploadRate] = useState([]);//上载费率表格的数据
    const [tabTotalUploadRate,setTabTotalUploadRate] = useState([]);//上载费率表格数据的个数
    const [tableDataBoxSizeGroup,setTableDataBoxSizeGroup] = useState([]);//箱型尺寸组表格的数据
    const [tabTotalBoxSizeGroup,setTabTotalBoxSizeGroup] = useState([]);//箱型尺寸组表格数据的个数
    const [boxSize,setBoxSize] = useState({});//箱型尺寸组
    const [state,setState] = useState({});//状态
    const [route,setRoute] = useState({});//航线
    const [copydata,setCopydata] = useState([])//复制的数据
    const [copyFlag,setCopyFlag] = useState(false)//复制
    const [uuid,setUuid] = useState([])//选中数据的uuid
    const [spinflag,setSpinflag] = useState(false)
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [messageData,setMessageData] = useState({})
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [focusFlag,setfocusFlag] = useState(false);//13
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    
    
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    const [boxSizePage,setBoxSizePage]= useState({current: 1, pageSize: 10})
    const [viewPage,setViewPage]= useState({current: 1, pageSize: 10})
    const [queryForm] = Form.useForm();
    const [saveEidtFlag, setSaveEidtFlag] = useState(false)
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('IBS.CNTR.GRP',setBoxSize,$apiUrl);//箱型尺寸组
        acquireSelectData('IBS.COMM.AGMT.STATUS',setState,$apiUrl);//状态
        acquireSelectData('IBS.COMM.TRADE.LANE',setRoute,$apiUrl);//航线
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        
    },[])
    useEffect(() => {
        saveEidtFlag ? pageChange(page, '', 'search') : null
    }, [saveEidtFlag])
    
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            shipownerCompanyCode:'2001',
            status:'Active'
        })
        huic()
    }, [acquireData,company,focusFlag])
    useEffect(()=>{
        uuid.length>0?setCopyFlag(false):setCopyFlag(true)
        console.log(uuid)
    },[uuid])
    const huic = ()=>{
        // console.log('focusFlag外面',focusFlag)
        document.onkeydown = function (e) { // 回车提交表单
            var theEvent = window.event || e;
            var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
            if (code == 13 && focusFlag) {
                viewMissingRates(page)
            }
        }
       
    }

    //删除
    const deleteTable = (record,flag) => {
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
                const cancel = await request($apiUrl.LCR_AGMT_DELETE_HEAD_UUID,{
                   method:'POST',
                   data:{
                       "uuid":record.lcrAgreementHeadUuid
                   }
               })
            //    console.log(cancel)
               if(cancel.success) {
                    pageChange(page);
                    setTimeout(()=>{
                        Toast('', '', '', 5000, false);
                        Toast('',cancel.message, '', 5000, false)
                    } ,1000);
                }else{
                    Toast('',cancel.errorMessage, '', 5000, false)
                }
            }
        })

        
       
    }

   
   
    //IBS表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作  
            dataIndex: 'operate',
            sorter: false,
            width: '70px',
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip  title={<FormattedMessage id='btn.delete' />}><CosButton disabled={record.status=='Active'?true:false} onClick={()=>effectiveInvalidDelete('Y',record,index)}><CloseCircleOutlined style={{color:record.status=='Active'?'#ccc':'red',fontSize: '15px'}}/> </CosButton></Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><CosButton onClick={()=> copy(record,index,true)}><FormOutlined style={{color:'#2795f5',fontSize:'15px'}}/></CosButton></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.agreement" />,//协议代码
            dataIndex: 'agreementCode',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.ac.pymt.carrier-company" />,//船东公司
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            align:'left',
            width: 100,
            
        },
        {
            title:<FormattedMessage id="lbl.argue.chargeCode" />,//费用代码
            dataIndex: 'chargeCode',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.yard" />,//堆场
            dataIndex: 'facilityCode',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            key:'AGMT_STATUS',
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.Export-Agreement-Terms" />,//出口协议条款
            dataIndex: 'termsFrom',
            sorter: false,
            key:'FM_DTE',
            width: 120,
            align:'left'
        },
        {
            title:<FormattedMessage id="lbl.Import-Agreement-Terms" /> ,//进口协议条款
            dataIndex: 'termsTo',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.route" />,//航线
            dataIndex: 'cargoTradeLaneCode',
            sorter: false,
            key:'CHECK_FAD_STATUS',
            width: 80,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.office" />,//Office
            dataIndex: 'officeCode',
            sorter: false,
            key:'REC_CHECK_FAD_USR',
            width: 80,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.Starting-time" />,//起始时间
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            sorter: false,
            key:'REC_CHECK_FAD_DTE',
            width: 120,
            align:'left'
        },
        {
            title:<FormattedMessage id="lbl.Ending-time" />,//结束时间
            dataType:'dateTime',
            dataIndex: 'toDate',
            sorter: false,
            key:'CHECK_PMD_STATUS',
            width: 80,
            align:'left',
        },
        {
            title:<FormattedMessage id="lbl.state" />,//状态
            dataType:state.values,
            dataIndex: 'status',
            sorter: false,
            key:'REC_CHECK_PMD_USR',
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.Box-size-group" />,//箱型尺寸组
            dataIndex: 'containerSizeTypeGroup',
            sorter: false,
            key:'REC_CHECK_PMD_DTE',
            width: 120,
            align:'left'
        },
        {
            title:<FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'currencyCode',
            sorter: false,
            key:'CHECK_AGENCY_STATUS',
            width: 80,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.budgetTracking.agreement-rate" />,//协议费率
            dataIndex: 'unitPrice',
            sorter: false,
            key:'REC_CHECK_AGENCY_USR',
            width: 80,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.update-by" />,//更新人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            key:'REC_CHECK_AGENCY_DTE',
            width: 120,
            align:'left'
        },
        {
            title:<FormattedMessage id="lbl.update-date" />,//更新时间
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            key:'REC_UPD_DT',
            width: 120,
            align:'left'
        }
    ]

    //表格数据
    const pageChange= async(pagination,options,search,mes) =>{
        Toast('', '', '', 5000, false);
        const query = queryForm.getFieldsValue()
        console.log(query)
        setUuid([])
        setChecked([])
        setCopyFlag(true)
        if(search){
            pagination.current=1
        }
        setSpinflag(true)
        let localsearch=await request($apiUrl.IBS_QUERY_IBS_AGMT,{
            method:"POST",
            data:{
                "page": pagination,
                "params":{
                    // "entryCode":"AFCM_B_IBS_AGMT_CR_RTE",
                        ...query,
                        Date:undefined,
                        port:undefined,
                        // agreementCode:ni,
                        'fromDate':query.Date?momentFormat(query.Date[0]):null,
                        'toDate':query.Date?momentFormat(query.Date[1]):null,
                        'deleteIndicator':'N'
                },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            setSpinflag(false)
            let data=localsearch.data
            let datas=localsearch.data.resultList
            setPage({...pagination})
            setTableData([...datas])
            setTabTotal(data.totalCount)
            // setCopyShow(false)
            Toast('', mes, '', 5000, false);
        }else{
            setTableData([])
            setSpinflag(false)
            mes?Toast('', mes, '', 5000, false):Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
        } 
    }
     
    
   const setSelectedRows = (val) =>{
        setCopyFlag(true)
        console.log(val)
        setUuid([...val])
        // val?val.map((v,i)=>{
        //     // console.log(v.ibsAgreementUuid)
        //     setUuid([v.ibsAgreementUuid])
        // }):null
   }
   
    //查看缺失费率
    const viewMissingRates = async(pagination) =>{
        Toast('', '', '', 5000, false);
        setIsModalVisibleViewMissingRates(true)
        setSpinflag(true)
        let localsearch=await request($apiUrl.IBS_SEARCH_ERRORLOG,{
            method:"POST",
            data:{
                "page": pagination,
                // "params":{
                //     "entryCode":"AFCM_COMM_CALC_ERR_LOG",
                //     "errorCode":"IBS",
                //     "note":"未匹配到IBS箱量法协议"
                // },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            let data=localsearch.data
            let datas=localsearch.data.resultList
            datas.map((v,i)=>{
                v['id'] = i
            })
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            setPage({...pagination})
            setTableDataViewMissing([...datas])
            setTabTotalViewMissing(data.totalCount)
            setSpinflag(false)
        }else{
            setTableDataViewMissing([])
            setSpinflag(false)
        }  
    } 
    const viewMissingRatesdata ={
        isModalVisibleviewMissingRates,
        setIsModalVisibleViewMissingRates,
        setTableDataViewMissing,
        tableDataViewMissing,
        tabTotalViewMissing,
        setTableDataViewMissing,
        setTabTotalViewMissing,
        messageData,
        setMessageData,
        setfocusFlag
    }
    //上载费率
    const uploadRate = async(pagination) => {
        Toast('', '', '', 5000, false);
        setIsModalVisibleViewUploadRate(true)
    }
    const uploadRateData = {
        isModalVisibleviewUploadRate,
        setIsModalVisibleViewUploadRate,
        messageData,
        tableDataUploadRate,
        setMessageData,
        tabTotalUploadRate,
        setTableDataUploadRate,
        setTabTotalUploadRate
    }
 
    //箱型尺寸组
    const boxSizeGroup = async(pagination) =>{
        setMessageData({})
        Toast('', '', '', 5000, false);
        setIsModalVisibleViewBoxSizeGroup(true)
        setSpinflag(true)
        let localsearch=await request($apiUrl.IBS_CONFIG_SEARCH_LIST,{
            method:"POST",
            data:{
                // "page": pagination,
                "params":{
                    "entryCode":"AFCM_B_IBS_CNTR_GRP",
                },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            setSpinflag(false)
            let data=localsearch.data
            let datas=localsearch.data.resultList
            if(pagination.pageSize!=boxSizePage.pageSize){
                pagination.current=1
            }
            // setBoxSizePage({...pagination})
            setTableDataBoxSizeGroup([...datas])
            // setTabTotalBoxSizeGroup(data.totalCount)
            setSpinflag(false)
            localsearch.errorMessage?setMessageData({alertStatus:'alert-success',message:localsearch.message}):null
        }else{
            setSpinflag(false)
            setTableDataBoxSizeGroup([])
            setSpinflag(false)
            localsearch.errorMessage?setMessageData({alertStatus:'alert-error',message:localsearch.errorMessage}):null
        }  
    }
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisibleViewBoxSizeGroup(false);   // 关闭弹窗
    }

    //箱型尺寸组表格文本
    const boxSizeGroupColums=[
        {
            title: <FormattedMessage id="lbl.seq" />,//序号  
            dataIndex: 'ibsContainerSizeUuid',
            sorter: false,
            width: 20,
            align:'left',
            fixed: true,
        },
        {
            title: <FormattedMessage id="lbl.Box-size" />,//箱型尺寸
            dataIndex: 'containerSizeType',
            sorter: false,
            align:'left',
            width: 30,
        },
        {
            title:<FormattedMessage id="lbl.Box-size-group" />,//箱型尺寸组
            dataIndex: 'containerSizeTypeGroup',
            sorter: false,
            align:'left',
            width: 30,
            
        }
    ]

    //字段配置
    const fieldConfiguration = () =>{
        Toast('', '', '', 5000, false);
        setIsModalVisibleViewFieldConfiguration(true)
    }
    const fieldConfigurationData = {
        isModalVisibleviewFieldConfiguration, 
        setIsModalVisibleViewFieldConfiguration,
    }

    //生效/失效/删除
    const effectiveInvalidDelete = async(operateType,record,index) =>{
        Toast('', '', '', 5000, false);
        console.log(operateType)
        let detelUuid = []
            console.log(uuid)
            uuid?uuid.map((v,i)=>{
                return detelUuid.push(v.ibsAgreementUuid)
            }):''
            console.log(detelUuid)
        if(operateType != 'Y'){
            const confirmModal = confirm({
                title: formatMessage({id: operateType=='Active'?'lbl.Confirmation-effectiveness':operateType=='Inactive'?'lbl.Confirmation-failure':null}),
                // content: formatMessage({id: 'lbl.Confirm-whether-the-invoice-is-generated'}),
                okText: formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async  onOk() {
                    confirmModal.destroy()
                    setSpinflag(true)
                    let localsearch=await request($apiUrl.IBS_DELETEIBSCREDITROTE,{
                        method:"POST",
                        data:{
                            "operateType": operateType,
                            "uuids": detelUuid
                        }
                    })
                    console.log(localsearch)
                    if(localsearch.success){
                        setSpinflag(false)
                        // Toast('', localsearch.message, '', 5000, false);
                        pageChange(page, '', 'search',localsearch.message)
                    }else{
                        setSpinflag(false)
                        Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
                    }
                }
            }) 
        }else{
            //删除
            const confirmModal = confirm({
                title: formatMessage({id:'lbl.delete'}),
                content: formatMessage({id: 'lbl.Confirm-deletion'}),
                okText: formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    let localsearch=await request($apiUrl.IBS_DELETEIBSCREDITROTE,{
                        method:"POST",
                        data:{
                            "operateType": operateType,
                            "uuids": record?[record.ibsAgreementUuid]:detelUuid
                        }
                    })
                    console.log(localsearch)
                    if(localsearch.success){
                        // Toast('', localsearch.message, '', 5000, false);
                        pageChange(page,'','',localsearch.message)
                    }else{
                        Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
                    }
                }
            })
        }
       
       
        
    }
    const [editFlag,setEditFlag] = useState(false)
    //复制弹框
    const copy = async(record,r,flag) =>{
        Toast('', '', '', 5000, false);
        console.log(copydata.agreementCode)
        const data = uuid[0]
        console.log(data)
        // if(){
            let localsearch=await request($apiUrl.CONFIG_DETAIL,{
                method:"POST",
                data:{
                    "params": {
                        "entryCode":"AFCM_B_IBS_AGMT_CR_RTE"  
                    },
                    "uuid":record?record.ibsAgreementUuid:data.ibsAgreementUuid
                }
            })
            console.log(localsearch)
            if(localsearch.success){
                let data = localsearch.data
                console.log(flag)
                if(flag){
                    setEditFlag(true)
                }else{
                    setEditFlag(false)
                }
                setIsModalVisibleCopy(true)
                setCopydata(data) 
                
            }else{
                Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
            } 
        // }
        
        
    }
    //复制弹框传的参数
    const copydatas={
        isModalVisiblecopy,//控制弹框开关
        copydata,//复制的数据
        uuid,
        setIsModalVisibleCopy,
        route,
        acquireData,
        editFlag,
        setSaveEidtFlag
    } 
    const download = async()=>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        setSpinflag(true)
        let downData = await request($apiUrl.IBS_IBS_AGMT_EXP,{
            method:"POST",
            data:{
                "params":{
                    // entryCode:'AFCM_B_IBS_AGMT_CR_RTE',
                    ...query,
                    Date:undefined,
                    port:undefined,
                    'fromDate':query.Date?momentFormat(query.Date[0]):null,
                    'toDate':query.Date?momentFormat(query.Date[1]):null,
                    'deleteIndicator':'N'
                },
                'excelFileName':formatMessage({id:'menu.afcm.agreement.local-charge.IBS-return-commission-agreement'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agreementCode: formatMessage({id:"lbl.agreement" }),
                        shipownerCompanyCode: formatMessage({id:"lbl.ac.pymt.carrier-company" }),
                        chargeCode: formatMessage({id:"lbl.argue.chargeCode" }),
                        facilityCode: formatMessage({id:"lbl.yard" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        termsFrom: formatMessage({id:"lbl.Export-Agreement-Terms" }),
                        termsTo: formatMessage({id:"lbl.Import-Agreement-Terms" }),
                        cargoTradeLaneCode: formatMessage({id:"lbl.route" }),
                        officeCode: formatMessage({id:"lbl.office" }),
                        fromDate: formatMessage({id:"lbl.Starting-time" }),
                        toDate: formatMessage({id:"lbl.Ending-time" }),
                        status: formatMessage({id:"lbl.state" }),
                        containerSizeTypeGroup: formatMessage({id:"lbl.Box-size-group" }),
                        currencyCode: formatMessage({id:"lbl.ccy" }),
                        unitPrice: formatMessage({id:"lbl.budgetTracking.agreement-rate" }),
                        recordUpdateUser: formatMessage({id:"lbl.update-by" }),
                        recordUpdateDatetime: formatMessage({id:"lbl.update-date" }),

                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agreement.local-charge.IBS-return-commission-agreement'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agreement.local-charge.IBS-return-commission-agreement'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agreement.local-charge.IBS-return-commission-agreement'})+'.xlsx'; // 下载后文件名
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
        queryForm.resetFields()
        queryForm.setFieldsValue({
            shipownerCompanyCode:'2001',
            status:'Active'
        })
        setUuid([])
        setCopyFlag(false)
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
                        {/* 船东公司 */}
                        <Select name='shipownerCompanyCode' label={<FormattedMessage id='lbl.ac.pymt.carrier-company'/>} onkeydown={false} span={6} options={acquireData.values} disabled /> 
                        {/* 协议代码 */}
                        <InputArea name='agreementCode' label={<FormattedMessage id='lbl.agreement'/>} span={6} onkeydown={false} />      
                        {/* 堆场 */}
                        <InputArea name='facilityCode' label={<FormattedMessage id='lbl.yard'/>} span={6} onkeydown={false}/>  
                        {/* 航线 */}
                        <Select name='cargoTradeLaneCode' flag={true} label={<FormattedMessage id='lbl.route'/>}  span={6} options={route.values} onkeydown={false} />
                        {/* 箱型尺寸组 */}
                        <Select name='containerSizeTypeGroup' flag={true} label={<FormattedMessage id='lbl.Box-size-group'/>}  span={6} options={boxSize.values} onkeydown={false} />  
                        {/* 状态 */}
                        <Select name='status' label={<FormattedMessage id='lbl.state'/>} span={6} options={state.values} onkeydown={false}/> 
                        {/* 费用代码 */}
                        <InputText name='chargeCode' label={<FormattedMessage id='lbl.argue.chargeCode'/>} span={6} onkeydown={false}/> 
                        {/* 港口 */}
                        <SelectSearch setfocusFlag={setfocusFlag} name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6} queryForm={queryForm}/>
                        {/* <SelectSearch name='portCode' label={<FormattedMessage id='lbl.port'/>} span={6} queryForm={queryForm} /> */}
                        {/* 进口协议条款 */}
                        <InputText name='termsTo' label={<FormattedMessage id='lbl.Import-Agreement-Terms'/>} span={6} onkeydown={false}/> 
                        {/* 出口协议条款 */}
                        <InputText name='termsFrom' label={<FormattedMessage id='lbl.Export-Agreement-Terms'/>} span={6} onkeydown={false}/> 
                        {/* 协议有效日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='Date' label={<FormattedMessage id='lbl.Agreement-Effective-Date'/>} onkeydown={false}  />      
                    </Row>
                </Form> 
                {/* 基本查询条件 */}
                <div className='query-condition' style={{width: '13%'}}>
                    <Button type="primary"><FormattedMessage id='lbl.Basic-Query-Conditions'/></Button> 
                    {/* <span onClick={()=>{fieldConfiguration()} }> <MyIcon type="icon-wj-szsm" style={{color:'#2795f5',marginLeft: '8px'}} /></span>   */}
                </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 查看缺失费率 */}
                    <CosButton onClick={() => viewMissingRates(page)}><FileSearchOutlined /><FormattedMessage id='lbl.View-Missing-Rates'/></CosButton>
                    {/* 上载费率 */}
                    <CosButton onClick={() => uploadRate(page)}><CloudUploadOutlined /><FormattedMessage id='lbl.uploadRate'/></CosButton>
                    {/* 箱型尺寸组 */}
                    <CosButton onClick={() => boxSizeGroup(boxSizePage)}><FileDoneOutlined /> <FormattedMessage id='lbl.Box-size-group'/></CosButton>
                    {/* 复制 */}
                    <CosButton onClick={() => copy('','',false)} disabled={uuid.length==1?false:true} ><CopyOutlined /><FormattedMessage id='lbl.copy'/></CosButton>
                    {/* 生效 */}
                    <CosButton onClick={() => effectiveInvalidDelete('Active')} disabled={copyFlag} >  <MyIcon type="icon-shengxiao" /><FormattedMessage id='lbl.Take-effect'/></CosButton>
                    {/* 失效 */}
                    <CosButton onClick={() => effectiveInvalidDelete('Inactive')} disabled={copyFlag} ><MyIcon type="icon-shixiao" /><FormattedMessage id='lbl.Invalid'/></CosButton>
                    {/* 删除 */}
                    <CosButton onClick={() => effectiveInvalidDelete('Y')} disabled={copyFlag} ><CloseCircleOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 导出Excel */}
                    <Button onClick={download}><CaretDownOutlined /><FormattedMessage id='lbl.derive-Excel' /></Button>
                    {/* 清空 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='lbl.empty' /></Button>
                    {/* 查询按钮 */}
                    <Button  onClick={() => pageChange(page,'','search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='ibsAgreementUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    // setSelectedRows={setSelectedRows}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setCheckedRow(row);
                            setSelectedRows(row);
                        }
                    }}
                />
            </div>
            <Loading spinning={spinflag}/>
            <ViewMissingRates viewMissingRatesdata={viewMissingRatesdata} />
            <UploadRate uploadRateData={uploadRateData} />
            <IBSCommissionAgreementtEdit copydatas={copydatas} />
            <FieldConfiguration fieldConfigurationData={fieldConfigurationData}/>
            {/* 箱型尺寸组 */}
            <CosModal cbsDragCls='modal-drag-agg' cbsMoveCls='drag-move-agg' cbsTitle={<FormattedMessage id='lbl.View-the-box-size-group' />} cbsVisible={isModalVisibleviewBoxSizeGroup} footer={null} cbsWidth="40%" cbsFun={() => handleCancel()}>
                <CosToast toast={messageData}/>
                <div style={{minWidth:'300px',width:'40%'}}>
                    <PaginationTable
                    dataSource={tableDataBoxSizeGroup}
                    columns={boxSizeGroupColums}
                    rowKey='lcrAgreementHeadUuid'
                    scrollHeightMinus={200}
                    pagination={false}
                    rowSelection={null}
                />
                </div>
                
            </CosModal>
        </div>
    )
}

export default Index;