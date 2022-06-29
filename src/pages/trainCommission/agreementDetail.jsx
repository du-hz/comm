{/* 班列协议-复制弹窗 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import { Modal, Button, Form ,Row } from 'antd';
import {FormattedMessage,} from 'umi'
import { acquireSelectData,momentFormat } from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import Select from '@/components/Common/Select'
import DatePicker from '@/components/Common/DatePicker'
import moment from 'moment';
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import CosModal from '@/components/Common/CosModal'


import {
    ReloadOutlined,//重置
    CheckOutlined
} from '@ant-design/icons'

const agreementDatail =(props)=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [protocoltypeDate,setProtocoltypeDate]=useState({})//协议类型
    const {isModalVisiblecopy,setIsModalVisibleCopy,companysData,copydata,lastCondition,txt,
        page,setTableData,setTabTotal,copyShow,copyUrl,setCopyShow,setChecked}=props.copydatas
    const [queryForm] = Form.useForm();
    useEffect(()=>{
        acquireSelectData('CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.AGMT.TYPE', setProtocoltypeDate, $apiUrl);// 协议类型   
    },[])
    useEffect(() => {
      copy(copydata)
      if(!copyShow){
        queryForm.setFieldsValue({
            'shipownerCompanyCode':'',
            'companyCode':'',
            'agencyCode':'',
            'agreementType':'',
            'formDate':'',
            'groupAgreementCode':'',
        })
      }
    }, [copydata])
    const handleOk = () => {
        setIsModalVisibleCopy(false);
    };
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisibleCopy(false);
    };
    {/* 复制的数据 */}
    const copy = (copydata) =>{
        if(copyShow){
            let data
            copydata.map((v,i)=>{
                return data=v
            })
            data?setCopyShow(true):setCopyShow(false)
            if(copydata.length>1 || copydata.length==0 || data.status!="U"){
                setCopyShow(false)
            }
            if(!data){
            }else{
                queryForm.setFieldsValue({
                    'shipownerCompanyCode':data.shipownerCompanyCode,
                    'companyCode':data.companyCode,
                    'agreementType':data.agreementType,
                    'agencyCode':data.agencyCode,
                    // 'fromDate':moment(data.fromDate),
                    'groupAgreementCode':data.groupAgreementCode,
                    'agreementHeadUuid':data.agreementHeadUuid
                }) 
            }
           
        }
        
    }
    
    {/* 复制接口 */}
    const handleOks = async () =>{
        let copyList = await request($apiUrl[copyUrl],{
            method:"POST",
            data:{
                "operateType": "COPY",
                "params":{
                    'agencyCode':queryForm.getFieldValue().agencyCode,
                    'agreementHeadUuid':queryForm.getFieldValue().agreementHeadUuid,
                    'agreementType':queryForm.getFieldValue().agreementType,
                    'companyCode':queryForm.getFieldValue().companyCode,
                    'fromDate':momentFormat(queryForm.getFieldValue().fromDate),
                    'groupAgreementCode':queryForm.getFieldValue().groupAgreementCode,
                    'shipownerCompanyCode':queryForm.getFieldValue().shipownerCompanyCode,
                },
            }
        })
        if(copyList.success){
            setChecked([]);
            Toast('',copyList.message, 'alert-success', 5000, false)
            handleCancel()
            let searchData=await request($apiUrl.TRAIN_COMM_TRAIN_AGREEMENT_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": page,
                    "params": lastCondition,
                }
            })
            let data=searchData.data
            let datas=searchData.data.resultList
            setTableData([...datas])
            setTabTotal(data.totalCount)
        }
    }
    return (
        <div className='copy'>
            {/* <Modal  title={txt} visible={isModalVisiblecopy} maskClosable={false} onOk={handleOk} onCancel={handleCancel} width='50%'  height='100%'> */}
            <CosModal cbsWidth={550} cbsVisible={isModalVisiblecopy} cbsTitle={txt} cbsFun={() => handleCancel()}>
                <div className='modalContent' style={{minWidth: '300px'}}>
                        <Form 
                            form={queryForm}
                            name='func'
                        >
                            <Row>
                                {/* 船东 */}
                                <Select span={12} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>}  options={acquireData.values} isSpan={true} flag={true} />
                                {/* 公司 */}
                                <Select name='companyCode' label={<FormattedMessage id='lbl.company'/>} span={12} options={companysData} isSpan={true} flag={true} />
                                {/* 协议类型 */}
                                <Select name='agreementType' label={<FormattedMessage id='lbl.protocol-type'/>} span={12} options={protocoltypeDate.values} isSpan={true} flag={true} />
                                {/* 代理编码 */}
                                <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={12} isSpan={true} />  
                                {/* 开始时间 */}
                                <DatePicker name='fromDate' label={<FormattedMessage id='lbl.valid-date'/>} span={12} isSpan={true} />
                                {/* 协议组编号 */}
                                <InputText name='groupAgreementCode' label={<FormattedMessage id='lbl.Protocol-group-number'/>} span={12} isSpan={true} />  
                            </Row>
                        </Form> 
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 按钮 */}
                                <Button onClick={handleOks}><FormattedMessage id='lbl.affirm'/> </Button>
                                <Button onClick={handleCancel}><FormattedMessage id='lbl.cancel'/></Button>
                            </div>
                        </div>
                </div>
                
            </CosModal>
        </div>
    )
}
export default agreementDatail