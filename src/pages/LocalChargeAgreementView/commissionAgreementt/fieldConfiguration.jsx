import React, {useState,useEffect,$apiUrl} from 'react';
import { Modal , Button ,Form ,Row ,Col} from 'antd';
import {FormattedMessage} from 'umi'
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import CosModal from '@/components/Common/CosModal'
import {
    RightOutlined,
    DoubleRightOutlined,
    LeftOutlined,
    DoubleLeftOutlined
} from '@ant-design/icons'

import { createFromIconfontCN } from '@ant-design/icons';
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_4ayqwnlhmmv.js', // 在 iconfont.cn 上生成
  });

//---------------------------------------字段配置-----------------------------------
const fieldConfiguration = (props) => {
    const {
        isModalVisibleviewFieldConfiguration, 
        setIsModalVisibleViewFieldConfiguration,
	} = props.fieldConfigurationData;
    const [mockData, setMockData] = useState({});
    const [targetKeys, setTargetKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);

    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const handleCancel = () => {
        setIsModalVisibleViewFieldConfiguration(false);   // 关闭弹窗 
    }

    const onChange =()=>{

    }
    const onSelectChange =()=>{

    }
    const onScroll =()=>{

    }
    
    return (<div>
        <Modal title={<FormattedMessage id='lbl.field-configuration' />} maskClosable={false}  visible={isModalVisibleviewFieldConfiguration} footer={null} width="50%" onCancel={() => handleCancel()}>
            <div className='field' >
                {/*  className='field-top'  */}
                {/* 字段配置 */}
                    <div className='field-main'>
                    <Form form={queryForm}>
                        {/* 头部的输入框 className='field-main-input'*/}
                        <Row>
                            {/* 查询区域列表数 */}
                            <InputText  isSpan={true}  span={9} name='containerSizeTypeGroup' label={<FormattedMessage id='lbl.Query-number-area-lists' />} />
                            {/* 默认显示类型 */}
                            <Select isSpan={true}  name='agreementStatus' flag={true} label={<FormattedMessage id='lbl.Default-display-type'/>}  span={9} />
                        </Row>
                            {/* <Row className='field-main-input'>
                        </Row> */}
                        <Row className='field-main-input'>
                            <div className="field-main-input-left-button">
                                {/* 指定向上字段信息 onClick={rightBtn}*/}
                                <Button  ><MyIcon type="icon-arrow-up" /></Button>
                                {/* 向上添加全部字段 onClick={addAllBoxDetail}*/}
                                <Button  ><MyIcon type="icon-shangjiantou1" /></Button>
                                {/* 删除指定字段 onClick={deleteBoxSize}*/}
                                <Button  ><MyIcon type="icon-arrow-down" /></Button>
                                {/* 删除全部字段 onClick={deleteAllBoxDetail}*/}
                                <Button  ><MyIcon type="icon-xiajiantou1" /></Button>
                            </div>
                            <div className='field-main-input-left'>
                                <div className='field-size'>
                                    {/* 基本查询字段 */}
                                    <FormattedMessage id='lbl.Basic-query-field' />
                                </div>
                                <ul className='field-size-ul'>
                                    {
                                        // groupInit ? groupInit.map((v, i) => {
                                        //     return <li onClick={() => changeIdx(i)} className={currentIndex == i ? 'current' : ''} key={i} style={{ height: '25px', lineHeight: '25px', cursor: 'pointer' }}><span>{v}</span></li>
                                        // }) : ""
                                    }
                                </ul>
                            </div>
                            <div className="field-main-input-center-button">
                                {/* 添加指定字段信息 onClick={rightBtn}*/}
                                <Button  ><RightOutlined /></Button>
                                {/* 添加全部字段 onClick={addAllBoxDetail}*/}
                                <Button  ><DoubleRightOutlined /></Button>
                                {/* 删除指定字段 onClick={deleteBoxSize}*/}
                                <Button  ><LeftOutlined /></Button>
                                {/* 删除全部字段 onClick={deleteAllBoxDetail}*/}
                                <Button  ><DoubleLeftOutlined /></Button>
                            </div>
                            <div className="field-main-input-bottom" >
                                <div className='field-size-detail'>
                                    {/* 高级查询字段 */}
                                    <FormattedMessage id='lbl.Advanced-query-field' />
                                </div>
                                <ul className='field-size-ul'>
                                    {
                                        // groupInit ? groupInit.map((v, i) => {
                                        //     return <li onClick={() => changeIdx(i)} className={currentIndex == i ? 'current' : ''} key={i} style={{ height: '25px', lineHeight: '25px', cursor: 'pointer' }}><span>{v}</span></li>
                                        // }) : ""
                                    }
                                </ul>
                            </div>
                            <div className="field-main-input-right-button">
                                {/* 指定向上字段信息 onClick={rightBtn}*/}
                                <Button  ><MyIcon type="icon-arrow-up" /></Button>
                                {/* 向上添加全部字段 onClick={addAllBoxDetail}*/}
                                <Button  ><MyIcon type="icon-shangjiantou1" /></Button>
                                {/* 删除指定字段 onClick={deleteBoxSize}*/}
                                <Button  ><MyIcon type="icon-arrow-down" /></Button>
                                {/* 删除全部字段 onClick={deleteAllBoxDetail}*/}
                                <Button  ><MyIcon type="icon-xiajiantou1" /></Button>
                            </div>
                        </Row>
                        <Row style={{ margin: '15px 0', marginRight: '10px' }}>
                            {/* 恢复默认设置 onClick={()=>{saveBoxSize('UPD')}}*/}
                            <Col style={{ marginRight: '15px' }}><Button  ><FormattedMessage id='lbl.Restore-default-Settings' /></Button></Col>
                            {/* 确认 onClick={resetBoxSize}*/}
                            <Col><Button  ><FormattedMessage id='lbl.reset-box-size' /></Button></Col>
                        </Row>
                        </Form> 
                </div>
            </div>
        </Modal>
    </div>)
}
export default fieldConfiguration