//------------ ---新增保存，编辑，查看详情 弹框--- ----------------
import React, { useState,useEffect,$apiUrl,useContext} from 'react'
import {FormattedMessage, formatMessage} from 'umi'
import { Form,Modal, Button ,Row, Input, Select,Tooltip,InputNumber } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {momentFormat ,acquireSelectDataExtend , companyAgency} from '@/utils/commonDataInterface';
import moment from 'moment';
import request from '@/utils/request';
import SelectVal from '@/components/Common/Select';
import InputText from '@/components/Common/InputText'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import CosButton from '@/components/Common/CosButton'
import CosToast from '@/components/Common/CosToast'
import Loading from '@/components/Common/Loading'
import CosModal from '@/components/Common/CosModal'
import {
    PlusOutlined,//新增item
    FormOutlined,//编辑
    CloseCircleOutlined,//删除
    SaveOutlined,//保存
    FileProtectOutlined,//保存并提交审核
    ImportOutlined,//协议退回
    UnlockOutlined,//解锁
} from '@ant-design/icons'
import { set } from 'lodash';


const formlayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};



const confirm = Modal.confirm
const AddModifcation =(props)=> {
	const [messageData, setMessageData] = useState({});
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [agreementType,setAgreementType] = useState({});    //协议类型
    const [outBoundInboundIndicator,setOutBoundInboundIndicator] = useState ({}) //进出口标志
    const [spinflag,setSpinflag] = useState(false)
    const [lastCondition, setLastCondition] = useState({
        "shipownerCompanyCode": null,
        "companyCode": null,
        "agencyCode": null,
        "agreementType": 'N',
        "commissionAgreementCode":null,
        // "Date": null,
    });
    const [dataSource,setDataSource]=useState([])//新增表格数据
    const [authCheck,setauthCheck] = useState(true)//所有审核
    const [lcrAgreementHeadUuid,setLcrAgreementHeadUuid] = useState('')//uuid
    const {
        setAgencyFeeIsModalVisible,
        toData,
        tabData,
        AgencyFeeIsModalVisible,
        setTabData,
        AgencyFeeflag,
        setflags,
        adddatas,
        setAddDatas,
        dataFlag,
        flags,
        title,
        formDatas,
        shipperFlag,
        companyData,
        company,
        buttonFlag,
        setButtonFlag,
        setUnlockAuditFlag,
        titlePopup,
        compyFlag,
        setCompyFlag
    } = props.LocalInitData;
    //初始化下拉框数据
    useEffect( () => {
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectDataExtend('COMMON_DICT_ITEM','AFCM.AGMT.TYPE', setAgreementType, $apiUrl);// 协议类型
        acquireSelectDataExtend('COMMON_DICT_ITEM','AFCM.AGMT.INOUTBOUND', setOutBoundInboundIndicator, $apiUrl);// 协议类型
        companys()
        // console.log(dataSource)
    } , [] )
     //公司
     const companys = async() =>{
        setMessageData({})
        await request.post($apiUrl.LCR_AGMT_SEARCH_INIT)
        .then((resul) => {
            if(!resul.data)return
            var data = resul.data.companys;
            data?data.map((val, idx)=> {
                val['value'] = val.companyCode
                val['label'] = val.companyCode + '-' + val.companyName;
            }):null
            setCompanysData(data);
        })
    }
    useEffect(()=>{
        var day2 = new Date();
		day2.setTime(day2.getTime());
		var fromDate = day2.getFullYear()+"-" + (day2.getMonth()+1) + "-" + day2.getDate();
        queryForm.setFieldsValue({
            ...lastCondition,
            agencyCode:company.agencyCode,
            shipownerCompanyCode:company.companyType == 0 ? company.companyCode :acquireData.defaultValue,
            companyCode:companysData?companyData:'',
            Date: [moment(fromDate),moment(toData)],
        });
        companyAgency($apiUrl,companyData,setAgencyCode)
        console.log(toData)
    },[toData,companyData,acquireData,company])
    useEffect(()=>{
        edit()
    },[tabData])

    //编辑数据
    const edit = () =>{
        if(AgencyFeeIsModalVisible){
            let data=tabData.localChargeAgmtItems
            let companyCodes
            data?data.map((v,i)=>{
              v.outBoundInboundIndicator = v.outBoundInboundIndicator + ''
            }):null
            companysData?companysData.map((v,i)=>{
            if(tabData.companyCode==v.companyCode){
                companyCodes = v.label
            }
        }):null
        console.log(data,tabData)
        companyAgency($apiUrl,data.companyCode,setAgencyCode)
        setLcrAgreementHeadUuid(tabData.lcrAgreementHeadUuid)
        setDataSource(data)
        queryForm.setFieldsValue({
            ...tabData,
            'companyCode':companysData?companyCodes:'',
            shipownerCompanyCode:tabData.shipownerCompanyCode,
            Date: [moment(tabData.fromDate),moment(tabData.toDate)]
        })
        }   
    }

   
    //公司和代理编码的联动
    const  companyIncident = (value,all) => {
        console.log(tabData)
        queryForm.setFieldsValue({
            agencyCode:all.linkage.sapCustomerCode
       })
        let data = all.linkage.companyCode
        companyAgency($apiUrl,data,setAgencyCode)
    }
    //localcharge新增表格文本
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,
            dataIndex: 'operate',
            sorter: false,
            width: 80,
            fixed: true,
            align:'center',
            render:(text,record,index) => {
                return <div className='operation'>
                    {/* 删除 */}
                        <Tooltip  title={<FormattedMessage id='btn.delete' />}><a disabled={AgencyFeeflag?false:true} style={{color:AgencyFeeflag?'red':'#ccc'}} onClick={()=>deleteItem(record,index)}><CloseCircleOutlined  /></a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                        <Tooltip title={<FormattedMessage id='btn.edit' />} ><a  disabled={AgencyFeeflag?false:true}  onClick={() =>compile(record,index)}><FormOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号
            dataIndex: 'commissionAgreementCode',
            sorter: false,
            width: 120,
            align:'center',
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'cargoTradeLaneCode',
            sorter: false,
            width: 120,
            align:'center',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Input maxLength={3} defaultValue={record.cargoTradeLaneCode} onChange={(e)=>cargoTradeInput(e,record,'cargoTradeLaneCode')}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.charge-code" />,//changecode
            dataIndex: 'chargeCode',
            sorter: false,
            width: 120,
            align:'center',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                    { record.saveShowHide?<Input maxLength={3} defaultValue={record.chargeCode}  onChange={(e)=>cargoTradeInput(e,record,'chargeCode')}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.bound-sign" />,//进出口标志
            dataIndex: 'outBoundInboundIndicator',
            sorter: false,
            width: 120,
            align:'center',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Select defaultValue={record.outBoundInboundIndicator} onChange={(e)=>getCommonSelectVal(e,record,'outBoundInboundIndicator')} options={outBoundInboundIndicator.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.office" />,//office
            dataIndex: 'officeCode',
            sorter: false,
            width: 120,
            align:'center',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Input maxLength={3} defaultValue={record.officeCode} onChange={(e)=>cargoTradeInput(e,record,'officeCode')}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.return-the-proportion" />,//返还比例
            dataIndex: 'refundRate',
            sorter: false,
            width: 120,
            align:'center',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<InputNumber maxLength={10}  precision={3}  defaultValue={record.refundRate}  onChange={(e)=> {cargoTradeInputNumber(e,record)}}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            width: 80,
            align:'center',
        }
    ]
    //编辑
    const compile = (record,index) => {
        setMessageData({})
        let data = dataSource;
        data[index].saveShowHide = true
        setDataSource([...data])
    }

    //编辑后的内容table input
    const cargoTradeInput = (e,record,name) => {
        record[name]=e.target.value
    }
    const cargoTradeInputNumber = (e,record) =>{
        record.refundRate=e
        
    }
    const getCommonSelectVal = (e, record, name) => {
        record[name] = e;
    }
    

    //保存
    const [queryForm] = Form.useForm();
    const [messageSave,setMessageSave] = useState('')
    const handleQuery = (operate) => {
        setMessageData({})
        const query = queryForm.getFieldsValue()
        //保存的接口
        console.log(dataSource)
        if(!query.shipownerCompanyCode||!query.companyCode||!query.agreementType||!query.Date[0]){
            // 可输入的条件都不能为空
            setMessageData({alertStatus:'alert-error',message:formatMessage({id:'lbl.None-inputable-conditions-empty'}) })
        }else{
            //新增保存
            // if(dataSource.length>0){ 
            //     let mes 
            //     for(let i=0;i<dataSource.length;i++){
            //         // console.log('返还比例',dataSource[i],dataSource[i].refundRate,Number(dataSource[i].refundRate))
            //         if(Number(dataSource[i].refundRate)==0){
            //             mes = formatMessage({id:'lbl.afcm-0049'})
            //          break
            //         }
            //     }
            //     save(operate,mes)
            // }else{
            //     save(operate)
            // }
            saves(operate)
        }
    }
    //保存
    const saves = async(operate,message)=>{
        const query = queryForm.getFieldsValue()
        let str = query ? query.companyCode : '';
        let ind = str.indexOf('-');
        let we = str ? str.substring(0, (ind == -1 ? 4 : ind)) : null;
        setSpinflag(true)
        const save=await request($apiUrl.LCR_AGMT_SEARCH_PRE_ASVE_SUBMIT,{
            method:"POST",
            data:{
                "paramsList":[ {
                    ...adddatas,
                    ...tabData,
                    'companys':undefined,
                    'shipownerCompanyCode':query.shipownerCompanyCode,//船东
                    'companyCode':we,//公司
                    'agencyCode':query.agencyCode,//代理编码
                    'agreementType':query.agreementType,//协议类型
                    'commissionAgreementCode':query.commissionAgreementCode,//协议代码
                    'fromDate': query.Date?momentFormat(query.Date[0]):null,//开始日期
                    'toDate': query.Date?momentFormat(query.Date[1]):null,//结束日期
                    'lcrAgreementHeadUuid':lcrAgreementHeadUuid,//uuid
                    'localChargeAgmtItems':dataSource,
                }],
                "operateType":operate
            }
        })
        console.log(save,dataSource)
        if(save.success){
            setSpinflag(false)
            setMessageData({alertStatus:'alert-success',message:save.message })
            if(operate=='SUBMIT'){
                handleCancel()
                setUnlockAuditFlag?setUnlockAuditFlag(true):''
                setMessageData({})
            }
            setCompyFlag(false)
            let data=save.data
            setflags(true)
            setLcrAgreementHeadUuid(data.lcrAgreementHeadUuid)
            queryForm.setFieldsValue({
                'commissionAgreementCode':data.commissionAgreementCode,
            })
            if(dataSource.length>0){
                dataSource.map((v,i)=>{
                    v.saveShowHide=false
                })
                console.log(data.localChargeAgmtItems)
                data.localChargeAgmtItems?setDataSource([...data.localChargeAgmtItems]):null
            }
        }else{
            setSpinflag(false)
            console.log(messageSave)
            message?setMessageData({alertStatus:'alert-error',message:save.errorMessage + message }):setMessageData({alertStatus:'alert-error',message:save.errorMessage})
        } 
    }
    //添加item项
    const handleTables = async()=>{
        setMessageData({})
        setSpinflag(true)
        let newitem=await request($apiUrl.LCR_AGMT_SEARCH_PRE_NEW_ITEM_INIT,{
            method:"POST",
        })
        if(newitem.success){
            setSpinflag(false)
            let data=newitem.data
            data.id=dataSource.length+1
            console.log(data.id)
            data.saveShowHide=true
            data.refundRate = '0.0000'
            if(queryForm.getFieldValue().commissionAgreementCode!=null){
                data.commissionAgreementCode=queryForm.getFieldValue().commissionAgreementCode
            }
            dataSource.push(data)
            console.log(dataSource)
            setDataSource([...dataSource])
        }else{
            setSpinflag(false)
        }
        
    }

    //代理审核
    const audit = async (operate) =>{       
        setMessageData({})
        setSpinflag(true)
        let audits= await request($apiUrl.LCR_AGMT_PRE_APPROVE,{
            method:'POST',
            data:{
                "params":{
                    ...queryForm.getFieldValue(),
                    "fromDate": queryForm.getFieldValue().Date?momentFormat(queryForm.getFieldValue().fromDate):null,//fromDate.slice(1,11)+' 00:00:00',
                    "toDate":queryForm.getFieldValue().Date?momentFormat(queryForm.getFieldValue().Date[1]):null,
                    'localChargeAgmtItems':[...dataSource]
                },
                "operateType":operate, //处理模式
                'agreementType':'LOCAL_CHARGE',
            }
        })
        dataSource.map((v,i)=>{
            v.saveShowHide=false
        })
        if(audits.success){
            setUnlockAuditFlag?setUnlockAuditFlag(true):''
            setSpinflag(false)
            Toast('', audits.message, 'alert-success', 5000, false);
            handleCancel()
            // setMessageData({alertStatus:'alert-success',message:audits.message })
        }else{
            setSpinflag(false)
            setMessageData({alertStatus:'alert-error',message:audits.errorMessage })
        }
    }

    //解锁
    const unlock = async (operate) =>{
        setMessageData({})
        console.log(operate)
        console.log(queryForm.getFieldValue(),dataSource)
        setSpinflag(true)
        let unlocks = await request($apiUrl.AFMT_PRE_UNLOCK,{
            method:'POST',
            data:{
                "params":{
                    ...queryForm.getFieldValue(),
                    'agreementType':'LOCAL_CHARGE',
                    'agmtHeadUuid':queryForm.getFieldValue().lcrAgreementHeadUuid,
                    "fromDate":  queryForm.getFieldValue().Date?momentFormat(queryForm.getFieldValue().Date[0]):null,//fromDate.slice(1,11)+' 00:00:00',
                    "toDate": queryForm.getFieldValue().Date?momentFormat(queryForm.getFieldValue().Date[1]):null,
                    'localChargeAgmtItems':[...dataSource]
                },
                "operateType":operate //处理模式 
            }
        })
        if(unlocks.success){
            // 解锁成功
            setUnlockAuditFlag?setUnlockAuditFlag(true):''
            setSpinflag(false)
            // setMessageData({alertStatus:'alert-success',message:unlocks.message })
            handleCancel()
            setMessageData({})
            Toast('', unlocks.message, 'alert-success', 5000, false);
        }else{
            setSpinflag(false)
            setMessageData({alertStatus:'alert-error',message:unlocks.errorMessage })
        }
    }
    
    //协议退回
    const agreementBack= async (operate) => {
        setMessageData({})
        setSpinflag(true)
        let str = queryForm.getFieldValue() ? queryForm.getFieldValue().companyCode : '';
        let ind = str.indexOf('-');
        let we = str ? str.substring(0, (ind == -1 ? 4 : ind)) : null;
        let agreementBacks= await request($apiUrl.LCR_AGMT_CANCEL,{
            method:"POST",
            data:{
                "params":{
                    ...queryForm.getFieldValue(),
                    'companyCode':we,//公司
                    'Date':undefined,
                    "fromDate": queryForm.getFieldValue().Date?queryForm.getFieldValue().Date[0]?momentFormat(queryForm.getFieldValue().Date[0]):null:null,//fromDate.slice(1,11)+' 00:00:00',
                    "toDate":queryForm.getFieldValue().Date?momentFormat(queryForm.getFieldValue().Date[1]):null,
                    'localChargeAgmtItems':[...dataSource]
                },
                operateType:operate
            }
        })
        if(agreementBacks.success){
            setSpinflag(false)
            // setMessageData({alertStatus:'alert-success',message:agreementBacks.message })
            setUnlockAuditFlag?setUnlockAuditFlag(true):''
            setSpinflag(false)
            setAgencyFeeIsModalVisible(false)
            handleCancel()
            setMessageData({})
            Toast('', agreementBacks.message, 'alert-success', 5000, false);
        }else{
            setSpinflag(false)
            setMessageData({alertStatus:'alert-error',message:agreementBacks.errorMessage })
        }
    }
    //删除item项
    const deleteItem = async(record,index) => {
        setMessageData({})
        console.log(dataSource)
        setMessageData({})
        const confirmModal = confirm({
            title: formatMessage({id:'lbl.delete'}),
            content: formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                if(!record.lcrAgreementItemUuid){
                    dataSource.splice(index,1)
                    console.log(dataSource)
                    setDataSource([...dataSource])
                }else{
                    let deleteitem=await request($apiUrl.LCR_AGMT_DELETE_ITEM_UUID,{
                        method:'POST',
                        data:{
                            params:{
                                'agreementItemUuid':record.lcrAgreementItemUuid,
                                'agreementCode':record.commissionAgreementCode
                            }
                        }
                    }) 
                    console.log(deleteitem)
                    if(deleteitem.success){
                        
                        // handleTable()
                        let data = deleteitem.data.localChargeAgmtItems
                        data?setDataSource(data):setDataSource([])
                        setMessageData({alertStatus:'alert-success',message:deleteitem.message})
                    }else{
                        setMessageData({alertStatus:'alert-error',message:deleteitem.errorMessage})
                    }
                    
                } 
            }
        })
        
    }
      //关闭弹框
    const handleCancel = () =>{
        setMessageData({})
        setAgencyFeeIsModalVisible(false)
        queryForm.resetFields()
        var day2 = new Date();
		day2.setTime(day2.getTime());
		var fromDate = day2.getFullYear()+"-" + (day2.getMonth()+1) + "-" + day2.getDate();
        queryForm.setFieldsValue({
            ...lastCondition,
            agencyCode:company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            companyCode:companyData,
            Date: [moment(fromDate),moment(toData)],
        })
        setDataSource([])
        setAddDatas([])
        setTabData([])
        setflags(false)
        setMessageData({})
        setLcrAgreementHeadUuid('')
        setButtonFlag([])
    }   
    return (
            <CosModal cbsDragCls='modal-drag-loc' cbsMoveCls='drag-move-loc' cbsTitle={title} cbsVisible={AgencyFeeIsModalVisible} cbsFun={handleCancel} cbsWidth='80%' height='100%' >
                <CosToast toast={messageData}/>
                <div className='add' style={{minWidth:'500px'}}>
                    <div className='topBox'>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 船东 */}
                                <SelectVal span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} isSpan={true} disabled={shipperFlag} options={acquireData.values}/>
                                {/* 公司 */}
                                <SelectVal name='companyCode' showSearch={true} label={<FormattedMessage id='lbl.company'/>} isSpan={true}  disabled={AgencyFeeflag&&compyFlag?false:true} span={6} options={companysData?companysData:[]} selectChange={companyIncident} />
                                {/* 代理编码 */}
                                <SelectVal name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} isSpan={true}  disabled={compyFlag?false:true} span={6} options={agencyCode}/>  
                                {/* 协议类型 */}
                                <SelectVal name='agreementType' label={<FormattedMessage id='lbl.protocol-type'/>}  isSpan={true} disabled={AgencyFeeflag?false:true} span={6} options={agreementType.values}/>
                                {/* 协议代码 */}
                                <InputText name='commissionAgreementCode' label={<FormattedMessage id='lbl.agreement'/>} isSpan={true} disabled span={6} />
                                {/* 有效日期 */}
                                <DoubleDatePicker span={6} name='Date' label={<FormattedMessage id='lbl.valid-date'/>}  isSpan={true} disabled={AgencyFeeflag&&compyFlag ? [false,true ] : [true, true]}  />
                            </Row>
                        </Form> 
                    </div> 
                    <div className='add-main-button'>
                        {/* 保存按钮 */}
                        <CosButton onClick={()=> handleQuery('SAVE')} auth='AFCM_AGMT_LOC_001_B013' style={{display:formDatas.authSave?'inline-block':'none'}} disabled={buttonFlag}  > <SaveOutlined /> <FormattedMessage id='btn.save'/></CosButton>
                        {/* 保存并提交审核按钮 */}
                        <CosButton onClick={()=>handleQuery('SUBMIT')} auth='AFCM_AGMT_LOC_001_B014' style={{display:formDatas.authSubmit?'inline-block':'none'}} disabled={buttonFlag} ><FileProtectOutlined /><FormattedMessage id='btn.save-and-submit-for-review'/></CosButton>
                        {/* 代理审核按钮  */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B06' onClick={()=> audit('KA_APPROVE')} style={{display:formDatas.authKACheck?'inline-block':'none'}}  disabled={buttonFlag} ><FileProtectOutlined /><FormattedMessage id='btn.the-agent-review'/></CosButton>
                        {/* 代理解锁  */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B09' onClick={()=>unlock('KA_UNLOCK')} style={{display:formDatas.authAgencyUnlock?'inline-block':'none'}} disabled={buttonFlag}><UnlockOutlined /><FormattedMessage id='lbl.commission-fees-unlock'/></CosButton>
                        {/* 代理协议退回按钮 */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B016' onClick={()=> agreementBack('KA_CANCEL')} style={{display:formDatas.authKaCancel?'inline-block':'none'}}  disabled={buttonFlag}><ImportOutlined /><FormattedMessage id='lbl.afcm-0078'/></CosButton>
                        {/* PMD审核按钮 */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B07' onClick={()=>audit('PMD_APPROVE')} style={{display:formDatas.authPMDCheck?'inline-block':'none'}}  disabled={buttonFlag}><FileProtectOutlined /><FormattedMessage id='btn.pmd-audit'/></CosButton>
                        {/* pmd解锁 */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B010' onClick={()=>unlock('PMD_UNLOCK')} style={{display:formDatas.authPMDUnlock?'inline-block':'none'}} disabled={buttonFlag}><UnlockOutlined /><FormattedMessage id='lbl.pmd-unlock'/></CosButton>
                        {/* PMD协议退回按钮 */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B012' onClick={()=> agreementBack('PMD_CANCEL')} style={{display:formDatas.authCancel?'inline-block':'none'}}  disabled={buttonFlag}><ImportOutlined /><FormattedMessage id='lbl.comm-pmd-back'/></CosButton>
                        {/* FAD审核按钮 */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B08' onClick={()=>audit('FAD_APPROVE')} style={{display:formDatas.authFADCheck?'inline-block':'none'}} disabled={buttonFlag}><FileProtectOutlined /><FormattedMessage id='btn.fad-audit'/></CosButton>
                        {/* FAD解锁  */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B011' onClick={()=>unlock('FAD_UNLOCK')} style={{display:formDatas.authFADUnlock?'inline-block':'none'}} disabled={buttonFlag}><UnlockOutlined /><FormattedMessage id='lbl.fad-unlock'/></CosButton>
                        {/* FAD协议退回按钮 */}
                        <CosButton auth='AFCM_AGMT_LOC_001_B015' onClick={()=> agreementBack('FAD_CANCEL')} style={{display:formDatas.authFadCancel?'inline-block':'none'}}  disabled={buttonFlag}><ImportOutlined /><FormattedMessage id='lbl.comm-fad-back'/></CosButton>
                    </div>
                    <div className='add-footer-table'>
                        <div className='add-footer-table-button'>
                            {/* 新增item项   */}
                            <Button onClick={()=>handleTables()}  disabled={flags?false:true}><PlusOutlined /> </Button>
                        </div>
                        <PaginationTable
                            dataSource={dataSource}
                            columns={columns}
                            rowKey='id'
                            rowSelection={null}
                            scrollHeightMinus={200}
                            pagination={false}
                        />
                    </div>
                </div>
            <Loading spinning={spinflag}/>
            </CosModal>
    )
}
export default AddModifcation