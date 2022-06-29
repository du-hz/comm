/*
 * @Author: Du hongzheng
 * @Date: 2021-10-12 14:22:35
 * @LastEditors: Du hongzheng
 * @LastEditTime: 2022-02-28 17:33:16
 * @Description: file content
 * @FilePath: /afcm-web/src/components/Common/IptNumber.jsx
 */
import React, { useEffect, $menuRender } from 'react';
import { Form, InputNumber, Col } from "antd";
import { FormattedMessage } from "umi";
import { formlayout, formlayout5 } from "@/utils/commonLayoutSetting";
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// placeholder, 默认填充文本
// message, required 为 true 时的报错信息
// layout 控制 label 与 内容的 width
const IptNumber = (props) => {
    let { name, label, required, disabled = false, defaultValue, placeholder, message, span = 6, formlayouts = formlayout, precision, styleFlag = true, max, isSpan = false, controls = true } = props
    const rules = [
        {
            required: required ? true : false,
            message: message ? message : false
        }
    ]

    return (<Col span={isSpan ? span : $menuRender.menuRender ? span : null} className={isSpan ? '' : $menuRender.menuRender ? '' : 'colWidth'}>
        {
            // span == 24 ? <Form.Item name={name} label={label} {...formlayout5} rules={rules}>
            //     <InputNumber maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off"/>
            // </Form.Item> : <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
            //     <InputNumber maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off"/>
            // </Form.Item>
            <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <InputNumber style={styleFlag ? undefined : { background: 'yellow' }} controls={controls} precision={precision} disabled={disabled} defaultValue={defaultValue} autoComplete="off" min={0} max={max} name='payElsewherePercent' />
            </Form.Item>
        }
    </Col>)
}
export default IptNumber