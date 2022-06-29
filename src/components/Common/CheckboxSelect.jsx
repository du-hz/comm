import React, {useEffect, $menuRender} from 'react';
import {Form, Checkbox, InputNumber, Col} from "antd";
import {FormattedMessage} from "umi";
import {formlayout, formlayout5} from "@/utils/commonLayoutSetting";
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// placeholder, 默认填充文本
// message, required 为 true 时的报错信息
// layout 控制 label 与 内容的 width
const CheckboxSelect = (props) => {
    let {name, label, required, disabled=false, defaultValue, placeholder, message, span=6,formlayouts=formlayout, precision, max, options, flag, isSpan=false, setCheckedAee} = props
    const rules=[
        {
          required: required ? true : false,
          message: message
        }
    ]

    // 目前仅供协议组使用
    const onChange = (checkedValues) => {
        setCheckedAee(checkedValues);
    }

    const formlayout3 = {
        labelCol: { span: 2.5 },
        wrapperCol: { span: 21.5 },
    };

    let formlayoutsFlag = flag ? {...formlayouts}: {...formlayout3};
    
    return (<Col span={isSpan?span:$menuRender.menuRender?span:null} className={isSpan?'':$menuRender.menuRender?'':'colWidth'}>
        {
                <Form.Item name={name} label={label} {...formlayoutsFlag} rules={rules}>
                    <Checkbox.Group options={options} defaultValue={['']} disabled={disabled} onChange={onChange} />
                </Form.Item>
        }
    </Col>)
}
export default CheckboxSelect