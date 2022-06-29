// 复制佣金公用
import React, { useState,useEffect,$apiUrl } from 'react'
import { Modal, Input, Button, Col,Form ,Row } from 'antd';
import {FormattedMessage,formatMessage} from 'umi'
import { acquireSelectData,momentFormat, companyAgency, acquireSelectDataExtend} from '@/utils/commonDataInterface';
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
    const [protocoltypeDate,setProtocoltypeDate]=useState({})//协议类型
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
	const [messageData, setMessageData] = useState({});
    const {isModalVisiblecopy,setIsModalVisibleCopy,companysData,copydata,setCopyFlag,copyUrl,setCopyShow,setUnlockAuditFlag}=props.copydatas
    const [queryForms] = Form.useForm();
    
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.AGMT.TYPE', setProtocoltypeDate, $apiUrl);// 协议类型   
    },[])
    useEffect(() => {
      !isModalVisiblecopy?copy(copydata):''
    }, [copydata,isModalVisiblecopy])
    const handleOk = () => {
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
        queryForms.resetFields()
        setMessageData({})
      setIsModalVisibleCopy(false);
    };

    //复制的数据
    const copy = (copydata) =>{
        // console.log(copydata)
        // console.log(isModalVisiblecopy)
        if(copydata.length){
            // alert(1)
            let data = copydata[0]
            // console.log(data)
            data?setCopyShow(true):setCopyShow(false)
            if(!data){
                // console.log(data)
            }else{
                companyAgency($apiUrl,data.companyCode,setAgencyCode)
                queryForms.setFieldsValue({
                    'shipownerCompanyCode':data.shipownerCompanyCode,
                    'companyCode':data.companyCode,
                    'agreementType':data.agreementType,
                    'agencyCode':data.agencyCode,
                    'lcrAgreementHeadUuid':data.lcrAgreementHeadUuid,
                    'agreementHeadUuid':data.agreementHeadUuid
                }) 
            }
           
        }
        
    }
    
    //复制接口
    const handleOks = async () =>{
        setMessageData({})
        let query = queryForms.getFieldValue()
        console.log(copyUrl)
        if(!query.shipownerCompanyCode||!query.companyCode||!query.agencyCode||!query.Date||!query.agreementType){
            setMessageData({alertStatus:'alert-error',message:formatMessage({id:'lbl.None-inputable-conditions-empty'}) })
        }else{
            let coppy = await request($apiUrl[copyUrl],{
            // let coppy = await request($apiUrl.AFMT_COPY_SAVE,{
                method:"POST",
                data:{
                    operateType: 'COPY',
                    "params":{
                        commissionAgreementCode: copydata[0].commissionAgreementCode,
                        'shipownerCompanyCode':query.shipownerCompanyCode,
                        'companyCode':query.companyCode,
                        'agencyCode':query.agencyCode,
                        'agreementType':query.agreementType,
                        'fromDate':momentFormat(query.Date),
                        'agreementHeadUuid': query.agreementHeadUuid,
                        'lcrAgreementHeadUuid':query.lcrAgreementHeadUuid,
                    },
                }
            })
            console.log(coppy)
            if(coppy.success){
                setUnlockAuditFlag(true)
                queryForms.resetFields()
                setCopyFlag?setCopyFlag(true):null
                setIsModalVisibleCopy(false);
                Toast('',coppy.message, 'alert-success', 5000, false)
            }else{
                setMessageData({alertStatus: 'alert-error', message: coppy.errorMessage});
            }
        }
    }
    return (
        <div className='copy'>
            <CosModal cbsTitle={formatMessage({id:'lbl.copy'})}  cbsVisible={isModalVisiblecopy} cbsFun={handleCancel} cbsWidth='30%'  height='100%'>
                <CosToast toast={messageData}/>
                <div className='copy-header-from' style={{minWidth:'300px'}}>
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
                                <Select name='companyCode' isSpan={true} label={<FormattedMessage id='lbl.company'/>}   span={20} options={companysData} selectChange={companyIncident} />
                            </Col> 
                        </Row>
                        <Row> 
                            <Col span={24}>
                               {/* 协议类型 */}
                                <Select name='agreementType' isSpan={true} label={<FormattedMessage id='lbl.protocol-type'/>}   span={20} options={protocoltypeDate.values} />
                            </Col>
                            </Row>
                        <Row> 
                            <Col span={24}>
                                {/* 代理编码 */}
                                <Select name='agencyCode' isSpan={true} label={<FormattedMessage id='lbl.agency'/>}   span={20} options={agencyCode} />  
                            </Col>
                            </Row>
                        <Row> 
                            <Col span={24}>
                                {/* 开始时间 */}
                                <DatePicker name='Date' isSpan={true} label={<FormattedMessage id='lbl.start-date'/>}   span={20}  />
                            </Col>
                        </Row>
                    </Form> 
                    {/* <div className="copy-from-btn">
                        {/* 按钮 
                        <Button onClick={handleOks}><FormattedMessage id="lbl.confirm-ok" /> </Button>
                        <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-cancel" /></Button>
                    </div> */}
                </div>
                <div className='main-button' style={{minWidth:'300px'}}>
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