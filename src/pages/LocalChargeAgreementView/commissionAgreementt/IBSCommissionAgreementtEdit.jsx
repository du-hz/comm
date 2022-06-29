import React, {useState,useEffect,$apiUrl} from 'react';
import { Modal , Row ,Form ,Button} from 'antd';
import {FormattedMessage, formatMessage,useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, momentFormat, acquireSelectDataExtend, agencyCodeData} from '@/utils/commonDataInterface';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import DatePicker from '@/components/Common/DatePicker'
import moment from 'moment';
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import CosToast from '@/components/Common/CosToast'
import CosModal from '@/components/Common/CosModal'
import IptNumber from '@/components/Common/IptNumber';
import Loading from '@/components/Common/Loading'
// ------------------------编辑复制弹框---------------------------------------------
// import { request } from 'express';
const UploadRate = (props) => {
    const {
        isModalVisiblecopy,//控制弹框开关
        copydata,//复制的数据
        editFlag,
        setIsModalVisibleCopy,
        route,
        acquireData,
        setSaveEidtFlag
    } = props.copydatas;
    const intl = useIntl();
    const [queryForm] = Form.useForm();
    const [messageData, setMessageData] = useState({});
    const [currencyCode,setCurrencyCode] = useState({})
    const [spinflag,setSpinflag] = useState(false)
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const handleCancel = () => {
        setIsModalVisibleCopy(false);   // 关闭弹窗 
        queryForm.resetFields()
        setMessageData({})

    }
    useEffect(()=>{
        isModalVisiblecopy?queryForm.resetFields():null
        acquireSelectData('AFCM.PUNISH.CURRENCYCODE',setCurrencyCode,$apiUrl);//币种
        
        if(copydata){
            queryForm.setFieldsValue({
                'agreementCode':copydata.agreementCode,
                'shipownerCompanyCode':copydata.shipownerCompanyCode,
                'cargoTradeLaneCode':copydata.cargoTradeLaneCode,
                'chargeCode':copydata.chargeCode,
                'facilityCode':copydata.facilityCode,
                'portCode':copydata.portCode,
                'fromDate':moment(copydata.fromDate),
                'toDate':moment(copydata.toDate),
                'termsFrom':copydata.termsFrom,
                'termsTo':copydata.termsTo,
                'containerSizeTypeGroup':copydata.containerSizeTypeGroup,
                'unitPrice':copydata.unitPrice,
                'currencyCode':copydata.currencyCode,
            })
        }
        console.log(editFlag)
    },[copydata,isModalVisiblecopy,editFlag])

   const saveUploadRate = async(a)=>{
        setMessageData({})
        console.log(copydata)
        let uuids = copydata.ibsAgreementUuid
        if(!editFlag){//复制
            setSpinflag(true)
           let saveData = await request($apiUrl.IBS_COPY_SAVE,{ method:'POST',
                method:'POST',
                data:{
                    'params':{
                        'ibsAgreementUuid':uuids
                    }
                }
            })
            console.log(saveData)
            if(saveData.success){
                setSpinflag(false)
                setMessageData({alertStatus:'alert-success',message:saveData.message})
                setSaveEidtFlag(true)
                handleCancel()
                
            }else{
                setSpinflag(false)
                setMessageData({alertStatus:'alert-error',message:saveData.errorMessage})
            } 
        }else{//编辑保存
            let form = queryForm.getFieldValue()
            if(!form.termsFrom || !form.termsTo || !form.containerSizeTypeGroup || form.unitPrice===null){
                setMessageData({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.None-inputable-conditions-empty'})});
                return
            }
            if(form.termsFrom.length>10 || form.termsTo.length>10 || form.containerSizeTypeGroup.length>10 || form.unitPrice.length>20){
                setMessageData({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
            setSpinflag(true)
            let saveData = await request($apiUrl.IBS_EDIT_SAVE,{
                method:'POST',
                data:{
                    'params':{
                        ...queryForm.getFieldValue(),
                        fromDate:momentFormat(queryForm.getFieldValue().fromDate),
                        toDate:momentFormat(queryForm.getFieldValue().toDate),
                        'ibsAgreementUuid':uuids,
                        'deleteIndicator':copydata.deleteIndicator
                    }
                }
            })
            if(saveData.success){
                setSpinflag(false)
                // setMessageData({alertStatus:'alert-success',message:saveData.message})
                Toast('', saveData.message, '', 5000, false);
                handleCancel()
                setSaveEidtFlag(true)
            }else{
                setSpinflag(false)
                setMessageData({alertStatus:'alert-error',message:saveData.errorMessage})
            } 
        }
        
   }
    
    return (<div className='uploadRate'>
        <CosModal cbsDragCls='modal-drag-IBS' cbsMoveCls='drag-move-IBS' cbsTitle={<FormattedMessage id='lbl.afcm-0073' />} cbsVisible={isModalVisiblecopy} footer={null} cbsWidth="70%" cbsFun={() => handleCancel()}>
            <CosToast toast={messageData}/>
            <div className='header-from'>
                <Form 
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery} 
                >
                    <Row>
                        {/* 协议代码 */}
                        <InputText  isSpan={true} span={6} disabled name='agreementCode' label={<FormattedMessage id='lbl.agreement'/>} disabled />
                        {/* 船东公司 */}
                        <Select  isSpan={true} showSearch={true} disabled name='shipownerCompanyCode' label={<FormattedMessage id='lbl.ac.pymt.carrier-company'/>}  span={6} disabled options={acquireData.values} />
                        {/* 航线*/}
                        <Select  isSpan={true} disabled name='cargoTradeLaneCode'  label={<FormattedMessage id='lbl.route'/>}   span={6} disabled={editFlag} options={route.values}/>  
                        {/* 费用代码 */}
                        <InputText  isSpan={true} disabled name='chargeCode' label={<FormattedMessage id='lbl.argue.chargeCode'/>} span={6} disabled={editFlag}/>  
                        {/* 堆场 */}
                        <InputText  isSpan={true} disabled showSearch={true} name='facilityCode' label={<FormattedMessage id='lbl.yard'/>}  span={6} disabled={editFlag}/>
                        {/* 港口 */}
                        <InputText  isSpan={true} disabled showSearch={true} name='portCode' label={<FormattedMessage id='lbl.port'/>}  span={6} disabled={editFlag} />
                        {/* 协议开始时间 */}
                        <DatePicker  isSpan={true} disabled span={6} name='fromDate' label={<FormattedMessage id='lbl.Start-time-of-agreement'/>} disabled={editFlag}  />          
                        {/* 协议结束时间 */}
                        <DatePicker isSpan={true} disabled span={6} name='toDate' label={<FormattedMessage id='lbl.Agreement-End-time'/>} disabled={editFlag}  />          
                        {/* 出口协议条款 */}
                        <InputText  isSpan={true} maxLength={10} showSearch={true} name='termsFrom' label={<FormattedMessage id='lbl.Export-Agreement-Terms'/>}  span={6}/>
                        {/* 进口协议条款 */}
                        <InputText  isSpan={true} maxLength={10} showSearch={true} name='termsTo' label={<FormattedMessage id='lbl.Import-Agreement-Terms'/>}  span={6}/>
                        {/* 箱型尺寸组 */}
                        <InputText  isSpan={true} maxLength={10} showSearch={true} name='containerSizeTypeGroup' label={<FormattedMessage id='lbl.Box-size-group'/>}  span={6}/>
                        {/* 协议费率 */}
                        <IptNumber  isSpan={true} maxLength={20} showSearch={true} name='unitPrice' label={<FormattedMessage id='lbl.budgetTracking.agreement-rate'/>}  span={6}/>
                        {/* 币种 */}
                        <Select  isSpan={true} showSearch={true} name='currencyCode' label={<FormattedMessage id='lbl.ccy'/>}  span={6} options={currencyCode.values} />
                </Row>
            </Form> 
            {/* 协议配置 */}
            <div className='query-condition' style={{background:'#fff'}}><Button type="primary"><FormattedMessage id='lbl.Protocol-configuration'/></Button> </div>
        </div>
            <div className='main-button' style={{marginTop:'10px'}}>
                <div className='button-left'>
                   
                </div>
                <div className='button-right'>
                    {/* 关闭 */}
                    <Button onClick={() => handleCancel()}><FormattedMessage id='lbl.close' /></Button>
                    {/* 保存 */}
                    <Button onClick={()=> saveUploadRate()}><FormattedMessage id='btn.save' /></Button>
                </div>
            </div>
            <Loading spinning={spinflag}/>
        </CosModal>
    </div>)
}
export default UploadRate