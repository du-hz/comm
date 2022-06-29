import React, { useState }  from 'react'
import { Modal, Button } from 'antd';
import {FormattedMessage} from 'umi'
import PcmSearchGroups from "@/components/Common/CosSearchGroups";



const STATE_OF_GOODS=[
  {"label": <FormattedMessage id='lbl.Ordinary-goods'/>,value:'1'},
  {"label": <FormattedMessage id='lbl.Short-haul'/>,value:'2'}
]
const CommissionAgreementCopy =()=> {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
      setIsModalVisible(true);
    };
  
    const handleOk = () => {
      setIsModalVisible(false);
    };
  
    const handleCancel = () => {
      setIsModalVisible(false);
    };

    //表单
   const searchGroupConfig=[
    {
        type:'input',
        name:'shipowner',
        span:15,
        label:<FormattedMessage id='lbl.company'/>,
    },
    {
        type:'input',
        name:'theagentcode',
        span:15,
        label:<FormattedMessage id='lbl.agency'/>,
    },
    {
        type:'input',
        name:'startdate',
        span:15,
        label:<FormattedMessage id='lbl.start-date'/>,
    },
    {
        type:'select',
        name:'protocolType',
        span:15,
        label:<FormattedMessage id='lbl.protocol-type'/>,
        itemProps:{
          options:STATE_OF_GOODS
        }
    },
]

const handleQuery=()=>{
   
}
  
    const onFinish = (values) => {
        console.log('Success:', values);
      };
    
      const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };
    
    return (
      <div className='copy-btn'>
          <div onClick={showModal}>
              <FormattedMessage id='lbl.copy'/>
          </div>
          <Modal  visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <div className='copy-from'>
               <PcmSearchGroups
                  config = {searchGroupConfig}
                  // btnDisplayType="split"
                  btnSpan={10}
                  onSearch={handleQuery}
                 
              />
              <div className="copy-from-btn">
                <Button onClick={handleOk}><FormattedMessage id="lbl.confirm-ok" /> </Button>
                <Button><FormattedMessage id="lbl.confirm-cancel" /></Button>
              </div>
            </div>
             
          </Modal>
      </div>
    )
}
export default CommissionAgreementCopy