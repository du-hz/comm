import React, { useState,useEffect,$apiUrl } from 'react'
import { Modal, Button, Form ,Row, Col } from 'antd';
import {FormattedMessage, formatMessage} from 'umi'
import { acquireSelectData,momentFormat,companyAgency, acquireSelectDataExtend} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import Select from '@/components/Common/Select'
import DatePicker from '@/components/Common/DatePicker'
import moment from 'moment';
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import CosToast from '@/components/Common/CosToast'
import CosModal from '@/components/Common/CosModal'



const LocalChargeCopy =(props)=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [protocoltypeDate,setProtocoltypeDate]=useState({})//协议类型
    const {isModalVisiblecopy,setIsModalVisibleCopy,companysData,copydata,copyflag,copyUrl,setUnlockAuditFlag,setCopyFlag}=props.copydatas
	const [messageData, setMessageData] = useState({});
    const [queryForms] = Form.useForm();
    
    useEffect(()=>{
        // acquireSelectData('CB0068',setAcquireData, $apiUrl);// 船东 
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.AGMT.TYPE', setProtocoltypeDate, $apiUrl);// 协议类型   
        
    },[])
    useEffect(() => {
      copy(copydata)
    }, [copydata])
    const handleOk = () => {
        Toast('', '', '', 5000, false);
        // queryForms.resetFields()
        setIsModalVisibleCopy(false);
        setMessageData({})
    };
    
     //公司和代理编码的联动
     const  companyIncident = async (value,all) => {
        queryForms.setFieldsValue({
            agencyCode:all.linkage.sapCustomerCode,
            subAgencyCode:all.linkage.sapCustomerCode,
        })
        let data = all.linkage.companyCode
        companyAgency($apiUrl,data,setAgencyCode)
        console.log(all.linkage.companyCode,all.linkage,all.linkage.sapCustomerCode)
     }
  
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisibleCopy(false);
        setMessageData({})
        // queryForms.resetFields()
    };

    //复制的数据
    const copy = (copydata) =>{
        if(copydata.length>0){
            let data = copydata[0]
            companyAgency($apiUrl,data.companyCode,setAgencyCode)
            queryForms.setFieldsValue({
                'shipownerCompanyCode':data.shipownerCompanyCode,
                'companyCode':data.companyCode,
                'subAgencyCode':data.subAgencyCode,
                'agencyCode':data.agencyCode,
                'lcrAgreementHeadUuid':data.lcrAgreementHeadUuid,
                'agreementHeadUuid':data.agreementHeadUuid
            }) 
        }
    }
    
    //复制接口
    const handleOks = async () =>{
        setMessageData({})
        let query = queryForms.getFieldValue()
        if(!query.shipownerCompanyCode||!query.companyCode||!query.agencyCode||!query.Date||!query.subAgencyCode){
            setMessageData({alertStatus:'alert-error',message:formatMessage({id:'lbl.None-inputable-conditions-empty'}) })
        }else{
            let coppy = await request($apiUrl[copyUrl],{
                // let coppy = await request($apiUrl.AFMT_COPY_SAVE,{
                    method:"POST",
                    data:{
                        "params":{
                            'shipownerCompanyCode':query.shipownerCompanyCode,
                            'companyCode':query.companyCode,
                            'agencyCode':query.agencyCode,
                            // 'agreementType':query.agreementType,
                            'fromDate':momentFormat(query.Date),
                            'agreementHeadUuid': query.agreementHeadUuid,
                            'lcrAgreementHeadUuid':query.lcrAgreementHeadUuid,
                            'subAgencyCode':query.subAgencyCode
                        },
                    }
                })
                if(coppy.success){
                    setMessageData({alertStatus:'alert-success',message:coppy.message })
                    setUnlockAuditFlag(true)
                    handleCancel()
                    queryForms.resetFields()
                    setCopyFlag(true)
                }else{

                    setMessageData({alertStatus:'alert-error',message:coppy.errorMessage })
                }
        }
        
    }
    return (
        <div className='copy'>
            <CosModal cbsTitle={formatMessage({id:'lbl.copy'})}  cbsVisible={isModalVisiblecopy} cbsFun={handleCancel} cbsWidth='30%'  height='100%'>
                <CosToast toast={messageData}/>
                <div className='copy-header-from' style={{minWidth:'340px'}}>
                    <Form 
                        form={queryForms}
                        name='func'
                    >
                        <Row>
                            <Col span={24}>
                                {/* 船东 */}
                                <Select span={20} name='shipownerCompanyCode' isSpan={true} label={<FormattedMessage id='lbl.carrier'/>}  options={acquireData.values}/>
                            </Col>  
                        </Row>
                        <Row>
                            <Col span={24}>
                                {/* 公司 */}
                                <Select name='companyCode' label={<FormattedMessage id='lbl.company'/>} isSpan={true}   span={20} options={companysData} selectChange={companyIncident} />
                            </Col>  
                        </Row>
                        <Row>   
                            <Col span={24}>
                                {/* 协议类型 */}
                                {/* <Select name='agreementType' label={<FormattedMessage id='lbl.protocol-type'/>}   span={24} options={protocoltypeDate} /> */}
                            </Col>    
                        </Row>
                        <Row> 
                            <Col span={24}>
                                {/* 代理编码 */}
                                <Select name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} isSpan={true} span={20} options={agencyCode}/>  
                            </Col>   
                        </Row>
                        <Row> 
                            <Col span={24}>
                                {/* 子代理编码 */}
                                <Select name='subAgencyCode' label={<FormattedMessage id='lbl.Son-agency-code'/>} isSpan={true} span={20} options={agencyCode} />  
                            </Col>   
                        </Row>
                        <Row>  
                            <Col span={24}>
                                {/* 开始时间 */}
                                <DatePicker name='Date' label={<FormattedMessage id='lbl.start-date'/>} isSpan={true} span={20}  />
                            </Col>
                        </Row>
                    </Form> 
                   
                </div>
                <div className='main-button' style={{minWidth:'340px'}}>
                    <div className='button-left' >
                     
                    </div>
                    <div className='button-right' >
                        {/* 取消 */}
                        <Button  onClick={handleCancel}> <FormattedMessage id='lbl.cancel' /></Button>
                        {/* 确认 */}
                        <Button onClick={handleOks} > <FormattedMessage id='lbl.affirm' /></Button>
                    </div>
                </div>
            </CosModal>
        </div>
    )
}
export default LocalChargeCopy