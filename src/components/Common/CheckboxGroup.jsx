import React, {useEffect} from 'react';
import {Form ,Checkbox, Col} from "antd";
import {FormattedMessage} from "umi";
import {formlayout, formlayout5} from "@/utils/commonLayoutSetting";
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// placeholder, 默认填充文本
// message, required 为 true 时的报错信息
// layout 控制 label 与 内容的 width
const InputText = (props) => {
    let {name, label, required, disabled=false, message, span=6,formlayouts=formlayout,
        options=[],} = props
    const rules=[
        {
          required: required ? true : false,
          message: message
        }
    ]
    
    return (<Col span={span}>
        <Form.Item name={name} label={label} {...formlayout5} rules={rules}>
            <Checkbox.Group>
                <Row>
                    {options.map((item,index) => {
                        return <Col span={8} key={index}>
                            <Checkbox value={item.value} style={{ lineHeight: '32px' }} disabled={item.disabled?true:false}>{item.label}</Checkbox>
                        </Col>
                    })}
                </Row>
            </Checkbox.Group>
        </Form.Item> 
    </Col>)
}
export default InputText