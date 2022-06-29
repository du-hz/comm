import React, { useState,useEffect, $apiUrl,createContext ,useContext } from 'react'
import {FormattedMessage, formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import AddModifcation from './localChargeAgmtEdit'
import LocalChargeCopy from './localChargeAgmtDetail'
import request from '@/utils/request';
import SelectVal from '@/components/Common/Select';
import { acquireSelectData, momentFormat, acquireSelectDataExtend, agencyCodeData,dictionary,companyAgency,TimesFun} from '@/utils/commonDataInterface';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tooltip,Modal, Alert} from 'antd'
import LogPopUp from '../../commissions/agmt/LogPopUp'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import { CosDownLoadBtn } from '@/components/Common/index'
import CosRedio from '@/components/Common/CosRedio'
import CosIcon from '@/components/Common/CosIcon'
import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    SearchOutlined,//查询
    FileAddOutlined,//新增
    CopyOutlined,//复制
    FileDoneOutlined,//提交审核
    CloudDownloadOutlined,//下载
    ReadOutlined,//日志
    ReloadOutlined,//重置
    UnlockOutlined,
    InfoCircleOutlined
} from '@ant-design/icons'
export const NumContext = createContext();

const confirm = Modal.confirm

const Index =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [checkStatus,setCheckStatus] = useState({});//审核状态
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
        "companyCode": null,
        "agreementStatus": null,
        "agencyCode": null,
        "agencyName": null,
        'fromDate':null,
        'toDate':null
    });
   

    const [lastConditions, setLastConditions] = useState({});
    const [AgencyFeeIsModalVisible, setAgencyFeeIsModalVisible] = useState(false);//新增编辑弹框开关
    const [isModalVisiblecopy, setIsModalVisibleCopy] = useState(false);//弹框开关
    const [tabData,setTabData] = useState([]);//编辑的数据
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [tableData,setTableData] = useState([]);//表格的数据
    const [toData,setToData] = useState();//弹框的结束时间
    const [editShowHide,setEditShowHide]= useState(false);//编辑数据的执行条件
    const [AgencyFeeflag,setAgencyFeeflag] = useState(true);//查看详情禁用
    const [copydata,setCopydata] = useState({})//复制的数据
    const [copyShow,setCopyShow] = useState(false)//复制
    const [copyflag,setCopyFlag] = useState(true)//复制按钮是否可用
    const [adddatas,setAddDatas] = useState([])//新增数据
    const [dataFlag,setDataFlag] = useState(false)
    const [flags,setflags] = useState (false)//判断新增item是否禁用
    const [isModalVisibleLog,setIsModalVisibleLog] = useState (false) //控制日志弹框显示
    const [spinflag,setSpinflag] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [title, setTitle] = useState('');
    const [formDatas,setFromDatas] = useState([])
    const [shipperFlag,setShipperFlag] = useState(false)//船东禁用
    const [buttonFlag,setButtonFlag] = useState(false)
    const [unlockAuditFlag,setUnlockAuditFlag]=useState(false)
    const [valuesAgreement,setValuesAgreement] = useState(true)
    const [kouanFlag , setKouanFlag] = useState(true)
    const [valueAgreement,setValueAgreement] = useState()
    const [wdFlag , setwdFlag] = useState(true)
    const titTooltip = <span style={{color:'#000'}}><FormattedMessage id='lbl.messT' /></span>
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

   
    //初始化下拉框数据
    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectDataExtend('COMMON_DICT_ITEM','AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectData('AFCM.AGMT.CHECK.STATUS', setCheckStatus, $apiUrl);// 审核状态
        companys()
    },[])

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [companyData, setCompanyData] = useState('')
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            companyCode:companysData.length>0?companyData:'',
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        // console.log(companysData)
        companyAgency($apiUrl,companyData,setAgencyCode)
    }, [company, acquireData,companyData])
    
    useEffect(()=>{
        unlockAuditFlag?pageChange(page,'','search'):null
    },[unlockAuditFlag])
    
    //公司
    const companys = async() =>{
        Toast('', '', '', 5000, false);
        // setCompanysData([])
        setCompanyData('')
        await request.post($apiUrl.LCR_AGMT_SEARCH_INIT)
        .then((resul) => {
            if(!resul.data)return
            var data = resul.data.companys;
            data?data.map((val, idx)=> {
                val['value'] = val.companyCode ;
                val['label'] = val.companyCode + '-' + val.companyNameCn;
            }):''
            data?setCompanysData(data):null;
        })
        
        let company = await request($apiUrl.CURRENTUSER,{
            method:"POST",
            data:{}
        })
        console.log(company)
        if(company.success){
            setCompanyData(company.data.companyCode)
            if(company.data.companyType==0||company.data.companyType==1){
                if(company.data.companyType==0){
                    setwdFlag(true)
                }else{
                    setwdFlag(false)
                }
                setValuesAgreement(true)
                setKouanFlag(false)
                queryForm.setFieldsValue({
                    'agreementType':1
                })
                setValueAgreement(1)
            }else{
                setwdFlag(false)
                setKouanFlag(true)
                setValuesAgreement(false)
                queryForm.setFieldsValue({
                    'agreementType':2
                })
                setValueAgreement(2)
            }
        }
    }
    //公司和代理编码的联动
    const  companyIncident = async (value,all) => {
        if(all){
            queryForm.setFieldsValue({
                // agencyCode:all.linkage.sapCustomerCode,
            })
            let data = all.linkage.companyCode
            companyAgency($apiUrl,data,setAgencyCode)
        }else{
            queryForm.setFieldsValue({
                agencyCode:'',
            })
        }
    }
    //localcharge表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作  
            dataIndex: 'operate',
            sorter: false,
            width: '90px',
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除  */}
                    <Tooltip  title={<FormattedMessage id='btn.delete' />}>
                        <a><CosButton auth='AFCM_AGMT_LOC_001_B04' onClick={()=>deleteTable(record,index)} disabled={record.show?false:true}><CloseCircleOutlined style={{color:record.show?'red':'#ccc',fontSize: '15px'}}  /> </CosButton></a>
                    </Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={record.agreementStatus=='D'?<FormattedMessage id='btn.edit' />:record.agreementStatus=='W'?<FormattedMessage id='lbl.audit' />:<FormattedMessage id='lbl.unlock' />} style={{display:'none'}}><a><CosButton onClick={()=>addcopy(record,index,true)}  >{record.agreementStatus=='D'?<FormOutlined style={{color:'#2795f5',fontSize: '15px'}} />:record.agreementStatus=='U'?<UnlockOutlined style={{color:'#2795f5',fontSize: '15px'}}/>:<CosIcon type={'icon-dunpai'} style={{color:'#2795f5',fontSize: '15px'}} />}</CosButton></a></Tooltip>
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a><CosButton onClick={()=>addcopy(record,index,true)} ><FormOutlined style={{color:'#2795f5',fontSize: '15px'}}/></CosButton></a></Tooltip> */}
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a><CosButton onClick={()=>addcopy(record,index,false)}><FileSearchOutlined style={{color:'#2795f5',fontSize: '15px'}}/></CosButton></a></Tooltip>
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}><a><CosButton onClick={() => journal(record) }><ReadOutlined style={{color:'#2795f5',fontSize: '15px'}}/></CosButton></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号
            dataIndex: 'commissionAgreementCode',
            key:'COMM_AGMT_CDE',
            sorter: true,
            align:'left',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.carrier'/>,//船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 120
        },
        {
            title:<FormattedMessage id="lbl.company-code" />,//公司代码
            dataIndex: 'companyCode',
            key:'COMPANY_CDE',
            sorter: true,
            align:'left',
            width: 100,
            
        },
        {
            title:<FormattedMessage id="lbl.company-abbreviation" />,//公司简称
            dataIndex: 'commpanyNameAbbr',
            sorter: true,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: true,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataType:protocolStateData.values,
            dataIndex: 'agreementStatus',
            sorter: true,
            key:'AGMT_STATUS',
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            sorter: true,
            key:'FM_DTE',
            width: 120,
            align:'left'
        },
        {
            title:<FormattedMessage id="lbl.over-date" /> ,//结束日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            sorter: true,
            key:'TO_DTE',
            width: 120,
            align:'left'
        },
        valuesAgreement ? {
            title: <FormattedMessage id="lbl.fad-audit-status" />,//FAD审核状态
            dataType:checkStatus.values,
            dataIndex: 'checkFadStatus',
            sorter: true,
            key:'CHECK_FAD_STATUS',
            width: 80,
            align:'left',
            
        }:null,
        valuesAgreement ? {
            title: <FormattedMessage id="lbl.fad-audit-person" />,//FAD审核人
            dataIndex: 'recordCheckFadUser',
            sorter: true,
            key:'REC_CHECK_FAD_USR',
            width: 80,
            align:'left', 
        }:null,
        valuesAgreement ? {
            title:<FormattedMessage id="lbl.fad-verify-date" />,//FAD审核日期
            dataIndex: 'recordCheckFadDate',
            sorter: true,
            key:'REC_CHECK_FAD_DTE',
            width: 120,
            align:'left'
        }:null,
        {
            title:valuesAgreement?<FormattedMessage id="lbl.pmd-audit-status" />:<FormattedMessage id="lbl.afcm-comm-01" />,//PMD审核状态、口岸审核状态
            dataType:checkStatus.values,
            dataIndex: 'checkPmdStatus',
            sorter: true,
            key:'CHECK_PMD_STATUS',
            width: 80,
            align:'left',
        },
        {
            title:valuesAgreement?<FormattedMessage id="lbl.afcm-comm-05" />:<FormattedMessage id="lbl.afcm-comm-02" />,//PMD审核人、口岸审核人
            dataIndex: 'recordCheckPmdUser',
            sorter: true,
            key:'REC_CHECK_PMD_USR',
            width: 80,
            align:'left', 
        },
        {
            title: valuesAgreement?<FormattedMessage id="lbl.afcm-comm-06" />:<FormattedMessage id="lbl.afcm-comm-03" />,//PMD审核日期、口岸审核日期
            dataIndex: 'recordCheckPmdDate',
            sorter: true,
            key:'REC_CHECK_PMD_DTE',
            width: 120,
            align:'left'
        },
        {
            title:valuesAgreement?<FormattedMessage id="lbl.afcm-comm-01" />:<FormattedMessage id="lbl.branch-audit-state" />,//口岸审核状态   网点审核状态
            dataType:checkStatus.values,
            dataIndex: 'checkAgencyStatus',
            sorter: true,
            key:'CHECK_AGENCY_STATUS',
            width: 80,
            align:'left', 
        },
        {
            title: valuesAgreement?<FormattedMessage id="lbl.afcm-comm-02" />:<FormattedMessage id="lbl.branch-audit-person" />,//口岸审核人  网点审核人
            dataIndex: 'recordCheckAgencyUser',
            sorter: true,
            key:'REC_CHECK_AGENCY_USR',
            width: 80,
            align:'left', 
        },
        {
            title:valuesAgreement?<FormattedMessage id="lbl.afcm-comm-03" />:<FormattedMessage id="lbl.branch-audit-date" />,//口岸审核日期  网点审核日期
   
            dataIndex: 'recordCheckAgencyDate',
            sorter: true,
            key:'REC_CHECK_AGENCY_DTE',
            width: 120,
            align:'left'
        },
        {
            title: <FormattedMessage id='lbl.Protocol-group-number' />,//协议组编号
            dataIndex: 'groupAgreementCode',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.create-by'/>,//创建人
            dataIndex: 'recordCreateUser',
            align:'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.create-date" />,//创建日期
            // dataType: 'dateTime',
            dataIndex: 'recordCreateDatetime',
            sorter: true,
            width: 120,
            align:'left',
            key:'REC_UPD_DTE'
        },
        {
            title:<FormattedMessage id="lbl.modifier" />,//修改人
            dataIndex: 'recordUpdateUser',
            sorter: true,
            key:'REC_UPD_USR',
            width: 80,
            align:'left',  
        },
        {
            title:<FormattedMessage id="lbl.modification-date" />,//修改日期
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            sorter: true,
            key:'REC_UPD_DT',
            width: 120,
            align:'left'
        },
    ]

    //表格数据  DESC降序  ASC升序
    const pageChange= async(pagination,options,search,mes) =>{
        Toast('', '', '', 5000, false);
        const query = queryForm.getFieldsValue()
        setChecked([])
        setCopydata([])
        console.log(query)
        if(search){
            pagination.current=1
        }
        let sorter
        if(!options){
        }else{
            if(options&&options.sorter.order){
                sorter={
                    "field": options.sorter.columnKey,
                    "order":options.sorter.order==="ascend"? 'ASC' :options.sorter.order==="descend"?'DESC':undefined
                }
            }   
        }
        // if((queryForm.getFieldValue().fromDate&&!queryForm.getFieldValue().toDate)||(!queryForm.getFieldValue().fromDate&&queryForm.getFieldValue().toDate)){
        //     Toast('',formatMessage({id:'Tdate-null'}), 'alert-error', 5000, false)
        // }else {
            setSpinflag(true)
            valueAgreement==1? setValuesAgreement(true):valueAgreement==2?setValuesAgreement(false):''
            let localsearch=await request($apiUrl.LCR_AGMT_SEARCH_PRE_HEAD_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params":{
                        ...query,
                        Date:undefined,
                        'companyCode':query.companyCode,
                        'fromDate':query.Date?momentFormat(query.Date[0]):null,
                        'toDate':query.Date?momentFormat(query.Date[1]):null,
                        'agreementType':valueAgreement==1?'KA':valueAgreement==2?'WD':''
                    },
                    'sorter':sorter
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
                    v['id']=i
                })
                setPage({...pagination})
                setTableData([...datas])
                setTabTotal(data.totalCount)
                dictionary(datas,setTableData,protocolStateData.values)
                setCopyShow(false)
                setSpinflag(false)
                mes?Toast('', mes, '', 5000, false):null
            }else{
                mes?Toast('', mes, '', 5000, false):Toast('', localsearch.errorMessage, 'alert-error', 5000, false);
                setTableData([])
                setSpinflag(false)
            }
        // }
    }
    

     // 日志
    const journal = async(record) => {
        setIsModalVisibleLog(true);
        console.log(record)
        const result = await request($apiUrl.AFMT_PRE_LIST,       
            {
                method:'POST',
                data: {
                    params: {
                        referenceType: "LCR_AGMT",
                        referenceUuid: record.lcrAgreementHeadUuid
                    }
                    
                }
            }
        )
        console.log(result.data);
        console.log(result);
        if(result.success) {
            setJournalData(result.data)
        }
    }

     //日志父传子的值
     const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
		setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }
     //删除
     const deleteTable = (record,flag) => {
        Toast('', '', '', 5000, false);
        console.log(record)
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
               if(cancel.success) {
                    pageChange(page,'','',cancel.message);
                    // Toast('', cancel.message, '', 5000, false);
                }else{
                    Toast('', cancel.errorMessage, 'alert-error', 5000, false);
                }
            }
        })

        
       
    }
   

    const [compyFlag,setCompyFlag] = useState(false)
     //弹框
    const addcopy = async(record,index,flagss) => {
        Toast('', '', '', 5000, false);
        if(index===undefined){
            setAgencyFeeIsModalVisible(true)
            setDataFlag(true)
            setAgencyFeeflag(true)
            
            if(!flagss){
            }
            setTitle(<FormattedMessage id='btn.add' />);
            let adddata= await request($apiUrl.LCR_AGMT_SEARCH_PRE_NEW_INIT,{
                method:"POST",
                data:{}
            })
            if(adddata.success){
                let data=adddata.data
                //结束时间
                setCompyFlag(true)
                let addtodate=adddata.data.toDate
                setAgencyFeeIsModalVisible(true)
                setAddDatas(adddata.data)
                setFromDatas(data)
                setToData(addtodate)
                let shipper =company.companyType == 0 ? true : false
                setShipperFlag(shipper)
                setButtonFlag(false)
            }
            
        }else{
            //编辑接口数据
            setDataFlag(false)
            setSpinflag(true)
            let copy = await request($apiUrl.LCR_AGMT_SEARCH_PRE_HEAD_DETAIL,{
                method:"POST",
                data:{
                    params:record.commissionAgreementCode,
                    'operateType': record.agreementStatus=='U'&&flagss?"UNLOCK":''
            }
            }) 
            if(copy.success){
                let data=copy.data
                console.log(data)
                setFromDatas(data)
                setAgencyFeeIsModalVisible(true)
                setSpinflag(false)
                data.localChargeAgmtItems.map((v,i)=>{
                    v.saveShowHide=false
                })
                data.id=data.length+1
                setCompyFlag(false)
                if(flagss){
                    setAgencyFeeflag(record.show)
                    setflags(record.show)//新增item
                    setTitle(<FormattedMessage id='lbl.edit' />) 
                    // let shipper =company.companyType == 0 ? true : false
                    setShipperFlag(true)
                    setButtonFlag(false)
                    setUnlockAuditFlag(false)
                }else{
                    setShipperFlag(true)
                    setAgencyFeeflag(false)
                    setflags(false)//新增item
                    setTitle(<FormattedMessage id='lbl.ViewDetails' />)
                    setButtonFlag(true)
                }
                setTabData(data)
                Toast('', copy.message, '', 5000, false);
            }else{
                setSpinflag(false)
                Toast('', copy.errorMessage, 'alert-error', 5000, false);
            }
            
        }   
    }

    //复制弹框传的参数
    const copydatas={
        isModalVisiblecopy,//控制弹框开关
        companysData,//公司数据
        copydata,//复制的数据
        page,//表格分页显示数据
        lastConditions,//初始化表单数据
        copyShow,
        setCopyShow,
        setTableData,
        setTabTotal,
        setIsModalVisibleCopy,
        setCopydata,
        copyUrl:'AFMT_COPY_SAVE',
        setUnlockAuditFlag,
        setCopyFlag,
        setUnlockAuditFlag,
    } 

    //复制弹框
    const copy = () =>{
        Toast('', '', '', 5000, false);
        setIsModalVisibleCopy(true)
        setCopyShow(false)
        console.log(isModalVisiblecopy)
    }
    const [headData,setHeadData] = useState([])
    const [auditFlag,setAuditFlag] = useState(true)
    //单击获取表格数据
   const setSelectedRows = (val) =>{
        setHeadData([])
        console.log(val)
        const query = queryForm.getFieldsValue()
        let str = query ? query.companyCode : '';
        let we = str ? str.substring(0, str.indexOf('-')) : null;
        setCopyShow(true)
        
        if(val.length!=1){//复制是否禁用
            setCopyFlag(true)
        }else{
            console.log(val[0].toDate)
            if(val[0].agreementStatus=='U' && val[0].toDate == '9999-12-31 00:00:00'){
                setCopyFlag(false)
            }else{
                setCopyFlag(true)
            }
        }
        val.length>0?val.map((v,i)=>{
            // console.log(v.agreementStatus=='U'||v.authSave==false)
            if(v.agreementStatus=='D'){
                setAuditFlag(false)
            }else{
                setAuditFlag(true)
            }
        }):setAuditFlag(true)
        setHeadData(val)
        
        let valLength = val.length
        console.log(valLength,val.length)
        if(val.length==0){
            setHeadData([])
        }else{
            headData.push(query)
            if(headData.length!=val.length){
                headData[val.length]=undefined
                headData[val.length+1]=undefined
                // setHeadData([])
                // console.log(headData,headData[val.length]=undefined,headData[val.length+1]=undefined)
            }else{
                for(var i=0;i<val.length;i++){
                    console.log(val)
                    console.log(i,headData.length)
                    for(var j=0;j<headData.length;j++){
                        if(i == j){
                            headData[j]['shipownerCompanyCode'] =  val[0].shipownerCompanyCode
                            console.log(val[0].shipperOwner)
                            // console.log('shipownerCompanyCode',headData[j].shipownerCompanyCode,'shipperOwner',val[i].shipperOwner)
                            headData[j]['agreementType'] =  val[i].agreementType
                            headData[j].companyCode =  val[i].companyCode
                            headData[j].commissionAgreementCode =  val[i].commissionAgreementCode
                            headData[j].agencyCode =  val[i].agencyCode
                            // +' 00:00:00'
                            headData[j]['fromDate'] = val[i].fromDate 
                            headData[j]['toDate'] =  val[i].toDate
                            headData[j]['lcrAgreementHeadUuid'] = val[i].lcrAgreementHeadUuid
                            headData[j]['localChargeAgmtItems'] = []
                        }
                    }
                }
                console.log(headData)
                setHeadData([...headData])
            }
           
        }
        setCopydata(val)
        setLastConditions(queryForm.getFieldValue())
   }
   //提交审核
   const audit = async () =>{
        Toast('', '', '', 5000, false);
        console.log(headData)
        let data = []
        // headData.map((v,i)=>{
        //     console.log(v.Date)
        //     return data = v.Date
        // })
        let audits= await request($apiUrl.LCR_AGMT_SEARCH_PRE_ASVE_SUBMIT,{
            method:'POST',
            data:{
            "paramsList":[...headData],
            "operateType":'SUBMIT' //处理模式
            }
        })
        console.log(audits)
        if(audits.success){
            setAuditFlag(true)
            // Toast('', audits.message, '', 5000, false);
            pageChange(page,'','',audits.message)
        }else{
            Toast('', audits.errorMessage, 'alert-error', 5000, false);
        }
    }
    const LocalInitData = {
        AgencyFeeIsModalVisible,//弹框显示
        tabData,//编辑数据
        toData,//结束时间
        AgencyFeeflag,
        adddatas,
        dataFlag,
        flags,
        setflags,
        setDataFlag,
        setAgencyFeeIsModalVisible,
        setEditShowHide,
        setTabData,
        setAddDatas,
        title,
        formDatas,
        shipperFlag,
        companyData,
        company,
        buttonFlag,
        setButtonFlag,
        setUnlockAuditFlag,
        compyFlag,
        setCompyFlag
    }
    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        setSpinflag(true)
        let uuid = copydata[0].commissionAgreementCode
        let downData = await request($apiUrl.LCR_AGMT_EXP_HEAD_DETAIL,{
            method:"POST",
            data:{
                "params":uuid,
                'excelFileName':formatMessage({id:'menu.afcm.agreement.local-charge.local-charge-agreement'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            companyCode: formatMessage({id:"lbl.company" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            agreementType: formatMessage({id:"lbl.protocol-type" }),
                            fromDate: formatMessage({id:"lbl.agreement" }),
                            toDate: formatMessage({id:"lbl.valid-date" }),
                        },
                        sumCol: {//汇总字段
                        },
                        'sheetName':formatMessage({id:'lbl.afcm-0033'}),
                    },
                    {
                        dataCol: {//列表字段
                            commissionAgreementCode: formatMessage({id:"lbl.protocol" }),
                            cargoTradeLaneCode: formatMessage({id:"lbl.Trade-line" }),
                            chargeCode: formatMessage({id:"lbl.charge-code" }),
                            outBoundInboundIndicator: formatMessage({id:"lbl.bound-sign" }),
                            officeCode: formatMessage({id:"lbl.office" }),
                            commissionAgreementCode: formatMessage({id:"lbl.protocol" }),
                            refundRate: formatMessage({id:"lbl.return-the-proportion" }),
                            calculationMethod: formatMessage({id:"lbl.Computing-method" }),
                        },
                        sumCol: {//汇总字段
                        },
                        'sheetName':formatMessage({id:'lbl.afcm-0034'}),
                    }
            ]
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
            // setChecked([])
            // setCopydata([])
            let blob = new Blob([downData], { type: 'application/x-xls' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agreement.local-charge.local-charge-agreement'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agreement.local-charge.local-charge-agreement'}) + '/'+ TimesFun() + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    const agreements = async (value, number)=>{
        let val = value ? value.target.value : number
        setValueAgreement(val)
       
    }
    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setTableData([])
        setCopyShow(false)
        setChecked([])
        queryForm.setFieldsValue({
            companyCode:companysData?companyData:'',
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        console.log(company.companyType == 0 ? company.companyCode : acquireData.defaultValue)
        companys()
        setAuditFlag(true)
        setCopydata([])
        
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
                        {/* 船东 */}
                        <Select name='shipperOwner' disabled={company.companyType == 0 ? true : false} span={6} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 公司 */}
                        <Select span={6} showSearch={true}  name='companyCode' flag={true} label={<FormattedMessage id='lbl.company'/>} options={companysData}/>
                        {/* <a ,position: 'absolute',left:'497px'}}><Tooltip className="tipsContent" title={<FormattedMessage id='lbl.messT' />}><InfoCircleOutlined /></Tooltip></a> */}
                        <a style={{color:'orange'}}><Tooltip color='#e6f7ff' style={{color:'#000'}} className="tipsContent" title={titTooltip}><InfoCircleOutlined /></Tooltip></a>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select flag={true} showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} selectChange={companyIncident} />
                        }
                        {/* 船东 */}
                        {/* <SelectVal span={6} name='shipperOwner'  flag={true} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values}/> */}
                        {/* 公司 */}
                        {/* <Select name='companyCode' showSearch={true} flag={true} label={<FormattedMessage id='lbl.company'/>}  span={6} options={companysData} /> */}
                        {/* 协议状态 */}
                        <Select name='agreementStatus' flag={true} label={<FormattedMessage id='lbl.ProtocolState'/>}  span={6} options={protocolStateData.values} />
                        {/* 代理编码 */}
                        {/* <Select name='agencyCode' label={<FormattedMessage id='lbl.agency'/>}  span={6} options={agencyCode}/>   */}
                        {/* 代理描述 */}
                        <InputText name='agencyName' capitalized={false} label={<FormattedMessage id='lbl.agent-described'/>} span={6}/> 
                        {/* 有效日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='Date' label={<FormattedMessage id='lbl.valid-date'/>}   />          
                        {/*口岸协议 网点协议 */}
                        <CosRedio name='agreementType' span={6} label=' ' onClick={agreements} options={[{value:1,label:<FormattedMessage id='lbl.afcm-0071'/>,disabled:kouanFlag},{value:2,label:<FormattedMessage id='lbl.afcm-0072'/>,disabled:wdFlag}]}/>
                    </Row>
                {/* <Alert message={<FormattedMessage id="lbl.messT" />} type="info" showIcon /> */}

                </Form> 
                {/* <div style={{ color: 'red', textAlign: 'right' }}>
                    <span style={{ background: 'yellow' }}><FormattedMessage id="lbl.messT" /></span>
                </div> */}
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增*/}
                    <CosButton auth='AFCM_AGMT_LOC_001_B01' onClick={addcopy} onChange={()=>setEditShowHide(true)} ><FileAddOutlined /><FormattedMessage id='lbl.add'/></CosButton>
                    {/* 复制 */}
                    <CosButton auth='AFCM_AGMT_LOC_001_B02' onClick={copy} disabled={copyflag}><CopyOutlined /><FormattedMessage id='lbl.copy'/></CosButton>
                    {/* 提交审核 */}
                    <CosButton auth='AFCM_AGMT_LOC_001_B03' onClick={audit} disabled={auditFlag} ><FileDoneOutlined /> <FormattedMessage id='lbl.submit-audit'/></CosButton>
                    {/* 下载 */}
                    {/* <CosDownLoadBtn downLoadTitle={'menu.afcm.agreement.local-charge.local-charge-agreement'} downColumns={[{dataCol: columns,sheetName: 'menu.afcm.CalFeeQy.comp.bas-hist-info'}]} downLoadUrl={'COMM_QUERY_EXP_COMM_BILL'} queryData={queryForm.getFieldValue()} setSpinflag={setSpinflag} btnName={'btn.Download-bill-of-lading'}/> */}
                    <Button disabled={copydata.length==1?false:true} onClick={downlod}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                
                <div className='button-right'>
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button  onClick={() => pageChange(page,'','search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
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
                    total={tabTotal}
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
            <AddModifcation LocalInitData={LocalInitData}/>
            <LocalChargeCopy copydatas={copydatas}  />
            <LogPopUp logData={logData} />
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default Index;