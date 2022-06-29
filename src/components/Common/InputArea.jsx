import React, { useEffect, $menuRender } from 'react';
import { Form, Input, Col } from "antd";
import { FormattedMessage } from "umi";
import { formlayout, formlayout5 } from "@/utils/commonLayoutSetting";
const { TextArea } = Input;
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// placeholder, 默认填充文本
// message, required 为 true 时的报错信息
// layout 控制 label 与 内容的 width
// span    <Col>
// rows 多行文本展示行高
const InputArea = (props) => {
    let { name, label, required, disabled = false, placeholder, message, span = 6, rows = 2, formlayouts = formlayout, isSpan = false, flag = true } = props
    const rules = [
        {
            required: required ? true : false,
            message: message ? message : false
        }
    ]
    let formlayoutsFlag = flag ? { ...formlayouts } : { ...formlayout5 };


    return (<Col span={isSpan ? span : $menuRender.menuRender ? span : null} className={isSpan ? '' : $menuRender.menuRender ? '' : 'colWidth'}>
        {
            <Form.Item name={name} label={label} {...formlayoutsFlag} rules={rules}>
                <TextArea placeholder={placeholder} disabled={disabled} rows={rows} />
            </Form.Item>
        }
    </Col>)
}
export default InputArea