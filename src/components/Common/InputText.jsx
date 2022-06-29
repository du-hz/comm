import React, {useEffect,$menuRender} from 'react';
import {Form ,Input, Col} from "antd";
import {FormattedMessage} from "umi";
import {formlayout, formlayout5} from "@/utils/commonLayoutSetting";
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// placeholder, 默认填充文本
// message, required 为 true 时的报错信息
// layout 控制 label 与 内容的 width
// addonAfter 是 input 的后缀icon图标
const InputText = (props) => {
    let {name, label, required, disabled=false, placeholder, message, span=6,formlayouts=formlayout, maxLength, styleFlag=true, isSpan=false, offset=0, addonAfter,capitalized=true} = props
    const rules=[
        {
          required: required ? true : false,
          message: message ? true : false
        }
    ]
    return (<Col span={isSpan?span:$menuRender.menuRender?span:null} className={isSpan?'':$menuRender.menuRender?'':'colWidth'} offset={offset} >
        {/* {
            span == 24 ? ( styleFlag ? <Form.Item name={name} label={label} {...formlayout5} rules={rules}>
                <Input maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off" addonAfter={addonAfter} />
            </Form.Item>  : <Form.Item name={name} label={label} {...formlayout5} rules={rules}>
                <Input style={{background:'yellow'}} maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off" addonAfter={addonAfter} />
            </Form.Item> ):(styleFlag ? <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Input maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off" addonAfter={addonAfter} />
            </Form.Item>: <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Input style={{background:'yellow'}} maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off" addonAfter={addonAfter} />
            </Form.Item>)
        } */}
        {/* {
            styleFlag ? <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Input maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off"  addonAfter={addonAfter}/>
            </Form.Item>: <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Input style={{background:'yellow'}} maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off"  addonAfter={addonAfter}/>
            </Form.Item>
        } */}
        {
            <Form.Item  normalize={
                capitalized?(value) =>{
                if(!value)return ;
                return value.toUpperCase();
            }:null} name={name} label={label} {...formlayouts} rules={rules}>
                <Input style={styleFlag ?null:{background:'yellow'}} maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off"  addonAfter={addonAfter}/>
            </Form.Item>
        }
        {/* {   <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Input style={style} maxLength={maxLength} placeholder={placeholder} disabled={disabled} autoComplete="off"  addonAfter={addonAfter}/>
            </Form.Item>
        } */}

        {/* {
            <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Select style={style} defaultValue={Value} showSearch={showSearch} mode={mode} placeholder={placeholder} disabled={disabled} onChange={(value,option) => {selectChange&&selectChange(value,option)}} 
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }>
                {flag?<Option value='' >{''}</Option>:null} 
                    {options.map((item) => {
                        return <Option key={item.value} value={item.value} linkage={item}>{item.label}</Option> 
                    })}
                </Select>
            </Form.Item>
        } */}
    </Col>)
}
export default InputText