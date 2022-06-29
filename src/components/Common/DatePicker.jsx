import React, { useEffect, $menuRender } from 'react';
import { Form, DatePicker, Col } from "antd";
import { FormattedMessage } from "umi";
import { formlayout } from "@/utils/commonLayoutSetting";

// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// placeholder, 默认填充文本
// message, required 为 true 时的报错信息
// showTime=false //是否显示时分秒 默认不显示
// layout 控制 label 与 内容的 width
// span 设置在24份中占几份
const DatePickers = (props) => {
    let { name, label, required = false, disabled = false, placeholder, message, showTime = false, span = 6, formlayouts = formlayout, styleFlag = true, isSpan = false, picker } = props
    const rules = [
        {
            required: required ? true : false,
            message: message ? true : false,
        }
    ]
    return (<Col span={isSpan ? span : $menuRender.menuRender ? span : null} className={isSpan ? '' : $menuRender.menuRender ? '' : 'colWidth'}>
        {
            // styleFlag ? <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
            //     <DatePicker format={!picker ? 'YYYY-MM-DD' : null} showTime={showTime} disabled={disabled} placeholder={placeholder} picker={picker} style={{ width: '100%' }} />
            // </Form.Item> : <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
            //     <DatePicker format={!picker ? 'YYYY-MM-DD' : null} showTime={showTime} disabled={disabled} placeholder={placeholder} picker={picker} style={{ width: '100%', background: 'yellow' }} />
            // </Form.Item>
            <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <DatePicker format={!picker ? 'YYYY-MM-DD' : null} showTime={showTime} disabled={disabled} placeholder={placeholder} picker={picker} style={styleFlag ? { width: '100%' } : { width: '100%', background: 'yellow' }} />
            </Form.Item>
        }
    </Col>)
}
export default DatePickers