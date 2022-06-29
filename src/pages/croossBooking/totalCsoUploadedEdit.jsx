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
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import {
    SaveOutlined,//保存
} from '@ant-design/icons'

const LocalChargeCopy =(props)=> {
    const {
        isModalVisible,
        setIsModalVisible,
        protocolType,//协议类型
        calculationPattern,//计算方法
        detailData,//数据
    }=props.detailDatas
    const [queryForm] = Form.useForm();
    useEffect(() => {
        detailData?queryForm.setFieldsValue({
          'agencyCode':detailData.agencyCode,
          'tradeZoneCode':detailData.tradeZoneCode,
          'tradeLaneCode':detailData.tradeLaneCode,
          'agreementId':detailData.agreementId,
          'calculationMethod':detailData.calculationMethod,
          'podAgencyCode':detailData.podAgencyCode,
          'agreementType':detailData.agreementType,
          'customerName':detailData.customerName,
          'approvedUser':detailData.approvedUser,
          'Date':[moment(detailData.fromDate),moment(detailData.toDate)]
      }):null
      console.log(detailData)
    }, [detailData])

    const handleOk = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisible(false);
        queryForm.resetFields()
    };
  
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisible(false);
      queryForm.resetFields()
    };

    const handleQuery = async () =>{
        Toast('', '', '', 5000, false);
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    return (
        <div className='add'>
            <Modal title={<FormattedMessage id='lbl.ViewDetails'/>} visible={isModalVisible} maskClosable={false} onOk={handleOk} onCancel={handleCancel} width='90%'  height='100%'>
                <div className='add-header'>
                    <Form 
                        form={queryForm}
                        name='func'
                        onFinish={handleQuery} 
                    >
                        <Row>
                                {/*申请代理编码 */}
                                <InputText span={6} name='agencyCode' label={<FormattedMessage id='lbl.Application-proxy-code'/>} disabled />
                                {/* 贸易区 */}
                                <InputText name='tradeZoneCode'showSearch={true} label={<FormattedMessage id='lbl.argue.trade-code'/>} disabled span={6}/>
                                {/* 贸易线 */}
                                <InputText name='tradeLaneCode' label={<FormattedMessage id='lbl.Trade-line'/>} disabled  span={6}/>  
                                {/* 合约号 */}
                                <InputText name='agreementId' label={<FormattedMessage id='lbl.Contract-No-Cos'/>} disabled  span={6}/>  
                                {/* 计算方法 */}
                                <SelectVal name='calculationMethod' label={<FormattedMessage id='lbl.Computing-method'/>} disabled  span={6} options={calculationPattern.values} />
                                {/* 装港代理编码 */}
                                <InputText name='podAgencyCode' label={<FormattedMessage id='lbl.Loading-port-agent-code'/>} disabled span={6}/>  
                                {/* 有效时间 */}
                                <DoubleDatePicker name='Date' label={<FormattedMessage id='lbl.valid-Time'/>} disabled={ [true, true]} />
                                {/* 协议类型 */}
                                <SelectVal name='agreementType' label={<FormattedMessage id='lbl.protocol-type'/>} disabled span={6} options={protocolType.values}/>  
                                {/* 客户名称 */}
                                <InputText name='customerName' label={<FormattedMessage id='lbl.customerName'/>} disabled span={6}/>  
                                {/* 批准人 */}
                                <InputText name='approvedUser' label={<FormattedMessage id='lbl.approver-cos'/>} disabled span={6}/>  
                            </Row>
                    </Form> 
                </div>
            </Modal>
        </div>
    )
}
export default LocalChargeCopy