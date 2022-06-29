import React, {useEffect,$menuRender} from 'react';
import {Form, Select, Col} from "antd";
import {FormattedMessage} from "umi";
import {formlayout, formlayout5} from "@/utils/commonLayoutSetting";
const { Option } = Select;
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// placeholder, 默认填充文本
// message, required 为 true 时的报错信息
// layout 控制 label 与 内容的 width
// options, 下拉框数据
// span, 设置在24份中占几份
// selectChange(value,option), value:获取选中的key  option:获取选中的所有数据
const SearchSelect = (props) => {
    let {name, label, required, disabled, placeholder, message, options=[], mode, span=6,queryForm,linkage,selectChange, showSearch=false,
    formlayouts=formlayout, flag=false, styleFlag=true,isSpan=false, Value, style,hidden=false} = props
    const rules=[
        {
          required: required,
          message: message
        }
    ]

    // const selectChange = (value,option) => {
    //     if(linkage){
    //         let newLinkage = linkage.split(',');
    //         queryForm.setFieldsValue({
    //             [newLinkage[0]]:option.linkage[newLinkage[1]]
    //         })
    //     }
    // }
    return (<Col span={isSpan?span:$menuRender.menuRender?span:null} className={isSpan?'':$menuRender.menuRender?'':'colWidth'}>
        {
            <Form.Item name={name} label={label} {...formlayouts} rules={rules} hidden={hidden}>
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
        }
        {/* {
            span == 24 ?(styleFlag ? <Form.Item name={name} label={label} {...formlayout5} rules={rules}>
                <Select defaultValue="2000" style={{backgroundColor:'white'}} showSearch={showSearch} mode={mode} placeholder={placeholder} disabled={disabled} onChange={(value,option) => {selectChange&&selectChange(value,option)}} >
                    {options.map((item) => {
                        return <Option key={item.value} value={item.value} linkage={item}>{item.label}</Option> 
                    })}
                </Select>
            </Form.Item> : <Form.Item name={name} label={label} {...formlayout5} rules={rules}>
                <Select defaultValue="2000" style={{backgroundColor:'yellow'}} showSearch={showSearch} mode={mode} placeholder={placeholder} disabled={disabled} onChange={(value,option) => {selectChange&&selectChange(value,option)}} >
                    {options.map((item) => {
                        return <Option key={item.value} value={item.value} linkage={item}>{item.label}</Option> 
                    })}
                </Select>
            </Form.Item> ):(styleFlag ? <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Select defaultValue="2000" style={{background:'white'}} showSearch={showSearch} mode={mode} placeholder={placeholder} disabled={disabled} onChange={(value,option) => {selectChange&&selectChange(value,option)}} >
                    {flag ? <Option value='' >{''}</Option> : null} 
                    {options.map((item) => {
                        return <Option key={item.value} value={item.value} linkage={item}>{item.label}</Option> 
                    })}
                </Select>
            </Form.Item>: <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Select defaultValue="2000" style={{background:'yellow'}} showSearch={showSearch} mode={mode} placeholder={placeholder} disabled={disabled} onChange={(value,option) => {selectChange&&selectChange(value,option)}} >
                {flag?<Option value='' >{''}</Option>:null} 
                    {options.map((item) => {
                        return <Option key={item.value} value={item.value} linkage={item}>{item.label}</Option> 
                    })}
                </Select>
            </Form.Item>)
        } */}
    </Col>)
}
export default SearchSelect