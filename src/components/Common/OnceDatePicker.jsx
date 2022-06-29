{/* <DatePicker onChange={onChange} picker="month" /> */}
import React, {useEffect,$menuRender} from 'react';
import {Form ,DatePicker, Col} from "antd";
import moment from 'moment';
import {FormattedMessage} from "umi";
import './DoubleDatePicker.less'
import {formlayout} from "@/utils/commonLayoutSetting";
const { RangePicker } = DatePicker;
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// message, required 为 true 时的报错信息
// showTime=false //是否显示时分秒 默认不显示
// layout 控制 label 与 内容的 width
const DoubleDatePicker = (props) => {
    let {name, label, required=false, disabled=false, message, showTime=false, span=6, formlayouts=formlayout, style,isSpan=false,picker='month'} = props
    const rules=[
        {
          required: required ? true : false,
          message: message,
        }
    ]
    
    const dateFormat = 'YYYY/MM/DD';
    return (<Col span={isSpan?span:$menuRender.menuRender?span:null} className={isSpan?'':$menuRender.menuRender?'':'colWidth'}>
        <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
            {/* <RangePicker format={!picker?'YYYY-MM-DD':null} showTime={showTime} disabled={disabled} picker={picker} style={style}/> */}
            <DatePicker format={'YYYY-MM'} showTime={showTime} disabled={disabled} picker={picker} style={style} picker="month" />
        </Form.Item>
    </Col>)
}
export default DoubleDatePicker