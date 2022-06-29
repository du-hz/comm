import React, {$menuRender} from 'react';
import {Form, Col, Radio, Space} from "antd";
import {FormattedMessage} from "umi";
import {formlayout, formlayout5} from "@/utils/commonLayoutSetting";
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// message, required 为 true 时的报错信息
// direction 'horizontal' | 'vertical'
const CosRadio = (props) => {
    let {name, label, required, options, message, span=6,formlayouts=formlayout, direction='horizontal', isSpan=false,offset=0,onChange,onClick } = props
    const rules=[
        {
          required: required ? true : false,
          message: message
        }
    ]
    return (<Col span={$menuRender.menuRender?span:null} className={isSpan?'':$menuRender.menuRender?'':'colWidth'} offset={offset}>
        {
             <Form.Item name={name} label={label} {...formlayouts} rules={rules}  style={{marginRight: '80px'}}>
                 <Radio.Group onChange={(e) => {onChange&&onChange(e)}} >
                    <Space direction={direction}>
                        {
                            options.map((item,index) => {
                                return <Radio key={index} onClick={(e) => {onClick&&onClick(e)}} value={item.value} disabled={item.disabled}>{item.label}</Radio>
                            })
                        }
                    </Space>
                </Radio.Group>
            </Form.Item>
        }
    </Col>)
}
export default CosRadio