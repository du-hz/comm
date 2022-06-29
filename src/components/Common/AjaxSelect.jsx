import React, {Component,apiUrl} from 'react';
import {Form, Select, Input, Col, Dropdown, Menu} from "antd";
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
// backgroundColor:  color

class AjaxSelect extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
    }
    componentDidMount(){
        const {key, options} = this.props
        if(key){
            request($apiUrl.PAGE_BUTTOB_CHECKOUT,{
                method:"POST",
                data:{
                    authCode:auth
                }
            }).then((res) => {
                this.setState({
                    display:res.data
                })
            })
        }
    }
    render(){
        let {name, label, required=false, disabled, placeholder, message, span=6, backgroundColor, selectChange, key, options=[]} = this.props
        const rules=[
            {
            required: required,
            message: message
            }
        ]
        return <Col span={span}>
            {
                <Form.Item name={name} label={label} {...formlayout5} rules={rules} required={required}>
                    <Select style={{backgroundColor:backgroundColor}} placeholder={placeholder} disabled={disabled} onChange={(value,option) => {selectChange&&selectChange(value,option)}} >
                        {options.map((item) => {
                            return <Option key={item.value} value={item.value} linkage={item}>{item.label}</Option> 
                        })}
                    </Select>
                </Form.Item>
            }
        </Col>
    }
}
export default AjaxSelect