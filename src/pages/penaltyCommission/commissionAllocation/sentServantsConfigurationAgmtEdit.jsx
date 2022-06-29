//罚佣配置新增
import React, { useState,useEffect,$apiUrl } from 'react'
import { Modal, Button, Form , Row, Col} from 'antd';
import {FormattedMessage,formatMessage} from 'umi'
import { acquireSelectDataExtend, momentFormat } from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import DatePicker from '@/components/Common/DatePicker'
import SelectVal from '@/components/Common/Select';
import moment from 'moment';
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import CosToast from '@/components/Common/CosToast'
import IsnputNumber from '@/components/Common/IptNumber'
import CosModal from '@/components/Common/CosModal'
import {
    SaveOutlined,//保存
} from '@ant-design/icons'

const LocalChargeCopy =(props)=> {
    const {isModalVisible,setIsModalVisible,copyData,acquireData,taxMode,remove,messageData,setMessageData,setSaveFlag }=props.addData
    const [queryForm] = Form.useForm();
    const [company,setCompany] = useState([])//口岸公司
    useEffect(() => {
        console.log(copyData.carrier)
        let val = remove.values?remove.values:[]
        console.log(val)
        if(val.length>0){
            queryForm.setFieldsValue({
                'deleteIndicator':val[0].value  //状态默认
            })
       }
        if(copyData){
            // alert(1)
            queryForm.setFieldsValue({
                ...copyData,
                'fromDate':copyData.fromDate?moment(copyData.fromDate):'',
                'toDate':copyData.toDate?moment(copyData.toDate):'',
            })
        }
        selectChangeBtn()
       
    }, [copyData,remove])

    const handleOk = () => {
        setMessageData({})
        setIsModalVisible(false);
        queryForm.resetFields()
    };
     //口岸
    const  selectChangeBtn = async() =>{
       let port =  await request($apiUrl.PUNIHRSULT_GETCONFIGRENDERCOMPANYLIST,{
            method:'POST',
            data:queryForm.getFieldValue().carrier?queryForm.getFieldValue().carrier:' '
        })
       if(port.success){
        let data = port.data
        data.map((val, idx)=> {
            val['value'] = val.companyCode 
            val['label'] = val.companyCode + ' ' + val.companyName;
        })
        setCompany(data)
       }
    }
    
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setMessageData({})
        setIsModalVisible(false);
        queryForm.resetFields()
        let val = remove.values?remove.values:[]
        if(val.length>0){
            queryForm.setFieldsValue({
                'deleteIndicator':val[0].value//状态默认
            })
       }
    };

    const handleQuery = async () =>{        
        setMessageData({})
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    const save = async () =>{
        setMessageData({})
        let query = queryForm.getFieldsValue()
        console.log(copyData)
        if(query.daysPrepare!=null&&query.daysCollect!=null&&query.fromDate!=null&&query.toDate!=null&&query.daysPrepareLevel2!=null&&query.daysCollectLevel2!=null&&query.deleteIndicator!=null&&query.renderCompanyCode!=null){
            let localsearch= await request($apiUrl.PUNIHRSULT_ADDPUNIHCONFIG,{
                method:"POST",
                data:{
                     "params": {
                        carrier:query.carrier,
                        daysPrepare:query.daysPrepare,
                        daysCollect:query.daysCollect,
                        punihRate:query.punihRate,
                        fromDate:query.fromDate?momentFormat(query.fromDate):null,
                        toDate:query.toDate?momentFormat(query.toDate):null,
                        daysPrepareLevel2:query.daysPrepareLevel2,
                        daysCollectLevel2:query.daysCollectLevel2,
                        punihRateLevel2:query.punihRateLevel2,
                        agrmntFlag:query.agrmntFlag,
                        renderCompanyCode:query.renderCompanyCode,
                        deleteIndicator:query.deleteIndicator,
                        punihConfigUuid:copyData?copyData.punihConfigUuid:''
                     }
                }
            })
            if(localsearch.success){
                setIsModalVisible(false);
                Toast('',localsearch.message , '', 5000, false);
                queryForm.resetFields()
                let val = remove.values?remove.values:[]
                if(val.length>0){
                    queryForm.setFieldsValue({
                        'deleteIndicator':val[0].label//状态默认
                    })
               }
               setSaveFlag(true)
            //    localsearch.message?setMessageData({alertStatus:'alert-success',message:localsearch.message}):null
            }else{
                // Toast('',localsearch.errorMessage , 'alert-error', 5000, false);
                localsearch.errorMessage?setMessageData({alertStatus:'alert-error',message:localsearch.errorMessage}):null
            }
        }else{
            //预付超期天数,到付超期天数,生效日期,失效日期,第二级预付超期天数,第二级到付超期天数,第二级佣罚比例,含税模式,口岸公司
            setMessageData({alertStatus:'alert-error',message:formatMessage({id: 'lbl.carrier-must-enter'})})
        }
        
    }

    return (
        <div className='add'>
            <CosModal cbsTitle={<FormattedMessage id='lbl.sent-servants-configuration'/>} cbsVisible={isModalVisible} cbsFun={handleCancel} cbsWidth='50%'  >
            <CosToast toast={messageData} />
             <div className='add-header' style={{minWidth:'500px'}}>
                    <Form 
                        form={queryForm}
                        name='func'
                        onFinish={handleQuery} 
                    >
                        <Row>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 承运人 */}
                                <SelectVal  isSpan={true}  span={24} name='carrier' label={<FormattedMessage id='lbl.haulier'/>} options={acquireData.values} selectChange={selectChangeBtn } />
                            </Col>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 罚佣比例 */}
                                <IsnputNumber  isSpan={true}  name='punihRate' label={<FormattedMessage id='lbl.Penalty-proportion-of-commission'/>}   span={24} />
                            </Col>  
                        </Row>
                        <Row>
                            <Col span={12} style={{display:'inherit'}} >
                                {/* 预付超期天数 */}
                                <IsnputNumber required isSpan={true}  name='daysPrepare' label={<FormattedMessage id='lbl.Prepay-days-overdue'/>}   span={24} />
                            </Col>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 到付超期天数 */}
                                <IsnputNumber required isSpan={true}  name='daysCollect' label={<FormattedMessage id='lbl.number-days-overdue-arrival'/>}   span={24}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 生效日期 */}
                                <DatePicker required isSpan={true}  name='fromDate' label={<FormattedMessage id='lbl.effective-date'/>}   span={24}  />
                            </Col>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 失效日期 */}
                                <DatePicker required isSpan={true}  name='toDate' label={<FormattedMessage id='lbl.expiration-date'/>}   span={24}  />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 第二级预付超期天数 */}
                                <IsnputNumber required isSpan={true}  name='daysPrepareLevel2' label={<FormattedMessage id='lbl.second-level-prepays-overdue-days'/>}   span={24} />
                            </Col>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 第二级到付超期天数*/}
                                <IsnputNumber required isSpan={true}  name='daysCollectLevel2' label={<FormattedMessage id='lbl.The-second-level-of-the-overdue-days'/>}   span={24} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 第二级佣罚比例*/}
                                <IsnputNumber required isSpan={true}  name='punihRateLevel2' label={<FormattedMessage id='lbl.The-second-level-penalty-ratio'/>}   span={24}/>  
                            </Col>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 含税模式*/}
                                <SelectVal isSpan={true}  name='agrmntFlag' label={<FormattedMessage id='lbl.Tax-mode'/>} options={taxMode.values}  span={24}/>  
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 口岸公司*/}
                                <SelectVal required isSpan={true}  name='renderCompanyCode' label={<FormattedMessage id='lbl.The-port-company'/>} options={company}  span={24}/>  
                            </Col>
                            <Col span={12} style={{display:'inherit'}}>
                                {/* 删除状态 */}
                                <SelectVal required isSpan={true} name='deleteIndicator' label={<FormattedMessage id='lbl.state'/>} span={24} options={remove.values}/>
                            </Col>
                        </Row>
                    </Form> 
                    <div className="add-main-button" style={{float:'right'}}>
                        {/* 保存按钮 */}
                        <Button onClick={save}  ><SaveOutlined /><FormattedMessage id='btn.save'/></Button>
                    </div>
                </div>
            </CosModal>
        
        </div>
    )
}
export default LocalChargeCopy